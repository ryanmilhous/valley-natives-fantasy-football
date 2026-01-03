import { useState, useEffect } from 'react';
import apiService from '../services/api';

function Playoffs() {
  const [playoffs, setPlayoffs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getAllPlayoffs();
        setPlayoffs(response.data.sort((a, b) => b.year - a.year));
      } catch (error) {
        console.error('Error fetching playoffs:', error);
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
      <h1 className="text-3xl font-bold text-gray-800">Playoff History</h1>

      {/* Trophy Case */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Championship History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playoffs.map(playoff => (
            <div key={playoff.year} className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition">
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-gray-800">{playoff.year}</div>
                <div className="mt-4">
                  <div className="text-lg font-semibold text-blue-600">{playoff.champion || 'N/A'}</div>
                  {playoff.champion_owner && (
                    <div className="text-xs text-gray-600 mt-1">{playoff.champion_owner}</div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">Champion</div>
                </div>
                {playoff.runner_up && (
                  <div className="mt-3">
                    <div className="text-md font-semibold text-gray-600">{playoff.runner_up}</div>
                    {playoff.runner_up_owner && (
                      <div className="text-xs text-gray-600 mt-1">{playoff.runner_up_owner}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">Runner-Up</div>
                  </div>
                )}
                {playoff.semifinalists && playoff.semifinalists.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">Semifinalists:</div>
                    <div className="text-sm text-gray-600">
                      {Array.isArray(playoff.semifinalists) && typeof playoff.semifinalists[0] === 'object'
                        ? playoff.semifinalists.map((sf, idx) => (
                            <div key={idx} className="mt-1">
                              <div>{sf.team_name}</div>
                              <div className="text-xs text-gray-600">{sf.owner}</div>
                            </div>
                          ))
                        : playoff.semifinalists.join(', ')
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-bold text-gray-800 p-6 pb-4">Detailed Results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Champion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Runner-Up</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semifinalists</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {playoffs.map(playoff => (
                <tr key={playoff.year} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {playoff.year}
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-semibold">
                    <div>{playoff.champion || 'N/A'}</div>
                    {playoff.champion_owner && (
                      <div className="text-xs text-gray-600">{playoff.champion_owner}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{playoff.runner_up || 'N/A'}</div>
                    {playoff.runner_up_owner && (
                      <div className="text-xs text-gray-600">{playoff.runner_up_owner}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {playoff.semifinalists && Array.isArray(playoff.semifinalists) && typeof playoff.semifinalists[0] === 'object'
                      ? playoff.semifinalists.map((sf, idx) => (
                          <div key={idx} className="mb-1">
                            <div>{sf.team_name}</div>
                            <div className="text-xs text-gray-600">{sf.owner}</div>
                          </div>
                        ))
                      : playoff.semifinalists?.join(', ') || 'N/A'
                    }
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

export default Playoffs;
