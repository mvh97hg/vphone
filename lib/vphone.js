/**
 * ============================================================================
 *                        Browser Phone Library
 * ============================================================================
 *
 * DOM-first single-file embedding runtime.
 *
 * @license GNU Affero General Public License v3.0
 * @copyright 2020-2026 Conrad de Wet & Contributors
 * @version 0.3.34
 * @repository https://github.com/mvh97hg/vphone
 *
 * ============================================================================
 */

(function(global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(global);
    } else if (typeof define === 'function' && define.amd) {
        define([], function() { return factory(global); });
    } else {
        var api = factory(global);
        global.Vphone = api;
        global.BrowserPhone = api;
    }
}(typeof window !== 'undefined' ? window : global, function(global) {
    'use strict';

    var VERSION = '0.3.34';
    var LIBRARY_VERSION = '1.0.0';

    var PHONE_MODES = {
        STANDALONE: 'standalone',
        EMBEDDED: 'embed',
        FLOATING: 'floating',
        INLINE: 'inline'
    };

    var STATUS_COLORS = {
        ONLINE: '#22c55e',
        OFFLINE: '#9ca3af',
        CONNECTING: '#f59e0b',
        REGISTER_FAILED: '#ef4444'
    };

    var IFRAME_ALLOW_POLICY = 'microphone *; camera *; speaker-selection *; autoplay *; clipboard-read *; clipboard-write *; notifications *';

    var EMBEDDED_PHONE_UI_HTML =
        global.__VPhoneEmbeddedUIHtml || global.__VphoneEmbeddedUIHtml || null;
    var EMBEDDED_PHONE_UI_DATA_URI =
        global.__VPhoneEmbeddedUI || global.__VphoneEmbeddedUI || null;

    function safeClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj || {}));
        } catch (e) {
            console.warn('Vphone: Failed to clone object', e);
            return {};
        }
    }

    function createStatusDot(color) {
        var dot = document.createElement('span');
        dot.style.cssText = 'width:10px;height:10px;border-radius:50%;background:' +
            (color || STATUS_COLORS.OFFLINE) +
            ';display:inline-block;';
        return dot;
    }

    var MOUNT_OPTION_KEYS = {
        phoneUrl: true,
        config: true,
        floating: true,
        container: true,
        title: true,
        showStatus: true,
        startCollapsed: true,
        expandOnIncomingCall: true,
        collapseOnCallEnd: true,
        onStatusChange: true,
        onCallEvent: true,
        onCredentialsRequired: true
    };

    // Matches UI phoneFrame250 — not configurable via mount options.
    var PHONE_UI_FRAME_SIZE = { width: '250px', height: '457px' };

    var PHONE_CONFIG_DEFAULTS = {
        Language: 'vi',
        EnableSettings: false,
        EnableNotifications: false,
        EnableRingtone: true,
        EnableVideoCalling: false,
        EnableTransfer: true,
        EnableConference: false,
        EnableRecordAllCalls: false,
        EnableFreeDial: true,
        EnableBuddies: true,
        EnableMultiTabLeader: true,
        ServerPath: '/ws',
        MaxDidLength: 24,
        HoldMode: 'sip'
    };

    var REMOVED_CONFIG_KEYS = {
        wssServer: true, WSSSERVER: true, WebSocketPort: true, webSocketPort: true, WSSPORT: true,
        SipDomain: true, sipDomain: true, DOMAIN: true,
        SipUsername: true, username: true, SIPUSER: true,
        SipPassword: true, password: true, sipPassword: true, SIPPASSWORD: true,
        SipPasswordType: true, SIPPASSWORDTYPE: true,
        NotificationsActive: true, SettingsButton: true,
        HideRecordAllCallsButton: true, DisableFreeDial: true, DisableBuddies: true,
        multiTabLeader: true, serverPath: true, WSSPATH: true,
        width: true, height: true
    };

    function normalizePhoneConfig(input) {
        var source = input && typeof input === 'object' ? input : {};
        var out = {};
        var key;

        for (key in source) {
            if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
            if (key === 'sip' || key === 'phone' || REMOVED_CONFIG_KEYS[key]) continue;
            out[key] = source[key];
        }

        if (source.phone && typeof source.phone === 'object') {
            for (key in source.phone) {
                if (!Object.prototype.hasOwnProperty.call(source.phone, key)) continue;
                if (REMOVED_CONFIG_KEYS[key]) continue;
                out[key] = source.phone[key];
            }
        }
        if (source.sip && typeof source.sip === 'object') {
            for (key in source.sip) {
                if (!Object.prototype.hasOwnProperty.call(source.sip, key)) continue;
                if (REMOVED_CONFIG_KEYS[key]) continue;
                out[key] = source.sip[key];
            }
        }

        out.EnableRingtone = true;

        if (out.IncomingHeaders !== undefined) {
            var rawHeaders = out.IncomingHeaders;
            var headerList = Array.isArray(rawHeaders)
                ? rawHeaders
                : (typeof rawHeaders === 'string' ? rawHeaders.split(/[\s,]+/) : []);
            out.IncomingHeaders = headerList
                .map(function(name) { return String(name || '').trim(); })
                .filter(Boolean);
        }

        return out;
    }

    function compactPhoneConfig(input) {
        var normalized = normalizePhoneConfig(input);
        var out = {};
        var key;
        for (key in normalized) {
            if (!Object.prototype.hasOwnProperty.call(normalized, key)) continue;
            if (normalized[key] === undefined || normalized[key] === null) continue;
            if (Object.prototype.hasOwnProperty.call(PHONE_CONFIG_DEFAULTS, key) &&
                PHONE_CONFIG_DEFAULTS[key] === normalized[key]) {
                continue;
            }
            if (key === 'EnableRingtone') continue;
            out[key] = normalized[key];
        }
        return out;
    }

    function mergePhoneConfig(target, source) {
        return Object.assign(target || {}, normalizePhoneConfig(source || {}));
    }

    function extractTopLevelPhoneConfig(opts) {
        var extracted = {};
        var key;

        for (key in opts) {
            if (!Object.prototype.hasOwnProperty.call(opts, key)) continue;
            if (MOUNT_OPTION_KEYS[key]) continue;
            if (REMOVED_CONFIG_KEYS[key]) continue;
            extracted[key] = opts[key];
        }

        return normalizePhoneConfig(extracted);
    }

    function applyStatus(statusRefs, payload) {
        var status = (payload && payload.status) || '';
        var online = !!(payload && (payload.online || payload.registered || status === 'online'));
        if (!status) status = online ? 'online' : 'offline';
        var text = (payload && payload.text)
            ? payload.text
            : (online ? 'Online' : (status === 'register-failed' ? 'Register failed' : 'Offline'));
        var color = online
            ? STATUS_COLORS.ONLINE
            : (status === 'register-failed' ? STATUS_COLORS.REGISTER_FAILED : STATUS_COLORS.OFFLINE);

        if (statusRefs.launcherDot) statusRefs.launcherDot.style.background = color;
        if (statusRefs.headerDot) statusRefs.headerDot.style.background = color;
        if (statusRefs.headerText) statusRefs.headerText.textContent = text;
    }

    function postToPhoneFrame(mountObj, message) {
        var targetWindow = (mountObj.frame && mountObj.frame.contentWindow)
            ? mountObj.frame.contentWindow
            : (mountObj.messageTarget || global);
        targetWindow.postMessage(message, '*');
    }

    function normalizeMakeCallOptions(options) {
        // Single host call API: makeCall(number, options?).
        // callType defaults to audio. Local From displayName uses configured profileName.
        var opts = (options && typeof options === 'object' && !Array.isArray(options)) ? options : {};
        return {
            callType: opts.callType === 'video' ? 'video' : 'audio',
            extraHeaders: Array.isArray(opts.extraHeaders) ? opts.extraHeaders : null,
            autoExpand: opts.autoExpand !== false
        };
    }

    function normalizeMountConfig(options) {
        var opts = options || {};
        var phoneConfig = extractTopLevelPhoneConfig(opts);
        mergePhoneConfig(phoneConfig, opts.config || {});
        phoneConfig = compactPhoneConfig(phoneConfig);

        return {
            phoneUrl: opts.phoneUrl || 'embedded',
            config: phoneConfig,
            width: PHONE_UI_FRAME_SIZE.width,
            height: PHONE_UI_FRAME_SIZE.height,
            floating: (opts.floating !== undefined) ? !!opts.floating : !opts.container,
            container: opts.container || null,
            title: opts.title || 'VPhone',
            showStatus: opts.showStatus !== false,
            startCollapsed: opts.startCollapsed !== false,
            expandOnIncomingCall: opts.expandOnIncomingCall !== false,
            collapseOnCallEnd: opts.collapseOnCallEnd !== false,
            onStatusChange: opts.onStatusChange || null,
            onCallEvent: opts.onCallEvent || null,
            onCredentialsRequired: opts.onCredentialsRequired || null
        };
    }

    function getEmbeddedHtml() {
        if (EMBEDDED_PHONE_UI_HTML) {
            return EMBEDDED_PHONE_UI_HTML;
        }

        if (!EMBEDDED_PHONE_UI_DATA_URI) {
            return null;
        }

        var prefix = 'data:text/html;base64,';
        if (EMBEDDED_PHONE_UI_DATA_URI.indexOf(prefix) !== 0) {
            return null;
        }

        try {
            return global.atob(EMBEDDED_PHONE_UI_DATA_URI.substring(prefix.length));
        } catch (e) {
            console.error('Vphone: Failed to decode embedded UI', e);
            return null;
        }
    }

    function shouldUseExternalPhoneUrl(phoneUrl) {
        return !!(phoneUrl && phoneUrl !== 'embedded');
    }

    function buildPhoneUrlWithConfig(phoneUrl, configObj) {
        var configJson = '{}';
        try {
            configJson = JSON.stringify(safeClone(configObj || {}));
        } catch (e) {
            configJson = '{}';
        }

        var separator = (String(phoneUrl).indexOf('#') === -1) ? '#' : '&';
        return String(phoneUrl) + separator + 'bpConfig=' + encodeURIComponent(configJson);
    }

    // Suppress known browser-extension promise rejections in the host page.
    global.addEventListener('unhandledrejection', function(event) {
        try {
            var reason = String((event && event.reason) ? event.reason : '');
            if (reason.indexOf('FN_NOT_FOUND: "siteFrame.closeSiteFrame"') > -1 ||
                reason.indexOf('FN_NOT_FOUND: "cardFrame.closeCardFrame"') > -1 ||
                reason.indexOf('FN_NOT_FOUND: "passkey.closePasskeyConditionalList"') > -1) {
                event.preventDefault();
            }
        } catch (e) {}
    });

    function sanitizeMountConfig(config, mode) {
        var cfg = compactPhoneConfig(config || {});
        cfg.AppMode = mode || PHONE_MODES.EMBEDDED;
        cfg.phoneShell = 'embedded';
        // Only keep non-default phone flags; Language defaults to vi inside the UI.
        return cfg;
    }

    function appendScriptSequentially(scriptList, target, done) {
        var index = 0;

        function next() {
            if (index >= scriptList.length) {
                if (typeof done === 'function') done();
                return;
            }

            var scriptInfo = scriptList[index++];
            var el = document.createElement('script');
            var attrs = scriptInfo.attrs || {};
            var key;

            for (key in attrs) {
                if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
                if (key === 'src' || key === 'async' || key === 'defer') continue;
                el.setAttribute(key, attrs[key]);
            }

            el.async = false;
            el.defer = false;
            el.onload = next;
            el.onerror = next;

            if (scriptInfo.src) {
                el.src = scriptInfo.src;
                target.appendChild(el);
                return;
            }

            try {
                el.text = scriptInfo.text || '';
                target.appendChild(el);
            } catch (e) {
                console.error('Vphone: inline script execution failed', e);
            }
            next();
        }

        next();
    }

    function mountEmbeddedDom(hostElement, cfg) {
        var html = getEmbeddedHtml();
        if (!html) return null;

        var iframe = document.createElement('iframe');
        iframe.className = 'bp-embed-frame';
        iframe.setAttribute('tabindex', '-1');
        iframe.setAttribute('allow', IFRAME_ALLOW_POLICY);
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads');
        iframe.style.cssText = 'box-sizing:border-box;width:100%;height:100%;border:0;display:block;background:#fff;';
        hostElement.appendChild(iframe);

        function buildSrcdocWithConfig(baseHtml, configObj) {
            var configJson = '{}';
            try {
                configJson = JSON.stringify(safeClone(configObj || {}));
            } catch (e) {
                configJson = '{}';
            }

            // Keep any closing script sequence inside JSON from terminating this injected script.
            var safeConfigJson = configJson.replace(/<\//g, '<\\/');

            var configScript = '<script type="text/javascript">window.__VPhoneEmbedConfig = ' +
                safeConfigJson +
                '; window.__VphoneEmbedConfig = window.__VPhoneEmbedConfig;</script>';

            if (/<head[^>]*>/i.test(baseHtml)) {
                return baseHtml.replace(/<head([^>]*)>/i, function(match, attrs) {
                    return '<head' + (attrs || '') + '>\n' + configScript;
                });
            }

            return configScript + '\n' + baseHtml;
        }

        return {
            root: iframe,
            frame: iframe,
            bootstrap: function() {
                iframe.srcdoc = buildSrcdocWithConfig(html, cfg);
            }
        };
    }

    function mountExternalFrame(hostElement, phoneUrl, cfg) {
        var iframe = document.createElement('iframe');
        iframe.className = 'bp-embed-frame';
        iframe.setAttribute('tabindex', '-1');
        iframe.setAttribute('allow', IFRAME_ALLOW_POLICY);
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads');
        iframe.setAttribute('src', buildPhoneUrlWithConfig(phoneUrl, cfg));
        iframe.style.cssText = 'box-sizing:border-box;width:100%;height:100%;border:0;display:block;background:#fff;';
        hostElement.appendChild(iframe);

        return {
            root: iframe,
            frame: iframe,
            bootstrap: function() {}
        };
    }

    function mountPhoneFrame(hostElement, mountConfig, mode) {
        var cfg = sanitizeMountConfig(mountConfig.config, mode);
        if (shouldUseExternalPhoneUrl(mountConfig.phoneUrl)) {
            return mountExternalFrame(hostElement, mountConfig.phoneUrl, cfg);
        }
        return mountEmbeddedDom(hostElement, cfg);
    }

    function focusPhoneFrame(domMount) {
        if (!domMount || !domMount.frame) return false;

        try {
            domMount.frame.focus();
            if (domMount.frame.contentWindow && typeof domMount.frame.contentWindow.focus === 'function') {
                domMount.frame.contentWindow.focus();
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    function mountInline(container, mountConfig) {
        if (!container) {
            throw new Error('Vphone.mount: container element not found');
        }

        var root = document.createElement('div');
        root.className = 'bp-embed-root';
        root.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;';

        var statusWrap = document.createElement('div');
        statusWrap.style.cssText = 'display:flex;align-items:center;gap:8px;font:600 12px/1.2 Roboto,Arial,sans-serif;color:#1a1a1a;margin-bottom:8px;';

        var statusDot = createStatusDot();
        var statusText = document.createElement('span');
        statusText.textContent = 'Offline';

        statusWrap.appendChild(statusDot);
        statusWrap.appendChild(statusText);

        if (mountConfig.showStatus !== false) {
            root.appendChild(statusWrap);
        }

        var contentHost = document.createElement('div');
        contentHost.className = 'bp-embed-host';
        contentHost.style.cssText = 'box-sizing:border-box;width:' + mountConfig.width + ';height:' + mountConfig.height + ';border:0;display:block;overflow:hidden;';
        root.appendChild(contentHost);

        container.innerHTML = '';
        container.appendChild(root);

        var domMount = mountPhoneFrame(contentHost, mountConfig, PHONE_MODES.EMBEDDED);
        if (!domMount) {
            throw new Error('Vphone.mount: embedded UI payload is missing. Rebuild the library with embedded UI.');
        }
        domMount.bootstrap();
        if (domMount.frame && typeof domMount.frame.addEventListener === 'function') {
            domMount.frame.addEventListener('load', function() {
                focusPhoneFrame(domMount);
            });
        }
        setTimeout(function() { focusPhoneFrame(domMount); }, 0);

        return {
            root: root,
            frame: domMount.frame || null,
            messageTarget: (domMount.frame && domMount.frame.contentWindow) ? domMount.frame.contentWindow : global,
            statusRefs: {
                launcherDot: null,
                headerDot: statusDot,
                headerText: statusText
            },
            expand: function() {},
            collapse: function() {},
            isCollapsed: function() { return false; }
        };
    }

    function mountFloating(mountConfig) {
        var root = document.createElement('div');
        root.className = 'bp-float-root';
        root.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483000;font-family:Roboto,Arial,sans-serif;display:flex;align-items:flex-end;gap:10px;';

        var launcher = document.createElement('button');
        launcher.type = 'button';
        launcher.className = 'bp-float-launcher';
        launcher.style.cssText = 'width:56px;height:56px;border:none;border-radius:50%;cursor:pointer;background:#1f6feb;color:#fff;box-shadow:0 10px 24px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;position:relative;';
        launcher.setAttribute('aria-label', 'Toggle phone widget');
        launcher.innerHTML = '<span style="font-size:22px;line-height:1">☎</span>';

        var launcherDot = createStatusDot();
        launcherDot.style.cssText += 'position:absolute;right:6px;bottom:6px;border:2px solid #fff;';
        launcher.appendChild(launcherDot);

        var panel = document.createElement('div');
        panel.className = 'bp-float-panel';
        panel.style.cssText = 'box-sizing:border-box;width:' + mountConfig.width + ';height:' + mountConfig.height + ';background:#fff;border:1px solid #d1d5db;border-radius:14px;box-shadow:0 16px 36px rgba(0,0,0,.28);overflow:hidden;display:none;';

        var contentHost = document.createElement('div');
        contentHost.className = 'bp-embed-host';
        contentHost.style.cssText = 'box-sizing:border-box;width:100%;height:100%;overflow:hidden;';
        panel.appendChild(contentHost);

        root.appendChild(panel);
        root.appendChild(launcher);
        document.body.appendChild(root);

        var domMount = mountPhoneFrame(contentHost, mountConfig, PHONE_MODES.FLOATING);
        if (!domMount) {
            throw new Error('Vphone.mount: embedded UI payload is missing. Rebuild the library with embedded UI.');
        }
        var collapsed = (mountConfig.startCollapsed !== false);
        domMount.bootstrap();
        if (domMount.frame && typeof domMount.frame.addEventListener === 'function') {
            domMount.frame.addEventListener('load', function() {
                if (!collapsed) focusPhoneFrame(domMount);
            });
        }

        function sync() {
            panel.style.display = collapsed ? 'none' : 'block';
            launcher.style.display = 'flex';
        }

        function expand() {
            collapsed = false;
            sync();
            setTimeout(function() { focusPhoneFrame(domMount); }, 0);
        }

        function collapse() {
            collapsed = true;
            sync();
        }

        launcher.addEventListener('click', function() {
            if (collapsed) expand();
            else collapse();
        });

        sync();
        setTimeout(function() {
            if (!collapsed) focusPhoneFrame(domMount);
        }, 0);

        return {
            root: root,
            frame: domMount.frame || null,
            messageTarget: (domMount.frame && domMount.frame.contentWindow) ? domMount.frame.contentWindow : global,
            statusRefs: {
                launcherDot: launcherDot,
                headerDot: null,
                headerText: null
            },
            expand: expand,
            collapse: collapse,
            isCollapsed: function() { return collapsed; }
        };
    }

    var activeMountedInstance = null;

    function mount(options) {
        var config = normalizeMountConfig(options);
        var mountObj;

        try {
            if (config.floating) {
                mountObj = mountFloating(config);
            } else {
                var container = (typeof config.container === 'string')
                    ? document.querySelector(config.container)
                    : config.container;
                mountObj = mountInline(container, config);
            }
        } catch (e) {
            console.error('Vphone.mount failed:', e);
            throw e;
        }

        var messageHandler = null;

        function setupMessageListener() {
            if (messageHandler) return;

            messageHandler = function(event) {
                var payload = event.data || {};

                if (payload.type === 'vphone-status') {
                    applyStatus(mountObj.statusRefs, payload);
                    if (typeof config.onStatusChange === 'function') {
                        try {
                            config.onStatusChange(payload);
                        } catch (e) {
                            console.error('Vphone: onStatusChange callback error:', e);
                        }
                    }
                    return;
                }

                if (payload.type === 'vphone-credentials-required') {
                    if (typeof config.onCredentialsRequired === 'function') {
                        Promise.resolve()
                            .then(function() { return config.onCredentialsRequired(); })
                            .then(function(nextConfig) {
                                if (!nextConfig || typeof nextConfig !== 'object') return;
                                if (activeMountedInstance && typeof activeMountedInstance.configure === 'function') {
                                    activeMountedInstance.configure(nextConfig);
                                }
                            })
                            .catch(function(err) {
                                console.error('Vphone: onCredentialsRequired failed:', err);
                            });
                    }
                    return;
                }

                if (payload.type === 'vphone-call') {
                    var callPayload = payload.payload || {};

                    if ((callPayload.phase === 'incoming' || callPayload.phase === 'notification-click') &&
                        typeof mountObj.isCollapsed === 'function' &&
                        mountObj.isCollapsed() &&
                        config.expandOnIncomingCall !== false) {
                        if (typeof mountObj.expand === 'function') {
                            mountObj.expand();
                        }
                    }

                    if (callPayload.phase === 'ended' &&
                        config.floating &&
                        config.collapseOnCallEnd !== false &&
                        typeof mountObj.collapse === 'function') {
                        mountObj.collapse();
                    }

                    if (typeof config.onCallEvent === 'function') {
                        try {
                            config.onCallEvent(callPayload);
                        } catch (e) {
                            console.error('Vphone: onCallEvent callback error:', e);
                        }
                    }
                }
            };

            window.addEventListener('message', messageHandler);
        }

        setupMessageListener();

        var instance = {
            version: VERSION,
            libraryVersion: LIBRARY_VERSION,

            makeCall: function(numberToDial, options) {
                var callOptions = normalizeMakeCallOptions(options);

                try {
                    if (!numberToDial || numberToDial.toString().trim() === '') {
                        console.warn('Vphone.makeCall: No number to dial');
                        return false;
                    }

                    postToPhoneFrame(mountObj, {
                        action: 'makeCall',
                        data: {
                            numberToDial: numberToDial.toString().trim(),
                            callType: callOptions.callType,
                            extraHeaders: callOptions.extraHeaders,
                            autoExpand: callOptions.autoExpand
                        }
                    });

                    if (callOptions.autoExpand && config.floating && typeof mountObj.expand === 'function') {
                        setTimeout(function() { mountObj.expand(); }, 100);
                    }

                    return true;
                } catch (e) {
                    console.error('Vphone.makeCall failed:', e);
                    return false;
                }
            },

            configure: function(partialConfig) {
                try {
                    var next = normalizePhoneConfig(partialConfig || {});
                    mergePhoneConfig(config.config, next);
                    postToPhoneFrame(mountObj, {
                        action: 'configure',
                        data: next
                    });
                    return true;
                } catch (e) {
                    console.error('Vphone.configure failed:', e);
                    return false;
                }
            },

            get iframe() {
                return mountObj.frame || null;
            },

            expand: function() {
                if (typeof mountObj.expand === 'function') {
                    mountObj.expand();
                }
            },

            collapse: function() {
                if (typeof mountObj.collapse === 'function') {
                    mountObj.collapse();
                }
            },

            toggle: function() {
                if (typeof mountObj.isCollapsed === 'function' && mountObj.isCollapsed()) {
                    if (typeof mountObj.expand === 'function') mountObj.expand();
                } else {
                    if (typeof mountObj.collapse === 'function') mountObj.collapse();
                }
            },

            destroy: function() {
                if (messageHandler) {
                    window.removeEventListener('message', messageHandler);
                    messageHandler = null;
                }
                if (mountObj.root && mountObj.root.parentNode) {
                    mountObj.root.parentNode.removeChild(mountObj.root);
                }
                if (activeMountedInstance === instance) {
                    activeMountedInstance = null;
                }
            },

            setStatus: function(online, text) {
                applyStatus(mountObj.statusRefs, {
                    registered: !!online,
                    text: text || (online ? 'Online' : 'Offline')
                });
            },

            isCollapsed: function() {
                if (typeof mountObj.isCollapsed === 'function') {
                    return mountObj.isCollapsed();
                }
                return false;
            }
        };

        activeMountedInstance = instance;
        return instance;
    }

    var VphoneAPI = {
        VERSION: VERSION,
        LIBRARY_VERSION: LIBRARY_VERSION,
        PHONE_MODES: PHONE_MODES,
        STATUS_COLORS: STATUS_COLORS,
        mount: mount,

        makeCall: function(numberToDial, options) {
            if (!activeMountedInstance || typeof activeMountedInstance.makeCall !== 'function') {
                console.warn('Vphone.makeCall: No active mounted instance. Call Vphone.mount(...) first.');
                return false;
            }
            return activeMountedInstance.makeCall(numberToDial, options);
        },

        configure: function(partialConfig) {
            if (!activeMountedInstance || typeof activeMountedInstance.configure !== 'function') {
                console.warn('Vphone.configure: No active mounted instance. Call Vphone.mount(...) first.');
                return false;
            }
            return activeMountedInstance.configure(partialConfig);
        },

        utils: {
            safeClone: safeClone,
            createStatusDot: createStatusDot,
            applyStatus: applyStatus,
            normalizeMountConfig: normalizeMountConfig
        },

        getInfo: function() {
            return {
                name: 'VPhone',
                version: VERSION,
                libraryVersion: LIBRARY_VERSION,
                description: 'WebRTC SIP phone library for web applications',
                repository: 'https://github.com/InnovateAsterisk/vphone',
                license: 'GNU Affero General Public License v3.0'
            };
        },

        init: function(globalConfig) {
            if (globalConfig && typeof globalConfig === 'object') {
                if (globalConfig.debug) {
                    console.log('Vphone initialized', VphoneAPI.getInfo());
                }
            }
            return VphoneAPI;
        }
    };

    VphoneAPI.VphoneEmbed = {
        mount: mount,
        makeCall: function(numberToDial, options) {
            return VphoneAPI.makeCall(numberToDial, options);
        }
    };

    return VphoneAPI;
}));

