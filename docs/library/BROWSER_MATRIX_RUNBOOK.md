# Browser Matrix Runbook (AGENTS Verification)

Date: 2026-05-25

## Goal

Produce verifiable evidence for required browser matrix:

- Chrome
- Edge
- Firefox
- Mobile browser (if available)

for `src/ui/harness.html` and main runtime `src/ui/index.html`.

## Preconditions

1. Local server is running for `Phone/` (example: `http://127.0.0.1:9011/`).
2. Harness page works in current environment:
   - `http://127.0.0.1:9011/src/ui/harness.html`
3. Browser binaries are executable in the environment (no `EPERM`/permission block).

## Automated Matrix Command

Use:

```powershell
node scripts/browser-matrix-harness.cjs
```

Optional env vars:

```powershell
$env:HARNESS_URL="http://127.0.0.1:9011/src/ui/harness.html"
$env:MATRIX_ITERATIONS="10"
node scripts/browser-matrix-harness.cjs
```

Artifacts:

- `.tmp/browser-matrix/results.json`
- `.tmp/browser-matrix/chrome-dom.html`
- `.tmp/browser-matrix/edge-dom.html`
- `.tmp/browser-matrix/firefox-dom.html`
- `.tmp/browser-matrix/*-stderr.log`

## Pass Criteria (per browser)

`results.json` entry is `pass` when:

1. Browser launches successfully.
2. DOM dump includes `id="self-test-result"`.
3. `data-status="pass"` is present in dumped DOM.
4. No fatal launch errors in stderr log.

## Required Evidence Bundle

For each browser:

1. `results.json` record (`status`, `spawnError`, `exitCode`).
2. DOM file proving `data-status="pass"`.
3. stderr log.

For mobile:

1. Screenshot or screen recording of harness run.
2. Console log snapshot.
3. Manual checklist with:
   - Call
   - Mute
   - Hold
   - Reconnect (if exposed by flow)
   - Hangup
   - No visible UI regression

## Manual Fallback

If automated launch is blocked:

1. Open harness URL manually in target browser.
2. Open DevTools Console.
3. Run:

```js
await window.runModularSelfTest(10)
```

4. Save returned object and console output.
5. Capture final status text in UI and a screenshot.

## Known Blockers in Current Environment

Current workspace environment may block browser spawn with `EPERM` or platform permission errors.  
In that case, execute this runbook on:

1. local desktop terminal outside sandbox policy, or
2. CI runner with GUI/headless permissions.
