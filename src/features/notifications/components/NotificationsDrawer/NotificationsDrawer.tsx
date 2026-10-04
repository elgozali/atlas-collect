import s from "./NotificationsDrawer.module.scss";
import featureStyles from "../../notification.module.scss";
import common from "../../../../styles/common.module.scss";
import { Drawer, IconButton } from "@mui/material";
import { ArrowForward, Close } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { date } from "../../../../utils/formatters";

export function NotificationsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const notes = useNotifications();
  return (
    <Drawer className={s.root} anchor="right" open={open} onClose={onClose}>
      <div className={featureStyles.notificationDrawer}>
        <div className={common.row}>
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
