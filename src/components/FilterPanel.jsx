import { useState } from "react";
import Icon from "./Icon";

function FilterMenu({ label, value, open, onToggle, children, menuLabel }) {
  return (
    <div className={`directory-filter-control ${open ? "is-open" : ""}`}>
      <button type="button" className="directory-filter-trigger" onClick={onToggle} aria-expanded={open} aria-haspopup="listbox"><span><small>{label}</small><strong>{value}</strong></span><Icon name={open ? "close" : "chevron"} size={13} /></button>
      {open && <div className="directory-filter-menu" role="listbox" aria-label={menuLabel}>{children}</div>}
    </div>
  );
}

export default function FilterPanel({ categories, counts, activeCategory, setActiveCategory, stacks, stackFilter, setStackFilter, sortBy, setSortBy, sortOptions, clearFilters, hasActiveFilters, activeFilterCount, resultCount, categoryLabel, recent, onVisit }) {
  const [openMenu, setOpenMenu] = useState(null);
  const totalCount = counts.all || Object.values(counts).reduce((sum, value) => Math.max(sum, value), 0);
  const toggleMenu = menu => setOpenMenu(current => current === menu ? null : menu);
  const closeMenu = () => setOpenMenu(null);
  const selectedSort = sortOptions.find(option => option.id === sortBy)?.label || "Featured";
  const selectedTechnology = stackFilter === "all" ? "All technologies" : stackFilter;

  return (
    <div className="directory-filter-panel">
      <div className="directory-filter-panel-head"><div><p className="directory-eyebrow">FILTERS</p><h2>Refine results</h2></div><span className="directory-filter-count">{activeFilterCount} active</span></div>
      <div className="directory-filter-list">
        <FilterMenu label="Category" value={activeCategory === "all" ? "All categories" : categoryLabel} open={openMenu === "category"} onToggle={() => toggleMenu("category")} menuLabel="Filter by category">
          {categories.map(category => <button type="button" role="option" aria-selected={activeCategory === category.id} className={activeCategory === category.id ? "is-selected" : ""} key={category.id} onClick={() => { setActiveCategory(category.id); closeMenu(); }}><span>{category.label}</span><small>{category.id === "all" ? totalCount : counts[category.id] || 0}</small></button>)}
        </FilterMenu>
        <FilterMenu label="Technology" value={selectedTechnology} open={openMenu === "technology"} onToggle={() => toggleMenu("technology")} menuLabel="Filter by technology">
          {stacks.map(stack => <button type="button" role="option" aria-selected={stackFilter === stack} className={stackFilter === stack ? "is-selected" : ""} key={stack} onClick={() => { setStackFilter(stack); closeMenu(); }}><span>{stack === "all" ? "All technologies" : stack}</span></button>)}
        </FilterMenu>
        <FilterMenu label="Order" value={selectedSort} open={openMenu === "sort"} onToggle={() => toggleMenu("sort")} menuLabel="Sort resources">
          {sortOptions.map(option => <button type="button" role="option" aria-selected={sortBy === option.id} className={sortBy === option.id ? "is-selected" : ""} key={option.id} onClick={() => { setSortBy(option.id); closeMenu(); }}><span>{option.label}</span></button>)}
        </FilterMenu>
      </div>
      <div className="directory-filter-summary" aria-live="polite"><strong>{resultCount}</strong><span>resources match your current view.</span></div>
      <div className="directory-filter-actions"><button type="button" className="directory-reset-button" onClick={() => { clearFilters(); closeMenu(); }} disabled={!hasActiveFilters}><Icon name="close" size={13} /> Reset filters</button><button type="button" className="directory-recent-button" onClick={() => toggleMenu("recent")} aria-expanded={openMenu === "recent"}><Icon name="history" size={13} /> Recent</button></div>
      {openMenu === "recent" && <div className="directory-recent-menu" role="dialog" aria-label="Recently visited resources">{recent.length ? recent.map(resource => <a key={resource.id} href={`https://${resource.url}`} target="_blank" rel="noopener noreferrer" onClick={() => { onVisit(resource); closeMenu(); }}><span>{resource.name}</span><Icon name="arrow" size={11} /></a>) : <p>No recently visited resources.</p>}</div>}
    </div>
  );
}
