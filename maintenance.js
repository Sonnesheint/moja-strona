#!/usr/bin/env node
'use strict';

const PUBLISH_DIR = '.';

// ─── internals ───────────────────────────────────────────────────────────────

const path = require('path');
const fs   = require('fs');
const { execSync } = require('child_process');

const REDIRECTS_FILE = path.join(PUBLISH_DIR, '_redirects');
const MARKER = '# maintenance-mode';
const RULE   = `/* /maintenance.html 200  ${MARKER}`;

const [,, command, ...flags] = process.argv;
const withPush = flags.includes('--push');

function readFile() {
  try { return fs.readFileSync(REDIRECTS_FILE, 'utf8'); }
  catch { return ''; }
}

function writeFile(content) {
  fs.writeFileSync(REDIRECTS_FILE, content, 'utf8');
}

function isOn() {
  return readFile().includes(MARKER);
}

function gitPush(message) {
  execSync(`git add "${REDIRECTS_FILE}"`, { stdio: 'inherit' });
  execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
}

// ─── commands ─────────────────────────────────────────────────────────────────

switch (command) {
  case 'on': {
    if (isOn()) {
      console.log('ℹ  Maintenance mode is already ON.');
      break;
    }
    const existing = readFile();
    const updated  = (existing ? existing.trimEnd() + '\n' : '') + RULE + '\n';
    writeFile(updated);
    console.log('✅ Maintenance mode ON  →  _redirects updated.');
    if (withPush) gitPush('chore: enable maintenance mode');
    break;
  }

  case 'off': {
    if (!isOn()) {
      console.log('ℹ  Maintenance mode is already OFF.');
      break;
    }
    const lines   = readFile().split('\n').filter(l => !l.includes(MARKER));
    const updated = lines.join('\n').trimEnd();
    writeFile(updated ? updated + '\n' : '');
    console.log('✅ Maintenance mode OFF  →  redirect rule removed.');
    if (withPush) gitPush('chore: disable maintenance mode');
    break;
  }

  case 'status': {
    const on = isOn();
    console.log(`Maintenance mode: ${on ? '🔴 ON' : '🟢 OFF'}`);
    console.log(`_redirects file:  ${fs.existsSync(REDIRECTS_FILE) ? REDIRECTS_FILE : '(does not exist yet)'}`);
    break;
  }

  default:
    console.log('Usage: node maintenance.js [on|off|status] [--push]');
    console.log('');
    console.log('  on      Add redirect rule → all traffic goes to maintenance.html');
    console.log('  off     Remove the redirect rule → site is live again');
    console.log('  status  Show current state');
    console.log('  --push  After changing state: git add + commit + push automatically');
}
