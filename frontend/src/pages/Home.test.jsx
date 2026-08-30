import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import Home from './Home'
import apiService from '../services/api'

const metadataFixture = {
  league_name: 'Valley Natives League',
  first_season: 2006,
  latest_season: 2025,
  total_seasons: 20,
  total_owners: 2,
}

const ownersFixture = [
  {
    owner: 'Zane',
    first_season: 2010,
    last_season: 2025,
    seasons_played: 10,
    seasons: [{ year: 2020, team_name: 'Zane Squad' }],
    all_time: {
      wins: 110,
      losses: 70,
      win_percentage: 61.1,
      championships: 1,
      championship_years: [2020],
      second_place: 1,
      second_place_years: [2019],
      third_place: 1,
      third_place_years: [2021],
      playoff_appearances: 5,
      playoff_appearance_pct: 50,
      toilet_bowl: 0,
      toilet_bowl_years: [],
      toilet_bowl_pct: 0,
      top_3_pct: 30,
      ranking_points: 11,
    },
  },
  {
    owner: 'Alex',
    first_season: 2012,
    last_season: 2025,
    seasons_played: 9,
    seasons: [{ year: 2018, team_name: 'Alex Heroes' }],
    all_time: {
      wins: 95,
      losses: 80,
      win_percentage: 54.3,
      championships: 1,
      championship_years: [2018],
      second_place: 2,
      second_place_years: [2017, 2022],
      third_place: 0,
      third_place_years: [],
      playoff_appearances: 4,
      playoff_appearance_pct: 44.4,
      toilet_bowl: 1,
      toilet_bowl_years: [2014],
      toilet_bowl_pct: 11.1,
      top_3_pct: 33.3,
      ranking_points: 11,
    },
  },
]

vi.mock('../services/api', () => ({
  default: {
    getMetadata: vi.fn(),
    getOwners: vi.fn(),
  },
}))

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiService.getMetadata.mockResolvedValue({ data: metadataFixture })
    apiService.getOwners.mockResolvedValue({ data: ownersFixture })
  })

  it('renders home with shared system primitives and loaded fixtures', async () => {
    const { container } = render(<Home />)

    await waitFor(() => {
      expect(apiService.getMetadata).toHaveBeenCalledTimes(1)
      expect(apiService.getOwners).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('heading', { name: 'Valley Natives League' })).toBeInTheDocument()
    expect(screen.getByText('2006-2025 • 20 seasons • 2 owners')).toBeInTheDocument()

    expect(container.querySelector('.vn-page-hero')).toBeTruthy()
    expect(container.querySelector('.vn-data-table-shell')).toBeTruthy()
    expect(container.querySelector('.vn-panel')).toBeTruthy()
    expect(container.querySelector('.vn-filter-bar')).toBeTruthy()

    expect(screen.getByText(/Owners are ranked using a point system:/)).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'All-time owner standings table' })).toBeInTheDocument()
  })

  it('keeps default ranking points tie-break sort and owner column sorting behavior', async () => {
    render(<Home />)

    const rows = await screen.findAllByRole('row')
    const dataRows = rows.slice(1)

    expect(within(dataRows[0]).getByText('Zane')).toBeInTheDocument()
    expect(within(dataRows[1]).getByText('Alex')).toBeInTheDocument()

    const ownerSortButton = screen.getAllByRole('button', { name: /sort by owner/i })[0]
    const ownerHeader = screen.getAllByRole('columnheader', { name: /owner/i })[0]
    expect(ownerHeader).toHaveAttribute('aria-sort', 'none')

    fireEvent.click(ownerSortButton)
    const rowsAfterAsc = screen.getAllByRole('row').slice(1)
    expect(ownerHeader).toHaveAttribute('aria-sort', 'ascending')
    expect(within(rowsAfterAsc[0]).getByText('Alex')).toBeInTheDocument()
    expect(within(rowsAfterAsc[1]).getByText('Zane')).toBeInTheDocument()

    fireEvent.click(ownerSortButton)
    const rowsAfterDesc = screen.getAllByRole('row').slice(1)
    expect(ownerHeader).toHaveAttribute('aria-sort', 'descending')
    expect(within(rowsAfterDesc[0]).getByText('Zane')).toBeInTheDocument()
    expect(within(rowsAfterDesc[1]).getByText('Alex')).toBeInTheDocument()
  })
})
