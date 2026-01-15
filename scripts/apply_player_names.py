#!/usr/bin/env python3
"""
Apply player name mapping to raw season files.
Updates player_stats entries with player names from the mapping file.
"""

import json
import os

RAW_DATA_DIR = "data/raw"
PLAYER_MAPPING_FILE = "data/exports/player_id_mapping.json"

def load_mapping():
    """Load player ID to name mapping."""
    if not os.path.exists(PLAYER_MAPPING_FILE):
        print(f"Error: {PLAYER_MAPPING_FILE} not found!")
        print("Run fetch_player_names.py first to create the mapping.")
        return None

    with open(PLAYER_MAPPING_FILE, 'r') as f:
        return json.load(f)

def update_season_file(year, mapping):
    """Update player names in a season file."""
    filepath = os.path.join(RAW_DATA_DIR, f"season_{year}.json")

    if not os.path.exists(filepath):
        return 0, 0

    with open(filepath, 'r') as f:
        data = json.load(f)

    if not data.get('player_stats'):
        return 0, 0

    updated = 0
    total = len(data['player_stats'])

    for stat in data['player_stats']:
        player_id = stat.get('player_id')
        if player_id and str(player_id) in mapping:
            player_info = mapping[str(player_id)]
            if player_info.get('name'):
                stat['player_name'] = player_info['name']
                updated += 1

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

    return updated, total

def main():
    print("Loading player name mapping...")
    mapping = load_mapping()
    if mapping is None:
        return

    print(f"  Found {len(mapping)} player mappings\n")

    # Process years 2007-2018 (League Legacy import years)
    years = range(2007, 2019)
    total_updated = 0
    total_stats = 0

    for year in years:
        updated, total = update_season_file(year, mapping)
        if total > 0:
            pct = (updated / total * 100) if total else 0
            print(f"  {year}: Updated {updated}/{total} player stats ({pct:.1f}%)")
            total_updated += updated
            total_stats += total

    print(f"\n=== Summary ===")
    print(f"  Total stats updated: {total_updated}/{total_stats}")
    print(f"\nNow run the data processor to regenerate processed files:")
    print("  python3 backend/data_processor.py")

if __name__ == "__main__":
    main()
