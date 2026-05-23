const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const moment = require('moment');

function extractFunction(source, name) {
  const marker = `function ${name}`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} not found`);

  const braceStart = source.indexOf('{', start);
  let depth = 0;
  for (let i = braceStart; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`${name} body was not closed`);
}

function loadPhoneHelpers(functionNames) {
  const source = fs.readFileSync(path.join(__dirname, '..', '..', 'Phone', 'phone.js'), 'utf8');
  const context = {
    moment,
    lang: {
      state_on_the_phone: 'Busy',
      call_busy: 'Line Busy',
      call_cancelled: 'Call Cancelled',
      call_rejected: 'Call Rejected',
      call_noanswer: 'No Answer',
      you_missed_a_call: 'You missed a call'
    },
    profileUserID: '1001',
    Buddies: [],
    removed: [],
    shownContacts: 0,
    shownRecents: 0,
    localDbStore: {},
    localDB: {
      getItem(key) { return context.localDbStore[key] || null; },
      setItem(key, value) { context.localDbStore[key] = value; },
      key(index) { return Object.keys(context.localDbStore)[index] || null; },
      get length() { return Object.keys(context.localDbStore).length; }
    },
    $: {
      each(items, callback) {
        items.forEach((item, index) => callback(index, item));
      },
      grep(items, callback) {
        return items.filter((item, index) => callback(item, index));
      }
    }
  };
  context.DoRemoveBuddy = function DoRemoveBuddy(identity) { context.removed.push(identity); };
  context.ShowContacts = function ShowContacts() { context.shownContacts += 1; };
  context.ShowRecentsTab = function ShowRecentsTab() { context.shownRecents += 1; };

  vm.createContext(context);
  vm.runInContext(functionNames.map((name) => extractFunction(source, name)).join('\n'), context);
  return context;
}

module.exports = function testPhoneBehavior() {
  const context = loadPhoneHelpers([
    'PadClockPart',
    'FormatDurationClock',
    'formatShortDuration',
    'ParseUtcDisplayDate',
    'FormatFixedClockTime',
    'FormatFixedDate',
    'FormatRecentLogTime',
    'GetRecentDayLabel',
    'GetRecentCallStatus',
    'ClearAllRecentHistory',
    'ClearAllContacts'
  ]);

  const sampleRecent = { ItemDate: '2026-05-21 21:01:35 UTC' };
  const sampleMoment = moment.utc(sampleRecent.ItemDate.replace(' UTC', '')).local();
  assert.equal(context.FormatRecentLogTime(sampleRecent), sampleMoment.format('HH:mm'));
  assert.equal(context.GetRecentDayLabel(sampleRecent), sampleMoment.format('DD/MM/YYYY'));
  assert.equal(context.formatShortDuration(4321), '01:12:01');

  const busyStatus = context.GetRecentCallStatus({
    SrcUserId: '1002',
    CallDirection: 'inbound',
    Billsec: 0,
    ReasonCode: 486,
    ReasonText: 'Busy Here'
  });
  assert.equal(busyStatus.statusText, 'Line Busy');

  context.Buddies = [
    { identity: 'contact-1', type: 'contact' },
    { identity: 'extension-1', type: 'extension' },
    { identity: 'group-1', type: 'group' },
    { identity: 'contact-2', type: 'contact' }
  ];
  context.ClearAllContacts();
  assert.deepEqual(context.removed, ['contact-1', 'contact-2']);
  assert.equal(context.shownContacts, 1);

  context.localDbStore = {
    'contact-1-stream': JSON.stringify({
      TotalRows: 2,
      DataCollection: [
        { ItemType: 'CDR', CdrId: 'cdr-1' },
        { ItemType: 'MSG', MessageId: 'msg-1' }
      ]
    }),
    'extension-1-stream': JSON.stringify({
      TotalRows: 1,
      DataCollection: [
        { ItemType: 'CDR', CdrId: 'cdr-2' }
      ]
    }),
    'orphan-stream': JSON.stringify({
      TotalRows: 1,
      DataCollection: [
        { ItemType: 'CDR', CdrId: 'orphan-cdr' }
      ]
    })
  };
  context.ClearAllRecentHistory();
  assert.deepEqual(JSON.parse(context.localDbStore['contact-1-stream']).DataCollection, [
    { ItemType: 'MSG', MessageId: 'msg-1' }
  ]);
  assert.deepEqual(JSON.parse(context.localDbStore['extension-1-stream']).DataCollection, []);
  assert.deepEqual(JSON.parse(context.localDbStore['orphan-stream']).DataCollection, []);
  assert.equal(context.shownRecents, 1);

  const mediaContext = loadPhoneHelpers([
    'sanitizeMediaConfigValue',
    'getFirstDefinedMediaConfigValue',
    'normalizeMediaConfig',
    'PreloadAudioFiles'
  ]);
  mediaContext.audioBlobs = {};
  mediaContext.hostingPrefix = '';
  mediaContext.warmed = [];
  mediaContext.xhrUrls = [];
  mediaContext.$ = {
    each(items, callback) {
      if (Array.isArray(items)) {
        items.forEach((item, index) => callback(index, item));
        return;
      }
      Object.keys(items).forEach((key, index) => callback(key, items[key], index));
    }
  };
  mediaContext.getEffectiveMediaConfig = function getEffectiveMediaConfig() {
    return {
      ringtone: '',
      holdMusic: '',
      busy: '',
      callWaiting: '',
      congestion: '',
      earlyMedia: ''
    };
  };
  mediaContext.ResolveEmbeddedMediaUrl = function ResolveEmbeddedMediaUrl(fileName, fallbackUrl) {
    return fallbackUrl;
  };
  mediaContext.resolveMediaAssetUrl = function resolveMediaAssetUrl(configValue, fallbackFileName, fallbackUrl) {
    return fallbackUrl;
  };
  mediaContext.warmAudioCache = function warmAudioCache(item) {
    mediaContext.warmed.push(item);
  };
  mediaContext.XMLHttpRequest = function XMLHttpRequest() {
    this.open = function open(method, url) {
      mediaContext.xhrUrls.push(url);
    };
    this.send = function send() {
      this.response = {};
      if (typeof this.onload === 'function') {
        this.onload({});
      }
    };
  };
  mediaContext.FileReader = function FileReader() {
    this.readAsDataURL = function readAsDataURL() {
      this.result = 'data:audio/mpeg;base64,ZmFrZQ==';
      if (typeof this.onload === 'function') {
        this.onload();
      }
    };
  };
  mediaContext.PreloadAudioFiles();
  assert.equal(mediaContext.audioBlobs.Busy.file, 'Busy.mp3');
  assert.equal(mediaContext.audioBlobs.Congestion.file, 'Congestion.mp3');
  assert.equal(mediaContext.audioBlobs.EarlyMedia.file, 'EarlyMedia.mp3');
  assert.equal(Object.prototype.hasOwnProperty.call(mediaContext.audioBlobs, 'Busy_US'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(mediaContext.audioBlobs, 'EarlyMedia_Australia'), false);
  assert.equal(mediaContext.warmed.length, 6);
  assert.equal(mediaContext.xhrUrls.length, 6);
};
