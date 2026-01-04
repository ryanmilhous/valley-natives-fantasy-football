"""
Test script to explore what data is available from ESPN API
"""

import os
from dotenv import load_dotenv
from espn_api.football import League

load_dotenv()

LEAGUE_ID = int(os.getenv('ESPN_LEAGUE_ID', '380405'))
ESPN_S2 = os.getenv('ESPN_S2')
ESPN_SWID = os.getenv('ESPN_SWID')

# Get 2024 league data
league = League(league_id=LEAGUE_ID, year=2024, espn_s2=ESPN_S2, swid=ESPN_SWID)

print("=== League Object Attributes ===")
print([attr for attr in dir(league) if not attr.startswith('_')])
print()

print("=== Available League Data ===")

# Check for draft data
if hasattr(league, 'draft'):
    print("✓ Draft data available")
    print(f"  Type: {type(league.draft)}")
    if league.draft:
        print(f"  Draft attributes: {[attr for attr in dir(league.draft[0]) if not attr.startswith('_')][:10]}")
else:
    print("✗ No draft attribute")

# Check for trade data
if hasattr(league, 'recent_activity'):
    print("✓ Recent activity available (may include trades)")
    print(f"  Type: {type(league.recent_activity)}")
else:
    print("✗ No recent_activity attribute")

# Check team roster data
if league.teams:
    print(f"\n=== Team Data (first team: {league.teams[0].team_name}) ===")
    team = league.teams[0]
    print(f"Team attributes: {[attr for attr in dir(team) if not attr.startswith('_')]}")

    if hasattr(team, 'roster'):
        print(f"\n✓ Roster data available")
        print(f"  Roster size: {len(team.roster) if team.roster else 0}")
        if team.roster:
            player = team.roster[0]
            print(f"  Player attributes: {[attr for attr in dir(player) if not attr.startswith('_')][:15]}")
            print(f"  Example player: {player.name if hasattr(player, 'name') else 'Unknown'}")
    else:
        print("✗ No roster attribute")

# Check box score data for more details
print("\n=== Box Score Data (Week 1) ===")
box_scores = league.box_scores(week=1)
if box_scores:
    matchup = box_scores[0]
    print(f"Box score attributes: {[attr for attr in dir(matchup) if not attr.startswith('_')]}")

    if hasattr(matchup, 'home_lineup'):
        print(f"\n✓ Lineup data available in box scores")
        print(f"  Home lineup size: {len(matchup.home_lineup) if matchup.home_lineup else 0}")
        if matchup.home_lineup:
            player = matchup.home_lineup[0]
            print(f"  Player in lineup attributes: {[attr for attr in dir(player) if not attr.startswith('_')][:15]}")
