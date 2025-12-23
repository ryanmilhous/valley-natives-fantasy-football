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
          <h3 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-2">{title}</h3>
          {record && (
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">
                {record.score || record.points_for || record.wins || 'N/A'}
              </div>
              <div className="text-sm text-white/80 font-medium">{record.team}</div>
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-8 flex items-center space-x-3">
            <span>🏆</span>
            <span>League Records & Milestones</span>
          </h1>

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
                      <h3 className="text-lg font-bold text-orange-400 uppercase tracking-wider mb-2">Biggest Blowout</h3>
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
                      <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wider mb-2">Closest Game</h3>
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
                      <h3 className="text-lg font-bold text-green-400 uppercase tracking-wider mb-2">Most Points</h3>
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
                      <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-wider mb-2">Most Wins</h3>
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
                      <h3 className="text-lg font-bold text-red-400 uppercase tracking-wider mb-2">Fewest Wins</h3>
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
                      <h3 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-2">Most Points Against</h3>
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
                      <h3 className="text-lg font-bold text-green-400 uppercase tracking-wider mb-2">Longest Win Streak</h3>
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
                      <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-2">Longest Loss Streak</h3>
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
        </div>
      </div>
    </div>
  );
}

export default Records;
