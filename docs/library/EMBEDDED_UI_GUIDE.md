# Browser Phone - Single File Embedded Distribution

## What is This?

This is the minified, single-file distribution of Browser Phone Library with **all UI assets embedded** as a data URI. You only need **one file**: `vphone.min.js`

## Quick Start

### 1. Simple HTML Page

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Phone Widget Demo</title>
    <style>
        body { font-family: Arial, sans-serif; }
        #phone-widget { position: fixed; right: 20px; bottom: 20px; }
    </style>
</head>
<body>
    <h1>Welcome to My App</h1>
    <p>Check the bottom-right corner for the phone widget!</p>

    <!-- That's it! Just one script tag needed -->
    <script src="vphone.min.js"></script>

    <script>
        // Mount the phone widget
        var phone = Vphone.mount({
            floating: true,
            startCollapsed: true,
            config: {
                Language: 'vi',              // Vietnamese UI
                wssServer: 'your-pbx.com',  // Your PBX server
                WebSocketPort: 4443,
                ServerPath: '/ws',
                SipUsername: '1001',
                SipPassword: 'your-password'
            }
        });

        // Optional: Make calls programmatically
        document.addEventListener('DOMContentLoaded', function() {
            // Auto-login after page loads
            // phone.makeCall('1002');  // Uncomment to test
        });
    </script>
</body>
</html>
```

### 2. Deployment

**Option A: Local Testing (Python)**
```bash
cd /path/to/where/vphone.min.js/is
python -m http.server 8080
# Visit http://localhost:8080/your-page.html
```

**Option B: Web Server (Nginx)**
```nginx
server {
    listen 80;
    server_name example.com;
    
    root /var/www/myapp;
    
    # vphone.min.js is served as static file
    location / {
        try_files $uri $uri/ =404;
    }
}
```

**Option C: CDN (jsDelivr, unpkg, etc)**
```html
<!-- Using CDN (if published) -->
<script src="https://cdn.example.com/vphone.min.js"></script>
```

## Features

✅ **Single 1.2 MB File** (~300 KB gzipped)  
✅ **All UI Included** - HTML, CSS, JavaScript  
✅ **14 Languages** - en, vi, de, es, fr, he, ja, nl, pl, pt-br, ru, tr, zh-hans, zh  
✅ **Icons & Assets** - SVG icons, service worker  
✅ **Zero External Dependencies** - No separate Phone/ directory needed  
✅ **Progressive Web App Ready** - Includes manifest and service worker  

## Configuration Options

```javascript
var phone = Vphone.mount({
    // UI Mode
    floating: true,              // true = floating widget, false = inline
    startCollapsed: true,        // Start minimized?
    expandOnIncomingCall: true,  // Auto-expand on incoming call?
    
    // These are passed to the Phone UI
    config: {
        Language: 'vi',          // Change UI language
        wssServer: 'your-pbx',   // PBX WebSocket server
        WebSocketPort: 4443,     // WebSocket port
        ServerPath: '/ws',       // WebSocket path
        SipUsername: '1001',     // User extension
        SipPassword: 'pass',     // User password
        SipDomain: 'pbx.local',  // SIP domain (optional)
        
        // Advanced
        AutoGainControl: true,   // Noise control
        EchoCancellation: true,  // Echo control
        NoiseSuppression: true   // Noise control
    },
    
    // Event handlers
    onStatusChange: function(status) {
        console.log('Phone status:', status);
    },
    onCallEvent: function(event) {
        console.log('Call event:', event);
    }
});
```

## Making Calls Programmatically

```javascript
// Using instance method
var result = phone.makeCall('1001', ['X-Custom-Header: value'], 'audio');

// Using global method
var result = Vphone.makeCall('1001', {
    callType: 'video',  // 'audio' or 'video'
    headerS: ['X-Agent: MyApp']
});

// Simple form example
document.getElementById('callBtn').onclick = function() {
    var number = prompt('Enter extension to call:');
    if (number) {
        phone.makeCall(number, [], 'audio');
    }
};
```

## Supported Languages

The embedded distribution includes these language packs:

| Code | Language |
|------|----------|
| en | English |
| vi | Tiếng Việt |
| de | Deutsch |
| es | Español |
| fr | Français |
| he | עברית |
| ja | 日本語 |
| nl | Nederlands |
| pl | Polski |
| pt-br | Português Brasil |
| ru | Русский |
| tr | Türkçe |
| zh-hans | 简体中文 |
| zh | 繁體中文 |

Change language by setting `config.Language`:
```javascript
Vphone.mount({
    config: {
        Language: 'vi'  // Vietnamese
    }
});
```

## Troubleshooting

**Q: Widget doesn't appear**  
A: Check browser console for errors. Make sure you're using HTTPS (or localhost) - WebRTC requires secure context.

**Q: Can't connect to PBX**  
A: Verify `wssServer`, `WebSocketPort`, and `ServerPath` are correct. Check PBX firewall allows WSS connections.

**Q: Want to use external UI instead**  
A: You can still point to external Phone UI:
```javascript
Vphone.mount({
    phoneUrl: 'https://cdn.example.com/phone/index.html',
    floating: true
    // ...
});
```

**Q: File size is too large**  
A: The 1.2 MB file compresses to ~300 KB gzipped. Enable gzip compression on your web server.

## Technical Details

- **Format**: Self-extracting data URI (no extraction needed, browser handles it automatically)
- **Dependencies**: SIP.js (loaded from CDN), jQuery (loaded from CDN)
- **Browser Support**: Modern browsers with WebRTC support (Chrome, Firefox, Edge, Safari 11+)
- **Protocol**: WebRTC over WebSocket Secure (WSS)

## Building From Source

If you modify the Phone UI and want to rebuild:

```bash
# In vphone/lib directory
npm install

# Build pipeline
npm run build:embedded    # Create embedded-ui-data.js
npm run build:combined    # Create vphone.combined.js
npm run build:min         # Minify to vphone.min.js

# Or all at once
npm run build:release
```

## Support & Documentation

- Full API: See [LIBRARY_API.md](./LIBRARY_API.md)
- GitHub: https://github.com/mvh97hg/vphone
- License: GNU Affero General Public License v3.0

---

**Version**: 1.0.0 (App: 0.3.34)



