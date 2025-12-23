# Valley Natives Fantasy Football - Historical Data Explorer

A comprehensive data extraction and visualization tool for ESPN Fantasy Football leagues. Extract your league's complete history, generate detailed Excel spreadsheets, and explore interactive visualizations through a beautiful web interface.

## Features

### 📊 Data Extraction
- **Complete History**: Extract all available seasons from your ESPN Fantasy Football league
- **Comprehensive Data**: Team stats, matchups, standings, playoffs, and head-to-head records
- **Smart Caching**: Raw data cached locally to minimize API calls
- **Owner Tracking**: Properly tracks owners across team name changes

### 📈 Excel Spreadsheet
- **7 Detailed Sheets**:
  - League Overview with championship summary
  - Season-by-season standings
  - Complete matchup history
  - Head-to-head records matrix (grouped by owner)
  - Playoff history and champions
  - League records and milestones
  - All-time team summary statistics

### 🌐 Web Application
- **Interactive Dashboard**: Overview stats and championship visualization
- **Season Browser**: Explore standings year-by-year
- **Matchup Explorer**: Search and filter all games
- **Head-to-Head Analysis**: Compare any two owners' records
- **Team Profiles**: Season-by-season performance charts
- **Playoff History**: Trophy case with championship results
- **Records Page**: League records and statistical milestones

## Prerequisites

- **Python 3.8+**
- **Node.js 16+** and npm
- **ESPN Fantasy Football Account** with access to your league

## Installation

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd natives-fantasy-football
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## Configuration

### Get Your ESPN Cookies

Since your league is private, you need to provide authentication cookies:

1. **Open your browser** and go to https://fantasy.espn.com/football
2. **Log in** to your ESPN account
3. **Open Developer Tools** (F12 or right-click > Inspect)
4. **Go to Application/Storage tab**
5. **Find Cookies** under https://fantasy.espn.com
6. **Copy these two values**:
   - `espn_s2` - A very long string (starts with AE...)
   - `SWID` - Format: `{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}` (include the curly braces!)

### Configure Environment

```bash
cd backend

# Copy template
cp .env.template .env

# Edit .env file and add your values:
# ESPN_LEAGUE_ID=380405  (already set)
# ESPN_S2=<paste your espn_s2 value here>
# ESPN_SWID=<paste your SWID value here with curly braces>
```

**See `backend/COOKIE_INSTRUCTIONS.md` for detailed cookie extraction instructions.**

## Usage

### Run the Complete Pipeline

Extract data, process it, and generate Excel in one command:

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run complete pipeline
python run_pipeline.py

# Optional: Force refresh of existing data
python run_pipeline.py --force-refresh

# Optional: Specify year range
python run_pipeline.py --start-year 2020 --end-year 2024
```

This will:
1. Extract data from ESPN API
2. Process and transform the data
3. Generate Excel spreadsheet in `data/exports/`

### Run Individual Steps

```bash
# Extract only
python data_extractor.py

# Process only (after extraction)
python data_processor.py

# Generate Excel only (after processing)
python excel_generator.py
```

### Start the Web Application

**Terminal 1 - Backend API:**
```bash
cd backend
source venv/bin/activate
python app.py
```
Backend will run at: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run at: http://localhost:5173

Open http://localhost:5173 in your browser to view the web app!

## Project Structure

```
natives-fantasy-football/
├── backend/
│   ├── app.py                    # Flask REST API server
│   ├── data_extractor.py         # ESPN API data extraction
│   ├── data_processor.py         # Data transformation
│   ├── excel_generator.py        # Excel file generation
│   ├── run_pipeline.py           # Complete pipeline runner
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Configuration (not committed)
│   ├── .env.template             # Configuration template
│   └── COOKIE_INSTRUCTIONS.md    # Detailed cookie help
├── frontend/
│   ├── src/
│   │   ├── pages/               # All page components
│   │   ├── services/api.js      # API client
│   │   ├── App.jsx              # Main app with routing
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   └── vite.config.js
├── data/
│   ├── raw/                      # Raw ESPN API responses (cached)
│   ├── processed/                # Processed JSON data
│   └── exports/                  # Generated Excel files
├── .gitignore
└── README.md
```

## API Endpoints

The backend API provides the following endpoints:

- `GET /api/health` - Health check
- `GET /api/metadata` - League metadata
- `GET /api/seasons` - All available seasons
- `GET /api/seasons/{year}` - Specific season data
- `GET /api/teams` - All teams with stats
- `GET /api/teams/{id}` - Specific team details
- `GET /api/matchups` - All matchups
- `GET /api/head-to-head` - All H2H records
- `GET /api/head-to-head/{owner1}/{owner2}` - Specific H2H record
- `GET /api/standings` - All season standings
- `GET /api/playoffs` - All playoff results
- `GET /api/records` - League records
- `GET /api/export/excel` - Download Excel file
- `POST /api/refresh` - Refresh data from ESPN

## Technologies Used

### Backend
- **Python 3** - Core language
- **ESPN API** - Fantasy football data extraction
- **Flask** - REST API server
- **Pandas** - Data manipulation
- **openpyxl** - Excel file generation

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Troubleshooting

### "League does not exist" Error
- Your league ID might be incorrect
- The league may not have existed in those years
- Try a more recent year range

### "Cannot be accessed" Error
- Your ESPN cookies may be expired - get fresh ones
- Make sure you included the curly braces `{}` in the SWID
- Ensure there are no extra spaces in your `.env` file

### Owner Names Showing as "Unknown"
- The data extraction successfully handles the ESPN API's owner structure
- If you see "Unknown", the API may not be returning owner data for that team

### CORS Errors in Browser
- Make sure the backend Flask server is running
- The backend has CORS enabled for all origins

### Frontend Won't Start
- Make sure all npm dependencies are installed: `npm install`
- Delete `node_modules` and `package-lock.json`, then reinstall

## Future Enhancements

Potential features to add:
- Player-level statistics
- Trade history tracking
- Weekly score predictions
- League awards and superlatives
- Email reports
- Mobile app version

## License

This project is for personal use. ESPN data belongs to ESPN.

## Support

For issues or questions:
1. Check `backend/COOKIE_INSTRUCTIONS.md` for authentication help
2. Review error messages in terminal output
3. Ensure both backend and frontend servers are running

---

**Enjoy exploring your fantasy football league history!** 🏈📊
