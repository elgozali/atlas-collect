import { Analytics } from "@vercel/analytics/react";
import { AppLayout } from "./layout/AppLayout";
import { AppRouter } from "../router/AppRouter";

export default function App() {
  return (
    <AppLayout>
      <AppRouter />
      <Analytics />
    </AppLayout>
  );
}
