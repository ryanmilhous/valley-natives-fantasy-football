"""
ESPN Fantasy Football Data Extractor

This module fetches historical data from ESPN Fantasy Football API
and caches it locally for processing.
"""

import os
import json
from datetime import datetime
from pathlib import Path
from espn_api.football import League
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

LEAGUE_ID = int(os.getenv('ESPN_LEAGUE_ID', '380405'))
ESPN_S2 = os.getenv('ESPN_S2')
ESPN_SWID = os.getenv('ESPN_SWID')

# Data directories
BASE_DIR = Path(__file__).parent.parent
RAW_DATA_DIR = BASE_DIR / 'data' / 'raw'
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)


class ESPNDataExtractor:
    """Extracts and caches data from ESPN Fantasy Football API"""

    def __init__(self, league_id=LEAGUE_ID, espn_s2=ESPN_S2, swid=ESPN_SWID):
        self.league_id = league_id
        self.espn_s2 = espn_s2
        self.swid = swid

        if not espn_s2 or not swid:
            print("WARNING: ESPN_S2 and ESPN_SWID not set. Will only work for public leagues.")
            print("See COOKIE_INSTRUCTIONS.md for how to get these values.")

    def get_league(self, year):
        """Get league object for a specific year"""
        try:
            league = League(
                league_id=self.league_id,
                year=year,
                espn_s2=self.espn_s2,
                swid=self.swid
            )
            return league
        except Exception as e:
            print(f"Error fetching league for {year}: {e}")
            return None

    def extract_season_data(self, year):
        """Extract all data for a specific season"""
        print(f"\nFetching data for {year} season...")

        league = self.get_league(year)
        if not league:
            return None

        season_data = {
            'year': year,
            'league_name': league.settings.name if hasattr(league.settings, 'name') else 'Unknown League',
            'teams': [],
            'matchups': [],
            'settings': {},
            'extracted_at': datetime.now().isoformat()
        }

        # Extract league settings
        try:
            season_data['settings'] = {
                'reg_season_count': league.settings.reg_season_count,
                'playoff_team_count': league.settings.playoff_team_count,
                'team_count': league.settings.team_count,
                'name': league.settings.name if hasattr(league.settings, 'name') else 'Unknown'
            }
        except Exception as e:
            print(f"  Warning: Could not extract some settings: {e}")

        # Extract teams
        print(f"  Extracting {len(league.teams)} teams...")
        for team in league.teams:
            # Handle owner - extract from owners list
            owner = 'Unknown'
            if hasattr(team, 'owners') and team.owners:
                # owners is a list of dicts
                owners_list = team.owners
                if isinstance(owners_list, list) and len(owners_list) > 0:
                    first_owner = owners_list[0]
                    # It's a dictionary
                    if isinstance(first_owner, dict):
                        # Try displayName first, then firstName + lastName
                        owner = first_owner.get('displayName') or \
                                f"{first_owner.get('firstName', '')} {first_owner.get('lastName', '')}".strip()
                    elif isinstance(first_owner, str):
                        owner = first_owner

            # Fallback to 'owner' attribute if it exists (some leagues might use this)
            elif hasattr(team, 'owner'):
                owner_obj = team.owner
                if isinstance(owner_obj, dict):
                    owner = owner_obj.get('displayName') or \
                            f"{owner_obj.get('firstName', '')} {owner_obj.get('lastName', '')}".strip()
                elif isinstance(owner_obj, str):
                    owner = owner_obj

            # Clean up owner name
            owner = owner.strip() if owner else 'Unknown'

            team_data = {
                'team_id': team.team_id,
                'team_name': team.team_name,
                'team_abbrev': team.team_abbrev,
                'owner': owner,
                'wins': team.wins,
                'losses': team.losses,
                'ties': getattr(team, 'ties', 0),
                'points_for': team.points_for,
                'points_against': team.points_against,
                'standing': team.standing,
                'playoff_seed': team.playoff_seed if hasattr(team, 'playoff_seed') else None,
                'final_standing': team.final_standing if hasattr(team, 'final_standing') else team.standing,
            }

            # Get schedule/outcomes
            if hasattr(team, 'schedule'):
                team_data['schedule_length'] = len(team.schedule)

            season_data['teams'].append(team_data)

        # Extract matchups for all weeks
        print(f"  Extracting matchups...")
        try:
            # Get regular season weeks
            for week in range(1, league.settings.reg_season_count + 1):
                try:
                    box_scores = league.box_scores(week)
                    for matchup in box_scores:
                        matchup_data = {
                            'week': week,
                            'is_playoff': False,
                            'home_team': matchup.home_team.team_name,
                            'home_team_id': matchup.home_team.team_id,
                            'home_score': matchup.home_score,
                            'away_team': matchup.away_team.team_name,
                            'away_team_id': matchup.away_team.team_id,
                            'away_score': matchup.away_score,
                        }
                        season_data['matchups'].append(matchup_data)
                except Exception as e:
                    print(f"    Warning: Could not get matchups for week {week}: {e}")

            # Get playoff weeks if they exist
            playoff_start = league.settings.reg_season_count + 1
            total_weeks = playoff_start + 3  # Usually 2-3 playoff weeks

            for week in range(playoff_start, total_weeks + 1):
                try:
                    box_scores = league.box_scores(week)
                    if box_scores:  # Only add if there are matchups
                        for matchup in box_scores:
                            matchup_data = {
                                'week': week,
                                'is_playoff': True,
                                'home_team': matchup.home_team.team_name,
                                'home_team_id': matchup.home_team.team_id,
                                'home_score': matchup.home_score,
                                'away_team': matchup.away_team.team_name,
                                'away_team_id': matchup.away_team.team_id,
                                'away_score': matchup.away_score,
                            }
                            season_data['matchups'].append(matchup_data)
                except:
                    # Silently skip weeks with no data (playoffs may not exist yet)
                    pass

        except Exception as e:
            print(f"  Warning: Error extracting matchups: {e}")

        print(f"  ✓ Extracted {len(season_data['teams'])} teams and {len(season_data['matchups'])} matchups")

        return season_data

    def save_season_data(self, year, data):
        """Save season data to JSON file"""
        if not data:
            print(f"No data to save for {year}")
            return

        output_file = RAW_DATA_DIR / f'season_{year}.json'
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"✓ Saved data to {output_file}")

    def load_season_data(self, year):
        """Load cached season data from JSON file"""
        input_file = RAW_DATA_DIR / f'season_{year}.json'
        if not input_file.exists():
            return None

        with open(input_file, 'r') as f:
            return json.load(f)

    def extract_all_seasons(self, start_year=None, end_year=None, force_refresh=False):
        """
        Extract data for all seasons

        Args:
            start_year: First year to extract (defaults to 2014 - common ESPN start)
            end_year: Last year to extract (defaults to current year)
            force_refresh: If True, re-fetch even if cached data exists
        """
        current_year = datetime.now().year
        start_year = start_year or 2014
        end_year = end_year or current_year

        print(f"=== ESPN Fantasy Football Data Extraction ===")
        print(f"League ID: {self.league_id}")
        print(f"Years: {start_year} - {end_year}")
        print(f"=" * 46)

        successful = []
        failed = []

        for year in range(start_year, end_year + 1):
            # Skip 2025 - no matchup data available
            if year == 2025:
                print(f"\n{year}: Skipping (no matchup data)")
                continue

            # Check if already cached
            if not force_refresh and self.load_season_data(year):
                print(f"\n{year}: Data already cached (use force_refresh=True to re-fetch)")
                successful.append(year)
                continue

            # Fetch and save
            data = self.extract_season_data(year)
            if data:
                self.save_season_data(year, data)
                successful.append(year)
            else:
                failed.append(year)

        print(f"\n{'=' * 46}")
        print(f"Extraction Complete!")
        print(f"  Successful: {len(successful)} seasons")
        if failed:
            print(f"  Failed: {len(failed)} seasons - {failed}")
        print(f"{'=' * 46}\n")

        return successful, failed


def main():
    """Main entry point for data extraction"""
    extractor = ESPNDataExtractor()

    # Try to automatically detect year range
    # Start from 2014 (common ESPN league start) to current year
    extractor.extract_all_seasons()


if __name__ == '__main__':
    main()
