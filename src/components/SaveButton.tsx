import { IconButton } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useUI } from "../shared/store";

export function SaveButton({ id }: { id: string }) {
  const saved = useUI((s) => s.saved.includes(id));
  const toggle = useUI((s) => s.toggleSaved);
  return (
    <IconButton
      aria-label={saved ? "Remove from watchlist" : "Save to watchlist"}
      aria-pressed={saved}
      onClick={() => toggle(id)}
    >
      {saved ? (
        <Favorite fontSize="small" />
      ) : (
        <FavoriteBorder fontSize="small" />
      )}
    </IconButton>
  );
}
