# VPhone Library API Reference

## Overview

Browser Phone Library is a complete WebRTC SIP phone solution for embedding voice and video calling capabilities into web applications. It provides both standalone phone functionality and flexible widget embedding options.

**Version:** 1.0.0  
**App Version:** 0.3.34  
**License:** GNU Affero General Public License v3.0

---

## Quick Start

### Installation

#### Headless SDK (ESM / TypeScript)

Use this when you want to build your own website or Electron UI instead of
using the built-in iframe phone interface.

```javascript
import { createPhoneClient } from 'vphone/sdk';

const phone = createPhoneClient({
  sip: {
    wssServer: 'pbx.example.com',
    webSocketPort: 7443,
    serverPath: '/ws',
    username: '1001',
    password: 'secret'
  },
  language: 'vi'
});

phone.on('registration', (event) => {
  console.log('Registration:', event.state);
});

await phone.register();
await phone.makeCall('1002', { callType: 'audio' });
```

The package exports:

- `vphone/sdk` - typed headless call-control facade, ESM and CommonJS
- `vphone/widget` - browser global/iframe widget runtime
- `vphone/vphone.min` - single-file browser widget build

#### Option 1: Browser Global

```html
<!-- Load the library -->
<script src="lib/vphone.js"></script>

<!-- Use it -->
<script>
  var phone = Vphone.mount({
    phoneUrl: 'phone/index.html',
    floating: true
  });
</script>
```

`Vphone` is the primary browser global. `BrowserPhone` remains available as a compatibility alias for existing embedded pages.

#### Option 2: npm / CommonJS

```javascript
const Vphone = require('vphone');

const phone = Vphone.mount({
  phoneUrl: '/phone/index.html',
  floating: true
});
```

#### Option 3: ES6 Module

```javascript
import Vphone from 'vphone';

const phone = Vphone.mount({
  phoneUrl: '/phone/index.html',
  floating: true
});
```

---

## Single-File Embedded UI Distribution

**New in v1.0.0:** Browser Phone can be used as a single minified file with all UI assets embedded.

### What is Embedded UI?

The standard distribution includes:
- `vphone.min.js` (1.2 MB, ~300 KB gzipped) - Contains the entire Phone UI, CSS, JavaScript, icons, and language packs as a data URI

This means you **don't need any external files** - just one JavaScript file!

### Using Embedded UI

Simply load the minified file and don't specify `phoneUrl`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My App with Phone</title>
</head>
<body>
    <div id="phone-widget"></div>

    <!-- Just one file needed! -->
    <script src="vphone.min.js"></script>
    
    <script>
        // Mount the phone - no phoneUrl needed
        var phone = Vphone.mount({
            // phoneUrl is optional - embedded UI is auto-detected
            floating: true,
            config: {
                Language: 'vi',
                wssServer: 'your-pbx.com',
                WebSocketPort: 4443,
                ServerPath: '/ws',
                SipUsername: '1234',
                SipPassword: 'password'
            }
        });

        // Use the API as normal
        phone.makeCall('1001');
    </script>
</body>
</html>
```

### Key Features

✅ **Single File** - No external assets needed  
✅ **Zero Configuration** - Just load and mount  
✅ **Lightweight** - ~300 KB gzipped  
✅ **Complete** - Includes all UI, CSS, JavaScript, icons, language packs  
✅ **Fallback Support** - Can override phoneUrl if needed  

### File Size Breakdown

| Component | Size |
|-----------|------|
| Minified JS | 1.2 MB |
| Gzipped | ~300 KB |
| Includes | HTML + CSS + JS + SVG icon + 14 languages |

### Supported Languages in Embedded UI

- English (en)
- Vietnamese (vi)
- German (de)
- Spanish (es)
- French (fr)
- Hebrew (he)
- Japanese (ja)
- Dutch (nl)
- Polish (pl)
- Portuguese Brazil (pt-br)
- Russian (ru)
- Turkish (tr)
- Simplified Chinese (zh-hans)
- Chinese Traditional (zh)

### Building Embedded UI

If you modify the Phone UI and want to rebuild the distribution:

```bash
# Install dependencies
npm install

# Build embedded UI from source
npm run build:embedded

# Verify SDK artifacts
npm run build:sdk

# Or in one command
npm run build:release
```

### Fallback to External URL

If you prefer to use an external Phone URL instead of embedded:

```javascript
Vphone.mount({
    phoneUrl: 'http://your-server.com/phone/index.html',
    floating: true,
    config: { /* ... */ }
});
```

The library will automatically use the external URL if provided.

When `phoneUrl` is provided, the runtime creates an iframe with `src` set to
`phoneUrl#bpConfig=<encoded JSON>`. When `phoneUrl` is omitted, the runtime uses
the embedded `srcdoc` payload if `vphone.min.js` was built with embedded
UI assets.

---

## Headless SDK API

### `createPhoneClient(config, options?)`

Creates a UI-independent client for custom web and Electron interfaces.

```typescript
type VphoneConfig = {
  sip: {
    wssServer: string;
    webSocketPort: number;
    serverPath?: string;
    sipDomain?: string;
    username: string;
    password: string;
  };
  media?: { audio?: boolean; video?: boolean };
  mediaConfig?: {
    ringtone?: string;
    ringbackTone?: string;
    holdMusic?: string;
    notificationSound?: string;
  };
  language?: string;
};
```

The returned client exposes:

- `register()` / `unregister()`
- `makeCall(number, options?)`
- `answer(callId)` / `reject(callId)` / `hangup(callId)`
- `mute(callId)` / `unmute(callId)`
- `hold(callId)` / `unhold(callId)`
- `sendDtmf(callId, digit)`
- `on(eventType, handler)` returning an unsubscribe function
- `destroy()`

### Custom UI Adapter

The SDK accepts an adapter so apps can connect the facade to the legacy iframe
bridge now, and to a native SIP/WebRTC adapter later.

```javascript
import { createPhoneClient, createIframeBridgeAdapter } from 'vphone/sdk';
import Vphone from 'vphone/widget';

const widget = Vphone.mount({ phoneUrl: '/Phone/index.html', floating: true });
const phone = createPhoneClient(config, {
  adapter: createIframeBridgeAdapter(widget)
});
```

### Media Override Config (DOM UI)

For embedded DOM UI, media can be provided by the host app and overridden by end users in Settings.

```javascript
Vphone.mount({
  floating: true,
  config: {
    MediaConfig: {
      ringtone: 'Ringtone_1.mp3',
      ringbackTone: 'Tone_EarlyMedia-US.mp3',
      holdMusic: 'speech_orig.mp3',
      notificationSound: 'Alert.mp3'
    }
  }
});
```

Supported values per field:
- media file name from `Phone/media` (for example `Ringtone_1.mp3`)
- absolute URL (`https://...`)
- data URI (`data:audio/...`)

Priority order:
1. User-edited Settings media values (saved in local storage)
2. App-provided `MediaConfig`
3. Embedded default media bundled in `vphone.min.js`

Settings fields:
- `ringtone`
- `ringback tone`
- `hold music`
- `notification sound`

### Electron Notes

- Use HTTPS or a secure Electron origin for WebRTC media permissions.
- Configure `BrowserWindow` permissions for microphone, camera, and notifications.
- Prefer `contextIsolation: true`; call the SDK from preload or expose a narrow bridge.

## API Reference

### Main Export

#### `Vphone`

The main library object providing the mounting interface and utilities.

**Type:** `Object`

**Properties:**
- `VERSION` - Application version (0.3.34)
- `LIBRARY_VERSION` - Library version (1.0.0)
- `PHONE_MODES` - Enumeration of phone modes
- `STATUS_COLORS` - Enumeration of status colors
- `mount(options)` - Mount the phone widget
- `Embed.mount(options)` - Alias for backwards compatibility
- `utils` - Utility functions
- `getInfo()` - Get library information
- `init(config)` - Initialize library

---

## Core API

### `Vphone.mount(options)`

Mount the Browser Phone application in floating widget or inline mode.

**Parameters:**

```javascript
Vphone.mount({
  // Phone application URL (optional when using embedded UI)
  phoneUrl: 'index.html',          // Default: auto-detect embedded UI


  // Configuration object passed to phone app
  config: {
    // Phone configuration options
    Language: 'en',                // Language pack to load
    WelcomeScreen: true,           // Show welcome on startup
    // ... other config options
  },

  // Mounting mode
  container: '#phone-container',   // CSS selector or HTMLElement for inline mode
  floating: true,                  // Use floating widget (default if no container)

  // Widget dimensions
  width: '250px',                  // Widget width
  height: '425px',                 // Widget height

  // Widget behavior
  title: 'VPhone',                 // Accessibility title
  showStatus: true,                // Show online/offline indicator
  startCollapsed: true,            // Start floating widget collapsed
  expandOnIncomingCall: true,      // Auto-expand on incoming call

  // Callbacks
  onStatusChange: function(status) {
    // Fired when registration status changes
    // status = { registered: boolean, text: string }
  },
  onCallEvent: function(callEvent) {
    // Fired on call events
    // callEvent = { phase: string, lineNumber: number, ... }
  }
});
```

**Returns:** Mount instance object with control methods

**Throws:** 
- `Error` if container element not found (inline mode)

---

## Mount Instance API

The object returned by `Vphone.mount()` provides these methods:

### Properties

#### `instance.iframe`

The underlying iframe element containing the phone application.

**Type:** `HTMLIFrameElement`

```javascript
var frame = phone.iframe;
console.log(frame.src); // Log iframe URL
```

---

### Methods

#### `instance.expand()`

Expand the floating widget or inline container (if applicable).

```javascript
phone.expand();
```

**Returns:** `undefined`

---

#### `instance.collapse()`

Collapse the floating widget or inline container (if applicable).

```javascript
phone.collapse();
```

**Returns:** `undefined`

---

#### `instance.toggle()`

Toggle the visibility of the floating widget.

```javascript
phone.toggle(); // Show if hidden, hide if shown
```

**Returns:** `undefined`

---

#### `instance.destroy()`

Unmount the phone and clean up resources.

```javascript
phone.destroy();
// Widget will be removed from DOM
// Event listeners will be cleaned up
```

**Returns:** `undefined`

---

#### `instance.setStatus(online, [text])`

Update the status indicator display.

**Parameters:**
- `online` (boolean) - Online/offline state
- `text` (string, optional) - Custom status text

```javascript
// Show online status
phone.setStatus(true);

// Show connecting status
phone.setStatus(false, 'Connecting...');

// Show custom status
phone.setStatus(true, 'Available - Do Not Disturb');
```

**Returns:** `undefined`

---

#### `instance.isCollapsed()`

Check if the floating widget is currently collapsed.

```javascript
if (phone.isCollapsed()) {
  phone.expand();
}
```

**Returns:** `boolean` - True if widget is collapsed

---

## Event Callbacks

### `onStatusChange(status)`

Called when the phone's registration status changes.

**Callback Parameters:**
```javascript
{
  registered: boolean,  // Is phone registered with PBX
  text: string,         // Human-readable status text
  // ... additional status fields
}
```

**Example:**
```javascript
Vphone.mount({
  phoneUrl: 'phone/index.html',
  onStatusChange: function(status) {
    console.log('Phone registered:', status.registered);
    console.log('Status text:', status.text);
    
    // Update UI based on registration
    if (status.registered) {
      document.body.classList.add('phone-online');
    } else {
      document.body.classList.remove('phone-online');
    }
  }
});
```

---

### `onCallEvent(event)`

Called on phone call-related events (incoming, answered, ended, etc.).

**Callback Parameters:**
```javascript
{
  phase: string,        // 'incoming', 'answered', 'ended', 'transferred', etc.
  lineNumber: number,   // Active line number
  buddyId: string,      // Remote party identifier
  reasonCode: number,   // SIP reason code (if applicable)
  reasonText: string,   // Human-readable reason
  // ... additional call-related fields
}
```

**Example:**
```javascript
Vphone.mount({
  phoneUrl: 'phone/index.html',
  onCallEvent: function(event) {
    switch(event.phase) {
      case 'incoming':
        console.log('Incoming call from:', event.buddyId);
        // Widget will auto-expand due to expandOnIncomingCall: true
        break;
      case 'answered':
        console.log('Call answered');
        break;
      case 'ended':
        console.log('Call ended:', event.reasonText);
        break;
    }
  }
});
```

---

## Configuration Options

### Phone Configuration Object

Pass phone-specific configuration via the `config` option:

```javascript
Vphone.mount({
  phoneUrl: 'phone/index.html',
  config: {
    Language: 'en',
    WebSocketPort: 5066,
    wssServer: 'sip.example.com',
    ServerPath: 'ws',
    
    // Display options
    HideSettingsButton: false,
    HideRecordAllCallsButton: false,
    
    // Contact behavior
    ContactRowClickMode: 'call', // or 'edit'

    // Keyboard shortcuts
    KeyboardShortcuts: {
      answer: 'F2',
      hangup: 'Escape',
      hold: 'F4',
      mute: 'F6',
      transfer: 'F8',
      dialpad: 'F9'
    },
    
    // Auto-connect settings
    AutoAnswerPolicy: 'disabled',\n    // More config available in phone.js
  }
});
```

**Note:** See phone application documentation for complete list of supported configuration options.

---

### Vietnamese Media Configuration

To use Vietnamese UI labels for media controls (Speaker, Microphone, Camera, Ringtone), set:

```javascript
Vphone.mount({
  phoneUrl: 'phone/index.html',
  config: {
    Language: 'vi',

    // Media behavior
    AutoGainControl: true,
    EchoCancellation: true,
    NoiseSuppression: true,

    // Camera/display preferences
    maxFrameRate: 24,
    videoAspectRatio: '1.77', // 16:9
    VideoOrientation: 'rotateY(180deg)'
  }
});
```

Common Vietnamese media labels from `vi.json`:
- `audio_video`: `Âm thanh & Video`
- `speaker`: `Loa`
- `microphone`: `Micro`
- `camera`: `Camera`
- `ringtone`: `Nhạc chuông`
- `ring_device`: `Thiết bị đổ chuông`

---

## Modes & Layouts

### Floating Widget Mode (Default)

Creates a draggable floating widget in the bottom-right corner of the page.

```javascript
Vphone.mount({
  phoneUrl: 'phone/index.html',
  width: '300px',
  height: '500px',
  floating: true,
  startCollapsed: true,
  expandOnIncomingCall: true
});
```

**Features:**
- Compact floating button in corner
- Auto-expands on incoming calls
- User can manually collapse/expand
- Draggable position (via CSS)

---

### Inline Embedding Mode

Embeds phone directly in a specific container element.

```javascript
Vphone.mount({
  phoneUrl: 'phone/index.html',
  container: '#phone-container',
  width: '400px',
  height: '600px',
  floating: false
});
```

**HTML:**
```html
<div id="phone-container"></div>
```

**Features:**
- Direct embedding in page layout
- Flexible sizing via CSS
- Status indicator persistent
- No floating button

---

## Constants

### `Vphone.PHONE_MODES`

Enumeration of phone mode identifiers.

```javascript
{
  STANDALONE: 'standalone',  // Full page app mode
  EMBEDDED: 'embed',         // Default embed mode
  FLOATING: 'floating',      // Floating widget
  INLINE: 'inline'           // Inline container
}
```

---

### `Vphone.STATUS_COLORS`

Color values for status indicators.

```javascript
{
  ONLINE: '#22c55e',     // Green - Online/Registered
  OFFLINE: '#9ca3af',    // Gray - Offline/Not registered
  CONNECTING: '#f59e0b'  // Amber - Attempting connection
}
```

---

## Utility Functions

Access utility functions via `Vphone.utils`:

### `utils.safeClone(obj)`

Safely clone an object using JSON serialization.

```javascript
var config = { a: 1, b: 2 };
var copy = Vphone.utils.safeClone(config);
```

---

### `utils.createStatusDot([color])`

Create a status indicator dot element.

```javascript
var dot = Vphone.utils.createStatusDot('#22c55e');
document.body.appendChild(dot);
```

---

### `utils.buildIframeUrl(baseUrl, config, [mode])`

Build iframe URL with encoded configuration.

```javascript
var url = Vphone.utils.buildIframeUrl(
  'phone/index.html',
  { Language: 'en' },
  'embed'
);
```

---

### `utils.applyStatus(statusRefs, payload)`

Apply status to UI elements.

```javascript
var refs = {
  headerDot: document.querySelector('.status-dot'),
  headerText: document.querySelector('.status-text')
};

Vphone.utils.applyStatus(refs, {
  registered: true,
  text: 'Online'
});
```

---

## Library Information

### `Vphone.getInfo()`

Get library metadata.

```javascript
var info = Vphone.getInfo();
console.log(info);
/*
{
  name: 'VPhone',
  version: '0.3.34',
  libraryVersion: '1.0.0',
  description: 'WebRTC SIP phone library for web applications',
  repository: 'https://github.com/InnovateAsterisk/vphone',
  license: 'GNU Affero General Public License v3.0'
}
*/
```

---

### `Vphone.init([globalConfig])`

Initialize library (returns library object).

```javascript
var Vphone = Vphone.init({ debug: true });
// Logs initialization info to console
```

---

## Examples

### Example 1: Simple Floating Widget

```html
<!DOCTYPE html>
<html>
<head>
  <title>Phone App</title>
  <script src="lib/vphone.js"></script>
</head>
<body>
  <h1>My Application</h1>
  <p>Phone widget will appear in bottom-right corner...</p>

  <script>
    var phone = Vphone.mount({
      phoneUrl: 'phone/index.html'
    });
  </script>
</body>
</html>
```

---

### Example 2: Inline Embedding with Custom Config

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contact Center</title>
  <script src="lib/vphone.js"></script>
</head>
<body>
  <div class="layout">
    <div class="contacts">
      <!-- Contacts list here -->
    </div>
    <div id="phone-widget"></div>
  </div>

  <script>
    var phone = Vphone.mount({
      container: '#phone-widget',
      phoneUrl: 'phone/index.html',
      width: '400px',
      height: '600px',
      config: {
        Language: 'en',
        ContactRowClickMode: 'call'
      },
      onStatusChange: function(status) {
        console.log('Phone status:', status.text);
      },
      onCallEvent: function(event) {
        console.log('Call event:', event.phase);
      }
    });
  </script>
</body>
</html>
```

---

### Example 3: Programmatic Control

```javascript
// Mount floating widget
var phone = Vphone.mount({
  phoneUrl: 'phone/index.html',
  startCollapsed: true
});

// Expand on button click
document.getElementById('call-btn').addEventListener('click', function() {
  phone.expand();
});

// Collapse on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    phone.collapse();
  }
});

// Update status when API calls complete
fetch('/api/phone-status')
  .then(r => r.json())
  .then(data => {
    phone.setStatus(data.registered, data.text);
  });

// Clean up when leaving page
window.addEventListener('beforeunload', function() {
  phone.destroy();
});
```

---

### Example 4: Multiple Instances

```javascript
// Create multiple phone instances
var floatingPhone = Vphone.mount({
  phoneUrl: 'phone/index.html',
  floating: true
});

var inlinePhone = Vphone.mount({
  container: '#support-widget',
  phoneUrl: 'phone/index.html',
  width: '300px',
  height: '500px'
});

// Control them independently
floatingPhone.expand();
inlinePhone.setStatus(true, 'Support Available');
```

---

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (15+)
- IE 11: ❌ Not supported

---

## Dependencies

**Required:**
- Modern browser with WebRTC support
- SIP.js v0.20.0 (loaded by phone application)

**Optional:**
- jQuery (for enhanced DOM utils, loaded by phone application)
- Additional libraries loaded on-demand by phone app

---

## Accessibility

The library includes accessibility features:
- ARIA labels on controls (`aria-label`)
- Semantic HTML structure
- Keyboard navigation support (via phone app)
- Status indicator for screen readers

---

## Security

- Iframe sandboxing enabled
- Origin validation on postMessage
- Configuration sanitization
- CORS-safe request patterns

---

## Troubleshooting

### Phone widget not loading
- Check `phoneUrl` path is correct
- Verify CORS headers allow loading from your domain
- Check browser console for errors

### Callbacks not firing
- Ensure messageHandler is properly attached
- Check iframe postMessage origin matches
- Verify callbacks are not throwing errors

### Status not updating
- Confirm phone application is sending status messages
- Check `onStatusChange` callback is defined
- Verify messageHandler setup completed

---

## Support

**Repository:** https://github.com/InnovateAsterisk/vphone  
**Issues:** https://github.com/InnovateAsterisk/vphone/issues  
**License:** GNU Affero General Public License v3.0

---

## Changelog

### v1.0.0 (Current)
- Initial library release
- Full UMD (Universal Module Definition) support
- Floating and inline embedding modes
- Status indicator system
- Event callback system
- Comprehensive API documentation

### v0.3.34
- Base application version
- SIP/WebRTC phone functionality
- PWA support
- Internationalization







