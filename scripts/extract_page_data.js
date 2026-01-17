/**
 * League Legacy Page Data Extractor - Simple Version
 *
 * Instructions:
 * 1. Log into League Legacy
 * 2. Go to the draft page for a year:
 *    https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2016
 * 3. Wait for the page to fully load (you should see the draft table)
 * 4. Open Developer Tools (F12 or Cmd+Option+I on Mac)
 * 5. Go to Console tab
 * 6. Paste this script and press Enter
 * 7. Copy the output and save it
 *
 * Run this for each year (2007-2018) and save each output.
 */

// Try to find data in common SPA data stores
function extractPageData() {
  const results = {
    year: window.location.pathname.match(/seasons\/(\d+)/)?.[1],
    source: null,
    data: null
  };

  // Method 1: Check for __NEXT_DATA__ (Next.js)
  const nextData = document.getElementById('__NEXT_DATA__');
  if (nextData) {
    results.source = '__NEXT_DATA__';
    results.data = JSON.parse(nextData.textContent);
    console.log('Found Next.js data:', results.data);
  }

  // Method 2: Check for Vue/Nuxt data
  if (window.__NUXT__) {
    results.source = '__NUXT__';
    results.data = window.__NUXT__;
    console.log('Found Nuxt data:', results.data);
  }

  // Method 3: Check for Inertia.js (Laravel + Vue/React)
  if (window.__INERTIA__) {
    results.source = '__INERTIA__';
    results.data = window.__INERTIA__;
    console.log('Found Inertia data:', results.data);
  }

  // Method 4: Check page props (Inertia style)
  const pageEl = document.getElementById('app');
  if (pageEl && pageEl.dataset.page) {
    results.source = 'data-page';
    results.data = JSON.parse(pageEl.dataset.page);
    console.log('Found data-page:', results.data);
  }

  // Method 5: Search all script tags for embedded data
  const scripts = document.querySelectorAll('script');
  scripts.forEach((script, i) => {
    const text = script.textContent;
    if (text.includes('auction_bid_amount') || text.includes('is_keeper')) {
      console.log(`Found relevant data in script tag ${i}:`, text.substring(0, 500));
      results.source = `script_tag_${i}`;

      // Try to extract JSON from the script
      const jsonMatch = text.match(/\{[\s\S]*"auction_bid_amount"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          results.data = JSON.parse(jsonMatch[0]);
        } catch (e) {
          results.data = text;
        }
      }
    }
  });

  // Method 6: Check window for any data objects
  const windowKeys = Object.keys(window).filter(k =>
    !k.startsWith('webkit') &&
    !k.startsWith('on') &&
    typeof window[k] === 'object' &&
    window[k] !== null
  );

  windowKeys.forEach(key => {
    try {
      const val = JSON.stringify(window[key]);
      if (val && (val.includes('auction_bid_amount') || val.includes('is_keeper'))) {
        console.log(`Found data in window.${key}`);
        results.source = `window.${key}`;
        results.data = window[key];
      }
    } catch (e) {}
  });

  // Output results
  console.log('\n=== EXTRACTION RESULTS ===');
  console.log('Year:', results.year);
  console.log('Source:', results.source);
  console.log('Data:', results.data);

  // Copy to clipboard
  if (results.data) {
    const output = JSON.stringify(results, null, 2);
    navigator.clipboard.writeText(output).then(() => {
      console.log('\nData copied to clipboard!');
    }).catch(() => {
      console.log('\nCould not copy to clipboard. Please copy manually from above.');
    });
  }

  return results;
}

extractPageData();
