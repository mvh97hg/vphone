import { PhoneSDK } from "../sdk/phone-sdk.js";

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
    camera: "Camera:",
    save: "Save",
    cancel: "Cancel",
    clearExtensionConfig: "Clear Extension Config",
    resetSettings: "Reset Settings",
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
    confirmClearRecents: "Delete all recent call history?",
    confirmClearContacts: "Delete all contacts?",
    recentsCleared: "Recents cleared",
    contactsCleared: "Contacts cleared",
    recentDeleted: "Recent deleted",
    noContacts: "No contacts",
    noRecentCalls: "No recent calls",
    answered: "Answered",
    missed: "Missed",
    outgoing: "Outgoing",
    incoming: "Incoming",
    secondsShort: "s",
    registerFailed: "Register failed",
    registering: "Registering",
    online: "Online",
    offline: "Offline",
    connected: "Connected",
    ended: "Ended",
    muted: "Muted",
    unmuted: "Unmuted",
    onHold: "On hold",
    resumed: "Resumed",
    fullName: "Full Name:",
    contactNumber1: "Contact Number 1:",
    allowCallsOnDnd: "Allow calls on DND",
    add: "Add",
    dialpad: "Dialpad",
    recents: "Recents",
    contacts: "Contacts",
    more: "More",
    registration: "Registration",
    answerCall: "Answer Call",
    rejectCall: "Reject Call",
    mute: "Mute",
    transferCall: "Transfer Call",
    cancelTransfer: "Cancel Transfer",
    conferenceCall: "Conference Call",
    cancelConference: "Cancel Conference",
    holdCall: "Hold Call",
    resumeCall: "Resume Call",
    endCall: "End Call",
    blindTransfer: "Blind Transfer",
    attendedTransfer: "Attended Transfer",
    completeTransfer: "Complete Transfer",
    call: "Call",
    cancelCall: "Cancel Call",
    joinConferenceCall: "Join Conference Call",
    deviceSettings: "Device Settings",
    sendDtmf: "Send DTMF",
    close: "Close"
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
    camera: "Camera:",
    save: "Lưu",
    cancel: "Hủy",
    clearExtensionConfig: "Xóa cấu hình máy nhánh",
    resetSettings: "Đặt lại cài đặt",
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
    confirmClearRecents: "Xóa toàn bộ lịch sử cuộc gọi gần đây?",
    confirmClearContacts: "Xóa toàn bộ danh bạ?",
    recentsCleared: "Đã xóa cuộc gọi gần đây",
    contactsCleared: "Đã xóa danh bạ",
    recentDeleted: "Đã xóa cuộc gọi gần đây",
    noContacts: "Không có liên hệ",
    noRecentCalls: "Không có cuộc gọi gần đây",
    answered: "Đã trả lời",
    missed: "Nhỡ",
    outgoing: "Gọi đi",
    incoming: "Gọi đến",
    secondsShort: "giây",
    registerFailed: "Đăng ký thất bại",
    registering: "Đang đăng ký",
    online: "Trực tuyến",
    offline: "Ngoại tuyến",
    connected: "Đã kết nối",
    ended: "Đã kết thúc",
    muted: "Đã tắt tiếng",
    unmuted: "Đã bật tiếng",
    onHold: "Đang giữ",
    resumed: "Đã tiếp tục",
    fullName: "Họ tên:",
    contactNumber1: "Số liên hệ 1:",
    allowCallsOnDnd: "Cho phép gọi khi DND",
    add: "Thêm",
    dialpad: "Bàn phím",
    recents: "Gần đây",
    contacts: "Danh bạ",
    more: "Thêm",
    registration: "Đăng ký",
    answerCall: "Trả lời",
    rejectCall: "Từ chối",
    mute: "Tắt tiếng",
    transferCall: "Chuyển cuộc gọi",
    cancelTransfer: "Hủy chuyển",
    conferenceCall: "Hội nghị",
    cancelConference: "Hủy hội nghị",
    holdCall: "Giữ cuộc gọi",
    resumeCall: "Tiếp tục",
    endCall: "Kết thúc",
    blindTransfer: "Chuyển ngay",
    attendedTransfer: "Chuyển có hỏi",
    completeTransfer: "Hoàn tất chuyển",
    call: "Gọi",
    cancelCall: "Hủy gọi",
    joinConferenceCall: "Tham gia hội nghị",
    deviceSettings: "Cài đặt thiết bị",
    sendDtmf: "Gửi DTMF",
    close: "Đóng"
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
  fullName: "full_name",
  contactNumber1: "contact_number_1",
  allowCallsOnDnd: "allow_calls_on_dnd",
  add: "add",
  dialpad: "mobile_tab_dialpad",
  recents: "mobile_tab_recents",
  contacts: "mobile_tab_contacts",
  answerCall: "answer_call",
  rejectCall: "reject_call",
  mute: "mute",
  transferCall: "transfer_call",
  cancelTransfer: "cancel_transfer",
  conferenceCall: "conference_call",
  cancelConference: "cancel_conference",
  holdCall: "hold_call",
  resumeCall: "resume_call",
  endCall: "end_call",
  blindTransfer: "blind_transfer",
  attendedTransfer: "attended_transfer",
  completeTransfer: "complete_transfer",
  call: "call",
  cancelCall: "cancel_call",
  joinConferenceCall: "join_conference_call",
  deviceSettings: "device_settings",
  sendDtmf: "send_dtmf",
  close: "close"
};

class UINotifications {
  constructor({ enabled = true } = {}) {
    this.enabled = enabled;
  }

  notifyIncomingCall(from) {
    if (!this.enabled) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    new Notification("Incoming call", {
      body: from ? `From ${from}` : "Incoming call"
    });
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

  setRegistrationState({ online, user, error } = {}) {
    const regText = this.root.querySelector("#mobileRegText");
    const regDot = this.root.querySelector("#mobileRegDot");
    const regLink = this.root.querySelector("#reglink");
    const deregLink = this.root.querySelector("#dereglink");
    const userCallId = this.root.querySelector("#UserCallID");
    const hasError = !!error;
    if (regText) regText.textContent = online ? "Online" : hasError ? "Reg Error" : "Offline";
    if (regDot) regDot.className = online ? "dotOnline" : "dotOffline";
    if (regLink) regLink.className = online ? "dotOnline" : "dotOffline";
    if (deregLink) deregLink.style.display = online ? "" : "none";
    if (userCallId && user) userCallId.textContent = user;
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

    if (this.refs.contactsTabHeader) this.refs.contactsTabHeader.style.display = "none";
    if (this.refs.myContacts) this.refs.myContacts.style.display = isContacts ? "" : "none";
    if (this.refs.actionArea) this.refs.actionArea.style.display = isContacts ? "none" : "";
    if (this.refs.searchArea) this.refs.searchArea.style.display = "none";
    this.renderMobileTopBar(t);

    if (this.refs.tabDialpad) this.refs.tabDialpad.classList.toggle("activeTab", isDialpad);
    if (this.refs.tabRecents) this.refs.tabRecents.classList.toggle("activeTab", t === "recents");
    if (this.refs.tabContacts) this.refs.tabContacts.classList.toggle("activeTab", isContacts);
  }

  showSearch(show) {
    if (!this.refs.searchArea) return;
    this.refs.searchArea.style.display = show ? "" : "none";
  }

  renderMobileTopBar(tabName) {
    if (!this.refs.mobileTopBar) return;
    const regLink =
      "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"reg\" title=\"Registration\">" +
      "<span class=\"mobileRegStatus\"><span id=\"mobileRegDot\" class=\"dotOffline\"></span>" +
      "<span id=\"mobileRegText\">Offline</span></span></button>";
    let actions = "";
    if (tabName === "recents") {
      actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"clear-tab\" data-tab=\"recents\" title=\"Delete\"><i class=\"fa fa-trash\"></i></button>";
    } else if (tabName === "contacts") {
      actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"add-contact\" title=\"Add\"><i class=\"fa fa-plus\"></i></button>";
      actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"clear-tab\" data-tab=\"contacts\" title=\"Delete\"><i class=\"fa fa-trash\"></i></button>";
    }
    actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"more\" title=\"More\"><i class=\"fa fa-ellipsis-v\"></i></button>";
    this.refs.mobileTopBar.innerHTML =
      "<div class=\"mobileTopBarInner\"><div class=\"mobileTopBarTitle\">" + regLink + "</div>" +
      "<div class=\"mobileTopBarActions\">" + actions + "</div></div>";
  }

  #ensureLegacyPhoneJsLayout() {
    if (this.root.querySelector("[data-role='number-input']")) return;
    this.root.innerHTML = `
      <div class="loading">
        <span class="fa fa-circle-o-notch fa-spin"></span>
      </div>
      <div id="Phone" class="pageContainer phoneStandalone phoneFrame250" style="max-width: 1240px;">
        <div id="leftContent" style="float:left; height:100%; width:100%" class="dialpadMode">
          <table id="leftContentTable" class="leftContentTable" style="height:100%; width:100%; border-left-width:0px; border-right-width:0px;" cellspacing="0" cellpadding="0">
            <tr>
              <td class="streamSection" style="height: 50px; box-sizing: border-box;">
                <div class="profileContainer">
                  <div class="contact" id="UserProfile" style="cursor: default; margin-bottom:5px;">
                    <span id="TxtVoiceMessages" class="voiceMessageNotifyer">0</span>
                    <div id="UserProfilePic" class="buddyIcon"></div>
                    <span class="settingsMenu">
                      <button class="roundButtons" id="BtnFreeDial" data-action="call" title="Call"><i class="fa fa-phone"></i></button>
                      <button class="roundButtons" id="SettingsMenu" title="Configure Extension"><i class="fa fa-cogs"></i></button>
                    </span>
                    <div class="contactNameText" style="margin-right: 0px;">
                      <span id="dereglink" class="dotOnline" style="display:none"></span>
                      <span id="reglink" class="dotOffline"></span>
                      <span id="UserCallID"></span>
                    </div>
                    <div class="presenceText">
                      <span id="regStatus" data-role="status">&nbsp;</span>
                      <span id="dndStatus"></span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr id="searchArea" style="display:none;">
              <td class="streamSection" style="height: 35px; box-sizing: border-box; padding-top: 3px; padding-bottom: 0px;">
                <span id="divFindBuddy" class="searchClean">
                  <input id="txtFindBuddy" type="text" autocomplete="none" data-role="number-input" style="width: calc(100% - 78px);" placeholder="Find someone...">
                </span>
                <button class="roundButtons" id="BtnFilter" style="margin-left:5px" title="Filter and Sort"><i class="fa fa-sliders"></i></button>
              </td>
            </tr>
            <tr id="contentAreaRow">
              <td class="streamSection" style="padding:0">
                <div id="mobileTopBar" class="mobileTopBar"></div>
                <div id="contactsTabHeader" class="contactsTabHeader" style="display:none;">
                  <span style="flex:1;">Contacts</span>
                  <button type="button" id="BtnCreateGroup" class="roundButtons" title="Create Group"><i class="fa fa-users"></i></button>
                </div>
                <div id="myContacts" class="contactArea cleanScroller" style="display:none;"></div>
                <div id="actionArea" style="" class="contactArea cleanScroller dialpadMode"></div>
              </td>
            </tr>
            <tr id="tabBarRow">
              <td class="streamSection" style="padding:0">
                <div id="bottomTabBar" class="mainTabBar">
                  <button type="button" id="tab-dialpad" class="mainTab activeTab" data-label="Dialpad"><i class="fa fa-th mainTabIcon"></i></button>
                  <button type="button" id="tab-recents" class="mainTab" data-label="Recents"><i class="fa fa-history mainTabIcon"></i></button>
                  <button type="button" id="tab-contacts" class="mainTab" data-label="Contacts"><i class="fa fa-address-book mainTabIcon"></i></button>
                </div>
              </td>
            </tr>
          </table>
        </div>
        <div id="rightContent" class="rightContent" style="margin-left:320px; height:100%; border-right-width:0px; display:none;"></div>
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
    this.notifications = new UINotifications();
    this.localDB = typeof window !== "undefined" ? window.localStorage : null;
    this.profileUserID = this.#getDbItem("profileUserID", this.config.profileUserID || this.config.SipUsername || this.config.SIPUSER || "default");
    this.profileName = this.#getDbItem("profileName", this.config.profileName || this.profileUserID || "");
    this.enableVideoCalling = this.#getBoolConfig("EnableVideoCalling", false);
    this.enableTransfer = this.#getBoolConfig("EnableTransfer", true);
    this.enableConference = this.#getBoolConfig("EnableConference", true);
    this.hideRecordAllCallsButton = this.#getBoolConfig("HideRecordAllCallsButton", false);
    this.disableFreeDial = this.#getBoolConfig("DisableFreeDial", false);
    this.language = this.#normalizeLanguage(this.#getDbItem("Language", this.config.Language || "auto"));
    this.langPack = {};
    this.dialpadToggles = { auto: false, cw: false, dnd: false, rec: false };
    this.activeTab = "dialpad";
    this.tabSearch = { contacts: "", recents: "", dialpad: "" };
    this.callConnected = false;
    this.recentExpandedById = {};
    this.contacts = this.#loadContactsFromStorage();
    this.recents = this.#loadRecentsFromStorage();
    this.profileMenu = null;
    this.returnTab = "dialpad";
    this.activeCall = null;
    this.currentCallLog = null;
  }

  mount() {
    bindControls(this.root, {
      onCall: () => this.call(),
      onCallAudio: () => this.call({ video: false }),
      onCallVideo: () => this.call({ video: true }),
      onAnswer: () => this.sdk.answer(),
      onHangup: () => this.sdk.hangup(),
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
      onDialpadToggle: ({ key } = {}) => this.#toggleDialpadSetting(key)
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
      const caller = this.#callLabel(call?.displayName || call?.from || "");
      this.activeCall = { direction: "incoming", from: call?.from || "", target: call?.from || "", displayName: call?.displayName || caller.name };
      this.currentCallLog = { direction: "incoming", number: caller.number || caller.name, name: caller.name, startedAt: new Date(), answeredAt: null };
      this.#renderIncomingCall(call);
      this.renderer.setStatus(this.#t("incoming"));
      this.notifications.notifyIncomingCall(call?.from);
    });
    this.sdk.on("outgoing-call", ({ target }) => {
      this.activeCall = { direction: "outgoing", target: target || "" };
      this.currentCallLog = { direction: "outgoing", number: target || "", name: target || "", startedAt: new Date(), answeredAt: null };
      this.#renderCallProgress(target);
      this.renderer.setStatus(`Calling ${target}`);
    });
    this.sdk.on("call-connected", (payload = {}) => {
      this.callConnected = true;
      this.activeCall = { ...(this.activeCall || {}), direction: payload.direction || this.activeCall?.direction || "active" };
      if (this.currentCallLog) this.currentCallLog.answeredAt = new Date();
      this.#renderActiveCall();
      this.renderer.setStatus(this.#t("connected"));
    });
    this.sdk.on("call-ended", () => {
      this.#saveRecentFromCurrentCall();
      this.callConnected = false;
      this.activeCall = null;
      this.currentCallLog = null;
      this.renderer.showTab(this.activeTab || "dialpad");
      this.#renderTabContent(this.activeTab || "dialpad");
      this.renderer.setStatus(this.#t("ended"));
    });
    this.sdk.on("mute-changed", ({ muted }) => this.renderer.setStatus(muted ? this.#t("muted") : this.#t("unmuted")));
    this.sdk.on("hold-changed", ({ onHold }) => this.renderer.setStatus(onHold ? this.#t("onHold") : this.#t("resumed")));
    this.sdk.on("local-stream", (stream) => this.renderer.attachMedia("local", stream));
    this.sdk.on("remote-stream", (stream) => this.renderer.attachMedia("remote", stream));
    this.sdk.on("registration-changed", ({ online, user, error } = {}) => {
      this.renderer.setRegistrationState({ online, user, error });
      if (online) this.renderer.setStatus("Online");
      else this.renderer.setStatus(error ? "Reg Error" : "Offline");
    });

    const regState = this.sdk.getRegistrationState?.();
    if (regState) this.renderer.setRegistrationState(regState);
    this.renderer.setStatus(this.#t("registering"));
    this.#applyFeatureVisibility();
    this.#applyLanguageToStaticLabels();
    this.#loadLanguagePack(this.language).then(() => {
      this.#applyLanguageToStaticLabels();
      this.#renderTabContent(this.activeTab || "dialpad");
    }).catch(() => {});
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

  #openProfileMenu(anchor) {
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
    menu.innerHTML = [
      this.#profileMenuItem("refresh", "fa fa-refresh", this.#t("refreshRegistration")),
      this.#profileMenuItem("configure", "fa fa-wrench", this.#t("configureExtension")),
      this.#profileMenuItem("settings", "fa fa-sliders", this.#t("settings"))
    ].join("");

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
    if (action === "refresh") {
      this.#refreshRegistration();
      return;
    }
    if (action === "configure") {
      this.#renderConfigExtension("extension");
      return;
    }
    if (action === "settings") {
      this.#renderConfigExtension("settings");
      return;
    }
  }

  async #refreshRegistration() {
    if (typeof this.sdk.unregister !== "function" || typeof this.sdk.register !== "function") {
      this.renderer.setStatus("Refresh registration not supported");
      return;
    }
    try {
      await this.sdk.unregister();
      const state = await this.sdk.register();
      this.renderer.setRegistrationState(state || this.sdk.getRegistrationState?.() || {});
      this.renderer.setStatus("Registration refreshed");
    } catch (err) {
      this.renderer.setStatus(`Refresh registration failed: ${String(err?.message || err)}`);
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
      ["auto", "Auto"],
      ["en", "English"],
      ["vi", "Tiếng Việt"],
      ["de", "Deutsch"],
      ["es", "Español"],
      ["fr", "Français"],
      ["ja", "日本語"],
      ["pt-br", "Português (Brasil)"],
      ["zh-hans", "简体中文"]
    ];
    const currentLanguage = this.#getDbItem("Language", this.config.Language || "auto");
    const deviceOptions = (items, fallback) => {
      const rows = items.length ? items : [{ deviceId: "", label: fallback }];
      return rows.map((d) => `<option value="${escapeHtml(d.deviceId)}">${escapeHtml(d.label || d.deviceId || fallback)}</option>`).join("");
    };
    const title = isLanguage ? this.#t("language") : isSettings ? this.#t("settings") : this.#t("configureExtension");
    const icon = isLanguage ? "fa-language" : isSettings ? "fa-sliders" : "fa-cogs";
    const accountHtml = isSettings || isLanguage ? "" : `
      <div id="Configure_Extension_Html">
        <div class="UiText">Asterisk Server Address: <span style="color:#dc2626; font-weight:700">*</span></div>
        <div><input id="Configure_Account_wssServer" class="UiInputText" type="text" value="${escapeHtml(this.config.wssServer || this.#getDbItem("wssServer", ""))}"></div>
        <div class="UiText">WebSocket Port: <span style="color:#dc2626; font-weight:700">*</span></div>
        <div><input id="Configure_Account_WebSocketPort" class="UiInputText" type="text" value="${escapeHtml(this.config.WebSocketPort || this.#getDbItem("WebSocketPort", ""))}"></div>
        <div class="UiText">WebSocket Path:</div>
        <div><input id="Configure_Account_ServerPath" class="UiInputText" type="text" value="${escapeHtml(this.config.ServerPath || this.#getDbItem("ServerPath", "/ws"))}"></div>
        <div class="UiText">Full Name (optional):</div>
        <div><input id="Configure_Account_profileName" class="UiInputText" type="text" value="${escapeHtml(this.profileName)}"></div>
        <div class="UiText">SIP Domain: <span style="color:#dc2626; font-weight:700">*</span></div>
        <div><input id="Configure_Account_SipDomain" class="UiInputText" type="text" value="${escapeHtml(this.config.SipDomain || this.#getDbItem("SipDomain", ""))}"></div>
        <div class="UiText">SIP Username: <span style="color:#dc2626; font-weight:700">*</span></div>
        <div><input id="Configure_Account_SipUsername" class="UiInputText" type="text" value="${escapeHtml(this.config.SipUsername || this.#getDbItem("SipUsername", ""))}"></div>
        <div class="UiText">SIP Password: <span style="color:#dc2626; font-weight:700">*</span></div>
        <div><input id="Configure_Account_SipPassword" class="UiInputText" type="password" value="${escapeHtml(this.config.SipPassword || this.#getDbItem("SipPassword", ""))}"></div>
        <div><input type="checkbox" id="Configure_Account_Voicemail_Subscribe"><label for="Configure_Account_Voicemail_Subscribe"> Subscribe voicemail</label></div>
      </div>`;
    const settingsHtml = isSettings ? `
      <div class="UiTextHeading"><i class="fa fa-video-camera UiTextHeadingIcon" style="background-color:#208e3c"></i> ${escapeHtml(this.#t("audioVideo"))}</div>
      <div id="Audio_Video_Html">
        <div class="UiText">${escapeHtml(this.#t("speaker"))}</div>
        <div><select id="playbackSrc" style="width:100%">${deviceOptions(spk, "(Default Speaker)")}</select></div>
        <div class="Settings_VolumeOutput_Container"><div id="Settings_SpeakerOutput" class="Settings_VolumeOutput"></div></div>
        <div><button class="roundButtons" id="preview_output_play"><i class="fa fa-play"></i></button></div>
        <div class="UiText">${escapeHtml(this.#t("ringDevice"))}</div>
        <div><select id="ringDevice" style="width:100%">${deviceOptions(spk, "(Default Ring Device)")}</select></div>
        <div class="Settings_VolumeOutput_Container"><div id="Settings_RingerOutput" class="Settings_VolumeOutput"></div></div>
        <div class="UiText">${escapeHtml(this.#t("microphone"))}</div>
        <div><select id="microphoneSrc" style="width:100%">${deviceOptions(mic, "(Default Microphone)")}</select></div>
        <div class="Settings_VolumeOutput_Container"><div id="Settings_MicrophoneOutput" class="Settings_VolumeOutput"></div></div>
        <div><input type="checkbox" id="Settings_AutoGainControl"><label for="Settings_AutoGainControl"> Auto Gain Control</label></div>
        <div><input type="checkbox" id="Settings_EchoCancellation"><label for="Settings_EchoCancellation"> Echo Cancellation</label></div>
        <div><input type="checkbox" id="Settings_NoiseSuppression"><label for="Settings_NoiseSuppression"> Noise Suppression</label></div>
        ${this.enableVideoCalling ? `<div class="UiText">${escapeHtml(this.#t("camera"))}</div><div><select id="previewVideoSrc" style="width:100%">${deviceOptions(cam, "(Default Camera)")}</select></div>` : ""}
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
      </div>`);
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
      onConfirm: () => {
        ["wssServer", "WebSocketPort", "ServerPath", "profileName", "SipDomain", "SipUsername", "SipPassword"].forEach((key) => this.localDB?.removeItem(key));
        this.renderer.setStatus(this.#t("extensionConfigCleared"));
      }
    }));
    if (reset) reset.addEventListener("click", () => this.#confirmInPanel({
      message: this.#t("confirmResetSettings"),
      confirmText: this.#t("resetSettings"),
      onConfirm: async () => {
        ["AudioOutputId", "AudioSrcId", "RingOutputId", "VideoSrcId", "Language"].forEach((key) => this.localDB?.removeItem(key));
        this.language = this.#normalizeLanguage(this.config.Language || "auto");
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
      const nextConfig = {
        wssServer: valueOf("#Configure_Account_wssServer"),
        WebSocketPort: valueOf("#Configure_Account_WebSocketPort"),
        ServerPath: valueOf("#Configure_Account_ServerPath"),
        profileName: valueOf("#Configure_Account_profileName"),
        SipDomain: valueOf("#Configure_Account_SipDomain"),
        SipUsername: valueOf("#Configure_Account_SipUsername"),
        SipPassword: valueOf("#Configure_Account_SipPassword")
      };
      Object.entries(nextConfig).forEach(([key, value]) => this.localDB.setItem(key, value));
      Object.assign(this.config, nextConfig);
      this.profileName = nextConfig.profileName || this.profileName;
      this.profileUserID = nextConfig.SipUsername || this.profileUserID;
      try {
        await this.sdk.unregister?.();
        this.sdk.configure?.(nextConfig);
        const state = await this.sdk.register?.();
        this.renderer.setRegistrationState(state || this.sdk.getRegistrationState?.() || {});
      } catch (err) {
        savedStatus = `Register failed: ${String(err?.message || err)}`;
      }
    }
    if (mode === "settings") {
      this.localDB.setItem("AudioOutputId", valueOf("#playbackSrc"));
      this.localDB.setItem("AudioSrcId", valueOf("#microphoneSrc"));
      this.localDB.setItem("RingOutputId", valueOf("#ringDevice"));
      this.localDB.setItem("VideoSrcId", valueOf("#previewVideoSrc"));
    }
    if (mode === "settings" || mode === "language") {
      const selectedLanguage = valueOf("#Settings_Language") || "auto";
      this.localDB.setItem("Language", selectedLanguage);
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

  #showActionPanel(html) {
    const host = this.root.querySelector("#actionArea");
    if (!host) return;
    if (this.renderer.refs?.myContacts) this.renderer.refs.myContacts.style.display = "none";
    if (this.renderer.refs?.contactsTabHeader) this.renderer.refs.contactsTabHeader.style.display = "none";
    if (this.renderer.refs?.searchArea) this.renderer.refs.searchArea.style.display = "none";
    host.classList.remove("dialpadMode");
    host.innerHTML = html;
    host.style.display = "";
  }

  #renderIncomingCall(call = {}) {
    const caller = this.#callLabel(call?.displayName || call?.from || this.#t("incoming"));
    this.#showActionPanel(`
      <div class="legacyCallSurface" data-call-state="incoming">
        <div id="line-1-AnswerCall">
          <div class="CallPictureUnderlay"></div>
          <div class="CallColorUnderlay"></div>
          <div class="CallUi">
            <div class="callingDisplayName">${escapeHtml(caller.name)}</div>
            <div class="callingDisplayNumber">${escapeHtml(caller.number)}</div>
            <div class="answerCall incomingCallActions">
              <button type="button" class="roundButtons dialButtons incomingCallDialButton incomingCallAnswerButton callAnswerAudio" title="${escapeHtml(this.#t("answerCall"))}"><i class="fa fa-phone"></i></button>
              <button type="button" class="roundButtons dialButtons incomingCallDialButton incomingCallRejectButton callReject" title="${escapeHtml(this.#t("rejectCall"))}"><i class="fa fa-phone" style="transform: rotate(135deg);"></i></button>
              <div id="line-1-answer-crm-space"></div>
            </div>
          </div>
        </div>
      </div>`);
  }

  #renderCallProgress(target) {
    const caller = this.#callLabel(target || "Calling");
    this.#showActionPanel(`
      <div class="legacyCallSurface" data-call-state="progress">
        <div id="line-1-progress">
          <div class="CallPictureUnderlay"></div>
          <div class="CallColorUnderlay"></div>
          <div class="CallUi">
            <div class="callingDisplayName">${escapeHtml(caller.name)}</div>
            <div class="callingDisplayNumber">${escapeHtml(caller.number)}</div>
            <div class="progressCall">
              <button type="button" class="rejectButton callReject"><i class="fa fa-phone" style="transform: rotate(135deg);"></i> ${escapeHtml(this.#t("cancel"))}</button>
            </div>
          </div>
        </div>
      </div>`);
  }

  #renderActiveCall() {
    const caller = this.#callLabel(this.activeCall?.target || this.activeCall?.from || "Connected");
    this.#showActionPanel(`
      <div class="legacyCallSurface" data-call-state="active">
        <div id="line-1-ActiveCall" class="cleanScroller" style="display:block; position:absolute; top:0; left:0; height:100%; width:100%;">
          <div id="line-1-AudioOrVideoCall" style="height:100%">
            <div id="line-1-AudioCall" style="height:100%; display:block">
              <div class="CallPictureUnderlay"></div>
              <div class="CallColorUnderlay"></div>
              <div class="CallUi CallUiAudioOnly">
                <div class="callingDisplayName">${escapeHtml(caller.name)}</div>
                <div class="callingDisplayNumber">${escapeHtml(caller.number)}</div>
                ${this.enableTransfer ? `<div id="line-1-Transfer" class="transferPopupPanel" style="display:none">
                  <div class="transferPopupCard">
                    <div class="transferPopupTitle"><i class="fa fa-reply" style="transform: rotateY(180deg)"></i><span>${escapeHtml(this.#t("transferCall"))}</span></div>
                    <span class="searchClean transferSearch"><input id="line-1-txt-FindTransferBuddy" type="text" autocomplete="none" placeholder="Search or enter number"></span>
                    <div class="transferButtonRow">
                      <button id="line-1-btn-blind-transfer" class="transferActionButton callBlindTransfer"><i class="fa fa-reply" style="transform: rotateY(180deg)"></i><span>${escapeHtml(this.#t("blindTransfer"))}</span></button>
                      <button id="line-1-btn-attended-transfer" class="transferActionButton callAttendedTransfer"><i class="fa fa-reply-all" style="transform: rotateY(180deg)"></i><span>${escapeHtml(this.#t("attendedTransfer"))}</span></button>
                      <button id="line-1-btn-complete-attended-transfer" class="transferActionButton" style="display:none"><i class="fa fa-reply-all" style="transform: rotateY(180deg)"></i><span>${escapeHtml(this.#t("completeTransfer"))}</span></button>
                      <button id="line-1-btn-cancel-attended-transfer" class="transferActionButton transferCancelButton callCancelTransfer" style="display:none"><i class="fa fa-phone" style="transform: rotate(135deg);"></i><span>${escapeHtml(this.#t("cancelTransfer"))}</span></button>
                    </div>
                    <div id="line-1-transfer-status" class="callStatus" style="margin-top:10px; display:none">...</div>
                  </div>
                </div>` : ""}
                ${this.enableConference ? `<div id="line-1-Conference" class="transferPopupPanel conferencePopupPanel" style="display:none">
                  <div class="transferPopupCard conferencePopupCard">
                    <div class="transferPopupTitle"><i class="fa fa-users"></i><span>${escapeHtml(this.#t("conferenceCall"))}</span></div>
                    <span class="searchClean transferSearch"><input id="line-1-txt-FindConferenceBuddy" type="text" autocomplete="none" placeholder="Search or enter number"></span>
                    <div class="transferButtonRow">
                      <button id="line-1-btn-conference-dial" class="transferActionButton callConferenceDial"><i class="fa fa-phone"></i><span>${escapeHtml(this.#t("call"))}</span></button>
                      <button id="line-1-btn-cancel-conference-dial" class="transferActionButton transferCancelButton callCancelConference" style="display:none"><i class="fa fa-phone" style="transform: rotate(135deg);"></i><span>${escapeHtml(this.#t("cancelCall"))}</span></button>
                      <button id="line-1-btn-join-conference-call" class="transferActionButton" style="display:none"><i class="fa fa-users"></i><span>${escapeHtml(this.#t("joinConferenceCall"))}</span></button>
                    </div>
                    <div id="line-1-conference-status" class="callStatus" style="margin-top:10px; display:none">...</div>
                  </div>
                </div>` : ""}
                <div id="line-1-Dtmf" class="dtmfNumpadPopup" style="display:none">
                  <div class="dtmfInputRow">
                    <input id="line-1-dtmf-input" class="dialTextInput dtmfInput" type="tel" inputmode="tel" autocomplete="off">
                    <button id="line-1-dtmf-delete" class="roundButtons dtmfClearButton"><i class="fa fa-arrow-left"></i></button>
                  </div>
                  <div class="dtmfNumpadGrid">
                    ${["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((digit) => `<button type="button" class="dialButtons callDtmfDigit" data-dtmf-digit="${escapeHtml(digit)}"><div>${escapeHtml(digit)}</div><span>&nbsp;</span></button>`).join("")}
                  </div>
                  <button type="button" class="dtmfSendButton callCloseDtmf">${escapeHtml(this.#t("close"))}</button>
                </div>
                <div id="line-1-active-audio-call-crm-space"></div>
              </div>
            </div>
            <div id="line-1-VideoCall" style="height:100%; display:none">
              <div id="line-1-preview-container" class="PreviewContainer cleanScroller">
                <video id="line-1-localVideo" muted playsinline></video>
              </div>
              <div id="line-1-stage-container" class="StageContainer">
                <div id="line-1-remote-videos" class="VideosContainer"></div>
                <div id="line-1-scratchpad-container" class="ScratchpadContainer" style="display:none"></div>
                <video id="line-1-sharevideo" controls muted playsinline style="display:none; object-fit:contain; width:100%;"></video>
              </div>
            </div>
          </div>
          <div class="CallControlContainer">
            <div class="CallControl">
              <div class="CallControlRowPrimary">
                <button id="line-1-btn-Mute" type="button" class="roundButtons dialButtons inCallButtons callMute" title="${escapeHtml(this.#t("mute"))}"><i class="fa fa-microphone-slash"></i></button>
                <button id="line-1-btn-Unmute" type="button" class="roundButtons dialButtons inCallButtons callUnmute" title="${escapeHtml(this.#t("unmuted"))}" style="color:red; display:none"><i class="fa fa-microphone"></i></button>
                <button id="line-1-btn-Hold" type="button" class="roundButtons dialButtons inCallButtons callHold" title="${escapeHtml(this.#t("holdCall"))}"><i class="fa fa-pause-circle"></i></button>
                <button id="line-1-btn-Unhold" type="button" class="roundButtons dialButtons inCallButtons callResume" title="${escapeHtml(this.#t("resumeCall"))}" style="color:red; display:none"><i class="fa fa-play-circle"></i></button>
                ${this.enableTransfer ? `<button id="line-1-btn-Transfer" type="button" class="roundButtons dialButtons inCallButtons callTransfer" title="${escapeHtml(this.#t("transferCall"))}"><i class="fa fa-reply" style="transform: rotateY(180deg)"></i></button>
                <button id="line-1-btn-CancelTransfer" type="button" class="roundButtons dialButtons inCallButtons callCancelTransfer" title="${escapeHtml(this.#t("cancelTransfer"))}" style="color:red; display:none"><i class="fa fa-reply" style="transform: rotateY(180deg)"></i></button>` : ""}
              </div>
              <div class="CallControlRowSecondary" id="line-1-btn-more" style="display:block">
                <button id="line-1-btn-ShowNumpad" type="button" class="roundButtons dialButtons inCallButtons callDtmf" title="${escapeHtml(this.#t("sendDtmf"))}"><i class="fa fa-keyboard-o"></i></button>
                ${this.enableConference ? `<button id="line-1-btn-Conference" type="button" class="roundButtons dialButtons inCallButtons callConference" title="${escapeHtml(this.#t("conferenceCall"))}"><i class="fa fa-users"></i></button>
                <button id="line-1-btn-CancelConference" type="button" class="roundButtons dialButtons inCallButtons callCancelConference" title="${escapeHtml(this.#t("cancelConference"))}" style="color:red; display:none"><i class="fa fa-users"></i></button>` : ""}
                <button id="line-1-btn-settings" type="button" class="roundButtons dialButtons inCallButtons callDeviceSettings" title="${escapeHtml(this.#t("deviceSettings"))}"><i class="fa fa-volume-up"></i></button>
                ${this.enableVideoCalling ? `<button id="line-1-btn-present-src" type="button" class="roundButtons dialButtons inCallButtons callPresentSrc" title="${escapeHtml(this.#t("camera"))}"><i class="fa fa-video-camera"></i></button>` : ""}
              </div>
              <div class="CallControlRowHangup">
                <button id="line-1-btn-End" type="button" class="roundButtons dialButtons inCallButtons hangupButton callHangup" title="${escapeHtml(this.#t("endCall"))}"><i class="fa fa-phone" style="transform: rotate(135deg);"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>`);
  }

  #callLabel(value) {
    const text = normalizeText(value);
    const quoted = text.match(/"([^"]+)"/);
    const match = text.match(/sip:([^@>;]+)/i);
    const number = normalizeText(match ? match[1] : text.replace(/^<|>$/g, ""));
    const display = normalizeText(quoted?.[1] || (!/^sip:/i.test(text) && !/@/.test(text) ? text : ""));
    const name = display || number || "Unknown";
    return { name, number: number && number !== name ? number : "" };
  }

  #bindCallSurfaceControls() {
    this.root.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".callAnswerAudio")) {
        this.sdk.answer();
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
        this.sdk.mute();
        const mute = this.root.querySelector("#line-1-btn-Mute");
        const unmute = this.root.querySelector("#line-1-btn-Unmute");
        if (mute) mute.style.display = "";
        if (unmute) unmute.style.display = "none";
        return;
      }
      if (target.closest(".callHold")) {
        this.sdk.hold();
        const hold = this.root.querySelector("#line-1-btn-Hold");
        const resume = this.root.querySelector("#line-1-btn-Unhold");
        if (hold) hold.style.display = "none";
        if (resume) resume.style.display = "";
        return;
      }
      if (target.closest(".callResume")) {
        this.sdk.resume();
        const hold = this.root.querySelector("#line-1-btn-Hold");
        const resume = this.root.querySelector("#line-1-btn-Unhold");
        if (hold) hold.style.display = "";
        if (resume) resume.style.display = "none";
        return;
      }
      if (target.closest(".callTransfer")) {
        this.#showTransferPanel();
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
        this.#showConferencePanel();
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
      if (target.closest(".callCloseDtmf")) {
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
      if (target.closest(".callDeviceSettings")) this.#openInCallDeviceMenu(target.closest(".callDeviceSettings"));
      if (target.closest(".callPresentSrc")) {
        this.#openPresentMenu(target.closest(".callPresentSrc"));
        return;
      }
    });
  }

  #showTransferPanel() {
    this.#hideConferencePanel();
    const panel = this.root.querySelector("#line-1-Transfer");
    const transfer = this.root.querySelector("#line-1-btn-Transfer");
    const cancel = this.root.querySelector("#line-1-btn-CancelTransfer");
    if (panel) panel.style.display = "";
    if (transfer) transfer.style.display = "none";
    if (cancel) cancel.style.display = "";
    this.sdk.hold?.();
    this.root.querySelector("#line-1-txt-FindTransferBuddy")?.focus();
  }

  #hideTransferPanel() {
    const panel = this.root.querySelector("#line-1-Transfer");
    const transfer = this.root.querySelector("#line-1-btn-Transfer");
    const cancel = this.root.querySelector("#line-1-btn-CancelTransfer");
    if (panel) panel.style.display = "none";
    if (transfer) transfer.style.display = "";
    if (cancel) cancel.style.display = "none";
    this.sdk.resume?.();
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
    const panel = this.root.querySelector("#line-1-Conference");
    const conference = this.root.querySelector("#line-1-btn-Conference");
    const cancel = this.root.querySelector("#line-1-btn-CancelConference");
    if (panel) panel.style.display = "";
    if (conference) conference.style.display = "none";
    if (cancel) cancel.style.display = "";
    this.sdk.hold?.();
    this.root.querySelector("#line-1-txt-FindConferenceBuddy")?.focus();
  }

  #hideConferencePanel() {
    const panel = this.root.querySelector("#line-1-Conference");
    const conference = this.root.querySelector("#line-1-btn-Conference");
    const cancel = this.root.querySelector("#line-1-btn-CancelConference");
    if (panel) panel.style.display = "none";
    if (conference) conference.style.display = "";
    if (cancel) cancel.style.display = "none";
    this.sdk.resume?.();
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
    const panel = this.root.querySelector("#line-1-Dtmf");
    if (panel) panel.style.display = "";
    this.root.querySelector("#line-1-dtmf-input")?.focus();
  }

  #hideDtmfPanel() {
    const panel = this.root.querySelector("#line-1-Dtmf");
    if (panel) panel.style.display = "none";
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
      void this.call({ video: !!event.ctrlKey && this.enableVideoCalling });
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
          <button type="button" id="dialAudio" class="dialButtons dialButtonsDial" title="${escapeHtml(this.#t("audioCall"))}"><i class="fa fa-phone"></i></button>
          ${this.enableVideoCalling ? `<button type="button" id="dialVideo" class="dialButtons dialButtonsDial" title="${escapeHtml(this.#t("videoCall"))}"><i class="fa fa-video-camera"></i></button>` : ""}
        </div>
          <div id="dialpad-setting-toggles" class="dialpadSettingToggles">
            <button id="dialpad-toggle-auto" title="${escapeHtml(this.#t("autoAnswer"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.auto ? "toggleOn" : "toggleOff"}"><i class="fa fa-phone"></i></button>
            <button id="dialpad-toggle-dnd" title="${escapeHtml(this.#t("doNotDisturb"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.dnd ? "toggleOn" : "toggleOff"}"><i class="fa fa-ban"></i></button>
            <button id="dialpad-toggle-cw" title="${escapeHtml(this.#t("callWaiting"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.cw ? "toggleOn" : "toggleOff"}"><i class="fa fa-volume-control-phone"></i></button>
            ${this.hideRecordAllCallsButton ? "" : `<button id="dialpad-toggle-rec" title="${escapeHtml(this.#t("recordAllCalls"))}" class="roundButtons dialpadToggleBtn ${this.dialpadToggles.rec ? "toggleOn" : "toggleOff"}"><i class="fa fa-dot-circle-o"></i></button>`}
          </div>
      </div>
    `;
    this.#bindDialpadInputState();
    this.#bindDialpadDigits();
    this.#applyFeatureVisibility();
  }

  #renderContacts() {
    const host = this.root.querySelector("#myContacts");
    if (!host) return;
    this.contacts = this.#loadContactsFromStorage();
    const filter = String(this.tabSearch.contacts || "").trim().toLowerCase();
    const rows = this.contacts.filter((c) => !filter || c.name.toLowerCase().includes(filter) || c.number.includes(filter));
    if (rows.length === 0) {
      host.innerHTML = `<div class="contact" style="padding:8px 12px;"><div class="contactNameText">${escapeHtml(this.#t("noContacts"))}</div></div>`;
      return;
    }
    host.innerHTML = rows
      .map((c) => `<div id="contact-${escapeHtml(c.id)}" class="buddy contactCompact enterpriseContactItem" data-contact-id="${escapeHtml(c.id)}" data-dial-number="${escapeHtml(c.number)}">
        <div class="contactCompactMain">
          <div class="contactCompactName" style="user-select:text">${escapeHtml(c.name)}</div>
          <div class="contactCompactNumber" style="user-select:text">${escapeHtml(c.number)}</div>
        </div>
        <div class="recentExpandChevron"><i class="fa fa-chevron-down"></i></div>
        <div class="contactCompactExpanded" style="display:none">
          <div class="recentExpandedActions">
            <button type="button" class="roundButtons contactActionCall" title="${escapeHtml(this.#t("audioCall"))}"${c.number ? "" : " disabled"}><i class="fa fa-phone"></i></button>
            <button type="button" class="roundButtons contactActionEdit" title="Edit"><i class="fa fa-pencil"></i></button>
            <button type="button" class="roundButtons contactActionDelete" title="${escapeHtml(this.#t("delete"))}"><i class="fa fa-trash"></i></button>
          </div>
        </div>
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
      host.innerHTML = `<div class="contact" style="padding:8px 12px;"><div class="contactNameText">${escapeHtml(this.#t("noRecentCalls"))}</div></div>`;
      return;
    }
    host.innerHTML = rows
      .map((r, index) => `${index === 0 || rows[index - 1]?.dayKey !== r.dayKey ? `<div class="recentDayDivider">${escapeHtml(r.dayLabel)}</div>` : ""}<div class="recentCallItem enterpriseRecentItem${r.expanded ? " expanded" : ""}" data-recent-id="${escapeHtml(r.id)}">
        <div class="recentCallSummary">
          <div class="recentCallAvatar recentDirectionAvatar ${escapeHtml(r.statusClass)}"><i class="fa ${escapeHtml(r.iconClass)}"></i></div>
          <div class="recentCallInfo contactCompactMain">
            <div class="recentCallName contactCompactName" style="user-select:text">${escapeHtml(r.name)}</div>
            <div class="recentCallSubMeta"><span>${escapeHtml(r.timeLabel)}</span>${r.billsecLabel ? `<span>${escapeHtml(r.billsecLabel)}</span>` : ""}<span class="recentStatusPill ${escapeHtml(r.statusClass)}">${escapeHtml(r.statusText)}</span></div>
          </div>
          <div class="recentExpandChevron"><i class="fa fa-chevron-down"></i></div>
        </div>
        <div class="recentCallExpanded" style="display:${r.expanded ? "block" : "none"}">
          ${r.number ? `<div class="recentExpandedNumber" style="user-select:text"><i class="fa fa-phone"></i> ${escapeHtml(r.number)}</div>` : ""}
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
        this.#confirmInPanel({
          message: this.#t("confirmDeleteRecent"),
          confirmText: this.#t("delete"),
          onConfirm: () => {
            this.#deleteRecentById(id);
            delete this.recentExpandedById[id];
            this.#renderRecents();
            this.renderer.setStatus(this.#t("recentDeleted"));
          }
        });
        return;
      }
      if (target.closest(".recentActionAdd")) {
        this.#showAddContactPanel(item.number, item.name);
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

  #bindContactExpandedActions() {
    const host = this.root.querySelector("#myContacts");
    if (!host) return;
    host.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const row = target.closest(".enterpriseContactItem");
      if (!row) return;
      const id = row.getAttribute("data-contact-id") || "";
      const number = row.getAttribute("data-dial-number") || "";

      if (target.closest(".contactActionCall")) {
        event.stopPropagation();
        if (!number) return;
        this.#switchTab("dialpad");
        const dial = this.root.querySelector("#dialText");
        if (dial) dial.value = number;
        void this.call({ video: false });
        return;
      }
      if (target.closest(".contactActionEdit")) {
        event.stopPropagation();
        const item = this.contacts.find((contact) => contact.id === id);
        this.#showAddContactPanel(item?.number || number, item?.name || "");
        return;
      }
      if (target.closest(".contactActionDelete")) {
        event.stopPropagation();
        this.#confirmInPanel({
          message: this.#t("confirmClearContacts"),
          confirmText: this.#t("delete"),
          onConfirm: () => {
            this.#deleteContactById(id);
            this.contacts = this.#loadContactsFromStorage();
            this.#renderContacts();
          }
        });
        return;
      }

      const expanded = row.classList.contains("expanded");
      host.querySelectorAll(".enterpriseContactItem.expanded").forEach((item) => {
        item.classList.remove("expanded");
        const panel = item.querySelector(".contactCompactExpanded");
        if (panel) panel.style.display = "none";
      });
      if (!expanded) {
        row.classList.add("expanded");
        const panel = row.querySelector(".contactCompactExpanded");
        if (panel) panel.style.display = "";
      }
    });
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

  #getDbItem(itemIndex, defaultValue) {
    if (!this.localDB) return defaultValue;
    const value = this.localDB.getItem(itemIndex);
    return value === null ? defaultValue : value;
  }

  #normalizeLanguage(value) {
    const selected = normalizeText(value || "auto").toLowerCase();
    if (!selected || selected === "auto") return "en";
    return selected;
  }

  async #loadLanguagePack(language) {
    const lang = this.#normalizeLanguage(language);
    if (this.loadedLanguage === lang && this.langPack) return this.langPack;
    try {
      const response = await fetch(new URL(`../assets/lang/${encodeURIComponent(lang)}.json`, import.meta.url));
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
    if (fromJson !== undefined && fromJson !== null && String(fromJson) !== "") return String(fromJson);
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
    setDataLabel("#tab-dialpad", "dialpad");
    setDataLabel("#tab-recents", "recents");
    setDataLabel("#tab-contacts", "contacts");
    setTitle("#dialAudio", "audioCall");
    setTitle("#dialVideo", "videoCall");
    setTitle("#dialpad-toggle-auto", "autoAnswer");
    setTitle("#dialpad-toggle-dnd", "doNotDisturb");
    setTitle("#dialpad-toggle-cw", "callWaiting");
    setTitle("#dialpad-toggle-rec", "recordAllCalls");
    const settings = this.root.querySelector("#SettingsMenu");
    if (settings) settings.setAttribute("title", this.#t("settings"));
    this.root.querySelectorAll("[data-action='more']").forEach((el) => el.setAttribute("title", this.#t("more")));
    this.root.querySelectorAll("[data-action='reg']").forEach((el) => el.setAttribute("title", this.#t("registration")));
    this.root.querySelectorAll("[data-action='clear-tab']").forEach((el) => el.setAttribute("title", this.#t("delete")));
    this.root.querySelectorAll("[data-action='add-contact']").forEach((el) => el.setAttribute("title", this.#t("add")));
  }

  #applyFeatureVisibility() {
    const freeDial = this.root.querySelector("#BtnFreeDial");
    if (freeDial) {
      freeDial.style.display = this.disableFreeDial ? "none" : "";
      freeDial.disabled = !!this.disableFreeDial;
    }
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
        const billsec = Number(item.Billsec || item.billsec || 0) || 0;
        const isAnswered = billsec > 0 || /answer|completed/i.test(`${item.Disposition || ""} ${item.Reason || ""}`);
        const isMissed = !isAnswered && /miss|no answer|failed|incoming/i.test(`${item.Disposition || ""} ${item.Reason || ""} ${item.CallDirection || ""}`);
        const statusClass = isMissed ? "callMissed" : isOutbound ? "callOut" : "callIn";
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
          statusClass,
          iconClass: isMissed ? "fa-times" : isOutbound ? "fa-arrow-up" : "fa-arrow-down",
          statusText: isMissed ? this.#t("missed") : isAnswered ? this.#t("answered") : isOutbound ? this.#t("outgoing") : this.#t("incoming"),
          timeLabel: this.#formatRecentClock(item.ItemDate),
          dayKey: this.#formatRecentDayKey(item.ItemDate),
          dayLabel: this.#formatRecentDay(item.ItemDate),
          billsecLabel: isAnswered ? this.#formatBillsec(billsec) : "",
          timeStamp: this.#toEpoch(item.ItemDate),
          expanded: !!this.recentExpandedById[id]
        });
      }
    }

    rows.sort((a, b) => (a.timeStamp || 0) > (b.timeStamp || 0) ? -1 : 1);
    return rows;
  }

  #formatRecentClock(itemDate) {
    const text = normalizeText(itemDate).replace(" UTC", "");
    if (!text) return "";
    const parsed = new Date(`${text.replace(" ", "T")}Z`);
    if (Number.isNaN(parsed.getTime())) return text;
    return parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  #formatRecentDay(itemDate) {
    const text = normalizeText(itemDate).replace(" UTC", "");
    const parsed = new Date(`${text.replace(" ", "T")}Z`);
    if (Number.isNaN(parsed.getTime())) return text || "";
    return `${String(parsed.getDate()).padStart(2, "0")}/${String(parsed.getMonth() + 1).padStart(2, "0")}/${parsed.getFullYear()}`;
  }

  #formatRecentDayKey(itemDate) {
    const text = normalizeText(itemDate).replace(" UTC", "");
    const parsed = new Date(`${text.replace(" ", "T")}Z`);
    if (Number.isNaN(parsed.getTime())) return text || "";
    return `${parsed.getFullYear()}-${parsed.getMonth() + 1}-${parsed.getDate()}`;
  }

  #formatBillsec(seconds) {
    const total = Math.max(0, Number(seconds) || 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remain = total % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
  }

  #toEpoch(itemDate) {
    const text = normalizeText(itemDate).replace(" UTC", "");
    if (!text) return 0;
    const parsed = new Date(`${text.replace(" ", "T")}Z`);
    if (Number.isNaN(parsed.getTime())) return 0;
    return parsed.getTime();
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
    const itemDate = startedAt.toISOString().replace("T", " ").replace(".000Z", " UTC");
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

  #promptAddContact() {
    this.#showAddContactPanel();
  }

  #showAddContactPanel(numberStr = "", nameStr = "") {
    this.returnTab = this.activeTab || "contacts";
    this.#showActionPanel(`
      <div border="0" class="UiWindowField contactFormPanel">
        <div class="UiText">${escapeHtml(this.#t("fullName"))}:</div>
        <div class="contactFormInputRow"><input id="AddSomeone_Name" class="UiInputText" type="text" placeholder="E.g. John Smith" value="${escapeHtml(nameStr)}"></div>
        <div class="UiText">${escapeHtml(this.#t("contactNumber1"))}:</div>
        <div class="contactFormInputRow"><input id="AddSomeone_Num1" class="UiInputText" type="tel" placeholder="E.g. 1001" value="${escapeHtml(numberStr)}"></div>
        <div class="contactFormInputRow"><input type="checkbox" id="AddSomeone_Dnd"><label for="AddSomeone_Dnd"> ${escapeHtml(this.#t("allowCallsOnDnd"))}</label></div>
      </div>
      <div class="UiWindowButtonBar" id="ButtonBar">
        <button class="configPrimaryButton" id="AddSomeone_Save">${escapeHtml(this.#t("add"))}</button>
        <button class="configSecondaryButton" id="AddSomeone_Cancel">${escapeHtml(this.#t("cancel"))}</button>
      </div>`);
    const save = this.root.querySelector("#AddSomeone_Save");
    const cancel = this.root.querySelector("#AddSomeone_Cancel");
    if (save) save.addEventListener("click", () => this.#saveAddContactForm());
    if (cancel) cancel.addEventListener("click", () => this.#switchTab(this.returnTab || "contacts"));
    window.setTimeout(() => this.root.querySelector("#AddSomeone_Name")?.focus(), 0);
  }

  #saveAddContactForm() {
    const name = this.root.querySelector("#AddSomeone_Name")?.value || "";
    const number = normalizeNumber(this.root.querySelector("#AddSomeone_Num1")?.value || "");
    const numberInput = this.root.querySelector("#AddSomeone_Num1");
    if (numberInput) numberInput.value = number;
    if (!normalizeText(name) || !number) return;
    this.#addContact(name, number);
    this.contacts = this.#loadContactsFromStorage();
    this.activeTab = "contacts";
    this.renderer.showTab("contacts");
    this.#renderContacts();
    this.renderer.setStatus("Contact added");
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

export function createPhoneWidget({ root, config = {}, deps = {} } = {}) {
  const mountRoot = root || document.getElementById("Phone") || document.body;
  const sdk = deps.sdk || new PhoneSDK(config, deps);
  const ui = new PhoneUI({ root: mountRoot, sdk, config, deps });
  ui.mount();
  sdk.core?.bindAudioElements?.({
    remoteEl: mountRoot.querySelector("[data-role='remote-media']"),
    localEl: mountRoot.querySelector("[data-role='local-media']")
  });
  sdk.register?.().catch((err) => {
    sdk.core?.emit?.("registration-changed", { online: false, error: String(err?.message || err) });
  });
  return {
    sdk,
    ui,
    core: sdk.core,
    destroy() {
      try { sdk.hangup?.(); } catch {}
      try { sdk.unregister?.(); } catch {}
    }
  };
}
