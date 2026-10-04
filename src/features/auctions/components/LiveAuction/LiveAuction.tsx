import classNames from "classnames";
import s from "./LiveAuction.module.scss";
import common from "../../../../styles/common.module.scss";
import featureStyles from "../../auction.module.scss";
import { useAuction } from "../../hooks/useAuction";
import { useAuctionEvents } from "../../hooks/useAuctionEvents";
import { useBid } from "../../hooks/useBid";
import { useAuctionScenario } from "../../hooks/useAuctionScenario";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Button, TextField, Chip } from "@mui/material";
import { ArrowBack, AccessTime, Wifi } from "@mui/icons-material";
import { auctionsApi } from "../../services/auctionsService";
import { asset, money, date } from "../../../../utils/formatters";
import { useListing } from "../../../listings";
import { Verified } from "../../../../components/Verified/Verified";
import { Valuation } from "../../../../components/Valuation/Valuation";
import { TrustDetails } from "../../../../components/TrustDetails/TrustDetails";
import { Loading } from "../../../../components/Loading/Loading";
import { ErrorPanel } from "../../../../components/ErrorPanel/ErrorPanel";
import { Protection } from "../../../../components/Protection/Protection";
import { SaveButton } from "../../../../components/SaveButton/SaveButton";

export default function LiveAuction() {
  const { id = "" } = useParams();
  const listing = useListing(id);
  const q = useAuction(id);
  const [amount, setAmount] = useState(25000);
  const [now, setNow] = useState(Date.now());
  const [auto, setAuto] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [offset, setOffset] = useState(0);
  useAuctionEvents(id, setAnnouncement);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (q.data) {
      setOffset(q.data.serverTime - Date.now());
      setAmount(q.data.minimumNextBid);
    }
  }, [q.data?.version]);
  const bid = useBid(id, amount, setAnnouncement, () => q.refetch());
  const scenario = useAuctionScenario(id);
  useEffect(() => {
    if (!auto || q.data?.highestBidder !== "You" || q.data?.status !== "live")
      return;
    const timer = setTimeout(
      () => auctionsApi.competitor().catch(() => q.refetch()),
      4500,
    );
    return () => clearTimeout(timer);
  }, [q.data?.version, auto]);
  if (id !== "charizard")
    return (
      <div className={s.root}>
        <Alert severity="info">
          This submitted auction is awaiting verification and launch.{" "}
          <Button component={Link} to="/seller">
            View seller dashboard
          </Button>
        </Alert>
      </div>
    );
  if (listing.isPending || q.isPending)
    return (
      <div className={s.root}>
        <Loading />
      </div>
    );
  if (listing.isError || q.isError)
    return (
      <div className={s.root}>
        <ErrorPanel
          error={listing.error || q.error}
          retry={() => {
            listing.refetch();
            q.refetch();
          }}
        />
      </div>
    );
  if (!listing.data || !q.data) return null;
  const item = listing.data;
  const a = q.data;
  const remaining = Math.max(0, Math.ceil((a.endsAt - now - offset) / 1000));
  const clock = [
    Math.floor(remaining / 3600),
    Math.floor((remaining % 3600) / 60),
    remaining % 60,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(" : ");
  const closed = a.status === "closed" || remaining === 0;
  return (
    <div className={s.root}>
      <Button
        component={Link}
        to="/marketplace?category=cards"
        startIcon={<ArrowBack />}
        className={common.backLink}
      >
        Back to trading cards
      </Button>
      <div
        className={classNames(
          common.listingLayout,
          featureStyles.auctionLayout,
        )}
      >
        <div>
          <div className={classNames(common.galleryMain, common.cards)}>
            <img
              src={asset(item.image)}
              alt="Pokémon Base Set Charizard card, unlimited edition"
            />
          </div>
          <p className={common.imageNote}>
            Illustrative card artwork. Sample certification and valuation data.
          </p>
        </div>
        <div className={featureStyles.auctionInfo}>
          <div className={common.row}>
            <Chip
              icon={<Wifi />}
              label={closed ? "Auction ended" : "Live auction"}
              variant="outlined"
              color="success"
            />
            <SaveButton id={id} />
          </div>
          <h1>{item.title}</h1>
          <p className={common.listingSubtitle}>
            Base Set · Unlimited · PSA 9 · 1999
          </p>
          <Verified />
          <div className={featureStyles.auctionPanel}>
            <div className={common.row}>
              <span>Current bid</span>
              <span>Reserve met</span>
            </div>
            <h2 className={common.price}>{money(a.currentBid)}</h2>
            <div className={featureStyles.auctionClock}>
              <AccessTime />
              <div>
                <small>{closed ? "Bidding has ended" : "Time remaining"}</small>
                <b>{clock}</b>
              </div>
            </div>
            <div aria-live="polite">
              {announcement && (
                <Alert
                  severity={a.highestBidder === "You" ? "success" : "warning"}
                >
                  {announcement}
                </Alert>
              )}
              {a.transactionId && (
                <Button
                  variant="contained"
                  component={Link}
                  to={`/checkout/${a.transactionId}`}
                >
                  Complete auction purchase
                </Button>
              )}
              {a.extended && !closed && (
                <Alert severity="info">
                  Auction extended to two minutes after the latest bid to
                  prevent last-second sniping.
                </Alert>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                bid.mutate();
              }}
            >
              <TextField
                label="Your bid (AED)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                helperText={`Minimum next bid ${money(a.minimumNextBid)}`}
                slotProps={{
                  htmlInput: { min: a.minimumNextBid, step: 500 },
                }}
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={closed || bid.isPending}
              >
                {bid.isPending ? "Submitting bid…" : "Place bid"}
              </Button>
            </form>
            {bid.error && <Alert severity="error">{bid.error.message}</Alert>}
            <p className={common.subtle}>
              Bids are binding in the product concept. This prototype uses
              simulated realtime and no real money.
            </p>
          </div>
          <Valuation item={item} />
          <Protection />
        </div>
        <TrustDetails item={item} />
      </div>
      <section className={featureStyles.auctionBottom}>
        <div>
          <h2>Bid activity</h2>
          {a.bids.slice(0, 6).map((b) => (
            <div className={common.dataRow} key={b.id}>
              <div>
                <b>{b.bidder}</b>
                <p>{date(b.at)} GST</p>
              </div>
              <b>{money(b.amount)}</b>
            </div>
          ))}
        </div>
        <div className={common.demoPanel}>
          <p className={common.eyebrow}>DEMO SCENARIOS</p>
          <h3>Experience a live auction</h3>
          <p>
            Use these controls to rehearse competing bids and the final
            two-minute rule.
          </p>
          <div className={common.dialogActions}>
            <Button
              variant="outlined"
              disabled={closed || scenario.isPending}
              onClick={() => scenario.mutate("competitor")}
            >
              Simulate competing bid
            </Button>
            <Button
              variant="outlined"
              disabled={closed || scenario.isPending}
              onClick={() => scenario.mutate("window")}
            >
              Jump to final 30 seconds
            </Button>
            <Button
              variant="outlined"
              disabled={closed || scenario.isPending}
              onClick={() => scenario.mutate("close")}
            >
              Close auction now
            </Button>
            <Button onClick={() => setAuto(!auto)}>
              Auto competitor: {auto ? "on" : "off"}
            </Button>
          </div>
          {scenario.error && (
            <Alert severity="error">{scenario.error.message}</Alert>
          )}
        </div>
      </section>
    </div>
  );
}
