import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Records from './Records'
import apiService from '../services/api'

const recordsFixture = {
  highest_score: {
    team: 'Solar Flare',
    owner: 'Owner A',
    score: 210.57,
    week: 9,
    year: 2022,
    opponent: 'Night Owls',
  },
  lowest_score: {
    team: 'Ice Cats',
    owner: 'Owner B',
    score: 52.1,
    week: 3,
    year: 2018,
    opponent: 'Wolf Pack',
  },
  biggest_blowout: {
    winner: 'Solar Flare',
    winner_owner: 'Owner A',
    winner_score: 175.8,
    loser: 'Ice Cats',
    loser_owner: 'Owner B',
    loser_score: 130.6,
    point_differential: 45.2,
    week: 7,
    year: 2021,
  },
  closest_game: {
    winner: 'Night Owls',
    winner_owner: 'Owner C',
    winner_score: 101.04,
    loser: 'Wolf Pack',
    loser_owner: 'Owner D',
    loser_score: 101.01,
    point_differential: 0.03,
    week: 10,
    year: 2020,
  },
  most_points_season: {
    team_name: 'Night Owls',
    owner: 'Owner C',
    points_for: 1899.32,
    wins: 11,
    losses: 3,
    year: 2024,
  },
  most_wins_season: {
    team_name: 'Solar Flare',
    owner: 'Owner A',
    wins: 13,
    losses: 1,
    points_for: 1810.11,
    year: 2023,
  },
  fewest_wins_season: {
    team_name: 'Wolf Pack',
    owner: 'Owner D',
    wins: 1,
    losses: 13,
    year: 2014,
  },
  most_points_against_season: {
    team_name: 'Ice Cats',
    owner: 'Owner B',
    points_against: 1700.46,
    wins: 4,
    losses: 10,
    year: 2022,
  },
  fewest_points_season: {
    team_name: 'Frozen Feet',
    owner: 'Owner E',
    points_for: 840,
    wins: 2,
    losses: 12,
    year: 2009,
  },
  longest_win_streak: {
    owner: 'Owner A',
    streak: 9,
    start_week: 11,
    start_year: 2019,
    end_week: 5,
    end_year: 2020,
  },
  longest_loss_streak: {
    owner: 'Owner D',
    streak: 10,
    start_week: 2,
    start_year: 2016,
    end_week: 12,
    end_year: 2016,
  },
  highest_scoring_loss: {
    team: 'Night Owls',
    owner: 'Owner C',
    score: 188.32,
    opponent: 'Solar Flare',
    opponent_owner: 'Owner A',
    opponent_score: 190.5,
    week: 4,
    year: 2021,
  },
  lowest_scoring_win: {
    team: 'Wolf Pack',
    owner: 'Owner D',
    score: 61,
    opponent: 'Ice Cats',
    opponent_owner: 'Owner B',
    opponent_score: 58.3,
    week: 6,
    year: 2017,
  },
  most_combined_points: {
    home_team: 'Solar Flare',
    home_owner: 'Owner A',
    home_score: 201.7,
    away_team: 'Night Owls',
    away_owner: 'Owner C',
    away_score: 198.4,
    combined_points: 400.1,
    week: 12,
    year: 2023,
  },
  best_champion: {
    team_name: 'Solar Flare',
    owner: 'Owner A',
    wins: 12,
    losses: 2,
    points_for: 1870.6,
    points_gap: 95.45,
    year: 2023,
  },
  worst_team_best_result: {
    team_name: 'Lucky Breaks',
    owner: 'Owner F',
    wins: 8,
    losses: 6,
    points_for: 1322.55,
    points_rank: 7,
    total_teams: 14,
    year: 2015,
  },
  unluckiest_reg_season_winner: {
    team_name: 'Night Owls',
    owner: 'Owner C',
    wins: 11,
    losses: 3,
    points_for: 1801.8,
    points_gap: 77.5,
    final_standing: 4,
    year: 2022,
  },
  best_team_worst_result: {
    team_name: 'Solar Flare',
    owner: 'Owner A',
    wins: 10,
    losses: 4,
    points_for: 1844.1,
    points_rank: 1,
    final_standing: 6,
    standing_gap: 5,
    year: 2024,
  },
}

vi.mock('../services/api', () => ({
  default: {
    getRecords: vi.fn(),
  },
}))

describe('Records', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiService.getRecords.mockResolvedValue({ data: recordsFixture })
  })

  it('renders the archival hierarchy with shared UI primitives', async () => {
    const { container } = render(<Records />)

    await waitFor(() => {
      expect(apiService.getRecords).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('heading', { name: 'League Records & Milestones' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Interesting Results' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Single Game Records' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Season Records' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Streak Records' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wild Records' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Single game records table' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Season records table' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Streak records table' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Wild records table' })).toBeInTheDocument()

    expect(container.querySelector('.vn-page-hero')).toBeTruthy()
    expect(container.querySelector('.vn-panel')).toBeTruthy()
    expect(container.querySelector('.vn-data-table-shell')).toBeTruthy()
    expect(container.querySelector('.vn-stat-badge')).toBeTruthy()
    expect(screen.getAllByLabelText(/table scroll container/i).length).toBeGreaterThan(0)
  })

  it('preserves record value formatting and year range semantics', async () => {
    render(<Records />)

    expect(await screen.findByText('45.20 points')).toBeInTheDocument()
    expect(screen.getAllByText('Lost to Solar Flare (Owner A) - 190.50').length).toBeGreaterThan(0)
    expect(screen.getAllByText('13 wins').length).toBeGreaterThan(0)
    expect(screen.getAllByText('9 wins').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2019-2020').length).toBeGreaterThan(0)
  })
})
