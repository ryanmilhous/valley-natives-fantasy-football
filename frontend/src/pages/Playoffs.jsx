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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-white/70 mt-4 font-medium">Loading playoff history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">🏆</div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Championship History
              </h1>
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
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center space-x-3">
              <span>📊</span>
              <span>Championship Timeline</span>
            </h2>
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

export default Playoffs;
