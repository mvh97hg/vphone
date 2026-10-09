import { PhoneSDK, persistSipPassword } from "../sdk/phone-sdk.js";
import { prepareSipPasswordForStorage } from "../sdk/sip-auth.js";
import {
  normalizePhoneConfig,
  readStorageValue,
  writeStorageValue
} from "../sdk/phone-config.js";

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

/** Material-style call direction icons (from call_made / call_received / call_missed.svg). */
function recentDirectionSvg(statusClass) {
  const kind = statusClass === "callOut" ? "out" : statusClass === "callMissed" ? "missed" : "in";
  const paths = {
    out: "M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z",
    in: "M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41z",
    missed: "M19.59 7L12 14.59 6.41 9H11V7H3v8h2v-4.59l7 7 9-9z"
  };
  return `<svg class="recentCallSvg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="${paths[kind]}"/></svg>`;
}

const FALLBACK_TEXT = {
  en: {
    refreshRegistration: "Refresh Registration",
    configureExtension: "Configure Extension",
    settings: "Settings",
    language: "Language",
    audioVideo: "Audio / Video",
    speaker: "Speaker:",
    ringDevice: "Ring Device:",
    microphone: "Microphone:",
    micPermissionDenied: "Microphone permission required. Allow access and try again.",
    mediaPermissionFailed: "Could not access microphone/camera.",
    camera: "Camera:",
    save: "Save",
    cancel: "Cancel",
    clearExtensionConfig: "Reset",
    resetSettings: "Reset",
    confirm: "Confirm",
    delete: "Delete",
    audioCall: "Audio Call",
    videoCall: "Video Call",
    autoAnswer: "Auto Answer",
    doNotDisturb: "Do Not Disturb",
    callWaiting: "Call Waiting",
    recordAllCalls: "Record All Calls",
    extensionConfigSaved: "Extension config saved",
    settingsSaved: "Settings saved",
    extensionConfigCleared: "Extension config cleared",
    settingsReset: "Settings reset",
    confirmClearExtension: "Clear saved extension configuration?",
    confirmResetSettings: "Reset saved settings?",
    confirmDeleteRecent: "Delete this recent call?",
    confirmDeleteRecentGroup: "Delete these call logs?",
    confirmClearRecents: "Delete all recent call history?",
    confirmClearContacts: "Delete all contacts?",
    recentsCleared: "Recents cleared",
    contactsCleared: "Contacts cleared",
    recentDeleted: "Recent deleted",
    noContacts: "No contacts yet",
    noRecentCalls: "No call history yet",
    addContactCta: "Add new contact",
    addContactAction: "Add",
    deleteCallLog: "Delete this log",
    extensionShort: "Ext",
    copyNumber: "Copy",
    numberCopied: "Number copied",
    edit: "Edit",
    confirmDeleteContact: "Delete this contact?",
    contactMenu: "Contact menu",
    saveContact: "Save",
    searchPlaceholder: "Search",
    onlineShort: "Online",
    offlineShort: "Offline",
    registerFailedShort: "Register failed",
    answered: "Answered",
    missed: "Missed",
    outgoing: "Outgoing",
    incoming: "Incoming",
    call_busy: "Busy",
    call_cancelled: "Call Cancelled",
    call_rejected: "Call Rejected",
    call_noanswer: "No Answer",
    you_missed_a_call: "You missed a call",
    secondsShort: "s",
    registerFailed: "Register failed",
    registering: "Registering",
    online: "Online",
    offline: "Offline",
    registerFailed: "Register failed",
    connected: "Connected",
    ended: "Ended",
    muted: "Muted",
    unmuted: "Unmuted",
    onHold: "On hold",
    resumed: "Resumed",
    fullName: "Full name",
    contactNumber1: "Phone number",
    allowCallsOnDnd: "Allow calls when Do Not Disturb is on",
    asteriskServer: "Server",
    websocketPort: "Port",
    websocketPath: "Path",
    sipDomain: "Domain",
    sipUsername: "Username",
    sipPassword: "Password",
    autoGainControl: "Auto Gain Control",
    echoCancellation: "Echo Cancellation",
    noiseSuppression: "Noise Suppression",
    optional: "optional",
    add: "Add",
    dialpad: "Dialpad",
    recents: "Recents",
    contacts: "Contacts",
    more: "More",
    registration: "Registration",
    answerCall: "Answer",
    rejectCall: "Reject",
    mute: "Mute",
    unmute: "Unmute",
    transferCall: "Transfer Call",
    cancelTransfer: "Cancel Transfer",
    conferenceCall: "Conference Call",
    cancelConference: "Cancel Conference",
    holdCall: "Hold Call",
    resumeCall: "Resume Call",
    endCall: "End Call",
    connecting: "Connecting...",
    speakerphone: "Speaker",
    callAction: "Call",
    cancelAction: "Cancel",
    keypad: "Keypad",
    transferShort: "Transfer",
    holdShort: "Hold",
    conferenceShort: "Conference",
    today: "Today",
    yesterday: "Yesterday",
    addContactTitle: "Add contact",
    namePlaceholder: "e.g. John Smith",
    numberPlaceholder: "e.g. 0901234567",
    blindTransfer: "Direct transfer",
    attendedTransfer: "Ask first",
    completeTransfer: "Complete Transfer",
    call: "Call",
    cancelCall: "Cancel Call",
    joinConferenceCall: "Join Conference Call",
    deviceSettings: "Device Settings",
    sendDtmf: "Send DTMF",
    close: "Close",
    transferSearchPlaceholder: "Enter number or name...",
    dtmfPlaceholder: "Enter digits..."
  },
  vi: {
    refreshRegistration: "Làm mới đăng ký",
    configureExtension: "Cấu hình máy nhánh",
    settings: "Cài đặt",
    language: "Ngôn ngữ",
    audioVideo: "Âm thanh / Video",
    speaker: "Loa:",
    ringDevice: "Thiết bị chuông:",
    microphone: "Micro:",
    micPermissionDenied: "Cần quyền micro. Hãy cho phép rồi thử lại.",
    mediaPermissionFailed: "Không truy cập được micro/camera.",
    camera: "Camera:",
    save: "Lưu",
    cancel: "Hủy",
    clearExtensionConfig: "Reset",
    resetSettings: "Reset",
    confirm: "Xác nhận",
    delete: "Xóa",
    audioCall: "Gọi âm thanh",
    videoCall: "Gọi video",
    autoAnswer: "Tự động trả lời",
    doNotDisturb: "Không làm phiền",
    callWaiting: "Cuộc gọi chờ",
    recordAllCalls: "Ghi âm tất cả cuộc gọi",
    extensionConfigSaved: "Đã lưu cấu hình máy nhánh",
    settingsSaved: "Đã lưu cài đặt",
    extensionConfigCleared: "Đã xóa cấu hình máy nhánh",
    settingsReset: "Đã đặt lại cài đặt",
    confirmClearExtension: "Xóa cấu hình máy nhánh đã lưu?",
    confirmResetSettings: "Đặt lại cài đặt đã lưu?",
    confirmDeleteRecent: "Xóa cuộc gọi gần đây này?",
    confirmDeleteRecentGroup: "Xóa các cuộc gọi này?",
    confirmClearRecents: "Xóa toàn bộ lịch sử cuộc gọi gần đây?",
    confirmClearContacts: "Xóa toàn bộ danh bạ?",
    recentsCleared: "Đã xóa cuộc gọi gần đây",
    contactsCleared: "Đã xóa danh bạ",
    recentDeleted: "Đã xóa cuộc gọi gần đây",
    noContacts: "Chưa có liên hệ",
    noRecentCalls: "Chưa có lịch sử cuộc gọi",
    addContactCta: "Thêm liên hệ mới",
    addContactAction: "Thêm",
    deleteCallLog: "Xóa log này",
    extensionShort: "Máy nhánh",
    copyNumber: "Sao chép",
    numberCopied: "Đã sao chép số",
    edit: "Sửa",
    confirmDeleteContact: "Xóa liên hệ này?",
    contactMenu: "Menu danh bạ",
    saveContact: "Lưu",
    searchPlaceholder: "Tìm kiếm",
    onlineShort: "Trực tuyến",
    offlineShort: "Ngoại tuyến",
    registerFailedShort: "Đăng ký lỗi",
    answered: "Đã trả lời",
    missed: "Nhỡ",
    outgoing: "Gọi đi",
    incoming: "Gọi đến",
    call_busy: "Bận",
    call_cancelled: "Cuộc gọi đã hủy",
    call_rejected: "Cuộc gọi bị từ chối",
    call_noanswer: "Không trả lời",
    you_missed_a_call: "Cuộc gọi nhỡ",
    secondsShort: "giây",
    registerFailed: "Đăng ký thất bại",
    registering: "Đang đăng ký",
    online: "Trực tuyến",
    offline: "Ngoại tuyến",
    registerFailed: "Đăng ký thất bại",
    connected: "Đã kết nối",
    ended: "Đã kết thúc",
    muted: "Đã tắt tiếng",
    unmuted: "Đã bật tiếng",
    onHold: "Đang giữ",
    resumed: "Đã tiếp tục",
    fullName: "Họ và tên",
    contactNumber1: "Số điện thoại",
    allowCallsOnDnd: "Cho phép gọi khi bật Không làm phiền",
    asteriskServer: "Máy chủ",
    websocketPort: "Cổng",
    websocketPath: "Đường dẫn",
    sipDomain: "Tên miền",
    sipUsername: "Tên người dùng",
    sipPassword: "Mật khẩu",
    autoGainControl: "Tự động tăng âm",
    echoCancellation: "Khử tiếng vang",
    noiseSuppression: "Giảm nhiễu",
    optional: "không bắt buộc",
    add: "Thêm",
    dialpad: "Bàn phím",
    recents: "Gần đây",
    contacts: "Danh bạ",
    more: "Thêm",
    registration: "Đăng ký",
    answerCall: "Trả lời",
    rejectCall: "Từ chối",
    mute: "Tắt tiếng",
    unmute: "Bật tiếng",
    transferCall: "Chuyển cuộc gọi",
    cancelTransfer: "Hủy chuyển",
    conferenceCall: "Hội nghị",
    cancelConference: "Hủy hội nghị",
    holdCall: "Giữ cuộc gọi",
    resumeCall: "Tiếp tục",
    endCall: "Kết thúc",
    connecting: "Đang kết nối...",
    speakerphone: "Loa ngoài",
    callAction: "Gọi",
    cancelAction: "Hủy",
    keypad: "Bàn phím",
    transferShort: "Chuyển tiếp",
    holdShort: "Giữ cuộc gọi",
    conferenceShort: "Hội nghị",
    today: "Hôm nay",
    yesterday: "Hôm qua",
    addContactTitle: "Thêm danh bạ",
    namePlaceholder: "vd: Nguyễn Văn A",
    numberPlaceholder: "vd: 0901234567",
    blindTransfer: "Chuyển trực tiếp",
    attendedTransfer: "Chuyển có trao đổi",
    completeTransfer: "Hoàn tất chuyển",
    transferSearchPlaceholder: "Nhập số hoặc tên...",
    call: "Gọi",
    cancelCall: "Hủy gọi",
    joinConferenceCall: "Tham gia hội nghị",
    deviceSettings: "Cài đặt thiết bị",
    sendDtmf: "Gửi DTMF",
    close: "Đóng",
    dtmfPlaceholder: "Nhập phím..."
  }
};

const LEGACY_LANG_KEYS = {
  refreshRegistration: "refresh_registration",
  configureExtension: "configure_extension",
  settings: "settings",
  language: "language",
  audioVideo: "audio_video",
  speaker: "speaker",
  ringDevice: "ring_device",
  microphone: "microphone",
  camera: "camera",
  save: "save",
  cancel: "cancel",
  audioCall: "audio_call",
  videoCall: "video_call",
  autoAnswer: "auto_answer",
  doNotDisturb: "do_no_disturb",
  callWaiting: "call_waiting",
  recordAllCalls: "record_all_calls",
  noContacts: "no_contacts",
  noRecentCalls: "mobile_no_recents",
  missed: "missed",
  outgoing: "outgoing",
  incoming: "incoming",
  addContactAction: "add_contact_action",
  deleteCallLog: "delete_call_log",
  extensionShort: "extension_short",
  confirmDeleteRecentGroup: "confirm_delete_recent_group",
  confirmDeleteRecent: "confirm_delete_recent",
  copyNumber: "copy_number",
  numberCopied: "number_copied",
  edit: "edit",
  confirmDeleteContact: "confirm_delete_contact",
  contactMenu: "contact_menu",
  saveContact: "save",
  fullName: "full_name",
  contactNumber1: "contact_number_1",
  allowCallsOnDnd: "allow_calls_on_dnd",
  asteriskServer: "asterisk_server_address",
  websocketPort: "websocket_port",
  websocketPath: "websocket_path",
  sipDomain: "sip_domain",
  sipUsername: "sip_username",
  sipPassword: "sip_password",
  autoGainControl: "auto_gain_control",
  echoCancellation: "echo_cancellation",
  noiseSuppression: "noise_suppression",
  optional: "optional",
  add: "add",
  dialpad: "mobile_tab_dialpad",
  recents: "mobile_tab_recents",
  contacts: "mobile_tab_contacts",
  mute: "mute",
  unmute: "unmute",
  transferCall: "transfer_call",
  cancelTransfer: "cancel_transfer",
  conferenceCall: "conference_call",
  cancelConference: "cancel_conference",
  holdCall: "hold_call",
  resumeCall: "resume_call",
  endCall: "end_call",
  completeTransfer: "complete_transfer",
  call: "call",
  cancelCall: "cancel_call",
  joinConferenceCall: "join_conference_call",
  deviceSettings: "device_settings",
  sendDtmf: "send_dtmf",
  close: "close"
};

class UINotifications {
  constructor({ enabled = true, onClick = null } = {}) {
    this.enabled = enabled;
    this.onClick = typeof onClick === "function" ? onClick : null;
    this.active = null;
  }

  async ensurePermission() {
    if (!this.enabled) return false;
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    try {
      const result = await Notification.requestPermission();
      return result === "granted";
    } catch {
      return false;
    }
  }

  #focusBrowserWindow() {
    if (typeof window === "undefined") return;
    try {
      const topWin = window.top || window;
      topWin.focus();
    } catch {
      try {
        window.focus();
      } catch {
        // Cross-origin top frame may block focus; parent postMessage still runs.
      }
    }
  }

  notifyIncomingCall(from) {
    if (!this.enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      if (this.active) {
        try {
          this.active.close();
        } catch {
          // ignore
        }
      }
      const notification = new Notification("Incoming call", {
        body: from ? `From ${from}` : "Incoming call",
        tag: "vphone-incoming",
        renotify: true,
        requireInteraction: true
      });
      this.active = notification;
      notification.onclick = (event) => {
        try {
          event?.preventDefault?.();
        } catch {
          // ignore
        }
        this.#focusBrowserWindow();
        if (this.onClick) {
          try {
            this.onClick({ from: from || "" });
          } catch {
            // ignore
          }
        }
        try {
          notification.close();
        } catch {
          // ignore
        }
      };
      notification.onclose = () => {
        if (this.active === notification) this.active = null;
      };
    } catch (err) {
      console.warn("VPhone notification failed", err);
    }
  }

  clear() {
    if (!this.active) return;
    try {
      this.active.close();
    } catch {
      // ignore
    }
    this.active = null;
  }
}

function bindControls(root, handlers) {
  const idMap = {
    BtnFilter: handlers.onFilter,
    SettingsMenu: handlers.onSettings,
    dialAudio: handlers.onCallAudio || handlers.onCall,
    dialVideo: handlers.onCallVideo || handlers.onCall,
    dialDeleteKey: handlers.onDialDelete,
    "dialpad-toggle-auto": () => handlers.onDialpadToggle?.({ key: "auto" }),
    "dialpad-toggle-cw": () => handlers.onDialpadToggle?.({ key: "cw" }),
    "dialpad-toggle-dnd": () => handlers.onDialpadToggle?.({ key: "dnd" }),
    "dialpad-toggle-rec": () => handlers.onDialpadToggle?.({ key: "rec" })
  };

  const map = {
    call: handlers.onCall,
    answer: handlers.onAnswer,
    hangup: handlers.onHangup,
    mute: handlers.onMute,
    hold: handlers.onHold,
    reconnect: handlers.onReconnect,
    transfer: handlers.onTransfer,
    conference: handlers.onConference,
    search: handlers.onSearch,
    filter: handlers.onFilter,
    settings: handlers.onSettings,
    "add-contact": handlers.onAddContact,
    "clear-tab": handlers.onClearTab,
    "focus-search": handlers.onFocusSearch,
    more: handlers.onMore,
    reg: handlers.onRegisterToggle
  };
  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const btn = target.closest("[data-action]");
    if (btn && root.contains(btn)) {
      const action = btn.getAttribute("data-action") || "";
      const fn = map[action];
      if (typeof fn === "function") {
        const tab = btn.getAttribute("data-tab") || "";
        fn({ tab, action, element: btn });
        return;
      }
    }

    const idBtn = target.closest("[id]");
    if (!idBtn || !root.contains(idBtn)) return;
    const id = idBtn.getAttribute("id") || "";
    const idHandler = idMap[id];
    if (typeof idHandler === "function") idHandler({ element: idBtn, id });
  });
}

class DomRenderer {
  constructor(root) {
    if (!root) throw new Error("DomRenderer requires root");
    this.root = root;
    this.lastRegistrationError = "";
    this.#ensureLegacyPhoneJsLayout();
    this.refs = {
      status: root.querySelector("[data-role='status']"),
      numberInput: root.querySelector("#dialText") || root.querySelector("#txtFindBuddy"),
      remoteMedia: root.querySelector("[data-role='remote-media']"),
      localMedia: root.querySelector("[data-role='local-media']"),
      searchArea: root.querySelector("#searchArea"),
      mobileTopBar: root.querySelector("#mobileTopBar"),
      contactsTabHeader: root.querySelector("#contactsTabHeader"),
      myContacts: root.querySelector("#myContacts"),
      actionArea: root.querySelector("#actionArea"),
      rightContent: root.querySelector("#rightContent"),
      tabDialpad: root.querySelector("#tab-dialpad"),
      tabRecents: root.querySelector("#tab-recents"),
      tabContacts: root.querySelector("#tab-contacts")
    };
    this.showTab("dialpad");
  }

  getTargetNumber() {
    const dialText = this.root.querySelector("#dialText");
    const findBuddy = this.root.querySelector("#txtFindBuddy");
    return (dialText?.value || findBuddy?.value || "").trim();
  }

  setStatus(text) {
    if (this.refs.status) this.refs.status.textContent = text;
  }

  setRegistrationState({ online, user, error, status } = {}) {
    const regText = this.root.querySelector("#mobileRegText");
    const regDot = this.root.querySelector("#mobileRegDot");
    const regLink = this.root.querySelector("#reglink");
    const deregLink = this.root.querySelector("#dereglink");
    const userCallId = this.root.querySelector("#UserCallID");
    const resolvedStatus = status || (online ? "online" : (error ? "register-failed" : "offline"));
    if (online) this.lastRegistrationError = "";
    else if (error !== undefined && error !== null && String(error).trim()) {
      this.lastRegistrationError = String(error).trim();
    }
    const errorText = this.lastRegistrationError || "";
    let statusLabel;
    if (online || resolvedStatus === "online") {
      statusLabel = this.dndActive
        ? (this.statusDndLabel || this.statusOnlineLabel || "Do Not Disturb")
        : (this.statusOnlineLabel || "Online");
    } else if (resolvedStatus === "register-failed") {
      statusLabel = errorText || this.statusRegisterFailedLabel || "Register failed";
    } else {
      statusLabel = this.statusOfflineLabel || "Offline";
    }
    // Prefer the explicit SIP extension; never fall back to stale #UserCallID text.
    const identity = String(user || "").trim();
    if (regText) {
      regText.textContent = identity ? `${identity} • ${statusLabel}` : statusLabel;
      regText.title = regText.textContent;
    }
    if (regDot) {
      regDot.className = online
        ? (this.dndActive ? "dotOnline dotDnd" : "dotOnline")
        : (resolvedStatus === "register-failed" ? "dotOffline dotRegisterFailed" : "dotOffline");
    }
    if (regLink) {
      regLink.className = online
        ? "dotOnline"
        : (resolvedStatus === "register-failed" ? "dotOffline dotRegisterFailed" : "dotOffline");
    }
    if (deregLink) deregLink.style.display = online ? "" : "none";
    if (userCallId && identity) userCallId.textContent = identity;
  }

  attachMedia(name, stream) {
    const el = name === "local" ? this.refs.localMedia : this.refs.remoteMedia;
    if (!el) return;
    try {
      el.srcObject = stream;
    } catch {
      el._vphoneDebugStream = stream;
    }
  }

  showTab(tabName) {
    const t = String(tabName || "dialpad");
    const isDialpad = t === "dialpad";
    const isContacts = t === "contacts";
    const isRecents = t === "recents";

    if (this.refs.contactsTabHeader) this.refs.contactsTabHeader.style.display = "none";
    if (this.refs.myContacts) this.refs.myContacts.style.display = isContacts ? "" : "none";
    if (this.refs.actionArea) this.refs.actionArea.style.display = isContacts ? "none" : "";
    if (this.refs.searchArea) {
      this.refs.searchArea.style.display = "none";
      this.refs.searchArea.classList.remove("phoneSearchVisible");
    }
    this.renderMobileTopBar(t);

    if (this.refs.tabDialpad) this.refs.tabDialpad.classList.toggle("activeTab", isDialpad);
    if (this.refs.tabRecents) this.refs.tabRecents.classList.toggle("activeTab", isRecents);
    if (this.refs.tabContacts) this.refs.tabContacts.classList.toggle("activeTab", isContacts);
    if (typeof this.onTabRendered === "function") this.onTabRendered(t);
  }

  showSearch(show) {
    if (!this.refs.searchArea) return;
    this.refs.searchArea.style.display = show ? "" : "none";
  }

  renderMobileTopBar(tabName) {
    if (!this.refs.mobileTopBar) return;
    const regLink =
      "<button type=\"button\" class=\"mobileTopBtn mobileRegBtn\" data-action=\"reg\" title=\"Registration\">" +
      "<span class=\"mobileRegStatus\">" +
      "<span id=\"mobileRegDot\" class=\"dotOffline\"></span>" +
      "<span id=\"mobileRegText\">Offline</span>" +
      "</span></button>";
    let actions = "";
    if (tabName === "recents") {
      actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"clear-tab\" data-tab=\"recents\" title=\"Delete\"><i class=\"fa fa-trash-o\"></i></button>";
    } else if (tabName === "contacts") {
      actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"add-contact\" title=\"Add\"><i class=\"fa fa-plus\"></i></button>";
      actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"clear-tab\" data-tab=\"contacts\" title=\"Delete\"><i class=\"fa fa-trash-o\"></i></button>";
    }
    // EnableSettings also gates this ellipsis ("more") control on the mobile header.
    if (this.showSettingsButton !== false) {
      actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"more\" title=\"More\"><i class=\"fa fa-ellipsis-v\"></i></button>";
    }
    this.refs.mobileTopBar.innerHTML =
      "<div class=\"mobileTopBarInner\"><div class=\"mobileTopBarTitle\">" + regLink + "</div>" +
      "<div class=\"mobileTopBarActions\">" + actions + "</div></div>";
  }

  #ensureLegacyPhoneJsLayout() {
    if (this.root.querySelector("[data-role='number-input']")) return;
    const shellClass = this.root.getAttribute("data-phone-shell") === "embedded" ? "phoneEmbedded" : "phoneStandalone";
    this.root.innerHTML = `
      <div id="Phone" class="pageContainer ${shellClass} phoneFrame250 phoneApp">
        <header class="phoneHeaderBar">
          <div class="contact" id="UserProfile">
            <span id="TxtVoiceMessages" class="voiceMessageNotifyer">0</span>
            <div id="UserProfilePic" class="buddyIcon"></div>
            <span class="settingsMenu">
              <button class="roundButtons" id="BtnFreeDial" data-action="call" title="Call"><i class="fa fa-phone"></i></button>
              <button class="roundButtons" id="SettingsMenu" title="Settings" style="display:none"><i class="fa fa-cogs"></i></button>
            </span>
            <div class="contactNameText">
              <span id="dereglink" class="dotOnline" style="display:none"></span>
              <span id="reglink" class="dotOffline"></span>
              <span id="UserCallID"></span>
            </div>
            <div class="presenceText">
              <span id="regStatus" data-role="status">&nbsp;</span>
              <span id="dndStatus"></span>
            </div>
          </div>
        </header>
        <div id="searchArea" class="phoneSearch" style="display:none;">
          <span id="divFindBuddy" class="searchClean phoneSearchField">
            <i class="fa fa-search phoneSearchIcon" aria-hidden="true"></i>
            <input id="txtFindBuddy" type="text" autocomplete="off" placeholder="Search">
          </span>
        </div>
        <div id="mobileTopBar" class="mobileTopBar"></div>
        <div id="contactsTabHeader" class="contactsTabHeader" style="display:none;">
          <span style="flex:1;">Contacts</span>
          <button type="button" id="BtnCreateGroup" class="roundButtons" title="Create Group"><i class="fa fa-users"></i></button>
        </div>
        <div id="myContacts" class="contactArea cleanScroller phoneBodyList" style="display:none;"></div>
        <div id="actionArea" class="contactArea cleanScroller dialpadMode phoneBodyList"></div>
        <div id="bottomTabBar" class="mainTabBar">
          <button type="button" id="tab-dialpad" class="mainTab activeTab" data-label="Dialpad"><i class="fa fa-th mainTabIcon"></i></button>
          <button type="button" id="tab-recents" class="mainTab" data-label="Recents"><i class="fa fa-history mainTabIcon"></i></button>
          <button type="button" id="tab-contacts" class="mainTab" data-label="Contacts"><i class="fa fa-address-book mainTabIcon"></i></button>
        </div>
        <div id="rightContent" class="rightContent" style="display:none;"></div>
      </div>
    `;
  }
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
    // Wired after config flags below.
    const notificationsEnabled = this.#getBoolConfig("EnableNotifications", false);
    this.notifications = new UINotifications({
      enabled: notificationsEnabled,
      onClick: () => {
        // Bring host tab forward and ask floating host to expand.
        try {
          const message = {
            type: "vphone-call",
            payload: { phase: "notification-click" }
          };
          if (typeof window === "undefined") return;
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, "*");
          }
          window.postMessage(message, "*");
        } catch {
          // ignore
        }
      }
    });
    if (notificationsEnabled) {
      void this.notifications.ensurePermission();
    }
    this.localDB = typeof window !== "undefined" ? window.localStorage : null;
    const configuredUser = String(this.config.Username || "").trim();
    const storedProfileId = String(this.#getDbItem("profileUserID", "") || "").trim();
    // Prefer SIP extension over a stale localStorage profileUserID (legacy IDs / UUIDs).
    this.profileUserID = configuredUser || storedProfileId || this.config.profileUserID || "default";
    this.profileName = this.#getDbItem("profileName", this.config.profileName || "") || "";
    // Keep SIP From displayName in sync with configured profile name (host cannot override via makeCall).
    if (this.profileName) {
      this.config.profileName = this.profileName;
      try { this.sdk.configure?.({ profileName: this.profileName }); } catch { /* ignore */ }
    }
    this.enableVideoCalling = this.#getBoolConfig("EnableVideoCalling", false);
    this.enableTransfer = this.#getBoolConfig("EnableTransfer", true);
    this.enableConference = this.#getBoolConfig("EnableConference", false);
    this.enableRecordAllCalls = this.#getBoolConfig("EnableRecordAllCalls", false);
    this.enableFreeDial = this.#getBoolConfig("EnableFreeDial", true);
    this.enableBuddies = this.#getBoolConfig("EnableBuddies", true);
    // EnableSettings: show header settings gear + mobile "more" menu. Web default false; Electron true.
    this.settingsButtonVisible = this.#getBoolConfig("EnableSettings", false);
    this.renderer.showSettingsButton = this.settingsButtonVisible;
    this._ringtoneAudio = null;
    this._ringtoneFallbackTimer = null;
    this.language = this.#normalizeLanguage(this.#getDbItem("Language", this.config.Language || "vi"));
    this.langPack = {};
    this.dialpadToggles = { auto: false, cw: true, dnd: false, rec: false };
    this.activeTab = "dialpad";
    this.tabSearch = { contacts: "", recents: "", dialpad: "" };
    this.callConnected = false;
    this.recentExpandedById = {};
    this.recentGroups = [];
    this.editingContactId = "";
    this.contacts = this.#loadContactsFromStorage();
    this.recents = this.#loadRecentsFromStorage();
    this.#applySavedAudioPreferences();
    this.profileMenu = null;
    this.returnTab = "dialpad";
    this.activeCall = null;
    this.currentCallLog = null;
    this.callTimerStartedAt = null;
    this.callTimerInterval = null;
    this._statusHoldUntil = 0;
    this._statusHoldText = "";
    this._mediaErrorBannerTimer = 0;
  }

  mount() {
    const runCallAction = (fn) => {
      void Promise.resolve()
        .then(() => fn())
        .catch((err) => {
          this.#showMediaError(err, "Call failed");
        });
    };
    bindControls(this.root, {
      onCall: () => runCallAction(() => this.call()),
      onCallAudio: () => runCallAction(() => this.call({ video: false })),
      onCallVideo: () => runCallAction(() => this.call({ video: true })),
      onAnswer: () => runCallAction(() => this.#answerCall()),
      onHangup: () => {
        this.#stopRingtone();
        return this.sdk.hangup();
      },
      onMute: () => this.sdk.mute(),
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
      onAddContact: () => this.#promptAddContact(),
      onClearTab: ({ tab } = {}) => this.#handleClearTab(tab),
      onMore: ({ element } = {}) => this.#openProfileMenu(element),
      onRegisterToggle: () => this.#toggleRegistration(),
      onDialDelete: () => this.#deleteDialDigit(),
      onDialpadToggle: ({ key } = {}) => this.#toggleDialpadSetting(key),
      onFocusSearch: () => {
        this.renderer.showSearch(true);
        const search = this.root.querySelector("#txtFindBuddy");
        if (search) {
          search.focus();
          search.select?.();
        }
      }
    });

    this.#bindTabButtons();
    this.#bindDialpadInputState();
    this.#bindDialpadDigits();
    this.#bindSearchInputState();
    this.#bindRecentExpandedActions();
    this.#bindContactExpandedActions();
    this.#bindCallSurfaceControls();
    this.#hideLoadingOverlay();

    this.sdk.on("incoming-call", (call) => {
      const caller = this.#resolveCallPeer(call?.from || call?.displayName || "", {
        displayName: call?.displayName || ""
      });
      this.activeCall = {
        direction: "incoming",
        from: call?.from || "",
        target: call?.from || "",
        number: caller.number || "",
        displayName: caller.name || caller.primary || ""
      };
      this.currentCallLog = {
        direction: "incoming",
        number: caller.number || caller.name,
        name: caller.name || caller.primary || caller.number,
        startedAt: new Date(),
        answeredAt: null
      };
      if (this.dialpadToggles.dnd) {
        this.sdk.reject?.({ statusCode: 486, reasonPhrase: "Do Not Disturb" });
        this.renderer.setStatus(this.#t("doNotDisturb"));
        return;
      }
      this.#renderIncomingCall(call);
      this.renderer.setStatus(this.#t("incoming"));
      this.notifications.notifyIncomingCall(call?.from);
      this.#startRingtone();
      if (this.dialpadToggles.auto) {
        window.setTimeout(() => {
          void this.#answerCall();
        }, 0);
      }
    });
    this.sdk.on("outgoing-call", ({ target }) => {
      const caller = this.#resolveCallPeer(target || "", {});
      this.activeCall = {
        direction: "outgoing",
        target: target || "",
        number: caller.number || target || "",
        displayName: caller.name || caller.primary || ""
      };
      this.currentCallLog = {
        direction: "outgoing",
        number: caller.number || target || "",
        name: caller.name || caller.primary || target || "",
        startedAt: new Date(),
        answeredAt: null
      };
      this.#renderCallProgress(target);
      this.renderer.setStatus(`Calling ${caller.name || target}`);
    });
    this.sdk.on("call-connected", (payload = {}) => {
      this.#stopRingtone();
      this.notifications.clear();
      this.callConnected = true;
      const peer = this.#resolveCallPeer(
        this.activeCall?.number || this.activeCall?.target || this.activeCall?.from || "",
        { displayName: this.activeCall?.displayName || "" }
      );
      this.activeCall = {
        ...(this.activeCall || {}),
        direction: payload.direction || this.activeCall?.direction || "active",
        number: peer.number || this.activeCall?.number || "",
        displayName: peer.name || peer.primary || this.activeCall?.displayName || ""
      };
      if (this.currentCallLog) this.currentCallLog.answeredAt = new Date();
      this.#renderActiveCall();
      this.#startCallTimer();
      this.renderer.setStatus(this.#t("connected"));
    });
    this.sdk.on("call-ended", () => {
      this.#stopRingtone();
      this.#stopCallTimer();
      this.notifications.clear();
      this.#saveRecentFromCurrentCall();
      this.#restoreIdleUi();
      const regState = this.sdk.getRegistrationState?.() || {};
      this.renderer.setRegistrationState({
        ...regState,
        user: this.#registrationDisplayUser(regState.user)
      });
      // Keep media/permission error visible after reject → call-ended → dialpad restore.
      if (this.#statusHoldActive() && this._statusHoldText) {
        this.renderer.setStatus(this._statusHoldText);
        this.#flashActionError(this._statusHoldText);
        return;
      }
      if (regState.online) {
        this.renderer.setStatus(this.dialpadToggles.dnd ? this.#t("doNotDisturb") : this.#t("online"));
      } else if (regState.status === "register-failed" || regState.error) {
        this.renderer.setStatus(regState.error || this.#t("registerFailed"));
      } else {
        this.renderer.setStatus(this.#t("offline"));
      }
    });
    this.sdk.on("mute-changed", ({ muted }) => {
      this.renderer.setStatus(muted ? this.#t("muted") : this.#t("unmuted"));
      const mute = this.root.querySelector("#line-1-btn-Mute");
      const unmute = this.root.querySelector("#line-1-btn-Unmute");
      if (mute) mute.style.display = muted ? "none" : "";
      if (unmute) unmute.style.display = muted ? "" : "none";
    });
    this.sdk.on("hold-changed", ({ onHold }) => {
      this.renderer.setStatus(onHold ? this.#t("onHold") : this.#t("resumed"));
      const hold = this.root.querySelector("#line-1-btn-Hold");
      const resume = this.root.querySelector("#line-1-btn-Unhold");
      if (hold) hold.style.display = onHold ? "none" : "";
      if (resume) resume.style.display = onHold ? "" : "none";
    });
    this.sdk.on("local-stream", (stream) => this.renderer.attachMedia("local", stream));
    this.sdk.on("remote-stream", (stream) => this.renderer.attachMedia("remote", stream));
    this.sdk.on("registration-changed", ({ online, user, error, status } = {}) => {
      const displayUser = this.#registrationDisplayUser(user);
      if (displayUser && displayUser !== "default") this.profileUserID = displayUser;
      this.renderer.setRegistrationState({ online, user: displayUser, error, status });
      // Do not overwrite a short-lived media/permission error message.
      if (this.#statusHoldActive()) return;
      if (online) {
        this.renderer.setStatus(this.dialpadToggles.dnd ? this.#t("doNotDisturb") : this.#t("online"));
        void this.sdk.warmMedia?.({ audio: true, video: false });
      } else if (status === "register-failed" || error) {
        const errText = String(error || this.renderer.lastRegistrationError || "").trim();
        this.renderer.setStatus(errText || this.#t("registerFailed"));
      } else {
        this.renderer.setStatus(this.#t("offline"));
      }
    });

    this.renderer.statusOnlineLabel = this.#t("onlineShort");
    this.renderer.statusOfflineLabel = this.#t("offlineShort");
    this.renderer.statusRegisterFailedLabel = this.#t("registerFailedShort");
    this.renderer.statusDndLabel = this.#t("doNotDisturb");
    this.renderer.dndActive = !!this.dialpadToggles.dnd;
    this.renderer.onTabRendered = () => {
      this.renderer.showSettingsButton = this.settingsButtonVisible;
      this.#applyFeatureVisibility();
      const regState = this.sdk.getRegistrationState?.() || {};
      this.renderer.setRegistrationState({
        ...regState,
        user: this.#registrationDisplayUser(regState.user),
        error: regState.online ? undefined : (this.renderer.lastRegistrationError || undefined)
      });
    };

    const regState = this.sdk.getRegistrationState?.();
    if (regState) {
      this.renderer.setRegistrationState({
        ...regState,
        user: this.#registrationDisplayUser(regState.user)
      });
    }
    this.renderer.setStatus(this.#t("registering"));
    this.#applyFeatureVisibility();
    this.#applyLanguageToStaticLabels();
    this.#loadLanguagePack(this.language).then(() => {
      this.#applyLanguageToStaticLabels();
      this.#renderTabContent(this.activeTab || "dialpad");
    }).catch(() => {});
  }

  async call(options = {}) {
    const target = options.target || options.numberToDial || this.renderer.getTargetNumber();
    if (!target) {
      this.renderer.setStatus("Missing target number");
      return;
    }
    const dialTarget = this.#clampDialValue(String(target));
    const callType = options.callType || (options.video ? "video" : "audio");
    const wantVideo = !!(options.video || callType === "video");
    const callOptions = {
      video: wantVideo,
      extraHeaders: Array.isArray(options.extraHeaders) ? options.extraHeaders : undefined,
      constraints: options.constraints
    };

    // 1) Xin quyền micro/camera trên dialpad. 2) Chỉ gọi khi được phép. 3) Bị chặn → thông báo, không INVITE.
    try {
      await this.#requestMediaForCall({ video: wantVideo, constraints: options.constraints });
    } catch (err) {
      this.#showMediaError(err, "Call failed");
      return;
    }

    // Remote party label from contacts only — do not let host callerName override.
    const peer = this.#resolveCallPeer(dialTarget, { displayName: "" });
    this.activeCall = {
      direction: "outgoing",
      target: dialTarget,
      number: peer.number || dialTarget,
      displayName: peer.name || peer.primary || ""
    };
    this.currentCallLog = {
      direction: "outgoing",
      number: peer.number || dialTarget,
      name: peer.name || peer.primary || dialTarget,
      startedAt: new Date(),
      answeredAt: null
    };
    this.#renderCallProgress(dialTarget);
    this.renderer.setStatus(`Calling ${peer.name || dialTarget}`);

    try {
      await this.sdk.call(dialTarget, callOptions);
    } catch (err) {
      this.#showMediaError(err, "Call failed");
      this.#restoreIdleUi();
    }
  }

  /** Host click-to-call entry (postMessage / parent API). */
  async makeCallFromHost(payload = {}) {
    const numberToDial = payload.numberToDial || payload.target || payload.number || "";
    // callType defaults to audio. Local From display name comes from configured profileName (UA), not host.
    return this.call({
      target: numberToDial,
      callType: payload.callType || "audio",
      video: payload.callType === "video",
      extraHeaders: payload.extraHeaders
    });
  }

  #statusHoldActive() {
    return Number(this._statusHoldUntil || 0) > Date.now();
  }

  #mediaErrorStatus(err, fallbackPrefix = "Error") {
    const name = String(err?.name || "");
    const raw = String(err?.message || err || "").trim();
    if (
      name === "NotAllowedError" ||
      name === "PermissionDeniedError" ||
      /permission|not allowed|denied|microphone/i.test(raw)
    ) {
      return this.#t("micPermissionDenied");
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return this.#t("mediaPermissionFailed");
    }
    return raw ? `${fallbackPrefix}: ${raw}` : this.#t("mediaPermissionFailed");
  }

  #showMediaError(err, fallbackPrefix = "Error") {
    const text = this.#mediaErrorStatus(err, fallbackPrefix);
    this._statusHoldText = text;
    this._statusHoldUntil = Date.now() + 8000;
    this.renderer.setStatus(text);
    try { console.warn("VPhone media:", err); } catch { /* ignore */ }
    // Visible banner on dialpad / call surface (header status can be easy to miss).
    this.#flashActionError(text);
    return text;
  }

  #flashActionError(text) {
    if (typeof document === "undefined") return;
    const host = this.root.querySelector("#actionArea") || this.root;
    if (!host) return;
    let banner = host.querySelector("[data-role='media-error-banner']");
    if (!banner) {
      banner = document.createElement("div");
      banner.setAttribute("data-role", "media-error-banner");
      banner.style.cssText = [
        "margin:8px 10px 0",
        "padding:8px 10px",
        "border-radius:8px",
        "background:#3f1d1d",
        "color:#fecaca",
        "font-size:12px",
        "line-height:1.35",
        "border:1px solid #7f1d1d",
        "position:relative",
        "z-index:5"
      ].join(";");
      host.insertBefore(banner, host.firstChild);
    }
    banner.textContent = text;
    banner.style.display = "";
    if (typeof window !== "undefined") {
      window.clearTimeout(this._mediaErrorBannerTimer);
      this._mediaErrorBannerTimer = window.setTimeout(() => {
        if (banner && banner.parentNode) banner.style.display = "none";
      }, 8000);
    }
  }

  async #requestMediaForCall({ video = false, constraints } = {}) {
    const mediaConstraints = {
      audio: true,
      video: !!video,
      ...(constraints && typeof constraints === "object" ? constraints : {})
    };
    const stream = await this.sdk.ensureMediaAccess(mediaConstraints);
    const liveAudio = stream?.getAudioTracks?.().filter((track) => track.readyState === "live") || [];
    if (!liveAudio.length) {
      throw Object.assign(new Error("Microphone permission required"), { name: "NotAllowedError" });
    }
    return stream;
  }

  async #rejectIncomingForMedia(reasonPhrase = "Microphone unavailable") {
    try {
      if (typeof this.sdk.reject === "function") {
        await this.sdk.reject({ statusCode: 486, reasonPhrase });
        return;
      }
    } catch { /* fall through */ }
    try { this.sdk.hangup?.(); } catch { /* ignore */ }
  }

  async #answerCall(options = {}) {
    this.#stopRingtone();
    const wantVideo = !!options.video;
    try {
      await this.#requestMediaForCall({ video: wantVideo, constraints: options.constraints });
    } catch (err) {
      // Hold message first so call-ended (from reject) re-applies it after dialpad restore.
      this.#showMediaError(err, "Answer failed");
      await this.#rejectIncomingForMedia("Microphone unavailable");
      // If reject did not emit call-ended, restore manually then show error on dialpad.
      if (this.root.querySelector(".vphoneCallScreen")) {
        this.#restoreIdleUi();
      }
      if (this._statusHoldText) {
        this.renderer.setStatus(this._statusHoldText);
        this.#flashActionError(this._statusHoldText);
      }
      return;
    }
    try {
      await this.sdk.answer(options);
    } catch (err) {
      this.#showMediaError(err, "Answer failed");
      await this.#rejectIncomingForMedia("Answer failed");
      if (this.root.querySelector(".vphoneCallScreen")) {
        this.#restoreIdleUi();
      }
      if (this._statusHoldText) {
        this.renderer.setStatus(this._statusHoldText);
        this.#flashActionError(this._statusHoldText);
      }
    }
  }

  #openProfileMenu(anchor) {
    if (this.profileMenu && this.profileMenu.getAttribute("data-role") === "profile-menu") {
      this.#closeProfileMenu();
      return;
    }
    this.#closeProfileMenu();
    if (typeof document === "undefined") {
      this.renderer.setStatus("Menu unavailable");
      return;
    }

    const host = this.#popupHost();
    const menu = document.createElement("ul");
    menu.className = "ui-menu ui-widget ui-widget-content popupMenuList";
    menu.setAttribute("role", "menu");
    menu.setAttribute("data-role", "profile-menu");
    const menuItems = [
      this.#profileMenuItem("configure", "fa fa-wrench", this.#t("configureExtension"))
    ];
    if (this.settingsButtonVisible) {
      menuItems.push(this.#profileMenuItem("settings", "fa fa-sliders", this.#t("settings")));
    }
    menu.innerHTML = menuItems.join("");

    menu.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const item = target.closest("[data-menu-action]");
      if (!item || !menu.contains(item)) return;
      event.preventDefault();
      event.stopPropagation();
      const action = item.getAttribute("data-menu-action") || "";
      this.#closeProfileMenu();
      this.#handleProfileMenuAction(action);
    });

    host.appendChild(menu);
    this.profileMenu = menu;

    const anchorRect = anchor?.getBoundingClientRect?.();
    const hostRect = host.getBoundingClientRect?.() || { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
    const width = Math.max(200, menu.offsetWidth || 200);
    const height = menu.offsetHeight || 160;
    const topBase = anchorRect ? anchorRect.bottom - hostRect.top + 4 : 10;
    const leftBase = anchorRect ? anchorRect.right - hostRect.left - width : 10;
    const maxLeft = Math.max(10, hostRect.width - width - 10);
    const maxTop = Math.max(10, hostRect.height - height - 10);
    menu.style.left = `${Math.max(10, Math.min(leftBase, maxLeft))}px`;
    menu.style.top = `${Math.max(10, Math.min(topBase, maxTop))}px`;

    const outsideClick = (event) => {
      if (anchor && anchor.contains(event.target)) return;
      if (this.profileMenu && !this.profileMenu.contains(event.target)) this.#closeProfileMenu();
    };
    const escapeKey = (event) => {
      if (event.key === "Escape") this.#closeProfileMenu();
    };
    this.profileMenuCleanup = () => {
      document.removeEventListener("click", outsideClick, true);
      document.removeEventListener("keydown", escapeKey, true);
    };
    window.setTimeout(() => {
      document.addEventListener("click", outsideClick, true);
      document.addEventListener("keydown", escapeKey, true);
    }, 0);
  }

  #profileMenuItem(action, iconClass, text) {
    return `<li class="ui-menu-item" role="menuitem" data-menu-action="${escapeHtml(action)}">` +
      `<div class="ui-menu-item-wrapper">${iconClass ? `<span class="ui-icon ${escapeHtml(iconClass)}"></span>` : ""}${escapeHtml(text)}</div></li>`;
  }

  #popupHost() {
    const phone = this.root.querySelector("#Phone") || this.root;
    if (phone && getComputedStyle(phone).position === "static") phone.style.position = "relative";
    return phone || document.body;
  }

  #closeProfileMenu() {
    if (typeof this.profileMenuCleanup === "function") this.profileMenuCleanup();
    this.profileMenuCleanup = null;
    if (this.profileMenu?.parentNode) this.profileMenu.parentNode.removeChild(this.profileMenu);
    this.profileMenu = null;
  }

  #confirmInPanel({ message, confirmText, cancelText, onConfirm } = {}) {
    this.#closeProfileMenu();
    if (typeof document === "undefined") {
      if (typeof onConfirm === "function") void onConfirm();
      return;
    }
    this.#closePanelConfirm();
    const host = this.#popupHost();
    const overlay = document.createElement("div");
    overlay.className = "panelConfirmOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="panelConfirmBox">
        <div class="panelConfirmMessage">${escapeHtml(message || this.#t("confirm"))}</div>
        <div class="panelConfirmActions">
          <button type="button" class="configSecondaryButton panelConfirmCancel">${escapeHtml(cancelText || this.#t("cancel"))}</button>
          <button type="button" class="configPrimaryButton panelConfirmOk">${escapeHtml(confirmText || this.#t("confirm"))}</button>
        </div>
      </div>`;
    const close = () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.removeEventListener("keydown", escapeKey, true);
    };
    const escapeKey = (event) => {
      if (event.key === "Escape") close();
    };
    overlay.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target === overlay || target.closest(".panelConfirmCancel")) {
        close();
        return;
      }
      if (target.closest(".panelConfirmOk")) {
        close();
        if (typeof onConfirm === "function") void onConfirm();
      }
    });
    document.addEventListener("keydown", escapeKey, true);
    host.appendChild(overlay);
    overlay.querySelector(".panelConfirmOk")?.focus();
  }

  #closePanelConfirm() {
    this.root.querySelectorAll(".panelConfirmOverlay").forEach((node) => node.parentNode?.removeChild(node));
  }

  #handleProfileMenuAction(action) {
    if (action === "configure") {
      this.#renderConfigExtension("extension");
      return;
    }
    if (action === "settings") {
      this.#renderConfigExtension("settings");
      return;
    }
  }

  async #getDevices() {
    try {
      if (typeof this.sdk.listDevices !== "function") return [];
      return await this.sdk.listDevices();
    } catch (err) {
      this.renderer.setStatus(`Load devices failed: ${String(err?.message || err)}`);
      return [];
    }
  }

  async #openSettings() {
    this.#renderConfigExtension("settings");
  }

  async #renderConfigExtension(mode = "extension") {
    this.returnTab = this.activeTab || "dialpad";
    const isSettings = mode === "settings";
    const isLanguage = mode === "language";
    const devices = await this.#getDevices();
    const mic = devices.filter((d) => d.kind === "audioinput");
    const cam = devices.filter((d) => d.kind === "videoinput");
    const spk = devices.filter((d) => d.kind === "audiooutput");
    const languageOptions = [
      ["en", "English"],
      ["vi", "Tiếng Việt"]
    ];
    const currentLanguage = this.#normalizeLanguage(this.#getDbItem("Language", this.config.Language || "vi"));
    const selectedSpeaker = this.#getDbItem("AudioOutputId", "");
    const selectedMic = this.#getDbItem("AudioSrcId", "");
    const selectedRing = this.#getDbItem("RingOutputId", "");
    const selectedCam = this.#getDbItem("VideoSrcId", "");
    const noiseOn = this.#getDbItem("NoiseSuppression", "1") !== "0";
    const echoOn = this.#getDbItem("EchoCancellation", "1") !== "0";
    const agcOn = this.#getDbItem("AutoGainControl", "1") !== "0";
    const deviceOptions = (items, fallback, selectedId = "") => {
      const rows = items.length ? items : [{ deviceId: "", label: fallback }];
      return rows.map((d) => {
        const selected = selectedId && d.deviceId === selectedId ? " selected" : "";
        return `<option value="${escapeHtml(d.deviceId)}"${selected}>${escapeHtml(d.label || d.deviceId || fallback)}</option>`;
      }).join("");
    };
    const title = isLanguage ? this.#t("language") : isSettings ? this.#t("settings") : this.#t("configureExtension");
    const icon = isLanguage ? "fa-language" : isSettings ? "fa-sliders" : "fa-cogs";
    const requiredMark = `<span style="color:#dc2626; font-weight:700">*</span>`;
    const serverValue = this.config.Server || readStorageValue("Server") || "";
    const domainValue = this.config.Domain || readStorageValue("Domain") || serverValue;
    const accountHtml = isSettings || isLanguage ? "" : `
      <div id="Configure_Extension_Html">
        <div class="UiText">${escapeHtml(this.#t("asteriskServer"))}: ${requiredMark}</div>
        <div><input id="Configure_Account_Server" class="UiInputText" type="text" value="${escapeHtml(serverValue)}"></div>
        <div class="UiText">${escapeHtml(this.#t("websocketPort"))}: ${requiredMark}</div>
        <div><input id="Configure_Account_Port" class="UiInputText" type="text" value="${escapeHtml(String(this.config.Port || readStorageValue("Port") || ""))}"></div>
        <div class="UiText">${escapeHtml(this.#t("websocketPath"))}:</div>
        <div><input id="Configure_Account_ServerPath" class="UiInputText" type="text" value="${escapeHtml(this.config.ServerPath || readStorageValue("ServerPath") || "/ws")}"></div>
        <div class="UiText">${escapeHtml(this.#t("fullName"))} (${escapeHtml(this.#t("optional"))}):</div>
        <div><input id="Configure_Account_profileName" class="UiInputText" type="text" value="${escapeHtml(this.profileName)}"></div>
        <div class="UiText">${escapeHtml(this.#t("sipDomain"))}: ${requiredMark}</div>
        <div><input id="Configure_Account_Domain" class="UiInputText" type="text" value="${escapeHtml(domainValue)}" placeholder="${escapeHtml(serverValue)}"></div>
        <div class="UiText">${escapeHtml(this.#t("sipUsername"))}: ${requiredMark}</div>
        <div><input id="Configure_Account_Username" class="UiInputText" type="text" value="${escapeHtml(this.config.Username || readStorageValue("Username") || "")}"></div>
        <div class="UiText">${escapeHtml(this.#t("sipPassword"))}: ${requiredMark}</div>
        <div><input id="Configure_Account_Password" class="UiInputText" type="password" value="${escapeHtml(this.config.Password || "")}"></div>
      </div>`;
    const settingsHtml = isSettings ? `
      <div class="UiTextHeading"><i class="fa fa-video-camera UiTextHeadingIcon" style="background-color:#208e3c"></i> ${escapeHtml(this.#t("audioVideo"))}</div>
      <div id="Audio_Video_Html">
        <div class="UiText">${escapeHtml(this.#t("speaker"))}</div>
        <div><select id="playbackSrc" style="width:100%">${deviceOptions(spk, "(Default Speaker)", selectedSpeaker)}</select></div>
        <div class="Settings_VolumeOutput_Container"><div id="Settings_SpeakerOutput" class="Settings_VolumeOutput"></div></div>
        <div><button class="roundButtons" id="preview_output_play"><i class="fa fa-play"></i></button></div>
        <div class="UiText">${escapeHtml(this.#t("ringDevice"))}</div>
        <div><select id="ringDevice" style="width:100%">${deviceOptions(spk, "(Default Ring Device)", selectedRing)}</select></div>
        <div class="Settings_VolumeOutput_Container"><div id="Settings_RingerOutput" class="Settings_VolumeOutput"></div></div>
        <div class="UiText">${escapeHtml(this.#t("microphone"))}</div>
        <div><select id="microphoneSrc" style="width:100%">${deviceOptions(mic, "(Default Microphone)", selectedMic)}</select></div>
        <div class="Settings_VolumeOutput_Container"><div id="Settings_MicrophoneOutput" class="Settings_VolumeOutput"></div></div>
        <div><input type="checkbox" id="Settings_AutoGainControl"${agcOn ? " checked" : ""}><label for="Settings_AutoGainControl"> ${escapeHtml(this.#t("autoGainControl"))}</label></div>
        <div><input type="checkbox" id="Settings_EchoCancellation"${echoOn ? " checked" : ""}><label for="Settings_EchoCancellation"> ${escapeHtml(this.#t("echoCancellation"))}</label></div>
        <div><input type="checkbox" id="Settings_NoiseSuppression"${noiseOn ? " checked" : ""}><label for="Settings_NoiseSuppression"> ${escapeHtml(this.#t("noiseSuppression"))}</label></div>
        ${this.enableVideoCalling ? `<div class="UiText">${escapeHtml(this.#t("camera"))}</div><div><select id="previewVideoSrc" style="width:100%">${deviceOptions(cam, "(Default Camera)", selectedCam)}</select></div>` : ""}
      </div>` : "";
    const languageHtml = (isSettings || isLanguage) ? `
      <div class="UiTextHeading"><i class="fa fa-language UiTextHeadingIcon" style="background-color:#6b7280"></i> ${escapeHtml(this.#t("language"))}</div>
      <div id="Language_Html">
        <div class="UiText">${escapeHtml(this.#t("language"))}:</div>
        <div><select id="Settings_Language" class="UiInputText">${languageOptions.map(([value, label]) => `<option value="${escapeHtml(value)}"${value === currentLanguage ? " selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select></div>
      </div>` : "";
    this.#showActionPanel(`
      <div class="configExtensionScreen">
        <div class="configExtensionHeader"><div class="configExtensionTitle"><i class="fa ${icon}"></i> ${escapeHtml(title)}</div></div>
        <div class="configExtensionForm">${accountHtml}${settingsHtml}${languageHtml}</div>
        <div class="UiWindowButtonBar" id="ButtonBar">
          <button class="configPrimaryButton" id="Config_Save">${escapeHtml(this.#t("save"))}</button>
          <button class="configSecondaryButton" id="Config_Cancel">${escapeHtml(this.#t("cancel"))}</button>
          ${!isSettings && !isLanguage ? `<button class="configSecondaryButton" id="Config_Clear">${escapeHtml(this.#t("clearExtensionConfig"))}</button>` : ""}
          ${isSettings ? `<button class="configSecondaryButton" id="Config_Reset">${escapeHtml(this.#t("resetSettings"))}</button>` : ""}
        </div>
      </div>`, { coverTabs: true });
    this.#bindConfigPanel(mode);
    this.renderer.setStatus(title);
  }

  #bindConfigPanel(mode) {
    const save = this.root.querySelector("#Config_Save");
    const cancel = this.root.querySelector("#Config_Cancel");
    const clear = this.root.querySelector("#Config_Clear");
    const reset = this.root.querySelector("#Config_Reset");
    if (save) save.addEventListener("click", () => this.#saveConfigPanel(mode));
    if (cancel) cancel.addEventListener("click", () => this.#switchTab(this.returnTab || "dialpad"));
    if (clear) clear.addEventListener("click", () => this.#confirmInPanel({
      message: this.#t("confirmClearExtension"),
      confirmText: this.#t("clearExtensionConfig"),
      onConfirm: async () => {
        const keys = ["Server", "Port", "ServerPath", "profileName", "Domain", "Username", "Password", "PasswordType"];
        keys.forEach((key) => {
          writeStorageValue(key, "");
          this.config[key] = "";
        });
        this.localDB?.removeItem("profileUserID");
        this.profileName = "";
        this.profileUserID = "default";
        try { await persistSipPassword(""); } catch { /* ignore */ }
        try { await this.sdk.unregister?.(); } catch { /* ignore */ }
        try { this.sdk.configure?.(Object.fromEntries(keys.map((key) => [key, ""]))); } catch { /* ignore */ }
        this.renderer.setRegistrationState({
          online: false,
          user: "",
          error: "Missing SIP configuration"
        });
        this.renderer.setStatus("Missing SIP configuration");
        await this.#renderConfigExtension("extension");
      }
    }));
    if (reset) reset.addEventListener("click", () => this.#confirmInPanel({
      message: this.#t("confirmResetSettings"),
      confirmText: this.#t("resetSettings"),
      onConfirm: async () => {
        ["AudioOutputId", "AudioSrcId", "RingOutputId", "VideoSrcId", "Language", "NoiseSuppression", "EchoCancellation", "AutoGainControl"].forEach((key) => this.localDB?.removeItem(key));
        this.language = this.#normalizeLanguage(this.config.Language || "vi");
        this.#applySavedAudioPreferences();
        await this.#loadLanguagePack(this.language);
        await this.#renderConfigExtension("settings");
        this.renderer.setStatus(this.#t("settingsReset"));
      }
    }));
  }

  async #saveConfigPanel(mode) {
    if (!this.localDB) return;
    const valueOf = (selector) => this.root.querySelector(selector)?.value || "";
    let savedStatus = mode === "extension" ? this.#t("extensionConfigSaved") : this.#t("settingsSaved");
    if (mode === "extension") {
      const server = valueOf("#Configure_Account_Server");
      let domain = valueOf("#Configure_Account_Domain");
      if (!domain && server) domain = server;
      const username = valueOf("#Configure_Account_Username");
      const rawPassword = valueOf("#Configure_Account_Password");
      // Config PasswordType=ha1 → field is HA1; unset/plain → field is plaintext.
      // Auth stays in memory only (Electron may optionally vault via hydrateSecrets).
      const inputType = this.config.PasswordType || "";
      const storedAuth = prepareSipPasswordForStorage(rawPassword, {
        username,
        realm: domain,
        passwordType: inputType
      });
      const nextConfig = normalizePhoneConfig({
        Server: server,
        Port: valueOf("#Configure_Account_Port"),
        ServerPath: valueOf("#Configure_Account_ServerPath"),
        profileName: valueOf("#Configure_Account_profileName"),
        Domain: domain,
        Username: username,
        Password: storedAuth.password,
        PasswordType: storedAuth.type
      });
      // Do not write SIP auth/provisioning keys to localStorage (host/memory model).
      Object.assign(this.config, nextConfig);
      this.profileName = nextConfig.profileName || this.profileName;
      this.profileUserID = nextConfig.Username || this.profileUserID;
      try {
        this.localDB?.setItem("profileUserID", this.profileUserID);
      } catch {}
      try {
        await this.sdk.unregister?.();
        this.sdk.configure?.(nextConfig);
        const state = await this.sdk.register?.();
        const regState = state || this.sdk.getRegistrationState?.() || {};
        this.renderer.setRegistrationState({
          ...regState,
          user: this.#registrationDisplayUser(regState.user || nextConfig.Username)
        });
      } catch (err) {
        savedStatus = `Register failed: ${String(err?.message || err)}`;
        this.renderer.setRegistrationState({
          online: false,
          user: this.#registrationDisplayUser(nextConfig.Username),
          error: String(err?.message || err)
        });
      }
    }
    if (mode === "settings") {
      this.localDB.setItem("AudioOutputId", valueOf("#playbackSrc"));
      this.localDB.setItem("AudioSrcId", valueOf("#microphoneSrc"));
      this.localDB.setItem("RingOutputId", valueOf("#ringDevice"));
      this.localDB.setItem("VideoSrcId", valueOf("#previewVideoSrc"));
      const checked = (selector) => !!this.root.querySelector(selector)?.checked;
      this.localDB.setItem("NoiseSuppression", checked("#Settings_NoiseSuppression") ? "1" : "0");
      this.localDB.setItem("EchoCancellation", checked("#Settings_EchoCancellation") ? "1" : "0");
      this.localDB.setItem("AutoGainControl", checked("#Settings_AutoGainControl") ? "1" : "0");
      this.#applySavedAudioPreferences();
      try {
        await this.#switchSelectedDevice("audiooutput", "#playbackSrc");
        await this.#switchSelectedDevice("audioinput", "#microphoneSrc");
      } catch {
        // Device apply is best-effort; values remain persisted.
      }
    }
    if (mode === "settings" || mode === "language") {
      const selectedLanguage = valueOf("#Settings_Language") || "vi";
      this.localDB.setItem("Language", this.#normalizeLanguage(selectedLanguage));
      this.language = this.#normalizeLanguage(selectedLanguage);
      await this.#loadLanguagePack(this.language);
      this.#applyLanguageToStaticLabels();
      savedStatus = this.#t("settingsSaved");
    }
    this.#switchTab(this.returnTab || "dialpad");
    this.renderer.setStatus(savedStatus);
  }

  async #switchSelectedDevice(kind, selector) {
    const deviceId = this.root.querySelector(selector)?.value || "";
    if (!deviceId || typeof this.sdk.switchDevice !== "function") return;
    await this.sdk.switchDevice(kind, deviceId);
  }

  async toggleHold() {
    if (this.sdk.isOnHold?.()) return this.sdk.resume();
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

  #setBottomTabsVisible(visible) {
    const phone = this.root.querySelector("#Phone") || this.root;
    phone.classList.toggle("phoneModalOpen", !visible);
    const tabBar = this.root.querySelector("#bottomTabBar");
    if (tabBar) tabBar.style.display = visible ? "" : "none";
  }

  /** Leave call/config overlay and restore header + bottom tabs. */
  #restoreIdleUi() {
    this.callConnected = false;
    this.activeCall = null;
    this.currentCallLog = null;
    this.#setBottomTabsVisible(true);
    const action = this.root.querySelector("#actionArea");
    if (action) action.classList.remove("configOverlayPane");
    this.renderer.showTab(this.activeTab || "dialpad");
    this.#renderTabContent(this.activeTab || "dialpad");
  }

  #showActionPanel(html, { coverTabs = false } = {}) {
    const host = this.root.querySelector("#actionArea");
    if (!host) return;
    if (this.renderer.refs?.myContacts) this.renderer.refs.myContacts.style.display = "none";
    if (this.renderer.refs?.contactsTabHeader) this.renderer.refs.contactsTabHeader.style.display = "none";
    if (this.renderer.refs?.searchArea) this.renderer.refs.searchArea.style.display = "none";
    host.classList.remove("dialpadMode");
    host.classList.toggle("configOverlayPane", !!coverTabs);
    host.innerHTML = html;
    host.style.display = "";
    if (coverTabs) this.#setBottomTabsVisible(false);
  }

  #callPeerHtml(caller) {
    const primary = escapeHtml(caller.primary || caller.name || caller.number || "");
    const secondaryText = caller.secondary
      || (caller.number && caller.name && caller.name !== caller.number ? caller.number : "");
    const secondary = secondaryText
      ? `<div class="vphoneCallPeerSub">${escapeHtml(secondaryText)}</div>`
      : "";
    return `<div class="vphoneCallPeer">${primary}</div>${secondary}`;
  }

  #resolveCallPeer(value, { displayName = "" } = {}) {
    this.contacts = this.#loadContactsFromStorage();
    const parsed = this.#callLabel(value);
    const number = parsed.number || (!parsed.name || parsed.name === this.#t("incoming") ? "" : parsed.name);
    const contactLookup = this.#buildContactLookup();
    const contactName = contactLookup.get(normalizeNumber(number)) || "";
    const callerIdName = normalizeText(displayName) || (parsed.name !== number ? parsed.name : "");
    return buildCallerDisplay(number, contactName, callerIdName);
  }

  #renderIncomingCall(call = {}) {
    const caller = this.#resolveCallPeer(call?.from || call?.displayName || this.#t("incoming"), {
      displayName: call?.displayName || ""
    });
    this.#showActionPanel(`
      <div class="vphoneCallScreen" data-call-state="incoming">
        <div class="vphoneCallCard">
          ${this.#callPeerHtml(caller)}
          <div class="vphoneCallStatus">${escapeHtml(this.#t("incoming"))}</div>
          <div class="vphoneCallActions">
            <button type="button" class="vphoneCallActionBtn vphoneCallActionAnswer callAnswerAudio" title="${escapeHtml(this.#t("answerCall"))}">
              <span class="vphoneCallActionIcon"><i class="fa fa-phone"></i></span>
              <span class="vphoneCallActionLabel">${escapeHtml(this.#t("answerCall"))}</span>
            </button>
            <button type="button" class="vphoneCallActionBtn vphoneCallActionReject callReject" title="${escapeHtml(this.#t("rejectCall"))}">
              <span class="vphoneCallActionIcon"><i class="fa fa-phone" style="transform: rotate(135deg);"></i></span>
              <span class="vphoneCallActionLabel">${escapeHtml(this.#t("rejectCall"))}</span>
            </button>
          </div>
        </div>
      </div>`, { coverTabs: true });
  }

  #renderCallProgress(target) {
    const caller = this.#resolveCallPeer(target || "Calling", {
      displayName: this.activeCall?.displayName || ""
    });
    this.#showActionPanel(`
      <div class="vphoneCallScreen" data-call-state="progress">
        <div class="vphoneCallCard">
          ${this.#callPeerHtml(caller)}
          <div class="vphoneCallStatus">${escapeHtml(this.#t("connecting"))}</div>
          <div class="vphoneCallActions vphoneCallActionsSingle">
            <button type="button" class="vphoneCallActionBtn vphoneCallActionReject callReject" title="${escapeHtml(this.#t("cancelAction"))}">
              <span class="vphoneCallActionIcon"><i class="fa fa-phone" style="transform: rotate(135deg);"></i></span>
              <span class="vphoneCallActionLabel">${escapeHtml(this.#t("cancelAction"))}</span>
            </button>
          </div>
        </div>
      </div>`, { coverTabs: true });
  }

  #renderActiveCall() {
    const caller = this.#resolveCallPeer(
      this.activeCall?.number || this.activeCall?.target || this.activeCall?.from || "Connected",
      { displayName: this.activeCall?.displayName || "" }
    );
    this.#showActionPanel(`
      <div class="vphoneCallScreen" data-call-state="active">
        <div class="vphoneCallCard vphoneCallCardActive">
          ${this.#callPeerHtml(caller)}
          <div id="callDuration" class="vphoneCallTimer">00:00</div>
          <div class="vphoneInCallPanel">
            <div class="vphoneInCallMain">
              <div class="vphoneInCallGrid">
                <button id="line-1-btn-Mute" type="button" class="vphoneInCallBtn callMute" title="${escapeHtml(this.#t("mute"))}">
                  <i class="fa fa-microphone"></i><span>${escapeHtml(this.#t("mute"))}</span>
                </button>
                <button id="line-1-btn-Unmute" type="button" class="vphoneInCallBtn callUnmute isOn" title="${escapeHtml(this.#t("unmute"))}" style="display:none">
                  <i class="fa fa-microphone-slash"></i><span>${escapeHtml(this.#t("unmute"))}</span>
                </button>
                <button id="line-1-btn-Hold" type="button" class="vphoneInCallBtn callHold" title="${escapeHtml(this.#t("holdCall"))}">
                  <i class="fa fa-pause"></i><span>${escapeHtml(this.#t("holdShort"))}</span>
                </button>
                <button id="line-1-btn-Unhold" type="button" class="vphoneInCallBtn callResume isOn" title="${escapeHtml(this.#t("resumeCall"))}" style="display:none">
                  <i class="fa fa-play"></i><span>${escapeHtml(this.#t("resumeCall"))}</span>
                </button>
                ${this.enableTransfer ? `<button id="line-1-btn-Transfer" type="button" class="vphoneInCallBtn callTransfer" title="${escapeHtml(this.#t("transferCall"))}">
                  <i class="fa fa-exchange"></i><span>${escapeHtml(this.#t("transferShort"))}</span>
                </button>
                <button id="line-1-btn-CancelTransfer" type="button" class="vphoneInCallBtn callCancelTransfer isOn" title="${escapeHtml(this.#t("cancelTransfer"))}" style="display:none">
                  <i class="fa fa-exchange"></i><span>${escapeHtml(this.#t("transferShort"))}</span>
                </button>` : `<span></span>`}
                <button id="line-1-btn-ShowNumpad" type="button" class="vphoneInCallBtn callDtmf" title="${escapeHtml(this.#t("keypad"))}">
                  <i class="fa fa-th"></i><span>${escapeHtml(this.#t("keypad"))}</span>
                </button>
                ${this.enableConference ? `<button id="line-1-btn-Conference" type="button" class="vphoneInCallBtn callConference" title="${escapeHtml(this.#t("conferenceCall"))}">
                  <i class="fa fa-users"></i><span>${escapeHtml(this.#t("conferenceShort"))}</span>
                </button>
                <button id="line-1-btn-CancelConference" type="button" class="vphoneInCallBtn callCancelConference isOn" title="${escapeHtml(this.#t("cancelConference"))}" style="display:none">
                  <i class="fa fa-users"></i><span>${escapeHtml(this.#t("conferenceShort"))}</span>
                </button>` : `<span></span>`}
                <button id="line-1-btn-settings" type="button" class="vphoneInCallBtn callDeviceSettings" title="${escapeHtml(this.#t("speakerphone"))}">
                  <i class="fa fa-volume-up"></i><span>${escapeHtml(this.#t("speakerphone"))}</span>
                </button>
              </div>
            </div>
            ${this.enableTransfer ? `<div id="line-1-Transfer" class="vphoneInCallOverlay transferPopupPanel" style="display:none">
              <div class="vphoneInCallOverlayCard transferPopupCard">
                <div class="vphoneInCallOverlayHeader transferPopupTitle">
                  <span class="vphoneInCallOverlayTitle"><i class="fa fa-exchange"></i><span>${escapeHtml(this.#t("transferCall"))}</span></span>
                  <button type="button" class="vphoneInCallOverlayClose callCloseOverlay" title="${escapeHtml(this.#t("close"))}"><i class="fa fa-times"></i></button>
                </div>
                <span class="searchClean transferSearch"><input id="line-1-txt-FindTransferBuddy" type="text" autocomplete="none" placeholder="${escapeHtml(this.#t("transferSearchPlaceholder"))}"></span>
                <div class="transferButtonRow">
                  <button id="line-1-btn-blind-transfer" class="transferActionButton callBlindTransfer"><i class="fa fa-reply" style="transform: rotateY(180deg)"></i><span>${escapeHtml(this.#t("blindTransfer"))}</span></button>
                </div>
                <div id="line-1-transfer-status" class="callStatus" style="margin-top:10px; display:none">...</div>
              </div>
            </div>` : ""}
            ${this.enableConference ? `<div id="line-1-Conference" class="vphoneInCallOverlay transferPopupPanel conferencePopupPanel" style="display:none">
              <div class="vphoneInCallOverlayCard transferPopupCard conferencePopupCard">
                <div class="vphoneInCallOverlayHeader transferPopupTitle">
                  <span class="vphoneInCallOverlayTitle"><i class="fa fa-users"></i><span>${escapeHtml(this.#t("conferenceCall"))}</span></span>
                  <button type="button" class="vphoneInCallOverlayClose callCloseOverlay" title="${escapeHtml(this.#t("close"))}"><i class="fa fa-times"></i></button>
                </div>
                <span class="searchClean transferSearch"><input id="line-1-txt-FindConferenceBuddy" type="text" autocomplete="none" placeholder="${escapeHtml(this.#t("transferSearchPlaceholder"))}"></span>
                <div class="transferButtonRow">
                  <button id="line-1-btn-conference-dial" class="transferActionButton callConferenceDial"><i class="fa fa-phone"></i><span>${escapeHtml(this.#t("call"))}</span></button>
                  <button id="line-1-btn-cancel-conference-dial" class="transferActionButton transferCancelButton callCancelConference" style="display:none"><i class="fa fa-phone" style="transform: rotate(135deg);"></i><span>${escapeHtml(this.#t("cancelCall"))}</span></button>
                  <button id="line-1-btn-join-conference-call" class="transferActionButton" style="display:none"><i class="fa fa-users"></i><span>${escapeHtml(this.#t("joinConferenceCall"))}</span></button>
                </div>
                <div id="line-1-conference-status" class="callStatus" style="margin-top:10px; display:none">...</div>
              </div>
            </div>` : ""}
            <div id="line-1-Dtmf" class="vphoneDtmfCard" style="display:none">
              <div class="vphoneDtmfHeader">
                <div class="vphoneDtmfTitle"><i class="fa fa-th"></i><span>${escapeHtml(this.#t("keypad"))}</span></div>
                <button type="button" class="vphoneDtmfClose callCloseOverlay callCloseDtmf" title="${escapeHtml(this.#t("close"))}" aria-label="${escapeHtml(this.#t("close"))}">&#x2715;</button>
              </div>
              <div class="vphoneDtmfDisplay">
                <input id="line-1-dtmf-input" type="text" readonly inputmode="none" autocomplete="off" placeholder="${escapeHtml(this.#t("dtmfPlaceholder"))}">
                <button type="button" id="line-1-dtmf-delete" class="vphoneDtmfBackspace" aria-label="Backspace">&#x232B;</button>
              </div>
              <div class="vphoneDtmfGrid">
                ${["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((digit) => `<button type="button" class="vphoneDtmfKey callDtmfDigit" data-dtmf-digit="${escapeHtml(digit)}">${escapeHtml(digit)}</button>`).join("")}
              </div>
            </div>
            <div class="vphoneInCallHangupRow">
              <button id="line-1-btn-End" type="button" class="vphoneCallActionBtn vphoneCallActionReject hangupButton callHangup" title="${escapeHtml(this.#t("endCall"))}">
                <span class="vphoneCallActionIcon"><i class="fa fa-phone" style="transform: rotate(135deg);"></i></span>
              </button>
            </div>
          </div>
        </div>
      </div>`, { coverTabs: true });
  }

  #startCallTimer() {
    this.#stopCallTimer();
    this.callTimerStartedAt = Date.now();
    this.#tickCallTimer();
    this.callTimerInterval = window.setInterval(() => this.#tickCallTimer(), 1000);
  }

  #stopCallTimer() {
    if (this.callTimerInterval) {
      window.clearInterval(this.callTimerInterval);
      this.callTimerInterval = null;
    }
    this.callTimerStartedAt = null;
  }

  #tickCallTimer() {
    const el = this.root.querySelector("#callDuration");
    if (!el || !this.callTimerStartedAt) return;
    const total = Math.max(0, Math.floor((Date.now() - this.callTimerStartedAt) / 1000));
    const minutes = String(Math.floor(total / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");
    el.textContent = `${minutes}:${seconds}`;
  }

  #callLabel(value) {
    const text = normalizeText(value);
    const quoted = text.match(/"([^"]+)"/);
    const match = text.match(/sip:([^@>;]+)/i);
    let number = "";
    if (match) {
      number = normalizeText(match[1]);
    } else if (text && !/^sip:/i.test(text) && !/@/.test(text)) {
      number = normalizeText(text.replace(/^<|>$/g, ""));
    } else {
      number = normalizeText(text.replace(/^<|>$/g, "").replace(/^sip:/i, "").split("@")[0]);
    }
    const display = normalizeText(quoted?.[1] || "");
    const name = display || number || "Unknown";
    return { name, number };
  }

  #bindCallSurfaceControls() {
    this.root.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".callAnswerAudio")) {
        void this.#answerCall({ video: false }).catch((err) => {
          this.#showMediaError(err, "Answer failed");
        });
        return;
      }
      if (target.closest(".callReject") || target.closest(".callHangup")) {
        this.sdk.hangup();
        return;
      }
      if (target.closest(".callMute")) {
        this.sdk.mute();
        const mute = this.root.querySelector("#line-1-btn-Mute");
        const unmute = this.root.querySelector("#line-1-btn-Unmute");
        if (mute) mute.style.display = "none";
        if (unmute) unmute.style.display = "";
        return;
      }
      if (target.closest(".callUnmute")) {
        this.sdk.unmute();
        const mute = this.root.querySelector("#line-1-btn-Mute");
        const unmute = this.root.querySelector("#line-1-btn-Unmute");
        if (mute) mute.style.display = "";
        if (unmute) unmute.style.display = "none";
        return;
      }
      if (target.closest(".callHold")) {
        void this.sdk.hold?.().catch((err) => {
          this.renderer.setStatus(`Hold failed: ${String(err?.message || err)}`);
        });
        return;
      }
      if (target.closest(".callResume")) {
        void this.sdk.resume?.().catch((err) => {
          this.renderer.setStatus(`Resume failed: ${String(err?.message || err)}`);
        });
        return;
      }
      if (target.closest(".callTransfer")) {
        const panel = this.root.querySelector("#line-1-Transfer");
        if (panel && panel.style.display !== "none") {
          this.#hideTransferPanel();
        } else {
          this.#showTransferPanel();
        }
        return;
      }
      if (target.closest(".callCancelTransfer")) {
        this.#hideTransferPanel();
        return;
      }
      if (target.closest(".callBlindTransfer") || target.closest(".callAttendedTransfer")) {
        this.#submitTransferFromPanel();
        return;
      }
      if (target.closest(".callConference")) {
        const panel = this.root.querySelector("#line-1-Conference");
        if (panel && panel.style.display !== "none") {
          this.#hideConferencePanel();
        } else {
          this.#showConferencePanel();
        }
        return;
      }
      if (target.closest(".callCancelConference")) {
        this.#hideConferencePanel();
        return;
      }
      if (target.closest(".callConferenceDial")) {
        this.#submitConferenceFromPanel();
        return;
      }
      if (target.closest(".callDtmf")) {
        this.#showDtmfPanel();
        return;
      }
      if (target.closest(".callCloseOverlay") || target.closest(".callCloseDtmf")) {
        this.#hideTransferPanel();
        this.#hideConferencePanel();
        this.#hideDtmfPanel();
        return;
      }
      const digitBtn = target.closest(".callDtmfDigit");
      if (digitBtn) {
        const digit = digitBtn.getAttribute("data-dtmf-digit") || "";
        const input = this.root.querySelector("#line-1-dtmf-input");
        if (input) input.value = `${input.value || ""}${digit}`;
        if (digit && typeof this.sdk.sendDTMF === "function") this.sdk.sendDTMF(digit).catch(() => {});
        return;
      }
      if (target.closest("#line-1-dtmf-delete")) {
        const input = this.root.querySelector("#line-1-dtmf-input");
        if (input) input.value = String(input.value || "").slice(0, -1);
        return;
      }
      if (target.closest(".callDeviceSettings")) {
        const anchor = target.closest(".callDeviceSettings");
        if (this.profileMenu && this.profileMenu.getAttribute("data-role") === "incall-device-menu") {
          this.#closeProfileMenu();
        } else {
          this.#openInCallDeviceMenu(anchor);
        }
        return;
      }
      if (target.closest(".callPresentSrc")) {
        const anchor = target.closest(".callPresentSrc");
        if (this.profileMenu && this.profileMenu.getAttribute("data-role") === "present-source-menu") {
          this.#closeProfileMenu();
        } else {
          this.#openPresentMenu(anchor);
        }
        return;
      }
    });
  }

  #isPanelVisible(el) {
    if (!el) return false;
    if (el.style.display === "none") return false;
    const computed = window.getComputedStyle?.(el);
    return !computed || computed.display !== "none";
  }

  #syncInCallOverlayState() {
    const transferOpen = this.#isPanelVisible(this.root.querySelector("#line-1-Transfer"));
    const conferenceOpen = this.#isPanelVisible(this.root.querySelector("#line-1-Conference"));
    const dtmfOpen = this.#isPanelVisible(this.root.querySelector("#line-1-Dtmf"));
    const fullOverlay = transferOpen || conferenceOpen;
    const host = this.root.querySelector(".vphoneInCallPanel");
    const card = this.root.querySelector(".vphoneCallCardActive");
    if (host) {
      host.classList.toggle("isOverlayOpen", fullOverlay);
      host.classList.toggle("isDtmfOpen", dtmfOpen);
    }
    if (card) {
      card.classList.toggle("isOverlayOpen", fullOverlay);
      card.classList.toggle("isDtmfOpen", dtmfOpen);
    }
  }

  #showTransferPanel() {
    this.#hideConferencePanel();
    this.#hideDtmfPanel();
    this.#closeProfileMenu();
    const panel = this.root.querySelector("#line-1-Transfer");
    const transfer = this.root.querySelector("#line-1-btn-Transfer");
    if (panel) panel.style.display = "flex";
    if (transfer) {
      transfer.style.display = "";
      transfer.classList.add("toggleOn");
    }
    const cancel = this.root.querySelector("#line-1-btn-CancelTransfer");
    if (cancel) cancel.style.display = "none";
    this.#syncInCallOverlayState();
    this.root.querySelector("#line-1-txt-FindTransferBuddy")?.focus();
  }

  #hideTransferPanel() {
    const panel = this.root.querySelector("#line-1-Transfer");
    const transfer = this.root.querySelector("#line-1-btn-Transfer");
    const cancel = this.root.querySelector("#line-1-btn-CancelTransfer");
    if (panel) panel.style.display = "none";
    if (transfer) {
      transfer.style.display = "";
      transfer.classList.remove("toggleOn");
    }
    if (cancel) cancel.style.display = "none";
    this.#syncInCallOverlayState();
  }

  #submitTransferFromPanel() {
    const target = normalizeNumber(this.root.querySelector("#line-1-txt-FindTransferBuddy")?.value || "");
    if (!target) return;
    this.sdk.transfer?.(target);
    const status = this.root.querySelector("#line-1-transfer-status");
    if (status) {
      status.textContent = `Transfer requested to ${target}`;
      status.style.display = "";
    }
  }

  #showConferencePanel() {
    this.#hideTransferPanel();
    this.#hideDtmfPanel();
    this.#closeProfileMenu();
    const panel = this.root.querySelector("#line-1-Conference");
    const conference = this.root.querySelector("#line-1-btn-Conference");
    if (panel) panel.style.display = "flex";
    if (conference) {
      conference.style.display = "";
      conference.classList.add("toggleOn");
    }
    const cancel = this.root.querySelector("#line-1-btn-CancelConference");
    if (cancel) cancel.style.display = "none";
    this.#syncInCallOverlayState();
    this.root.querySelector("#line-1-txt-FindConferenceBuddy")?.focus();
  }

  #hideConferencePanel() {
    const panel = this.root.querySelector("#line-1-Conference");
    const conference = this.root.querySelector("#line-1-btn-Conference");
    const cancel = this.root.querySelector("#line-1-btn-CancelConference");
    if (panel) panel.style.display = "none";
    if (conference) {
      conference.style.display = "";
      conference.classList.remove("toggleOn");
    }
    if (cancel) cancel.style.display = "none";
    this.#syncInCallOverlayState();
  }

  #submitConferenceFromPanel() {
    const target = normalizeNumber(this.root.querySelector("#line-1-txt-FindConferenceBuddy")?.value || "");
    if (!target) return;
    this.sdk.conference?.(target);
    const status = this.root.querySelector("#line-1-conference-status");
    if (status) {
      status.textContent = `Conference requested with ${target}`;
      status.style.display = "";
    }
  }

  #showDtmfPanel() {
    this.#hideTransferPanel();
    this.#hideConferencePanel();
    this.#closeProfileMenu();
    const panel = this.root.querySelector("#line-1-Dtmf");
    if (panel) panel.style.display = "flex";
    this.#syncInCallOverlayState();
    this.root.querySelector("#line-1-dtmf-input")?.focus();
  }

  #hideDtmfPanel() {
    const panel = this.root.querySelector("#line-1-Dtmf");
    if (panel) panel.style.display = "none";
    this.#syncInCallOverlayState();
  }

  async #openInCallDeviceMenu(anchor) {
    const devices = await this.#getDevices();
    this.#closeProfileMenu();
    const host = this.#popupHost();
    const menu = document.createElement("ul");
    menu.className = "ui-menu ui-widget ui-widget-content popupMenuList inCallDeviceMenu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("data-role", "incall-device-menu");
    const byKind = [
      ["audioinput", "fa fa-microphone", "Microphone"],
      ["audiooutput", "fa fa-volume-up", "Speaker"],
      ["videoinput", "fa fa-video-camera", "Camera"]
    ];
    menu.innerHTML = byKind.map(([kind, icon, label]) => {
      const rows = devices.filter((d) => d.kind === kind);
      if (rows.length === 0) return this.#profileMenuItem(`noop-${kind}`, null, label);
      return `<li class="ui-widget-header">${escapeHtml(label)}</li>` + rows.map((d) => this.#profileMenuItem(`device:${kind}:${d.deviceId}`, icon, d.label || d.deviceId)).join("");
    }).join("<li class=\"ui-menu-divider\" role=\"separator\"></li>");
    menu.addEventListener("click", (event) => {
      const item = event.target instanceof Element ? event.target.closest("[data-menu-action]") : null;
      if (!item) return;
      const action = item.getAttribute("data-menu-action") || "";
      if (!action.startsWith("device:")) return;
      const [, kind, deviceId] = action.split(":");
      this.sdk.switchDevice?.(kind, deviceId);
      this.#closeProfileMenu();
      this.renderer.setStatus(`Switched ${kind}`);
    });
    host.appendChild(menu);
    this.profileMenu = menu;
    const anchorRect = anchor?.getBoundingClientRect?.();
    const hostRect = host.getBoundingClientRect?.() || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const width = Math.max(200, menu.offsetWidth || 200);
    const height = menu.offsetHeight || 180;
    const leftBase = anchorRect ? anchorRect.right - hostRect.left - width : 10;
    const topBase = anchorRect ? anchorRect.top - hostRect.top - height - 4 : 10;
    menu.style.left = `${Math.max(10, Math.min(leftBase, Math.max(10, hostRect.width - width - 10)))}px`;
    menu.style.top = `${Math.max(10, Math.min(topBase, Math.max(10, hostRect.height - height - 10)))}px`;

    const outsideClick = (event) => {
      if (anchor && anchor.contains(event.target)) return;
      if (this.profileMenu && !this.profileMenu.contains(event.target)) this.#closeProfileMenu();
    };
    const escapeKey = (event) => {
      if (event.key === "Escape") this.#closeProfileMenu();
    };
    this.profileMenuCleanup = () => {
      document.removeEventListener("click", outsideClick, true);
      document.removeEventListener("keydown", escapeKey, true);
    };
    window.setTimeout(() => {
      document.addEventListener("click", outsideClick, true);
      document.addEventListener("keydown", escapeKey, true);
    }, 0);
  }

  #openPresentMenu(anchor) {
    this.#closeProfileMenu();
    const host = this.#popupHost();
    const menu = document.createElement("ul");
    menu.className = "ui-menu ui-widget ui-widget-content popupMenuList presentSourceMenu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("data-role", "present-source-menu");
    menu.innerHTML = [
      this.#profileMenuItem("present:camera", "fa fa-video-camera", "Camera"),
      this.#profileMenuItem("present:canvas", "fa fa-pencil-square", "Scratchpad"),
      this.#profileMenuItem("present:desktop", "fa fa-desktop", "Screen")
    ].join("");
    menu.addEventListener("click", (event) => {
      const item = event.target instanceof Element ? event.target.closest("[data-menu-action]") : null;
      if (!item) return;
      const action = item.getAttribute("data-menu-action") || "";
      if (!action.startsWith("present:")) return;
      const source = action.slice("present:".length);
      this.#selectPresentSource(source);
      this.#closeProfileMenu();
    });
    host.appendChild(menu);
    this.profileMenu = menu;
    const anchorRect = anchor?.getBoundingClientRect?.();
    const hostRect = host.getBoundingClientRect?.() || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const width = Math.max(180, menu.offsetWidth || 180);
    const height = menu.offsetHeight || 120;
    const leftBase = anchorRect ? anchorRect.right - hostRect.left - width : 10;
    const topBase = anchorRect ? anchorRect.top - hostRect.top - height - 4 : 10;
    menu.style.left = `${Math.max(10, Math.min(leftBase, Math.max(10, hostRect.width - width - 10)))}px`;
    menu.style.top = `${Math.max(10, Math.min(topBase, Math.max(10, hostRect.height - height - 10)))}px`;

    const outsideClick = (event) => {
      if (anchor && anchor.contains(event.target)) return;
      if (this.profileMenu && !this.profileMenu.contains(event.target)) this.#closeProfileMenu();
    };
    const escapeKey = (event) => {
      if (event.key === "Escape") this.#closeProfileMenu();
    };
    this.profileMenuCleanup = () => {
      document.removeEventListener("click", outsideClick, true);
      document.removeEventListener("keydown", escapeKey, true);
    };
    window.setTimeout(() => {
      document.addEventListener("click", outsideClick, true);
      document.addEventListener("keydown", escapeKey, true);
    }, 0);
  }

  #selectPresentSource(source) {
    const video = this.root.querySelector("#line-1-VideoCall");
    const audio = this.root.querySelector("#line-1-AudioCall");
    const scratchpad = this.root.querySelector("#line-1-scratchpad-container");
    const share = this.root.querySelector("#line-1-sharevideo");
    if (video) video.style.display = "";
    if (audio) audio.style.display = "none";
    if (scratchpad) scratchpad.style.display = source === "canvas" ? "" : "none";
    if (share) share.style.display = source === "desktop" ? "" : "none";
    this.renderer.setStatus(source === "camera" ? "Camera selected" : source === "canvas" ? "Scratchpad selected" : "Screen selected");
  }

  #deleteDialDigit() {
    const dialText = this.root.querySelector("#dialText");
    if (!dialText) return;
    const value = String(dialText.value || "");
    dialText.value = value.slice(0, Math.max(0, value.length - 1));
    this.#syncDialDeleteKeyState();
    dialText.focus();
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
    this.#setBottomTabsVisible(true);
    const host = this.root.querySelector("#actionArea");
    if (host) host.classList.remove("configOverlayPane");
    this.renderer.showTab(safeTab);
    const regState = this.sdk.getRegistrationState?.() || {};
    this.renderer.setRegistrationState({
      ...regState,
      user: this.#registrationDisplayUser(regState.user)
    });
    this.#renderTabContent(safeTab);
    this.#applyLanguageToStaticLabels();
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
    if (key === "dnd") {
      this.renderer.dndActive = !!this.dialpadToggles.dnd;
      const regState = this.sdk.getRegistrationState?.() || {};
      this.renderer.setRegistrationState({
        ...regState,
        user: this.#registrationDisplayUser(regState.user)
      });
      this.renderer.setStatus(this.dialpadToggles.dnd ? this.#t("doNotDisturb") : this.#t("online"));
      return;
    }
    this.renderer.setStatus(`${key.toUpperCase()} ${this.dialpadToggles[key] ? "On" : "Off"}`);
  }

  #bindDialpadInputState() {
    const dialText = this.root.querySelector("#dialText");
    if (!dialText) return;
    dialText.setAttribute("maxlength", String(this.#maxDidLength()));
    if (dialText.dataset.vphoneInputBound === "1") {
      dialText.value = this.#clampDialValue(dialText.value);
      this.#syncDialDeleteKeyState();
      return;
    }
    dialText.dataset.vphoneInputBound = "1";
    dialText.addEventListener("input", () => {
      dialText.value = this.#clampDialValue(dialText.value);
      this.#syncDialDeleteKeyState();
    });
    dialText.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      void this.call({ video: !!event.ctrlKey && this.enableVideoCalling });
    });
    dialText.value = this.#clampDialValue(dialText.value);
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
        if (String(dialText.value || "").length >= this.#maxDidLength()) return;
        dialText.value = this.#clampDialValue(`${dialText.value || ""}${digit}`);
        if (this.callConnected && typeof this.sdk.sendDTMF === "function") {
          this.sdk.sendDTMF(digit).catch(() => {});
        }
        this.#syncDialDeleteKeyState();
        dialText.focus();
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
    host.classList.add("dialpadMode");
    host.classList.remove("mobilePaneEmpty");
    host.innerHTML = `
      <div class="dialScreenMobile">
        <div class="dialInputRow">
          <span class="dialInputSpacer" aria-hidden="true"></span>
          <input id="dialText" class="dialTextInput" type="tel" inputmode="tel" autocomplete="off" value="" data-role="number-input" placeholder="" maxlength="${this.#maxDidLength()}">
          <button type="button" id="dialDeleteKey" class="roundButtons dialDeleteBtn" aria-label="Backspace"><i class="fa fa-long-arrow-left"></i></button>
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
            <td><button type="button" class="dialButtons" data-dial-digit="*"><div>*</div><span>&nbsp;</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="0"><div>0</div><span>+</span></button></td>
            <td><button type="button" class="dialButtons" data-dial-digit="#"><div>#</div><span>&nbsp;</span></button></td>
          </tr>
        </table>
        <div class="dialActionsRow">
          <button type="button" id="dialAudio" class="dialButtons dialButtonsDial" title="${escapeHtml(this.#t("audioCall"))}"><i class="fa fa-phone"></i></button>
          ${this.enableVideoCalling ? `<button type="button" id="dialVideo" class="dialButtons dialButtonsDial" title="${escapeHtml(this.#t("videoCall"))}"><i class="fa fa-video-camera"></i></button>` : ""}
        </div>
        <div id="dialpad-setting-toggles" class="dialpadSettingToggles">
          <button id="dialpad-toggle-auto" title="${escapeHtml(this.#t("autoAnswer"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.auto ? "toggleOn" : "toggleOff"}"><i class="fa fa-phone"></i></button>
          <button id="dialpad-toggle-dnd" title="${escapeHtml(this.#t("doNotDisturb"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.dnd ? "toggleOn" : "toggleOff"}"><i class="fa fa-ban"></i></button>
          <button id="dialpad-toggle-cw" title="${escapeHtml(this.#t("callWaiting"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.cw ? "toggleOn" : "toggleOff"}"><i class="fa fa-volume-control-phone"></i></button>
          ${this.enableRecordAllCalls ? `<button id="dialpad-toggle-rec" title="${escapeHtml(this.#t("recordAllCalls"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.rec ? "toggleOn" : "toggleOff"}"><i class="fa fa-dot-circle-o"></i></button>` : ""}
        </div>
      </div>
    `;
    this.#bindDialpadInputState();
    this.#bindDialpadDigits();
    this.#applyFeatureVisibility();
  }

  #maxDidLength() {
    const raw = Number(this.config.MaxDidLength ?? this.#getDbItem("MaxDidLength", 24));
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 24;
  }

  #maxContactNameLength() {
    const raw = Number(this.config.MaxContactNameLength ?? this.#getDbItem("MaxContactNameLength", 64));
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 64;
  }

  #clampDialValue(value) {
    return String(value || "").replace(/[^\d*#+]/g, "").slice(0, this.#maxDidLength());
  }

  #renderContacts() {
    const host = this.root.querySelector("#myContacts");
    if (!host) return;
    this.contacts = this.#loadContactsFromStorage();
    const filter = String(this.tabSearch.contacts || "").trim().toLowerCase();
    const rows = this.contacts.filter((c) => !filter || c.name.toLowerCase().includes(filter) || c.number.includes(filter));
    if (rows.length === 0) {
      host.classList.add("mobilePaneEmpty");
      host.innerHTML = `<div class="mobileEmptyState">
        <div class="mobileEmptyIcon" aria-hidden="true"><i class="fa fa-address-book-o"></i></div>
        <p class="mobileEmptyTitle">${escapeHtml(this.#t("noContacts"))}</p>
        <button type="button" class="mobileEmptyCta" data-action="add-contact">${escapeHtml(this.#t("addContactCta"))}</button>
      </div>`;
      return;
    }
    host.classList.remove("mobilePaneEmpty");
    host.innerHTML = rows
      .map((c) => `<div id="contact-${escapeHtml(c.id)}" class="buddy contactCompact enterpriseContactItem" data-contact-id="${escapeHtml(c.id)}" data-dial-number="${escapeHtml(c.number)}">
        <div class="contactCompactTop">
          <div class="contactCompactName" style="user-select:text">${escapeHtml(c.name)}</div>
          <div class="contactCompactActions">
            <button type="button" class="roundButtons contactActionCall" title="${escapeHtml(this.#t("callAction"))}"${c.number ? "" : " disabled"}><i class="fa fa-phone"></i></button>
            <button type="button" class="roundButtons contactMenuBtn" title="${escapeHtml(this.#t("contactMenu"))}" aria-haspopup="menu" aria-expanded="false"><i class="fa fa-ellipsis-v"></i></button>
          </div>
        </div>
        <div class="contactCompactNumber" style="user-select:text">${escapeHtml(c.number)}</div>
        <div class="contactOverflowMenu" hidden role="menu">
          <button type="button" class="contactMenuItem contactActionEdit" role="menuitem"><i class="fa fa-pencil"></i><span>${escapeHtml(this.#t("edit"))}</span></button>
          <button type="button" class="contactMenuItem contactActionDelete" role="menuitem"><i class="fa fa-trash"></i><span>${escapeHtml(this.#t("delete"))}</span></button>
        </div>
      </div>`)
      .join("");
  }

  #recentGroupKey(row) {
    const numberKey = normalizeNumber(row?.number || "");
    if (numberKey) return `n:${numberKey}`;
    return `name:${String(row?.name || "").trim().toLowerCase()}`;
  }

  #groupRecents(rows) {
    const groups = [];
    for (const row of rows) {
      const groupKey = this.#recentGroupKey(row);
      const prev = groups[groups.length - 1];
      // Consecutive same contact within the same day → one row (mobile dialer style).
      if (prev && prev.groupKey === groupKey && prev.dayKey === row.dayKey) {
        prev.calls.push(row);
        prev.count += 1;
        prev.totalBillsec = (prev.totalBillsec || 0) + (Number(row.billsec) || 0);
        prev.durationLabel = prev.totalBillsec > 0
          ? this.#formatBillsec(prev.totalBillsec)
          : (row.billsecLabel || prev.durationLabel || "00:00");
        continue;
      }
      const billsec = Number(row.billsec) || 0;
      groups.push({
        ...row,
        groupKey,
        calls: [row],
        count: 1,
        totalBillsec: billsec,
        durationLabel: billsec > 0 ? this.#formatBillsec(billsec) : (row.billsecLabel || "00:00"),
        expanded: !!this.recentExpandedById[row.id]
      });
    }
    return groups;
  }

  #isNumberInContacts(number) {
    const key = normalizeNumber(number);
    if (!key) return false;
    return this.#buildContactLookup().has(key);
  }

  async #copyTextToClipboard(text) {
    const value = normalizeText(text);
    if (!value) return false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      // fall through to execCommand
    }
    try {
      const input = document.createElement("textarea");
      input.value = value;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      const ok = document.execCommand("copy");
      input.remove();
      return !!ok;
    } catch {
      return false;
    }
  }

  #showToast(message, { tone = "success", durationMs = 1800 } = {}) {
    const text = normalizeText(message);
    if (!text) return;
    const phone = this.root.querySelector("#Phone") || this.root;
    if (!phone) return;
    let host = phone.querySelector("#vphoneToastHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "vphoneToastHost";
      host.className = "vphoneToastHost";
      phone.appendChild(host);
    }
    host.querySelectorAll(".vphoneToast").forEach((el) => el.remove());
    const toast = document.createElement("div");
    toast.className = `vphoneToast ${tone === "error" ? "isError" : "isSuccess"}`;
    toast.setAttribute("role", "status");
    toast.textContent = text;
    host.appendChild(toast);
    window.requestAnimationFrame(() => toast.classList.add("isVisible"));
    window.setTimeout(() => {
      toast.classList.remove("isVisible");
      window.setTimeout(() => toast.remove(), 220);
    }, Math.max(800, Number(durationMs) || 1800));
  }

  /** Right-side duration/status for a single CDR (mobile dialer style). */
  #recentCallSideLabel(call) {
    if (call?.billsecLabel) {
      return { text: call.billsecLabel, tone: "" };
    }
    if (call?.statusClass === "callMissed") {
      return {
        text: this.#t("you_missed_a_call") || "You missed a call",
        tone: "isMissed"
      };
    }
    if (call?.statusClass === "callOut" && call?.statusText) {
      return { text: call.statusText, tone: "isStatus" };
    }
    return { text: "00:00", tone: "" };
  }

  #renderRecents() {
    const host = this.root.querySelector("#actionArea");
    if (!host) return;
    this.recents = this.#loadRecentsFromStorage();
    const filter = String(this.tabSearch.recents || "").trim().toLowerCase();
    const filtered = this.recents.filter((r) => !filter || r.name.toLowerCase().includes(filter) || r.number.includes(filter));
    const rows = this.#groupRecents(filtered);
    this.recentGroups = rows;
    if (rows.length === 0) {
      host.classList.add("mobilePaneEmpty");
      host.classList.remove("dialpadMode");
      host.innerHTML = `<div class="mobileEmptyState">
        <div class="mobileEmptyIcon" aria-hidden="true"><i class="fa fa-history"></i></div>
        <p class="mobileEmptyTitle">${escapeHtml(this.#t("noRecentCalls"))}</p>
      </div>`;
      return;
    }
    host.classList.remove("mobilePaneEmpty");
    host.classList.remove("dialpadMode");
    host.innerHTML = `<div class="recentFlatList">${rows
      .map((r, index) => {
        const countLabel = r.count > 1 ? ` <span class="recentCallCount">(${r.count})</span>` : "";
        const showAddContact = !!r.number && !this.#isNumberInContacts(r.number);
        // Collapsed row always mirrors the newest call — never borrow older durations
        // when the latest entry is missed / busy / no-answer.
        const summarySide = this.#recentCallSideLabel(r.calls?.[0] || r);
        const timeline = r.calls.map((call) => {
          const side = this.#recentCallSideLabel(call);
          return `
          <div class="recentTimelineItem">
            <span class="recentTimelineIcon recentDirectionIcon ${escapeHtml(call.statusClass)}" title="${escapeHtml(call.statusText)}">${recentDirectionSvg(call.statusClass)}</span>
            <span class="recentTimelineTime">${escapeHtml(call.timeLabel)}</span>
            <span class="recentTimelineDuration ${escapeHtml(side.tone)}">${escapeHtml(side.text)}</span>
          </div>`;
        }).join("");
        return `${index === 0 || rows[index - 1]?.dayKey !== r.dayKey ? `<div class="recentDayDivider">${escapeHtml(r.dayLabel)}</div>` : ""}<div class="recentCallItem enterpriseRecentItem${r.expanded ? " expanded" : ""}" data-recent-id="${escapeHtml(r.id)}" data-dial-number="${escapeHtml(r.number || "")}">
        <div class="recentCallSummary">
          <div class="recentCallAvatar recentDirectionAvatar ${escapeHtml(r.statusClass)}" title="${escapeHtml(r.statusText)}">${recentDirectionSvg(r.statusClass)}</div>
          <div class="recentCallInfo contactCompactMain">
            <div class="recentCallName contactCompactName" style="user-select:text">${escapeHtml(r.name)}${countLabel}</div>
          </div>
          <div class="recentSummaryDuration ${escapeHtml(summarySide.tone)}">${escapeHtml(summarySide.text)}</div>
        </div>
        <div class="recentCallExpanded" style="display:${r.expanded ? "block" : "none"}">
          ${r.number ? `<div class="recentExpandedNumber" style="user-select:text">${escapeHtml(r.number)}</div>` : ""}
          <div class="recentExpandedActions">
            <button type="button" class="recentTextAction recentActionCall"${r.number ? "" : " disabled"}><i class="fa fa-phone"></i><span>${escapeHtml(this.#t("callAction"))}</span></button>
            ${showAddContact ? `<button type="button" class="recentTextAction recentActionAdd"><i class="fa fa-user-plus"></i><span>${escapeHtml(this.#t("addContactAction"))}</span></button>` : ""}
            <button type="button" class="recentTextAction recentActionCopy"${r.number ? "" : " disabled"}><i class="fa fa-clone"></i><span>${escapeHtml(this.#t("copyNumber"))}</span></button>
            <button type="button" class="recentTextAction recentActionDelete"><i class="fa fa-trash"></i><span>${escapeHtml(this.#t("delete"))}</span></button>
          </div>
          <div class="recentTimeline">${timeline}</div>
        </div>
      </div>`;
      })
      .join("")}</div>`;
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
      const item = (this.recentGroups || []).find((r) => r.id === id)
        || this.recents.find((r) => r.id === id);
      if (!item) return;

      if (target.closest(".recentActionDelete")) {
        event.stopPropagation();
        const groupCalls = Array.isArray(item.calls) && item.calls.length ? item.calls : [item];
        this.#confirmInPanel({
          message: groupCalls.length > 1 ? this.#t("confirmDeleteRecentGroup") : this.#t("confirmDeleteRecent"),
          confirmText: this.#t("delete"),
          onConfirm: () => {
            this.#deleteRecentGroup(groupCalls);
            delete this.recentExpandedById[id];
            this.#renderRecents();
            this.renderer.setStatus(this.#t("recentDeleted"));
          }
        });
        return;
      }
      if (target.closest(".recentActionAdd")) {
        event.stopPropagation();
        this.#showAddContactPanel(item.number, item.name);
        return;
      }
      if (target.closest(".recentActionCopy")) {
        event.stopPropagation();
        if (!item.number) return;
        const copyBtn = target.closest(".recentActionCopy");
        void this.#copyTextToClipboard(item.number).then((ok) => {
          if (!ok) {
            this.#showToast(this.#t("copyNumber"), { tone: "error" });
            return;
          }
          this.#showToast(this.#t("numberCopied"));
          if (copyBtn instanceof HTMLElement) {
            const label = copyBtn.querySelector("span");
            const prev = label?.textContent || this.#t("copyNumber");
            if (label) label.textContent = this.#t("numberCopied");
            copyBtn.classList.add("isCopied");
            window.setTimeout(() => {
              if (label) label.textContent = prev;
              copyBtn.classList.remove("isCopied");
            }, 1600);
          }
        });
        return;
      }
      if (target.closest(".recentActionCall")) {
        event.stopPropagation();
        if (!item.number) return;
        this.#switchTab("dialpad");
        const dial = this.root.querySelector("#dialText");
        if (dial) dial.value = item.number;
        void this.call({ video: false });
        return;
      }
      // Whole row toggles accordion (no Call button on collapsed row).
      const next = !item.expanded;
      this.recentExpandedById = {};
      item.expanded = next;
      if (next) this.recentExpandedById[id] = true;
      this.#renderRecents();
    });
  }

  #closeAllContactMenus(exceptRow = null) {
    const host = this.root.querySelector("#myContacts");
    if (!host) return;
    host.querySelectorAll(".enterpriseContactItem").forEach((item) => {
      if (exceptRow && item === exceptRow) return;
      item.classList.remove("menuOpen");
      const menu = item.querySelector(".contactOverflowMenu");
      if (menu) menu.hidden = true;
      const btn = item.querySelector(".contactMenuBtn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  #bindContactExpandedActions() {
    const host = this.root.querySelector("#myContacts");
    if (!host) return;
    if (host.dataset.vphoneContactsBound === "1") return;
    host.dataset.vphoneContactsBound = "1";
    host.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const row = target.closest(".enterpriseContactItem");
      if (!row) {
        this.#closeAllContactMenus();
        return;
      }
      const id = row.getAttribute("data-contact-id") || "";
      const number = row.getAttribute("data-dial-number") || "";

      if (target.closest(".contactActionCall")) {
        event.stopPropagation();
        this.#closeAllContactMenus();
        if (!number) return;
        this.#switchTab("dialpad");
        const dial = this.root.querySelector("#dialText");
        if (dial) dial.value = this.#clampDialValue(number);
        void this.call({ video: false });
        return;
      }
      if (target.closest(".contactMenuBtn")) {
        event.stopPropagation();
        const menu = row.querySelector(".contactOverflowMenu");
        const btn = row.querySelector(".contactMenuBtn");
        const willOpen = !!(menu && menu.hidden);
        this.#closeAllContactMenus(willOpen ? row : null);
        if (!menu || !btn) return;
        menu.hidden = !willOpen;
        row.classList.toggle("menuOpen", willOpen);
        btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
        return;
      }
      if (target.closest(".contactActionEdit")) {
        event.stopPropagation();
        this.#closeAllContactMenus();
        const item = this.contacts.find((contact) => contact.id === id);
        this.#showAddContactPanel(item?.number || number, item?.name || "", { contactId: id });
        return;
      }
      if (target.closest(".contactActionDelete")) {
        event.stopPropagation();
        this.#closeAllContactMenus();
        this.#confirmInPanel({
          message: this.#t("confirmDeleteContact"),
          confirmText: this.#t("delete"),
          onConfirm: () => {
            this.#deleteContactById(id);
            this.contacts = this.#loadContactsFromStorage();
            this.#renderContacts();
          }
        });
        return;
      }
      this.#closeAllContactMenus();
    });
    if (!this._contactMenuDocBound) {
      this._contactMenuDocBound = true;
      document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.closest("#myContacts")) return;
        this.#closeAllContactMenus();
      });
    }
  }

  #deleteContactById(contactId) {
    if (!contactId) return;
    const collection = this.#loadBuddyCollection();
    collection.DataCollection = collection.DataCollection.filter((item) => normalizeText(item.cID || item.uID || item.gID) !== contactId);
    this.#saveBuddyCollection(collection);
  }

  #handleClearTab(tabName) {
    const tab = tabName || this.activeTab;
    if (tab !== "recents" && tab !== "contacts") {
      this.renderer.setStatus("Clear tab");
      return;
    }
    this.#confirmInPanel({
      message: tab === "recents" ? this.#t("confirmClearRecents") : this.#t("confirmClearContacts"),
      confirmText: this.#t("delete"),
      onConfirm: () => {
        if (tab === "recents") {
          this.#clearAllRecents();
          this.recents = [];
          this.#renderRecents();
          this.renderer.setStatus(this.#t("recentsCleared"));
          return;
        }
        this.#clearAllContacts();
        this.contacts = [];
        this.#renderContacts();
        this.renderer.setStatus(this.#t("contactsCleared"));
      }
    });
  }

  #applySavedAudioPreferences() {
    const noise = this.#getDbItem("NoiseSuppression", "1") !== "0";
    const echo = this.#getDbItem("EchoCancellation", "1") !== "0";
    const agc = this.#getDbItem("AutoGainControl", "1") !== "0";
    try {
      this.sdk?.core?.media?.setAudioProcessing?.({
        noiseSuppression: noise,
        echoCancellation: echo,
        autoGainControl: agc
      });
    } catch {
      // ignore
    }
    const micId = this.#getDbItem("AudioSrcId", "");
    const spkId = this.#getDbItem("AudioOutputId", "");
    if (micId) {
      try { this.sdk?.core?.media && (this.sdk.core.media.preferredDeviceIds.audioinput = micId); } catch { /* ignore */ }
    }
    if (spkId) {
      try { this.sdk?.core?.media && (this.sdk.core.media.preferredDeviceIds.audiooutput = spkId); } catch { /* ignore */ }
    }
  }

  #resolveRingtoneUrl() {
    const media = this.config.MediaConfig || {};
    if (media.ringtone) return String(media.ringtone);
    if (typeof window !== "undefined" && window.__VPhoneRingtoneUrl) {
      return String(window.__VPhoneRingtoneUrl);
    }
    try {
      if (typeof document !== "undefined") {
        return new URL("./media/Ringtone.mp3", document.baseURI || window.location.href).href;
      }
    } catch {
      // ignore
    }
    return "";
  }

  #startFallbackRinger() {
    this.#stopFallbackRinger();
    if (typeof window === "undefined") return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    let ctx;
    try {
      ctx = new Ctx();
    } catch {
      return;
    }
    const beep = () => {
      if (!this._ringtoneFallbackTimer) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.value = 0.08;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } catch {
        // ignore
      }
    };
    beep();
    this._ringtoneFallbackTimer = window.setInterval(beep, 900);
    this._ringtoneFallbackCtx = ctx;
  }

  #stopFallbackRinger() {
    if (this._ringtoneFallbackTimer) {
      clearInterval(this._ringtoneFallbackTimer);
      this._ringtoneFallbackTimer = null;
    }
    if (this._ringtoneFallbackCtx) {
      try { this._ringtoneFallbackCtx.close(); } catch { /* ignore */ }
      this._ringtoneFallbackCtx = null;
    }
  }

  #startRingtone() {
    this.#stopRingtone();
    // Ringtone is always enabled — hosts must not disable inbound ring via config.
    if (this.dialpadToggles?.dnd) return;
    const url = this.#resolveRingtoneUrl();
    if (!url || typeof Audio === "undefined") {
      this.#startFallbackRinger();
      return;
    }
    try {
      const audio = new Audio(url);
      audio.loop = true;
      audio.preload = "auto";
      const ringId = this.#getDbItem("RingOutputId", "");
      if (ringId && typeof audio.setSinkId === "function") {
        audio.setSinkId(ringId).catch(() => {});
      }
      this._ringtoneAudio = audio;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          this.#stopRingtoneAudioElement();
          this.#startFallbackRinger();
        });
      }
    } catch {
      this.#startFallbackRinger();
    }
  }

  #stopRingtoneAudioElement() {
    if (!this._ringtoneAudio) return;
    try {
      this._ringtoneAudio.pause();
      this._ringtoneAudio.src = "";
    } catch {
      // ignore
    }
    this._ringtoneAudio = null;
  }

  #stopRingtone() {
    this.#stopRingtoneAudioElement();
    this.#stopFallbackRinger();
  }

  #getDbItem(itemIndex, defaultValue) {
    if (!this.localDB) return defaultValue;
    const value = this.localDB.getItem(itemIndex);
    return value === null ? defaultValue : value;
  }

  #normalizeLanguage(value) {
    const selected = normalizeText(value || "vi").toLowerCase();
    // Only English and Vietnamese are shipped; map legacy "auto"/others to vi.
    if (selected === "en" || selected === "english") return "en";
    return "vi";
  }

  async #loadLanguagePack(language) {
    const lang = this.#normalizeLanguage(language);
    if (this.loadedLanguage === lang && this.langPack) return this.langPack;
    const embeddedPacks = globalThis.__VPhoneLangPacks || globalThis.__VphoneLangPacks || null;
    const embedded = embeddedPacks && (embeddedPacks[lang] || embeddedPacks[String(lang || "").toLowerCase()]);
    if (embedded && typeof embedded === "object") {
      this.langPack = embedded;
      this.loadedLanguage = lang;
      return this.langPack;
    }
    try {
      const base = typeof import.meta !== "undefined" && import.meta && import.meta.url;
      if (typeof base !== "string" || !/^(https?:|file:|blob:|chrome-extension:|app:)/i.test(base)) {
        throw new Error("No module base URL");
      }
      const response = await fetch(new URL(`../assets/lang/${encodeURIComponent(lang)}.json`, base));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.langPack = await response.json();
      this.loadedLanguage = lang;
    } catch {
      this.langPack = {};
      this.loadedLanguage = lang;
    }
    return this.langPack;
  }

  #t(key) {
    const legacyKey = LEGACY_LANG_KEYS[key] || key;
    const fromJson = this.langPack && this.langPack[legacyKey];
    if (fromJson !== undefined && fromJson !== null && String(fromJson) !== "") {
      const value = String(fromJson);
      if (key === "fullName" || key === "contactNumber1") return value.replace(/:\s*$/, "");
      return value;
    }
    const fallbackLang = this.language === "vi" ? "vi" : "en";
    return FALLBACK_TEXT[fallbackLang]?.[key] || FALLBACK_TEXT.en[key] || key;
  }

  #applyLanguageToStaticLabels() {
    const setTitle = (selector, key) => {
      const el = this.root.querySelector(selector);
      if (el) el.setAttribute("title", this.#t(key));
    };
    const setDataLabel = (selector, key) => {
      const el = this.root.querySelector(selector);
      if (el) el.setAttribute("data-label", this.#t(key));
    };
    this.renderer.statusOnlineLabel = this.#t("onlineShort");
    this.renderer.statusOfflineLabel = this.#t("offlineShort");
    this.renderer.statusRegisterFailedLabel = this.#t("registerFailedShort");
    this.renderer.statusDndLabel = this.#t("doNotDisturb");
    this.renderer.dndActive = !!this.dialpadToggles.dnd;
    setDataLabel("#tab-dialpad", "dialpad");
    setDataLabel("#tab-recents", "recents");
    setDataLabel("#tab-contacts", "contacts");
    setTitle("#dialAudio", "audioCall");
    setTitle("#dialVideo", "videoCall");
    setTitle("#dialpad-toggle-auto", "autoAnswer");
    setTitle("#dialpad-toggle-dnd", "doNotDisturb");
    setTitle("#dialpad-toggle-cw", "callWaiting");
    setTitle("#dialpad-toggle-rec", "recordAllCalls");
    const search = this.root.querySelector("#txtFindBuddy");
    if (search) search.setAttribute("placeholder", this.#t("searchPlaceholder"));
    const settings = this.root.querySelector("#SettingsMenu");
    if (settings) settings.setAttribute("title", this.#t("settings"));
    this.root.querySelectorAll("[data-action='more']").forEach((el) => el.setAttribute("title", this.#t("more")));
    this.root.querySelectorAll("[data-action='reg']").forEach((el) => el.setAttribute("title", this.#t("registration")));
    this.root.querySelectorAll("[data-action='clear-tab']").forEach((el) => el.setAttribute("title", this.#t("delete")));
    this.root.querySelectorAll("[data-action='add-contact']").forEach((el) => el.setAttribute("title", this.#t("add")));
    this.root.querySelectorAll("[data-action='focus-search']").forEach((el) => el.setAttribute("title", this.#t("searchPlaceholder")));
  }

  #applyFeatureVisibility() {
    const freeDial = this.root.querySelector("#BtnFreeDial");
    if (freeDial) {
      freeDial.style.display = this.enableFreeDial ? "" : "none";
      freeDial.disabled = !this.enableFreeDial;
    }
    // EnableSettings: header gear + mobile ellipsis ("more").
    const settingsBtn = this.root.querySelector("#SettingsMenu");
    if (settingsBtn) {
      if (this.settingsButtonVisible) {
        settingsBtn.style.removeProperty("display");
        settingsBtn.disabled = false;
      } else {
        settingsBtn.style.setProperty("display", "none", "important");
        settingsBtn.disabled = true;
      }
    }
    this.root.querySelectorAll('[data-action="more"]').forEach((el) => {
      if (this.settingsButtonVisible) {
        el.style.removeProperty("display");
        el.disabled = false;
      } else {
        el.style.setProperty("display", "none", "important");
        el.disabled = true;
      }
    });
  }

  #registrationDisplayUser(preferred) {
    // Always prefer the configured SIP extension over stale profileUserID in localStorage.
    const candidates = [
      this.config.Username,
      this.sdk?.getRegistrationState?.()?.user,
      preferred,
      this.profileUserID
    ];
    for (const value of candidates) {
      const text = String(value || "").trim();
      if (!text || text === "default") continue;
      return text;
    }
    return "";
  }

  #getBoolConfig(itemIndex, defaultValue) {
    if (this.config[itemIndex] !== undefined) {
      const configured = this.config[itemIndex];
      return configured === true || configured === 1 || configured === "1" || configured === "true";
    }
    const stored = this.#getDbItem(itemIndex, defaultValue ? "1" : "0");
    return stored === true || stored === 1 || stored === "1" || stored === "true";
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

        const recentStatus = this.#getRecentCallStatus(item);
        const billsec = Number(item.Billsec || item.billsec || 0) || 0;

        rows.push({
          id,
          identity,
          cdrId,
          name: display.primary,
          number: display.secondary || display.number || "",
          statusClass: recentStatus.statusClass,
          statusText: recentStatus.statusText,
          timeLabel: this.#formatRecentClock(item.ItemDate),
          dayKey: this.#formatRecentDayKey(item.ItemDate),
          dayLabel: this.#formatRecentDay(item.ItemDate),
          billsec,
          billsecLabel: billsec > 0 ? this.#formatBillsec(billsec) : "",
          timeStamp: this.#toEpoch(item.ItemDate),
          expanded: !!this.recentExpandedById[id]
        });
      }
    }

    rows.sort((a, b) => (a.timeStamp || 0) > (b.timeStamp || 0) ? -1 : 1);
    return rows;
  }

  #getRecentCallStatus(item) {
    const isOutbound = item.SrcUserId === this.profileUserID || item.CallDirection === "outbound";
    const billsec = Number(item.Billsec || item.billsec || 0) || 0;
    const reasonCode = Number(item.ReasonCode || item.reasonCode || 0) || 0;
    const reasonText = String(item.ReasonText || item.reasonText || "").toLowerCase();
    const terminate = String(item.Terminate || item.terminate || "");
    if (billsec > 0) {
      return {
        statusClass: isOutbound ? "callOut" : "callIn",
        statusText: isOutbound ? (this.#t("outgoing") || "Outgoing") : (this.#t("answered") || "Answered")
      };
    }

    if (reasonCode === 486 || reasonText.indexOf("busy") > -1) {
      return {
        statusClass: isOutbound ? "callOut" : "callMissed",
        statusText: this.#t("call_busy") || "Busy"
      };
    }

    if (isOutbound) {
      if (terminate === "us" || reasonCode === 487 || reasonText.indexOf("cancel") > -1) {
        return {
          statusClass: "callOut",
          statusText: this.#t("call_cancelled") || "Call Cancelled"
        };
      }
      if (reasonCode === 486 || reasonCode === 603 || reasonText.indexOf("reject") > -1 || reasonText.indexOf("decline") > -1) {
        return {
          statusClass: "callOut",
          statusText: this.#t("call_rejected") || "Call Rejected"
        };
      }
      return {
        statusClass: "callOut",
        statusText: this.#t("call_noanswer") || "No Answer"
      };
    }

    if (terminate === "them" && reasonCode === 0) {
      return {
        statusClass: "callMissed",
        statusText: this.#t("you_missed_a_call") || "You missed a call"
      };
    }

    return {
      statusClass: "callMissed",
      statusText: this.#t("you_missed_a_call") || "You missed a call"
    };
  }

  #parseRecentDate(itemDate) {
    const text = normalizeText(itemDate);
    if (!text) return null;
    const direct = new Date(text);
    if (!Number.isNaN(direct.getTime())) return direct;
    const cleaned = text.replace(/\s+UTC$/i, "").trim();
    const isoLike = cleaned.includes("T") ? cleaned : cleaned.replace(" ", "T");
    const withZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(isoLike) ? isoLike : `${isoLike}Z`;
    const parsed = new Date(withZone);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    return null;
  }

  #formatRecentClock(itemDate) {
    const parsed = this.#parseRecentDate(itemDate);
    if (!parsed) return "";
    const locale = this.language === "vi" ? "vi-VN" : undefined;
    return parsed.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  #formatRecentDay(itemDate) {
    const parsed = this.#parseRecentDate(itemDate);
    if (!parsed) return "";
    const today = new Date();
    const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayDiff = Math.round((startOf(today) - startOf(parsed)) / 86400000);
    if (dayDiff === 0) return this.#t("today");
    if (dayDiff === 1) return this.#t("yesterday");
    const locale = this.language === "vi" ? "vi-VN" : undefined;
    return parsed.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  #formatRecentDayKey(itemDate) {
    const parsed = this.#parseRecentDate(itemDate);
    if (!parsed) return normalizeText(itemDate) || "";
    return `${parsed.getFullYear()}-${parsed.getMonth() + 1}-${parsed.getDate()}`;
  }

  #formatBillsec(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remain = total % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(remain).padStart(2, "0");
    if (total >= 3600) return `${hh}:${mm}:${ss}`;
    return `${mm}:${ss}`;
  }

  #toEpoch(itemDate) {
    const parsed = this.#parseRecentDate(itemDate);
    return parsed ? parsed.getTime() : 0;
  }

  #saveRecentFromCurrentCall() {
    if (!this.localDB || !this.currentCallLog) return;
    const log = this.currentCallLog;
    const endedAt = new Date();
    const startedAt = log.startedAt instanceof Date ? log.startedAt : endedAt;
    const answeredAt = log.answeredAt instanceof Date ? log.answeredAt : null;
    const billsec = answeredAt ? Math.max(1, Math.round((endedAt.getTime() - answeredAt.getTime()) / 1000)) : 0;
    const storageKey = `${this.profileUserID || "default"}-stream`;
    const stream = safeJsonParse(this.localDB.getItem(storageKey), null) || { TotalRows: 0, DataCollection: [] };
    if (!Array.isArray(stream.DataCollection)) stream.DataCollection = [];
    const isOutbound = log.direction === "outgoing";
    const cdrId = `cdr-${startedAt.getTime()}-${Math.random().toString(16).slice(2)}`;
    const itemDate = startedAt.toISOString();
    stream.DataCollection.unshift({
      ItemType: "CDR",
      CdrId: cdrId,
      ItemDate: itemDate,
      SrcUserId: isOutbound ? this.profileUserID : normalizeText(log.number),
      DstUserId: isOutbound ? normalizeText(log.number) : this.profileUserID,
      Src: isOutbound ? this.profileUserID : normalizeText(log.name || log.number),
      SrcDid: isOutbound ? this.profileUserID : normalizeText(log.number),
      Dst: isOutbound ? normalizeText(log.name || log.number) : this.profileUserID,
      DstDid: isOutbound ? normalizeText(log.number) : this.profileUserID,
      CallDirection: isOutbound ? "outbound" : "inbound",
      Disposition: answeredAt ? "ANSWERED" : "MISSED",
      Billsec: billsec
    });
    stream.TotalRows = stream.DataCollection.length;
    this.localDB.setItem(storageKey, JSON.stringify(stream));
  }

  #deleteRecentById(recentId) {
    if (!this.localDB || !recentId) return;
    const item = this.recents.find((r) => r.id === recentId)
      || (this.recentGroups || []).flatMap((g) => g.calls || [g]).find((r) => r.id === recentId);
    if (!item) return;
    this.#deleteRecentGroup([item]);
  }

  #deleteRecentGroup(calls) {
    if (!this.localDB || !Array.isArray(calls) || !calls.length) return;
    const byIdentity = new Map();
    for (const call of calls) {
      if (!call?.identity || !call?.cdrId) continue;
      if (!byIdentity.has(call.identity)) byIdentity.set(call.identity, new Set());
      byIdentity.get(call.identity).add(normalizeText(call.cdrId));
    }
    for (const [identity, cdrIds] of byIdentity.entries()) {
      const storageKey = `${identity}-stream`;
      const stream = safeJsonParse(this.localDB.getItem(storageKey), null);
      if (!stream || !Array.isArray(stream.DataCollection)) continue;
      const before = stream.DataCollection.length;
      stream.DataCollection = stream.DataCollection.filter((entry) => {
        if (!entry || entry.ItemType !== "CDR") return true;
        return !cdrIds.has(normalizeText(entry.CdrId));
      });
      if (stream.DataCollection.length !== before) {
        stream.TotalRows = stream.DataCollection.length;
        this.localDB.setItem(storageKey, JSON.stringify(stream));
      }
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

  #addContact(name, number, { enableDuringDnd = false } = {}) {
    const parsedNumber = this.#clampDialValue(number);
    if (!parsedNumber) return;
    const collection = this.#loadBuddyCollection();
    const contactId = `c${Date.now()}`;
    const displayName = normalizeText(name).slice(0, this.#maxContactNameLength()) || parsedNumber;
    collection.DataCollection.push({
      Type: "contact",
      LastActivity: new Date().toISOString(),
      ExtensionNumber: "",
      MobileNumber: "",
      ContactNumber1: parsedNumber,
      ContactNumber2: "",
      uID: null,
      cID: contactId,
      gID: null,
      jid: null,
      DisplayName: displayName,
      Description: "",
      Email: "",
      MemberCount: 0,
      EnableDuringDnd: !!enableDuringDnd,
      Subscribe: false,
      SubscribeUser: null,
      AutoDelete: false
    });
    this.#saveBuddyCollection(collection);
  }

  #updateContact(contactId, name, number, { enableDuringDnd = false } = {}) {
    if (!contactId) return false;
    const parsedNumber = this.#clampDialValue(number);
    if (!parsedNumber) return false;
    const collection = this.#loadBuddyCollection();
    const displayName = normalizeText(name).slice(0, this.#maxContactNameLength()) || parsedNumber;
    let updated = false;
    collection.DataCollection = (collection.DataCollection || []).map((item) => {
      if (!item || item.Type !== "contact") return item;
      const id = normalizeText(item.cID || item.uID || item.gID);
      if (id !== contactId) return item;
      updated = true;
      return {
        ...item,
        ContactNumber1: parsedNumber,
        DisplayName: displayName,
        EnableDuringDnd: !!enableDuringDnd,
        LastActivity: new Date().toISOString()
      };
    });
    if (updated) this.#saveBuddyCollection(collection);
    return updated;
  }

  #promptAddContact() {
    this.#showAddContactPanel();
  }

  #hideAddContactSheet() {
    this.root.querySelector("#vphoneContactSheet")?.remove();
    this.editingContactId = "";
  }

  #showAddContactPanel(numberStr = "", nameStr = "", { contactId = "" } = {}) {
    this.returnTab = this.activeTab || "contacts";
    const editId = normalizeText(contactId);
    this.root.querySelector("#vphoneContactSheet")?.remove();
    this.editingContactId = editId;
    const isEdit = !!this.editingContactId;
    const maxName = this.#maxContactNameLength();
    const maxDid = this.#maxDidLength();
    const safeName = String(nameStr || "").slice(0, maxName);
    const safeNumber = this.#clampDialValue(numberStr);
    const phone = this.root.querySelector("#Phone") || this.root;
    const sheet = document.createElement("div");
    sheet.id = "vphoneContactSheet";
    sheet.className = "vphoneContactSheet";
    sheet.innerHTML = `
      <div class="vphoneContactSheetBackdrop" data-action="close-add-contact"></div>
      <div class="vphoneContactSheetPanel" role="dialog" aria-modal="true" aria-label="${escapeHtml(isEdit ? this.#t("edit") : this.#t("addContactTitle"))}">
        <div class="vphoneContactSheetHeader">
          <div class="vphoneContactSheetTitle">${escapeHtml(isEdit ? this.#t("edit") : this.#t("addContactTitle"))}</div>
        </div>
        <div class="vphoneContactSheetBody">
          <label class="vphoneContactField" for="AddSomeone_Name">
            <span class="vphoneContactLabel">${escapeHtml(this.#t("fullName"))} *</span>
            <input id="AddSomeone_Name" class="vphoneContactInput" type="text" autocomplete="name" maxlength="${maxName}" placeholder="${escapeHtml(this.#t("namePlaceholder"))}" value="${escapeHtml(safeName)}">
          </label>
          <label class="vphoneContactField" for="AddSomeone_Num1">
            <span class="vphoneContactLabel">${escapeHtml(this.#t("contactNumber1"))} *</span>
            <input id="AddSomeone_Num1" class="vphoneContactInput" type="tel" inputmode="tel" autocomplete="tel" maxlength="${maxDid}" placeholder="${escapeHtml(this.#t("numberPlaceholder"))}" value="${escapeHtml(safeNumber)}">
          </label>
          <div class="vphoneContactCheck">
            <input type="checkbox" id="AddSomeone_Dnd">
            <label for="AddSomeone_Dnd">${escapeHtml(this.#t("allowCallsOnDnd"))}</label>
          </div>
        </div>
        <div class="vphoneContactSheetActions">
          <button type="button" class="configSecondaryButton" id="AddSomeone_Cancel">${escapeHtml(this.#t("cancel"))}</button>
          <button type="button" class="configPrimaryButton" id="AddSomeone_Save">${escapeHtml(isEdit ? this.#t("saveContact") : this.#t("add"))}</button>
        </div>
      </div>`;
    phone.appendChild(sheet);
    const nameInput = sheet.querySelector("#AddSomeone_Name");
    const numberInput = sheet.querySelector("#AddSomeone_Num1");
    nameInput?.addEventListener("input", () => {
      nameInput.value = String(nameInput.value || "").slice(0, maxName);
    });
    numberInput?.addEventListener("input", () => {
      numberInput.value = this.#clampDialValue(numberInput.value);
    });
    sheet.querySelectorAll("[data-action='close-add-contact']").forEach((el) => {
      el.addEventListener("click", () => this.#hideAddContactSheet());
    });
    sheet.querySelector("#AddSomeone_Cancel")?.addEventListener("click", () => this.#hideAddContactSheet());
    sheet.querySelector("#AddSomeone_Save")?.addEventListener("click", () => this.#saveAddContactForm());
    window.setTimeout(() => nameInput?.focus(), 0);
  }

  #saveAddContactForm() {
    const name = String(this.root.querySelector("#AddSomeone_Name")?.value || "").slice(0, this.#maxContactNameLength());
    const number = this.#clampDialValue(this.root.querySelector("#AddSomeone_Num1")?.value || "");
    const numberInput = this.root.querySelector("#AddSomeone_Num1");
    if (numberInput) numberInput.value = number;
    if (!normalizeText(name) || !number) return;
    const enableDuringDnd = !!this.root.querySelector("#AddSomeone_Dnd")?.checked;
    const editingId = normalizeText(this.editingContactId);
    if (editingId) {
      this.#updateContact(editingId, name, number, { enableDuringDnd });
    } else {
      this.#addContact(name, number, { enableDuringDnd });
    }
    this.#hideAddContactSheet();
    this.contacts = this.#loadContactsFromStorage();
    this.activeTab = "contacts";
    this.renderer.showTab("contacts");
    this.#setBottomTabsVisible(true);
    this.#renderContacts();
    this.renderer.setStatus(editingId ? "Contact updated" : "Contact added");
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
      this.renderer.setRegistrationState({
        ...(state || {}),
        user: this.#registrationDisplayUser(state?.user)
      });
      this.renderer.setStatus(state?.online ? this.#t("online") : this.#t("offline"));
    } catch (err) {
      this.renderer.setStatus(`Register toggle failed: ${String(err?.message || err)}`);
    }
  }
}

export function createPhoneWidget({ root, config = {}, deps = {} } = {}) {
  const mountRoot = root || document.getElementById("Phone") || document.body;
  const normalizedConfig = normalizePhoneConfig(config);
  const sdk = deps.sdk || new PhoneSDK(normalizedConfig, deps);
  const ui = new PhoneUI({ root: mountRoot, sdk, config: normalizedConfig, deps });
  ui.mount();
  sdk.bindAudioElements?.({
    remoteEl: mountRoot.querySelector("[data-role='remote-media']"),
    localEl: mountRoot.querySelector("[data-role='local-media']")
  });

  const postToHost = (message) => {
    try {
      if (typeof window === "undefined") return;
      // Notify embedding parent (iframe) and same-window listeners.
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, "*");
      }
      window.postMessage(message, "*");
    } catch {
      // ignore
    }
  };

  const applyHostConfig = async (partial = {}) => {
    const next = normalizePhoneConfig(partial && typeof partial === "object" ? partial : {});
    Object.assign(ui.config, next);
    try { sdk.configure?.(next); } catch { /* ignore */ }
    // Respect intentional unregister (offline): update memory only until host/user registers again.
    if (sdk.core?._intentionallyUnregistered) return;
    try {
      const password = await sdk.hydrateSecrets?.();
      if (password) ui.config.Password = password;
      await sdk.register?.();
    } catch {
      // registration-changed already emitted as register-failed
    }
  };

  const onHostMessage = (event) => {
    const msg = event?.data;
    if (!msg || typeof msg !== "object") return;
    if (msg.action === "configure") {
      const data = msg.data && typeof msg.data === "object" ? msg.data : {};
      void applyHostConfig(data);
      return;
    }
    if (msg.action !== "makeCall") return;
    const data = msg.data && typeof msg.data === "object" ? msg.data : msg;
    void ui.makeCallFromHost(data).catch((err) => {
      ui.renderer?.setStatus?.(`Call failed: ${String(err?.message || err)}`);
    });
  };
  if (typeof window !== "undefined") {
    window.addEventListener("message", onHostMessage);
  }

  const hostUnsubs = [];
  const onHostEvent = (eventName, handler) => {
    sdk.on?.(eventName, handler);
    hostUnsubs.push(() => sdk.off?.(eventName, handler));
  };

  onHostEvent("registration-changed", ({ online, user, error, status, reason } = {}) => {
    const resolved = status || (online ? "online" : (reason === "unregistered" ? "offline" : "register-failed"));
    postToHost({
      type: "vphone-status",
      online: !!online,
      user: user || "",
      error: error || "",
      status: resolved,
      reason: reason || ""
    });
  });
  onHostEvent("incoming-call", (call = {}) => {
    postToHost({
      type: "vphone-call",
      payload: {
        phase: "incoming",
        from: call.from || "",
        displayName: call.displayName || "",
        number: call.number || "",
        headers: call.headers && typeof call.headers === "object" ? call.headers : {}
      }
    });
  });
  onHostEvent("outgoing-call", ({ target } = {}) => {
    postToHost({
      type: "vphone-call",
      payload: { phase: "outgoing", number: target || "", target: target || "" }
    });
  });
  onHostEvent("call-connected", (payload = {}) => {
    postToHost({
      type: "vphone-call",
      payload: { phase: "answered", direction: payload.direction || "" }
    });
  });
  onHostEvent("call-ended", () => {
    postToHost({
      type: "vphone-call",
      payload: { phase: "ended" }
    });
  });

  const ready = (async () => {
    try {
      const password = await sdk.hydrateSecrets?.();
      if (password) ui.config.Password = password;
    } catch {
      // Continue register even if secret hydration fails.
    }
    try {
      await sdk.register?.();
    } catch {
      if (!String(sdk.core?.config?.Password || ui.config?.Password || "").trim()) {
        postToHost({ type: "vphone-credentials-required" });
      }
    }
  })();
  return {
    sdk,
    ui,
    ready,
    configure: (partial) => applyHostConfig(partial),
    makeCall: (numberToDial, options = {}) => ui.makeCallFromHost({
      numberToDial,
      ...(options && typeof options === "object" ? options : {}),
      extraHeaders: Array.isArray(options) ? options : options?.extraHeaders
    }),
    getTabLeader: () => sdk.getTabLeader?.() || null,
    destroy() {
      try {
        if (typeof window !== "undefined") window.removeEventListener("message", onHostMessage);
      } catch {}
      for (const unsub of hostUnsubs) {
        try { unsub(); } catch { /* ignore */ }
      }
      hostUnsubs.length = 0;
      try { sdk.hangup?.(); } catch {}
      const tabLeader = sdk.getTabLeader?.();
      if (tabLeader) {
        try { tabLeader.destroy(); } catch {}
      } else {
        try { sdk.unregister?.(); } catch {}
      }
    }
  };
}
