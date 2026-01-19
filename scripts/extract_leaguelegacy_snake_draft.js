/**
 * League Legacy Snake Draft Data Extractor
 *
 * Instructions:
 * 1. Log into League Legacy (https://leaguelegacy.io)
 * 2. Navigate to any draft page, e.g.:
 *    https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2007
 * 3. Open Developer Tools (F12 or Cmd+Option+I on Mac)
 * 4. Go to the Console tab
 * 5. Paste this entire script and press Enter
 * 6. Wait for the script to finish (it will fetch years 2007-2011)
 * 7. A JSON file will automatically download
 * 8. Save that file to: data/exports/leaguelegacy_snake_draft.json
 *
 * Note: Snake drafts were used from 2007-2011. This script extracts
 * round number, pick order, player name, and team for each pick.
 */

(async function extractSnakeDraftData() {
  const years = [2007, 2008, 2009, 2010, 2011];
  const allData = {};

  console.log('Starting snake draft data extraction for 2007-2011...');

  for (const year of years) {
    console.log(`\nFetching ${year}...`);

    try {
      // Try the draft API endpoint
      const endpoints = [
        `/api/leagues/valley-natives/seasons/${year}/draft`,
        `/api/leagues/valley-natives/draft?season=${year}`,
        `/leagues/valley-natives/draft/seasons/${year}`,
        `/api/v1/leagues/valley-natives/seasons/${year}/draft`
      ];

      let data = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`  Trying ${endpoint}...`);
          const response = await fetch(endpoint, {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          });

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              data = await response.json();
              console.log(`  Success! Got data from ${endpoint}`);
              break;
            }
          }
        } catch (e) {
          // Try next endpoint
        }
      }

      if (data) {
        allData[year] = data;

        // Log summary
        if (data.picks) {
          console.log(`  Found ${data.picks.length} picks`);
        } else if (data.draft_picks) {
          console.log(`  Found ${data.draft_picks.length} draft_picks`);
        } else if (Array.isArray(data)) {
          console.log(`  Found ${data.length} items in array`);
        } else {
          console.log(`  Data structure:`, Object.keys(data));
        }
      } else {
        console.log(`  Could not fetch data for ${year} from any endpoint`);

        // Try to scrape from the page if we're on it
        console.log(`  Attempting to extract from page DOM...`);

        // Look for draft data in the page
        const draftTable = document.querySelector('[data-draft]') ||
                          document.querySelector('.draft-board') ||
                          document.querySelector('table');

        if (draftTable) {
          console.log(`  Found draft table element`);
        }
      }
    } catch (err) {
      console.error(`  Error fetching ${year}:`, err);
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  // Also try to get the draft board/results widget
  console.log('\nTrying draft results widget...');
  try {
    const widgetResponse = await fetch('/leagues/valley-natives/widgets/league-draft-results', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (widgetResponse.ok) {
      const widgetData = await widgetResponse.json();
      allData['widget_data'] = widgetData;
      console.log('Got widget data:', Object.keys(widgetData));
    }
  } catch (e) {
    console.log('Widget fetch failed');
  }

  // Download the data
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leaguelegacy_snake_draft.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('\n========================================');
  console.log('Done! Check your downloads folder for leaguelegacy_snake_draft.json');
  console.log('========================================');
  console.log('\nFull data:', allData);

  return allData;
})();
