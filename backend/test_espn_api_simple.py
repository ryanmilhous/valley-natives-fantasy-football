"""
Simple test to see what data is available
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

print("=== AVAILABLE DATA SUMMARY ===\n")

# 1. Draft
print("1. DRAFT DATA")
print(f"   ✓ Available: {len(league.draft)} picks")
print(f"   - Player names, teams, round/pick numbers")
print(f"   - Example: {league.draft[0].playerName} to {league.draft[0].team.team_name}, Round {league.draft[0].round_num}")

# 2. Rosters
print("\n2. ROSTER DATA")
team = league.teams[0]
print(f"   ✓ Available: {len(team.roster)} players per team")
print(f"   - Player names, positions, NFL teams")
print(f"   - Example: {team.roster[0].name}, {team.roster[0].position}, {team.roster[0].proTeam}")

# 3. Box Score Lineups
print("\n3. WEEKLY LINEUP/PERFORMANCE DATA")
box_score = league.box_scores(week=1)[0]
print(f"   ✓ Available: Week-by-week lineups and player points")
print(f"   - {len(box_score.home_lineup)} players per team per week")
player = box_score.home_lineup[0]
print(f"   - Includes: player name, position, slot, points scored")
if hasattr(player, 'points'):
    print(f"   - Example: {player.name} scored {player.points} points")

# 4. Transactions
print("\n4. TRANSACTIONS/TRADES")
try:
    # Try to get recent activity
    activity = league.recent_activity()
    print(f"   ✓ Available: League activity/transactions")
    print(f"   - Type: {type(activity)}")
    if activity:
        print(f"   - Count: {len(activity)}")
except Exception as e:
    print(f"   ? Need to investigate: {e}")

# 5. Check for historical data availability
print("\n5. HISTORICAL DATA CHECK")
print("   Testing if draft/roster data available for older years...")
try:
    old_league = League(league_id=LEAGUE_ID, year=2015, espn_s2=ESPN_S2, swid=ESPN_SWID)
    print(f"   - 2015 draft picks: {len(old_league.draft) if old_league.draft else 0}")
    print(f"   - 2015 roster: {len(old_league.teams[0].roster) if old_league.teams[0].roster else 0} players")
except Exception as e:
    print(f"   - 2015 data: Limited - {str(e)[:50]}")

print("\n" + "="*50)
print("CONCLUSION:")
print("✓ Draft data: Available for recent years")
print("✓ Roster data: Available for recent years")
print("✓ Player performance: Available week-by-week from 2019+")
print("? Trade data: Need more investigation")
print("="*50)
