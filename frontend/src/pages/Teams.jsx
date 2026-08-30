import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PageHero from '../components/ui/PageHero';
import Panel from '../components/ui/Panel';
import FilterBar from '../components/ui/FilterBar';
import StatBadge from '../components/ui/StatBadge';
import { heroBanners } from '../theme/heroBanners';

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
      <PageHero
        {...heroBanners.teams}
        eyebrow="Owner Almanac"
        title="Owner Profiles"
        subtitle="Career snapshots, trends, and seasonal history"
      />

      {/* Owner Selector */}
      <FilterBar>
        <div className="w-full md:w-96">
          <label className="vn-input-label">Select Owner</label>
        <select
          value={selectedOwner?.owner || ''}
          onChange={(e) => setSelectedOwner(owners.find(o => o.owner === e.target.value))}
          className="vn-select"
        >
          {owners.map(owner => (
            <option key={owner.owner} value={owner.owner}>
              {owner.owner} ({owner.first_season === owner.last_season ? owner.first_season : `${owner.first_season}-${owner.last_season}`})
            </option>
          ))}
        </select>
        </div>
      </FilterBar>

      {selectedOwner && (
        <>
          {/* Owner Overview */}
          <Panel title={selectedOwner.owner} subtitle={`Active ${selectedOwner.first_season === selectedOwner.last_season ? selectedOwner.first_season : `${selectedOwner.first_season}-${selectedOwner.last_season}`} (${selectedOwner.seasons_played} seasons)`}>
            <div className="hidden">
              Active: {selectedOwner.first_season === selectedOwner.last_season ? selectedOwner.first_season : `${selectedOwner.first_season}-${selectedOwner.last_season}`} ({selectedOwner.seasons_played} seasons)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="text-2xl font-bold text-emerald-300">{selectedOwner.all_time.wins}</div>
                <div className="text-sm text-[var(--vn-text-secondary)]">Career Wins</div>
              </div>
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <div className="text-2xl font-bold text-red-300">{selectedOwner.all_time.losses}</div>
                <div className="text-sm text-[var(--vn-text-secondary)]">Career Losses</div>
              </div>
              <div className="rounded-lg border border-[var(--vn-gold-500)]/30 bg-[var(--vn-gold-500)]/10 p-4">
                <div className="text-2xl font-bold text-[var(--vn-gold-500)]">{selectedOwner.all_time.championships}</div>
                <div className="text-sm text-[var(--vn-text-secondary)]">Championships</div>
              </div>
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
                <div className="text-2xl font-bold text-cyan-300">{selectedOwner.all_time.playoff_appearances}</div>
                <div className="text-sm text-[var(--vn-text-secondary)]">Playoff Apps</div>
              </div>
            </div>
          </Panel>

          {/* Season Performance Chart */}
          <Panel title="Season Performance">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedOwner.seasons}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                <XAxis dataKey="year" stroke="rgba(239,230,210,0.78)" />
                <YAxis stroke="rgba(239,230,210,0.78)" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="wins" stroke="#23B8B0" name="Wins" />
                <Line type="monotone" dataKey="losses" stroke="#FF6F61" name="Losses" />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          {/* Season History Table */}
          <Panel
            title="Season History"
            actions={<StatBadge tone="neutral" label={`${selectedOwner.seasons.length} seasons`} />}
          >
            <div className="overflow-x-auto vn-table-scroll" role="region" aria-label="Owner season history table">
              <table className="min-w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-[var(--vn-text-secondary)] uppercase">Year</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-[var(--vn-text-secondary)] uppercase">Team Name</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-[var(--vn-text-secondary)] uppercase">Record</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-[var(--vn-text-secondary)] uppercase">Points For</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-[var(--vn-text-secondary)] uppercase">Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {selectedOwner.seasons.map(season => (
                    <tr key={season.year} className="hover:bg-white/5">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-[var(--vn-text-primary)]">{season.year}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-[var(--vn-text-primary)]">{season.team_name}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-[var(--vn-text-primary)]">
                        {season.wins}-{season.losses}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-[var(--vn-text-primary)]">
                        {season.points_for.toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-[var(--vn-text-primary)]">
                        {season.final_standing}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

export default Teams;
