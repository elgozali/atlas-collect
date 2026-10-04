import { Link } from "react-router-dom";
import type { Listing } from "../features/listings/types";
import { asset, money } from "../shared/formatters";
import { SaveButton } from "./SaveButton";
import { Verified } from "./Verified";

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
