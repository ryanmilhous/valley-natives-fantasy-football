"""
Test script to check if ESPN API can retrieve data from years before 2020
with current authentication cookies.
"""

import os
from dotenv import load_dotenv
from data_extractor import ESPNDataExtractor

# Load environment variables
load_dotenv()

def test_year_availability(start_year=2010, end_year=2024):
    """
    Test which years are available with current authentication.

    Args:
        start_year: First year to test (default 2010)
        end_year: Last year to test (default 2024)
    """
    print("=" * 60)
    print("Testing Historical Year Availability")
    print("=" * 60)
    print(f"\nLeague ID: {os.getenv('ESPN_LEAGUE_ID')}")
    print(f"Testing years: {start_year} - {end_year}\n")
    print(f"Authentication:")
    print(f"  ESPN_S2: {'✓ Set' if os.getenv('ESPN_S2') else '✗ Not set'}")
    print(f"  ESPN_SWID: {'✓ Set' if os.getenv('ESPN_SWID') else '✗ Not set'}")
    print("\n" + "=" * 60 + "\n")

    extractor = ESPNDataExtractor()

    available_years = []
    unavailable_years = []

    for year in range(start_year, end_year + 1):
        print(f"Testing {year}...", end=" ", flush=True)

        try:
            league = extractor.get_league(year)

            if league:
                # Try to access basic league data
                team_count = len(league.teams) if hasattr(league, 'teams') else 0
                league_name = league.settings.name if hasattr(league.settings, 'name') else 'Unknown'

                if team_count > 0:
                    print(f"✓ Available - {team_count} teams, '{league_name}'")
                    available_years.append(year)
                else:
                    print(f"✗ No team data found")
                    unavailable_years.append(year)
            else:
                print(f"✗ League object not created")
                unavailable_years.append(year)

        except Exception as e:
            print(f"✗ Error: {str(e)[:60]}")
            unavailable_years.append(year)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"\n✓ Available years ({len(available_years)}):")
    if available_years:
        print(f"  {', '.join(map(str, available_years))}")
    else:
        print("  None")

    print(f"\n✗ Unavailable years ({len(unavailable_years)}):")
    if unavailable_years:
        print(f"  {', '.join(map(str, unavailable_years))}")
    else:
        print("  None")

    # Analysis for years before 2020
    pre_2020_available = [y for y in available_years if y < 2020]
    print(f"\n📊 Years BEFORE 2020 available: {len(pre_2020_available)}")
    if pre_2020_available:
        print(f"  {', '.join(map(str, pre_2020_available))}")
        print("\n✓ SUCCESS: You CAN retrieve data from before 2020!")
    else:
        print("  None found")
        print("\n✗ No data available from before 2020 with current credentials")

    print("\n" + "=" * 60 + "\n")

    return available_years, unavailable_years


def test_specific_year(year):
    """
    Test a specific year and show detailed information.

    Args:
        year: Year to test
    """
    print("=" * 60)
    print(f"Detailed Test for {year}")
    print("=" * 60 + "\n")

    extractor = ESPNDataExtractor()

    try:
        league = extractor.get_league(year)

        if not league:
            print(f"✗ Could not create league object for {year}")
            return False

        print(f"✓ League object created successfully\n")

        # Show league details
        print("League Information:")
        print(f"  Name: {league.settings.name if hasattr(league.settings, 'name') else 'Unknown'}")
        print(f"  Teams: {len(league.teams) if hasattr(league, 'teams') else 0}")

        if hasattr(league.settings, 'reg_season_count'):
            print(f"  Regular season weeks: {league.settings.reg_season_count}")
        if hasattr(league.settings, 'playoff_team_count'):
            print(f"  Playoff teams: {league.settings.playoff_team_count}")

        # Show teams
        if hasattr(league, 'teams') and league.teams:
            print(f"\n  Team List:")
            for team in league.teams[:5]:  # Show first 5 teams
                owner = 'Unknown'
                if hasattr(team, 'owners') and team.owners:
                    if isinstance(team.owners, list) and len(team.owners) > 0:
                        first_owner = team.owners[0]
                        if isinstance(first_owner, dict):
                            owner = first_owner.get('displayName', 'Unknown')

                print(f"    - {team.team_name} (Owner: {owner})")

            if len(league.teams) > 5:
                print(f"    ... and {len(league.teams) - 5} more teams")

        print(f"\n✓ {year} data is fully accessible!")
        return True

    except Exception as e:
        print(f"✗ Error accessing {year}: {e}")
        return False


if __name__ == '__main__':
    # Test range of years to see what's available
    print("\nRunning comprehensive year availability test...\n")
    available, unavailable = test_year_availability(start_year=2007, end_year=2024)

    # If we found years before 2020, show details for the earliest one
    pre_2020 = [y for y in available if y < 2020]
    if pre_2020:
        earliest = min(pre_2020)
        print(f"\nShowing detailed information for earliest available year ({earliest}):\n")
        test_specific_year(earliest)
