import NotFoundPage from "../pages/NotFoundPage";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { RouteEffects } from "./RouteEffects";
import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Loading } from "../components/Loading";

const Home = lazy(() => import("../features/discovery/pages/HomePage"));
const Browse = lazy(() => import("../features/discovery/pages/BrowsePage"));
const Listing = lazy(() => import("../features/listings/pages/ListingPage"));
const Auction = lazy(() => import("../features/auctions/pages/AuctionPage"));
const Wizard = lazy(() => import("../features/seller/pages/SellerListingPage"));
const Seller = lazy(
  () => import("../features/seller/pages/SellerDashboardPage"),
);
const Checkout = lazy(
  () => import("../features/transactions/pages/CheckoutPage"),
);
const Timeline = lazy(
  () => import("../features/transactions/pages/TransactionTimelinePage"),
);
export function AppRouter() {
  const location = useLocation();
  return (
    <>
      <RouteEffects />
      <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Browse />} />
            <Route path="/listings/:id" element={<Listing />} />
            <Route path="/auctions/:id" element={<Auction />} />
            <Route path="/sell" element={<Wizard />} />
            <Route path="/seller" element={<Seller />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/transactions/:id" element={<Timeline />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
