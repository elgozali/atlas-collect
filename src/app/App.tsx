import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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
  PersonOutlined,
  Menu,
  Close,
  ArrowForward,
} from "@mui/icons-material";
import { subscribeToMarketplace } from "../shared/realtime/service";
import { resetDemo } from "./demo";
import { useNotifications } from "../features/notifications/hooks";
import { AppRouter } from "../router/AppRouter";
import { queryClient } from "./query";
import { date } from "../shared/formatters";
import { useUI } from "../shared/store";

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
      subscribeToMarketplace((e) => {
        if (e.auction) {
          queryClient.invalidateQueries({ queryKey: ["listings"] });
          queryClient.invalidateQueries({ queryKey: ["listing", e.entityId] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      }),
    [],
  );
  const notes = useNotifications();
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
            <PersonOutlined />
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
        <AppRouter />
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
                resetDemo();
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
