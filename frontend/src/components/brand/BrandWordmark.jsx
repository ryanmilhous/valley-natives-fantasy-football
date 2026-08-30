function BrandWordmark({
  title = 'Valley Natives',
  subtitle = 'Fantasy Football',
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) {
  return (
    <div className={`vn-brand-wordmark ${className}`.trim()}>
      <div className={`vn-brand-wordmark__title ${titleClassName}`.trim()}>{title}</div>
      {subtitle ? (
        <div className={`vn-brand-wordmark__subtitle ${subtitleClassName}`.trim()}>{subtitle}</div>
      ) : null}
    </div>
  )
}

export default BrandWordmark
