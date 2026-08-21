import { useState } from "react";
import Icon from "./Icon";

export default function FilterPanel({ categories, counts, activeCategory, setActiveCategory, stacks, stackFilter, setStackFilter, sortBy, setSortBy, sortOptions, clearFilters, hasActiveFilters, activeFilterCount, resultCount, categoryLabel, recent, onVisit, viewMode, setViewMode }) {
  const [openMenu, setOpenMenu] = useState(null);
  const totalCount = Object.values(counts).reduce((sum, value) => Math.max(sum, value), 0);
  const activeCategoryName = categoryLabel === "All categories" ? "All categories" : categoryLabel;
  const toggleMenu = menu => setOpenMenu(current => current === menu ? null : menu);
  const closeMenu = () => setOpenMenu(null);
  const triggerIcon = menu => <Icon name={openMenu === menu ? "close" : "chevron"} size={12} />;

  return (
    <section className="quick-access-panel" aria-labelledby="quick-access-title">
      <div className="quick-access-row">
        <div className="quick-access-heading">
          <h2 id="quick-access-title">Filter resources</h2>
        </div>

        <div className="filter-control-group">
          <div className={`filter-popover ${openMenu === "topic" ? "is-open" : ""}`}>
            <button type="button" className="filter-trigger" onClick={() => toggleMenu("topic")} aria-expanded={openMenu === "topic"} aria-haspopup="listbox"><span>Category</span>{triggerIcon("topic")}</button>
            {openMenu === "topic" && <div className="filter-popover-menu" role="listbox" aria-label="Filter by category">
              {categories.map(category => <button type="button" role="option" aria-selected={activeCategory === category.id} className={`filter-option-button ${activeCategory === category.id ? "selected" : ""}`} key={category.id} onClick={() => { setActiveCategory(category.id); closeMenu(); }}>{category.label}<span>{category.id === "all" ? totalCount : counts[category.id] || 0}</span></button>)}
            </div>}
          </div>

          <div className={`filter-popover ${openMenu === "framework" ? "is-open" : ""}`}>
            <button type="button" className="filter-trigger" onClick={() => toggleMenu("framework")} aria-expanded={openMenu === "framework"} aria-haspopup="listbox"><span>Technology</span>{triggerIcon("framework")}</button>
            {openMenu === "framework" && <div className="filter-popover-menu framework-menu" role="listbox" aria-label="Filter by technology">
              {stacks.map(stack => <button type="button" role="option" aria-selected={stackFilter === stack} key={stack} className={`quick-access-chip ${stackFilter === stack ? "selected" : ""}`} onClick={() => { setStackFilter(stack); closeMenu(); }}>{stack === "all" ? "All technologies" : stack}</button>)}
            </div>}
          </div>

          <div className={`filter-popover ${openMenu === "sort" ? "is-open" : ""}`}>
            <button type="button" className="filter-trigger" onClick={() => toggleMenu("sort")} aria-expanded={openMenu === "sort"} aria-haspopup="listbox"><span>Sort resources</span>{triggerIcon("sort")}</button>
            {openMenu === "sort" && <div className="filter-popover-menu sort-menu" role="listbox" aria-label="Sort resources">
              {sortOptions.map(option => <button type="button" role="option" aria-selected={sortBy === option.id} className={`filter-option-button ${sortBy === option.id ? "selected" : ""}`} key={option.id} onClick={() => { setSortBy(option.id); closeMenu(); }}>{option.label}</button>)}
            </div>}
          </div>

          <div className={`filter-popover recent-popover ${openMenu === "recent" ? "is-open" : ""}`}>
            <button type="button" className="filter-trigger recent-trigger" onClick={() => toggleMenu("recent")} aria-expanded={openMenu === "recent"} aria-haspopup="dialog"><Icon name="history" size={14} /><span>Recently viewed</span></button>
            {openMenu === "recent" && <div className="filter-popover-menu recent-menu" role="dialog" aria-label="Recently viewed resources">
              <div className="recent-menu-heading"><strong>Recently viewed</strong><span>{recent.length ? `${recent.length} visited` : "No recent visits"}</span></div>
              {recent.length ? recent.map(resource => <a className="recent-popover-card" key={resource.id} href={`https://${resource.url}`} target="_blank" rel="noopener noreferrer" onClick={() => { onVisit(resource); closeMenu(); }}><span className="recent-popover-orbit">{resource.name.slice(0, 1)}</span><span><strong>{resource.name}</strong><small>{resource.url}</small></span><Icon name="arrow" size={11} /></a>) : <p className="recent-empty">Visit a resource and it will appear here.</p>}
            </div>}
          </div>
        </div>

        <div className="filter-row-summary" aria-live="polite">
          <span className="filter-summary-rule" aria-hidden="true" />
          <span className="filter-summary-copy"><strong>{activeCategoryName}</strong><small>{resultCount} resources {hasActiveFilters ? `· ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} applied` : "· showing all resources"}</small></span>
        </div>

        <div className="filter-actions">
          <div className="view-toggle" aria-label="Change resource layout"><button type="button" className={viewMode === "list" ? "active" : ""} aria-label="List view" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}><Icon name="list" size={14} /></button><button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Grid view" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><Icon name="grid" size={14} /></button></div>
          <button type="button" className="quick-access-clear" onClick={() => { clearFilters(); closeMenu(); }} disabled={!hasActiveFilters}><Icon name="trash" size={13} /><span>Clear filters</span></button>
        </div>
      </div>
    </section>
  );
}
