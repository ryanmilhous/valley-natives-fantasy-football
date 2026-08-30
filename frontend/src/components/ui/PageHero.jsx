function PageHero({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
  className = '',
}) {
  return (
    <section className={`vn-page-hero ${className}`.trim()}>
      <div className="vn-page-hero__content">
        {eyebrow ? <p className="vn-page-hero__eyebrow">{eyebrow}</p> : null}
        {title ? <h1 className="vn-page-hero__title">{title}</h1> : null}
        {subtitle ? <p className="vn-page-hero__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="vn-page-hero__actions">{actions}</div> : null}
      {children ? <div className="vn-page-hero__body">{children}</div> : null}
    </section>
  )
}

export default PageHero
