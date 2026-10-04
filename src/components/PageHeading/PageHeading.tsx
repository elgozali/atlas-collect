import s from "./PageHeading.module.scss";
import common from "../../styles/common.module.scss";
import type { ReactNode } from "react";

export function PageHeading({
  title,
  description,
  eyebrow,
  action,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className={s.pageHeading}>
      {eyebrow && <p className={common.eyebrow}>{eyebrow}</p>}
      <div className={s.headingRow}>
        <h1>{title}</h1>
        {action}
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}
