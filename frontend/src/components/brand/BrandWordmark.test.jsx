import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import BrandWordmark from './BrandWordmark'

describe('BrandWordmark', () => {
  it('renders default league wordmark content', () => {
    render(<BrandWordmark />)

    expect(screen.getByText('Valley Natives')).toBeInTheDocument()
    expect(screen.getByText('Fantasy Football')).toBeInTheDocument()
  })

  it('supports custom labels and className', () => {
    const { container } = render(
      <BrandWordmark
        title="Records Archive"
        subtitle="Established 2007"
        className="custom-wordmark"
      />,
    )

    expect(screen.getByText('Records Archive')).toBeInTheDocument()
    expect(screen.getByText('Established 2007')).toBeInTheDocument()
    expect(container.querySelector('.custom-wordmark')).toBeTruthy()
  })
})
