import Icon from "./Icon";

export default function FilterPanel({ categories, counts, activeCategory, setActiveCategory, stacks, stackFilter, setStackFilter, sortBy, setSortBy, sortOptions, onClose, compact = false }) {
  return (
    <div className={`filter-panel ${compact ? "compact" : ""}`}>
      <div className="filter-panel-heading">
        <div><span className="panel-eyebrow">Refine the index</span><h2>Filters</h2></div>
        {onClose && <button type="button" className="icon-button filter-close" onClick={onClose} aria-label="Close filters"><Icon name="close" size={16} /></button>}
      </div>

      <div className="filter-block">
        <div className="filter-label">Resource type</div>
        <div className="filter-options" role="group" aria-label="Resource type filters">
          {categories.map(category => {
            const selected = activeCategory === category.id;
            const count = category.id === "all" ? Object.values(counts).reduce((sum, value) => Math.max(sum, value), 0) : counts[category.id] || 0;
            return <button type="button" key={category.id} className={`filter-option ${selected ? "selected" : ""}`} onClick={() => setActiveCategory(category.id)} aria-pressed={selected}>
              <span>{category.label}</span><span>{count}</span>
            </button>;
          })}
        </div>
      </div>

      <div className="filter-block">
        <div className="filter-label">Built with</div>
        <div className="filter-pills" role="group" aria-label="Framework filters">{stacks.map(stack => <button type="button" key={stack} className={`filter-pill ${stackFilter === stack ? "selected" : ""}`} onClick={() => setStackFilter(stack)} aria-pressed={stackFilter === stack}>{stack === "all" ? "Everything" : stack}</button>)}</div>
      </div>

      <div className="filter-block">
        <label className="filter-label" htmlFor="sort-resources">Sort by</label>
        <select id="sort-resources" className="filter-select" value={sortBy} onChange={event => setSortBy(event.target.value)}>
          {sortOptions.map(option => <option value={option.id} key={option.id}>{option.label}</option>)}
        </select>
      </div>

      <div className="filter-panel-tip"><Icon name="spark" size={15} /><span>Good interfaces are easier to find when you narrow the signal.</span></div>
      {onClose && <button type="button" className="filter-done" onClick={onClose}>Show results <Icon name="arrowRight" size={14} /></button>}
    </div>
  );
}
