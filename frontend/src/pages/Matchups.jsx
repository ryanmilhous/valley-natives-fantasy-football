import { useState, useEffect } from 'react';
import apiService from '../services/api';
import PageHero from '../components/ui/PageHero';
import FilterBar from '../components/ui/FilterBar';
import DataTableShell from '../components/ui/DataTableShell';
import { heroBanners } from '../theme/heroBanners';
import { retroAssets } from '../theme/retroAssets';

function Matchups() {
  const [matchups, setMatchups] = useState([]);
  const [standings, setStandings] = useState([]);
  const [filteredMatchups, setFilteredMatchups] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchupsResponse, standingsResponse] = await Promise.all([
          apiService.getMatchups(),
          apiService.getAllStandings()
        ]);
        setMatchups(matchupsResponse.data);
        setStandings(standingsResponse.data);
        setFilteredMatchups(matchupsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to get owner from team name and year
  const getOwnerForTeam = (teamName, year) => {
    const standing = standings.find(s => s.team_name === teamName && s.year === year);
    return standing?.owner || null;
  };

  useEffect(() => {
    let filtered = matchups;

    if (selectedYear !== 'all') {
      filtered = filtered.filter(m => m.year === parseInt(selectedYear));
    }

    if (selectedOwner !== 'all') {
      filtered = filtered.filter(m => {
        const homeOwner = getOwnerForTeam(m.home_team, m.year);
        const awayOwner = getOwnerForTeam(m.away_team, m.year);
        return homeOwner === selectedOwner || awayOwner === selectedOwner;
      });
    }

    setFilteredMatchups(filtered);
  }, [selectedYear, selectedOwner, matchups, standings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-white/70 mt-4 font-medium">Loading matchups...</p>
        </div>
      </div>
    );
  }

  const years = [...new Set(matchups.map(m => m.year))].sort((a, b) => b - a);
  const owners = [...new Set(standings.map(s => s.owner))].filter(Boolean).sort();

  return (
    <div className="space-y-8">
      <PageHero
        {...heroBanners.matchups}
        crestSrc={retroAssets[heroBanners.matchups.assetKey]?.crest.primary}
        crestAlt="Matchup history crest"
        tickerRailSrc={retroAssets[heroBanners.matchups.assetKey]?.chrome.tickerRail}
        titlePlateSrc={retroAssets[heroBanners.matchups.assetKey]?.chrome.titlePlate}
        eyebrow="Redwood Rivalry Ledger"
        title="Matchup History"
        subtitle={`${matchups.length} total matchups across all seasons`}
      />

      {/* Filters */}
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
          Showing {filteredMatchups.length} of {matchups.length} matchups
        </div>
      </FilterBar>

      {/* Matchups Table */}
      <DataTableShell title="Matchup Results">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto vn-table-scroll" role="region" aria-label="Matchup history table">
            <table className="min-w-full">
              <thead className="border-b border-white/10 sticky top-0 bg-slate-900/95 backdrop-blur-xl">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Season</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Week</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Home</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-bold text-purple-400 uppercase tracking-wider">Score</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Away</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">Winner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMatchups.map((matchup, index) => {
                  const homeOwner = getOwnerForTeam(matchup.home_team, matchup.year);
                  const awayOwner = getOwnerForTeam(matchup.away_team, matchup.year);
                  const winnerOwner = matchup.winner === 'TIE' ? null :
                    matchup.winner === matchup.home_team ? homeOwner : awayOwner;

                  return (
                    <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-white/90">
                        {matchup.year}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-white/90">
                        {matchup.week}
                        {matchup.is_playoff && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            Playoff
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white/90">{homeOwner || matchup.home_team}</div>
                        {homeOwner && <div className="text-xs text-white/50">{matchup.home_team}</div>}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-bold text-white">
                          {matchup.home_score.toFixed(2)} - {matchup.away_score.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white/90">{awayOwner || matchup.away_team}</div>
                        {awayOwner && <div className="text-xs text-white/50">{matchup.away_team}</div>}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          matchup.winner === 'TIE'
                            ? 'bg-white/10 text-white/70 border border-white/20'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {matchup.winner === 'TIE' ? 'TIE' : (winnerOwner || matchup.winner)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      </DataTableShell>
    </div>
  );
}

export default Matchups;
