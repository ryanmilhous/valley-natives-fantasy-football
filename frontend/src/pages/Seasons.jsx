import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Seasons() {
  const [standings, setStandings] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState([]);
  const [selectedOwnerForChart, setSelectedOwnerForChart] = useState(null);
  const [playoffs, setPlayoffs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seasonsResponse, standingsResponse, ownersResponse, playoffsResponse] = await Promise.all([
          apiService.getSeasons(),
          apiService.getAllStandings(),
          apiService.getOwners(),
          apiService.getAllPlayoffs(),
        ]);
        setYears(seasonsResponse.data.years);
        setStandings(standingsResponse.data);
        const sortedOwners = ownersResponse.data.sort((a, b) => a.owner.localeCompare(b.owner));
        setOwners(sortedOwners);
        if (sortedOwners.length > 0) {
          setSelectedOwnerForChart(sortedOwners[0]);
        }
        setSelectedYear(seasonsResponse.data.latest_season);
        setPlayoffs(playoffsResponse.data.sort((a, b) => b.year - a.year));
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

  const getPlayoffStatus = (finalStanding) => {
    if (finalStanding === 1) {
      return { text: 'Champion', medal: '🥇', color: 'text-yellow-400' };
    } else if (finalStanding === 2) {
      return { text: 'Runner-up', medal: '🥈', color: 'text-gray-300' };
    } else if (finalStanding === 3) {
      return { text: '3rd Place', medal: '🥉', color: 'text-orange-400' };
    } else if (finalStanding >= 4 && finalStanding <= 6) {
      return { text: 'Made Playoffs (outside top 3)', medal: '✓', color: 'text-green-400' };
    } else if (finalStanding >= 7) {
      return { text: 'Missed Playoffs', medal: '✗', color: 'text-red-400' };
    } else {
      return { text: 'No Data', medal: '-', color: 'text-white/30' };
    }
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return num + "st";
    if (j === 2 && k !== 12) return num + "nd";
    if (j === 3 && k !== 13) return num + "rd";
    return num + "th";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const playoffInfo = getPlayoffStatus(data.final_standing);

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
              Regular Season: <span className="text-white font-semibold">{getOrdinalSuffix(data.standing)} place</span>
            </p>

            <div className="flex items-center space-x-2">
              <span className="text-2xl">{playoffInfo.medal}</span>
              <p className={`${playoffInfo.color} font-semibold text-sm`}>
                {playoffInfo.text}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

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
      {/* Owner Performance Over Time Chart */}
      {owners.length > 0 && selectedOwnerForChart && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-1">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
              <span>📈</span>
              <span>Owner Performance Over Time</span>
            </h2>

            {/* Owner Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-purple-400 mb-2 uppercase tracking-wider">
                Select Owner
              </label>
              <select
                value={selectedOwnerForChart?.owner || ''}
                onChange={(e) => setSelectedOwnerForChart(owners.find(o => o.owner === e.target.value))}
                className="w-full md:w-96 px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              >
                {owners.map(owner => (
                  <option key={owner.owner} value={owner.owner}>
                    {owner.owner} ({owner.first_season === owner.last_season ? owner.first_season : `${owner.first_season}-${owner.last_season}`})
                  </option>
                ))}
              </select>
            </div>

            {/* Chart */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={selectedOwnerForChart.seasons}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="year"
                    stroke="#a78bfa"
                    style={{ fontSize: '14px', fontWeight: '500' }}
                  />
                  <YAxis
                    stroke="#a78bfa"
                    style={{ fontSize: '14px', fontWeight: '500' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
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

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-400">
                  {selectedOwnerForChart.all_time.wins}
                </div>
                <div className="text-sm text-white/70 mt-1">Career Wins</div>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-red-400">
                  {selectedOwnerForChart.all_time.losses}
                </div>
                <div className="text-sm text-white/70 mt-1">Career Losses</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-yellow-400">
                  {selectedOwnerForChart.all_time.championships}
                </div>
                <div className="text-sm text-white/70 mt-1">Championships</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-400">
                  {selectedOwnerForChart.all_time.playoff_appearances}
                </div>
                <div className="text-sm text-white/70 mt-1">Playoff Apps</div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Championship History Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">🏆</div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Championship History
              </h2>
              <p className="text-white/70 mt-2">{playoffs.length} seasons of glory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trophy Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playoffs.map(playoff => (
          <div key={playoff.year} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 p-1 hover:scale-105 transition-all duration-300">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 h-full border border-white/10">
              {/* Year Badge */}
              <div className="flex justify-between items-start mb-4">
                <div className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {playoff.year}
                  </div>
                </div>
                <div className="text-4xl group-hover:scale-125 transition-transform duration-300">🏆</div>
              </div>

              {/* Champion */}
              <div className="mb-4">
                <div className="text-xs text-yellow-400/70 uppercase tracking-wider mb-1 font-semibold">Champion</div>
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl">👑</span>
                    <div>
                      <div className="text-xl font-bold text-yellow-400">{playoff.champion_owner || playoff.champion || 'N/A'}</div>
                      {playoff.champion_owner && playoff.champion && (
                        <div className="text-xs text-yellow-300/60 mt-0.5">{playoff.champion}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Runner-Up */}
              {playoff.runner_up_owner && (
                <div className="mb-4">
                  <div className="text-xs text-gray-400/70 uppercase tracking-wider mb-1 font-semibold">Runner-Up</div>
                  <div className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-xl p-3 border border-gray-500/30">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🥈</span>
                      <div className="text-lg font-semibold text-gray-300">{playoff.runner_up_owner}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {playoff.third_place_owner && (
                <div>
                  <div className="text-xs text-orange-400/70 uppercase tracking-wider mb-1 font-semibold">3rd Place</div>
                  <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg p-3 border border-orange-600/30">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🥉</span>
                      <div className="text-base font-medium text-orange-300">{playoff.third_place_owner}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Table */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10">
          <div className="p-6 pb-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center space-x-3">
              <span>📊</span>
              <span>Championship Timeline</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Champion</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Runner-Up</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">3rd Place</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {playoffs.map(playoff => (
                  <tr key={playoff.year} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-purple-400">{playoff.year}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">👑</span>
                        <div>
                          <div className="text-yellow-400 font-bold">{playoff.champion_owner || playoff.champion || 'N/A'}</div>
                          {playoff.champion_owner && playoff.champion && (
                            <div className="text-xs text-yellow-300/50">{playoff.champion}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {playoff.runner_up_owner ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">🥈</span>
                          <span className="text-gray-300 font-semibold">{playoff.runner_up_owner}</span>
                        </div>
                      ) : (
                        <span className="text-white/30">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {playoff.third_place_owner ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">🥉</span>
                          <span className="text-orange-300 font-semibold">{playoff.third_place_owner}</span>
                        </div>
                      ) : (
                        <span className="text-white/30">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Seasons;
