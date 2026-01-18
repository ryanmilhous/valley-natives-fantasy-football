"""
Data Processor for ESPN Fantasy Football

Transforms raw ESPN API data into structured formats for analysis and visualization.
"""

import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent
RAW_DATA_DIR = BASE_DIR / 'data' / 'raw'
PROCESSED_DATA_DIR = BASE_DIR / 'data' / 'processed'
PLAYER_ID_MAPPING_FILE = BASE_DIR / 'data' / 'exports' / 'player_id_mapping.json'
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Owner display name to actual name mapping
OWNER_NAME_MAPPING = {
    'scson': 'Chris Vitale',
    'Kcoff07': 'Kellen Coffis',
    'Jamie Coffis': 'Jamie Coffis',
    'touchcoffis86': 'Jamie Coffis',  # Old username (2010-2019)
    'gchildnl': 'Garrett Ulrich',
    'gswens83': 'Greg Swenson',
    'JeremySettles13': 'Jeremy Settles',
    '2muchdutch': 'Nick Smielak',
    'RapmasterRordogg': 'Rory McKee',
    'jmluna5020': 'Jacob Luna',
    '17whitaker': 'Bryan Whitaker',
    'brom66': 'Brendan Romele',
    'Brendan Romale': 'Brendan Romele',  # Fix typo in raw data
    'Ryan Milhous': 'Ryan Milhous',
    'kweezy31': 'Kyle Morris',  # 2010-2019
    'HIS TIGHTNESS': 'Ben Beck',
    'kpop027': 'Kyle Poppen',
    'Benbasketball101': 'Ben Beck',  # Alternative username for Ben Beck
    'bvitale1313': 'Brian Vitale',  # 2010-2014
    'bryanvitale': 'Brian Vitale',  # 2017
    '12inchnick': 'Nick Smielak',  # 2010-2012
    'TPUSNESS': 'Tyler Fullerton',  # 2010-2014
    'pkentstoll': 'Peter Kent-Stoll',
    'DylanAndr3ws': 'Dylan Andrews',
    'SLVBaller3189': 'Tanner Clark',
    'ilovebammer24': 'Tanner Clark'
}


class FantasyDataProcessor:
    """Process raw ESPN Fantasy Football data into structured formats"""

    def __init__(self):
        self.raw_data = {}
        self.player_id_mapping = {}
        self.processed_data = {
            'teams': {},
            'owners': {},
            'matchups': [],
            'standings': [],
            'playoffs': [],
            'head_to_head': {},
            'records': {},
            'draft': [],
            'rosters': [],
            'player_stats': [],
            'best_draft_picks': [],
            'optimal_lineups': [],
            'trades': [],
            'best_trades': [],
            'trade_records': {},
            'metadata': {}
        }

    def load_player_id_mapping(self):
        """Load player ID to name/position mapping from exports"""
        if PLAYER_ID_MAPPING_FILE.exists():
            with open(PLAYER_ID_MAPPING_FILE, 'r') as f:
                self.player_id_mapping = json.load(f)
            print(f"Loaded {len(self.player_id_mapping)} player ID mappings")
        else:
            print("Warning: player_id_mapping.json not found")

    @staticmethod
    def normalize_owner_name(display_name, year=None):
        """
        Convert display name to actual name using mapping

        Args:
            display_name: The ESPN username/display name
            year: Optional year for year-specific mappings
        """
        return OWNER_NAME_MAPPING.get(display_name, display_name)

    @staticmethod
    def normalize_position(position):
        """
        Normalize position names to standard values

        Mappings:
            PK -> K (Punter/Kicker to Kicker)
            FB -> RB (Fullback to Running Back)
            D/ST -> DEF (Defense/Special Teams to Defense)
        """
        if not position:
            return position
        position = position.upper().strip()
        POSITION_MAPPING = {
            'PK': 'K',
            'FB': 'RB',
            'D/ST': 'DEF',
        }
        return POSITION_MAPPING.get(position, position)

    def load_raw_data(self, years=None):
        """Load raw data for specified years"""
        if years is None:
            # Load all available years
            json_files = sorted(RAW_DATA_DIR.glob('season_*.json'))
            years = [int(f.stem.split('_')[1]) for f in json_files]

        for year in years:
            file_path = RAW_DATA_DIR / f'season_{year}.json'
            if file_path.exists():
                with open(file_path, 'r') as f:
                    self.raw_data[year] = json.load(f)
                print(f"Loaded data for {year}")
            else:
                print(f"Warning: No data found for {year}")

        return len(self.raw_data)

    def process_teams(self):
        """Process team information across all seasons"""
        teams_by_id = defaultdict(lambda: {
            'team_names': set(),
            'owners': set(),
            'seasons': [],
            'total_wins': 0,
            'total_losses': 0,
            'total_ties': 0,
            'championships': 0,
            'playoff_appearances': 0,
            'total_points_for': 0,
            'total_points_against': 0
        })

        for year, season_data in self.raw_data.items():
            for team in season_data.get('teams', []):
                team_id = team['team_id']
                team_info = teams_by_id[team_id]

                # Normalize owner name
                normalized_owner = self.normalize_owner_name(team['owner'], year)

                # Track names and owners (teams may change)
                team_info['team_names'].add(team['team_name'])
                team_info['owners'].add(normalized_owner)

                # Add season stats
                season_stats = {
                    'year': year,
                    'team_name': team['team_name'],
                    'owner': normalized_owner,
                    'wins': team['wins'],
                    'losses': team['losses'],
                    'ties': team['ties'],
                    'points_for': team['points_for'],
                    'points_against': team['points_against'],
                    'standing': team['standing'],
                    'final_standing': team['final_standing'],
                    'playoff_seed': team.get('playoff_seed')
                }
                team_info['seasons'].append(season_stats)

                # Aggregate stats
                team_info['total_wins'] += team['wins']
                team_info['total_losses'] += team['losses']
                team_info['total_ties'] += team['ties']
                team_info['total_points_for'] += team['points_for']
                team_info['total_points_against'] += team['points_against']

                # Check if champion (final_standing == 1)
                if team['final_standing'] == 1:
                    team_info['championships'] += 1

                # Check if made playoffs (top 6 teams in regular season standing)
                # Skip 2006 as we don't have complete data for that year
                if year != 2006 and team['standing'] <= 6:
                    team_info['playoff_appearances'] += 1

        # Convert to final format
        for team_id, info in teams_by_id.items():
            self.processed_data['teams'][team_id] = {
                'team_id': team_id,
                'team_names': list(info['team_names']),
                'current_name': list(info['team_names'])[-1] if info['team_names'] else 'Unknown',
                'owners': list(info['owners']),
                'current_owner': list(info['owners'])[-1] if info['owners'] else 'Unknown',
                'seasons_active': len(info['seasons']),
                'seasons': sorted(info['seasons'], key=lambda x: x['year']),
                'all_time': {
                    'wins': info['total_wins'],
                    'losses': info['total_losses'],
                    'ties': info['total_ties'],
                    'points_for': round(info['total_points_for'], 2),
                    'points_against': round(info['total_points_against'], 2),
                    'championships': info['championships'],
                    'playoff_appearances': info['playoff_appearances']
                }
            }

        print(f"Processed {len(self.processed_data['teams'])} teams")

    def process_owners(self):
        """Process owner-based statistics (aggregates data by owner across all teams/years)"""
        owners_stats = defaultdict(lambda: {
            'seasons': [],
            'total_wins': 0,
            'total_losses': 0,
            'total_ties': 0,
            'championships': 0,
            'second_place': 0,
            'third_place': 0,
            'toilet_bowl': 0,
            'playoff_appearances': 0,
            'total_points_for': 0,
            'total_points_against': 0,
            'years_active': set(),
            'championship_years': [],
            'second_place_years': [],
            'third_place_years': [],
            'toilet_bowl_years': []
        })

        # First pass: find the last place standing for each year (for toilet bowl calculation)
        last_place_by_year = {}
        for year, season_data in self.raw_data.items():
            teams = season_data.get('teams', [])
            if teams:
                # Last place is the highest standing number (worst rank)
                last_place_by_year[year] = max(team['standing'] for team in teams)

        # Aggregate stats by owner across all seasons
        for year, season_data in self.raw_data.items():
            for team in season_data.get('teams', []):
                owner = self.normalize_owner_name(team['owner'], year)
                owner_info = owners_stats[owner]

                # Track year
                owner_info['years_active'].add(year)

                # Add season stats
                season_stats = {
                    'year': year,
                    'team_name': team['team_name'],
                    'wins': team['wins'],
                    'losses': team['losses'],
                    'ties': team['ties'],
                    'points_for': team['points_for'],
                    'points_against': team['points_against'],
                    'standing': team['standing'],
                    'final_standing': team['final_standing'],
                    'playoff_seed': team.get('playoff_seed')
                }
                owner_info['seasons'].append(season_stats)

                # Aggregate totals
                owner_info['total_wins'] += team['wins']
                owner_info['total_losses'] += team['losses']
                owner_info['total_ties'] += team['ties']
                owner_info['total_points_for'] += team['points_for']
                owner_info['total_points_against'] += team['points_against']

                # Count championships, 2nd place, 3rd place, and playoff appearances
                if team['final_standing'] == 1:
                    owner_info['championships'] += 1
                    owner_info['championship_years'].append(year)
                elif team['final_standing'] == 2:
                    owner_info['second_place'] += 1
                    owner_info['second_place_years'].append(year)
                elif team['final_standing'] == 3:
                    owner_info['third_place'] += 1
                    owner_info['third_place_years'].append(year)

                # Count toilet bowl (last place in regular season)
                # Skip 2006 as we don't have complete data for that year
                if year != 2006 and team['standing'] == last_place_by_year.get(year):
                    owner_info['toilet_bowl'] += 1
                    owner_info['toilet_bowl_years'].append(year)

                # Count playoff appearances (top 6 teams in regular season standing)
                # Special handling for 2006: only count for Kellen Coffis (1st) and Chris Vitale (2nd)
                if year == 2006:
                    # Only count 2006 playoffs for 1st and 2nd place (Kellen and Chris)
                    if team['final_standing'] in [1, 2]:
                        owner_info['playoff_appearances'] += 1
                elif team['standing'] <= 6:
                    owner_info['playoff_appearances'] += 1

        # Convert to final format
        self.processed_data['owners'] = {}
        for owner_name, info in owners_stats.items():
            years_list = sorted(list(info['years_active']))
            seasons_played = len(info['years_active'])

            # Calculate ranking points: 7 for 1st, 3 for 2nd, 1 for 3rd, -1 for toilet bowl
            ranking_points = (info['championships'] * 7) + (info['second_place'] * 3) + (info['third_place'] * 1) - (info['toilet_bowl'] * 1)

            # Calculate percentages
            toilet_bowl_pct = round((info['toilet_bowl'] / seasons_played) * 100, 1) if seasons_played > 0 else 0
            top_3_pct = round(((info['championships'] + info['second_place'] + info['third_place']) / seasons_played) * 100, 1) if seasons_played > 0 else 0

            # For playoff appearance %, exclude 2006 from denominator unless owner is Kellen or Chris
            playoff_seasons_denominator = seasons_played
            if 2006 in info['years_active'] and owner_name not in ['Kellen Coffis', 'Chris Vitale']:
                playoff_seasons_denominator = seasons_played - 1

            playoff_appearance_pct = round((info['playoff_appearances'] / playoff_seasons_denominator) * 100, 1) if playoff_seasons_denominator > 0 else 0

            self.processed_data['owners'][owner_name] = {
                'owner': owner_name,
                'seasons_played': seasons_played,
                'years_active': years_list,
                'first_season': min(years_list) if years_list else None,
                'last_season': max(years_list) if years_list else None,
                'seasons': sorted(info['seasons'], key=lambda x: x['year']),
                'all_time': {
                    'wins': info['total_wins'],
                    'losses': info['total_losses'],
                    'ties': info['total_ties'],
                    'win_percentage': round(info['total_wins'] / (info['total_wins'] + info['total_losses']) * 100, 1) if (info['total_wins'] + info['total_losses']) > 0 else 0,
                    'points_for': round(info['total_points_for'], 2),
                    'points_against': round(info['total_points_against'], 2),
                    'championships': info['championships'],
                    'second_place': info['second_place'],
                    'third_place': info['third_place'],
                    'toilet_bowl': info['toilet_bowl'],
                    'playoff_appearances': info['playoff_appearances'],
                    'championship_years': sorted(info['championship_years']),
                    'second_place_years': sorted(info['second_place_years']),
                    'third_place_years': sorted(info['third_place_years']),
                    'toilet_bowl_years': sorted(info['toilet_bowl_years']),
                    'ranking_points': ranking_points,
                    'toilet_bowl_pct': toilet_bowl_pct,
                    'top_3_pct': top_3_pct,
                    'playoff_appearance_pct': playoff_appearance_pct
                }
            }

        print(f"Processed {len(self.processed_data['owners'])} unique owners")

    def process_matchups(self):
        """Process all matchups into a flat list"""
        for year, season_data in self.raw_data.items():
            for matchup in season_data.get('matchups', []):
                processed_matchup = {
                    'year': year,
                    'week': matchup['week'],
                    'is_playoff': matchup.get('is_playoff', False),
                    'home_team': matchup['home_team'],
                    'home_team_id': matchup['home_team_id'],
                    'home_score': round(matchup['home_score'], 2),
                    'away_team': matchup['away_team'],
                    'away_team_id': matchup['away_team_id'],
                    'away_score': round(matchup['away_score'], 2),
                    'winner': matchup['home_team'] if matchup['home_score'] > matchup['away_score']
                             else matchup['away_team'] if matchup['away_score'] > matchup['home_score']
                             else 'TIE',
                    'point_differential': abs(round(matchup['home_score'] - matchup['away_score'], 2))
                }
                self.processed_data['matchups'].append(processed_matchup)

        print(f"Processed {len(self.processed_data['matchups'])} matchups")

    def process_standings(self):
        """Process season standings"""
        for year, season_data in self.raw_data.items():
            for team in season_data.get('teams', []):
                standing_entry = {
                    'year': year,
                    'team_name': team['team_name'],
                    'owner': self.normalize_owner_name(team['owner'], year),
                    'wins': team['wins'],
                    'losses': team['losses'],
                    'ties': team['ties'],
                    'points_for': round(team['points_for'], 2),
                    'points_against': round(team['points_against'], 2),
                    'standing': team['standing'],
                    'final_standing': team['final_standing'],
                    'playoff_seed': team.get('playoff_seed')
                }
                self.processed_data['standings'].append(standing_entry)

        # Sort by year and standing
        self.processed_data['standings'].sort(key=lambda x: (x['year'], x['standing']))

        print(f"Processed {len(self.processed_data['standings'])} season standings")

    def process_playoffs(self):
        """Process playoff results"""
        for year, season_data in self.raw_data.items():
            # Find the champion (final_standing == 1)
            champion = None
            champion_owner = None
            runner_up = None
            runner_up_owner = None
            third_place = None
            third_place_owner = None

            teams = season_data.get('teams', [])
            for team in teams:
                if team['final_standing'] == 1:
                    champion = team['team_name']
                    champion_owner = self.normalize_owner_name(team['owner'], year)
                elif team['final_standing'] == 2:
                    runner_up = team['team_name']
                    runner_up_owner = self.normalize_owner_name(team['owner'], year)
                elif team['final_standing'] == 3:
                    third_place = team['team_name']
                    third_place_owner = self.normalize_owner_name(team['owner'], year)

            playoff_entry = {
                'year': year,
                'champion': champion,
                'champion_owner': champion_owner,
                'runner_up': runner_up,
                'runner_up_owner': runner_up_owner,
                'third_place': third_place,
                'third_place_owner': third_place_owner,
                'playoff_teams': [{'team_name': t['team_name'], 'owner': self.normalize_owner_name(t['owner'], year)} for t in teams if t.get('playoff_seed')]
            }

            self.processed_data['playoffs'].append(playoff_entry)

        self.processed_data['playoffs'].sort(key=lambda x: x['year'])

        print(f"Processed {len(self.processed_data['playoffs'])} playoff seasons")

    def process_head_to_head(self):
        """Calculate head-to-head records between all owners"""
        # Build mapping of team_name -> owner for each year
        team_to_owner = {}
        for year, season_data in self.raw_data.items():
            for team in season_data.get('teams', []):
                key = (year, team['team_name'])
                team_to_owner[key] = self.normalize_owner_name(team['owner'], year)

        # Calculate H2H by owner
        h2h = defaultdict(lambda: defaultdict(lambda: {'wins': 0, 'losses': 0, 'ties': 0, 'points_for': 0, 'points_against': 0}))

        for matchup in self.processed_data['matchups']:
            year = matchup['year']
            home_team = matchup['home_team']
            away_team = matchup['away_team']
            home_score = matchup['home_score']
            away_score = matchup['away_score']

            # Get owners for this matchup
            home_owner = team_to_owner.get((year, home_team), home_team)
            away_owner = team_to_owner.get((year, away_team), away_team)

            # Update owner's record vs other owner
            if home_score > away_score:
                h2h[home_owner][away_owner]['wins'] += 1
                h2h[away_owner][home_owner]['losses'] += 1
            elif away_score > home_score:
                h2h[away_owner][home_owner]['wins'] += 1
                h2h[home_owner][away_owner]['losses'] += 1
            else:
                h2h[home_owner][away_owner]['ties'] += 1
                h2h[away_owner][home_owner]['ties'] += 1

            h2h[home_owner][away_owner]['points_for'] += home_score
            h2h[home_owner][away_owner]['points_against'] += away_score
            h2h[away_owner][home_owner]['points_for'] += away_score
            h2h[away_owner][home_owner]['points_against'] += home_score

        # Convert to regular dict for JSON serialization
        self.processed_data['head_to_head'] = {
            owner: dict(opponents) for owner, opponents in h2h.items()
        }

        print(f"Processed head-to-head records for {len(h2h)} owners")

    def calculate_records(self):
        """Calculate various league records and milestones"""
        if not self.processed_data['matchups']:
            print("No matchups to calculate records from")
            return

        records = {
            'highest_score': None,
            'lowest_score': None,
            'biggest_blowout': None,
            'closest_game': None,
            'most_points_season': None,
            'most_wins_season': None,
            'most_points_against_season': None,
            'fewest_wins_season': None,
            'fewest_points_season': None,
            'longest_win_streak': None,
            'longest_loss_streak': None,
            'highest_scoring_loss': None,
            'most_combined_points': None,
            'lowest_scoring_win': None
        }

        # Build mapping of team_name -> owner for each year (needed for owner lookups on matchup records)
        team_to_owner = {}
        for year, season_data in self.raw_data.items():
            for team in season_data.get('teams', []):
                key = (year, team['team_name'])
                team_to_owner[key] = self.normalize_owner_name(team['owner'], year)

        # Helper function to get owner from team and year
        def get_owner(team_name, year):
            return team_to_owner.get((year, team_name), None)

        # Highest and lowest scores
        all_scores = []
        for matchup in self.processed_data['matchups']:
            all_scores.append({
                'team': matchup['home_team'],
                'owner': get_owner(matchup['home_team'], matchup['year']),
                'score': matchup['home_score'],
                'week': matchup['week'],
                'year': matchup['year'],
                'opponent': matchup['away_team'],
                'opponent_owner': get_owner(matchup['away_team'], matchup['year'])
            })
            all_scores.append({
                'team': matchup['away_team'],
                'owner': get_owner(matchup['away_team'], matchup['year']),
                'score': matchup['away_score'],
                'week': matchup['week'],
                'year': matchup['year'],
                'opponent': matchup['home_team'],
                'opponent_owner': get_owner(matchup['home_team'], matchup['year'])
            })

        if all_scores:
            records['highest_score'] = max(all_scores, key=lambda x: x['score'])
            records['lowest_score'] = min(all_scores, key=lambda x: x['score'])

        # Biggest blowout and closest game - add loser info and owner names
        if self.processed_data['matchups']:
            blowout = max(self.processed_data['matchups'], key=lambda x: x['point_differential'])
            # Add loser information and owner names
            blowout_copy = blowout.copy()
            if blowout['winner'] == blowout['home_team']:
                blowout_copy['loser'] = blowout['away_team']
                blowout_copy['winner_score'] = blowout['home_score']
                blowout_copy['loser_score'] = blowout['away_score']
                blowout_copy['winner_owner'] = get_owner(blowout['home_team'], blowout['year'])
                blowout_copy['loser_owner'] = get_owner(blowout['away_team'], blowout['year'])
            else:
                blowout_copy['loser'] = blowout['home_team']
                blowout_copy['winner_score'] = blowout['away_score']
                blowout_copy['loser_score'] = blowout['home_score']
                blowout_copy['winner_owner'] = get_owner(blowout['away_team'], blowout['year'])
                blowout_copy['loser_owner'] = get_owner(blowout['home_team'], blowout['year'])
            records['biggest_blowout'] = blowout_copy

            non_ties = [m for m in self.processed_data['matchups'] if m['winner'] != 'TIE']
            if non_ties:
                closest = min(non_ties, key=lambda x: x['point_differential'])
                # Add loser information and owner names
                closest_copy = closest.copy()
                if closest['winner'] == closest['home_team']:
                    closest_copy['loser'] = closest['away_team']
                    closest_copy['winner_score'] = closest['home_score']
                    closest_copy['loser_score'] = closest['away_score']
                    closest_copy['winner_owner'] = get_owner(closest['home_team'], closest['year'])
                    closest_copy['loser_owner'] = get_owner(closest['away_team'], closest['year'])
                else:
                    closest_copy['loser'] = closest['home_team']
                    closest_copy['winner_score'] = closest['away_score']
                    closest_copy['loser_score'] = closest['home_score']
                    closest_copy['winner_owner'] = get_owner(closest['away_team'], closest['year'])
                    closest_copy['loser_owner'] = get_owner(closest['home_team'], closest['year'])
                records['closest_game'] = closest_copy

        # Season records
        if self.processed_data['standings']:
            records['most_points_season'] = max(self.processed_data['standings'], key=lambda x: x['points_for'])
            records['most_wins_season'] = max(self.processed_data['standings'], key=lambda x: x['wins'])
            records['most_points_against_season'] = max(self.processed_data['standings'], key=lambda x: x['points_against'])
            # Fewest wins (but only teams that played a full season)
            full_season_teams = [s for s in self.processed_data['standings'] if s['wins'] + s['losses'] >= 10]
            if full_season_teams:
                records['fewest_wins_season'] = min(full_season_teams, key=lambda x: x['wins'])
                records['fewest_points_season'] = min(full_season_teams, key=lambda x: x['points_for'])

        # Calculate win/loss streaks by owner across all matchups chronologically
        from collections import defaultdict
        owner_results = defaultdict(list)  # owner -> [(year, week, result)]

        for matchup in sorted(self.processed_data['matchups'], key=lambda x: (x['year'], x['week'])):
            year = matchup['year']
            week = matchup['week']
            home_team = matchup['home_team']
            away_team = matchup['away_team']

            home_owner = team_to_owner.get((year, home_team), home_team)
            away_owner = team_to_owner.get((year, away_team), away_team)

            if matchup['winner'] == home_team:
                owner_results[home_owner].append((year, week, 'W', home_team))
                owner_results[away_owner].append((year, week, 'L', away_team))
            elif matchup['winner'] == away_team:
                owner_results[away_owner].append((year, week, 'W', away_team))
                owner_results[home_owner].append((year, week, 'L', home_team))
            else:  # Tie
                owner_results[home_owner].append((year, week, 'T', home_team))
                owner_results[away_owner].append((year, week, 'T', away_team))

        # Find longest streaks
        max_win_streak = {'owner': None, 'streak': 0, 'start_year': None, 'end_year': None, 'start_week': None, 'end_week': None}
        max_loss_streak = {'owner': None, 'streak': 0, 'start_year': None, 'end_year': None, 'start_week': None, 'end_week': None}

        for owner, results in owner_results.items():
            current_win_streak = 0
            current_loss_streak = 0
            win_start_year = win_start_week = None
            loss_start_year = loss_start_week = None

            for year, week, result, team in results:
                if result == 'W':
                    if current_win_streak == 0:
                        win_start_year, win_start_week = year, week
                    current_win_streak += 1
                    current_loss_streak = 0

                    if current_win_streak > max_win_streak['streak']:
                        max_win_streak = {
                            'owner': owner,
                            'streak': current_win_streak,
                            'start_year': win_start_year,
                            'end_year': year,
                            'start_week': win_start_week,
                            'end_week': week
                        }
                elif result == 'L':
                    if current_loss_streak == 0:
                        loss_start_year, loss_start_week = year, week
                    current_loss_streak += 1
                    current_win_streak = 0

                    if current_loss_streak > max_loss_streak['streak']:
                        max_loss_streak = {
                            'owner': owner,
                            'streak': current_loss_streak,
                            'start_year': loss_start_year,
                            'end_year': year,
                            'start_week': loss_start_week,
                            'end_week': week
                        }
                else:  # Tie breaks both streaks
                    current_win_streak = 0
                    current_loss_streak = 0

        if max_win_streak['streak'] > 0:
            records['longest_win_streak'] = max_win_streak
        if max_loss_streak['streak'] > 0:
            records['longest_loss_streak'] = max_loss_streak

        # Fun records from matchup data
        if self.processed_data['matchups']:
            # Highest scoring loss - team that scored high but still lost
            losing_scores = []
            for matchup in self.processed_data['matchups']:
                if matchup['winner'] == matchup['home_team']:
                    losing_scores.append({
                        'team': matchup['away_team'],
                        'owner': get_owner(matchup['away_team'], matchup['year']),
                        'score': matchup['away_score'],
                        'week': matchup['week'],
                        'year': matchup['year'],
                        'opponent': matchup['home_team'],
                        'opponent_owner': get_owner(matchup['home_team'], matchup['year']),
                        'opponent_score': matchup['home_score']
                    })
                elif matchup['winner'] == matchup['away_team']:
                    losing_scores.append({
                        'team': matchup['home_team'],
                        'owner': get_owner(matchup['home_team'], matchup['year']),
                        'score': matchup['home_score'],
                        'week': matchup['week'],
                        'year': matchup['year'],
                        'opponent': matchup['away_team'],
                        'opponent_owner': get_owner(matchup['away_team'], matchup['year']),
                        'opponent_score': matchup['away_score']
                    })

            if losing_scores:
                records['highest_scoring_loss'] = max(losing_scores, key=lambda x: x['score'])

            # Most combined points in a game
            combined_points_games = []
            for matchup in self.processed_data['matchups']:
                combined_points_games.append({
                    'year': matchup['year'],
                    'week': matchup['week'],
                    'home_team': matchup['home_team'],
                    'home_owner': get_owner(matchup['home_team'], matchup['year']),
                    'away_team': matchup['away_team'],
                    'away_owner': get_owner(matchup['away_team'], matchup['year']),
                    'home_score': matchup['home_score'],
                    'away_score': matchup['away_score'],
                    'combined_points': matchup['home_score'] + matchup['away_score']
                })

            if combined_points_games:
                records['most_combined_points'] = max(combined_points_games, key=lambda x: x['combined_points'])

            # Lowest scoring win - team that won despite low score
            winning_scores = []
            for matchup in self.processed_data['matchups']:
                if matchup['winner'] == matchup['home_team']:
                    winning_scores.append({
                        'team': matchup['home_team'],
                        'owner': get_owner(matchup['home_team'], matchup['year']),
                        'score': matchup['home_score'],
                        'week': matchup['week'],
                        'year': matchup['year'],
                        'opponent': matchup['away_team'],
                        'opponent_owner': get_owner(matchup['away_team'], matchup['year']),
                        'opponent_score': matchup['away_score']
                    })
                elif matchup['winner'] == matchup['away_team']:
                    winning_scores.append({
                        'team': matchup['away_team'],
                        'owner': get_owner(matchup['away_team'], matchup['year']),
                        'score': matchup['away_score'],
                        'week': matchup['week'],
                        'year': matchup['year'],
                        'opponent': matchup['home_team'],
                        'opponent_owner': get_owner(matchup['home_team'], matchup['year']),
                        'opponent_score': matchup['home_score']
                    })

            if winning_scores:
                records['lowest_scoring_win'] = min(winning_scores, key=lambda x: x['score'])

        # Best team that didn't win championship (or finish top 3)
        # Look at teams with best points ranking in their season who finished 4th-6th
        # (Exclude consolation bracket results which can be misleading)
        best_team_worst_result = None
        if self.processed_data['standings']:
            # Group standings by year to compare within seasons
            standings_by_year = {}
            for standing in self.processed_data['standings']:
                year = standing['year']
                if year not in standings_by_year:
                    standings_by_year[year] = []
                standings_by_year[year].append(standing)

            # For each year, rank teams by points and find teams that finished 4th-6th despite high points ranking
            best_gap = 0
            for year, year_standings in standings_by_year.items():
                # Sort by points to get points ranking
                sorted_by_points = sorted(year_standings, key=lambda x: x['points_for'], reverse=True)

                # Find teams that finished 4th-6th (playoff teams that didn't medal)
                # Exclude 7th+ as those are often consolation bracket results
                for standing in year_standings:
                    final_standing = standing.get('final_standing')
                    if final_standing and 4 <= final_standing <= 6:
                        # Find this team's points ranking
                        points_rank = next((i+1 for i, s in enumerate(sorted_by_points) if s['team_name'] == standing['team_name']), None)

                        if points_rank:
                            # Calculate gap between points ranking and final standing
                            gap = final_standing - points_rank
                            if gap > best_gap or (gap == best_gap and standing['points_for'] > (best_team_worst_result or {}).get('points_for', 0)):
                                best_gap = gap
                                standing_copy = standing.copy()
                                standing_copy['points_rank'] = points_rank
                                standing_copy['standing_gap'] = gap
                                best_team_worst_result = standing_copy

        records['best_team_worst_result'] = best_team_worst_result

        # Worst team that won championship
        # Look at champions who had worst points ranking relative to their season
        worst_champion = None
        if self.processed_data['playoffs']:
            # Group standings by year
            standings_by_year = {}
            for standing in self.processed_data['standings']:
                year = standing['year']
                if year not in standings_by_year:
                    standings_by_year[year] = []
                standings_by_year[year].append(standing)

            worst_points_rank = 0
            for playoff in self.processed_data['playoffs']:
                year = playoff['year']
                champion_team = playoff.get('champion')

                if champion_team and year in standings_by_year:
                    # Find this champion's standing
                    champion_standing = next(
                        (s for s in standings_by_year[year] if s['team_name'] == champion_team),
                        None
                    )

                    if champion_standing:
                        # Sort teams by points to get ranking
                        sorted_by_points = sorted(standings_by_year[year], key=lambda x: x['points_for'], reverse=True)
                        points_rank = next((i+1 for i, s in enumerate(sorted_by_points) if s['team_name'] == champion_team), None)

                        if points_rank and points_rank > worst_points_rank:
                            worst_points_rank = points_rank
                            champion_copy = champion_standing.copy()
                            champion_copy['points_rank'] = points_rank
                            champion_copy['total_teams'] = len(standings_by_year[year])
                            worst_champion = champion_copy

        records['worst_team_best_result'] = worst_champion

        # Best champion - champion with biggest gap in regular season points over 2nd place
        best_champion = None
        if self.processed_data['playoffs']:
            standings_by_year = {}
            for standing in self.processed_data['standings']:
                year = standing['year']
                if year not in standings_by_year:
                    standings_by_year[year] = []
                standings_by_year[year].append(standing)

            max_gap = 0
            for playoff in self.processed_data['playoffs']:
                year = playoff['year']
                champion_team = playoff.get('champion')
                champion_owner = playoff.get('champion_owner')

                if champion_team and year in standings_by_year:
                    # Sort teams by regular season points
                    sorted_by_points = sorted(standings_by_year[year], key=lambda x: x['points_for'], reverse=True)

                    # Find champion's standing
                    champion_standing = next(
                        (s for s in standings_by_year[year] if s['team_name'] == champion_team),
                        None
                    )

                    if champion_standing and len(sorted_by_points) >= 2:
                        # Find champion's rank in points
                        champion_points_rank = next((i for i, s in enumerate(sorted_by_points) if s['team_name'] == champion_team), None)

                        if champion_points_rank is not None:
                            # Get the points of the second-place points scorer
                            if champion_points_rank == 0:
                                # Champion was #1 in points, compare to #2
                                second_place_points = sorted_by_points[1]['points_for']
                                points_gap = champion_standing['points_for'] - second_place_points

                                if points_gap > max_gap:
                                    max_gap = points_gap
                                    champion_copy = champion_standing.copy()
                                    champion_copy['points_gap'] = round(points_gap, 2)
                                    champion_copy['second_place_points'] = round(second_place_points, 2)
                                    best_champion = champion_copy

        records['best_champion'] = best_champion

        # Unluckiest regular season winner - team with biggest points gap over 2nd place but didn't win championship
        unluckiest_reg_season_winner = None
        if self.processed_data['standings']:
            standings_by_year = {}
            for standing in self.processed_data['standings']:
                year = standing['year']
                if year not in standings_by_year:
                    standings_by_year[year] = []
                standings_by_year[year].append(standing)

            max_gap = 0
            for year, year_standings in standings_by_year.items():
                # Sort by points to get top scorer
                sorted_by_points = sorted(year_standings, key=lambda x: x['points_for'], reverse=True)

                if len(sorted_by_points) >= 2:
                    top_scorer = sorted_by_points[0]
                    second_scorer = sorted_by_points[1]

                    # Check if top scorer didn't win championship (final_standing != 1)
                    if top_scorer.get('final_standing') != 1:
                        points_gap = top_scorer['points_for'] - second_scorer['points_for']

                        if points_gap > max_gap:
                            max_gap = points_gap
                            top_scorer_copy = top_scorer.copy()
                            top_scorer_copy['points_gap'] = round(points_gap, 2)
                            top_scorer_copy['second_place_points'] = round(second_scorer['points_for'], 2)
                            unluckiest_reg_season_winner = top_scorer_copy

        records['unluckiest_reg_season_winner'] = unluckiest_reg_season_winner

        self.processed_data['records'] = records

        print("Calculated league records")

    def add_metadata(self):
        """Add metadata about the processed data"""
        years = sorted(self.raw_data.keys())

        self.processed_data['metadata'] = {
            'total_seasons': len(years),
            'years': years,
            'first_season': min(years) if years else None,
            'latest_season': max(years) if years else None,
            'total_teams': len(self.processed_data['teams']),
            'total_owners': len(self.processed_data['owners']),
            'total_matchups': len(self.processed_data['matchups']),
            'processed_at': datetime.now().isoformat(),
            'league_name': list(self.raw_data.values())[0].get('league_name', 'Unknown') if self.raw_data else 'Unknown'
        }

        print(f"Added metadata: {self.processed_data['metadata']['total_seasons']} seasons, "
              f"{self.processed_data['metadata']['total_teams']} teams, "
              f"{self.processed_data['metadata']['total_owners']} owners")

    def process_draft(self):
        """Process draft data across all years"""
        all_drafts = []

        for year, season_data in self.raw_data.items():
            draft_picks = season_data.get('draft', [])
            for pick in draft_picks:
                # Skip keepers - only include actual draft picks
                if pick.get('keeper_status', False):
                    continue

                # Add year and normalized owner name
                pick_data = pick.copy()
                pick_data['year'] = year
                if pick.get('team_name'):
                    # Find owner for this team
                    for team in season_data.get('teams', []):
                        if team['team_id'] == pick.get('team_id'):
                            pick_data['owner'] = self.normalize_owner_name(team['owner'], year)
                            break
                all_drafts.append(pick_data)

        self.processed_data['draft'] = all_drafts
        print(f"Processed {len(all_drafts)} draft picks across all years (keepers excluded)")

    def process_rosters(self):
        """Process roster data across all years"""
        all_rosters = []
        enriched_count = 0

        for year, season_data in self.raw_data.items():
            rosters_data = season_data.get('rosters', {})
            # Handle both dict and list formats (Sleeper returns empty list)
            rosters_by_team = rosters_data if isinstance(rosters_data, dict) else {}
            teams = season_data.get('teams', [])

            for team in teams:
                team_id = team['team_id']
                roster = rosters_by_team.get(str(team_id), [])

                if roster:
                    # Enrich roster entries with player names from mapping
                    enriched_roster = []
                    for player in roster:
                        player_copy = player.copy()
                        player_id = str(player.get('player_id', ''))

                        # If name is empty and we have a mapping, fill it in
                        if not player_copy.get('name') and player_id in self.player_id_mapping:
                            player_info = self.player_id_mapping[player_id]
                            player_copy['name'] = player_info.get('name', '')
                            enriched_count += 1

                        enriched_roster.append(player_copy)

                    roster_entry = {
                        'year': year,
                        'team_id': team_id,
                        'team_name': team['team_name'],
                        'owner': self.normalize_owner_name(team['owner'], year),
                        'roster': enriched_roster
                    }
                    all_rosters.append(roster_entry)

        self.processed_data['rosters'] = all_rosters
        print(f"Processed rosters for {len(all_rosters)} team-seasons")
        print(f"  - Enriched {enriched_count} player names from ID mapping")

    def process_player_stats(self):
        """Process player performance data and calculate optimal lineups"""
        all_player_stats = []
        optimal_lineups = []

        for year, season_data in self.raw_data.items():
            player_stats = season_data.get('player_stats', [])

            # Add year and normalized owner to each stat
            for stat in player_stats:
                stat_data = stat.copy()
                stat_data['year'] = year

                # Find owner for this team
                for team in season_data.get('teams', []):
                    if team['team_id'] == stat.get('team_id'):
                        stat_data['owner'] = self.normalize_owner_name(team['owner'], year)
                        break

                all_player_stats.append(stat_data)

            # Calculate optimal lineups (only for years with weekly player stats)
            # Skip for aggregated data (like Sleeper) that doesn't have 'week' field
            if player_stats and player_stats[0].get('week') is not None:
                optimal_lineups.extend(self.calculate_optimal_lineups(year, player_stats))

        self.processed_data['player_stats'] = all_player_stats
        self.processed_data['optimal_lineups'] = optimal_lineups
        print(f"Processed {len(all_player_stats)} player performances")
        print(f"Calculated {len(optimal_lineups)} optimal lineups")

    def calculate_optimal_lineups(self, year, player_stats):
        """Calculate optimal lineup for each team each week"""
        # Group by team and week
        from collections import defaultdict
        team_week_players = defaultdict(list)

        for stat in player_stats:
            key = (stat['team_id'], stat['week'])
            team_week_players[key].append(stat)

        optimal_lineups = []

        # Lineup slot definitions (non-bench slots)
        # Slots like 'QB', 'RB', 'WR', 'TE', 'FLEX', 'D/ST', 'K' are starters
        # Slot 'BE' or 'Bench' or 'IR' are bench slots
        BENCH_SLOTS = ['BE', 'Bench', 'IR']

        for (team_id, week), players in team_week_players.items():
            # Calculate actual points (starters only)
            actual_points = sum(p['points'] for p in players if p['slot'] not in BENCH_SLOTS)

            # Calculate optimal points (all players sorted by points, taking top starters)
            # This is simplified - ideally would respect position constraints
            all_points = sorted([p['points'] for p in players], reverse=True)
            num_starters = len([p for p in players if p['slot'] not in BENCH_SLOTS])
            optimal_points = sum(all_points[:num_starters]) if all_points else 0

            bench_points = sum(p['points'] for p in players if p['slot'] in BENCH_SLOTS)

            # Find team info
            team_name = next((p['team_name'] for p in players if 'team_name' in p), None)
            owner = next((p.get('owner') for p in players if p.get('owner')), None)

            optimal_lineups.append({
                'year': year,
                'week': week,
                'team_id': team_id,
                'team_name': team_name,
                'owner': owner,
                'actual_points': round(actual_points, 2),
                'optimal_points': round(optimal_points, 2),
                'bench_points': round(bench_points, 2),
                'points_left_on_bench': round(optimal_points - actual_points, 2)
            })

        return optimal_lineups

    def calculate_best_draft_picks(self):
        """Analyze draft picks to find best and worst value picks (excluding keepers - $0 or $1)"""
        # Group player stats by year and player - create multiple lookup keys
        from collections import defaultdict
        player_season_stats_by_id = defaultdict(lambda: {'total_points': 0, 'games': 0, 'position': None})
        player_season_stats_by_name = defaultdict(lambda: {'total_points': 0, 'games': 0, 'position': None})

        for stat in self.processed_data['player_stats']:
            year = stat['year']
            player_id = stat.get('player_id')
            player_name = stat.get('player_name', '').strip().lower()

            # Handle both weekly data ('points') and aggregated data ('total_points')
            # For weekly data, we accumulate; for aggregated, we use the total directly
            points = stat.get('points', 0) or stat.get('total_points', 0)
            games = stat.get('games', 1)  # Aggregated data has 'games', weekly has 1 per entry

            # Accumulate by player_id if available
            if player_id:
                key = (year, player_id)
                # For aggregated data (has 'total_points'), set directly; for weekly, accumulate
                if 'total_points' in stat and stat.get('total_points'):
                    player_season_stats_by_id[key]['total_points'] = stat['total_points']
                    player_season_stats_by_id[key]['games'] = games
                else:
                    player_season_stats_by_id[key]['total_points'] += points
                    player_season_stats_by_id[key]['games'] += 1
                if not player_season_stats_by_id[key]['position']:
                    player_season_stats_by_id[key]['position'] = stat.get('position')

            # Also accumulate by player_name for matching draft picks without player_id
            if player_name:
                key = (year, player_name)
                if 'total_points' in stat and stat.get('total_points'):
                    player_season_stats_by_name[key]['total_points'] = stat['total_points']
                    player_season_stats_by_name[key]['games'] = games
                else:
                    player_season_stats_by_name[key]['total_points'] += points
                    player_season_stats_by_name[key]['games'] += 1
                if not player_season_stats_by_name[key]['position']:
                    player_season_stats_by_name[key]['position'] = stat.get('position')

        # Match draft picks with their season performance
        all_picks = []

        for draft_pick in self.processed_data['draft']:
            year = draft_pick['year']
            player_id = draft_pick.get('player_id')
            player_name = draft_pick.get('player_name', '').strip().lower()
            auction_cost = draft_pick.get('bid_amount', 0)

            # Skip keepers ($0 or $1 picks)
            if auction_cost <= 1:
                continue

            # Try to find stats - first by player_id, then by name
            stats = None
            if player_id:
                key = (year, player_id)
                if key in player_season_stats_by_id:
                    stats = player_season_stats_by_id[key]

            if not stats and player_name:
                key = (year, player_name)
                if key in player_season_stats_by_name:
                    stats = player_season_stats_by_name[key]

            if stats:
                total_points = stats['total_points']
                avg_points = total_points / stats['games'] if stats['games'] > 0 else 0
                position = stats['position']

                # Calculate value as points per dollar spent (for auction drafts)
                pts_per_dollar = round(total_points / auction_cost, 2) if auction_cost > 0 else 0

                all_picks.append({
                    'year': year,
                    'player_name': draft_pick['player_name'],
                    'owner': draft_pick.get('owner'),
                    'team_name': draft_pick.get('team_name'),
                    'position': position,
                    'auction_cost': auction_cost,
                    'total_points': round(total_points, 2),
                    'avg_points_per_game': round(avg_points, 2),
                    'games_played': stats['games'],
                    'pts_per_dollar': pts_per_dollar
                })

        # Calculate position averages (pts/$ for each position)
        position_totals = defaultdict(lambda: {'total_pts': 0, 'total_cost': 0, 'count': 0})
        for pick in all_picks:
            pos = pick.get('position')
            if pos and pick['total_points'] > 0:
                position_totals[pos]['total_pts'] += pick['total_points']
                position_totals[pos]['total_cost'] += pick['auction_cost']
                position_totals[pos]['count'] += 1

        position_avg_pts_per_dollar = {}
        for pos, data in position_totals.items():
            if data['total_cost'] > 0:
                position_avg_pts_per_dollar[pos] = data['total_pts'] / data['total_cost']

        print(f"\nPosition average pts/$ (auction drafts):")
        for pos in ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']:
            if pos in position_avg_pts_per_dollar:
                print(f"  {pos}: {position_avg_pts_per_dollar[pos]:.2f} pts/$")

        # Calculate value vs position average
        for pick in all_picks:
            pos = pick.get('position')
            pos_avg = position_avg_pts_per_dollar.get(pos, 0)
            # Value = how much better/worse than position average
            pick['position_avg_pts_per_dollar'] = round(pos_avg, 2)
            pick['value_vs_position'] = round(pick['pts_per_dollar'] - pos_avg, 2)
            # Keep raw value for backward compatibility
            pick['value'] = pick['pts_per_dollar']

        # Sort by value vs position (how much better than position average)
        all_picks.sort(key=lambda x: x['value_vs_position'], reverse=True)

        # For both best and worst picks, only include picks that cost $20 or more
        # This focuses on significant investments rather than cheap fliers
        expensive_picks = [pick for pick in all_picks if pick['auction_cost'] >= 20]

        # For best picks, also exclude QBs from 2019-2021 (league moved to 2-QB format after 2021)
        best_picks = [
            pick for pick in expensive_picks
            if not (pick.get('position') == 'QB' and pick['year'] in [2019, 2020, 2021])
        ]
        self.processed_data['best_draft_picks'] = best_picks

        # For worst picks, filter out players with 0 or negative points (injuries/DNPs)
        # Sort by value_vs_position ascending for worst picks
        worst_picks = [pick for pick in expensive_picks if pick['total_points'] > 0]
        worst_picks.sort(key=lambda x: x['value_vs_position'])
        self.processed_data['worst_draft_picks'] = worst_picks

        print(f"Analyzed {len(all_picks)} draft picks with performance data (keepers excluded)")
        print(f"  - {len(best_picks)} picks ($20+, excluding QBs from 2019-2021) for best value analysis")
        print(f"  - {len(worst_picks)} picks ($20+, positive points) for worst value analysis")

        # Calculate snake draft value (2007-2011)
        self.calculate_snake_draft_value(player_season_stats_by_id, player_season_stats_by_name)

    def calculate_snake_draft_value(self, player_season_stats_by_id, player_season_stats_by_name):
        """Calculate value for snake draft picks (2007-2011) using Points vs Expected"""
        SNAKE_DRAFT_YEARS = [2007, 2008, 2009, 2010, 2011]

        # First pass: calculate average points per round across all snake draft years
        from collections import defaultdict
        round_points = defaultdict(list)  # round_num -> list of total_points

        for draft_pick in self.processed_data['draft']:
            year = draft_pick['year']
            if year not in SNAKE_DRAFT_YEARS:
                continue

            round_num = draft_pick.get('round_num')
            if not round_num:
                continue

            player_id = draft_pick.get('player_id')
            player_name = draft_pick.get('player_name', '').strip().lower()

            # Find stats for this player
            stats = None
            if player_id:
                key = (year, player_id)
                if key in player_season_stats_by_id:
                    stats = player_season_stats_by_id[key]

            if not stats and player_name:
                key = (year, player_name)
                if key in player_season_stats_by_name:
                    stats = player_season_stats_by_name[key]

            if stats:
                round_points[round_num].append(stats['total_points'])

        # Calculate average points per round
        round_averages = {}
        for round_num, points_list in round_points.items():
            if points_list:
                round_averages[round_num] = sum(points_list) / len(points_list)

        print(f"\nSnake draft round averages (2007-2011):")
        for round_num in sorted(round_averages.keys()):
            print(f"  Round {round_num}: {round_averages[round_num]:.1f} avg points")

        # Second pass: calculate value as actual - expected for each pick
        all_snake_picks = []

        for draft_pick in self.processed_data['draft']:
            year = draft_pick['year']
            if year not in SNAKE_DRAFT_YEARS:
                continue

            round_num = draft_pick.get('round_num')
            round_pick = draft_pick.get('round_pick')
            overall_pick = draft_pick.get('overall_pick')

            if not round_num or round_num not in round_averages:
                continue

            player_id = draft_pick.get('player_id')
            player_name = draft_pick.get('player_name', '').strip().lower()

            # Find stats for this player
            stats = None
            if player_id:
                key = (year, player_id)
                if key in player_season_stats_by_id:
                    stats = player_season_stats_by_id[key]

            if not stats and player_name:
                key = (year, player_name)
                if key in player_season_stats_by_name:
                    stats = player_season_stats_by_name[key]

            if stats:
                total_points = stats['total_points']
                expected_points = round_averages[round_num]
                # Value = how much they exceeded (or missed) expectations
                value = round(total_points - expected_points, 2)

                all_snake_picks.append({
                    'year': year,
                    'player_name': draft_pick['player_name'],
                    'owner': draft_pick.get('owner'),
                    'team_name': draft_pick.get('team_name'),
                    'position': stats.get('position'),
                    'round_num': round_num,
                    'round_pick': round_pick,
                    'overall_pick': overall_pick,
                    'total_points': round(total_points, 2),
                    'expected_points': round(expected_points, 2),
                    'value': value,  # Points vs expected (positive = outperformed)
                    'games_played': stats['games']
                })

        # Sort by value (highest overperformance first)
        all_snake_picks.sort(key=lambda x: x['value'], reverse=True)

        # Best snake picks: top overperformers
        self.processed_data['best_snake_picks'] = all_snake_picks[:50]

        # Worst snake picks: biggest underperformers (but filter out DNPs with 0 points)
        valid_snake_picks = [p for p in all_snake_picks if p['total_points'] > 0]
        self.processed_data['worst_snake_picks'] = valid_snake_picks[-50:][::-1]  # Reverse for worst first

        print(f"\nAnalyzed {len(all_snake_picks)} snake draft picks (2007-2011)")
        print(f"  - {len(self.processed_data['best_snake_picks'])} best value picks (overperformed expectations)")
        print(f"  - {len(self.processed_data['worst_snake_picks'])} worst value picks (underperformed expectations)")

    def process_trades(self):
        """Process trade data across all years"""
        all_trades = []

        for year, season_data in self.raw_data.items():
            trades = season_data.get('trades', [])

            for trade in trades:
                # Process each trade into a cleaner format
                sides = trade.get('sides', [])
                if len(sides) != 2:
                    continue  # Skip malformed trades

                # Build a simplified trade record
                trade_record = {
                    'year': year,
                    'week': trade.get('week'),
                    'transaction_id': trade.get('transaction_id'),
                    'timestamp': trade.get('timestamp'),
                    'side1': {
                        'owner': self.normalize_owner_name(sides[0].get('owner', ''), year),
                        'received': sides[0].get('received', []),
                        'sent': sides[0].get('sent', []),
                        'faab_received': sides[0].get('faab_received', 0),
                        'faab_sent': sides[0].get('faab_sent', 0)
                    },
                    'side2': {
                        'owner': self.normalize_owner_name(sides[1].get('owner', ''), year),
                        'received': sides[1].get('received', []),
                        'sent': sides[1].get('sent', []),
                        'faab_received': sides[1].get('faab_received', 0),
                        'faab_sent': sides[1].get('faab_sent', 0)
                    }
                }

                # Create a human-readable summary
                side1_gets = ', '.join([p['player_name'] for p in sides[0].get('received', [])])
                side2_gets = ', '.join([p['player_name'] for p in sides[1].get('received', [])])

                if sides[0].get('faab_received', 0) > 0:
                    side1_gets += f" + ${sides[0]['faab_received']} FAAB" if side1_gets else f"${sides[0]['faab_received']} FAAB"
                if sides[1].get('faab_received', 0) > 0:
                    side2_gets += f" + ${sides[1]['faab_received']} FAAB" if side2_gets else f"${sides[1]['faab_received']} FAAB"

                trade_record['summary'] = f"{trade_record['side1']['owner']} receives {side1_gets}; {trade_record['side2']['owner']} receives {side2_gets}"

                all_trades.append(trade_record)

        # Sort by year descending, then by week descending
        all_trades.sort(key=lambda x: (x['year'], x.get('week', 0) or 0), reverse=True)

        self.processed_data['trades'] = all_trades
        print(f"Processed {len(all_trades)} trades across all years")

    def calculate_trade_values(self):
        """Calculate trade winners based on player performance after the trade"""
        from collections import defaultdict

        # Build player season stats lookup: (year, player_name_lower) -> total_points
        player_season_points = defaultdict(float)

        for stat in self.processed_data['player_stats']:
            year = stat['year']
            player_name = stat.get('player_name', '').strip().lower()
            # Handle both weekly ('points') and aggregated ('total_points') data
            points = stat.get('total_points') or stat.get('points', 0) or 0
            player_season_points[(year, player_name)] += points

        # Calculate value for each trade
        trades_with_value = []

        for trade in self.processed_data['trades']:
            year = trade['year']

            # Calculate points for side 1's received players
            side1_points = 0
            side1_players_with_stats = []
            for player in trade['side1'].get('received', []):
                player_name = player.get('player_name', '').strip().lower()
                points = player_season_points.get((year, player_name), 0)
                side1_points += points
                if points > 0:
                    side1_players_with_stats.append({
                        'name': player.get('player_name'),
                        'position': player.get('position'),
                        'points': round(points, 2)
                    })

            # Calculate points for side 2's received players
            side2_points = 0
            side2_players_with_stats = []
            for player in trade['side2'].get('received', []):
                player_name = player.get('player_name', '').strip().lower()
                points = player_season_points.get((year, player_name), 0)
                side2_points += points
                if points > 0:
                    side2_players_with_stats.append({
                        'name': player.get('player_name'),
                        'position': player.get('position'),
                        'points': round(points, 2)
                    })

            # Determine winner
            point_diff = side1_points - side2_points
            if abs(point_diff) < 5:  # Within 5 points = tie
                winner = 'tie'
                winner_owner = None
            elif point_diff > 0:
                winner = 'side1'
                winner_owner = trade['side1']['owner']
            else:
                winner = 'side2'
                winner_owner = trade['side2']['owner']

            # Add value info to trade
            trade_with_value = trade.copy()
            trade_with_value['side1']['total_points'] = round(side1_points, 2)
            trade_with_value['side1']['players_with_stats'] = side1_players_with_stats
            trade_with_value['side2']['total_points'] = round(side2_points, 2)
            trade_with_value['side2']['players_with_stats'] = side2_players_with_stats
            trade_with_value['winner'] = winner
            trade_with_value['winner_owner'] = winner_owner
            trade_with_value['point_differential'] = round(abs(point_diff), 2)

            trades_with_value.append(trade_with_value)

        # Sort by point differential to find best/worst trades
        trades_with_winners = [t for t in trades_with_value if t['winner'] != 'tie']
        trades_with_winners.sort(key=lambda x: x['point_differential'], reverse=True)

        # Identify best and worst trades (by point differential)
        self.processed_data['trades'] = trades_with_value
        self.processed_data['best_trades'] = trades_with_winners[:10]  # Top 10 lopsided trades
        self.processed_data['worst_trades'] = trades_with_winners[:10]  # Same list, shown from loser's perspective

        # Count wins/losses by owner
        trade_record = defaultdict(lambda: {'wins': 0, 'losses': 0, 'ties': 0, 'net_points': 0})
        for trade in trades_with_value:
            side1_owner = trade['side1']['owner']
            side2_owner = trade['side2']['owner']

            if trade['winner'] == 'side1':
                trade_record[side1_owner]['wins'] += 1
                trade_record[side1_owner]['net_points'] += trade['point_differential']
                trade_record[side2_owner]['losses'] += 1
                trade_record[side2_owner]['net_points'] -= trade['point_differential']
            elif trade['winner'] == 'side2':
                trade_record[side2_owner]['wins'] += 1
                trade_record[side2_owner]['net_points'] += trade['point_differential']
                trade_record[side1_owner]['losses'] += 1
                trade_record[side1_owner]['net_points'] -= trade['point_differential']
            else:
                trade_record[side1_owner]['ties'] += 1
                trade_record[side2_owner]['ties'] += 1

        self.processed_data['trade_records'] = dict(trade_record)

        trades_analyzed = len([t for t in trades_with_value if t['side1'].get('total_points', 0) > 0 or t['side2'].get('total_points', 0) > 0])
        print(f"Calculated trade values for {trades_analyzed} trades with player stats")

    def enrich_draft_with_positions(self):
        """Add position information to draft picks by matching with player stats or ID mapping"""
        # Create a mapping of (year, player_id) -> position from player stats
        player_positions = {}
        for stat in self.processed_data['player_stats']:
            key = (stat['year'], stat.get('player_id') or stat['player_name'])
            if key not in player_positions and stat.get('position'):
                player_positions[key] = stat['position']

        # Create a name -> position mapping from player_id_mapping for fallback
        name_to_position = {}
        for player_id, info in self.player_id_mapping.items():
            name = info.get('name', '').strip()
            position = info.get('position')
            if name and position:
                # Store with lowercase for case-insensitive matching
                name_to_position[name.lower()] = position

        # Enrich draft picks with position data
        enriched_from_stats = 0
        enriched_from_mapping = 0
        enriched_from_name = 0
        for pick in self.processed_data['draft']:
            year = pick['year']
            player_id = pick.get('player_id') or pick['player_name']
            key = (year, player_id)

            if key in player_positions:
                pick['position'] = player_positions[key]
                enriched_from_stats += 1
            elif not pick.get('position'):
                # Try to get position from player_id_mapping by ID
                player_id_str = str(pick.get('player_id', ''))
                if player_id_str and player_id_str != 'None' and player_id_str in self.player_id_mapping:
                    position = self.player_id_mapping[player_id_str].get('position')
                    if position:
                        pick['position'] = position
                        enriched_from_mapping += 1
                        continue

                # Try to match by player name
                player_name = pick.get('player_name', '').strip().lower()
                if player_name and player_name in name_to_position:
                    pick['position'] = name_to_position[player_name]
                    enriched_from_name += 1
                else:
                    pick['position'] = None  # Position unknown

        total_enriched = enriched_from_stats + enriched_from_mapping + enriched_from_name
        print(f"Enriched {total_enriched}/{len(self.processed_data['draft'])} draft picks with position data")
        print(f"  - {enriched_from_stats} from player stats, {enriched_from_mapping} from ID mapping, {enriched_from_name} from name matching")

        # Normalize all positions (PK -> K, FB -> RB, D/ST -> DEF)
        for pick in self.processed_data['draft']:
            if pick.get('position'):
                pick['position'] = self.normalize_position(pick['position'])

    def process_all(self):
        """Run all processing steps"""
        print("\n=== Processing Fantasy Football Data ===\n")

        # Load player ID mapping for enriching roster/draft data
        self.load_player_id_mapping()

        self.process_teams()
        self.process_owners()
        self.process_matchups()
        self.process_standings()
        self.process_playoffs()
        self.process_head_to_head()
        self.calculate_records()
        self.process_draft()
        self.process_rosters()
        self.process_player_stats()
        self.enrich_draft_with_positions()  # Add positions to draft picks
        self.calculate_best_draft_picks()
        self.process_trades()
        self.calculate_trade_values()
        self.add_metadata()

        print("\n✓ All processing complete!\n")

    def save_processed_data(self):
        """Save all processed data to JSON files"""
        # Save complete dataset
        complete_file = PROCESSED_DATA_DIR / 'complete_data.json'
        with open(complete_file, 'w') as f:
            json.dump(self.processed_data, f, indent=2)
        print(f"✓ Saved complete data to {complete_file}")

        # Save individual components for easier API access
        for key in ['teams', 'owners', 'matchups', 'standings', 'playoffs', 'head_to_head', 'records', 'draft', 'rosters', 'player_stats', 'best_draft_picks', 'worst_draft_picks', 'best_snake_picks', 'worst_snake_picks', 'optimal_lineups', 'trades', 'best_trades', 'trade_records', 'metadata']:
            component_file = PROCESSED_DATA_DIR / f'{key}.json'
            with open(component_file, 'w') as f:
                json.dump(self.processed_data[key], f, indent=2)
            print(f"  - Saved {key}.json")

        print("\n✓ All processed data saved!\n")

    def load_processed_data(self):
        """Load processed data from JSON file"""
        complete_file = PROCESSED_DATA_DIR / 'complete_data.json'
        if complete_file.exists():
            with open(complete_file, 'r') as f:
                self.processed_data = json.load(f)
            print(f"Loaded processed data from {complete_file}")
            return True
        return False


def main():
    """Main entry point for data processing"""
    processor = FantasyDataProcessor()

    # Load raw data
    years_loaded = processor.load_raw_data()

    if years_loaded == 0:
        print("No raw data found. Run data_extractor.py first.")
        return

    # Process all data
    processor.process_all()

    # Save processed data
    processor.save_processed_data()


if __name__ == '__main__':
    main()
