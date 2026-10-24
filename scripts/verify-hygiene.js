// scripts/verify-hygiene.js
// Automated verification for ScopeSnap repository hygiene standards
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let errorsCount = 0;

// 1. Check for Em Dash (U+2014) across codebase
console.log('[1/4] Checking for zero em dashes (U+2014)...');
const emDashRegex = /\u2014/;
const codeDirs = ['app', 'components', 'lib', 'tests', 'public', 'scripts', '.agents'];
const rootFiles = ['README.md', 'LAUNCH_PLAYBOOK.md', 'package.json', 'tsconfig.json', 'tailwind.config.ts', 'next.config.mjs', 'postcss.config.js'];

function scanDir(dirPath, checkFn) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        scanDir(fullPath, checkFn);
      }
    } else {
      checkFn(fullPath);
    }
  }
}

function checkEmDash(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (emDashRegex.test(line)) {
      console.error(`FAIL [Em Dash]: ${filePath}:${index + 1} contains U+2014`);
      errorsCount++;
    }
  });
}

codeDirs.forEach(dir => scanDir(dir, checkEmDash));
rootFiles.forEach(file => { if (fs.existsSync(file)) checkEmDash(file); });

// 2. Check for Forbidden AI Gradients
console.log('[2/4] Checking for forbidden purple/indigo gradients...');
const bannedGradientRegex = /(from|to|via)-(purple|indigo|violet)|bg-(purple|indigo|violet)/i;

function checkGradients(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx') && !filePath.endsWith('.css')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (bannedGradientRegex.test(line)) {
      console.error(`FAIL [Forbidden Gradient]: ${filePath}:${index + 1} contains banned gradient class`);
      errorsCount++;
    }
  });
}

scanDir('app', checkGradients);
scanDir('components', checkGradients);

// 3. Check for Emojis in UI components
console.log('[3/4] Checking for emojis in UI components...');
const emojiRegex = /\p{Extended_Pictographic}/u;

function checkEmojis(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (emojiRegex.test(line)) {
      console.error(`FAIL [Emoji in UI]: ${filePath}:${index + 1} contains emoji glyph`);
      errorsCount++;
    }
  });
}

scanDir('app', checkEmojis);
scanDir('components', checkEmojis);

// 4. Check for Leaked API Key in git tracked files
console.log('[4/4] Checking for leaked secrets in git tracked files...');
try {
  const secretPrefix = ['gsk', 'IC9d'].join('_');
  const trackedMatches = execSync(`git grep -n "${secretPrefix}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  if (trackedMatches.trim()) {
    console.error('FAIL [Secret Leak]: Live Groq API key found in tracked git files:');
    console.error(trackedMatches);
    errorsCount++;
  }
} catch (e) {
  // Exit code 1 means zero matches found, which is PASS
}

// Summary Report
console.log('\n----------------------------------------');
if (errorsCount > 0) {
  console.error(`Hygiene verification FAILED with ${errorsCount} violation(s).`);
  process.exit(1);
} else {
  console.log('Hygiene verification PASSED with 0 violations.');
  process.exit(0);
}
