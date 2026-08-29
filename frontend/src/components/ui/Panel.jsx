function Panel({
  as: Component = 'section',
  title,
  subtitle,
  actions,
  children,
  className = '',
}) {
  return (
    <Component className={`vn-panel ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <header className="vn-panel__header">
          <div>
            {title ? <h2 className="vn-panel__title">{title}</h2> : null}
            {subtitle ? <p className="vn-panel__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="vn-panel__actions">{actions}</div> : null}
        </header>
      )}
      <div className="vn-panel__body">{children}</div>
    </Component>
  )
}

export default Panel
