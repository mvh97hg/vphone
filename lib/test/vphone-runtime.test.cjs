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
    addEventListener() {},
    removeEventListener() {}
  };
  context.window = context;
  vm.createContext(context);
  const code = fs.readFileSync(path.join(__dirname, '..', options.minified ? 'vphone.min.js' : 'vphone.js'), 'utf8');
  vm.runInContext(code, context);
  return { Vphone: context.Vphone, legacyVPhone: context.VPhone, legacyOldGlobal: context['Browser' + 'Phone'], host };
}

module.exports = function testVphoneRuntime() {
  const { Vphone, legacyVPhone, legacyOldGlobal, host } = loadVphone();
  assert.equal(legacyVPhone, undefined);
  assert.equal(legacyOldGlobal, Vphone);
  const instance = legacyOldGlobal.mount({
    container: '#host',
    phoneUrl: 'https://phone.example.test/index.html',
    floating: false,
    config: { Language: 'vi', sip: { SipUsername: '1001' } }
  });

  assert.equal(instance.iframe.attributes.src.startsWith('https://phone.example.test/index.html#bpConfig='), true);
  assert.equal(instance.iframe.attributes.tabindex, '-1');
  assert.match(instance.iframe.attributes.allow, /microphone/);
  assert.match(instance.iframe.attributes.allow, /speaker-selection/);
  const encodedConfig = instance.iframe.attributes.src.split('#bpConfig=')[1];
  const passedConfig = JSON.parse(decodeURIComponent(encodedConfig));
  assert.equal(passedConfig.HideSettingsButton, true);
  assert.equal(passedConfig.Language, 'vi');
  assert.equal(passedConfig.SipUsername, '1001');
  assert.equal(passedConfig.sip, undefined);
  assert.equal(instance.iframe.srcdoc, undefined);
  assert.equal(host.children.length, 1);

  const focusTest = loadVphone();
  const focusInstance = focusTest.Vphone.mount({
    container: '#host',
    phoneUrl: 'https://phone.example.test/index.html',
    floating: false,
    config: { Language: 'vi', SipUsername: '1005' }
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
    config: { HideSettingsButton: false, HideRecordAllCallsButton: false }
  });
  const settingsConfig = JSON.parse(decodeURIComponent(settingsInstance.iframe.attributes.src.split('#bpConfig=')[1]));
  assert.equal(settingsConfig.HideSettingsButton, false);
  assert.equal(settingsConfig.HideRecordAllCallsButton, false);
  assert.equal(settingsHost.children.length, 1);

  const { Vphone: VphoneLegacyConfig } = loadVphone();
  const legacyInstance = VphoneLegacyConfig.mount({
    container: '#host',
    phoneUrl: 'https://phone.example.test/index.html',
    floating: false,
    wssServer: 'pbx.example.test',
    WebSocketPort: 7443,
    ServerPath: '/ws',
    SipDomain: 'pbx.example.test',
    SipUsername: '1001',
    SipPassword: 'secret',
    config: {
      Language: 'vi',
      HideSettingsButton: false
    }
  });
  const legacyConfig = JSON.parse(decodeURIComponent(legacyInstance.iframe.attributes.src.split('#bpConfig=')[1]));
  assert.equal(legacyConfig.wssServer, 'pbx.example.test');
  assert.equal(legacyConfig.WebSocketPort, 7443);
  assert.equal(legacyConfig.SipUsername, '1001');
  assert.equal(legacyConfig.Language, 'vi');
  assert.equal(legacyConfig.HideSettingsButton, false);

  const { Vphone: VphonePhoneConfig } = loadVphone();
  const phoneConfigInstance = VphonePhoneConfig.mount({
    container: '#host',
    phoneUrl: 'https://phone.example.test/index.html',
    floating: false,
    config: {
      phone: {
        wssServer: 'nested.example.test',
        WebSocketPort: 8443,
        SipUsername: '1002'
      },
      HideSettingsButton: false
    }
  });
  const phoneConfig = JSON.parse(decodeURIComponent(phoneConfigInstance.iframe.attributes.src.split('#bpConfig=')[1]));
  assert.equal(phoneConfig.wssServer, 'nested.example.test');
  assert.equal(phoneConfig.WebSocketPort, 8443);
  assert.equal(phoneConfig.SipUsername, '1002');
  assert.equal(phoneConfig.HideSettingsButton, false);

  const { Vphone: VphoneEmbedded, host: embeddedHost } = loadVphone();
  const embeddedInstance = VphoneEmbedded.mount({
    container: '#host',
    floating: false,
    config: {
      Language: 'vi',
      wssServer: 'embedded.example.test',
      SipUsername: '1003'
    }
  });
  assert.match(embeddedInstance.iframe.srcdoc, /window\.__VPhoneEmbedConfig/);
  assert.equal(embeddedInstance.iframe.attributes.tabindex, '-1');
  assert.match(embeddedInstance.iframe.srcdoc, /window\.__VphoneEmbedConfig = window\.__VPhoneEmbedConfig/);
  assert.match(embeddedInstance.iframe.srcdoc, /embedded\.example\.test/);
  assert.match(embeddedInstance.iframe.srcdoc, /"Language":"vi"/);
  assert.equal(embeddedHost.children.length, 1);

  const { Vphone: VphoneMinified, host: minHost } = loadVphone({ minified: true });
  const minifiedInstance = VphoneMinified.mount({
    container: '#host',
    floating: false,
    config: {
      Language: 'vi',
      wssServer: 'minified.example.test',
      SipUsername: '1004'
    }
  });
  assert.equal(!!minifiedInstance.iframe.srcdoc, true);
  assert.match(minifiedInstance.iframe.srcdoc, /window\.__VPhoneEmbedConfig/);
  assert.match(minifiedInstance.iframe.srcdoc, /minified\.example\.test/);
  assert.equal(minHost.children.length, 1);
};

