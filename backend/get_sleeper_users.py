#!/usr/bin/env python3
"""
Get all Sleeper usernames for mapping
"""

import requests
import json

LEAGUE_ID = "1264338570127097857"
BASE_URL = "https://api.sleeper.app/v1"

# Get users
response = requests.get(f"{BASE_URL}/league/{LEAGUE_ID}/users")
users = response.json()

print("=== Sleeper Usernames ===\n")
print("Please map each Sleeper username to the correct owner name:\n")

for i, user in enumerate(sorted(users, key=lambda x: x.get('display_name', '')), 1):
    display_name = user.get('display_name')
    user_id = user.get('user_id')
    print(f"{i:2}. {display_name:20} (user_id: {user_id})")

print("\n=== Existing Owner Names ===\n")
# Load existing owners from processed data
import sys
sys.path.append('/Users/rmilhous/Documents/Projects/natives-fantasy-football/backend')
from pathlib import Path
processed_data_dir = Path('/Users/rmilhous/Documents/Projects/natives-fantasy-football/data/processed')
owners_file = processed_data_dir / 'owners.json'

with open(owners_file, 'r') as f:
    owners = json.load(f)

unique_owners = sorted(set(owner['owner'] for owner in owners))
for i, owner in enumerate(unique_owners, 1):
    print(f"{i:2}. {owner}")
