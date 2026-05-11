#!/usr/bin/env node
/**
 * Run Mobilewright from a SmartTests root with TestChimp env from a chosen MCP JSON
 * (`mcpServers.testchimp.env`: TESTCHIMP_API_KEY, optional TESTCHIMP_BACKEND_URL).
 *
 * Defaults (backward compatible): ios/.cursor/mcp.json + ios/tc-tests + TESTCHIMP_PROJECT_TYPE=ios.
 *
 * Usage:
 *   node scripts/run-mobilewright-with-mcp-env.mjs [args...]   # legacy: args → mobilewright
 *   node scripts/run-mobilewright-with-mcp-env.mjs --mcp-json android/.cursor/mcp.json \
 *     --tests-root android/tests --project-type android -- smoke.quick.spec.js
 */
import { existsSync, readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { dirname, isAbsolute, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

let mcpPath = join(repoRoot, 'ios', '.cursor', 'mcp.json');
let testsRoot = join(repoRoot, 'ios', 'tc-tests');
let projectType = 'ios';

const raw = process.argv.slice(2);
const passthrough = [];
for (let i = 0; i < raw.length; i++) {
  const a = raw[i];
  if (a === '--mcp-json' && raw[i + 1]) {
    const p = raw[++i];
    mcpPath = isAbsolute(p) ? p : resolve(process.cwd(), p);
    continue;
  }
  if (a === '--tests-root' && raw[i + 1]) {
    const p = raw[++i];
    testsRoot = isAbsolute(p) ? p : resolve(process.cwd(), p);
    continue;
  }
  if (a === '--project-type' && raw[i + 1]) {
    projectType = String(raw[++i]).toLowerCase();
    continue;
  }
  if (a === '--') {
    passthrough.push(...raw.slice(i + 1));
    break;
  }
  passthrough.push(a);
}

const env = { ...process.env };

if (existsSync(mcpPath)) {
  try {
    const mcp = JSON.parse(readFileSync(mcpPath, 'utf8'));
    const te = mcp?.mcpServers?.testchimp?.env;
    if (te?.TESTCHIMP_API_KEY) {
      env.TESTCHIMP_API_KEY = String(te.TESTCHIMP_API_KEY).trim();
    }
    if (te?.TESTCHIMP_BACKEND_URL) {
      env.TESTCHIMP_BACKEND_URL = String(te.TESTCHIMP_BACKEND_URL).trim();
    }
  } catch {
    console.warn('[run-mobilewright-with-mcp-env] Could not parse MCP JSON; using process env only.');
  }
} else {
  console.warn(`[run-mobilewright-with-mcp-env] No MCP file at ${mcpPath}; using process env only.`);
}

env.TESTCHIMP_PROJECT_TYPE = env.TESTCHIMP_PROJECT_TYPE || projectType;
env.TESTCHIMP_MOBILE_TEST_MODULE = '@mobilewright/test';

if (!env.TESTCHIMP_BRANCH_NAME) {
  const g = spawnSync('git', ['-C', repoRoot, 'branch', '--show-current'], { encoding: 'utf8' });
  const b = g.stdout?.trim();
  if (b) env.TESTCHIMP_BRANCH_NAME = b;
}

const mwArgs = ['mobilewright', 'test', ...passthrough];

const r = spawnSync('npx', mwArgs, {
  cwd: testsRoot,
  env,
  stdio: 'inherit',
});

process.exit(r.status ?? 1);
