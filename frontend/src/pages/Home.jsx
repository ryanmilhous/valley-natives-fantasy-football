import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Home() {
  const [metadata, setMetadata] = useState(null);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'championships', direction: 'desc' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metaResponse, ownersResponse] = await Promise.all([
          apiService.getMetadata(),
          apiService.getOwners(),
        ]);
        setMetadata(metaResponse.data);
        setOwners(ownersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-white/70 mt-4 font-medium">Loading your league data...</p>
        </div>
      </div>
    );
  }

  const championshipData = owners
    .map(owner => ({
      owner: owner.owner,
      championships: owner.all_time.championships,
    }))
    .filter(o => o.championships > 0)
    .sort((a, b) => b.championships - a.championships);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedOwners = () => {
    const sorted = [...owners].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'owner':
          aValue = a.owner;
          bValue = b.owner;
          break;
        case 'seasons':
          aValue = a.seasons_played;
          bValue = b.seasons_played;
          break;
        case 'wins':
          aValue = a.all_time.wins;
          bValue = b.all_time.wins;
          break;
        case 'losses':
          aValue = a.all_time.losses;
          bValue = b.all_time.losses;
          break;
        case 'winPct':
          aValue = a.all_time.win_percentage;
          bValue = b.all_time.win_percentage;
          break;
        case 'championships':
          aValue = a.all_time.championships;
          bValue = b.all_time.championships;
          // Secondary sort by win percentage
          if (aValue === bValue) {
            return sortConfig.direction === 'desc'
              ? b.all_time.win_percentage - a.all_time.win_percentage
              : a.all_time.win_percentage - b.all_time.win_percentage;
          }
          break;
        case 'secondPlace':
          aValue = a.all_time.second_place;
          bValue = b.all_time.second_place;
          break;
        case 'thirdPlace':
          aValue = a.all_time.third_place;
          bValue = b.all_time.third_place;
          break;
        case 'toiletBowl':
          aValue = a.all_time.toilet_bowl;
          bValue = b.all_time.toilet_bowl;
          break;
        default:
          aValue = a.all_time.wins;
          bValue = b.all_time.wins;
      }

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <span className="text-white/30 ml-1">⇅</span>;
    }
    return sortConfig.direction === 'asc' ?
      <span className="text-purple-400 ml-1">↑</span> :
      <span className="text-purple-400 ml-1">↓</span>;
  };


  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-6xl animate-bounce">🏆</div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {metadata?.league_name || 'Fantasy Football League'}
              </h1>
              <p className="text-xl text-white/70 mt-2">
                {metadata?.total_seasons} seasons • {metadata?.total_matchups} matchups • {metadata?.total_teams} teams
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 group-hover:from-blue-500/10 group-hover:to-blue-500/20 transition-all duration-300"></div>
              <div className="relative">
                <div className="text-4xl font-bold text-blue-400">{metadata?.total_seasons}</div>
                <div className="text-sm text-blue-300/70 mt-1 font-medium">Seasons Played</div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 group-hover:from-green-500/10 group-hover:to-green-500/20 transition-all duration-300"></div>
              <div className="relative">
                <div className="text-4xl font-bold text-green-400">{metadata?.total_teams}</div>
                <div className="text-sm text-green-300/70 mt-1 font-medium">Active Teams</div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 group-hover:from-purple-500/10 group-hover:to-purple-500/20 transition-all duration-300"></div>
              <div className="relative">
                <div className="text-4xl font-bold text-purple-400">{metadata?.total_matchups}</div>
                <div className="text-sm text-purple-300/70 mt-1 font-medium">Total Matchups</div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-6 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/10 group-hover:from-orange-500/10 group-hover:to-orange-500/20 transition-all duration-300"></div>
              <div className="relative">
                <div className="text-3xl font-bold text-orange-400">
                  {metadata?.first_season}-{metadata?.latest_season}
                </div>
                <div className="text-sm text-orange-300/70 mt-1 font-medium">Year Range</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Championships Chart */}
      {championshipData.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 p-1">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
              <span>🏆</span>
              <span>Championship Winners</span>
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={championshipData} margin={{ bottom: 80, top: 30 }}>
                <defs>
                  <linearGradient id="colorChampionships" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="owner"
                  stroke="#fbbf24"
                  interval={0}
                  height={80}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const names = payload.value.split(' ');
                    const firstName = names[0];
                    const lastName = names.slice(1).join(' ');
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={16} textAnchor="middle" fill="#fbbf24" fontSize={14} fontWeight="bold">
                          {firstName}
                        </text>
                        <text x={0} y={0} dy={32} textAnchor="middle" fill="#fbbf24" fontSize={14} fontWeight="bold">
                          {lastName}
                        </text>
                      </g>
                    );
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #ffffff20',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="championships" fill="url(#colorChampionships)" name="Championships" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#fbbf24', fontSize: 14, fontWeight: 'bold' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* All-Time Standings */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
            <span>📊</span>
            <span>All-Time Standings</span>
          </h2>
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Rank</th>
                  <th
                    onClick={() => handleSort('owner')}
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    Owner<SortIcon column="owner" />
                  </th>
                  <th
                    onClick={() => handleSort('seasons')}
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    Seasons<SortIcon column="seasons" />
                  </th>
                  <th
                    onClick={() => handleSort('wins')}
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    Wins<SortIcon column="wins" />
                  </th>
                  <th
                    onClick={() => handleSort('losses')}
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    Losses<SortIcon column="losses" />
                  </th>
                  <th
                    onClick={() => handleSort('winPct')}
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    Win %<SortIcon column="winPct" />
                  </th>
                  <th
                    onClick={() => handleSort('championships')}
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    1st Place<SortIcon column="championships" />
                  </th>
                  <th
                    onClick={() => handleSort('secondPlace')}
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    2nd Place<SortIcon column="secondPlace" />
                  </th>
                  <th
                    onClick={() => handleSort('thirdPlace')}
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    3rd Place<SortIcon column="thirdPlace" />
                  </th>
                  <th
                    onClick={() => handleSort('toiletBowl')}
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    Toilet Bowl<SortIcon column="toiletBowl" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {getSortedOwners().map((owner, index) => {
                    const winPct = owner.all_time.win_percentage;
                    const yearRange = owner.first_season === owner.last_season
                      ? owner.first_season
                      : `${owner.first_season}-${owner.last_season}`;
                    return (
                      <tr key={owner.owner} className="hover:bg-white/5 transition-colors duration-200 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-lg font-bold ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-orange-400' :
                            'text-white/70'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white font-semibold">{owner.owner}</div>
                          <div className="text-xs text-white/50">{yearRange}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-purple-400 font-semibold">
                          {owner.seasons_played}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-400 font-semibold">
                          {owner.all_time.wins}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-red-400 font-semibold">
                          {owner.all_time.losses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-semibold">
                          {winPct}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {owner.all_time.championships > 0 ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">
                              <span>🏆</span>
                              <span>{owner.all_time.championships}</span>
                            </span>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {owner.all_time.second_place > 0 ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-400/20 text-gray-300 font-bold border border-gray-400/30">
                              <span>🥈</span>
                              <span>{owner.all_time.second_place}</span>
                            </span>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {owner.all_time.third_place > 0 ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 font-bold border border-orange-600/30">
                              <span>🥉</span>
                              <span>{owner.all_time.third_place}</span>
                            </span>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {owner.all_time.toilet_bowl > 0 ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-brown-600/20 text-white font-bold border border-brown-600/30">
                              <span>🚽</span>
                              <span>{owner.all_time.toilet_bowl}</span>
                            </span>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
