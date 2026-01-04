import { useState, useEffect } from 'react';
import apiService from '../services/api';

function Seasons() {
  const [standings, setStandings] = useState([]);
  const [optimalLineups, setOptimalLineups] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seasonsResponse, standingsResponse, optimalResponse] = await Promise.all([
          apiService.getSeasons(),
          apiService.getAllStandings(),
          apiService.getOptimalLineups(),
        ]);
        setYears(seasonsResponse.data.years);
        setStandings(standingsResponse.data);
        setOptimalLineups(optimalResponse.data);
        setSelectedYear(seasonsResponse.data.latest_season);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const filteredStandings = standings.filter(s => s.year === selectedYear);

  const renderTrophy = (finalStanding) => {
    if (finalStanding === 1) {
      return <span className="text-2xl" title="Champion">🥇</span>;
    } else if (finalStanding === 2) {
      return <span className="text-2xl" title="Runner-up">🥈</span>;
    } else if (finalStanding === 3) {
      return <span className="text-2xl" title="3rd Place">🥉</span>;
    }
    return <span className="text-white/30">-</span>;
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
            <span>📅</span>
            <span>Season Standings</span>
          </h1>

          {/* Year Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-400 mb-2 uppercase tracking-wider">Select Season</label>
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full md:w-64 px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              {years.map(year => (
                <option key={year} value={year}>{year} Season</option>
              ))}
            </select>
          </div>

          {/* Standings Table */}
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Record</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Points For</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Points Against</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Playoff Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStandings.map(team => (
                  <tr key={`${team.year}-${team.team_name}`} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-white/70">{team.standing}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">
                      {team.team_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white/70">
                      {team.owner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-semibold">
                      {team.wins}-{team.losses}{team.ties > 0 && `-${team.ties}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-400 font-semibold">
                      {team.points_for.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-400 font-semibold">
                      {team.points_against.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {renderTrophy(team.final_standing)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Optimal Lineup Analysis */}
      {optimalLineups.filter(ol => ol.year === selectedYear).length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/10 via-yellow-500/10 to-red-500/10 p-1">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
              <span>📊</span>
              <span>Optimal Lineup Analysis</span>
            </h2>

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500 p-4 rounded-lg backdrop-blur-sm mb-6">
              <p className="text-sm text-blue-300 font-medium">
                <strong>Note:</strong> Optimal lineup data is only available from 2019-present. This shows how many points you left on the bench each week.
              </p>
            </div>

            {(() => {
              // Calculate season totals for each owner
              const yearLineups = optimalLineups.filter(ol => ol.year === selectedYear);
              const ownerStats = {};

              yearLineups.forEach(lineup => {
                if (!ownerStats[lineup.owner]) {
                  ownerStats[lineup.owner] = {
                    owner: lineup.owner,
                    actual_points: 0,
                    optimal_points: 0,
                    bench_points: 0,
                    weeks: 0
                  };
                }
                ownerStats[lineup.owner].actual_points += lineup.actual_points;
                ownerStats[lineup.owner].optimal_points += lineup.optimal_points;
                ownerStats[lineup.owner].bench_points += lineup.bench_points;
                ownerStats[lineup.owner].weeks += 1;
              });

              const sortedStats = Object.values(ownerStats).sort((a, b) =>
                (b.optimal_points - b.actual_points) - (a.optimal_points - a.actual_points)
              );

              return (
                <div className="overflow-x-auto rounded-xl">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">Owner</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">Actual Points</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">Optimal Points</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">Left on Bench</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedStats.map((stat, index) => {
                        const efficiency = (stat.actual_points / stat.optimal_points * 100).toFixed(1);
                        const leftOnBench = stat.optimal_points - stat.actual_points;

                        return (
                          <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">
                              {stat.owner}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-green-400 font-semibold">
                              {stat.actual_points.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-semibold">
                              {stat.optimal_points.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-orange-400 font-semibold">
                                {leftOnBench.toFixed(2)}
                              </span>
                              <span className="text-xs text-white/50 ml-2">
                                ({(leftOnBench / stat.weeks).toFixed(2)}/week)
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-white/10 rounded-full h-2 max-w-[100px]">
                                  <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${efficiency}%` }}
                                  ></div>
                                </div>
                                <span className="text-white/70 font-semibold text-sm">{efficiency}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Seasons;
