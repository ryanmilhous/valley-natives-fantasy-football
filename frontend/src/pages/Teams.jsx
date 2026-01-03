import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Teams() {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getOwners();
        // Sort by owner name
        const sortedOwners = response.data.sort((a, b) => a.owner.localeCompare(b.owner));
        setOwners(sortedOwners);
        if (sortedOwners.length > 0) {
          setSelectedOwner(sortedOwners[0]);
        }
      } catch (error) {
        console.error('Error fetching owners:', error);
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
      <h1 className="text-3xl font-bold text-gray-800">Owner Profiles</h1>

      {/* Owner Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Owner</label>
        <select
          value={selectedOwner?.owner || ''}
          onChange={(e) => setSelectedOwner(owners.find(o => o.owner === e.target.value))}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {owners.map(owner => (
            <option key={owner.owner} value={owner.owner}>
              {owner.owner} ({owner.first_season === owner.last_season ? owner.first_season : `${owner.first_season}-${owner.last_season}`})
            </option>
          ))}
        </select>
      </div>

      {selectedOwner && (
        <>
          {/* Owner Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedOwner.owner}</h2>
            <div className="text-sm text-gray-600 mb-4">
              Active: {selectedOwner.first_season === selectedOwner.last_season ? selectedOwner.first_season : `${selectedOwner.first_season}-${selectedOwner.last_season}`} ({selectedOwner.seasons_played} seasons)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">{selectedOwner.all_time.wins}</div>
                <div className="text-sm text-gray-600">Career Wins</div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-2xl font-bold text-red-600">{selectedOwner.all_time.losses}</div>
                <div className="text-sm text-gray-600">Career Losses</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <div className="text-2xl font-bold text-yellow-600">{selectedOwner.all_time.championships}</div>
                <div className="text-sm text-gray-600">Championships</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold text-green-600">{selectedOwner.all_time.playoff_appearances}</div>
                <div className="text-sm text-gray-600">Playoff Apps</div>
              </div>
            </div>
          </div>

          {/* Season Performance Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Season Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedOwner.seasons}>
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
                  {selectedOwner.seasons.map(season => (
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
