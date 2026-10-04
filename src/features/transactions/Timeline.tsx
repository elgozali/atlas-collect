import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  Check,
  ShieldOutlined,
  ArrowForward,
  LocalShippingOutlined,
} from "@mui/icons-material";
import { api } from "../../mocks/api";
import { transactionSteps } from "../../shared/types";
import { asset, date, money } from "../../shared/hooks";
import {
  PageHeading,
  Loading,
  ErrorPanel,
  Protection,
} from "../../components/Domain";
export default function Timeline() {
  const { id = "" } = useParams();
  const client = useQueryClient();
  const q = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => api.getTransaction(id),
  });
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Item not as described");
  const [details, setDetails] = useState("");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const action = useMutation({
    mutationFn: (type: "advance" | "accept" | "dispute") =>
      type === "advance"
        ? api.advance(id)
        : type === "accept"
          ? api.acceptInspection(id)
          : api.dispute(id, `${reason}: ${details}`),
    onSuccess: (t) => {
      client.setQueryData(["transaction", id], t);
      client.invalidateQueries({ queryKey: ["transactions"] });
      client.invalidateQueries({ queryKey: ["listings"] });
      setOpen(false);
    },
  });
  if (q.isPending) return <Loading />;
  if (q.isError)
    return <ErrorPanel error={q.error} retry={() => q.refetch()} />;
  const t = q.data;
  const remaining = Math.max(
    0,
    Math.ceil(((t.inspectionEndsAt || now) - now) / 1000),
  );
  const clock = `${Math.floor(remaining / 3600)}:${String(Math.floor((remaining % 3600) / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  return (
    <>
      <PageHeading
        title={
          t.status === "completed"
            ? "A collectible, safely yours."
            : "Every step, accounted for."
        }
        description={`Transaction ${id} · All times GST`}
        eyebrow="ATLAS PROTECTED"
      />
      <div className="timeline-layout">
        <section className="timeline-card">
          {transactionSteps.map((s, i) => (
            <div
              className={`timeline-step ${i < t.step ? "done" : ""} ${i === t.step ? "current" : ""}`}
              key={s}
            >
              <span className="timeline-dot">
                {i <= t.step ? <Check /> : i + 1}
              </span>
              <div>
                <h3>{s}</h3>
                <p>
                  {t.events.find((e) => e.label === s)
                    ? `${date(t.events.find((e) => e.label === s)!.at)} GST`
                    : i === t.step
                      ? "In progress"
                      : "Up next"}
                </p>
                {i === 4 && t.step >= 4 && (
                  <p>
                    <LocalShippingOutlined fontSize="small" /> Insured shipment
                    · Sample DHL tracking 293840
                  </p>
                )}
                {i === t.step && i === 6 && (
                  <div className="inspection">
                    <b>Your inspection window</b>
                    <h2>{clock}</h2>
                    <p>
                      Review condition, accessories and documentation before
                      settlement.
                    </p>
                    <div className="dialog-actions">
                      <Button
                        variant="contained"
                        disabled={t.status !== "active" || action.isPending}
                        onClick={() => action.mutate("accept")}
                      >
                        Everything looks good
                      </Button>
                      <Button
                        variant="outlined"
                        disabled={t.status !== "active" || action.isPending}
                        onClick={() => setOpen(true)}
                      >
                        Report an issue
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {t.status === "disputed" && (
            <Alert severity="warning">
              Issue reported. Settlement is paused while the Atlas team reviews
              your case. {t.dispute}
            </Alert>
          )}
          {t.status === "completed" && (
            <Alert severity="success">
              Inspection accepted. The transaction is complete and settlement is
              released in the product concept.
            </Alert>
          )}
          {action.error && (
            <Alert severity="error">{action.error.message}</Alert>
          )}
        </section>
        <aside>
          <div className="order-summary">
            <img
              className="timeline-image"
              src={asset(t.listing.image)}
              alt={t.listing.title}
            />
            <h3>{t.listing.title}</h3>
            <p>{t.listing.subtitle}</p>
            <div className="spec">
              <span>Agreed price</span>
              <b>{money(t.agreedPrice)}</b>
            </div>
            <Protection />
          </div>
          {t.status === "payment_pending" ? (
            <div className="demo-panel">
              <h3>Payment is required</h3>
              <Button
                component={Link}
                to={`/checkout/${id}`}
                variant="contained"
              >
                Complete checkout
              </Button>
            </div>
          ) : t.status === "active" && t.step < 6 ? (
            <div className="demo-panel">
              <p className="eyebrow">DEMO SCENARIO</p>
              <h3>Follow its journey.</h3>
              <p>
                Advance simulated authentication and shipping events to reach
                delivery and inspection.
              </p>
              <Button
                variant="outlined"
                disabled={action.isPending}
                onClick={() => action.mutate("advance")}
                endIcon={<ArrowForward />}
              >
                Simulate next update
              </Button>
            </div>
          ) : (
            <div className="protection">
              <ShieldOutlined />
              <p>
                {t.status === "disputed"
                  ? "Funds remain protected during review."
                  : "A clear record of your purchase."}
              </p>
            </div>
          )}
        </aside>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Tell us what went wrong</DialogTitle>
        <DialogContent>
          <p>Settlement pauses when you report an issue during inspection.</p>
          <TextField
            select
            label="Issue"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {[
              "Item not as described",
              "Authentication concern",
              "Damage during shipping",
              "Missing accessories",
              "Wrong item",
              "Other",
            ].map((r) => (
              <MenuItem value={r} key={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            className="issue-details"
            label="Describe the issue"
            multiline
            minRows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <div className="dialog-actions">
            <Button
              variant="contained"
              disabled={action.isPending || details.trim().length < 5}
              onClick={() => action.mutate("dispute")}
            >
              Report issue
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </div>
          {action.error && (
            <Alert severity="error">{action.error.message}</Alert>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
