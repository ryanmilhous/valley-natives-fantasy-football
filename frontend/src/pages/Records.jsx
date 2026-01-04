import { useState, useEffect } from 'react';
import apiService from '../services/api';

function Records() {
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getRecords();
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const RecordCard = ({ title, record, icon, description }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className="text-5xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-purple-400 uppercase tracking-wider">{title}</h3>
            {record?.year && (
              <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {record.year}
              </span>
            )}
          </div>
          {record && (
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">
                {record.score || record.points_for || record.wins || 'N/A'}
              </div>
              <div className="text-sm text-white/80 font-medium">
                {record.team || record.team_name}
                {record.owner && <span className="text-white/60"> ({record.owner})</span>}
              </div>
              {description && <div className="text-xs text-white/60">{description}</div>}
              <div className="text-xs text-white/50">
                Week {record.week}, {record.year}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Data Availability Notice */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500 p-4 rounded-lg backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-300 font-medium">
              <strong>Data Availability:</strong> Records are based on different data sources depending on ESPN API limitations.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-semibold">2007-2025</span>
                <span className="text-white/70">Full league history (season stats)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">2019-2025</span>
                <span className="text-white/70">Matchup data only (game-by-game records)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-8 flex items-center space-x-3">
            <span>🏆</span>
            <span>League Records & Milestones</span>
          </h1>

          {/* Interesting Results */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Interesting Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {records?.best_champion && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">👑</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-wider">Best Champion</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.best_champion.year}
                        </span>
                      </div>
                      <div className="text-sm text-white/80 font-medium mb-2">
                        {records.best_champion.team_name}
                        <span className="text-white/60"> ({records.best_champion.owner})</span>
                      </div>
                      <div className="text-sm text-white/70">
                        <div>{records.best_champion.wins}-{records.best_champion.losses} record, {records.best_champion.points_for.toFixed(2)} points</div>
                        <div className="mt-1"><span className="text-yellow-400 font-semibold">{records.best_champion.points_gap.toFixed(2)} point gap</span> over 2nd place in points</div>
                        <div className="text-green-400 font-bold mt-1">🏆 Won Championship</div>
                      </div>
                      <div className="text-xs text-white/50 mt-2">{records.best_champion.year} season</div>
                    </div>
                  </div>
                </div>
              )}

              {records?.worst_team_best_result && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🍀</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-green-400 uppercase tracking-wider">Worst Champion</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.worst_team_best_result.year}
                        </span>
                      </div>
                      <div className="text-sm text-white/80 font-medium mb-2">
                        {records.worst_team_best_result.team_name}
                        <span className="text-white/60"> ({records.worst_team_best_result.owner})</span>
                      </div>
                      <div className="text-sm text-white/70">
                        <div>{records.worst_team_best_result.wins}-{records.worst_team_best_result.losses} record, {records.worst_team_best_result.points_for.toFixed(2)} points</div>
                        <div className="mt-1">Ranked <span className="text-orange-400 font-semibold">#{records.worst_team_best_result.points_rank}</span> out of {records.worst_team_best_result.total_teams} in points</div>
                        <div className="text-green-400 font-bold mt-1">🏆 Won Championship</div>
                      </div>
                      <div className="text-xs text-white/50 mt-2">{records.worst_team_best_result.year} season</div>
                    </div>
                  </div>
                </div>
              )}

              {records?.unluckiest_reg_season_winner && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">💔</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-purple-400 uppercase tracking-wider">Unluckiest Regular Season Winner</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.unluckiest_reg_season_winner.year}
                        </span>
                      </div>
                      <div className="text-sm text-white/80 font-medium mb-2">
                        {records.unluckiest_reg_season_winner.team_name}
                        <span className="text-white/60"> ({records.unluckiest_reg_season_winner.owner})</span>
                      </div>
                      <div className="text-sm text-white/70">
                        <div>{records.unluckiest_reg_season_winner.wins}-{records.unluckiest_reg_season_winner.losses} record, {records.unluckiest_reg_season_winner.points_for.toFixed(2)} points</div>
                        <div className="mt-1"><span className="text-purple-400 font-semibold">{records.unluckiest_reg_season_winner.points_gap.toFixed(2)} point gap</span> over 2nd place</div>
                        <div className="text-red-400 font-bold mt-1">Finished #{records.unluckiest_reg_season_winner.final_standing} - No Championship 💔</div>
                      </div>
                      <div className="text-xs text-white/50 mt-2">{records.unluckiest_reg_season_winner.year} season</div>
                    </div>
                  </div>
                </div>
              )}

              {records?.best_team_worst_result && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">😤</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-orange-400 uppercase tracking-wider">Best Team, Worst Result</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.best_team_worst_result.year}
                        </span>
                      </div>
                      <div className="text-sm text-white/80 font-medium mb-2">
                        {records.best_team_worst_result.team_name}
                        <span className="text-white/60"> ({records.best_team_worst_result.owner})</span>
                      </div>
                      <div className="text-sm text-white/70">
                        <div>{records.best_team_worst_result.wins}-{records.best_team_worst_result.losses} record, {records.best_team_worst_result.points_for.toFixed(2)} points</div>
                        <div className="mt-1">Ranked <span className="text-green-400 font-semibold">#{records.best_team_worst_result.points_rank}</span> in points</div>
                        <div className="text-orange-400 font-semibold">Finished <span className="text-red-400">#{records.best_team_worst_result.final_standing}</span> overall</div>
                        <div className="text-red-400 font-bold mt-1">↓ {records.best_team_worst_result.standing_gap} place gap</div>
                      </div>
                      <div className="text-xs text-white/50 mt-2">{records.best_team_worst_result.year} season</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Single Game Records */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Single Game Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {records?.highest_score && (
                <RecordCard
                  title="Highest Score"
                  record={records.highest_score}
                  icon="🔥"
                  description={`vs ${records.highest_score.opponent}`}
                />
              )}
              {records?.lowest_score && (
                <RecordCard
                  title="Lowest Score"
                  record={records.lowest_score}
                  icon="❄️"
                  description={`vs ${records.lowest_score.opponent}`}
                />
              )}
              {records?.biggest_blowout && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">💥</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-orange-400 uppercase tracking-wider">Biggest Blowout</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.biggest_blowout.year}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.biggest_blowout.point_differential.toFixed(2)} points
                      </div>
                      <div className="text-sm text-white/80 font-medium">
                        {records.biggest_blowout.winner} ({records.biggest_blowout.winner_score})
                      </div>
                      <div className="text-sm text-red-400/80">
                        defeated {records.biggest_blowout.loser} ({records.biggest_blowout.loser_score})
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        Week {records.biggest_blowout.week}, {records.biggest_blowout.year}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {records?.closest_game && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">⚖️</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wider">Closest Game</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.closest_game.year}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.closest_game.point_differential.toFixed(2)} points
                      </div>
                      <div className="text-sm text-white/80 font-medium">
                        {records.closest_game.winner} ({records.closest_game.winner_score})
                      </div>
                      <div className="text-sm text-cyan-400/80">
                        edged out {records.closest_game.loser} ({records.closest_game.loser_score})
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        Week {records.closest_game.week}, {records.closest_game.year}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Season Records */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Season Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {records?.most_points_season && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">📈</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-green-400 uppercase tracking-wider">Most Points</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.most_points_season.year}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.most_points_season.points_for.toFixed(2)}
                      </div>
                      <div className="text-sm text-white/80 font-medium">{records.most_points_season.team_name}</div>
                      <div className="text-sm text-green-400/80">
                        {records.most_points_season.wins}-{records.most_points_season.losses} record
                      </div>
                      <div className="text-xs text-white/50 mt-1">{records.most_points_season.year} season</div>
                    </div>
                  </div>
                </div>
              )}
              {records?.most_wins_season && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🏅</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-wider">Most Wins</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.most_wins_season.year}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.most_wins_season.wins} wins
                      </div>
                      <div className="text-sm text-white/80 font-medium">{records.most_wins_season.team_name}</div>
                      <div className="text-sm text-yellow-400/80">
                        {records.most_wins_season.points_for.toFixed(2)} points for
                      </div>
                      <div className="text-xs text-white/50 mt-1">{records.most_wins_season.year} season</div>
                    </div>
                  </div>
                </div>
              )}
              {records?.fewest_wins_season && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-pink-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">😬</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-red-400 uppercase tracking-wider">Fewest Wins</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.fewest_wins_season.year}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.fewest_wins_season.wins} wins
                      </div>
                      <div className="text-sm text-white/80 font-medium">{records.fewest_wins_season.team_name}</div>
                      <div className="text-sm text-red-400/80">
                        {records.fewest_wins_season.wins}-{records.fewest_wins_season.losses} record
                      </div>
                      <div className="text-xs text-white/50 mt-1">{records.fewest_wins_season.year} season</div>
                    </div>
                  </div>
                </div>
              )}
              {records?.most_points_against_season && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🎯</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-purple-400 uppercase tracking-wider">Most Points Against</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.most_points_against_season.year}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.most_points_against_season.points_against.toFixed(2)}
                      </div>
                      <div className="text-sm text-white/80 font-medium">{records.most_points_against_season.team_name}</div>
                      <div className="text-sm text-purple-400/80">
                        Unluckiest team - {records.most_points_against_season.wins}-{records.most_points_against_season.losses} record
                      </div>
                      <div className="text-xs text-white/50 mt-1">{records.most_points_against_season.year} season</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Streak Records */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Streak Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {records?.longest_win_streak && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-lime-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🔥</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-green-400 uppercase tracking-wider">Longest Win Streak</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.longest_win_streak.start_year === records.longest_win_streak.end_year
                            ? records.longest_win_streak.start_year
                            : `${records.longest_win_streak.start_year}-${records.longest_win_streak.end_year}`}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.longest_win_streak.streak} wins
                      </div>
                      <div className="text-sm text-white/80 font-medium">{records.longest_win_streak.owner}</div>
                      <div className="text-sm text-green-400/80">
                        Week {records.longest_win_streak.start_week} {records.longest_win_streak.start_year} → Week {records.longest_win_streak.end_week} {records.longest_win_streak.end_year}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {records?.longest_loss_streak && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500/10 to-gray-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">💀</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Longest Loss Streak</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.longest_loss_streak.start_year === records.longest_loss_streak.end_year
                            ? records.longest_loss_streak.start_year
                            : `${records.longest_loss_streak.start_year}-${records.longest_loss_streak.end_year}`}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.longest_loss_streak.streak} losses
                      </div>
                      <div className="text-sm text-white/80 font-medium">{records.longest_loss_streak.owner}</div>
                      <div className="text-sm text-gray-400/80">
                        Week {records.longest_loss_streak.start_week} {records.longest_loss_streak.start_year} → Week {records.longest_loss_streak.end_week} {records.longest_loss_streak.end_year}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fun Facts */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Wild Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {records?.highest_scoring_loss && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">😤</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-orange-400 uppercase tracking-wider">Highest Scoring Loss</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.highest_scoring_loss.year}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.highest_scoring_loss.score.toFixed(2)}
                      </div>
                      <div className="text-sm text-white/80 font-medium">{records.highest_scoring_loss.team}</div>
                      <div className="text-sm text-orange-400/80">
                        Lost to {records.highest_scoring_loss.opponent} ({records.highest_scoring_loss.opponent_score.toFixed(2)})
                      </div>
                      <div className="text-xs text-white/50 mt-1">Week {records.highest_scoring_loss.week}, {records.highest_scoring_loss.year}</div>
                    </div>
                  </div>
                </div>
              )}

              {records?.lowest_scoring_win && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🍀</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-indigo-400 uppercase tracking-wider">Lowest Scoring Win</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.lowest_scoring_win.year}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.lowest_scoring_win.score.toFixed(2)}
                      </div>
                      <div className="text-sm text-white/80 font-medium">{records.lowest_scoring_win.team}</div>
                      <div className="text-sm text-indigo-400/80">
                        Beat {records.lowest_scoring_win.opponent} ({records.lowest_scoring_win.opponent_score.toFixed(2)})
                      </div>
                      <div className="text-xs text-white/50 mt-1">Week {records.lowest_scoring_win.week}, {records.lowest_scoring_win.year}</div>
                    </div>
                  </div>
                </div>
              )}

              {records?.most_combined_points && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 to-red-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🌟</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-wider">Most Combined Points</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.most_combined_points.year}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.most_combined_points.combined_points.toFixed(2)}
                      </div>
                      <div className="text-sm text-white/80 font-medium">
                        {records.most_combined_points.home_team} ({records.most_combined_points.home_score.toFixed(2)}) vs {records.most_combined_points.away_team} ({records.most_combined_points.away_score.toFixed(2)})
                      </div>
                      <div className="text-xs text-white/50 mt-1">Week {records.most_combined_points.week}, {records.most_combined_points.year}</div>
                    </div>
                  </div>
                </div>
              )}

              {records?.fewest_points_season && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-500/10 to-slate-500/10 p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">📉</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Fewest Points</h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {records.fewest_points_season.year}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {records.fewest_points_season.points_for.toFixed(2)}
                      </div>
                      <div className="text-sm text-white/80 font-medium">{records.fewest_points_season.team_name}</div>
                      <div className="text-sm text-gray-400/80">
                        {records.fewest_points_season.wins}-{records.fewest_points_season.losses} record
                      </div>
                      <div className="text-xs text-white/50 mt-1">{records.fewest_points_season.year} season</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Records;
