# VPhone Library

Single-file WebRTC SIP phone widget for embedding in web apps.

**Release file:** `vphone.min.js` (UI + runtime embedded).

```bash
cd lib
npm install
npm run build:release   # writes vphone.min.js
npm test
```

## Quick start

After login, fetch extension credentials from your backend and pass them into `Vphone.mount({ config })`. Only set fields that differ from defaults. Do not show SIP fields on the host page.

SIP secrets stay **in memory** for the mounted session (not written to `localStorage`). Reload/F5 requires the host to fetch again and remount.

```html
<script src="vphone.min.js"></script>
<script>
  // const sip = await fetch('/api/me/phone').then((r) => r.json());
  const widget = Vphone.mount({
    floating: true,
    config: {
      EnableNotifications: true,
      Server: 'pbx.example.com',
      Port: 4443,
      Domain: 'pbx.example.com',
      Username: '7001',
      Password: 'secret'
    }
  });
</script>
```

Floating mounts bottom-right. Defaults: `startCollapsed`, `expandOnIncomingCall`, `collapseOnCallEnd` = `true`. Ringtone is always on. Panel size is fixed to the UI frame (`250×457`) — do not pass `width` / `height`.

### Inline

```html
<div id="phone-panel"></div>
<script src="vphone.min.js"></script>
<script>
  Vphone.mount({
    container: '#phone-panel',
    floating: false,
    config: {
      Server: 'pbx.example.com',
      Port: 7443,
      Domain: 'pbx.example.com',
      Username: '1001',
      Password: 'secret'
    }
  });
</script>
```

### Make a call

One host API: `makeCall(number, options?)`. `callType` defaults to `audio`. Local caller display name uses configured `profileName` (not overridable from the host).

```js
widget.makeCall('1002');
widget.makeCall('1002', {
  extraHeaders: ['X-Source: web', 'X-Ticket-ID: 123']
});
// video only when needed: widget.makeCall('1002', { callType: 'video' });
```

### Incoming caller + selected headers

Pass the header names you want (not hardcoded in the library). Only those names are read from the INVITE and returned on `onCallEvent`.

```js
Vphone.mount({
  floating: true,
  config: {
    ...sip,
    IncomingHeaders: ['X-Header-A', 'X-Ticket-ID']
  },
  onCallEvent(ev) {
    if (ev.phase !== 'incoming') return;
    // ev.from, ev.displayName, ev.number
    // ev.headers['X-Header-A']  — only if present on the INVITE
  }
});
```

### Registration status

`onStatusChange` / `vphone-status` uses:

| `status` | Meaning |
| --- | --- |
| `online` | REGISTER OK |
| `offline` | User intentionally unregistered (socket/UA may remain; no auto re-register until register again). F5 remount still auto-registers. |
| `register-failed` | Any other not-registered case (auth, transport, missing config, …) |

```js
Vphone.mount({
  floating: true,
  config: sip,
  onStatusChange(ev) {
    // ev.status: 'online' | 'offline' | 'register-failed'
    if (ev.status === 'register-failed') {
      // fetch fresh credentials, then:
      // widget.configure(nextSip);
    }
  },
  // Optional: called when register needs credentials and memory has none
  async onCredentialsRequired() {
    return fetch('/api/me/phone').then((r) => r.json());
  }
});
```

`widget.configure(partialConfig)` merges into memory and retries register (unless currently `offline` from intentional unregister).

Demo: `docs/examples/demo.html`.

## Mount options

| Option | Default | Description |
| --- | --- | --- |
| `phoneUrl` | `embedded` | Use embedded UI (default). External URL only if you host UI yourself. |
| `container` | `null` | CSS selector or element for inline mode. |
| `floating` | `!container` | Floating launcher vs inline. |
| `title` | `VPhone` | Accessibility title. |
| `showStatus` | `true` | Status dot in host chrome. |
| `startCollapsed` | `true` | Floating starts as launcher. |
| `expandOnIncomingCall` | `true` | Expand on inbound / notification click. |
| `collapseOnCallEnd` | `true` | Collapse when call ends. |
| `config` | `{}` | Phone provisioning object. |
| `onStatusChange` | `null` | Registration/status callback (`online` / `offline` / `register-failed`). |
| `onCredentialsRequired` | `null` | Optional `() => config \| Promise<config>` when auth missing. |
| `onCallEvent` | `null` | Call lifecycle callback. |

Instance helpers: `expand()`, `collapse()`, `toggle()`, `isCollapsed()`, `makeCall()`, `configure()`, `destroy()`, `iframe`.

## Config toggles

Only include keys that differ from defaults. No legacy aliases.

| Config | Default | Description |
| --- | --- | --- |
| `EnableVideoCalling` | `false` | Video call features. |
| `EnableTransfer` | `true` | Transfer controls. |
| `EnableConference` | `false` | Conference controls. |
| `EnableRingtone` | always `true` | Cannot be disabled. |
| `EnableFreeDial` | `true` | Free-dial control. |
| `EnableSettings` | `false` (web) | Settings gear/menu. |
| `EnableRecordAllCalls` | `false` | Record-all toggle. |
| `EnableBuddies` | `true` | Contacts. |
| `EnableNotifications` | `false` | OS notifications (click focuses tab + expands). |
| `EnableMultiTabLeader` | `true` (browser) | One REGISTER per extension across tabs. |
| `PasswordType` | unset=`plain` | `plain` or `ha1`. Storage always HA1. |
| `MaxDidLength` | `24` | Max dial length. |
| `HoldMode` | `sip` | Hold signaling mode. |

## SIP / media

| Config | Description |
| --- | --- |
| `Server` | WebSocket host. |
| `Port` | WebSocket port. |
| `ServerPath` | Path (default `/ws`). |
| `Domain` | SIP domain; defaults to `Server`. |
| `Username` | Extension. |
| `Password` | Password or HA1. |
| `PasswordType` | `plain` or `ha1`. |
| `IceStunServerJson` | ICE servers JSON string. |
| `MediaConfig` | Optional `ringtone`, `holdMusic`, `busy`, `callWaiting`, `congestion`, `earlyMedia`. |

## Requirements

- Secure origin: HTTPS, localhost, or secure Electron renderer.
- SIP WebSocket + WebRTC/DTLS-SRTP.
- Mic/camera permissions for calls.

## Develop

- `vphone.js` — host runtime (build input, not published).
- `scripts/build-single-file.js` — embeds `src/ui` into `vphone.min.js`.
- Published package contents: `vphone.min.js` + this README.
