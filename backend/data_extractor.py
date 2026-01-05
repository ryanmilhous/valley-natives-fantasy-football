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
            'draft': [],
            'rosters': {},
            'player_stats': [],
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

        # Deduplicate playoff matchups (ESPN API bug causes week 17-18 duplicates)
        print(f"  Deduplicating matchups...")
        original_count = len(season_data['matchups'])
        seen_matchups = set()
        deduplicated_matchups = []

        for matchup in season_data['matchups']:
            # Create a unique key for each matchup
            teams = tuple(sorted([matchup['home_team_id'], matchup['away_team_id']]))
            scores = tuple(sorted([matchup['home_score'], matchup['away_score']]))
            key = (teams, scores, matchup.get('is_playoff', False))

            if key not in seen_matchups:
                seen_matchups.add(key)
                deduplicated_matchups.append(matchup)

        season_data['matchups'] = deduplicated_matchups
        removed = original_count - len(deduplicated_matchups)
        if removed > 0:
            print(f"    ✓ Removed {removed} duplicate matchups")

        # Extract draft data
        print(f"  Extracting draft data...")
        try:
            if hasattr(league, 'draft') and league.draft:
                for pick in league.draft:
                    draft_pick = {
                        'player_name': pick.playerName,
                        'player_id': pick.playerId if hasattr(pick, 'playerId') else None,
                        'team_id': pick.team.team_id if hasattr(pick.team, 'team_id') else None,
                        'team_name': pick.team.team_name if hasattr(pick.team, 'team_name') else None,
                        'round_num': pick.round_num,
                        'round_pick': pick.round_pick,
                        'overall_pick': (pick.round_num - 1) * len(league.teams) + pick.round_pick,
                        'bid_amount': pick.bid_amount if hasattr(pick, 'bid_amount') else None,
                        'keeper_status': pick.keeper_status if hasattr(pick, 'keeper_status') else False
                    }
                    season_data['draft'].append(draft_pick)
                print(f"    ✓ Extracted {len(season_data['draft'])} draft picks")
            else:
                print(f"    ⚠ No draft data available")
        except Exception as e:
            print(f"    Warning: Error extracting draft data: {e}")

        # Extract roster data for each team
        print(f"  Extracting roster data...")
        try:
            for team in league.teams:
                if hasattr(team, 'roster') and team.roster:
                    roster_players = []
                    for player in team.roster:
                        player_data = {
                            'name': player.name,
                            'player_id': player.playerId if hasattr(player, 'playerId') else None,
                            'position': player.position if hasattr(player, 'position') else None,
                            'pro_team': player.proTeam if hasattr(player, 'proTeam') else None,
                            'injured': player.injured if hasattr(player, 'injured') else False,
                            'injury_status': player.injuryStatus if hasattr(player, 'injuryStatus') else None,
                            'avg_points': player.avg_points if hasattr(player, 'avg_points') else 0,
                            'total_points': player.total_points if hasattr(player, 'total_points') else 0,
                        }
                        roster_players.append(player_data)
                    season_data['rosters'][team.team_id] = roster_players
            print(f"    ✓ Extracted rosters for {len(season_data['rosters'])} teams")
        except Exception as e:
            print(f"    Warning: Error extracting roster data: {e}")

        # Extract weekly player performance from box scores
        print(f"  Extracting player performance data...")
        try:
            for week in range(1, league.settings.reg_season_count + 1):
                try:
                    box_scores = league.box_scores(week)
                    for matchup in box_scores:
                        # Home team lineup
                        for player in matchup.home_lineup:
                            player_stat = {
                                'week': week,
                                'team_id': matchup.home_team.team_id,
                                'team_name': matchup.home_team.team_name,
                                'player_name': player.name,
                                'player_id': player.playerId if hasattr(player, 'playerId') else None,
                                'position': player.position if hasattr(player, 'position') else None,
                                'slot': player.lineupSlot if hasattr(player, 'lineupSlot') else None,
                                'points': player.points if hasattr(player, 'points') else 0,
                                'projected_points': player.projected_points if hasattr(player, 'projected_points') else 0,
                            }
                            season_data['player_stats'].append(player_stat)

                        # Away team lineup
                        for player in matchup.away_lineup:
                            player_stat = {
                                'week': week,
                                'team_id': matchup.away_team.team_id,
                                'team_name': matchup.away_team.team_name,
                                'player_name': player.name,
                                'player_id': player.playerId if hasattr(player, 'playerId') else None,
                                'position': player.position if hasattr(player, 'position') else None,
                                'slot': player.lineupSlot if hasattr(player, 'lineupSlot') else None,
                                'points': player.points if hasattr(player, 'points') else 0,
                                'projected_points': player.projected_points if hasattr(player, 'projected_points') else 0,
                            }
                            season_data['player_stats'].append(player_stat)
                except Exception as e:
                    # Skip weeks with no data
                    pass
            print(f"    ✓ Extracted {len(season_data['player_stats'])} player performances")
        except Exception as e:
            print(f"    Warning: Error extracting player stats: {e}")

        print(f"  ✓ Extracted {len(season_data['teams'])} teams, {len(season_data['matchups'])} matchups, {len(season_data['draft'])} draft picks")

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
            start_year: First year to extract (defaults to 2007 - Valley Natives league start)
            end_year: Last year to extract (defaults to current year)
            force_refresh: If True, re-fetch even if cached data exists
        """
        current_year = datetime.now().year
        start_year = start_year or 2007
        end_year = end_year or current_year

        print(f"=== ESPN Fantasy Football Data Extraction ===")
        print(f"League ID: {self.league_id}")
        print(f"Years: {start_year} - {end_year}")
        print(f"=" * 46)

        successful = []
        failed = []

        for year in range(start_year, end_year + 1):
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

    # Extract all available years from league start (2007) to current year
    extractor.extract_all_seasons()


if __name__ == '__main__':
    main()
