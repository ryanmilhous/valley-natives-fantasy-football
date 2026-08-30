import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import apiService from '../services/api'
import BrandWordmark from '../components/brand/BrandWordmark'
import DataTableShell from '../components/ui/DataTableShell'
import FilterBar from '../components/ui/FilterBar'
import PageHero from '../components/ui/PageHero'
import Panel from '../components/ui/Panel'
import StatBadge from '../components/ui/StatBadge'

const HeaderWithTooltip = ({ children, tooltip, onClick, buttonLabel }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      })
      setShowTooltip(true)
    }
  }

  return (
    <>
      {onClick ? (
        <button
          ref={triggerRef}
          type="button"
          aria-label={buttonLabel || tooltip}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={handleMouseEnter}
          onBlur={() => setShowTooltip(false)}
          onClick={onClick}
          className="cursor-pointer inline-flex items-center rounded-md px-1 focus-visible:ring-2 focus-visible:ring-[var(--vn-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          {children}
        </button>
      ) : (
        <span
          ref={triggerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setShowTooltip(false)}
          className="inline-block"
        >
          {children}
        </span>
      )}
      {showTooltip &&
        createPortal(
          <div
            className="fixed z-[9999] px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl border border-white/20 whitespace-nowrap pointer-events-none"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

const AchievementBadge = ({ emoji, count, years, bgColor, textColor, borderColor }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)

  const showBadgeTooltip = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      })
    }
    setShowTooltip(true)
  }

  if (count === 0) {
    return <span className="text-white/30">-</span>
  }

  return (
    <div className="inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${count} achievements${years.length ? ` in ${years.join(', ')}` : ''}`}
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${bgColor} ${textColor} font-bold border ${borderColor} hover:opacity-80 transition-all cursor-pointer`}
        onMouseEnter={showBadgeTooltip}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={showBadgeTooltip}
        onBlur={() => setShowTooltip(false)}
      >
        <span>{emoji}</span>
        <span>{count}</span>
      </button>
      {showTooltip &&
        years.length > 0 &&
        createPortal(
          <div
            className="fixed z-[9999] px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg border border-white/20 whitespace-nowrap pointer-events-none"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            Years: {years.join(', ')}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

function Home() {
  const [metadata, setMetadata] = useState(null)
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState({ key: 'rankingPoints', direction: 'desc' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metaResponse, ownersResponse] = await Promise.all([
          apiService.getMetadata(),
          apiService.getOwners(),
        ])
        setMetadata(metaResponse.data)
        setOwners(ownersResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-white/70 mt-4 font-medium">Loading your league data...</p>
        </div>
      </div>
    )
  }

  const championshipTrophyData = []
  owners.forEach((owner) => {
    const years = owner.all_time.championship_years || []
    years.forEach((year) => {
      const season = owner.seasons.find((s) => s.year === year)
      championshipTrophyData.push({
        year,
        owner: owner.owner,
        team_name: season?.team_name || 'Unknown',
      })
    })
  })
  championshipTrophyData.sort((a, b) => a.year - b.year)

  const toiletBowlTrophyData = []
  owners.forEach((owner) => {
    const years = owner.all_time.toilet_bowl_years || []
    years.forEach((year) => {
      const season = owner.seasons.find((s) => s.year === year)
      toiletBowlTrophyData.push({
        year,
        owner: owner.owner,
        team_name: season?.team_name || 'Unknown',
      })
    })
  })
  toiletBowlTrophyData.sort((a, b) => a.year - b.year)

  const championshipData = owners
    .map((owner) => ({
      owner: owner.owner,
      championships: owner.all_time.championships,
      years: owner.all_time.championship_years || [],
      rankingPoints: owner.all_time.ranking_points || 0,
    }))
    .filter((o) => o.championships > 0)
    .sort((a, b) => b.rankingPoints - a.rankingPoints)

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortedOwners = () => {
    const sorted = [...owners].sort((a, b) => {
      let aValue
      let bValue

      switch (sortConfig.key) {
        case 'owner':
          aValue = a.owner
          bValue = b.owner
          break
        case 'seasons':
          aValue = a.seasons_played
          bValue = b.seasons_played
          break
        case 'wins':
          aValue = a.all_time.wins
          bValue = b.all_time.wins
          break
        case 'losses':
          aValue = a.all_time.losses
          bValue = b.all_time.losses
          break
        case 'winPct':
          aValue = a.all_time.win_percentage
          bValue = b.all_time.win_percentage
          break
        case 'championships':
          aValue = a.all_time.championships
          bValue = b.all_time.championships
          if (aValue === bValue) {
            return sortConfig.direction === 'desc'
              ? b.all_time.win_percentage - a.all_time.win_percentage
              : a.all_time.win_percentage - b.all_time.win_percentage
          }
          break
        case 'secondPlace':
          aValue = a.all_time.second_place
          bValue = b.all_time.second_place
          break
        case 'thirdPlace':
          aValue = a.all_time.third_place
          bValue = b.all_time.third_place
          break
        case 'playoffAppearances':
          aValue = a.all_time.playoff_appearances || 0
          bValue = b.all_time.playoff_appearances || 0
          break
        case 'toiletBowl':
          aValue = a.all_time.toilet_bowl
          bValue = b.all_time.toilet_bowl
          break
        case 'rankingPoints':
          aValue = a.all_time.ranking_points || 0
          bValue = b.all_time.ranking_points || 0
          if (aValue === bValue) {
            return sortConfig.direction === 'desc'
              ? b.all_time.championships - a.all_time.championships
              : a.all_time.championships - b.all_time.championships
          }
          break
        case 'toiletBowlPct':
          aValue = a.all_time.toilet_bowl_pct || 0
          bValue = b.all_time.toilet_bowl_pct || 0
          break
        case 'top3Pct':
          aValue = a.all_time.top_3_pct || 0
          bValue = b.all_time.top_3_pct || 0
          break
        case 'playoffAppearancePct':
          aValue = a.all_time.playoff_appearance_pct || 0
          bValue = b.all_time.playoff_appearance_pct || 0
          break
        default:
          aValue = a.all_time.ranking_points || 0
          bValue = b.all_time.ranking_points || 0
      }

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    })

    return sorted
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <span className="text-white/30 ml-1">⇅</span>
    }
    return sortConfig.direction === 'asc' ? (
      <span className="text-purple-400 ml-1">↑</span>
    ) : (
      <span className="text-purple-400 ml-1">↓</span>
    )
  }

  const getAriaSort = (column) => {
    if (sortConfig.key !== column) {
      return 'none'
    }
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending'
  }

  return (
    <div className="space-y-6">
      <PageHero
        className="border border-white/10 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"
        eyebrow="League history"
        title={metadata?.league_name || 'Fantasy Football League'}
        subtitle={`${metadata?.first_season}-${metadata?.latest_season} • ${metadata?.total_seasons} seasons • ${metadata?.total_owners} owners`}
        actions={<BrandWordmark subtitle="Fantasy Football" />}
      >
        <FilterBar>
          <StatBadge tone="top" label={`${metadata?.latest_season || ''} season`} />
          <StatBadge tone="champion" label={`${metadata?.total_owners || 0} owners`} />
        </FilterBar>
      </PageHero>

      <DataTableShell
        className="bg-slate-900/80 border border-white/10"
        title="📊 All-Time Standings"
        subtitle="Regular season records only (playoffs excluded)"
        actions={
          <FilterBar>
            <StatBadge
              tone="neutral"
              label={`Sort: ${sortConfig.key} (${sortConfig.direction})`}
            />
          </FilterBar>
        }
      >
        <div
          className="vn-table-scroll"
          tabIndex={0}
          aria-label="All-time owner standings table scroll container"
        >
          <table aria-label="All-time owner standings table" className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase relative">
                <HeaderWithTooltip tooltip="Rank">#</HeaderWithTooltip>
              </th>
              <th
                className="px-2 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('owner')}
              >
                <HeaderWithTooltip
                  tooltip="Owner Name"
                  onClick={() => handleSort('owner')}
                  buttonLabel="Sort by owner"
                >
                  Owner
                  <SortIcon column="owner" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('seasons')}
              >
                <HeaderWithTooltip
                  tooltip="Seasons Played"
                  onClick={() => handleSort('seasons')}
                  buttonLabel="Sort by seasons played"
                >
                  Seas
                  <SortIcon column="seasons" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('wins')}
              >
                <HeaderWithTooltip
                  tooltip="Wins (Regular Season)"
                  onClick={() => handleSort('wins')}
                  buttonLabel="Sort by wins"
                >
                  W
                  <SortIcon column="wins" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('losses')}
              >
                <HeaderWithTooltip
                  tooltip="Losses (Regular Season)"
                  onClick={() => handleSort('losses')}
                  buttonLabel="Sort by losses"
                >
                  L
                  <SortIcon column="losses" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('winPct')}
              >
                <HeaderWithTooltip
                  tooltip="Win Percentage (Regular Season)"
                  onClick={() => handleSort('winPct')}
                  buttonLabel="Sort by win percentage"
                >
                  W%
                  <SortIcon column="winPct" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('championships')}
              >
                <HeaderWithTooltip
                  tooltip="Championships (1st Place Finishes)"
                  onClick={() => handleSort('championships')}
                  buttonLabel="Sort by championships"
                >
                  1st
                  <SortIcon column="championships" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('secondPlace')}
              >
                <HeaderWithTooltip
                  tooltip="Second Place Finishes"
                  onClick={() => handleSort('secondPlace')}
                  buttonLabel="Sort by second-place finishes"
                >
                  2nd
                  <SortIcon column="secondPlace" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('thirdPlace')}
              >
                <HeaderWithTooltip
                  tooltip="Third Place Finishes"
                  onClick={() => handleSort('thirdPlace')}
                  buttonLabel="Sort by third-place finishes"
                >
                  3rd
                  <SortIcon column="thirdPlace" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('playoffAppearances')}
              >
                <HeaderWithTooltip
                  tooltip="Playoff Appearances"
                  onClick={() => handleSort('playoffAppearances')}
                  buttonLabel="Sort by playoff appearances"
                >
                  PO
                  <SortIcon column="playoffAppearances" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('toiletBowl')}
              >
                <HeaderWithTooltip
                  tooltip="Toilet Bowl Finishes (Last Place)"
                  onClick={() => handleSort('toiletBowl')}
                  buttonLabel="Sort by toilet bowl finishes"
                >
                  🚽
                  <SortIcon column="toiletBowl" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('toiletBowlPct')}
              >
                <HeaderWithTooltip
                  tooltip="Toilet Bowl Percentage"
                  onClick={() => handleSort('toiletBowlPct')}
                  buttonLabel="Sort by toilet bowl percentage"
                >
                  🚽%
                  <SortIcon column="toiletBowlPct" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('top3Pct')}
              >
                <HeaderWithTooltip
                  tooltip="Top 3 Finish Percentage (1st, 2nd, or 3rd)"
                  onClick={() => handleSort('top3Pct')}
                  buttonLabel="Sort by top three percentage"
                >
                  T3%
                  <SortIcon column="top3Pct" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('playoffAppearancePct')}
              >
                <HeaderWithTooltip
                  tooltip="Playoff Appearance Percentage - Excludes 2006 from calculation (except Kellen & Chris who were 1st/2nd)"
                  onClick={() => handleSort('playoffAppearancePct')}
                  buttonLabel="Sort by playoff appearance percentage"
                >
                  PO%
                  <SortIcon column="playoffAppearancePct" />
                </HeaderWithTooltip>
              </th>
              <th
                className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                aria-sort={getAriaSort('rankingPoints')}
              >
                <HeaderWithTooltip
                  tooltip="Ranking Points (+7 for 1st, +3 for 2nd, +1 for 3rd, -1 for Toilet Bowl)"
                  onClick={() => handleSort('rankingPoints')}
                  buttonLabel="Sort by ranking points"
                >
                  Pts
                  <SortIcon column="rankingPoints" />
                </HeaderWithTooltip>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {getSortedOwners().map((owner, index) => {
              const winPct = owner.all_time.win_percentage
              const yearRange =
                owner.first_season === owner.last_season
                  ? owner.first_season
                  : `${owner.first_season}-${owner.last_season}`

              const firstPlaceYears = owner.all_time.championship_years || []
              const secondPlaceYears = owner.all_time.second_place_years || []
              const thirdPlaceYears = owner.all_time.third_place_years || []
              const toiletBowlYears = owner.all_time.toilet_bowl_years || []

              return (
                <tr key={owner.owner} className="hover:bg-white/5 transition-colors duration-200 group">
                  <td className="px-1 py-3 whitespace-nowrap">
                    <span
                      className={`text-sm font-bold ${
                        index === 0
                          ? 'text-yellow-400'
                          : index === 1
                            ? 'text-gray-300'
                            : index === 2
                              ? 'text-orange-400'
                              : 'text-white/70'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <div className="text-white font-semibold text-sm">{owner.owner}</div>
                    <div className="text-xs text-white/50">{yearRange}</div>
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap text-purple-400 font-semibold">
                    {owner.seasons_played}
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap text-green-400 font-semibold">
                    {owner.all_time.wins}
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap text-red-400 font-semibold">
                    {owner.all_time.losses}
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap text-blue-400 font-semibold">{winPct}%</td>
                  <td className="px-1 py-3 whitespace-nowrap">
                    <AchievementBadge
                      emoji="🏆"
                      count={owner.all_time.championships}
                      years={firstPlaceYears}
                      bgColor="bg-yellow-500/20"
                      textColor="text-yellow-400"
                      borderColor="border-yellow-500/30"
                    />
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap">
                    <AchievementBadge
                      emoji="🥈"
                      count={owner.all_time.second_place}
                      years={secondPlaceYears}
                      bgColor="bg-gray-400/20"
                      textColor="text-gray-300"
                      borderColor="border-gray-400/30"
                    />
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap">
                    <AchievementBadge
                      emoji="🥉"
                      count={owner.all_time.third_place}
                      years={thirdPlaceYears}
                      bgColor="bg-orange-600/20"
                      textColor="text-orange-400"
                      borderColor="border-orange-600/30"
                    />
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap text-blue-400 font-semibold text-sm">
                    {owner.all_time.playoff_appearances || 0}
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap">
                    <AchievementBadge
                      emoji="🚽"
                      count={owner.all_time.toilet_bowl}
                      years={toiletBowlYears}
                      bgColor="bg-[var(--vn-redwood-600)]/20"
                      textColor="text-white"
                      borderColor="border-[var(--vn-redwood-600)]/30"
                    />
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap text-red-400 font-semibold text-sm">
                    {owner.all_time.toilet_bowl_pct || 0}%
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap text-green-400 font-semibold text-sm">
                    {owner.all_time.top_3_pct || 0}%
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap text-cyan-400 font-semibold text-sm">
                    {owner.all_time.playoff_appearance_pct || 0}%
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap">
                    <StatBadge label={`${owner.all_time.ranking_points || 0}`} tone="rivalry" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </DataTableShell>

      <Panel
        className="bg-slate-900/80 border border-white/10"
        title="Ranking System"
        subtitle="How all-time owner rankings are calculated"
      >
        <p className="text-white/70 text-sm sm:text-base">
          Owners are ranked using a point system: <span className="text-yellow-400 font-semibold">+7 points</span>{' '}
          for 1st place,<span className="text-gray-300 font-semibold"> +3 points</span> for 2nd place,
          <span className="text-orange-400 font-semibold"> +1 point</span> for 3rd place, and
          <span className="text-red-400 font-semibold"> -1 point</span> for toilet bowl finishes.
        </p>
      </Panel>

      <Panel
        className="bg-gradient-to-br from-yellow-200/10 via-amber-100/10 to-orange-200/10 border border-yellow-300/30"
        title="🏆 Trophy Case"
        subtitle={`${championshipData.length} championship-era owners represented`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel className="bg-black/20 border border-yellow-500/20" title="Championship">
            <div className="flex flex-col gap-4">
              <img
                src="/images/championship-trophy.png"
                alt="Championship Trophy"
                className="w-full h-auto max-w-xl mx-auto"
                style={{ mixBlendMode: 'multiply', opacity: 0.95 }}
              />
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {championshipTrophyData.map((champ, index) => (
                  <div key={index} className="text-amber-200 font-semibold">
                    {champ.year} - {champ.owner}
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel className="bg-black/20 border border-amber-500/20" title="Toilet Bowl">
            <div className="flex flex-col gap-4">
              <img
                src="/images/toilet-bowl-trophy.png"
                alt="Toilet Bowl Trophy"
                className="w-full h-auto max-w-xl mx-auto"
                style={{ mixBlendMode: 'multiply', opacity: 0.95 }}
              />
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {toiletBowlTrophyData.map((bowl, index) => (
                  <div key={index} className="text-amber-200 font-semibold">
                    {bowl.year} - {bowl.owner}
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </Panel>
    </div>
  )
}

export default Home
