import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import {
  ExpandMore,
  VerifiedUserOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import type { Listing } from "../features/listings/types";
import { Verified } from "./Verified";

export function TrustDetails({ item }: { item: Listing }) {
  return (
    <div className="trust-details">
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <h3>Authentication & provenance</h3>
        </AccordionSummary>
        <AccordionDetails>
          <div className="trust-checks">
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
          <p className="subtle">
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
            <div className="spec" key={k}>
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
