"""
Import Snake Draft Data from League Legacy exports

Reads the snake_draft_YEAR.json files and updates the raw season data.
"""

import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
EXPORTS_DIR = BASE_DIR / 'data' / 'exports'
RAW_DIR = BASE_DIR / 'data' / 'raw'

# League Member ID to Owner Name mapping (from leaguelegacy_trade_extractor.py)
MEMBER_TO_OWNER = {
    140840: 'Chris Vitale',
    140841: 'Kellen Coffis',
    140842: 'Jamie Coffis',
    140843: 'Garrett Ulrich',
    140844: 'Greg Swenson',
    140845: 'Jeremy Settles',
    140846: 'Nick Smielak',
    140848: 'Rory McKee',
    140849: 'Jacob Luna',
    140850: 'Bryan Whitaker',
    140851: 'Brendan Romele',
    140852: 'Ryan Milhous',
    140853: 'Ben Beck',
    140854: 'Kyle Poppen',
    151662: 'Kyle Morris',
    151663: 'Ben Beck',
    151664: 'Brian Vitale',
    151665: 'Tyler Fullerton',
    151666: 'Tanner Clark',
    151667: 'Tanner Clark',
    151668: 'Brian Vitale',
    151669: 'Peter Kent-Stoll',
}


def import_snake_draft(year):
    """Import snake draft data for a specific year"""
    draft_file = EXPORTS_DIR / f'snake_draft_{year}.json'
    season_file = RAW_DIR / f'season_{year}.json'

    if not draft_file.exists():
        print(f"  Warning: {draft_file} not found")
        return False

    if not season_file.exists():
        print(f"  Warning: {season_file} not found")
        return False

    # Load draft data
    with open(draft_file) as f:
        draft_data = json.load(f)

    # Load season data
    with open(season_file) as f:
        season_data = json.load(f)

    # Convert draft picks to the format used in raw season files
    picks = draft_data.get('picks', [])
    converted_picks = []

    for pick in picks:
        # Get owner name from league_member_id
        league_member_id = pick.get('league_member_id')
        owner = MEMBER_TO_OWNER.get(league_member_id, None)

        # If owner not found in mapping, try to infer from team name
        if not owner:
            team_name = pick.get('team_name', '')
            # We'll set owner to None and let the data processor handle it
            owner = None

        converted_picks.append({
            'player_name': pick.get('player_name', 'Unknown'),
            'player_id': pick.get('player_id'),
            'team_id': pick.get('league_member_id'),  # Use league_member_id as team_id
            'team_name': pick.get('team_name'),
            'owner': owner,
            'round_num': pick.get('round_num'),
            'round_pick': pick.get('round_pick'),
            'overall_pick': pick.get('overall_pick'),
            'bid_amount': 0,  # Snake drafts don't have bids
            'keeper_status': pick.get('is_keeper', False),
            'position': pick.get('position', '')
        })

    # Update season data
    season_data['draft'] = converted_picks

    # Save updated season data
    with open(season_file, 'w') as f:
        json.dump(season_data, f, indent=2)

    print(f"  {year}: Imported {len(converted_picks)} picks")
    return True


def main():
    print("=== Importing Snake Draft Data ===\n")

    years = [2007, 2008, 2009, 2010, 2011]
    success_count = 0

    for year in years:
        if import_snake_draft(year):
            success_count += 1

    print(f"\nImported {success_count}/{len(years)} years")
    print("\nNext steps:")
    print("  1. Run: python3 backend/data_processor.py")
    print("  2. Run: cp data/processed/*.json frontend/public/data/")


if __name__ == '__main__':
    main()
