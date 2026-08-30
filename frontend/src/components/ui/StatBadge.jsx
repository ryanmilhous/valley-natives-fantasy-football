const TONE_CLASS_NAMES = {
  champion: 'vn-stat-badge--champion',
  top: 'vn-stat-badge--top',
  neutral: 'vn-stat-badge--neutral',
  warning: 'vn-stat-badge--warning',
  rivalry: 'vn-stat-badge--rivalry',
}

function StatBadge({
  label,
  tone = 'neutral',
  className = '',
}) {
  const toneClassName = TONE_CLASS_NAMES[tone] || TONE_CLASS_NAMES.neutral

  return <span className={`vn-stat-badge ${toneClassName} ${className}`.trim()}>{label}</span>
}

export default StatBadge
