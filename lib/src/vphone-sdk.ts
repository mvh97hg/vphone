import type {
  VPhoneAdapter,
  VPhoneClient,
  VPhoneConfig,
  VPhoneEvent,
  CallHandle,
  CallOptions
} from './types';

let nextCallId = 1;

function normalizeCallOptions(options?: CallOptions): Required<CallOptions> {
  return {
    callType: options?.callType || 'audio',
    callerName: options?.callerName || null,
    extraHeaders: options?.extraHeaders || null
  };
}

function defaultCallHandle(number: string, callType: 'audio' | 'video'): CallHandle {
  return {
    id: 'local-' + nextCallId++,
    number,
    callType
  };
}

export function createPhoneClient(config: VPhoneConfig, options: { adapter?: VPhoneAdapter } = {}): VPhoneClient & { emitForTest(event: VPhoneEvent): void } {
  const listeners = new Map<string, Set<(event: VPhoneEvent) => void>>();
  const adapter = options.adapter || {};

  function emit(event: VPhoneEvent): void {
    const handlers = listeners.get(event.type);
    if (!handlers) return;
    handlers.forEach((handler) => handler(event));
  }

  async function invokeVoid(method: keyof VPhoneAdapter, ...args: unknown[]): Promise<void> {
    const fn = adapter[method] as undefined | ((...args: unknown[]) => Promise<void> | void);
    if (fn) await fn(...args);
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
    async makeCall(number: string, options?: CallOptions) {
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
      listeners.get(event)!.add(handler as (payload: VPhoneEvent) => void);
      return () => listeners.get(event)?.delete(handler as (payload: VPhoneEvent) => void);
    },
    async destroy() {
      await invokeVoid('destroy');
      listeners.clear();
    },
    emitForTest: emit
  };
}

export function createIframeBridgeAdapter(
  phoneInstance: { makeCall(number: string, options?: CallOptions): boolean; destroy?(): void }
): VPhoneAdapter {
  if (!phoneInstance) throw new Error('createIframeBridgeAdapter requires a VPhone mount instance');
  return {
    makeCall(number, options) {
      const ok = phoneInstance.makeCall(number, options);
      if (!ok) throw new Error('VPhone iframe bridge rejected makeCall');
      return defaultCallHandle(number, options.callType || 'audio');
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
