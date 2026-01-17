/**
 * League Legacy Auction Data Extractor
 *
 * Instructions:
 * 1. Log into League Legacy (https://leaguelegacy.io)
 * 2. Navigate to the draft page for any year, e.g.:
 *    https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2016
 * 3. Open Developer Tools (F12 or Cmd+Option+I on Mac)
 * 4. Go to the Console tab
 * 5. Paste this entire script and press Enter
 * 6. Wait for the script to finish (it will fetch all years)
 * 7. A JSON file will automatically download
 * 8. Save that file to: data/exports/leaguelegacy_auction_data.json
 */

(async function extractAuctionData() {
  const years = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];
  const allData = {};

  console.log('Starting auction data extraction...');

  for (const year of years) {
    console.log(`Fetching ${year}...`);

    try {
      // Navigate to the page and wait for data to load
      const url = `https://leaguelegacy.io/leagues/valley-natives/draft/seasons/${year}`;

      // Try to fetch the API endpoint directly
      const response = await fetch(`/api/leagues/valley-natives/seasons/${year}/draft`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.ok) {
        const data = await response.json();
        allData[year] = data;
        console.log(`  Got ${year} data:`, data);
      } else {
        console.log(`  Failed to fetch ${year}: ${response.status}`);

        // Try alternative endpoint
        const altResponse = await fetch(`/api/leagues/valley-natives/draft?season=${year}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (altResponse.ok) {
          const data = await altResponse.json();
          allData[year] = data;
          console.log(`  Got ${year} data (alt):`, data);
        }
      }
    } catch (err) {
      console.error(`  Error fetching ${year}:`, err);
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 500));
  }

  // Download the data
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leaguelegacy_auction_data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('Done! Check your downloads folder for leaguelegacy_auction_data.json');
  console.log('Full data:', allData);

  return allData;
})();
