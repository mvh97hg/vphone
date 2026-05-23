# Browser Phone Library Examples

Comprehensive examples and configuration profiles for the VPhone library (vphone.js).

## Files

### `demo.html`
**Comprehensive Interactive Demo**

A feature-rich HTML page demonstrating all aspects of the VPhone library with:

- **Two mounting modes**: Floating widget and inline embedding
- **Live configuration editors**: Change settings in real-time
- **Event monitoring**: Watch real-time events with detailed logging
- **Programmatic control**: Call API methods directly
- **Code examples**: Copy-paste ready code snippets
- **Six interactive sections**:
  1. Floating Widget Control
  2. Inline Phone Embedding
  3. SIP Configuration
  4. UI & Appearance Customization
  5. Programmatic API Control
  6. Event Monitoring

**How to use:**
1. Open `demo.html` in a web browser
2. Each section has interactive controls to test features
3. View the Event Log to see real-time events
4. Copy code examples for your own projects
5. Apply configurations to test different scenarios

**Features:**
- 🎯 Floating widget launcher button
- 📱 Inline phone embedding in container
- ⚙️ Live configuration editors
- 📊 Real-time event logging with statistics
- 💻 Copy-paste code examples
- 🔄 Easy reset and destroy controls

---

### `config-profiles.js`
**Configuration Profile Library**

Pre-configured settings for common deployment scenarios:

#### Included Profiles

1. **minimal**
   - Bare minimum settings
   - Best for: Testing and basic deployments

2. **standardFloating**
   - Professional floating widget
   - Best for: Web applications with side-bar integration

3. **standardInline**
   - Phone in page layout
   - Best for: Direct embedding in web pages

4. **contactCenter**
   - Full-featured contact center setup
   - Features: Recording, transfers, conference, screen share
   - Best for: Call center environments

5. **enterprise**
   - Full-featured with security focus
   - Features: All enabled, security hardened
   - Best for: Enterprise deployments

6. **healthcare**
   - HIPAA-compliant settings
   - Features: Mandatory recording, encryption
   - Best for: Healthcare providers

7. **mobileResponsive**
   - Responsive design optimized for mobile
   - Best for: Mobile web applications

8. **development**
   - All features enabled with debug logging
   - Best for: Development and testing

9. **saas** (Function)
   - Multi-tenant SaaS configuration
   - Best for: SaaS applications with multiple customers

10. **complete**
    - All possible configuration options documented
    - Best for: Reference and custom configurations

#### Helper Functions

```javascript
// Merge profiles with overrides
mergeConfig(baseProfile, overrides)

// Validate configuration
validateConfig(config)

// Create custom configuration
createCustomConfig(options)
```

---

## Quick Start Examples

### 1. Simple Floating Widget

```html
<!-- Load library -->
<script src="../lib/vphone.js"></script>

<!-- Load config profiles -->
<script src="config-profiles.js"></script>

<!-- Mount using predefined profile -->
<script>
  var phone = Vphone.mount(PhoneConfigProfiles.standardFloating);
</script>
```

### 2. Inline Embedding

```html
<!-- Container -->
<div id="phone-widget"></div>

<!-- Load library and config -->
<script src="../lib/vphone.js"></script>
<script src="config-profiles.js"></script>

<!-- Mount in container -->
<script>
  var phone = Vphone.mount(PhoneConfigProfiles.standardInline);
</script>
```

### 3. Contact Center Setup

```javascript
var phone = Vphone.mount(PhoneConfigProfiles.contactCenter);
```

### 4. Enterprise Deployment

```javascript
var phone = Vphone.mount(PhoneConfigProfiles.enterprise);
```

### 5. Multi-Tenant SaaS

```javascript
var config = PhoneConfigProfiles.saas('tenant-123', {
    companyName: 'Acme Corp',
    sipServer: 'sip.acme.example.com',
    language: 'en',
    enableRecording: true
});

var phone = Vphone.mount(config);
```

### 6. Custom Configuration

```javascript
// Start with a profile
var config = mergeConfig(PhoneConfigProfiles.standardFloating, {
    width: '400px',
    height: '600px',
    config: {
        Language: 'es',
        WebSocketPort: 5066,
        wssServer: 'sip.custom.com'
    }
});

var phone = Vphone.mount(config);
```

### 7. Configuration with Callbacks

```javascript
var config = PhoneConfigProfiles.standardFloating;
config.onStatusChange = function(status) {
    console.log('Status:', status.text);
    updateUI(status.registered);
};

config.onCallEvent = function(event) {
    switch(event.phase) {
        case 'incoming':
            phone.expand();
            break;
        case 'ended':
            logCall(event);
            break;
    }
};

var phone = Vphone.mount(config);
```

---

## Configuration Options Explained

### Mounting Options

```javascript
{
    // Entry point to phone application
    phoneUrl: 'phone/index.html',
    
    // Mount mode
    floating: true,                  // Floating widget or inline
    container: '#phone-div',         // Container for inline mode
    
    // Dimensions
    width: '300px',
    height: '500px',
    
    // Widget behavior
    startCollapsed: true,            // Hidden on start (floating only)
    expandOnIncomingCall: true,      // Show on incoming call
    showStatus: true,                // Display online/offline
    title: 'Browser Phone',          // Accessibility title
    
    // Callbacks
    onStatusChange: function(status) {},
    onCallEvent: function(event) {}
}
```

### Phone Configuration Options

```javascript
config: {
    // Server Settings
    Language: 'en',                  // Language pack to load
    WebSocketPort: 5066,             // SIP server WebSocket port
    wssServer: 'sip.example.com',    // SIP server domain
    ServerPath: 'ws',                // WebSocket path
    
    // Security
    UseDTLSMediaEncryption: true,    // Encrypt media stream
    RequireSIPAuthentication: true,  // Require authentication
    DisallowAnonymousCalls: false,   // Block anonymous calls
    
    // Session Management
    RegisterExpires: 600,            // Registration timeout (seconds)
    
    // Features
    EnableVideoCalling: true,           // Video calling support
    EnableTransfer: true,        // Call transfer (blind & attended)
    EnableConference: true,          // 3-way conference
    RecordAllCalls: true,      // Recording all calls
    CallRecordingPolicy: 'allow',      // Call recording UI policy
    EnableTextMessaging: true,        // Text messaging
    
    // Behavior
    DefaultCallRecording: 'ask',     // Recording default: 'ask', 'always', 'never'
    CallHistoryLines: 100,           // Call history size
    ContactRowClickMode: 'call',     // Click action: 'call' or 'edit'
    
    // UI Customization
    HideSettingsButton: false,       // Hide settings in UI
}
```

---

## SIP Server Configuration

To connect to your SIP server:

1. Update `wssServer` to your server domain
2. Set `WebSocketPort` to your server's WebSocket port
3. Provide credentials via phone settings
4. Optionally enable DTLS encryption
5. Configure session timeout values

### Example Asterisk Configuration

```javascript
config: {
    WebSocketPort: 5066,
    wssServer: 'asterisk.mydomain.com',
    ServerPath: 'ws',
    Language: 'en'
}
```

### Example FreeSWITCH Configuration

```javascript
config: {
    WebSocketPort: 5066,
    wssServer: 'freeswitch.mydomain.com',
    ServerPath: 'ws',
    UseDTLSMediaEncryption: true
}
```

---

## Event Handling

### Status Change Events

```javascript
onStatusChange: function(status) {
    // status.registered - boolean, is phone registered?
    // status.text - string, status message
    console.log('Online:', status.registered);
}
```

### Call Event Types

```javascript
onCallEvent: function(event) {
    switch(event.phase) {
        case 'incoming':
            // New incoming call
            console.log('Call from:', event.buddyId);
            break;
            
        case 'answered':
            // Call has been answered
            console.log('Call answered');
            break;
            
        case 'ended':
            // Call has ended
            console.log('Call ended:', event.reasonText);
            break;
            
        case 'transferred':
            // Call was transferred
            break;
            
        case 'transferred-from':
            // Call was transferred to you
            break;
    }
}
```

---

## Programmatic Control

After mounting, control the phone via API:

```javascript
var phone = Vphone.mount(config);

// Widget control
phone.expand();                        // Show widget
phone.collapse();                      // Hide widget
phone.toggle();                        // Toggle visibility
phone.isCollapsed();                   // Check if hidden

// Status management
phone.setStatus(true, 'Available');   // Set online with custom text
phone.setStatus(false, 'In a meeting'); // Set offline with reason

// Cleanup
phone.destroy();                       // Remove widget from DOM
```

---

## Best Practices

1. **Always validate configuration before mounting**
   ```javascript
   const validation = validateConfig(myConfig);
   if (!validation.valid) console.error(validation.errors);
   ```

2. **Use profiles as starting points**
   - Choose the closest profile to your needs
   - Customize with mergeConfig()

3. **Implement error handling**
   ```javascript
   try {
       var phone = Vphone.mount(config);
   } catch(e) {
       console.error('Failed to mount phone:', e);
   }
   ```

4. **Test in target environment**
   - Different SIP servers have different configurations
   - Test with your specific server setup

5. **Use callbacks for integration**
   - onStatusChange() for registration status
   - onCallEvent() for call-handling logic

6. **Secure credentials**
   - Never hardcode passwords in client code
   - Use provisioning endpoints to deliver credentials
   - Use HTTPS for all connections

---

## Troubleshooting

### Phone won't connect
- Verify WebSocket port is correct
- Check if SIP server is accessible
- Ensure CORS headers allow the connection
- Check browser console for errors

### Events not firing
- Verify callback functions are defined
- Check that phone is properly mounted
- Ensure callbacks don't throw errors
- Monitor browser console for issues

### Configuration not applying
- Validate configuration syntax
- Check that all required fields are present
- Use validateConfig() to find issues
- Refer to complete profile for all options

---

## File Structure

```
examples/
├── demo.html              # Interactive demo application
├── config-profiles.js     # Configuration profiles library
└── README.md             # This file
```

---

## Testing

To test the examples:

1. **Test with demo.html**
   - Open in web browser
   - Try all interactive controls
   - Monitor event log
   - Copy code examples

2. **Test with config-profiles.js**
   - Load profiles in browser console
   - Validate with validateConfig()
   - Mount different profiles
   - Compare behaviors

3. **Test with real SIP server**
   - Configure wssServer to your server
   - Verify credentials
   - Test incoming/outgoing calls
   - Monitor WebSocket connection

---

## Support

For questions about examples:
- See `docs/library/LIBRARY_API.md` for complete API reference
- Check `README.md` for project overview
- Review `Phone/index.html` for phone application docs

---

## Version Information

- **Library Version:** 1.0.0
- **App Version:** 0.3.34
- **License:** GNU Affero General Public License v3.0

---

**Last Updated:** March 19, 2026





