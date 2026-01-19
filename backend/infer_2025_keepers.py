"""
Infer 2025 keepers based on:
- $1 picks
- Position is QB, WR, RB, or TE (not DEF or K)
- Player was on the same owner's roster in 2024
"""

import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
RAW_DIR = BASE_DIR / 'data' / 'raw'

# Sleeper username to owner name mapping
USERNAME_TO_OWNER = {
    '17whitaker': 'Bryan Whitaker',
    '2muchdutch': 'Nick Smielak',
    'Benbasketball101': 'Ben Beck',
    'brom66': 'Brendan Romele',
    'Brydome17': 'Bryan Whitaker',
    'FortyChiners': 'Brendan Romele',
    'JeremySettles13': 'Jeremy Settles',
    'jmluna5020': 'Jacob Luna',
    'KCoffis': 'Kellen Coffis',
    'Kcoff07': 'Kellen Coffis',
    'kpop027': 'Kyle Poppen',
    'kpop': 'Kyle Poppen',
    'LunaCorp': 'Jacob Luna',
    'milmansion': 'Ryan Milhous',
    'NamasYe': 'Chris Vitale',
    'RapmasterRordogg': 'Rory McKee',
    'scson': 'Chris Vitale',  # Owner of RichCity Yung Beevs
    'SmiPi': 'Nick Smielak',
    'T1GHTSTEVE': 'Steve Keller',
    'gchildnl': 'Garrett Ulrich',
    'gswens83': 'Greg Swenson',
    'jamiecoffis': 'Jamie Coffis',
}

# Team name patterns to owner mapping
TEAM_TO_OWNER = {
    'Cherry Poppen': 'Kyle Poppen',
    'Smi Pies': 'Nick Smielak',
    'The Smi Pies': 'Nick Smielak',
    'PPPWRA': 'Rory McKee',
    'Tampon Bay Blumpkineers': 'Jacob Luna',
    'Felton Sluggers': 'Jeremy Settles',
    'S.F. Forty-Chiners': 'Brendan Romele',
    'The Kellen Brothers': 'Kellen Coffis',
    'For Those About To Brock': 'Bryan Whitaker',
    "Bryan Whitaker's Team": 'Bryan Whitaker',
    'Rich City YungBeevs': 'Chris Vitale',
    'RichCity Yung Beevs': 'Chris Vitale',
    'The Leftists': 'Jamie Coffis',
    'The Drakes': 'Jamie Coffis',
    "Mr. Thomas' Naberhood": 'Garrett Ulrich',
    'My Penix Will Rise Again': 'Garrett Ulrich',
    'Ding Dong Doid Brains': 'Ryan Milhous',
    'Prime Time': 'Greg Swenson',
    "The Pudd'n": 'Ben Beck',
    "The Pudd'n 🐬": 'Ben Beck',
    'Younghoe Bunghole': 'Rory McKee',
    'Mt. T1GHTMON': 'Steve Keller',
}


def normalize_owner(name):
    """Normalize owner name from various formats"""
    if not name:
        return None
    # Check username mapping
    if name in USERNAME_TO_OWNER:
        return USERNAME_TO_OWNER[name]
    # Check team name mapping
    if name in TEAM_TO_OWNER:
        return TEAM_TO_OWNER[name]
    return name


def normalize_player_name(name):
    """Normalize player name for comparison - strips suffixes like Jr., III, etc."""
    if not name:
        return ''
    name = name.lower().strip()
    # Remove common suffixes
    suffixes = [' jr.', ' jr', ' iii', ' ii', ' iv', ' sr.', ' sr']
    for suffix in suffixes:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
    return name.strip()


# Owner replacements: 2025 owner -> 2024 owner whose roster they inherited
OWNER_REPLACEMENTS = {
    'Steve Keller': 'Ben Beck',  # Steve took over Ben's team
}

# Known non-keepers (players that were $1 but not actually kept)
NON_KEEPERS = {
    ('Ryan Milhous', 'Tyjae Spears'),
    ('Bryan Whitaker', 'Blake Corum'),
    ('Chris Vitale', 'Ray Davis'),
    ('Chris Vitale', 'Sean Tucker'),
    ('Chris Vitale', 'Jalen McMillan'),
    ('Greg Swenson', 'Joe Mixon'),
    ('Jeremy Settles', "Wan'Dale Robinson"),
    ('Jeremy Settles', 'DeMario Douglas'),
}


def main():
    print("=== Inferring 2025 Keepers ===\n")

    # Load 2024 data
    with open(RAW_DIR / 'season_2024.json') as f:
        data_2024 = json.load(f)

    # Load 2025 data
    with open(RAW_DIR / 'season_2025.json') as f:
        data_2025 = json.load(f)

    # Build 2024 roster: owner -> set of player names (normalized)
    rosters_2024 = data_2024.get('rosters', {})
    teams_2024 = data_2024.get('teams', [])

    # Map team_id to owner
    team_to_owner_2024 = {}
    for team in teams_2024:
        owner = normalize_owner(team.get('owner'))
        team_to_owner_2024[str(team.get('team_id'))] = owner

    # Build owner -> player names mapping
    owner_players_2024 = {}
    for team_id, players in rosters_2024.items():
        owner = team_to_owner_2024.get(team_id)
        if not owner:
            owner = normalize_owner(team_id)
        if owner not in owner_players_2024:
            owner_players_2024[owner] = set()
        for player in players:
            player_name = normalize_player_name(player.get('name'))
            if player_name:
                owner_players_2024[owner].add(player_name)

    print(f"Loaded 2024 rosters for {len(owner_players_2024)} owners")
    for owner, players in owner_players_2024.items():
        print(f"  {owner}: {len(players)} players")

    # Process 2025 draft picks
    draft_2025 = data_2025.get('draft', [])
    teams_2025 = data_2025.get('teams', [])

    # Clear any existing keeper flags first
    for pick in draft_2025:
        pick['keeper_status'] = False
        pick['is_keeper'] = False

    # Map team_id/team_name to owner for 2025
    team_to_owner_2025 = {}
    for team in teams_2025:
        owner = normalize_owner(team.get('owner'))
        team_to_owner_2025[team.get('team_id')] = owner
        team_to_owner_2025[team.get('team_name')] = owner

    # Keeper-eligible positions
    KEEPER_POSITIONS = {'QB', 'WR', 'RB', 'TE'}

    keeper_count = 0
    checked_count = 0

    for pick in draft_2025:
        # Only check $1 picks
        if pick.get('bid_amount') != 1:
            continue

        # Only check eligible positions
        position = pick.get('position', '').upper()
        if position not in KEEPER_POSITIONS:
            continue

        checked_count += 1

        # Get owner for this pick
        owner = normalize_owner(pick.get('team_name')) or team_to_owner_2025.get(pick.get('team_id'))
        if not owner:
            continue

        player_name_raw = pick.get('player_name', '')
        player_name = normalize_player_name(player_name_raw)

        # Skip known non-keepers
        if (owner, player_name_raw) in NON_KEEPERS:
            continue

        # Check which 2024 roster to use (handle owner replacements)
        roster_owner = OWNER_REPLACEMENTS.get(owner, owner)

        # Check if player was on the relevant 2024 roster
        if roster_owner in owner_players_2024 and player_name in owner_players_2024[roster_owner]:
            pick['keeper_status'] = True
            pick['is_keeper'] = True
            keeper_count += 1

    print(f"\nChecked {checked_count} $1 picks (QB/WR/RB/TE)")
    print(f"Marked {keeper_count} as keepers")

    # Show some examples
    print("\nSample inferred keepers:")
    keepers = [p for p in draft_2025 if p.get('is_keeper')]
    for p in keepers[:10]:
        owner = normalize_owner(p.get('team_name'))
        print(f"  {p.get('player_name')} ({p.get('position')}) - {owner}")

    # Save updated 2025 data
    with open(RAW_DIR / 'season_2025.json', 'w') as f:
        json.dump(data_2025, f, indent=2)

    print(f"\n✓ Updated season_2025.json with {keeper_count} keepers")
    print("\nNext steps:")
    print("  1. Run: python3 backend/data_processor.py")
    print("  2. Run: cp data/processed/*.json frontend/public/data/")


if __name__ == '__main__':
    main()
