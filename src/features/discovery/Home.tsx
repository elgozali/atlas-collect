import { Button } from "@mui/material";
import {
  ArrowForward,
  VerifiedUserOutlined,
  InsightsOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useListings } from "../../features/listings/hooks";
import { asset } from "../../shared/formatters";
import { CollectibleCard } from "../../components/CollectibleCard";
import { Loading } from "../../components/Loading";
import { ErrorPanel } from "../../components/ErrorPanel";

export default function Home() {
  const q = useListings();
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">FOR THE DISCERNING COLLECTOR</p>
          <h1>
            Rare objects.
            <br />
            Clear value.
          </h1>
          <p>
            Authenticated collectibles. Transparent value.
            <br />A more confident way to collect.
          </p>
          <Button
            component={Link}
            to="/marketplace"
            variant="contained"
            endIcon={<ArrowForward />}
          >
            Explore the collection
          </Button>
        </div>
        <Link
          to="/listings/rolex"
          className="hero-photo"
          aria-label="Discover the Rolex Submariner"
        >
          <img
            src={asset("rolex.jpg")}
            alt="Rolex Submariner Date reference product image"
          />
          <div className="hero-caption">
            <span>THE WATCH COLLECTION</span>
            <b>Precision. Passed down.</b>
            <ArrowForward />
          </div>
        </Link>
      </section>
      <section className="trust-strip">
        <div>
          <VerifiedUserOutlined />
          <span>
            <b>Collect with confidence</b>
            <small>Identity and provenance checks</small>
          </span>
        </div>
        <div>
          <InsightsOutlined />
          <span>
            <b>Understand the value</b>
            <small>Evidence behind every estimate</small>
          </span>
        </div>
        <div>
          <ShieldOutlined />
          <span>
            <b>Protection at every step</b>
            <small>From payment to inspection</small>
          </span>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURATED BY ATLAS</p>
            <h2>Worth a closer look.</h2>
          </div>
          <Button component={Link} to="/marketplace" endIcon={<ArrowForward />}>
            View all collectibles
          </Button>
        </div>
        {q.isPending ? (
          <Loading />
        ) : q.isError ? (
          <ErrorPanel error={q.error} retry={() => q.refetch()} />
        ) : (
          <div className="product-grid">
            {q.data
              .filter((i) => i.status !== "review")
              .slice(0, 4)
              .map((i) => (
                <CollectibleCard key={i.id} item={i} />
              ))}
          </div>
        )}
      </section>
      <section className="category-section">
        <Link to="/marketplace?category=watches">
          <span>Luxury watches</span>
          <h2>
            Time well
            <br />
            collected.
          </h2>
          <p>
            Explore authenticated timepieces <ArrowForward />
          </p>
          <img
            src={asset("omega.jpg")}
            alt="A refined wristwatch"
            loading="lazy"
          />
        </Link>
        <Link to="/marketplace?category=cards">
          <span>Trading cards</span>
          <h2>
            A little nostalgia.
            <br />
            Extraordinary value.
          </h2>
          <p>
            Discover graded collectibles <ArrowForward />
          </p>
          <img
            src={asset("charizard.png")}
            alt="Pokémon Charizard collectible card"
            loading="lazy"
          />
        </Link>
      </section>
      <section className="seller-invite">
        <p>Every collection has a next chapter.</p>
        <h2>Make room for what’s next.</h2>
        <Button
          variant="outlined"
          component={Link}
          to="/sell"
          endIcon={<ArrowForward />}
        >
          Sell a collectible
        </Button>
      </section>
    </>
  );
}
