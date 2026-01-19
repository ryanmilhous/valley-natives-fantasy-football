/**
 * Simple League Legacy Data Extractor
 *
 * Just paste this in the console on any League Legacy draft page.
 */

(function() {
  // Find the element with data-page attribute
  const el = document.querySelector('[data-page]');

  if (!el) {
    console.log('No data-page element found');
    return;
  }

  // Get and parse the data
  const raw = el.getAttribute('data-page');
  const data = JSON.parse(raw);

  console.log('Full data structure:', data);
  console.log('Props keys:', Object.keys(data.props || {}));

  // Try to find draft picks
  if (data.props) {
    console.log('\n=== PROPS ===');
    for (const [key, value] of Object.entries(data.props)) {
      if (Array.isArray(value)) {
        console.log(`${key}: Array with ${value.length} items`);
        if (value.length > 0) console.log('  Sample:', value[0]);
      } else if (typeof value === 'object' && value !== null) {
        console.log(`${key}: Object with keys:`, Object.keys(value));
      } else {
        console.log(`${key}:`, value);
      }
    }
  }

  // Download full data
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leaguelegacy_page_data.json';
  a.click();

  console.log('\n✓ Downloaded leaguelegacy_page_data.json');
  return data;
})();
