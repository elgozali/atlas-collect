import s from "./Checkout.module.scss";
import featureStyles from "../../transaction.module.scss";
import common from "../../../../styles/common.module.scss";
import type { CheckoutValues } from "../../types/CheckoutValues";
import { useTransaction } from "../../hooks/useTransaction";
import { usePayment } from "../../hooks/usePayment";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  CheckCircleOutlined,
  LockOutlined,
  ArrowForward,
} from "@mui/icons-material";
import { asset, money } from "../../../../utils/formatters";
import { PageHeading } from "../../../../components/PageHeading/PageHeading";
import { Loading } from "../../../../components/Loading/Loading";
import { ErrorPanel } from "../../../../components/ErrorPanel/ErrorPanel";
import { Protection } from "../../../../components/Protection/Protection";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  address: z.string().trim().min(8, "Enter your delivery address."),
  city: z.string().trim().min(2, "Enter a city."),
  consent: z.boolean().refine((v) => v, "Please confirm the purchase terms."),
});

export default function Checkout() {
  const { id = "" } = useParams();
  const q = useTransaction(id);
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", address: "", city: "Dubai", consent: false },
  });
  const pay = usePayment(id);
  if (q.isPending)
    return (
      <div className={s.root}>
        <Loading />
      </div>
    );
  if (q.isError)
    return (
      <div className={s.root}>
        <ErrorPanel error={q.error} retry={() => q.refetch()} />
      </div>
    );
  const t = q.data;
  const fee = Math.round(t.agreedPrice * 0.015);
  if (t.status !== "payment_pending")
    return (
      <div className={s.root}>
        <div className={featureStyles.confirmation}>
          <CheckCircleOutlined />
          <p className={common.eyebrow}>PAYMENT SECURED</p>
          <h1>A new chapter for your collection.</h1>
          <p>
            Your transaction {t.id} has started.
            <br />
            Your funds stay protected through authentication and inspection.
          </p>
          <Button
            variant="contained"
            component={Link}
            to={`/transactions/${id}`}
            endIcon={<ArrowForward />}
          >
            Track your collectible
          </Button>
        </div>
      </div>
    );
  return (
    <div className={s.root}>
      <PageHeading
        title="Complete your purchase."
        description="One clear commitment. Protection at every step."
      />
      <div className={featureStyles.checkoutLayout}>
        <form
          className={featureStyles.checkoutForm}
          onSubmit={form.handleSubmit((v) => pay.mutate(v))}
        >
          <h2>Delivery details</h2>
          <p>Use sample information for this demonstration.</p>
          <TextField
            label="Full name"
            autoComplete="name"
            {...form.register("name")}
            error={!!form.formState.errors.name}
            helperText={form.formState.errors.name?.message}
          />
          <TextField
            label="Delivery address"
            autoComplete="street-address"
            {...form.register("address")}
            error={!!form.formState.errors.address}
            helperText={form.formState.errors.address?.message}
          />
          <TextField
            label="City"
            autoComplete="address-level2"
            {...form.register("city")}
            error={!!form.formState.errors.city}
            helperText={form.formState.errors.city?.message}
          />
          <h2 className={common.subsectionHeading}>Secure payment</h2>
          <div className={featureStyles.paymentProvider}>
            <LockOutlined />
            <div>
              <b>External payment provider</b>
              <p>
                Payment details are handled by a secure provider in production.
                This demo does not collect card information.
              </p>
            </div>
          </div>
          <FormControlLabel
            control={<Checkbox {...form.register("consent")} />}
            label="I agree to the purchase terms and 48-hour inspection period."
          />
          {form.formState.errors.consent && (
            <Alert severity="error">
              {form.formState.errors.consent.message}
            </Alert>
          )}
          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={pay.isPending}
            startIcon={<LockOutlined />}
          >
            {pay.isPending
              ? "Securing payment…"
              : `Simulate secure payment · ${money(t.agreedPrice + fee + 150)}`}
          </Button>
          {pay.error && <Alert severity="error">{pay.error.message}</Alert>}
        </form>
        <aside className={featureStyles.orderSummary}>
          <div className={featureStyles.orderItem}>
            <img src={asset(t.listing.image)} alt={t.listing.title} />
            <h3>{t.listing.title}</h3>
            <p>{t.listing.subtitle}</p>
          </div>
          <div className={common.spec}>
            <span>Agreed price</span>
            <b>{money(t.agreedPrice)}</b>
          </div>
          <div className={common.spec}>
            <span>Buyer protection (1.5%)</span>
            <b>{money(fee)}</b>
          </div>
          <div className={common.spec}>
            <span>Insured shipping</span>
            <b>AED 150</b>
          </div>
          <div className={featureStyles.total}>
            <span>Total</span>
            <b>{money(t.agreedPrice + fee + 150)}</b>
          </div>
          <p className={common.subtle}>Illustrative fees for this prototype.</p>
          <Protection />
        </aside>
      </div>
    </div>
  );
}
