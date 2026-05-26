import { PhoneSDK } from "../sdk/sdk.js";
import { DomRenderer } from "./dom-renderer.js";
import { bindControls } from "./controls.js";
import { UINotifications } from "./notifications.js";

function safeJsonParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeNumber(value) {
  return normalizeText(value).replace(/[^\d*#+]/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildCallerDisplay(number, contactName, callerIdName) {
  const normalizedNumber = normalizeText(number);
  const normalizedContact = normalizeText(contactName);
  let normalizedCallerId = normalizeText(callerIdName);
  const invalidNames = ["anonymous", "unknown", "private", "restricted", "unavailable", "null", "none", "wireless caller"];
  if (invalidNames.includes(normalizedCallerId.toLowerCase())) normalizedCallerId = "";

  let primary = normalizedContact || normalizedCallerId || normalizedNumber || "Unknown";
  let secondary = "";
  if (normalizedNumber && primary !== normalizedNumber) secondary = normalizedNumber;
  return { primary, secondary, number: normalizedNumber, name: primary };
}

export class PhoneUI {
  constructor({ root, sdk, config = {}, deps = {} } = {}) {
    if (!root) throw new Error("PhoneUI requires root");
    this.root = root;
    this.config = config || {};
    this.sdk = sdk || new PhoneSDK(config, deps);
    this.renderer = new DomRenderer(root);
    this.notifications = new UINotifications();
    this.localDB = typeof window !== "undefined" ? window.localStorage : null;
    this.profileUserID = this.#getDbItem("profileUserID", this.config.profileUserID || this.config.SipUsername || this.config.SIPUSER || "default");
    this.profileName = this.#getDbItem("profileName", this.config.profileName || this.profileUserID || "");
    this.dialpadToggles = { auto: false, cw: false, dnd: false, rec: false };
    this.activeTab = "dialpad";
    this.tabSearch = { contacts: "", recents: "", dialpad: "" };
    this.callConnected = false;
    this.recentExpandedById = {};
    this.contacts = this.#loadContactsFromStorage();
    this.recents = this.#loadRecentsFromStorage();
  }

  mount() {
    bindControls(this.root, {
      onCall: () => this.call(),
      onCallAudio: () => this.call({ video: false }),
      onCallVideo: () => this.call({ video: true }),
      onAnswer: () => this.sdk.answer(),
      onHangup: () => this.sdk.hangup(),
      onMute: () => this.sdk.toggleMute(),
      onHold: () => this.toggleHold(),
      onReconnect: () => this.#reconnectLastCall(),
      onTransfer: () => this.#transferCall(),
      onConference: () => this.#startConference(),
      onSearch: () => {
        this.renderer.showSearch(true);
        this.renderer.setStatus("Search");
      },
      onFilter: () => this.renderer.setStatus("Filter"),
      onSettings: () => this.#openSettings(),
      onAddContact: () => this.renderer.setStatus("Add contact"),
      onClearTab: ({ tab } = {}) => this.#handleClearTab(tab),
      onMore: () => this.renderer.setStatus("More"),
      onRegisterToggle: () => this.#toggleRegistration(),
      onDialDelete: () => this.#deleteDialDigit(),
      onDialpadToggle: ({ key } = {}) => this.#toggleDialpadSetting(key)
    });

    this.#bindTabButtons();
    this.#bindDialpadInputState();
    this.#bindDialpadDigits();
    this.#bindSearchInputState();
    this.#bindRecentExpandedActions();
    this.#hideLoadingOverlay();

    this.sdk.on("incoming-call", (call) => {
      this.renderer.setStatus("Incoming call");
      this.notifications.notifyIncomingCall(call?.from);
    });
    this.sdk.on("outgoing-call", ({ target }) => this.renderer.setStatus(`Calling ${target}`));
    this.sdk.on("call-connected", () => {
      this.callConnected = true;
      this.renderer.setStatus("Connected");
    });
    this.sdk.on("call-ended", () => {
      this.callConnected = false;
      this.renderer.setStatus("Ended");
    });
    this.sdk.on("mute-changed", ({ muted }) => this.renderer.setStatus(muted ? "Muted" : "Unmuted"));
    this.sdk.on("hold-changed", ({ onHold }) => this.renderer.setStatus(onHold ? "On hold" : "Resumed"));
    this.sdk.on("local-stream", (stream) => this.renderer.attachMedia("local", stream));
    this.sdk.on("remote-stream", (stream) => this.renderer.attachMedia("remote", stream));
    this.sdk.on("registration-changed", ({ online, user, error } = {}) => {
      this.renderer.setRegistrationState({ online, user, error });
      if (online) this.renderer.setStatus(`Online (${user || ""})`);
      else this.renderer.setStatus(error ? `Register failed: ${error}` : "Offline");
    });

    const regState = this.sdk.getRegistrationState?.();
    if (regState) this.renderer.setRegistrationState(regState);
  }

  async call(options = {}) {
    const target = this.renderer.getTargetNumber();
    if (!target) {
      this.renderer.setStatus("Missing target number");
      return;
    }
    try {
      await this.sdk.call(target, options);
    } catch (err) {
      this.renderer.setStatus(`Call failed: ${String(err?.message || err)}`);
    }
  }

  async #openSettings() {
    if (typeof this.sdk.listDevices !== "function") {
      this.renderer.setStatus("Device settings not supported");
      return;
    }
    let devices = [];
    try {
      devices = await this.sdk.listDevices();
    } catch (err) {
      this.renderer.setStatus(`Load devices failed: ${String(err?.message || err)}`);
      return;
    }

    const mic = devices.filter((d) => d.kind === "audioinput");
    const cam = devices.filter((d) => d.kind === "videoinput");
    const spk = devices.filter((d) => d.kind === "audiooutput");
    const lines = [
      "Select device to switch:",
      ...mic.map((d, idx) => `m${idx + 1}. Mic: ${d.label || d.deviceId}`),
      ...cam.map((d, idx) => `c${idx + 1}. Cam: ${d.label || d.deviceId}`),
      ...spk.map((d, idx) => `s${idx + 1}. Speaker: ${d.label || d.deviceId}`)
    ];
    const input = typeof window !== "undefined" && typeof window.prompt === "function"
      ? window.prompt(lines.join("\n"), "")
      : "";
    if (!input) return;
    const choice = String(input).trim().toLowerCase();
    const prefix = choice.charAt(0);
    const number = Number(choice.slice(1));
    if (!Number.isFinite(number) || number <= 0) {
      this.renderer.setStatus("Invalid device choice");
      return;
    }

    let kind = "";
    let selected = null;
    if (prefix === "m") {
      selected = mic[number - 1];
      kind = "audioinput";
    }
    if (prefix === "c") {
      selected = cam[number - 1];
      kind = "videoinput";
    }
    if (prefix === "s") {
      selected = spk[number - 1];
      kind = "audiooutput";
    }
    if (!selected || !kind) {
      this.renderer.setStatus("Device not found");
      return;
    }

    try {
      await this.sdk.switchDevice(kind, selected.deviceId);
      this.renderer.setStatus(`Switched ${kind}`);
    } catch (err) {
      this.renderer.setStatus(`Switch device failed: ${String(err?.message || err)}`);
    }
  }

  async toggleHold() {
    if (this.sdk.core.isOnHold) return this.sdk.resume();
    return this.sdk.hold();
  }

  async #reconnectLastCall() {
    if (typeof this.sdk.reconnect !== "function") {
      this.renderer.setStatus("Reconnect not supported");
      return;
    }
    try {
      await this.sdk.reconnect();
      this.renderer.setStatus("Reconnect started");
    } catch (err) {
      this.renderer.setStatus(`Reconnect failed: ${String(err?.message || err)}`);
    }
  }

  async #transferCall() {
    if (typeof this.sdk.transfer !== "function") {
      this.renderer.setStatus("Transfer not supported");
      return;
    }
    const target = typeof window !== "undefined" && typeof window.prompt === "function"
      ? window.prompt("Transfer to number:", "")
      : "";
    if (!target) return;
    try {
      await this.sdk.transfer(target);
      this.renderer.setStatus(`Transfer requested to ${target}`);
    } catch (err) {
      this.renderer.setStatus(`Transfer failed: ${String(err?.message || err)}`);
    }
  }

  async #startConference() {
    if (typeof this.sdk.conference !== "function") {
      this.renderer.setStatus("Conference not supported");
      return;
    }
    const target = typeof window !== "undefined" && typeof window.prompt === "function"
      ? window.prompt("Conference with number:", "")
      : "";
    if (!target) return;
    try {
      await this.sdk.conference(target);
      this.renderer.setStatus(`Conference requested with ${target}`);
    } catch (err) {
      this.renderer.setStatus(`Conference failed: ${String(err?.message || err)}`);
    }
  }

  #deleteDialDigit() {
    const dialText = this.root.querySelector("#dialText");
    if (!dialText) return;
    const value = String(dialText.value || "");
    dialText.value = value.slice(0, Math.max(0, value.length - 1));
    this.#syncDialDeleteKeyState();
  }

  #bindTabButtons() {
    const dialpad = this.root.querySelector("#tab-dialpad");
    const recents = this.root.querySelector("#tab-recents");
    const contacts = this.root.querySelector("#tab-contacts");
    if (dialpad) dialpad.addEventListener("click", () => this.#switchTab("dialpad"));
    if (recents) recents.addEventListener("click", () => this.#switchTab("recents"));
    if (contacts) contacts.addEventListener("click", () => this.#switchTab("contacts"));
    this.#restoreActiveTab();
  }

  #switchTab(tabName) {
    const safeTab = tabName === "recents" || tabName === "contacts" ? tabName : "dialpad";
    this.activeTab = safeTab;
    this.renderer.showTab(safeTab);
    this.#renderTabContent(safeTab);
    try {
      localStorage.setItem("ActiveTab", safeTab);
    } catch {}
  }

  #restoreActiveTab() {
    let tab = "dialpad";
    try {
      const saved = localStorage.getItem("ActiveTab");
      if (saved === "recents" || saved === "contacts" || saved === "dialpad") tab = saved;
    } catch {}
    this.#switchTab(tab);
  }

  #toggleDialpadSetting(key) {
    if (!key || !(key in this.dialpadToggles)) return;
    this.dialpadToggles[key] = !this.dialpadToggles[key];
    const btn = this.root.querySelector(`#dialpad-toggle-${key}`);
    if (btn) {
      btn.classList.toggle("toggleOn", this.dialpadToggles[key]);
      btn.classList.toggle("toggleOff", !this.dialpadToggles[key]);
    }
    this.renderer.setStatus(`${key.toUpperCase()} ${this.dialpadToggles[key] ? "On" : "Off"}`);
  }

  #bindDialpadInputState() {
    const dialText = this.root.querySelector("#dialText");
    if (!dialText) return;
    if (dialText.dataset.vphoneInputBound === "1") {
      this.#syncDialDeleteKeyState();
      return;
    }
    dialText.dataset.vphoneInputBound = "1";
    dialText.addEventListener("input", () => {
      dialText.value = String(dialText.value || "").replace(/[^\d*#+]/g, "");
      this.#syncDialDeleteKeyState();
    });
    dialText.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      void this.call({ video: !!event.ctrlKey });
    });
    this.#syncDialDeleteKeyState();
  }

  #bindDialpadDigits() {
    const buttons = this.root.querySelectorAll("[data-dial-digit]");
    if (!buttons || buttons.length === 0) return;
    for (const btn of buttons) {
      if (btn.dataset.vphoneDigitBound === "1") continue;
      btn.dataset.vphoneDigitBound = "1";
      btn.addEventListener("click", () => {
        const digit = btn.getAttribute("data-dial-digit") || "";
        if (!digit) return;
        const dialText = this.root.querySelector("#dialText");
        if (!dialText) return;
        dialText.value = `${dialText.value || ""}${digit}`;
        if (this.callConnected && typeof this.sdk.sendDTMF === "function") {
          this.sdk.sendDTMF(digit).catch(() => {});
        }
        this.#syncDialDeleteKeyState();
      });
    }
  }

  #syncDialDeleteKeyState() {
    const dialText = this.root.querySelector("#dialText");
    const deleteKey = this.root.querySelector("#dialDeleteKey");
    if (!dialText || !deleteKey) return;
    const hasDigits = String(dialText.value || "").length > 0;
    deleteKey.classList.toggle("hasDigits", hasDigits);
  }

  #hideLoadingOverlay() {
    const loading = this.root.querySelector(".loading");
    if (!loading) return;
    loading.style.display = "none";
  }

  #bindSearchInputState() {
    const search = this.root.querySelector("#txtFindBuddy");
    if (!search) return;
    search.addEventListener("input", () => {
      this.tabSearch[this.activeTab] = String(search.value || "");
      if (this.activeTab === "contacts" || this.activeTab === "recents") {
        this.#renderTabContent(this.activeTab);
      }
    });
  }

  #renderTabContent(tabName) {
    if (tabName === "dialpad") {
      this.#renderDialpad();
      return;
    }
    if (tabName === "contacts") {
      const search = this.root.querySelector("#txtFindBuddy");
      if (search) search.value = this.tabSearch.contacts || "";
      this.#renderContacts();
      return;
    }
    if (tabName === "recents") {
      const search = this.root.querySelector("#txtFindBuddy");
      if (search) search.value = this.tabSearch.recents || "";
      this.#renderRecents();
      return;
    }
  }

  #renderDialpad() {
    const host = this.root.querySelector("#actionArea");
    if (!host) return;
    host.innerHTML = `
      <div class="dialScreenMobile">
        <div class="dialInputRow">
          <input id="dialText" class="dialTextInput" type="text" value="" data-role="number-input" style="width: 170px; height: 32px; font-size: 17px;">
          <button type="button" id="dialDeleteKey" class="roundButtons">⌫</button>
        </div>
        <table class="dialPadGrid" cellspacing="8" cellpadding="0">
          <tr>
            <td><button type="button" class="dialButtons" data-dial-digit="1"><div>1</div><span>&nbsp;</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="2"><div>2</div><span>ABC</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="3"><div>3</div><span>DEF</span></button></td>
          </tr>
          <tr>
            <td><button type="button" class="dialButtons" data-dial-digit="4"><div>4</div><span>GHI</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="5"><div>5</div><span>JKL</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="6"><div>6</div><span>MNO</span></button></td>
          </tr>
          <tr>
            <td><button type="button" class="dialButtons" data-dial-digit="7"><div>7</div><span>PQRS</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="8"><div>8</div><span>TUV</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="9"><div>9</div><span>WXYZ</span></button></td>
          </tr>
          <tr>
            <td><button type="button" class="dialButtons" data-dial-digit="*">*</button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="0">0</button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="#">#</button></td>
          </tr>
        </table>
        <div class="dialActionsRow">
          <button type="button" id="dialAudio" class="dialButtons dialButtonsDial" title="Audio Call"><i class="fa fa-phone"></i></button>
          <button type="button" id="dialVideo" class="dialButtons dialButtonsDial" title="Video Call"><i class="fa fa-video-camera"></i></button>
        </div>
        <div class="dialActionsRow" style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
          <button type="button" class="roundButtons" data-action="mute" title="Mute"><i class="fa fa-microphone-slash"></i></button>
          <button type="button" class="roundButtons" data-action="hold" title="Hold"><i class="fa fa-pause"></i></button>
          <button type="button" class="roundButtons" data-action="hangup" title="Hangup"><i class="fa fa-phone" style="color:#c0392b"></i></button>
          <button type="button" class="roundButtons" data-action="reconnect" title="Reconnect"><i class="fa fa-refresh"></i></button>
        </div>
        <div class="dialActionsRow" style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
          <button type="button" class="roundButtons" data-action="transfer" title="Transfer"><i class="fa fa-random"></i></button>
          <button type="button" class="roundButtons" data-action="conference" title="Conference"><i class="fa fa-users"></i></button>
        </div>
          <div id="dialpad-setting-toggles" class="dialpadSettingToggles">
            <button id="dialpad-toggle-auto" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.auto ? "toggleOn" : "toggleOff"}"><i class="fa fa-phone"></i></button>
            <button id="dialpad-toggle-dnd" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.dnd ? "toggleOn" : "toggleOff"}"><i class="fa fa-ban"></i></button>
            <button id="dialpad-toggle-cw" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.cw ? "toggleOn" : "toggleOff"}"><i class="fa fa-volume-control-phone"></i></button>
            <button id="dialpad-toggle-rec" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.rec ? "toggleOn" : "toggleOff"}"><i class="fa fa-dot-circle-o"></i></button>
          </div>
      </div>
    `;
    this.#bindDialpadInputState();
    this.#bindDialpadDigits();
  }

  #renderContacts() {
    const host = this.root.querySelector("#myContacts");
    if (!host) return;
    this.contacts = this.#loadContactsFromStorage();
    const filter = String(this.tabSearch.contacts || "").trim().toLowerCase();
    const rows = this.contacts.filter((c) => !filter || c.name.toLowerCase().includes(filter) || c.number.includes(filter));
    if (rows.length === 0) {
      host.innerHTML = "<div class=\"contact\" style=\"padding:8px 12px;\"><div class=\"contactNameText\">No contacts</div></div>";
      return;
    }
    host.innerHTML = rows
      .map((c) => `<div class="contact" style="padding:8px 12px;" data-contact-id="${escapeHtml(c.id)}">
        <div class="contactNameText">${escapeHtml(c.name)}</div>
        <div class="presenceText">${escapeHtml(c.number)}</div>
      </div>`)
      .join("");
  }

  #renderRecents() {
    const host = this.root.querySelector("#actionArea");
    if (!host) return;
    this.recents = this.#loadRecentsFromStorage();
    const filter = String(this.tabSearch.recents || "").trim().toLowerCase();
    const rows = this.recents.filter((r) => !filter || r.name.toLowerCase().includes(filter) || r.number.includes(filter));
    if (rows.length === 0) {
      host.innerHTML = "<div class=\"contact\" style=\"padding:8px 12px;\"><div class=\"contactNameText\">No recent calls</div></div>";
      return;
    }
    host.innerHTML = rows
      .map((r) => `<div class="recentCallItem enterpriseRecentItem" data-recent-id="${escapeHtml(r.id)}">
        <div class="recentCallSummary">
          <div class="recentCallInfo contactCompactMain">
            <div class="recentCallName contactCompactName">${escapeHtml(r.name)}</div>
            <div class="recentCallSubMeta"><span>${escapeHtml(r.time)}</span><span class="recentStatusPill">${escapeHtml(r.number)}</span></div>
          </div>
          <div class="recentExpandChevron"><i class="fa fa-chevron-${r.expanded ? "up" : "down"}"></i></div>
        </div>
        <div class="recentCallExpanded" style="display:${r.expanded ? "block" : "none"}">
          <div class="recentExpandedActions">
            <button type="button" class="roundButtons recentActionCall" title="Call"><i class="fa fa-phone"></i></button>
            <button type="button" class="roundButtons recentActionAdd" title="Add Contact"><i class="fa fa-user-plus"></i></button>
            <button type="button" class="roundButtons recentActionDelete" title="Delete"><i class="fa fa-trash"></i></button>
          </div>
        </div>
      </div>`)
      .join("");
  }

  #bindRecentExpandedActions() {
    const host = this.root.querySelector("#actionArea");
    if (!host) return;
    host.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const row = target.closest(".enterpriseRecentItem");
      if (!row) return;
      const id = row.getAttribute("data-recent-id") || "";
      const item = this.recents.find((r) => r.id === id);
      if (!item) return;

      if (target.closest(".recentActionDelete")) {
        this.#deleteRecentById(id);
        delete this.recentExpandedById[id];
        this.#renderRecents();
        this.renderer.setStatus("Recent deleted");
        return;
      }
      if (target.closest(".recentActionAdd")) {
        this.#addContact(item.name, item.number);
        this.contacts = this.#loadContactsFromStorage();
        this.renderer.setStatus("Contact added");
        return;
      }
      if (target.closest(".recentActionCall")) {
        const dial = this.root.querySelector("#dialText");
        if (dial) dial.value = item.number;
        void this.call({ video: false });
        return;
      }
      item.expanded = !item.expanded;
      this.recentExpandedById[id] = item.expanded;
      this.#renderRecents();
    });
  }

  #handleClearTab(tabName) {
    const tab = tabName || this.activeTab;
    if (tab !== "recents" && tab !== "contacts") {
      this.renderer.setStatus("Clear tab");
      return;
    }
    const ok = typeof window !== "undefined" && typeof window.confirm === "function"
      ? window.confirm(tab === "recents" ? "Delete all recent call history?" : "Delete all contacts?")
      : true;
    if (!ok) return;

    if (tab === "recents") {
      this.#clearAllRecents();
      this.recents = [];
      this.#renderRecents();
      this.renderer.setStatus("Recents cleared");
      return;
    }
    this.#clearAllContacts();
    this.contacts = [];
    this.#renderContacts();
    this.renderer.setStatus("Contacts cleared");
  }

  #getDbItem(itemIndex, defaultValue) {
    if (!this.localDB) return defaultValue;
    const value = this.localDB.getItem(itemIndex);
    return value === null ? defaultValue : value;
  }

  #buddyStorageKey() {
    return `${this.profileUserID}-Buddies`;
  }

  #loadBuddyCollection() {
    const json = safeJsonParse(this.#getDbItem(this.#buddyStorageKey(), ""), null);
    if (json && Array.isArray(json.DataCollection)) return json;
    return { TotalRows: 0, DataCollection: [] };
  }

  #saveBuddyCollection(collection) {
    if (!this.localDB) return;
    const next = collection && Array.isArray(collection.DataCollection)
      ? { ...collection, TotalRows: collection.DataCollection.length }
      : { TotalRows: 0, DataCollection: [] };
    this.localDB.setItem(this.#buddyStorageKey(), JSON.stringify(next));
  }

  #loadContactsFromStorage() {
    const json = this.#loadBuddyCollection();
    const rows = [];
    for (const item of json.DataCollection) {
      if (!item || item.Type !== "contact") continue;
      const id = normalizeText(item.cID || item.uID || item.gID || `c${Date.now()}`);
      const number = normalizeText(item.ContactNumber1 || item.MobileNumber || item.ContactNumber2 || item.ExtensionNumber || "");
      const name = normalizeText(item.DisplayName || number || "Unknown");
      rows.push({ id, name, number });
    }
    return rows;
  }

  #buildContactLookup() {
    const lookup = new Map();
    for (const c of this.contacts) {
      const key = normalizeNumber(c.number);
      if (!key) continue;
      lookup.set(key, c.name);
    }
    return lookup;
  }

  #loadRecentsFromStorage() {
    if (!this.localDB) return [];
    this.contacts = this.#loadContactsFromStorage();
    const contactLookup = this.#buildContactLookup();
    const rows = [];

    for (let i = 0; i < this.localDB.length; i += 1) {
      const storageKey = this.localDB.key(i);
      if (!storageKey || !storageKey.endsWith("-stream")) continue;
      const identity = storageKey.slice(0, -7);
      const stream = safeJsonParse(this.localDB.getItem(storageKey), null);
      if (!stream || !Array.isArray(stream.DataCollection)) continue;

      for (const item of stream.DataCollection) {
        if (!item || item.ItemType !== "CDR") continue;
        const isOutbound = item.SrcUserId === this.profileUserID || item.CallDirection === "outbound";
        const number = normalizeText(isOutbound ? (item.DstDid || item.Dst || "") : (item.SrcDid || item.Src || ""));
        const callerIdName = normalizeText(isOutbound ? (item.Dst || "") : (item.Src || ""));
        const contactName = contactLookup.get(normalizeNumber(number)) || "";
        const display = buildCallerDisplay(number, contactName, callerIdName);
        const cdrId = normalizeText(item.CdrId || "");
        if (!cdrId) continue;
        const id = `${identity}:${cdrId}`;

        rows.push({
          id,
          identity,
          cdrId,
          name: display.primary,
          number: display.secondary || display.number || "",
          time: this.#formatRecentTime(item.ItemDate),
          timeStamp: this.#toEpoch(item.ItemDate),
          expanded: !!this.recentExpandedById[id]
        });
      }
    }

    rows.sort((a, b) => (a.timeStamp || 0) > (b.timeStamp || 0) ? -1 : 1);
    return rows;
  }

  #formatRecentTime(itemDate) {
    const text = normalizeText(itemDate).replace(" UTC", "");
    if (!text) return "";
    const parsed = new Date(`${text.replace(" ", "T")}Z`);
    if (Number.isNaN(parsed.getTime())) return text;
    const now = new Date();
    const isSameDay =
      now.getFullYear() === parsed.getFullYear() &&
      now.getMonth() === parsed.getMonth() &&
      now.getDate() === parsed.getDate();
    return isSameDay ? parsed.toLocaleTimeString() : parsed.toLocaleDateString();
  }

  #toEpoch(itemDate) {
    const text = normalizeText(itemDate).replace(" UTC", "");
    if (!text) return 0;
    const parsed = new Date(`${text.replace(" ", "T")}Z`);
    if (Number.isNaN(parsed.getTime())) return 0;
    return parsed.getTime();
  }

  #deleteRecentById(recentId) {
    if (!this.localDB || !recentId) return;
    const item = this.recents.find((r) => r.id === recentId);
    if (!item || !item.identity || !item.cdrId) return;
    const storageKey = `${item.identity}-stream`;
    const stream = safeJsonParse(this.localDB.getItem(storageKey), null);
    if (!stream || !Array.isArray(stream.DataCollection)) return;
    const before = stream.DataCollection.length;
    stream.DataCollection = stream.DataCollection.filter((entry) => {
      if (!entry || entry.ItemType !== "CDR") return true;
      return normalizeText(entry.CdrId) !== item.cdrId;
    });
    if (stream.DataCollection.length !== before) {
      stream.TotalRows = stream.DataCollection.length;
      this.localDB.setItem(storageKey, JSON.stringify(stream));
    }
  }

  #clearAllRecents() {
    if (!this.localDB) return;
    for (let i = 0; i < this.localDB.length; i += 1) {
      const storageKey = this.localDB.key(i);
      if (!storageKey || !storageKey.endsWith("-stream")) continue;
      const stream = safeJsonParse(this.localDB.getItem(storageKey), null);
      if (!stream || !Array.isArray(stream.DataCollection)) continue;
      const before = stream.DataCollection.length;
      stream.DataCollection = stream.DataCollection.filter((item) => !item || item.ItemType !== "CDR");
      if (stream.DataCollection.length !== before) {
        stream.TotalRows = stream.DataCollection.length;
        this.localDB.setItem(storageKey, JSON.stringify(stream));
      }
    }
    this.recentExpandedById = {};
  }

  #addContact(name, number) {
    const parsedNumber = normalizeText(number);
    if (!parsedNumber) return;
    const collection = this.#loadBuddyCollection();
    const contactId = `c${Date.now()}`;
    collection.DataCollection.push({
      Type: "contact",
      LastActivity: new Date().toISOString().replace("T", " ").replace(".000Z", " UTC"),
      ExtensionNumber: "",
      MobileNumber: "",
      ContactNumber1: parsedNumber,
      ContactNumber2: "",
      uID: null,
      cID: contactId,
      gID: null,
      jid: null,
      DisplayName: normalizeText(name) || parsedNumber,
      Description: "",
      Email: "",
      MemberCount: 0,
      EnableDuringDnd: false,
      Subscribe: false,
      SubscribeUser: null,
      AutoDelete: false
    });
    this.#saveBuddyCollection(collection);
  }

  #clearAllContacts() {
    const collection = this.#loadBuddyCollection();
    collection.DataCollection = collection.DataCollection.filter((item) => !item || item.Type !== "contact");
    this.#saveBuddyCollection(collection);
  }

  async #toggleRegistration() {
    if (typeof this.sdk.toggleRegistration !== "function") {
      this.renderer.setStatus("Register toggle not supported");
      return;
    }
    try {
      const state = await this.sdk.toggleRegistration();
      this.renderer.setRegistrationState(state || {});
      this.renderer.setStatus(state?.online ? "Online" : "Offline");
    } catch (err) {
      this.renderer.setStatus(`Register toggle failed: ${String(err?.message || err)}`);
    }
  }
}
