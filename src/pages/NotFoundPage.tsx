import common from "../styles/common.module.scss";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";

export default function NotFoundPage() {
  return (
    <div className={common.empty}>
      <h1>This page is outside the collection.</h1>
      <Button component={Link} to="/">
        Return home
      </Button>
    </div>
  );
}
