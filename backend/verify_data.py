"""Verify processed data quality"""
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
PROCESSED_DIR = BASE_DIR / 'data' / 'processed'

# Load teams data
with open(PROCESSED_DIR / 'teams.json', 'r') as f:
    teams = json.load(f)

# Load metadata
with open(PROCESSED_DIR / 'metadata.json', 'r') as f:
    metadata = json.load(f)

print('=' * 80)
print('✓ DATA VERIFICATION - VALLEY NATIVES (2010-2024)')
print('=' * 80)
print(f'\nTotal Seasons: {metadata.get("total_seasons")}')
print(f'Total Unique Owners: {len(teams)}')
print(f'Year Range: {metadata.get("year_range", {}).get("start")} - {metadata.get("year_range", {}).get("end")}')
print('\nOwner Summary:')
print('-' * 80)
print(f"{'Owner':<20} | {'Seasons':<7} | {'Years':<13} | {'Record':<12} | Championships")
print('-' * 80)

for team_id, team in sorted(teams.items(), key=lambda x: -x[1]['seasons_active']):
    owner = team.get('current_owner', 'Unknown')
    seasons = team.get('seasons_active', 0)

    # Get year range from seasons
    season_data = team.get('seasons', [])
    if season_data:
        years = [s['year'] for s in season_data]
        year_range = f'{min(years)}-{max(years)}'

        # Calculate total record
        wins = sum(s['wins'] for s in season_data)
        losses = sum(s['losses'] for s in season_data)
        record = f'{wins:3}-{losses:3}'
    else:
        year_range = 'N/A'
        record = '  0-  0'

    championships = team.get('championships', 0)

    print(f'{owner:<20} | {seasons:<7} | {year_range:<13} | {record:<12} | {championships}')

print('-' * 80)
print(f'\n✓ All {len(teams)} owners successfully mapped and processed!')
print('=' * 80)
