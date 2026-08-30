import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatBadge from './StatBadge'

describe('StatBadge', () => {
  it('renders label text with requested tone class', () => {
    render(<StatBadge label="Champion" tone="champion" />)

    const badge = screen.getByText('Champion')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('vn-stat-badge')
    expect(badge).toHaveClass('vn-stat-badge--champion')
  })

  it('falls back to neutral tone for unknown values and applies custom classes', () => {
    render(<StatBadge label="Wildcard" tone="something-else" className="u-mr-xs" />)

    const badge = screen.getByText('Wildcard')
    expect(badge).toHaveClass('vn-stat-badge--neutral')
    expect(badge).toHaveClass('u-mr-xs')
  })
})
