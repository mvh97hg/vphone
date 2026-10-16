const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function createCore() {
  const listeners = new Map();
  return {
    config: { Username: '1001', Domain: 'pbx.test' },
    isRegistered: false,
    isMuted: false,
    isOnHold: false,
    session: null,
    _lastRegisterError: '',
    on(name, handler) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(handler);
      return () => this.off(name, handler);
    },
    off(name, handler) {
      listeners.get(name)?.delete(handler);
    },
    emit(name, payload) {
      for (const handler of listeners.get(name) || []) handler(payload);
    },
    getRegistrationState() {
      return {
        online: !!this.isRegistered,
        user: '1001',
        error: this.isRegistered ? undefined : this._lastRegisterError || undefined
      };
    }
  };
}

module.exports = async function tabLeaderTest() {
  const src = fs.readFileSync(path.join(__dirname, '../../src/sdk/tab-leader.js'), 'utf8');
  assert.match(src, /BroadcastChannel/);
  assert.match(src, /navigator\.locks/);
  assert.match(src, /EnableMultiTabLeader/);
  assert.match(src, /installTabLeader/);
  assert.match(src, /sendCommand\(\s*["']register["']/);

  const sdkSrc = fs.readFileSync(path.join(__dirname, '../../src/sdk/phone-sdk.js'), 'utf8');
  assert.match(sdkSrc, /installTabLeader/);
  assert.match(sdkSrc, /shouldEnableTabLeader/);

  const mod = await import(pathToFileURL(path.join(__dirname, '../../src/sdk/tab-leader.js')).href);
  assert.equal(typeof mod.installTabLeader, 'function');
  assert.equal(typeof mod.shouldEnableTabLeader, 'function');
  assert.equal(mod.shouldEnableTabLeader({ EnableMultiTabLeader: false }), false);

  if (typeof BroadcastChannel === 'undefined') {
    console.log('  (skip runtime bus: no BroadcastChannel)');
    return;
  }

  const channelName = `vphone-tab-test-${Date.now()}`;
  const lockName = `vphone-lock-test-${Date.now()}`;

  let registered = 0;
  let leaderAnswered = 0;
  const core = createCore();
  const sdk = {
    core,
    async register() {
      registered += 1;
      core.isRegistered = true;
      core.emit('registration-changed', { online: true, user: '1001' });
      return { online: true, user: '1001' };
    },
    async unregister() {
      core.isRegistered = false;
      return { online: false };
    },
    async answer() {
      leaderAnswered += 1;
      return { answered: true, via: 'leader' };
    },
    hangup() {},
    getRegistrationState() {
      return core.getRegistrationState();
    }
  };

  const leader = mod.installTabLeader(sdk, {
    config: { Username: '1001', Domain: 'pbx.test', EnableMultiTabLeader: true },
    channelName,
    lockName,
    followerWaitMs: 1500
  });
  assert.ok(leader);

  const state = await sdk.register();
  assert.equal(state.online, true);
  assert.equal(registered, 1);
  await new Promise((r) => setTimeout(r, 100));
  assert.equal(leader.isLeader(), true);

  let registered2 = 0;
  const core2 = createCore();
  const sdk2 = {
    core: core2,
    async register() {
      registered2 += 1;
      core2.isRegistered = true;
      return { online: true, user: '1001' };
    },
    async unregister() {},
    async answer() {
      return { answered: true, via: 'follower-local' };
    },
    hangup() {},
    getRegistrationState() {
      return core2.getRegistrationState();
    }
  };

  const follower = mod.installTabLeader(sdk2, {
    config: { Username: '1001', Domain: 'pbx.test', EnableMultiTabLeader: true },
    channelName,
    lockName,
    followerWaitMs: 1500
  });
  assert.ok(follower);

  const followerState = await sdk2.register();
  assert.equal(followerState.online, true);
  assert.equal(registered2, 0, 'follower must not open a second SIP REGISTER');
  assert.equal(follower.isLeader(), false);
  // Follower must not fake a live SIP UserAgent / isRegistered on core.
  assert.equal(!!core2.userAgent, false);
  assert.equal(core2.isRegistered, false);

  const answerResult = await sdk2.answer();
  assert.equal(answerResult?.via, 'leader');
  assert.equal(leaderAnswered, 1);

  // Follower unregister must proxy to leader (no local SIP).
  const afterUnreg = await sdk2.unregister();
  assert.equal(afterUnreg?.online, false);
  assert.equal(core.isRegistered, false);
  assert.equal(registered2, 0, 'follower unregister must not REGISTER locally');

  // Follower register while leader is offline must ask leader to REGISTER again.
  const beforeRereg = registered;
  const rereg = await sdk2.register();
  assert.equal(rereg?.online, true, 'follower register must bring leader online');
  assert.equal(registered, beforeRereg + 1, 'leader must SIP REGISTER when follower requests it');
  assert.equal(registered2, 0, 'follower still must not open its own SIP REGISTER');

  // Simulate leader tab closing — follower must take over and REGISTER for real.
  leader.destroy();
  await new Promise((r) => setTimeout(r, 200));
  assert.equal(follower.isLeader(), true);
  assert.equal(registered2, 1, 'new leader must SIP REGISTER after takeover');
  assert.equal(core2.isRegistered, true);

  follower.destroy();
};
