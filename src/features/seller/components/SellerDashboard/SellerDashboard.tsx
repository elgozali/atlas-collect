import s from "./SellerDashboard.module.scss";
import featureStyles from "../../seller.module.scss";
import common from "../../../../styles/common.module.scss";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from "@mui/material";
import { Add, ArrowForward } from "@mui/icons-material";
import { PageHeading } from "../../../../components/PageHeading/PageHeading";
import { Loading } from "../../../../components/Loading/Loading";
import { ErrorPanel } from "../../../../components/ErrorPanel/ErrorPanel";
import { useListings } from "../../../listings";
import { useOffers, useOfferAction } from "../../../offers";
import { useTransactions } from "../../../transactions";
import { money, asset } from "../../../../utils/formatters";
import type { Offer } from "../../../offers";

export default function SellerDashboard() {
  const listings = useListings();
  const offers = useOffers();
  const transactions = useTransactions();
  const [params] = useSearchParams();
  const [counter, setCounter] = useState<Offer | null>(null);
  const [amount, setAmount] = useState(44000);
  const action = useOfferAction(() => setCounter(null));
  if (listings.isPending || offers.isPending || transactions.isPending)
    return (
      <div className={s.root}>
        <Loading />
      </div>
    );
  if (listings.isError || offers.isError || transactions.isError)
    return (
      <div className={s.root}>
        <ErrorPanel
          error={listings.error || offers.error || transactions.error}
          retry={() => {
            listings.refetch();
            offers.refetch();
            transactions.refetch();
          }}
        />
      </div>
    );
  const owned = listings.data?.filter((l) => l.seller === "Moe Elgozali") || [];
  const activeOffers =
    offers.data?.filter((o) => ["pending", "countered"].includes(o.status)) ||
    [];
  return (
    <div className={s.root}>
      <PageHeading
        title="Your collection, in motion."
        description="Welcome back, Sara. Here’s where things stand."
        eyebrow="SELLER STUDIO"
        action={
          <Button
            component={Link}
            to="/sell"
            variant="contained"
            startIcon={<Add />}
          >
            New listing
          </Button>
        }
      />
      {params.has("submitted") && (
        <Alert severity="success">
          Listing submitted. It is visible in your studio while verification is
          pending.
        </Alert>
      )}
      <div className={featureStyles.stats}>
        {[
          [
            owned.filter((i) => i.status === "active").length,
            "Active listings",
          ],
          [activeOffers.length, "Active offers"],
          [
            transactions.data?.filter((t) => t.status !== "completed").length ||
              0,
            "Open transactions",
          ],
          [
            27 +
              (transactions.data?.filter((t) => t.status === "completed")
                .length || 0),
            "Completed sales",
          ],
        ].map(([value, label]) => (
          <div key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className={featureStyles.dashboardGrid}>
        <section>
          <h2>Your listings</h2>
          {owned.map((l) => (
            <div className={featureStyles.sellerListing} key={l.id}>
              <img src={asset(l.image)} alt={l.title} />
              <div>
                <h3>{l.title}</h3>
                <p>
                  {money(l.price)} ·{" "}
                  {l.sale === "auction" ? "Auction" : "Fixed price"}
                </p>
                <Chip
                  size="small"
                  label={!l.verified ? "Review pending" : l.status}
                />
              </div>
              <Button
                component={Link}
                to={
                  l.sale === "auction"
                    ? `/auctions/${l.id}`
                    : `/listings/${l.id}`
                }
                endIcon={<ArrowForward />}
              >
                View
              </Button>
            </div>
          ))}
          <h2 className={common.subsectionHeading}>Transactions</h2>
          {transactions.data?.length ? (
            transactions.data.map((t) => (
              <div className={common.dataRow} key={t.id}>
                <div>
                  <b>{t.listing.title}</b>
                  <p>
                    {t.id} · {t.status.replace("_", " ")}
                  </p>
                </div>
                <Button component={Link} to={`/transactions/${t.id}`}>
                  Track
                </Button>
              </div>
            ))
          ) : (
            <p className={common.subtle}>
              Accepted offers and purchases will appear here.
            </p>
          )}
        </section>
        <section className={featureStyles.offersPanel}>
          <div className={common.row}>
            <h2>Current offers</h2>
            <Chip size="small" label={activeOffers.length} />
          </div>
          {activeOffers.length ? (
            activeOffers.map((o) => (
              <div className={featureStyles.sellerOffer} key={o.id}>
                <div className={common.row}>
                  <b>{o.buyer}</b>
                  <Chip size="small" label={o.status} />
                </div>
                <p>{listings.data?.find((l) => l.id === o.listingId)?.title}</p>
                <h3>{money(o.amount)}</h3>
                <small>
                  Expires in{" "}
                  {Math.max(0, Math.ceil((o.expiresAt - Date.now()) / 3600000))}
                  h
                </small>
                <div className={common.dialogActions}>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={action.isPending}
                    onClick={() => action.mutate({ offer: o, type: "accept" })}
                  >
                    Accept
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setCounter(o);
                      setAmount(o.amount + 2000);
                    }}
                  >
                    Counter
                  </Button>
                  <Button
                    size="small"
                    disabled={action.isPending}
                    onClick={() => action.mutate({ offer: o, type: "reject" })}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className={common.empty}>
              <h3>You’re all caught up.</h3>
              <p>New offers will appear here.</p>
            </div>
          )}
          {action.error && (
            <Alert severity="error">{action.error.message}</Alert>
          )}
        </section>
      </div>
      <Dialog
        className={s.root}
        open={!!counter}
        onClose={() => setCounter(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Send a counteroffer</DialogTitle>
        <DialogContent>
          <p>
            Offer {money(counter?.amount || 0)} from {counter?.buyer}
          </p>
          <TextField
            label="Counter amount (AED)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <div className={common.dialogActions}>
            <Button
              variant="contained"
              disabled={action.isPending}
              onClick={() =>
                counter &&
                action.mutate({ offer: counter, type: "counter", amount })
              }
            >
              Send counter
            </Button>
            <Button onClick={() => setCounter(null)}>Cancel</Button>
          </div>
          {action.error && (
            <Alert severity="error">{action.error.message}</Alert>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
