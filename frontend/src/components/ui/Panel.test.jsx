import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Panel from './Panel'

describe('Panel', () => {
  it('renders heading content, actions, and body children', () => {
    const { container } = render(
      <Panel
        title="Weekly Results"
        subtitle="Postseason matchups"
        actions={<button type="button">View all</button>}
      >
        <p>Panel body</p>
      </Panel>,
    )

    expect(screen.getByRole('heading', { name: 'Weekly Results' })).toBeInTheDocument()
    expect(screen.getByText('Postseason matchups')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument()
    expect(screen.getByText('Panel body')).toBeInTheDocument()
    expect(container.querySelector('.vn-panel__header')).toBeTruthy()
    expect(container.querySelector('.vn-panel__body')).toBeTruthy()
  })

  it('supports the as prop and custom classes for presentational containers', () => {
    const { container } = render(
      <Panel as="article" className="u-shadow-sm">
        Content
      </Panel>,
    )

    expect(container.querySelector('article.vn-panel.u-shadow-sm')).toBeTruthy()
    expect(container.querySelector('.vn-panel__header')).toBeFalsy()
  })
})
