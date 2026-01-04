"""
Test script to see actual draft, trade, and transaction data
"""

import os
import json
from dotenv import load_dotenv
from espn_api.football import League

load_dotenv()

LEAGUE_ID = int(os.getenv('ESPN_LEAGUE_ID', '380405'))
ESPN_S2 = os.getenv('ESPN_S2')
ESPN_SWID = os.getenv('ESPN_SWID')

# Get 2024 league data
league = League(league_id=LEAGUE_ID, year=2024, espn_s2=ESPN_S2, swid=ESPN_SWID)

print("=== DRAFT DATA ===")
if league.draft:
    print(f"Total picks: {len(league.draft)}")
    print("\nFirst 3 draft picks:")
    for i, pick in enumerate(league.draft[:3]):
        print(f"\nPick {i+1}:")
        print(f"  Player: {pick.playerName}")
        print(f"  Team: {pick.team.team_name if hasattr(pick.team, 'team_name') else pick.team}")
        print(f"  Round: {pick.round_num}, Pick: {pick.round_pick}")
        if hasattr(pick, 'bid_amount'):
            print(f"  Bid: ${pick.bid_amount}")
else:
    print("No draft data available")

print("\n\n=== TRADE DATA ===")
# Check first team's trades
if league.teams:
    team = league.teams[0]
    print(f"Checking {team.team_name} trades:")
    if hasattr(team, 'trades') and team.trades:
        print(f"  Total trades: {len(team.trades)}")
        print(f"  Trade attributes: {[attr for attr in dir(team.trades[0]) if not attr.startswith('_')][:10]}")
    else:
        print("  No trades or trades attribute not accessible")

print("\n\n=== LEAGUE TRANSACTIONS ===")
try:
    # recent_activity might be a method that needs parameters
    transactions = league.recent_activity(size=5)
    print(f"Recent transactions (last 5):")
    if transactions:
        for i, trans in enumerate(transactions):
            print(f"\nTransaction {i+1}:")
            print(f"  Type: {type(trans)}")
            print(f"  Attributes: {[attr for attr in dir(trans) if not attr.startswith('_')][:10]}")
    else:
        print("No recent transactions")
except Exception as e:
    print(f"Error getting transactions: {e}")

print("\n\n=== ROSTER EXAMPLE ===")
if league.teams:
    team = league.teams[0]
    if team.roster:
        print(f"{team.team_name} roster ({len(team.roster)} players):")
        for i, player in enumerate(team.roster[:3]):
            print(f"\n  Player {i+1}:")
            print(f"    Name: {player.name}")
            print(f"    Position: {player.position}")
            print(f"    Team: {player.proTeam}")
            if hasattr(player, 'avg_points'):
                print(f"    Avg Points: {player.avg_points}")

print("\n\n=== BOX SCORE LINEUP DETAILS ===")
box_scores = league.box_scores(week=1)
if box_scores:
    matchup = box_scores[0]
    print(f"{matchup.home_team.team_name} vs {matchup.away_team.team_name}")
    print(f"\n{matchup.home_team.team_name} lineup:")
    for i, player in enumerate(matchup.home_lineup[:2]):
        print(f"\n  Player {i+1}:")
        print(f"    Name: {player.name}")
        print(f"    Position: {player.position}")
        print(f"    Slot: {player.lineupSlot}")
        if hasattr(player, 'points'):
            print(f"    Points: {player.points}")
        if hasattr(player, 'projected_points'):
            print(f"    Projected: {player.projected_points}")
