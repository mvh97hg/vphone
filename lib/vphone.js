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

    var VERSION = '0.1.1';
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
        CONNECTING: '#f59e0b'
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
        width: true,
        height: true,
        floating: true,
        container: true,
        title: true,
        showStatus: true,
        startCollapsed: true,
        expandOnIncomingCall: true,
        onStatusChange: true,
        onCallEvent: true
    };

    function mergePhoneConfigAliases(target, source) {
        if (!source || typeof source !== 'object') return target;

        if (source.phone && typeof source.phone === 'object') {
            Object.assign(target, safeClone(source.phone));
        }
        if (source.sip && typeof source.sip === 'object') {
            var sip = source.sip;
            if (sip.wssServer !== undefined) target.wssServer = sip.wssServer;
            if (sip.WebSocketPort !== undefined) target.WebSocketPort = sip.WebSocketPort;
            if (sip.webSocketPort !== undefined) target.WebSocketPort = sip.webSocketPort;
            if (sip.ServerPath !== undefined) target.ServerPath = sip.ServerPath;
            if (sip.serverPath !== undefined) target.ServerPath = sip.serverPath;
            if (sip.Wss !== undefined) target.Wss = sip.Wss;
            if (sip.wss !== undefined) target.Wss = sip.wss;
            if (sip.SipDomain !== undefined) target.SipDomain = sip.SipDomain;
            if (sip.sipDomain !== undefined) target.SipDomain = sip.sipDomain;
            if (sip.SipUsername !== undefined) target.SipUsername = sip.SipUsername;
            if (sip.username !== undefined) target.SipUsername = sip.username;
            if (sip.SipPassword !== undefined) target.SipPassword = sip.SipPassword;
            if (sip.password !== undefined) target.SipPassword = sip.password;
            if (sip.sipPassword !== undefined) target.SipPassword = sip.sipPassword;
        }

        Object.assign(target, safeClone(source));

        if (target.phone && typeof target.phone === 'object') {
            Object.assign(target, safeClone(target.phone));
            delete target.phone;
        }
        if (target.sip && typeof target.sip === 'object') {
            var targetSip = target.sip;
            if (targetSip.wssServer !== undefined) target.wssServer = targetSip.wssServer;
            if (targetSip.WebSocketPort !== undefined) target.WebSocketPort = targetSip.WebSocketPort;
            if (targetSip.webSocketPort !== undefined) target.WebSocketPort = targetSip.webSocketPort;
            if (targetSip.ServerPath !== undefined) target.ServerPath = targetSip.ServerPath;
            if (targetSip.serverPath !== undefined) target.ServerPath = targetSip.serverPath;
            if (targetSip.Wss !== undefined) target.Wss = targetSip.Wss;
            if (targetSip.wss !== undefined) target.Wss = targetSip.wss;
            if (targetSip.SipDomain !== undefined) target.SipDomain = targetSip.SipDomain;
            if (targetSip.sipDomain !== undefined) target.SipDomain = targetSip.sipDomain;
            if (targetSip.SipUsername !== undefined) target.SipUsername = targetSip.SipUsername;
            if (targetSip.username !== undefined) target.SipUsername = targetSip.username;
            if (targetSip.SipPassword !== undefined) target.SipPassword = targetSip.SipPassword;
            if (targetSip.password !== undefined) target.SipPassword = targetSip.password;
            if (targetSip.sipPassword !== undefined) target.SipPassword = targetSip.sipPassword;
            delete target.sip;
        }

        return target;
    }

    function extractTopLevelPhoneConfig(opts) {
        var extracted = {};
        var key;

        for (key in opts) {
            if (!Object.prototype.hasOwnProperty.call(opts, key)) continue;
            if (MOUNT_OPTION_KEYS[key]) continue;
            extracted[key] = opts[key];
        }

        return mergePhoneConfigAliases({}, extracted);
    }

    function applyStatus(statusRefs, payload) {
        var online = !!(payload && payload.registered);
        var text = (payload && payload.text) ? payload.text : (online ? 'Online' : 'Offline');
        var color = online ? STATUS_COLORS.ONLINE : STATUS_COLORS.OFFLINE;

        if (statusRefs.launcherDot) statusRefs.launcherDot.style.background = color;
        if (statusRefs.headerDot) statusRefs.headerDot.style.background = color;
        if (statusRefs.headerText) statusRefs.headerText.textContent = text;
    }

    function normalizeMakeCallArgs(extraHeadersOrOptions, callType) {
        var normalized = {
            callType: 'audio',
            callerName: null,
            extraHeaders: null,
            autoExpand: true
        };

        if (Array.isArray(extraHeadersOrOptions)) {
            normalized.extraHeaders = extraHeadersOrOptions;
            normalized.callType = callType || 'audio';
            return normalized;
        }

        if (typeof extraHeadersOrOptions === 'string') {
            normalized.callType = extraHeadersOrOptions || 'audio';
            return normalized;
        }

        if (extraHeadersOrOptions && typeof extraHeadersOrOptions === 'object') {
            normalized.callType = extraHeadersOrOptions.callType || 'audio';
            normalized.callerName = extraHeadersOrOptions.callerName || null;
            normalized.extraHeaders = extraHeadersOrOptions.extraHeaders || null;
            normalized.autoExpand = (extraHeadersOrOptions.autoExpand !== false);
            return normalized;
        }

        return normalized;
    }

    function normalizeMountConfig(options) {
        var opts = options || {};
        var phoneConfig = extractTopLevelPhoneConfig(opts);
        mergePhoneConfigAliases(phoneConfig, opts.config || {});

        return {
            phoneUrl: opts.phoneUrl || 'embedded',
            config: phoneConfig,
            width: opts.width || '250px',
            height: opts.height || '425px',
            floating: (opts.floating !== undefined) ? !!opts.floating : !opts.container,
            container: opts.container || null,
            title: opts.title || 'VPhone',
            showStatus: opts.showStatus !== false,
            startCollapsed: opts.startCollapsed !== false,
            expandOnIncomingCall: opts.expandOnIncomingCall !== false,
            onStatusChange: opts.onStatusChange || null,
            onCallEvent: opts.onCallEvent || null
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
        var cfg = safeClone(config || {});
        cfg.AppMode = mode || PHONE_MODES.EMBEDDED;
        if (cfg.welcomeScreen === undefined) cfg.welcomeScreen = '';
        if (cfg.Language === undefined) cfg.Language = 'auto';
        if (cfg.loadAlternateLang === undefined) cfg.loadAlternateLang = true;
        if (cfg.HideSettingsButton === undefined) cfg.HideSettingsButton = true;
        if (cfg.HideRecordAllCallsButton === undefined) cfg.HideRecordAllCallsButton = true;
        if (cfg.ContactRowClickMode === undefined) cfg.ContactRowClickMode = 'call';
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
        iframe.style.cssText = 'width:100%;height:100%;border:0;display:block;background:#fff;overflow:hidden;';
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
        iframe.style.cssText = 'width:100%;height:100%;border:0;display:block;background:#fff;overflow:hidden;';
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
        contentHost.style.cssText = 'width:' + mountConfig.width + ';height:' + mountConfig.height + ';border:0;display:block;overflow:hidden;';
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
        contentHost.style.cssText = 'width:100%;height:100%;overflow:hidden;';
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

                if (payload.type === 'vphone-call') {
                    var callPayload = payload.payload || {};

                    if (callPayload.phase === 'incoming' &&
                        typeof mountObj.isCollapsed === 'function' &&
                        mountObj.isCollapsed() &&
                        config.expandOnIncomingCall !== false) {
                        if (typeof mountObj.expand === 'function') {
                            mountObj.expand();
                        }
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

            makeCall: function(numberToDial, extraHeadersOrOptions, callType) {
                var callOptions = normalizeMakeCallArgs(extraHeadersOrOptions, callType);

                try {
                    if (!numberToDial || numberToDial.toString().trim() === '') {
                        console.warn('Vphone.makeCall: No number to dial');
                        return false;
                    }

                    var callMessage = {
                        action: 'makeCall',
                        data: {
                            numberToDial: numberToDial.toString().trim(),
                            callType: callOptions.callType,
                            callerName: callOptions.callerName,
                            extraHeaders: callOptions.extraHeaders,
                            autoExpand: callOptions.autoExpand
                        }
                    };

                    var targetWindow = (mountObj.frame && mountObj.frame.contentWindow)
                        ? mountObj.frame.contentWindow
                        : (mountObj.messageTarget || global);
                    targetWindow.postMessage(callMessage, '*');

                    if (callOptions.autoExpand && config.floating && typeof mountObj.expand === 'function') {
                        setTimeout(function() { mountObj.expand(); }, 100);
                    }

                    return true;
                } catch (e) {
                    console.error('Vphone.makeCall failed:', e);
                    return false;
                }
            },

            clickToCall: function(numberToDial, options) {
                return this.makeCall(numberToDial, options || {});
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

        makeCall: function(numberToDial, extraHeadersOrOptions, callType) {
            if (!activeMountedInstance || typeof activeMountedInstance.makeCall !== 'function') {
                console.warn('Vphone.makeCall: No active mounted instance. Call Vphone.mount(...) first.');
                return false;
            }
            return activeMountedInstance.makeCall(numberToDial, extraHeadersOrOptions, callType);
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
        makeCall: function(numberToDial, extraHeadersOrOptions, callType) {
            return VphoneAPI.makeCall(numberToDial, extraHeadersOrOptions, callType);
        }
    };

    return VphoneAPI;
}));

