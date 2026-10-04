import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, TextField, Chip } from "@mui/material";
import { ArrowBack, AccessTime, Wifi } from "@mui/icons-material";
import { api } from "../../mocks/api";
import { asset, money, useListing, date } from "../../shared/hooks";
import type { Auction } from "../../shared/types";
import {
  Verified,
  Valuation,
  TrustDetails,
  Loading,
  ErrorPanel,
  Protection,
  SaveButton,
} from "../../components/Domain";
export default function AuctionPage() {
  const { id = "" } = useParams();
  const listing = useListing(id);
  const client = useQueryClient();
  const q = useQuery({
    queryKey: ["auction", id],
    queryFn: api.getAuction,
    enabled: id === "charizard",
    refetchInterval: 10000,
  });
  const [amount, setAmount] = useState(25000);
  const [now, setNow] = useState(Date.now());
  const [auto, setAuto] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(
    () =>
      api.subscribe((e) => {
        if (e.entityId !== id || !e.auction) return;
        client.setQueryData<Auction>(["auction", id], (old) =>
          !old || e.version > old.version ? e.auction : old,
        );
        if (e.auction.status === "closed")
          setAnnouncement(
            e.auction.highestBidder === "You"
              ? "Auction won. Your collectible is reserved."
              : "Auction closed. Another collector won.",
          );
        else if (e.auction.highestBidder !== "You")
          setAnnouncement("You have been outbid.");
      }),
    [id, client],
  );
  useEffect(() => {
    if (q.data) {
      setOffset(q.data.serverTime - Date.now());
      setAmount(q.data.minimumNextBid);
    }
  }, [q.data?.version]);
  const bid = useMutation({
    mutationFn: () => api.bid(amount, crypto.randomUUID()),
    onSuccess: (a) => {
      client.setQueryData(["auction", id], a);
      setAnnouncement("Bid accepted. You are the highest bidder.");
    },
    onError: () => q.refetch(),
  });
  const scenario = useMutation({
    mutationFn: (type: "competitor" | "window" | "close") =>
      type === "competitor"
        ? api.competitor()
        : type === "close"
          ? api.closeAuction()
          : api.finalWindow(),
    onSuccess: (a) => client.setQueryData(["auction", id], a),
  });
  useEffect(() => {
    if (!auto || q.data?.highestBidder !== "You" || q.data?.status !== "live")
      return;
    const timer = setTimeout(
      () => api.competitor().catch(() => q.refetch()),
      4500,
    );
    return () => clearTimeout(timer);
  }, [q.data?.version, auto]);
  if (id !== "charizard")
    return (
      <Alert severity="info">
        This submitted auction is awaiting verification and launch.{" "}
        <Button component={Link} to="/seller">
          View seller dashboard
        </Button>
      </Alert>
    );
  if (listing.isPending || q.isPending) return <Loading />;
  if (listing.isError || q.isError)
    return (
      <ErrorPanel
        error={listing.error || q.error}
        retry={() => {
          listing.refetch();
          q.refetch();
        }}
      />
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
    <>
      <Button
        component={Link}
        to="/marketplace?category=cards"
        startIcon={<ArrowBack />}
        className="back-link"
      >
        Back to trading cards
      </Button>
      <div className="listing-layout auction-layout">
        <div>
          <div className="gallery-main cards">
            <img
              src={asset(item.image)}
              alt="Pokémon Base Set Charizard card, unlimited edition"
            />
          </div>
          <p className="image-note">
            Illustrative card artwork. Sample certification and valuation data.
          </p>
        </div>
        <div className="auction-info">
          <div className="row">
            <Chip
              icon={<Wifi />}
              label={closed ? "Auction ended" : "Live auction"}
              variant="outlined"
              color="success"
            />
            <SaveButton id={id} />
          </div>
          <h1>{item.title}</h1>
          <p className="listing-subtitle">
            Base Set · Unlimited · PSA 9 · 1999
          </p>
          <Verified />
          <div className="auction-panel">
            <div className="row">
              <span>Current bid</span>
              <span>Reserve met</span>
            </div>
            <h2 className="price">{money(a.currentBid)}</h2>
            <div className="auction-clock">
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
                slotProps={{ htmlInput: { min: a.minimumNextBid, step: 500 } }}
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
            <p className="subtle">
              Bids are binding in the product concept. This prototype uses
              simulated realtime and no real money.
            </p>
          </div>
          <Valuation item={item} />
          <Protection />
        </div>
        <TrustDetails item={item} />
      </div>
      <section className="auction-bottom">
        <div>
          <h2>Bid activity</h2>
          {a.bids.slice(0, 6).map((b) => (
            <div className="data-row" key={b.id}>
              <div>
                <b>{b.bidder}</b>
                <p>{date(b.at)} GST</p>
              </div>
              <b>{money(b.amount)}</b>
            </div>
          ))}
        </div>
        <div className="demo-panel">
          <p className="eyebrow">DEMO SCENARIOS</p>
          <h3>Experience a live auction</h3>
          <p>
            Use these controls to rehearse competing bids and the final
            two-minute rule.
          </p>
          <div className="dialog-actions">
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
    </>
  );
}
