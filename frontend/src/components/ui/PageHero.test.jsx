import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import PageHero from './PageHero'

describe('PageHero', () => {
  it('renders optional heading content and actions', () => {
    const { container } = render(
      <PageHero
        eyebrow="League History"
        title="Head-to-Head"
        subtitle="Compare records across seasons"
        actions={<button type="button">Export</button>}
      />,
    )

    expect(screen.getByText('League History')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Head-to-Head' })).toBeInTheDocument()
    expect(screen.getByText('Compare records across seasons')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(container.querySelector('.vn-page-hero')).toBeTruthy()
  })

  it('renders body content and custom class names', () => {
    const { container } = render(
      <PageHero className="u-stack-md">
        <p>Secondary content</p>
      </PageHero>,
    )

    expect(screen.getByText('Secondary content')).toBeInTheDocument()
    expect(container.querySelector('.vn-page-hero.u-stack-md')).toBeTruthy()
    expect(container.querySelector('.vn-page-hero__body')).toBeTruthy()
  })
})
