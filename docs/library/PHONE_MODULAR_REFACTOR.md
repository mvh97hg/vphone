# Phone Modular Refactor

## Current Runtime Shape

The migrated runtime keeps `Phone/` as legacy/reference only. The active browser widget runs from `src/ui/index.html` and loads the modular SDK/UI files below:

```text
src/
  core/
    phone-core.js
  sdk/
    phone-sdk.js
  ui/
    index.html
    phone-widget.js
    styles/
      phone-ui.css
```

`src` intentionally does not contain copied `phone.js`, `phone.css`, service worker, manifest, language packs, media, icons, or legacy adapter files.

## Boundaries

- `src/core/phone-core.js` owns SIP.js registration, media stream acquisition, call setup, answer, hangup, mute toggle, hold/resume signaling hooks, DTMF, transfer, conference hook, and device switching.
- `src/sdk/phone-sdk.js` is the public API wrapper for embed/app consumers: `register`, `unregister`, `call`, `answer`, `hangup`, `mute`, `hold`, `resume`, `sendDTMF`, `switchDevice`, `on`, and `off`.
- `src/ui/phone-widget.js` owns DOM rendering, legacy-compatible IDs/classes, tab behavior, dialpad controls, recents/contacts rendering, clear flows, registration indicators, and SDK event binding.
- `src/ui/index.html` is the browser entry. It reads `window.__VPhoneEmbedConfig`, supports `bpConfig`, loads SIP.js, and imports `createPhoneWidget`.
- `Phone/index.html` is redirect-only compatibility entry to `/src/ui/index.html`.

## Verification

Primary checks:

```powershell
node scripts\audit-runtime-boundary.cjs
node scripts\verify-ui-parity.cjs
node scripts\audit-ui-parity-gap.cjs
node scripts\browser-matrix-harness.cjs
node scripts\run-refactor-audit.cjs
```

Runtime browser harness:

```text
http://127.0.0.1:9011/scripts/ui-harness.html?autorun=1
```

The harness covers dialpad calls, audio/video call options, digit/delete behavior, mute/unmute, hold/resume, and core mute track state.

Real SIP smoke uses `.env` only for local testing through `scripts/serve-phone-env.cjs`; `.env` is not a runtime source file and is not copied into `src`.
