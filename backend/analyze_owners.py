"""
Analyze owner names across all years to identify mapping needs
"""

import json
from pathlib import Path
from collections import defaultdict

RAW_DATA_DIR = Path(__file__).parent.parent / 'data' / 'raw'

def analyze_owners():
    """Analyze all owner names across all years"""

    # Track owner names by year
    owners_by_year = defaultdict(set)
    all_owners = set()

    # Load all season files
    for year in range(2010, 2025):
        season_file = RAW_DATA_DIR / f'season_{year}.json'
        if not season_file.exists():
            continue

        with open(season_file, 'r') as f:
            data = json.load(f)

        for team in data.get('teams', []):
            owner = team.get('owner', 'Unknown')
            if owner and owner != 'Unknown':
                owners_by_year[year].add(owner)
                all_owners.add(owner)

    # Display results
    print("=" * 80)
    print("OWNER NAME ANALYSIS - Valley Natives Fantasy Football (2010-2024)")
    print("=" * 80)

    print(f"\n📊 Total Unique Owner Names: {len(all_owners)}\n")

    # Show all unique owners alphabetically
    print("All Unique Owner Names:")
    print("-" * 80)
    for owner in sorted(all_owners):
        # Count years this owner appears
        years = [year for year in range(2010, 2025) if owner in owners_by_year[year]]
        print(f"  {owner:40} ({len(years)} years: {min(years)}-{max(years)})")

    print("\n" + "=" * 80)
    print("OWNER NAMES BY YEAR")
    print("=" * 80)

    for year in range(2010, 2025):
        if year in owners_by_year:
            owners = sorted(owners_by_year[year])
            print(f"\n{year} ({len(owners)} owners):")
            for owner in owners:
                print(f"  - {owner}")

    print("\n" + "=" * 80)
    print("SUGGESTED MAPPINGS")
    print("=" * 80)
    print("\nBased on this analysis, you should update OWNER_NAME_MAPPING in data_processor.py")
    print("to consolidate different variations of the same owner's name.\n")
    print("Look for patterns like:")
    print("  - Different capitalization")
    print("  - Username variations")
    print("  - Full name vs nickname")
    print("\n" + "=" * 80 + "\n")

if __name__ == '__main__':
    analyze_owners()
