import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function RouteEffects() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Atlas Collect | ${location.pathname === "/" ? "Objects worth collecting" : location.pathname.includes("auction") ? "Live auction" : location.pathname.includes("sell") ? "Seller studio" : location.pathname.includes("transaction") ? "Protected transaction" : "The collection"}`;
  }, [location.pathname]);
  return null;
}
