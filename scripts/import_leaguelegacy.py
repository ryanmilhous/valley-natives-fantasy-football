#!/usr/bin/env python3
"""
Import League Legacy matchup data to supplement pre-2019 ESPN data.
This script reads the exported League Legacy JSON and merges it with existing raw season files.
"""

import json
import os
from datetime import datetime

# Paths
LEAGUELEGACY_FILE = "data/exports/leaguelegacy_matchups_2006-2018.json"
RAW_DATA_DIR = "data/raw"

def load_leaguelegacy_data():
    """Load the exported League Legacy JSON file."""
    with open(LEAGUELEGACY_FILE, 'r') as f:
        return json.load(f)

def load_existing_season(year):
    """Load existing raw season data."""
    filepath = os.path.join(RAW_DATA_DIR, f"season_{year}.json")
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return None

def save_season(year, data):
    """Save updated season data."""
    filepath = os.path.join(RAW_DATA_DIR, f"season_{year}.json")
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"  Saved {filepath}")

def parse_roster(roster_str):
    """Parse roster JSON string into list of player dicts."""
    if not roster_str:
        return []
    if isinstance(roster_str, str):
        return json.loads(roster_str)
    return roster_str

def build_team_mapping(matchups):
    """Build a mapping from League Legacy team IDs to team info."""
    team_map = {}
    for m in matchups:
        if 'team' in m and m['team']:
            team = m['team']
            team_map[team['id']] = {
                'name': team['name'],
                'league_member_id': team.get('league_member_id'),
                'wins': team.get('wins', 0),
                'losses': team.get('losses', 0),
                'ties': team.get('ties', 0),
                'total_points': team.get('total_points', 0),
                'playoff_seed': team.get('playoff_seed'),
                'rank': team.get('rank'),
            }
        if 'opponent' in m and m['opponent']:
            opp = m['opponent']
            team_map[opp['id']] = {
                'name': opp['name'],
                'league_member_id': opp.get('league_member_id'),
                'wins': opp.get('wins', 0),
                'losses': opp.get('losses', 0),
                'ties': opp.get('ties', 0),
                'total_points': opp.get('total_points', 0),
                'playoff_seed': opp.get('playoff_seed'),
                'rank': opp.get('rank'),
            }
    return team_map

def convert_matchups(ll_matchups, team_map):
    """
    Convert League Legacy matchups to ESPN raw format.

    League Legacy stores each side of a matchup separately, so we need to
    deduplicate by using matchup_guid.
    """
    seen_guids = set()
    converted = []

    for m in ll_matchups:
        guid = m.get('matchup_guid')
        if guid in seen_guids:
            continue
        seen_guids.add(guid)

        # Get team info
        team = m.get('team', {})
        opponent = m.get('opponent', {})

        home_team = team.get('name', 'Unknown')
        home_score = float(m.get('points', 0) or 0)
        away_team = opponent.get('name', 'Unknown')
        away_score = float(m.get('opponent_points', 0) or 0)

        # Determine if playoff
        is_playoff = bool(m.get('is_playoff')) or bool(m.get('is_consolation')) or bool(m.get('is_championship'))

        converted.append({
            'week': int(m.get('week', 0)),
            'is_playoff': is_playoff,
            'home_team': home_team,
            'home_team_id': team.get('id'),
            'home_score': home_score,
            'away_team': away_team,
            'away_team_id': opponent.get('id'),
            'away_score': away_score,
        })

    # Sort by week
    converted.sort(key=lambda x: x['week'])
    return converted

def convert_player_stats(ll_matchups, team_map, espn_team_name_to_id=None):
    """
    Extract player stats from matchup rosters.

    Returns list of player performance records by week.
    """
    player_stats = []

    for m in ll_matchups:
        week = int(m.get('week', 0))
        team = m.get('team', {})
        team_name = team.get('name', 'Unknown')
        ll_team_id = team.get('id')

        # Map to ESPN team ID if mapping provided
        team_id = ll_team_id
        if espn_team_name_to_id:
            team_id = espn_team_name_to_id.get(team_name, ll_team_id)

        roster = parse_roster(m.get('roster'))

        for player in roster:
            # Only include players who started
            if not player.get('started', False):
                continue

            points_str = player.get('points_ppr') or player.get('points') or '0'
            try:
                points = float(points_str)
            except (ValueError, TypeError):
                points = 0.0

            player_stats.append({
                'week': week,
                'team_id': team_id,
                'team_name': team_name,
                'player_name': player.get('player_name', ''),  # May be empty
                'player_id': player.get('service_player_id') or player.get('player_id'),
                'position': player.get('player_position', ''),
                'slot': player.get('lineup_position', ''),
                'points': points,
                'projected_points': 0.0,  # Not available in League Legacy
                'pro_team': player.get('player_team', ''),
            })

    return player_stats

def convert_rosters(ll_matchups, team_map, espn_team_name_to_id):
    """
    Extract end-of-season rosters from the last week's matchups.

    Returns dict mapping ESPN team_id to list of players.
    """
    rosters = {}

    # Group matchups by team and get the latest week
    team_weeks = {}
    for m in ll_matchups:
        team = m.get('team', {})
        ll_team_id = team.get('id')
        team_name = team.get('name', 'Unknown')
        week = int(m.get('week', 0))

        if ll_team_id not in team_weeks or week > team_weeks[ll_team_id]['week']:
            team_weeks[ll_team_id] = {
                'week': week,
                'roster': m.get('roster'),
                'team_name': team_name
            }

    # Convert rosters - map to ESPN team IDs
    for ll_team_id, data in team_weeks.items():
        roster = parse_roster(data['roster'])
        players = []
        team_name = data['team_name']

        # Find ESPN team ID by matching team name
        espn_team_id = espn_team_name_to_id.get(team_name)
        if espn_team_id is None:
            # Try fuzzy matching
            for espn_name, espn_id in espn_team_name_to_id.items():
                if team_name.lower().strip() == espn_name.lower().strip():
                    espn_team_id = espn_id
                    break
            if espn_team_id is None:
                continue  # Skip if we can't match the team

        for player in roster:
            points_str = player.get('points_ppr') or player.get('points') or '0'
            try:
                total_points = float(points_str)
            except (ValueError, TypeError):
                total_points = 0.0

            players.append({
                'name': player.get('player_name', ''),
                'player_id': player.get('service_player_id') or player.get('player_id'),
                'position': player.get('player_position', ''),
                'pro_team': player.get('player_team', ''),
                'injured': False,
                'injury_status': 'ACTIVE',
                'avg_points': 0.0,  # Would need to calculate
                'total_points': total_points,
            })

        rosters[str(espn_team_id)] = players

    return rosters

def merge_season_data(year, ll_year_data, existing_season):
    """Merge League Legacy data with existing season data."""

    if existing_season is None:
        print(f"  Warning: No existing season file for {year}")
        return None

    ll_matchups = ll_year_data.get('matchups', [])
    if not ll_matchups:
        print(f"  Warning: No matchups in League Legacy data for {year}")
        return existing_season

    # Build team mapping
    team_map = build_team_mapping(ll_matchups)

    # Build ESPN team name to ID mapping from existing season data
    espn_team_name_to_id = {}
    for team in existing_season.get('teams', []):
        espn_team_name_to_id[team['team_name']] = team['team_id']

    # Convert data
    converted_matchups = convert_matchups(ll_matchups, team_map)
    converted_player_stats = convert_player_stats(ll_matchups, team_map, espn_team_name_to_id)
    converted_rosters = convert_rosters(ll_matchups, team_map, espn_team_name_to_id)

    # Only update if existing data is empty
    if not existing_season.get('matchups'):
        existing_season['matchups'] = converted_matchups
        print(f"  Added {len(converted_matchups)} matchups")
    else:
        print(f"  Matchups already exist ({len(existing_season['matchups'])}), skipping")

    if not existing_season.get('player_stats'):
        existing_season['player_stats'] = converted_player_stats
        print(f"  Added {len(converted_player_stats)} player stats")
    else:
        print(f"  Player stats already exist ({len(existing_season['player_stats'])}), skipping")

    if not existing_season.get('rosters'):
        existing_season['rosters'] = converted_rosters
        print(f"  Added {len(converted_rosters)} rosters")
    else:
        print(f"  Rosters already exist ({len(existing_season['rosters'])}), skipping")

    # Update extraction timestamp
    existing_season['leaguelegacy_imported_at'] = datetime.now().isoformat()

    return existing_season

def main():
    print("Loading League Legacy data...")
    ll_data = load_leaguelegacy_data()

    years = sorted(ll_data.keys())
    print(f"Found data for years: {years}")
    print()

    for year_str in years:
        year = int(year_str)
        print(f"Processing {year}...")

        existing = load_existing_season(year)
        merged = merge_season_data(year, ll_data[year_str], existing)

        if merged:
            save_season(year, merged)

        print()

    print("Done! Run the data processor to regenerate processed files.")
    print("  python3 scripts/data_processor.py")

if __name__ == "__main__":
    main()
