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
    <div className="page-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="heading-row">
        <h1>{title}</h1>
        {action}
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}
