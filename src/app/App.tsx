import {
  lazy,
  Suspense,
  useEffect,
  useState,
  Component,
  type ReactNode,
} from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Drawer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Badge,
  Alert,
} from "@mui/material";
import {
  Search,
  NotificationsNone,
  PersonOutline,
  Menu,
  Close,
  ArrowForward,
} from "@mui/icons-material";
import { api } from "../mocks/api";
import { queryClient } from "./query";
import { Loading } from "../components/Domain";
import { date } from "../shared/hooks";
import { useUI } from "../shared/store";
const Home = lazy(() => import("../features/discovery/Home"));
const Browse = lazy(() => import("../features/discovery/Browse"));
const Listing = lazy(() => import("../features/listings/ListingPage"));
const Auction = lazy(() => import("../features/auctions/AuctionPage"));
const Wizard = lazy(() => import("../features/seller/Wizard"));
const Seller = lazy(() => import("../features/seller/Dashboard"));
const Checkout = lazy(() => import("../features/transactions/Checkout"));
const Timeline = lazy(() => import("../features/transactions/Timeline"));
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="empty">
        <h1>Let’s try that again.</h1>
        <p>This page could not be displayed.</p>
        <Button onClick={() => window.location.reload()}>
          Reload the prototype
        </Button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function RouteEffects() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Atlas Collect | ${location.pathname === "/" ? "Objects worth collecting" : location.pathname.includes("auction") ? "Live auction" : location.pathname.includes("sell") ? "Seller studio" : location.pathname.includes("transaction") ? "Protected transaction" : "The collection"}`;
  }, [location.pathname]);
  return null;
}
export default function App() {
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [search, setSearch] = useState(false);
  const [term, setTerm] = useState("");
  const [reset, setReset] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(
    () =>
      api.subscribe((e) => {
        if (e.auction) {
          queryClient.invalidateQueries({ queryKey: ["listings"] });
          queryClient.invalidateQueries({ queryKey: ["listing", e.entityId] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      }),
    [],
  );
  const notes = useQuery({
    queryKey: ["notifications"],
    queryFn: api.getNotifications,
    refetchInterval: 5000,
  });
  useEffect(() => {
    setMenu(false);
  }, [location.pathname, location.search]);
  const nav = (
    <>
      <NavLink to="/marketplace">Marketplace</NavLink>
      <Link to="/marketplace?category=watches">Watches</Link>
      <Link to="/marketplace?category=cards">Trading cards</Link>
      <NavLink to="/sell">Sell</NavLink>
    </>
  );
  return (
    <>
      <RouteEffects />
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById("main");
          main?.focus();
          main?.scrollIntoView();
        }}
      >
        Skip to content
      </a>
      <div className="demo-banner">
        An interactive concept. Sample collectibles, simulated transactions, no
        real money.
      </div>
      <header className="site-header">
        <Link to="/" className="wordmark" aria-label="Atlas Collect home">
          <span>ATLAS</span>
          <small>COLLECT</small>
        </Link>
        <nav aria-label="Main navigation">{nav}</nav>
        <div className="header-actions">
          <IconButton aria-label="Search" onClick={() => setSearch(true)}>
            <Search />
          </IconButton>
          <IconButton
            aria-label="Notifications"
            onClick={() => setNotifications(true)}
          >
            <Badge badgeContent={notes.data?.length || 0} color="primary">
              <NotificationsNone />
            </Badge>
          </IconButton>
          <IconButton component={Link} to="/seller" aria-label="Seller account">
            <PersonOutline />
          </IconButton>
          <IconButton
            className="menu-toggle"
            aria-label="Open navigation"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </IconButton>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="main-shell">
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
      </main>
      <footer>
        <Link to="/" className="footer-brand">
          ATLAS COLLECT
        </Link>
        <p>Authenticated collectibles. Transparent value. Confident trading.</p>
        <div>
          <span>© 2026 Atlas Collect · Interactive prototype</span>
          <Button size="small" onClick={() => setReset(true)}>
            Reset demo
          </Button>
        </div>
      </footer>
      <Drawer anchor="right" open={menu} onClose={() => setMenu(false)}>
        <div className="mobile-nav">
          <IconButton
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          >
            <Close />
          </IconButton>
          {nav}
          <Link to="/seller">Seller studio</Link>
        </div>
      </Drawer>
      <Drawer
        anchor="right"
        open={notifications}
        onClose={() => setNotifications(false)}
      >
        <div className="notification-drawer">
          <div className="row">
            <h2>Your updates</h2>
            <IconButton
              aria-label="Close notifications"
              onClick={() => setNotifications(false)}
            >
              <Close />
            </IconButton>
          </div>
          {notes.data?.length ? (
            notes.data.map((n) => (
              <Link
                key={n.id}
                to={n.link}
                onClick={() => setNotifications(false)}
              >
                <b>{n.title}</b>
                <p>{date(n.at)} GST</p>
                <ArrowForward />
              </Link>
            ))
          ) : (
            <p>
              Offers, bids and transaction updates will appear here as you
              explore.
            </p>
          )}
        </div>
      </Drawer>
      <Dialog open={search} onClose={() => setSearch(false)} fullWidth>
        <DialogTitle>Find something exceptional.</DialogTitle>
        <DialogContent>
          <form
            className="search-dialog"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/marketplace?q=${encodeURIComponent(term)}`);
              setSearch(false);
            }}
          >
            <TextField
              autoFocus
              label="Search watches or trading cards"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <Button variant="contained" type="submit">
              Search
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={reset} onClose={() => setReset(false)}>
        <DialogTitle>Start the demo again?</DialogTitle>
        <DialogContent>
          <p>
            This clears sample purchases, offers, bids, listings and your saved
            selections in this browser.
          </p>
          <Alert severity="info">Only prototype data is affected.</Alert>
          <div className="dialog-actions">
            <Button
              variant="contained"
              onClick={() => {
                api.reset();
                useUI.getState().clear();
                sessionStorage.removeItem("atlas-draft-v1");
                queryClient.clear();
                setReset(false);
                navigate("/");
              }}
            >
              Reset demo
            </Button>
            <Button onClick={() => setReset(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
