import s from "./Loading.module.scss";
import { Skeleton } from "@mui/material";

export function Loading() {
  return (
    <div aria-label="Loading collectibles" className={s.skeletonGrid}>
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
