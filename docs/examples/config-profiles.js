/**
 * Browser Phone Library - Configuration Profiles
 * 
 * Predefined configuration profiles for common deployment scenarios.
 * Use these as templates for your own configurations.
 * 
 * @version 1.0.0
 * @license GNU Affero General Public License v3.0
 */

const PhoneConfigProfiles = {

    /**
     * Minimal Configuration
     * Bare minimum settings for a basic phone widget
     */
    minimal: {
        phoneUrl: 'phone/index.html',
        floating: true,
        mountOptions: {
            title: 'Phone',
            showStatus: true
        },
        config: {
            Language: 'en'
        }
    },

    /**
     * Standard Floating Widget
     * Professional floating widget for web applications
     */
    standardFloating: {
        phoneUrl: 'phone/index.html',
        floating: true,
        width: '300px',
        height: '500px',
        startCollapsed: true,
        expandOnIncomingCall: true,
        title: 'Browser Phone',
        showStatus: true,
        config: {
            Language: 'en',
            WebSocketPort: 5066,
            wssServer: 'sip.example.com',
            ServerPath: 'ws',
        }
    },

    /**
     * Standard Inline Embedding
     * Phone embedded directly in page layout
     */
    standardInline: {
        phoneUrl: 'phone/index.html',
        floating: false,
        container: '#phone-container',
        width: '400px',
        height: '600px',
        showStatus: true,
        title: 'Browser Phone',
        config: {
            Language: 'en',
            WebSocketPort: 5066,
            wssServer: 'sip.example.com',
            ServerPath: 'ws',
        }
    },

    /**
     * Contact Center Configuration
     * Configuration optimized for contact center/call center environments
     */
    contactCenter: {
        phoneUrl: 'phone/index.html',
        floating: false,
        container: '#phone-panel',
        width: '100%',
        height: '800px',
        showStatus: true,
        title: 'Contact Center Phone',
        config: {
            Language: 'en',
            WebSocketPort: 5066,
            wssServer: 'sip.company.com',
            ServerPath: 'ws',
            
            // Enable all features for contact center
            RecordAllCalls: true,
            EnableTransfer: true,
            EnableConference: true,
            CallRecordingPolicy: 'allow',
            
            // Behavior settings
            
            // UI customization
            HideSettingsButton: false,
            ContactRowClickMode: 'call'
        }
    },

    /**
     * Enterprise Configuration
     * Full-featured enterprise deployment with security
     */
    enterprise: {
        phoneUrl: 'phone/index.html',
        floating: false,
        container: '#phone-widget',
        width: '450px',
        height: '700px',
        title: 'Enterprise Phone System',
        showStatus: true,
        expandOnIncomingCall: true,
        config: {
            Language: 'en',
            
            // Server settings with security
            WebSocketPort: 5066,
            wssServer: 'sip.enterprise.com',
            ServerPath: 'ws',
            
            // Fail-safe settings
            TransportReconnectionAttempts: 999,
            TransportReconnectionTimeout: 3000,
            TransportConnectionTimeout: 15000,
            
            // Feature enablement
            RecordAllCalls: true,
            EnableTransfer: true,
            EnableConference: true,
            EnableVideoCalling: true,
            CallRecordingPolicy: 'allow',
            EnableTextMessaging: true,
            
            // Default behaviors
            RegisterExpires: 600,
            
            // UI settings
            HideSettingsButton: true,
            HideRecordAllCallsButton: false,
            ContactRowClickMode: 'call',
            
            // Security/Compliance
        }
    },

    /**
     * Healthcare Configuration
     * HIPAA-compliant configuration for healthcare environments
     */
    healthcare: {
        phoneUrl: 'phone/index.html',
        floating: false,
        container: '#healthcare-phone',
        width: '400px',
        height: '600px',
        title: 'Medical Phone System',
        showStatus: true,
        config: {
            Language: 'en',
            
            // Secure connection required
            WebSocketPort: 5066,
            wssServer: 'sip.healthcare.provider.com',
            ServerPath: 'ws',
            
            // Feature enablement
            RecordAllCalls: true,
            CallRecordingPolicy: 'allow',
            EnableVideoCalling: false,  // May disable for compliance
            EnableTransfer: true,
            
            // Compliance settings
            
            // UI restrictions for compliance
            HideSettingsButton: false,
            HideRecordAllCallsButton: true,
            ContactRowClickMode: 'call'
        }
    },

    /**
     * Mobile/Responsive Configuration
     * Optimized for mobile and responsive web applications
     */
    mobileResponsive: {
        phoneUrl: 'phone/index.html',
        floating: true,
        width: '100vw',
        height: '100vh',
        startCollapsed: false,
        title: 'Mobile Phone',
        config: {
            Language: 'en',
            WebSocketPort: 5066,
            wssServer: 'sip.example.com',
            ServerPath: 'ws',
            
            // Mobile optimizations
            EnableVideoCalling: true,
            
            // Responsive settings
            HideSettingsButton: true,
        }
    },

    /**
     * Development/Testing Configuration
     * Settings for development and testing environments
     */
    development: {
        phoneUrl: 'phone/index.html',
        floating: true,
        width: '350px',
        height: '550px',
        title: 'Dev Phone',
        config: {
            Language: 'en',
            WebSocketPort: 5066,
            wssServer: 'localhost',
            ServerPath: 'ws',
            
            // Enable all features for testing
            RecordAllCalls: true,
            EnableVideoCalling: true,
            EnableTransfer: true,
            EnableConference: true,
            CallRecordingPolicy: 'allow',
            
            // Debug settings
            HideSettingsButton: false,
        }
    },

    /**
     * Multi-Tenant SaaS Configuration
     * For SaaS applications serving multiple customers
     */
    saas: function(tenantId, tenantConfig) {
        return {
            phoneUrl: 'phone/index.html',
            floating: true,
            width: '320px',
            height: '520px',
            startCollapsed: true,
            expandOnIncomingCall: true,
            title: tenantConfig.companyName + ' Phone',
            config: {
                Language: tenantConfig.language || 'en',
                WebSocketPort: tenantConfig.port || 5066,
                wssServer: tenantConfig.sipServer,
                ServerPath: 'ws',
                
                // Tenant-specific settings
                
                // Feature enablement per tenant
                RecordAllCalls: tenantConfig.enableRecording === true,
                EnableVideoCalling: tenantConfig.enableVideo !== undefined ? tenantConfig.enableVideo : true,
                
                // Branding
            }
        };
    },

    /**
     * Advanced Custom Configuration
     * Complete configuration with all possible options
     */
    complete: {
        // Mounting options
        phoneUrl: 'phone/index.html',
        floating: true,
        container: null,
        width: '320px',
        height: '520px',
        title: 'Browser Phone',
        
        // Widget behavior
        showStatus: true,
        startCollapsed: true,
        expandOnIncomingCall: true,
        
        // Event callbacks
        onStatusChange: function(status) {
            console.log('Status changed:', status);
            // Handle status updates
        },
        
        onCallEvent: function(event) {
            console.log('Call event:', event);
            switch (event.phase) {
                case 'incoming':
                    console.log('Incoming call from:', event.buddyId);
                    break;
                case 'answered':
                    console.log('Call answered');
                    break;
                case 'ended':
                    console.log('Call ended:', event.reasonText);
                    break;
            }
        },
        
        // Phone application configuration
        config: {
            // Language & Localization
            Language: 'en',
            
            // Server connection
            WebSocketPort: 5066,
            wssServer: 'sip.example.com',
            ServerPath: 'ws',
            
            // Security
            
            // Transport settings
            TransportConnectionTimeout: 15000,
            TransportReconnectionTimeout: 3000,
            TransportReconnectionAttempts: 999,
            
            // Session management
            RegisterExpires: 600,
            
            // Feature flags
            EnableVideoCalling: true,
            EnableTransfer: true,
            EnableConference: true,
            RecordAllCalls: true,
            CallRecordingPolicy: 'allow',
            EnableTextMessaging: true,
            
            // Behavior
            ContactRowClickMode: 'call',  // 'call' or 'edit'
            
            // UI customization
            HideSettingsButton: false,
            HideRecordAllCallsButton: false,
            
            // Advanced settings
        }
    }
};

/**
 * Helper function to merge configurations
 * 
 * @param {Object} baseConfig - Base configuration
 * @param {Object} overrides - Settings to override
 * @returns {Object} Merged configuration
 */
function mergeConfig(baseConfig, overrides) {
    return {
        ...baseConfig,
        ...overrides,
        config: {
            ...baseConfig.config,
            ...(overrides.config || {})
        }
    };
}

/**
 * Helper function to validate configuration
 * 
 * @param {Object} config - Configuration to validate
 * @returns {Object} { valid: boolean, errors: [] }
 */
function validateConfig(config) {
    const errors = [];
    
    if (!config.phoneUrl) {
        errors.push('phoneUrl is required');
    }
    
    if (config.floating === false && !config.container) {
        errors.push('container is required when floating is false');
    }
    
    if (config.config && config.config.wssServer && !config.config.WebSocketPort) {
        errors.push('WebSocketPort should be specified if wssServer is set');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Helper function to create custom configuration
 * 
 * @param {Object} options - Custom options
 * @returns {Object} Configuration object
 */
function createCustomConfig(options) {
    const config = PhoneConfigProfiles.complete;
    return mergeConfig(config, options);
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================
/*

// 1. Use a predefined profile
const phone1 = Vphone.mount(PhoneConfigProfiles.standardFloating);

// 2. Use a predefined profile with overrides
const customConfig = mergeConfig(PhoneConfigProfiles.standardFloating, {
    width: '400px',
    height: '600px'
});
const phone2 = Vphone.mount(customConfig);

// 3. Use SaaS multi-tenant configuration
const tenantPhone = Vphone.mount(
    PhoneConfigProfiles.saas('tenant-123', {
        sipServer: 'sip.acme.example.com',
        language: 'es',
        enableRecording: true
    })
);

// 4. Validate configuration before use
const config = PhoneConfigProfiles.enterprise;
const validation = validateConfig(config);
if (validation.valid) {
    const phone = Vphone.mount(config);
} else {
    console.error('Invalid configuration:', validation.errors);
}

*/



