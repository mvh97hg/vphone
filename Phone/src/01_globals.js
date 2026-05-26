
let loadAlternateLang = (getDbItem("loadAlternateLang", "1") == "1");
const availableLang = ["vi", "he", "fr", "ja", "zh-hans", "zh", "ru", "tr", "nl", "es", "de", "pl", "pt-br"];
let imagesDirectory = getDbItem("imagesDirectory", "");
let wallpaperLight = getDbItem("wallpaperLight", "");
let wallpaperDark = getDbItem("wallpaperDark", "");
let profileUserID = getDbItem("profileUserID", null);
let profileName = getDbItem("profileName", null);
let wssServer = getDbItem("wssServer", null);
let WebSocketPort = getDbItem("WebSocketPort", null);
let ServerPath = getDbItem("ServerPath", null);
let Wss = (getDbItem("Wss", "1") == "1");
let SipDomain = getDbItem("SipDomain", null);
let SipUsername = getDbItem("SipUsername", null);
let SipPassword = getDbItem("SipPassword", null);
let SipPasswordType = getDbItem("SipPasswordType", null);
let RegistrationErrorText = "";
var normalizedSipAuth = NormalizeSipPasswordAndType(SipPassword, null);
SipPassword = normalizedSipAuth.password;
SipPasswordType = normalizedSipAuth.type;

let SingleInstance = (getDbItem("SingleInstance", "1") == "1");

let TransportConnectionTimeout = parseInt(getDbItem("TransportConnectionTimeout", 15));
let TransportReconnectionAttempts = parseInt(getDbItem("TransportReconnectionAttempts", 999));
let TransportReconnectionTimeout = parseInt(getDbItem("TransportReconnectionTimeout", 3));
let TransportManualDisconnect = false;

let SubscribeToYourself = (getDbItem("SubscribeToYourself", "0") == "1");
let VoiceMailSubscribe = (getDbItem("VoiceMailSubscribe", "0") == "1");
let VoicemailDid = getDbItem("VoicemailDid", "");
let SubscribeVoicemailExpires = parseInt(getDbItem("SubscribeVoicemailExpires", 300));
let ContactUserName = getDbItem("ContactUserName", "");
let userAgentStr = getDbItem("UserAgentStr", "VPhone "+ appversion);
let hostingPrefix = getDbItem("HostingPrefix", "");
let AppIcon = getDbItem("AppIcon", "icons/phone.ico");
let NotificationIcon = getDbItem("NotificationIcon", "");
let DefaultProfileIcon = getDbItem("DefaultProfileIcon", "");
let RegisterExpires = parseInt(getDbItem("RegisterExpires", 300));
let RegisterExtraHeaders = getDbItem("RegisterExtraHeaders", "{}");
let RegisterExtraContactParams = getDbItem("RegisterExtraContactParams", "{}");
let RegisterContactParams = getDbItem("RegisterContactParams", "{}");
let WssInTransport = (getDbItem("WssInTransport", "1") == "1");
let IpInContact = (getDbItem("IpInContact", "1") == "1");
let BundlePolicy = getDbItem("BundlePolicy", "balanced");
let IceStunServerJson = getDbItem("IceStunServerJson", "");
let IceStunCheckTimeout = parseInt(getDbItem("IceStunCheckTimeout", 500));
let SubscribeBuddyAccept = getDbItem("SubscribeBuddyAccept", "application/pidf+xml");
let SubscribeBuddyEvent = getDbItem("SubscribeBuddyEvent", "presence");
let SubscribeBuddyExpires = parseInt(getDbItem("SubscribeBuddyExpires", 300));
let ProfileDisplayPrefix = getDbItem("ProfileDisplayPrefix", "");
let ProfileDisplayPrefixSeparator = getDbItem("ProfileDisplayPrefixSeparator", "");
let InviteExtraHeaders = getDbItem("InviteExtraHeaders", "{}");

let NoAnswerTimeout = parseInt(getDbItem("NoAnswerTimeout", 120));
let KeyboardShortcuts = NormalizeKeyboardShortcuts(getDbItem("KeyboardShortcuts", null));
let AutoAnswerEnabled = (getDbItem("AutoAnswerEnabled", "0") == "1");
let DoNotDisturbEnabled = (getDbItem("DoNotDisturbEnabled", "0") == "1");
let CallWaitingEnabled = (getDbItem("CallWaitingEnabled", "1") == "1");
let RecordAllCalls = (getDbItem("RecordAllCalls", "0") == "1");
let StartVideoFullScreen = (getDbItem("StartVideoFullScreen", "1") == "1");
let SelectRingingLine = (getDbItem("SelectRingingLine", "1") == "1");

let UiMaxWidth = parseInt(getDbItem("UiMaxWidth", 1240));
let UiThemeStyle = getDbItem("UiThemeStyle", "system");
let UiMessageLayout = getDbItem("UiMessageLayout", "middle");
let UiCustomConfigMenu = (getDbItem("UiCustomConfigMenu", "0") == "1");
let UiCustomDialButton = (getDbItem("UiCustomDialButton", "0") == "1");
let UiCustomSortAndFilterButton = (getDbItem("UiCustomSortAndFilterButton", "0") == "1");
let UiCustomAddBuddy = (getDbItem("UiCustomAddBuddy", "0") == "1");
let UiCustomEditBuddy = (getDbItem("UiCustomEditBuddy", "0") == "1");
let UiCustomMediaSettings = (getDbItem("UiCustomMediaSettings", "0") == "1");
let UiCustomMessageAction = (getDbItem("UiCustomMessageAction", "0") == "1");
let TraceSip = (getDbItem("TraceSip", "0") == "1");
let HideSettingsButton = (getDbItem("HideSettingsButton", "0") == "1");
let HideRecordAllCallsButton = (getDbItem("HideRecordAllCallsButton", "0") == "1");

let AutoGainControl = (getDbItem("AutoGainControl", "1") == "1");
let EchoCancellation = (getDbItem("EchoCancellation", "1") == "1");
let NoiseSuppression = (getDbItem("NoiseSuppression", "1") == "1");
let MirrorVideo = getDbItem("VideoOrientation", "rotateY(180deg)");
let maxFrameRate = getDbItem("FrameRate", "");
let videoHeight = getDbItem("VideoHeight", "");
let MaxVideoBandwidth = parseInt(getDbItem("MaxVideoBandwidth", "2048"));
let videoAspectRatio = getDbItem("AspectRatio", "1.33");
let NotificationsActive = true;

let StreamBuffer = parseInt(getDbItem("StreamBuffer", 50));
let MaxDataStoreDays = parseInt(getDbItem("MaxDataStoreDays", 0));
let MaxRecentRecords = parseInt(getDbItem("MaxRecentRecords", 1000));
let PosterJpegQuality = parseFloat(getDbItem("PosterJpegQuality", 0.6));
let VideoResampleSize = getDbItem("VideoResampleSize", "HD");
let RecordingVideoSize = getDbItem("RecordingVideoSize", "HD");
let RecordingVideoFps = parseInt(getDbItem("RecordingVideoFps", 12));
let RecordingLayout = getDbItem("RecordingLayout", "them-pnp");

let DidLength = parseInt(getDbItem("DidLength", 6));
let MaxDidLength = parseInt(getDbItem("MaxDidLength", 24));
let DisplayDateFormat = getDbItem("DateFormat", "YYYY-MM-DD");
let DisplayTimeFormat = getDbItem("TimeFormat", "h:mm:ss A");
let Language = getDbItem("Language", "auto");
let BuddySortBy = getDbItem("BuddySortBy", "activity");
let SortByTypeOrder = getDbItem("SortByTypeOrder", "e|x|c");
let BuddyAutoDeleteAtEnd = (getDbItem("BuddyAutoDeleteAtEnd", "0") == "1");
let HideAutoDeleteBuddies = (getDbItem("HideAutoDeleteBuddies", "0") == "1");
let BuddyShowExtenNum = (getDbItem("BuddyShowExtenNum", "0") == "1");
let DisableFreeDial = (getDbItem("DisableFreeDial", "0") == "1");
let DisableBuddies = (getDbItem("DisableBuddies", "0") == "1");
let EnableTransfer = (getDbItem("EnableTransfer", "1") == "1");
let EnableConference = (getDbItem("EnableConference", "1") == "1");
let AutoAnswerPolicy = getDbItem("AutoAnswerPolicy", "allow");
let DoNotDisturbPolicy = getDbItem("DoNotDisturbPolicy", "allow");
let CallWaitingPolicy = getDbItem("CallWaitingPolicy", "allow");
let CallRecordingPolicy = getDbItem("CallRecordingPolicy", "allow");
let IntercomPolicy = getDbItem("IntercomPolicy", "enabled");
let EnableAccountSettings = (getDbItem("EnableAccountSettings", "1") == "1");
let EnableAppearanceSettings = (getDbItem("EnableAppearanceSettings", "1") == "1");
let EnableNotificationSettings = (getDbItem("EnableNotificationSettings", "1") == "1");
let EnableAlphanumericDial = (getDbItem("EnableAlphanumericDial", "0") == "1");
let EnableVideoCalling = (getDbItem("EnableVideoCalling", "0") == "1");
let EnableTextExpressions = (getDbItem("EnableTextExpressions", "0") == "1");
let EnableTextDictate = (getDbItem("EnableTextDictate", "0") == "1");
let EnableRingtone = (getDbItem("EnableRingtone", "1") == "1");
let MaxBuddies = parseInt(getDbItem("MaxBuddies", 999));
let MaxBuddyAge = parseInt(getDbItem("MaxBuddyAge", 365));
let AutoDeleteDefault = (getDbItem("AutoDeleteDefault", "1") == "1");
let EnableSendFiles = false;
let EnableSendImages = false;
let EnableAudioRecording = false;
let EnableVideoRecording = false;
let EnableSms = false;
let EnableFax = false;
let EnableEmail = false;
let userAgent = null;
let CanvasCollection = [];
let Buddies = [];
let selectedBuddy = null;
let selectedLine = null;
let windowObj = null;
let skipNextWindowAutoCenter = false;
let dtmfInlinePanelState = null;
let alertObj = null;
let confirmObj = null;
let promptObj = null;
let menuObj = null;
let popupAnchorEl = null;
let HasVideoDevice = false;
let HasAudioDevice = false;
let HasSpeakerDevice = false;
let AudioinputDevices = [];
let VideoinputDevices = [];
let SpeakerDevices = [];
let Lines = [];
let lang = {}
let audioBlobs = {}
let embeddedMediaMap = (typeof window !== 'undefined' && window.__VPhoneEmbeddedMedia && typeof window.__VPhoneEmbeddedMedia === 'object')
    ? window.__VPhoneEmbeddedMedia
    : null;
let runtimeMediaConfig = {};
let defaultMediaConfig = {
    ringtone: "",
    holdMusic: "",
    busy: "",
    callWaiting: "",
    congestion: "",
    earlyMedia: ""
};
let mediaConfigStorageKeys = {
    ringtone: "MediaConfig_Ringtone"
};
let mediaUploadLimits = {
    maxBytes: 2 * 1024 * 1024
};
let audioAutoplayUnlocked = false;
let audioUnlockAttached = false;
let queuedAudioPlaybacks = [];

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.loadAlternateLang = loadAlternateLang; }
if (typeof window !== 'undefined') { window.loadAlternateLang = loadAlternateLang; }
if (typeof globalThis !== 'undefined') { globalThis.availableLang = availableLang; }
if (typeof window !== 'undefined') { window.availableLang = availableLang; }
if (typeof globalThis !== 'undefined') { globalThis.imagesDirectory = imagesDirectory; }
if (typeof window !== 'undefined') { window.imagesDirectory = imagesDirectory; }
if (typeof globalThis !== 'undefined') { globalThis.wallpaperLight = wallpaperLight; }
if (typeof window !== 'undefined') { window.wallpaperLight = wallpaperLight; }
if (typeof globalThis !== 'undefined') { globalThis.wallpaperDark = wallpaperDark; }
if (typeof window !== 'undefined') { window.wallpaperDark = wallpaperDark; }
if (typeof globalThis !== 'undefined') { globalThis.profileUserID = profileUserID; }
if (typeof window !== 'undefined') { window.profileUserID = profileUserID; }
if (typeof globalThis !== 'undefined') { globalThis.profileName = profileName; }
if (typeof window !== 'undefined') { window.profileName = profileName; }
if (typeof globalThis !== 'undefined') { globalThis.wssServer = wssServer; }
if (typeof window !== 'undefined') { window.wssServer = wssServer; }
if (typeof globalThis !== 'undefined') { globalThis.WebSocketPort = WebSocketPort; }
if (typeof window !== 'undefined') { window.WebSocketPort = WebSocketPort; }
if (typeof globalThis !== 'undefined') { globalThis.ServerPath = ServerPath; }
if (typeof window !== 'undefined') { window.ServerPath = ServerPath; }
if (typeof globalThis !== 'undefined') { globalThis.Wss = Wss; }
if (typeof window !== 'undefined') { window.Wss = Wss; }
if (typeof globalThis !== 'undefined') { globalThis.SipDomain = SipDomain; }
if (typeof window !== 'undefined') { window.SipDomain = SipDomain; }
if (typeof globalThis !== 'undefined') { globalThis.SipUsername = SipUsername; }
if (typeof window !== 'undefined') { window.SipUsername = SipUsername; }
if (typeof globalThis !== 'undefined') { globalThis.SipPassword = SipPassword; }
if (typeof window !== 'undefined') { window.SipPassword = SipPassword; }
if (typeof globalThis !== 'undefined') { globalThis.SipPasswordType = SipPasswordType; }
if (typeof window !== 'undefined') { window.SipPasswordType = SipPasswordType; }
if (typeof globalThis !== 'undefined') { globalThis.RegistrationErrorText = RegistrationErrorText; }
if (typeof window !== 'undefined') { window.RegistrationErrorText = RegistrationErrorText; }
if (typeof globalThis !== 'undefined') { globalThis.normalizedSipAuth = normalizedSipAuth; }
if (typeof window !== 'undefined') { window.normalizedSipAuth = normalizedSipAuth; }
if (typeof globalThis !== 'undefined') { globalThis.SingleInstance = SingleInstance; }
if (typeof window !== 'undefined') { window.SingleInstance = SingleInstance; }
if (typeof globalThis !== 'undefined') { globalThis.TransportConnectionTimeout = TransportConnectionTimeout; }
if (typeof window !== 'undefined') { window.TransportConnectionTimeout = TransportConnectionTimeout; }
if (typeof globalThis !== 'undefined') { globalThis.TransportReconnectionAttempts = TransportReconnectionAttempts; }
if (typeof window !== 'undefined') { window.TransportReconnectionAttempts = TransportReconnectionAttempts; }
if (typeof globalThis !== 'undefined') { globalThis.TransportReconnectionTimeout = TransportReconnectionTimeout; }
if (typeof window !== 'undefined') { window.TransportReconnectionTimeout = TransportReconnectionTimeout; }
if (typeof globalThis !== 'undefined') { globalThis.TransportManualDisconnect = TransportManualDisconnect; }
if (typeof window !== 'undefined') { window.TransportManualDisconnect = TransportManualDisconnect; }
if (typeof globalThis !== 'undefined') { globalThis.SubscribeToYourself = SubscribeToYourself; }
if (typeof window !== 'undefined') { window.SubscribeToYourself = SubscribeToYourself; }
if (typeof globalThis !== 'undefined') { globalThis.VoiceMailSubscribe = VoiceMailSubscribe; }
if (typeof window !== 'undefined') { window.VoiceMailSubscribe = VoiceMailSubscribe; }
if (typeof globalThis !== 'undefined') { globalThis.VoicemailDid = VoicemailDid; }
if (typeof window !== 'undefined') { window.VoicemailDid = VoicemailDid; }
if (typeof globalThis !== 'undefined') { globalThis.SubscribeVoicemailExpires = SubscribeVoicemailExpires; }
if (typeof window !== 'undefined') { window.SubscribeVoicemailExpires = SubscribeVoicemailExpires; }
if (typeof globalThis !== 'undefined') { globalThis.ContactUserName = ContactUserName; }
if (typeof window !== 'undefined') { window.ContactUserName = ContactUserName; }
if (typeof globalThis !== 'undefined') { globalThis.userAgentStr = userAgentStr; }
if (typeof window !== 'undefined') { window.userAgentStr = userAgentStr; }
if (typeof globalThis !== 'undefined') { globalThis.hostingPrefix = hostingPrefix; }
if (typeof window !== 'undefined') { window.hostingPrefix = hostingPrefix; }
if (typeof globalThis !== 'undefined') { globalThis.AppIcon = AppIcon; }
if (typeof window !== 'undefined') { window.AppIcon = AppIcon; }
if (typeof globalThis !== 'undefined') { globalThis.NotificationIcon = NotificationIcon; }
if (typeof window !== 'undefined') { window.NotificationIcon = NotificationIcon; }
if (typeof globalThis !== 'undefined') { globalThis.DefaultProfileIcon = DefaultProfileIcon; }
if (typeof window !== 'undefined') { window.DefaultProfileIcon = DefaultProfileIcon; }
if (typeof globalThis !== 'undefined') { globalThis.RegisterExpires = RegisterExpires; }
if (typeof window !== 'undefined') { window.RegisterExpires = RegisterExpires; }
if (typeof globalThis !== 'undefined') { globalThis.RegisterExtraHeaders = RegisterExtraHeaders; }
if (typeof window !== 'undefined') { window.RegisterExtraHeaders = RegisterExtraHeaders; }
if (typeof globalThis !== 'undefined') { globalThis.RegisterExtraContactParams = RegisterExtraContactParams; }
if (typeof window !== 'undefined') { window.RegisterExtraContactParams = RegisterExtraContactParams; }
if (typeof globalThis !== 'undefined') { globalThis.RegisterContactParams = RegisterContactParams; }
if (typeof window !== 'undefined') { window.RegisterContactParams = RegisterContactParams; }
if (typeof globalThis !== 'undefined') { globalThis.WssInTransport = WssInTransport; }
if (typeof window !== 'undefined') { window.WssInTransport = WssInTransport; }
if (typeof globalThis !== 'undefined') { globalThis.IpInContact = IpInContact; }
if (typeof window !== 'undefined') { window.IpInContact = IpInContact; }
if (typeof globalThis !== 'undefined') { globalThis.BundlePolicy = BundlePolicy; }
if (typeof window !== 'undefined') { window.BundlePolicy = BundlePolicy; }
if (typeof globalThis !== 'undefined') { globalThis.IceStunServerJson = IceStunServerJson; }
if (typeof window !== 'undefined') { window.IceStunServerJson = IceStunServerJson; }
if (typeof globalThis !== 'undefined') { globalThis.IceStunCheckTimeout = IceStunCheckTimeout; }
if (typeof window !== 'undefined') { window.IceStunCheckTimeout = IceStunCheckTimeout; }
if (typeof globalThis !== 'undefined') { globalThis.SubscribeBuddyAccept = SubscribeBuddyAccept; }
if (typeof window !== 'undefined') { window.SubscribeBuddyAccept = SubscribeBuddyAccept; }
if (typeof globalThis !== 'undefined') { globalThis.SubscribeBuddyEvent = SubscribeBuddyEvent; }
if (typeof window !== 'undefined') { window.SubscribeBuddyEvent = SubscribeBuddyEvent; }
if (typeof globalThis !== 'undefined') { globalThis.SubscribeBuddyExpires = SubscribeBuddyExpires; }
if (typeof window !== 'undefined') { window.SubscribeBuddyExpires = SubscribeBuddyExpires; }
if (typeof globalThis !== 'undefined') { globalThis.ProfileDisplayPrefix = ProfileDisplayPrefix; }
if (typeof window !== 'undefined') { window.ProfileDisplayPrefix = ProfileDisplayPrefix; }
if (typeof globalThis !== 'undefined') { globalThis.ProfileDisplayPrefixSeparator = ProfileDisplayPrefixSeparator; }
if (typeof window !== 'undefined') { window.ProfileDisplayPrefixSeparator = ProfileDisplayPrefixSeparator; }
if (typeof globalThis !== 'undefined') { globalThis.InviteExtraHeaders = InviteExtraHeaders; }
if (typeof window !== 'undefined') { window.InviteExtraHeaders = InviteExtraHeaders; }
if (typeof globalThis !== 'undefined') { globalThis.NoAnswerTimeout = NoAnswerTimeout; }
if (typeof window !== 'undefined') { window.NoAnswerTimeout = NoAnswerTimeout; }
if (typeof globalThis !== 'undefined') { globalThis.KeyboardShortcuts = KeyboardShortcuts; }
if (typeof window !== 'undefined') { window.KeyboardShortcuts = KeyboardShortcuts; }
if (typeof globalThis !== 'undefined') { globalThis.AutoAnswerEnabled = AutoAnswerEnabled; }
if (typeof window !== 'undefined') { window.AutoAnswerEnabled = AutoAnswerEnabled; }
if (typeof globalThis !== 'undefined') { globalThis.DoNotDisturbEnabled = DoNotDisturbEnabled; }
if (typeof window !== 'undefined') { window.DoNotDisturbEnabled = DoNotDisturbEnabled; }
if (typeof globalThis !== 'undefined') { globalThis.CallWaitingEnabled = CallWaitingEnabled; }
if (typeof window !== 'undefined') { window.CallWaitingEnabled = CallWaitingEnabled; }
if (typeof globalThis !== 'undefined') { globalThis.RecordAllCalls = RecordAllCalls; }
if (typeof window !== 'undefined') { window.RecordAllCalls = RecordAllCalls; }
if (typeof globalThis !== 'undefined') { globalThis.StartVideoFullScreen = StartVideoFullScreen; }
if (typeof window !== 'undefined') { window.StartVideoFullScreen = StartVideoFullScreen; }
if (typeof globalThis !== 'undefined') { globalThis.SelectRingingLine = SelectRingingLine; }
if (typeof window !== 'undefined') { window.SelectRingingLine = SelectRingingLine; }
if (typeof globalThis !== 'undefined') { globalThis.UiMaxWidth = UiMaxWidth; }
if (typeof window !== 'undefined') { window.UiMaxWidth = UiMaxWidth; }
if (typeof globalThis !== 'undefined') { globalThis.UiThemeStyle = UiThemeStyle; }
if (typeof window !== 'undefined') { window.UiThemeStyle = UiThemeStyle; }
if (typeof globalThis !== 'undefined') { globalThis.UiMessageLayout = UiMessageLayout; }
if (typeof window !== 'undefined') { window.UiMessageLayout = UiMessageLayout; }
if (typeof globalThis !== 'undefined') { globalThis.UiCustomConfigMenu = UiCustomConfigMenu; }
if (typeof window !== 'undefined') { window.UiCustomConfigMenu = UiCustomConfigMenu; }
if (typeof globalThis !== 'undefined') { globalThis.UiCustomDialButton = UiCustomDialButton; }
if (typeof window !== 'undefined') { window.UiCustomDialButton = UiCustomDialButton; }
if (typeof globalThis !== 'undefined') { globalThis.UiCustomSortAndFilterButton = UiCustomSortAndFilterButton; }
if (typeof window !== 'undefined') { window.UiCustomSortAndFilterButton = UiCustomSortAndFilterButton; }
if (typeof globalThis !== 'undefined') { globalThis.UiCustomAddBuddy = UiCustomAddBuddy; }
if (typeof window !== 'undefined') { window.UiCustomAddBuddy = UiCustomAddBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.UiCustomEditBuddy = UiCustomEditBuddy; }
if (typeof window !== 'undefined') { window.UiCustomEditBuddy = UiCustomEditBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.UiCustomMediaSettings = UiCustomMediaSettings; }
if (typeof window !== 'undefined') { window.UiCustomMediaSettings = UiCustomMediaSettings; }
if (typeof globalThis !== 'undefined') { globalThis.UiCustomMessageAction = UiCustomMessageAction; }
if (typeof window !== 'undefined') { window.UiCustomMessageAction = UiCustomMessageAction; }
if (typeof globalThis !== 'undefined') { globalThis.TraceSip = TraceSip; }
if (typeof window !== 'undefined') { window.TraceSip = TraceSip; }
if (typeof globalThis !== 'undefined') { globalThis.HideSettingsButton = HideSettingsButton; }
if (typeof window !== 'undefined') { window.HideSettingsButton = HideSettingsButton; }
if (typeof globalThis !== 'undefined') { globalThis.HideRecordAllCallsButton = HideRecordAllCallsButton; }
if (typeof window !== 'undefined') { window.HideRecordAllCallsButton = HideRecordAllCallsButton; }
if (typeof globalThis !== 'undefined') { globalThis.AutoGainControl = AutoGainControl; }
if (typeof window !== 'undefined') { window.AutoGainControl = AutoGainControl; }
if (typeof globalThis !== 'undefined') { globalThis.EchoCancellation = EchoCancellation; }
if (typeof window !== 'undefined') { window.EchoCancellation = EchoCancellation; }
if (typeof globalThis !== 'undefined') { globalThis.NoiseSuppression = NoiseSuppression; }
if (typeof window !== 'undefined') { window.NoiseSuppression = NoiseSuppression; }
if (typeof globalThis !== 'undefined') { globalThis.MirrorVideo = MirrorVideo; }
if (typeof window !== 'undefined') { window.MirrorVideo = MirrorVideo; }
if (typeof globalThis !== 'undefined') { globalThis.maxFrameRate = maxFrameRate; }
if (typeof window !== 'undefined') { window.maxFrameRate = maxFrameRate; }
if (typeof globalThis !== 'undefined') { globalThis.videoHeight = videoHeight; }
if (typeof window !== 'undefined') { window.videoHeight = videoHeight; }
if (typeof globalThis !== 'undefined') { globalThis.MaxVideoBandwidth = MaxVideoBandwidth; }
if (typeof window !== 'undefined') { window.MaxVideoBandwidth = MaxVideoBandwidth; }
if (typeof globalThis !== 'undefined') { globalThis.videoAspectRatio = videoAspectRatio; }
if (typeof window !== 'undefined') { window.videoAspectRatio = videoAspectRatio; }
if (typeof globalThis !== 'undefined') { globalThis.NotificationsActive = NotificationsActive; }
if (typeof window !== 'undefined') { window.NotificationsActive = NotificationsActive; }
if (typeof globalThis !== 'undefined') { globalThis.StreamBuffer = StreamBuffer; }
if (typeof window !== 'undefined') { window.StreamBuffer = StreamBuffer; }
if (typeof globalThis !== 'undefined') { globalThis.MaxDataStoreDays = MaxDataStoreDays; }
if (typeof window !== 'undefined') { window.MaxDataStoreDays = MaxDataStoreDays; }
if (typeof globalThis !== 'undefined') { globalThis.MaxRecentRecords = MaxRecentRecords; }
if (typeof window !== 'undefined') { window.MaxRecentRecords = MaxRecentRecords; }
if (typeof globalThis !== 'undefined') { globalThis.PosterJpegQuality = PosterJpegQuality; }
if (typeof window !== 'undefined') { window.PosterJpegQuality = PosterJpegQuality; }
if (typeof globalThis !== 'undefined') { globalThis.VideoResampleSize = VideoResampleSize; }
if (typeof window !== 'undefined') { window.VideoResampleSize = VideoResampleSize; }
if (typeof globalThis !== 'undefined') { globalThis.RecordingVideoSize = RecordingVideoSize; }
if (typeof window !== 'undefined') { window.RecordingVideoSize = RecordingVideoSize; }
if (typeof globalThis !== 'undefined') { globalThis.RecordingVideoFps = RecordingVideoFps; }
if (typeof window !== 'undefined') { window.RecordingVideoFps = RecordingVideoFps; }
if (typeof globalThis !== 'undefined') { globalThis.RecordingLayout = RecordingLayout; }
if (typeof window !== 'undefined') { window.RecordingLayout = RecordingLayout; }
if (typeof globalThis !== 'undefined') { globalThis.DidLength = DidLength; }
if (typeof window !== 'undefined') { window.DidLength = DidLength; }
if (typeof globalThis !== 'undefined') { globalThis.MaxDidLength = MaxDidLength; }
if (typeof window !== 'undefined') { window.MaxDidLength = MaxDidLength; }
if (typeof globalThis !== 'undefined') { globalThis.DisplayDateFormat = DisplayDateFormat; }
if (typeof window !== 'undefined') { window.DisplayDateFormat = DisplayDateFormat; }
if (typeof globalThis !== 'undefined') { globalThis.DisplayTimeFormat = DisplayTimeFormat; }
if (typeof window !== 'undefined') { window.DisplayTimeFormat = DisplayTimeFormat; }
if (typeof globalThis !== 'undefined') { globalThis.Language = Language; }
if (typeof window !== 'undefined') { window.Language = Language; }
if (typeof globalThis !== 'undefined') { globalThis.BuddySortBy = BuddySortBy; }
if (typeof window !== 'undefined') { window.BuddySortBy = BuddySortBy; }
if (typeof globalThis !== 'undefined') { globalThis.SortByTypeOrder = SortByTypeOrder; }
if (typeof window !== 'undefined') { window.SortByTypeOrder = SortByTypeOrder; }
if (typeof globalThis !== 'undefined') { globalThis.BuddyAutoDeleteAtEnd = BuddyAutoDeleteAtEnd; }
if (typeof window !== 'undefined') { window.BuddyAutoDeleteAtEnd = BuddyAutoDeleteAtEnd; }
if (typeof globalThis !== 'undefined') { globalThis.HideAutoDeleteBuddies = HideAutoDeleteBuddies; }
if (typeof window !== 'undefined') { window.HideAutoDeleteBuddies = HideAutoDeleteBuddies; }
if (typeof globalThis !== 'undefined') { globalThis.BuddyShowExtenNum = BuddyShowExtenNum; }
if (typeof window !== 'undefined') { window.BuddyShowExtenNum = BuddyShowExtenNum; }
if (typeof globalThis !== 'undefined') { globalThis.DisableFreeDial = DisableFreeDial; }
if (typeof window !== 'undefined') { window.DisableFreeDial = DisableFreeDial; }
if (typeof globalThis !== 'undefined') { globalThis.DisableBuddies = DisableBuddies; }
if (typeof window !== 'undefined') { window.DisableBuddies = DisableBuddies; }
if (typeof globalThis !== 'undefined') { globalThis.EnableTransfer = EnableTransfer; }
if (typeof window !== 'undefined') { window.EnableTransfer = EnableTransfer; }
if (typeof globalThis !== 'undefined') { globalThis.EnableConference = EnableConference; }
if (typeof window !== 'undefined') { window.EnableConference = EnableConference; }
if (typeof globalThis !== 'undefined') { globalThis.AutoAnswerPolicy = AutoAnswerPolicy; }
if (typeof window !== 'undefined') { window.AutoAnswerPolicy = AutoAnswerPolicy; }
if (typeof globalThis !== 'undefined') { globalThis.DoNotDisturbPolicy = DoNotDisturbPolicy; }
if (typeof window !== 'undefined') { window.DoNotDisturbPolicy = DoNotDisturbPolicy; }
if (typeof globalThis !== 'undefined') { globalThis.CallWaitingPolicy = CallWaitingPolicy; }
if (typeof window !== 'undefined') { window.CallWaitingPolicy = CallWaitingPolicy; }
if (typeof globalThis !== 'undefined') { globalThis.CallRecordingPolicy = CallRecordingPolicy; }
if (typeof window !== 'undefined') { window.CallRecordingPolicy = CallRecordingPolicy; }
if (typeof globalThis !== 'undefined') { globalThis.IntercomPolicy = IntercomPolicy; }
if (typeof window !== 'undefined') { window.IntercomPolicy = IntercomPolicy; }
if (typeof globalThis !== 'undefined') { globalThis.EnableAccountSettings = EnableAccountSettings; }
if (typeof window !== 'undefined') { window.EnableAccountSettings = EnableAccountSettings; }
if (typeof globalThis !== 'undefined') { globalThis.EnableAppearanceSettings = EnableAppearanceSettings; }
if (typeof window !== 'undefined') { window.EnableAppearanceSettings = EnableAppearanceSettings; }
if (typeof globalThis !== 'undefined') { globalThis.EnableNotificationSettings = EnableNotificationSettings; }
if (typeof window !== 'undefined') { window.EnableNotificationSettings = EnableNotificationSettings; }
if (typeof globalThis !== 'undefined') { globalThis.EnableAlphanumericDial = EnableAlphanumericDial; }
if (typeof window !== 'undefined') { window.EnableAlphanumericDial = EnableAlphanumericDial; }
if (typeof globalThis !== 'undefined') { globalThis.EnableVideoCalling = EnableVideoCalling; }
if (typeof window !== 'undefined') { window.EnableVideoCalling = EnableVideoCalling; }
if (typeof globalThis !== 'undefined') { globalThis.EnableTextExpressions = EnableTextExpressions; }
if (typeof window !== 'undefined') { window.EnableTextExpressions = EnableTextExpressions; }
if (typeof globalThis !== 'undefined') { globalThis.EnableTextDictate = EnableTextDictate; }
if (typeof window !== 'undefined') { window.EnableTextDictate = EnableTextDictate; }
if (typeof globalThis !== 'undefined') { globalThis.EnableRingtone = EnableRingtone; }
if (typeof window !== 'undefined') { window.EnableRingtone = EnableRingtone; }
if (typeof globalThis !== 'undefined') { globalThis.MaxBuddies = MaxBuddies; }
if (typeof window !== 'undefined') { window.MaxBuddies = MaxBuddies; }
if (typeof globalThis !== 'undefined') { globalThis.MaxBuddyAge = MaxBuddyAge; }
if (typeof window !== 'undefined') { window.MaxBuddyAge = MaxBuddyAge; }
if (typeof globalThis !== 'undefined') { globalThis.AutoDeleteDefault = AutoDeleteDefault; }
if (typeof window !== 'undefined') { window.AutoDeleteDefault = AutoDeleteDefault; }
if (typeof globalThis !== 'undefined') { globalThis.EnableSendFiles = EnableSendFiles; }
if (typeof window !== 'undefined') { window.EnableSendFiles = EnableSendFiles; }
if (typeof globalThis !== 'undefined') { globalThis.EnableSendImages = EnableSendImages; }
if (typeof window !== 'undefined') { window.EnableSendImages = EnableSendImages; }
if (typeof globalThis !== 'undefined') { globalThis.EnableAudioRecording = EnableAudioRecording; }
if (typeof window !== 'undefined') { window.EnableAudioRecording = EnableAudioRecording; }
if (typeof globalThis !== 'undefined') { globalThis.EnableVideoRecording = EnableVideoRecording; }
if (typeof window !== 'undefined') { window.EnableVideoRecording = EnableVideoRecording; }
if (typeof globalThis !== 'undefined') { globalThis.EnableSms = EnableSms; }
if (typeof window !== 'undefined') { window.EnableSms = EnableSms; }
if (typeof globalThis !== 'undefined') { globalThis.EnableFax = EnableFax; }
if (typeof window !== 'undefined') { window.EnableFax = EnableFax; }
if (typeof globalThis !== 'undefined') { globalThis.EnableEmail = EnableEmail; }
if (typeof window !== 'undefined') { window.EnableEmail = EnableEmail; }
if (typeof globalThis !== 'undefined') { globalThis.userAgent = userAgent; }
if (typeof window !== 'undefined') { window.userAgent = userAgent; }
if (typeof globalThis !== 'undefined') { globalThis.CanvasCollection = CanvasCollection; }
if (typeof window !== 'undefined') { window.CanvasCollection = CanvasCollection; }
if (typeof globalThis !== 'undefined') { globalThis.Buddies = Buddies; }
if (typeof window !== 'undefined') { window.Buddies = Buddies; }
if (typeof globalThis !== 'undefined') { globalThis.selectedBuddy = selectedBuddy; }
if (typeof window !== 'undefined') { window.selectedBuddy = selectedBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.selectedLine = selectedLine; }
if (typeof window !== 'undefined') { window.selectedLine = selectedLine; }
if (typeof globalThis !== 'undefined') { globalThis.windowObj = windowObj; }
if (typeof window !== 'undefined') { window.windowObj = windowObj; }
if (typeof globalThis !== 'undefined') { globalThis.skipNextWindowAutoCenter = skipNextWindowAutoCenter; }
if (typeof window !== 'undefined') { window.skipNextWindowAutoCenter = skipNextWindowAutoCenter; }
if (typeof globalThis !== 'undefined') { globalThis.dtmfInlinePanelState = dtmfInlinePanelState; }
if (typeof window !== 'undefined') { window.dtmfInlinePanelState = dtmfInlinePanelState; }
if (typeof globalThis !== 'undefined') { globalThis.alertObj = alertObj; }
if (typeof window !== 'undefined') { window.alertObj = alertObj; }
if (typeof globalThis !== 'undefined') { globalThis.confirmObj = confirmObj; }
if (typeof window !== 'undefined') { window.confirmObj = confirmObj; }
if (typeof globalThis !== 'undefined') { globalThis.promptObj = promptObj; }
if (typeof window !== 'undefined') { window.promptObj = promptObj; }
if (typeof globalThis !== 'undefined') { globalThis.menuObj = menuObj; }
if (typeof window !== 'undefined') { window.menuObj = menuObj; }
if (typeof globalThis !== 'undefined') { globalThis.popupAnchorEl = popupAnchorEl; }
if (typeof window !== 'undefined') { window.popupAnchorEl = popupAnchorEl; }
if (typeof globalThis !== 'undefined') { globalThis.HasVideoDevice = HasVideoDevice; }
if (typeof window !== 'undefined') { window.HasVideoDevice = HasVideoDevice; }
if (typeof globalThis !== 'undefined') { globalThis.HasAudioDevice = HasAudioDevice; }
if (typeof window !== 'undefined') { window.HasAudioDevice = HasAudioDevice; }
if (typeof globalThis !== 'undefined') { globalThis.HasSpeakerDevice = HasSpeakerDevice; }
if (typeof window !== 'undefined') { window.HasSpeakerDevice = HasSpeakerDevice; }
if (typeof globalThis !== 'undefined') { globalThis.AudioinputDevices = AudioinputDevices; }
if (typeof window !== 'undefined') { window.AudioinputDevices = AudioinputDevices; }
if (typeof globalThis !== 'undefined') { globalThis.VideoinputDevices = VideoinputDevices; }
if (typeof window !== 'undefined') { window.VideoinputDevices = VideoinputDevices; }
if (typeof globalThis !== 'undefined') { globalThis.SpeakerDevices = SpeakerDevices; }
if (typeof window !== 'undefined') { window.SpeakerDevices = SpeakerDevices; }
if (typeof globalThis !== 'undefined') { globalThis.Lines = Lines; }
if (typeof window !== 'undefined') { window.Lines = Lines; }
if (typeof globalThis !== 'undefined') { globalThis.lang = lang; }
if (typeof window !== 'undefined') { window.lang = lang; }
if (typeof globalThis !== 'undefined') { globalThis.audioBlobs = audioBlobs; }
if (typeof window !== 'undefined') { window.audioBlobs = audioBlobs; }
if (typeof globalThis !== 'undefined') { globalThis.embeddedMediaMap = embeddedMediaMap; }
if (typeof window !== 'undefined') { window.embeddedMediaMap = embeddedMediaMap; }
if (typeof globalThis !== 'undefined') { globalThis.runtimeMediaConfig = runtimeMediaConfig; }
if (typeof window !== 'undefined') { window.runtimeMediaConfig = runtimeMediaConfig; }
if (typeof globalThis !== 'undefined') { globalThis.defaultMediaConfig = defaultMediaConfig; }
if (typeof window !== 'undefined') { window.defaultMediaConfig = defaultMediaConfig; }
if (typeof globalThis !== 'undefined') { globalThis.mediaConfigStorageKeys = mediaConfigStorageKeys; }
if (typeof window !== 'undefined') { window.mediaConfigStorageKeys = mediaConfigStorageKeys; }
if (typeof globalThis !== 'undefined') { globalThis.mediaUploadLimits = mediaUploadLimits; }
if (typeof window !== 'undefined') { window.mediaUploadLimits = mediaUploadLimits; }
if (typeof globalThis !== 'undefined') { globalThis.audioAutoplayUnlocked = audioAutoplayUnlocked; }
if (typeof window !== 'undefined') { window.audioAutoplayUnlocked = audioAutoplayUnlocked; }
if (typeof globalThis !== 'undefined') { globalThis.audioUnlockAttached = audioUnlockAttached; }
if (typeof window !== 'undefined') { window.audioUnlockAttached = audioUnlockAttached; }
if (typeof globalThis !== 'undefined') { globalThis.queuedAudioPlaybacks = queuedAudioPlaybacks; }
if (typeof window !== 'undefined') { window.queuedAudioPlaybacks = queuedAudioPlaybacks; }
