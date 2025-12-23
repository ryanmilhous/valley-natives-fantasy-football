#!/usr/bin/env python3
"""Debug script to check team owner structure"""

import os
from dotenv import load_dotenv
from espn_api.football import League

load_dotenv()

LEAGUE_ID = int(os.getenv('ESPN_LEAGUE_ID', '380405'))
ESPN_S2 = os.getenv('ESPN_S2')
ESPN_SWID = os.getenv('ESPN_SWID')

# Get 2024 season
league = League(league_id=LEAGUE_ID, year=2024, espn_s2=ESPN_S2, swid=ESPN_SWID)

print("First team:")
team = league.teams[0]
print(f"Team name: {team.team_name}")
print(f"\nTeam attributes: {[x for x in dir(team) if not x.startswith('_')]}")

# Check for owner-related attributes
print(f"\nhasattr 'owner': {hasattr(team, 'owner')}")
print(f"hasattr 'owners': {hasattr(team, 'owners')}")

# Try owners (plural)
if hasattr(team, 'owners'):
    print(f"\nowners value: {team.owners}")
    print(f"owners type: {type(team.owners)}")

# Check team __dict__
if hasattr(team, '__dict__'):
    print(f"\nTeam __dict__ keys: {team.__dict__.keys()}")
