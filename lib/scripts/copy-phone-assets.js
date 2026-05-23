const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '..', '..', 'Phone');
const targetDir = path.resolve(__dirname, '..', 'phone');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyRecursive(src, dst) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    ensureDir(dst);
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dst, entry));
    }
    return;
  }

  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function removeDirIfExists(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function main() {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Phone source directory not found: ${sourceDir}`);
  }

  removeDirIfExists(targetDir);
  copyRecursive(sourceDir, targetDir);

  console.log(`Copied UI assets from ${sourceDir} to ${targetDir}`);
}

main();
