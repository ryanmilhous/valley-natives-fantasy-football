#!/usr/bin/env python3
"""
Test script to explore Sleeper API data structure
"""

import requests
import json
from pathlib import Path

LEAGUE_ID = "1264338570127097857"
BASE_URL = "https://api.sleeper.app/v1"

print("Testing Sleeper API...\n")

# Test 1: Get league info
print("=== League Info ===")
response = requests.get(f"{BASE_URL}/league/{LEAGUE_ID}")
if response.status_code == 200:
    league_data = response.json()
    print(f"League Name: {league_data.get('name')}")
    print(f"Season: {league_data.get('season')}")
    print(f"Total Rosters: {league_data.get('total_rosters')}")
    print(f"Status: {league_data.get('status')}")
    print(f"\nSample league data keys: {list(league_data.keys())[:10]}")
else:
    print(f"Error: {response.status_code}")

# Test 2: Get users
print("\n=== Users ===")
response = requests.get(f"{BASE_URL}/league/{LEAGUE_ID}/users")
if response.status_code == 200:
    users = response.json()
    print(f"Total users: {len(users)}")
    print("\nSample users:")
    for user in users[:3]:
        print(f"  - {user.get('display_name')} (user_id: {user.get('user_id')})")
    print(f"\nSample user data keys: {list(users[0].keys())}")
else:
    print(f"Error: {response.status_code}")

# Test 3: Get rosters
print("\n=== Rosters ===")
response = requests.get(f"{BASE_URL}/league/{LEAGUE_ID}/rosters")
if response.status_code == 200:
    rosters = response.json()
    print(f"Total rosters: {len(rosters)}")
    if rosters:
        print(f"\nSample roster keys: {list(rosters[0].keys())}")
        print(f"Sample roster owner_id: {rosters[0].get('owner_id')}")
        print(f"Sample roster players (first 5): {rosters[0].get('players', [])[:5]}")
else:
    print(f"Error: {response.status_code}")

# Test 4: Get matchups for week 1
print("\n=== Matchups (Week 1) ===")
response = requests.get(f"{BASE_URL}/league/{LEAGUE_ID}/matchups/1")
if response.status_code == 200:
    matchups = response.json()
    print(f"Total matchups: {len(matchups)}")
    if matchups:
        print(f"\nSample matchup keys: {list(matchups[0].keys())}")
        print(f"Sample matchup: roster_id={matchups[0].get('roster_id')}, points={matchups[0].get('points')}")
else:
    print(f"Error: {response.status_code}")

# Test 5: Get drafts
print("\n=== Drafts ===")
response = requests.get(f"{BASE_URL}/league/{LEAGUE_ID}/drafts")
if response.status_code == 200:
    drafts = response.json()
    print(f"Total drafts: {len(drafts)}")
    if drafts:
        draft_id = drafts[0].get('draft_id')
        print(f"\nDraft ID: {draft_id}")
        print(f"Draft type: {drafts[0].get('type')}")
        print(f"Draft status: {drafts[0].get('status')}")

        # Get draft picks
        if draft_id:
            print("\n=== Draft Picks ===")
            response = requests.get(f"{BASE_URL}/draft/{draft_id}/picks")
            if response.status_code == 200:
                picks = response.json()
                print(f"Total picks: {len(picks)}")
                if picks:
                    print(f"\nSample pick keys: {list(picks[0].keys())}")
                    print(f"Sample pick: {picks[0]}")
else:
    print(f"Error: {response.status_code}")

print("\n=== Summary ===")
print("Sleeper API is working! Ready to build the extractor.")
