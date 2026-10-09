# VPhone examples

## `demo.html`

Host-style embed demo using `lib/vphone.min.js`:

- Fetch SIP config (simulated), then `Vphone.mount({ floating: true, config })`
- `makeCall(number, { extraHeaders })`
- Status: `online` / `offline` / `register-failed`
- Optional `onCredentialsRequired`
- Incoming caller + `IncomingHeaders` shown in status
- Mic permission errors shown if blocked

**Run:** serve the repo root, open `docs/examples/demo.html`.  
Override SIP via query/hash: `?Server=…&Username=…&Password=…`

Full API: [`lib/README.md`](../../lib/README.md). Standalone phone UI: [`src/ui/index.html`](../../src/ui/index.html).
