import s from "./Protection.module.scss";
import { ShieldOutlined } from "@mui/icons-material";

export function Protection() {
  return (
    <div className={s.protection}>
      <ShieldOutlined />
      <div>
        <b>Atlas Protected</b>
        <p>
          Secured payment · Authentication before settlement · Tracked
          fulfilment · 48-hour inspection
        </p>
      </div>
    </div>
  );
}
