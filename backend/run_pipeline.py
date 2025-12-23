#!/usr/bin/env python3
"""
Complete Pipeline Runner

Runs the complete data pipeline:
1. Extract data from ESPN API
2. Process raw data
3. Generate Excel spreadsheet
"""

import sys
from data_extractor import ESPNDataExtractor
from data_processor import FantasyDataProcessor
from excel_generator import ExcelGenerator


def run_pipeline(start_year=None, end_year=None, force_refresh=False):
    """Run the complete data pipeline"""

    print("\n" + "=" * 60)
    print("  ESPN FANTASY FOOTBALL DATA PIPELINE")
    print("=" * 60 + "\n")

    # Step 1: Extract data
    print("STEP 1: Extracting data from ESPN API...")
    print("-" * 60)
    extractor = ESPNDataExtractor()
    successful, failed = extractor.extract_all_seasons(
        start_year=start_year,
        end_year=end_year,
        force_refresh=force_refresh
    )

    if not successful:
        print("\n❌ No data was extracted. Please check your configuration.")
        print("   See COOKIE_INSTRUCTIONS.md for help setting up authentication.")
        return False

    # Step 2: Process data
    print("\nSTEP 2: Processing data...")
    print("-" * 60)
    processor = FantasyDataProcessor()
    processor.load_raw_data()
    processor.process_all()
    processor.save_processed_data()

    # Step 3: Generate Excel
    print("\nSTEP 3: Generating Excel spreadsheet...")
    print("-" * 60)
    generator = ExcelGenerator()
    output_file = generator.generate()

    print("\n" + "=" * 60)
    print("  ✓ PIPELINE COMPLETE!")
    print("=" * 60)
    print(f"\n📊 Your Excel file is ready:")
    print(f"   {output_file}")
    print(f"\n📁 Data files saved in:")
    print(f"   data/raw/ - Raw ESPN API responses")
    print(f"   data/processed/ - Processed JSON files")
    print(f"   data/exports/ - Excel spreadsheets")
    print("\n")

    return True


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Run the ESPN Fantasy Football data pipeline')
    parser.add_argument('--start-year', type=int, help='First year to extract (default: 2014)')
    parser.add_argument('--end-year', type=int, help='Last year to extract (default: current year)')
    parser.add_argument('--force-refresh', action='store_true', help='Re-fetch data even if cached')

    args = parser.parse_args()

    success = run_pipeline(
        start_year=args.start_year,
        end_year=args.end_year,
        force_refresh=args.force_refresh
    )

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
