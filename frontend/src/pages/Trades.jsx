import { useState, useEffect } from 'react';
import apiService from '../services/api';
import PageHero from '../components/ui/PageHero';
import FilterBar from '../components/ui/FilterBar';
import StatBadge from '../components/ui/StatBadge';
import { heroBanners } from '../theme/heroBanners';
import { retroAssets } from '../theme/retroAssets';

function Trades() {
  const [trades, setTrades] = useState([]);
  const [bestTrades, setBestTrades] = useState([]);
  const [keeperFlipTrades, setKeeperFlipTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tradesResponse, bestResponse, keeperFlipResponse] = await Promise.all([
          apiService.getTrades(),
          apiService.getBestTrades(),
          apiService.getKeeperFlipTrades()
        ]);
        setTrades(tradesResponse.data);
        setBestTrades(bestResponse.data);
        setKeeperFlipTrades(keeperFlipResponse.data);
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
      <PageHero
        {...heroBanners.trades}
        crestSrc={retroAssets[heroBanners.trades.assetKey]?.crest.primary}
        crestAlt="Trade history crest"
        tickerRailSrc={retroAssets[heroBanners.trades.assetKey]?.chrome.tickerRail}
        titlePlateSrc={retroAssets[heroBanners.trades.assetKey]?.chrome.titlePlate}
        eyebrow="San Lorenzo Deal Log"
        title="Trade History"
        subtitle="Every move, every gamble, every keeper swing"
        actions={(
          <>
            <span className="vn-hero-metric">{trades.length} trades</span>
            <StatBadge tone="rivalry" label="2019-present" />
          </>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <FilterBar className="grid grid-cols-1 md:grid-cols-2">
            <div>
              <label className="vn-input-label">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="vn-select"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="vn-input-label">Owner</label>
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className="vn-select"
              >
                <option value="all">All Owners</option>
                {owners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-[var(--vn-text-secondary)] md:col-span-2">
              Showing {filteredTrades.length} of {trades.length} trades
            </div>
          </FilterBar>

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
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold border border-emerald-500/30">
                        {trade.year}
                      </span>
                      <span className="text-white/50 text-sm">
                        {trade.trade_timing || (trade.week ? `Week ${trade.week}` : 'Offseason')}
                      </span>
                      {trade.keeper_flip && (
                        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold border border-purple-500/30">
                          🔄 Keeper Flip
                        </span>
                      )}
                    </div>
                    {/* Winner Badges */}
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      {trade.winner && trade.winner !== 'tie' && trade.point_differential > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-white/50">Season:</span>
                          <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold border border-yellow-500/30">
                            {trade.winner_owner} (+{trade.point_differential.toFixed(0)})
                          </span>
                        </div>
                      )}
                      {trade.longterm_winner && trade.longterm_winner !== 'tie' && trade.longterm_differential > 0 && (trade.side1?.keeper_points > 0 || trade.side2?.keeper_points > 0) && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-white/50">Long-term:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${trade.keeper_flip ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'}`}>
                            {trade.longterm_winner_owner} (+{trade.longterm_differential.toFixed(0)})
                          </span>
                        </div>
                      )}
                      {trade.winner === 'tie' && !trade.keeper_flip && (
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm font-semibold border border-white/20">
                          Even Trade
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Trade Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Side 1 */}
                    <div className={`space-y-3 p-4 rounded-xl ${trade.winner === 'side1' ? 'bg-green-500/5 border border-green-500/20' : trade.longterm_winner === 'side1' && trade.keeper_flip ? 'bg-purple-500/5 border border-purple-500/20' : 'bg-slate-800/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${trade.winner === 'side1' ? 'text-green-400' : trade.longterm_winner === 'side1' && trade.keeper_flip ? 'text-purple-400' : 'text-emerald-400'}`}>
                            {trade.side1.owner}
                          </span>
                          {trade.winner === 'side1' && (
                            <span className="text-green-400 text-sm">✓</span>
                          )}
                          {trade.longterm_winner === 'side1' && trade.keeper_flip && (
                            <span className="text-purple-400 text-sm">🔄</span>
                          )}
                        </div>
                        <div className="text-right">
                          {trade.side1.total_points > 0 && (
                            <div className="text-sm text-white/50">{trade.side1.total_points.toFixed(1)} pts</div>
                          )}
                          {trade.side1.keeper_points > 0 && (
                            <div className="text-xs text-purple-400">+{trade.side1.keeper_points.toFixed(0)} keeper</div>
                          )}
                        </div>
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
                    <div className={`space-y-3 p-4 rounded-xl ${trade.winner === 'side2' ? 'bg-green-500/5 border border-green-500/20' : trade.longterm_winner === 'side2' && trade.keeper_flip ? 'bg-purple-500/5 border border-purple-500/20' : 'bg-slate-800/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${trade.winner === 'side2' ? 'text-green-400' : trade.longterm_winner === 'side2' && trade.keeper_flip ? 'text-purple-400' : 'text-cyan-400'}`}>
                            {trade.side2.owner}
                          </span>
                          {trade.winner === 'side2' && (
                            <span className="text-green-400 text-sm">✓</span>
                          )}
                          {trade.longterm_winner === 'side2' && trade.keeper_flip && (
                            <span className="text-purple-400 text-sm">🔄</span>
                          )}
                        </div>
                        <div className="text-right">
                          {trade.side2.total_points > 0 && (
                            <div className="text-sm text-white/50">{trade.side2.total_points.toFixed(1)} pts</div>
                          )}
                          {trade.side2.keeper_points > 0 && (
                            <div className="text-xs text-purple-400">+{trade.side2.keeper_points.toFixed(0)} keeper</div>
                          )}
                        </div>
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

        {/* Sidebar - Most Lopsided Trades & Keeper Flips */}
        <div className="space-y-6">
          {/* Keeper Flip Trades */}
          {keeperFlipTrades.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-fuchsia-500/10 p-1">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center">
                  <span className="mr-2">🔄</span> Keeper Payoffs
                </h3>
                <p className="text-xs text-white/50 mb-4">Lost the season, won long-term</p>
                <div className="space-y-4">
                  {keeperFlipTrades.slice(0, 5).map((trade, idx) => {
                    const ltWinnerSide = trade.longterm_winner === 'side1' ? trade.side1 : trade.side2;
                    const ltLoserSide = trade.longterm_winner === 'side1' ? trade.side2 : trade.side1;
                    return (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-400 font-semibold text-sm">
                            {trade.year} {trade.trade_timing || (trade.week ? `Week ${trade.week}` : 'Offseason')}
                          </span>
                        </div>
                        {/* Long-term winner */}
                        <div className="mb-3">
                          <div className="text-xs text-purple-400 font-medium mb-1">
                            {trade.longterm_winner_owner} received:
                          </div>
                          <div className="space-y-0.5 mb-2">
                            {ltWinnerSide.received.map((player, pIdx) => (
                              <div key={pIdx} className="text-xs text-white/80 pl-2">
                                • {player.player_name}
                              </div>
                            ))}
                          </div>
                          {/* Keeper player breakdown */}
                          {ltWinnerSide.players_with_stats?.some(p => p.keeper_years?.length > 0) && (
                            <div className="space-y-1 mb-2">
                              <div className="text-[10px] text-purple-300 uppercase tracking-wide">Keeper Value:</div>
                              {ltWinnerSide.players_with_stats
                                ?.filter(p => p.keeper_years && p.keeper_years.length > 0)
                                .map((player, pIdx) => (
                                  <div key={pIdx} className="bg-purple-500/10 rounded px-2 py-1">
                                    <div className="text-white/90 text-xs font-medium">{player.name}</div>
                                    <div className="text-purple-300 text-[10px]">
                                      {player.keeper_years.map(ky => `${ky.year}: ${ky.points.toFixed(0)} pts`).join(' → ')}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                          <div className="space-y-0.5 text-xs bg-slate-800/50 rounded p-2">
                            <div className="text-red-400/80">Season: {ltWinnerSide.total_points.toFixed(0)} pts</div>
                            <div className="text-green-400">+Keeper: {ltWinnerSide.keeper_points.toFixed(0)} pts</div>
                            <div className="text-purple-300 font-medium">Total: {ltWinnerSide.total_value.toFixed(0)} pts</div>
                          </div>
                        </div>
                        {/* Immediate winner (long-term loser) */}
                        <div className="border-t border-white/10 pt-2 mt-2">
                          <div className="text-xs text-white/50 mb-1">
                            {trade.winner_owner} received:
                          </div>
                          <div className="space-y-0.5 mb-2">
                            {ltLoserSide.received.map((player, pIdx) => (
                              <div key={pIdx} className="text-xs text-white/50 pl-2">
                                • {player.player_name}
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-white/40 bg-slate-800/30 rounded p-2">
                            Season: {ltLoserSide.total_points.toFixed(0)} pts | Total: {ltLoserSide.total_value.toFixed(0)} pts
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Most Lopsided Trades */}
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
