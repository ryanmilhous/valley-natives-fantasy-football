/**
 * League Legacy Snake Draft Extractor - FINAL VERSION
 *
 * Instructions:
 * 1. Go to each draft page:
 *    - https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2007
 *    - https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2008
 *    - https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2009
 *    - https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2010
 *    - https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2011
 * 2. Open DevTools (F12) → Console
 * 3. Paste this script and press Enter
 * 4. A JSON file will download for that year
 * 5. Repeat for each year
 * 6. Save all files to: data/exports/
 */

(function extractSnakeDraft() {
  const el = document.querySelector('[data-page]');
  if (!el) {
    console.log('ERROR: No data-page element found');
    return;
  }

  const data = JSON.parse(el.getAttribute('data-page'));
  const season = data.props?.season;

  if (!season) {
    console.log('ERROR: No season data found');
    return;
  }

  const year = season.season;
  const draftType = season.draft_type;
  const draftResults = season.draft_results || [];
  const teams = season.teams || [];

  console.log(`Year: ${year}`);
  console.log(`Draft Type: ${draftType}`);
  console.log(`Picks: ${draftResults.length}`);
  console.log(`Teams: ${teams.length}`);

  // Build team lookup (season_team_id -> team info)
  const teamLookup = {};
  teams.forEach(team => {
    teamLookup[team.id] = {
      team_name: team.name,
      league_member_id: team.league_member_id
    };
  });

  // Extract picks
  const picks = draftResults.map(pick => {
    const player = pick.player || {};
    const team = teamLookup[pick.season_team_id] || {};

    return {
      year: parseInt(year),
      round_num: pick.draft_round,
      round_pick: pick.draft_round_pick,
      overall_pick: pick.draft_pick,
      player_name: player.name || 'Unknown',
      player_id: pick.player_id,
      position: player.position || '',
      team_name: team.team_name || pick.team?.name || 'Unknown',
      league_member_id: team.league_member_id,
      is_keeper: pick.is_keeper === 1
    };
  });

  // Sort by overall pick
  picks.sort((a, b) => a.overall_pick - b.overall_pick);

  // Show first 10 picks
  console.log('\nFirst 10 picks:');
  picks.slice(0, 10).forEach(p => {
    console.log(`  Rd ${p.round_num}, Pick ${p.round_pick} (#${p.overall_pick}): ${p.player_name} (${p.position}) - ${p.team_name}`);
  });

  // Download
  const output = {
    year: parseInt(year),
    draft_type: draftType,
    num_teams: teams.length,
    picks: picks
  };

  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `snake_draft_${year}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log(`\n✓ Downloaded snake_draft_${year}.json`);
  return output;
})();
