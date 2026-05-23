#!/usr/bin/env node
/**
 * Build the SDK distribution artifacts used by consumers and tests.
 * Outputs:
 * - dist/vphone-sdk.cjs
 * - dist/vphone-sdk.mjs
 * - dist/vphone-sdk.d.ts
 */

const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, '..');
const srcDir = path.join(libDir, 'src');
const distDir = path.join(libDir, 'dist');

const requiredSourceFiles = [
  path.join(srcDir, 'vphone-sdk.ts'),
  path.join(srcDir, 'types.ts')
];

for (const filePath of requiredSourceFiles) {
  if (!fs.existsSync(filePath)) {
    throw new Error('Missing SDK source file: ' + path.relative(libDir, filePath));
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function buildCommonJsSource() {
  return `'use strict';

let nextCallId = 1;

function normalizeCallOptions(options) {
  const input = options || {};
  return {
    callType: input.callType || 'audio',
    callerName: input.callerName || null,
    extraHeaders: input.extraHeaders || null
  };
}

function defaultCallHandle(number, callType) {
  return {
    id: 'local-' + nextCallId++,
    number: number,
    callType: callType
  };
}

function createPhoneClient(config, options) {
  const runtimeOptions = options || {};
  const listeners = new Map();
  const adapter = runtimeOptions.adapter || {};

  function emit(event) {
    const handlers = listeners.get(event.type);
    if (!handlers) return;
    handlers.forEach((handler) => handler(event));
  }

  async function invokeVoid(method) {
    const args = Array.prototype.slice.call(arguments, 1);
    const fn = adapter[method];
    if (typeof fn === 'function') await fn.apply(adapter, args);
  }

  return {
    async register() {
      emit({ type: 'registration', state: 'registering' });
      await invokeVoid('register', config);
      emit({ type: 'registration', state: 'registered' });
    },
    async unregister() {
      await invokeVoid('unregister');
      emit({ type: 'registration', state: 'unregistered' });
    },
    async makeCall(number, options) {
      const cleanNumber = String(number || '').trim();
      if (!cleanNumber) throw new Error('VPhoneClient.makeCall requires a number');
      const normalized = normalizeCallOptions(options);
      const handle = adapter.makeCall
        ? await adapter.makeCall(cleanNumber, normalized)
        : defaultCallHandle(cleanNumber, normalized.callType);
      emit({ type: 'call', phase: 'outgoing', callId: handle.id, number: cleanNumber, callType: normalized.callType });
      return handle;
    },
    async answer(callId, options) { await invokeVoid('answer', callId, options); emit({ type: 'call', phase: 'answered', callId: callId }); },
    async reject(callId) { await invokeVoid('reject', callId); emit({ type: 'call', phase: 'rejected', callId: callId }); },
    async hangup(callId) { await invokeVoid('hangup', callId); emit({ type: 'call', phase: 'ended', callId: callId }); },
    async mute(callId) { await invokeVoid('mute', callId); emit({ type: 'media', kind: 'audio', state: 'muted', callId: callId }); },
    async unmute(callId) { await invokeVoid('unmute', callId); emit({ type: 'media', kind: 'audio', state: 'unmuted', callId: callId }); },
    async hold(callId) { await invokeVoid('hold', callId); emit({ type: 'call', phase: 'held', callId: callId }); },
    async unhold(callId) { await invokeVoid('unhold', callId); emit({ type: 'call', phase: 'resumed', callId: callId }); },
    async sendDtmf(callId, digit) { await invokeVoid('sendDtmf', callId, digit); emit({ type: 'call', phase: 'dtmf', callId: callId, reason: digit }); },
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
      return () => listeners.get(event)?.delete(handler);
    },
    async destroy() {
      await invokeVoid('destroy');
      listeners.clear();
    },
    emitForTest: emit
  };
}

function createIframeBridgeAdapter(phoneInstance) {
  if (!phoneInstance) throw new Error('createIframeBridgeAdapter requires a VPhone mount instance');
  return {
    makeCall(number, options) {
      const ok = phoneInstance.makeCall(number, options);
      if (!ok) throw new Error('VPhone iframe bridge rejected makeCall');
      return defaultCallHandle(number, (options && options.callType) || 'audio');
    },
    destroy() {
      if (typeof phoneInstance.destroy === 'function') phoneInstance.destroy();
    }
  };
}

module.exports = {
  createPhoneClient,
  createIframeBridgeAdapter
};
module.exports.default = module.exports;
`;
}

function buildEsmSource() {
  return `let nextCallId = 1;

function normalizeCallOptions(options) {
  const input = options || {};
  return {
    callType: input.callType || 'audio',
    callerName: input.callerName || null,
    extraHeaders: input.extraHeaders || null
  };
}

function defaultCallHandle(number, callType) {
  return {
    id: 'local-' + nextCallId++,
    number,
    callType
  };
}

export function createPhoneClient(config, options = {}) {
  const listeners = new Map();
  const adapter = options.adapter || {};

  function emit(event) {
    const handlers = listeners.get(event.type);
    if (!handlers) return;
    handlers.forEach((handler) => handler(event));
  }

  async function invokeVoid(method, ...args) {
    const fn = adapter[method];
    if (typeof fn === 'function') await fn(...args);
  }

  return {
    async register() {
      emit({ type: 'registration', state: 'registering' });
      await invokeVoid('register', config);
      emit({ type: 'registration', state: 'registered' });
    },
    async unregister() {
      await invokeVoid('unregister');
      emit({ type: 'registration', state: 'unregistered' });
    },
    async makeCall(number, options) {
      const cleanNumber = String(number || '').trim();
      if (!cleanNumber) throw new Error('VPhoneClient.makeCall requires a number');
      const normalized = normalizeCallOptions(options);
      const handle = adapter.makeCall
        ? await adapter.makeCall(cleanNumber, normalized)
        : defaultCallHandle(cleanNumber, normalized.callType);
      emit({ type: 'call', phase: 'outgoing', callId: handle.id, number: cleanNumber, callType: normalized.callType });
      return handle;
    },
    async answer(callId, options) { await invokeVoid('answer', callId, options); emit({ type: 'call', phase: 'answered', callId }); },
    async reject(callId) { await invokeVoid('reject', callId); emit({ type: 'call', phase: 'rejected', callId }); },
    async hangup(callId) { await invokeVoid('hangup', callId); emit({ type: 'call', phase: 'ended', callId }); },
    async mute(callId) { await invokeVoid('mute', callId); emit({ type: 'media', kind: 'audio', state: 'muted', callId }); },
    async unmute(callId) { await invokeVoid('unmute', callId); emit({ type: 'media', kind: 'audio', state: 'unmuted', callId }); },
    async hold(callId) { await invokeVoid('hold', callId); emit({ type: 'call', phase: 'held', callId }); },
    async unhold(callId) { await invokeVoid('unhold', callId); emit({ type: 'call', phase: 'resumed', callId }); },
    async sendDtmf(callId, digit) { await invokeVoid('sendDtmf', callId, digit); emit({ type: 'call', phase: 'dtmf', callId, reason: digit }); },
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
      return () => listeners.get(event)?.delete(handler);
    },
    async destroy() {
      await invokeVoid('destroy');
      listeners.clear();
    },
    emitForTest: emit
  };
}

export function createIframeBridgeAdapter(phoneInstance) {
  if (!phoneInstance) throw new Error('createIframeBridgeAdapter requires a VPhone mount instance');
  return {
    makeCall(number, options) {
      const ok = phoneInstance.makeCall(number, options);
      if (!ok) throw new Error('VPhone iframe bridge rejected makeCall');
      return defaultCallHandle(number, (options && options.callType) || 'audio');
    },
    destroy() {
      if (typeof phoneInstance.destroy === 'function') phoneInstance.destroy();
    }
  };
}

export default {
  createPhoneClient,
  createIframeBridgeAdapter
};
`;
}

function buildTypeDeclarations() {
  return `export type CallType = 'audio' | 'video';
export type RegistrationState = 'idle' | 'registering' | 'registered' | 'unregistered' | 'failed';

export type VPhoneConfig = {
  sip: {
    wssServer: string;
    webSocketPort: number;
    serverPath?: string;
    sipDomain?: string;
    username: string;
    password: string;
  };
  media?: {
    audio?: boolean;
    video?: boolean;
  };
  mediaConfig?: {
    ringtone?: string;
    ringbackTone?: string;
    holdMusic?: string;
    busy?: string;
    callWaiting?: string;
    congestion?: string;
    earlyMedia?: string;
  };
  language?: string;
};

export type CallOptions = {
  callType?: CallType;
  callerName?: string | null;
  extraHeaders?: string[] | null;
};

export type CallHandle = {
  id: string;
  number: string;
  callType: CallType;
};

export type VPhoneEvent =
  | { type: 'registration'; state: RegistrationState; reason?: string }
  | { type: 'call'; phase: string; callId: string; number?: string; callType?: CallType; reason?: string }
  | { type: 'media'; kind: 'audio' | 'video'; state: string; callId?: string }
  | { type: 'error'; code: string; message: string; cause?: unknown };

export type VPhoneAdapter = {
  register?(config: VPhoneConfig): Promise<void> | void;
  unregister?(): Promise<void> | void;
  makeCall?(number: string, options: Required<CallOptions>): Promise<CallHandle> | CallHandle;
  answer?(callId: string, options?: { video?: boolean }): Promise<void> | void;
  reject?(callId: string): Promise<void> | void;
  hangup?(callId: string): Promise<void> | void;
  mute?(callId: string): Promise<void> | void;
  unmute?(callId: string): Promise<void> | void;
  hold?(callId: string): Promise<void> | void;
  unhold?(callId: string): Promise<void> | void;
  sendDtmf?(callId: string, digit: string): Promise<void> | void;
  destroy?(): Promise<void> | void;
};

export type VPhoneClient = {
  register(): Promise<void>;
  unregister(): Promise<void>;
  makeCall(number: string, options?: CallOptions): Promise<CallHandle>;
  answer(callId: string, options?: { video?: boolean }): Promise<void>;
  reject(callId: string): Promise<void>;
  hangup(callId: string): Promise<void>;
  mute(callId: string): Promise<void>;
  unmute(callId: string): Promise<void>;
  hold(callId: string): Promise<void>;
  unhold(callId: string): Promise<void>;
  sendDtmf(callId: string, digit: string): Promise<void>;
  on<TEvent extends VPhoneEvent['type']>(
    event: TEvent,
    handler: (payload: Extract<VPhoneEvent, { type: TEvent }>) => void
  ): () => void;
  destroy(): Promise<void>;
};

export type CreatePhoneClientOptions = {
  adapter?: VPhoneAdapter;
};

export declare function createPhoneClient(
  config: VPhoneConfig,
  options?: CreatePhoneClientOptions
): VPhoneClient & { emitForTest(event: VPhoneEvent): void };

export declare function createIframeBridgeAdapter(
  phoneInstance: { makeCall(number: string, options?: CallOptions): boolean; destroy?(): void }
): VPhoneAdapter;

declare const _default: {
  createPhoneClient: typeof createPhoneClient;
  createIframeBridgeAdapter: typeof createIframeBridgeAdapter;
};

export default _default;
`;
}

function main() {
  ensureDir(distDir);
  writeFile(path.join(distDir, 'vphone-sdk.cjs'), buildCommonJsSource());
  writeFile(path.join(distDir, 'vphone-sdk.mjs'), buildEsmSource());
  writeFile(path.join(distDir, 'vphone-sdk.d.ts'), buildTypeDeclarations());
  console.log('SDK build complete');
  console.log('  Output:', path.join('dist', 'vphone-sdk.cjs'));
  console.log('  Output:', path.join('dist', 'vphone-sdk.mjs'));
  console.log('  Output:', path.join('dist', 'vphone-sdk.d.ts'));
}

main();
