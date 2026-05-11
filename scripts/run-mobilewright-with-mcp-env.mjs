#!/usr/bin/env node
/**
 * Run Mobilewright from `ios/tc-tests/` with TestChimp env merged from repo `.cursor/mcp.json`
 * (same `testchimp` server block as Cursor MCP: API key + backend URL for staging).
 *
 * Usage (from repo root or `ios/tc-tests` via npm scripts):
 *   node scripts/run-mobilewright-with-mcp-env.mjs [args...passed to `npx mobilewright test`...]
 *
 * Examples:
 *   node scripts/run-mobilewright-with-mcp-env.mjs
 *   node scripts/run-mobilewright-with-mcp-env.mjs smoke.quick.spec.js
 *   node scripts/run-mobilewright-with-mcp-env.mjs order-flow.spec.js --reporter=list
 */
import { existsSync, readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const tcTestsRoot = join(repoRoot, 'ios', 'tc-tests');
const mcpPath = join(repoRoot, '.cursor', 'mcp.json');

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
    console.warn('[run-mobilewright-with-mcp-env] Could not parse .cursor/mcp.json; using process env only.');
  }
} else {
  console.warn('[run-mobilewright-with-mcp-env] No .cursor/mcp.json; using process env only (set TESTCHIMP_* in CI).');
}

env.TESTCHIMP_PROJECT_TYPE = env.TESTCHIMP_PROJECT_TYPE || 'ios';
// @testchimp/playwright defaults to requiring `mobilewright`, but that package does not export
// Playwright's `test` — only `@mobilewright/test` does. Their runtime reads
// TESTCHIMP_MOBILE_TEST_MODULE (see node_modules/@testchimp/playwright/dist/project-type.js).
// Set here so callers never need to remember it.
env.TESTCHIMP_MOBILE_TEST_MODULE = '@mobilewright/test';

if (!env.TESTCHIMP_BRANCH_NAME) {
  const g = spawnSync('git', ['-C', repoRoot, 'branch', '--show-current'], { encoding: 'utf8' });
  const b = g.stdout?.trim();
  if (b) env.TESTCHIMP_BRANCH_NAME = b;
}

const passthrough = process.argv.slice(2);
const mwArgs = ['mobilewright', 'test', ...passthrough];

const r = spawnSync('npx', mwArgs, {
  cwd: tcTestsRoot,
  env,
  stdio: 'inherit',
});

process.exit(r.status ?? 1);
