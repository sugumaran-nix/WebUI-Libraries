import Icon from "./Icon";

export default function FilterPanel({ categories, counts, activeCategory, setActiveCategory, stacks, stackFilter, setStackFilter, sortBy, setSortBy, sortOptions }) {
  return (
    <section className="quick-access-panel" aria-labelledby="quick-access-title">
      <div className="quick-access-heading">
        <div><span className="panel-eyebrow">One filter surface</span><h2 id="quick-access-title">Quick access</h2></div>
        <span className="quick-access-status"><Icon name="check" size={12} /> Saved</span>
      </div>
      <div className="quick-access-controls">
        <label className="quick-access-topic"><span>Topic</span><select value={activeCategory} onChange={event => setActiveCategory(event.target.value)} aria-label="Filter by topic">{categories.map(category => <option value={category.id} key={category.id}>{category.label}{category.id === "all" ? ` · ${Object.values(counts).reduce((sum, value) => Math.max(sum, value), 0)}` : ` · ${counts[category.id] || 0}`}</option>)}</select><Icon name="chevron" size={13} /></label>
        <div className="quick-access-frameworks" role="group" aria-label="Filter by framework"><span className="quick-access-label">Built with</span>{stacks.map(stack => <button type="button" key={stack} className={`quick-access-chip ${stackFilter === stack ? "selected" : ""}`} onClick={() => setStackFilter(stack)} aria-pressed={stackFilter === stack}>{stack === "all" ? "Everything" : stack}</button>)}</div>
        <label className="quick-access-sort"><span>Sort by</span><select id="sort-resources" value={sortBy} onChange={event => setSortBy(event.target.value)} aria-label="Sort resources">{sortOptions.map(option => <option value={option.id} key={option.id}>{option.label}</option>)}</select><Icon name="chevron" size={13} /></label>
      </div>
    </section>
  );
}
