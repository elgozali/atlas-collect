import { ErrorBoundary } from "../components/ErrorBoundary";
import { RouteEffects } from "./RouteEffects";
import { lazy, Suspense } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { Loading } from "../components/Loading";

const Home = lazy(() => import("../features/discovery/Home"));
const Browse = lazy(() => import("../features/discovery/Browse"));
const Listing = lazy(() => import("../features/listings/ListingPage"));
const Auction = lazy(() => import("../features/auctions/AuctionPage"));
const Wizard = lazy(() => import("../features/seller/Wizard"));
const Seller = lazy(() => import("../features/seller/Dashboard"));
const Checkout = lazy(() => import("../features/transactions/Checkout"));
const Timeline = lazy(() => import("../features/transactions/Timeline"));
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
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>This page is outside the collection.</h1>
                  <Button component={Link} to="/">
                    Return home
                  </Button>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
