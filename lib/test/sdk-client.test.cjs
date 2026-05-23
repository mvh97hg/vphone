const assert = require('node:assert/strict');

module.exports = function testSdkClient() {
  const sdk = require('../dist/vphone-sdk.cjs');
  const client = sdk.createPhoneClient({
    sip: {
      wssServer: 'pbx.example.test',
      webSocketPort: 7443,
      username: '1001',
      password: 'secret'
    }
  });

  const events = [];
  const off = client.on('registration', (event) => events.push(event.state));
  client.emitForTest({ type: 'registration', state: 'registered' });
  off();
  client.emitForTest({ type: 'registration', state: 'unregistered' });

  assert.equal(typeof client.register, 'function');
  assert.equal(typeof client.makeCall, 'function');
  assert.deepEqual(events, ['registered']);
};
