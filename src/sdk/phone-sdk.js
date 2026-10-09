import { PhoneCore } from "../core/phone-core.js";
import { installTabLeader, shouldEnableTabLeader } from "./tab-leader.js";
import { normalizeSipPasswordAndType } from "./sip-auth.js";
import {
  normalizePhoneConfig,
  readStorageValue,
  writeStorageValue,
  STORAGE_KEYS
} from "./phone-config.js";

export { installTabLeader, shouldEnableTabLeader } from "./tab-leader.js";
export {
  normalizeSipPasswordAndType,
  prepareSipPasswordForStorage,
  computeHa1,
  sipAuthorizationOptions
} from "./sip-auth.js";
export {
  normalizePhoneConfig,
  compactPhoneConfig,
  PHONE_CONFIG_DEFAULTS,
  PHONE_UI_FRAME_SIZE,
  getConfigValue,
  readStorageValue,
  writeStorageValue
} from "./phone-config.js";

/** Prefix for OS-encrypted secrets persisted in localStorage (Electron safeStorage). */
export const SECRET_STORAGE_PREFIX = "vphone:safe:";

function desktopSecretApi() {
  if (typeof window === "undefined") return null;
  const api = window.VPhoneDesktop;
  if (!api || typeof api.encryptSecret !== "function" || typeof api.decryptSecret !== "function") {
    return null;
  }
  return api;
}

export function isEncryptedSecret(value) {
  return typeof value === "string" && value.startsWith(SECRET_STORAGE_PREFIX);
}

async function isSecretStorageAvailable() {
  const api = desktopSecretApi();
  if (!api) return false;
  try {
    if (typeof api.isSecretStorageAvailable === "function") {
      return !!(await api.isSecretStorageAvailable());
    }
    return true;
  } catch {
    return false;
  }
}

/** Decrypt or migrate a stored SipPassword value. Plaintext is re-encrypted on Electron when possible. */
export async function resolveStoredSipPassword(raw) {
  if (raw == null) return "";
  const value = String(raw);
  if (!value) return "";

  if (!isEncryptedSecret(value)) {
    if (await isSecretStorageAvailable()) {
      try {
        await persistSipPassword(value);
      } catch {
        // Keep using plaintext if migration fails.
      }
    }
    return value;
  }

  const api = desktopSecretApi();
  if (!api) return "";
  try {
    return String(await api.decryptSecret(value.slice(SECRET_STORAGE_PREFIX.length)) ?? "");
  } catch {
    return "";
  }
}

/**
 * Persist Password only when Electron safeStorage is available.
 * Web embed keeps secrets in memory only (never write Password to localStorage).
 */
export async function persistSipPassword(plain) {
  if (typeof window === "undefined" || !window.localStorage) return false;
  const value = String(plain ?? "");

  if (!(await isSecretStorageAvailable())) {
    // Web / no OS vault: clear any legacy Password key; do not store secrets.
    if (!value) writeStorageValue("Password", "");
    return false;
  }

  if (!value) {
    writeStorageValue("Password", "");
    return true;
  }

  const api = desktopSecretApi();
  const cipher = await api.encryptSecret(value);
  writeStorageValue("Password", `${SECRET_STORAGE_PREFIX}${cipher}`);
  return true;
}

/** SIP provisioning keys — host/memory owned on web; not reloaded from localStorage. */
const WEB_MEMORY_ONLY_KEYS = new Set([
  "Password",
  "PasswordType",
  "Username",
  "Server",
  "Port",
  "Domain",
  "ServerPath"
]);

function configFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) return {};
  const electron = !!desktopSecretApi();
  const config = {};
  for (const key of STORAGE_KEYS) {
    const value = readStorageValue(key);
    if (!value) continue;
    // Never feed ciphertext into SIP auth; hydrateSecrets() decrypts first.
    if (key === "Password") continue;
    if (!electron && WEB_MEMORY_ONLY_KEYS.has(key)) continue;
    config[key] = value;
  }
  return config;
}

export class PhoneSDK {
  constructor(config = {}, deps = {}) {
    const mergedConfig = normalizePhoneConfig({ ...configFromStorage(), ...(config || {}) });
    if (isEncryptedSecret(mergedConfig.Password)) delete mergedConfig.Password;
    this.core = deps.core || new PhoneCore(mergedConfig, deps);
    this._tabLeaderController = null;
    // Multi-tab leader: one SIP REGISTER; followers proxy answer/hangup via BroadcastChannel.
    if (deps.tabLeader !== false && shouldEnableTabLeader(mergedConfig)) {
      this._tabLeaderController = installTabLeader(this, {
        config: mergedConfig,
        ...(deps.tabLeaderOptions || {})
      });
    }
  }

  /** @returns {{ tabId: string, getRole: Function, isLeader: Function, destroy: Function } | null} */
  getTabLeader() {
    return this._tabLeaderController || null;
  }

  /**
   * Normalize in-memory Password for register().
   * Electron may also load OS-encrypted storage; web embed never reads Password from localStorage.
   */
  async hydrateSecrets() {
    const configValue = this.core?.config?.Password;
    const configPassword = configValue && !isEncryptedSecret(configValue) ? String(configValue) : "";
    let storageValue = "";
    let storedType = null;
    if (!configPassword && (await isSecretStorageAvailable())) {
      const raw = readStorageValue("Password") || null;
      storageValue = raw ? await resolveStoredSipPassword(raw) : "";
      storedType = readStorageValue("PasswordType") || null;
    }
    const fromConfig = !!configPassword;
    const password = configPassword || storageValue || "";
    const type = fromConfig
      ? (this.core?.config?.PasswordType || "")
      : (storedType || this.core?.config?.PasswordType || "");
    const auth = normalizeSipPasswordAndType(password, type);
    if (auth.password) {
      this.configure({ Password: auth.password, PasswordType: auth.type });
      if (await isSecretStorageAvailable()) {
        try {
          await persistSipPassword(auth.password);
          writeStorageValue("PasswordType", auth.type || "ha1");
        } catch {
          // Non-fatal: in-memory password is enough for this session.
        }
      }
    }
    return auth.password;
  }

  on(eventName, handler) {
    return this.core.on(eventName, handler);
  }

  off(eventName, handler) {
    return this.core.off(eventName, handler);
  }

  configure(config = {}) {
    return this.core.configure?.(config);
  }

  bindAudioElements(elements) {
    return this.core.bindAudioElements?.(elements);
  }

  emitRegistrationChanged(state) {
    return this.core.emit?.("registration-changed", state);
  }

  register() {
    return this.core.register();
  }

  unregister() {
    return this.core.unregister();
  }

  call(number, options) {
    return this.core.call(number, options);
  }

  answer(options) {
    return this.core.answer(options);
  }

  reject(options) {
    return this.core.reject(options);
  }

  hangup() {
    return this.core.hangup();
  }

  mute() {
    return this.core.mute();
  }

  unmute() {
    return this.core.unmute();
  }

  toggleMute() {
    return this.core.toggleMute();
  }

  isOnHold() {
    return !!this.core.isOnHold;
  }

  hold() {
    return this.core.hold();
  }

  resume() {
    return this.core.resume();
  }

  warmMedia(constraints) {
    return this.core.warmMedia?.(constraints);
  }

  async ensureMediaAccess(constraints) {
    const ensure = this.core?.media?.ensureMediaAccess;
    if (typeof ensure !== "function") {
      const err = new Error("Media devices unavailable");
      err.name = "NotAllowedError";
      throw err;
    }
    return ensure.call(this.core.media, constraints);
  }

  sendDTMF(digits, options) {
    return this.core.sendDTMF(digits, options);
  }

  switchDevice(kind, deviceId) {
    return this.core.switchDevice(kind, deviceId);
  }

  toggleRegistration() {
    return this.core.toggleRegistration();
  }

  getRegistrationState() {
    return this.core.getRegistrationState();
  }

  listDevices() {
    return this.core.listDevices();
  }

  reconnect(options) {
    return this.core.reconnect(options);
  }

  transfer(target) {
    return this.core.transfer(target);
  }

  conference(target) {
    return this.core.conference(target);
  }
}
