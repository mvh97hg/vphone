# VPhone Electron Desktop

Electron desktop shell for the existing VPhone UI.

## What It Does

- Loads only `lib/vphone-widget.min.js` (UI + core runtime).
- Mounts the embedded phone UI inline in a desktop window.
- Grants microphone, camera, notification, and screen-capture permissions through Electron.
- Reads SIP config from local `config.json` (or `VPHONE_DESKTOP_CONFIG` path).
- Writes desktop, renderer, and phone-console diagnostics to a local log file.
- Uses a fixed 250x453 shell so the embedded 250x425 call panel keeps its configured size below the draggable titlebar.
- Supports icon overrides for desktop window/tray and web UI notifications/avatar.

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

The dev app reads built runtime artifacts from the repository root:

- `../../lib/vphone-widget.min.js`

Run `npm run build:release` in `lib/` after changing `Phone/phone.js` or `Phone/phone.css`.

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
    "SipPasswordType": "plain",
    "Language": "vi",
    "MediaConfig": {
        "ringtone": "",
        "ringbackTone": "",
        "holdMusic": "",
        "notificationSound": ""
    },
    "NotificationsActive": false,
    "EnableNotificationSettings": false,
    "TransportReconnectionAttempts": 999,
    "TransportReconnectionTimeout": 3,
    "HideSettingsButton": false,
    "MaxDidLength": 24,
    "EnableVideoCalling": false,
    "EnableTransfer": true,
    "EnableConference": true,
    "EnableTextMessaging": false,
    "RecordAllCalls": false,
    "CallRecordingPolicy": "allow",
    "AutoAnswerPolicy": "allow",
    "DoNotDisturbPolicy": "allow",
    "CallWaitingPolicy": "allow",
    "KeyboardShortcuts": {
      "answer": "F2",
      "hangup": "Escape",
      "hold": "F4",
      "mute": "F6",
      "transfer": "F8",
      "dialpad": "F9"
    },
    "DisableBuddies": false,
    "DisableFreeDial": false,
    "IceStunServerJson": ""
  }
}

```

Media config priority:

1. Values edited in phone `Settings` UI (saved in local storage)
2. `phone.MediaConfig` from desktop config
3. Embedded default media shipped with `vphone-widget.min.js`

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

The default example intentionally leaves SIP credentials blank so the app opens the UI first. Use the `...` settings menu inside the phone panel to enter extension details, or edit `config.json` before launching. The embedded phone uses the same SIP WebSocket reconnect loop as the web app; `TransportReconnectionAttempts` and `TransportReconnectionTimeout` control retry count and interval.

Transport scheme:

- `phone.Wss=true` => uses `wss://` (default).
- `phone.Wss=false` => uses `ws://` for internal HTTP-only environments.

Language build optimization:

- Build scripts read `vphone.buildLanguages` from `desktop/electron/package.json`.
- Only selected language packs are embedded into `vphone-widget.min.js`.
- Electron packaged `locales/*.pak` is also pruned by `afterPack` to match selected languages.
- Example: `["en","vi"]` => keep `en-US.pak`, `vi.pak`.

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
- renderer boot and media-device counts
- VPhone status/call events
- console messages from the embedded phone iframe
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
- File `.exe` (NSIS + portable) và icon installer/uninstaller dùng cùng icon `icons/win/icon.ico`.

Build output goes to `desktop/electron/release/`.

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

At startup the renderer proactively calls `getUserMedia({ audio: true })` and then stops the track. This triggers the browser/Electron media permission flow and unlocks microphone labels for the settings device list.

The SIP endpoint must support WebRTC over secure WebSocket (`wss://`) and DTLS-SRTP.

## Notes

- Keep `contextIsolation: true` and `nodeIntegration: false`.
- Use `preload.js` as the only bridge between Electron and the renderer.
- For production, store real SIP credentials outside source control.
