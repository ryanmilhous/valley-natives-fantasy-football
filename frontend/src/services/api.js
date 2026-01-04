// Fetch data from static JSON files
const fetchJSON = async (filename) => {
  const response = await fetch(`/data/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${filename}`);
  }
  return response.json();
};

// API service using static JSON files
export const apiService = {
  // Metadata
  getMetadata: async () => {
    const data = await fetchJSON('metadata.json');
    return { data };
  },

  // Seasons
  getSeasons: async () => {
    const data = await fetchJSON('metadata.json');
    return { data };
  },
  getSeason: async (year) => {
    const standings = await fetchJSON('standings.json');
    const data = standings.filter(s => s.year === year);
    return { data };
  },

  // Teams
  getTeams: async () => {
    const teams = await fetchJSON('teams.json');
    const data = Object.values(teams);
    return { data };
  },
  getTeam: async (teamId) => {
    const teams = await fetchJSON('teams.json');
    const data = teams[teamId];
    return { data };
  },

  // Owners
  getOwners: async () => {
    const owners = await fetchJSON('owners.json');
    const data = Object.values(owners);
    return { data };
  },

  // Matchups
  getMatchups: async () => {
    const data = await fetchJSON('matchups.json');
    return { data };
  },
  getTeamMatchups: async (teamName) => {
    const matchups = await fetchJSON('matchups.json');
    const data = matchups.filter(
      m => m.home_team === teamName || m.away_team === teamName
    );
    return { data };
  },

  // Head to Head
  getAllHeadToHead: async () => {
    const data = await fetchJSON('head_to_head.json');
    return { data };
  },
  getHeadToHead: async (team1, team2) => {
    const h2h = await fetchJSON('head_to_head.json');
    const data = h2h[team1]?.[team2] || null;
    return { data };
  },

  // Standings
  getAllStandings: async () => {
    const data = await fetchJSON('standings.json');
    return { data };
  },
  getStandings: async (year) => {
    const standings = await fetchJSON('standings.json');
    const data = standings.filter(s => s.year === year);
    return { data };
  },

  // Playoffs
  getAllPlayoffs: async () => {
    const data = await fetchJSON('playoffs.json');
    return { data };
  },
  getPlayoffs: async (year) => {
    const playoffs = await fetchJSON('playoffs.json');
    const data = playoffs.find(p => p.year === year);
    return { data };
  },

  // Records
  getRecords: async () => {
    const data = await fetchJSON('records.json');
    return { data };
  },

  // Draft
  getDraft: async () => {
    const data = await fetchJSON('draft.json');
    return { data };
  },
  getBestDraftPicks: async () => {
    const data = await fetchJSON('best_draft_picks.json');
    return { data };
  },
  getWorstDraftPicks: async () => {
    const data = await fetchJSON('worst_draft_picks.json');
    return { data };
  },

  // Rosters
  getRosters: async () => {
    const data = await fetchJSON('rosters.json');
    return { data };
  },

  // Player Stats
  getPlayerStats: async () => {
    const data = await fetchJSON('player_stats.json');
    return { data };
  },

  // Optimal Lineups
  getOptimalLineups: async () => {
    const data = await fetchJSON('optimal_lineups.json');
    return { data };
  },

  // Export Excel - Not available in static deployment
  // Users should generate this locally using the backend
  exportExcel: () => {
    alert('Excel export is not available in the hosted version. Please run the backend locally to generate Excel files.');
    return Promise.reject(new Error('Excel export not available'));
  },

  // Refresh data - Not available in static deployment
  refreshData: () => {
    alert('Data refresh is not available in the hosted version. Please run the backend locally to refresh data.');
    return Promise.reject(new Error('Data refresh not available'));
  },
};

export default apiService;
