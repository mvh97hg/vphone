import { createPhoneWidget } from "../../../../src/ui/phone-widget.js";

type DesktopBridge = {
  getConfig: () => Promise<any>;
  savePhoneAccount?: (account: Record<string, string>) => Promise<unknown>;
  clearPhoneAccount?: () => Promise<unknown>;
  isDevMode?: () => Promise<boolean>;
  requestMediaAccess?: () => Promise<any>;
  getDiagnostics?: () => Promise<any>;
  isSecretStorageAvailable?: () => Promise<boolean>;
  encryptSecret?: (plainText: string) => Promise<string>;
  decryptSecret?: (cipherBase64: string) => Promise<string>;
  focusWindow?: (reason: string) => Promise<unknown>;
  minimizeWindow: () => void;
  closeWindow: () => void;
  log: (level: string, message: string, meta?: unknown) => void;
  setCallPhase?: (phase: string) => void;
  onWindowFocused?: (handler: () => void) => void;
  onShortcutAction?: (handler: (payload: { action?: string }) => void) => void;
};

type MountedPhone = {
  sdk: any;
  ui: any;
  ready?: Promise<void>;
  destroy: () => void;
};

const shortcutDefaults = {
  answer: "F2",
  hangup: "Escape",
  hold: "F4",
  mute: "F6",
  transfer: "F8"
};

const shortcutLabels = {
  en: {
    answer: "Answer call",
    hangup: "Hangup",
    hold: "Hold or resume",
    mute: "Mute or unmute",
    transfer: "Transfer call"
  },
  vi: {
    answer: "Trả lời cuộc gọi",
    hangup: "Kết thúc cuộc gọi",
    hold: "Giữ cuộc gọi",
    mute: "Tắt hoặc bật tiếng",
    transfer: "Chuyển cuộc gọi"
  }
};

const shortcutPopupCopy = {
  en: {
    title: "Keyboard shortcuts",
    toggleTitle: "Shortcuts",
    closeAriaLabel: "Close",
    emptyText: "No shortcuts configured."
  },
  vi: {
    title: "Các phím tắt",
    toggleTitle: "Phím tắt",
    closeAriaLabel: "Đóng",
    emptyText: "Không có phím tắt nào được cấu hình."
  }
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveLang(language: unknown) {
  return String(language || document.documentElement.lang || "en").toLowerCase().startsWith("vi") ? "vi" : "en";
}

function normalizeShortcuts(value: unknown) {
  let configured: Record<string, string> = {};
  if (typeof value === "string") {
    try { configured = JSON.parse(value); } catch { configured = {}; }
  } else if (value && typeof value === "object") {
    configured = value as Record<string, string>;
  }
  const next: Record<string, string> = {};
  for (const action of Object.keys(shortcutDefaults) as Array<keyof typeof shortcutDefaults>) {
    const candidate = configured[action];
    next[action] = typeof candidate === "string" && candidate.trim() ? candidate.trim() : shortcutDefaults[action];
  }
  return next;
}

function normalizePhoneConfig(
  config: Record<string, unknown> | null | undefined,
  { isDev = false }: { isDev?: boolean } = {}
) {
  const defaults: Record<string, unknown> = { TraceSip: !!isDev };
  const normalized: Record<string, unknown> = Object.assign(defaults, config || {});
  if (!isDev) normalized.TraceSip = false;
  for (const key of ["Server", "Port", "ServerPath", "Domain", "Username", "Password", "PasswordType"]) {
    if (normalized[key] === "") delete normalized[key];
  }
  const hasAccount = !!(normalized.Server || normalized.Port || normalized.Username);
  if (!hasAccount) {
    delete normalized.ServerPath;
    delete normalized.Domain;
    delete normalized.PasswordType;
  }
  normalized.AppMode = "embedded";
  normalized.phoneShell = "embedded";
  // Desktop: never use OS Notification API (Electron handles call UX).
  normalized.EnableNotifications = false;
  // Show settings entry in Electron by default.
  if (normalized.EnableSettings === undefined) normalized.EnableSettings = true;
  delete normalized.EnableRingtone;
  if (!normalized.MediaConfig || typeof normalized.MediaConfig !== "object") {
    normalized.MediaConfig = {};
  }
  const mediaConfig = normalized.MediaConfig as Record<string, unknown>;
  if (!mediaConfig.ringtone) {
    mediaConfig.ringtone = new URL("./media/Ringtone.mp3", import.meta.url).href;
  }
  const lang = String(normalized.Language || "vi").toLowerCase();
  normalized.Language = lang === "en" || lang === "english" ? "en" : "vi";
  // Ship SIP.js with the app — never download at runtime.
  normalized.SipJsUrl = new URL("../vendor/sip-0.21.2.min.js", import.meta.url).href;
  return normalized;
}

function matchesAccelerator(event: KeyboardEvent, accelerator: string) {
  const parts = String(accelerator || "").toLowerCase().split("+");
  const hasAlt = parts.includes("alt");
  const hasCtrl = parts.includes("ctrl") || parts.includes("control");
  const hasShift = parts.includes("shift");
  const keyPart = parts.find((p) => p !== "alt" && p !== "ctrl" && p !== "control" && p !== "shift") || "";
  return event.altKey === hasAlt
    && (event.ctrlKey || event.metaKey) === hasCtrl
    && event.shiftKey === hasShift
    && event.key.toLowerCase() === keyPart;
}

(async function boot() {
  const panel = document.getElementById("phone-panel");
  const errorEl = document.getElementById("desktop-error");
  const titleEl = document.querySelector(".desktop-title");
  const shortcutsPopup = document.getElementById("desktop-shortcuts-popup");
  const shortcutsList = document.getElementById("desktop-shortcuts-list");
  const shortcutsToggle = document.querySelector<HTMLElement>("[data-shortcuts-toggle]");
  const desktop = window.VPhoneDesktop as DesktopBridge | undefined;
  let mounted: MountedPhone | null = null;

  function showError(message: string) {
    if (!errorEl) return;
    errorEl.hidden = false;
    errorEl.textContent = message;
    desktop?.log?.("error", message);
  }

  function log(level: string, message: string, meta?: unknown) {
    desktop?.log?.(level, message, meta ?? null);
  }

  function setCallPhase(phase: string) {
    desktop?.setCallPhase?.(phase);
  }

  function focusPhone() {
    try {
      panel?.focus();
      const dial = panel?.querySelector<HTMLInputElement>("#dialText") || panel?.querySelector<HTMLInputElement>("#txtFindBuddy");
      dial?.focus();
    } catch (error) {
      log("warn", "Unable to focus phone", { message: String((error as Error)?.message || error) });
    }
  }

  function bindWindowControls() {
    document.querySelectorAll("[data-window-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-window-action");
        if (action === "minimize") desktop?.minimizeWindow();
        if (action === "close") desktop?.closeWindow();
      });
    });
  }

  function bindShortcutPopup(shortcuts: Record<string, string>, language: unknown) {
    if (!shortcutsPopup || !shortcutsToggle || !shortcutsList) return;
    const lang = resolveLang(language);
    const labels = shortcutLabels[lang];
    const copy = shortcutPopupCopy[lang];
    const titleNode = document.getElementById("desktop-shortcuts-title");
    if (titleNode) titleNode.textContent = copy.title;
    shortcutsToggle.setAttribute("title", copy.toggleTitle);
    shortcutsToggle.setAttribute("aria-label", copy.toggleTitle);
    shortcutsPopup.querySelectorAll("[data-shortcuts-close]").forEach((el) => {
      el.setAttribute("aria-label", copy.closeAriaLabel);
    });
    shortcutsList.innerHTML = Object.keys(labels).map((action) => (
      `<div class="desktop-shortcuts-item"><span class="desktop-shortcuts-label">${escapeHtml(labels[action as keyof typeof labels])}</span><span class="desktop-shortcuts-key">${escapeHtml(shortcuts[action] || "-")}</span></div>`
    )).join("") || `<p class="desktop-shortcuts-empty">${escapeHtml(copy.emptyText)}</p>`;

    shortcutsToggle.addEventListener("click", () => {
      shortcutsPopup.hidden = !shortcutsPopup.hidden;
    });
    shortcutsPopup.querySelectorAll("[data-shortcuts-close]").forEach((el) => {
      el.addEventListener("click", () => { shortcutsPopup.hidden = true; });
    });
  }

  function runShortcut(action: string) {
    if (!mounted || !action) return false;
    const { sdk, ui } = mounted;
    try {
      if (action === "answer") sdk.answer();
      else if (action === "hangup") sdk.hangup();
      else if (action === "mute") sdk.toggleMute();
      else if (action === "hold") sdk.isOnHold() ? sdk.resume() : sdk.hold();
      else if (action === "transfer") {
        const transferBtn = panel?.querySelector<HTMLElement>(".callTransfer, #line-1-btn-Transfer");
        transferBtn?.click();
      }
      return true;
    } catch (error) {
      log("warn", "Shortcut failed", { action, message: String((error as Error)?.message || error) });
      return false;
    }
  }

  try {
    if (!desktop || !panel) {
      showError("Electron preload bridge is not available.");
      return;
    }

    bindWindowControls();
    const desktopConfig = await desktop.getConfig();
    const isDev = typeof desktop.isDevMode === "function"
      ? !!(await desktop.isDevMode())
      : false;
    const mountConfig = desktopConfig.mount || {};
    const appTitle = mountConfig.title || "VPhone";
    if (titleEl) titleEl.textContent = appTitle;
    document.title = appTitle;

    const shortcuts = normalizeShortcuts(desktopConfig.phone?.KeyboardShortcuts);
    bindShortcutPopup(shortcuts, desktopConfig.phone?.Language);

    const phoneConfig = normalizePhoneConfig(desktopConfig.phone, { isDev });
    panel.setAttribute("data-phone-shell", "embedded");
    panel.setAttribute("tabindex", "-1");

    mounted = createPhoneWidget({
      root: panel,
      config: phoneConfig
    }) as MountedPhone;

    window.__VPhoneDesktopWidget = mounted;

    mounted.sdk.bindAudioElements?.({
      remoteEl: document.querySelector("[data-role='remote-media']"),
      localEl: document.querySelector("[data-role='local-media']")
    });

    const phoneRoot = panel.querySelector("#Phone");
    phoneRoot?.classList.add("phoneEmbedded");
    phoneRoot?.classList.remove("phoneStandalone");

    const sdk = mounted.sdk;
    sdk.on("registration-changed", (event: { online?: boolean }) => {
      log("info", "Phone status changed", event);
    });
    sdk.on("incoming-call", (event: unknown) => {
      log("info", "Incoming call", event);
      setCallPhase("incoming");
      [0, 150, 350, 700].forEach((delay) => {
        window.setTimeout(() => {
          void desktop.focusWindow?.("incoming-call");
          focusPhone();
        }, delay);
      });
    });
    sdk.on("outgoing-call", () => setCallPhase("in-call"));
    sdk.on("call-connected", () => setCallPhase("in-call"));
    sdk.on("call-ended", () => setCallPhase("idle"));

    desktop.onWindowFocused?.(() => focusPhone());
    desktop.onShortcutAction?.((payload) => {
      if (payload?.action) runShortcut(payload.action);
    });

    window.addEventListener("keydown", (event) => {
      const active = document.activeElement as HTMLElement | null;
      const isEditable = !!(active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT" || active.isContentEditable));

      if (event.key === "Escape" && shortcutsPopup && !shortcutsPopup.hidden) {
        event.preventDefault();
        shortcutsPopup.hidden = true;
        return;
      }

      if (event.key === "Enter" && !isEditable) {
        const dialText = document.getElementById("dialText") as HTMLInputElement | null;
        if (dialText?.value) {
          event.preventDefault();
          mounted?.ui?.call?.({ video: false });
          return;
        }
      }

      if (event.key === "Escape") {
        const closeDtmf = document.querySelector<HTMLElement>(".callCloseDtmf");
        if (closeDtmf && closeDtmf.offsetWidth > 0) {
          event.preventDefault();
          closeDtmf.click();
          return;
        }
        event.preventDefault();
        runShortcut("hangup");
        return;
      }

      if (!isEditable) {
        const dialText = document.getElementById("dialText") as HTMLInputElement | null;
        if (dialText) {
          if (/^[\d*#+]$/.test(event.key)) {
            event.preventDefault();
            dialText.value = `${dialText.value || ""}${event.key}`;
            dialText.dispatchEvent(new Event("input", { bubbles: true }));
            dialText.focus();
            return;
          }
          if (event.key === "Backspace") {
            event.preventDefault();
            dialText.value = String(dialText.value || "").slice(0, -1);
            dialText.dispatchEvent(new Event("input", { bubbles: true }));
            dialText.focus();
            return;
          }
        }
      }

      if (matchesAccelerator(event, shortcuts.answer)) { event.preventDefault(); runShortcut("answer"); }
      else if (matchesAccelerator(event, shortcuts.hangup) && event.key.toLowerCase() !== "escape") { event.preventDefault(); runShortcut("hangup"); }
      else if (matchesAccelerator(event, shortcuts.mute)) { event.preventDefault(); runShortcut("mute"); }
      else if (matchesAccelerator(event, shortcuts.hold)) { event.preventDefault(); runShortcut("hold"); }
      else if (matchesAccelerator(event, shortcuts.transfer)) { event.preventDefault(); runShortcut("transfer"); }
    });

    window.setTimeout(() => focusPhone(), 80);

    if (typeof desktop.requestMediaAccess === "function") {
      void desktop.requestMediaAccess().catch((error: Error) => {
        log("warn", "OS media access request failed", { message: String(error?.message || error) });
      });
    }
  } catch (error) {
    showError(String((error as Error)?.message || error));
  }
})();

declare global {
  interface Window {
    VPhoneDesktop?: DesktopBridge;
    __VPhoneDesktopWidget?: unknown;
  }
}
