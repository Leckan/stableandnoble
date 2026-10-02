"use client";

import { useMemo, useState } from "react";
import { PropertyGrid } from "@/components/property-list";
import type { PublicProperty } from "@/lib/properties";

const pageSize = 9;

export function PropertyCatalog({ properties }: { properties: PublicProperty[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [strategy, setStrategy] = useState("all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const types = useMemo(() => [...new Set(properties.map(item => item.property_type))].sort(), [properties]);
  const strategies = useMemo(() => [...new Set(properties.map(item => item.strategy).filter((item): item is string => Boolean(item)))].sort(), [properties]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return properties.filter(item => {
      const matchesQuery = !term || `${item.title} ${item.city} ${item.state} ${item.property_type} ${item.strategy || ""}`.toLowerCase().includes(term);
      return matchesQuery && (type === "all" || item.property_type === type) && (strategy === "all" || item.strategy === strategy) && (status === "all" || item.status === status);
    });
  }, [properties, query, type, strategy, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function update(setter: (value: string) => void) { return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setter(event.target.value); setPage(1); }; }

  return <>
    <div className="catalog-controls">
      <label className="catalog-search">Search properties<input type="search" value={query} onChange={update(setQuery)} placeholder="City, property, strategy…" /></label>
      <label>Type<select value={type} onChange={update(setType)}><option value="all">All property types</option>{types.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Strategy<select value={strategy} onChange={update(setStrategy)}><option value="all">All strategies</option>{strategies.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Status<select value={status} onChange={update(setStatus)}><option value="all">All statuses</option>{[...new Set(properties.map(item => item.status))].sort().map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
      <div className="catalog-view" role="group" aria-label="Property view"><button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")}>Grid</button><button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>List</button></div>
    </div>
    <p className="catalog-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "property" : "properties"}</p>
    {visible.length ? <div className={view === "list" ? "property-catalog-list" : ""}><PropertyGrid properties={visible} /></div> : <div className="portfolio-empty portfolio-page-empty"><div className="empty-number">S&N / SEARCH</div><div><h3>No matching properties.</h3><p>Try adjusting your search or filters, or contact Stable & Noble about a property opportunity.</p></div></div>}
    {pages > 1 && <nav className="catalog-pagination" aria-label="Property pages"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>← Previous</button><span>Page {currentPage} of {pages}</span><button type="button" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next →</button></nav>}
  </>;
}
