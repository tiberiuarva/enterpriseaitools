#!/bin/bash
set -e

echo "=== Claude Code environment diagnostic ==="
echo "Date: $(date)"
echo ""

# 1. Confirm basic tooling
echo "--- Tooling check ---"
node --version || echo "FAIL: node not available"
npm --version || echo "FAIL: npm not available"
git --version || echo "FAIL: git not available"
gh --version || echo "FAIL: gh CLI not available — needed for PR creation"
curl --version | head -1 || echo "FAIL: curl not available"
jq --version || echo "WARN: jq not available — install if needed"
echo ""

# 2. Confirm repo access
echo "--- Repo state ---"
if [ -d ".git" ]; then
  echo "OK: in a git repo"
  git remote -v
  git status --short
else
  echo "FAIL: not in a git repo"
fi
echo ""

# 3. Confirm GitHub auth
echo "--- GitHub auth ---"
gh auth status 2>&1 || echo "FAIL: gh not authenticated"
echo ""

# 4. Check for Playwright / Chromium feasibility
echo "--- Browser automation feasibility ---"
which chromium 2>/dev/null && echo "OK: chromium already installed"
which google-chrome 2>/dev/null && echo "OK: chrome already installed"
ls ~/.cache/ms-playwright/ 2>/dev/null && echo "OK: playwright cache exists" || echo "INFO: playwright not yet installed"
echo ""

# 5. Install project dependencies (normal repo setup)
echo "--- Installing project dependencies ---"
if [ -f "package.json" ]; then
  npm ci || npm install
  echo "OK: npm install complete"
else
  echo "INFO: no package.json found"
fi
echo ""

# 6. Try installing Playwright with system Chromium
echo "--- Testing Playwright install ---"
npm install --save-dev playwright 2>&1 | tail -5 || echo "FAIL: playwright install failed"
npx playwright install --with-deps chromium 2>&1 | tail -10 || echo "WARN: playwright browser install may have failed"
echo ""

# 7. Sanity test Playwright actually works
echo "--- Smoke testing Playwright ---"
cat > /tmp/playwright-test.mjs << 'EOF'
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://example.com', { timeout: 30000 });
const title = await page.title();
console.log('Page title:', title);
await browser.close();
EOF
node /tmp/playwright-test.mjs 2>&1 || echo "FAIL: playwright smoke test failed"
echo ""

echo "=== Diagnostic complete ==="
