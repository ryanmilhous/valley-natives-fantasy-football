function FilterBar({ children, className = '' }) {
  return <div className={`vn-filter-bar ${className}`.trim()}>{children}</div>
}

export default FilterBar
