import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { ArrowForward, Close } from "@mui/icons-material";
import type { Listing } from "../features/listings/types";
import { money } from "../utils/formatters";

export function Valuation({ item }: { item: Listing }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="valuation">
        <div className="row">
          <span>Atlas Estimated Value</span>
          <span className="confidence">HIGH CONFIDENCE</span>
        </div>
        <h3>
          {money(item.low)} <span>–</span> {item.high.toLocaleString("en-US")}
        </h3>
        <div className="range">
          <div className="range-band" />
          <div className="range-marker" />
        </div>
        <div className="row muted">
          <span>Estimated range</span>
          <span>Asking {money(item.price)}</span>
        </div>
        <p>
          Based on 8 comparable sales. An estimate, not a guarantee of resale
          value.
        </p>
        <Button
          size="small"
          onClick={() => setOpen(true)}
          endIcon={<ArrowForward />}
        >
          View comparables
        </Button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          Evidence behind the estimate
          <IconButton
            className="dialog-close"
            aria-label="Close comparables"
            onClick={() => setOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="subtle">
            Illustrative comparable transactions, normalized for condition and
            provenance.
          </p>
          {[item.low, item.high - 1000, item.high].map((n, i) => (
            <div className="data-row" key={i}>
              <div>
                <b>{item.title}</b>
                <p>
                  Comparable sale · {["12 Sep", "20 Sep", "28 Sep"][i]} 2026
                </p>
              </div>
              <b>{money(n)}</b>
            </div>
          ))}
          <p>
            Condition, completeness and market liquidity can move the final
            price. Sample data is used in this prototype.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
