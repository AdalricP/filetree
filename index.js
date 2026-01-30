#!/usr/bin/env node

import { watch } from 'chokidar';
import { readdirSync, statSync, readlinkSync, existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';

const RED = '\x1b[31m';
const RESET = '\x1b[0m';

const ERROR_LOG = `${homedir()}/.filetree-errors`;
let erroredFiles = new Set();

function loadErrors() {
  if (!existsSync(ERROR_LOG)) return;
  try {
    const content = readFileSync(ERROR_LOG, 'utf-8');
    erroredFiles = new Set(content.trim().split('\n').filter(Boolean));
  } catch {
    erroredFiles = new Set();
  }
}

function getStartDir() {
  const argDir = process.argv[2];
  if (argDir) return argDir;

  try {
    process.cwd();  // check if cwd exists
    return '.';
  } catch {
    return homedir();  // fallback to home
  }
}

function buildTree(dir, baseDir = dir, prefix = '', result = []) {
  let items;
  try {
    items = readdirSync(dir);
  } catch (err) {
    result.push(`${prefix}[ERROR reading directory: ${err.message}]`);
    return result;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item === 'node_modules') continue;
    if (item === '.git') continue;

    const fullPath = join(dir, item);
    const hasError = erroredFiles.has(fullPath);

    let stat;
    let sysError = null;

    try {
      stat = statSync(fullPath);
    } catch (err) {
      try {
        readlinkSync(fullPath);
        sysError = 'broken symlink';
      } catch {
        sysError = err.message;
      }
      stat = null;
    }

    const isLast = i === items.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const indicator = stat?.isDirectory() ? '+' : '-';

    let line = prefix + connector;
    line += `${indicator} `;

    if (hasError || sysError) {
      line += `${RED}${item}`;
      if (sysError) line += ` [${sysError}]`;
      line += RESET;
    } else {
      line += item;
    }

    result.push(line);

    if (stat?.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      buildTree(fullPath, baseDir, newPrefix, result);
    }
  }

  return result;
}

function renderTree() {
  console.clear();
  const startDir = getStartDir();
  const absPath = resolve(startDir);

  console.log(absPath);
  console.log();

  try {
    const tree = buildTree(absPath);
    if (tree.length === 0) {
      console.log('(empty)');
    } else {
      tree.forEach(line => console.log(line));
    }
  } catch (err) {
    console.log(`${RED}Error: ${err.message}${RESET}`);
  }
}

loadErrors();
renderTree();

const startDir = getStartDir();
const absPath = resolve(startDir);

const watcher = watch(absPath, {
  persistent: true,
  ignoreInitial: true,
});

watcher
  .on('add', () => renderTree())
  .on('change', () => renderTree())
  .on('unlink', () => renderTree())
  .on('addDir', () => renderTree())
  .on('unlinkDir', () => renderTree())
  .on('error', error => console.error(`Watcher error: ${error}`));

const errorWatcher = watch(ERROR_LOG, {
  persistent: true,
  ignoreInitial: true,
});

errorWatcher.on('change', () => {
  loadErrors();
  renderTree();
}).on('error', () => {});
