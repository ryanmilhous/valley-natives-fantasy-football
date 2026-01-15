#!/usr/bin/env python3
"""
Import auction draft data from League Legacy RTF exports.
Extracts auction_bid_amount and is_keeper for 2012-2018 seasons.
"""

import json
import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
EXPORTS_DIR = BASE_DIR / 'data' / 'exports'
RAW_DATA_DIR = BASE_DIR / 'data' / 'raw'

def extract_json_from_rtf(rtf_path):
    """Extract JSON data from RTF file."""
    with open(rtf_path, 'rb') as f:
        content = f.read().decode('utf-8', errors='ignore')

    # First, clean up RTF escaping throughout the content
    # RTF uses \{ and \} to escape braces, and \. for line continuation
    content = content.replace('\\{', '{')
    content = content.replace('\\}', '}')
    content = content.replace('\\\n', '\n')  # Line continuation
    content = content.replace('\\/', '/')
    # Handle escaped quotes within strings (RTF escapes " as \")
    content = content.replace('\\"', '"')
    # But we need to restore escaped quotes that are inside JSON strings
    # The pattern [\"....\"] becomes ["...."] which is valid JSON
    content = re.sub(r'\["([^"]+)"\]', r'["\1"]', content)

    # Find the start of the JSON
    json_start = content.find('"component": "League/Draft/Season"')
    if json_start == -1:
        print(f"  Could not find JSON start in {rtf_path}")
        return None

    # Go back to find the opening brace
    json_start = content.rfind('{', 0, json_start)

    # Extract from JSON start to end
    json_content = content[json_start:]

    # Find the matching closing brace
    brace_count = 0
    last_valid_pos = 0
    for i, char in enumerate(json_content):
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                last_valid_pos = i + 1
                break

    json_content = json_content[:last_valid_pos]

    try:
        data = json.loads(json_content)
        return data
    except json.JSONDecodeError as e:
        print(f"  JSON parse error at position {e.pos}: {e.msg}")
        # Show context around error
        if e.pos:
            start = max(0, e.pos - 50)
            end = min(len(json_content), e.pos + 50)
            print(f"  Context: ...{json_content[start:end]}...")
        # Try to salvage by finding draft_results array
        return extract_draft_results_only(json_content)

def extract_draft_results_only(content):
    """Fallback: extract just the draft_results array using regex."""
    # Find all draft pick entries with the fields we care about
    picks = []

    # Pattern to match individual draft pick objects
    pick_pattern = re.compile(
        r'"draft_pick":\s*(\d+).*?'
        r'"auction_bid_amount":\s*(null|\d+).*?'
        r'"is_keeper":\s*(\d+).*?'
        r'"player":\s*\{[^}]*"name":\s*"([^"]*)"',
        re.DOTALL
    )

    for match in pick_pattern.finditer(content):
        draft_pick = int(match.group(1))
        bid_amount = None if match.group(2) == 'null' else int(match.group(2))
        is_keeper = bool(int(match.group(3)))
        player_name = match.group(4)

        picks.append({
            'draft_pick': draft_pick,
            'auction_bid_amount': bid_amount,
            'is_keeper': is_keeper,
            'player': {'name': player_name}
        })

    if picks:
        print(f"  Extracted {len(picks)} picks via regex fallback")
        return {'props': {'season': {'draft_results': picks}}}

    return None

def process_auction_file(year):
    """Process a single year's auction data file."""
    rtf_path = EXPORTS_DIR / f'Auction_Draft_Data_{year}.rtf'

    if not rtf_path.exists():
        print(f"  File not found: {rtf_path}")
        return None

    print(f"Processing {year}...")
    data = extract_json_from_rtf(rtf_path)

    if not data:
        return None

    # Navigate to draft results
    try:
        draft_results = data['props']['season']['draft_results']
        print(f"  Found {len(draft_results)} draft picks")
        return draft_results
    except (KeyError, TypeError) as e:
        print(f"  Could not find draft_results: {e}")
        return None

def extract_pick_data(draft_result):
    """Extract relevant data from a draft result entry."""
    player_info = draft_result.get('player') or {}

    return {
        'player_name': player_info.get('name', ''),
        'espn_player_id': draft_result.get('service_player_id'),
        'player_team': draft_result.get('player_team'),
        'draft_round': draft_result.get('draft_round'),
        'draft_pick': draft_result.get('draft_pick'),
        'auction_bid_amount': draft_result.get('auction_bid_amount'),
        'is_keeper': bool(draft_result.get('is_keeper', 0)),
        'season_team_id': draft_result.get('season_team_id'),
        'position': player_info.get('position'),
    }

def update_raw_season_file(year, auction_data):
    """Update the raw season file with auction bid amounts."""
    season_path = RAW_DATA_DIR / f'season_{year}.json'

    if not season_path.exists():
        print(f"  Season file not found: {season_path}")
        return False

    with open(season_path, 'r') as f:
        season_data = json.load(f)

    if 'draft' not in season_data or not season_data['draft']:
        print(f"  No draft data in season file for {year}")
        return False

    # Create lookup by player name (lowercase for matching)
    auction_lookup = {}
    for pick in auction_data:
        name = pick['player_name'].lower().strip()
        if name:
            auction_lookup[name] = pick

    # Update draft entries
    updated_count = 0
    keeper_count = 0
    for draft_pick in season_data['draft']:
        player_name = draft_pick.get('player_name', '').lower().strip()

        if player_name in auction_lookup:
            auction_info = auction_lookup[player_name]

            # Update bid amount
            bid_amount = auction_info['auction_bid_amount']
            if bid_amount is not None:
                draft_pick['bid_amount'] = bid_amount
                updated_count += 1

            # Update keeper status
            if auction_info['is_keeper']:
                draft_pick['keeper_status'] = True
                keeper_count += 1

    # Save updated file
    with open(season_path, 'w') as f:
        json.dump(season_data, f, indent=2)

    print(f"  Updated {updated_count} bid amounts, {keeper_count} keepers")
    return True

def main():
    print("=" * 50)
    print("Importing Auction Draft Data (2012-2018)")
    print("=" * 50)
    print()

    years = range(2012, 2019)  # 2012-2018

    for year in years:
        draft_results = process_auction_file(year)

        if draft_results:
            # Extract relevant data
            auction_data = [extract_pick_data(r) for r in draft_results]

            # Print sample
            if auction_data:
                sample = auction_data[0]
                print(f"  Sample: {sample['player_name']} - ${sample['auction_bid_amount']} (keeper: {sample['is_keeper']})")

            # Update raw season file
            update_raw_season_file(year, auction_data)

        print()

    print("=" * 50)
    print("Done! Now run the data processor to regenerate files:")
    print("  python3 backend/data_processor.py")
    print("=" * 50)

if __name__ == '__main__':
    main()
