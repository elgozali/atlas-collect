import classNames from "classnames";
import s from "./CollectibleCard.module.scss";
import common from "../../styles/common.module.scss";
import { Link } from "react-router-dom";
import type { Listing } from "../../features/listings";
import { asset, money } from "../../utils/formatters";
import { SaveButton } from "../SaveButton/SaveButton";
import { Verified } from "../Verified/Verified";

export function CollectibleCard({ item }: { item: Listing }) {
  return (
    <article className={s.collectible}>
      <div className={classNames(s.cardImage, common[item.category])}>
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
        <div className={s.save}>
          <SaveButton id={item.id} />
        </div>
      </div>
      <div className={s.cardMeta}>
        <span>{item.sale === "auction" ? "Live auction" : "Fixed price"}</span>
        <Verified verified={item.verified} />
      </div>
      <Link
        className={s.cardTitle}
        to={
          item.sale === "auction"
            ? `/auctions/${item.id}`
            : `/listings/${item.id}`
        }
      >
        {item.title}
      </Link>
      <p className={common.subtle}>{item.subtitle}</p>
      <div className={s.cardPrice}>
        <b>{money(item.price)}</b>
        <span>
          {item.sale === "auction"
            ? "Current bid"
            : item.status === "active"
              ? "Asking price"
              : item.status}
        </span>
      </div>
      <p className={s.estimate}>
        Atlas estimate {money(item.low)} – {item.high.toLocaleString("en-US")}
      </p>
    </article>
  );
}
