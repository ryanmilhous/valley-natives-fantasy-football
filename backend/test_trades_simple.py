#!/usr/bin/env python3
"""
Simple test to check for trade data in ESPN API
"""

from espn_api.football import League
import os

# League configuration
LEAGUE_ID = 460266
ESPN_S2 = os.getenv('ESPN_S2')
ESPN_SWID = os.getenv('ESPN_SWID')

print("Testing ESPN API for trade data...\n")

year = 2024
try:
    league = League(league_id=LEAGUE_ID, year=year, espn_s2=ESPN_S2, swid=ESPN_SWID)

    print(f"Connected to league for {year}")
    print(f"League name: {league.settings.name}")
    print(f"Teams: {len(league.teams)}")

    print("\n=== All League Attributes ===")
    all_attrs = [attr for attr in dir(league) if not attr.startswith('_')]
    for attr in sorted(all_attrs):
        print(f"  - {attr}")

    print("\n=== Looking for trade-related attributes ===")
    trade_attrs = [attr for attr in all_attrs if 'trade' in attr.lower() or 'activity' in attr.lower() or 'transaction' in attr.lower()]
    if trade_attrs:
        print(f"Found: {trade_attrs}")
        for attr in trade_attrs:
            try:
                val = getattr(league, attr)
                print(f"\n{attr}:")
                print(f"  Type: {type(val)}")
                if callable(val):
                    print(f"  (This is a method)")
                else:
                    print(f"  Value: {val}")
            except Exception as e:
                print(f"  Error accessing: {e}")
    else:
        print("No trade/activity/transaction related attributes found")

except Exception as e:
    import traceback
    print(f"Error: {e}")
    print(traceback.format_exc())
