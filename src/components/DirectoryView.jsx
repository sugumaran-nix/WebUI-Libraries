import FilterPanel from "./FilterPanel";
import Icon from "./Icon";
import ResourceCard from "./ResourceCard";

function EmptyDirectory({ onClear }) {
  return (
    <div className="directory-empty" role="status">
      <span className="directory-empty-mark"><Icon name="search" size={18} /></span>
      <p className="directory-eyebrow">NO MATCHES</p>
      <h3>No resources match this search.</h3>
      <p>Try a broader term or remove one of the active filters.</p>
      <button type="button" className="directory-secondary-button" onClick={onClear}>Reset filters</button>
    </div>
  );
}

function ActiveFilters({ query, activeCategory, categoryLabel, stackFilter, sortBy, sortOptions, setQuery, setActiveCategory, setStackFilter, setSortBy }) {
  const filters = [];
  if (query) filters.push({ label: `Search: “${query}”`, action: () => setQuery(""), aria: "Remove search filter" });
  if (activeCategory !== "all") filters.push({ label: categoryLabel, action: () => setActiveCategory("all"), aria: "Remove category filter" });
  if (stackFilter !== "all") filters.push({ label: stackFilter, action: () => setStackFilter("all"), aria: "Remove technology filter" });
  if (sortBy !== "featured") filters.push({ label: sortOptions.find(option => option.id === sortBy)?.label || "Custom order", action: () => setSortBy("featured"), aria: "Remove sort filter" });
  if (!filters.length) return null;
  return <div className="directory-active-filters" aria-label="Active filters">{filters.map(filter => <span className="directory-filter-chip" key={filter.label}>{filter.label}<button type="button" onClick={filter.action} aria-label={filter.aria}><Icon name="close" size={12} /></button></span>)}</div>;
}

export default function DirectoryView({
  categories,
  counts,
  activeCategory,
  setActiveCategory,
  stacks,
  stackFilter,
  setStackFilter,
  sortBy,
  setSortBy,
  sortOptions,
  clearFilters,
  hasActiveFilters,
  activeFilterCount,
  resultCount,
  categoryLabel,
  recent,
  onVisit,
  viewMode,
  setViewMode,
  query,
  setQuery,
  searchRef,
  filteredResources,
  libStacks,
  newIds,
  categoryResolver,
  categoryColors,
  copiedId,
  onCopy,
  setSuggestOpen,
  suggestOpen,
  suggested,
  suggestion,
  setSuggestion,
  sendSuggestion,
  verifiedDate,
}) {
  return (
    <div className="directory-experience">
      <section className="directory-search-strip" aria-labelledby="directory-search-label">
        <div className="directory-search-strip-copy"><p className="directory-eyebrow">SEARCH THE DIRECTORY</p><label id="directory-search-label" htmlFor="directory-search">Find a resource by name, description, or technology.</label></div>
        <div className="directory-search-field">
          <Icon name="search" size={17} />
          <input id="directory-search" ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search resources" autoComplete="off" />
          {query && <button type="button" className="directory-search-clear" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" size={14} /></button>}
          <kbd>/</kbd>
        </div>
      </section>

      <div className="directory-layout">
        <aside className="directory-filter-rail" aria-label="Resource filters">
          <div className="directory-rail-intro"><p className="directory-eyebrow">REFINE</p><h2>Choose your criteria.</h2><p>Use the visible resource details to narrow the collection.</p></div>
          <FilterPanel categories={categories} counts={counts} activeCategory={activeCategory} setActiveCategory={setActiveCategory} stacks={stacks} stackFilter={stackFilter} setStackFilter={setStackFilter} sortBy={sortBy} setSortBy={setSortBy} sortOptions={sortOptions} clearFilters={clearFilters} hasActiveFilters={hasActiveFilters} activeFilterCount={activeFilterCount} resultCount={resultCount} categoryLabel={categoryLabel} recent={recent} onVisit={onVisit} />
        </aside>

        <main className="directory-results" id="results" aria-label="Resource directory results">
          <div className="directory-results-head">
            <div><p className="directory-eyebrow">CATALOG VIEW</p><h2>{activeCategory === "all" ? "All resources" : categoryLabel}</h2><p>{resultCount} {resultCount === 1 ? "resource" : "resources"} ready to review{hasActiveFilters ? " with your current criteria" : ""}.</p></div>
            <div className="directory-results-actions">
              <span className="directory-result-count">{resultCount} / {categories.find(category => category.id === "all")?.label === "All categories" ? "" : ""}{Object.values(counts).reduce((sum, value) => Math.max(sum, value), 0)}</span>
              <div className="directory-view-toggle" aria-label="Change resource layout"><button type="button" className={viewMode === "grid" ? "is-active" : ""} aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><Icon name="grid" size={15} /><span>Grid</span></button><button type="button" className={viewMode === "list" ? "is-active" : ""} aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}><Icon name="list" size={15} /><span>List</span></button></div>
            </div>
          </div>
          <ActiveFilters query={query} activeCategory={activeCategory} categoryLabel={categoryLabel} stackFilter={stackFilter} sortBy={sortBy} sortOptions={sortOptions} setQuery={setQuery} setActiveCategory={setActiveCategory} setStackFilter={setStackFilter} setSortBy={setSortBy} />
          {filteredResources.length === 0 ? <EmptyDirectory onClear={clearFilters} /> : <div className={`directory-card-grid ${viewMode === "list" ? "is-list" : ""}`}>{filteredResources.map(resource => <ResourceCard key={resource.id} lib={resource} categoryLabel={categories.find(item => item.id === categoryResolver(resource.cat))?.label || resource.cat} stacks={libStacks[resource.id] || []} accent={categoryColors[categoryResolver(resource.cat)] || "#0057B8"} isNew={newIds.has(resource.id)} isCopied={copiedId === resource.id} query={query} onCopy={onCopy} onVisit={onVisit} />)}</div>}
        </main>
      </div>

      <section className="directory-recent-strip" aria-label="Recently visited resources">
        <div><p className="directory-eyebrow">RECENTLY VISITED</p><strong>Continue evaluating</strong></div>
        {recent.length ? <div className="directory-recent-links">{recent.slice(0, 4).map(resource => <a key={resource.id} href={`https://${resource.url}`} target="_blank" rel="noopener noreferrer" onClick={() => onVisit(resource)}>{resource.name}<Icon name="arrow" size={12} /></a>)}</div> : <p className="directory-recent-empty">Visited resources will appear here for quick return.</p>}
      </section>

      <section className="directory-suggestion" aria-labelledby="suggest-title">
        <button type="button" className="directory-suggestion-trigger" onClick={() => setSuggestOpen(open => !open)} aria-expanded={suggestOpen} aria-controls="suggest-resource-form"><span><span className="directory-suggestion-icon"><Icon name="spark" size={17} /></span><span><strong id="suggest-title">Know a strong resource?</strong><small>Send it for review and help improve the directory.</small></span></span><Icon name={suggestOpen ? "close" : "plus"} size={17} /></button>
        {suggestOpen && <div className="directory-suggestion-form" id="suggest-resource-form">
          {suggested ? <div className="directory-success" role="status"><Icon name="check" size={18} /><span>Your suggestion is ready to review in GitHub.</span></div> : <>
            <div className="directory-form-grid"><label>Resource name<input value={suggestion.name} onChange={event => setSuggestion({ ...suggestion, name: event.target.value })} placeholder="e.g. Acme UI" /></label><label>Website URL<input value={suggestion.url} onChange={event => setSuggestion({ ...suggestion, url: event.target.value })} placeholder="acme-ui.com" /></label></div>
            <label>Why should it be included?<textarea value={suggestion.note} onChange={event => setSuggestion({ ...suggestion, note: event.target.value })} placeholder="Describe what makes this resource useful." /></label>
            <div className="directory-form-footer"><p>We will open a pre-filled GitHub issue for your review.</p><button type="button" className="directory-primary-button" disabled={!suggestion.name.trim() || !suggestion.url.trim()} onClick={sendSuggestion}>Submit resource <Icon name="arrowRight" size={14} /></button></div>
          </>}
        </div>}
      </section>

      <footer className="directory-footer"><span>Last reviewed {verifiedDate}</span><span>{resultCount} of {Object.values(counts).reduce((sum, value) => Math.max(sum, value), 0)} resources displayed</span></footer>
    </div>
  );
}
