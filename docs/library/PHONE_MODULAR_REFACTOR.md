# Phone.js Refactor Status (src-only Runtime)

Date: 2026-05-25  
Source of requirements: `D:\VSCode\VPhone\.codex\AGENTS.MD`

## 1) Architecture Decision

- Runtime and source of truth are in `src/*`.
- UI strategy is `DOM bằng JS` to preserve `phone.js` UI/UX parity.
- `Shadow DOM` direction is paused.
- `Phone/phone.js` is kept as behavior reference only.

## 2) Active Structure

```txt
src/
 ├── core/
 │    ├── webrtc-core.js
 │    ├── signaling.js
 │    ├── media-manager.js
 │    ├── peer-manager.js
 │    ├── call-state.js
 │    └── event-emitter.js
 ├── sdk/
 │    └── sdk.js
 ├── ui/
 │    ├── index.html
 │    ├── harness.html
 │    ├── create-modular-phone.js
 │    ├── phone-ui.js
 │    ├── dom-renderer.js
 │    ├── controls.js
 │    ├── notifications.js
 │    └── styles/phone-ui.css
 └── adapters/
      └── legacy-phone-adapter.js
```

## 3) Runtime Entry Points

- Main UI runtime: `src/ui/index.html`
- Runtime harness: `src/ui/harness.html`
- `Phone/index.html` is redirect-only compatibility page to `/src/ui/index.html`
- `Phone/core` and `Phone/ui` are removed (no duplicated runtime source there)

## 4) UI/UX Parity Approach

- Use legacy style source: `src/ui/styles/phone-ui.css` copied from `Phone/phone.css`.
- Port legacy shell from `InitUi()` into `src/ui/dom-renderer.js` using legacy ids/classes (`#Phone`, `#leftContent`, `#rightContent`, tab bar, search area, action area, line placeholder blocks).
- Add legacy-like tab behavior and top action bar behavior in `src/ui/phone-ui.js` and `src/ui/controls.js`.

## 5) Current Parity Measurements

Runtime compare snapshot:

- Legacy `Phone/index-legacy.html`: `totalNodes=155`, `buttons=26`
- `src/ui/index.html` (early minimal port): `totalNodes=27`, `buttons=5`
- After legacy shell port: `totalNodes=67`, `buttons=11`
- After legacy action expansion: `totalNodes=85`, `buttons=22`
- After recents/actions/line control expansion: `totalNodes=110`, `buttons=32`

Interpretation:

- Structure parity is improving significantly.
- 1:1 UI/UX parity is not complete yet; additional legacy panels and interactive states still need to be ported.

## 6) Verification Summary

- Syntax checks for updated `src/ui` and `src/core` modules pass.
- Playwright runtime checks:
  - `src/ui/index.html` loads.
  - tab switching (`dialpad/recents/contacts`) updates active state and visibility.
  - `src/ui/harness.html?autorun=1&iterations=3` returns pass with listener/peer cleanup checks.

## 7) Open Gaps

1. Full browser matrix evidence (`Chrome/Edge/Firefox/mobile`) is still pending due environment execution restrictions (`EPERM` / permission errors when launching browser binaries).
2. End-to-end media answer parity remains blocked by SIP server SDP issue (missing DTLS fingerprint).
3. Full UI/UX 1:1 with `phone.js` is still partial and requires additional legacy screen/state migration.
