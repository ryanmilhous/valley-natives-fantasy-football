import { useState, useEffect } from 'react';
import apiService from '../services/api';

function Draft() {
  const [draft, setDraft] = useState([]);
  const [bestPicks, setBestPicks] = useState([]);
  const [worstPicks, setWorstPicks] = useState([]);
  const [bestSnakePicks, setBestSnakePicks] = useState([]);
  const [worstSnakePicks, setWorstSnakePicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [sortColumn, setSortColumn] = useState('bid_amount');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [draftResponse, bestPicksResponse, worstPicksResponse, bestSnakeResponse, worstSnakeResponse] = await Promise.all([
          apiService.getDraft(),
          apiService.getBestDraftPicks(),
          apiService.getWorstDraftPicks(),
          apiService.getBestSnakePicks(),
          apiService.getWorstSnakePicks()
        ]);
        setDraft(draftResponse.data);
        setBestPicks(bestPicksResponse.data);
        setWorstPicks(worstPicksResponse.data);
        setBestSnakePicks(bestSnakeResponse.data);
        setWorstSnakePicks(worstSnakeResponse.data);
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
  const owners = ['all', ...new Set(draft.map(d => d.owner).filter(Boolean))].sort();

  // Determine if we're viewing snake draft years (2007-2011)
  const SNAKE_DRAFT_YEARS = [2007, 2008, 2009, 2010, 2011];
  const isSnakeDraftYear = (year) => SNAKE_DRAFT_YEARS.includes(year);
  const selectedYearInt = selectedYear === 'all' ? null : parseInt(selectedYear);
  const showingOnlySnakeDraft = selectedYearInt && isSnakeDraftYear(selectedYearInt);

  // Filter value picks by selected year, owner, and position
  const filterValuePicks = (picks) => {
    return picks.filter(p => {
      if (selectedYear !== 'all' && p.year !== selectedYearInt) return false;
      if (selectedOwner !== 'all' && p.owner !== selectedOwner) return false;
      if (selectedPosition !== 'all' && p.position !== selectedPosition) return false;
      return true;
    });
  };

  const filteredBestPicks = filterValuePicks(bestPicks);
  const filteredWorstPicks = filterValuePicks(worstPicks);
  const filteredBestSnakePicks = filterValuePicks(bestSnakePicks);
  const filteredWorstSnakePicks = filterValuePicks(worstSnakePicks);

  // Decide which value picks to show based on selected year
  const showAuctionValuePicks = selectedYear === 'all' || !showingOnlySnakeDraft;
  const showSnakeValuePicks = selectedYear === 'all' || showingOnlySnakeDraft;

  // Build filter description for value picks header
  const getFilterLabel = () => {
    const parts = [];
    if (selectedYear !== 'all') parts.push(selectedYear);
    if (selectedOwner !== 'all') parts.push(selectedOwner.split(' ')[0]);
    if (selectedPosition !== 'all') parts.push(selectedPosition);
    return parts.length > 0 ? `(${parts.join(', ')})` : '';
  };
  const filterLabel = getFilterLabel();

  const filteredDraft = draft.filter(pick => {
    if (selectedYear !== 'all' && pick.year !== parseInt(selectedYear)) return false;
    if (selectedPosition !== 'all' && pick.position !== selectedPosition) return false;
    if (selectedOwner !== 'all' && pick.owner !== selectedOwner) return false;
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

  // Value pick card component for reuse - compact version
  const ValuePickCard = ({ pick, type }) => {
    const isSnake = type === 'bestSnake' || type === 'worstSnake';
    const isBest = type === 'best' || type === 'bestSnake';

    const colors = {
      best: { bg: 'from-yellow-500/10 to-orange-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
      worst: { bg: 'from-red-500/10 to-gray-500/10', border: 'border-red-500/20', text: 'text-red-400' },
      bestSnake: { bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
      worstSnake: { bg: 'from-rose-500/10 to-pink-500/10', border: 'border-rose-500/20', text: 'text-rose-400' }
    };
    const c = colors[type];

    return (
      <div className={`rounded bg-gradient-to-br ${c.bg} px-2 py-1.5 border ${c.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <span className={`text-[10px] ${c.text} font-semibold shrink-0`}>
              {isSnake ? `Rd${pick.round_num}` : `$${pick.auction_cost || 0}`}
            </span>
            <span className="text-xs font-semibold text-white truncate">{pick.player_name}</span>
          </div>
          <span className="text-[10px] text-white/50 shrink-0 ml-1">{pick.year}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] mt-0.5">
          <span className="text-white/50 truncate">{pick.owner}</span>
          <span className={isSnake ? (isBest ? 'text-cyan-400' : 'text-rose-400') : (isBest ? 'text-blue-400' : 'text-gray-400')}>
            {pick.total_points.toFixed(0)}pts • {isSnake ? `${pick.value >= 0 ? '+' : ''}${pick.value.toFixed(0)}` : `${pick.value.toFixed(1)}/$`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">📋</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Draft History
              </h1>
              <p className="text-white/70 mt-1 text-sm">
                {draft.length} picks • Snake 2007-2011 • Auction 2012-present
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year === 'all' ? 'All Years' : year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Position</label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none"
              >
                {positions.map(position => (
                  <option key={position} value={position}>{position === 'all' ? 'All Positions' : position}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Owner</label>
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none"
              >
                {owners.map(owner => (
                  <option key={owner} value={owner}>{owner === 'all' ? 'All Owners' : owner}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Draft Table + Value Picks Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Draft Table - Takes 2 columns on xl */}
        <div className="xl:col-span-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-1">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10">
              <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
                <table className="min-w-full">
                  <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-xl">
                    <tr className="border-b border-white/10">
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                        onClick={() => handleSort('bid_amount')}
                      >
                        {showingOnlySnakeDraft ? 'Round' : 'Cost'} {getSortIcon('bid_amount')}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                        onClick={() => handleSort('player_name')}
                      >
                        Player {getSortIcon('player_name')}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                        onClick={() => handleSort('position')}
                      >
                        Pos {getSortIcon('position')}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                        onClick={() => handleSort('owner')}
                      >
                        Owner {getSortIcon('owner')}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-purple-400 uppercase tracking-wider cursor-pointer hover:text-purple-300 transition-colors"
                        onClick={() => handleSort('year')}
                      >
                        Year {getSortIcon('year')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredDraft.map((pick, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isSnakeDraftYear(pick.year) ? (
                            <span className="text-purple-400 font-bold text-sm">
                              Rd {pick.round_num || '?'}, #{pick.round_pick || '?'}
                            </span>
                          ) : (
                            <span className="text-green-400 font-bold">${pick.bid_amount || 0}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white font-semibold text-sm">{pick.player_name}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-blue-400 font-medium text-sm">{pick.position || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white/80 text-sm">{pick.owner || '-'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-white/70 text-sm">{pick.year}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t border-white/10 text-xs text-white/50">
                Showing {filteredDraft.length} picks
              </div>
            </div>
          </div>
        </div>

        {/* Value Picks Sidebar - Flex layout to avoid gaps */}
        <div className="flex flex-col gap-3">
          {/* Best Auction Picks */}
          {showAuctionValuePicks && filteredBestPicks.length > 0 && (
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 p-0.5">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-lg p-3 border border-white/10">
                <h3 className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2 flex items-center space-x-1">
                  <span>🌟</span>
                  <span>Best Value {filterLabel}</span>
                </h3>
                <div className="space-y-1.5">
                  {filteredBestPicks.slice(0, 5).map((pick, index) => (
                    <ValuePickCard key={index} pick={pick} type="best" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Best Snake Picks */}
          {showSnakeValuePicks && filteredBestSnakePicks.length > 0 && (
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-0.5">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-lg p-3 border border-white/10">
                <h3 className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2 flex items-center space-x-1">
                  <span>🐍</span>
                  <span>Snake Steals {filterLabel}</span>
                </h3>
                <div className="space-y-1.5">
                  {filteredBestSnakePicks.slice(0, 5).map((pick, index) => (
                    <ValuePickCard key={index} pick={pick} type="bestSnake" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Worst Auction Picks */}
          {showAuctionValuePicks && filteredWorstPicks.length > 0 && (
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-red-500/10 via-gray-500/10 to-slate-500/10 p-0.5">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-lg p-3 border border-white/10">
                <h3 className="text-sm font-bold bg-gradient-to-r from-red-400 to-gray-400 bg-clip-text text-transparent mb-2 flex items-center space-x-1">
                  <span>💸</span>
                  <span>Worst Value {filterLabel}</span>
                </h3>
                <div className="space-y-1.5">
                  {filteredWorstPicks.slice(0, 5).map((pick, index) => (
                    <ValuePickCard key={index} pick={pick} type="worst" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Worst Snake Picks */}
          {showSnakeValuePicks && filteredWorstSnakePicks.length > 0 && (
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-fuchsia-500/10 p-0.5">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-lg p-3 border border-white/10">
                <h3 className="text-sm font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent mb-2 flex items-center space-x-1">
                  <span>🐍</span>
                  <span>Snake Busts {filterLabel}</span>
                </h3>
                <div className="space-y-1.5">
                  {filteredWorstSnakePicks.slice(0, 5).map((pick, index) => (
                    <ValuePickCard key={index} pick={pick} type="worstSnake" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Draft;
