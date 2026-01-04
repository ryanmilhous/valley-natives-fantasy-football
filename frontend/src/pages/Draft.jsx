import { useState, useEffect } from 'react';
import apiService from '../services/api';

function Draft() {
  const [draft, setDraft] = useState([]);
  const [bestPicks, setBestPicks] = useState([]);
  const [worstPicks, setWorstPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedRound, setSelectedRound] = useState('all');
  const [sortColumn, setSortColumn] = useState('bid_amount');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [draftResponse, bestPicksResponse, worstPicksResponse] = await Promise.all([
          apiService.getDraft(),
          apiService.getBestDraftPicks(),
          apiService.getWorstDraftPicks()
        ]);
        setDraft(draftResponse.data);
        setBestPicks(bestPicksResponse.data);
        setWorstPicks(worstPicksResponse.data);
      } catch (error) {
        console.error('Error fetching draft data:', error);
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
          <p className="text-white/70 mt-4 font-medium">Loading draft history...</p>
        </div>
      </div>
    );
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <span className="text-white/30 ml-1">↕</span>;
    }
    return sortDirection === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
  };

  const years = ['all', ...new Set(draft.map(d => d.year))].sort((a, b) => b - a);
  const positions = ['all', ...new Set(draft.map(d => d.position).filter(Boolean))].sort();

  const filteredDraft = draft.filter(pick => {
    if (selectedYear !== 'all' && pick.year !== parseInt(selectedYear)) return false;
    if (selectedPosition !== 'all' && pick.position !== selectedPosition) return false;
    return true;
  }).sort((a, b) => {
    let aVal, bVal;

    switch(sortColumn) {
      case 'bid_amount':
        aVal = a.bid_amount || 0;
        bVal = b.bid_amount || 0;
        break;
      case 'player_name':
        aVal = a.player_name || '';
        bVal = b.player_name || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      case 'position':
        aVal = a.position || '';
        bVal = b.position || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      case 'owner':
        aVal = a.owner || '';
        bVal = b.owner || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      case 'year':
        aVal = a.year || 0;
        bVal = b.year || 0;
        break;
      default:
        return 0;
    }

    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">📋</div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Draft History
              </h1>
              <p className="text-white/70 mt-2">{draft.length} total picks across all years</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Availability Notice */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500 p-4 rounded-lg backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-300 font-medium">
              <strong>Note:</strong> Draft data is only available from 2019-present due to ESPN API limitations.
            </p>
          </div>
        </div>
      </div>

      {/* Best Draft Picks Section */}
      {bestPicks.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 p-1">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
              <span>🌟</span>
              <span>Best Value Picks</span>
            </h2>
            <p className="text-sm text-white/60 mb-6">Highest points per dollar - only $20+ picks (excludes keepers and cheap fliers)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bestPicks.slice(0, 9).map((pick, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-4 border border-white/10 hover:border-yellow-500/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-yellow-400/70 font-semibold">
                      ${pick.auction_cost || 0}
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-semibold">
                      {pick.year}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">{pick.player_name}</div>
                  <div className="text-sm text-white/70 mb-2">{pick.owner}</div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-green-400">{pick.total_points.toFixed(1)} pts</div>
                    <div className="text-blue-400">{pick.value.toFixed(2)} pts/$</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Worst Draft Picks Section */}
      {worstPicks.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500/10 via-gray-500/10 to-slate-500/10 p-1">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-gray-400 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
              <span>💸</span>
              <span>Worst Value Picks</span>
            </h2>
            <p className="text-sm text-white/60 mb-6">Lowest points per dollar - only $20+ picks with positive points (excludes keepers, injuries, and cheap fliers)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {worstPicks.slice(0, 9).map((pick, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/10 to-gray-500/10 p-4 border border-white/10 hover:border-red-500/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-red-400/70 font-semibold">
                      ${pick.auction_cost || 0}
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                      {pick.year}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">{pick.player_name}</div>
                  <div className="text-sm text-white/70 mb-2">{pick.owner}</div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-orange-400">{pick.total_points.toFixed(1)} pts</div>
                    <div className="text-gray-400">{pick.value.toFixed(2)} pts/$</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 focus:border-blue-500 focus:outline-none"
          >
            {years.map(year => (
              <option key={year} value={year}>{year === 'all' ? 'All Years' : year}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Position</label>
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 focus:border-blue-500 focus:outline-none"
          >
            {positions.map(position => (
              <option key={position} value={position}>{position === 'all' ? 'All Positions' : position}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Draft Table */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                    onClick={() => handleSort('bid_amount')}
                  >
                    Auction $ {getSortIcon('bid_amount')}
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                    onClick={() => handleSort('player_name')}
                  >
                    Player {getSortIcon('player_name')}
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                    onClick={() => handleSort('position')}
                  >
                    Position {getSortIcon('position')}
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                    onClick={() => handleSort('owner')}
                  >
                    Team/Owner {getSortIcon('owner')}
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                    onClick={() => handleSort('year')}
                  >
                    Year {getSortIcon('year')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDraft.map((pick, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-green-400 font-bold text-lg">${pick.bid_amount || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{pick.player_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-400 font-medium">{pick.position || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/80">{pick.owner || 'N/A'}</div>
                      <div className="text-xs text-white/50">{pick.team_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white/70">{pick.year}</span>
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

export default Draft;
