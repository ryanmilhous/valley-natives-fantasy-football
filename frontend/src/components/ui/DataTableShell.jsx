function DataTableShell({
  title,
  subtitle,
  actions,
  children,
  empty = false,
  emptyMessage = 'No data available.',
  className = '',
}) {
  return (
    <section className={`vn-data-table-shell ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <header className="vn-data-table-shell__header">
          <div>
            {title ? <h2 className="vn-data-table-shell__title">{title}</h2> : null}
            {subtitle ? <p className="vn-data-table-shell__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="vn-data-table-shell__actions">{actions}</div> : null}
        </header>
      )}

      {empty ? (
        <div className="vn-data-table-shell__empty">{emptyMessage}</div>
      ) : (
        <div className="vn-data-table-shell__scroll">{children}</div>
      )}
    </section>
  )
}

export default DataTableShell
