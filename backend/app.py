"""
Flask REST API for Fantasy Football Data

Provides endpoints to access processed fantasy football league data.
"""

import json
from pathlib import Path
from flask import Flask, jsonify, send_file
from flask_cors import CORS
from data_processor import FantasyDataProcessor
from excel_generator import ExcelGenerator

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

BASE_DIR = Path(__file__).parent.parent
PROCESSED_DATA_DIR = BASE_DIR / 'data' / 'processed'
EXPORTS_DIR = BASE_DIR / 'data' / 'exports'


def load_json_file(filename):
    """Load a JSON file from the processed data directory"""
    file_path = PROCESSED_DATA_DIR / filename
    if not file_path.exists():
        return None

    with open(file_path, 'r') as f:
        return json.load(f)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'API is running'})


@app.route('/api/metadata', methods=['GET'])
def get_metadata():
    """Get league metadata"""
    data = load_json_file('metadata.json')
    if data is None:
        return jsonify({'error': 'Metadata not found'}), 404
    return jsonify(data)


@app.route('/api/seasons', methods=['GET'])
def get_seasons():
    """Get list of all available seasons"""
    metadata = load_json_file('metadata.json')
    if metadata is None:
        return jsonify({'error': 'Metadata not found'}), 404

    return jsonify({
        'years': metadata.get('years', []),
        'first_season': metadata.get('first_season'),
        'latest_season': metadata.get('latest_season'),
        'total_seasons': metadata.get('total_seasons', 0)
    })


@app.route('/api/seasons/<int:year>', methods=['GET'])
def get_season(year):
    """Get data for a specific season"""
    standings = load_json_file('standings.json')
    matchups = load_json_file('matchups.json')
    playoffs = load_json_file('playoffs.json')

    if not all([standings, matchups, playoffs]):
        return jsonify({'error': 'Data not found'}), 404

    # Filter data for the specified year
    season_standings = [s for s in standings if s['year'] == year]
    season_matchups = [m for m in matchups if m['year'] == year]
    season_playoff = next((p for p in playoffs if p['year'] == year), None)

    return jsonify({
        'year': year,
        'standings': season_standings,
        'matchups': season_matchups,
        'playoffs': season_playoff
    })


@app.route('/api/teams', methods=['GET'])
def get_teams():
    """Get all teams with their all-time stats"""
    teams = load_json_file('teams.json')
    if teams is None:
        return jsonify({'error': 'Teams not found'}), 404

    # Convert dict to list for easier frontend consumption
    teams_list = [
        {
            'team_id': team_id,
            **team_data
        }
        for team_id, team_data in teams.items()
    ]

    return jsonify(teams_list)


@app.route('/api/teams/<int:team_id>', methods=['GET'])
def get_team(team_id):
    """Get specific team details"""
    teams = load_json_file('teams.json')
    if teams is None:
        return jsonify({'error': 'Teams not found'}), 404

    team_data = teams.get(str(team_id))
    if team_data is None:
        return jsonify({'error': 'Team not found'}), 404

    return jsonify({
        'team_id': team_id,
        **team_data
    })


@app.route('/api/matchups', methods=['GET'])
def get_matchups():
    """Get all matchups"""
    matchups = load_json_file('matchups.json')
    if matchups is None:
        return jsonify({'error': 'Matchups not found'}), 404

    return jsonify(matchups)


@app.route('/api/matchups/team/<team_name>', methods=['GET'])
def get_team_matchups(team_name):
    """Get all matchups for a specific team"""
    matchups = load_json_file('matchups.json')
    if matchups is None:
        return jsonify({'error': 'Matchups not found'}), 404

    team_matchups = [
        m for m in matchups
        if m['home_team'] == team_name or m['away_team'] == team_name
    ]

    return jsonify(team_matchups)


@app.route('/api/head-to-head', methods=['GET'])
def get_all_head_to_head():
    """Get all head-to-head records"""
    h2h = load_json_file('head_to_head.json')
    if h2h is None:
        return jsonify({'error': 'Head-to-head data not found'}), 404

    return jsonify(h2h)


@app.route('/api/head-to-head/<team1>/<team2>', methods=['GET'])
def get_head_to_head(team1, team2):
    """Get head-to-head record between two teams"""
    h2h = load_json_file('head_to_head.json')
    matchups = load_json_file('matchups.json')

    if not all([h2h, matchups]):
        return jsonify({'error': 'Data not found'}), 404

    # Get record
    record = h2h.get(team1, {}).get(team2, {'wins': 0, 'losses': 0, 'ties': 0, 'points_for': 0, 'points_against': 0})

    # Get all matchups between these teams
    team_matchups = [
        m for m in matchups
        if (m['home_team'] == team1 and m['away_team'] == team2) or
           (m['home_team'] == team2 and m['away_team'] == team1)
    ]

    return jsonify({
        'team1': team1,
        'team2': team2,
        'record': record,
        'matchups': team_matchups
    })


@app.route('/api/standings', methods=['GET'])
def get_all_standings():
    """Get standings for all seasons"""
    standings = load_json_file('standings.json')
    if standings is None:
        return jsonify({'error': 'Standings not found'}), 404

    return jsonify(standings)


@app.route('/api/standings/<int:year>', methods=['GET'])
def get_standings(year):
    """Get standings for a specific season"""
    standings = load_json_file('standings.json')
    if standings is None:
        return jsonify({'error': 'Standings not found'}), 404

    season_standings = [s for s in standings if s['year'] == year]
    return jsonify(season_standings)


@app.route('/api/playoffs', methods=['GET'])
def get_all_playoffs():
    """Get playoff results for all seasons"""
    playoffs = load_json_file('playoffs.json')
    if playoffs is None:
        return jsonify({'error': 'Playoffs not found'}), 404

    return jsonify(playoffs)


@app.route('/api/playoffs/<int:year>', methods=['GET'])
def get_playoffs(year):
    """Get playoff results for a specific season"""
    playoffs = load_json_file('playoffs.json')
    if playoffs is None:
        return jsonify({'error': 'Playoffs not found'}), 404

    season_playoff = next((p for p in playoffs if p['year'] == year), None)
    if season_playoff is None:
        return jsonify({'error': 'Playoff data not found for this year'}), 404

    return jsonify(season_playoff)


@app.route('/api/records', methods=['GET'])
def get_records():
    """Get all league records and milestones"""
    records = load_json_file('records.json')
    if records is None:
        return jsonify({'error': 'Records not found'}), 404

    return jsonify(records)


@app.route('/api/export/excel', methods=['GET'])
def export_excel():
    """Generate and download Excel file"""
    try:
        generator = ExcelGenerator()
        output_file = generator.generate()

        return send_file(
            output_file,
            as_attachment=True,
            download_name='fantasy_football_history.xlsx',
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/refresh', methods=['POST'])
def refresh_data():
    """Re-extract and process data from ESPN API"""
    try:
        from data_extractor import ESPNDataExtractor

        # Extract new data
        extractor = ESPNDataExtractor()
        successful, failed = extractor.extract_all_seasons(force_refresh=True)

        if not successful:
            return jsonify({'error': 'Failed to extract data'}), 500

        # Process data
        processor = FantasyDataProcessor()
        processor.load_raw_data()
        processor.process_all()
        processor.save_processed_data()

        return jsonify({
            'success': True,
            'message': f'Data refreshed for {len(successful)} seasons',
            'seasons_updated': successful,
            'seasons_failed': failed
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Check if processed data exists
    if not (PROCESSED_DATA_DIR / 'complete_data.json').exists():
        print("\n⚠️  WARNING: Processed data not found!")
        print("Run 'python run_pipeline.py' first to extract and process data.\n")

    print("\n" + "=" * 60)
    print("  Fantasy Football API Server")
    print("=" * 60)
    print("\n🚀 Starting server at http://localhost:5000")
    print("\n📡 Available endpoints:")
    print("   GET  /api/health")
    print("   GET  /api/metadata")
    print("   GET  /api/seasons")
    print("   GET  /api/seasons/<year>")
    print("   GET  /api/teams")
    print("   GET  /api/teams/<team_id>")
    print("   GET  /api/matchups")
    print("   GET  /api/matchups/team/<team_name>")
    print("   GET  /api/head-to-head")
    print("   GET  /api/head-to-head/<team1>/<team2>")
    print("   GET  /api/standings")
    print("   GET  /api/standings/<year>")
    print("   GET  /api/playoffs")
    print("   GET  /api/playoffs/<year>")
    print("   GET  /api/records")
    print("   GET  /api/export/excel")
    print("   POST /api/refresh")
    print("\n" + "=" * 60 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5000)
