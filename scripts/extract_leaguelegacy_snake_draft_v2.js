/**
 * League Legacy Snake Draft Board Scraper (Version 2)
 *
 * This version scrapes the draft board directly from the page.
 *
 * Instructions:
 * 1. Log into League Legacy (https://leaguelegacy.io)
 * 2. Navigate to a specific year's draft page:
 *    https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2007
 * 3. Make sure the draft board/results are visible on the page
 * 4. Open Developer Tools (F12 or Cmd+Option+I on Mac)
 * 5. Go to the Console tab
 * 6. Paste this entire script and press Enter
 * 7. The script will extract data from the current page
 * 8. REPEAT for each year (2007, 2008, 2009, 2010, 2011)
 * 9. Copy the JSON output and save to a file
 *
 * Run this on each draft page separately:
 * - https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2007
 * - https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2008
 * - https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2009
 * - https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2010
 * - https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2011
 */

(function extractDraftFromPage() {
  console.log('Extracting draft data from current page...');

  // Get the year from the URL
  const urlMatch = window.location.pathname.match(/seasons\/(\d{4})/);
  const year = urlMatch ? parseInt(urlMatch[1]) : 'unknown';
  console.log(`Detected year: ${year}`);

  const picks = [];

  // Method 1: Look for Vue/React data
  const appElement = document.getElementById('app') || document.querySelector('[data-v-app]');
  if (appElement && appElement.__vue__) {
    console.log('Found Vue app, checking for data...');
    try {
      const vueData = appElement.__vue__.$data || appElement.__vue__.data;
      console.log('Vue data:', vueData);
    } catch (e) {}
  }

  // Method 2: Look for draft picks in any data attributes
  document.querySelectorAll('[data-pick], [data-player], [data-round]').forEach(el => {
    picks.push({
      pick: el.dataset.pick,
      player: el.dataset.player,
      round: el.dataset.round,
      text: el.textContent.trim()
    });
  });

  // Method 3: Parse table structure
  document.querySelectorAll('table').forEach((table, tableIdx) => {
    console.log(`Found table ${tableIdx}:`, table.className);

    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    console.log('  Headers:', headers);

    table.querySelectorAll('tbody tr').forEach((row, rowIdx) => {
      const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
      if (cells.length > 0) {
        picks.push({
          table: tableIdx,
          row: rowIdx,
          cells: cells
        });
      }
    });
  });

  // Method 4: Look for draft board grid
  document.querySelectorAll('.draft-board, .draft-grid, .draft-results, [class*="draft"]').forEach(el => {
    console.log('Found draft element:', el.className);
    console.log('  Inner HTML preview:', el.innerHTML.substring(0, 500));
  });

  // Method 5: Look for pick cards/items
  document.querySelectorAll('[class*="pick"], [class*="player"], [class*="draft-item"]').forEach(el => {
    const text = el.textContent.trim();
    if (text && text.length < 200) {
      picks.push({
        type: 'card',
        class: el.className,
        text: text
      });
    }
  });

  // Method 6: Check for chart.js or similar charting data
  if (window.Chart) {
    console.log('Chart.js detected, checking for chart instances...');
    Object.values(Chart.instances || {}).forEach(chart => {
      console.log('Chart data:', chart.data);
    });
  }

  // Method 7: Look in window/global scope for data
  const globalVars = ['draftData', 'draft', 'picks', 'draftPicks', 'leagueData', 'seasonData'];
  globalVars.forEach(v => {
    if (window[v]) {
      console.log(`Found window.${v}:`, window[v]);
    }
  });

  // Method 8: Check localStorage/sessionStorage
  console.log('\nChecking storage...');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('draft') || key.includes('pick') || key.includes('league')) {
      console.log(`localStorage[${key}]:`, localStorage.getItem(key)?.substring(0, 200));
    }
  }

  // Method 9: Look for any JSON in script tags
  document.querySelectorAll('script:not([src])').forEach((script, idx) => {
    const content = script.textContent;
    if (content.includes('draft') || content.includes('pick')) {
      console.log(`Script ${idx} contains draft-related content`);
      // Try to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*"draft"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('Found JSON data:', parsed);
        } catch (e) {}
      }
    }
  });

  const result = {
    year: year,
    url: window.location.href,
    picks: picks,
    extractedAt: new Date().toISOString()
  };

  console.log('\n========================================');
  console.log('EXTRACTION RESULT:');
  console.log('========================================');
  console.log(JSON.stringify(result, null, 2));

  // Copy to clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      .then(() => console.log('\nResult copied to clipboard!'))
      .catch(() => console.log('\nCould not copy to clipboard'));
  }

  return result;
})();
