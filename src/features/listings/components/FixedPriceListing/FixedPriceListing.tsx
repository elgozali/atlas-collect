import classNames from "classnames";
import s from "./FixedPriceListing.module.scss";
import common from "../../../../styles/common.module.scss";
import featureStyles from "../../listing.module.scss";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Dialog, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward, Close, ZoomIn } from "@mui/icons-material";
import { useListing } from "../../hooks/useListing";
import { usePurchase } from "../../hooks/usePurchase";
import { asset, money } from "../../../../utils/formatters";
import { Loading } from "../../../../components/Loading/Loading";
import { ErrorPanel } from "../../../../components/ErrorPanel/ErrorPanel";
import { Verified } from "../../../../components/Verified/Verified";
import { SaveButton } from "../../../../components/SaveButton/SaveButton";
import { Valuation } from "../../../../components/Valuation/Valuation";
import { TrustDetails } from "../../../../components/TrustDetails/TrustDetails";
import { Protection } from "../../../../components/Protection/Protection";
import { OfferDialog } from "../../../offers";

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
      <div className={s.root}>
        <Loading />
      </div>
    );
  if (q.isError)
    return (
      <div className={s.root}>
        <ErrorPanel error={q.error} retry={() => q.refetch()} />
      </div>
    );
  const item = q.data;
  const active = item.status === "active";
  const pending = item.status === "review";
  return (
    <div className={s.root}>
      <Button
        component={Link}
        to={`/marketplace?category=${item.category}`}
        startIcon={<ArrowBack />}
        className={common.backLink}
      >
        Back to {item.category === "watches" ? "watches" : "trading cards"}
      </Button>
      <div className={common.listingLayout}>
        <div>
          <button
            className={classNames(common.galleryMain, common[item.category])}
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
          <div className={featureStyles.galleryThumbs}>
            {["Overview", "Detail"].map((label, i) => (
              <button
                key={label}
                className={classNames({ [featureStyles.selected]: view === i })}
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
          <p className={common.imageNote}>
            Illustrative imagery for the prototype; not an authentication
            record.
          </p>
        </div>
        <div className={featureStyles.purchasePanel}>
          <div className={common.row}>
            <Verified verified={item.verified} />
            <SaveButton id={item.id} />
          </div>
          <p className={common.eyebrow}>
            {item.category === "watches"
              ? "THE WATCH COLLECTION"
              : "THE CARD COLLECTION"}
          </p>
          <h1>{item.title}</h1>
          <p className={common.listingSubtitle}>{item.subtitle}</p>
          <p className={featureStyles.priceLabel}>
            {active
              ? "Asking price"
              : pending
                ? "Awaiting verification"
                : "Collectible reserved"}
          </p>
          <h2 className={common.price}>{money(item.price)}</h2>
          <Valuation item={item} />
          <div className={featureStyles.purchaseActions}>
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
          <div className={featureStyles.sellerMini}>
            <span className={common.avatar}>{item.seller.slice(0, 1)}</span>
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
        className={s.root}
        open={zoom}
        onClose={() => setZoom(false)}
        fullWidth
        maxWidth="md"
      >
        <IconButton
          aria-label="Close image"
          className={common.dialogClose}
          onClick={() => setZoom(false)}
        >
          <Close />
        </IconButton>
        <img
          className={featureStyles.zoomImage}
          src={asset(item.image)}
          alt={item.title}
        />
      </Dialog>
    </div>
  );
}
