import { useState, useEffect } from 'react';
import apiService from '../services/api';

function Matchups() {
  const [matchups, setMatchups] = useState([]);
  const [filteredMatchups, setFilteredMatchups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getMatchups();
        setMatchups(response.data);
        setFilteredMatchups(response.data);
      } catch (error) {
        console.error('Error fetching matchups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = matchups;

    if (searchTerm) {
      filtered = filtered.filter(
        m =>
          m.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.away_team.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(m => m.year === parseInt(selectedYear));
    }

    setFilteredMatchups(filtered);
  }, [searchTerm, selectedYear, matchups]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const years = [...new Set(matchups.map(m => m.year))].sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Matchup History</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Teams</label>
            <input
              type="text"
              placeholder="Search by team name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredMatchups.length} of {matchups.length} matchups
        </div>
      </div>

      {/* Matchups Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Week</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Home Team</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Away Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMatchups.map((matchup, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {matchup.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {matchup.week}{matchup.is_playoff && ' (P)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {matchup.home_team}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-semibold">
                    {matchup.home_score} - {matchup.away_score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {matchup.away_team}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded ${
                      matchup.winner === 'TIE' ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {matchup.winner}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Matchups;
