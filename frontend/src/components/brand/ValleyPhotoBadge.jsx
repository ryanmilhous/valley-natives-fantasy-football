function ValleyPhotoBadge({
  src,
  alt,
  label = '',
  className = '',
  compact = false,
}) {
  return (
    <figure className={`vn-photo-badge ${compact ? 'vn-photo-badge--compact' : ''} ${className}`.trim()}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="vn-photo-badge__image" />
      {!compact && label ? <figcaption className="vn-photo-badge__label">{label}</figcaption> : null}
    </figure>
  )
}

export default ValleyPhotoBadge

