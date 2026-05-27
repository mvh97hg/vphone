# Phone Refactor Requirement Audit

## Scope

This audit tracks the migrated runtime, not the legacy `Phone/` implementation. `Phone/phone.js` remains reference code and `Phone/index-legacy.html` remains the legacy page. The active runtime is `src/ui/index.html`.

`.env` is used only by local test servers in `scripts/serve-phone-env.cjs`.

## Required Runtime Structure

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

Status: `PASS`

Evidence:

- `scripts/audit-runtime-boundary.cjs` requires exactly these files under `src`.
- Copied legacy runtime files and assets are absent from `src`: `phone.js`, `phone.css`, service worker, manifest, icons, language packs, media, old split core modules, old SDK filename, and legacy adapter.

## mapping

| Legacy/reference area | Migrated runtime owner |
| --- | --- |
| `Phone/phone.js` SIP registration and calls | `src/core/phone-core.js` |
| Legacy public app/embed calls | `src/sdk/phone-sdk.js` |
| `InitUi()` shell IDs/classes | `src/ui/phone-widget.js` |
| Legacy phone styling | `src/ui/styles/phone-ui.css` |
| Legacy web entry | `src/ui/index.html` |
| Runtime verification harness | `scripts/ui-harness.html` |

## Feature Parity Checklist

| Feature | Status | Evidence |
| --- | --- | --- |
| Registration indicator | PASS | SIP smoke and UI event binding |
| Dialpad audio/video call | PASS | `scripts/ui-harness.html`, SIP smoke |
| Incoming call and answer | PASS | SIP smoke |
| Hangup | PASS | SIP smoke |
| Mute/unmute | PASS | Harness core/UI test and SIP smoke |
| Hold/resume UI flow | PASS | Harness UI test and SIP smoke |
| DTMF API | PASS | `PhoneCore.sendDTMF()` |
| Device switch API | PASS | `PhoneCore.switchDevice()` |
| Recents/contacts render and clear flows | PASS | `scripts/audit-ui-parity-gap.cjs` |

## Event Flow Diagram

```text
UI control
  -> PhoneUI handler
  -> PhoneSDK public method
  -> PhoneCore SIP/media action
  -> PhoneCore event
  -> PhoneUI renderer status/class update
```

## Call State Diagram

```text
Offline
  -> register()
Online
  -> call() / incoming invite
Calling / Incoming call
  -> answer() / SIP established
Connected
  -> mute() <-> unmuted/muted status
  -> hold() / resume()
  -> hangup() / remote terminated
Ended
```

## Migration Strategy

The migrated runtime removes duplicated legacy files from `src`, keeps `Phone/` as reference only, consolidates SIP/media/call state into `phone-core.js`, exposes one SDK wrapper, and keeps UI rendering in `phone-widget.js` using legacy-compatible DOM IDs/classes.

## Rollback Strategy

`Phone/index-legacy.html` and the legacy `Phone/` folder remain available as reference/runtime fallback. Reverting `Phone/index.html` from redirect-only to the legacy page restores the old entry without depending on `src`.

## Public SDK

Status: `PASS`

Evidence:

- `src/sdk/phone-sdk.js` exposes `register`, `unregister`, `call`, `answer`, `hangup`, `mute`, `hold`, `resume`, `sendDTMF`, `switchDevice`, `on`, and `off`.
- Extra compatibility methods are present for current UI flows: `toggleRegistration`, `getRegistrationState`, `listDevices`, `reconnect`, `transfer`, and `conference`.

## UI Parity Scope

Status: `PASS` for audited migrated flows.

Audited flows:

- Legacy shell IDs/classes used by the widget template.
- Dialpad rendering, digit input, delete key state, input sanitization, Enter/Ctrl+Enter call mode.
- Recents and contacts rendering from legacy local storage shapes.
- Mobile top bar actions and registration state indicators.
- Clear contacts/recents confirmation flows.
- Recents expanded actions: call, add contact, delete.
- Mute/unmute and hold/resume UI state updates.

Evidence:

- `scripts/verify-ui-parity.cjs`
- `scripts/audit-ui-parity-gap.cjs`
- `scripts/ui-harness.html?autorun=1`

## Browser And SIP Verification

Status: `PASS`

Evidence:

- `scripts/browser-matrix-harness.cjs` passed Chrome, Edge, and Firefox harness checks.
- Playwright SIP smoke with `.env` test credentials registered slot 1 and slot 2, placed a call, observed incoming call, answered, reached connected state on both sides, toggled mute/unmute, toggled hold/resume, and hung up with both sides reaching ended state.

## Audit Commands

```powershell
node scripts\audit-runtime-boundary.cjs
node scripts\verify-ui-parity.cjs
node scripts\audit-ui-parity-gap.cjs
node scripts\browser-matrix-harness.cjs
node scripts\run-refactor-audit.cjs
```
