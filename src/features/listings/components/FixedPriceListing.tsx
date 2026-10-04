import styles from "../listings.module.scss";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Dialog, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward, Close, ZoomIn } from "@mui/icons-material";
import { useListing, usePurchase } from "../hooks";
import { asset, money } from "../../../utils/formatters";
import { Loading } from "../../../components/Loading";
import { ErrorPanel } from "../../../components/ErrorPanel";
import { Verified } from "../../../components/Verified";
import { SaveButton } from "../../../components/SaveButton";
import { Valuation } from "../../../components/Valuation";
import { TrustDetails } from "../../../components/TrustDetails";
import { Protection } from "../../../components/Protection";
import { OfferDialog } from "../../offers/components/OfferDialog";

export default function FixedPriceListing() {
  const { id = "" } = useParams();
  const q = useListing(id);
  const [offer, setOffer] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [view, setView] = useState(0);
  const navigate = useNavigate();
  const buy = usePurchase(id, (t) => navigate(`/checkout/${t.id}`));
  if (q.isPending)
    return (
      <div className={styles.root}>
        <Loading />
      </div>
    );
  if (q.isError)
    return (
      <div className={styles.root}>
        <ErrorPanel error={q.error} retry={() => q.refetch()} />
      </div>
    );
  const item = q.data;
  const active = item.status === "active";
  const pending = item.status === "review";
  return (
    <div className={styles.root}>
      <Button
        component={Link}
        to={`/marketplace?category=${item.category}`}
        startIcon={<ArrowBack />}
        className="back-link"
      >
        Back to {item.category === "watches" ? "watches" : "trading cards"}
      </Button>
      <div className="listing-layout">
        <div>
          <button
            className={`gallery-main ${item.category}`}
            onClick={() => setZoom(true)}
            aria-label="Enlarge collectible image"
          >
            <img
              src={asset(item.image)}
              alt={item.title}
              style={{ transform: view === 1 ? "scale(1.5)" : undefined }}
            />
            <span>
              <ZoomIn /> Inspect image
            </span>
          </button>
          <div className="gallery-thumbs">
            {["Overview", "Detail"].map((label, i) => (
              <button
                key={label}
                className={view === i ? "selected" : ""}
                onClick={() => setView(i)}
                aria-pressed={view === i}
              >
                <img
                  src={asset(item.image)}
                  alt=""
                  style={{ transform: i === 1 ? "scale(1.5)" : undefined }}
                />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <p className="image-note">
            Illustrative imagery for the prototype; not an authentication
            record.
          </p>
        </div>
        <div className="purchase-panel">
          <div className="row">
            <Verified verified={item.verified} />
            <SaveButton id={item.id} />
          </div>
          <p className="eyebrow">
            {item.category === "watches"
              ? "THE WATCH COLLECTION"
              : "THE CARD COLLECTION"}
          </p>
          <h1>{item.title}</h1>
          <p className="listing-subtitle">{item.subtitle}</p>
          <p className="price-label">
            {active
              ? "Asking price"
              : pending
                ? "Awaiting verification"
                : "Collectible reserved"}
          </p>
          <h2 className="price">{money(item.price)}</h2>
          <Valuation item={item} />
          <div className="purchase-actions">
            <Button
              variant="contained"
              fullWidth
              disabled={!active || buy.isPending}
              onClick={() => buy.mutate()}
              endIcon={<ArrowForward />}
            >
              {buy.isPending
                ? "Reserving…"
                : active
                  ? "Buy now"
                  : pending
                    ? "Review pending"
                    : "Reserved"}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              disabled={!active || item.allowOffers === false}
              onClick={() => setOffer(true)}
            >
              Make an offer
            </Button>
          </div>
          {buy.error && <Alert severity="error">{buy.error.message}</Alert>}
          <Protection />
          <div className="seller-mini">
            <span className="avatar">{item.seller.slice(0, 1)}</span>
            <div>
              <b>{item.seller}</b>
              <p>Verified collector · 4.9 / 5</p>
            </div>
          </div>
        </div>
        <TrustDetails item={item} />
      </div>
      <OfferDialog item={item} open={offer} onClose={() => setOffer(false)} />
      <Dialog
        className={styles.root}
        open={zoom}
        onClose={() => setZoom(false)}
        fullWidth
        maxWidth="md"
      >
        <IconButton
          aria-label="Close image"
          className="dialog-close"
          onClick={() => setZoom(false)}
        >
          <Close />
        </IconButton>
        <img className="zoom-image" src={asset(item.image)} alt={item.title} />
      </Dialog>
    </div>
  );
}
