# Click-To-Call API Reference

The Browser Phone library includes a powerful click-to-call API that allows you to initiate calls directly from your web application with minimal code.

---

## Overview

The `clickToCall()` method enables initiating outbound calls from the embedded phone widget. It supports:

- **Audio and video calls**
- **Custom caller information**
- **SIP header customization**
- **Automatic widget expansion** on floating mode
- **Full error handling** and validation

---

## Method Signature

```javascript
Vphone.mount({...}).clickToCall(numberToDial, [options])
```

### Parameters

#### `numberToDial` (string, required)
The phone number to dial. Can include leading '+', hyphens, spaces, etc. - will be sanitized automatically.

**Example:** `'5551234567'`, `'+1 (555) 123-4567'`, `'#123'`

#### `options` (object, optional)
Configuration object for the call.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `callType` | string | `'audio'` | Call type: `'audio'` or `'video'` |
| `callerName` | string | `null` | Display name for caller (shows in phone UI) |
| `extraHeaders` | array | `null` | Array of SIP headers to add to INVITE |
| `autoExpand` | boolean | `true` | Auto-expand floating widget when initiating |

### Return Value

**boolean** - `true` if call was initiated successfully, `false` otherwise

---

## Usage Examples

### Example 1: Simple Audio Call

```javascript
// Get phone instance
var phone = Vphone.mount({
    phoneUrl: 'Phone/index.html',
    floating: true,
    config: { /* ... */ }
});

// Make a simple audio call
phone.clickToCall('5551234567');
```

### Example 2: Audio Call with Display Name

```javascript
phone.clickToCall('5551234567', {
    callerName: 'John Smith',
    autoExpand: true
});
```

### Example 3: Video Call

```javascript
phone.clickToCall('5551234567', {
    callType: 'video',
    callerName: 'Support Agent',
    autoExpand: true
});
```

### Example 4: Call with Custom SIP Headers

```javascript
phone.clickToCall('5551234567', {
    callType: 'audio',
    callerName: 'Support Team',
    extraHeaders: [
        'X-Department: Support',
        'X-Ticket-ID: #12345',
        'X-Callback: true'
    ]
});
```

### Example 5: Button Integration

```html
<button onclick="makeCall('1001')">Call Extension 1001</button>

<script src="lib/vphone.js"></script>
<script>
    var phone = Vphone.mount({
        phoneUrl: 'Phone/index.html',
        floating: true,
        config: { /* ... */ }
    });

    function makeCall(number) {
        var success = phone.clickToCall(number, {
            callerName: 'Web User',
            autoExpand: true
        });
        
        if(success) {
            console.log('Call initiated to: ' + number);
        } else {
            console.error('Failed to initiate call');
        }
    }
</script>
```

### Example 6: Contact List Integration

```javascript
// From a contact list/directory
document.querySelectorAll('.contact-card').forEach(function(card) {
    var callBtn = card.querySelector('.call-button');
    var number = card.dataset.phoneNumber;
    var name = card.dataset.contactName;
    
    callBtn.addEventListener('click', function() {
        phone.clickToCall(number, {
            callerName: name,
            autoExpand: true
        });
    });
});
```

### Example 7: CRM Integration with Call Context

```javascript
function initiateCallFromCRM(leadId, leadName, phoneNumber) {
    var success = phone.clickToCall(phoneNumber, {
        callType: 'audio',
        callerName: leadName,
        extraHeaders: [
            'X-CRM-Lead-ID: ' + leadId,
            'X-CRM-Timestamp: ' + new Date().toISOString()
        ],
        autoExpand: true
    });
    
    if(success) {
        // Log call initiation in CRM
        logCRMEvent('outbound_call_initiated', { leadId, leadName, phoneNumber });
    }
}
```

### Example 8: Error Handling

```javascript
function makeCallWithErrors(number) {
    // Validate number
    if(!number || number.trim() === '') {
        alert('Please enter a valid phone number');
        return;
    }
    
    // Attempt call
    var result = phone.clickToCall(number, {
        callerName: 'Test User',
        autoExpand: true
    });
    
    if(!result) {
        // Handle failure
        console.error('Call initiation failed');
        console.log('Possible reasons:');
        console.log('- Phone widget not yet loaded');
        console.log('- Invalid phone number');
        console.log('- IFrame communication issue');
        
        // Show error to user
        alert('Failed to initiate call. Please try again.');
    }
}
```

---

## SIP Headers

### Custom Headers Format

Headers must be in the format: `"Header-Name: Header-Value"`

**Important:** Include the space after the colon.

```javascript
// Correct ✓
extraHeaders: ['X-Custom: value']

// Incorrect ✗
extraHeaders: ['X-Custom:value']  // Missing space after colon
```

### Common SIP Headers

#### Standard Headers

| Header | Purpose | Example |
|--------|---------|---------|
| `P-Asserted-Identity` | Asserted caller identity | `P-Asserted-Identity: "John Doe" <sip:1001@domain.com>` |
| `X-Name` | Custom name header | `X-Name: John Doe` |
| `X-Source` | Call source | `X-Source: Web App` |
| `X-Priority` | Call priority | `X-Priority: high` |

#### Custom Headers (Asterisk/FreeSWITCH)

```javascript
extraHeaders: [
    'X-Department: Support',
    'X-Agent-ID: agent123',
    'X-Call-Type: callback',
    'X-Customer-ID: cust456',
    'X-App-Version: 1.0'
]
```

---

## Error Handling

### Common Issues

#### 1. Phone Widget Not Loaded

**Error:** Call fails immediately after mounting

**Solution:** Wait for phone registration before making calls

```javascript
var phone = Vphone.mount({ /* ... */ });

// Wait for registration
setTimeout(function() {
    phone.clickToCall('5551234567');
}, 2000);

// OR use status callback
var phone = Vphone.mount({
    /* ... */
    onStatusChange: function(status) {
        if(status.registered) {
            // Now it's safe to make calls
            console.log('Ready to make calls');
        }
    }
});
```

#### 2. Invalid Phone Number

**Error:** Phone number contains invalid characters

**Solution:** The library sanitizes numbers automatically, but ensure valid format

```javascript
// Valid formats
phone.clickToCall('5551234567');           // Plain number
phone.clickToCall('+1 555 123 4567');      // With formatting
phone.clickToCall('ext-1001');             // Extension
phone.clickToCall('#123');                 // With hash
```

#### 3. IFrame Communication

**Error:** postMessage fails silently

**Solution:** Check browser console for errors, ensure same-origin policy if applicable

```javascript
// Add error logging
window.addEventListener('error', function(e) {
    console.error('Global error:', e.message);
});

// Check iframe accessibility
var result = phone.clickToCall('5551234567');
if(!result) {
    console.log('Check: Is phone iframe loaded?');
    console.log('Check: Are you on HTTPS?');
    console.log('Check: Browser console for postMessage errors');
}
```

---

## Best Practices

### 1. Always Validate Input

```javascript
function safeClickToCall(number, name) {
    // Validate number
    if(!number || number.trim() === '') {
        console.error('Invalid phone number');
        return false;
    }
    
    // Sanitize name
    name = (name || '').substring(0, 100);
    
    // Make call
    return phone.clickToCall(number, {
        callerName: name,
        autoExpand: true
    });
}
```

### 2. Provide User Feedback

```javascript
function makeCallWithFeedback(number) {
    console.log('Initiating call to:', number);
    
    var startTime = performance.now();
    var result = phone.clickToCall(number, {
        callerName: 'Web User',
        autoExpand: true
    });
    
    var duration = performance.now() - startTime;
    console.log('Call initiation took:', duration.toFixed(2), 'ms');
    console.log('Result:', result ? 'Success' : 'Failed');
    
    // Update UI
    if(result) {
        showNotification('Call initiated to: ' + number);
    } else {
        showError('Failed to initiate call');
    }
}
```

### 3. Log for Debugging

```javascript
function clickToCallWithLogging(number, options) {
    options = options || {};
    
    console.log('clickToCall details:', {
        number: number,
        callerName: options.callerName || 'Anonymous',
        callType: options.callType || 'audio',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    });
    
    return phone.clickToCall(number, options);
}
```

### 4. Handle Registration State

```javascript
var isRegistered = false;

var phone = Vphone.mount({
    /* ... */
    onStatusChange: function(status) {
        isRegistered = status.registered;
        updateUIState(status);
    }
});

function makeCallSafely(number) {
    if(!isRegistered) {
        alert('Phone not registered. Please wait...');
        return false;
    }
    
    return phone.clickToCall(number, {
        autoExpand: true
    });
}
```

### 5. Disable During Active Calls

```javascript
var activeCall = false;

var phone = Vphone.mount({
    /* ... */
    onCallEvent: function(event) {
        activeCall = (event.phase === 'answered' || event.phase === 'progress');
        updateCallButtons();
    }
});

function makeCallIfAvailable(number) {
    if(activeCall) {
        alert('Finish current call before making a new one');
        return false;
    }
    
    return phone.clickToCall(number, { autoExpand: true });
}

function updateCallButtons() {
    document.querySelectorAll('.call-button').forEach(function(btn) {
        btn.disabled = activeCall;
    });
}
```

---

## Integration Examples

### Click-To-Call Button

```html
<button class="call-button" data-number="5551234567" data-name="John Doe">
    <i class="fa fa-phone"></i> Call Now
</button>

<script>
document.querySelectorAll('.call-button').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var number = btn.dataset.number;
        var name = btn.dataset.name;
        
        phone.clickToCall(number, {
            callerName: name,
            autoExpand: true
        });
    });
});
</script>
```

### Click-To-Call Link

```html
<a href="javascript:makeCall('5551234567')" class="call-link">Call Support</a>

<script>
function makeCall(number) {
    phone.clickToCall(number, {
        callerName: 'Customer',
        autoExpand: true
    });
}
</script>
```

### Contact Card

```html
<div class="contact-card" data-phone="5551234567" data-name="Support Team">
    <h3>Support Team</h3>
    <p>support@example.com</p>
    <button onclick="callContact(this)">Call Now</button>
</div>

<script>
function callContact(button) {
    var card = button.closest('.contact-card');
    var phone_number = card.dataset.phone;
    var name = card.dataset.name;
    
    phone.clickToCall(phone_number, {
        callerName: name,
        extraHeaders: ['X-Source: ContactCard'],
        autoExpand: true
    });
}
</script>
```

---

## Troubleshooting

### Call doesn't initiate
1. Check browser console for errors
2. Verify phone widget is registered (check status indicator)
3. Test with simple number first
4. Check for CORS/CSP issues

### Widget doesn't expand
1. Verify `autoExpand: true` in options
2. Check floating widget is properly mounted
3. Verify no CSS conflicts with z-index

### Headers not received
1. Check header format (must include space after colon)
2. Verify SIP server supports custom headers
3. Check server configuration for header handling

### Performance issues
1. Don't spam calls in rapid succession
2. Wait 1-2 seconds between calls
3. Check browser console for memory leaks
4. Monitor network tab for errors

---

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ❌ Internet Explorer (not supported)

---

## Security Considerations

- **Validate all input** before passing to clickToCall
- **Sanitize phone numbers** to prevent injection
- **Don't embed credentials** in caller name or headers
- **Use HTTPS** for production deployments
- **Limit header values** to prevent abuse
- **Log calls responsibly** - don't log sensitive data

---

## See Also

- [Browser Phone Library API Reference](LIBRARY_API.md)
- [Configuration Profiles](../examples/config-profiles.js)
- [Usage Examples](../examples/)
- [Quick Start Guide](../../archive/examples/QUICK_START.md)


