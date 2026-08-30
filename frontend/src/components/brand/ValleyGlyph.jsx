function ValleyGlyph({ className = '', accent = 'teal' }) {
  const accentColor =
    accent === 'gold'
      ? 'var(--vn-gold-500)'
      : accent === 'coral'
        ? 'var(--vn-coral-500)'
        : accent === 'rose'
          ? 'var(--vn-rose-500)'
          : 'var(--vn-teal-500)'

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label="Redwood valley crest"
      className={className}
    >
      <defs>
        <linearGradient id="vn-glyph-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(239,230,210,0.08)" />
          <stop offset="100%" stopColor="rgba(16,34,27,0.92)" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#vn-glyph-bg)" stroke="rgba(200,165,90,0.5)" strokeWidth="2" />
      <path d="M16 84 C38 70, 82 70, 104 84" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M22 88 C42 77, 80 77, 98 88" fill="none" stroke="rgba(239,230,210,0.38)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M33 82 L42 36 L52 82 Z" fill="rgba(16,34,27,0.95)" stroke="rgba(239,230,210,0.28)" />
      <path d="M49 82 L60 26 L71 82 Z" fill="rgba(16,34,27,0.95)" stroke="rgba(239,230,210,0.28)" />
      <path d="M67 82 L76 40 L86 82 Z" fill="rgba(16,34,27,0.95)" stroke="rgba(239,230,210,0.28)" />
      <circle cx="60" cy="53" r="9" fill="rgba(10,19,16,0.95)" stroke={accentColor} strokeWidth="1.5" />
      <path d="M55 53 H65" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M60 48 V58" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default ValleyGlyph
