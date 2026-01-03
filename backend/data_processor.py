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
    'brom66': 'Brendan Romale',
    'Ryan Milhous': 'Ryan Milhous',
    'kweezy31': 'Kyle Morris',  # 2010-2019
    'HIS TIGHTNESS': 'Ben Beck',
    'kpop027': 'Kyle Poppen',
    'Benbasketball101': 'Ben Beck',  # Alternative username for Ben Beck
    'bvitale1313': 'Brian Vitale',  # 2010-2014
    'bryanvitale': 'Brian Vitale',  # 2017
    '12inchnick': 'Nick Smielak',  # 2010-2012
    'TPUSNESS': 'Tyler Fullterton',  # 2010-2014
}


class FantasyDataProcessor:
    """Process raw ESPN Fantasy Football data into structured formats"""

    def __init__(self):
        self.raw_data = {}
        self.processed_data = {
            'teams': {},
            'owners': {},
            'matchups': [],
            'standings': [],
            'playoffs': [],
            'head_to_head': {},
            'records': {},
            'metadata': {}
        }

    @staticmethod
    def normalize_owner_name(display_name):
        """Convert display name to actual name using mapping"""
        return OWNER_NAME_MAPPING.get(display_name, display_name)

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
                normalized_owner = self.normalize_owner_name(team['owner'])

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

                # Check if made playoffs (has playoff_seed)
                if team.get('playoff_seed'):
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
            'playoff_appearances': 0,
            'total_points_for': 0,
            'total_points_against': 0,
            'years_active': set()
        })

        # Aggregate stats by owner across all seasons
        for year, season_data in self.raw_data.items():
            for team in season_data.get('teams', []):
                owner = self.normalize_owner_name(team['owner'])
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

                # Count championships and playoff appearances
                if team['final_standing'] == 1:
                    owner_info['championships'] += 1
                if team.get('playoff_seed'):
                    owner_info['playoff_appearances'] += 1

        # Convert to final format
        self.processed_data['owners'] = {}
        for owner_name, info in owners_stats.items():
            years_list = sorted(list(info['years_active']))
            self.processed_data['owners'][owner_name] = {
                'owner': owner_name,
                'seasons_played': len(info['years_active']),
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
                    'playoff_appearances': info['playoff_appearances']
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
                    'owner': self.normalize_owner_name(team['owner']),
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
            semifinalists = []

            teams = season_data.get('teams', [])
            for team in teams:
                if team['final_standing'] == 1:
                    champion = team['team_name']
                    champion_owner = self.normalize_owner_name(team['owner'])
                elif team['final_standing'] == 2:
                    runner_up = team['team_name']
                    runner_up_owner = self.normalize_owner_name(team['owner'])
                elif team['final_standing'] == 3 or team['final_standing'] == 4:
                    semifinalists.append({
                        'team_name': team['team_name'],
                        'owner': self.normalize_owner_name(team['owner'])
                    })

            playoff_entry = {
                'year': year,
                'champion': champion,
                'champion_owner': champion_owner,
                'runner_up': runner_up,
                'runner_up_owner': runner_up_owner,
                'semifinalists': semifinalists,
                'playoff_teams': [{'team_name': t['team_name'], 'owner': self.normalize_owner_name(t['owner'])} for t in teams if t.get('playoff_seed')]
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
                team_to_owner[key] = self.normalize_owner_name(team['owner'])

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
            'longest_win_streak': None,
            'longest_loss_streak': None
        }

        # Highest and lowest scores
        all_scores = []
        for matchup in self.processed_data['matchups']:
            all_scores.append({
                'team': matchup['home_team'],
                'score': matchup['home_score'],
                'week': matchup['week'],
                'year': matchup['year'],
                'opponent': matchup['away_team']
            })
            all_scores.append({
                'team': matchup['away_team'],
                'score': matchup['away_score'],
                'week': matchup['week'],
                'year': matchup['year'],
                'opponent': matchup['home_team']
            })

        if all_scores:
            records['highest_score'] = max(all_scores, key=lambda x: x['score'])
            records['lowest_score'] = min(all_scores, key=lambda x: x['score'])

        # Biggest blowout and closest game - add loser info
        if self.processed_data['matchups']:
            blowout = max(self.processed_data['matchups'], key=lambda x: x['point_differential'])
            # Add loser information
            blowout_copy = blowout.copy()
            if blowout['winner'] == blowout['home_team']:
                blowout_copy['loser'] = blowout['away_team']
                blowout_copy['winner_score'] = blowout['home_score']
                blowout_copy['loser_score'] = blowout['away_score']
            else:
                blowout_copy['loser'] = blowout['home_team']
                blowout_copy['winner_score'] = blowout['away_score']
                blowout_copy['loser_score'] = blowout['home_score']
            records['biggest_blowout'] = blowout_copy

            non_ties = [m for m in self.processed_data['matchups'] if m['winner'] != 'TIE']
            if non_ties:
                closest = min(non_ties, key=lambda x: x['point_differential'])
                # Add loser information
                closest_copy = closest.copy()
                if closest['winner'] == closest['home_team']:
                    closest_copy['loser'] = closest['away_team']
                    closest_copy['winner_score'] = closest['home_score']
                    closest_copy['loser_score'] = closest['away_score']
                else:
                    closest_copy['loser'] = closest['home_team']
                    closest_copy['winner_score'] = closest['away_score']
                    closest_copy['loser_score'] = closest['home_score']
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

        # Calculate win/loss streaks
        # Build mapping of team_name -> owner for each year
        team_to_owner = {}
        for year, season_data in self.raw_data.items():
            for team in season_data.get('teams', []):
                key = (year, team['team_name'])
                team_to_owner[key] = self.normalize_owner_name(team['owner'])

        # Calculate streaks by owner across all matchups chronologically
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
            'total_matchups': len(self.processed_data['matchups']),
            'processed_at': datetime.now().isoformat(),
            'league_name': list(self.raw_data.values())[0].get('league_name', 'Unknown') if self.raw_data else 'Unknown'
        }

        print(f"Added metadata: {self.processed_data['metadata']['total_seasons']} seasons, "
              f"{self.processed_data['metadata']['total_teams']} teams")

    def process_all(self):
        """Run all processing steps"""
        print("\n=== Processing Fantasy Football Data ===\n")

        self.process_teams()
        self.process_owners()
        self.process_matchups()
        self.process_standings()
        self.process_playoffs()
        self.process_head_to_head()
        self.calculate_records()
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
        for key in ['teams', 'owners', 'matchups', 'standings', 'playoffs', 'head_to_head', 'records', 'metadata']:
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
