import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import PageHero from '../components/ui/PageHero'
import Panel from '../components/ui/Panel'
import DataTableShell from '../components/ui/DataTableShell'
import FilterBar from '../components/ui/FilterBar'
import StatBadge from '../components/ui/StatBadge'
import apiService from '../services/api'
import { heroBanners } from '../theme/heroBanners'

function Seasons() {
  const [standings, setStandings] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [owners, setOwners] = useState([])
  const [selectedOwnerForChart, setSelectedOwnerForChart] = useState(null)
  const [playoffs, setPlayoffs] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seasonsResponse, standingsResponse, ownersResponse, playoffsResponse] = await Promise.all([
          apiService.getSeasons(),
          apiService.getAllStandings(),
          apiService.getOwners(),
          apiService.getAllPlayoffs(),
        ])

        setYears(seasonsResponse.data.years)
        setStandings(standingsResponse.data)

        const sortedOwners = ownersResponse.data.sort((a, b) => a.owner.localeCompare(b.owner))
        setOwners(sortedOwners)
        if (sortedOwners.length > 0) {
          setSelectedOwnerForChart(sortedOwners[0])
        }

        setSelectedYear(seasonsResponse.data.latest_season)
        setPlayoffs(playoffsResponse.data.sort((a, b) => b.year - a.year))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getPlayoffStatus = (finalStanding) => {
    if (finalStanding === 1) {
      return { text: 'Champion', medal: '🥇', color: 'text-yellow-400' }
    } else if (finalStanding === 2) {
      return { text: 'Runner-up', medal: '🥈', color: 'text-gray-300' }
    } else if (finalStanding === 3) {
      return { text: '3rd Place', medal: '🥉', color: 'text-orange-400' }
    } else if (finalStanding >= 4 && finalStanding <= 6) {
      return { text: 'Made Playoffs (outside top 3)', medal: '✓', color: 'text-green-400' }
    } else if (finalStanding >= 7) {
      return { text: 'Missed Playoffs', medal: '✗', color: 'text-red-400' }
    } else {
      return { text: 'No Data', medal: '-', color: 'text-white/30' }
    }
  }

  const getOrdinalSuffix = (num) => {
    const j = num % 10
    const k = num % 100
    if (j === 1 && k !== 11) return `${num}st`
    if (j === 2 && k !== 12) return `${num}nd`
    if (j === 3 && k !== 13) return `${num}rd`
    return `${num}th`
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const playoffInfo = getPlayoffStatus(data.final_standing)

      const yearStandings = standings.filter((s) => s.year === data.year)
      const lastPlaceStanding = Math.max(...yearStandings.map((s) => s.standing))
      const isToiletBowl = data.standing === lastPlaceStanding

      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
          <p className="text-white font-bold text-lg mb-2">{data.year} Season</p>

          <div className="space-y-1 mb-3">
            <p className="text-blue-400 font-semibold">
              Wins: <span className="text-white">{data.wins}</span>
            </p>
            <p className="text-red-400 font-semibold">
              Losses: <span className="text-white">{data.losses}</span>
            </p>
          </div>

          <div className="border-t border-white/10 pt-2 space-y-1">
            <p className="text-purple-400 text-sm">
              Regular Season:{' '}
              <span className="text-white font-semibold">{getOrdinalSuffix(data.standing)} place</span>
              {isToiletBowl && <span className="ml-2 text-xl">🚽</span>}
            </p>

            <div className="flex items-center space-x-2">
              <span className="text-2xl">{playoffInfo.medal}</span>
              <p className={`${playoffInfo.color} font-semibold text-sm`}>{playoffInfo.text}</p>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  const filteredStandings = standings.filter((s) => s.year === selectedYear)

  const renderTrophy = (finalStanding, regularStanding, year) => {
    const yearStandings = standings.filter((s) => s.year === year)
    const lastPlaceStanding = Math.max(...yearStandings.map((s) => s.standing))
    const isToiletBowl = regularStanding === lastPlaceStanding

    if (finalStanding === 1) {
      return (
        <>
          <span className="text-2xl" title="Champion" aria-hidden="true">
            🥇
          </span>
          <span className="sr-only">Champion</span>
        </>
      )
    } else if (finalStanding === 2) {
      return (
        <>
          <span className="text-2xl" title="Runner-up" aria-hidden="true">
            🥈
          </span>
          <span className="sr-only">Runner-up</span>
        </>
      )
    } else if (finalStanding === 3) {
      return (
        <>
          <span className="text-2xl" title="3rd Place" aria-hidden="true">
            🥉
          </span>
          <span className="sr-only">3rd Place</span>
        </>
      )
    } else if (isToiletBowl) {
      return (
        <>
          <span className="text-2xl" title="Toilet Bowl (Last Place)" aria-hidden="true">
            🚽
          </span>
          <span className="sr-only">Toilet Bowl (Last Place)</span>
        </>
      )
    }

    return (
      <>
        <span className="text-white/30" aria-hidden="true">-</span>
        <span className="sr-only">No podium finish</span>
      </>
    )
  }

  const trophySummary = useMemo(() => {
    const championCount = playoffs.filter((p) => p.champion_owner || p.champion).length
    return {
      seasons: years.length,
      owners: owners.length,
      championCount,
    }
  }, [playoffs, years, owners])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <PageHero
        {...heroBanners.seasons}
        eyebrow="Valley Natives Archive"
        title="Season Archive"
        subtitle="League-wide standings and playoff outcomes with cleaner navigation through every year."
        actions={
          <FilterBar>
            <StatBadge tone="top" label={`${trophySummary.seasons} seasons`} />
            <StatBadge tone="champion" label={`${trophySummary.owners} owners`} />
            <StatBadge tone="rivalry" label={`${trophySummary.championCount} champions`} />
          </FilterBar>
        }
      />

      {owners.length > 0 && selectedOwnerForChart && (
        <Panel
          title="Owner Performance Over Time"
          subtitle="Track each owner’s regular-season trajectory and playoff outcome context."
        >
          <FilterBar className="mb-4">
            <label className="text-xs uppercase tracking-wide text-white/60" htmlFor="owner-performance-select">
              Select owner
            </label>
            <select
              id="owner-performance-select"
              aria-label="Select owner"
              data-testid="owner-select"
              value={selectedOwnerForChart?.owner || ''}
              onChange={(e) => setSelectedOwnerForChart(owners.find((o) => o.owner === e.target.value))}
              className="min-w-52 rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-white focus-visible:ring-2 focus-visible:ring-[var(--vn-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {owners.map((owner) => (
                <option key={owner.owner} value={owner.owner}>
                  {owner.owner} ({owner.first_season === owner.last_season
                    ? owner.first_season
                    : `${owner.first_season}-${owner.last_season}`})
                </option>
              ))}
            </select>
          </FilterBar>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={selectedOwnerForChart.seasons} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#a78bfa" style={{ fontSize: '14px', fontWeight: '500' }} />
                <YAxis stroke="#a78bfa" style={{ fontSize: '14px', fontWeight: '500' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
                <Line
                  type="monotone"
                  dataKey="wins"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Wins"
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="losses"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Losses"
                  dot={{ fill: '#ef4444', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 p-3">
              <p className="text-xl font-bold text-blue-300">{selectedOwnerForChart.all_time.wins}</p>
              <p className="text-xs text-white/70">Career Wins</p>
            </div>
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3">
              <p className="text-xl font-bold text-red-300">{selectedOwnerForChart.all_time.losses}</p>
              <p className="text-xs text-white/70">Career Losses</p>
            </div>
            <div className="rounded-lg border border-yellow-400/30 bg-yellow-500/10 p-3">
              <p className="text-xl font-bold text-yellow-300">{selectedOwnerForChart.all_time.championships}</p>
              <p className="text-xs text-white/70">Championships</p>
            </div>
            <div className="rounded-lg border border-green-400/30 bg-green-500/10 p-3">
              <p className="text-xl font-bold text-green-300">{selectedOwnerForChart.all_time.playoff_appearances}</p>
              <p className="text-xs text-white/70">Playoff Appearances</p>
            </div>
            <div className="rounded-lg border border-orange-400/30 bg-orange-500/10 p-3">
              <p className="text-xl font-bold text-orange-300">{selectedOwnerForChart.all_time.toilet_bowl}</p>
              <p className="text-xs text-white/70">Toilet Bowls 🚽</p>
            </div>
          </div>
        </Panel>
      )}

      <Panel
        title="Season Standings"
        subtitle="Browse each regular season while keeping playoff result semantics intact."
        actions={
          <FilterBar>
            <label className="text-xs uppercase tracking-wide text-white/60" htmlFor="season-select">
              Select season
            </label>
            <select
              id="season-select"
              aria-label="Select season"
              data-testid="season-select"
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="min-w-40 rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-white focus-visible:ring-2 focus-visible:ring-[var(--vn-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year} Season
                </option>
              ))}
            </select>
            <StatBadge tone="neutral" label={`${filteredStandings.length} teams`} />
          </FilterBar>
        }
      >
        <DataTableShell title={`${selectedYear || ''} Standings`}>
          <div className="vn-table-scroll" tabIndex={0} aria-label="Season standings table scroll container">
            <table aria-label="Season standings table" className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/60 uppercase tracking-wide text-xs">
                <th className="px-3 py-2">Rank</th>
                <th className="px-3 py-2">Team</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Record</th>
                <th className="px-3 py-2">Points For</th>
                <th className="px-3 py-2">Points Against</th>
                <th className="px-3 py-2 text-center">Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredStandings.map((team) => (
                <tr key={`${team.year}-${team.team_name}`} className="border-b border-white/5">
                  <td className="px-3 py-3 text-white/80 font-semibold">{team.standing}</td>
                  <td className="px-3 py-3 text-white font-semibold">{team.team_name}</td>
                  <td className="px-3 py-3 text-white/70">{team.owner}</td>
                  <td className="px-3 py-3 text-blue-300 font-semibold">
                    {team.wins}-{team.losses}
                    {team.ties > 0 && `-${team.ties}`}
                  </td>
                  <td className="px-3 py-3 text-green-300 font-semibold">{team.points_for.toFixed(2)}</td>
                  <td className="px-3 py-3 text-red-300 font-semibold">{team.points_against.toFixed(2)}</td>
                  <td className="px-3 py-3 text-center">
                    {renderTrophy(team.final_standing, team.standing, team.year)}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </DataTableShell>
      </Panel>

      <Panel
        title="Championship History"
        subtitle="Card archive plus timeline table for champions, runner-up teams, and 3rd-place finishes."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playoffs.map((playoff) => (
            <article
              key={playoff.year}
              className="rounded-xl border border-white/10 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-blue-300">{playoff.year}</h3>
                <span className="text-2xl">🏆</span>
              </div>
              <p className="text-xs uppercase tracking-wide text-yellow-300/70">Champion</p>
              <p className="text-lg font-semibold text-yellow-300">{playoff.champion_owner || playoff.champion || 'N/A'}</p>
              {playoff.champion_owner && playoff.champion && (
                <p className="text-xs text-yellow-200/70">{playoff.champion}</p>
              )}
              <p className="mt-3 text-sm text-white/70">🥈 {playoff.runner_up_owner || 'N/A'}</p>
              <p className="text-sm text-white/70">🥉 {playoff.third_place_owner || 'N/A'}</p>
            </article>
          ))}
        </div>

        <div className="mt-5">
          <DataTableShell title="Championship Timeline" subtitle="Season-by-season podium results.">
            <div className="vn-table-scroll" tabIndex={0} aria-label="Championship timeline table scroll container">
              <table aria-label="Championship timeline table" className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/60 uppercase tracking-wide text-xs">
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Champion</th>
                  <th className="px-3 py-2">Runner-Up</th>
                  <th className="px-3 py-2">3rd Place</th>
                </tr>
              </thead>
              <tbody>
                {playoffs.map((playoff) => (
                  <tr key={`timeline-${playoff.year}`} className="border-b border-white/5">
                    <td className="px-3 py-3 text-purple-300 font-semibold">{playoff.year}</td>
                    <td className="px-3 py-3 text-yellow-300 font-semibold">{playoff.champion_owner || playoff.champion || 'N/A'}</td>
                    <td className="px-3 py-3 text-gray-300">{playoff.runner_up_owner || 'N/A'}</td>
                    <td className="px-3 py-3 text-orange-300">{playoff.third_place_owner || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </DataTableShell>
        </div>
      </Panel>
    </div>
  )
}

export default Seasons
