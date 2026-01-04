#!/usr/bin/env python3
"""
Sleeper API Data Extractor
Extracts fantasy football data from Sleeper API and saves to JSON
"""

import requests
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# Configuration
LEAGUE_ID = "1264338570127097857"
BASE_URL = "https://api.sleeper.app/v1"
RAW_DATA_DIR = Path(__file__).parent.parent / 'data' / 'raw'

# Username mapping from Sleeper to standardized owner names
USERNAME_MAPPING = {
    'Brydome17': 'Bryan Whitaker',
    'FortyChiners': 'Brendan Romale',
    'JeremySettles13': 'Jeremy Settles',
    'KCoffis': 'Kellen Coffis',
    'LunaCorp': 'Jacob Luna',
    'NamasYe': 'Chris Vitale',
    'RapmasterRordogg': 'Rory McKee',
    'SmiPi': 'Nick Smielak',
    'T1GHTSTEVE': 'Steve Keller',
    'gchildnl': 'Garrett Ulrich',
    'gswens83': 'Greg Swenson',
    'jamiecoffis': 'Jamie Coffis',
    'kpop': 'Kyle Poppen',
    'milmansion': 'Ryan Milhous'
}

class SleeperExtractor:
    def __init__(self, league_id: str):
        self.league_id = league_id
        self.base_url = BASE_URL

    def get_league_info(self) -> Dict[str, Any]:
        """Get league information"""
        response = requests.get(f"{self.base_url}/league/{self.league_id}")
        response.raise_for_status()
        return response.json()

    def get_users(self) -> List[Dict[str, Any]]:
        """Get all users in the league"""
        response = requests.get(f"{self.base_url}/league/{self.league_id}/users")
        response.raise_for_status()
        return response.json()

    def get_rosters(self) -> List[Dict[str, Any]]:
        """Get all rosters"""
        response = requests.get(f"{self.base_url}/league/{self.league_id}/rosters")
        response.raise_for_status()
        return response.json()

    def get_matchups(self, week: int) -> List[Dict[str, Any]]:
        """Get matchups for a specific week"""
        response = requests.get(f"{self.base_url}/league/{self.league_id}/matchups/{week}")
        response.raise_for_status()
        return response.json()

    def get_all_matchups(self, num_weeks: int = 18) -> Dict[int, List[Dict[str, Any]]]:
        """Get matchups for all weeks"""
        all_matchups = {}
        for week in range(1, num_weeks + 1):
            try:
                matchups = self.get_matchups(week)
                if matchups:
                    all_matchups[week] = matchups
            except Exception as e:
                print(f"Warning: Could not get matchups for week {week}: {e}")
        return all_matchups

    def get_drafts(self) -> List[Dict[str, Any]]:
        """Get all drafts for the league"""
        response = requests.get(f"{self.base_url}/league/{self.league_id}/drafts")
        response.raise_for_status()
        return response.json()

    def get_draft_picks(self, draft_id: str) -> List[Dict[str, Any]]:
        """Get all picks for a specific draft"""
        response = requests.get(f"{self.base_url}/draft/{draft_id}/picks")
        response.raise_for_status()
        return response.json()

    def get_players_map(self) -> Dict[str, Any]:
        """Get player information (cached by Sleeper)"""
        response = requests.get(f"{self.base_url}/players/nfl")
        response.raise_for_status()
        return response.json()

    def normalize_owner_name(self, display_name: str) -> str:
        """Map Sleeper username to standardized owner name"""
        return USERNAME_MAPPING.get(display_name, display_name)

    def get_winners_bracket(self) -> List[Dict[str, Any]]:
        """Get winners bracket (playoff) data"""
        response = requests.get(f"{self.base_url}/league/{self.league_id}/winners_bracket")
        response.raise_for_status()
        return response.json()

    def get_losers_bracket(self) -> List[Dict[str, Any]]:
        """Get losers bracket (toilet bowl) data"""
        response = requests.get(f"{self.base_url}/league/{self.league_id}/losers_bracket")
        response.raise_for_status()
        return response.json()

    def decode_playoff_standings(self, winners_bracket: List[Dict], losers_bracket: List[Dict]) -> Dict[int, int]:
        """Decode playoff brackets to determine final standings
        Returns a dict mapping roster_id -> final_standing (1-14)
        """
        final_standings = {}

        # Decode winners bracket (places 1-6)
        for matchup in winners_bracket:
            if 'p' in matchup:  # This is a placement game
                placement = matchup['p']
                winner = matchup['w']
                loser = matchup['l']
                final_standings[winner] = placement
                final_standings[loser] = placement + 1

        # Decode losers bracket (toilet bowl - places 7-14)
        for matchup in losers_bracket:
            if 'p' in matchup:  # This is a placement game
                placement = matchup['p']
                # Toilet bowl placements are offset by 6 (placement 1 in TB = 7th overall)
                actual_placement = 6 + placement
                winner = matchup['w']
                loser = matchup['l']
                final_standings[winner] = actual_placement
                final_standings[loser] = actual_placement + 1

        return final_standings

    def extract_season_data(self, year: int) -> Dict[str, Any]:
        """Extract all data for a season"""
        print(f"Extracting Sleeper data for {year}...")

        # Get basic league info
        league_info = self.get_league_info()
        users = self.get_users()
        rosters = self.get_rosters()

        # Create user lookup
        user_lookup = {user['user_id']: user for user in users}

        # Create roster lookup by owner_id
        roster_lookup = {roster['owner_id']: roster for roster in rosters}

        # Get playoff bracket data and decode final standings
        print("  Fetching playoff brackets...")
        try:
            winners_bracket = self.get_winners_bracket()
            losers_bracket = self.get_losers_bracket()
            playoff_standings = self.decode_playoff_standings(winners_bracket, losers_bracket)
            print(f"  Decoded playoff standings for {len(playoff_standings)} teams")
        except Exception as e:
            print(f"  Warning: Could not get playoff data: {e}")
            playoff_standings = {}

        # Build teams list (first pass - without standings)
        teams = []
        for roster in rosters:
            owner_id = roster.get('owner_id')
            user = user_lookup.get(owner_id, {})
            display_name = user.get('display_name', 'Unknown')
            owner_name = self.normalize_owner_name(display_name)
            roster_id = roster['roster_id']

            # Get team name from user metadata, fallback to owner name
            user_metadata = user.get('metadata', {})
            team_name = user_metadata.get('team_name')
            if not team_name:
                team_name = f"{owner_name}'s Team"

            teams.append({
                'team_id': roster_id,
                'team_name': team_name,
                'owner': owner_name,
                'owner_id': owner_id,
                'wins': roster['settings'].get('wins', 0),
                'losses': roster['settings'].get('losses', 0),
                'ties': roster['settings'].get('ties', 0),
                'points_for': roster['settings'].get('fpts', 0),
                'points_against': roster['settings'].get('fpts_against', 0),
                'standing': 0,  # Will be calculated below
                'final_standing': playoff_standings.get(roster_id),  # From playoff brackets
                'division_id': roster['settings'].get('division'),
                'division_name': None,
                'streak_type': None,
                'streak_length': 0,
                'playoff_seed': None
            })

        # Calculate regular season standings (sort by wins desc, then points_for desc)
        teams_sorted = sorted(teams, key=lambda t: (t['wins'], t['points_for']), reverse=True)
        for idx, team in enumerate(teams_sorted, start=1):
            team['standing'] = idx

        # Get matchups for all weeks
        print("  Fetching matchups...")
        all_matchups_by_week = self.get_all_matchups(num_weeks=18)

        # Process matchups
        matchups = []
        for week, week_matchups in all_matchups_by_week.items():
            # Group by matchup_id
            matchup_groups = {}
            for m in week_matchups:
                matchup_id = m.get('matchup_id')
                if matchup_id not in matchup_groups:
                    matchup_groups[matchup_id] = []
                matchup_groups[matchup_id].append(m)

            # Create matchup pairs
            for matchup_id, matchup_pair in matchup_groups.items():
                if len(matchup_pair) == 2:
                    team1 = matchup_pair[0]
                    team2 = matchup_pair[1]

                    # Get team info
                    team1_info = next((t for t in teams if t['team_id'] == team1['roster_id']), {})
                    team2_info = next((t for t in teams if t['team_id'] == team2['roster_id']), {})

                    matchups.append({
                        'week': week,
                        'home_team': team1_info.get('team_name', f"Team {team1['roster_id']}"),
                        'away_team': team2_info.get('team_name', f"Team {team2['roster_id']}"),
                        'home_score': team1.get('points', 0),
                        'away_score': team2.get('points', 0),
                        'home_team_id': team1['roster_id'],
                        'away_team_id': team2['roster_id'],
                        'home_roster_id': team1['roster_id'],
                        'away_roster_id': team2['roster_id']
                    })

        print(f"  Processed {len(matchups)} matchups")

        # Get draft data
        print("  Fetching draft...")
        drafts = self.get_drafts()
        draft_picks = []

        if drafts:
            draft_id = drafts[0].get('draft_id')
            picks = self.get_draft_picks(draft_id)

            for pick in picks:
                metadata = pick.get('metadata', {})
                roster_id = pick.get('roster_id')
                team_info = next((t for t in teams if t['team_id'] == roster_id), {})

                draft_picks.append({
                    'player_name': f"{metadata.get('first_name', '')} {metadata.get('last_name', '')}".strip(),
                    'player_id': pick.get('player_id'),
                    'team_id': roster_id,
                    'team_name': team_info.get('team_name'),
                    'round_num': pick.get('round', 0),
                    'round_pick': pick.get('draft_slot', 0),
                    'overall_pick': pick.get('pick_no', 0),
                    'bid_amount': int(metadata.get('amount', 0)),
                    'keeper_status': pick.get('is_keeper', False),
                    'position': metadata.get('position', '')
                })

        print(f"  Processed {len(draft_picks)} draft picks")

        # Build season data structure
        season_data = {
            'year': year,
            'league_name': league_info.get('name', 'Unknown'),
            'teams': teams,
            'matchups': matchups,
            'draft': draft_picks,
            'rosters': {},  # TODO: Add roster details if needed
            'player_stats': [],  # TODO: Add player stats if needed
            'settings': league_info.get('settings', {}),
            'extracted_at': datetime.now().isoformat(),
            'source': 'sleeper'
        }

        return season_data

    def save_season_data(self, year: int, data: Dict[str, Any]):
        """Save season data to JSON file"""
        RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
        filename = RAW_DATA_DIR / f'season_{year}.json'

        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"✓ Saved data to {filename}")

def main():
    """Main extraction function"""
    print("=== Sleeper Data Extractor ===\n")

    extractor = SleeperExtractor(LEAGUE_ID)

    # Extract 2025 season (Sleeper's 2025 season = 2024-2025 NFL season)
    league_info = extractor.get_league_info()
    season = league_info.get('season')

    print(f"League: {league_info.get('name')}")
    print(f"Season: {season}")
    print(f"Status: {league_info.get('status')}\n")

    # Use 2025 as the year (the fantasy season year)
    year = 2025

    season_data = extractor.extract_season_data(year)
    extractor.save_season_data(year, season_data)

    print("\n✓ Sleeper data extraction complete!")

if __name__ == '__main__':
    main()
