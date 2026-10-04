import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../../mocks/api";
import { money, useOffers } from "../../shared/hooks";
import type { Listing, Offer } from "../../shared/types";
export function OfferDialog({
  item,
  open,
  onClose,
}: {
  item: Listing;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const client = useQueryClient();
  const offers = useOffers();
  const current = offers.data?.find(
    (o) =>
      o.listingId === item.id &&
      o.buyer === "You" &&
      ["pending", "countered"].includes(o.status),
  );
  const [editing, setEditing] = useState(false);
  const schema = z.object({
    amount: z
      .number()
      .int("Use a whole AED amount.")
      .positive("Enter a positive amount.")
      .max(item.price - 1, "Offer must be below the asking price."),
  });
  const form = useForm<{ amount: number }>({
    resolver: zodResolver(schema),
    defaultValues: { amount: Math.round((item.price * 0.91) / 500) * 500 },
  });
  const refresh = () => client.invalidateQueries({ queryKey: ["offers"] });
  const submit = useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (current && editing)
        return (
          await api.offerAction(
            current.id,
            current.version,
            "counter",
            amount,
            "buyer",
          )
        ).offer;
      return api.offer(item.id, amount);
    },
    onSuccess: () => {
      setEditing(false);
      refresh();
    },
  });
  const action = useMutation({
    mutationFn: ({
      offer,
      type,
    }: {
      offer: Offer;
      type: "accept" | "reject";
    }) => api.offerAction(offer.id, offer.version, type),
    onSuccess: (r) => {
      refresh();
      client.invalidateQueries({ queryKey: ["listings"] });
      if (r.transaction) navigate(`/checkout/${r.transaction.id}`);
    },
  });
  useEffect(() => {
    if (!open || !current || current.status !== "pending") return;
    const timer = setTimeout(() => {
      api
        .offerAction(
          current.id,
          current.version,
          "counter",
          Math.min(
            item.price - 500,
            Math.max(
              current.amount,
              Math.round((item.price * 0.9565) / 500) * 500,
            ),
          ),
        )
        .then(refresh)
        .catch(() => refresh());
    }, 2200);
    return () => clearTimeout(timer);
  }, [open, current?.id, current?.version]);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {current?.status === "countered" && !editing
          ? "A counteroffer from the seller"
          : "Make an offer"}
        <IconButton
          className="dialog-close"
          aria-label="Close offer"
          onClick={onClose}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <p>
          {item.title} · Asking {money(item.price)}
        </p>
        {current && !editing ? (
          <>
            <div className="offer-value">
              <span>
                {current.status === "pending"
                  ? "Your offer"
                  : "Seller counteroffer"}
              </span>
              <h2>{money(current.amount)}</h2>
            </div>
            <Alert severity={current.status === "pending" ? "info" : "success"}>
              {current.status === "pending"
                ? "Offer submitted. Waiting for a simulated seller response…"
                : "The seller is ready to proceed at this price. Offer expires in 24 hours."}
            </Alert>
            {current.status === "countered" && (
              <div className="dialog-actions">
                <Button
                  variant="contained"
                  disabled={action.isPending}
                  onClick={() =>
                    action.mutate({ offer: current, type: "accept" })
                  }
                >
                  Accept counteroffer
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    form.setValue("amount", current.amount - 500);
                    setEditing(true);
                  }}
                >
                  Counter again
                </Button>
                <Button
                  onClick={() =>
                    action.mutate({ offer: current, type: "reject" })
                  }
                >
                  Decline
                </Button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={form.handleSubmit((v) => submit.mutate(v))}>
            <TextField
              label="Your offer (AED)"
              type="number"
              {...form.register("amount", { valueAsNumber: true })}
              error={!!form.formState.errors.amount}
              helperText={
                form.formState.errors.amount?.message ||
                "A formal offer, separate from messaging."
              }
            />
            <div className="dialog-actions">
              <Button
                variant="contained"
                type="submit"
                disabled={submit.isPending}
              >
                {submit.isPending ? "Submitting…" : "Submit offer"}
              </Button>
            </div>
          </form>
        )}
        {(submit.error || action.error) && (
          <Alert severity="error">
            {(submit.error || action.error)?.message}
          </Alert>
        )}
        <p className="subtle">
          An accepted offer reserves the item. Payment and authentication follow
          through Atlas Protected.
        </p>
      </DialogContent>
    </Dialog>
  );
}
