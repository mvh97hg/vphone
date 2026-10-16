# VPhone Electron Desktop

Electron desktop app with a native renderer UI. Call control still uses the shared `src/core` + `src/sdk` runtime. The web embed widget is separate and is not mounted inside the desktop window.

## What It Does

- Builds a TypeScript renderer (`renderer/src`) onto `PhoneSDK` — dialpad, recents, contacts, in-call, settings.
- Does **not** copy or mount `src/ui/phone-widget.js`.
- Vendors SIP.js locally (`vendor/sip-0.21.2.min.js`) instead of loading CDN on startup.
- Uses local-only keyboard shortcuts while the window is focused. Global answer/hangup is registered only during an incoming or active call when the window is not focused.
- Grants microphone, camera, notification, and screen-capture permissions through Electron.
- Reads SIP config from local `config.json` (or `VPHONE_DESKTOP_CONFIG` path).
- Writes desktop, renderer, and phone diagnostics to a local log file.
- Uses a fixed 250x453 shell below the draggable titlebar.
- Supports icon overrides for desktop window/tray.

## Install

```bash
cd desktop/electron
npm install
```

If using pnpm:

```bash
pnpm install
```

This package explicitly allows Electron build scripts through `pnpm.onlyBuiltDependencies`.
If pnpm still reports `ERR_PNPM_IGNORED_BUILDS`, run:

```bash
pnpm approve-builds
```

Select `electron`, then run `pnpm install` again. If pnpm has already cached a failed install, run:

```bash
pnpm install --force
```

## Run In Development

```bash
npm start
```

With pnpm:

```bash
pnpm start
```

The dev app builds the desktop TypeScript shell:

```bash
pnpm run build:desktop
```

That compiles `src/main.ts`, `src/preload.ts`, and `renderer/src/app.ts`, and copies the local SIP.js vendor file. It does **not** copy the library widget into the Electron app.

## Configure SIP

For development, you can point to a config file explicitly:

```bash
$env:VPHONE_DESKTOP_CONFIG="D:\path\to\config.json"
npm start
```

The Electron app does not load `.env` at runtime. For register smoke testing only, `npm run test:register` reads a repository `.env`, writes a temporary desktop config, launches Electron with `VPHONE_DESKTOP_CONFIG`, registers, and attempts a call to `1235`.

Expected `.env` keys for the smoke test:

```text
SIP_DOMAIN=pbx.example.com
SERVER=pbx.example.com
PORT=4443
SERVER_PATH=/ws
SIP_USERNAME=1234
SIP_PASSWORD=secret
TRACE_SIP=1
```

`SIP_PASSWORD_TYPE=ha1` is also supported when the password is pre-hashed.

Run the smoke test:

```bash
npm run test:register
```

For packaged builds, the default user config path is Electron's `userData` directory:

```text
%APPDATA%\VPhone\config.json
```

Common config:

```json
{
  "mount": {},
  "phone": {
    "Wss": true,
    "wssServer": "",
    "WebSocketPort": "",
    "ServerPath": "/ws",
    "SipDomain": "",
    "SipUsername": "",
    "SipPassword": "",
    "SipPasswordType": "",
    "Language": "vi",
    "MediaConfig": { "ringtone": "" },
    "NotificationsActive": false,
    "SettingsButton": true,
    "MaxDidLength": 24,
    "EnableVideoCalling": false,
    "EnableTransfer": true,
    "EnableConference": false,
    "EnableRingtone": true,
    "HideRecordAllCallsButton": true,
    "DisableFreeDial": false,
    "KeyboardShortcuts": {
      "answer": "Alt+A",
      "hangup": "Alt+C",
      "hold": "Alt+H",
      "mute": "Alt+M",
      "transfer": "Alt+T"
    },
    "IceStunServerJson": "[]",
    "IceStunCheckTimeout": 0,
    "HoldIceRestart": false
  }
}
```

Media config priority:

1. Values edited in phone `Settings` UI (saved in local storage)
2. `phone.MediaConfig` from desktop config
3. Embedded default media shipped with the desktop renderer / `vphone.min.js`

Icon override behavior:

- `mount.windowIcon`: icon for Electron `BrowserWindow`.
- `mount.trayIcon`: icon for Electron tray.
- `mount.iconPath`: icon fallback dùng chung cho window + tray (khi không set riêng `windowIcon`/`trayIcon`).
- `phone.AppIcon`: default web app icon/fav icon and fallback icon.
- `phone.NotificationIcon`: incoming-call / voicemail browser notification icon.
- `phone.DefaultProfileIcon`: default avatar/profile icon.

All icon fields accept:

- relative path (resolved from app root, e.g. `icons/win/icon.ico` or `icons/png/128x128.png`)
- absolute filesystem path
- URL/data URI (for web icon fields)

The default example intentionally leaves SIP credentials blank so the app opens the UI first. Use the `...` settings menu inside the phone panel to enter extension details, or edit `config.json` before launching. The embedded phone uses the same SIP WebSocket reconnect loop as the web app:

- `TransportKeepAliveInterval` (seconds, default `15`): CRLF keepalive so half-open WSS after a server restart is detected. `0` disables.
- `TransportReconnectionAttempts` (default `10`): automatic reconnect count after transport drop.
- `TransportReconnectionTimeout` (seconds, default `4`): delay between reconnect attempts.

After a new socket connects, VPhone re-REGISTERs so inbound INVITEs resume. Manual register while not registered always recycles the transport (disconnect then connect) because SIP.js `reconnect()` is a no-op when state is still `Connected`.

Hold / ICE behavior:

- Hold is always SIP re-INVITE (`a=sendonly` / resume `a=sendrecv`) so the PBX can play MOH — no client-only mute mode.
- `phone.HoldIceRestart` (`false` default): keep `false`. `true` + rtpengine `ICE=force` → Role conflict / STUN `401 Unauthorized` (bad ICE username) / DTLS close.
- `phone.IceStunCheckTimeout` (`0` default): wait until ICE gathering completes. Values like `500` truncate gathering and commonly cause STUN `401 Unauthorized` on the **first inbound hold**.
- `phone.IceStunServerJson` (`"[]"` recommended with rtpengine `ICE=force`): disables browser default Google STUN. Blank omits the field (Chromium may still use public STUN). `"[]"` turns ICE servers off.

Media server (rtpengine) notes for SIP hold from WebRTC:

- On **every** offer/answer including hold re-INVITE toward the browser, keep stable WebRTC flags (example): `ICE=force DTLS-fingerprint=sha-256 RTP/SAVPF replace-session-connection replace-origin SDES-off`.
- Do **not** add `reset` on hold/unhold re-INVITE (drops ICE attrs / forces bad renegotiation).
- Do **not** force ICE restart from the client (`HoldIceRestart=false`).
- Hold SDP must use `a=sendonly` / `a=inactive` — never `c=0.0.0.0` (that triggers ICE restart).
- Prefer a recent rtpengine (≥12.5 or a build with the `setup=actpass` re-INVITE fix) so DTLS role stays correct when the browser was the original answerer.

Password storage:

- When you save the extension password in the UI, Electron encrypts it with OS `safeStorage` (DPAPI on Windows, Keychain on macOS) before writing to `localStorage` as `vphone:safe:...`.
- Existing plaintext `SipPassword` values are migrated automatically on next launch.
- The password still exists in memory while the app runs (required for SIP REGISTER).

Transport scheme:

- `phone.Wss=true` => uses `wss://` (default).
- `phone.Wss=false` => uses `ws://` for internal HTTP-only environments.

Language build optimization:

- Build scripts read `vphone.buildLanguages` from `desktop/electron/package.json`.
- Only selected language packs are embedded into `vphone.min.js` / the desktop build.
- Electron packaged `locales/*.pak` is also pruned by `afterPack` to match selected languages.
- Example: `["en","vi"]` => keep `en-US.pak`, `vi.pak`.

## Debug WSS / SIP (Chrome DevTools)

Open Chromium DevTools in the Electron window:

- `F12` or `Ctrl+Shift+I` (macOS: `Cmd+Option+I`)
- Or auto-open on launch:

```bash
$env:VPHONE_DEVTOOLS="1"
pnpm start
```

Useful tabs:

- **Network → WS**: select the `wss://...` (or `ws://...`) socket and inspect frames (SIP REGISTER/INVITE/etc.).
- **Console**: renderer logs (registration errors, SDK messages). Set `"TraceSip": true` in `phone` config for SIP tracing when supported by the runtime.

Also check the desktop log file below for main/renderer diagnostics.

## Diagnostics

The app writes JSON-line logs to:

```text
%APPDATA%\VPhone\logs\vphone-desktop.log
```

Log rotation:

- Active log rotates at 5 MB.
- Keeps up to 5 backups: `vphone-desktop.log.1` ... `.5`.

The log captures:

- sanitized desktop config loading
- Electron permission decisions
- renderer boot
- VPhone status/call events
- renderer load and crash errors

For real register testing without the smoke script, create or point to a JSON config, launch the app, wait for `Online`, then call `1235` from the dialpad. If registration fails, inspect the latest log entries and SIP trace lines in `vphone-desktop.log`.

## Build

Directory package:

```bash
npm run package
```

Installer/distributable:

```bash
npm run dist
```

Platform-specific:

```bash
npm run dist:win
npm run dist:nsis
npm run dist:portable
npm run dist:mac
```

Windows installer behavior:

- `npm run dist:nsis` tạo file `.exe` installer (wizard), có màn hình chọn ngôn ngữ (`Vietnamese`, `English`), mặc định là tiếng Việt.
- Installer chạy theo user scope (`perMachine=false`), mặc định cài trong profile user (thường dưới `%LOCALAPPDATA%\\Programs`), và cho phép đổi thư mục cài.
- `npm run dist:portable` tạo bản `.exe` portable để copy sang máy khác chạy trực tiếp (không cần cài).
- Portable mặc định = thư mục unpacked (không tạo Setup / portable SFX). Chạy `pnpm dist:portable` → `release/VPhone-<version>-win/VPhone.exe`.
- Icon: `icons/win/icon.ico` → `build/icon.ico`, stamp bằng `resedit` ở `afterPack` + `afterSign`.
- Mỗi build portable → `release/VPhone-<version>-win/` (staging tạm `release/_pack-<version>/`). Không dùng `dist/`. Portable **không** xoá `VPhone-Setup-*.exe` đã có trong `release/`.
- `pnpm dist:nsis` → `release/VPhone-Setup-<version>.exe` (cùng staging `_pack-*`, không tạo thêm folder portable; có thể xoá Setup bản cũ hơn).
- NSIS uninstall GUID được pin (`nsis.guid`); installer `customInit` xóa ARP cũ của `com.vphone.app` để tránh hai mục “VPhone” trong Control Panel khi đổi AUMID/appId.

Artifacts:
- Portable: `desktop/electron/release/VPhone-<version>-win/`
- NSIS: `desktop/electron/release/VPhone-Setup-<version>.exe`

Sensitive config packaging note:

- `.env`, `.env.*`, and `*.log` are excluded from build artifacts.
- Runtime credentials can be provided via:
  1. `VPHONE_DESKTOP_CONFIG` path
  2. `config.json` next to executable
  3. `%APPDATA%\\VPhone\\config.json`

## Media Permissions

`main.js` allows:

- `media` for microphone/camera.
- `notifications` for desktop notifications.
- `display-capture` for screen sharing.
- `fullscreen` for video/fullscreen behavior.

At startup the renderer no longer prompts for microphone or speaker selection. Media is requested when a call starts or when Settings is opened.

The SIP endpoint must support WebRTC over secure WebSocket (`wss://`) and DTLS-SRTP.

## Notes

- Keep `contextIsolation: true` and `nodeIntegration: false`.
- Use `preload.js` as the only bridge between Electron and the renderer.
- For production, store real SIP credentials outside source control.
