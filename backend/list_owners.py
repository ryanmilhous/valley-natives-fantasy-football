import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
owners_file = BASE_DIR / 'data' / 'processed' / 'owners.json'

with open(owners_file, 'r') as f:
    owners = json.load(f)

print(f'Total unique owners: {len(owners)}\n')
print(f"{'Owner':<25} | {'Seasons':<8} | {'Years':<15} | {'Record':<12} | {'Win %':<6} | Champ")
print('-' * 95)

for owner, data in sorted(owners.items(), key=lambda x: -x[1]['all_time']['wins']):
    seasons = data['seasons_played']
    first = data['first_season']
    last = data['last_season']
    years = f'{first}-{last}' if first != last else str(first)
    wins = data['all_time']['wins']
    losses = data['all_time']['losses']
    record = f'{wins:3}-{losses:3}'
    win_pct = data['all_time']['win_percentage']
    champs = data['all_time']['championships']

    print(f'{owner:<25} | {seasons:<8} | {years:<15} | {record:<12} | {win_pct:>5.1f}% | {champs}')
