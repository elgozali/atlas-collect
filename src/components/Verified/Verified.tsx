import s from "./Verified.module.scss";
import { Chip } from "@mui/material";
import { VerifiedUserOutlined } from "@mui/icons-material";

export function Verified({ verified = true }: { verified?: boolean }) {
  return (
    <Chip
      className={s.root}
      icon={<VerifiedUserOutlined />}
      label={verified ? "Atlas Verified" : "Verification pending"}
      color={verified ? "success" : "warning"}
      variant="outlined"
      size="small"
    />
  );
}
