const fs = require('fs');

console.log('='.repeat(60));
console.log('DEBUG: Checking Embedded UI Distribution');
console.log('='.repeat(60));

// Check combined file
console.log('\n1. Checking vphone.combined.js...');
const combined = fs.readFileSync('vphone.combined.js', 'utf8');
console.log('   Size:', (combined.length / 1024).toFixed(2), 'KB');
console.log('   Has __VPhoneEmbeddedUI:', combined.includes('__VPhoneEmbeddedUI'));
console.log('   Has data:text/html:', combined.includes('data:text/html;base64,'));

// Check minified file
console.log('\n2. Checking vphone.min.js...');
const minified = fs.readFileSync('vphone.min.js', 'utf8');
console.log('   Size:', (minified.length / 1024).toFixed(2), 'KB');
console.log('   Has data:text/html:', minified.includes('data:text/html;base64,'));
console.log('   Has frame.src:', minified.includes('frame.src'));
console.log('   Has buildIframeUrl:', minified.includes('buildIframeUrl'));

// Count occurrences
const dataURICount = (minified.match(/data:text\/html;base64,/g) || []).length;
console.log('   Data URI occurrences:', dataURICount);

// Check for embedded data presence
if (minified.includes('data:text/html;base64,')) {
  const startIdx = minified.indexOf('data:text/html;base64,');
  const snippet = minified.substring(startIdx, startIdx + 150);
  console.log('   Data URI snippet:', snippet);
}

// Check mounting code
if (minified.includes('Vphone.mount')) {
  console.log('   ✓ Vphone.mount exists');
}

// Check iframe creation
if (minified.includes('createElement') && minified.includes('iframe')) {
  console.log('   ✓ iframe creation code found');
}

console.log('\n' + '='.repeat(60));
console.log('If embedded UI not rendering, check:');
console.log('1. Browser console for errors (F12 > Console)');
console.log('2. Network tab to see iframe request');
console.log('3. Data URI length (should be ~1.2MB before minification)');
console.log('='.repeat(60));

