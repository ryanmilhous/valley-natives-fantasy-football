import { useState, useEffect } from 'react';
import apiService from '../services/api';

function Matchups() {
  const [matchups, setMatchups] = useState([]);
  const [standings, setStandings] = useState([]);
  const [filteredMatchups, setFilteredMatchups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchupsResponse, standingsResponse] = await Promise.all([
          apiService.getMatchups(),
          apiService.getAllStandings()
        ]);
        setMatchups(matchupsResponse.data);
        setStandings(standingsResponse.data);
        setFilteredMatchups(matchupsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to get owner from team name and year
  const getOwnerForTeam = (teamName, year) => {
    const standing = standings.find(s => s.team_name === teamName && s.year === year);
    return standing?.owner || null;
  };

  useEffect(() => {
    let filtered = matchups;

    if (searchTerm) {
      filtered = filtered.filter(m => {
        const homeOwner = getOwnerForTeam(m.home_team, m.year) || '';
        const awayOwner = getOwnerForTeam(m.away_team, m.year) || '';
        const search = searchTerm.toLowerCase();
        return (
          m.home_team.toLowerCase().includes(search) ||
          m.away_team.toLowerCase().includes(search) ||
          homeOwner.toLowerCase().includes(search) ||
          awayOwner.toLowerCase().includes(search)
        );
      });
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(m => m.year === parseInt(selectedYear));
    }

    if (selectedOwner !== 'all') {
      filtered = filtered.filter(m => {
        const homeOwner = getOwnerForTeam(m.home_team, m.year);
        const awayOwner = getOwnerForTeam(m.away_team, m.year);
        return homeOwner === selectedOwner || awayOwner === selectedOwner;
      });
    }

    setFilteredMatchups(filtered);
  }, [searchTerm, selectedYear, selectedOwner, matchups, standings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-white/70 mt-4 font-medium">Loading matchups...</p>
        </div>
      </div>
    );
  }

  const years = [...new Set(matchups.map(m => m.year))].sort((a, b) => b - a);
  const owners = [...new Set(standings.map(s => s.owner))].filter(Boolean).sort();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">⚔️</div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Matchup History
              </h1>
              <p className="text-white/70 mt-2">{matchups.length} total matchups across all seasons</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by team or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 focus:border-purple-500 focus:outline-none placeholder-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Owner</label>
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Owners</option>
                {owners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-white/50">
            Showing {filteredMatchups.length} of {matchups.length} matchups
          </div>
        </div>
      </div>

      {/* Matchups Table */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full">
              <thead className="border-b border-white/10 sticky top-0 bg-slate-900/95 backdrop-blur-xl">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Season</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Week</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Home</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-purple-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Away</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Winner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMatchups.map((matchup, index) => {
                  const homeOwner = getOwnerForTeam(matchup.home_team, matchup.year);
                  const awayOwner = getOwnerForTeam(matchup.away_team, matchup.year);
                  const winnerOwner = matchup.winner === 'TIE' ? null :
                    matchup.winner === matchup.home_team ? homeOwner : awayOwner;

                  return (
                    <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                        {matchup.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                        {matchup.week}
                        {matchup.is_playoff && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            Playoff
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white/90">{homeOwner || matchup.home_team}</div>
                        {homeOwner && <div className="text-xs text-white/50">{matchup.home_team}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-bold text-white">
                          {matchup.home_score.toFixed(2)} - {matchup.away_score.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white/90">{awayOwner || matchup.away_team}</div>
                        {awayOwner && <div className="text-xs text-white/50">{matchup.away_team}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          matchup.winner === 'TIE'
                            ? 'bg-white/10 text-white/70 border border-white/20'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {matchup.winner === 'TIE' ? 'TIE' : (winnerOwner || matchup.winner)}
                        </span>
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

export default Matchups;
