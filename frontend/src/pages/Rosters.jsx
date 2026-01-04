import { useState, useEffect } from 'react';
import apiService from '../services/api';

function Rosters() {
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getRosters();
        setRosters(response.data);
        if (response.data.length > 0) {
          // Set default year to most recent
          const years = [...new Set(response.data.map(r => r.year))].sort((a, b) => b - a);
          setSelectedYear(years[0]);
        }
      } catch (error) {
        console.error('Error fetching rosters:', error);
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
          <p className="text-white/70 mt-4 font-medium">Loading rosters...</p>
        </div>
      </div>
    );
  }

  const years = [...new Set(rosters.map(r => r.year))].sort((a, b) => b - a);
  const owners = ['all', ...new Set(rosters.filter(r => r.year === selectedYear).map(r => r.owner))].sort();

  const filteredRosters = rosters.filter(roster => {
    if (roster.year !== selectedYear) return false;
    if (selectedOwner !== 'all' && roster.owner !== selectedOwner) return false;
    return true;
  });

  const positionOrder = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'D/ST', 'BE'];
  const positionColors = {
    'QB': 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
    'RB': 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    'WR': 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    'TE': 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400',
    'K': 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    'D/ST': 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400'
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">👥</div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                Team Rosters
              </h1>
              <p className="text-white/70 mt-2">Historical team compositions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-white/70 mb-2">Year</label>
          <select
            value={selectedYear || ''}
            onChange={(e) => {
              setSelectedYear(parseInt(e.target.value));
              setSelectedOwner('all');
            }}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 focus:border-green-500 focus:outline-none"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-white/70 mb-2">Owner</label>
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 focus:border-green-500 focus:outline-none"
          >
            {owners.map(owner => (
              <option key={owner} value={owner}>{owner === 'all' ? 'All Owners' : owner}</option>
            ))}
          </select>
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
              <strong>Note:</strong> Roster data is only available from 2019-present due to ESPN API limitations.
            </p>
          </div>
        </div>
      </div>

      {/* Rosters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRosters.map((rosterEntry, index) => (
          <div key={index} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-teal-500/10 p-1">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              {/* Team Header */}
              <div className="mb-4 pb-4 border-b border-white/10">
                <div className="text-xl font-bold text-white">{rosterEntry.team_name}</div>
                <div className="text-sm text-green-400 font-semibold">{rosterEntry.owner}</div>
                <div className="text-xs text-white/50">{rosterEntry.year}</div>
              </div>

              {/* Roster List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {rosterEntry.roster
                  .sort((a, b) => {
                    const aIndex = positionOrder.indexOf(a.position);
                    const bIndex = positionOrder.indexOf(b.position);
                    if (aIndex === -1 && bIndex === -1) return 0;
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                  })
                  .map((player, pidx) => (
                    <div key={pidx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${positionColors[player.position] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400'} border`}>
                          {player.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{player.name}</div>
                          <div className="text-xs text-white/50">{player.pro_team}</div>
                        </div>
                      </div>
                      {player.total_points > 0 && (
                        <div className="text-xs text-green-400 font-semibold ml-2">
                          {player.total_points.toFixed(1)} pts
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRosters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/50 text-lg">No roster data available for the selected filters</p>
        </div>
      )}
    </div>
  );
}

export default Rosters;
