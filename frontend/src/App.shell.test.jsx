import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
