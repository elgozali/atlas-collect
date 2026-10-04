import styles from "../discovery.module.scss";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Close, Search, CompareArrows, FilterList } from "@mui/icons-material";
import { PageHeading } from "../../../components/PageHeading";
import { CollectibleCard } from "../../../components/CollectibleCard";
import { Loading } from "../../../components/Loading";
import { ErrorPanel } from "../../../components/ErrorPanel";
import { useListings } from "../../listings/hooks";
import { money } from "../../../utils/formatters";
import { useUI } from "../../../shared/store";

export default function MarketplaceBrowse() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const search = params.get("q") || "";
  const [brand, setBrand] = useState("all");
  const [max, setMax] = useState("all");
  const [grade, setGrade] = useState("all");
  const [sort, setSort] = useState("curated");
  const [savedOnly, setSavedOnly] = useState(false);
  const [filters, setFilters] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const saved = useUI((s) => s.saved);
  const compare = useUI((s) => s.compare);
  const toggleCompare = useUI((s) => s.toggleCompare);
  const q = useListings();
  const items = (q.data || [])
    .filter(
      (i) =>
        i.status !== "review" &&
        (category === "all" || i.category === category) &&
        (brand === "all" || i.brand === brand) &&
        (max === "all" || i.price <= Number(max)) &&
        (grade === "all" || i.grade === grade) &&
        (!savedOnly || saved.includes(i.id)) &&
        `${i.title} ${i.subtitle}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : 0,
    );
  const changeCategory = (v: string) => {
    setBrand("all");
    setGrade("all");
    setParams({ ...Object.fromEntries(params), category: v });
  };
  const filterContent = (
    <>
      <h3>Refine your collection</h3>
      <TextField
        select
        label={category === "cards" ? "Franchise" : "Brand"}
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
      >
        <MenuItem value="all">
          All {category === "cards" ? "franchises" : "brands"}
        </MenuItem>
        {(category === "cards"
          ? ["Pokémon"]
          : category === "watches"
            ? ["Rolex", "Omega"]
            : ["Rolex", "Omega", "Pokémon"]
        ).map((b) => (
          <MenuItem key={b} value={b}>
            {b}
          </MenuItem>
        ))}
      </TextField>
      {category === "cards" ? (
        <TextField
          select
          label="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          <MenuItem value="all">All grades</MenuItem>
          <MenuItem value="9">PSA 9 · Mint</MenuItem>
          <MenuItem value="8">PSA 8 · Near Mint</MenuItem>
        </TextField>
      ) : (
        <div className="filter-note">
          Condition
          <br />
          <b>Excellent · Full set</b>
          <p>All current watches include box and papers.</p>
        </div>
      )}
      <TextField
        select
        label="Maximum price"
        value={max}
        onChange={(e) => setMax(e.target.value)}
      >
        <MenuItem value="all">Any price</MenuItem>
        {[10000, 25000, 50000].map((n) => (
          <MenuItem key={n} value={String(n)}>
            {money(n)}
          </MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        control={
          <Checkbox
            checked={savedOnly}
            onChange={(e) => setSavedOnly(e.target.checked)}
          />
        }
        label="My watchlist"
      />
      <Button
        onClick={() => {
          setBrand("all");
          setMax("all");
          setGrade("all");
          setSavedOnly(false);
          setParams({ category });
        }}
      >
        Clear filters
      </Button>
    </>
  );
  return (
    <div className={styles.root}>
      <PageHeading
        title="Find your next collectible."
        description="Exceptional objects, with the context to collect confidently."
        eyebrow="THE MARKETPLACE"
      />
      <div className="browse-top">
        <ToggleButtonGroup
          value={category}
          exclusive
          onChange={(_, v) => v && changeCategory(v)}
          aria-label="Category"
        >
          <ToggleButton value="all">All collectibles</ToggleButton>
          <ToggleButton value="watches">Luxury watches</ToggleButton>
          <ToggleButton value="cards">Trading cards</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          size="small"
          label="Search collectibles"
          value={search}
          onChange={(e) =>
            setParams({ ...Object.fromEntries(params), q: e.target.value })
          }
          slotProps={{ input: { endAdornment: <Search /> } }}
        />
      </div>
      <div className="browse-layout">
        <aside className="filters">{filterContent}</aside>
        <div>
          <div className="browse-results">
            <span>{items.length} collectibles</span>
            <Button
              className="mobile-filter"
              onClick={() => setFilters(true)}
              startIcon={<FilterList />}
            >
              Filters
            </Button>
            <TextField
              size="small"
              select
              label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <MenuItem value="curated">Atlas curated</MenuItem>
              <MenuItem value="low">Price: low to high</MenuItem>
              <MenuItem value="high">Price: high to low</MenuItem>
            </TextField>
          </div>
          {q.isPending ? (
            <Loading />
          ) : q.isError ? (
            <ErrorPanel error={q.error} retry={() => q.refetch()} />
          ) : items.length ? (
            <div className="browse-grid">
              {items.map((i) => (
                <div key={i.id}>
                  <CollectibleCard item={i} />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={compare.includes(i.id)}
                        disabled={
                          !compare.includes(i.id) && compare.length >= 3
                        }
                        onChange={() => toggleCompare(i.id)}
                      />
                    }
                    label="Compare"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <Search />
              <h2>No collectibles found</h2>
              <p>Try a different search or clear your filters.</p>
              <Button
                onClick={() => {
                  setBrand("all");
                  setGrade("all");
                  setMax("all");
                  setSavedOnly(false);
                  setParams({ category: "all" });
                }}
              >
                Reset discovery
              </Button>
            </div>
          )}
        </div>
      </div>
      {compare.length > 0 && (
        <div className="compare-tray">
          <span>{compare.length} selected</span>
          <Button
            startIcon={<CompareArrows />}
            variant="contained"
            onClick={() => setCompareOpen(true)}
          >
            Compare collectibles
          </Button>
        </div>
      )}
      <Dialog
        className={styles.root}
        open={filters}
        onClose={() => setFilters(false)}
        fullWidth
      >
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <div className="filter-stack">
            {filterContent}
            <Button variant="contained" onClick={() => setFilters(false)}>
              Show results
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        className={styles.root}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Compare your collection
          <IconButton
            className="dialog-close"
            aria-label="Close comparison"
            onClick={() => setCompareOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="comparison">
            {q.data
              ?.filter((i) => compare.includes(i.id))
              .map((i) => (
                <div key={i.id}>
                  <h3>{i.title}</h3>
                  <p>{i.subtitle}</p>
                  <b>{money(i.price)}</b>
                  <p>
                    Estimate {money(i.low)} – {i.high.toLocaleString()}
                  </p>
                  <p>
                    {i.verified
                      ? "Documentation verified"
                      : "Verification pending"}
                  </p>
                  <p>{i.sale === "auction" ? "Live auction" : "Fixed price"}</p>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
