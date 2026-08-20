import Icon from "./Icon";

export default function FilterPanel({ categories, counts, activeCategory, setActiveCategory, stacks, stackFilter, setStackFilter, sortBy, setSortBy, sortOptions, clearFilters, hasActiveFilters }) {
  return (
    <section className="quick-access-panel" aria-labelledby="quick-access-title">
      <div className="quick-access-row">
        <div className="quick-access-heading">
          <h2 id="quick-access-title">Filters</h2>
          <span className="quick-access-status"><Icon name="check" size={11} /> Saved</span>
        </div>
        <label className="quick-access-topic"><span>Topic</span><select value={activeCategory} onChange={event => setActiveCategory(event.target.value)} aria-label="Filter by topic">{categories.map(category => <option value={category.id} key={category.id}>{category.label}{category.id === "all" ? ` · ${Object.values(counts).reduce((sum, value) => Math.max(sum, value), 0)}` : ` · ${counts[category.id] || 0}`}</option>)}</select><Icon name="chevron" size={12} /></label>
        <div className="quick-access-frameworks" role="group" aria-label="Filter by framework"><span className="quick-access-label">Built with</span>{stacks.map(stack => <button type="button" key={stack} className={`quick-access-chip ${stackFilter === stack ? "selected" : ""}`} onClick={() => setStackFilter(stack)} aria-pressed={stackFilter === stack}>{stack === "all" ? "Everything" : stack}</button>)}</div>
        <label className="quick-access-sort"><span>Sort by</span><select id="sort-resources" value={sortBy} onChange={event => setSortBy(event.target.value)} aria-label="Sort resources">{sortOptions.map(option => <option value={option.id} key={option.id}>{option.label}</option>)}</select><Icon name="chevron" size={12} /></label>
        <button type="button" className="quick-access-clear" onClick={clearFilters} disabled={!hasActiveFilters}>Clear all</button>
      </div>
    </section>
  );
}
