/**
 * Canonical phone config keys (no legacy aliases).
 * Hosts should only pass keys that differ from defaults.
 */

export const PHONE_CONFIG_DEFAULTS = Object.freeze({
  Language: "vi",
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
  ServerPath: "/ws",
  MaxDidLength: 24,
  HoldMode: "sip"
});

/** Fixed floating/inline panel size — matches UI phoneFrame250. */
export const PHONE_UI_FRAME_SIZE = Object.freeze({
  width: "250px",
  height: "457px"
});

export const STORAGE_KEYS = Object.freeze([
  "Server",
  "Port",
  "Domain",
  "Username",
  "Password",
  "PasswordType",
  "ServerPath",
  "profileName"
]);

const REMOVED_KEYS = Object.freeze([
  "wssServer",
  "WSSSERVER",
  "WebSocketPort",
  "webSocketPort",
  "WSSPORT",
  "SipDomain",
  "sipDomain",
  "DOMAIN",
  "SipUsername",
  "username",
  "SIPUSER",
  "SipPassword",
  "password",
  "sipPassword",
  "SIPPASSWORD",
  "SipPasswordType",
  "SIPPASSWORDTYPE",
  "NotificationsActive",
  "SettingsButton",
  "HideRecordAllCallsButton",
  "DisableFreeDial",
  "DisableBuddies",
  "multiTabLeader",
  "serverPath",
  "WSSPATH"
]);

/**
 * Normalize host/SIP config to canonical public keys.
 * Always forces EnableRingtone=true (cannot be disabled via config).
 * Nested `phone` / `sip` objects are merged (keys must already be canonical).
 */
export function normalizePhoneConfig(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  let out = { ...source };

  if (source.phone && typeof source.phone === "object") {
    out = { ...out, ...source.phone };
  }
  if (source.sip && typeof source.sip === "object") {
    out = { ...out, ...source.sip };
  }
  delete out.phone;
  delete out.sip;

  for (const key of REMOVED_KEYS) {
    delete out[key];
  }

  // Ringtone is always on — never let hosts/users disable inbound ring.
  out.EnableRingtone = true;

  // Host-selected SIP INVITE headers to surface on incoming calls (not hardcoded).
  if (out.IncomingHeaders !== undefined) {
    const raw = out.IncomingHeaders;
    const list = Array.isArray(raw)
      ? raw
      : (typeof raw === "string" ? raw.split(/[\s,]+/) : []);
    out.IncomingHeaders = list
      .map((name) => String(name || "").trim())
      .filter(Boolean);
  }

  return out;
}

/** Drop keys that match library defaults so host/iframe payloads stay minimal. */
export function compactPhoneConfig(input = {}, defaults = PHONE_CONFIG_DEFAULTS) {
  const normalized = normalizePhoneConfig(input);
  const out = {};
  for (const [key, value] of Object.entries(normalized)) {
    if (value === undefined || value === null) continue;
    if (Object.prototype.hasOwnProperty.call(defaults, key) && defaults[key] === value) {
      continue;
    }
    if (key === "EnableRingtone") continue;
    out[key] = value;
  }
  return out;
}

export function getConfigValue(config, key, fallback = "") {
  if (config && config[key] !== undefined && config[key] !== null) {
    return config[key];
  }
  return fallback;
}

export function readStorageValue(key) {
  if (typeof window === "undefined" || !window.localStorage) return "";
  const value = window.localStorage.getItem(key);
  return value !== null && value !== "" ? value : "";
}

export function writeStorageValue(key, value) {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (value === undefined || value === null || value === "") {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, String(value));
}
