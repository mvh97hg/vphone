const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createElement(tag) {
  const listeners = {};
  const contentWindow = {
    postMessage() {},
    focus() { contentWindow.focused = true; }
  };
  return {
    tagName: tag.toUpperCase(),
    children: [],
    style: {},
    attributes: {},
    className: '',
    innerHTML: '',
    textContent: '',
    appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
    removeChild(child) { this.children = this.children.filter((item) => item !== child); },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(type, handler) { listeners[type] = handler; },
    removeEventListener(type) { delete listeners[type]; },
    dispatchEvent(event) {
      const handler = listeners[event && event.type];
      if (typeof handler === 'function') handler.call(this, event);
    },
    get listeners() { return listeners; },
    focus() { this.focused = true; },
    get contentWindow() { return contentWindow; }
  };
}

function loadVphone(options = {}) {
  const host = createElement('div');
  const body = createElement('body');
  const document = {
    body,
    createElement,
    querySelector(selector) { return selector === '#host' ? host : null; }
  };
  const messageListeners = [];
  const context = {
    console,
    setTimeout,
    clearTimeout,
    window: null,
    document,
    module: undefined,
    define: undefined,
    __VPhoneEmbeddedUIHtml: '<!doctype html><html><head></head><body>Embedded phone</body></html>',
    atob(value) { return Buffer.from(value, 'base64').toString('binary'); },
    addEventListener(type, handler) {
      if (type === 'message' && typeof handler === 'function') messageListeners.push(handler);
    },
    removeEventListener(type, handler) {
      if (type !== 'message') return;
      const idx = messageListeners.indexOf(handler);
      if (idx >= 0) messageListeners.splice(idx, 1);
    }
  };
  context.window = context;
  vm.createContext(context);
  const code = fs.readFileSync(path.join(__dirname, '..', 'vphone.min.js'), 'utf8');
  vm.runInContext(code, context);
  return {
    Vphone: context.Vphone,
    legacyVPhone: context.VPhone,
    legacyOldGlobal: context['Browser' + 'Phone'],
    host,
    dispatchMessage(data) {
      messageListeners.slice().forEach((handler) => handler({ data }));
    }
  };
}

module.exports = function testVphoneRuntime() {
  const { Vphone, legacyVPhone, legacyOldGlobal, host } = loadVphone();
  assert.equal(legacyVPhone, undefined);
  assert.equal(legacyOldGlobal, Vphone);
  const instance = legacyOldGlobal.mount({
    container: '#host',
    phoneUrl: 'https://phone.example.test/index.html',
    floating: false,
    config: { Language: 'vi', sip: { Username: '1001' } }
  });

  assert.equal(instance.iframe.attributes.src.startsWith('https://phone.example.test/index.html#bpConfig='), true);
  assert.equal(instance.iframe.attributes.tabindex, '-1');
  assert.match(instance.iframe.attributes.allow, /microphone/);
  assert.match(instance.iframe.attributes.allow, /camera/);
  assert.match(instance.iframe.attributes.allow, /autoplay/);
  assert.doesNotMatch(instance.iframe.attributes.allow, /speaker-selection/);
  assert.doesNotMatch(instance.iframe.attributes.allow, /notifications/);
  const encodedConfig = instance.iframe.attributes.src.split('#bpConfig=')[1];
  const passedConfig = JSON.parse(decodeURIComponent(encodedConfig));
  // Defaults omitted from payload.
  assert.equal(passedConfig.EnableSettings, undefined);
  assert.equal(passedConfig.Language, undefined);
  assert.equal(passedConfig.Username, '1001');
  assert.equal(passedConfig.sip, undefined);
  assert.equal(instance.iframe.srcdoc, undefined);
  assert.equal(host.children.length, 1);

  const focusTest = loadVphone();
  const focusInstance = focusTest.Vphone.mount({
    container: '#host',
    phoneUrl: 'https://phone.example.test/index.html',
    floating: false,
    config: { Language: 'vi', Username: '1005' }
  });
  assert.equal(typeof focusInstance.iframe.listeners.load, 'function');
  focusInstance.iframe.dispatchEvent({ type: 'load' });
  assert.equal(focusInstance.iframe.focused, true);
  assert.equal(focusInstance.iframe.contentWindow.focused, true);

  const { Vphone: VphoneWithSettings, host: settingsHost } = loadVphone();
  const settingsInstance = VphoneWithSettings.mount({
    container: '#host',
    phoneUrl: 'https://phone.example.test/index.html',
    floating: false,
    config: { EnableSettings: true, EnableRecordAllCalls: true }
  });
  const settingsConfig = JSON.parse(decodeURIComponent(settingsInstance.iframe.attributes.src.split('#bpConfig=')[1]));
  assert.equal(settingsConfig.EnableSettings, true);
  assert.equal(settingsConfig.EnableRecordAllCalls, true);
  assert.equal(settingsHost.children.length, 1);

  const { Vphone: VphoneLegacyConfig } = loadVphone();
  const legacyInstance = VphoneLegacyConfig.mount({
    container: '#host',
    phoneUrl: 'https://phone.example.test/index.html',
    floating: false,
    // Legacy keys must be ignored (no aliases).
    wssServer: 'ignored.example.test',
    config: {
      Server: 'pbx.example.test',
      Port: 7443,
      Domain: 'pbx.example.test',
      Username: '1001',
      Password: 'secret',
      EnableSettings: true
    }
  });
  const legacyConfig = JSON.parse(decodeURIComponent(legacyInstance.iframe.attributes.src.split('#bpConfig=')[1]));
  assert.equal(legacyConfig.Server, 'pbx.example.test');
  assert.equal(legacyConfig.Port, 7443);
  assert.equal(legacyConfig.Username, '1001');
  assert.equal(legacyConfig.Password, 'secret');
  assert.equal(legacyConfig.Domain, 'pbx.example.test');
  assert.equal(legacyConfig.wssServer, undefined);
  assert.equal(legacyConfig.ServerPath, undefined);
  assert.equal(legacyConfig.Language, undefined);
  assert.equal(legacyConfig.EnableSettings, true);

  const { Vphone: VphonePhoneConfig } = loadVphone();
  const phoneConfigInstance = VphonePhoneConfig.mount({
    container: '#host',
    phoneUrl: 'https://phone.example.test/index.html',
    floating: false,
    config: {
      phone: {
        Server: 'nested.example.test',
        Port: 8443,
        Username: '1002'
      },
      EnableSettings: true
    }
  });
  const phoneConfig = JSON.parse(decodeURIComponent(phoneConfigInstance.iframe.attributes.src.split('#bpConfig=')[1]));
  assert.equal(phoneConfig.Server, 'nested.example.test');
  assert.equal(phoneConfig.Port, 8443);
  assert.equal(phoneConfig.Username, '1002');
  assert.equal(phoneConfig.EnableSettings, true);

  const { Vphone: VphoneEmbedded, host: embeddedHost } = loadVphone();
  const embeddedInstance = VphoneEmbedded.mount({
    container: '#host',
    floating: false,
    // width/height ignored — always UI frame size
    width: '999px',
    height: '999px',
    config: {
      Language: 'en',
      Server: 'embedded.example.test',
      Username: '1003'
    }
  });
  assert.match(embeddedInstance.iframe.srcdoc, /window\.__VPhoneEmbedConfig/);
  assert.equal(embeddedInstance.iframe.attributes.tabindex, '-1');
  assert.match(embeddedInstance.iframe.srcdoc, /window\.__VphoneEmbedConfig = window\.__VPhoneEmbedConfig/);
  assert.match(embeddedInstance.iframe.srcdoc, /embedded\.example\.test/);
  assert.match(embeddedInstance.iframe.srcdoc, /"Language":"en"/);
  assert.match(embeddedInstance.iframe.srcdoc, /"Username":"1003"/);
  assert.equal(embeddedHost.children.length, 1);
  // width/height mount options are ignored — panel always uses UI frame 250x457
  const styles = [];
  (function walk(node) {
    if (!node) return;
    if (node.style && node.style.cssText) styles.push(String(node.style.cssText));
    (node.children || []).forEach(walk);
  })(embeddedHost.children[0]);
  const frameCss = styles.join('\n');
  assert.match(frameCss, /width:250px/);
  assert.match(frameCss, /height:457px/);
  assert.doesNotMatch(frameCss, /999px/);

  const floatingLoad = loadVphone();
  const floatingDefault = floatingLoad.Vphone.mount({
    floating: true,
    config: { Username: '7001' }
  });
  assert.equal(floatingDefault.isCollapsed(), true);
  floatingDefault.expand();
  assert.equal(floatingDefault.isCollapsed(), false);
  floatingLoad.dispatchMessage({ type: 'vphone-call', payload: { phase: 'ended' } });
  assert.equal(floatingDefault.isCollapsed(), true);

  const floatingKeepOpen = loadVphone();
  const floatingOpen = floatingKeepOpen.Vphone.mount({
    floating: true,
    startCollapsed: false,
    expandOnIncomingCall: false,
    collapseOnCallEnd: false,
    config: { Username: '7002' }
  });
  assert.equal(floatingOpen.isCollapsed(), false);
  floatingKeepOpen.dispatchMessage({ type: 'vphone-call', payload: { phase: 'ended' } });
  assert.equal(floatingOpen.isCollapsed(), false);

  const { Vphone: VphoneAgain, host: minHost } = loadVphone();
  const minifiedInstance = VphoneAgain.mount({
    container: '#host',
    floating: false,
    config: {
      Language: 'en',
      Server: 'minified.example.test',
      Username: '1004'
    }
  });
  assert.equal(!!minifiedInstance.iframe.srcdoc, true);
  assert.match(minifiedInstance.iframe.srcdoc, /window\.__VPhoneEmbedConfig/);
  assert.match(minifiedInstance.iframe.srcdoc, /minified\.example\.test/);
  assert.equal(minHost.children.length, 1);

  assert.equal(typeof minifiedInstance.configure, 'function');
  assert.equal(typeof VphoneAgain.configure, 'function');
  const configurePosts = [];
  minifiedInstance.iframe.contentWindow.postMessage = (msg) => { configurePosts.push(msg); };
  assert.equal(minifiedInstance.configure({ Username: '1004', Password: 'secret' }), true);
  assert.equal(configurePosts.some((msg) => msg && msg.action === 'configure'), true);

  const runtimeSrc = fs.readFileSync(path.join(__dirname, '..', 'vphone.js'), 'utf8');
  assert.match(runtimeSrc, /onCredentialsRequired/);
  assert.match(runtimeSrc, /vphone-credentials-required/);
  assert.match(runtimeSrc, /REGISTER_FAILED/);
};
