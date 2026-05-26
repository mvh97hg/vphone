# Refactor Runtime Test Report

Date: 2026-05-25  
Branch: `refactor`

## Scope

- Validate refactored split architecture behavior (`src/core/*` + `src/sdk/*` + `src/ui/*` + `src/adapters/*`) with `src/ui/harness.html` as runtime harness.
- Use real SIP runtime configuration from `.env` for practical call testing.

## Environment

- Local servers:
  - `http://127.0.0.1:9016/src/ui/index.html` (re-implemented UI entrypoint)
  - `http://127.0.0.1:9016/src/ui/harness.html` (refactor harness)
- `.env` values used:
  - `WSSSERVER=demo.hmv.io.vn`
  - `WSSPORT=4443`
  - `WSSPATH=/ws`
  - `SIPUSER=1234`, `SIPUSER1=1235`

## Verification Matrix

### A. Legacy reference (`phone.js`)

- [x] `phone.js` kept as behavior reference; legacy page archived at `Phone/index-legacy.html`.
- [x] Both extensions register successfully to `wss://demo.hmv.io.vn:4443/ws`.
- [x] Outbound call signaling works (`INVITE`, `180 Ringing` observed).
- [x] Inbound call signaling works (incoming call detected on callee side).
- [ ] Answer establishes WebRTC media.
  - Blocked by server SDP:
    - `Inbound INVITE SDP is missing DTLS fingerprint; answering will fail in WebRTC.`

### B. Refactor split (`core` + `ui`) in `src/*`

- [x] Refactor web build loads successfully.
- [x] No console runtime errors in refactor harness.
- [x] UI button flow works:
  - `Call -> Mute -> Hold -> Hangup` (status transitions observed in browser smoke test).
- [x] Status transitions observed:
  - `Calling 1002 -> Muted -> On hold -> Ended`.
- [x] Cleanup + listener stability self-test on harness:
  - `src/ui/harness.html?autorun=1&iterations=3` result:
    - `listenersStable=true`
    - `peersBalanced=true`
    - `createdDelta=6`, `closedDelta=6`
  - No console errors during self-test run.

## Additional Findings

- `Phone/phone.js` is kept as reference behavior and not used by active `src/ui` runtime.
- Harness bug fixed for realistic media attach tests:
  - `FakeMediaManager` now emits real `MediaStream` instead of custom object to avoid `srcObject` type errors.
- Browser matrix automation attempt (Chrome/Edge headless binaries):
  - Attempted to run `--headless --dump-dom` against harness autorun URL with workspace-local user data dirs.
  - Blocked by environment permission errors from browser process (`Access is denied (0x5)` in crashpad/mojo init).
  - Captured files `.tmp/chrome_dom.txt` and `.tmp/edge_dom.txt` were empty, so no valid per-browser DOM evidence could be asserted from this run.
  - Escalated retry for Chrome (outside sandbox) also failed to produce evidence:
    - command timed out
    - `.tmp/chrome_dom_escalated.txt` remained empty.
- Added reproducible matrix runner script:
  - `scripts/browser-matrix-harness.cjs`
  - Output artifact: `.tmp/browser-matrix/results.json`
  - Current run result in this environment: all three binaries (`chrome`, `edge`, `firefox`) returned `spawnError.code=EPERM`, so matrix remained inconclusive.
  - Operational runbook for completing required matrix evidence outside blocked environment:
    - `docs/library/BROWSER_MATRIX_RUNBOOK.md`

## Conclusion

- Refactor objective of split `core + ui` into a runnable web/widget is achieved at runtime for client-side call state and UI behavior.
- Full real-world call completion is currently blocked by SIP/WebRTC server SDP configuration (missing DTLS fingerprint), not by the split architecture.

## Retest Checklist After SIP Server Fix

1. Register ext1/ext2.
2. ext1 -> ext2: answer, media up, mute/hold/resume/hangup.
3. ext2 -> ext1: answer, media up, mute/hold/resume/hangup.
4. Verify no console errors on both tabs.
5. Confirm recent history/CDR entries update correctly.
