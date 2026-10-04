import { Drawer, IconButton } from "@mui/material";
import { ArrowForward, Close } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useNotifications } from "../hooks";
import { date } from "../../../utils/formatters";
import styles from "../notifications.module.scss";

export function NotificationsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const notes = useNotifications();
  return (
    <Drawer
      className={styles.root}
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <div className="notification-drawer">
        <div className="row">
          <h2>Your updates</h2>
          <IconButton aria-label="Close notifications" onClick={onClose}>
            <Close />
          </IconButton>
        </div>
        {notes.data?.length ? (
          notes.data.map((n) => (
            <Link key={n.id} to={n.link} onClick={onClose}>
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
  );
}
