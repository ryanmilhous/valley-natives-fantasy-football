"""
League Legacy Trade Extractor

Extracts trade data from League Legacy API and formats it for the fantasy football app.
"""

import json
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent
EXPORTS_DIR = BASE_DIR / 'data' / 'exports'
RAW_DIR = BASE_DIR / 'data' / 'raw'

# League Member ID to Owner Name mapping (verified against team names in standings)
MEMBER_TO_OWNER = {
    140840: 'Chris Vitale',      # RichCity Yung Beevs, The Chronic
    140841: 'Kellen Coffis',     # The Kellen Brothers
    140842: 'Jamie Coffis',      # B-LO Bleezos, The Leftists
    140843: 'Garrett Ulrich',    # Emancipation of Jim and Vicki, Mr. Thomas' Naberhood
    140844: 'Greg Swenson',      # Prime Time
    140845: 'Jeremy Settles',    # Felton Sluggers
    140846: 'Nick Smielak',      # . Schmee, The Smi Pies
    140848: 'Rory McKee',        # Younghoe Bunghole, Protoss'd Salad
    140849: 'Jacob Luna',        # Tampon Bay Blumpkineers
    140850: 'Bryan Whitaker',    # AB's Face Farts, For Those About To Brock
    140851: 'Brendan Romele',    # S.F. Forty-Chiners
    140852: 'Ryan Milhous',      # Ding Dong Doid Brains
    140853: 'Ben Beck',          # The Pudd'n
    140854: 'Kyle Poppen',       # Cherry Poppen
    151662: 'Kyle Morris',
    151663: 'Ben Beck',
    151664: 'Brian Vitale',
    151665: 'Tyler Fullerton',
    151666: 'Tanner Clark',
    151667: 'Tanner Clark',
    151668: 'Brian Vitale',
    151669: 'Peter Kent-Stoll',
}

# Season ID to Year mapping (will be built from data)
SEASON_TO_YEAR = {
    40022: 2019,
    40021: 2020,
    40020: 2021,
    40019: 2022,
    40018: 2023,
    40017: 2024,
}


def extract_trades():
    """Extract trades from League Legacy export file"""
    trades_file = EXPORTS_DIR / 'leaguelegacy_trades.json'

    if not trades_file.exists():
        print(f"Error: {trades_file} not found")
        print("Please run: curl -s 'https://leaguelegacy.io/leagues/valley-natives/widgets/league-transaction-record?key=transaction-trade-player' > data/exports/leaguelegacy_trades.json")
        return []

    with open(trades_file) as f:
        data = json.load(f)

    # Get the top_rankings which has full transaction details
    rankings = data['record'].get('top_rankings', [])

    print(f"Found {len(rankings)} trade records in League Legacy data")

    # Process each trade
    all_trades = []
    seen_transactions = set()  # Avoid duplicates

    for t in rankings:
        tx = t.get('transaction', {})
        tx_id = tx.get('id')

        if tx_id in seen_transactions:
            continue
        seen_transactions.add(tx_id)

        season_id = t.get('season_id')
        year = SEASON_TO_YEAR.get(season_id, None)

        if not year:
            # Try to extract year from transaction date
            tx_date = tx.get('transaction_at', '')
            if tx_date:
                try:
                    year = int(tx_date[:4])
                except:
                    pass

        if not year:
            print(f"  Warning: Could not determine year for transaction {tx_id}")
            continue

        # Get trade items
        items = tx.get('items', [])
        gains = [item for item in items if item.get('type') == 'gain']
        losses = [item for item in items if item.get('type') == 'loss']

        # Get both owners from the transaction's team objects
        team = tx.get('team', {})
        partner_team = tx.get('trade_partner_team', {})

        member_id = team.get('league_member_id')
        partner_member_id = partner_team.get('league_member_id')

        owner1 = MEMBER_TO_OWNER.get(member_id, team.get('name', f'Unknown ({member_id})'))
        owner2 = MEMBER_TO_OWNER.get(partner_member_id, partner_team.get('name', f'Unknown ({partner_member_id})'))

        # Format players
        def format_players(player_items):
            players = []
            for item in player_items:
                player = item.get('player', {})
                players.append({
                    'player_id': player.get('id', ''),
                    'player_name': player.get('name', 'Unknown'),
                    'position': player.get('position', 'Unknown')
                })
            return players

        # Build trade record matching the Sleeper format
        trade_record = {
            'year': year,
            'week': tx.get('transaction_week'),
            'transaction_id': str(tx_id),
            'timestamp': tx.get('transaction_at'),
            'sides': [
                {
                    'roster_id': member_id,
                    'owner': owner1,
                    'received': format_players(gains),
                    'sent': format_players(losses),
                    'faab_received': 0,
                    'faab_sent': 0
                },
                {
                    'roster_id': partner_member_id,
                    'owner': owner2,
                    'received': format_players(losses),  # What side 1 lost, side 2 received
                    'sent': format_players(gains),  # What side 1 gained, side 2 sent
                    'faab_received': 0,
                    'faab_sent': 0
                }
            ]
        }

        all_trades.append(trade_record)

    print(f"Processed {len(all_trades)} unique trades")
    return all_trades


def add_trades_to_raw_data(trades):
    """Add trades to the raw season files"""
    # Group trades by year
    trades_by_year = {}
    for trade in trades:
        year = trade['year']
        if year not in trades_by_year:
            trades_by_year[year] = []
        trades_by_year[year].append(trade)

    # Update each season file
    for year, year_trades in trades_by_year.items():
        season_file = RAW_DIR / f'season_{year}.json'

        if season_file.exists():
            with open(season_file) as f:
                season_data = json.load(f)
        else:
            print(f"  Warning: No season file for {year}")
            continue

        # Add trades to season data
        existing_trades = season_data.get('trades', [])
        existing_ids = {t.get('transaction_id') for t in existing_trades}

        new_trades = [t for t in year_trades if t['transaction_id'] not in existing_ids]
        season_data['trades'] = existing_trades + new_trades

        # Save updated season file
        with open(season_file, 'w') as f:
            json.dump(season_data, f, indent=2)

        print(f"  {year}: Added {len(new_trades)} trades (total: {len(season_data['trades'])})")


def main():
    print("=== League Legacy Trade Extractor ===\n")

    # Extract trades from League Legacy
    trades = extract_trades()

    if trades:
        print(f"\nAdding trades to raw season files...")
        add_trades_to_raw_data(trades)

        print("\nTrade extraction complete!")
        print("\nNext steps:")
        print("  1. Run: python3 backend/data_processor.py")
        print("  2. Run: cp data/processed/trades.json frontend/public/data/")
    else:
        print("No trades extracted")


if __name__ == '__main__':
    main()
