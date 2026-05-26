const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const outputFile = path.join(__dirname, 'phone.js');

const files = fs.readdirSync(srcDir)
    .filter(f => f.endsWith('.js') && f !== 'index.js')
    .sort();

console.log('Bundling phone.js from src for dev/test compatibility...');
let combined = '/**\n * VPhone Combined Dev Source\n */\n\n';

files.forEach((file) => {
    const filePath = path.join(srcDir, file);
    combined += `// File: ${file}\n`;
    combined += fs.readFileSync(filePath, 'utf8') + '\n\n';
});

fs.writeFileSync(outputFile, combined, 'utf8');
console.log(`Bundled ${files.length} files to ${outputFile}`);
