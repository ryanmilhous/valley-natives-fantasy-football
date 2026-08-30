import { useState } from 'react'

function PageHero({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
  imageSrc,
  imageAlt = '',
  imagePosition = 'center center',
  accent = 'teal',
  className = '',
}) {
  const [hasImageError, setHasImageError] = useState(false)
  const hasImage = Boolean(imageSrc) && !hasImageError

  return (
    <section
      className={`vn-page-hero vn-page-hero--${accent} ${hasImage ? '' : 'vn-page-hero--fallback'} ${className}`.trim()}
    >
      {hasImage ? (
        <img
          src={imageSrc}
          alt={imageAlt}
          className="vn-page-hero__image"
          loading="lazy"
          decoding="async"
          onError={() => setHasImageError(true)}
          style={{ objectPosition: imagePosition }}
        />
      ) : null}
      <div className="vn-page-hero__overlay" />
      <div className="vn-page-hero__accent-stripe" />
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
