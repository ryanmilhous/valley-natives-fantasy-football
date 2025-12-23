import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getTeams();
        setTeams(response.data);
        if (response.data.length > 0) {
          setSelectedTeam(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Team Profiles</h1>

      {/* Team Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Team/Owner</label>
        <select
          value={selectedTeam?.team_id || ''}
          onChange={(e) => setSelectedTeam(teams.find(t => t.team_id === parseInt(e.target.value)))}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {teams.map(team => (
            <option key={team.team_id} value={team.team_id}>
              {team.current_owner} ({team.current_name})
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && (
        <>
          {/* Team Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedTeam.current_owner}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">{selectedTeam.all_time.wins}</div>
                <div className="text-sm text-gray-600">Career Wins</div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-2xl font-bold text-red-600">{selectedTeam.all_time.losses}</div>
                <div className="text-sm text-gray-600">Career Losses</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <div className="text-2xl font-bold text-yellow-600">{selectedTeam.all_time.championships}</div>
                <div className="text-sm text-gray-600">Championships</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold text-green-600">{selectedTeam.all_time.playoff_appearances}</div>
                <div className="text-sm text-gray-600">Playoff Apps</div>
              </div>
            </div>
          </div>

          {/* Season Performance Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Season Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedTeam.seasons}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="wins" stroke="#2563eb" name="Wins" />
                <Line type="monotone" dataKey="losses" stroke="#dc2626" name="Losses" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Season History Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 p-6 pb-4">Season History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Record</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points For</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Standing</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedTeam.seasons.map(season => (
                    <tr key={season.year} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{season.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{season.team_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {season.wins}-{season.losses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {season.points_for.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {season.final_standing}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Teams;
