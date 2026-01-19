/**
 * League Legacy Embedded Data Extractor
 *
 * This script extracts the embedded JSON data from the page.
 *
 * Instructions:
 * 1. Go to: https://leaguelegacy.io/leagues/valley-natives/draft/seasons/2007
 * 2. Open DevTools (F12) → Console tab
 * 3. Paste this script and press Enter
 * 4. Repeat for each year (2007, 2008, 2009, 2010, 2011)
 */

(function extractEmbeddedData() {
  console.log('Extracting embedded data from page...');

  // Get the entire page HTML
  const html = document.documentElement.innerHTML;

  // Method 1: Look for data in data-page attribute (common in Inertia.js/Laravel apps)
  const dataPageMatch = html.match(/data-page="([^"]+)"/);
  if (dataPageMatch) {
    console.log('Found data-page attribute');
    try {
      // Unescape the HTML entities
      const unescaped = dataPageMatch[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#039;/g, "'");

      const data = JSON.parse(unescaped);
      console.log('Parsed data-page:', data);

      // Look for draft picks in the data
      const findDraftPicks = (obj, path = '') => {
        if (!obj || typeof obj !== 'object') return null;

        // Check common keys
        if (obj.draft_picks) {
          console.log(`Found draft_picks at ${path}`);
          return obj.draft_picks;
        }
        if (obj.picks) {
          console.log(`Found picks at ${path}`);
          return obj.picks;
        }
        if (obj.draft && obj.draft.picks) {
          console.log(`Found draft.picks at ${path}`);
          return obj.draft.picks;
        }

        // Recurse into nested objects
        for (const key of Object.keys(obj)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const result = findDraftPicks(obj[key], `${path}.${key}`);
            if (result) return result;
          }
        }
        return null;
      };

      const draftPicks = findDraftPicks(data);

      if (draftPicks) {
        console.log(`\nFound ${draftPicks.length} draft picks!`);
        console.log('Sample pick:', draftPicks[0]);

        // Download the draft picks
        const blob = new Blob([JSON.stringify(draftPicks, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `draft_picks_${data.props?.season?.season || 'unknown'}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return draftPicks;
      }

      // If no draft picks found, download full data for inspection
      console.log('\nNo draft_picks found directly. Downloading full data for inspection...');
      console.log('Top-level keys:', Object.keys(data));
      if (data.props) console.log('Props keys:', Object.keys(data.props));

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leaguelegacy_full_page_data.json';
      a.click();
      URL.revokeObjectURL(url);

      return data;
    } catch (e) {
      console.error('Failed to parse data-page:', e);
    }
  }

  // Method 2: Look for __NUXT__ or __INITIAL_STATE__ or similar
  const statePatterns = [
    /window\.__NUXT__\s*=\s*(\{[\s\S]*?\});/,
    /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
    /__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\});/,
  ];

  for (const pattern of statePatterns) {
    const match = html.match(pattern);
    if (match) {
      console.log('Found state pattern');
      try {
        const data = JSON.parse(match[1]);
        console.log('State data:', data);
        return data;
      } catch (e) {}
    }
  }

  // Method 3: Find any large JSON blob with draft-related content
  const jsonPattern = /\{[^{}]*"draft_picks"[^{}]*\}/g;
  const matches = html.match(jsonPattern);
  if (matches) {
    console.log(`Found ${matches.length} potential draft JSON blobs`);
  }

  // Method 4: Look for escaped JSON (like what you showed)
  const escapedJsonPattern = /\{(?:\\&quot;|&quot;)[^}]+(?:\\&quot;|&quot;):\s*(?:\\&quot;|&quot;)[^}]+\}/g;
  const escapedMatches = html.match(escapedJsonPattern);
  if (escapedMatches) {
    console.log(`Found ${escapedMatches.length} escaped JSON segments`);
  }

  console.log('\nCould not automatically extract. Please check the downloaded file or share more of the HTML structure.');
})();
