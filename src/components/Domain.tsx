import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Skeleton,
} from "@mui/material";
import {
  VerifiedUserOutlined,
  FavoriteBorder,
  Favorite,
  ArrowForward,
  ExpandMore,
  Close,
  ShieldOutlined,
} from "@mui/icons-material";
import type { Listing } from "../shared/types";
import { asset, money } from "../shared/hooks";
import { useUI } from "../shared/store";
export function Verified({ verified = true }: { verified?: boolean }) {
  return (
    <Chip
      icon={<VerifiedUserOutlined />}
      label={verified ? "Atlas Verified" : "Verification pending"}
      color={verified ? "success" : "warning"}
      variant="outlined"
      size="small"
    />
  );
}
export function SaveButton({ id }: { id: string }) {
  const saved = useUI((s) => s.saved.includes(id));
  const toggle = useUI((s) => s.toggleSaved);
  return (
    <IconButton
      aria-label={saved ? "Remove from watchlist" : "Save to watchlist"}
      aria-pressed={saved}
      onClick={() => toggle(id)}
    >
      {saved ? (
        <Favorite fontSize="small" />
      ) : (
        <FavoriteBorder fontSize="small" />
      )}
    </IconButton>
  );
}
export function CollectibleCard({ item }: { item: Listing }) {
  return (
    <article className="collectible">
      <div className={`card-image ${item.category}`}>
        <Link
          to={
            item.sale === "auction"
              ? `/auctions/${item.id}`
              : `/listings/${item.id}`
          }
          tabIndex={-1}
          aria-hidden="true"
        >
          <img src={asset(item.image)} alt={item.title} loading="lazy" />
        </Link>
        <div className="save">
          <SaveButton id={item.id} />
        </div>
      </div>
      <div className="card-meta">
        <span>{item.sale === "auction" ? "Live auction" : "Fixed price"}</span>
        <Verified verified={item.verified} />
      </div>
      <Link
        className="card-title"
        to={
          item.sale === "auction"
            ? `/auctions/${item.id}`
            : `/listings/${item.id}`
        }
      >
        {item.title}
      </Link>
      <p className="subtle">{item.subtitle}</p>
      <div className="card-price">
        <b>{money(item.price)}</b>
        <span>
          {item.sale === "auction"
            ? "Current bid"
            : item.status === "active"
              ? "Asking price"
              : item.status}
        </span>
      </div>
      <p className="estimate">
        Atlas estimate {money(item.low)} – {item.high.toLocaleString("en-US")}
      </p>
    </article>
  );
}
export function PageHeading({
  title,
  description,
  eyebrow,
  action,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="heading-row">
        <h1>{title}</h1>
        {action}
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}
export function Loading() {
  return (
    <div aria-label="Loading collectibles" className="skeleton-grid">
      {[1, 2, 3].map((n) => (
        <div key={n}>
          <Skeleton variant="rounded" height={300} />
          <Skeleton height={40} />
          <Skeleton width="65%" />
        </div>
      ))}
    </div>
  );
}
export function ErrorPanel({
  error,
  retry,
}: {
  error: Error | null;
  retry?: () => void;
}) {
  return (
    <Alert
      severity="error"
      action={retry ? <Button onClick={retry}>Try again</Button> : undefined}
    >
      {error?.message || "We could not load this page."}
    </Alert>
  );
}
export function Valuation({ item }: { item: Listing }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="valuation">
        <div className="row">
          <span>Atlas Estimated Value</span>
          <span className="confidence">HIGH CONFIDENCE</span>
        </div>
        <h3>
          {money(item.low)} <span>–</span> {item.high.toLocaleString("en-US")}
        </h3>
        <div className="range">
          <div className="range-band" />
          <div className="range-marker" />
        </div>
        <div className="row muted">
          <span>Estimated range</span>
          <span>Asking {money(item.price)}</span>
        </div>
        <p>
          Based on 8 comparable sales. An estimate, not a guarantee of resale
          value.
        </p>
        <Button
          size="small"
          onClick={() => setOpen(true)}
          endIcon={<ArrowForward />}
        >
          View comparables
        </Button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          Evidence behind the estimate
          <IconButton
            className="dialog-close"
            aria-label="Close comparables"
            onClick={() => setOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="subtle">
            Illustrative comparable transactions, normalized for condition and
            provenance.
          </p>
          {[item.low, item.high - 1000, item.high].map((n, i) => (
            <div className="data-row" key={i}>
              <div>
                <b>{item.title}</b>
                <p>
                  Comparable sale · {["12 Sep", "20 Sep", "28 Sep"][i]} 2026
                </p>
              </div>
              <b>{money(n)}</b>
            </div>
          ))}
          <p>
            Condition, completeness and market liquidity can move the final
            price. Sample data is used in this prototype.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function TrustDetails({ item }: { item: Listing }) {
  return (
    <div className="trust-details">
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <h3>Authentication & provenance</h3>
        </AccordionSummary>
        <AccordionDetails>
          <div className="trust-checks">
            <p>
              <VerifiedUserOutlined />{" "}
              {item.category === "watches"
                ? "Reference and documentation"
                : "Grading certificate"}{" "}
              {item.verified ? "verified" : "pending review"}
            </p>
            <p>
              <VerifiedUserOutlined /> Seller identity verified
            </p>
            <p>
              <ShieldOutlined /> Physical authentication after purchase
            </p>
          </div>
          <p className="subtle">
            Atlas Verified covers the checks shown above. Physical
            authentication happens before settlement.
          </p>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <h3>Collectible details</h3>
        </AccordionSummary>
        <AccordionDetails>
          {Object.entries(item.attributes).map(([k, v]) => (
            <div className="spec" key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <h3>Meet the seller</h3>
        </AccordionSummary>
        <AccordionDetails>
          <b>{item.seller} · Private collector</b>
          <p>4.9 rating · 27 completed transactions · Member since 2024</p>
          <Verified />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
export function Protection() {
  return (
    <div className="protection">
      <ShieldOutlined />
      <div>
        <b>Atlas Protected</b>
        <p>
          Secured payment · Authentication before settlement · Tracked
          fulfilment · 48-hour inspection
        </p>
      </div>
    </div>
  );
}
