import { useState, useEffect } from 'react';
import apiService from '../services/api';

function Trades() {
  const [trades, setTrades] = useState([]);
  const [bestTrades, setBestTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tradesResponse, bestResponse] = await Promise.all([
          apiService.getTrades(),
          apiService.getBestTrades()
        ]);
        setTrades(tradesResponse.data);
        setBestTrades(bestResponse.data);
        setFilteredTrades(tradesResponse.data);
      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = trades;

    if (selectedYear !== 'all') {
      filtered = filtered.filter(t => t.year === parseInt(selectedYear));
    }

    if (selectedOwner !== 'all') {
      filtered = filtered.filter(t =>
        t.side1.owner === selectedOwner || t.side2.owner === selectedOwner
      );
    }

    setFilteredTrades(filtered);
  }, [selectedYear, selectedOwner, trades]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto"></div>
          <p className="text-white/70 mt-4 font-medium">Loading trades...</p>
        </div>
      </div>
    );
  }

  const years = [...new Set(trades.map(t => t.year))].sort((a, b) => b - a);
  const owners = [...new Set(trades.flatMap(t => [t.side1.owner, t.side2.owner]))].sort();

  // Position badge colors
  const positionColors = {
    QB: 'bg-red-500/20 text-red-400 border-red-500/30',
    RB: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    WR: 'bg-green-500/20 text-green-400 border-green-500/30',
    TE: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    K: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    DEF: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  // Get loser for best trades display
  const getLoser = (trade) => {
    return trade.winner === 'side1' ? trade.side2.owner : trade.side1.owner;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">🤝</div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Trade History
              </h1>
              <p className="text-white/70 mt-2">{trades.length} trades on record (2019-present)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-1">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 focus:border-emerald-500 focus:outline-none"
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
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="all">All Owners</option>
                    {owners.map(owner => (
                      <option key={owner} value={owner}>{owner}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 text-sm text-white/50">
                Showing {filteredTrades.length} of {trades.length} trades
              </div>
            </div>
          </div>

          {/* No Trades Message */}
          {filteredTrades.length === 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-1">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-white/70">No trades found for the selected filters.</p>
                <p className="text-white/50 text-sm mt-2">Trade data is available from 2019-present.</p>
              </div>
            </div>
          )}

          {/* Trades List */}
          <div className="space-y-4">
            {filteredTrades.map((trade, index) => (
              <div key={trade.transaction_id || index} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-1">
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  {/* Trade Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold border border-emerald-500/30">
                        {trade.year}
                      </span>
                      <span className="text-white/50 text-sm">
                        {trade.trade_timing || (trade.week ? `Week ${trade.week}` : 'Offseason')}
                      </span>
                    </div>
                    {/* Winner Badge */}
                    {trade.winner && trade.winner !== 'tie' && trade.point_differential > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-white/50">Winner:</span>
                        <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold border border-yellow-500/30">
                          {trade.winner_owner} (+{trade.point_differential.toFixed(0)} pts)
                        </span>
                      </div>
                    )}
                    {trade.winner === 'tie' && (
                      <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm font-semibold border border-white/20">
                        Even Trade
                      </span>
                    )}
                  </div>

                  {/* Trade Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Side 1 */}
                    <div className={`space-y-3 p-4 rounded-xl ${trade.winner === 'side1' ? 'bg-green-500/5 border border-green-500/20' : 'bg-slate-800/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${trade.winner === 'side1' ? 'text-green-400' : 'text-emerald-400'}`}>
                            {trade.side1.owner}
                          </span>
                          {trade.winner === 'side1' && (
                            <span className="text-green-400 text-sm">✓</span>
                          )}
                        </div>
                        {trade.side1.total_points > 0 && (
                          <span className="text-sm text-white/50">{trade.side1.total_points.toFixed(1)} pts</span>
                        )}
                      </div>
                      <div className="text-xs text-white/50 mb-2">receives</div>
                      <div className="space-y-2">
                        {trade.side1.received.map((player, idx) => (
                          <div key={idx} className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${positionColors[player.position] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                              {player.position}
                            </span>
                            <span className="text-white font-medium">{player.player_name}</span>
                          </div>
                        ))}
                        {trade.side1.faab_received > 0 && (
                          <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              FAAB
                            </span>
                            <span className="text-white font-medium">${trade.side1.faab_received}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Side 2 */}
                    <div className={`space-y-3 p-4 rounded-xl ${trade.winner === 'side2' ? 'bg-green-500/5 border border-green-500/20' : 'bg-slate-800/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${trade.winner === 'side2' ? 'text-green-400' : 'text-cyan-400'}`}>
                            {trade.side2.owner}
                          </span>
                          {trade.winner === 'side2' && (
                            <span className="text-green-400 text-sm">✓</span>
                          )}
                        </div>
                        {trade.side2.total_points > 0 && (
                          <span className="text-sm text-white/50">{trade.side2.total_points.toFixed(1)} pts</span>
                        )}
                      </div>
                      <div className="text-xs text-white/50 mb-2">receives</div>
                      <div className="space-y-2">
                        {trade.side2.received.map((player, idx) => (
                          <div key={idx} className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${positionColors[player.position] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                              {player.position}
                            </span>
                            <span className="text-white font-medium">{player.player_name}</span>
                          </div>
                        ))}
                        {trade.side2.faab_received > 0 && (
                          <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              FAAB
                            </span>
                            <span className="text-white font-medium">${trade.side2.faab_received}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Most Lopsided Trades */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 p-1">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center">
                <span className="mr-2">⚖️</span> Most Lopsided
              </h3>
              <div className="space-y-4">
                {bestTrades.slice(0, 5).map((trade, idx) => {
                  const winnerSide = trade.winner === 'side1' ? trade.side1 : trade.side2;
                  const loserSide = trade.winner === 'side1' ? trade.side2 : trade.side1;
                  return (
                    <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-amber-400 font-semibold text-sm">
                          {trade.year} {trade.trade_timing || (trade.week ? `Week ${trade.week}` : 'Offseason')}
                        </span>
                        <span className="text-xs text-green-400 font-medium">+{trade.point_differential.toFixed(0)} pts</span>
                      </div>
                      {/* Winner's haul */}
                      <div className="mb-2">
                        <div className="text-xs text-green-400 font-medium mb-1">
                          {trade.winner_owner} received:
                        </div>
                        <div className="space-y-0.5">
                          {winnerSide.received.slice(0, 3).map((player, pIdx) => (
                            <div key={pIdx} className="text-xs text-white/80 pl-2">
                              • {player.player_name}
                            </div>
                          ))}
                          {winnerSide.received.length > 3 && (
                            <div className="text-xs text-white/50 pl-2">
                              +{winnerSide.received.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Loser's haul */}
                      <div>
                        <div className="text-xs text-red-400 font-medium mb-1">
                          {getLoser(trade)} received:
                        </div>
                        <div className="space-y-0.5">
                          {loserSide.received.slice(0, 3).map((player, pIdx) => (
                            <div key={pIdx} className="text-xs text-white/60 pl-2">
                              • {player.player_name}
                            </div>
                          ))}
                          {loserSide.received.length > 3 && (
                            <div className="text-xs text-white/50 pl-2">
                              +{loserSide.received.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Trades;
