import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'

import { vi } from 'vitest'

vi.mock('./pages/Home', () => ({ default: () => <div>Home</div> }))
vi.mock('./pages/Seasons', () => ({ default: () => <div>Seasons</div> }))
vi.mock('./pages/Matchups', () => ({ default: () => <div>Matchups</div> }))
vi.mock('./pages/HeadToHead', () => ({ default: () => <div>HeadToHead</div> }))
vi.mock('./pages/Teams', () => ({ default: () => <div>Teams</div> }))
vi.mock('./pages/Records', () => ({ default: () => <div>Records</div> }))
vi.mock('./pages/Draft', () => ({ default: () => <div>Draft</div> }))
vi.mock('./pages/Rosters', () => ({ default: () => <div>Rosters</div> }))
vi.mock('./pages/Trades', () => ({ default: () => <div>Trades</div> }))

describe('App shell', () => {
  it('renders Valley Natives brand text and shell hooks', () => {
    const { container } = render(<App />)

    expect(screen.getByText('Valley Natives')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeTruthy()
    expect(container.querySelector('.vn-shell')).toBeTruthy()
    expect(container.querySelector('.vn-nav')).toBeTruthy()
    expect(container.querySelector('.vn-footer')).toBeTruthy()
  })

  it('opens the mobile menu and toggles expanded state', () => {
    const { container } = render(<App />)

    const menuButton = within(container).getByRole('button', { name: 'Open menu' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(container.querySelector('#mobile-nav-menu')).toBeNull()

    fireEvent.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeTruthy()
    const mobileMenu = container.querySelector('#mobile-nav-menu')
    expect(mobileMenu).toBeTruthy()
    expect(within(mobileMenu).getByRole('link', { name: 'Records' })).toBeTruthy()
  })

  it('closes mobile menu after selecting a mobile nav link', () => {
    const { container } = render(<App />)

    const menuButton = within(container).getByRole('button', { name: 'Open menu' })
    fireEvent.click(menuButton)

    const mobileMenu = container.querySelector('#mobile-nav-menu')
    expect(mobileMenu).toBeTruthy()

    const recordsLink = within(mobileMenu).getByRole('link', { name: 'Records' })
    fireEvent.click(recordsLink)

    expect(within(container).getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(container.querySelector('#mobile-nav-menu')).toBeNull()
  })
})
