# VPhone

WebRTC SIP softphone for Asterisk/FreeSWITCH, with a reusable **single-file** embed library and an Electron desktop shell.

## Layout

- `src/` — source of truth (UI, SIP core, SDK, vendor)
- `lib/vphone.min.js` — **release** embed library (UI + runtime in one file)
- `desktop/electron/` — Electron app embedding `src/ui`
- `docs/examples/demo.html` — embed / makeCall demo

## Embed (web)

```bash
cd lib && npm install && npm run build:release
```

```html
<script src="lib/vphone.min.js"></script>
<script>
  const phone = Vphone.mount({
    floating: true,
    config: {
      EnableNotifications: true,
      Server: 'pbx.example.com',
      Port: 7443,
      Domain: 'pbx.example.com',
      Username: '1001',
      Password: 'secret'
    }
  });

  phone.makeCall('1002', {
    extraHeaders: ['X-Source: web']
  });
  // callType defaults to audio; SIP From displayName uses configured profileName.
</script>
```

Full API and config: [`lib/README.md`](lib/README.md). Demo: [`docs/examples/demo.html`](docs/examples/demo.html).

## Standalone UI

```bash
python -m http.server 9000
```

Open `http://localhost:9000/src/ui/index.html` (or the demo at `docs/examples/demo.html`).

## Build / test library

```bash
cd lib
npm test
npm run build:release
```

`build:release` writes `lib/vphone.min.js` only.

## Electron

```bash
cd desktop/electron
pnpm install
pnpm start
```

See [`docs/electron/README.md`](docs/electron/README.md).

## Docs

- [`lib/README.md`](lib/README.md) — embed library
- [`docs/electron/README.md`](docs/electron/README.md) — desktop
- [`docs/examples/README.md`](docs/examples/README.md) — examples

## Requirements

- HTTPS / localhost / secure Electron for mic/camera
- SIP WebSocket + WebRTC
- Asterisk 13/16+ or compatible PBX

## License

GNU Affero General Public License v3.0. See `LICENSE`.
