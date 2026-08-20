import { useEffect, useState } from "react";
import Icon from "./Icon";

export default function FilterPanel({ categories, counts, activeCategory, setActiveCategory, stacks, stackFilter, setStackFilter, sortBy, setSortBy, sortOptions, clearFilters, hasActiveFilters, activeFilterCount, resultCount, categoryLabel, recent, onVisit, viewMode, setViewMode }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState("topic");
  const totalCount = Object.values(counts).reduce((sum, value) => Math.max(sum, value), 0);
  const activeTopic = categoryLabel === "All resources" ? "All" : categoryLabel;
  const activeSort = sortOptions.find(option => option.id === sortBy)?.label || "Curated order";
  const toggleMenu = menu => setOpenMenu(current => current === menu ? null : menu);
  const closeMenu = () => setOpenMenu(null);
  const closeMobile = () => setMobileOpen(false);
  const triggerIcon = menu => <Icon name={openMenu === menu ? "close" : "chevron"} size={12} />;
  const toggleMobileSection = section => setMobileSection(current => current === section ? null : section);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKeyDown = event => {
      if (event.key === "Escape") closeMobile();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const selectMobileCategory = id => {
    setActiveCategory(id);
    setMobileSection(null);
  };

  const selectMobileStack = stack => {
    setStackFilter(stack);
    setMobileSection(null);
  };

  const selectMobileSort = sort => {
    setSortBy(sort);
    setMobileSection(null);
  };

  const handleClear = () => {
    clearFilters();
    closeMenu();
    closeMobile();
  };

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

          <div className={`filter-popover recent-popover ${openMenu === "recent" ? "is-open" : ""}`}>
            <button type="button" className="filter-trigger recent-trigger" onClick={() => toggleMenu("recent")} aria-expanded={openMenu === "recent"} aria-haspopup="dialog"><Icon name="history" size={14} /><span>Recent</span></button>
            {openMenu === "recent" && <div className="filter-popover-menu recent-menu" role="dialog" aria-label="Recent visits">
              <div className="recent-menu-heading"><strong>Recent visits</strong><span>{recent.length ? `${recent.length} saved` : "Nothing yet"}</span></div>
              {recent.length ? recent.map(resource => <a className="recent-popover-card" key={resource.id} href={`https://${resource.url}`} target="_blank" rel="noopener noreferrer" onClick={() => { onVisit(resource); closeMenu(); }}><span className="recent-popover-orbit">{resource.name.slice(0, 1)}</span><span><strong>{resource.name}</strong><small>{resource.url}</small></span><Icon name="arrow" size={11} /></a>) : <p className="recent-empty">Open a resource and it will appear here.</p>}
            </div>}
          </div>
        </div>

        <div className="filter-row-summary" aria-live="polite">
          <span className="filter-summary-rule" aria-hidden="true" />
          <span className="filter-summary-copy"><strong>{activeTopic}</strong><small>{resultCount} resources {hasActiveFilters ? `· ${activeFilterCount} active` : "· ready to browse"}</small></span>
        </div>

        <div className="filter-actions">
          <div className="view-toggle" aria-label="Choose resource view"><button type="button" className={viewMode === "list" ? "active" : ""} aria-label="List view" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}><Icon name="list" size={14} /></button><button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Grid view" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><Icon name="grid" size={14} /></button></div>
          <button type="button" className="quick-access-clear" onClick={handleClear} disabled={!hasActiveFilters} aria-label="Clear all filters" title="Clear all filters"><Icon name="trash" size={13} /><span>Clear all</span></button>
        </div>
      </div>

      <div className="filters-mobile-trigger-row">
        <button type="button" className="filters-mobile-trigger" onClick={() => { setMobileOpen(true); setMobileSection("topic"); }} aria-expanded={mobileOpen} aria-haspopup="dialog"><Icon name="filter" size={17} /><strong>Filters</strong>{activeFilterCount > 0 && <span className="filters-mobile-count">{activeFilterCount}</span>}<small>{resultCount} resources</small><Icon name="chevron" size={13} /></button>
        <div className="filters-mobile-actions">
          <div className="view-toggle" aria-label="Choose resource view"><button type="button" className={viewMode === "list" ? "active" : ""} aria-label="List view" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}><Icon name="list" size={14} /></button><button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Grid view" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><Icon name="grid" size={14} /></button></div>
          <button type="button" className="quick-access-clear mobile-clear" onClick={handleClear} disabled={!hasActiveFilters} aria-label="Clear all filters" title="Clear all filters"><Icon name="trash" size={15} /></button>
        </div>
      </div>

      {mobileOpen && <>
        <div className="filters-mobile-backdrop" onMouseDown={closeMobile} aria-hidden="true" />
        <section className="filters-mobile-sheet" role="dialog" aria-modal="true" aria-labelledby="mobile-filters-title" onMouseDown={event => event.stopPropagation()}>
          <header className="filters-mobile-sheet-header">
            <div><strong id="mobile-filters-title">Filters</strong><small>{resultCount} resources · {activeFilterCount ? `${activeFilterCount} active` : "ready to browse"}</small></div>
            <button type="button" className="filters-mobile-close" onClick={closeMobile} aria-label="Close filters"><Icon name="close" size={18} /></button>
          </header>
          <div className="filters-mobile-sheet-body">
            <section className={`mobile-filter-group ${mobileSection === "topic" ? "is-open" : ""}`}>
              <button type="button" className="mobile-filter-group-toggle" onClick={() => toggleMobileSection("topic")} aria-expanded={mobileSection === "topic"}><span><Icon name="compass" size={16} /> Topic</span><em>{activeTopic}</em><Icon name="chevron" size={14} /></button>
              {mobileSection === "topic" && <div className="mobile-filter-options topic-options">{categories.map(category => <button type="button" key={category.id} className={activeCategory === category.id ? "selected" : ""} onClick={() => selectMobileCategory(category.id)}>{category.label}<span>{category.id === "all" ? totalCount : counts[category.id] || 0}</span></button>)}</div>}
            </section>
            <section className={`mobile-filter-group ${mobileSection === "framework" ? "is-open" : ""}`}>
              <button type="button" className="mobile-filter-group-toggle" onClick={() => toggleMobileSection("framework")} aria-expanded={mobileSection === "framework"}><span><Icon name="library" size={16} /> Built with</span><em>{stackFilter === "all" ? "Everything" : stackFilter}</em><Icon name="chevron" size={14} /></button>
              {mobileSection === "framework" && <div className="mobile-filter-options framework-options">{stacks.map(stack => <button type="button" key={stack} className={stackFilter === stack ? "selected" : ""} onClick={() => selectMobileStack(stack)}>{stack === "all" ? "Everything" : stack}</button>)}</div>}
            </section>
            <section className={`mobile-filter-group ${mobileSection === "sort" ? "is-open" : ""}`}>
              <button type="button" className="mobile-filter-group-toggle" onClick={() => toggleMobileSection("sort")} aria-expanded={mobileSection === "sort"}><span><Icon name="sort" size={16} /> Sort by</span><em>{activeSort}</em><Icon name="chevron" size={14} /></button>
              {mobileSection === "sort" && <div className="mobile-filter-options sort-options">{sortOptions.map(option => <button type="button" key={option.id} className={sortBy === option.id ? "selected" : ""} onClick={() => selectMobileSort(option.id)}>{option.label}</button>)}</div>}
            </section>
            <section className={`mobile-filter-group ${mobileSection === "recent" ? "is-open" : ""}`}>
              <button type="button" className="mobile-filter-group-toggle" onClick={() => toggleMobileSection("recent")} aria-expanded={mobileSection === "recent"}><span><Icon name="history" size={16} /> Recent visits</span><em>{recent.length ? `${recent.length} saved` : "Nothing yet"}</em><Icon name="chevron" size={14} /></button>
              {mobileSection === "recent" && <div className="mobile-recent-list">{recent.length ? recent.map(resource => <a className="recent-popover-card" key={resource.id} href={`https://${resource.url}`} target="_blank" rel="noopener noreferrer" onClick={() => { onVisit(resource); closeMobile(); }}><span className="recent-popover-orbit">{resource.name.slice(0, 1)}</span><span><strong>{resource.name}</strong><small>{resource.url}</small></span><Icon name="arrow" size={11} /></a>) : <p className="recent-empty">Open a resource and it will appear here.</p>}</div>}
            </section>
          </div>
          <footer className="filters-mobile-sheet-footer"><button type="button" className="quick-access-clear" onClick={handleClear} disabled={!hasActiveFilters}><Icon name="trash" size={14} /> Clear all</button><button type="button" className="button button-primary mobile-done" onClick={closeMobile}>Done</button></footer>
        </section>
      </>}
    </section>
  );
}
