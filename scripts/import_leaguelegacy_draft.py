#!/usr/bin/env python3
"""
Import League Legacy draft data to supplement pre-2019 ESPN data.
"""

import json
import os
from collections import defaultdict

LEAGUELEGACY_FILE = "data/exports/leaguelegacy_draft_2007-2018 (1).json"
RAW_DATA_DIR = "data/raw"

def load_leaguelegacy_data():
    """Load the exported League Legacy draft JSON file."""
    with open(LEAGUELEGACY_FILE, 'r') as f:
        data = json.load(f)

    # Parse the nested JSON strings
    parsed = {}
    for year, year_data in data.items():
        if isinstance(year_data, list) and year_data:
            # The data is a JSON string inside a list
            inner = json.loads(year_data[0]) if isinstance(year_data[0], str) else year_data[0]
            parsed[year] = inner
        else:
            parsed[year] = year_data

    return parsed

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

def build_team_id_mapping(season_data):
    """Build a mapping from team name to team_id."""
    mapping = {}
    for team in season_data.get('teams', []):
        mapping[team['team_name']] = team['team_id']
    return mapping

def convert_draft_data(ll_draft_data, team_id_mapping):
    """
    Convert League Legacy draft chart data to ESPN raw format.

    League Legacy format:
    {
        "datasets": [{
            "data": [
                {"x": 1, "y": 19.77, "team": "Team Name", "player": "Player Name"},
                ...
            ]
        }]
    }

    Target ESPN format:
    {
        "player_name": "DeAndre Hopkins",
        "player_id": null,
        "team_id": 1,
        "team_name": "The Chronic",
        "round_num": 1,
        "round_pick": 1,
        "overall_pick": 1,
        "bid_amount": 0,
        "keeper_status": false
    }
    """
    if not ll_draft_data or 'datasets' not in ll_draft_data:
        return []

    datasets = ll_draft_data.get('datasets', [])
    if not datasets or 'data' not in datasets[0]:
        return []

    raw_picks = datasets[0]['data']

    # Group picks by round to calculate round_pick
    picks_by_round = defaultdict(list)
    for pick in raw_picks:
        round_num = pick.get('x', 0)
        picks_by_round[round_num].append(pick)

    # Convert to target format
    converted = []
    overall_pick = 1

    for round_num in sorted(picks_by_round.keys()):
        round_picks = picks_by_round[round_num]
        for round_pick_num, pick in enumerate(round_picks, 1):
            team_name = pick.get('team', 'Unknown')
            player_name = pick.get('player', 'Unknown')

            # Try to find team_id from mapping
            team_id = team_id_mapping.get(team_name)

            # Try fuzzy matching if exact match not found
            if team_id is None:
                for known_team, known_id in team_id_mapping.items():
                    if team_name.lower() in known_team.lower() or known_team.lower() in team_name.lower():
                        team_id = known_id
                        break

            converted.append({
                'player_name': player_name,
                'player_id': None,  # Not available in League Legacy
                'team_id': team_id,
                'team_name': team_name,
                'round_num': round_num,
                'round_pick': round_pick_num,
                'overall_pick': overall_pick,
                'bid_amount': 0,  # Not available - this appears to be snake draft data
                'keeper_status': False,  # Not available
            })
            overall_pick += 1

    return converted

def main():
    print("Loading League Legacy draft data...")
    ll_data = load_leaguelegacy_data()

    years = sorted(ll_data.keys())
    print(f"Found draft data for years: {years}")
    print()

    for year_str in years:
        year = int(year_str)
        print(f"Processing {year}...")

        existing = load_existing_season(year)
        if existing is None:
            print(f"  Warning: No existing season file for {year}")
            continue

        # Build team ID mapping from existing teams
        team_id_mapping = build_team_id_mapping(existing)

        # Check if draft data already exists
        if existing.get('draft') and len(existing['draft']) > 0:
            print(f"  Draft data already exists ({len(existing['draft'])} picks), skipping")
            continue

        # Convert draft data
        converted_draft = convert_draft_data(ll_data[year_str], team_id_mapping)

        if converted_draft:
            existing['draft'] = converted_draft
            print(f"  Added {len(converted_draft)} draft picks")
            save_season(year, existing)
        else:
            print(f"  No draft data to import")

        print()

    print("Done! Run the data processor to regenerate processed files.")
    print("  python3 backend/data_processor.py")

if __name__ == "__main__":
    main()
