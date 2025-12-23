import { useState, useEffect } from 'react';
import apiService from '../services/api';

function Seasons() {
  const [standings, setStandings] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seasonsResponse, standingsResponse] = await Promise.all([
          apiService.getSeasons(),
          apiService.getAllStandings(),
        ]);
        setYears(seasonsResponse.data.years);
        setStandings(standingsResponse.data);
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
    </div>
  );
}

export default Seasons;
