import styles from "../seller.module.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  ArrowForward,
  ArrowBack,
  WatchOutlined,
  StyleOutlined,
  UploadFile,
  LockOutlined,
} from "@mui/icons-material";
import {
  categoryFields,
  defaultDraft,
  draftSchema,
} from "../schemas/listingSchema";
import { useSubmitListing } from "../hooks";
import type { Draft } from "../types";
import { asset, money } from "../../../utils/formatters";
import { PageHeading } from "../../../components/PageHeading";
import { Protection } from "../../../components/Protection";
import type { Category } from "../../listings/types";

const steps = [
  "Category",
  "Details",
  "Verification",
  "Media",
  "Valuation",
  "Sale",
  "Review",
];
function readDraft(): Draft {
  try {
    const s = sessionStorage.getItem("atlas-draft-v1");
    return s ? JSON.parse(s) : defaultDraft;
  } catch {
    return defaultDraft;
  }
}
export default function SellerListing() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<Category>(
    () => readDraft().category,
  );
  const [mediaError, setMediaError] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const navigate = useNavigate();
  const form = useForm<Draft>({
    resolver: zodResolver(draftSchema(category)),
    defaultValues: readDraft(),
    mode: "onBlur",
  });
  const values = form.watch();
  const fields = categoryFields[category];
  const low = category === "watches" ? 42500 : 23000;
  const high = category === "watches" ? 46000 : 28000;
  const selectCategory = (c: Category) => {
    setCategory(c);
    form.reset({
      ...defaultDraft,
      category: c,
      details:
        c === "watches"
          ? defaultDraft.details
          : {
              brand: "",
              model: "",
              set: "",
              number: "",
              edition: "Unlimited",
              grader: "PSA",
              grade: "9",
            },
      price: c === "watches" ? 46000 : 24500,
      reserve: c === "watches" ? 43000 : 25000,
    });
  };
  const save = () => {
    try {
      sessionStorage.setItem(
        "atlas-draft-v1",
        JSON.stringify(form.getValues()),
      );
      setDraftSaved(true);
    } catch {
      setMediaError(
        "Draft storage is unavailable in this browser. Keep this tab open.",
      );
    }
  };
  const next = async () => {
    const keys: Record<number, string[]> = {
      0: ["category"],
      1: fields.map((f) => `details.${f.key}`),
      2: ["privateReference"],
      3: ["media"],
      4: [],
      5: ["price", "reserve", "sale", "duration"],
    };
    const valid = await form.trigger(
      keys[step] as Parameters<typeof form.trigger>[0],
    );
    if (valid) {
      setStep((s) => s + 1);
      save();
    }
  };
  const submit = useSubmitListing(() => navigate("/seller?submitted=1"));
  const upload = async (files: FileList | null) => {
    setMediaError("");
    if (!files) return;
    const selected = Array.from(files);
    if (
      selected.some(
        (f) =>
          !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
          f.size > 2000000,
      )
    ) {
      setMediaError("Use JPG, PNG or WebP images under 2 MB each.");
      return;
    }
    if (values.media.length + selected.length > 4) {
      setMediaError("Add up to four images.");
      return;
    }
    const images = await Promise.all(
      selected.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Could not read image."));
            reader.readAsDataURL(file);
          }),
      ),
    );
    form.setValue("media", [...values.media, ...images], {
      shouldValidate: true,
    });
  };
  return (
    <div className={styles.root}>
      <PageHeading
        title="Sell a collectible."
        description="A considered process for objects that deserve one."
        action={
          <Button variant="outlined" onClick={save}>
            Save draft
          </Button>
        }
      />
      {draftSaved && (
        <Alert severity="success" onClose={() => setDraftSaved(false)}>
          Draft saved in this browser session.
        </Alert>
      )}
      <div className="wizard-progress">
        <Stepper activeStep={step} alternativeLabel>
          {steps.map((s) => (
            <Step key={s}>
              <StepLabel>{s}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
      <div className="wizard-layout">
        <form
          className="wizard-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 6) {
              void next();
            } else {
              void form.handleSubmit((d) => submit.mutate(d))(e);
            }
          }}
        >
          <p className="eyebrow">STEP {step + 1} OF 7</p>
          {step === 0 && (
            <>
              <h2>What are you selling?</h2>
              <p>Each category has its own details and verification checks.</p>
              <div className="category-choices">
                {(["watches", "cards"] as Category[]).map((c) => (
                  <button
                    type="button"
                    className={category === c ? "chosen" : ""}
                    key={c}
                    onClick={() => selectCategory(c)}
                    aria-pressed={category === c}
                  >
                    {c === "watches" ? <WatchOutlined /> : <StyleOutlined />}
                    <b>{c === "watches" ? "Luxury watch" : "Trading card"}</b>
                    <span>
                      {c === "watches"
                        ? "Precision, provenance, full context."
                        : "Franchise, grading, certification."}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2>
                Tell us about the {category === "watches" ? "watch" : "card"}.
              </h2>
              <div className="form-grid">
                {fields.map((f) => (
                  <TextField
                    key={f.key}
                    label={f.label}
                    select={!!f.options}
                    {...form.register(`details.${f.key}`)}
                    value={values.details[f.key] || ""}
                    error={!!form.formState.errors.details?.[f.key]}
                    helperText={
                      form.formState.errors.details?.[f.key]?.message as
                        string | undefined
                    }
                  >
                    {f.options?.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </TextField>
                ))}
              </div>
              <Button
                type="button"
                onClick={() => {
                  const demo: Record<string, string> =
                    category === "watches"
                      ? {
                          brand: "Rolex",
                          model: "Submariner Date",
                          reference: "126610LN",
                          year: "2022",
                          condition: "Excellent",
                          service: "No service required",
                        }
                      : {
                          brand: "Pokémon",
                          model: "Charizard",
                          set: "Base Set",
                          number: "4/102",
                          edition: "Unlimited",
                          grader: "PSA",
                          grade: "9",
                        };
                  form.setValue("details", demo);
                }}
              >
                Use sample details
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Authentication & provenance</h2>
              <p>
                Give our review team the information needed to verify your
                collectible.
              </p>
              <TextField
                label={
                  category === "watches"
                    ? "Private serial / reference"
                    : "Private certificate number"
                }
                {...form.register("privateReference")}
                error={!!form.formState.errors.privateReference}
                helperText={
                  form.formState.errors.privateReference?.message ||
                  "Kept private during this session. Never included in the public listing."
                }
              />
              {category === "watches" && (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...form.register("box")}
                        checked={values.box}
                      />
                    }
                    label="Original box included"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...form.register("papers")}
                        checked={values.papers}
                      />
                    }
                    label="Original papers included"
                  />
                </>
              )}
              <Alert icon={<LockOutlined />} severity="info">
                This is a demo. Use sample information. The private identifier
                is excluded from the public listing payload.
              </Alert>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Let the object speak.</h2>
              <p>
                Add clear photos of the front, back and identifying details. Up
                to four images.
              </p>
              <div className="upload-box">
                <UploadFile />
                <Button component="label" variant="outlined">
                  Choose images
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => {
                      upload(e.target.files).catch(() =>
                        setMediaError("Could not read the image."),
                      );
                      e.target.value = "";
                    }}
                  />
                </Button>
                <small>JPG, PNG or WebP · Up to 2 MB each</small>
              </div>
              <Button
                type="button"
                onClick={() =>
                  form.setValue(
                    "media",
                    [category === "watches" ? "rolex.jpg" : "charizard.png"],
                    { shouldValidate: true },
                  )
                }
              >
                Use demo image
              </Button>
              <div className="upload-previews">
                {values.media.map((image, i) => (
                  <div key={i}>
                    <img src={asset(image)} alt={`Listing photo ${i + 1}`} />
                    <Button
                      type="button"
                      size="small"
                      onClick={() =>
                        form.setValue(
                          "media",
                          values.media.filter((_, j) => i !== j),
                          { shouldValidate: true },
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              {form.formState.errors.media && (
                <Alert severity="error">
                  {form.formState.errors.media.message}
                </Alert>
              )}
              {mediaError && <Alert severity="error">{mediaError}</Alert>}
            </>
          )}
          {step === 4 && (
            <>
              <h2>A clearer picture of value.</h2>
              <div className="wizard-valuation">
                <p>Atlas Estimated Value</p>
                <h2>
                  {money(low)} – {high.toLocaleString()}
                </h2>
                <p>High confidence · 8 comparable transactions</p>
              </div>
              <p>
                Sample estimate for the demo category. In production, the
                estimate is calculated from item-specific evidence and
                comparable sales.
              </p>
              <Protection />
            </>
          )}
          {step === 5 && (
            <>
              <h2>How would you like to sell?</h2>
              <ToggleButtonGroup
                value={values.sale}
                exclusive
                onChange={(_, v) => v && form.setValue("sale", v)}
              >
                <ToggleButton value="fixed">Fixed price</ToggleButton>
                <ToggleButton value="auction">Auction</ToggleButton>
              </ToggleButtonGroup>
              <div className="form-grid sale-fields">
                <TextField
                  type="number"
                  label={
                    values.sale === "fixed"
                      ? "Asking price (AED)"
                      : "Starting bid (AED)"
                  }
                  {...form.register("price", { valueAsNumber: true })}
                  error={!!form.formState.errors.price}
                  helperText={form.formState.errors.price?.message}
                />
                {values.sale === "auction" && (
                  <>
                    <TextField
                      type="number"
                      label="Reserve price (AED)"
                      {...form.register("reserve", { valueAsNumber: true })}
                      error={!!form.formState.errors.reserve}
                      helperText={form.formState.errors.reserve?.message}
                    />
                    <TextField
                      select
                      label="Duration"
                      {...form.register("duration")}
                      value={values.duration}
                    >
                      {["3", "7", "14"].map((d) => (
                        <MenuItem key={d} value={d}>
                          {d} days
                        </MenuItem>
                      ))}
                    </TextField>
                  </>
                )}
              </div>
              {values.sale === "fixed" && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.offers}
                      {...form.register("offers")}
                    />
                  }
                  label="Allow offers"
                />
              )}
            </>
          )}
          {step === 6 && (
            <>
              <h2>Ready for its next chapter.</h2>
              <div className="review-summary">
                <img src={asset(values.media[0])} alt="Your listing" />
                <div>
                  <h3>
                    {values.details.brand} {values.details.model}
                  </h3>
                  <p>
                    {values.sale === "fixed"
                      ? "Fixed price"
                      : "Auction starting at"}{" "}
                    {money(values.price)}
                  </p>
                  <p>Verification pending · Schema v1</p>
                </div>
              </div>
              {fields.map((f) => (
                <div className="spec" key={f.key}>
                  <span>{f.label}</span>
                  <b>{values.details[f.key]}</b>
                </div>
              ))}
              <Alert severity="info">
                Submitting creates a listing awaiting verification. A live
                auction launches only after review.
              </Alert>
              {Object.keys(form.formState.errors).length > 0 && (
                <Alert severity="error">
                  Review previous steps and correct the highlighted fields.
                </Alert>
              )}
            </>
          )}
          {submit.error && (
            <Alert severity="error">{submit.error.message}</Alert>
          )}
          <div className="wizard-actions">
            <Button
              type="button"
              disabled={step === 0}
              startIcon={<ArrowBack />}
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
            {step < 6 ? (
              <Button
                type="button"
                variant="contained"
                endIcon={<ArrowForward />}
                key="continue"
                onClick={(e) => {
                  e.preventDefault();
                  void next();
                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={submit.isPending}
              >
                {submit.isPending ? "Submitting…" : "Submit listing"}
              </Button>
            )}
          </div>
        </form>
        <aside className="wizard-aside">
          <h3>A better way to sell.</h3>
          <p>Give buyers the confidence to see what you see.</p>
          <div className="aside-step">
            <b>01</b>
            <span>
              Share the full story
              <br />
              <small>Category-specific details</small>
            </span>
          </div>
          <div className="aside-step">
            <b>02</b>
            <span>
              Establish trust
              <br />
              <small>Identity and provenance</small>
            </span>
          </div>
          <div className="aside-step">
            <b>03</b>
            <span>
              Trade with confidence
              <br />
              <small>Protected transactions</small>
            </span>
          </div>
          <p className="subtle">
            Your draft stays in this browser session. Publishing and
            verification are simulated.
          </p>
        </aside>
      </div>
    </div>
  );
}
