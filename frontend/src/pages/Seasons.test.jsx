import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import Seasons from './Seasons'
import apiService from '../services/api'

vi.mock('recharts', () => {
  const React = require('react')

  return {
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
    CartesianGrid: () => <div data-testid="grid" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Legend: () => <div data-testid="legend" />,
    Line: ({ dataKey, name }) => <div data-testid={`line-${dataKey}`}>{name}</div>,
    Tooltip: ({ content }) => (
      <div data-testid="tooltip-host">
        {content
          ? React.cloneElement(content, {
              active: true,
              payload: [
                {
                  payload: {
                    year: 2024,
                    wins: 10,
                    losses: 4,
                    standing: 2,
                    final_standing: 2,
                  },
                },
              ],
            })
          : null}
      </div>
    ),
  }
})

vi.mock('../services/api', () => ({
  default: {
    getSeasons: vi.fn(),
    getAllStandings: vi.fn(),
    getOwners: vi.fn(),
    getAllPlayoffs: vi.fn(),
  },
}))

const seasonsFixture = {
  years: [2024, 2023],
  latest_season: 2024,
}

const standingsFixture = [
  {
    year: 2024,
    team_name: 'Alpha Wolves',
    owner: 'Aaron',
    wins: 10,
    losses: 4,
    ties: 0,
    standing: 1,
    final_standing: 1,
    points_for: 1700.12,
    points_against: 1500.34,
  },
  {
    year: 2024,
    team_name: 'Blaze FC',
    owner: 'Mike',
    wins: 10,
    losses: 4,
    ties: 0,
    standing: 2,
    final_standing: 2,
    points_for: 1690.1,
    points_against: 1520.2,
  },
  {
    year: 2024,
    team_name: 'Comets',
    owner: 'Zed',
    wins: 9,
    losses: 5,
    ties: 0,
    standing: 3,
    final_standing: 3,
    points_for: 1650.55,
    points_against: 1510.44,
  },
  {
    year: 2024,
    team_name: 'Delta Ducks',
    owner: 'Nate',
    wins: 3,
    losses: 11,
    ties: 0,
    standing: 4,
    final_standing: 7,
    points_for: 1300.43,
    points_against: 1710.12,
  },
  {
    year: 2023,
    team_name: 'Retro Rockets',
    owner: 'Zed',
    wins: 8,
    losses: 6,
    ties: 1,
    standing: 4,
    final_standing: 4,
    points_for: 1501.21,
    points_against: 1510.81,
  },
]

const ownersFixture = [
  {
    owner: 'Zed',
    first_season: 2011,
    last_season: 2024,
    seasons: [{ year: 2023, wins: 8, losses: 6, standing: 4, final_standing: 4 }],
    all_time: {
      wins: 100,
      losses: 80,
      championships: 1,
      playoff_appearances: 5,
      toilet_bowl: 0,
    },
  },
  {
    owner: 'Aaron',
    first_season: 2010,
    last_season: 2024,
    seasons: [{ year: 2024, wins: 10, losses: 4, standing: 2, final_standing: 2 }],
    all_time: {
      wins: 120,
      losses: 70,
      championships: 2,
      playoff_appearances: 7,
      toilet_bowl: 1,
    },
  },
]

const playoffsFixture = [
  {
    year: 2024,
    champion_owner: 'Aaron',
    champion: 'Alpha Wolves',
    runner_up_owner: 'Mike',
    third_place_owner: 'Zed',
  },
  {
    year: 2023,
    champion_owner: 'Zed',
    champion: 'Retro Rockets',
    runner_up_owner: 'Aaron',
    third_place_owner: 'Nate',
  },
]

describe('Seasons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiService.getSeasons.mockResolvedValue({ data: seasonsFixture })
    apiService.getAllStandings.mockResolvedValue({ data: standingsFixture })
    apiService.getOwners.mockResolvedValue({ data: ownersFixture })
    apiService.getAllPlayoffs.mockResolvedValue({ data: playoffsFixture })
  })

  it('uses shared primitives and fetches archive data from concrete API mocks', async () => {
    const { container } = render(<Seasons />)

    await waitFor(() => {
      expect(apiService.getSeasons).toHaveBeenCalledTimes(1)
      expect(apiService.getAllStandings).toHaveBeenCalledTimes(1)
      expect(apiService.getOwners).toHaveBeenCalledTimes(1)
      expect(apiService.getAllPlayoffs).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('heading', { name: 'Season Archive' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Owner Performance Over Time' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Championship Timeline' })).toBeInTheDocument()

    expect(container.querySelector('.vn-page-hero')).toBeTruthy()
    expect(container.querySelector('.vn-panel')).toBeTruthy()
    expect(container.querySelector('.vn-data-table-shell')).toBeTruthy()
    expect(container.querySelector('.vn-filter-bar')).toBeTruthy()
    expect(container.querySelector('.vn-stat-badge')).toBeTruthy()
  })

  it('preserves selectedYear filtering and trophy semantics', async () => {
    render(<Seasons />)

    const standingsTable = screen.getByRole('table', { name: 'Season standings table' })
    expect(await within(standingsTable).findByText('Alpha Wolves')).toBeInTheDocument()
    expect(within(standingsTable).queryByText('Retro Rockets')).not.toBeInTheDocument()
    expect(within(standingsTable).getByTitle('Champion')).toBeInTheDocument()
    expect(within(standingsTable).getByTitle('Runner-up')).toBeInTheDocument()
    expect(within(standingsTable).getByTitle('3rd Place')).toBeInTheDocument()
    expect(within(standingsTable).getByTitle('Toilet Bowl (Last Place)')).toBeInTheDocument()

    fireEvent.change(screen.getAllByTestId('season-select')[0], { target: { value: '2023' } })

    expect(await within(standingsTable).findByText('Retro Rockets')).toBeInTheDocument()
    expect(within(standingsTable).queryByText('Alpha Wolves')).not.toBeInTheDocument()
    expect(within(standingsTable).getByText('8-6-1')).toBeInTheDocument()
  })

  it('preserves selectedOwnerForChart behavior, chart keys, and tooltip ordinal/playoff text', async () => {
    render(<Seasons />)

    const ownerSelect = (await screen.findAllByTestId('owner-select'))[0]
    expect(ownerSelect).toHaveValue('Aaron')

    fireEvent.change(ownerSelect, { target: { value: 'Zed' } })
    expect(ownerSelect).toHaveValue('Zed')

    expect(screen.getAllByTestId('line-wins').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('line-losses').length).toBeGreaterThan(0)

    expect(screen.getAllByText('2024 Season').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Regular Season:').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2nd place').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Runner-up').length).toBeGreaterThan(0)
  })
})
