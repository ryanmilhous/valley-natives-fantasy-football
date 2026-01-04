#!/usr/bin/env python3
"""
Test script to check if trade data is available from ESPN API
"""

from espn_api.football import League
import json
import os
from pathlib import Path

# League configuration
LEAGUE_ID = 460266
ESPN_S2 = os.getenv('ESPN_S2')
ESPN_SWID = os.getenv('ESPN_SWID')
YEARS = [2024, 2023, 2022, 2021, 2020, 2019]

print("Testing ESPN API for trade data...\n")

for year in YEARS:
    print(f"\n=== Checking {year} ===")
    try:
        league = League(league_id=LEAGUE_ID, year=year, espn_s2=ESPN_S2, swid=ESPN_SWID)

        # Check if league has recent_activity attribute
        if hasattr(league, 'recent_activity'):
            print(f"✓ League has recent_activity attribute")
            recent = league.recent_activity(size=100)  # Get last 100 activities

            # Filter for trades
            trades = [activity for activity in recent if hasattr(activity, 'actions') and any('TRADED' in str(action) for action in activity.actions)]
            print(f"  Found {len(trades)} trade activities")

            if trades:
                print("\n  Sample trade:")
                trade = trades[0]
                print(f"    Type: {type(trade)}")
                print(f"    Dir: {dir(trade)}")
                if hasattr(trade, 'actions'):
                    print(f"    Actions: {trade.actions}")

        else:
            print(f"✗ No recent_activity attribute")

        # Check league object attributes
        print(f"\nLeague attributes:")
        attrs = [attr for attr in dir(league) if not attr.startswith('_') and 'trade' in attr.lower()]
        if attrs:
            print(f"  Trade-related attributes: {attrs}")
        else:
            print(f"  No trade-related attributes found")

        # Try to access teams and check for trade history
        print(f"\nChecking team attributes...")
        if league.teams:
            team = league.teams[0]
            team_attrs = [attr for attr in dir(team) if not attr.startswith('_') and 'trade' in attr.lower()]
            if team_attrs:
                print(f"  Team trade-related attributes: {team_attrs}")
            else:
                print(f"  No trade-related attributes on teams")

    except Exception as e:
        print(f"✗ Error: {e}")

print("\n\n=== Summary ===")
print("Checking ESPN API documentation for trade endpoints...")
