import { useEffect, useMemo, useState } from 'react'
import PageHero from '../components/ui/PageHero'
import Panel from '../components/ui/Panel'
import DataTableShell from '../components/ui/DataTableShell'
import StatBadge from '../components/ui/StatBadge'
import apiService from '../services/api'

function Records() {
  const [records, setRecords] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getRecords()
        setRecords(response.data)
      } catch (error) {
        console.error('Error fetching records:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const sectionCounts = useMemo(() => {
    if (!records) {
      return { interesting: 0, singleGame: 0, season: 0, streak: 0, wild: 0 }
    }

    return {
      interesting: [
        records.best_champion,
        records.worst_team_best_result,
        records.unluckiest_reg_season_winner,
        records.best_team_worst_result,
      ].filter(Boolean).length,
      singleGame: [
        records.highest_score,
        records.lowest_score,
        records.biggest_blowout,
        records.closest_game,
      ].filter(Boolean).length,
      season: [
        records.most_points_season,
        records.most_wins_season,
        records.fewest_wins_season,
        records.most_points_against_season,
      ].filter(Boolean).length,
      streak: [records.longest_win_streak, records.longest_loss_streak].filter(Boolean).length,
      wild: [
        records.highest_scoring_loss,
        records.lowest_scoring_win,
        records.most_combined_points,
        records.fewest_points_season,
      ].filter(Boolean).length,
    }
  }, [records])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const toFixed2 = (value) => Number(value).toFixed(2)
  const seasonSpanLabel = (record) => {
    if (!record) {
      return 'Archive'
    }

    return record.start_year === record.end_year
      ? `${record.start_year}`
      : `${record.start_year}-${record.end_year}`
  }

  const interestingResults = [
    records?.best_champion
      ? {
          key: 'best-champion',
          title: 'Best Champion',
          tone: 'champion',
          record: records.best_champion,
          summary: `${records.best_champion.wins}-${records.best_champion.losses} record, ${toFixed2(records.best_champion.points_for)} points`,
          note: `${toFixed2(records.best_champion.points_gap)} point gap over 2nd place in points`,
          outcome: 'Won Championship',
        }
      : null,
    records?.worst_team_best_result
      ? {
          key: 'worst-champion',
          title: 'Worst Champion',
          tone: 'warning',
          record: records.worst_team_best_result,
          summary: `${records.worst_team_best_result.wins}-${records.worst_team_best_result.losses} record, ${toFixed2(records.worst_team_best_result.points_for)} points`,
          note: `Ranked #${records.worst_team_best_result.points_rank} out of ${records.worst_team_best_result.total_teams} in points`,
          outcome: 'Won Championship',
        }
      : null,
    records?.unluckiest_reg_season_winner
      ? {
          key: 'unluckiest-winner',
          title: 'Unluckiest Regular Season Winner',
          tone: 'rivalry',
          record: records.unluckiest_reg_season_winner,
          summary: `${records.unluckiest_reg_season_winner.wins}-${records.unluckiest_reg_season_winner.losses} record, ${toFixed2(records.unluckiest_reg_season_winner.points_for)} points`,
          note: `${toFixed2(records.unluckiest_reg_season_winner.points_gap)} point gap over 2nd place`,
          outcome: `Finished #${records.unluckiest_reg_season_winner.final_standing} - No Championship`,
        }
      : null,
    records?.best_team_worst_result
      ? {
          key: 'best-team-worst-result',
          title: 'Best Team, Worst Result',
          tone: 'top',
          record: records.best_team_worst_result,
          summary: `${records.best_team_worst_result.wins}-${records.best_team_worst_result.losses} record, ${toFixed2(records.best_team_worst_result.points_for)} points`,
          note: `Ranked #${records.best_team_worst_result.points_rank} in points`,
          outcome: `Finished #${records.best_team_worst_result.final_standing} overall (↓ ${records.best_team_worst_result.standing_gap} place gap)`,
        }
      : null,
  ].filter(Boolean)

  const singleGameRecords = [
    records?.highest_score
      ? {
          key: 'highest-score',
          record: 'Highest Score',
          value: records.highest_score.score,
          entry: `${records.highest_score.team}${records.highest_score.owner ? ` (${records.highest_score.owner})` : ''}`,
          detail: `vs ${records.highest_score.opponent}`,
          context: `Week ${records.highest_score.week}, ${records.highest_score.year}`,
        }
      : null,
    records?.lowest_score
      ? {
          key: 'lowest-score',
          record: 'Lowest Score',
          value: records.lowest_score.score,
          entry: `${records.lowest_score.team}${records.lowest_score.owner ? ` (${records.lowest_score.owner})` : ''}`,
          detail: `vs ${records.lowest_score.opponent}`,
          context: `Week ${records.lowest_score.week}, ${records.lowest_score.year}`,
        }
      : null,
    records?.biggest_blowout
      ? {
          key: 'biggest-blowout',
          record: 'Biggest Blowout',
          value: `${toFixed2(records.biggest_blowout.point_differential)} points`,
          entry: `${records.biggest_blowout.winner}${records.biggest_blowout.winner_owner ? ` (${records.biggest_blowout.winner_owner})` : ''} - ${records.biggest_blowout.winner_score}`,
          detail: `defeated ${records.biggest_blowout.loser}${records.biggest_blowout.loser_owner ? ` (${records.biggest_blowout.loser_owner})` : ''} - ${records.biggest_blowout.loser_score}`,
          context: `Week ${records.biggest_blowout.week}, ${records.biggest_blowout.year}`,
        }
      : null,
    records?.closest_game
      ? {
          key: 'closest-game',
          record: 'Closest Game',
          value: `${toFixed2(records.closest_game.point_differential)} points`,
          entry: `${records.closest_game.winner}${records.closest_game.winner_owner ? ` (${records.closest_game.winner_owner})` : ''} - ${records.closest_game.winner_score}`,
          detail: `edged out ${records.closest_game.loser}${records.closest_game.loser_owner ? ` (${records.closest_game.loser_owner})` : ''} - ${records.closest_game.loser_score}`,
          context: `Week ${records.closest_game.week}, ${records.closest_game.year}`,
        }
      : null,
  ].filter(Boolean)

  const seasonRecords = [
    records?.most_points_season
      ? {
          key: 'most-points-season',
          record: 'Most Points',
          value: toFixed2(records.most_points_season.points_for),
          entry: `${records.most_points_season.team_name} (${records.most_points_season.owner})`,
          detail: `${records.most_points_season.wins}-${records.most_points_season.losses} record`,
          context: `${records.most_points_season.year} season`,
        }
      : null,
    records?.most_wins_season
      ? {
          key: 'most-wins-season',
          record: 'Most Wins',
          value: `${records.most_wins_season.wins} wins`,
          entry: `${records.most_wins_season.team_name} (${records.most_wins_season.owner})`,
          detail: `${toFixed2(records.most_wins_season.points_for)} points for`,
          context: `${records.most_wins_season.year} season`,
        }
      : null,
    records?.fewest_wins_season
      ? {
          key: 'fewest-wins-season',
          record: 'Fewest Wins',
          value: `${records.fewest_wins_season.wins} wins`,
          entry: `${records.fewest_wins_season.team_name} (${records.fewest_wins_season.owner})`,
          detail: `${records.fewest_wins_season.wins}-${records.fewest_wins_season.losses} record`,
          context: `${records.fewest_wins_season.year} season`,
        }
      : null,
    records?.most_points_against_season
      ? {
          key: 'most-points-against-season',
          record: 'Most Points Against',
          value: toFixed2(records.most_points_against_season.points_against),
          entry: `${records.most_points_against_season.team_name} (${records.most_points_against_season.owner})`,
          detail: `Unluckiest team - ${records.most_points_against_season.wins}-${records.most_points_against_season.losses} record`,
          context: `${records.most_points_against_season.year} season`,
        }
      : null,
  ].filter(Boolean)

  const streakRecords = [
    records?.longest_win_streak
      ? {
          key: 'longest-win-streak',
          record: 'Longest Win Streak',
          value: `${records.longest_win_streak.streak} wins`,
          entry: records.longest_win_streak.owner,
          detail: `Week ${records.longest_win_streak.start_week} ${records.longest_win_streak.start_year} → Week ${records.longest_win_streak.end_week} ${records.longest_win_streak.end_year}`,
          context: seasonSpanLabel(records.longest_win_streak),
        }
      : null,
    records?.longest_loss_streak
      ? {
          key: 'longest-loss-streak',
          record: 'Longest Loss Streak',
          value: `${records.longest_loss_streak.streak} losses`,
          entry: records.longest_loss_streak.owner,
          detail: `Week ${records.longest_loss_streak.start_week} ${records.longest_loss_streak.start_year} → Week ${records.longest_loss_streak.end_week} ${records.longest_loss_streak.end_year}`,
          context: seasonSpanLabel(records.longest_loss_streak),
        }
      : null,
  ].filter(Boolean)

  const wildRecords = [
    records?.highest_scoring_loss
      ? {
          key: 'highest-scoring-loss',
          record: 'Highest Scoring Loss',
          value: toFixed2(records.highest_scoring_loss.score),
          entry: `${records.highest_scoring_loss.team}${records.highest_scoring_loss.owner ? ` (${records.highest_scoring_loss.owner})` : ''}`,
          detail: `Lost to ${records.highest_scoring_loss.opponent}${records.highest_scoring_loss.opponent_owner ? ` (${records.highest_scoring_loss.opponent_owner})` : ''} - ${toFixed2(records.highest_scoring_loss.opponent_score)}`,
          context: `Week ${records.highest_scoring_loss.week}, ${records.highest_scoring_loss.year}`,
        }
      : null,
    records?.lowest_scoring_win
      ? {
          key: 'lowest-scoring-win',
          record: 'Lowest Scoring Win',
          value: toFixed2(records.lowest_scoring_win.score),
          entry: `${records.lowest_scoring_win.team}${records.lowest_scoring_win.owner ? ` (${records.lowest_scoring_win.owner})` : ''}`,
          detail: `Beat ${records.lowest_scoring_win.opponent}${records.lowest_scoring_win.opponent_owner ? ` (${records.lowest_scoring_win.opponent_owner})` : ''} - ${toFixed2(records.lowest_scoring_win.opponent_score)}`,
          context: `Week ${records.lowest_scoring_win.week}, ${records.lowest_scoring_win.year}`,
        }
      : null,
    records?.most_combined_points
      ? {
          key: 'most-combined-points',
          record: 'Most Combined Points',
          value: toFixed2(records.most_combined_points.combined_points),
          entry: `${records.most_combined_points.home_team}${records.most_combined_points.home_owner ? ` (${records.most_combined_points.home_owner})` : ''} - ${toFixed2(records.most_combined_points.home_score)}`,
          detail: `vs ${records.most_combined_points.away_team}${records.most_combined_points.away_owner ? ` (${records.most_combined_points.away_owner})` : ''} - ${toFixed2(records.most_combined_points.away_score)}`,
          context: `Week ${records.most_combined_points.week}, ${records.most_combined_points.year}`,
        }
      : null,
    records?.fewest_points_season
      ? {
          key: 'fewest-points-season',
          record: 'Fewest Points',
          value: toFixed2(records.fewest_points_season.points_for),
          entry: `${records.fewest_points_season.team_name} (${records.fewest_points_season.owner})`,
          detail: `${records.fewest_points_season.wins}-${records.fewest_points_season.losses} record`,
          context: `${records.fewest_points_season.year} season`,
        }
      : null,
  ].filter(Boolean)

  const renderTable = (rows, tableLabel) => (
    <DataTableShell empty={!rows.length} emptyMessage="No records available yet.">
      <div className="vn-table-scroll" tabIndex={0} aria-label={`${tableLabel} scroll container`}>
        <table aria-label={tableLabel} className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-white/60 uppercase tracking-wide text-xs">
              <th className="px-3 py-2">Record</th>
              <th className="px-3 py-2">Value</th>
              <th className="px-3 py-2">Entry</th>
              <th className="px-3 py-2">Context</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-white/5 align-top">
                <td className="px-3 py-3 font-semibold text-white">{row.record}</td>
                <td className="px-3 py-3 text-yellow-300 font-semibold">{row.value}</td>
                <td className="px-3 py-3 text-white/80">
                  <div>{row.entry}</div>
                  <div className="text-white/60 text-xs mt-1">{row.detail}</div>
                </td>
                <td className="px-3 py-3 text-white/60 text-xs">{row.context}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataTableShell>
  )

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Valley Natives Archive"
        title="League Records & Milestones"
        subtitle="An archival hierarchy of single-game feats, seasonal landmarks, and historical outliers."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <StatBadge tone="champion" label={`${sectionCounts.interesting} interesting`} />
            <StatBadge tone="top" label={`${sectionCounts.singleGame} single-game`} />
            <StatBadge tone="rivalry" label={`${sectionCounts.season} season`} />
            <StatBadge tone="warning" label={`${sectionCounts.streak} streak`} />
            <StatBadge tone="neutral" label={`${sectionCounts.wild} wild`} />
          </div>
        }
      />

      <Panel title="Interesting Results" subtitle="Championship outcomes that defied expectations.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interestingResults.map((item) => (
            <article key={item.key} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <StatBadge tone={item.tone} label={`${item.record.year}`} />
              </div>
              <p className="text-sm text-white/80">
                {item.record.team_name}
                {item.record.owner ? <span className="text-white/60"> ({item.record.owner})</span> : null}
              </p>
              <p className="text-sm text-white/70">{item.summary}</p>
              <p className="text-sm text-white/60">{item.note}</p>
              <p className="text-sm text-yellow-300 font-medium">{item.outcome}</p>
              <p className="text-xs text-white/50">{item.record.year} season</p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Single Game Records" subtitle="Weekly extremes across the full archive.">
        {renderTable(singleGameRecords, 'Single game records table')}
      </Panel>

      <Panel title="Season Records" subtitle="Best and worst full-season outcomes.">
        {renderTable(seasonRecords, 'Season records table')}
      </Panel>

      <Panel title="Streak Records" subtitle="Longest sustained runs across seasons.">
        {renderTable(streakRecords, 'Streak records table')}
      </Panel>

      <Panel title="Wild Records" subtitle="Outlier events that still define league history.">
        {renderTable(wildRecords, 'Wild records table')}
      </Panel>
    </div>
  )
}

export default Records
