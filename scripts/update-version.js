#!/usr/bin/env node

// Script to update version numbers across the PWA
// Usage: node scripts/update-version.js <new-version>
// Example: node scripts/update-version.js 1.2.0

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Please provide a version number');
  console.error('Usage: node scripts/update-version.js <new-version>');
  console.error('Example: node scripts/update-version.js 1.2.0');
  process.exit(1);
}

// Validate version format (x.y.z)
const versionRegex = /^\d+\.\d+\.\d+$/;
if (!versionRegex.test(newVersion)) {
  console.error('Invalid version format. Please use x.y.z format (e.g., 1.2.0)');
  process.exit(1);
}

console.log(`Updating version to ${newVersion}...`);

// Files to update
const filesToUpdate = [
  {
    path: 'public/sw.js',
    patterns: [
      { regex: /const CACHE_NAME = 'baddercalc-v[^']+';/, replacement: `const CACHE_NAME = 'baddercalc-v${newVersion}';` },
      { regex: /\/\/ Version: [^-\n]+/, replacement: `// Version: ${newVersion} - Added update detection and cache management` }
    ]
  },
  {
    path: 'public/manifest.json',
    patterns: [
      { regex: /"version": "[^"]+"/, replacement: `"version": "${newVersion}"` }
    ]
  },
  {
    path: 'src/utils/version.js',
    patterns: [
      { regex: /export const APP_VERSION = '[^']+';/, replacement: `export const APP_VERSION = '${newVersion}';` }
    ]
  }
];

// Update each file
filesToUpdate.forEach(fileInfo => {
  const filePath = path.join(path.dirname(__dirname), fileInfo.path);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File ${filePath} not found, skipping...`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  fileInfo.patterns.forEach(pattern => {
    if (pattern.regex.test(content)) {
      content = content.replace(pattern.regex, pattern.replacement);
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated ${fileInfo.path}`);
  } else {
    console.warn(`⚠ No patterns found in ${fileInfo.path}`);
  }
});

console.log('\nVersion update complete!');
console.log('\nNext steps:');
console.log('1. Commit your changes');
console.log('2. Deploy to your hosting platform');
console.log('3. Users will see update notifications when they next visit the app'); 