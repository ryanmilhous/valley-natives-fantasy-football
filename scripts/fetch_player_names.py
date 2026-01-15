#!/usr/bin/env python3
"""
Fetch player names from ESPN API for League Legacy player IDs.
Creates a mapping file that can be used to update raw season data.
"""

import json
import os
import time
import urllib.request
import urllib.error

LEAGUELEGACY_FILE = "data/exports/leaguelegacy_matchups_2006-2018.json"
PLAYER_MAPPING_FILE = "data/exports/player_id_mapping.json"
ESPN_API_BASE = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/"

def load_existing_mapping():
    """Load existing player mapping if it exists."""
    if os.path.exists(PLAYER_MAPPING_FILE):
        with open(PLAYER_MAPPING_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_mapping(mapping):
    """Save player mapping to file."""
    with open(PLAYER_MAPPING_FILE, 'w') as f:
        json.dump(mapping, f, indent=2)

def get_unique_player_ids():
    """Extract all unique player IDs from League Legacy data."""
    with open(LEAGUELEGACY_FILE, 'r') as f:
        data = json.load(f)

    player_ids = set()
    for year_data in data.values():
        for m in year_data['matchups']:
            roster = json.loads(m['roster']) if isinstance(m['roster'], str) else m['roster']
            for p in roster:
                sid = p.get('service_player_id')
                if sid and sid > 0:  # Skip negative IDs (DEF teams)
                    player_ids.add(sid)

    return sorted(player_ids)

def fetch_player_info(player_id):
    """Fetch player info from ESPN API."""
    url = f"{ESPN_API_BASE}{player_id}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            return {
                'name': data.get('fullName') or data.get('displayName') or data.get('name'),
                'position': data.get('position', {}).get('abbreviation', ''),
                'team': data.get('team', {}).get('abbreviation', ''),
            }
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None  # Player not found
        raise
    except Exception as e:
        print(f"    Error fetching {player_id}: {e}")
        return None

def main():
    print("Loading existing player mapping...")
    mapping = load_existing_mapping()
    existing_count = len(mapping)
    print(f"  Found {existing_count} existing mappings")

    print("\nGetting unique player IDs from League Legacy data...")
    all_ids = get_unique_player_ids()
    print(f"  Found {len(all_ids)} unique player IDs")

    # Filter to only IDs we haven't looked up yet
    ids_to_fetch = [pid for pid in all_ids if str(pid) not in mapping]
    print(f"  Need to fetch {len(ids_to_fetch)} new players")

    if not ids_to_fetch:
        print("\nAll player names already fetched!")
        return

    print(f"\nFetching player names from ESPN API...")
    print("  (This may take a few minutes)\n")

    fetched = 0
    not_found = 0
    errors = 0

    for i, player_id in enumerate(ids_to_fetch):
        try:
            info = fetch_player_info(player_id)
            if info and info.get('name'):
                mapping[str(player_id)] = info
                fetched += 1
                print(f"  [{i+1}/{len(ids_to_fetch)}] {player_id}: {info['name']} ({info['position']})")
            else:
                not_found += 1
                print(f"  [{i+1}/{len(ids_to_fetch)}] {player_id}: Not found")

            # Save periodically
            if (i + 1) % 50 == 0:
                save_mapping(mapping)
                print(f"  --- Saved progress ({len(mapping)} players) ---")

            # Rate limiting - be nice to ESPN's API
            time.sleep(0.2)

        except KeyboardInterrupt:
            print("\n\nInterrupted! Saving progress...")
            save_mapping(mapping)
            print(f"Saved {len(mapping)} player mappings")
            return

        except Exception as e:
            errors += 1
            print(f"  [{i+1}/{len(ids_to_fetch)}] {player_id}: Error - {e}")

    # Final save
    save_mapping(mapping)

    print(f"\n=== Summary ===")
    print(f"  Fetched: {fetched}")
    print(f"  Not found: {not_found}")
    print(f"  Errors: {errors}")
    print(f"  Total mappings: {len(mapping)}")
    print(f"\nSaved to {PLAYER_MAPPING_FILE}")
    print("\nNext step: Run apply_player_names.py to update the raw season files")

if __name__ == "__main__":
    main()
