import { useState } from "react";
import Icon from "./Icon";

export default function FilterPanel({ categories, counts, activeCategory, setActiveCategory, stacks, stackFilter, setStackFilter, sortBy, setSortBy, sortOptions, clearFilters, hasActiveFilters, activeFilterCount, resultCount, recent, onVisit }) {
  const [openMenu, setOpenMenu] = useState(null);
  const totalCount = Object.values(counts).reduce((sum, value) => Math.max(sum, value), 0);
  const toggleMenu = menu => setOpenMenu(current => current === menu ? null : menu);
  const closeMenu = () => setOpenMenu(null);
  const triggerIcon = menu => <Icon name={openMenu === menu ? "close" : "chevron"} size={12} />;

  return (
    <section className="quick-access-panel" aria-labelledby="quick-access-title">
      <div className="quick-access-row">
        <div className="quick-access-heading">
          <h2 id="quick-access-title">Filters</h2>
        </div>

        <div className="filter-control-group">
          <div className={`filter-popover ${openMenu === "topic" ? "is-open" : ""}`}>
            <button type="button" className="filter-trigger" onClick={() => toggleMenu("topic")} aria-expanded={openMenu === "topic"} aria-haspopup="listbox"><span>Topic</span>{triggerIcon("topic")}</button>
            {openMenu === "topic" && <div className="filter-popover-menu" role="listbox" aria-label="Filter by topic">
              {categories.map(category => <button type="button" role="option" aria-selected={activeCategory === category.id} className={`filter-option-button ${activeCategory === category.id ? "selected" : ""}`} key={category.id} onClick={() => { setActiveCategory(category.id); closeMenu(); }}>{category.label}<span>{category.id === "all" ? totalCount : counts[category.id] || 0}</span></button>)}
            </div>}
          </div>

          <div className={`filter-popover ${openMenu === "framework" ? "is-open" : ""}`}>
            <button type="button" className="filter-trigger" onClick={() => toggleMenu("framework")} aria-expanded={openMenu === "framework"} aria-haspopup="listbox"><span>Built with</span>{triggerIcon("framework")}</button>
            {openMenu === "framework" && <div className="filter-popover-menu framework-menu" role="listbox" aria-label="Filter by framework">
              {stacks.map(stack => <button type="button" role="option" aria-selected={stackFilter === stack} key={stack} className={`quick-access-chip ${stackFilter === stack ? "selected" : ""}`} onClick={() => { setStackFilter(stack); closeMenu(); }}>{stack === "all" ? "Everything" : stack}</button>)}
            </div>}
          </div>

          <div className={`filter-popover ${openMenu === "sort" ? "is-open" : ""}`}>
            <button type="button" className="filter-trigger" onClick={() => toggleMenu("sort")} aria-expanded={openMenu === "sort"} aria-haspopup="listbox"><span>Sort by</span>{triggerIcon("sort")}</button>
            {openMenu === "sort" && <div className="filter-popover-menu sort-menu" role="listbox" aria-label="Sort resources">
              {sortOptions.map(option => <button type="button" role="option" aria-selected={sortBy === option.id} className={`filter-option-button ${sortBy === option.id ? "selected" : ""}`} key={option.id} onClick={() => { setSortBy(option.id); closeMenu(); }}>{option.label}</button>)}
            </div>}
          </div>
        </div>

        <div className="filter-row-summary" aria-live="polite">
          <span className="filter-summary-rule" aria-hidden="true" />
          <span className="filter-summary-copy"><strong>{resultCount || totalCount}</strong> resources <small>{hasActiveFilters ? `${activeFilterCount} active` : "ready to browse"}</small></span>
        </div>

        <div className="filter-actions">
          <span className="quick-access-status"><Icon name="check" size={11} /> Saved</span>
          <div className={`filter-popover recent-popover ${openMenu === "recent" ? "is-open" : ""}`}>
            <button type="button" className="filter-trigger recent-trigger" onClick={() => toggleMenu("recent")} aria-expanded={openMenu === "recent"} aria-haspopup="dialog"><Icon name="plus" size={11} /><span>Recent</span>{triggerIcon("recent")}</button>
            {openMenu === "recent" && <div className="filter-popover-menu recent-menu" role="dialog" aria-label="Recent visits">
              <div className="recent-menu-heading"><strong>Recent visits</strong><span>{recent.length ? `${recent.length} saved` : "Nothing yet"}</span></div>
              {recent.length ? recent.map(resource => <a className="recent-popover-card" key={resource.id} href={`https://${resource.url}`} target="_blank" rel="noopener noreferrer" onClick={() => { onVisit(resource); closeMenu(); }}><span className="recent-popover-orbit">{resource.name.slice(0, 1)}</span><span><strong>{resource.name}</strong><small>{resource.url}</small></span><Icon name="arrow" size={11} /></a>) : <p className="recent-empty">Open a resource and it will appear here.</p>}
            </div>}
          </div>
          <button type="button" className="quick-access-clear" onClick={() => { clearFilters(); closeMenu(); }} disabled={!hasActiveFilters}>Clear all</button>
        </div>
      </div>
    </section>
  );
}
