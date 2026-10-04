import { showSnackbar } from "../../../../shared/snackbar/service";
import classNames from "classnames";
import s from "./SellerListing.module.scss";
import featureStyles from "../../seller.module.scss";
import common from "../../../../styles/common.module.scss";
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
} from "../../schemas/listingSchema";
import { useSubmitListing } from "../../hooks/useSubmitListing";
import type { Draft } from "../../types/Draft";
import { asset, money } from "../../../../utils/formatters";
import { PageHeading } from "../../../../components/PageHeading/PageHeading";
import { Protection } from "../../../../components/Protection/Protection";
import type { Category } from "../../../listings";

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
  const save = (notify = false) => {
    try {
      sessionStorage.setItem(
        "atlas-draft-v1",
        JSON.stringify(form.getValues()),
      );
      if (notify) showSnackbar("Draft saved in this browser session.");
    } catch {
      showSnackbar(
        "Draft storage is unavailable in this browser. Keep this tab open.",
        "error",
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
  const submit = useSubmitListing(() => navigate("/seller"));
  const upload = async (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    if (
      selected.some(
        (f) =>
          !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
          f.size > 2000000,
      )
    ) {
      showSnackbar("Use JPG, PNG or WebP images under 2 MB each.", "error");
      return;
    }
    if (values.media.length + selected.length > 4) {
      showSnackbar("Add up to four images.", "error");
      return;
    }
    try {
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
    } catch {
      showSnackbar(
        "Could not read the image. Please try another file.",
        "error",
      );
    }
  };
  return (
    <div className={s.root}>
      <PageHeading
        title="Sell a collectible."
        description="A considered process for objects that deserve one."
        action={
          <Button variant="outlined" onClick={() => save(true)}>
            Save draft
          </Button>
        }
      />
      <div className={featureStyles.wizardProgress}>
        <Stepper activeStep={step} alternativeLabel>
          {steps.map((s) => (
            <Step key={s}>
              <StepLabel>{s}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
      <div className={featureStyles.wizardLayout}>
        <form
          className={featureStyles.wizardCard}
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 6) {
              void next();
            } else {
              void form.handleSubmit((d) => submit.mutate(d))(e);
            }
          }}
        >
          <p className={common.eyebrow}>STEP {step + 1} OF 7</p>
          {step === 0 && (
            <>
              <h2>What are you selling?</h2>
              <p>Each category has its own details and verification checks.</p>
              <div className={featureStyles.categoryChoices}>
                {(["watches", "cards"] as Category[]).map((c) => (
                  <button
                    type="button"
                    className={classNames({
                      [featureStyles.chosen]: category === c,
                    })}
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
              <div className={featureStyles.formGrid}>
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
              <div className={featureStyles.uploadBox}>
                <UploadFile />
                <Button component="label" variant="outlined">
                  Choose images
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => {
                      void upload(e.target.files);
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
                    [
                      category === "watches"
                        ? "rolex.jpg"
                        : "charizard-psa9.webp",
                    ],
                    { shouldValidate: true },
                  )
                }
              >
                Use demo image
              </Button>
              <div className={featureStyles.uploadPreviews}>
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
            </>
          )}
          {step === 4 && (
            <>
              <h2>A clearer picture of value.</h2>
              <div className={featureStyles.wizardValuation}>
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
              <div
                className={classNames(
                  featureStyles.formGrid,
                  featureStyles.saleFields,
                )}
              >
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
              <div className={featureStyles.reviewSummary}>
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
                <div className={common.spec} key={f.key}>
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
          <div className={featureStyles.wizardActions}>
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
        <aside className={featureStyles.wizardAside}>
          <h3>A better way to sell.</h3>
          <p>Give buyers the confidence to see what you see.</p>
          <div className={featureStyles.asideStep}>
            <b>01</b>
            <span>
              Share the full story
              <br />
              <small>Category-specific details</small>
            </span>
          </div>
          <div className={featureStyles.asideStep}>
            <b>02</b>
            <span>
              Establish trust
              <br />
              <small>Identity and provenance</small>
            </span>
          </div>
          <div className={featureStyles.asideStep}>
            <b>03</b>
            <span>
              Trade with confidence
              <br />
              <small>Protected transactions</small>
            </span>
          </div>
          <p className={common.subtle}>
            Your draft stays in this browser session. Publishing and
            verification are simulated.
          </p>
        </aside>
      </div>
    </div>
  );
}
