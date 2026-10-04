import s from "./TrustDetails.module.scss";
import common from "../../styles/common.module.scss";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import {
  ExpandMore,
  VerifiedUserOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import type { Listing } from "../../features/listings";
import { Verified } from "../Verified/Verified";

export function TrustDetails({ item }: { item: Listing }) {
  return (
    <div className={s.trustDetails}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <h3>Authentication & provenance</h3>
        </AccordionSummary>
        <AccordionDetails>
          <div className={s.trustChecks}>
            <p>
              <VerifiedUserOutlined />{" "}
              {item.category === "watches"
                ? "Reference and documentation"
                : "Grading certificate"}{" "}
              {item.verified ? "verified" : "pending review"}
            </p>
            <p>
              <VerifiedUserOutlined /> Seller identity verified
            </p>
            <p>
              <ShieldOutlined /> Physical authentication after purchase
            </p>
          </div>
          <p className={common.subtle}>
            Atlas Verified covers the checks shown above. Physical
            authentication happens before settlement.
          </p>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <h3>Collectible details</h3>
        </AccordionSummary>
        <AccordionDetails>
          {Object.entries(item.attributes).map(([k, v]) => (
            <div className={common.spec} key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <h3>Meet the seller</h3>
        </AccordionSummary>
        <AccordionDetails>
          <b>{item.seller} · Private collector</b>
          <p>4.9 rating · 27 completed transactions · Member since 2024</p>
          <Verified />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
