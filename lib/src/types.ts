export type CallType = 'audio' | 'video';
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
