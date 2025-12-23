import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Home() {
  const [metadata, setMetadata] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metaResponse, teamsResponse] = await Promise.all([
          apiService.getMetadata(),
          apiService.getTeams(),
        ]);
        setMetadata(metaResponse.data);
        setTeams(teamsResponse.data);
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

  const championshipData = teams
    .map(team => ({
      owner: team.current_owner,
      championships: team.all_time.championships,
    }))
    .filter(t => t.championships > 0)
    .sort((a, b) => b.championships - a.championships);

  const handleDownload = async () => {
    try {
      const response = await apiService.exportExcel();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fantasy_football_history.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Failed to download Excel file');
    }
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

          <div className="mt-8">
            <button
              onClick={handleDownload}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-bold text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>📊</span>
                <span>Download Excel Spreadsheet</span>
              </span>
            </button>
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={championshipData}>
                <defs>
                  <linearGradient id="colorChampionships" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="owner" stroke="#ffffff70" />
                <YAxis allowDecimals={false} stroke="#ffffff70" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #ffffff20',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ color: '#ffffff' }} />
                <Bar dataKey="championships" fill="url(#colorChampionships)" name="Championships" radius={[8, 8, 0, 0]} />
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Wins</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Losses</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Win %</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Championships</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {teams
                  .sort((a, b) => b.all_time.wins - a.all_time.wins)
                  .map((team, index) => {
                    const winPct = (
                      (team.all_time.wins / (team.all_time.wins + team.all_time.losses)) *
                      100
                    ).toFixed(1);
                    return (
                      <tr key={team.team_id} className="hover:bg-white/5 transition-colors duration-200 group">
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
                          <div className="text-white font-semibold">{team.current_owner}</div>
                          <div className="text-xs text-white/50">{team.current_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-400 font-semibold">
                          {team.all_time.wins}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-red-400 font-semibold">
                          {team.all_time.losses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-semibold">
                          {winPct}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {team.all_time.championships > 0 ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">
                              <span>🏆</span>
                              <span>{team.all_time.championships}</span>
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
