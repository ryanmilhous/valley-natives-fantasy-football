import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import FilterBar from './FilterBar'

describe('FilterBar', () => {
  it('renders children content inside filter bar container', () => {
    const { container } = render(
      <FilterBar>
        <button type="button">Season 2025</button>
      </FilterBar>,
    )

    expect(screen.getByRole('button', { name: 'Season 2025' })).toBeInTheDocument()
    expect(container.querySelector('.vn-filter-bar')).toBeTruthy()
  })

  it('appends optional custom class names', () => {
    const { container } = render(<FilterBar className="u-gap-sm">Filters</FilterBar>)

    expect(container.querySelector('.vn-filter-bar.u-gap-sm')).toBeTruthy()
  })
})
