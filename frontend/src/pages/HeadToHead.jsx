import { useState, useEffect } from 'react';
import apiService from '../services/api';

function HeadToHead() {
  const [h2hData, setH2hData] = useState({});
  const [owners, setOwners] = useState([]);
  const [selectedOwner1, setSelectedOwner1] = useState('');
  const [selectedOwner2, setSelectedOwner2] = useState('');
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h2hResponse, ownersResponse] = await Promise.all([
          apiService.getAllHeadToHead(),
          apiService.getOwners(),
        ]);
        setH2hData(h2hResponse.data);
        // Only include owners who have H2H records
        const ownersWithH2H = Object.keys(h2hResponse.data);
        const ownerList = ownersWithH2H.sort();
        setOwners(ownerList);
        if (ownerList.length >= 2) {
          setSelectedOwner1(ownerList[0]);
          setSelectedOwner2(ownerList[1]);
        }
      } catch (error) {
        console.error('Error fetching H2H data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedOwner1 && selectedOwner2) {
      // Check if both owners exist in H2H data
      if (h2hData[selectedOwner1] && h2hData[selectedOwner1][selectedOwner2]) {
        setRecord(h2hData[selectedOwner1][selectedOwner2]);
      } else {
        // No H2H data available (owners haven't played each other)
        setRecord({ wins: 0, losses: 0, ties: 0 });
      }
    }
  }, [selectedOwner1, selectedOwner2, h2hData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto"></div>
          <p className="text-white/70 mt-4 font-medium">Loading head-to-head records...</p>
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
            <div className="text-6xl">🥊</div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Head-to-Head Records
              </h1>
              <p className="text-white/70 mt-2">All-time rivalry matchups from 2007-2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Selectors */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Select Owner 1</label>
              <select
                value={selectedOwner1}
                onChange={(e) => setSelectedOwner1(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 focus:border-purple-500 focus:outline-none"
              >
                {owners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Select Owner 2</label>
              <select
                value={selectedOwner2}
                onChange={(e) => setSelectedOwner2(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 focus:border-purple-500 focus:outline-none"
              >
                {owners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* H2H Result */}
      {record && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 p-1">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-center mb-8">
              <span className="text-purple-400">{selectedOwner1}</span>
              <span className="text-white/50 mx-4">vs</span>
              <span className="text-pink-400">{selectedOwner2}</span>
            </h2>
            <div className="flex justify-center items-center space-x-8 md:space-x-16">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-green-400">{record.wins}</div>
                <div className="text-sm text-white/60 mt-2">{selectedOwner1} Wins</div>
              </div>
              <div className="text-4xl font-bold text-white/30">-</div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-red-400">{record.losses}</div>
                <div className="text-sm text-white/60 mt-2">{selectedOwner2} Wins</div>
              </div>
              {record.ties > 0 && (
                <>
                  <div className="text-4xl font-bold text-white/30">-</div>
                  <div className="text-center">
                    <div className="text-5xl md:text-6xl font-bold text-white/50">{record.ties}</div>
                    <div className="text-sm text-white/60 mt-2">Ties</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* H2H Matrix */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-3">Complete Head-to-Head Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-2 py-2 text-left text-[11px] font-bold text-purple-400 uppercase sticky left-0 bg-slate-900/95 z-10">Owner</th>
                  {owners.map(owner => {
                    // Get first name + last initial (e.g., "Ryan Milhous" -> "Ryan M.")
                    const parts = owner.split(' ');
                    const shortName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
                    return (
                      <th key={owner} className="px-1 py-2 text-center text-[10px] font-bold text-purple-400 whitespace-nowrap" title={owner}>
                        {shortName}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {owners.map(owner1 => {
                  const parts1 = owner1.split(' ');
                  const shortName1 = parts1.length > 1 ? `${parts1[0]} ${parts1[1][0]}.` : parts1[0];
                  return (
                    <tr key={owner1} className="hover:bg-white/5 transition-colors">
                      <td className="px-2 py-1.5 whitespace-nowrap text-[11px] font-medium text-white/90 sticky left-0 bg-slate-900/95 z-10" title={owner1}>
                        {shortName1}
                      </td>
                      {owners.map(owner2 => {
                        if (owner1 === owner2) {
                          return (
                            <td key={owner2} className="px-1 py-1.5 text-center text-white/20 text-[10px]">
                              —
                            </td>
                          );
                        }
                        const rec = h2hData[owner1]?.[owner2] || { wins: 0, losses: 0 };
                        const isWinning = rec.wins > rec.losses;
                        const isLosing = rec.losses > rec.wins;
                        return (
                          <td key={owner2} className="px-1 py-1.5 text-center text-[10px]">
                            <span className={`px-1 py-0.5 rounded ${
                              isWinning ? 'bg-green-500/20 text-green-400' :
                              isLosing ? 'bg-red-500/20 text-red-400' :
                              'text-white/60'
                            }`}>
                              {rec.wins}-{rec.losses}
                            </span>
                          </td>
                        );
                      })}
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

export default HeadToHead;
