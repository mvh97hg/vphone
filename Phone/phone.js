const appversion = "0.3.34";
const sipjsversion = "0.20.0";
const navUserAgent = window.navigator.userAgent;
const instanceID = String(Date.now());
const localDB = window.localStorage;
let welcomeScreen = "<div class=\"UiWindowField\"><pre style=\"font-size: 12px\">";
welcomeScreen += "===========================================================================\n";
welcomeScreen += "Copyright © 2020 - All Rights Reserved\n";
welcomeScreen += "===========================================================================\n";
welcomeScreen += "\n";
welcomeScreen += "                            NO WARRANTY\n";
welcomeScreen += "\n";
welcomeScreen += "BECAUSE THE PROGRAM IS LICENSED FREE OF CHARGE, THERE IS NO WARRANTY\n";
welcomeScreen += "FOR THE PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW.  EXCEPT WHEN\n";
welcomeScreen += "OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES\n";
welcomeScreen += "PROVIDE THE PROGRAM \"AS IS\" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED\n";
welcomeScreen += "OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF\n";
welcomeScreen += "MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.  THE ENTIRE RISK AS\n";
welcomeScreen += "TO THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU.  SHOULD THE\n";
welcomeScreen += "PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL NECESSARY SERVICING,\n";
welcomeScreen += "REPAIR OR CORRECTION.\n";
welcomeScreen += "\n";
welcomeScreen += "IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING\n";
welcomeScreen += "WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MAY MODIFY AND/OR\n";
welcomeScreen += "REDISTRIBUTE THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES,\n";
welcomeScreen += "INCLUDING ANY GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING\n";
welcomeScreen += "OUT OF THE USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED\n";
welcomeScreen += "TO LOSS OF DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY\n";
welcomeScreen += "YOU OR THIRD PARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER\n";
welcomeScreen += "PROGRAMS), EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE\n";
welcomeScreen += "POSSIBILITY OF SUCH DAMAGES.\n";
welcomeScreen += "\n";
welcomeScreen += "============================================================================\n</pre>";
welcomeScreen += "</div>";
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
let userAgentStr = getDbItem("UserAgentStr", "VPhone "+ appversion +" (SIPJS - "+ sipjsversion +") "+ navUserAgent);
let hostingPrefix = getDbItem("HostingPrefix", "");
let AppIcon = getDbItem("AppIcon", "icons/phone.svg");
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
function normalizeBooleanFlag(value, defaultValue){
    if(value === undefined || value === null || value === "") return !!defaultValue;
    if(typeof value === "boolean") return value;
    if(typeof value === "number") return value !== 0;
    var normalized = String(value).toLowerCase().trim();
    if(normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") return false;
    if(normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") return true;
    return !!defaultValue;
}
let newLineNumber = 1;
let telNumericRegEx = /[^\d\*\#\+]/g
let telAlphanumericRegEx = /[^\da-zA-Z\*\#\+\-\_\.\!\~\'\(\)]/g

let settingsMicrophoneStream = null;
let settingsMicrophoneStreamTrack = null;
let settingsMicrophoneSoundMeter = null;

let settingsVideoStream = null;
let settingsVideoStreamTrack = null;
let authModeFallbackTried = false;

let CallRecordingsIndexDb = null;
let CallQosDataIndexDb = null;
function uID(){
    return Date.now()+Math.floor(Math.random()*10000).toString(16).toUpperCase();
}
function utcDateNow(){
    return moment().utc().format("YYYY-MM-DD HH:mm:ss UTC");
}
function getDbItem(itemIndex, defaultValue){
    if(localDB.getItem(itemIndex) != null) return localDB.getItem(itemIndex);
    return defaultValue;
}
function IsAutoplayBlockedError(err){
    if(!err) return false;
    var name = String(err.name || "");
    var msg = String(err.message || "").toLowerCase();
    return name == "NotAllowedError" || msg.indexOf("didn't interact") > -1 || msg.indexOf("interact with the document first") > -1;
}
function FlushQueuedAudioPlayback(){
    if(!queuedAudioPlaybacks.length) return;
    var queueCopy = queuedAudioPlaybacks.slice(0);
    queuedAudioPlaybacks = [];
    for(var i=0; i<queueCopy.length; i++){
        try {
            queueCopy[i]();
        } catch(e){
            console.warn("Queued audio replay failed", e);
        }
    }
}
function MarkAudioInteractionAndUnlock(){
    audioAutoplayUnlocked = true;
    FlushQueuedAudioPlayback();
}
function EnsureAudioUnlockListeners(){
    if(audioUnlockAttached) return;
    audioUnlockAttached = true;
    var unlockEvents = ["pointerdown", "touchstart", "mousedown", "keydown"];
    for(var i=0; i<unlockEvents.length; i++){
        document.addEventListener(unlockEvents[i], MarkAudioInteractionAndUnlock, { passive: true });
    }
}
function PlayMediaElementSafely(mediaElement, label){
    if(!mediaElement || typeof mediaElement.play !== "function") return;
    var playPromise = null;
    try {
        playPromise = mediaElement.play();
    } catch(err){
        if(IsAutoplayBlockedError(err)){
            EnsureAudioUnlockListeners();
            queuedAudioPlaybacks.push(function(){ PlayMediaElementSafely(mediaElement, label); });
            console.warn("Audio blocked until user interacts:", label || "media");
            return;
        }
        console.warn("Unable to play media element:", label || "media", err);
        return;
    }
    if(playPromise && typeof playPromise.then === "function"){
        playPromise.then(function(){
            audioAutoplayUnlocked = true;
        }).catch(function(err){
            if(IsAutoplayBlockedError(err)){
                EnsureAudioUnlockListeners();
                queuedAudioPlaybacks.push(function(){ PlayMediaElementSafely(mediaElement, label); });
                console.warn("Audio blocked until user interacts:", label || "media");
                return;
            }
            console.warn("Unable to play media element:", label || "media", err);
        });
    }
}
window.addEventListener("unhandledrejection", function(event){
    try {
        var reason = String((event && event.reason) ? event.reason : "");
        if(reason.indexOf('FN_NOT_FOUND: "siteFrame.closeSiteFrame"') > -1 ||
           reason.indexOf('FN_NOT_FOUND: "cardFrame.closeCardFrame"') > -1 ||
           reason.indexOf('FN_NOT_FOUND: "passkey.closePasskeyConditionalList"') > -1 ||
           reason.indexOf("isAutoSaveDisabled") > -1){
            event.preventDefault();
        }
    } catch(e){}
});
function IsMd5Hex32(value){
    return /^[a-f0-9]{32}$/i.test(String(value || "").trim());
}
function NormalizeSipPasswordAndType(rawPassword, rawType){
    var password = String(rawPassword || "").trim();
    var type = String(rawType || "").toLowerCase().trim();
    var prefixedMd5Match = password.match(/^(?:md5|ha1)\s*[:=]\s*([a-f0-9]{32})$/i);
    if(prefixedMd5Match){
        password = prefixedMd5Match[1];
    }

    var isMd5Hex = IsMd5Hex32(password);

    if(type === "ha1" && isMd5Hex){
        return { password: password.toLowerCase(), type: "ha1" };
    }
    if(type === "plain"){
        return { password: password, type: "plain" };
    }
    if(type === "ha1" && !isMd5Hex){
        return { password: password, type: "plain" };
    }
    if(isMd5Hex){
        return { password: password.toLowerCase(), type: "ha1" };
    }
    return { password: password, type: "plain" };
}
function TryAuthModeFallbackOnRegisterFailure(statusCode){
    if(authModeFallbackTried) return false;
    if(statusCode != 401 && statusCode != 403) return false;

    var nextType = (SipPasswordType === "ha1") ? "plain" : "ha1";
    authModeFallbackTried = true;

    console.warn("Register auth fallback:", SipPasswordType, "->", nextType);
    SipPasswordType = nextType;

    try {
        if(userAgent && userAgent.transport && userAgent.transport._ws){
            userAgent.transport._ws.onclose = function(){};
            userAgent.transport._ws.onerror = function(){};
            userAgent.transport._ws.onopen = function(){};
            userAgent.transport._ws.onmessage = function(){};
            userAgent.transport._ws.close(3000, "Auth fallback reconnect");
        }
    } catch(e){}

    userAgent = null;
    window.setTimeout(function(){
        CreateUserAgent();
    }, 150);

    return true;
}
function EnsureBuddyStorageKeys(){
    var hasProfileId = (profileUserID != null && profileUserID != "" && profileUserID != "null" && profileUserID != "undefined");
    var legacyKeys = ["null-Buddies", "undefined-Buddies", "-Buddies"];

    if(hasProfileId){
        var currentKey = profileUserID + "-Buddies";
        if(localDB.getItem(currentKey) != null) return;
        for(var i = 0; i < legacyKeys.length; i++){
            var oldVal = localDB.getItem(legacyKeys[i]);
            if(oldVal != null){
                localDB.setItem(currentKey, oldVal);
                console.warn("Recovered buddy storage from", legacyKeys[i], "to", currentKey);
                return;
            }
        }
        return;
    }
    var legacyData = null;
    for(var j = 0; j < legacyKeys.length; j++){
        legacyData = localDB.getItem(legacyKeys[j]);
        if(legacyData != null){
            profileUserID = uID();
            localDB.setItem("profileUserID", profileUserID);
            localDB.setItem(profileUserID + "-Buddies", legacyData);
            console.warn("Assigned new profileUserID and recovered buddy storage from", legacyKeys[j]);
            return;
        }
    }
}
function RemoveSeedSampleStorageData(){
    var sampleContactId = "sample-contact-v1";
    var sampleCdrId = "sample-cdr-v1";

    if(profileUserID && profileUserID != ""){
        var buddiesKey = profileUserID + "-Buddies";
        var buddiesJson = JSON.parse(localDB.getItem(buddiesKey));
        if(buddiesJson && buddiesJson.DataCollection){
            buddiesJson.DataCollection = $.grep(buddiesJson.DataCollection, function(item){
                return !(item && item.Type == "contact" && item.cID == sampleContactId);
            });
            buddiesJson.TotalRows = buddiesJson.DataCollection.length;
            localDB.setItem(buddiesKey, JSON.stringify(buddiesJson));
        }
    }

    localDB.removeItem(sampleContactId + "-stream");

    for(var k = 0; k < localDB.length; k++){
        var storageKey = localDB.key(k);
        if(!storageKey || storageKey.length <= 7) continue;
        if(storageKey.substring(storageKey.length - 7) != "-stream") continue;

        var stream = JSON.parse(localDB.getItem(storageKey));
        if(stream == null || stream.DataCollection == null) continue;
        var before = stream.DataCollection.length;
        stream.DataCollection = $.grep(stream.DataCollection, function(item){
            if(!item || item.ItemType != "CDR") return true;
            return item.CdrId != sampleCdrId;
        });
        if(stream.DataCollection.length != before){
            stream.TotalRows = stream.DataCollection.length;
            localDB.setItem(storageKey, JSON.stringify(stream));
        }
    }

    localDB.removeItem("SeedSampleDataV1");
}
function getAudioSrcID(){
    var id = localDB.getItem("AudioSrcId");
    return (id != null)? id : "default";
}
function getAudioOutputID(){
    var id = localDB.getItem("AudioOutputId");
    return (id != null)? id : "default";
}
function getVideoSrcID(){
    var id = localDB.getItem("VideoSrcId");
    return (id != null)? id : "default";
}
function getRingerOutputID(){
    var id = localDB.getItem("RingOutputId");
    return (id != null)? id : "default";
}
function isAbsoluteIconPath(pathValue){
    var val = String(pathValue || "").trim();
    if(val == "") return false;
    return /^(data:|https?:\/\/|blob:|file:\/\/|\/|[a-zA-Z]:[\\/])/.test(val);
}
function resolveIconUrl(pathValue, fallbackRelative){
    var raw = String(pathValue || "").trim();
    if(raw == "") raw = String(fallbackRelative || "").trim();
    if(raw == "") raw = "icons/phone4.png";
    if(isAbsoluteIconPath(raw)) return raw;
    return hostingPrefix + raw.replace(/^\.\//, "");
}
function getAppIconUrl(){
    return resolveIconUrl(AppIcon, "icons/phone4.png");
}
function getNotificationIconUrl(){
    return resolveIconUrl(NotificationIcon, getAppIconUrl());
}
function getDefaultProfileIconUrl(){
    return resolveIconUrl(DefaultProfileIcon, getAppIconUrl());
}
function applyRuntimeDocumentIcons(){
    var appIconUrl = getAppIconUrl();
    var iconLinks = document.querySelectorAll("link[rel='icon'], link[rel='apple-touch-icon']");
    for(var i = 0; i < iconLinks.length; i++){
        iconLinks[i].setAttribute("href", appIconUrl);
    }
}
function PadClockPart(value){
    return (value > 9 ? "" : "0") + value;
}
function FormatDurationClock(seconds){
    var sec = Math.floor(parseFloat(seconds));
    if(sec < 0) return sec;
    var duration = moment.duration(sec, 'seconds');
    var hours = PadClockPart(Math.floor(duration.asHours()));
    var minutes = PadClockPart(duration.minutes());
    var seconds = PadClockPart(duration.seconds());
    if(sec >= 60 * 60) return hours + ":" + minutes + ":" + seconds;
    return minutes + ":" + seconds;
}
function formatShortDuration(seconds){
    var sec = Math.floor(parseFloat(seconds));
    if(sec < 0){
        return sec;
    }
    return FormatDurationClock(sec);
}
function UserLocale(){
    var language = window.navigator.userLanguage || window.navigator.language;
    langtag = language.split('-');
    if(langtag.length == 1){
        return "";
    }
    else if(langtag.length == 2) {
        return langtag[1].toLowerCase();
    }
    else if(langtag.length >= 3) {
        return langtag[1].toLowerCase();
    }
}
function GetAlternateLanguage(){
    var userLanguage = window.navigator.userLanguage || window.navigator.language;
    if(Language != "auto") userLanguage = Language;
    userLanguage = userLanguage.toLowerCase();
    if(userLanguage == "en" || userLanguage.indexOf("en-") == 0) return "";

    for(l = 0; l < availableLang.length; l++){
        if(userLanguage.indexOf(availableLang[l].toLowerCase()) == 0){
            console.log("Alternate Language detected: ", userLanguage);
            moment.locale(userLanguage);
            return availableLang[l].toLowerCase();
        }
    }
    return "";
}
function ResolveLanguageFromPacks(baseLang, allPacks){
    var resolved = Object.assign({}, baseLang || {});
    var userLang = GetAlternateLanguage();
    var forceAlternateLang = (String(Language || "").toLowerCase() != "" && String(Language || "").toLowerCase() != "auto" && String(Language || "").toLowerCase() != "en");

    if((loadAlternateLang == true || forceAlternateLang == true) && userLang != ""){
        if(allPacks && allPacks[userLang]){
            if(typeof web_hook_on_language_pack_loaded !== 'undefined') web_hook_on_language_pack_loaded(allPacks[userLang]);
            resolved = Object.assign({}, baseLang, allPacks[userLang]);
        }
        else {
            console.warn("Alternate language pack not embedded:", userLang);
        }
    }
    else {
        if(userLang == "") console.log("No Alternate Language Found.");
    }

    return resolved;
}
function base64toBlob(base64Data, contentType) {
    if(base64Data.indexOf("," != -1)) base64Data = base64Data.split(",")[1];
    var byteCharacters = atob(base64Data);
    var slicesCount = Math.ceil(byteCharacters.length / 1024);
    var byteArrays = new Array(slicesCount);
    for (var s = 0; s < slicesCount; ++s) {
        var begin = s * 1024;
        var end = Math.min(begin + 1024, byteCharacters.length);
        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[s] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}
function MakeDataArray(defaultValue, count){
    var rtnArray = new Array(count);
    for(var i=0; i< rtnArray.length; i++) {
        rtnArray[i] = defaultValue;
    }
    return rtnArray;
}
function GetUiText(primaryKey, fallbackText, secondaryKey){
    if(typeof lang !== "object" || lang == null) return fallbackText;
    if(primaryKey && typeof lang[primaryKey] === "string" && $.trim(lang[primaryKey]) !== "") return lang[primaryKey];
    if(secondaryKey && typeof lang[secondaryKey] === "string" && $.trim(lang[secondaryKey]) !== "") return lang[secondaryKey];
    return fallbackText;
}
function ApplyMobileLabels(){
    $("#tab-dialpad").attr("data-label", GetUiText("mobile_tab_dialpad", "Dialpad", null));
    $("#tab-recents").attr("data-label", GetUiText("mobile_tab_recents", "Recents", null));
    $("#tab-contacts").attr("data-label", GetUiText("mobile_tab_contacts", "Contacts", null));
}
function SanitizePhoneSearch(value){
    return ((value == null)? "" : String(value)).replace(/[^\d\*\#\+]/g, "");
}
function EscapeHtml(value){
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function EscapeAttr(value){
    return EscapeHtml(value);
}
function GetActiveMainTab(){
    if($("#tab-recents").hasClass("activeTab")) return "recents";
    if($("#tab-contacts").hasClass("activeTab")) return "contacts";
    if($("#tab-dialpad").hasClass("activeTab")) return "dialpad";
    return localDB.getItem("ActiveTab") || "dialpad";
}
function GetTabSearchStorageKey(tabName){
    var tab = tabName || "contacts";
    if(profileUserID && profileUserID != "") return profileUserID + "-Search-" + tab;
    return "Search-" + tab;
}
function GetStoredTabSearch(tabName){
    return SanitizePhoneSearch(localDB.getItem(GetTabSearchStorageKey(tabName)) || "");
}
function SetStoredTabSearch(tabName, value){
    localDB.setItem(GetTabSearchStorageKey(tabName), SanitizePhoneSearch(value));
}
function HasInjectedSipConfig(){
    var hasServer = !!(wssServer && wssServer != "" && wssServer != "null" && wssServer != "undefined");
    var hasPort = !!(WebSocketPort != null && WebSocketPort != "" && WebSocketPort != "null" && WebSocketPort != "undefined");
    var hasUser = !!(SipUsername && SipUsername != "" && SipUsername != "null" && SipUsername != "undefined");
    return hasServer && hasPort && hasUser;
}
function IsCallFirstContactMode(){
    return true;
}
function ResolveRecentCallbackNumber(item, ownerBuddy){
    var candidates = [];
    var isOutbound = (item.SrcUserId == profileUserID);

    if(isOutbound){
        candidates.push(item.DstDid || "");
        candidates.push(item.Dst || "");
    }
    else {
        candidates.push(item.SrcDid || "");
        candidates.push(item.Src || "");
    }
    candidates.push(item.SrcDid || "");
    candidates.push(item.DstDid || "");
    candidates.push(item.Src || "");
    candidates.push(item.Dst || "");
    if(ownerBuddy){
        candidates.push(ownerBuddy.ExtNo || "");
        candidates.push(ownerBuddy.ContactNumber1 || "");
        candidates.push(ownerBuddy.MobileNumber || "");
    }

    for(var i = 0; i < candidates.length; i++){
        var candidate = SanitizePhoneSearch(candidates[i] || "");
        if(candidate == "") continue;
        if(candidate == SanitizePhoneSearch(profileUserID || "")) continue;
        return candidate;
    }

    return "";
}
function GetRecentDisplayLabel(callbackNumber, ownerBuddy, contactBuddy, item, isOutbound){
    if(contactBuddy && contactBuddy.CallerIDName && contactBuddy.CallerIDName != "") return contactBuddy.CallerIDName;
    if(ownerBuddy && ownerBuddy.CallerIDName && ownerBuddy.CallerIDName != "") return ownerBuddy.CallerIDName;

    var partyLabel = isOutbound ? (item.DstDid || item.Dst || "") : (item.SrcDid || item.Src || "");
    var sanitizedParty = SanitizePhoneSearch(partyLabel);
    if(sanitizedParty != "") return sanitizedParty;
    if(callbackNumber != "") return callbackNumber;
    return partyLabel || "";
}
function GetRecentDirection(item){
    return ((item.SrcUserId == profileUserID) || item.CallDirection == "outbound") ? "outbound" : "inbound";
}
function GetRecentDayKey(item){
    return moment.utc(item.ItemDate.replace(" UTC", "")).local().format("YYYY-MM-DD");
}
function GetRecentDirectionIcon(iconClass){
    if(iconClass == "callOut") return "fa-arrow-up";
    if(iconClass == "callIn") return "fa-arrow-down";
    if(iconClass == "callMissed") return "fa-times";
    return "fa-phone";
}
function FormatRecentLogTime(item){
    return FormatFixedClockTime(item.ItemDate);
}
function GetRecentDayLabel(item){
    return FormatFixedDate(item.ItemDate);
}
function ParseUtcDisplayDate(dateValue){
    return moment.utc(String(dateValue || "").replace(" UTC", "")).local();
}
function FormatFixedClockTime(dateValue){
    return ParseUtcDisplayDate(dateValue).format("HH:mm");
}
function FormatFixedDate(dateValue){
    return ParseUtcDisplayDate(dateValue).format("DD/MM/YYYY");
}
function SearchRecentsByNumber(filter){
    var phoneFilter = SanitizePhoneSearch(filter);
    var allCdrs = [];
    var streamOwners = [];
    for(var k = 0; k < localDB.length; k++){
        var storageKey = localDB.key(k);
        if(!storageKey) continue;
        if(storageKey.length <= 7) continue;
        if(storageKey.substring(storageKey.length - 7) == "-stream"){
            streamOwners.push(storageKey.substring(0, storageKey.length - 7));
        }
    }

    for(var s = 0; s < streamOwners.length; s++){
        var ownerIdentity = streamOwners[s];
        var ownerBuddy = FindBuddyByIdentity(ownerIdentity);
        var stream = JSON.parse(localDB.getItem(ownerIdentity + "-stream"));
        if(EnforceRecentRecordLimit(stream)){
            localDB.setItem(ownerIdentity + "-stream", JSON.stringify(stream));
        }
        if(stream && stream.DataCollection){
            $.each(stream.DataCollection, function(i, item){
                if(item.ItemType != "CDR") return;

                var callbackNumber = ResolveRecentCallbackNumber(item, ownerBuddy);
                var isOutbound = (item.SrcUserId == profileUserID) || item.CallDirection == "outbound";

                if(phoneFilter != ""){
                    if(callbackNumber == "" || callbackNumber.indexOf(phoneFilter) == -1) return;
                }

                var contactBuddy = FindBuddyByNumber(callbackNumber);
                if(contactBuddy && contactBuddy.type != "contact") contactBuddy = null;

                var displayName = GetRecentDisplayLabel(callbackNumber, ownerBuddy, contactBuddy, item, isOutbound);

                allCdrs.push({
                    cdr: item,
                    ownerIdentity: ownerIdentity,
                    callbackNumber: callbackNumber,
                    displayName: displayName,
                    direction: GetRecentDirection(item),
                    dayKey: GetRecentDayKey(item),
                    canAddContact: (callbackNumber != "" && contactBuddy == null)
                });
            });
        }
    }
    allCdrs.sort(function(a, b){
        var aMo = moment.utc(a.cdr.ItemDate.replace(" UTC", ""));
        var bMo = moment.utc(b.cdr.ItemDate.replace(" UTC", ""));
        return aMo.isSameOrAfter(bMo, "second") ? -1 : 1;
    });
    return allCdrs;
}
function GetRecentCallStatus(cdr){
    var isOutbound = (cdr.SrcUserId == profileUserID) || cdr.CallDirection == "outbound";
    var billsec = parseInt(cdr.Billsec) || 0;
    var reasonCode = parseInt(cdr.ReasonCode) || 0;
    var reasonText = (cdr.ReasonText || "").toLowerCase();
    var terminate = cdr.Terminate || "";

    if(billsec > 0){
        return {
            iconClass: isOutbound ? "callOut" : "callIn",
            iconSymbol: isOutbound ? "fa-long-arrow-up" : "fa-long-arrow-down",
            statusText: formatShortDuration(billsec)
        };
    }

    if(reasonCode == 486 || reasonText.indexOf("busy") > -1){
        return {
            iconClass: isOutbound ? "callOut" : "callMissed",
            iconSymbol: isOutbound ? "fa-long-arrow-up" : "fa-phone",
            statusText: (lang && lang.call_busy) ? lang.call_busy : "Busy"
        };
    }

    if(isOutbound){
        if(terminate == "us" || reasonCode == 487 || reasonText.indexOf("cancel") > -1){
            return {
                iconClass: "callOut",
                iconSymbol: "fa-long-arrow-up",
                statusText: (lang && lang.call_cancelled) ? lang.call_cancelled : "Call Cancelled"
            };
        }
        if(reasonCode == 486 || reasonCode == 603 || reasonText.indexOf("reject") > -1 || reasonText.indexOf("decline") > -1){
            return {
                iconClass: "callOut",
                iconSymbol: "fa-long-arrow-up",
                statusText: (lang && lang.call_rejected) ? lang.call_rejected : "Call Rejected"
            };
        }
        return {
            iconClass: "callOut",
            iconSymbol: "fa-long-arrow-up",
            statusText: (lang && lang.call_noanswer) ? lang.call_noanswer : "No Answer"
        };
    }

    if(terminate == "them" && reasonCode == 0){
        return {
            iconClass: "callMissed",
            iconSymbol: "fa-phone",
            statusText: (lang && lang.call_cancelled) ? lang.call_cancelled : "Call Cancelled"
        };
    }

    return {
        iconClass: "callMissed",
        iconSymbol: "fa-phone",
        statusText: (lang && lang.you_missed_a_call) ? lang.you_missed_a_call : "You missed a call"
    };
}
function GetBuddyDialNumber(buddyObj){
    if(!buddyObj) return "";
    if(buddyObj.ExtNo && buddyObj.ExtNo != "") return buddyObj.ExtNo;
    if(buddyObj.ContactNumber1 && buddyObj.ContactNumber1 != "") return buddyObj.ContactNumber1;
    if(buddyObj.MobileNumber && buddyObj.MobileNumber != "") return buddyObj.MobileNumber;
    return "";
}
function BuildCallDisplayInfo(lineObj){
    if(!lineObj) return { number: "", name: "", label: "" };

    var session = lineObj.SipSession;
    var direction = (session && session.data && session.data.calldirection) ? session.data.calldirection : "";
    var remoteNumber = "";

    if(direction == "inbound") remoteNumber = (session && session.data) ? (session.data.src || "") : "";
    if(direction == "outbound") remoteNumber = (session && session.data) ? (session.data.dst || "") : "";
    if((!remoteNumber || remoteNumber == "") && session && session.remoteIdentity && session.remoteIdentity.uri){
        remoteNumber = session.remoteIdentity.uri.user || "";
    }
    if(!remoteNumber || remoteNumber == "") remoteNumber = lineObj.DisplayNumber || "";

    var resolvedName = "";
    var matchedBuddy = FindBuddyByNumber(remoteNumber);
    if(matchedBuddy && matchedBuddy.CallerIDName && matchedBuddy.CallerIDName != "") resolvedName = matchedBuddy.CallerIDName;
    else if(lineObj.BuddyObj && lineObj.BuddyObj.CallerIDName && lineObj.BuddyObj.CallerIDName != "") resolvedName = lineObj.BuddyObj.CallerIDName;
    else if(lineObj.DisplayName && lineObj.DisplayName != "") resolvedName = lineObj.DisplayName;

    var label = remoteNumber;
    if(resolvedName && resolvedName != "" && resolvedName != remoteNumber) label = remoteNumber + " - " + resolvedName;

    return { number: remoteNumber, name: resolvedName, label: label };
}
function RefreshLineDisplay(lineObj){
    if(!lineObj) return;
    var display = BuildCallDisplayInfo(lineObj);

    if(display.number && display.number != ""){
        lineObj.DisplayNumber = display.number;
    }
    if(display.name && display.name != ""){
        lineObj.DisplayName = display.name;
    }

    var title = (display.label && display.label != "") ? display.label : (display.number || lineObj.DisplayNumber || "");
    $("#line-" + lineObj.LineNumber + "-AnswerCall .callingDisplayName").text(title);
    $("#line-" + lineObj.LineNumber + "-progress .callingDisplayName").text(title);
    $("#line-" + lineObj.LineNumber + "-AudioCall .callingDisplayName").text(title);

    var subtitle = (display.name && display.name != "" && display.name != display.number) ? display.name : "";
    var sections = ["AnswerCall", "progress", "AudioCall"];
    for(var i = 0; i < sections.length; i++){
        var selector = "#line-" + lineObj.LineNumber + "-" + sections[i] + " .callingDisplayNumber";
        if(subtitle != "") $(selector).text(subtitle).show();
        else $(selector).text("").hide();
    }
}
function AttachSessionTerminationObserver(lineObj, session, sourceTag){
    if(!lineObj || !session) return;
    if(!session.data) session.data = {};
    if(session.data.terminationObserverAttached === true) return;
    session.data.terminationObserverAttached = true;

    try {
        if(session.stateChange && typeof session.stateChange.addListener === "function"){
            session.stateChange.addListener(function(newState){
                if(newState == SIP.SessionState.Terminated){
                    if(session.data && session.data.teardownComplete === true) return;
                    console.warn("Session terminated (observer):", lineObj.LineNumber, sourceTag || "unknown");
                    if(!session.data.reasonText) session.data.reasonText = "Session Terminated";
                    if(!session.data.reasonCode) session.data.reasonCode = 16;
                    if(!session.data.terminateby) session.data.terminateby = "them";
                    teardownSession(lineObj);
                }
            });
        }
    } catch(e){
        console.warn("Failed to attach termination observer:", e);
    }
}
function UpdateDialpadSettingButtons(){
    if($("#dialpad-setting-toggles").length == 0) return;
    $("#dialpad-toggle-auto").toggleClass("toggleOn", AutoAnswerEnabled).toggleClass("toggleOff", !AutoAnswerEnabled);
    var dndActive = (DoNotDisturbEnabled == true || DoNotDisturbPolicy == "enabled");
    $("#dialpad-toggle-dnd").toggleClass("toggleOn", dndActive).toggleClass("toggleOff", !dndActive);
    $("#dialpad-toggle-cw").toggleClass("toggleOn", CallWaitingEnabled).toggleClass("toggleOff", !CallWaitingEnabled);
    $("#dialpad-toggle-rec").toggleClass("toggleOn", RecordAllCalls).toggleClass("toggleOff", !RecordAllCalls);
}
function ApplyDoNotDisturbState(){
    var dndActive = (DoNotDisturbEnabled == true || DoNotDisturbPolicy == "enabled");
    if($("#dereglink").is(":visible") || $("#reglink").is(":hidden")){
        $("#dereglink").attr("class", dndActive? "dotDoNotDisturb" : "dotOnline");
    }
    $("#dndStatus").html(dndActive? "(DND)" : "");
    UpdateDialpadSettingButtons();
    SyncMobileRegLink();
}
function ToggleDialpadSetting(settingName){
    if(settingName == "auto") ToggleAutoAnswer();
    if(settingName == "dnd") ToggleDoNoDisturb();
    if(settingName == "cw") ToggleCallWaiting();
    if(settingName == "rec") ToggleRecordAllCalls();
    UpdateDialpadSettingButtons();
}
function SyncMobileRegLink(){
    var isRegistered = IsSipRegistered() || $("#dereglink").is(":visible");
    var dotClass, statusText;
    if(isRegistered){
        dotClass = $.trim($("#dereglink").attr("class")) || "dotOnline";
        if(dotClass == "dotOffline") dotClass = "dotOnline";
        if(dotClass.indexOf("dot") !== 0) dotClass = "dotOnline";
        statusText = GetMobileRegistrationText(true);
    } else {
        dotClass = "dotOffline";
        statusText = GetMobileRegistrationText(false);
    }
    $("#mobileRegDot").attr("class", dotClass);
    $("#mobileRegText").text(statusText);
}
function GetMobileRegistrationText(isRegistered){
    var extension = GetRegisteredExtension();
    if(extension == ""){
        var onlineCount = CountOnlineExtensions();
        extension = (onlineCount > 0) ? String(onlineCount) : (SipUsername || profileName || "");
    }
    if(isRegistered) return extension + " (Online)";
    if(RegistrationErrorText && RegistrationErrorText != "") return RegistrationErrorText;
    if(extension && extension != "") return extension + " (Offline)";
    return "Offline";
}
function BuildMobileEmptyState(iconClass, message){
    return "<div class=mobileEmptyState><i class=\"fa " + iconClass + "\"></i><p>" + message + "</p></div>";
}
function SetMobilePaneEmptyState(selector, isEmpty){
    $(selector).toggleClass("mobilePaneEmpty", !!isEmpty);
}
$(window).on("beforeunload", function(event) {
    var CurrentCalls = countSessions("0");
    if(CurrentCalls > 0){
        console.warn("Warning, you have current calls open");
        event.preventDefault();
        return event.returnValue = "";
    }
    Unregister(true);
});
$(window).on("resize", function() {
    UpdateUI();
});
$(window).on("offline", function(){
    console.warn('Offline!');
    DisconnectTransport();
});
$(window).on("online", function(){
    console.warn('Online!');
    TransportManualDisconnect = false;
    ReconnectTransport();
});
window.addEventListener("message", function(event) {
    if(!event.data) return;
    if(event.data.action === "desktop-shortcut"){
        HandleShortcutAction(event.data.data ? event.data.data.shortcutAction : null);
        return;
    }
    if(event.data.action !== "makeCall" && event.data.action !== "clickToCall") return;

    var data = event.data.data || {};
    var numberToDial = data.numberToDial;
    var callType = data.callType || 'audio';
    var callerName = data.callerName || null;
    var extraHeaders = data.extraHeaders || null;

    if(!numberToDial || numberToDial.trim() === '') {
        console.warn("makeCall: No number to dial");
        return;
    }

    console.log("makeCall initiated for:", numberToDial, "Type:", callType);

    try {
        DialByLine(callType, null, numberToDial, callerName, extraHeaders);
    } catch(e) {
        console.error("makeCall failed:", e);
    }
});

function NormalizeKeyboardShortcuts(value){
    var defaults = {
        answer: "F2",
        hangup: "Escape",
        hold: "F4",
        mute: "F6",
        transfer: "F8",
        dialpad: "F9"
    };
    var configured = {};
    if(value && typeof value === "string"){
        try {
            configured = JSON.parse(value);
        } catch(e){
            configured = {};
        }
    }
    else if(value && typeof value === "object"){
        configured = value;
    }
    for(var key in defaults){
        if(!Object.prototype.hasOwnProperty.call(defaults, key)) continue;
        if(!configured[key]) configured[key] = defaults[key];
        configured[key] = String(configured[key]).trim();
    }
    return configured;
}
function GetKeyboardShortcutAction(event){
    if(!event || event.ctrlKey || event.altKey || event.metaKey) return null;
    var pressed = String(event.key || "").trim();
    for(var action in KeyboardShortcuts){
        if(!Object.prototype.hasOwnProperty.call(KeyboardShortcuts, action)) continue;
        if(String(KeyboardShortcuts[action]).toLowerCase() == pressed.toLowerCase()) return action;
    }
    return null;
}
function IsEditableShortcutTarget(target){
    if(!target) return false;
    var tagName = String(target.tagName || "").toLowerCase();
    return tagName == "input" || tagName == "textarea" || tagName == "select" || target.isContentEditable === true;
}
function GetShortcutLine(){
    if(!Lines || Lines.length == 0) return null;
    for(var i = Lines.length - 1; i >= 0; i--){
        var lineObj = Lines[i];
        if(lineObj && lineObj.SipSession) return lineObj;
    }
    return Lines[Lines.length - 1] || null;
}
function HandleKeyboardShortcut(event){
    if(IsEditableShortcutTarget(event.target)) return;
    var shortcutAction = GetKeyboardShortcutAction(event);
    if(!shortcutAction) return;

    event.preventDefault();
    event.stopPropagation();

    HandleShortcutAction(shortcutAction);
}

function HandleShortcutAction(shortcutAction){
    if(!shortcutAction) return;

    var lineObj = GetShortcutLine();
    if(shortcutAction == "dialpad"){
        ShowTab("dialpad");
        return;
    }
    if(!lineObj) return;

    var lineNum = lineObj.LineNumber;
    if(shortcutAction == "answer"){
        AnswerAudioCall(lineNum);
        return;
    }
    if(shortcutAction == "hangup"){
        if($("#line-" + lineNum + "-AnswerCall").is(":visible")) RejectCall(lineNum);
        else if(lineObj.SipSession && (lineObj.SipSession.state == SIP.SessionState.Initial || lineObj.SipSession.state == SIP.SessionState.Establishing)) cancelSession(lineNum);
        else endSession(lineNum);
        return;
    }
    if(shortcutAction == "hold"){
        if(lineObj.SipSession && lineObj.SipSession.isOnHold == true) unholdSession(lineNum);
        else holdSession(lineNum);
        return;
    }
    if(shortcutAction == "mute"){
        if(lineObj.SipSession && lineObj.SipSession.data && lineObj.SipSession.data.ismute == true) UnmuteSession(lineNum);
        else MuteSession(lineNum);
        return;
    }
    if(shortcutAction == "transfer"){
        if($("#line-" + lineNum + "-btn-CancelTransfer").is(":visible")) CancelTransferSession(lineNum);
        else StartTransferSession(lineNum);
    }
}
$(window).on("keydown", HandleKeyboardShortcut);
$(document).ready(function () {
    PrepareIndexDB();

    var options = (typeof phoneOptions !== 'undefined')? phoneOptions : {};
    if(options.welcomeScreen !== undefined) welcomeScreen = options.welcomeScreen;
    if(options.loadAlternateLang !== undefined) loadAlternateLang = options.loadAlternateLang;
    if(options.profileName !== undefined) profileName = options.profileName;
    if(options.imagesDirectory !== undefined) imagesDirectory = options.imagesDirectory;
    if(options.wallpaperLight !== undefined) wallpaperLight = options.wallpaperLight;
    if(options.wallpaperDark !== undefined) wallpaperDark = options.wallpaperDark;
    if(options.wssServer !== undefined) wssServer = options.wssServer;
    if(options.WebSocketPort !== undefined) WebSocketPort = options.WebSocketPort;
    if(options.ServerPath !== undefined) ServerPath = options.ServerPath;
    if(options.Wss !== undefined) Wss = normalizeBooleanFlag(options.Wss, true);
    if(options.wss !== undefined) Wss = normalizeBooleanFlag(options.wss, true);
    if(options.SipDomain !== undefined) SipDomain = options.SipDomain;
    if(options.SipUsername !== undefined) SipUsername = options.SipUsername;
    if(options.SipPassword !== undefined) SipPassword = options.SipPassword;
    if(options.SipPasswordType !== undefined) SipPasswordType = options.SipPasswordType;
    if(options.SingleInstance !== undefined) SingleInstance = options.SingleInstance;
    if(options.TransportConnectionTimeout !== undefined) TransportConnectionTimeout = options.TransportConnectionTimeout;
    if(options.TransportReconnectionAttempts !== undefined) TransportReconnectionAttempts = options.TransportReconnectionAttempts;
    if(options.TransportReconnectionTimeout !== undefined) TransportReconnectionTimeout = options.TransportReconnectionTimeout;
    if(options.SubscribeToYourself !== undefined) SubscribeToYourself = options.SubscribeToYourself;
    if(options.VoiceMailSubscribe !== undefined) VoiceMailSubscribe = options.VoiceMailSubscribe;
    if(options.VoicemailDid !== undefined) VoicemailDid = options.VoicemailDid;
    if(options.SubscribeVoicemailExpires !== undefined) SubscribeVoicemailExpires = options.SubscribeVoicemailExpires;
    if(options.ContactUserName !== undefined) ContactUserName = options.ContactUserName;
    if(options.userAgentStr !== undefined) userAgentStr = options.userAgentStr;
    if(options.hostingPrefix !== undefined) hostingPrefix = options.hostingPrefix;
    if(options.AppIcon !== undefined) AppIcon = options.AppIcon;
    if(options.appIcon !== undefined) AppIcon = options.appIcon;
    if(options.NotificationIcon !== undefined) NotificationIcon = options.NotificationIcon;
    if(options.notificationIcon !== undefined) NotificationIcon = options.notificationIcon;
    if(options.DefaultProfileIcon !== undefined) DefaultProfileIcon = options.DefaultProfileIcon;
    if(options.defaultProfileIcon !== undefined) DefaultProfileIcon = options.defaultProfileIcon;
    if(options.RegisterExpires !== undefined) RegisterExpires = options.RegisterExpires;
    if(options.RegisterExtraHeaders !== undefined) RegisterExtraHeaders = options.RegisterExtraHeaders;
    if(options.RegisterExtraContactParams !== undefined) RegisterExtraContactParams = options.RegisterExtraContactParams;
    if(options.RegisterContactParams !== undefined) RegisterContactParams = options.RegisterContactParams;
    if(options.WssInTransport !== undefined) WssInTransport = options.WssInTransport;
    if(options.IpInContact !== undefined) IpInContact = options.IpInContact;
    if(options.BundlePolicy !== undefined) BundlePolicy = options.BundlePolicy;
    if(options.IceStunServerJson !== undefined) IceStunServerJson = options.IceStunServerJson;
    if(options.IceStunCheckTimeout !== undefined) IceStunCheckTimeout = options.IceStunCheckTimeout;
    if(options.SubscribeBuddyAccept !== undefined) SubscribeBuddyAccept = options.SubscribeBuddyAccept;
    if(options.SubscribeBuddyEvent !== undefined) SubscribeBuddyEvent = options.SubscribeBuddyEvent;
    if(options.SubscribeBuddyExpires !== undefined) SubscribeBuddyExpires = options.SubscribeBuddyExpires;
    if(options.ProfileDisplayPrefix !== undefined) ProfileDisplayPrefix = options.ProfileDisplayPrefix;
    if(options.ProfileDisplayPrefixSeparator !== undefined) ProfileDisplayPrefixSeparator = options.ProfileDisplayPrefixSeparator;
    if(options.InviteExtraHeaders !== undefined) InviteExtraHeaders = options.InviteExtraHeaders;
    if(options.NoAnswerTimeout !== undefined) NoAnswerTimeout = options.NoAnswerTimeout;
    if(options.AutoAnswerEnabled !== undefined) AutoAnswerEnabled = options.AutoAnswerEnabled;
    if(options.DoNotDisturbEnabled !== undefined) DoNotDisturbEnabled = options.DoNotDisturbEnabled;
    if(options.CallWaitingEnabled !== undefined) CallWaitingEnabled = options.CallWaitingEnabled;
    if(options.RecordAllCalls !== undefined) RecordAllCalls = options.RecordAllCalls;
    if(options.StartVideoFullScreen !== undefined) StartVideoFullScreen = options.StartVideoFullScreen;
    if(options.SelectRingingLine !== undefined) SelectRingingLine = options.SelectRingingLine;
    if(options.UiMaxWidth !== undefined) UiMaxWidth = options.UiMaxWidth;
    if(options.UiThemeStyle !== undefined) UiThemeStyle = options.UiThemeStyle;
    if(options.UiMessageLayout !== undefined) UiMessageLayout = options.UiMessageLayout;
    if(options.UiCustomConfigMenu !== undefined) UiCustomConfigMenu = options.UiCustomConfigMenu;
    if(options.UiCustomDialButton !== undefined) UiCustomDialButton = options.UiCustomDialButton;
    if(options.UiCustomSortAndFilterButton !== undefined) UiCustomSortAndFilterButton = options.UiCustomSortAndFilterButton;
    if(options.UiCustomAddBuddy !== undefined) UiCustomAddBuddy = options.UiCustomAddBuddy;
    if(options.UiCustomEditBuddy !== undefined) UiCustomEditBuddy = options.UiCustomEditBuddy;
    if(options.UiCustomMediaSettings !== undefined) UiCustomMediaSettings = options.UiCustomMediaSettings;
    if(options.UiCustomMessageAction !== undefined) UiCustomMessageAction = options.UiCustomMessageAction;
    if(options.TraceSip !== undefined) TraceSip = (options.TraceSip == true || options.TraceSip == "1");
    if(options.HideSettingsButton !== undefined) HideSettingsButton = !!options.HideSettingsButton;
    if(options.HideRecordAllCallsButton !== undefined) HideRecordAllCallsButton = !!options.HideRecordAllCallsButton;
    if(options.AutoGainControl !== undefined) AutoGainControl = options.AutoGainControl;
    if(options.EchoCancellation !== undefined) EchoCancellation = options.EchoCancellation;
    if(options.NoiseSuppression !== undefined) NoiseSuppression = options.NoiseSuppression;
    if(options.MirrorVideo !== undefined) MirrorVideo = options.MirrorVideo;
    if(options.maxFrameRate !== undefined) maxFrameRate = options.maxFrameRate;
    if(options.videoHeight !== undefined) videoHeight = options.videoHeight;
    if(options.MaxVideoBandwidth !== undefined) MaxVideoBandwidth = options.MaxVideoBandwidth;
    if(options.videoAspectRatio !== undefined) videoAspectRatio = options.videoAspectRatio;
    if(options.NotificationsActive !== undefined) NotificationsActive = options.NotificationsActive;
    if(options.StreamBuffer !== undefined) StreamBuffer = options.StreamBuffer;
    if(options.PosterJpegQuality !== undefined) PosterJpegQuality = options.PosterJpegQuality;
    if(options.VideoResampleSize !== undefined) VideoResampleSize = options.VideoResampleSize;
    if(options.RecordingVideoSize !== undefined) RecordingVideoSize = options.RecordingVideoSize;
    if(options.RecordingVideoFps !== undefined) RecordingVideoFps = options.RecordingVideoFps;
    if(options.RecordingLayout !== undefined) RecordingLayout = options.RecordingLayout;
    if(options.DidLength !== undefined) DidLength = options.DidLength;
    if(options.MaxDidLength !== undefined) MaxDidLength = options.MaxDidLength;
    if(options.DisplayDateFormat !== undefined) DisplayDateFormat = options.DisplayDateFormat;
    if(options.DisplayTimeFormat !== undefined) DisplayTimeFormat = options.DisplayTimeFormat;
    if(options.Language !== undefined) Language = options.Language;
    if(options.BuddySortBy !== undefined) BuddySortBy = options.BuddySortBy;
    if(options.SortByTypeOrder !== undefined) SortByTypeOrder = options.SortByTypeOrder;
    if(options.BuddyAutoDeleteAtEnd !== undefined) BuddyAutoDeleteAtEnd = options.BuddyAutoDeleteAtEnd;
    if(options.HideAutoDeleteBuddies !== undefined) HideAutoDeleteBuddies = options.HideAutoDeleteBuddies;
    if(options.BuddyShowExtenNum !== undefined) BuddyShowExtenNum = options.BuddyShowExtenNum;
    if(options.DisableFreeDial !== undefined) DisableFreeDial = options.DisableFreeDial;
    if(options.DisableBuddies !== undefined) DisableBuddies = options.DisableBuddies;
    if(options.EnableTransfer !== undefined) EnableTransfer = options.EnableTransfer;
    if(options.EnableConference !== undefined) EnableConference = options.EnableConference;
    if(options.AutoAnswerPolicy !== undefined) AutoAnswerPolicy = options.AutoAnswerPolicy;
    if(options.DoNotDisturbPolicy !== undefined) DoNotDisturbPolicy = options.DoNotDisturbPolicy;
    if(options.CallWaitingPolicy !== undefined) CallWaitingPolicy = options.CallWaitingPolicy;
    if(options.CallRecordingPolicy !== undefined) CallRecordingPolicy = options.CallRecordingPolicy;
    if(options.IntercomPolicy !== undefined) IntercomPolicy = options.IntercomPolicy;
    if(options.EnableAccountSettings !== undefined) EnableAccountSettings = options.EnableAccountSettings;
    if(options.EnableAppearanceSettings !== undefined) EnableAppearanceSettings = options.EnableAppearanceSettings;
    if(options.EnableNotificationSettings !== undefined) EnableNotificationSettings = options.EnableNotificationSettings;
    if(options.EnableAlphanumericDial !== undefined) EnableAlphanumericDial = options.EnableAlphanumericDial;
    if(options.EnableVideoCalling !== undefined) EnableVideoCalling = options.EnableVideoCalling;
    if(options.EnableTextExpressions !== undefined) EnableTextExpressions = options.EnableTextExpressions;
    if(options.EnableTextDictate !== undefined) EnableTextDictate = options.EnableTextDictate;
    if(options.EnableRingtone !== undefined) EnableRingtone = options.EnableRingtone;
    if(options.MaxBuddies !== undefined) MaxBuddies = options.MaxBuddies;
    if(options.MaxBuddyAge !== undefined) MaxBuddyAge = options.MaxBuddyAge;
    setRuntimeMediaConfigFromOptions(options);

    normalizedSipAuth = NormalizeSipPasswordAndType(SipPassword, null);
    SipPassword = normalizedSipAuth.password;
    SipPasswordType = normalizedSipAuth.type;
    EnsureBuddyStorageKeys();
    RemoveSeedSampleStorageData();
    applyRuntimeDocumentIcons();
    if(SingleInstance == true){
        console.log("Instance ID :", instanceID);
        localDB.setItem("InstanceId", instanceID);
        window.addEventListener('storage', onLocalStorageEvent, false);
    }
    var embeddedLangPacks = (typeof window !== "undefined" && window.__VPhoneLangPacks && typeof window.__VPhoneLangPacks === "object")
        ? window.__VPhoneLangPacks
        : null;

    if(embeddedLangPacks && embeddedLangPacks.en){
        console.log("Using embedded language packs");
        lang = ResolveLanguageFromPacks(embeddedLangPacks.en, embeddedLangPacks);
        if(typeof web_hook_on_language_pack_loaded !== 'undefined') web_hook_on_language_pack_loaded(lang);
        InitUi();
    }
    else {
        $.getJSON(hostingPrefix + "lang/en.json", function(data){
            lang = data;
            if(typeof web_hook_on_language_pack_loaded !== 'undefined') web_hook_on_language_pack_loaded(lang);
            var userLang = GetAlternateLanguage();
            var forceAlternateLang = (String(Language || "").toLowerCase() != "" && String(Language || "").toLowerCase() != "auto" && String(Language || "").toLowerCase() != "en");
            if((loadAlternateLang == true || forceAlternateLang == true) && userLang != ""){
                console.log("Loading Alternate Language Pack: ", userLang);
                $.getJSON(hostingPrefix +"lang/"+ userLang +".json", function (alt_data){
                    if(typeof web_hook_on_language_pack_loaded !== 'undefined') web_hook_on_language_pack_loaded(alt_data);
                    lang = Object.assign({}, data, alt_data);
                }).always(function() {
                    console.log("Alternate Language Pack loaded: ", lang);
                    InitUi();
                });
            }
            else {
                if(userLang == "") console.log("No Alternate Language Found.");
                InitUi();
            }
        });
    }
});
if(window.matchMedia){
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
        console.log(`Changed system Theme to: ${e.matches ? "dark" : "light"} mode`)
        ApplyThemeColor()
    });
}
function onLocalStorageEvent(event){
    if(event.key == "InstanceId"){

        Unregister();
    }
}
function PrepareIndexDB(){
    const CallQosDataOpenRequest = window.indexedDB.open("CallQosData", 1);
    CallQosDataOpenRequest.onerror = function(event) {
        console.error("CallQosData DBOpenRequest Error:", event);
    }
    CallQosDataOpenRequest.onupgradeneeded = function(event) {
        console.warn("Upgrade Required for CallQosData IndexDB... probably because of first time use.");
        CallQosDataIndexDb = event.target.result;

        if(CallQosDataIndexDb.objectStoreNames.contains("CallQos") == false){
            var objectStore = CallQosDataIndexDb.createObjectStore("CallQos", { keyPath: "uID" });
            objectStore.createIndex("sessionid", "sessionid", { unique: false });
            objectStore.createIndex("buddy", "buddy", { unique: false });
            objectStore.createIndex("QosData", "QosData", { unique: false });
            console.log("IndexDB created ObjectStore CallQos");
        }
        else {
            console.warn("IndexDB requested upgrade, but object store was in place");
        }
    }
    CallQosDataOpenRequest.onsuccess = function(event) {
        CallQosDataIndexDb = event.target.result;

        CallQosDataIndexDb.onerror = function(event) {
            console.error("IndexDB Error:", event);
        }

        if(CallQosDataIndexDb.objectStoreNames.contains("CallQos") == false){
            console.warn("IndexDB is open but CallQos does not exist.");
            CallQosDataIndexDb.close();
            console.log("IndexDB is closed.");
            const DBDeleteRequest = window.indexedDB.deleteDatabase("CallQos");
            DBDeleteRequest.onerror = function(event) {
                console.error("Error deleting database CallQos");
            }
            DBDeleteRequest.onsuccess = function(event) {
                console.log("Database deleted successfully");
                window.setTimeout(function(){
                    PrepareIndexDB();
                },500);
            }
            return;
        }
        console.log("IndexDB connected to CallQosData");
    }
    const CallRecordingsOpenRequest = window.indexedDB.open("CallRecordings", 1);
    CallRecordingsOpenRequest.onerror = function(event) {
        console.error("CallRecordings DBOpenRequest Error:", event);
    }
    CallRecordingsOpenRequest.onupgradeneeded = function(event) {
        console.warn("Upgrade Required for CallRecordings IndexDB... probably because of first time use.");
        CallRecordingsIndexDb = event.target.result;

        if(CallRecordingsIndexDb.objectStoreNames.contains("Recordings") == false){
            var objectStore = CallRecordingsIndexDb.createObjectStore("Recordings", { keyPath: "uID" });
            objectStore.createIndex("sessionid", "sessionid", { unique: false });
            objectStore.createIndex("bytes", "bytes", { unique: false });
            objectStore.createIndex("type", "type", { unique: false });
            objectStore.createIndex("mediaBlob", "mediaBlob", { unique: false });
            console.log("IndexDB created ObjectStore Recordings");
        }
        else {
            console.warn("IndexDB requested upgrade, but object store was in place");
        }
    }
    CallRecordingsOpenRequest.onsuccess = function(event) {
        CallRecordingsIndexDb = event.target.result;

        CallRecordingsIndexDb.onerror = function(event) {
            console.error("IndexDB Error:", event);
        }
        if(CallRecordingsIndexDb.objectStoreNames.contains("Recordings") == false){
            console.warn("IndexDB is open but Recordings does not exist.");
            CallRecordingsIndexDb.close();
            console.log("IndexDB is closed.");
            const DBDeleteRequest = window.indexedDB.deleteDatabase("CallRecordings");
            DBDeleteRequest.onerror = function(event) {
                console.error("Error deleting database CallRecordings");
            }
            DBDeleteRequest.onsuccess = function(event) {
                console.log("Database deleted successfully");
                window.setTimeout(function(){
                    PrepareIndexDB();
                },500);
            }
            return;
        }
        console.log("IndexDB connected to CallRecordings");
    }
}
function UpdateUI(){
    var windowWidth = $(window).outerWidth()
    var windowHeight = $(window).outerHeight();
    var shellWidth = $("#Phone").outerWidth() || windowWidth;
    var useNarrowLayout = shellWidth < 920 || $("#Phone").hasClass("phoneFrame250");

    if(shellWidth > UiMaxWidth){
        $("#leftContentTable").css("border-left-width", "1px");
        if(selectedBuddy == null && selectedLine == null) {
            $("#leftContentTable").css("border-right-width", "1px");
        } else {
            $("#rightContent").css("border-right-width", "1px");
        }
    }
    else {
        $("#leftContentTable").css("border-left-width", "0px");
        if(selectedBuddy == null && selectedLine == null) {
            $("#leftContentTable").css("border-right-width", "0px");
        }
        else {
            $("#leftContentTable").css("border-right-width", "1px");
        }
        $("#rightContent").css("border-right-width", "0px");
    }

    if(useNarrowLayout){

        if(selectedBuddy == null & selectedLine == null) {
            $("#rightContent").hide();

            $("#leftContent").css("width", "100%");
            $("#leftContent").show();
        }
        else {
            $("#rightContent").css("margin-left", "0px");
            $("#rightContent").show();

            $("#leftContent").hide();

            if(selectedBuddy != null) updateScroll(selectedBuddy.identity);
        }
    }
    else {
        if(selectedBuddy == null & selectedLine == null) {
            $("#leftContent").css("width", "100%");
            $("#rightContent").css("margin-left", "0px");
            $("#leftContent").show();
            $("#rightContent").hide();
        }
        else{
            $("#leftContent").css("width", "320px");
            $("#rightContent").css("margin-left", "320px");
            $("#leftContent").show();
            $("#rightContent").show();

            if(selectedBuddy != null) updateScroll(selectedBuddy.identity);
        }
    }
    for(var l=0; l<Lines.length; l++){
        updateLineScroll(Lines[l].LineNumber);
        RedrawStage(Lines[l].LineNumber, false);
    }

    if(windowObj != null){
        var offsetTextHeight = windowObj.parent().outerHeight();
        var width = windowObj.parent().outerWidth();
        if(windowWidth <= width || windowHeight <= offsetTextHeight) {
            windowObj.dialog("option", "height", windowHeight - 4);
            windowObj.dialog("option", "width", windowWidth - (1+1+2+2) - 4);
            windowObj.parent().css('top', '2px');
            windowObj.parent().css('left', '2px');
        }
        else {
        }
    }
    if(alertObj != null){
        var width = 300;
        var offsetTextHeight = alertObj.parent().outerHeight();
        if(windowWidth <= width || windowHeight <= offsetTextHeight) {
            if(windowWidth <= width){
                alertObj.dialog("option", "width", windowWidth - (1+1+2+2));
                alertObj.parent().css('left', '0px');
                alertObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
            }
            if(windowHeight <= offsetTextHeight){
                alertObj.dialog("option", "height", windowHeight);
                alertObj.parent().css('left', windowWidth/2 - width/2 + 'px');
                alertObj.parent().css('top', '0px');
            }
        }
        else {
            alertObj.parent().css('left', windowWidth/2 - width/2 + 'px');
            alertObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
        }
    }
    if(confirmObj != null){
        var width = 300;
        var offsetTextHeight = confirmObj.parent().outerHeight();
        if(windowWidth <= width || windowHeight <= offsetTextHeight) {
            if(windowWidth <= width){
                confirmObj.dialog("option", "width", windowWidth - (1+1+2+2));
                confirmObj.parent().css('left', '0px');
                confirmObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
            }
            if(windowHeight <= offsetTextHeight){
                confirmObj.dialog("option", "height", windowHeight);
                confirmObj.parent().css('left', windowWidth/2 - width/2 + 'px');
                confirmObj.parent().css('top', '0px');
            }
        }
        else {
            confirmObj.parent().css('left', windowWidth/2 - width/2 + 'px');
            confirmObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
        }
    }
    if(promptObj != null){
        var width = 300;
        var offsetTextHeight = promptObj.parent().outerHeight();
        if(windowWidth <= width || windowHeight <= offsetTextHeight) {
            if(windowWidth <= width){
                promptObj.dialog("option", "width", windowWidth - (1+1+2+2));
                promptObj.parent().css('left', '0px');
                promptObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
            }
            if(windowHeight <= offsetTextHeight){
                promptObj.dialog("option", "height", windowHeight);
                promptObj.parent().css('left', windowWidth/2 - width/2 + 'px');
                promptObj.parent().css('top', '0px');
            }
        }
        else {
            promptObj.parent().css('left', windowWidth/2 - width/2 + 'px');
            promptObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
        }
    }
    HidePopup();
}
function AddSomeoneWindow(numberStr, nameStr){
    CloseUpSettings();

    $("#myContacts").hide();
    $("#searchArea").hide();
    $("#contactsTabHeader").hide();
    $(".mainTab").removeClass("activeTab");
    $("#actionArea").empty();

    var html = "";

    html += "<div border=0 class=\"UiWindowField contactFormPanel\">";
    html += "<div class=UiText>"+ lang.full_name +":</div>";
    html += "<div class=contactFormInputRow><input id=AddSomeone_Name class=UiInputText type=text placeholder='"+ lang.eg_full_name +"'></div>";
    html += "<div class=UiText>"+ lang.contact_number_1 +":</div>";
    html += "<div class=contactFormInputRow><input id=AddSomeone_Num1 class=UiInputText type=tel placeholder='"+ lang.eg_contact_number_1 +"'></div>";
    html += "<div class=contactFormInputRow><input type=checkbox id=AddSomeone_Dnd><label for=AddSomeone_Dnd>"+ lang.allow_calls_on_dnd +"</label></div>";
    html += "</div>";
    html += "<div class=UiWindowButtonBar id=ButtonBar></div>";

    $("#actionArea").html(html);

    var buttons = [];
    buttons.push({
        text: lang.add,
        action: function(){
            var name = $.trim($("#AddSomeone_Name").val());
            var number = SanitizePhoneSearch($("#AddSomeone_Num1").val());
            $("#AddSomeone_Num1").val(number);
            if(name == "" || number == "") return;

            if(profileUserID == null || profileUserID == "" || profileUserID == "null" || profileUserID == "undefined"){
                profileUserID = uID();
                localDB.setItem("profileUserID", profileUserID);
            }

            var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
            if(json == null) json = InitUserBuddies();

            var id = uID();
            var dateNow = utcDateNow();
            var allowDnd = $("#AddSomeone_Dnd").is(':checked');

            json.DataCollection.push({
                Type: "contact",
                LastActivity: dateNow,
                ExtensionNumber: "",
                MobileNumber: "",
                ContactNumber1: number,
                ContactNumber2: "",
                uID: null,
                cID: id,
                gID: null,
                jid: null,
                DisplayName: name,
                Description: "",
                Email: "",
                MemberCount: 0,
                EnableDuringDnd: allowDnd,
                Subscribe: false,
                SubscribeUser: null,
                AutoDelete: false
            });

            var buddyObj = new Buddy("contact", id, name, "", "", number, "", dateNow, "", "", null, allowDnd, false, null, false);
            AddBuddy(buddyObj, false, false, false, true);

            json.TotalRows = json.DataCollection.length;
            localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
            UpdateBuddyList();
            ShowContacts();
        }
    });
    buttons.push({
        text: lang.cancel,
        action: function(){
            ShowContacts();
        }
    });
    $.each(buttons, function(i,obj){
        var button = $('<button>'+ obj.text +'</button>').click(obj.action);
        button.addClass(i === 0 ? "configPrimaryButton" : "configSecondaryButton");
        $("#ButtonBar").append(button);
    });

    $("#actionArea").show();

    window.setTimeout(function(){
        if(nameStr) $("#AddSomeone_Name").val(nameStr);
        if(numberStr) $("#AddSomeone_Num1").val(SanitizePhoneSearch(numberStr));
        $("#AddSomeone_Name").focus();
    }, 0);
}
function CreateGroupWindow(){
}
function checkNotificationPromise() {
    try {
        Notification.requestPermission().then();
    }
    catch(e) {
        return false;
    }
    return true;
}
function HandleNotifyPermission(p){
    if(p == "granted") {
    }
    else {
        Alert(lang.alert_notification_permission, lang.permission, function(){
            console.log("Attempting to uncheck the checkbox...");
            $("#Settings_Notifications").prop("checked", false);
        });
    }
}
function EditBuddyWindow(buddy){

    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null){
        Alert(lang.alert_not_found, lang.error);
        return;
    }
    var buddyJson = {};
    var itemId = -1;
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    $.each(json.DataCollection, function (i, item) {
        if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
            buddyJson = item;
            itemId = i;
            return false;
        }
    });

    if(buddyJson == {}){
        Alert(lang.alert_not_found, lang.error);
        return;
    }
    if(UiCustomEditBuddy == true){
        if(typeof web_hook_on_edit_buddy !== 'undefined') {
            web_hook_on_edit_buddy(buddyJson);
        }
        return;
    }

    if(buddyJson.Type == "contact"){
        var contactHtml = "<div border=0 class='UiWindowField contactFormPanel'>";
        contactHtml += "<div class=UiText>"+ lang.full_name +":</div>";
        contactHtml += "<div class=contactFormInputRow><input id=AddSomeone_Name class=UiInputText type=text placeholder='"+ lang.eg_full_name +"' value='"+ ((buddyJson.DisplayName && buddyJson.DisplayName != "null" && buddyJson.DisplayName != "undefined")? buddyJson.DisplayName : "") +"'></div>";
        contactHtml += "<div class=UiText>"+ lang.contact_number_1 +":</div>";
        contactHtml += "<div class=contactFormInputRow><input id=AddSomeone_Num1 class=UiInputText type=tel placeholder='"+ lang.eg_contact_number_1 +"' value='"+ ((buddyJson.ContactNumber1 && buddyJson.ContactNumber1 != "null" && buddyJson.ContactNumber1 != "undefined")? buddyJson.ContactNumber1 : "") +"'></div>";
        contactHtml += "<div class=contactFormInputRow><input type=checkbox id=AddSomeone_Dnd "+ ((buddyJson.EnableDuringDnd == true)? "checked" : "" ) +"><label for=AddSomeone_Dnd>"+ lang.allow_calls_on_dnd +"</label></div>";
        contactHtml += "</div>";

        OpenWindow(contactHtml, lang.edit, 480, 420, false, true, lang.save, function(){
            var name = $.trim($("#AddSomeone_Name").val());
            var number = SanitizePhoneSearch($("#AddSomeone_Num1").val());
            $("#AddSomeone_Num1").val(number);
            if(name == "" || number == "") return;

            buddyJson.LastActivity = utcDateNow();
            buddyObj.lastActivity = buddyJson.LastActivity;
            buddyJson.DisplayName = name;
            buddyObj.CallerIDName = name;
            buddyJson.ContactNumber1 = number;
            buddyObj.ContactNumber1 = number;
            buddyJson.MobileNumber = "";
            buddyObj.MobileNumber = "";
            buddyJson.ContactNumber2 = "";
            buddyObj.ContactNumber2 = "";
            buddyJson.Description = "";
            buddyObj.Desc = "";
            buddyJson.Email = "";
            buddyObj.Email = "";
            buddyJson.EnableDuringDnd = $("#AddSomeone_Dnd").is(':checked');
            buddyObj.EnableDuringDnd = buddyJson.EnableDuringDnd;

            localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
            UpdateBuddyList();
            CloseWindow();
        }, lang.cancel, function(){
            CloseWindow();
        }, null, null);
        return;
    }

    var cropper;

    var html = "<div border=0 class='UiWindowField'>";

    html += "<div id=ImageCanvas style=\"width:150px; height:150px\"></div>";
    html += "<div style=\"float:left; margin-left:200px;\"><input id=fileUploader type=file></div>";
    html += "<div style=\"margin-top: 50px\"></div>";

    html += "<div class=UiText>"+ lang.full_name +":</div>";
    html += "<div><input id=AddSomeone_Name class=UiInputText type=text placeholder='"+ lang.eg_full_name +"' value='"+ ((buddyJson.DisplayName && buddyJson.DisplayName != "null" && buddyJson.DisplayName != "undefined")? buddyJson.DisplayName : "") +"'></div>";
    html += "<div><input type=checkbox id=AddSomeone_Dnd "+ ((buddyJson.EnableDuringDnd == true)? "checked" : "" ) +"><label for=AddSomeone_Dnd>Allow calls while on Do Not Disturb</label></div>";

    html += "<div class=UiText>"+ lang.title_description +":</div>";
    html += "<div><input id=AddSomeone_Desc class=UiInputText type=text placeholder='"+ lang.eg_general_manager +"' value='"+ ((buddyJson.Description && buddyJson.Description != "null" && buddyJson.Description != "undefined")? buddyJson.Description : "") +"'></div>";

    if(buddyJson.Type == "extension" || buddyJson.Type == "xmpp"){
        html += "<div class=UiText>"+ lang.extension_number +": </div>";
        html += "<div><input id=AddSomeone_Exten class=UiInputText type=text value="+ buddyJson.ExtensionNumber +"></div>";
        html += "<div><input type=checkbox id=AddSomeone_Subscribe "+ ((buddyJson.Subscribe == true)? "checked" : "" ) +"><label for=AddSomeone_Subscribe>Subscribe to Device State Notifications</label></div>";
        html += "<div id=RowSubscribe style=\"display:"+ ((buddyJson.Subscribe == true)? "unset" : "none" ) +";\">";
        html += "<div class=UiText style=\"margin-left:30px\">"+ lang.internal_subscribe_extension +":</div>";
        html += "<div style=\"margin-left:30px\"><input id=AddSomeone_SubscribeUser class=UiInputText type=text placeholder='"+ lang.eg_internal_subscribe_extension +"' value='"+ ((buddyJson.SubscribeUser && buddyJson.SubscribeUser != "null" && buddyJson.SubscribeUser != "undefined")? buddyJson.SubscribeUser : "") +"'></div>";
        html += "</div>";
    }
    else {
        html += "<input type=checkbox id=AddSomeone_Subscribe style=\"display:none\">";
    }
    html += "<div class=UiText>"+ lang.mobile_number +":</div>";
    html += "<div><input id=AddSomeone_Mobile class=UiInputText type=text placeholder='"+ lang.eg_mobile_number +"' value='"+ ((buddyJson.MobileNumber && buddyJson.MobileNumber != "null" && buddyJson.MobileNumber != "undefined")? buddyJson.MobileNumber : "") +"'></div>";

    html += "<div class=UiText>"+ lang.email +":</div>";
    html += "<div><input id=AddSomeone_Email class=UiInputText type=text placeholder='"+ lang.eg_email +"' value='"+ ((buddyJson.Email && buddyJson.Email != "null" && buddyJson.Email != "undefined")? buddyJson.Email : "") +"'></div>";

    html += "<div class=UiText>"+ lang.contact_number_1 +":</div>";
    html += "<div><input id=AddSomeone_Num1 class=UiInputText type=text placeholder='"+ lang.eg_contact_number_1 +"' value='"+((buddyJson.ContactNumber1 && buddyJson.ContactNumber1 != "null" && buddyJson.ContactNumber1 != "undefined")? buddyJson.ContactNumber1 : "") +"'></div>";

    html += "<div class=UiText>"+ lang.contact_number_2 +":</div>";
    html += "<div><input id=AddSomeone_Num2 class=UiInputText type=text placeholder='"+ lang.eg_contact_number_2 +"' value='"+ ((buddyJson.ContactNumber2 && buddyJson.ContactNumber2 != "null" && buddyJson.ContactNumber2 != "undefined")? buddyJson.ContactNumber2 : "") +"'></div>";

    html += "<div class=UiText>Auto Delete:</div>";
    html += "<div><input type=checkbox id=AddSomeone_AutoDelete "+ ((buddyJson.AutoDelete == true)? "checked" : "" ) +"><label for=AddSomeone_AutoDelete>"+ lang.yes +"</label></div>";
    html += "<div class=UiText><button onclick=\"RemoveBuddy('"+ buddyObj.identity +"')\" class=\"UiDeleteButton\"><i class=\"fa fa-trash\"></i> "+ lang.delete_buddy +"</button></div>";

    html += "</div>"

    OpenWindow(html, lang.edit, 480, 640, false, true, lang.save, function(){

        if($("#AddSomeone_Name").val() == "") return;
        if($("#AddSomeone_Subscribe").is(':checked')){
            if($("#AddSomeone_Exten").val() != "" && $("#AddSomeone_SubscribeUser").val() == ""){
                $("#AddSomeone_SubscribeUser").val($("#AddSomeone_Exten").val());
            }
        }

        buddyJson.LastActivity = utcDateNow();
        buddyObj.lastActivity = buddyJson.LastActivity;

        buddyJson.DisplayName = $("#AddSomeone_Name").val();
        buddyObj.CallerIDName = buddyJson.DisplayName;

        buddyJson.Description = $("#AddSomeone_Desc").val();
        buddyObj.Desc = buddyJson.Description;

        buddyJson.MobileNumber = $("#AddSomeone_Mobile").val();
        buddyObj.MobileNumber = buddyJson.MobileNumber;

        buddyJson.Email = $("#AddSomeone_Email").val();
        buddyObj.Email = buddyJson.Email;

        buddyJson.ContactNumber1 = $("#AddSomeone_Num1").val();
        buddyObj.ContactNumber1 = buddyJson.ContactNumber1;

        buddyJson.ContactNumber2 = $("#AddSomeone_Num2").val();
        buddyObj.ContactNumber2 = buddyJson.ContactNumber2;

        buddyJson.EnableDuringDnd = $("#AddSomeone_Dnd").is(':checked');
        buddyObj.EnableDuringDnd = buddyJson.EnableDuringDnd;

        buddyJson.AutoDelete = $("#AddSomeone_AutoDelete").is(':checked');
        buddyObj.AllowAutoDelete = buddyJson.AutoDelete;

        if(buddyJson.Type == "extension" || buddyJson.Type == "xmpp"){
            UnsubscribeBuddy(buddyObj);

            buddyJson.ExtensionNumber = $("#AddSomeone_Exten").val();
            buddyObj.ExtNo = buddyJson.ExtensionNumber;

            buddyJson.Subscribe = $("#AddSomeone_Subscribe").is(':checked');
            buddyObj.EnableSubscribe = buddyJson.Subscribe;

            if(buddyJson.Subscribe == true){
                var SubscribeUser = $("#AddSomeone_SubscribeUser").val();
                buddyJson.SubscribeUser = SubscribeUser;
                buddyObj.SubscribeUser = SubscribeUser;
                SubscribeBuddy(buddyObj);
            }
        }
        UpdateBuddyList();
        var constraints = {
            type: 'base64',
            size: 'viewport',
            format: 'webp',
            quality: 0.5,
            circle: false
        }
        $("#ImageCanvas").croppie('result', constraints).then(function(base64) {
            if(buddyJson.Type == "extension"){
                console.log("Saving image for extension buddy:", buddyJson.uID)
                localDB.setItem("img-"+ buddyJson.uID +"-extension", base64);
                $("#contact-"+ buddyJson.uID +"-picture").css("background-image", 'url('+ getPicture(buddyJson.uID, 'extension', true) +')');
                $("#contact-"+ buddyJson.uID +"-picture-main").css("background-image", 'url('+ getPicture(buddyJson.uID, 'extension', true) +')');
            }
            else if(buddyJson.Type == "contact") {
                console.log("Saving image for contact buddy:", buddyJson.cID)
                localDB.setItem("img-"+ buddyJson.cID +"-contact", base64);
                $("#contact-"+ buddyJson.cID +"-picture").css("background-image", 'url('+ getPicture(buddyJson.cID, 'contact', true) +')');
                $("#contact-"+ buddyJson.cID +"-picture-main").css("background-image", 'url('+ getPicture(buddyJson.cID, 'contact', true) +')');
            }
            else if(buddyJson.Type == "group") {
                console.log("Saving image for group buddy:", buddyJson.gID)
                localDB.setItem("img-"+ buddyJson.gID +"-group", base64);
                $("#contact-"+ buddyJson.gID +"-picture").css("background-image", 'url('+ getPicture(buddyJson.gID, 'group', true) +')');
                $("#contact-"+ buddyJson.gID +"-picture-main").css("background-image", 'url('+ getPicture(buddyJson.gID, 'group', true) +')');
            }
            UpdateBuddyList();
        });
        json.DataCollection[itemId] = buddyJson;
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));

        CloseWindow();
    }, lang.cancel, function(){
        CloseWindow();
    }, function(){
        cropper = $("#ImageCanvas").croppie({
            viewport: { width: 150, height: 150, type: 'circle' }
        });
        if(buddyJson.Type == "extension"){
            $("#ImageCanvas").croppie('bind', { url: getPicture(buddyJson.uID, "extension") }).then();


        }
        if(buddyJson.Type == "xmpp"){
            $("#ImageCanvas").croppie('bind', { url: getPicture(buddyJson.uID, "xmpp") }).then();

            $("#fileUploader").hide();
            $("#AddSomeone_Name").attr("disabled", true);
            $("#AddSomeone_Desc").attr("disabled", true);
            $("#AddSomeone_Mobile").attr("disabled", true);
            $("#AddSomeone_Email").attr("disabled", true);
            $("#AddSomeone_Num1").attr("disabled", true);
            $("#AddSomeone_Num2").attr("disabled", true);
        }
        else if(buddyJson.Type == "contact") {
            $("#ImageCanvas").croppie('bind', { url: getPicture(buddyJson.cID, "contact") }).then();
        }
        else if(buddyJson.Type == "group") {
            $("#ImageCanvas").croppie('bind', { url: getPicture(buddyJson.gID, "group") }).then();
        }

        $("#AddSomeone_Subscribe").change(function(){
            if($("#AddSomeone_Subscribe").is(':checked')){
                if($("#AddSomeone_Exten").val() != "" && $("#AddSomeone_SubscribeUser").val() == ""){
                    $("#AddSomeone_SubscribeUser").val($("#AddSomeone_Exten").val());
                }
                $("#RowSubscribe").show();
            } else {
                $("#RowSubscribe").hide();
            }
        });
        $("#fileUploader").change(function () {
            var filesArray = $(this).prop('files');

            if (filesArray.length == 1) {
                var uploadId = Math.floor(Math.random() * 1000000000);
                var fileObj = filesArray[0];
                var fileName = fileObj.name;
                var fileSize = fileObj.size;

                if (fileSize <= 52428800) {
                    console.log("Adding (" + uploadId + "): " + fileName + " of size: " + fileSize + "bytes");

                    var reader = new FileReader();
                    reader.Name = fileName;
                    reader.UploadId = uploadId;
                    reader.Size = fileSize;
                    reader.onload = function (event) {
                        $("#ImageCanvas").croppie('bind', {
                            url: event.target.result
                        });
                    }
                    reader.readAsDataURL(fileObj);
                }
                else {
                    Alert(lang.alert_file_size, lang.error);
                }
            }
            else {
                Alert(lang.alert_single_file, lang.error);
            }
        });
    });
}
function InitUi(){
    if(typeof web_hook_on_before_init !== 'undefined') web_hook_on_before_init(phoneOptions);

    EnsureAudioUnlockListeners();

    ApplyThemeColor()

    var phone = $("#Phone");
    phone.empty();
    phone.attr("class", "pageContainer");
    var appMode = (phoneOptions && phoneOptions.AppMode) ? String(phoneOptions.AppMode).toLowerCase() : "auto";
    var isEmbedded = (appMode == "embed") || (appMode == "auto" && window.self !== window.top);
    if(isEmbedded){
        if(!phoneOptions || phoneOptions.HideSettingsButton === undefined) HideSettingsButton = true;
        if(!phoneOptions || phoneOptions.HideRecordAllCallsButton === undefined) HideRecordAllCallsButton = true;
        if((profileUserID == null || profileUserID == "" || profileUserID == "null" || profileUserID == "undefined") && HasInjectedSipConfig()){
            profileUserID = SipUsername;
            localDB.setItem("profileUserID", profileUserID);
        }
        if((profileName == null || profileName == "" || profileName == "null" || profileName == "undefined") && SipUsername){
            profileName = SipUsername;
        }
    }
    $("body").removeClass("phoneStandaloneApp phoneEmbeddedApp");
    phone.removeClass("phoneStandalone phoneEmbedded phoneFrame250");
    if(isEmbedded){
        $("body").addClass("phoneEmbeddedApp");
        phone.addClass("phoneEmbedded");
    } else {
        $("body").addClass("phoneStandaloneApp");
        phone.addClass("phoneStandalone");
    }
    phone.addClass("phoneFrame250");

    phone.css("max-width", UiMaxWidth + "px");
    if(NotificationsActive && "Notification" in window && Notification.permission === "default"){
        if(checkNotificationPromise()){
            Notification.requestPermission().then(function(p){ console.log("Notification permission:", p); });
        } else {
            Notification.requestPermission(function(p){ console.log("Notification permission:", p); });
        }
    }
    var leftSection = $("<div/>");
    leftSection.attr("id", "leftContent");
    leftSection.attr("style", "float:left; height: 100%; width:320px");

    var leftHTML = "<table id=leftContentTable class=leftContentTable style=\"height:100%; width:100%\" cellspacing=0 cellpadding=0>";
    leftHTML += "<tr><td class=streamSection style=\"height: 50px; box-sizing: border-box;\">";
    leftHTML += "<div class=profileContainer>";
    leftHTML += "<div class=contact id=UserProfile style=\"cursor: default; margin-bottom:5px;\">";
    leftHTML += "<span id=TxtVoiceMessages class=voiceMessageNotifyer>0</span>"
    leftHTML += "<div id=UserProfilePic class=buddyIcon></div>";
    leftHTML += "<span class=settingsMenu>";
    leftHTML += "<button class=roundButtons id=BtnFreeDial><i class=\"fa fa-phone\"></i></button>";
    if(false){
        leftHTML += "<button id=BtnCreateGroup><i class=\"fa fa-users\"></i><i class=\"fa fa-plus\" style=\"font-size:9px\"></i></button>";
    }
    if(HideSettingsButton == false){
        leftHTML += "<button class=roundButtons id=SettingsMenu><i class=\"fa fa-cogs\"></i></button>";
    }
    leftHTML += "</span>";
    leftHTML += "<div class=contactNameText style=\"margin-right: 0px;\">"
    leftHTML += "<span id=dereglink class=dotOnline style=\"display:none\"></span>";
    leftHTML += "<span id=reglink class=dotOffline></span>";
    leftHTML += " <span id=UserCallID></span>"
    leftHTML += "</div>";
    leftHTML += "<div class=presenceText><span id=regStatus>&nbsp;</span> <span id=dndStatus></span></div>";
    leftHTML += "</div>";

    leftHTML += "</div>";

    leftHTML += "</td></tr>";
    leftHTML += "<tr id=searchArea><td class=streamSection style=\"height: 35px; box-sizing: border-box; padding-top: 3px; padding-bottom: 0px;\">";
    leftHTML += "<span id=divFindBuddy class=searchClean><INPUT id=txtFindBuddy type=text autocomplete=none style=\"width: calc(100% - 78px);\"></span>";
    leftHTML += "<button class=roundButtons id=BtnFilter style=\"margin-left:5px\"><i class=\"fa fa-sliders\"></i></button>"

    leftHTML += "</td></tr>";
    leftHTML += "<tr id=contentAreaRow><td class=streamSection style=\"padding:0\">";
    leftHTML += "<div id=mobileTopBar class=mobileTopBar></div>";
    leftHTML += "<div id=contactsTabHeader class=contactsTabHeader>";
    leftHTML += "<span style=\"flex:1;\">"+ GetUiText("mobile_tab_contacts", "Contacts", "addressbook_contact") +"</span>";
    leftHTML += "</div>";
    leftHTML += "<div id=myContacts class=\"contactArea cleanScroller\"></div>";
    leftHTML += "<div id=actionArea style=\"display:none\" class=\"contactArea cleanScroller\"></div>";
    leftHTML += "</td></tr>";
    leftHTML += "<tr id=tabBarRow><td class=streamSection style=\"padding:0\">";
    leftHTML += "<div id=bottomTabBar class=mainTabBar>";
    leftHTML += `<button type=button id=tab-dialpad class=\"mainTab activeTab\" data-label=\"${lang.dialpad}\" onclick=\"ShowTab('dialpad')\"><i class=\"fa fa-th mainTabIcon\"></i></button>`;
    leftHTML += `<button type=button id=tab-recents class=\"mainTab\" data-label=\"${lang.recents}\" onclick=\"ShowTab('recents')\"><i class=\"fa fa-history mainTabIcon\"></i></button>`;
    leftHTML += `<button type=button id=tab-contacts class=\"mainTab\" data-label=\"${lang.contacts}\" onclick=\"ShowTab('contacts')\"><i class=\"fa fa-address-book mainTabIcon\"></i></button>`;
    leftHTML += "</div>";

    leftHTML += "</td></tr>";
    leftHTML += "</table>";

    leftSection.html(leftHTML);
    ApplyMobileLabels();
    var rightSection = $("<div/>");
    rightSection.attr("id", "rightContent");
    rightSection.attr("class", "rightContent");
    rightSection.attr("style", "margin-left: 320px; height: 100%");

    phone.append(leftSection);
    phone.append(rightSection);

    if(DisableFreeDial == true) {
        $("#BtnFreeDial").hide();
    }
    $("#BtnCreateGroup").hide();

    var profilePrepend = "";
    var profileVcard = getDbItem("profileVcard", null);
    if(profileVcard != null) {
        profileVcard = JSON.parse(profileVcard);
        var displayPrefix = getDbItem("ProfileDisplayPrefix", "");
        var displayPrefixSep = getDbItem("ProfileDisplayPrefixSeparator", "-");
        if(displayPrefix != ""){
            try{
                var vCardValue = profileVcard[displayPrefix];
                if(vCardValue && vCardValue != ""){
                    profilePrepend  =  vCardValue + " "+ displayPrefixSep +" "
                }
            }
            catch(e){}
        }
    }
    if(profileName) $("#UserCallID").html(profilePrepend +""+ profileName);
    $("#UserProfilePic").css("background-image", "url('"+ getPicture("profilePicture") +"')");

    $("#BtnFilter").attr("title", lang.filter_and_sort)
    $("#BtnFilter").on('click', function(event){
        if(UiCustomSortAndFilterButton == true){
            if(typeof web_hook_sort_and_filter !== 'undefined') {
                web_hook_sort_and_filter(event);
            }
        } else {
            ShowSortAnfFilter();
        }
    });

    $("#txtFindBuddy").attr("placeholder", lang.find_someone)
    $("#txtFindBuddy").on('keyup', function(event){
        var activeTab = GetActiveMainTab();
        var clean = SanitizePhoneSearch($("#txtFindBuddy").val());
        if($("#txtFindBuddy").val() != clean) $("#txtFindBuddy").val(clean);
        if(activeTab == "recents"){
            SetStoredTabSearch("recents", clean);
            ShowRecentsTab();
            $("#searchArea").show();
        }
        else {
            SetStoredTabSearch("contacts", clean);
            UpdateBuddyList();
        }
        $("#txtFindBuddy").focus();
    });

    $("#BtnFreeDial").attr("title", lang.call)
    $("#BtnFreeDial").on('click', function(event){
        if(DisableFreeDial == true) return;

        if(UiCustomDialButton == true){
            if(typeof web_hook_dial_out !== 'undefined') {
                web_hook_dial_out(event);
            }
        } else {
            ShowDial();
        }
    });

        $("#mobileTopBar").on('click', '.mobileTopBtn', function(event){
            var action = $(this).attr('data-action');
            var activeTab = GetActiveMainTab();
            if(action == "filter"){
                if(activeTab == "contacts") ShowSortAnfFilter();
            }
            if(action == "search"){
                if(activeTab == "recents"){
                    $("#searchArea").show();
                    $("#txtFindBuddy").val(GetStoredTabSearch("recents"));
                    ShowRecentsTab();
                }
                else {
                    if(activeTab != "contacts") ShowContacts();
                    $("#searchArea").show();
                    $("#txtFindBuddy").val(GetStoredTabSearch("contacts"));
                    UpdateBuddyList();
                }
                $("#txtFindBuddy").focus();
            }
            if(action == "settings"){
                ShowMyProfile();
            }
            if(action == "add-contact"){
                if(UiCustomAddBuddy == true){
                    if(typeof web_hook_on_add_buddy !== 'undefined') web_hook_on_add_buddy(event);
                } else {
                    AddSomeoneWindow();
                }
            }
            if(action == "clear-tab"){
                HandleMobileClearTab($(this).attr('data-tab') || activeTab);
            }
            if(action == "more"){
                ShowMyProfileMenu(this);
            }
            if(action == "reg"){
                if($("#dereglink").is(":visible")){
                    Unregister();
                } else {
                    Register();
                }
            }
        });

    $("#TxtVoiceMessages").on('click', function(event){
        if(VoicemailDid != ""){
            DialByLine("audio", null, VoicemailDid, lang.voice_mail);
        }
    });

    $("#BtnCreateGroup").attr("title", lang.create_group)
    $("#BtnCreateGroup").on('click', function(event){
        CreateGroupWindow();
    });

    if($("#SettingsMenu").length > 0){
        $("#SettingsMenu").attr("title", lang.configure_extension)
        $("#SettingsMenu").on('click', function(event){
            if(UiCustomConfigMenu == true){
                if(typeof web_hook_on_config_menu !== 'undefined') {
                    web_hook_on_config_menu(event);
                }
            } else {
                ShowMyProfile();
            }
        });
    }
    $("#reglink").on('click', Register);
    $("#dereglink").on('click', Unregister);
    $("#WebRtcFailed").on('click', function(){
        Confirm(lang.error_connecting_web_socket, lang.web_socket_error, function(){
            window.open("https://"+ wssServer +":"+ WebSocketPort +"/httpstatus");
        }, null);
    });
    $(".loading").remove();
    ShowTab('dialpad');

    UpdateUI();
    if(welcomeScreen && isEmbedded == false){
        if(localDB.getItem("WelcomeScreenAccept") != "yes"){
            OpenWindow(welcomeScreen, lang.welcome, 480, 600, true, false, lang.accept, function(){
                localDB.setItem("WelcomeScreenAccept", "yes");
                CloseWindow();
                ShowTab('dialpad');
            }, null, null, null, null);

            return;
        }
    }
    if(profileUserID == null || profileUserID == "" || profileUserID == "null" || profileUserID == "undefined"){
        profileUserID = uID();
        localDB.setItem("profileUserID", profileUserID);
    }

    PopulateBuddyList();
    localDB.setItem("SelectedBuddy", null);

    PreloadAudioFiles();
    if(typeof web_hook_on_init !== 'undefined') web_hook_on_init();

    if(HasInjectedSipConfig()){
        CreateUserAgent();
    } else {
        console.warn("SIP account is not configured; open Settings to configure extension details.");
    }
}
function ShowMyProfileMenu(obj){
    var enabledHtml = " <i class=\"fa fa-check\" style=\"float: right; line-height: 18px;\"></i>";

    var items = [];
    items.push({ icon: "fa fa-refresh", text: lang.refresh_registration, value: 1});
    items.push({ icon: "fa fa-wrench", text: lang.configure_extension, value: 2});
    items.push({ icon: "fa fa-sliders", text: (lang.settings_menu || "Settings"), value: 7});
    items.push({ icon : null, text: "-" });
    if(HideRecordAllCallsButton == false){
        if(RecordAllCalls == true){
            items.push({ icon: "fa fa-dot-circle-o", text: lang.record_all_calls + enabledHtml, value: 6});
        }
        else {
            items.push({ icon: "fa fa-dot-circle-o", text: lang.record_all_calls, value: 6});
        }
    }

    var menu = {
        selectEvent : function( event, ui ) {
            var id = ui.item.attr("value");
            HidePopup();
            if(id == "1") {
                RefreshRegistration();
            }
            if(id == "2") {
                ShowMyProfile();
            }
            if(id == "6") {
                ToggleRecordAllCalls();
            }
            if(id == "7") {
                ShowMyProfile("settings");
            }

        },
        createEvent : null,
        autoFocus : true,
        items : items
    }
    PopupMenu(obj, menu);
}
function IsSipRegistered(){
    return !!(userAgent && typeof userAgent.isRegistered === "function" && userAgent.isRegistered() == true);
}
function CountOnlineExtensions(){
    var count = 0;
    for(var i = 0; i < Buddies.length; i++){
        var b = Buddies[i];
        if(b.type != "extension") continue;
        var isOnline = (b.devState && b.devState != "dotOffline");
        if(!isOnline && b.presence) isOnline = (b.presence != "Not online");
        if(isOnline) count++;
    }
    return count;
}
function GetRegisteredExtension(){
    if(SipUsername && SipUsername != "" && SipUsername != "null" && SipUsername != "undefined") return SipUsername;
    if(profileName && profileName != "" && profileName != "null" && profileName != "undefined") return profileName;
    return "";
}
function GetSelfExtensionLabel(){
    var extension = GetRegisteredExtension();
    return (extension && extension != "") ? extension : GetUiText("mobile_status_offline", "Offline", null);
}
function ApplyRegistrationStatusText(){
    var onlineExt = GetRegisteredExtension();
    if(onlineExt == ""){
        var onlineCount = CountOnlineExtensions();
        onlineExt = (onlineCount > 0) ? String(onlineCount) : "";
    }
    var onlineLabel = "Online" + ((onlineExt != "")? " ("+ onlineExt +")" : "");
    var offlineLabel = (RegistrationErrorText && RegistrationErrorText != "") ? RegistrationErrorText : "Offline";
    var statusHtml = IsSipRegistered() ?
        '<i class="fa fa-wifi" aria-hidden="true"></i> ' + onlineLabel :
        '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ' + EscapeHtml(offlineLabel);
    $("#regStatus").html(statusHtml);
    SyncMobileRegLink();
    EmitEmbedRegistrationStatus();
}
function EmitEmbedRegistrationStatus(){
    try{
        if(window.self === window.top) return;
        var isRegistered = IsSipRegistered();
        window.parent.postMessage({
            type: "vphone-status",
            registered: isRegistered,
            dotClass: isRegistered ? "dotOnline" : "dotOffline",
            text: isRegistered ? "Online" : "Offline"
        }, "*");
    } catch(e){
    }
}
function EmitEmbedPhoneEvent(type, payload){
    try{
        if(window.self === window.top) return;
        window.parent.postMessage({
            type: type,
            payload: payload || {}
        }, "*");
    } catch(e){
    }
}
function SetStatusMessage(msg, icon, sticky, timeout){
    if(icon){
        $("#regStatus").html(`<i class="fa ${icon}"></i> ${msg}`);
    }
    else {
        $("#regStatus").html(msg);
    }
    if(!sticky){
        window.clearTimeout(window.StatusHandle);
        window.StatusHandle = window.setTimeout(function(){
            ApplyRegistrationStatusText();
        }, (timeout)? timeout : 3000);
    }
    SyncMobileRegLink();
    EmitEmbedRegistrationStatus();
}
function ApplyThemeColor(){
    var wallpaperUrl = hostingPrefix +""+ imagesDirectory +""+ wallpaperLight;
    if(UiThemeStyle == "system"){
        if(window.matchMedia){
            if(window.matchMedia('(prefers-color-scheme: dark)').matches){
                wallpaperUrl = hostingPrefix +""+ imagesDirectory +""+ wallpaperDark;
            } else {
                wallpaperUrl = hostingPrefix +""+ imagesDirectory +""+ wallpaperLight;
            }
        }
    } else if(UiThemeStyle == "light"){
        wallpaperUrl = hostingPrefix +""+ imagesDirectory +""+ wallpaperLight;
    } else if(UiThemeStyle == "dark") {
        wallpaperUrl = hostingPrefix +""+ imagesDirectory +""+ wallpaperDark;
    } else {
        wallpaperUrl = hostingPrefix +""+ imagesDirectory +""+ wallpaperLight;
    }
    if($("#colorSchemeModeSheet").length){
        $("#colorSchemeModeSheet").empty();
    } else {
        $("head").append("<style id='colorSchemeModeSheet'></style>");
    }
    var wallpaperStyle = (wallpaperUrl && wallpaperUrl != "") ?
        ".wallpaperBackground { background-image:url('"+ wallpaperUrl +"') }" :
        ".wallpaperBackground { background-image:none }";
    $("#colorSchemeModeSheet").text(wallpaperStyle);
}

function ResolveEmbeddedMediaUrl(fileName, fallbackUrl){
    if(embeddedMediaMap && embeddedMediaMap[fileName]){
        return embeddedMediaMap[fileName];
    }
    return fallbackUrl;
}
function warmAudioCache(item){
    if(!item || !item.url) return;
    if(String(item.url).indexOf("data:") === 0) return;
    try{
        if(item.preloadAudio) return;
        var warmAudio = new Audio(item.url);
        warmAudio.preload = "auto";
        warmAudio.load();
        item.preloadAudio = warmAudio;
    } catch(e){
    }
}

function sanitizeMediaConfigValue(value){
    if(value === undefined || value === null) return "";
    return String(value).trim();
}
function getFirstDefinedMediaConfigValue(config, keys){
    for(var i = 0; i < keys.length; i++){
        if(config[keys[i]] !== undefined){
            return sanitizeMediaConfigValue(config[keys[i]]);
        }
    }
    return "";
}
function normalizeMediaConfig(config){
    var normalized = {
        ringtone: "",
        ringtoneByLanguage: {},
        holdMusic: "",
        busy: "",
        callWaiting: "",
        congestion: "",
        earlyMedia: ""
    };
    if(!config || typeof config !== "object") return normalized;
    normalized.ringtone = getFirstDefinedMediaConfigValue(config, ["ringtone", "Ringtone"]);
    normalized.holdMusic = getFirstDefinedMediaConfigValue(config, ["holdMusic", "HoldMusic"]);
    normalized.busy = getFirstDefinedMediaConfigValue(config, ["busy", "Busy"]);
    normalized.callWaiting = getFirstDefinedMediaConfigValue(config, ["callWaiting", "CallWaiting"]);
    normalized.congestion = getFirstDefinedMediaConfigValue(config, ["congestion", "Congestion"]);
    normalized.earlyMedia = getFirstDefinedMediaConfigValue(config, ["earlyMedia", "EarlyMedia", "ringbackTone", "RingbackTone"]);
    if(config.ringtoneByLanguage && typeof config.ringtoneByLanguage === "object") normalized.ringtoneByLanguage = config.ringtoneByLanguage;
    if(config.RingtoneByLanguage && typeof config.RingtoneByLanguage === "object") normalized.ringtoneByLanguage = config.RingtoneByLanguage;
    return normalized;
}
function getStoredMediaConfig(){
    return {
        ringtone: sanitizeMediaConfigValue(getDbItem(mediaConfigStorageKeys.ringtone, ""))
    };
}
function getEffectiveMediaConfig(){
    var stored = getStoredMediaConfig();
    var locale = (String(Language || "auto") === "auto")
        ? String((navigator.language || navigator.userLanguage || "en")).toLowerCase()
        : String(Language || "en").toLowerCase();
    var shortLocale = locale.split("-")[0];
    var map = (runtimeMediaConfig.ringtoneByLanguage && typeof runtimeMediaConfig.ringtoneByLanguage === "object")
        ? runtimeMediaConfig.ringtoneByLanguage
        : {};
    var mappedRingtone = sanitizeMediaConfigValue(map[locale] || map[shortLocale] || "");
    return {
        ringtone: stored.ringtone || mappedRingtone || runtimeMediaConfig.ringtone || defaultMediaConfig.ringtone,
        holdMusic: runtimeMediaConfig.holdMusic || defaultMediaConfig.holdMusic,
        busy: runtimeMediaConfig.busy || defaultMediaConfig.busy,
        callWaiting: runtimeMediaConfig.callWaiting || defaultMediaConfig.callWaiting,
        congestion: runtimeMediaConfig.congestion || defaultMediaConfig.congestion,
        earlyMedia: runtimeMediaConfig.earlyMedia || defaultMediaConfig.earlyMedia
    };
}
function resolveMediaAssetUrl(configValue, fallbackFileName, fallbackUrl){
    var value = sanitizeMediaConfigValue(configValue);
    if(value === "") return ResolveEmbeddedMediaUrl(fallbackFileName, fallbackUrl);
    if(value.indexOf("data:") === 0) return value;
    if(value.indexOf("http://") === 0 || value.indexOf("https://") === 0 || value.indexOf("file://") === 0) return value;
    if(value.indexOf("/") > -1 || value.indexOf("\\") > -1){
        return value;
    }
    return ResolveEmbeddedMediaUrl(value, hostingPrefix + "media/" + value);
}
function arrayBufferToBase64(arrayBuffer){
    var bytes = new Uint8Array(arrayBuffer);
    var binary = "";
    for(var i = 0; i < bytes.byteLength; i++){
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
function audioBufferToWavDataUri(audioBuffer){
    var numberOfChannels = audioBuffer.numberOfChannels;
    var sampleRate = audioBuffer.sampleRate;
    var format = 1;
    var bitDepth = 16;
    var samples = audioBuffer.length;
    var blockAlign = numberOfChannels * bitDepth / 8;
    var byteRate = sampleRate * blockAlign;
    var dataSize = samples * blockAlign;
    var buffer = new ArrayBuffer(44 + dataSize);
    var view = new DataView(buffer);
    var offset = 0;
    function writeString(str){
        for(var i = 0; i < str.length; i++) view.setUint8(offset++, str.charCodeAt(i));
    }
    function writeUint16(value){
        view.setUint16(offset, value, true);
        offset += 2;
    }
    function writeUint32(value){
        view.setUint32(offset, value, true);
        offset += 4;
    }
    writeString("RIFF");
    writeUint32(36 + dataSize);
    writeString("WAVE");
    writeString("fmt ");
    writeUint32(16);
    writeUint16(format);
    writeUint16(numberOfChannels);
    writeUint32(sampleRate);
    writeUint32(byteRate);
    writeUint16(blockAlign);
    writeUint16(bitDepth);
    writeString("data");
    writeUint32(dataSize);

    var channels = [];
    for(var c = 0; c < numberOfChannels; c++){
        channels.push(audioBuffer.getChannelData(c));
    }
    var sampleIndex = 0;
    while(sampleIndex < samples){
        for(var channel = 0; channel < numberOfChannels; channel++){
            var sample = Math.max(-1, Math.min(1, channels[channel][sampleIndex]));
            var intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
            view.setInt16(offset, intSample, true);
            offset += 2;
        }
        sampleIndex++;
    }
    return "data:audio/wav;base64," + arrayBufferToBase64(buffer);
}
async function convertRingtoneFileToDataUri(file){
    if(!file) throw new Error("No file selected");
    if(file.size > mediaUploadLimits.maxBytes){
        throw new Error("Ringtone file is too large. Max size is 2MB.");
    }
    var lowerName = String(file.name || "").toLowerCase();
    var mime = String(file.type || "").toLowerCase();
    var isMp3 = mime.indexOf("mpeg") > -1 || lowerName.endsWith(".mp3");
    if(isMp3){
        return await new Promise(function(resolve, reject){
            var reader = new FileReader();
            reader.onload = function(){ resolve(String(reader.result || "")); };
            reader.onerror = function(){ reject(new Error("Cannot read ringtone file.")); };
            reader.readAsDataURL(file);
        });
    }
    var audioData = await new Promise(function(resolve, reject){
        var reader = new FileReader();
        reader.onload = function(){ resolve(reader.result); };
        reader.onerror = function(){ reject(new Error("Cannot read ringtone file.")); };
        reader.readAsArrayBuffer(file);
    });
    var context = new (window.AudioContext || window.webkitAudioContext)();
    try{
        var decoded = await context.decodeAudioData(audioData.slice(0));
        return audioBufferToWavDataUri(decoded);
    } finally {
        if(context && typeof context.close === "function"){
            context.close();
        }
    }
}
function setRuntimeMediaConfigFromOptions(options){
    var mediaFromObject = normalizeMediaConfig((options && (options.MediaConfig || options.mediaConfig)) ? (options.MediaConfig || options.mediaConfig) : {});
    if(options && options.Ringtone !== undefined) mediaFromObject.ringtone = sanitizeMediaConfigValue(options.Ringtone);
    if(options && options.RingtoneUrl !== undefined) mediaFromObject.ringtone = sanitizeMediaConfigValue(options.RingtoneUrl);
    if(options && options.RingtoneByLanguage && typeof options.RingtoneByLanguage === "object") mediaFromObject.ringtoneByLanguage = options.RingtoneByLanguage;
    runtimeMediaConfig = mediaFromObject;
}

function PreloadAudioFiles(){
    var mediaConfig = getEffectiveMediaConfig();
    audioBlobs.Ringtone = { file : "Ringtone.mp3", url : resolveMediaAssetUrl(mediaConfig.ringtone, "Ringtone.mp3", hostingPrefix +"media/Ringtone.mp3") }
    audioBlobs.HoldMusic = { file : "HoldMusic.mp3", url : mediaConfig.holdMusic ? resolveMediaAssetUrl(mediaConfig.holdMusic, "HoldMusic.mp3", "") : "" }
    audioBlobs.Busy = { file : "Busy.mp3", url : resolveMediaAssetUrl(mediaConfig.busy, "Busy.mp3", hostingPrefix +"media/Busy.mp3") }
    audioBlobs.CallWaiting = { file : "CallWaiting.mp3", url : resolveMediaAssetUrl(mediaConfig.callWaiting, "CallWaiting.mp3", hostingPrefix +"media/CallWaiting.mp3") }
    audioBlobs.Congestion = { file : "Congestion.mp3", url : resolveMediaAssetUrl(mediaConfig.congestion, "Congestion.mp3", hostingPrefix +"media/Congestion.mp3") }
    audioBlobs.EarlyMedia = { file : "EarlyMedia.mp3", url : resolveMediaAssetUrl(mediaConfig.earlyMedia, "EarlyMedia.mp3", hostingPrefix +"media/EarlyMedia.mp3") }

    $.each(audioBlobs, function (i, item) {
        if(item && item.url){
            item.blob = item.url;
        }
    });
    warmAudioCache(audioBlobs.Ringtone);
    warmAudioCache(audioBlobs.HoldMusic);
    warmAudioCache(audioBlobs.Busy);
    warmAudioCache(audioBlobs.CallWaiting);
    warmAudioCache(audioBlobs.Congestion);
    warmAudioCache(audioBlobs.EarlyMedia);

    var loadedAudioItems = [];
    $.each(audioBlobs, function (i, item) {
        if(!item || !item.url) return;
        if(loadedAudioItems.indexOf(item) > -1) return;
        loadedAudioItems.push(item);
        if(item.url.indexOf("data:") === 0){
            item.blob = item.url;
            return;
        }
        var oReq = new XMLHttpRequest();
        oReq.open("GET", item.url, true);
        oReq.responseType = "blob";
        oReq.onload = function(oEvent) {
            var reader = new FileReader();
            reader.readAsDataURL(oReq.response);
            reader.onload = function() {
                item.blob = reader.result;
            }
        }
        oReq.send();
    });
}
function stopSessionHoldMusic(session){
    if(!session || !session.data || !session.data.holdMusicAudio) return;
    try {
        session.data.holdMusicAudio.pause();
        session.data.holdMusicAudio.removeAttribute("src");
        session.data.holdMusicAudio.load();
    } catch(e){}
    session.data.holdMusicAudio = null;
}
function playSessionHoldMusic(session){
    if(!session || !session.data || !audioBlobs.HoldMusic || !audioBlobs.HoldMusic.blob) return;
    stopSessionHoldMusic(session);
    try {
        var holdAudio = new Audio(audioBlobs.HoldMusic.blob);
        holdAudio.preload = "auto";
        holdAudio.loop = true;
        session.data.holdMusicAudio = holdAudio;
        PlayMediaElementSafely(holdAudio, "hold-music");
    } catch(e){
        console.warn("Unable to play hold music", e);
    }
}
function CreateUserAgent() {
    console.log("Creating User Agent...");
    normalizedSipAuth = NormalizeSipPasswordAndType(SipPassword, SipPasswordType);
    SipPassword = normalizedSipAuth.password;
    SipPasswordType = normalizedSipAuth.type;

    if(SipDomain==null || SipDomain=="" || SipDomain=="null" || SipDomain=="undefined") SipDomain = wssServer;
    var socketScheme = (Wss === false) ? "ws" : "wss";
    var options = {
        logLevel : "debug",
        logConfiguration: false,
        uri: SIP.UserAgent.makeURI("sip:"+ SipUsername + "@" + SipDomain),
        transportOptions: {
            server: socketScheme + "://"+ wssServer +":"+ WebSocketPort +""+ ServerPath,
            traceSip: TraceSip,
            connectionTimeout: TransportConnectionTimeout,
            keepAliveInterval: 30
        },
        sessionDescriptionHandlerFactoryOptions: {
            peerConnectionConfiguration :{
                bundlePolicy: BundlePolicy,
            },
            iceGatheringTimeout: IceStunCheckTimeout
        },
        contactName: ContactUserName,
        displayName: profileName,
        authorizationUsername: SipUsername,
        authorizationPassword: (SipPasswordType === "ha1") ? undefined : SipPassword,
        authorizationHa1: (SipPasswordType === "ha1") ? SipPassword : undefined,
        hackIpInContact: IpInContact,
        userAgentString: userAgentStr,
        autoStart: false,
        autoStop: true,
        register: false,
        noAnswerTimeout: NoAnswerTimeout,
        contactParams: {},
        delegate: {
            onInvite: function (sip){
                ReceiveCall(sip);
            },
            onMessage: function (sip){
            }
        }
    }
    if(IceStunServerJson != ""){
        options.sessionDescriptionHandlerFactoryOptions.peerConnectionConfiguration.iceServers = JSON.parse(IceStunServerJson);
    }
    if(RegisterContactParams && RegisterContactParams != "" && RegisterContactParams != "{}"){
        try{
            options.contactParams = JSON.parse(RegisterContactParams);
        } catch(e){}
    }
    if(WssInTransport){
        try{
            options.contactParams.transport = "wss";
        } catch(e){}
    }

    userAgent = new SIP.UserAgent(options);
    userAgent.isRegistered = function(){
        return (userAgent && userAgent.registerer && userAgent.registerer.state == SIP.RegistererState.Registered);
    }
    userAgent.sessions = userAgent._sessions;
    userAgent.registrationCompleted = false;
    userAgent.registering = false;
    userAgent.transport.ReconnectionAttempts = TransportReconnectionAttempts;
    userAgent.transport.attemptingReconnection = false;
    userAgent.BlfSubs = [];
    userAgent.lastVoicemailCount = 0;

    console.log("Creating User Agent... Done");
    if(typeof web_hook_on_userAgent_created !== 'undefined') web_hook_on_userAgent_created(userAgent);

    var uaRef = userAgent;
    var transportRef = userAgent.transport;
    userAgent.transport.onConnect = function(){
        onTransportConnected(uaRef, transportRef);
    }
    userAgent.transport.onDisconnect = function(error){
        if(error){
            onTransportConnectError(error, transportRef, uaRef);
        }
        else {
            onTransportDisconnected(uaRef, transportRef);
        }
    }

    var RegistererOptions = {
        logConfiguration: false,
        expires: RegisterExpires,
        extraHeaders: [],
        extraContactHeaderParams: [],
        refreshFrequency : 75
    }
    if(RegisterExtraHeaders && RegisterExtraHeaders != "" && RegisterExtraHeaders != "{}"){
        try{
            var registerExtraHeaders = JSON.parse(RegisterExtraHeaders);
            for (const [key, value] of Object.entries(registerExtraHeaders)) {
                if(value != ""){
                    RegistererOptions.extraHeaders.push(key + ": "+  value);
                }
            }
        } catch(e){}
    }
    if(RegisterExtraContactParams && RegisterExtraContactParams != "" && RegisterExtraContactParams != "{}"){
        try{
            var registerExtraContactParams = JSON.parse(RegisterExtraContactParams);
            for (const [key, value] of Object.entries(registerExtraContactParams)) {
                if(value == ""){
                    RegistererOptions.extraContactHeaderParams.push(key);
                } else {
                    RegistererOptions.extraContactHeaderParams.push(key + "="+  value);
                }
            }
        } catch(e){}
    }

    userAgent.registerer = new SIP.Registerer(userAgent, RegistererOptions);

    console.log("Creating Registerer... Done");
    userAgent.registerer.stateChange.addListener(function(newState){
        console.log("User Agent Registration State:", newState);
        switch (newState) {
            case SIP.RegistererState.Initial:
                break;
            case SIP.RegistererState.Registered:
                onRegistered();
                break;
            case SIP.RegistererState.Unregistered:
                onUnregistered();
                break;
            case SIP.RegistererState.Terminated:
                break;
        }
    });

    console.log("User Agent Connecting to WebSocket...");
    SetStatusMessage(lang.connecting_to_web_socket, "fa-wifi");
    userAgent.start().then(function(){
        console.log("User Agent Started");
    }).catch(function(error){
        onTransportConnectError(error);
    });

}

function IsTransportReady(){
    if(!userAgent || !userAgent.transport) return false;

    var transport = userAgent.transport;
    if(transport.attemptingReconnection === true) {
        console.warn("Transport is reconnecting, cannot send re-INVITE");
        return false;
    }
    if(!transport._ws) return false;
    if(transport._ws.readyState !== WebSocket.OPEN) {
        console.warn("Transport WebSocket is not OPEN (state:", transport._ws.readyState, ")");
        return false;
    }

    return true;
}
function onTransportConnected(userAgentRef, transportRef){
    var ua = userAgentRef || userAgent;
    var transport = transportRef || (ua ? ua.transport : null);
    if(!ua || !transport) return;

    console.log("Connected to Web Socket!");
    SetStatusMessage(lang.connected_to_web_socket, "fa-wifi");
    ua.isReRegister = false;
    TransportManualDisconnect = false;
    transport.attemptingReconnection = false;
    transport.ReconnectionAttempts = TransportReconnectionAttempts;
    window.setTimeout(function (){
        Register();
    }, 100);
}
function onTransportConnectError(error, transportRef, userAgentRef){
    var ua = userAgentRef || userAgent;
    var transport = transportRef || (ua ? ua.transport : null);
    console.warn("WebSocket Connection Failed:", error);
    SetStatusMessage(lang.web_socket_error, "fa-wifi");
    if(typeof web_hook_on_transportError !== 'undefined') web_hook_on_transportError(transport, ua);
    window.setTimeout(function(){
        if(ua) ua.isReRegister = false;
        if(transport) transport.attemptingReconnection = false;
        if(userAgent == null || userAgent.transport == null) return;
        ReconnectTransport();
    }, 1000);
}
function onTransportDisconnected(userAgentRef, transportRef){
    var ua = userAgentRef || userAgent;
    var transport = transportRef || (ua ? ua.transport : null);
    if(!ua || !transport) return;
    console.log("Disconnected from Web Socket!");
    SetStatusMessage(lang.disconnected_from_web_socket, "fa-wifi");
    if(TransportManualDisconnect == false){
        ReconnectTransport();
    }
}
function DisconnectTransport(){
    if(userAgent == null) return;
    TransportManualDisconnect = true;
    SetStatusMessage(lang.disconnected_from_web_socket, "fa-wifi");
    console.log("Forcing the WebSocket to close, this can take up to 30 seconds...");
    userAgent.transport._ws.onclose = function(){};
    userAgent.transport._ws.onerror = function(){};
    userAgent.transport._ws.onopen = function(){};
    userAgent.transport._ws.onmessage = function(){};
    userAgent.transport._ws.close(3000, "Offline Detected");
    userAgent.transport._ws = undefined;
    userAgent.transport.transitioningState = false;
    userAgent.transport._state = SIP.TransportState.Disconnected;
    userAgent.registerer._state = SIP.RegistererState.Unregistered;
    userAgent.registerer._waiting = false;
    onUnregistered();
}
function ReconnectTransport(){
    if(userAgent == null) return;
    if(userAgent.transport.attemptingReconnection == true){
        console.warn("User Agent appears to be reconnecting already.");
        return;
    }
    if (userAgent.transport.ReconnectionAttempts <= 0) {
        console.warn("User Agent reconnect attempts exhausted.");
        return;
    }
    userAgent.transport.ReconnectionAttempts = userAgent.transport.ReconnectionAttempts - 1;

    console.log("Reconnect Transport...");
    SetStatusMessage(lang.connecting_to_web_socket, "fa-wifi");
    userAgent.registering = false;
    userAgent.transport.attemptingReconnection = true;
    userAgent.reconnect().then(function(){
        console.log("Reconnect Transport Successful");

        userAgent.isReRegister = false;
        userAgent.transport.attemptingReconnection = false;
        userAgent.transport.ReconnectionAttempts = TransportReconnectionAttempts;
    }).catch(function(e){
        console.log("Reconnect Transport Failed, trying again.", e);
        console.log("Attempt remaining:", userAgent.transport.ReconnectionAttempts);
        userAgent.transport.attemptingReconnection = false;
        window.setTimeout(function(){
            ReconnectTransport();
        }, TransportReconnectionTimeout * 1000);
    });
}
function Register() {
    if (userAgent == null) return;
    if (userAgent.registering == true) {
        console.warn("User Agent is already registering");
        return;
    }

    var RegistererRegisterOptions = {
        requestDelegate: {
            onReject: function(sip){
                onRegisterFailed(sip.message.reasonPhrase, sip.message.statusCode);
            }
        }
    }

    console.log("Sending Registration...");
    SetStatusMessage(lang.sending_registration);
    TransportManualDisconnect = false;
    userAgent.registering = true;
    userAgent.registerer.register(RegistererRegisterOptions);
}
function Unregister(skipUnsubscribe) {
    if (userAgent == null) return;
    if (!userAgent.isRegistered()) {
        console.warn("User Agent is not registered");
        return;
    }

    if(skipUnsubscribe == true){
        console.log("Skipping Unsubscribe");
    } else {
        console.log("Unsubscribing...");
        SetStatusMessage(lang.unsubscribing);
        try {
            UnsubscribeAll();
        } catch (e) { }
    }

    console.log("Unregister...");
    SetStatusMessage(lang.disconnecting);
    TransportManualDisconnect = true;
    userAgent.registerer.unregister();

    userAgent.transport.attemptingReconnection = false;
    userAgent.registering = false;
    userAgent.isReRegister = false;
}
function onRegistered(){

    userAgent.registrationCompleted = true;
    RegistrationErrorText = "";
    authModeFallbackTried = false;
    if(!userAgent.isReRegister) {
        console.log("Registered!");

        $("#reglink").hide();
        $("#dereglink").show();
        if(DoNotDisturbEnabled || DoNotDisturbPolicy == "enabled") {
            $("#dereglink").attr("class", "dotDoNotDisturb");
            $("#dndStatus").html("(DND)");
        }
        ApplyDoNotDisturbState();
        SyncMobileRegLink();
        window.setTimeout(function (){
            SubscribeAll();
        }, 500);
        SetStatusMessage(lang.registered, null, false, 900);
        ApplyRegistrationStatusText();

        userAgent.registering = false;
        if(typeof web_hook_on_register !== 'undefined') web_hook_on_register(userAgent);
    }
    else {
        userAgent.registering = false;

        console.log("ReRegistered!");
    }
    userAgent.isReRegister = true;
}
function onRegisterFailed(response, cause){
    if(TryAuthModeFallbackOnRegisterFailure(cause) == true){
        return;
    }

    console.log("Registration Failed: ", response);
    RegistrationErrorText = response || lang.registration_failed;
    SetStatusMessage(lang.registration_failed, null, true);

    $("#reglink").show();
    $("#dereglink").hide();
    $("#reglink").attr("class", "dotOffline");
    ApplyRegistrationStatusText();
    SyncMobileRegLink();

    userAgent.registering = false;
    if(typeof web_hook_on_registrationFailed !== 'undefined') web_hook_on_registrationFailed(response);
}
function onUnregistered(){
    RegistrationErrorText = "";
    if(userAgent.registrationCompleted){
        console.log("Unregistered, bye!");
        SetStatusMessage(lang.unregistered, null, false, 600);

        $("#reglink").show();
        $("#dereglink").hide();
        $("#reglink").attr("class", "dotOffline");
        ApplyRegistrationStatusText();
        SyncMobileRegLink();
        if(typeof web_hook_on_unregistered !== 'undefined') web_hook_on_unregistered();
    }
    else {
    }
    userAgent.isReRegister = false;
}
function ReceiveCall(session) {
    var callerID = session.remoteIdentity.displayName;
    var did = session.remoteIdentity.uri.user;
    if (typeof callerID === 'undefined') callerID = did;

    var sipHeaders = session.incomingInviteRequest.message.headers;
    if(session.assertedIdentity){
    }
    if(sipHeaders.hasOwnProperty("P-Asserted-Identity")){
        var rawUri = sipHeaders["P-Asserted-Identity"][0].raw;
        if(rawUri.includes("<sip:")) {
            var uriParts = rawUri.split("<sip:");
            if(uriParts[1].endsWith(">")) uriParts[1] = uriParts[1].substring(0, uriParts[1].length -1);

            var assertId = SIP.UserAgent.makeURI("sip:"+ uriParts[1]);
            did = assertId.user;
            console.log("Found P-Asserted-Identity, will use that to identify user:", did);
        }
        else {
            console.warn("Found P-Asserted-Identity but not in a URI: ", rawUri);
        }
    }

    console.log("New Incoming Call!", callerID +" <"+ did +">");

    var CurrentCalls = countSessions(session.id);
    console.log("Current Call Count:", CurrentCalls);

    var buddyObj = FindBuddyByDid(did);
    if(buddyObj == null) {

        var focusOnBuddy = (CurrentCalls==0 && IsCallFirstContactMode() == false);
        var buddyType = (did.length > DidLength)? "contact" : "extension";
        if(sipHeaders.hasOwnProperty("X-Buddytype")){
            if(sipHeaders["X-Buddytype"][0].raw == "contact" || sipHeaders["X-Buddytype"][0].raw == "extension" || sipHeaders["X-Buddytype"][0].raw == "xmpp" || sipHeaders["X-Buddytype"][0].raw == "group"){
                buddyType = sipHeaders["X-Buddytype"][0].raw;
                console.log("Hint Header X-Buddytype:", buddyType)
            }
            else {
                console.warn("Hint Header X-Buddytype must either contact | extension | xmpp | group: ", sipHeaders["X-Buddytype"][0].raw);
            }
        }
        var subscribeToBuddy = false;
        var subscribeUser = null;
        if(sipHeaders.hasOwnProperty("X-Subscribeuser")){
            if(sipHeaders["X-Subscribeuser"][0].raw.startsWith("sip:") && sipHeaders["X-Subscribeuser"][0].raw.endsWith("@"+SipDomain)){
                subscribeUser = sipHeaders["X-Subscribeuser"][0].raw.substring(4, sipHeaders["X-Subscribeuser"][0].raw.indexOf("@"));
                subscribeToBuddy = true;
                console.log("Hint Header X-Subscribeuser:", subscribeUser)
            }
            else {
                console.warn("Hint Header X-Subscribeuser must start with sip: and end with @SipDomain", sipHeaders["X-Subscribeuser"][0].raw);
            }
        }
        var allowDuringDnd = false;
        if(sipHeaders.hasOwnProperty("X-Allowduringdnd")){
            if(sipHeaders["X-Allowduringdnd"][0].raw == "yes" || sipHeaders["X-Allowduringdnd"][0].raw == "no"){
                allowDuringDnd = (sipHeaders["X-Allowduringdnd"][0].raw == "yes");
                console.log("Hint Header X-Allowduringdnd:", allowDuringDnd)
            }
            else {
                console.warn("Hint Header X-Allowduringdnd must yes | no :", sipHeaders["X-Allowduringdnd"][0].raw);
            }
        }
        var autoDelete = AutoDeleteDefault;
        if(sipHeaders.hasOwnProperty("X-Autodelete")){
            if(sipHeaders["X-Autodelete"][0].raw == "yes" || sipHeaders["X-Autodelete"][0].raw == "no"){
                autoDelete = (sipHeaders["X-Autodelete"][0].raw == "yes");
                console.log("Hint Header X-Autodelete:", autoDelete)
            }
            else {
                console.warn("Hint Header X-Autodelete must yes | no :", sipHeaders["X-Autodelete"][0].raw);
            }
        }

        buddyObj = MakeBuddy(buddyType, true, focusOnBuddy, subscribeToBuddy, callerID, did, null, allowDuringDnd, subscribeUser, autoDelete, false);
    }
    else {
        if(buddyObj.type == "extension" && buddyObj.CallerIDName != callerID){
            UpdateBuddyCallerID(buddyObj, callerID);
        }
        else if(buddyObj.type == "contact" && callerID != did && buddyObj.CallerIDName != callerID){
            UpdateBuddyCallerID(buddyObj, callerID);
        }
    }

    var startTime = moment.utc();
    newLineNumber = newLineNumber + 1;
    var lineObj = new Line(newLineNumber, callerID, did, buddyObj);
    lineObj.ReturnToTab = GetActiveMainTab();
    lineObj.SipSession = session;
    lineObj.SipSession.data = {}
    lineObj.SipSession.data.line = lineObj.LineNumber;
    lineObj.SipSession.data.calldirection = "inbound";
    lineObj.SipSession.data.terminateby = "";
    lineObj.SipSession.data.src = did;
    lineObj.SipSession.data.buddyId = lineObj.BuddyObj.identity;
    lineObj.SipSession.data.callstart = startTime.format("YYYY-MM-DD HH:mm:ss UTC");
    lineObj.SipSession.data.callTimer = window.setInterval(function(){
        var now = moment.utc();
        var duration = moment.duration(now.diff(startTime));
        var timeStr = formatShortDuration(duration.asSeconds());
        $("#line-" + lineObj.LineNumber + "-timer").html(timeStr);
        $("#line-" + lineObj.LineNumber + "-datetime").html(timeStr);
    }, 1000);
    lineObj.SipSession.data.earlyReject = false;
    Lines.push(lineObj);
    lineObj.SipSession.data.withvideo = false;
    if(EnableVideoCalling == true && lineObj.SipSession.request.body){
        if(lineObj.SipSession.request.body.indexOf("m=video") > -1) {
            lineObj.SipSession.data.withvideo = true;
            if(buddyObj.type == "contact"){
            }
        }
    }
    lineObj.SipSession.data.hasDtlsFingerprint = true;
    if(lineObj.SipSession.request && lineObj.SipSession.request.body){
        lineObj.SipSession.data.hasDtlsFingerprint = (lineObj.SipSession.request.body.indexOf("a=fingerprint:") > -1);
        if(lineObj.SipSession.data.hasDtlsFingerprint === false){
            console.warn("Inbound INVITE SDP is missing DTLS fingerprint; answering will fail in WebRTC.");
        }
    }

    EmitEmbedPhoneEvent("vphone-call", {
        phase: "incoming",
        lineNumber: lineObj.LineNumber,
        callerId: callerID,
        did: did,
        withVideo: !!lineObj.SipSession.data.withvideo
    });
    lineObj.SipSession.delegate = {
        onBye: function(sip){
            onSessionReceivedBye(lineObj, sip)
        },
        onMessage: function(sip){
            onSessionReceivedMessage(lineObj, sip);
        },
        onInvite: function(sip){
            onSessionReinvited(lineObj, sip);
        },
        onSessionDescriptionHandler: function(sdh, provisional){
            onSessionDescriptionHandlerCreated(lineObj, sdh, provisional, lineObj.SipSession.data.withvideo);
        }
    }
    AttachSessionTerminationObserver(lineObj, lineObj.SipSession, "inbound");
    lineObj.SipSession.incomingInviteRequest.delegate = {
        onCancel: function(sip){
            onInviteCancel(lineObj, sip)
        }
    }
    if(DoNotDisturbEnabled == true || DoNotDisturbPolicy == "enabled") {
        if(DoNotDisturbEnabled == true && buddyObj.EnableDuringDnd == true){
            console.log("Buddy is allowed to call while you are on DND")
        }
        else {
            console.log("Do Not Disturb Enabled, rejecting call.");
            lineObj.SipSession.data.earlyReject = true;
            RejectCall(lineObj.LineNumber, 486, "Do Not Disturb");
            return;
        }
    }
    if(CurrentCalls >= 1){
        if(CallWaitingEnabled == false || CallWaitingEnabled == "disabled"){
            console.log("Call Waiting Disabled, rejecting call.");
            lineObj.SipSession.data.earlyReject = true;
            RejectCall(lineObj.LineNumber, 486, "Busy Here");
            return;
        }
    }
    AddLineHtml(lineObj, "inbound");
    RefreshLineDisplay(lineObj);
    $("#line-" + lineObj.LineNumber + "-msg").html(lang.incoming_call);
    $("#line-" + lineObj.LineNumber + "-msg").show();
    $("#line-" + lineObj.LineNumber + "-timer").show();
    if(lineObj.SipSession.data.withvideo){
        $("#line-"+ lineObj.LineNumber +"-answer-video").show();
    }
    else {
        $("#line-"+ lineObj.LineNumber +"-answer-video").hide();
    }
    $("#line-" + lineObj.LineNumber + "-AnswerCall").show();

    if(CurrentCalls == 0){
        SelectLine(lineObj.LineNumber);
    }
    UpdateBuddyList();
    var autoAnswerRequested = false;
    var answerTimeout = 1000;
    if (!AutoAnswerEnabled  && IntercomPolicy == "enabled"){

        var ci = session.request.headers["Call-Info"];
        if (ci !== undefined && ci.length > 0){
            for (var i = 0; i < ci.length; i++){
                var raw_ci = ci[i].raw.toLowerCase();
                if (raw_ci.indexOf("answer-after=") > 0){
                    var temp_seconds_autoanswer = parseInt(raw_ci.substring(raw_ci.indexOf("answer-after=") +"answer-after=".length).split(';')[0]);
                    if (Number.isInteger(temp_seconds_autoanswer) && temp_seconds_autoanswer >= 0){
                        autoAnswerRequested = true;
                        if(temp_seconds_autoanswer > 1) answerTimeout = temp_seconds_autoanswer * 1000;
                        break;
                    }
                }
            }
        }
        var ai = session.request.headers["Alert-Info"];
        if (autoAnswerRequested === false && ai !== undefined && ai.length > 0){
            for (var i=0; i < ai.length ; i++){
                var raw_ai = ai[i].raw.toLowerCase();
                if (raw_ai.indexOf("auto answer") > 0 || raw_ai.indexOf("alert-autoanswer") > 0){
                    var autoAnswerRequested = true;
                    break;
                }
                if (raw_ai.indexOf("answer-after=") > 0){
                    var temp_seconds_autoanswer = parseInt(raw_ai.substring(raw_ai.indexOf("answer-after=") +"answer-after=".length).split(';')[0]);
                    if (Number.isInteger(temp_seconds_autoanswer) && temp_seconds_autoanswer >= 0){
                        autoAnswerRequested = true;
                        if(temp_seconds_autoanswer > 1) answerTimeout = temp_seconds_autoanswer * 1000;
                        break;
                    }
                }
            }
        }
    }

    if(AutoAnswerEnabled || AutoAnswerPolicy == "enabled" || autoAnswerRequested){
        if(CurrentCalls == 0){
            console.log("Going to Auto Answer this call...");
            window.setTimeout(function(){
                if(lineObj.SipSession.data.withvideo) {
                    AnswerVideoCall(lineObj.LineNumber);
                }
                else {
                    AnswerAudioCall(lineObj.LineNumber);
                }
            }, answerTimeout);
            SelectLine(lineObj.LineNumber);
            return;
        }
        else {
            console.warn("Could not auto answer call, already on a call.");
        }
    }
    var streamVisible = $("#stream-"+ buddyObj.identity).is(":visible");
    if (streamVisible || CurrentCalls == 0) {
        if(CurrentCalls == 0) SelectLine(lineObj.LineNumber);
    }
    if (NotificationsActive && "Notification" in window) {
        if (Notification.permission === "granted") {
            var noticeOptions = {
                body: lang.incoming_call_from +" " + callerID +" <"+ did +">",
                icon: getNotificationIconUrl()
            }
            var inComingCallNotification = new Notification(lang.incoming_call, noticeOptions);
            inComingCallNotification.onclick = function (event) {
                console.log("Notification Clicked:", callerID, did);
                event.preventDefault();
                window.focus();

                var lineNo = lineObj.LineNumber;
                var videoInvite = lineObj.SipSession.data.withvideo
                window.setTimeout(function(){
                    if(videoInvite) {
                        AnswerVideoCall(lineNo)
                    }
                    else {
                        AnswerAudioCall(lineNo);
                    }
                }, 1000);
                SelectLine(lineNo);
                return;
            }
        }
    }
    if(EnableRingtone == true){
        if(CurrentCalls >= 1){
            var ringer = new Audio(audioBlobs.CallWaiting.blob);
            ringer.preload = "auto";
            ringer.loop = false;
            ringer.onloadeddata = function(e) {
                if (typeof ringer.sinkId !== 'undefined' && getRingerOutputID() != "default") {
                    ringer.setSinkId(getRingerOutputID()).then(function() {
                        console.log("Set sinkId to:", getRingerOutputID());
                    }).catch(function(e){
                        console.warn("Failed not apply setSinkId.", e);
                    });
                }
                PlayMediaElementSafely(ringer, "call-waiting-ringer");
            }
            lineObj.SipSession.data.ringerObj = ringer;
        } else {
            var ringer = new Audio(audioBlobs.Ringtone.blob);
            ringer.preload = "auto";
            ringer.loop = true;
            ringer.onloadeddata = function(e) {
                if (typeof ringer.sinkId !== 'undefined' && getRingerOutputID() != "default") {
                    ringer.setSinkId(getRingerOutputID()).then(function() {
                        console.log("Set sinkId to:", getRingerOutputID());
                    }).catch(function(e){
                        console.warn("Failed not apply setSinkId.", e);
                    });
                }
                PlayMediaElementSafely(ringer, "incoming-ringer");
            }
            lineObj.SipSession.data.ringerObj = ringer;
        }

    }
    if(typeof web_hook_on_invite !== 'undefined') web_hook_on_invite(session);
}
function AnswerAudioCall(lineNumber) {

    var lineObj = FindLineByNumber(lineNumber);
    if(lineObj == null){
        console.warn("Failed to get line ("+ lineNumber +")");
        return;
    }
    var session = lineObj.SipSession;
    if(session && session.data && session.data.hasDtlsFingerprint === false){
        Alert("Inbound SDP is missing DTLS fingerprint. Please enable WebRTC/DTLS-SRTP on the SIP server endpoint.");
        RejectCall(lineObj.LineNumber, 488, "Not Acceptable Here");
        return;
    }
    if(session.data.ringerObj){
        session.data.ringerObj.pause();
        session.data.ringerObj.removeAttribute('src');
        session.data.ringerObj.load();
        session.data.ringerObj = null;
    }
    if(HasAudioDevice == false){
        Alert(lang.alert_no_microphone);
        $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_failed);
        $("#line-" + lineObj.LineNumber + "-AnswerCall").hide();
        return;
    }
    $("#line-" + lineObj.LineNumber + "-AnswerCall").hide();
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var spdOptions = {
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId : "default" },
                video: false
            }
        }
    }
    var currentAudioDevice = getAudioSrcID();
    if(currentAudioDevice != "default"){
        var confirmedAudioDevice = false;
        for (var i = 0; i < AudioinputDevices.length; ++i) {
            if(currentAudioDevice == AudioinputDevices[i].deviceId) {
                confirmedAudioDevice = true;
                break;
            }
        }
        if(confirmedAudioDevice) {
            spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: currentAudioDevice }
        }
        else {
            console.warn("The audio device you used before is no longer available, default settings applied.");
            localDB.setItem("AudioSrcId", "default");
        }
    }
    if(supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if(supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if(supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }
    lineObj.SipSession.data.withvideo = false;
    lineObj.SipSession.data.VideoSourceDevice = null;
    lineObj.SipSession.data.AudioSourceDevice = getAudioSrcID();
    lineObj.SipSession.data.AudioOutputDevice = getAudioOutputID();
    lineObj.SipSession.accept(spdOptions).then(function(){
        onInviteAccepted(lineObj,false);
    }).catch(function(error){
        console.warn("Failed to answer call", error, lineObj.SipSession);
        lineObj.SipSession.data.reasonCode = 500;
        lineObj.SipSession.data.reasonText = "Client Error";
        teardownSession(lineObj);
    });
}
function AnswerVideoCall(lineNumber) {

    var lineObj = FindLineByNumber(lineNumber);
    if(lineObj == null){
        console.warn("Failed to get line ("+ lineNumber +")");
        return;
    }
    var session = lineObj.SipSession;
    if(session && session.data && session.data.hasDtlsFingerprint === false){
        Alert("Inbound SDP is missing DTLS fingerprint. Please enable WebRTC/DTLS-SRTP on the SIP server endpoint.");
        RejectCall(lineObj.LineNumber, 488, "Not Acceptable Here");
        return;
    }
    if(session.data.ringerObj){
        session.data.ringerObj.pause();
        session.data.ringerObj.removeAttribute('src');
        session.data.ringerObj.load();
        session.data.ringerObj = null;
    }
    if(HasAudioDevice == false){
        Alert(lang.alert_no_microphone);
        $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_failed);
        $("#line-" + lineObj.LineNumber + "-AnswerCall").hide();
        return;
    }
    $("#line-" + lineObj.LineNumber + "-AnswerCall").hide();
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var spdOptions = {
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId : "default" },
                video: { deviceId : "default" }
            }
        }
    }
    var currentAudioDevice = getAudioSrcID();
    if(currentAudioDevice != "default"){
        var confirmedAudioDevice = false;
        for (var i = 0; i < AudioinputDevices.length; ++i) {
            if(currentAudioDevice == AudioinputDevices[i].deviceId) {
                confirmedAudioDevice = true;
                break;
            }
        }
        if(confirmedAudioDevice) {
            spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: currentAudioDevice }
        }
        else {
            console.warn("The audio device you used before is no longer available, default settings applied.");
            localDB.setItem("AudioSrcId", "default");
        }
    }
    if(supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if(supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if(supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }
    var currentVideoDevice = getVideoSrcID();
    if(currentVideoDevice != "default"){
        var confirmedVideoDevice = false;
        for (var i = 0; i < VideoinputDevices.length; ++i) {
            if(currentVideoDevice == VideoinputDevices[i].deviceId) {
                confirmedVideoDevice = true;
                break;
            }
        }
        if(confirmedVideoDevice){
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.deviceId = { exact: currentVideoDevice }
        }
        else {
            console.warn("The video device you used before is no longer available, default settings applied.");
            localDB.setItem("VideoSrcId", "default");
        }
    }
    if(supportedConstraints.frameRate && maxFrameRate != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.frameRate = maxFrameRate;
    }
    if(supportedConstraints.height && videoHeight != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.height = videoHeight;
    }
    if(supportedConstraints.aspectRatio && videoAspectRatio != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.aspectRatio = videoAspectRatio;
    }
    lineObj.SipSession.data.withvideo = true;
    lineObj.SipSession.data.VideoSourceDevice = getVideoSrcID();
    lineObj.SipSession.data.AudioSourceDevice = getAudioSrcID();
    lineObj.SipSession.data.AudioOutputDevice = getAudioOutputID();

    if(StartVideoFullScreen) ExpandVideoArea(lineObj.LineNumber);
    lineObj.SipSession.accept(spdOptions).then(function(){
        onInviteAccepted(lineObj,true);
    }).catch(function(error){
        console.warn("Failed to answer call", error, lineObj.SipSession);
        lineObj.SipSession.data.reasonCode = 500;
        lineObj.SipSession.data.reasonText = "Client Error";
        teardownSession(lineObj);
    });
}
function RejectCall(lineNumber, statusCode, reasonPhrase) {
    var rejectCode = statusCode || 486;
    var rejectReason = reasonPhrase || "Busy Here";
    var lineObj = FindLineByNumber(lineNumber);
    if (lineObj == null) {
        console.warn("Unable to find line ("+ lineNumber +")");
        return;
    }
    var session = lineObj.SipSession;
    if (session == null) {
        console.warn("Reject failed, null session");
        if($("#line-" + lineObj.LineNumber + "-msg").length) $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_failed);
        if($("#line-" + lineObj.LineNumber + "-AnswerCall").length) $("#line-" + lineObj.LineNumber + "-AnswerCall").hide();
        return;
    }
    if(session.state == SIP.SessionState.Established){
        session.bye().catch(function(e){
            console.warn("Problem in RejectCall(), could not bye() call", e, session);
        });
    }
    else {
        session.reject({
            statusCode: rejectCode,
            reasonPhrase: rejectReason
        }).catch(function(e){
            console.warn("Problem in RejectCall(), could not reject() call", e, session);
        });
    }
    if($("#line-" + lineObj.LineNumber + "-msg").length) $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_rejected);

    session.data.terminateby = "us";
    session.data.reasonCode = rejectCode;
    session.data.reasonText = rejectReason;
    teardownSession(lineObj);
}
function onInviteCancel(lineObj, response){
        var temp_cause = 0;
        var reason = response.headers["Reason"];
        if (reason !== undefined && reason.length > 0){
            for (var i = 0; i < reason.length; i++){
                var cause = reason[i].raw.toLowerCase().trim();
                var items = cause.split(';');
                if (items.length >= 2 && (items[0].trim() == "sip" || items[0].trim() == "q.850") && items[1].includes("cause") && cause.includes("call completed elsewhere")){
                    temp_cause = parseInt(items[1].substring(items[1].indexOf("=")+1).trim());
                    break;
                }
            }
        }

        lineObj.SipSession.data.terminateby = "them";
        lineObj.SipSession.data.reasonCode = temp_cause;
        if(temp_cause == 0){
            lineObj.SipSession.data.reasonText = "Call Cancelled";
            console.log("Call canceled by remote party before answer");
        } else {
            lineObj.SipSession.data.reasonText = "Call completed elsewhere";
            console.log("Call completed elsewhere before answer");
        }

        lineObj.SipSession.dispose().catch(function(error){
            console.log("Failed to dispose the cancel dialog", error);
        })

        teardownSession(lineObj);
}
function onInviteAccepted(lineObj, includeVideo, response){
    var session = lineObj.SipSession;
    RefreshLineDisplay(lineObj);

    if(session.data.earlyMedia){
        session.data.earlyMedia.pause();
        session.data.earlyMedia.removeAttribute('src');
        session.data.earlyMedia.load();
        session.data.earlyMedia = null;
    }

    window.clearInterval(session.data.callTimer);
    $("#line-" + lineObj.LineNumber + "-timer").show();
    var startTime = moment.utc();
    session.data.startTime = startTime;
    session.data.callTimer = window.setInterval(function(){
        var now = moment.utc();
        var duration = moment.duration(now.diff(startTime));
        var timeStr = formatShortDuration(duration.asSeconds());
        $("#line-" + lineObj.LineNumber + "-timer").html(timeStr);
        $("#line-" + lineObj.LineNumber + "-datetime").html(timeStr);
    }, 1000);
    session.isOnHold = false;
    session.data.started = true;
    EmitEmbedPhoneEvent("vphone-call", {
        phase: "connected",
        lineNumber: lineObj.LineNumber,
        buddyId: lineObj.BuddyObj ? lineObj.BuddyObj.identity : ""
    });

    if(includeVideo){
        var localVideoStream = new MediaStream();
        var pc = session.sessionDescriptionHandler.peerConnection;
        pc.getSenders().forEach(function (sender) {
            if(sender.track && sender.track.kind == "video"){
                localVideoStream.addTrack(sender.track);
            }
        });
        var localVideo = $("#line-" + lineObj.LineNumber + "-localVideo").get(0);
        localVideo.srcObject = localVideoStream;
        localVideo.onloadedmetadata = function(e) {
            localVideo.play();
        }
        if(MaxVideoBandwidth > -1){
            pc.getSenders().forEach(function (sender) {
                if(sender.track && sender.track.kind == "video"){

                    var parameters = sender.getParameters();
                    if(!parameters.encodings) parameters.encodings = [{}];
                    parameters.encodings[0].maxBitrate = MaxVideoBandwidth * 1000;

                    console.log("Applying limit for Bandwidth to: ", MaxVideoBandwidth + "kb per second")
                    sender.setParameters(parameters).catch(function(e){
                        console.warn("Cannot apply Bandwidth Limits", e);
                    });

                }
            });
        }

    }

    if(includeVideo){
        $("#line-"+ lineObj.LineNumber +"-progress").hide();
        $("#line-"+ lineObj.LineNumber +"-VideoCall").show();
        $("#line-"+ lineObj.LineNumber +"-ActiveCall").show();

        $("#line-"+ lineObj.LineNumber +"-btn-Conference").hide();
        $("#line-"+ lineObj.LineNumber +"-btn-CancelConference").hide();
        $("#line-"+ lineObj.LineNumber +"-Conference").hide();

        $("#line-"+ lineObj.LineNumber +"-btn-Transfer").hide();
        $("#line-"+ lineObj.LineNumber +"-btn-CancelTransfer").hide();
        $("#line-"+ lineObj.LineNumber +"-Transfer").hide();
        $("#line-"+ lineObj.LineNumber +"-src-camera").prop("disabled", true);
        $("#line-"+ lineObj.LineNumber +"-src-canvas").prop("disabled", false);
        $("#line-"+ lineObj.LineNumber +"-src-desktop").prop("disabled", false);
        $("#line-"+ lineObj.LineNumber +"-src-video").prop("disabled", false);
    }
    else {
        $("#line-" + lineObj.LineNumber + "-progress").hide();
        $("#line-" + lineObj.LineNumber + "-VideoCall").hide();
        $("#line-" + lineObj.LineNumber + "-AudioCall").show();
        $("#line-"+ lineObj.LineNumber +"-btn-Mute").show();
        $("#line-"+ lineObj.LineNumber +"-btn-Unmute").hide();
        $("#line-"+ lineObj.LineNumber +"-btn-Hold").show();
        $("#line-"+ lineObj.LineNumber +"-btn-Unhold").hide();
        $("#line-"+ lineObj.LineNumber +"-btn-Transfer").show();
        $("#line-"+ lineObj.LineNumber +"-btn-CancelTransfer").hide();
        $("#line-"+ lineObj.LineNumber +"-btn-Conference").show();
        $("#line-"+ lineObj.LineNumber +"-btn-CancelConference").hide();
        $("#line-"+ lineObj.LineNumber +"-btn-ShowNumpad").show();
        $("#line-"+ lineObj.LineNumber +"-btn-settings").show();
        $("#line-"+ lineObj.LineNumber +"-btn-present-src").hide();
        $("#line-"+ lineObj.LineNumber +"-btn-expand").hide();
        $("#line-"+ lineObj.LineNumber +"-btn-restore").hide();
        $("#line-"+ lineObj.LineNumber +"-btn-End").show();
        $("#line-" + lineObj.LineNumber + "-ActiveCall").show();
    }

    UpdateBuddyList()
    updateLineScroll(lineObj.LineNumber);

    if(lineObj.LocalSoundMeter) lineObj.LocalSoundMeter.stop();
    if(lineObj.RemoteSoundMeter) lineObj.RemoteSoundMeter.stop();
    lineObj.LocalSoundMeter = StartLocalAudioMediaMonitoring(lineObj.LineNumber, session);
    lineObj.RemoteSoundMeter = StartRemoteAudioMediaMonitoring(lineObj.LineNumber, session);

    $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_in_progress);

    if(includeVideo && StartVideoFullScreen) ExpandVideoArea(lineObj.LineNumber);
    if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("accepted", session);
}
function onInviteTrying(lineObj, response){
    $("#line-" + lineObj.LineNumber + "-msg").html(lang.trying);
    if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("trying", lineObj.SipSession);
}
function onInviteProgress(lineObj, response){
    console.log("Call Progress:", response.message.statusCode);
    if(response.message.statusCode == 180){
        $("#line-" + lineObj.LineNumber + "-msg").html(lang.ringing);

        var soundFile = audioBlobs.EarlyMedia;
        if(lineObj.SipSession.data.earlyMedia){
            console.log("Early Media already playing");
        }
        else {
            var earlyMedia = new Audio(soundFile.blob);
            earlyMedia.preload = "auto";
            earlyMedia.loop = true;
            earlyMedia.oncanplaythrough = function(e) {
                if (typeof earlyMedia.sinkId !== 'undefined' && getAudioOutputID() != "default") {
                    earlyMedia.setSinkId(getAudioOutputID()).then(function() {
                        console.log("Set sinkId to:", getAudioOutputID());
                    }).catch(function(e){
                        console.warn("Failed not apply setSinkId.", e);
                    });
                }
                PlayMediaElementSafely(earlyMedia, "early-media");
            }
            lineObj.SipSession.data.earlyMedia = earlyMedia;
        }
    }
    else if(response.message.statusCode === 183){
        $("#line-" + lineObj.LineNumber + "-msg").html(response.message.reasonPhrase + "...");
        $("#line-" + lineObj.LineNumber + "-early-dtmf").show();
        console.log("The 183 has an SDP, turn off the early media");
        var session = lineObj.SipSession;
        if(session.data.earlyMedia){
            session.data.earlyMedia.pause();
            session.data.earlyMedia.removeAttribute('src');
            session.data.earlyMedia.load();
            session.data.earlyMedia = null;
        }
    }
    else {

        $("#line-" + lineObj.LineNumber + "-msg").html(response.message.reasonPhrase + "...");
    }
    if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("progress", lineObj.SipSession);
}
function onInviteRejected(lineObj, response){
    console.log("INVITE Rejected:", response.message.reasonPhrase);

    lineObj.SipSession.data.terminateby = "them";
    lineObj.SipSession.data.reasonCode = response.message.statusCode;
    lineObj.SipSession.data.reasonText = response.message.reasonPhrase;

    teardownSession(lineObj);
}
function onInviteRedirected(response){
    console.log("onInviteRedirected", response);
}
function onSessionReceivedBye(lineObj, response){
    $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_ended);
    console.log("Call ended, bye!");

    lineObj.SipSession.data.terminateby = "them";
    lineObj.SipSession.data.reasonCode = 16;
    lineObj.SipSession.data.reasonText = "Normal Call clearing";

    try {
        response.accept();
    } catch(e){
        console.warn("Failed to accept BYE:", e);
    }

    teardownSession(lineObj);
}
function onSessionReinvited(lineObj, response){
    var sdp = (response && response.body) ? response.body : "";
    lineObj.SipSession.data.videoChannelNames = [];
    var videoSections = sdp.split("m=video");
    if(videoSections.length >= 1){
        for(var m=0; m<videoSections.length; m++){
            if(videoSections[m].indexOf("a=mid:") > -1 && videoSections[m].indexOf("a=label:") > -1){
                var lines = videoSections[m].split("\r\n");
                var channel = "";
                var mid = "";
                for(var i=0; i<lines.length; i++){
                    if(lines[i].indexOf("a=label:") == 0) {
                        channel = lines[i].replace("a=label:", "");
                    }
                    if(lines[i].indexOf("a=mid:") == 0){
                        mid = lines[i].replace("a=mid:", "");
                    }
                }
                lineObj.SipSession.data.videoChannelNames.push({"mid" : mid, "channel" : channel });
            }
        }
        console.log("videoChannelNames:", lineObj.SipSession.data.videoChannelNames);
        RedrawStage(lineObj.LineNumber, false);
    }
    if(response && typeof response.accept === "function"){
        try {
            response.accept().catch(function(error){
                console.warn("Failed to accept in-dialog re-INVITE:", error);
            });
        } catch(e){
            console.warn("Error while accepting in-dialog re-INVITE:", e);
        }
    }
}
function onSessionReceivedMessage(lineObj, response){
    var messageType = (response.request.headers["Content-Type"].length >=1)? response.request.headers["Content-Type"][0].parsed : "Unknown" ;
    if(messageType.indexOf("application/x-asterisk-confbridge-event") > -1){
        var msgJson = JSON.parse(response.request.body);

        var session = lineObj.SipSession;
        if(!session.data.ConfbridgeChannels) session.data.ConfbridgeChannels = [];
        if(!session.data.ConfbridgeEvents) session.data.ConfbridgeEvents = [];

        if(msgJson.type == "ConfbridgeStart"){
            console.log("ConfbridgeStart!");
        }
        else if(msgJson.type == "ConfbridgeWelcome"){
            console.log("Welcome to the Asterisk Conference");
            console.log("Bridge ID:", msgJson.bridge.id);
            console.log("Bridge Name:", msgJson.bridge.name);
            console.log("Created at:", msgJson.bridge.creationtime);
            console.log("Video Mode:", msgJson.bridge.video_mode);

            session.data.ConfbridgeChannels = msgJson.channels;
            session.data.ConfbridgeChannels.forEach(function(chan) {
                console.log(chan.caller.name, "Is in the conference. Muted:", chan.muted, "Admin:", chan.admin);
            });
        }
        else if(msgJson.type == "ConfbridgeJoin"){
            msgJson.channels.forEach(function(chan) {
                var found = false;
                session.data.ConfbridgeChannels.forEach(function(existingChan) {
                    if(existingChan.id == chan.id) found = true;
                });
                if(!found){
                    session.data.ConfbridgeChannels.push(chan);
                    session.data.ConfbridgeEvents.push({ event: chan.caller.name + " ("+ chan.caller.number +") joined the conference", eventTime: utcDateNow() });
                    console.log(chan.caller.name, "Joined the conference. Muted: ", chan.muted);
                }
            });
        }
        else if(msgJson.type == "ConfbridgeLeave"){
            msgJson.channels.forEach(function(chan) {
                session.data.ConfbridgeChannels.forEach(function(existingChan, i) {
                    if(existingChan.id == chan.id){
                        session.data.ConfbridgeChannels.splice(i, 1);
                        console.log(chan.caller.name, "Left the conference");
                        session.data.ConfbridgeEvents.push({ event: chan.caller.name + " ("+ chan.caller.number +") left the conference", eventTime: utcDateNow() });
                    }
                });
            });
        }
        else if(msgJson.type == "ConfbridgeTalking"){
            var videoContainer = $("#line-" + lineObj.LineNumber + "-remote-videos");
            if(videoContainer){
                msgJson.channels.forEach(function(chan) {
                    videoContainer.find('video').each(function() {
                        if(this.srcObject.channel && this.srcObject.channel == chan.id) {
                            if(chan.talking_status == "on"){
                                console.log(chan.caller.name, "is talking.");
                                this.srcObject.isTalking = true;
                                $(this).css("border","1px solid red");
                            }
                            else {
                                console.log(chan.caller.name, "stopped talking.");
                                this.srcObject.isTalking = false;
                                $(this).css("border","1px solid transparent");
                            }
                        }
                    });
                });
            }
        }
        else if(msgJson.type == "ConfbridgeMute"){
            msgJson.channels.forEach(function(chan) {
                session.data.ConfbridgeChannels.forEach(function(existingChan) {
                    if(existingChan.id == chan.id){
                        console.log(existingChan.caller.name, "is now muted");
                        existingChan.muted = true;
                    }
                });
            });
            RedrawStage(lineObj.LineNumber, false);
        }
        else if(msgJson.type == "ConfbridgeUnmute"){
            msgJson.channels.forEach(function(chan) {
                session.data.ConfbridgeChannels.forEach(function(existingChan) {
                    if(existingChan.id == chan.id){
                        console.log(existingChan.caller.name, "is now unmuted");
                        existingChan.muted = false;
                    }
                });
            });
            RedrawStage(lineObj.LineNumber, false);
        }
        else if(msgJson.type == "ConfbridgeEnd"){
            console.log("The Asterisk Conference has ended, bye!");
        }
        else {
            console.warn("Unknown Asterisk Conference Event:", msgJson.type, msgJson);
        }
        RefreshLineActivity(lineObj.LineNumber);
        response.accept();
    }
    else {
        console.warn("Unknown message type")
        response.reject();
    }
}

function onSessionDescriptionHandlerCreated(lineObj, sdh, provisional, includeVideo){
    if (sdh) {
        if(sdh.peerConnection){
            sdh.peerConnection.ontrack = function(event){
                onTrackAddedEvent(lineObj, includeVideo);
            }
        }
        else{
            console.warn("onSessionDescriptionHandler fired without a peerConnection");
        }
    }
    else{
        console.warn("onSessionDescriptionHandler fired without a sessionDescriptionHandler");
    }
}
function onTrackAddedEvent(lineObj, includeVideo){
    var session = lineObj.SipSession;

    var pc = session.sessionDescriptionHandler.peerConnection;

    var remoteAudioStream = new MediaStream();
    var remoteVideoStream = new MediaStream();

    pc.getTransceivers().forEach(function (transceiver) {
        var receiver = transceiver.receiver;
        if(receiver.track){
            if(receiver.track.kind == "audio"){
                console.log("Adding Remote Audio Track");
                remoteAudioStream.addTrack(receiver.track);
            }
            if(includeVideo && receiver.track.kind == "video"){
                if(transceiver.mid){
                    receiver.track.mid = transceiver.mid;
                    console.log("Adding Remote Video Track - ", receiver.track.readyState , "MID:", receiver.track.mid);
                    remoteVideoStream.addTrack(receiver.track);
                }
            }
        }
    });
    if(remoteAudioStream.getAudioTracks().length >= 1){
        var remoteAudio = $("#line-" + lineObj.LineNumber + "-remoteAudio").get(0);
        remoteAudio.srcObject = remoteAudioStream;
        remoteAudio.onloadedmetadata = function(e) {
            if (typeof remoteAudio.sinkId !== 'undefined') {
                remoteAudio.setSinkId(getAudioOutputID()).then(function(){
                    console.log("sinkId applied: "+ getAudioOutputID());
                }).catch(function(e){
                    console.warn("Error using setSinkId: ", e);
                });
            }
            remoteAudio.play();
        }
    }

    if(includeVideo){
        $("#line-" + lineObj.LineNumber + "-remote-videos").empty();
        if(remoteVideoStream.getVideoTracks().length >= 1){
            var remoteVideoStreamTracks = remoteVideoStream.getVideoTracks();
            remoteVideoStreamTracks.forEach(function(remoteVideoStreamTrack) {
                var thisRemoteVideoStream = new MediaStream();
                thisRemoteVideoStream.trackID = remoteVideoStreamTrack.id;
                thisRemoteVideoStream.mid = remoteVideoStreamTrack.mid;
                remoteVideoStreamTrack.onended = function() {
                    console.log("Video Track Ended: ", this.mid);
                    RedrawStage(lineObj.LineNumber, true);
                }
                thisRemoteVideoStream.addTrack(remoteVideoStreamTrack);

                var wrapper = $("<span />", {
                    class: "VideoWrapper",
                });
                wrapper.css("width", "1px");
                wrapper.css("heigh", "1px");
                wrapper.hide();

                var callerID = $("<div />", {
                    class: "callerID"
                });
                wrapper.append(callerID);

                var Actions = $("<div />", {
                    class: "Actions"
                });
                wrapper.append(Actions);

                var videoEl = $("<video />", {
                    id: remoteVideoStreamTrack.id,
                    mid: remoteVideoStreamTrack.mid,
                    muted: true,
                    autoplay: true,
                    playsinline: true,
                    controls: false
                });
                videoEl.hide();

                var videoObj = videoEl.get(0);
                videoObj.srcObject = thisRemoteVideoStream;
                videoObj.onloadedmetadata = function(e) {
                    videoEl.show();
                    videoEl.parent().show();
                    console.log("Playing Video Stream MID:", thisRemoteVideoStream.mid);
                    RedrawStage(lineObj.LineNumber, true);
                }
                wrapper.append(videoEl);

                $("#line-" + lineObj.LineNumber + "-remote-videos").append(wrapper);

                console.log("Added Video Element MID:", thisRemoteVideoStream.mid);
            });
        }
        else {
            console.log("No Video Streams");
            RedrawStage(lineObj.LineNumber, true);
        }
    }
    if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("trackAdded", session);
}
function teardownSession(lineObj) {
    if(lineObj == null || lineObj.SipSession == null) return;

    var session = lineObj.SipSession;
    if(session.data.teardownComplete == true) return;
    session.data.teardownComplete = true;
    session.data.holdInProgress = false;
    if(session.data.earlyReject != true){
        CloseWindow(true);
        HidePopup();
        $("#line-ui-" + lineObj.LineNumber + " button").prop("disabled", true);
        $("#line-" + lineObj.LineNumber + "-Transfer").hide();
        $("#line-" + lineObj.LineNumber + "-Conference").hide();
    }
    if(session.data.childsession){
        session.data.childsession.dispose().then(function(){
            session.data.childsession = null;
        }).catch(function(error){
            session.data.childsession = null;
        });
    }
    if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
        session.data.AudioSourceTrack.stop();
        session.data.AudioSourceTrack = null;
    }
    if(session.data.earlyMedia){
        session.data.earlyMedia.pause();
        session.data.earlyMedia.removeAttribute('src');
        session.data.earlyMedia.load();
        session.data.earlyMedia = null;
    }
    if(session.data.ringerObj){
        session.data.ringerObj.pause();
        session.data.ringerObj.removeAttribute('src');
        session.data.ringerObj.load();
        session.data.ringerObj = null;
    }
    StopRecording(lineObj.LineNumber,true);
    if(lineObj.LocalSoundMeter != null){
        lineObj.LocalSoundMeter.stop();
        lineObj.LocalSoundMeter = null;
    }
    if(lineObj.RemoteSoundMeter != null){
        lineObj.RemoteSoundMeter.stop();
        lineObj.RemoteSoundMeter = null;
    }
    if(session && session.sessionDescriptionHandler && session.sessionDescriptionHandler.peerConnection){
        var pc = session.sessionDescriptionHandler.peerConnection;
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                RTCRtpSender.track.stop();
            }
        });
    }
    window.clearInterval(session.data.videoResampleInterval);
    window.clearInterval(session.data.callTimer);
    AddCallMessage(lineObj.BuddyObj.identity, session);
    if(GetActiveMainTab() == "recents"){
        ShowRecentsTab();
    }
    EmitEmbedPhoneEvent("vphone-call", {
        phase: "ended",
        lineNumber: lineObj.LineNumber,
        buddyId: lineObj.BuddyObj ? lineObj.BuddyObj.identity : "",
        reasonCode: session.data.reasonCode || 0,
        reasonText: session.data.reasonText || ""
    });
    if (session.data.calldirection == "inbound"){
        if(session.data.earlyReject){
            IncreaseMissedBadge(session.data.buddyId);
        } else if (session.data.terminateby == "them" && session.data.startTime == null){
            if(session.data.reasonCode == 0){
                IncreaseMissedBadge(session.data.buddyId);
            }
        }
    }
    window.setTimeout(function () {
        RemoveLine(lineObj);
        if(window.ReturnToDialpadAfterCall === true && Lines.length === 0){
            var returnTab = lineObj.ReturnToTab || window.ReturnAfterCallTab || "dialpad";
            if(returnTab != "contacts" && returnTab != "recents" && returnTab != "dialpad") returnTab = "dialpad";
            selectedLine = null;
            selectedBuddy = null;
            $(".buddySelected").prop("class", "buddy");
            $(".streamSelected").prop("class", "stream");
            ShowTab(returnTab);
            localDB.setItem("ActiveTab", returnTab);
            UpdateUI();
            window.ReturnToDialpadAfterCall = false;
            window.ReturnAfterCallTab = null;
        }
    }, 1000);

    UpdateBuddyList();
    if(session.data.earlyReject != true){
        UpdateUI();
    }
    if(typeof web_hook_on_terminate !== 'undefined') web_hook_on_terminate(session);
}
function StartRemoteAudioMediaMonitoring(lineNum, session) {
    console.log("Creating RemoteAudio AudioContext on Line:" + lineNum);
    var soundMeter = new SoundMeter(session.id, lineNum);
    if(soundMeter == null){
        console.warn("AudioContext() RemoteAudio not available... it fine.");
        return null;
    }
    var remoteAudioStream = new MediaStream();
    var audioReceiver = null;
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getReceivers().forEach(function (RTCRtpReceiver) {
        if(RTCRtpReceiver.track && RTCRtpReceiver.track.kind == "audio"){
            if(audioReceiver == null) {
                remoteAudioStream.addTrack(RTCRtpReceiver.track);
                audioReceiver = RTCRtpReceiver;
            }
            else {
                console.log("Found another Track, but audioReceiver not null");
                console.log(RTCRtpReceiver);
                console.log(RTCRtpReceiver.track);
            }
        }
    });
    var maxDataLength = 100;
    soundMeter.startTime = Date.now();
    Chart.defaults.global.defaultFontSize = 12;

    var ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            yAxes: [{
                ticks: { beginAtZero: true }
            }],
            xAxes: [{
                display: false
            }]
        },
    }
    soundMeter.ReceiveBitRateChart = new Chart($("#line-"+ lineNum +"-AudioReceiveBitRate"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.receive_kilobits_per_second,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(168, 0, 0, 0.5)',
                borderColor: 'rgba(168, 0, 0, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChartOptions
    });
    soundMeter.ReceiveBitRateChart.lastValueBytesReceived = 0;
    soundMeter.ReceiveBitRateChart.lastValueTimestamp = 0;
    soundMeter.ReceivePacketRateChart = new Chart($("#line-"+ lineNum +"-AudioReceivePacketRate"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.receive_packets_per_second,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(168, 0, 0, 0.5)',
                borderColor: 'rgba(168, 0, 0, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChartOptions
    });
    soundMeter.ReceivePacketRateChart.lastValuePacketReceived = 0;
    soundMeter.ReceivePacketRateChart.lastValueTimestamp = 0;
    soundMeter.ReceivePacketLossChart = new Chart($("#line-"+ lineNum +"-AudioReceivePacketLoss"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.receive_packet_loss,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(168, 99, 0, 0.5)',
                borderColor: 'rgba(168, 99, 0, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChartOptions
    });
    soundMeter.ReceivePacketLossChart.lastValuePacketLoss = 0;
    soundMeter.ReceivePacketLossChart.lastValueTimestamp = 0;
    soundMeter.ReceiveJitterChart = new Chart($("#line-"+ lineNum +"-AudioReceiveJitter"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.receive_jitter,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(0, 38, 168, 0.5)',
                borderColor: 'rgba(0, 38, 168, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChartOptions
    });
    soundMeter.ReceiveLevelsChart = new Chart($("#line-"+ lineNum +"-AudioReceiveLevels"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.receive_audio_levels,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(140, 0, 168, 0.5)',
                borderColor: 'rgba(140, 0, 168, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChartOptions
    });
    soundMeter.connectToSource(remoteAudioStream, function (e) {
        if (e != null) return;
        console.log("SoundMeter for RemoteAudio Connected, displaying levels for Line: " + lineNum);
        soundMeter.levelsInterval = window.setInterval(function () {
            var instPercent = (soundMeter.instant/255) * 100;
            $("#line-" + lineNum + "-Speaker").css("height", instPercent.toFixed(2) +"%");
        }, 50);
        soundMeter.networkInterval = window.setInterval(function (){
            if(audioReceiver != null) {
                audioReceiver.getStats().then(function(stats) {
                    stats.forEach(function(report){

                        var theMoment = utcDateNow();
                        var ReceiveBitRateChart = soundMeter.ReceiveBitRateChart;
                        var ReceivePacketRateChart = soundMeter.ReceivePacketRateChart;
                        var ReceivePacketLossChart = soundMeter.ReceivePacketLossChart;
                        var ReceiveJitterChart = soundMeter.ReceiveJitterChart;
                        var ReceiveLevelsChart = soundMeter.ReceiveLevelsChart;
                        var elapsedSec = Math.floor((Date.now() - soundMeter.startTime)/1000);

                        if(report.type == "inbound-rtp"){

                            if(ReceiveBitRateChart.lastValueTimestamp == 0) {
                                ReceiveBitRateChart.lastValueTimestamp = report.timestamp;
                                ReceiveBitRateChart.lastValueBytesReceived = report.bytesReceived;

                                ReceivePacketRateChart.lastValueTimestamp = report.timestamp;
                                ReceivePacketRateChart.lastValuePacketReceived = report.packetsReceived;

                                ReceivePacketLossChart.lastValueTimestamp = report.timestamp;
                                ReceivePacketLossChart.lastValuePacketLoss = report.packetsLost;

                                return;
                            }
                            var kbitsPerSec = (8 * (report.bytesReceived - ReceiveBitRateChart.lastValueBytesReceived))/1000;

                            ReceiveBitRateChart.lastValueTimestamp = report.timestamp;
                            ReceiveBitRateChart.lastValueBytesReceived = report.bytesReceived;

                            soundMeter.ReceiveBitRate.push({ value: kbitsPerSec, timestamp : theMoment});
                            ReceiveBitRateChart.data.datasets[0].data.push(kbitsPerSec);
                            ReceiveBitRateChart.data.labels.push("");
                            if(ReceiveBitRateChart.data.datasets[0].data.length > maxDataLength) {
                                ReceiveBitRateChart.data.datasets[0].data.splice(0,1);
                                ReceiveBitRateChart.data.labels.splice(0,1);
                            }
                            ReceiveBitRateChart.update();
                            var PacketsPerSec = (report.packetsReceived - ReceivePacketRateChart.lastValuePacketReceived);

                            ReceivePacketRateChart.lastValueTimestamp = report.timestamp;
                            ReceivePacketRateChart.lastValuePacketReceived = report.packetsReceived;

                            soundMeter.ReceivePacketRate.push({ value: PacketsPerSec, timestamp : theMoment});
                            ReceivePacketRateChart.data.datasets[0].data.push(PacketsPerSec);
                            ReceivePacketRateChart.data.labels.push("");
                            if(ReceivePacketRateChart.data.datasets[0].data.length > maxDataLength) {
                                ReceivePacketRateChart.data.datasets[0].data.splice(0,1);
                                ReceivePacketRateChart.data.labels.splice(0,1);
                            }
                            ReceivePacketRateChart.update();
                            var PacketsLost = (report.packetsLost - ReceivePacketLossChart.lastValuePacketLoss);

                            ReceivePacketLossChart.lastValueTimestamp = report.timestamp;
                            ReceivePacketLossChart.lastValuePacketLoss = report.packetsLost;

                            soundMeter.ReceivePacketLoss.push({ value: PacketsLost, timestamp : theMoment});
                            ReceivePacketLossChart.data.datasets[0].data.push(PacketsLost);
                            ReceivePacketLossChart.data.labels.push("");
                            if(ReceivePacketLossChart.data.datasets[0].data.length > maxDataLength) {
                                ReceivePacketLossChart.data.datasets[0].data.splice(0,1);
                                ReceivePacketLossChart.data.labels.splice(0,1);
                            }
                            ReceivePacketLossChart.update();
                            soundMeter.ReceiveJitter.push({ value: report.jitter, timestamp : theMoment});
                            ReceiveJitterChart.data.datasets[0].data.push(report.jitter);
                            ReceiveJitterChart.data.labels.push("");
                            if(ReceiveJitterChart.data.datasets[0].data.length > maxDataLength) {
                                ReceiveJitterChart.data.datasets[0].data.splice(0,1);
                                ReceiveJitterChart.data.labels.splice(0,1);
                            }
                            ReceiveJitterChart.update();
                        }
                        if(report.type == "track") {
                            var levelPercent = (report.audioLevel * 100);
                            soundMeter.ReceiveLevels.push({ value: levelPercent, timestamp : theMoment});
                            ReceiveLevelsChart.data.datasets[0].data.push(levelPercent);
                            ReceiveLevelsChart.data.labels.push("");
                            if(ReceiveLevelsChart.data.datasets[0].data.length > maxDataLength)
                            {
                                ReceiveLevelsChart.data.datasets[0].data.splice(0,1);
                                ReceiveLevelsChart.data.labels.splice(0,1);
                            }
                            ReceiveLevelsChart.update();
                        }
                    });
                });
            }
        } ,1000);
    });

    return soundMeter;
}
function StartLocalAudioMediaMonitoring(lineNum, session) {
    console.log("Creating LocalAudio AudioContext on line " + lineNum);
    var soundMeter = new SoundMeter(session.id, lineNum);
    if(soundMeter == null){
        console.warn("AudioContext() LocalAudio not available... its fine.")
        return null;
    }
    var localAudioStream = new MediaStream();
    var audioSender = null;
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio"){
            if(audioSender == null){
                console.log("Adding Track to Monitor: ", RTCRtpSender.track.label);
                localAudioStream.addTrack(RTCRtpSender.track);
                audioSender = RTCRtpSender;
            }
            else {
                console.log("Found another Track, but audioSender not null");
                console.log(RTCRtpSender);
                console.log(RTCRtpSender.track);
            }
        }
    });
    var maxDataLength = 100;
    soundMeter.startTime = Date.now();
    Chart.defaults.global.defaultFontSize = 12;
    var ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            yAxes: [{
                ticks: { beginAtZero: true }
            }],
            xAxes: [{
                display: false
            }]
        },
    }
    soundMeter.SendBitRateChart = new Chart($("#line-"+ lineNum +"-AudioSendBitRate"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.send_kilobits_per_second,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(0, 121, 19, 0.5)',
                borderColor: 'rgba(0, 121, 19, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChartOptions
    });
    soundMeter.SendBitRateChart.lastValueBytesSent = 0;
    soundMeter.SendBitRateChart.lastValueTimestamp = 0;
    soundMeter.SendPacketRateChart = new Chart($("#line-"+ lineNum +"-AudioSendPacketRate"), {
        type: 'line',
        data: {
            labels: MakeDataArray("", maxDataLength),
            datasets: [{
                label: lang.send_packets_per_second,
                data: MakeDataArray(0, maxDataLength),
                backgroundColor: 'rgba(0, 121, 19, 0.5)',
                borderColor: 'rgba(0, 121, 19, 1)',
                borderWidth: 1,
                pointRadius: 1
            }]
        },
        options: ChartOptions
    });
    soundMeter.SendPacketRateChart.lastValuePacketSent = 0;
    soundMeter.SendPacketRateChart.lastValueTimestamp = 0;
    soundMeter.connectToSource(localAudioStream, function (e) {
        if (e != null) return;

        console.log("SoundMeter for LocalAudio Connected, displaying levels for Line: " + lineNum);
        soundMeter.levelsInterval = window.setInterval(function () {
            var instPercent = (soundMeter.instant/255) * 100;
            $("#line-" + lineNum + "-Mic").css("height", instPercent.toFixed(2) +"%");
        }, 50);
        soundMeter.networkInterval = window.setInterval(function (){
            if(audioSender != null) {
                audioSender.getStats().then(function(stats) {
                    stats.forEach(function(report){

                        var theMoment = utcDateNow();
                        var SendBitRateChart = soundMeter.SendBitRateChart;
                        var SendPacketRateChart = soundMeter.SendPacketRateChart;
                        var elapsedSec = Math.floor((Date.now() - soundMeter.startTime)/1000);

                        if(report.type == "outbound-rtp"){
                            if(SendBitRateChart.lastValueTimestamp == 0) {
                                SendBitRateChart.lastValueTimestamp = report.timestamp;
                                SendBitRateChart.lastValueBytesSent = report.bytesSent;

                                SendPacketRateChart.lastValueTimestamp = report.timestamp;
                                SendPacketRateChart.lastValuePacketSent = report.packetsSent;
                                return;
                            }
                            var kbitsPerSec = (8 * (report.bytesSent - SendBitRateChart.lastValueBytesSent))/1000;

                            SendBitRateChart.lastValueTimestamp = report.timestamp;
                            SendBitRateChart.lastValueBytesSent = report.bytesSent;

                            soundMeter.SendBitRate.push({ value: kbitsPerSec, timestamp : theMoment});
                            SendBitRateChart.data.datasets[0].data.push(kbitsPerSec);
                            SendBitRateChart.data.labels.push("");
                            if(SendBitRateChart.data.datasets[0].data.length > maxDataLength) {
                                SendBitRateChart.data.datasets[0].data.splice(0,1);
                                SendBitRateChart.data.labels.splice(0,1);
                            }
                            SendBitRateChart.update();
                            var PacketsPerSec = report.packetsSent - SendPacketRateChart.lastValuePacketSent;

                            SendPacketRateChart.lastValueTimestamp = report.timestamp;
                            SendPacketRateChart.lastValuePacketSent = report.packetsSent;

                            soundMeter.SendPacketRate.push({ value: PacketsPerSec, timestamp : theMoment});
                            SendPacketRateChart.data.datasets[0].data.push(PacketsPerSec);
                            SendPacketRateChart.data.labels.push("");
                            if(SendPacketRateChart.data.datasets[0].data.length > maxDataLength) {
                                SendPacketRateChart.data.datasets[0].data.splice(0,1);
                                SendPacketRateChart.data.labels.splice(0,1);
                            }
                            SendPacketRateChart.update();
                        }
                        if(report.type == "track") {
                        }
                    });
                });
            }
        } ,1000);
    });

    return soundMeter;
}
class SoundMeter {
    constructor(sessionId, lineNum) {
        var audioContext = null;
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
        }
        catch(e) {
            console.warn("AudioContext() LocalAudio not available... its fine.");
        }
        if (audioContext == null) return null;
        this.context = audioContext;
        this.source = null;

        this.lineNum = lineNum;
        this.sessionId = sessionId;

        this.captureInterval = null;
        this.levelsInterval = null;
        this.networkInterval = null;
        this.startTime = 0;

        this.ReceiveBitRateChart = null;
        this.ReceiveBitRate = [];
        this.ReceivePacketRateChart = null;
        this.ReceivePacketRate = [];
        this.ReceivePacketLossChart = null;
        this.ReceivePacketLoss = [];
        this.ReceiveJitterChart = null;
        this.ReceiveJitter = [];
        this.ReceiveLevelsChart = null;
        this.ReceiveLevels = [];
        this.SendBitRateChart = null;
        this.SendBitRate = [];
        this.SendPacketRateChart = null;
        this.SendPacketRate = [];

        this.instant = 0;

        this.AnalyserNode = this.context.createAnalyser();
        this.AnalyserNode.minDecibels = -90;
        this.AnalyserNode.maxDecibels = -10;
        this.AnalyserNode.smoothingTimeConstant = 0.85;
    }
    connectToSource(stream, callback) {
        console.log("SoundMeter connecting...");
        try {
            this.source = this.context.createMediaStreamSource(stream);
            this.source.connect(this.AnalyserNode);
            this._start();

            callback(null);
        }
        catch(e) {
            console.error(e);
            callback(e);
        }
    }
    _start(){
        var self = this;
        self.instant = 0;
        self.AnalyserNode.fftSize = 32;
        self.dataArray = new Uint8Array(self.AnalyserNode.frequencyBinCount);

        this.captureInterval = window.setInterval(function(){
            self.AnalyserNode.getByteFrequencyData(self.dataArray);
            self.instant = 0;
            for(var d = 0; d < self.dataArray.length; d++) {
                if(self.dataArray[d] > self.instant) self.instant = self.dataArray[d];
            }

        }, 1);
    }
    stop() {
        console.log("Disconnecting SoundMeter...");
        window.clearInterval(this.captureInterval);
        this.captureInterval = null;
        window.clearInterval(this.levelsInterval);
        this.levelsInterval = null;
        window.clearInterval(this.networkInterval);
        this.networkInterval = null;
        try {
            this.source.disconnect();
        }
        catch(e) { }
        this.source = null;
        try {
            this.AnalyserNode.disconnect();
        }
        catch(e) { }
        this.AnalyserNode = null;
        try {
            this.context.close();
        }
        catch(e) { }
        this.context = null;
        var lineObj = FindLineByNumber(this.lineNum);
        var QosData = {
            ReceiveBitRate: this.ReceiveBitRate,
            ReceivePacketRate: this.ReceivePacketRate,
            ReceivePacketLoss: this.ReceivePacketLoss,
            ReceiveJitter: this.ReceiveJitter,
            ReceiveLevels: this.ReceiveLevels,
            SendBitRate: this.SendBitRate,
            SendPacketRate: this.SendPacketRate,
        }
        if(this.sessionId != null){
            SaveQosData(QosData, this.sessionId, lineObj.BuddyObj.identity);
        }
    }
}
function MeterSettingsOutput(audioStream, objectId, direction, interval){
    var soundMeter = new SoundMeter(null, null);
    soundMeter.startTime = Date.now();
    soundMeter.connectToSource(audioStream, function (e) {
        if (e != null) return;

        console.log("SoundMeter Connected, displaying levels to:"+ objectId);
        soundMeter.levelsInterval = window.setInterval(function () {
            var instPercent = (soundMeter.instant/255) * 100;
            $("#"+ objectId).css(direction, instPercent.toFixed(2) +"%");
        }, interval);
    });

    return soundMeter;
}
function SaveQosData(QosData, sessionId, buddy){
    if(CallQosDataIndexDb != null){
        var data = {
            uID: uID(),
            sessionid: sessionId,
            buddy: buddy,
            QosData: QosData
        }
        var transaction = CallQosDataIndexDb.transaction(["CallQos"], "readwrite");
        var objectStoreAdd = transaction.objectStore("CallQos").add(data);
        objectStoreAdd.onsuccess = function(event) {
            console.log("Call CallQos Success: ", sessionId);
        }
    }
    else {
        console.warn("CallQosDataIndexDb is null.");
    }
}
function DeleteQosData(buddy, stream){

    if(CallQosDataIndexDb != null){
        $.each(stream.DataCollection, function (i, item) {
            if (item.ItemType == "CDR" && item.SessionId && item.SessionId != "") {
                console.log("Deleting CallQosData: ", item.SessionId);
                var objectStore = CallQosDataIndexDb.transaction(["CallQos"], "readwrite").objectStore("CallQos");
                var objectStoreGet = objectStore.index('sessionid').getAll(item.SessionId);
                objectStoreGet.onerror = function(event) {
                    console.error("IndexDB Get Error:", event);
                }
                objectStoreGet.onsuccess = function(event) {
                    if(event.target.result && event.target.result.length > 0){
                        $.each(event.target.result, function(i, item){
                            try{
                                objectStore.delete(item.uID);
                            } catch(e){
                                console.log("Call CallQosData Delete failed: ", e);
                            }
                        });
                    }
                }
            }
        });
    }
    else {
        console.warn("CallQosDataIndexDb is null.");
    }
}
function SubscribeAll() {
    if(!userAgent.isRegistered()) return;

    if(VoiceMailSubscribe){
        SubscribeVoicemail();
    }
    if(SubscribeToYourself){
        SelfSubscribe();
    }
    if(userAgent.BlfSubs && userAgent.BlfSubs.length > 0){
        UnsubscribeAll();
    }
    userAgent.BlfSubs = [];
    if(Buddies.length >= 1){
        console.log("Starting Subscribe of all ("+ Buddies.length +") Extension Buddies...");
        for(var b=0; b<Buddies.length; b++) {
            SubscribeBuddy(Buddies[b]);
        }
    }
}
function SelfSubscribe(){
    if(!userAgent.isRegistered()) return;

    if(userAgent.selfSub){
        console.log("Unsubscribe from old self subscribe...");
        SelfUnsubscribe();
    }

    var targetURI = SIP.UserAgent.makeURI("sip:" + SipUsername + "@" + SipDomain);

    var options = {
        expires: SubscribeBuddyExpires,
        extraHeaders: ['Accept: '+ SubscribeBuddyAccept]
    }

    userAgent.selfSub = new SIP.Subscriber(userAgent, targetURI, SubscribeBuddyEvent, options);
    userAgent.selfSub.delegate = {
        onNotify: function(sip) {
            ReceiveNotify(sip, true);
        }
    }
    console.log("SUBSCRIBE Self: "+ SipUsername +"@" + SipDomain);
    userAgent.selfSub.subscribe().catch(function(error){
        console.warn("Error subscribing to yourself:", error);
    });
}

function SubscribeVoicemail(){
    if(!userAgent.isRegistered()) return;

    if(userAgent.voicemailSub){
        console.log("Unsubscribe from old voicemail Messages...");
        UnsubscribeVoicemail();
    }

    var vmOptions = { expires : SubscribeVoicemailExpires }
    var targetURI = SIP.UserAgent.makeURI("sip:" + SipUsername + "@" + SipDomain);
    userAgent.voicemailSub = new SIP.Subscriber(userAgent, targetURI, "message-summary", vmOptions);
    userAgent.voicemailSub.delegate = {
        onNotify: function(sip) {
            VoicemailNotify(sip);
        }
    }
    console.log("SUBSCRIBE VOICEMAIL: "+ SipUsername +"@" + SipDomain);
    userAgent.voicemailSub.subscribe().catch(function(error){
        console.warn("Error subscribing to voicemail notifications:", error);
    });
}


function SubscribeBuddy(buddyObj) {
    if(!userAgent.isRegistered()) return;

    if((buddyObj.type == "extension" || buddyObj.type == "xmpp") && buddyObj.EnableSubscribe == true && buddyObj.SubscribeUser != "") {

        var targetURI = SIP.UserAgent.makeURI("sip:" + buddyObj.SubscribeUser + "@" + SipDomain);

        var options = {
            expires: SubscribeBuddyExpires,
            extraHeaders: ['Accept: '+ SubscribeBuddyAccept]
        }
        var blfSubscribe = new SIP.Subscriber(userAgent, targetURI, SubscribeBuddyEvent, options);
        blfSubscribe.data = {}
        blfSubscribe.data.buddyId = buddyObj.identity;
        blfSubscribe.delegate = {
            onNotify: function(sip) {
                ReceiveNotify(sip, false);
            }
        }
        console.log("SUBSCRIBE: "+ buddyObj.SubscribeUser +"@" + SipDomain);
        blfSubscribe.subscribe().catch(function(error){
            console.warn("Error subscribing to Buddy notifications:", error);
        });

        if(!userAgent.BlfSubs) userAgent.BlfSubs = [];
        userAgent.BlfSubs.push(blfSubscribe);
    }
}

function UnsubscribeAll() {
    if(!userAgent.isRegistered()) return;

    console.log("Unsubscribe from voicemail Messages...");
    UnsubscribeVoicemail();

    if(userAgent.BlfSubs && userAgent.BlfSubs.length > 0){
        console.log("Unsubscribing "+ userAgent.BlfSubs.length + " subscriptions...");
        for (var blf = 0; blf < userAgent.BlfSubs.length; blf++) {
            UnsubscribeBlf(userAgent.BlfSubs[blf]);
        }
        userAgent.BlfSubs = [];

        for(var b=0; b<Buddies.length; b++) {
            var buddyObj = Buddies[b];
            if(buddyObj.type == "extension" || buddyObj.type == "xmpp") {
                $("#contact-" + buddyObj.identity + "-devstate").prop("class", "dotOffline");
                $("#contact-" + buddyObj.identity + "-devstate-main").prop("class", "dotOffline");
                $("#contact-" + buddyObj.identity + "-presence").html(lang.state_unknown);
                $("#contact-" + buddyObj.identity + "-presence-main").html(lang.state_unknown);
            }
        }
    }
}
function UnsubscribeBlf(blfSubscribe){
    if(!userAgent.isRegistered()) return;

    if(blfSubscribe.state == SIP.SubscriptionState.Subscribed){
        console.log("Unsubscribe to BLF Messages...", blfSubscribe.data.buddyId);
        blfSubscribe.unsubscribe().catch(function(error){
            console.warn("Error removing BLF notifications:", error);
        });
    }
    else {
        console.log("Incorrect buddy subscribe state", blfSubscribe.data.buddyId, blfSubscribe.state);
    }
    blfSubscribe.dispose().catch(function(error){
        console.warn("Error disposing BLF notifications:", error);
    });
    blfSubscribe = null;
}
function UnsubscribeVoicemail(){
    if(!userAgent.isRegistered()) return;

    if(userAgent.voicemailSub){
        console.log("Unsubscribe to voicemail Messages...", userAgent.voicemailSub.state);
        if(userAgent.voicemailSub.state == SIP.SubscriptionState.Subscribed){
            userAgent.voicemailSub.unsubscribe().catch(function(error){
                console.warn("Error removing voicemail notifications:", error);
            });
        }
        userAgent.voicemailSub.dispose().catch(function(error){
            console.warn("Error disposing voicemail notifications:", error);
        });
    } else {
        console.log("Not subscribed to MWI");
    }
    userAgent.voicemailSub = null;
}
function SelfUnsubscribe(){
    if(!userAgent.isRegistered()) return;

    if(userAgent.selfSub){
        console.log("Unsubscribe from yourself...", userAgent.selfSub.state);
        if(userAgent.selfSub.state == SIP.SubscriptionState.Subscribed){
            userAgent.selfSub.unsubscribe().catch(function(error){
                console.warn("Error self subscription:", error);
            });
        }
        userAgent.selfSub.dispose().catch(function(error){
            console.warn("Error disposing self subscription:", error);
        });
    } else {
        console.log("Not subscribed to Yourself");
    }
    userAgent.selfSub = null;
}

function UnsubscribeBuddy(buddyObj) {
    console.log("Unsubscribe: ", buddyObj.identity);
    if(buddyObj.type == "extension" || buddyObj.type == "xmpp") {
        if(userAgent && userAgent.BlfSubs && userAgent.BlfSubs.length > 0){
            for (var blf = 0; blf < userAgent.BlfSubs.length; blf++) {
                var blfSubscribe = userAgent.BlfSubs[blf];
                if(blfSubscribe.data.buddyId == buddyObj.identity){
                    console.log("Subscription found, removing: ", buddyObj.identity);
                    UnsubscribeBlf(userAgent.BlfSubs[blf]);
                    userAgent.BlfSubs.splice(blf, 1);
                    break;
                }
            }
        }
    }
    stopSessionHoldMusic(session);
}
function VoicemailNotify(notification){
    if(notification.request.body.indexOf("Messages-Waiting:") > -1){
        notification.accept();

        var messagesWaiting = (notification.request.body.indexOf("Messages-Waiting: yes") > -1)
        var newVoiceMessages = 0;
        var oldVoiceMessages = 0;
        var ugentNewVoiceMessage = 0;
        var ugentOldVoiceMessage = 0;

        if(messagesWaiting){
            console.log("Messages Waiting!");
            var lines = notification.request.body.split("\r\n");
            for(var l=0; l<lines.length; l++){
                if(lines[l].indexOf("Voice-Message: ") > -1){
                    var value = lines[l].replace("Voice-Message: ", "");
                    if(value.indexOf(" (") > -1){
                        newVoiceMessages = parseInt(value.split(" (")[0].split("\/")[0]);
                        oldVoiceMessages = parseInt(value.split(" (")[0].split("\/")[1]);
                        ugentNewVoiceMessage = parseInt(value.split(" (")[1].replace(")","").split("\/")[0]);
                        ugentOldVoiceMessage = parseInt(value.split(" (")[1].replace(")","").split("\/")[1]);
                    } else {
                        newVoiceMessages = parseInt(value.split("\/")[0]);
                        oldVoiceMessages = parseInt(value.split("\/")[1]);
                    }
                }
            }
            console.log("Voicemail: ", newVoiceMessages, oldVoiceMessages, ugentNewVoiceMessage, ugentOldVoiceMessage);
            $("#TxtVoiceMessages").html(""+ newVoiceMessages)
            $("#TxtVoiceMessages").show();
            if(newVoiceMessages > userAgent.lastVoicemailCount){
                userAgent.lastVoicemailCount = newVoiceMessages;

                if (NotificationsActive && "Notification" in window) {
                    if (Notification.permission === "granted") {

                        var noticeOptions = {
                            body: lang.you_have_new_voice_mail.replace("{0}", newVoiceMessages),
                            icon: getNotificationIconUrl()
                        }

                        var vmNotification = new Notification(lang.new_voice_mail, noticeOptions);
                        vmNotification.onclick = function (event) {
                            console.log("Notification Clicked: New Voicemail");
                            event.preventDefault();
                            window.focus();

                            if(VoicemailDid != ""){
                                DialByLine("audio", null, VoicemailDid, lang.voice_mail);
                            }
                        }
                    }
                }

            }

        } else {
            $("#TxtVoiceMessages").html("0")
            $("#TxtVoiceMessages").hide();
        }

        if(typeof web_hook_on_messages_waiting !== 'undefined') {
            web_hook_on_messages_waiting(newVoiceMessages, oldVoiceMessages, ugentNewVoiceMessage, ugentOldVoiceMessage);
        }
    }
    else {
        notification.reject();
    }
}
function ReceiveNotify(notification, selfSubscribe) {
    if (userAgent == null || !userAgent.isRegistered()) return;

    notification.accept();

    var buddy = "";
    var dotClass = "dotOffline";
    var Presence = "Unknown";

    var ContentType = "";
    if(notification.request.headers.length > 0 && notification.request.headers["Content-Type"] && notification.request.headers["Content-Type"][0]){
        ContentType = notification.request.headers["Content-Type"][0].parsed;
    }
    if (ContentType == "application/pidf+xml") {
var xml = $($.parseXML(notification.request.body));
        var ObservedUser = xml.find("presence").attr("entity");
        buddy = ObservedUser.split("@")[0].split(":")[1];

        var availability = "closed"
        var tuples = xml.find("presence").find("tuple");
        if(tuples){
            $.each(tuples, function(i, obj){
                if($(obj).find("status").find("basic").text() == "open") {
                    availability = "open";
                }
            });
        }

        Presence = xml.find("presence").find("note").text();
        if(Presence == ""){
            if (availability == "open") Presence = "Ready";
            if (availability == "closed") Presence = "Not online";
        }
    }
    else if (ContentType == "application/dialog-info+xml") {

        var xml = $($.parseXML(notification.request.body));
var ObservedUser = xml.find("dialog-info").attr("entity");
        buddy = ObservedUser.split("@")[0].split(":")[1];

        var version = xml.find("dialog-info").attr("version");
        var DialogState = xml.find("dialog-info").attr("state");
        var extId = xml.find("dialog-info").find("dialog").attr("id");

        var state = xml.find("dialog-info").find("dialog").find("state").text();
        if (state == "terminated") Presence = "Ready";
        if (state == "trying") Presence = "On the phone";
        if (state == "proceeding") Presence = "On the phone";
        if (state == "early") Presence = "Ringing";
        if (state == "confirmed") Presence = "On the phone";
    }

    if(selfSubscribe){
        if(buddy == SipUsername){
            console.log("Self Notify:", Presence);
            if(typeof web_hook_on_self_notify !== 'undefined')  web_hook_on_self_notify(ContentType, notification.request.body);
        }
        else {
            console.warn("Self Subscribe Notify, but wrong user returned.", buddy, SipUsername);
        }
        return;
    }

    var buddyObj = FindBuddyByObservedUser(buddy);
    if(buddyObj == null) {
        console.warn("Buddy not found:", buddy);
        return;
    }
    if (Presence == "Not online") dotClass = "dotOffline";
    if (Presence == "Unavailable") dotClass = "dotOffline";
    if (Presence == "Ready") dotClass = "dotOnline";
    if (Presence == "On the phone") dotClass = "dotInUse";
    if (Presence == "Proceeding") dotClass = "dotInUse";
    if (Presence == "Ringing") dotClass = "dotRinging";
    if (Presence == "On hold") dotClass = "dotOnHold";
    console.log("Setting DevSate State for "+ buddyObj.CallerIDName +" to "+ dotClass);
    buddyObj.devState = dotClass;
    $("#contact-" + buddyObj.identity + "-devstate").prop("class", dotClass);
    $("#contact-" + buddyObj.identity + "-devstate-main").prop("class", dotClass);
    if(buddyObj.type != "xmpp"){
        console.log("Setting Presence for "+ buddyObj.CallerIDName +" to "+ Presence);

        buddyObj.presence = Presence;
        if (Presence == "Not online") Presence = lang.state_not_online;
        if (Presence == "Ready") Presence = lang.state_ready;
        if (Presence == "On the phone") Presence = lang.state_on_the_phone;
        if (Presence == "Proceeding") Presence = lang.state_on_the_phone;
        if (Presence == "Ringing") Presence = lang.state_ringing;
        if (Presence == "On hold") Presence = lang.state_on_hold;
        if (Presence == "Unavailable") Presence = lang.state_unavailable;
        $("#contact-" + buddyObj.identity + "-presence").html(Presence);
        $("#contact-" + buddyObj.identity + "-presence-main").html(Presence);
    }
    if(typeof web_hook_on_notify !== 'undefined')  web_hook_on_notify(ContentType, buddyObj, notification.request.body);
}
function InitialiseStream(buddy){
    var template = { TotalRows:0, DataCollection:[] }
    localDB.setItem(buddy + "-stream", JSON.stringify(template));
    return JSON.parse(localDB.getItem(buddy + "-stream"));
}
function EnforceRecentRecordLimit(stream){
    if(stream == null || stream.DataCollection == null) return false;
    if(!MaxRecentRecords || MaxRecentRecords <= 0) return false;

    var cdrCount = 0;
    for(var i = 0; i < stream.DataCollection.length; i++){
        if(stream.DataCollection[i] && stream.DataCollection[i].ItemType == "CDR") cdrCount++;
    }
    if(cdrCount <= MaxRecentRecords) return false;

    var toRemove = cdrCount - MaxRecentRecords;
    var trimmed = [];

    for(var j = 0; j < stream.DataCollection.length; j++){
        var item = stream.DataCollection[j];
        if(item && item.ItemType == "CDR" && toRemove > 0){
            toRemove--;
            continue;
        }
        trimmed.push(item);
    }

    stream.DataCollection = trimmed;
    stream.TotalRows = stream.DataCollection.length;
    return true;
}
function AddCallMessage(buddy, session) {

    var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
    if(currentStream == null) currentStream = InitialiseStream(buddy);

    var CallEnd = moment.utc();
    var callDuration = 0;
    var totalDuration = 0;
    var ringTime = 0;

    var CallStart = moment.utc(session.data.callstart.replace(" UTC", ""));
    var CallAnswer = null;
    if(session.data.startTime){
        CallAnswer = moment.utc(session.data.startTime);

        callDuration = moment.duration(CallEnd.diff(CallAnswer));
        ringTime = moment.duration(CallAnswer.diff(CallStart));
    }
    else {
        ringTime = moment.duration(CallEnd.diff(CallStart));
    }
    totalDuration = moment.duration(CallEnd.diff(CallStart));

    var srcId = "";
    var srcCallerID = "";
    var dstId = ""
    var dstCallerID = "";
    var srcDid = "";
    var dstDid = "";
    if(session.data.calldirection == "inbound") {
        srcId = buddy;
        dstId = profileUserID;
        srcCallerID = session.remoteIdentity.displayName;
        dstCallerID = profileName;
        srcDid = session.data.src || "";
        dstDid = SipUsername || profileUserID || "";
    } else if(session.data.calldirection == "outbound") {
        srcId = profileUserID;
        dstId = buddy;
        srcCallerID = profileName;
        dstCallerID = session.data.dst;
        srcDid = SipUsername || profileUserID || "";
        dstDid = session.data.dst || "";
    }

    var callDirection = session.data.calldirection;
    var withVideo = session.data.withvideo;
    var sessionId = session.id;
    var hangupBy = session.data.terminateby;

    var newMessageJson = {
        CdrId: uID(),
        ItemType: "CDR",
        ItemDate: CallStart.format("YYYY-MM-DD HH:mm:ss UTC"),
        CallAnswer: (CallAnswer)? CallAnswer.format("YYYY-MM-DD HH:mm:ss UTC") : null,
        CallEnd: CallEnd.format("YYYY-MM-DD HH:mm:ss UTC"),
        SrcUserId: srcId,
        Src: srcCallerID,
        SrcDid: srcDid,
        DstUserId: dstId,
        Dst: dstCallerID,
        DstDid: dstDid,
        RingTime: (ringTime != 0)? ringTime.asSeconds() : 0,
        Billsec: (callDuration != 0)? callDuration.asSeconds() : 0,
        TotalDuration: (totalDuration != 0)? totalDuration.asSeconds() : 0,
        ReasonCode: session.data.reasonCode,
        ReasonText: session.data.reasonText,
        WithVideo: withVideo,
        SessionId: sessionId,
        CallDirection: callDirection,
        Terminate: hangupBy,
        MessageData: null,
        Tags: [],
        Transfers: (session.data.transfer)? session.data.transfer : [],
        Mutes: (session.data.mute)? session.data.mute : [],
        Holds: (session.data.hold)? session.data.hold : [],
        Recordings: (session.data.recordings)? session.data.recordings : [],
        ConfCalls: (session.data.confcalls)? session.data.confcalls : [],
        ConfbridgeEvents: (session.data.ConfbridgeEvents)? session.data.ConfbridgeEvents : [],
        QOS: []
    }

    console.log("New CDR", newMessageJson);

    currentStream.DataCollection.push(newMessageJson);
    EnforceRecentRecordLimit(currentStream);
    currentStream.TotalRows = currentStream.DataCollection.length;
    localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));

    UpdateBuddyActivity(buddy);
    if(MaxDataStoreDays && MaxDataStoreDays > 0){
        console.log("Cleaning up data: ", MaxDataStoreDays);
        RemoveBuddyMessageStream(FindBuddyByIdentity(buddy), MaxDataStoreDays);
    }

}
function SendImageDataMessage(buddy, ImgDataUrl) {
    return;
}
function updateLineScroll(lineNum) {
    RefreshLineActivity(lineNum);

    var element = $("#line-"+ lineNum +"-CallDetails").get(0);
    if(element) element.scrollTop = element.scrollHeight;
}
function updateScroll(buddy) {
    return;
}
function IncreaseMissedBadge(buddy) {
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;
    buddyObj.missed += 1;
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null) {
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.missed = item.missed +1;
                return false;
            }
        });
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }
    $("#contact-" + buddy + "-missed").text(buddyObj.missed);
    $("#contact-" + buddy + "-missed").show();
    if(typeof web_hook_on_missed_notify !== 'undefined') web_hook_on_missed_notify(buddyObj.missed);

    console.log("Set Missed badge for "+ buddyObj.CallerIDName +" to: "+ buddyObj.missed);
}
function UpdateBuddyActivity(buddy, lastAct){
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;
    if(lastAct){
        buddyObj.lastActivity = lastAct;
    }
    else {
        var timeStamp = utcDateNow();
        buddyObj.lastActivity = timeStamp;
    }
    console.log("Last Activity for "+  buddyObj.CallerIDName +" is now: "+ buddyObj.lastActivity);
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null) {
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.LastActivity = timeStamp;
                return false;
            }
        });
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }
    UpdateBuddyList();
}
function ClearMissedBadge(buddy) {
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;

    buddyObj.missed = 0;
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null) {
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.missed = 0;
                return false;
            }
        });
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }

    $("#contact-" + buddy + "-missed").text(buddyObj.missed);
    $("#contact-" + buddy + "-missed").hide(400);

    if(typeof web_hook_on_missed_notify !== 'undefined') web_hook_on_missed_notify(buddyObj.missed);
}
function VideoCall(lineObj, dialledNumber, extraHeaders) {
    if(userAgent == null) return;
    if(!userAgent.isRegistered()) return;
    if(lineObj == null) return;

    if(HasAudioDevice == false){
        Alert(lang.alert_no_microphone);
        return;
    }

    if(HasVideoDevice == false){
        console.warn("No video devices (webcam) found, switching to audio call.");
        AudioCall(lineObj, dialledNumber);
        return;
    }

    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var spdOptions = {
        earlyMedia: true,
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId : "default" },
                video: { deviceId : "default" }
            }
        }
    }
    var currentAudioDevice = getAudioSrcID();
    if(currentAudioDevice != "default"){
        var confirmedAudioDevice = false;
        for (var i = 0; i < AudioinputDevices.length; ++i) {
            if(currentAudioDevice == AudioinputDevices[i].deviceId) {
                confirmedAudioDevice = true;
                break;
            }
        }
        if(confirmedAudioDevice) {
            spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: currentAudioDevice }
        }
        else {
            console.warn("The audio device you used before is no longer available, default settings applied.");
            localDB.setItem("AudioSrcId", "default");
        }
    }
    if(supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if(supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if(supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }
    var currentVideoDevice = getVideoSrcID();
    if(currentVideoDevice != "default"){
        var confirmedVideoDevice = false;
        for (var i = 0; i < VideoinputDevices.length; ++i) {
            if(currentVideoDevice == VideoinputDevices[i].deviceId) {
                confirmedVideoDevice = true;
                break;
            }
        }
        if(confirmedVideoDevice){
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.deviceId = { exact: currentVideoDevice }
        }
        else {
            console.warn("The video device you used before is no longer available, default settings applied.");
            localDB.setItem("VideoSrcId", "default");
        }
    }
    if(supportedConstraints.frameRate && maxFrameRate != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.frameRate = maxFrameRate;
    }
    if(supportedConstraints.height && videoHeight != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.height = videoHeight;
    }
    if(supportedConstraints.aspectRatio && videoAspectRatio != "") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.video.aspectRatio = videoAspectRatio;
    }
    if(extraHeaders) {
        spdOptions.extraHeaders = extraHeaders;
    } else {
        spdOptions.extraHeaders = [];
    }
    if(InviteExtraHeaders && InviteExtraHeaders != "" && InviteExtraHeaders != "{}"){
        try{
            var inviteExtraHeaders = JSON.parse(InviteExtraHeaders);
            for (const [key, value] of Object.entries(inviteExtraHeaders)) {
                if(value == ""){
                } else {
                    spdOptions.extraHeaders.push(key + ": "+  value);
                }
            }
        } catch(e){}
    }

    $("#line-" + lineObj.LineNumber + "-msg").html(lang.starting_video_call);
    $("#line-" + lineObj.LineNumber + "-timer").show();

    var startTime = moment.utc();
    console.log("INVITE (video): " + dialledNumber + "@" + SipDomain);

    var targetURI = SIP.UserAgent.makeURI("sip:" + dialledNumber.replace(/#/g, "%23") + "@" + SipDomain);
    lineObj.SipSession = new SIP.Inviter(userAgent, targetURI, spdOptions);
    lineObj.SipSession.data = {}
    lineObj.SipSession.data.line = lineObj.LineNumber;
    lineObj.SipSession.data.buddyId = lineObj.BuddyObj.identity;
    lineObj.SipSession.data.calldirection = "outbound";
    lineObj.SipSession.data.dst = dialledNumber;
    lineObj.SipSession.data.callstart = startTime.format("YYYY-MM-DD HH:mm:ss UTC");
    lineObj.SipSession.data.callTimer = window.setInterval(function(){
        var now = moment.utc();
        var duration = moment.duration(now.diff(startTime));
        var timeStr = formatShortDuration(duration.asSeconds());
        $("#line-" + lineObj.LineNumber + "-timer").html(timeStr);
        $("#line-" + lineObj.LineNumber + "-datetime").html(timeStr);
    }, 1000);
    lineObj.SipSession.data.VideoSourceDevice = getVideoSrcID();
    lineObj.SipSession.data.AudioSourceDevice = getAudioSrcID();
    lineObj.SipSession.data.AudioOutputDevice = getAudioOutputID();
    lineObj.SipSession.data.terminateby = "them";
    lineObj.SipSession.data.withvideo = true;
    lineObj.SipSession.data.earlyReject = false;
    lineObj.SipSession.isOnHold = false;
    lineObj.SipSession.delegate = {
        onBye: function(sip){
            onSessionReceivedBye(lineObj, sip);
        },
        onMessage: function(sip){
            onSessionReceivedMessage(lineObj, sip);
        },
        onInvite: function(sip){
            onSessionReinvited(lineObj, sip);
        },
        onSessionDescriptionHandler: function(sdh, provisional){
            onSessionDescriptionHandlerCreated(lineObj, sdh, provisional, true);
        }
    }
    AttachSessionTerminationObserver(lineObj, lineObj.SipSession, "outbound-video");
    var inviterOptions = {
        requestDelegate: {
            onTrying: function(sip){
                onInviteTrying(lineObj, sip);
            },
            onProgress:function(sip){
                onInviteProgress(lineObj, sip);
            },
            onRedirect:function(sip){
                onInviteRedirected(lineObj, sip);
            },
            onAccept:function(sip){
                onInviteAccepted(lineObj, true, sip);
            },
            onReject:function(sip){
                onInviteRejected(lineObj, sip);
            }
        }
    }
    lineObj.SipSession.invite(inviterOptions).catch(function(e){
        console.warn("Failed to send INVITE:", e);
    });

    $("#line-" + lineObj.LineNumber + "-btn-settings").removeAttr('disabled');
    $("#line-" + lineObj.LineNumber + "-btn-audioCall").prop('disabled','disabled');
    $("#line-" + lineObj.LineNumber + "-btn-videoCall").prop('disabled','disabled');
    $("#line-" + lineObj.LineNumber + "-btn-search").removeAttr('disabled');

    $("#line-" + lineObj.LineNumber + "-progress").show();
    $("#line-" + lineObj.LineNumber + "-msg").show();

    UpdateUI();
    UpdateBuddyList();
    updateLineScroll(lineObj.LineNumber);
    if(typeof web_hook_on_invite !== 'undefined') web_hook_on_invite(lineObj.SipSession);
}
function AudioCallMenu(buddy, obj){
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;

    var items = [];
    if(buddyObj.type == "extension" || buddyObj.type == "xmpp") {
        items.push({icon: "fa fa-phone-square", text: lang.call_extension + " ("+ buddyObj.ExtNo +")", value: buddyObj.ExtNo});
        if(buddyObj.MobileNumber != null && buddyObj.MobileNumber != "") {
            items.push({icon: "fa fa-mobile", text: lang.call_mobile + " ("+ buddyObj.MobileNumber +")", value: buddyObj.MobileNumber});
        }
        if(buddyObj.ContactNumber1 != null && buddyObj.ContactNumber1 != "") {
            items.push({icon: "fa fa-phone", text: lang.call_number + " ("+ buddyObj.ContactNumber1 +")", value: buddyObj.ContactNumber1});
        }
        if(buddyObj.ContactNumber2 != null && buddyObj.ContactNumber2 != "") {
            items.push({icon: "fa fa-phone", text: lang.call_number + " ("+ buddyObj.ContactNumber2 +")", value: buddyObj.ContactNumber2});
        }
    }
    else if(buddyObj.type == "contact") {
        if(buddyObj.MobileNumber != null && buddyObj.MobileNumber != "") {
            items.push({icon: "fa fa-mobile", text: lang.call_mobile + " ("+ buddyObj.MobileNumber +")", value: buddyObj.MobileNumber});
        }
        if(buddyObj.ContactNumber1 != null && buddyObj.ContactNumber1 != "") {
            items.push({icon: "fa fa-phone", text: lang.call_number + " ("+ buddyObj.ContactNumber1 +")", value: buddyObj.ContactNumber1});
        }
        if(buddyObj.ContactNumber2 != null && buddyObj.ContactNumber2 != "") {
            items.push({icon: "fa fa-phone", text: lang.call_number + " ("+ buddyObj.ContactNumber2 +")", value: buddyObj.ContactNumber2});
        }
    }
    else if(buddyObj.type == "group") {
        if(buddyObj.MobileNumber != null && buddyObj.MobileNumber != "") {
            items.push({icon: "fa fa-users", text: lang.call_group, value: buddyObj.ExtNo });
        }
    }
    if(items.length == 0) {
        console.error("No numbers to dial");
        EditBuddyWindow(buddy);
        return;
    }
    if(items.length == 1) {
        console.log("Automatically calling only number - AudioCall("+ buddy +", "+ items[0].value +")");

        DialByLine("audio", buddy, items[0].value);
    }
    else {

        var menu = {
            selectEvent : function( event, ui ) {
                var number = ui.item.attr("value");
                HidePopup();
                if(number != null) {
                    console.log("Menu click AudioCall("+ buddy +", "+ number +")");
                    DialByLine("audio", buddy, number);
                }
            },
            createEvent : null,
            autoFocus : true,
            items : items
        }
        PopupMenu(obj, menu);
    }
}
function AudioCall(lineObj, dialledNumber, extraHeaders) {
    if(userAgent == null) return;
    if(userAgent.isRegistered() == false) return;
    if(lineObj == null) return;

    if(HasAudioDevice == false){
        Alert(lang.alert_no_microphone);
        return;
    }

    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

    var spdOptions = {
        earlyMedia: true,
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId : "default" },
                video: false
            }
        }
    }
    var currentAudioDevice = getAudioSrcID();
    if(currentAudioDevice != "default"){
        var confirmedAudioDevice = false;
        for (var i = 0; i < AudioinputDevices.length; ++i) {
            if(currentAudioDevice == AudioinputDevices[i].deviceId) {
                confirmedAudioDevice = true;
                break;
            }
        }
        if(confirmedAudioDevice) {
            spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: currentAudioDevice }
        }
        else {
            console.warn("The audio device you used before is no longer available, default settings applied.");
            localDB.setItem("AudioSrcId", "default");
        }
    }
    if(supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if(supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if(supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }
    if(extraHeaders) {
        spdOptions.extraHeaders = extraHeaders;
    } else {
        spdOptions.extraHeaders = [];
    }
    if(InviteExtraHeaders && InviteExtraHeaders != "" && InviteExtraHeaders != "{}"){
        try{
            var inviteExtraHeaders = JSON.parse(InviteExtraHeaders);
            for (const [key, value] of Object.entries(inviteExtraHeaders)) {
                if(value == ""){
                } else {
                    spdOptions.extraHeaders.push(key + ": "+  value);
                }
            }
        } catch(e){}
    }

    $("#line-" + lineObj.LineNumber + "-msg").html(lang.starting_audio_call);
    $("#line-" + lineObj.LineNumber + "-timer").show();

    var startTime = moment.utc();
    console.log("INVITE (audio): " + dialledNumber + "@" + SipDomain);

    var targetURI = SIP.UserAgent.makeURI("sip:" + dialledNumber.replace(/#/g, "%23") + "@" + SipDomain);
    lineObj.SipSession = new SIP.Inviter(userAgent, targetURI, spdOptions);
    lineObj.SipSession.data = {}
    lineObj.SipSession.data.line = lineObj.LineNumber;
    lineObj.SipSession.data.buddyId = lineObj.BuddyObj.identity;
    lineObj.SipSession.data.calldirection = "outbound";
    lineObj.SipSession.data.dst = dialledNumber;
    lineObj.SipSession.data.callstart = startTime.format("YYYY-MM-DD HH:mm:ss UTC");
    lineObj.SipSession.data.callTimer = window.setInterval(function(){
        var now = moment.utc();
        var duration = moment.duration(now.diff(startTime));
        var timeStr = formatShortDuration(duration.asSeconds());
        $("#line-" + lineObj.LineNumber + "-timer").html(timeStr);
        $("#line-" + lineObj.LineNumber + "-datetime").html(timeStr);
    }, 1000);
    lineObj.SipSession.data.VideoSourceDevice = null;
    lineObj.SipSession.data.AudioSourceDevice = getAudioSrcID();
    lineObj.SipSession.data.AudioOutputDevice = getAudioOutputID();
    lineObj.SipSession.data.terminateby = "them";
    lineObj.SipSession.data.withvideo = false;
    lineObj.SipSession.data.earlyReject = false;
    lineObj.SipSession.isOnHold = false;
    lineObj.SipSession.delegate = {
        onBye: function(sip){
            onSessionReceivedBye(lineObj, sip);
        },
        onMessage: function(sip){
            onSessionReceivedMessage(lineObj, sip);
        },
        onInvite: function(sip){
            onSessionReinvited(lineObj, sip);
        },
        onSessionDescriptionHandler: function(sdh, provisional){
            onSessionDescriptionHandlerCreated(lineObj, sdh, provisional, false);
        }
    }
    AttachSessionTerminationObserver(lineObj, lineObj.SipSession, "outbound-audio");
    var inviterOptions = {
        requestDelegate: {
            onTrying: function(sip){
                onInviteTrying(lineObj, sip);
            },
            onProgress:function(sip){
                onInviteProgress(lineObj, sip);
            },
            onRedirect:function(sip){
                onInviteRedirected(lineObj, sip);
            },
            onAccept:function(sip){
                onInviteAccepted(lineObj, false, sip);
            },
            onReject:function(sip){
                onInviteRejected(lineObj, sip);
            }
        }
    }
    lineObj.SipSession.invite(inviterOptions).catch(function(e){
        console.warn("Failed to send INVITE:", e);

    });

    $("#line-" + lineObj.LineNumber + "-btn-settings").removeAttr('disabled');
    $("#line-" + lineObj.LineNumber + "-btn-audioCall").prop('disabled','disabled');
    $("#line-" + lineObj.LineNumber + "-btn-videoCall").prop('disabled','disabled');
    $("#line-" + lineObj.LineNumber + "-btn-search").removeAttr('disabled');

    $("#line-" + lineObj.LineNumber + "-progress").show();
    $("#line-" + lineObj.LineNumber + "-msg").show();

    UpdateUI();
    UpdateBuddyList();
    updateLineScroll(lineObj.LineNumber);
    if(typeof web_hook_on_invite !== 'undefined') web_hook_on_invite(lineObj.SipSession);
}
function countSessions(id){
    var rtn = 0;
    if(userAgent == null) {
        console.warn("userAgent is null");
        return 0;
    }
    $.each(userAgent.sessions, function (i, session) {
        if(id != session.id) rtn ++;
    });
    return rtn;
}
function StopRecording(lineNum, noConfirm){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;

    var session = lineObj.SipSession;
    if(noConfirm == true){
        $("#line-"+ lineObj.LineNumber +"-btn-start-recording").show();
        $("#line-"+ lineObj.LineNumber +"-btn-stop-recording").hide();

        if(session.data.mediaRecorder){
            if(session.data.mediaRecorder.state == "recording"){
                console.log("Stopping Call Recording");
                session.data.mediaRecorder.stop();
                session.data.recordings[session.data.recordings.length-1].stopTime = utcDateNow();
                window.clearInterval(session.data.recordingRedrawInterval);

                $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_recording_stopped);

                updateLineScroll(lineNum);
            }
            else{
                console.warn("Recorder is in an unknown state");
            }
        }
        return;
    }
    else {
        if(CallRecordingPolicy == "enabled"){
            console.warn("Policy Enabled: Call Recording");
            return;
        }

        Confirm(lang.confirm_stop_recording, lang.stop_recording, function(){
            StopRecording(lineNum, true);
        });
    }
}
function MixAudioStreams(MultiAudioTackStream){

    var audioContext = null;
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    }
    catch(e){
        console.warn("AudioContext() not available, cannot record");
        return MultiAudioTackStream;
    }
    var mixedAudioStream = audioContext.createMediaStreamDestination();
    MultiAudioTackStream.getAudioTracks().forEach(function(audioTrack){
        var srcStream = new MediaStream();
        srcStream.addTrack(audioTrack);
        var streamSourceNode = audioContext.createMediaStreamSource(srcStream);
        streamSourceNode.connect(mixedAudioStream);
    });

    return mixedAudioStream.stream;
}
function QuickFindBuddy(obj){
    var filter = obj.value;
    if(filter == "") {
        HidePopup();
        return;
    }

    console.log("Find Buddy: ", filter);

    Buddies.sort(function(a, b){
        if(a.CallerIDName < b.CallerIDName) return -1;
        if(a.CallerIDName > b.CallerIDName) return 1;
        return 0;
    });

    var items = [];
    var visibleItems = 0;
    for(var b = 0; b < Buddies.length; b++){
        var buddyObj = Buddies[b];
        var display = false;
        if(buddyObj.CallerIDName && buddyObj.CallerIDName.toLowerCase().indexOf(filter.toLowerCase()) > -1) display = true;
        if(buddyObj.ExtNo && buddyObj.ExtNo.toLowerCase().indexOf(filter.toLowerCase()) > -1) display = true;
        if(buddyObj.Desc && buddyObj.Desc.toLowerCase().indexOf(filter.toLowerCase()) > -1) display = true;
        if(buddyObj.MobileNumber && buddyObj.MobileNumber.toLowerCase().indexOf(filter.toLowerCase()) > -1) display = true;
        if(buddyObj.ContactNumber1 && buddyObj.ContactNumber1.toLowerCase().indexOf(filter.toLowerCase()) > -1) display = true;
        if(buddyObj.ContactNumber2 && buddyObj.ContactNumber2.toLowerCase().indexOf(filter.toLowerCase()) > -1) display = true;
        if(display) {
            var iconClass = "dotDefault";
            if(buddyObj.type == "extension" && buddyObj.EnableSubscribe == true) {
                iconClass = buddyObj.devState;
            } else if(buddyObj.type == "xmpp" && buddyObj.EnableSubscribe == true) {
                iconClass = buddyObj.devState;
            }
            if(visibleItems > 0) items.push({ value: null, text: "-"});
            items.push({ value: null, text: buddyObj.CallerIDName, isHeader: true });
            if(buddyObj.ExtNo != "") {
                items.push({ icon : "fa fa-phone-square "+ iconClass, text: lang.extension +" ("+ buddyObj.presence +"): "+ buddyObj.ExtNo, value: buddyObj.ExtNo });
            }
            if(buddyObj.MobileNumber != "") {
                items.push({ icon : "fa fa-mobile", text: lang.mobile +": "+ buddyObj.MobileNumber, value: buddyObj.MobileNumber });
            }
            if(buddyObj.ContactNumber1 != "") {
                items.push({ icon : "fa fa-phone", text: lang.call +": "+ buddyObj.ContactNumber1, value: buddyObj.ContactNumber1 });
            }
            if(buddyObj.ContactNumber2 != "") {
                items.push({ icon : "fa fa-phone", text: lang.call +": "+ buddyObj.ContactNumber2, value: buddyObj.ContactNumber2 });
            }
            visibleItems++;
        }
        if(visibleItems >= 5) break;
    }

    if(items.length > 1){
        var menu = {
            selectEvent : function( event, ui ) {
                var number = ui.item.attr("value");
                if(number == null) HidePopup();
                if(number != "null" && number != "" && number != undefined) {
                    HidePopup();
                    obj.value = number;
                }
            },
            createEvent : null,
            autoFocus : false,
            items : items
        }
        PopupMenu(obj, menu);
    }
    else {
        HidePopup();
    }
}
function StartTransferSession(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(!GuardLineAction(lineObj, "start-transfer")) return;

    if($("#line-"+ lineNum +"-btn-CancelConference").is(":visible")){
        CancelConference(lineNum);
        return;
    }

    $("#line-"+ lineNum +"-btn-Transfer").hide();
    $("#line-"+ lineNum +"-btn-CancelTransfer").show();

    holdSession(lineNum);
    $("#line-"+ lineNum +"-txt-FindTransferBuddy").val("");
    $("#line-"+ lineNum +"-txt-FindTransferBuddy").parent().show();
    RestoreCallControls(lineNum)

    $("#line-"+ lineNum +"-btn-blind-transfer").show();
    $("#line-"+ lineNum +"-btn-attended-transfer").show();
    $("#line-"+ lineNum +"-btn-complete-transfer").hide();
    $("#line-"+ lineNum +"-btn-cancel-transfer").hide();

    $("#line-"+ lineNum +"-btn-complete-attended-transfer").hide();
    $("#line-"+ lineNum +"-btn-cancel-attended-transfer").hide();
    $("#line-"+ lineNum +"-btn-terminate-attended-transfer").hide();

    $("#line-"+ lineNum +"-transfer-status").hide();

    $("#line-"+ lineNum +"-Transfer").show();
    $("#line-"+ lineNum +"-txt-FindTransferBuddy").focus();

    updateLineScroll(lineNum);
}
function CancelTransferSession(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Null line or session");
        return;
    }
    var session = lineObj.SipSession;
    window.ReturnToDialpadAfterCall = true;
    window.ReturnAfterCallTab = lineObj.ReturnToTab || window.ReturnAfterCallTab || "dialpad";
    if(session.data.childsession){
        console.log("Child Transfer call detected:", session.data.childsession.state);
        session.data.childsession.dispose().then(function(){
            session.data.childsession = null;
        }).catch(function(error){
            session.data.childsession = null;
        });
    }

    $("#line-"+ lineNum +"-btn-Transfer").show();
    $("#line-"+ lineNum +"-btn-CancelTransfer").hide();

    unholdSession(lineNum);
    $("#line-"+ lineNum +"-Transfer").hide();

    updateLineScroll(lineNum);
}
function transferOnkeydown(event, obj, lineNum) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13'){
        event.preventDefault();
        if(event.ctrlKey){
            AttendedTransfer(lineNum);
        }
        else {
            BlindTransfer(lineNum);
        }

        return false;
    }
}
function BlindTransfer(lineNum) {
    var dstNo = $("#line-"+ lineNum +"-txt-FindTransferBuddy").val();
    if(EnableAlphanumericDial){
        dstNo = dstNo.replace(telAlphanumericRegEx, "").substring(0,MaxDidLength);
    }
    else {
        dstNo = dstNo.replace(telNumericRegEx, "").substring(0,MaxDidLength);
    }
    if(dstNo == ""){
        console.warn("Cannot transfer, no number");
        return;
    }

    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Null line or session");
        return;
    }
    var session = lineObj.SipSession;

    if(!session.data.transfer) session.data.transfer = [];
    session.data.transfer.push({
        type: "Blind",
        to: dstNo,
        transferTime: utcDateNow(),
        disposition: "refer",
        dispositionTime: utcDateNow(),
        accept : {
            complete: null,
            eventTime: null,
            disposition: ""
        }
    });
    var transferId = session.data.transfer.length-1;

    var transferOptions  = {
        requestDelegate: {
            onAccept: function(sip){
                console.log("Blind transfer Accepted");

                session.data.terminateby = "us";
                session.data.reasonCode = 202;
                session.data.reasonText = "Transfer";

                session.data.transfer[transferId].accept.complete = true;
                session.data.transfer[transferId].accept.disposition = sip.message.reasonPhrase;
                session.data.transfer[transferId].accept.eventTime = utcDateNow();
                $("#line-" + lineNum + "-msg").html("Call Blind Transferred (Accepted)");

                updateLineScroll(lineNum);

                session.bye().catch(function(error){
                    console.warn("Could not BYE after blind transfer:", error);
                });
                teardownSession(lineObj);
            },
            onReject:function(sip){
                console.warn("REFER rejected:", sip);

                session.data.transfer[transferId].accept.complete = false;
                session.data.transfer[transferId].accept.disposition = sip.message.reasonPhrase;
                session.data.transfer[transferId].accept.eventTime = utcDateNow();

                $("#line-" + lineNum + "-msg").html("Call Blind Failed!");

                updateLineScroll(lineNum);
            }
        }
    }
    console.log("REFER: ", dstNo + "@" + SipDomain);
    var referTo = SIP.UserAgent.makeURI("sip:"+ dstNo.replace(/#/g, "%23") + "@" + SipDomain);
    session.refer(referTo, transferOptions).catch(function(error){
        console.warn("Failed to REFER", error);
    });;

    $("#line-" + lineNum + "-msg").html(lang.call_blind_transfered);

    updateLineScroll(lineNum);
}
function AttendedTransfer(lineNum){
    var dstNo = $("#line-"+ lineNum +"-txt-FindTransferBuddy").val();
    if(EnableAlphanumericDial){
        dstNo = dstNo.replace(telAlphanumericRegEx, "").substring(0,MaxDidLength);
    }
    else {
        dstNo = dstNo.replace(telNumericRegEx, "").substring(0,MaxDidLength);
    }
    if(dstNo == ""){
        console.warn("Cannot transfer, no number");
        return;
    }

    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Null line or session");
        return;
    }
    var session = lineObj.SipSession;

    HidePopup();

    $("#line-"+ lineNum +"-txt-FindTransferBuddy").parent().hide();
    $("#line-"+ lineNum +"-btn-blind-transfer").hide();
    $("#line-"+ lineNum +"-btn-attended-transfer").hide();

    $("#line-"+ lineNum +"-btn-complete-attended-transfer").hide();
    $("#line-"+ lineNum +"-btn-cancel-attended-transfer").hide();
    $("#line-"+ lineNum +"-btn-terminate-attended-transfer").hide();


    var newCallStatus = $("#line-"+ lineNum +"-transfer-status");
    newCallStatus.html(lang.connecting);
    newCallStatus.show();

    if(!session.data.transfer) session.data.transfer = [];
    session.data.transfer.push({
        type: "Attended",
        to: dstNo,
        transferTime: utcDateNow(),
        disposition: "invite",
        dispositionTime: utcDateNow(),
        accept : {
            complete: null,
            eventTime: null,
            disposition: ""
        }
    });
    var transferId = session.data.transfer.length-1;

    updateLineScroll(lineNum);
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var spdOptions = {
        earlyMedia: true,
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId : "default" },
                video: false
            }
        }
    }
    if(session.data.AudioSourceDevice != "default"){
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: session.data.AudioSourceDevice }
    }
    if(supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if(supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if(supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }
    if(session.data.withvideo){
        spdOptions.sessionDescriptionHandlerOptions.constraints.video = true;
        if(session.data.VideoSourceDevice != "default"){
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.deviceId = { exact: session.data.VideoSourceDevice }
        }
        if(supportedConstraints.frameRate && maxFrameRate != "") {
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.frameRate = maxFrameRate;
        }
        if(supportedConstraints.height && videoHeight != "") {
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.height = videoHeight;
        }
        if(supportedConstraints.aspectRatio && videoAspectRatio != "") {
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.aspectRatio = videoAspectRatio;
        }
    }
    console.log("TRANSFER INVITE: ", "sip:" + dstNo + "@" + SipDomain);
    var targetURI = SIP.UserAgent.makeURI("sip:"+ dstNo.replace(/#/g, "%23") + "@" + SipDomain);
    var newSession = new SIP.Inviter(userAgent, targetURI, spdOptions);
    newSession.data = {}
    newSession.delegate = {
        onBye: function(sip){
            console.log("New call session ended with BYE");
            newCallStatus.html(lang.call_ended);
            session.data.transfer[transferId].disposition = "bye";
            session.data.transfer[transferId].dispositionTime = utcDateNow();

            $("#line-"+ lineNum +"-txt-FindTransferBuddy").parent().show();
            $("#line-"+ lineNum +"-btn-blind-transfer").show();
            $("#line-"+ lineNum +"-btn-attended-transfer").show();

            $("#line-"+ lineNum +"-btn-complete-attended-transfer").hide();
            $("#line-"+ lineNum +"-btn-cancel-attended-transfer").hide();
            $("#line-"+ lineNum +"-btn-terminate-attended-transfer").hide();

            $("#line-"+ lineNum +"-msg").html(lang.attended_transfer_call_terminated);

            updateLineScroll(lineNum);

            window.setTimeout(function(){
                newCallStatus.hide();
                updateLineScroll(lineNum);
            }, 1000);
        },
        onSessionDescriptionHandler: function(sdh, provisional){
            if (sdh) {
                if(sdh.peerConnection){
                    sdh.peerConnection.ontrack = function(event){
                        var pc = sdh.peerConnection;
                        var remoteStream = new MediaStream();
                        pc.getReceivers().forEach(function (receiver) {
                            if(receiver.track && receiver.track.kind == "audio"){
                                remoteStream.addTrack(receiver.track);
                            }
                        });
                        var remoteAudio = $("#line-" + lineNum + "-transfer-remoteAudio").get(0);
                        remoteAudio.srcObject = remoteStream;
                        remoteAudio.onloadedmetadata = function(e) {
                            if (typeof remoteAudio.sinkId !== 'undefined') {
                                remoteAudio.setSinkId(session.data.AudioOutputDevice).then(function(){
                                    console.log("sinkId applied: "+ session.data.AudioOutputDevice);
                                }).catch(function(e){
                                    console.warn("Error using setSinkId: ", e);
                                });
                            }
                            remoteAudio.play();
                        }

                    }
                }
                else{
                    console.warn("onSessionDescriptionHandler fired without a peerConnection");
                }
            }
            else{
                console.warn("onSessionDescriptionHandler fired without a sessionDescriptionHandler");
            }
        }
    }
    session.data.childsession = newSession;
    var inviterOptions = {
        requestDelegate: {
            onTrying: function(sip){
                newCallStatus.html(lang.trying);
                session.data.transfer[transferId].disposition = "trying";
                session.data.transfer[transferId].dispositionTime = utcDateNow();

                $("#line-" + lineNum + "-msg").html(lang.attended_transfer_call_started);
            },
            onProgress:function(sip){
                newCallStatus.html(lang.ringing);
                session.data.transfer[transferId].disposition = "progress";
                session.data.transfer[transferId].dispositionTime = utcDateNow();

                $("#line-" + lineNum + "-msg").html(lang.attended_transfer_call_started);

                var CancelAttendedTransferBtn = $("#line-"+ lineNum +"-btn-cancel-attended-transfer");
                CancelAttendedTransferBtn.off('click');
                CancelAttendedTransferBtn.on('click', function(){
                    newSession.cancel().catch(function(error){
                        console.warn("Failed to CANCEL", error);
                    });
                    newCallStatus.html(lang.call_cancelled);
                    console.log("New call session canceled");

                    session.data.transfer[transferId].accept.complete = false;
                    session.data.transfer[transferId].accept.disposition = "cancel";
                    session.data.transfer[transferId].accept.eventTime = utcDateNow();

                    $("#line-" + lineNum + "-msg").html(lang.attended_transfer_call_cancelled);

                    updateLineScroll(lineNum);
                });
                CancelAttendedTransferBtn.show();

                updateLineScroll(lineNum);
            },
            onRedirect:function(sip){
                console.log("Redirect received:", sip);
            },
            onAccept:function(sip){
                newCallStatus.html(lang.call_in_progress);
                $("#line-"+ lineNum +"-btn-cancel-attended-transfer").hide();
                session.data.transfer[transferId].disposition = "accepted";
                session.data.transfer[transferId].dispositionTime = utcDateNow();

                var CompleteTransferBtn = $("#line-"+ lineNum +"-btn-complete-attended-transfer");
                CompleteTransferBtn.off('click');
                CompleteTransferBtn.on('click', function(){
                    var transferOptions  = {
                        requestDelegate: {
                            onAccept: function(sip){
                                console.log("Attended transfer Accepted");

                                session.data.terminateby = "us";
                                session.data.reasonCode = 202;
                                session.data.reasonText = "Attended Transfer";

                                session.data.transfer[transferId].accept.complete = true;
                                session.data.transfer[transferId].accept.disposition = sip.message.reasonPhrase;
                                session.data.transfer[transferId].accept.eventTime = utcDateNow();

                                $("#line-" + lineNum + "-msg").html(lang.attended_transfer_complete_accepted);

                                updateLineScroll(lineNum);
                                session.bye().catch(function(error){
                                    console.warn("Could not BYE after blind transfer:", error);
                                });

                                teardownSession(lineObj);
                            },
                            onReject: function(sip){
                                console.warn("Attended transfer rejected:", sip);

                                session.data.transfer[transferId].accept.complete = false;
                                session.data.transfer[transferId].accept.disposition = sip.message.reasonPhrase;
                                session.data.transfer[transferId].accept.eventTime = utcDateNow();

                                $("#line-" + lineNum + "-msg").html("Attended Transfer Failed!");

                                updateLineScroll(lineNum);
                            }
                        }
                    }
                    session.refer(newSession, transferOptions).catch(function(error){
                        console.warn("Failed to REFER", error);
                    });

                    newCallStatus.html(lang.attended_transfer_complete);

                    updateLineScroll(lineNum);
                });
                CompleteTransferBtn.show();

                updateLineScroll(lineNum);

                var TerminateAttendedTransferBtn = $("#line-"+ lineNum +"-btn-terminate-attended-transfer");
                TerminateAttendedTransferBtn.off('click');
                TerminateAttendedTransferBtn.on('click', function(){
                    newSession.bye().catch(function(error){
                        console.warn("Failed to BYE", error);
                    });
                    newCallStatus.html(lang.call_ended);
                    console.log("New call session end");

                    session.data.transfer[transferId].accept.complete = false;
                    session.data.transfer[transferId].accept.disposition = "bye";
                    session.data.transfer[transferId].accept.eventTime = utcDateNow();

                    $("#line-"+ lineNum +"-btn-complete-attended-transfer").hide();
                    $("#line-"+ lineNum +"-btn-cancel-attended-transfer").hide();
                    $("#line-"+ lineNum +"-btn-terminate-attended-transfer").hide();

                    $("#line-" + lineNum + "-msg").html(lang.attended_transfer_call_ended);

                    updateLineScroll(lineNum);

                    window.setTimeout(function(){
                        newCallStatus.hide();
                        CancelTransferSession(lineNum);
                        updateLineScroll(lineNum);
                    }, 1000);
                });
                TerminateAttendedTransferBtn.show();

                updateLineScroll(lineNum);
            },
            onReject:function(sip){
                console.log("New call session rejected: ", sip.message.reasonPhrase);
                newCallStatus.html(lang.call_rejected);
                session.data.transfer[transferId].disposition = sip.message.reasonPhrase;
                session.data.transfer[transferId].dispositionTime = utcDateNow();

                $("#line-"+ lineNum +"-txt-FindTransferBuddy").parent().show();
                $("#line-"+ lineNum +"-btn-blind-transfer").show();
                $("#line-"+ lineNum +"-btn-attended-transfer").show();

                $("#line-"+ lineNum +"-btn-complete-attended-transfer").hide();
                $("#line-"+ lineNum +"-btn-cancel-attended-transfer").hide();
                $("#line-"+ lineNum +"-btn-terminate-attended-transfer").hide();

                $("#line-"+ lineNum +"-msg").html(lang.attended_transfer_call_rejected);

                updateLineScroll(lineNum);

                window.setTimeout(function(){
                    newCallStatus.hide();
                    updateLineScroll(lineNum);
                }, 1000);
            }
        }
    }
    newSession.invite(inviterOptions).catch(function(e){
        console.warn("Failed to send INVITE:", e);
    });
}
function StartConferenceCall(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(!GuardLineAction(lineObj, "start-conference")) return;

    if($("#line-"+ lineNum +"-btn-CancelTransfer").is(":visible")){
        CancelTransferSession(lineNum);
        return;
    }

    $("#line-"+ lineNum +"-btn-Conference").hide();
    $("#line-"+ lineNum +"-btn-CancelConference").show();

    holdSession(lineNum);
    $("#line-"+ lineNum +"-txt-FindConferenceBuddy").val("");
    $("#line-"+ lineNum +"-txt-FindConferenceBuddy").parent().show();
    RestoreCallControls(lineNum)

    $("#line-"+ lineNum +"-btn-conference-dial").show();
    $("#line-"+ lineNum +"-btn-cancel-conference-dial").hide();
    $("#line-"+ lineNum +"-btn-join-conference-call").hide();
    $("#line-"+ lineNum +"-btn-terminate-conference-call").hide();

    $("#line-"+ lineNum +"-conference-status").hide();

    $("#line-"+ lineNum +"-Conference").show();
    $("#line-"+ lineNum +"-txt-FindConferenceBuddy").focus();

    updateLineScroll(lineNum);
}
function CancelConference(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Null line or session");
        return;
    }
    var session = lineObj.SipSession;
    if(session.data.childsession){
        console.log("Child Conference call detected:", session.data.childsession.state);
        session.data.childsession.dispose().then(function(){
            session.data.childsession = null;
        }).catch(function(error){
            session.data.childsession = null;
        });
    }

    $("#line-"+ lineNum +"-btn-Conference").show();
    $("#line-"+ lineNum +"-btn-CancelConference").hide();

    unholdSession(lineNum);
    $("#line-"+ lineNum +"-Conference").hide();

    updateLineScroll(lineNum);
}
function conferenceOnkeydown(event, obj, lineNum) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13'){
        event.preventDefault();

        ConferenceDial(lineNum);
        return false;
    }
}
function ConferenceDial(lineNum){
    var dstNo = $("#line-"+ lineNum +"-txt-FindConferenceBuddy").val();
    if(EnableAlphanumericDial){
        dstNo = dstNo.replace(telAlphanumericRegEx, "").substring(0,MaxDidLength);
    }
    else {
        dstNo = dstNo.replace(telNumericRegEx, "").substring(0,MaxDidLength);
    }
    if(dstNo == ""){
        console.warn("Cannot transfer, must be [0-9*+#]");
        return;
    }

    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Null line or session");
        return;
    }
    var session = lineObj.SipSession;

    HidePopup();

    $("#line-"+ lineNum +"-txt-FindConferenceBuddy").parent().hide();

    $("#line-"+ lineNum +"-btn-conference-dial").hide();
    $("#line-"+ lineNum +"-btn-cancel-conference-dial")
    $("#line-"+ lineNum +"-btn-join-conference-call").hide();
    $("#line-"+ lineNum +"-btn-terminate-conference-call").hide();

    var newCallStatus = $("#line-"+ lineNum +"-conference-status");
    newCallStatus.html(lang.connecting);
    newCallStatus.show();

    if(!session.data.confcalls) session.data.confcalls = [];
    session.data.confcalls.push({
        to: dstNo,
        startTime: utcDateNow(),
        disposition: "invite",
        dispositionTime: utcDateNow(),
        accept : {
            complete: null,
            eventTime: null,
            disposition: ""
        }
    });
    var confCallId = session.data.confcalls.length-1;

    updateLineScroll(lineNum);
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var spdOptions = {
        sessionDescriptionHandlerOptions: {
            earlyMedia: true,
            constraints: {
                audio: { deviceId : "default" },
                video: false
            }
        }
    }
    if(session.data.AudioSourceDevice != "default"){
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: session.data.AudioSourceDevice }
    }
    if(supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if(supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if(supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }
    if(session.data.withvideo){
        spdOptions.sessionDescriptionHandlerOptions.constraints.video = true;
        if(session.data.VideoSourceDevice != "default"){
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.deviceId = { exact: session.data.VideoSourceDevice }
        }
        if(supportedConstraints.frameRate && maxFrameRate != "") {
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.frameRate = maxFrameRate;
        }
        if(supportedConstraints.height && videoHeight != "") {
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.height = videoHeight;
        }
        if(supportedConstraints.aspectRatio && videoAspectRatio != "") {
            spdOptions.sessionDescriptionHandlerOptions.constraints.video.aspectRatio = videoAspectRatio;
        }
    }
    console.log("CONFERENCE INVITE: ", "sip:" + dstNo + "@" + SipDomain);

    var targetURI = SIP.UserAgent.makeURI("sip:"+ dstNo.replace(/#/g, "%23") + "@" + SipDomain);
    var newSession = new SIP.Inviter(userAgent, targetURI, spdOptions);
    newSession.data = {}
    newSession.delegate = {
        onBye: function(sip){
            console.log("New call session ended with BYE");
            newCallStatus.html(lang.call_ended);
            session.data.confcalls[confCallId].disposition = "bye";
            session.data.confcalls[confCallId].dispositionTime = utcDateNow();

            $("#line-"+ lineNum +"-txt-FindConferenceBuddy").parent().show();
            $("#line-"+ lineNum +"-btn-conference-dial").show();

            $("#line-"+ lineNum +"-btn-cancel-conference-dial").hide();
            $("#line-"+ lineNum +"-btn-join-conference-call").hide();
            $("#line-"+ lineNum +"-btn-terminate-conference-call").hide();

            $("#line-"+ lineNum +"-msg").html(lang.conference_call_terminated);

            updateLineScroll(lineNum);

            window.setTimeout(function(){
                newCallStatus.hide();
                updateLineScroll(lineNum);
            }, 1000);
        },
        onSessionDescriptionHandler: function(sdh, provisional){
            if (sdh) {
                if(sdh.peerConnection){
                    sdh.peerConnection.ontrack = function(event){
                        var pc = sdh.peerConnection;
                        var remoteStream = new MediaStream();
                        pc.getReceivers().forEach(function (receiver) {
                            if(receiver.track && receiver.track.kind == "audio"){
                                remoteStream.addTrack(receiver.track);
                            }
                        });
                        var remoteAudio = $("#line-" + lineNum + "-conference-remoteAudio").get(0);
                        remoteAudio.srcObject = remoteStream;
                        remoteAudio.onloadedmetadata = function(e) {
                            if (typeof remoteAudio.sinkId !== 'undefined') {
                                remoteAudio.setSinkId(session.data.AudioOutputDevice).then(function(){
                                    console.log("sinkId applied: "+ session.data.AudioOutputDevice);
                                }).catch(function(e){
                                    console.warn("Error using setSinkId: ", e);
                                });
                            }
                            remoteAudio.play();
                        }
                    }
                }
                else{
                    console.warn("onSessionDescriptionHandler fired without a peerConnection");
                }
            }
            else{
                console.warn("onSessionDescriptionHandler fired without a sessionDescriptionHandler");
            }
        }
    }
    newSession.stateChange.addListener(function(newState){
        if (newState == SIP.SessionState.Terminated) {
            if(session.data.childsession.data.AudioSourceTrack && session.data.childsession.data.AudioSourceTrack.kind == "audio"){
                session.data.childsession.data.AudioSourceTrack.stop();
            }
            if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
                var pc = session.sessionDescriptionHandler.peerConnection;
                pc.getSenders().forEach(function (RTCRtpSender) {
                    if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                        RTCRtpSender.replaceTrack(session.data.AudioSourceTrack).then(function(){
                            if(session.data.ismute){
                                RTCRtpSender.track.enabled = false;
                            }
                            else {
                                RTCRtpSender.track.enabled = true;
                            }
                        }).catch(function(){
                            console.error(e);
                        });
                        session.data.AudioSourceTrack = null;
                    }
                });
            }
        }
    });
    session.data.childsession = newSession;
    var inviterOptions = {
        requestDelegate: {
            onTrying: function(sip){
                newCallStatus.html(lang.ringing);
                session.data.confcalls[confCallId].disposition = "trying";
                session.data.confcalls[confCallId].dispositionTime = utcDateNow();

                $("#line-" + lineNum + "-msg").html(lang.conference_call_started);
            },
            onProgress:function(sip){
                newCallStatus.html(lang.ringing);
                session.data.confcalls[confCallId].disposition = "progress";
                session.data.confcalls[confCallId].dispositionTime = utcDateNow();

                $("#line-" + lineNum + "-msg").html(lang.conference_call_started);

                var CancelConferenceDialBtn = $("#line-"+ lineNum +"-btn-cancel-conference-dial");
                CancelConferenceDialBtn.off('click');
                CancelConferenceDialBtn.on('click', function(){
                    newSession.cancel().catch(function(error){
                        console.warn("Failed to CANCEL", error);
                    });
                    newCallStatus.html(lang.call_cancelled);
                    console.log("New call session canceled");

                    session.data.confcalls[confCallId].accept.complete = false;
                    session.data.confcalls[confCallId].accept.disposition = "cancel";
                    session.data.confcalls[confCallId].accept.eventTime = utcDateNow();

                    $("#line-" + lineNum + "-msg").html(lang.conference_call_cancelled);

                    updateLineScroll(lineNum);
                });
                CancelConferenceDialBtn.show();

                updateLineScroll(lineNum);
            },
            onRedirect:function(sip){
                console.log("Redirect received:", sip);
            },
            onAccept:function(sip){
                newCallStatus.html(lang.call_in_progress);
                $("#line-"+ lineNum +"-btn-cancel-conference-dial").hide();
                session.data.confcalls[confCallId].complete = true;
                session.data.confcalls[confCallId].disposition = "accepted";
                session.data.confcalls[confCallId].dispositionTime = utcDateNow();
                var JoinCallBtn = $("#line-"+ lineNum +"-btn-join-conference-call");
                JoinCallBtn.off('click');
                JoinCallBtn.on('click', function(){
                    if(!session.data.childsession){
                        console.warn("Conference session lost");
                        return;
                    }

                    var outputStreamForSession = new MediaStream();
                    var outputStreamForConfSession = new MediaStream();

                    var pc = session.sessionDescriptionHandler.peerConnection;
                    var confPc = session.data.childsession.sessionDescriptionHandler.peerConnection;
                    confPc.getReceivers().forEach(function (RTCRtpReceiver) {
                        if(RTCRtpReceiver.track && RTCRtpReceiver.track.kind == "audio") {
                            console.log("Adding conference session:", RTCRtpReceiver.track.label);
                            outputStreamForSession.addTrack(RTCRtpReceiver.track);
                        }
                    });
                    pc.getReceivers().forEach(function (RTCRtpReceiver) {
                        if(RTCRtpReceiver.track && RTCRtpReceiver.track.kind == "audio") {
                            console.log("Adding conference session:", RTCRtpReceiver.track.label);
                            outputStreamForConfSession.addTrack(RTCRtpReceiver.track);
                        }
                    });
                    pc.getSenders().forEach(function (RTCRtpSender) {
                        if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                            console.log("Switching to mixed Audio track on session");

                            session.data.AudioSourceTrack = RTCRtpSender.track;
                            outputStreamForSession.addTrack(RTCRtpSender.track);
                            var mixedAudioTrack = MixAudioStreams(outputStreamForSession).getAudioTracks()[0];
                            mixedAudioTrack.IsMixedTrack = true;

                            RTCRtpSender.replaceTrack(mixedAudioTrack);
                        }
                    });
                    confPc.getSenders().forEach(function (RTCRtpSender) {
                        if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                            console.log("Switching to mixed Audio track on conf call");

                            session.data.childsession.data.AudioSourceTrack = RTCRtpSender.track;
                            outputStreamForConfSession.addTrack(RTCRtpSender.track);
                            var mixedAudioTrackForConf = MixAudioStreams(outputStreamForConfSession).getAudioTracks()[0];
                            mixedAudioTrackForConf.IsMixedTrack = true;

                            RTCRtpSender.replaceTrack(mixedAudioTrackForConf);
                        }
                    });

                    newCallStatus.html(lang.call_in_progress);
                    console.log("Conference Call In Progress");

                    session.data.confcalls[confCallId].accept.complete = true;
                    session.data.confcalls[confCallId].accept.disposition = "join";
                    session.data.confcalls[confCallId].accept.eventTime = utcDateNow();

                    $("#line-"+ lineNum +"-btn-terminate-conference-call").show();

                    $("#line-" + lineNum + "-msg").html(lang.conference_call_in_progress);

                    JoinCallBtn.hide();
                    updateLineScroll(lineNum);
                    window.setTimeout(function(){
                        unholdSession(lineNum);
                        updateLineScroll(lineNum);
                    }, 1000);
                });
                JoinCallBtn.show();

                updateLineScroll(lineNum);
                var TerminateConfCallBtn = $("#line-"+ lineNum +"-btn-terminate-conference-call");
                TerminateConfCallBtn.off('click');
                TerminateConfCallBtn.on('click', function(){
                    newSession.bye().catch(function(e){
                        console.warn("Failed to BYE", e);
                    });
                    newCallStatus.html(lang.call_ended);
                    console.log("New call session end");
                    session.data.confcalls[confCallId].accept.disposition = "bye";
                    session.data.confcalls[confCallId].accept.eventTime = utcDateNow();

                    $("#line-" + lineNum + "-msg").html(lang.conference_call_ended);

                    updateLineScroll(lineNum);

                    window.setTimeout(function(){
                        newCallStatus.hide();
                        CancelConference(lineNum);
                        updateLineScroll(lineNum);
                    }, 1000);
                });
                TerminateConfCallBtn.show();

                updateLineScroll(lineNum);
            },
            onReject:function(sip){
                console.log("New call session rejected: ", sip.message.reasonPhrase);
                newCallStatus.html(lang.call_rejected);
                session.data.confcalls[confCallId].disposition = sip.message.reasonPhrase;
                session.data.confcalls[confCallId].dispositionTime = utcDateNow();

                $("#line-"+ lineNum +"-txt-FindConferenceBuddy").parent().show();
                $("#line-"+ lineNum +"-btn-conference-dial").show();

                $("#line-"+ lineNum +"-btn-cancel-conference-dial").hide();
                $("#line-"+ lineNum +"-btn-join-conference-call").hide();
                $("#line-"+ lineNum +"-btn-terminate-conference-call").hide();

                $("#line-"+ lineNum +"-msg").html(lang.conference_call_rejected);

                updateLineScroll(lineNum);

                window.setTimeout(function(){
                    newCallStatus.hide();
                    updateLineScroll(lineNum);
                }, 1000);
            }
        }
    }
    newSession.invite(inviterOptions).catch(function(e){
        console.warn("Failed to send INVITE:", e);
    });
}

function cancelSession(lineNum) {
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;

    lineObj.SipSession.data.terminateby = "us";
    lineObj.SipSession.data.reasonCode = 0;
    lineObj.SipSession.data.reasonText = "Call Cancelled";

    console.log("Cancelling session : "+ lineNum);
    if(lineObj.SipSession.state == SIP.SessionState.Initial || lineObj.SipSession.state == SIP.SessionState.Establishing){
        lineObj.SipSession.cancel();
    }
    else {
        console.warn("Session not in correct state for cancel.", lineObj.SipSession.state);
        console.log("Attempting teardown : "+ lineNum);
        teardownSession(lineObj);
    }

    $("#line-" + lineNum + "-msg").html(lang.call_cancelled);
}
function IsSessionActiveForUiAction(session){
    if(!session) return false;
    if(session.data && session.data.teardownComplete === true) return false;
    if(typeof SIP !== "undefined" && SIP.SessionState){
        if(session.state == SIP.SessionState.Terminated) return false;
    }
    return true;
}
function GuardLineAction(lineObj, actionName){
    if(lineObj == null || lineObj.SipSession == null) return false;
    if(IsSessionActiveForUiAction(lineObj.SipSession)) return true;

    console.warn("Skip action on inactive session:", actionName, lineObj.LineNumber);
    try {
        teardownSession(lineObj);
    } catch(e){}
    return false;
}
function ApplyLocalHoldState(session, onHold){
    if(!(session && session.sessionDescriptionHandler && session.sessionDescriptionHandler.peerConnection)) return;
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getReceivers().forEach(function(RTCRtpReceiver){
        if(RTCRtpReceiver.track) RTCRtpReceiver.track.enabled = !onHold;
    });
    pc.getSenders().forEach(function(RTCRtpSender){
        if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
            if(RTCRtpSender.track.IsMixedTrack == true){
                if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
                    session.data.AudioSourceTrack.enabled = !onHold;
                }
            }
            RTCRtpSender.track.enabled = !onHold;
        }
        else if(RTCRtpSender.track && RTCRtpSender.track.kind == "video"){
            RTCRtpSender.track.enabled = !onHold;
        }
    });
}
function holdSession(lineNum) {
    var lineObj = FindLineByNumber(lineNum);
    if(!GuardLineAction(lineObj, "hold")) return;
    var session = lineObj.SipSession;
    if(session.state != SIP.SessionState.Established){
        if(session.state == SIP.SessionState.Terminated) teardownSession(lineObj);
        return;
    }
    if(session.isOnHold == true) {
        console.log("Call is is already on hold:", lineNum);
        return;
    }
    if(session.data.holdInProgress === true){
        console.log("Hold request already in progress:", lineNum);
        return;
    }
    if(!IsTransportReady()) {
        console.warn("Transport not ready for hold re-INVITE, deferring:", lineNum);
        Alert("Cannot place call on hold - network connection unstable. Please try again.");
        return;
    }

    console.log("Putting Call on hold:", lineNum);
    session.data.holdInProgress = true;
    session.isOnHold = true;

    var sessionDescriptionHandlerOptions = session.sessionDescriptionHandlerOptionsReInvite || {};
    sessionDescriptionHandlerOptions.hold = true;
    session.sessionDescriptionHandlerOptionsReInvite = sessionDescriptionHandlerOptions;

    var options = {
        requestDelegate: {
            onAccept: function(){
                session.data.holdInProgress = false;
                ApplyLocalHoldState(session, true);
                session.isOnHold = true;
                console.log("Call is is on hold:", lineNum);

                $("#line-" + lineNum + "-btn-Hold").hide();
                $("#line-" + lineNum + "-btn-Unhold").show();
                $("#line-" + lineNum + "-msg").html(lang.call_on_hold);
                playSessionHoldMusic(session);
                if(!session.data.hold) session.data.hold = [];
                session.data.hold.push({ event: "hold", eventTime: utcDateNow() });

                updateLineScroll(lineNum);
                if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("hold", session);
            },
            onReject: function(){
                session.data.holdInProgress = false;
                session.isOnHold = false;
                console.warn("Failed to put the call on hold:", lineNum);
            }
        }
    };
    session.invite(options).catch(function(error){
        session.data.holdInProgress = false;
        session.isOnHold = false;
        console.warn("Error attempting to put the call on hold:", error);
    });
}
function unholdSession(lineNum) {
    var lineObj = FindLineByNumber(lineNum);
    if(!GuardLineAction(lineObj, "unhold")) return;
    var session = lineObj.SipSession;
    if(session.state != SIP.SessionState.Established){
        if(session.state == SIP.SessionState.Terminated) teardownSession(lineObj);
        return;
    }
    if(session.isOnHold == false) {
        console.log("Call is already off hold:", lineNum);
        return;
    }
    if(session.data.holdInProgress === true){
        console.log("Hold request already in progress:", lineNum);
        return;
    }
    if(!IsTransportReady()) {
        console.warn("Transport not ready for unhold re-INVITE, deferring:", lineNum);
        Alert("Cannot resume call - network connection unstable. Please try again.");
        return;
    }

    console.log("Taking call off hold:", lineNum);
    session.data.holdInProgress = true;
    session.isOnHold = false;

    var sessionDescriptionHandlerOptions = session.sessionDescriptionHandlerOptionsReInvite || {};
    sessionDescriptionHandlerOptions.hold = false;
    session.sessionDescriptionHandlerOptionsReInvite = sessionDescriptionHandlerOptions;

    var options = {
        requestDelegate: {
            onAccept: function(){
                session.data.holdInProgress = false;
                ApplyLocalHoldState(session, false);
                session.isOnHold = false;
                console.log("Call is off hold:", lineNum);

                $("#line-" + lineNum + "-btn-Hold").show();
                $("#line-" + lineNum + "-btn-Unhold").hide();
                $("#line-" + lineNum + "-msg").html(lang.call_in_progress);
                stopSessionHoldMusic(session);
                if(!session.data.hold) session.data.hold = [];
                session.data.hold.push({ event: "unhold", eventTime: utcDateNow() });

                updateLineScroll(lineNum);
                if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("unhold", session);
            },
            onReject: function(){
                session.data.holdInProgress = false;
                session.isOnHold = true;
                console.warn("Failed to put the call on hold", lineNum);
            }
        }
    };
    session.invite(options).catch(function(error){
        session.data.holdInProgress = false;
        session.isOnHold = true;
        console.warn("Error attempting to take to call off hold", error);
    });
}
function MuteSession(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(!GuardLineAction(lineObj, "mute")) return;

    $("#line-"+ lineNum +"-btn-Unmute").show();
    $("#line-"+ lineNum +"-btn-Mute").hide();

    var session = lineObj.SipSession;
    if(!session.sessionDescriptionHandler || !session.sessionDescriptionHandler.peerConnection) return;
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
            if(RTCRtpSender.track.IsMixedTrack == true){
                if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
                    console.log("Muting Mixed Audio Track : "+ session.data.AudioSourceTrack.label);
                    session.data.AudioSourceTrack.enabled = false;
                }
            }
            console.log("Muting Audio Track : "+ RTCRtpSender.track.label);
            RTCRtpSender.track.enabled = false;
        }
    });

    if(!session.data.mute) session.data.mute = [];
    session.data.mute.push({ event: "mute", eventTime: utcDateNow() });
    session.data.ismute = true;

    $("#line-" + lineNum + "-msg").html(lang.call_on_mute);

    updateLineScroll(lineNum);
    if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("mute", session);
}
function UnmuteSession(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(!GuardLineAction(lineObj, "unmute")) return;

    $("#line-"+ lineNum +"-btn-Unmute").hide();
    $("#line-"+ lineNum +"-btn-Mute").show();

    var session = lineObj.SipSession;
    if(!session.sessionDescriptionHandler || !session.sessionDescriptionHandler.peerConnection) return;
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
            if(RTCRtpSender.track.IsMixedTrack == true){
                if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
                    console.log("Unmuting Mixed Audio Track : "+ session.data.AudioSourceTrack.label);
                    session.data.AudioSourceTrack.enabled = true;
                }
            }
            console.log("Unmuting Audio Track : "+ RTCRtpSender.track.label);
            RTCRtpSender.track.enabled = true;
        }
    });

    if(!session.data.mute) session.data.mute = [];
    session.data.mute.push({ event: "unmute", eventTime: utcDateNow() });
    session.data.ismute = false;

    $("#line-" + lineNum + "-msg").html(lang.call_off_mute);

    updateLineScroll(lineNum);
    if(typeof web_hook_on_modify !== 'undefined') web_hook_on_modify("unmute", session);
}
function endSession(lineNum) {
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;

    console.log("Ending call with: "+ lineNum);
    lineObj.SipSession.data.terminateby = "us";
    lineObj.SipSession.data.reasonCode = 16;
    lineObj.SipSession.data.reasonText = "Normal Call clearing";

    lineObj.SipSession.bye().catch(function(e){
        console.warn("Failed to bye the session!", e);
    });

    $("#line-" + lineNum + "-msg").html(lang.call_ended);
    $("#line-" + lineNum + "-ActiveCall").hide();

    teardownSession(lineObj);

    updateLineScroll(lineNum);
}
function sendDTMF(lineNum, itemStr) {
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) return;
    var options = {
        duration: 100,
        interToneGap: 70
    }

    if(lineObj.SipSession.isOnHold == true){
        if(lineObj.SipSession.data.childsession){
            if(lineObj.SipSession.data.childsession.state == SIP.SessionState.Established){
                console.log("Sending DTMF ("+ itemStr +"): "+ lineObj.LineNumber + " child session");

                var result = lineObj.SipSession.data.childsession.sessionDescriptionHandler.sendDtmf(itemStr, options);
                if(result){
                    console.log("Sent DTMF ("+ itemStr +") child session");
                }
                else{
                    console.log("Failed to send DTMF ("+ itemStr +") child session");
                }
            }
            else {
                console.warn("Cannot Send DTMF ("+ itemStr +"): "+ lineObj.LineNumber + " is on hold, and the child session is not established");
            }
        }
        else {
            console.warn("Cannot Send DTMF ("+ itemStr +"): "+ lineObj.LineNumber + " is on hold, and there is no child session");
        }
    }
    else {
        if(lineObj.SipSession.state == SIP.SessionState.Established || lineObj.SipSession.state == SIP.SessionState.Establishing){
            console.log("Sending DTMF ("+ itemStr +"): "+ lineObj.LineNumber);

            var result = lineObj.SipSession.sessionDescriptionHandler.sendDtmf(itemStr, options);
            if(result){
                console.log("Sent DTMF ("+ itemStr +")");
            }
            else{
                console.log("Failed to send DTMF ("+ itemStr +")");
            }

            $("#line-" + lineNum + "-msg").html(lang.send_dtmf + ": "+ itemStr);

            updateLineScroll(lineNum);
            if(typeof web_hook_on_dtmf !== 'undefined') web_hook_on_dtmf(itemStr, lineObj.SipSession);
        }
        else {
            console.warn("Cannot Send DTMF ("+ itemStr +"): "+ lineObj.LineNumber + " session is not establishing or established");
        }
    }
}
function switchVideoSource(lineNum, srcId){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-" + lineNum + "-msg").html(lang.switching_video_source);

    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var constraints = {
        audio: false,
        video: { deviceId: "default" }
    }
    if(srcId != "default"){
        constraints.video.deviceId = { exact: srcId }
    }
    if(supportedConstraints.frameRate && maxFrameRate != "") {
        constraints.video.frameRate = maxFrameRate;
    }
    if(supportedConstraints.height && videoHeight != "") {
        constraints.video.height = videoHeight;
    }
    if(supportedConstraints.aspectRatio && videoAspectRatio != "") {
        constraints.video.aspectRatio = videoAspectRatio;
    }

    session.data.VideoSourceDevice = srcId;

    var pc = session.sessionDescriptionHandler.peerConnection;

    var localStream = new MediaStream();
    navigator.mediaDevices.getUserMedia(constraints).then(function(newStream){
        var newMediaTrack = newStream.getVideoTracks()[0];
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "video") {
                console.log("Switching Video Track : "+ RTCRtpSender.track.label + " to "+ newMediaTrack.label);
                RTCRtpSender.track.stop();
                RTCRtpSender.replaceTrack(newMediaTrack);
                localStream.addTrack(newMediaTrack);
            }
        });
    }).catch(function(e){
        console.error("Error on getUserMedia", e, constraints);
    });
    if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                RTCRtpSender.replaceTrack(session.data.AudioSourceTrack).then(function(){
                    if(session.data.ismute){
                        RTCRtpSender.track.enabled = false;
                    }
                    else {
                        RTCRtpSender.track.enabled = true;
                    }
                }).catch(function(){
                    console.error(e);
                });
                session.data.AudioSourceTrack = null;
            }
        });
    }
    console.log("Showing as preview...");
    var localVideo = $("#line-" + lineNum + "-localVideo").get(0);
    localVideo.srcObject = localStream;
    localVideo.onloadedmetadata = function(e) {
        localVideo.play();
    }
}
function SendCanvas(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-" + lineNum + "-msg").html(lang.switching_to_canvas);
    RemoveScratchpad(lineNum);
    var newCanvas = $('<canvas/>');
    newCanvas.prop("id", "line-" + lineNum + "-scratchpad");
    $("#line-" + lineNum + "-scratchpad-container").append(newCanvas);
    $("#line-" + lineNum + "-scratchpad").css("display", "inline-block");
    $("#line-" + lineNum + "-scratchpad").css("width", "100%");
    $("#line-" + lineNum + "-scratchpad").css("height", "100%");
    $("#line-" + lineNum + "-scratchpad").prop("width", 640);
    $("#line-" + lineNum + "-scratchpad").prop("height", 360);
    $("#line-" + lineNum + "-scratchpad-container").show();

    console.log("Canvas for Scratchpad created...");

    scratchpad = new fabric.Canvas("line-" + lineNum + "-scratchpad");
    scratchpad.id = "line-" + lineNum + "-scratchpad";
    scratchpad.backgroundColor = "#FFFFFF";
    scratchpad.isDrawingMode = true;
    scratchpad.renderAll();
    scratchpad.redrawIntrtval = window.setInterval(function(){
        scratchpad.renderAll();
    }, 1000);

    CanvasCollection.push(scratchpad);
    var canvasMediaStream = $("#line-"+ lineNum +"-scratchpad").get(0).captureStream(25);
    var canvasMediaTrack = canvasMediaStream.getVideoTracks()[0];
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if(RTCRtpSender.track && RTCRtpSender.track.kind == "video") {
            console.log("Switching Track : "+ RTCRtpSender.track.label + " to Scratchpad Canvas");
            RTCRtpSender.track.stop();
            RTCRtpSender.replaceTrack(canvasMediaTrack);
        }
    });
    if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                RTCRtpSender.replaceTrack(session.data.AudioSourceTrack).then(function(){
                    if(session.data.ismute){
                        RTCRtpSender.track.enabled = false;
                    }
                    else {
                        RTCRtpSender.track.enabled = true;
                    }
                }).catch(function(){
                    console.error(e);
                });
                session.data.AudioSourceTrack = null;
            }
        });
    }
    console.log("Showing as preview...");
    var localVideo = $("#line-" + lineNum + "-localVideo").get(0);
    localVideo.srcObject = canvasMediaStream;
    localVideo.onloadedmetadata = function(e) {
        localVideo.play();
    }
}
function SendVideo(lineNum, src){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null");
        return;
    }

    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", false);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", false);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", false);
    $("#line-"+ lineNum +"-src-video").prop("disabled", true);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", false);

    $("#line-" + lineNum + "-msg").html(lang.switching_to_shared_video);

    $("#line-" + lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();

    $("#line-"+ lineNum +"-localVideo").hide();
    $("#line-"+ lineNum +"-remote-videos").hide();
    var newVideo = $("#line-" + lineNum + "-sharevideo");
    newVideo.prop("src", src);
    newVideo.off("loadedmetadata");
    newVideo.on("loadedmetadata", function () {
        console.log("Video can play now... ");
        var ResampleSize = 360;
        if(VideoResampleSize == "HD") ResampleSize = 720;
        if(VideoResampleSize == "FHD") ResampleSize = 1080;

        var videoObj = newVideo.get(0);
        var resampleCanvas = $('<canvas/>').get(0);

        var videoWidth = videoObj.videoWidth;
        var videoHeight = videoObj.videoHeight;
        if(videoWidth >= videoHeight){
            if(videoHeight > ResampleSize){
                var p = ResampleSize / videoHeight;
                videoHeight = ResampleSize;
                videoWidth = videoWidth * p;
            }
        }
        else {
            if(videoWidth > ResampleSize){
                var p = ResampleSize / videoWidth;
                videoWidth = ResampleSize;
                videoHeight = videoHeight * p;
            }
        }

        resampleCanvas.width = videoWidth;
        resampleCanvas.height = videoHeight;
        var resampleContext = resampleCanvas.getContext("2d");

        window.clearInterval(session.data.videoResampleInterval);
        session.data.videoResampleInterval = window.setInterval(function(){
            resampleContext.drawImage(videoObj, 0, 0, videoWidth, videoHeight);
        }, 40);
        var videoMediaStream = null;
        if('captureStream' in videoObj) {
            videoMediaStream = videoObj.captureStream();
        }
        else if('mozCaptureStream' in videoObj) {
            videoMediaStream = videoObj.mozCaptureStream();
        }
        else {
            console.warn("Cannot capture stream from video, this will result in no audio being transmitted.")
        }
        var resampleVideoMediaStream = resampleCanvas.captureStream(25);
        var videoMediaTrack = resampleVideoMediaStream.getVideoTracks()[0];
        var audioTrackFromVideo = (videoMediaStream != null )? videoMediaStream.getAudioTracks()[0] : null;
        var pc = session.sessionDescriptionHandler.peerConnection;
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "video") {
                console.log("Switching Track : "+ RTCRtpSender.track.label);
                RTCRtpSender.track.stop();
                RTCRtpSender.replaceTrack(videoMediaTrack);
            }
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                console.log("Switching to mixed Audio track on session");

                session.data.AudioSourceTrack = RTCRtpSender.track;

                var mixedAudioStream = new MediaStream();
                if(audioTrackFromVideo) mixedAudioStream.addTrack(audioTrackFromVideo);
                mixedAudioStream.addTrack(RTCRtpSender.track);
                var mixedAudioTrack = MixAudioStreams(mixedAudioStream).getAudioTracks()[0];
                mixedAudioTrack.IsMixedTrack = true;

                RTCRtpSender.replaceTrack(mixedAudioTrack);
            }
        });
        console.log("Showing as preview...");
        var localVideo = $("#line-" + lineNum + "-localVideo").get(0);
        localVideo.srcObject = videoMediaStream;
        localVideo.onloadedmetadata = function(e) {
            localVideo.play().then(function(){
                console.log("Playing Preview Video File");
            }).catch(function(e){
                console.error("Cannot play back video", e);
            });
        }
        console.log("Starting Video...");
        $("#line-"+ lineNum +"-sharevideo").get(0).play();
    });

    $("#line-"+ lineNum +"-sharevideo").show();
    console.log("Video for Sharing created...");
}
function ShareScreen(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-" + lineNum + "-msg").html(lang.switching_to_shared_screen);

    var localStream = new MediaStream();
    var pc = session.sessionDescriptionHandler.peerConnection;
    if (navigator.getDisplayMedia) {
        var screenShareConstraints = { video: true, audio: false }
        navigator.getDisplayMedia(screenShareConstraints).then(function(newStream) {
            console.log("navigator.getDisplayMedia")
            var newMediaTrack = newStream.getVideoTracks()[0];
            pc.getSenders().forEach(function (RTCRtpSender) {
                if(RTCRtpSender.track && RTCRtpSender.track.kind == "video") {
                    console.log("Switching Video Track : "+ RTCRtpSender.track.label + " to Screen");
                    RTCRtpSender.track.stop();
                    RTCRtpSender.replaceTrack(newMediaTrack);
                    localStream.addTrack(newMediaTrack);
                }
            });
            console.log("Showing as preview...");
            var localVideo = $("#line-" + lineNum + "-localVideo").get(0);
            localVideo.srcObject = localStream;
            localVideo.onloadedmetadata = function(e) {
                localVideo.play();
            }
        }).catch(function (err) {
            console.error("Error on getUserMedia");
        });
    }
    else if (navigator.mediaDevices.getDisplayMedia) {
        var screenShareConstraints = { video: true, audio: false }
        navigator.mediaDevices.getDisplayMedia(screenShareConstraints).then(function(newStream) {
            console.log("navigator.mediaDevices.getDisplayMedia")
            var newMediaTrack = newStream.getVideoTracks()[0];
            pc.getSenders().forEach(function (RTCRtpSender) {
                if(RTCRtpSender.track && RTCRtpSender.track.kind == "video") {
                    console.log("Switching Video Track : "+ RTCRtpSender.track.label + " to Screen");
                    RTCRtpSender.track.stop();
                    RTCRtpSender.replaceTrack(newMediaTrack);
                    localStream.addTrack(newMediaTrack);
                }
            });
            console.log("Showing as preview...");
            var localVideo = $("#line-" + lineNum + "-localVideo").get(0);
            localVideo.srcObject = localStream;
            localVideo.onloadedmetadata = function(e) {
                localVideo.play();
            }
        }).catch(function (err) {
            console.error("Error on getUserMedia");
        });
    }
    else {
        var screenShareConstraints = { video: { mediaSource: 'screen' }, audio: false }
        navigator.mediaDevices.getUserMedia(screenShareConstraints).then(function(newStream) {
            console.log("navigator.mediaDevices.getUserMedia")
            var newMediaTrack = newStream.getVideoTracks()[0];
            pc.getSenders().forEach(function (RTCRtpSender) {
                if(RTCRtpSender.track && RTCRtpSender.track.kind == "video") {
                    console.log("Switching Video Track : "+ RTCRtpSender.track.label + " to Screen");
                    RTCRtpSender.track.stop();
                    RTCRtpSender.replaceTrack(newMediaTrack);
                    localStream.addTrack(newMediaTrack);
                }
            });
            console.log("Showing as preview...");
            var localVideo = $("#line-" + lineNum + "-localVideo").get(0);
            localVideo.srcObject = localStream;
            localVideo.onloadedmetadata = function(e) {
                localVideo.play();
            }
        }).catch(function (err) {
            console.error("Error on getUserMedia");
        });
    }
    if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
        pc.getSenders().forEach(function (RTCRtpSender) {
            if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                RTCRtpSender.replaceTrack(session.data.AudioSourceTrack).then(function(){
                    if(session.data.ismute){
                        RTCRtpSender.track.enabled = false;
                    }
                    else {
                        RTCRtpSender.track.enabled = true;
                    }
                }).catch(function(){
                    console.error(e);
                });
                session.data.AudioSourceTrack = null;
            }
        });
    }

}
function DisableVideoStream(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null");
        return;
    }
    var session = lineObj.SipSession;

    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if(RTCRtpSender.track && RTCRtpSender.track.kind == "video") {
            console.log("Disable Video Track : "+ RTCRtpSender.track.label + "");
            RTCRtpSender.track.enabled = false;
        }
        if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
            if(session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio"){
                RTCRtpSender.replaceTrack(session.data.AudioSourceTrack).then(function(){
                    if(session.data.ismute){
                        RTCRtpSender.track.enabled = false;
                    }
                    else {
                        RTCRtpSender.track.enabled = true;
                    }
                }).catch(function(){
                    console.error(e);
                });
                session.data.AudioSourceTrack = null;
            }
        }
    });
    console.log("Showing as preview...");
    var localVideo = $("#line-" + lineNum + "-localVideo").get(0);
    localVideo.pause();
    localVideo.removeAttribute('src');
    localVideo.load();

    $("#line-" + lineNum + "-msg").html(lang.video_disabled);
}
function AppendNumpadDtmf(lineNum, digit){
    KeyPressNumpad(lineNum, digit);
}
function ClearNumpadDtmf(lineNum){
    $("#line-" + lineNum + "-dtmf-input").val("").focus();
}
function SendImmediateNumpadDtmf(lineNum, digit){
    var normalized = String(digit || "").trim();
    if(!/^[0-9*#]$/.test(normalized)) return;
    sendDTMF(lineNum, normalized);
}
function HandleNumpadKeydown(lineNum, event){
    if(!event) return;
    var key = String(event.key || "");
    if(key === "Enter"){
        event.preventDefault();
        return;
    }
    if(key === "Backspace"){
        event.preventDefault();
        KeyPressNumpad(lineNum, "del");
        return;
    }
    if(/^[0-9*#]$/.test(key)){
        event.preventDefault();
        KeyPressNumpad(lineNum, key);
        return;
    }
}
function KeyPressNumpad(lineNum, num){
    var input = $("#line-" + lineNum + "-dtmf-input");
    var textElObj = input.get(0);
    if(!textElObj) return;
    var currVal = String(input.val() || "");
    var ss = textElObj.selectionStart;
    var se = textElObj.selectionEnd;
    var ln = currVal.length;
    var newValue = "";
    if(ss == se){
        if(num == "del"){
            newValue = currVal.substring(0, ss-1) + currVal.substring(se, ln);
            input.val(newValue);
            input.focus();
            textElObj.setSelectionRange(Math.max(ss-1, 0), Math.max(ss-1, 0));
            return;
        }
        newValue = currVal.substring(0, ss) + num + currVal.substring(se, ln);
        input.val(newValue);
        input.focus();
        textElObj.setSelectionRange(ss+1, ss+1);
        SendImmediateNumpadDtmf(lineNum, num);
        return;
    }
    if(num == "del"){
        newValue = currVal.substring(0, ss) + currVal.substring(se, ln);
        input.val(newValue);
        input.focus();
        textElObj.setSelectionRange(ss, ss);
        return;
    }
    newValue = currVal.substring(0, ss) + num + currVal.substring(se, ln);
    input.val(newValue);
    input.focus();
    textElObj.setSelectionRange(ss+1, ss+1);
    SendImmediateNumpadDtmf(lineNum, num);
}
function SendNumpadDtmf(lineNum){
    var input = $("#line-" + lineNum + "-dtmf-input");
    var value = String(input.val() || "").replace(/[^0-9*#]/g, "");
    if(value == ""){
        input.focus();
        return;
    }
    for(var i = 0; i < value.length; i++){
        sendDTMF(lineNum, value.charAt(i));
    }
    input.val("").focus();
}
function CloseNumpadInline(){
    if(!dtmfInlinePanelState) return;
    var actionArea = $("#actionArea");
    actionArea.html(dtmfInlinePanelState.html || "");
    if(dtmfInlinePanelState.className){
        actionArea.attr("class", dtmfInlinePanelState.className);
    }
    dtmfInlinePanelState = null;
}
function BuildDialInputRowHtml(inputId, inputClass, inputAttrs, onInput, onKeyDown, deleteButtonId, deleteButtonClass, deleteButtonTitle, deleteOnClick, deleteButtonContent){
    var html = "";
    html += "<div class=dialInputRow>";
    html += "<input id=\"" + inputId + "\" class=\"" + inputClass + "\" " + (inputAttrs || "") + " oninput=\"" + (onInput || "") + "\" onkeydown=\"" + (onKeyDown || "") + "\" style=\"width:170px; height:32px\">";
    html += "<button id=\"" + deleteButtonId + "\" class=\"" + deleteButtonClass + "\" title=\"" + (deleteButtonTitle || "") + "\" onclick=\"" + deleteOnClick + "\">" + deleteButtonContent + "</button>";
    html += "</div>";
    return html;
}
function BuildDialPadGridHtml(onDigitExprTemplate, cellSpacing){
    var html = "";
    var expr = onDigitExprTemplate || "KeyPress('%DIGIT%')";
    var spacing = cellSpacing || 8;
    function clickExpr(digit){
        return String(expr).replace("%DIGIT%", digit);
    }
    html += "<table class=\"dialPadGrid\" cellspacing=" + spacing + " cellpadding=0>";
    html += "<tr><td><button class=dialButtons onclick=\"" + clickExpr("1") + "\"><div>1</div><span>&nbsp;</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("2") + "\"><div>2</div><span>ABC</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("3") + "\"><div>3</div><span>DEF</span></button></td></tr>";
    html += "<tr><td><button class=dialButtons onclick=\"" + clickExpr("4") + "\"><div>4</div><span>GHI</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("5") + "\"><div>5</div><span>JKL</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("6") + "\"><div>6</div><span>MNO</span></button></td></tr>";
    html += "<tr><td><button class=dialButtons onclick=\"" + clickExpr("7") + "\"><div>7</div><span>PQRS</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("8") + "\"><div>8</div><span>TUV</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("9") + "\"><div>9</div><span>WXYZ</span></button></td></tr>";
    html += "<tr><td><button class=dialButtons onclick=\"" + clickExpr("*") + "\">*</button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("0") + "\">0</button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("#") + "\">#</button></td></tr>";
    html += "</table>";
    return html;
}
function ShowNumpad(lineNum){
    console.log("Show Numpad");
    HidePopup();

    RestoreCallControls(lineNum)
    var html = ""
    html += "<div class=\"dialScreenMobile dtmfDialpadPopup\">";
    html += BuildDialInputRowHtml(
        "line-" + lineNum + "-dtmf-input",
        "dialTextInput dtmfInput",
        "type=tel inputmode=tel autocomplete=off",
        "",
        "HandleNumpadKeydown('" + lineNum + "', event)",
        "line-" + lineNum + "-dtmf-delete",
        "roundButtons dtmfClearButton",
        lang.clear,
        "KeyPressNumpad('" + lineNum + "', 'del')",
        "<i class=\"fa fa-arrow-left\"></i>"
    );
    html += BuildDialPadGridHtml("KeyPressNumpad('" + lineNum + "', '%DIGIT%')", 8);
    html += "</div>";
    OpenWindow(html, "", 392, 250, true, false, lang.cancel, function(){
        CloseWindow();
    }, null, null, function(){
        if(windowObj && windowObj.parent){
            windowObj.parent().addClass("dtmfDialpadDialog");
        }
        $("#line-" + lineNum + "-dtmf-input").focus();
    }, function(){
        return true;
    });
}
function ShowPresentMenu(obj, lineNum){
    var items = [];
    items.push({value: "src-camera", icon : "fa fa-video-camera", text: lang.camera, isHeader: false });
    items.push({value: "src-canvas", icon : "fa fa-pencil-square", text: lang.scratchpad, isHeader: false });
    items.push({value: "src-desktop", icon : "fa fa-desktop", text: lang.screen, isHeader: false });
    items.push({value: "src-video", icon : "fa fa-file-video-o", text: lang.video, isHeader: false });
    items.push({value: "src-blank", icon : "fa fa-ban", text: lang.blank, isHeader: false });

    var menu = {
        selectEvent : function( event, ui ) {
            var id = ui.item.attr("value");
            if(id != null) {
                if(id == "src-camera") PresentCamera(lineNum);
                if(id == "src-canvas") PresentScratchpad(lineNum);
                if(id == "src-desktop") PresentScreen(lineNum);
                if(id == "src-video") PresentVideo(lineNum);
                if(id == "src-blank") PresentBlank(lineNum);
                HidePopup();
            }
            else {
                HidePopup();
            }
        },
        createEvent : null,
        autoFocus : true,
        items : items
    }
    PopupMenu(obj, menu);
}

function RestoreCallControls(lineNum){
    $("#line-"+ lineNum +"-btn-more").show();
}
function ExpandVideoArea(lineNum){
    $("#line-" + lineNum + "-call-fullscreen").prop("class","streamSection highlightSection FullScreenVideo");

    $("#line-" + lineNum + "-btn-restore").show();
    $("#line-" + lineNum + "-btn-expand").hide();

    $("#line-" + lineNum + "-VideoCall").css("background-color", "#000000");

    RedrawStage(lineNum, false);
    if(typeof web_hook_on_expand_video_area !== 'undefined') {
        web_hook_on_expand_video_area(lineNum);
    }
}
function RestoreVideoArea(lineNum){
    $("#line-" + lineNum + "-call-fullscreen").prop("class","streamSection highlightSection");

    $("#line-" + lineNum + "-btn-restore").hide();
    $("#line-" + lineNum + "-btn-expand").show();

    $("#line-" + lineNum + "-VideoCall").css("background-color", "");

    RedrawStage(lineNum, false);
    if(typeof web_hook_on_restore_video_area !== 'undefined') {
        web_hook_on_restore_video_area(lineNum);
    }
}
var Line = function(lineNumber, displayName, displayNumber, buddyObj){
    this.LineNumber = lineNumber;
    this.DisplayName = displayName;
    this.DisplayNumber = displayNumber;
    this.IsSelected = false;
    this.BuddyObj = buddyObj;
    this.SipSession = null;
    this.LocalSoundMeter = null;
    this.RemoteSoundMeter = null;
}
function ShowDial(){
    $(".mainTab").removeClass("activeTab");
    $("#tab-dialpad").addClass("activeTab");
    RenderMobileTopBar("dialpad");
    $("#contactsTabHeader").hide();

    CloseUpSettings();

    $("#myContacts").hide();
    $("#searchArea").hide();
    $("#leftContent").addClass("dialpadMode");
    $("#actionArea").addClass("dialpadMode");
    $("#myContacts").removeClass("dialpadMode");
    $("#actionArea").empty();

    var html = "";
    html += "<div class=dialScreenMobile>";
    html += BuildDialInputRowHtml(
        "dialText",
        "dialTextInput",
        "",
        "handleDialInput(this, event)",
        "dialOnkeydown(event, this)",
        "dialDeleteKey",
        "roundButtons",
        "",
        "KeyPress('del')",
        "⌫"
    );
    html += BuildDialPadGridHtml("KeyPress('%DIGIT%')", 8);
    html += "<div class=dialActionsRow>";
    html += "<button class=\"dialButtons dialButtonsDial\" id=dialAudio title=\""+ lang.audio_call  +"\" onclick=\"DialByLine('audio')\"><i class=\"fa fa-phone\"></i></button>";
    if(EnableVideoCalling == true){
        html += "<button class=\"dialButtons dialButtonsDial\" id=dialVideo style=\"margin-left:12px\" title=\""+ lang.video_call +"\" onclick=\"DialByLine('video')\"><i class=\"fa fa-video-camera\"></i></button>";
    }
    html += "</div>";
    html += "<div id=dialpad-setting-toggles class=dialpadSettingToggles>";
    html += "<button id=dialpad-toggle-auto class=\"roundButtons dialpadToggleBtn "+ (AutoAnswerEnabled? "toggleOn" : "toggleOff") +"\" title=\""+ lang.auto_answer +"\" onclick=\"ToggleDialpadSetting('auto')\"><i class=\"fa fa-phone\"></i></button>";
    html += "<button id=dialpad-toggle-dnd class=\"roundButtons dialpadToggleBtn "+ (DoNotDisturbEnabled? "toggleOn" : "toggleOff") +"\" title=\""+ lang.do_no_disturb +"\" onclick=\"ToggleDialpadSetting('dnd')\"><i class=\"fa fa-ban\"></i></button>";
    html += "<button id=dialpad-toggle-cw class=\"roundButtons dialpadToggleBtn "+ (CallWaitingEnabled? "toggleOn" : "toggleOff") +"\" title=\""+ lang.call_waiting +"\" onclick=\"ToggleDialpadSetting('cw')\"><i class=\"fa fa-volume-control-phone\"></i></button>";
    if(HideRecordAllCallsButton == false){
        html += "<button id=dialpad-toggle-rec class=\"roundButtons dialpadToggleBtn "+ (RecordAllCalls? "toggleOn" : "toggleOff") +"\" title=\""+ lang.record_all_calls +"\" onclick=\"ToggleDialpadSetting('rec')\"><i class=\"fa fa-dot-circle-o\"></i></button>";
    }
    html += "</div>";
    html += "</div>";
    $("#actionArea").html(html);
    SyncDialDeleteKey();
    $("#actionArea").show();
    $("#dialText").focus();
    UpdateDialpadSettingButtons();
}
function SyncDialDeleteKey(){
    var dialText = $("#dialText");
    var value = dialText.val() || "";
    var hasDigits = value.length > 0;
    $("#dialDeleteKey").toggleClass("hasDigits", hasDigits);
    var fontSize = (value.length > 18) ? "14px" : ((value.length > 14) ? "15px" : "17px");
    dialText.css("font-size", fontSize);
}
function handleDialInput(obj, event){
    if(EnableAlphanumericDial){
        $("#dialText").val($("#dialText").val().replace(/[^\da-zA-Z\*\#\+]/g, "").substring(0,MaxDidLength));
    }
    else {
        $("#dialText").val($("#dialText").val().replace(/[^\d\*\#\+]/g, "").substring(0,MaxDidLength));
    }
    $("#dialVideo").prop('disabled', ($("#dialText").val().length >= DidLength));
    SyncDialDeleteKey();
}
function dialOnkeydown(event, obj, buddy) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13'){
        event.preventDefault();

        if(event.ctrlKey && EnableVideoCalling == true){
            DialByLine('video');
        }
        else {
            DialByLine('audio');
        }

        return false;
    }
}
function KeyPress(num){
    var currVal = $("#dialText").val();
    var textElObj = $("#dialText").get(0);
    var ss = textElObj.selectionStart;
    var se = textElObj.selectionEnd;
    var ln = currVal.length;

    var newValue = "";
    if(ss == se){
        if(num == "del"){
            newValue = currVal.substring(0, ss-1) + currVal.substring(se, ln);
        } else {
            newValue = currVal.substring(0, ss) + num + currVal.substring(se, ln);
        }
        $("#dialText").val(newValue.substring(0,MaxDidLength));
        $("#dialText").focus();
        if(num == "del"){
            textElObj.setSelectionRange(ss-1, ss-1);
        }else {
            textElObj.setSelectionRange(ss+1, ss+1);
        }
    } else {
        if(num == "del"){
            newValue = currVal.substring(0, ss) + currVal.substring(se, ln);
        } else {
            newValue = currVal.substring(0, ss) + num + currVal.substring(se, ln);
        }
        $("#dialText").val(newValue.substring(0,MaxDidLength));
        $("#dialText").focus();
        if(num == "del"){
            textElObj.setSelectionRange(ss, ss);
        }else {
            textElObj.setSelectionRange(ss+1, ss+1);
        }
    }

    $("#dialVideo").prop('disabled', ($("#dialText").val().length >= DidLength));
    SyncDialDeleteKey();
}
function CloseUpSettings(){
    try{
        settingsVideoStreamTrack.stop();
        console.log("settingsVideoStreamTrack... stopped");
    }
    catch(e){}
    try{
        var localVideo = $("#local-video-preview").get(0);
        localVideo.srcObject = null;
    }
    catch{}
    settingsVideoStream = null;
    try{
        settingsMicrophoneStreamTrack.stop();
        console.log("settingsMicrophoneStreamTrack... stopped");
    }
    catch(e){}
    settingsMicrophoneStream = null;
    try{
        settingsMicrophoneSoundMeter.stop();
    }
    catch(e){}
    settingsMicrophoneSoundMeter = null;
    try{
        window.SettingsOutputAudio.pause();
    }
    catch(e){}
    window.SettingsOutputAudio = null;

    try{
        var tracks = window.SettingsOutputStream.getTracks();
        tracks.forEach(function(track) {
            track.stop();
        });
    }
    catch(e){}
    window.SettingsOutputStream = null;

    try{
        var soundMeter = window.SettingsOutputStreamMeter;
        soundMeter.stop();
    }
    catch(e){}
    window.SettingsOutputStreamMeter = null;
    try{
        window.SettingsRingerAudio.pause();
    }
    catch(e){}
    window.SettingsRingerAudio = null;

    try{
        var tracks = window.SettingsRingerStream.getTracks();
        tracks.forEach(function(track) {
            track.stop();
        });
    }
    catch(e){}
    window.SettingsRingerStream = null;

    try{
        var soundMeter = window.SettingsRingerStreamMeter;
        soundMeter.stop();
    }
    catch(e){}
    window.SettingsRingerStreamMeter = null;
}
function ShowContacts(){
    $(".mainTab").removeClass("activeTab");
    $("#tab-contacts").addClass("activeTab");
    RenderMobileTopBar("contacts");

    CloseUpSettings();

    $("#leftContent").removeClass("dialpadMode");
    $("#actionArea").removeClass("dialpadMode");
    $("#myContacts").removeClass("dialpadMode");

    $("#actionArea").hide();
    $("#actionArea").empty();

    $("#contactsTabHeader").hide();
    $("#myContacts").show();
    $("#searchArea").hide();
    $("#txtFindBuddy").val(GetStoredTabSearch("contacts"));
}
function RenderMobileTopBar(tabName){
    var html = "";
    var regLinkHtml = "<button type=button class=mobileTopBtn mobileRegLink data-action=reg title=\"Registration\"><span class=mobileRegStatus><span id=mobileRegDot class=dotOffline></span><span id=mobileRegText>Offline</span></span></button>";
    if(tabName == "dialpad"){
        html += "<div class=mobileTopBarInner>";
        html += "<div class=mobileTopBarTitle>"+ regLinkHtml +"</div>";
        html += "<div class=mobileTopBarActions>";
        if(HideSettingsButton == false) html += "<button type=button class=mobileTopBtn data-action=more><i class=\"fa fa-ellipsis-v\"></i></button>";
        html += "</div></div>";
    }
    else if(tabName == "recents"){
        html += "<div class=mobileTopBarInner>";
        html += "<div class=mobileTopBarTitle>"+ regLinkHtml +"</div>";
        html += "<div class=mobileTopBarActions>";
        html += "<button type=button class=mobileTopBtn data-action=clear-tab data-tab=recents title=\""+ EscapeAttr(lang.delete || "Delete") +"\"><i class=\"fa fa-trash\"></i></button>";
        if(HideSettingsButton == false) html += "<button type=button class=mobileTopBtn data-action=more><i class=\"fa fa-ellipsis-v\"></i></button>";
        html += "</div></div>";
    }
    else {
        html += "<div class=mobileTopBarInner>";
        html += "<div class=mobileTopBarTitle>"+ regLinkHtml +"</div>";
        html += "<div class=mobileTopBarActions>";
        html += "<button type=button class=mobileTopBtn data-action=add-contact title=\""+ lang.add_someone +"\"><i class=\"fa fa-plus\"></i></button>";
        html += "<button type=button class=mobileTopBtn data-action=clear-tab data-tab=contacts title=\""+ EscapeAttr(lang.delete || "Delete") +"\"><i class=\"fa fa-trash\"></i></button>";
        if(HideSettingsButton == false) html += "<button type=button class=mobileTopBtn data-action=more><i class=\"fa fa-ellipsis-v\"></i></button>";
        html += "</div></div>";
    }
    $("#mobileTopBar").html(html);
    SyncMobileRegLink();
}
function HandleMobileClearTab(tabName){
    if(tabName == "recents"){
        var recentMessage = (lang && lang.confirm_delete_recent) ? lang.confirm_delete_recent : "Delete all recent call history?";
        var recentTitle = (lang && lang.delete_recent) ? lang.delete_recent : ((lang && lang.delete) ? lang.delete : "Delete");
        Confirm(recentMessage, recentTitle, function(){ ClearAllRecentHistory(); });
    }
    if(tabName == "contacts"){
        var contactMessage = (lang && lang.confirm_delete_contacts) ? lang.confirm_delete_contacts : "Delete all contacts?";
        var contactTitle = (lang && lang.delete_buddy) ? lang.delete_buddy : ((lang && lang.delete) ? lang.delete : "Delete");
        Confirm(contactMessage, contactTitle, function(){ ClearAllContacts(); });
    }
}
function ShowTab(tabName){
    window.SettingsOverlayActive = false;
    RenderMainTabBar(tabName);
    $("#tabBarRow").show();
    if(tabName == "dialpad"){
        ShowDial();
    } else if(tabName == "recents"){
        ShowRecentsTab();
    } else if(tabName == "contacts"){
        ShowContacts();
    }
    localDB.setItem("ActiveTab", tabName);
}
function RenderMainTabBar(activeTab){
    var safeActiveTab = activeTab || GetActiveMainTab() || "dialpad";
    var html = "";
    html += `<button type=button id=tab-dialpad class=\"mainTab ${safeActiveTab == "dialpad" ? "activeTab" : ""}\" data-label=\"${lang.dialpad}\" onclick=\"ShowTab('dialpad')\"><i class=\"fa fa-th mainTabIcon\"></i></button>`;
    html += `<button type=button id=tab-recents class=\"mainTab ${safeActiveTab == "recents" ? "activeTab" : ""}\" data-label=\"${lang.recents}\" onclick=\"ShowTab('recents')\"><i class=\"fa fa-history mainTabIcon\"></i></button>`;
    html += `<button type=button id=tab-contacts class=\"mainTab ${safeActiveTab == "contacts" ? "activeTab" : ""}\" data-label=\"${lang.contacts}\" onclick=\"ShowTab('contacts')\"><i class=\"fa fa-address-book mainTabIcon\"></i></button>`;
    $("#bottomTabBar").removeClass("configActionBar").html(html);
    ApplyMobileLabels();
}
function RenderConfigActionBar(buttons){
    var bottomBar = $("#bottomTabBar");
    bottomBar.addClass("configActionBar").empty();
    $.each(buttons, function(i, obj){
        var button = $('<button type="button">'+ obj.text +'</button>').click(obj.action);
        button.toggleClass("configPrimaryButton", i === 0);
        button.toggleClass("configSecondaryButton", i !== 0);
        bottomBar.append(button);
    });
}
function ToggleRecentExpanded(row){
    var rowObj = $(row);
    if(rowObj.hasClass("expanded")){
        rowObj.removeClass("expanded");
        rowObj.find(".recentCallExpanded").hide();
        return;
    }

    $(".enterpriseRecentItem.expanded").not(rowObj).removeClass("expanded").find(".recentCallExpanded").hide();
    rowObj.addClass("expanded");
    rowObj.find(".recentCallExpanded").show();
}
function ToggleContactExpanded(row){
    var rowObj = $(row);
    if(rowObj.hasClass("expanded")){
        rowObj.removeClass("expanded");
        rowObj.find(".contactCompactExpanded").hide();
        return;
    }

    $(".enterpriseContactItem.expanded").not(rowObj).removeClass("expanded").find(".contactCompactExpanded").hide();
    rowObj.addClass("expanded");
    rowObj.find(".contactCompactExpanded").show();
}
function GetRecentActionNumber(rowObj){
    var number = rowObj.attr("data-callback-number") || "";
    if(number == "") {
        var ownerBuddyForCall = FindBuddyByIdentity(rowObj.attr("data-owner-identity"));
        number = GetBuddyDialNumber(ownerBuddyForCall);
    }
    return number;
}
function BindContactExpandedActions(){
    $("#myContacts").off("click.contactsCompact", ".enterpriseContactItem");
    $("#myContacts").on("click.contactsCompact", ".enterpriseContactItem", function(){
        ToggleContactExpanded(this);
    });

    $("#myContacts").off("click.contactActionCall", ".contactActionCall");
    $("#myContacts").on("click.contactActionCall", ".contactActionCall", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseContactItem");
        var number = rowObj.attr("data-dial-number") || "";
        if(number != "") DialByLine('audio', rowObj.attr("data-contact-identity"), number);
    });

    $("#myContacts").off("click.contactActionEdit", ".contactActionEdit");
    $("#myContacts").on("click.contactActionEdit", ".contactActionEdit", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseContactItem");
        EditBuddyWindow(rowObj.attr("data-contact-identity"));
    });

    $("#myContacts").off("click.contactActionDelete", ".contactActionDelete");
    $("#myContacts").on("click.contactActionDelete", ".contactActionDelete", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseContactItem");
        RemoveBuddy(rowObj.attr("data-contact-identity"));
    });
}
function GetRecentHistoryEntries(callbackNumber, ownerIdentity){
    var targetNumber = SanitizePhoneSearch(callbackNumber || "");
    var entries = [];
    for(var b = 0; b < Buddies.length; b++){
        var ownerBuddy = Buddies[b];
        if(ownerIdentity && ownerIdentity != "" && ownerBuddy.identity != ownerIdentity && targetNumber == "") continue;
        var stream = JSON.parse(localDB.getItem(ownerBuddy.identity + "-stream"));
        if(stream == null || stream.DataCollection == null) continue;
        $.each(stream.DataCollection, function(i, item){
            if(item == null || item.ItemType != "CDR") return;
            var itemNumber = ResolveRecentCallbackNumber(item, ownerBuddy);
            if(targetNumber != "" && itemNumber != targetNumber) return;
            if(targetNumber == "" && ownerIdentity && ownerBuddy.identity != ownerIdentity) return;
            entries.push({
                cdr: item,
                ownerIdentity: ownerBuddy.identity,
                callbackNumber: itemNumber,
                displayName: GetRecentDisplayLabel(itemNumber, ownerBuddy, FindBuddyByNumber(itemNumber), item, GetRecentDirection(item) == "outbound")
            });
        });
    }
    entries.sort(function(a, b){
        var aMo = moment.utc(a.cdr.ItemDate.replace(" UTC", ""));
        var bMo = moment.utc(b.cdr.ItemDate.replace(" UTC", ""));
        return aMo.isSameOrAfter(bMo, "second") ? -1 : 1;
    });
    return entries;
}
function BuildRecentHistoryList(callbackNumber, ownerIdentity){
    var entries = GetRecentHistoryEntries(callbackNumber, ownerIdentity);
    var html = "<div class=recentHistoryList>";
    if(entries.length == 0){
        html += "<div class=recentHistoryEmpty>"+ EscapeHtml(GetUiText("mobile_no_recents", "No recent calls", null)) +"</div>";
    } else {
        $.each(entries, function(i, entry){
            var item = entry.cdr;
            var recentStatus = GetRecentCallStatus(item);
            var dateTime = moment.utc(item.ItemDate.replace(" UTC", "")).local().format(DisplayDateFormat + " " + DisplayTimeFormat);
            html += "<div class=recentHistoryItem>";
            html += "<span class=\"recentHistoryDirection "+ recentStatus.iconClass +"\"><i class=\"fa "+ GetRecentDirectionIcon(recentStatus.iconClass) +"\"></i></span>";
            html += "<span class=recentHistoryMain>"+ EscapeHtml(entry.displayName || entry.callbackNumber || "") +"</span>";
            html += "<span class=recentHistoryMeta>"+ EscapeHtml(dateTime) +"</span>";
            html += "</div>";
        });
    }
    html += "</div>";
    return html;
}
function ShowRecentHistoryList(rowObj){
    var historyBox = rowObj.find(".recentHistoryList");
    if(historyBox.length > 0){
        historyBox.toggle();
        return;
    }
    rowObj.find(".recentCallExpanded").append(BuildRecentHistoryList(rowObj.attr("data-callback-number"), rowObj.attr("data-owner-identity")));
}
function BindRecentExpandedActions(){
    $("#actionArea").off("click.recents", ".enterpriseRecentItem");
    $("#actionArea").on("click.recents", ".enterpriseRecentItem", function(){
        ToggleRecentExpanded(this);
    });

    $("#actionArea").off("click.recentsCall", ".recentActionCall");
    $("#actionArea").on("click.recentsCall", ".recentActionCall", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseRecentItem");
        var number = GetRecentActionNumber(rowObj);
        if(number != "") DialByLine('audio', '', number);
    });

    $("#actionArea").off("click.recentsAdd", ".recentActionAdd");
    $("#actionArea").on("click.recentsAdd", ".recentActionAdd", function(event){
        event.stopPropagation();
        if($(this).prop("disabled")) return;
        var rowObj = $(this).closest(".enterpriseRecentItem");
        AddContactFromHistory(rowObj.attr("data-owner-identity"), rowObj.attr("data-callback-number"));
    });

    $("#actionArea").off("click.recentsHistory", ".recentActionHistory");
    $("#actionArea").on("click.recentsHistory", ".recentActionHistory", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseRecentItem");
        ShowRecentHistoryList(rowObj);
    });

    $("#actionArea").off("click.recentsDelete", ".recentActionDelete");
    $("#actionArea").on("click.recentsDelete", ".recentActionDelete", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseRecentItem");
        var recentIds = rowObj.attr("data-recent-ids") || "";
        var message = (lang && lang.confirm_delete_recent) ? lang.confirm_delete_recent : "Delete this recent call history?";
        var title = (lang && lang.delete_recent) ? lang.delete_recent : ((lang && lang.delete) ? lang.delete : "Delete");
        Confirm(message, title, function(){
            DeleteRecentGroupFromHistory(recentIds);
        });
    });
}
function ShowRecentsTab(){
    var wasSearching = $("#searchArea").is(":visible");

    $(".mainTab").removeClass("activeTab");
    $("#tab-recents").addClass("activeTab");
    RenderMobileTopBar("recents");

    CloseUpSettings();
    $("#leftContent").removeClass("dialpadMode");
    $("#actionArea").removeClass("dialpadMode");
    $("#myContacts").removeClass("dialpadMode");
    $("#myContacts").hide();
    $("#searchArea").hide();
    $("#contactsTabHeader").hide();
    $("#actionArea").empty();

    if(wasSearching){
        $("#txtFindBuddy").val(GetStoredTabSearch("recents"));
    }

    var searchFilter = wasSearching ? GetStoredTabSearch("recents") : "";
    var allCdrs = SearchRecentsByNumber(searchFilter);

    var html = "";
    if(allCdrs.length == 0){
        html += BuildMobileEmptyState("fa-history", GetUiText("mobile_no_recents", "No recent calls", null));
    } else {
        var lastRecentDayKey = "";
        $.each(allCdrs, function(i, entry){
            var item = entry.cdr;
            var recentStatus = GetRecentCallStatus(item);
            var displayName = entry.displayName || "";
            var callbackNumber = entry.callbackNumber || "";
            var recentDayKey = GetRecentDayKey(item);
            if(recentDayKey != lastRecentDayKey){
                html += "<div class=recentDayDivider>"+ EscapeHtml(GetRecentDayLabel(item)) +"</div>";
                lastRecentDayKey = recentDayKey;
            }
            var DateTime = FormatRecentLogTime(item);
            var recentNumber = callbackNumber || displayName;
            var compactStatusText = recentStatus.statusText;
            if(compactStatusText.length > 12) compactStatusText = compactStatusText.replace(/^Cuộc gọi\s+/i, "").replace(/^Call\s+/i, "");
            var showExpandedNumber = (callbackNumber != "" && displayName != callbackNumber);
            var addDisabled = entry.canAddContact ? "" : " disabled";
            var addTitle = entry.canAddContact ? ((lang && lang.add_contact) ? lang.add_contact : "Add Contact") : displayName;
            var recentIds = encodeURIComponent(JSON.stringify(entry.recentIds || [{ identity: entry.ownerIdentity, cdrId: item.CdrId }]));
            html += "<div class=\"recentCallItem enterpriseRecentItem\" data-owner-identity=\""+ EscapeAttr(entry.ownerIdentity) +"\" data-cdr-id=\""+ EscapeAttr(item.CdrId) +"\" data-callback-number=\""+ EscapeAttr(callbackNumber) +"\" data-recent-ids=\""+ EscapeAttr(recentIds) +"\">";
            html += "<div class=recentCallSummary>";
            html += "<div class=\"recentCallAvatar recentDirectionAvatar "+ recentStatus.iconClass +"\"><i class=\"fa "+ GetRecentDirectionIcon(recentStatus.iconClass) +"\"></i></div>";
            html += "<div class=\"recentCallInfo contactCompactMain\">";
            html += "<div class=\"recentCallName contactCompactName\" style=\"user-select:text\">"+ EscapeHtml(displayName);
            html += "</div>";
            html += "<div class=recentCallSubMeta><span>"+ EscapeHtml(DateTime) +"</span><span class=\"recentStatusPill "+ recentStatus.iconClass +"\" title=\""+ EscapeAttr(recentStatus.statusText) +"\">"+ EscapeHtml(compactStatusText) +"</span></div>";
            html += "</div>";
            html += "<div class=recentExpandChevron><i class=\"fa fa-chevron-down\"></i></div>";
            html += "</div>";
            html += "<div class=recentCallExpanded style=\"display:none\">";
            if(showExpandedNumber) html += "<div class=recentExpandedNumber style=\"user-select:text\"><i class=\"fa fa-phone\"></i> "+ EscapeHtml(recentNumber) +"</div>";
            html += "<div class=recentExpandedActions>";
            html += "<button type=button class=\"roundButtons recentActionCall\" title=\""+ EscapeAttr(lang.call || "Call") +"\"><i class=\"fa fa-phone\"></i></button>";
            html += "<button type=button class=\"roundButtons recentActionAdd\" title=\""+ EscapeAttr(addTitle) +"\""+ addDisabled +"><i class=\"fa fa-user-plus\"></i></button>";
            html += "<button type=button class=\"roundButtons recentActionDelete\" title=\""+ EscapeAttr(lang.delete || "Delete") +"\"><i class=\"fa fa-trash\"></i></button>";
            html += "</div>";
            html += "</div>";
            html += "</div>";
        });
    }
    $("#actionArea").html(html);
    BindRecentExpandedActions();
    SetMobilePaneEmptyState("#actionArea", allCdrs.length == 0);
    $("#actionArea").show();
}
function AddContactFromHistory(identity, callbackNumber){
    var number = SanitizePhoneSearch(callbackNumber || "");
    var callerName = number;

    if(number == ""){
        var buddyObj = FindBuddyByIdentity(identity);
        if(buddyObj == null) return;
        if(buddyObj.ExtNo && buddyObj.ExtNo != "") number = buddyObj.ExtNo;
        else if(buddyObj.ContactNumber1 && buddyObj.ContactNumber1 != "") number = buddyObj.ContactNumber1;
        else if(buddyObj.MobileNumber && buddyObj.MobileNumber != "") number = buddyObj.MobileNumber;
        callerName = buddyObj.CallerIDName || number;
    }

    AddSomeoneWindow(number, callerName);
}
function DeleteRecentGroupFromHistory(recentIds){
    if(!recentIds) return;
    var ids = recentIds;
    if(typeof ids == "string"){
        try{
            ids = JSON.parse(decodeURIComponent(ids));
        }
        catch(e){
            ids = [];
        }
    }
    if(!ids || ids.length == null || ids.length == 0) return;

    var idsByIdentity = {};
    $.each(ids, function(i, item){
        if(!item || !item.identity || !item.cdrId) return;
        if(idsByIdentity[item.identity] == null) idsByIdentity[item.identity] = {};
        idsByIdentity[item.identity][item.cdrId] = true;
    });

    for(var identity in idsByIdentity){
        if(!Object.prototype.hasOwnProperty.call(idsByIdentity, identity)) continue;
        var stream = JSON.parse(localDB.getItem(identity + "-stream"));
        if(stream == null || stream.DataCollection == null) continue;

        var before = stream.DataCollection.length;
        stream.DataCollection = $.grep(stream.DataCollection, function(item){
            if(item.ItemType != "CDR") return true;
            return idsByIdentity[identity][item.CdrId] != true;
        });
        stream.TotalRows = stream.DataCollection.length;
        if(stream.TotalRows != before){
            localDB.setItem(identity + "-stream", JSON.stringify(stream));
        }
    }
    ShowRecentsTab();
}
function ClearAllRecentHistory(){
    for(var k = 0; k < localDB.length; k++){
        var storageKey = localDB.key(k);
        if(!storageKey) continue;
        if(storageKey.length <= 7) continue;
        if(storageKey.substring(storageKey.length - 7) != "-stream") continue;

        var stream = JSON.parse(localDB.getItem(storageKey));
        if(stream == null || stream.DataCollection == null) continue;
        var before = stream.DataCollection.length;
        stream.DataCollection = $.grep(stream.DataCollection, function(item){
            return item.ItemType != "CDR";
        });
        stream.TotalRows = stream.DataCollection.length;
        if(stream.TotalRows != before){
            localDB.setItem(storageKey, JSON.stringify(stream));
        }
    }
    ShowRecentsTab();
}
function ClearAllContacts(){
    var identities = [];
    for(var b = 0; b < Buddies.length; b++){
        var buddyObj = Buddies[b];
        if(buddyObj.type != "contact") continue;
        identities.push(buddyObj.identity);
    }
    $.each(identities, function(i, identity){
        DoRemoveBuddy(identity);
    });
    ShowContacts();
}
function ShowSortAnfFilter(){
    ShowDial();

    $("#contactsTabHeader").hide();
    $("#myContacts").hide();
    $("#searchArea").hide();
$("#actionArea").empty();

var html = "<div style=\"text-align:right\"><button class=roundButtons onclick=\"ShowContacts()\"><i class=\"fa fa-close\"></i></button></div>"
html += "<table cellspacing=10 cellpadding=0 style=\"margin-left:auto; margin-right: auto\">";
html += "<tr><td><div><input disabled type=radio name=sort_by id=sort_by_type><label for=sort_by_type>"+ lang.sort_type +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_cex><label for=sort_by_type_cex>"+ lang.sort_type_cex +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_cxe><label for=sort_by_type_cxe>"+ lang.sort_type_cxe +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_xec><label for=sort_by_type_xec>"+ lang.sort_type_xec +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_xce><label for=sort_by_type_xce>"+ lang.sort_type_xce +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_exc><label for=sort_by_type_exc>"+ lang.sort_type_exc +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_ecx><label for=sort_by_type_ecx>"+ lang.sort_type_ecx +"</label></div>";
html += "</td></tr>";
html += "<tr><td><div><input type=radio name=sort_by id=sort_by_exten><label for=sort_by_exten>"+ lang.sort_exten +"</label></div></td></tr>";
html += "<tr><td><div><input type=radio name=sort_by id=sort_by_alpha><label for=sort_by_alpha>"+ lang.sort_alpha +"</label></div></td></tr>";
html += "<tr><td><div><input type=radio name=sort_by id=sort_by_activity><label for=sort_by_activity>"+ lang.sort_activity +"</label></div></td></tr>";
html += "<tr><td><div><input type=checkbox id=sort_auto_delete_at_end><label for=sort_auto_delete_at_end>"+ lang.sort_auto_delete_at_end +"</label></div></td></tr>";
html += "<tr><td><div><input type=checkbox id=sort_auto_delete_hide><label for=sort_auto_delete_hide>"+ lang.sort_auto_delete_hide +"</label></div></td></tr>";
html += "<tr><td><div><input type=checkbox id=sort_show_exten_num><label for=sort_show_exten_num>"+ lang.sort_show_exten_num +"</label></div></td></tr>";

html += "</table>";
html += "</div>";
$("#actionArea").html(html);

$("#sort_by_type").prop("checked", BuddySortBy=="type");
$("#sort_by_type_cex").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="c|e|x"));
$("#sort_by_type_cxe").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="c|x|e"));
$("#sort_by_type_xec").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="x|e|c"));
$("#sort_by_type_xce").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="x|c|e"));
$("#sort_by_type_exc").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="e|x|c"));
$("#sort_by_type_ecx").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="e|c|x"));
$("#sort_by_exten").prop("checked", BuddySortBy=="extension");
$("#sort_by_alpha").prop("checked", BuddySortBy=="alphabetical");
$("#sort_by_activity").prop("checked", BuddySortBy=="activity");

$("#sort_auto_delete_at_end").prop("checked", BuddyAutoDeleteAtEnd==true);
$("#sort_auto_delete_hide").prop("checked", HideAutoDeleteBuddies==true);
$("#sort_show_exten_num").prop("checked", BuddyShowExtenNum==true);

$("#sort_by_type_cex").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "c|e|x"
    localDB.setItem("SortByTypeOrder", "c|e|x");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});
$("#sort_by_type_cxe").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "c|x|e"
    localDB.setItem("SortByTypeOrder", "c|x|e");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});
$("#sort_by_type_xec").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "x|e|c"
    localDB.setItem("SortByTypeOrder", "x|e|c");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});
$("#sort_by_type_xce").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "x|e|c"
    localDB.setItem("SortByTypeOrder", "x|c|e");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});
$("#sort_by_type_exc").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "e|x|c"
    localDB.setItem("SortByTypeOrder", "e|x|c");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});
$("#sort_by_type_ecx").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "e|c|x"
    localDB.setItem("SortByTypeOrder", "e|c|x");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});


$("#sort_by_exten").change(function(){
    BuddySortBy = "extension";
    localDB.setItem("BuddySortBy", "extension");
    $("#sort_by_type_cex").prop("checked", false);
    $("#sort_by_type_cxe").prop("checked", false);
    $("#sort_by_type_xec").prop("checked", false);
    $("#sort_by_type_xce").prop("checked", false);
    $("#sort_by_type_exc").prop("checked", false);
    $("#sort_by_type_ecx").prop("checked", false);

    UpdateBuddyList();
});
$("#sort_by_alpha").change(function(){
    BuddySortBy = "alphabetical";
    localDB.setItem("BuddySortBy", "alphabetical");
    $("#sort_by_type_cex").prop("checked", false);
    $("#sort_by_type_cxe").prop("checked", false);
    $("#sort_by_type_xec").prop("checked", false);
    $("#sort_by_type_xce").prop("checked", false);
    $("#sort_by_type_exc").prop("checked", false);
    $("#sort_by_type_ecx").prop("checked", false);
    UpdateBuddyList();
});
$("#sort_by_activity").change(function(){
    BuddySortBy = "activity";
    localDB.setItem("BuddySortBy", "activity");
    $("#sort_by_type_cex").prop("checked", false);
    $("#sort_by_type_cxe").prop("checked", false);
    $("#sort_by_type_xec").prop("checked", false);
    $("#sort_by_type_xce").prop("checked", false);
    $("#sort_by_type_exc").prop("checked", false);
    $("#sort_by_type_ecx").prop("checked", false);

    UpdateBuddyList();
});

$("#sort_auto_delete_at_end").change(function(){
    BuddyAutoDeleteAtEnd = this.checked;
    localDB.setItem("BuddyAutoDeleteAtEnd", (this.checked)? "1" : "0");

    if(this.checked){
        $("#sort_auto_delete_hide").prop("checked", false);
        HideAutoDeleteBuddies = false;
        localDB.setItem("HideAutoDeleteBuddies", "0");
    }

    UpdateBuddyList();
});
$("#sort_auto_delete_hide").change(function(){
    HideAutoDeleteBuddies = this.checked;
    localDB.setItem("HideAutoDeleteBuddies", (this.checked)? "1" : "0");

    if(this.checked){
        $("#sort_auto_delete_at_end").prop("checked", false);
        BuddyAutoDeleteAtEnd = false;
        localDB.setItem("BuddyAutoDeleteAtEnd", "0");
    }

    UpdateBuddyList();
});
$("#sort_show_exten_num").change(function(){
    BuddyShowExtenNum = this.checked;
    localDB.setItem("BuddyShowExtenNum", (this.checked)? "1" : "0");

    UpdateBuddyList();
});

$("#actionArea").show();
}
function DialByLine(type, buddy, numToDial, CallerID, extraHeaders){
    if(userAgent == null || userAgent.isRegistered() == false){
        ShowMyProfile();
        return;
    }

    var numDial = (numToDial)? numToDial : $("#dialText").val();
    if(EnableAlphanumericDial){
        numDial = numDial.replace(telAlphanumericRegEx, "").substring(0,MaxDidLength);
    }
    else {
        numDial = numDial.replace(telNumericRegEx, "").substring(0,MaxDidLength);
    }
    if(numDial.length == 0) {
        console.warn("Enter number to dial");
        return;
    }
    var returnTab = GetActiveMainTab();
    if(returnTab != "contacts" && returnTab != "recents" && returnTab != "dialpad") returnTab = "dialpad";
    window.ReturnToDialpadAfterCall = true;
    window.ReturnAfterCallTab = returnTab;
    localDB.setItem("ActiveTab", returnTab);
    var buddyObj = (buddy)? FindBuddyByIdentity(buddy) : FindBuddyByDid(numDial);
    if(buddyObj == null) {
        var tempId = "tmp-" + uID();
        var tempName = (CallerID)? CallerID : numDial;
        buddyObj = new Buddy("contact", tempId, tempName, "", "", numDial, "", utcDateNow(), "", "", null, false, false, null, true, false);
    }
    newLineNumber = newLineNumber + 1;
    var lineObj = new Line(newLineNumber, buddyObj.CallerIDName, numDial, buddyObj);
    lineObj.ReturnToTab = returnTab;
    Lines.push(lineObj);
    AddLineHtml(lineObj, "outbound");
    RefreshLineDisplay(lineObj);
    SelectLine(newLineNumber);
    UpdateBuddyList();
    if(type == "audio"){
        AudioCall(lineObj, numDial, extraHeaders);
    }
    else {
        VideoCall(lineObj, numDial, extraHeaders);
    }

    try{
        $("#line-" + newLineNumber).get(0).scrollIntoViewIfNeeded();
    } catch(e){}
}
function SelectLine(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null) return;

    for(var l = 0; l < Lines.length; l++) {
        if(Lines[l].IsSelected == true && Lines[l].LineNumber == lineObj.LineNumber){
            return;
        }
    }

    console.log("Selecting Line : "+ lineObj.LineNumber);
    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });
    $("#line-ui-" + lineObj.LineNumber).prop('class', 'streamSelected');
    SwitchLines(lineObj.LineNumber);
    for(var l = 0; l < Lines.length; l++) {
        var classStr = (Lines[l].LineNumber == lineObj.LineNumber)? "buddySelected" : "buddy";
        if(Lines[l].SipSession != null) classStr = (Lines[l].SipSession.isOnHold)? "buddyActiveCallHollding" : "buddyActiveCall";

        $("#line-" + Lines[l].LineNumber).prop('class', classStr);
        Lines[l].IsSelected = (Lines[l].LineNumber == lineObj.LineNumber);
    }
    for(var b = 0; b < Buddies.length; b++) {
        $("#contact-" + Buddies[b].identity).prop("class", "buddy");
        Buddies[b].IsSelected = false;
    }
    UpdateUI();
}
function FindLineByNumber(lineNum) {
    for(var l = 0; l < Lines.length; l++) {
        if(Lines[l].LineNumber == lineNum) return Lines[l];
    }
    return null;
}
function AddLineHtml(lineObj, direction){
    var callPicture = getPicture((lineObj.BuddyObj && lineObj.BuddyObj.identity) ? lineObj.BuddyObj.identity : null);
    var html = "<table id=\"line-ui-"+ lineObj.LineNumber +"\" class=stream cellspacing=0 cellpadding=0>";
    html += "<tr><td class=\"streamSection highlightSection\" style=\"height: 85px;\">";
    html += "<div class=contact style=\"cursor: unset; float: left;\">";
    html += "<div class=contactNameText><i class=\"fa fa-phone\"></i> "+ GetSelfExtensionLabel() +"</div>";
    html += "</div>";
    html += "<div style=\"float:right; line-height: 46px;\">";
    html += "<div  id=\"line-"+ lineObj.LineNumber +"-monitoring\" style=\"margin-right:10px\">";
    html += "<span style=\"vertical-align: middle\"><i class=\"fa fa-microphone\"></i></span> ";
    html += "<span class=meterContainer title=\""+ lang.microphone_levels +"\">";
    html += "<span id=\"line-"+ lineObj.LineNumber +"-Mic\" class=meterLevel style=\"height:0%\"></span>";
    html += "</span> ";
    html += "<span style=\"vertical-align: middle\"><i class=\"fa fa-volume-up\"></i></span> ";
    html += "<span class=meterContainer title=\""+ lang.speaker_levels +"\">";
    html += "<span id=\"line-"+ lineObj.LineNumber +"-Speaker\" class=meterLevel style=\"height:0%\"></span>";
    html += "</span> ";
    html += "</div>";

    html += "</div>";
    html += "<div style=\"clear:both; height:0px\"></div>"
    html += "<div id=\"line-"+ lineObj.LineNumber +"-timer\" class=CallTimer></div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-msg\" class=callStatus style=\"display:none\">...</div>";
    html += "<div style=\"display:none;\">";
    html += "<audio id=\"line-"+ lineObj.LineNumber +"-remoteAudio\"></audio>";
    html += "</div>";

    html += "</td></tr>";
    html += "<tr><td id=\"line-"+ lineObj.LineNumber +"-call-fullscreen\" class=\"streamSection highlightSection\">"
    html += "<div id=\"line-"+ lineObj.LineNumber +"-AnswerCall\" style=\"display:none\">";
    html += "<div class=\"CallPictureUnderlay\" style=\"background-image: url('"+ callPicture +"')\"></div>";
    html += "<div class=\"CallColorUnderlay\"></div>";
    html += "<div class=\"CallUi\">";
    html += "<div class=callingDisplayName>"+ lineObj.DisplayName +"</div>";
    html += "<div class=callingDisplayNumber>"+ lineObj.DisplayNumber +"</div>";
    html += "<div class=\"answerCall incomingCallActions\">";
    html += "<button onclick=\"AnswerAudioCall('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons incomingCallDialButton incomingCallAnswerButton\" title=\""+ lang.answer_call +"\"><i class=\"fa fa-phone\"></i></button> ";
    if(EnableVideoCalling == true) {
        html += " <button id=\"line-"+ lineObj.LineNumber +"-answer-video\" onclick=\"AnswerVideoCall('"+ lineObj.LineNumber +"')\" class=answerButton><i class=\"fa fa-video-camera\"></i> "+ lang.answer_call_with_video +"</button> ";
    }
    html += " <button onclick=\"RejectCall('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons incomingCallDialButton incomingCallRejectButton\" title=\""+ lang.reject_call +"\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i></button> ";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-answer-crm-space\">"
    html += "</div>";
    html += "</div>";

    html += "</div>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-progress\" style=\"display:none\">";
    html += "<div class=\"CallPictureUnderlay\" style=\"background-image: url('"+ callPicture +"')\"></div>";
    html += "<div class=\"CallColorUnderlay\"></div>";
    html += "<div class=\"CallUi\">";
    html += "<div class=callingDisplayName>"+ lineObj.DisplayName +"</div>";
    html += "<div class=callingDisplayNumber>"+ lineObj.DisplayNumber +"</div>";
    html += "<div class=progressCall>"
    html += "<button onclick=\"cancelSession('"+ lineObj.LineNumber +"')\" class=rejectButton><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i> "+ lang.cancel +"</button>"
    html += " <button id=\"line-"+ lineObj.LineNumber +"-early-dtmf\" onclick=\"ShowNumpad('"+ lineObj.LineNumber +"')\" style=\"display:none\"><i class=\"fa fa-keyboard-o\"></i> "+ lang.send_dtmf +"</button>"
    html += "</div>";
    html += "</div>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-ActiveCall\" class=cleanScroller style=\"display:none; position: absolute; top: 0px; left: 0px; height: 100%; width: 100%;\">";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-AudioOrVideoCall\" style=\"height:100%\">";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-AudioCall\" style=\"height:100%; display:none\">";
    html += "<div class=\"CallPictureUnderlay\" style=\"background-image: url('"+ callPicture +"')\"></div>";
    html += "<div class=\"CallColorUnderlay\"></div>";
    var audioCallUiClass = (EnableVideoCalling == true) ? "CallUi" : "CallUi CallUiAudioOnly";
    html += "<div class=\""+ audioCallUiClass +"\">";
    html += "<div class=callingDisplayName>"+ lineObj.DisplayName +"</div>";
    html += "<div class=callingDisplayNumber>"+ lineObj.DisplayNumber +"</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-Transfer\" class=\"transferPopupPanel\" style=\"display:none\">";
    html += "<div class=transferPopupCard>";
    html += "<div class=transferPopupTitle><i class=\"fa fa-reply\" style=\"transform: rotateY(180deg)\"></i><span>"+ lang.transfer_call +"</span></div>";
    html += "<span class=\"searchClean transferSearch\"><input id=\"line-"+ lineObj.LineNumber +"-txt-FindTransferBuddy\" oninput=\"QuickFindBuddy(this,'"+ lineObj.LineNumber +"')\" onkeydown=\"transferOnkeydown(event, this, '"+ lineObj.LineNumber +"')\" type=text autocomplete=none autocomplete=none placeholder=\""+ lang.search_or_enter_number +"\"></span>";
    html += "<div class=transferButtonRow>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-blind-transfer\" class=\"transferActionButton\" onclick=\"BlindTransfer('"+ lineObj.LineNumber +"')\"><i class=\"fa fa-reply\" style=\"transform: rotateY(180deg)\"></i><span>"+ lang.blind_transfer +"</span></button>"
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-attended-transfer\" class=\"transferActionButton\" onclick=\"AttendedTransfer('"+ lineObj.LineNumber +"')\"><i class=\"fa fa-reply-all\" style=\"transform: rotateY(180deg)\"></i><span>"+ lang.attended_transfer +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-complete-attended-transfer\" class=\"transferActionButton\" style=\"display:none\"><i class=\"fa fa-reply-all\" style=\"transform: rotateY(180deg)\"></i><span>"+ lang.complete_transfer +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-cancel-attended-transfer\" class=\"transferActionButton transferCancelButton\" style=\"display:none\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i><span>"+ lang.cancel_transfer +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-terminate-attended-transfer\" class=\"transferActionButton transferCancelButton\" style=\"display:none\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i><span>"+ lang.end_transfer_call +"</span></button>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-transfer-status\" class=callStatus style=\"margin-top:10px; display:none\">...</div>";
    html += "</div>";
    html += "<audio id=\"line-"+ lineObj.LineNumber +"-transfer-remoteAudio\" style=\"display:none\"></audio>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-Conference\" class=\"transferPopupPanel conferencePopupPanel\" style=\"display:none\">";
    html += "<div class=\"transferPopupCard conferencePopupCard\">";
    html += "<div class=transferPopupTitle><i class=\"fa fa-users\"></i><span>"+ lang.conference_call +"</span></div>";
    html += "<span class=\"searchClean transferSearch\"><input id=\"line-"+ lineObj.LineNumber +"-txt-FindConferenceBuddy\" oninput=\"QuickFindBuddy(this,'"+ lineObj.LineNumber +"')\" onkeydown=\"conferenceOnkeydown(event, this, '"+ lineObj.LineNumber +"')\" type=text autocomplete=none placeholder=\""+ lang.search_or_enter_number +"\"></span>";
    html += "<div class=transferButtonRow>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-conference-dial\" class=\"transferActionButton\" onclick=\"ConferenceDial('"+ lineObj.LineNumber +"')\"><i class=\"fa fa-phone\"></i><span>"+ lang.call +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-cancel-conference-dial\" class=\"transferActionButton transferCancelButton\" style=\"display:none\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i><span>"+ lang.cancel_call +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-join-conference-call\" class=\"transferActionButton\" style=\"display:none\"><i class=\"fa fa-users\"></i><span>"+ lang.join_conference_call +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-terminate-conference-call\" class=\"transferActionButton transferCancelButton\" style=\"display:none\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i><span>"+ lang.end_conference_call +"</span></button>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-conference-status\" class=callStatus style=\"margin-top:10px; display:none\">...</div>";
    html += "</div>";
    html += "<audio id=\"line-"+ lineObj.LineNumber +"-conference-remoteAudio\" style=\"display:none\"></audio>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-active-audio-call-crm-space\">"
    html += "</div>";

    html += "</div>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-VideoCall\" style=\"height:100%; display:none\">";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-preview-container\" class=\"PreviewContainer cleanScroller\">";
    html += "<video id=\"line-"+ lineObj.LineNumber +"-localVideo\" muted playsinline></video>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-stage-container\" class=StageContainer>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-remote-videos\" class=VideosContainer></div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-scratchpad-container\" class=ScratchpadContainer style=\"display:none\"></div>";
    html += "<video id=\"line-"+ lineObj.LineNumber +"-sharevideo\" controls muted playsinline style=\"display:none; object-fit: contain; width: 100%;\"></video>";
    html += "</div>";
    html += "</div>";
    html += "</div>";
    html += "<div class=CallControlContainer>";
    html += "<div class=CallControl>";
    html += "<div class=CallControlRowPrimary>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Mute\" onclick=\"MuteSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.mute +"\"><i class=\"fa fa-microphone-slash\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Unmute\" onclick=\"UnmuteSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.unmute +"\" style=\"color: red; display:none\"><i class=\"fa fa-microphone\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Hold\" onclick=\"holdSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\"  title=\""+ lang.hold_call +"\"><i class=\"fa fa-pause-circle\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Unhold\" onclick=\"unholdSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.resume_call +"\" style=\"color: red; display:none\"><i class=\"fa fa-play-circle\"></i></button>";
    if(EnableTransfer){
        html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Transfer\" onclick=\"StartTransferSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.transfer_call +"\"><i class=\"fa fa-reply\" style=\"transform: rotateY(180deg)\"></i></button>";
        html += "<button id=\"line-"+ lineObj.LineNumber+"-btn-CancelTransfer\" onclick=\"CancelTransferSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.cancel_transfer +"\" style=\"color: red; display:none\"><i class=\"fa fa-reply\" style=\"transform: rotateY(180deg)\"></i></button>";
    }
    html += "</div>";
    html += "<div class=CallControlRowSecondary id=\"line-"+ lineObj.LineNumber +"-btn-more\" style=\"display:block\">";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-ShowNumpad\" onclick=\"ShowNumpad('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.send_dtmf +"\"><i class=\"fa fa-keyboard-o\"></i></button>";
    if(EnableConference){
        html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Conference\" onclick=\"StartConferenceCall('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.conference_call +"\"><i class=\"fa fa-users\"></i></button>";
        html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-CancelConference\" onclick=\"CancelConference('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.cancel_conference +"\" style=\"color: red; display:none\"><i class=\"fa fa-users\"></i></button>";
    }
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-settings\" onclick=\"ChangeSettings('"+ lineObj.LineNumber +"', this)\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.device_settings +"\"><i class=\"fa fa-volume-up\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-present-src\" onclick=\"ShowPresentMenu(this, '"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.camera +"\"><i class=\"fa fa-video-camera\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-expand\" onclick=\"ExpandVideoArea('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\"><i class=\"fa fa-expand\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-restore\" onclick=\"RestoreVideoArea('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" style=\"display:none\"><i class=\"fa fa-compress\"></i></button>";

    html += "</div>";
    html += "<div class=CallControlRowHangup>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-End\" onclick=\"endSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons hangupButton\" title=\""+ lang.end_call +"\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i></button>";
    html += "</div>";
    html += "</div>";
    html += "</div>";

    html += "</div>";


    html += "</td></tr>";
    html += "</table>";

    $("#rightContent").append(html);

    $("#line-"+ lineObj.LineNumber +"-AudioOrVideoCall").on("click", function(){
        RestoreCallControls(lineObj.LineNumber);
    });
    $("#line-"+ lineObj.LineNumber +"-AudioCall").on("click", function(event){
        var target = $(event.target);
        var transferSel = "#line-" + lineObj.LineNumber + "-Transfer";
        var conferenceSel = "#line-" + lineObj.LineNumber + "-Conference";
        var transferVisible = $(transferSel).is(":visible");
        var conferenceVisible = $(conferenceSel).is(":visible");
        if(!transferVisible && !conferenceVisible) return;

        var ignore = transferSel + ", " + conferenceSel + ", .popupMenuList, .ui-menu";
        if(target.closest(ignore).length > 0) return;

        if(transferVisible) CancelTransferSession(lineObj.LineNumber);
        if(conferenceVisible) CancelConference(lineObj.LineNumber);
        HidePopup();
    });
}
function RemoveLine(lineObj){
    if(lineObj == null) return;

    var earlyReject = lineObj.SipSession.data.earlyReject;
    for(var l = 0; l < Lines.length; l++) {
        if(Lines[l].LineNumber == lineObj.LineNumber) {
            Lines.splice(l,1);
            break;
        }
    }

    if(earlyReject != true){
        CloseLine(lineObj.LineNumber);
        $("#line-ui-"+ lineObj.LineNumber).remove();
    }

    UpdateBuddyList();

    if(earlyReject != true){
        localDB.setItem("SelectedBuddy", null);
        UpdateUI();
    }
}
function CloseLine(lineNum){
    $(".buddySelected").each(function () {
        $(this).prop('class', 'buddy');
    });
    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });

    console.log("Closing Line: "+ lineNum);
    for(var l = 0; l < Lines.length; l++){
        Lines[l].IsSelected = false;
    }
    selectedLine = null;
    for(var b = 0; b < Buddies.length; b++){
        Buddies[b].IsSelected = false;
    }
    selectedBuddy = null;
    UpdateUI();
}
function SwitchLines(lineNum){
    $.each(userAgent.sessions, function (i, session) {
        if(session.state == SIP.SessionState.Established){
            if(session.isOnHold == false && session.data.line != lineNum) {
                holdSession(session.data.line);
            }
        }
        session.data.IsCurrentCall = false;
    });

    var lineObj = FindLineByNumber(lineNum);
    if(lineObj != null && lineObj.SipSession != null) {
        var session = lineObj.SipSession;
        if(session.state == SIP.SessionState.Established){
            if(session.isOnHold == true) {
                unholdSession(lineNum)
            }
        }
        session.data.IsCurrentCall = true;
    }
    selectedLine = lineNum;
}
function RefreshLineActivity(lineNum){
    return;
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) {
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-CallDetails").empty();

    var callDetails = [];

    var ringTime = 0;
    var CallStart = moment.utc(session.data.callstart.replace(" UTC", ""));
    var CallAnswer = null;
    if(session.data.startTime){
        CallAnswer = moment.utc(session.data.startTime);
        ringTime = moment.duration(CallAnswer.diff(CallStart));
    }
    CallStart = CallStart.format("YYYY-MM-DD HH:mm:ss UTC")
    CallAnswer = (CallAnswer)? CallAnswer.format("YYYY-MM-DD HH:mm:ss UTC") : null,
    ringTime = (ringTime != 0)? ringTime.asSeconds() : 0

    var srcCallerID = "";
    var dstCallerID = "";
    if(session.data.calldirection == "inbound") {
        srcCallerID = "<"+ session.remoteIdentity.uri.user +"> "+ session.remoteIdentity.displayName;
    }
    else if(session.data.calldirection == "outbound") {
        dstCallerID = session.data.dst;
    }

    var withVideo = (session.data.withvideo)? "("+ lang.with_video +")" : "";
    var startCallMessage = (session.data.calldirection == "inbound")? lang.you_received_a_call_from + " " + srcCallerID  +" "+ withVideo : lang.you_made_a_call_to + " " + dstCallerID +" "+ withVideo;
    callDetails.push({
        Message: startCallMessage,
        TimeStr : CallStart
    });
    if(CallAnswer){
        var answerCallMessage = (session.data.calldirection == "inbound")? lang.you_answered_after + " " + ringTime + " " + lang.seconds_plural : lang.they_answered_after + " " + ringTime + " " + lang.seconds_plural;
        callDetails.push({
            Message: answerCallMessage,
            TimeStr : CallAnswer
        });
    }

    var Transfers = (session.data.transfer)? session.data.transfer : [];
    $.each(Transfers, function(item, transfer){
        var msg = (transfer.type == "Blind")? lang.you_started_a_blind_transfer_to +" "+ transfer.to +". " : lang.you_started_an_attended_transfer_to + " "+ transfer.to +". ";
        if(transfer.accept && transfer.accept.complete == true){
            msg += lang.the_call_was_completed
        }
        else if(transfer.accept.disposition != "") {
            msg += lang.the_call_was_not_completed +" ("+ transfer.accept.disposition +")"
        }
        callDetails.push({
            Message : msg,
            TimeStr : transfer.transferTime
        });
    });
    var Mutes = (session.data.mute)? session.data.mute : []
    $.each(Mutes, function(item, mute){
        callDetails.push({
            Message : (mute.event == "mute")? lang.you_put_the_call_on_mute : lang.you_took_the_call_off_mute,
            TimeStr : mute.eventTime
        });
    });
    var Holds = (session.data.hold)? session.data.hold : []
    $.each(Holds, function(item, hold){
        callDetails.push({
            Message : (hold.event == "hold")? lang.you_put_the_call_on_hold : lang.you_took_the_call_off_hold,
            TimeStr : hold.eventTime
        });
    });
    var ConfbridgeEvents = (session.data.ConfbridgeEvents)? session.data.ConfbridgeEvents : []
    $.each(ConfbridgeEvents, function(item, event){
        callDetails.push({
            Message : event.event,
            TimeStr : event.eventTime
        });
    });
    var Recordings = (session.data.recordings)? session.data.recordings : []
    $.each(Recordings, function(item, recording){
        var msg = lang.call_is_being_recorded;
        if(recording.startTime != recording.stopTime){
            msg += "("+ lang.now_stopped +")"
        }
        callDetails.push({
            Message : msg,
            TimeStr : recording.startTime
        });
    });
    var ConfCalls = (session.data.confcalls)? session.data.confcalls : []
    $.each(ConfCalls, function(item, confCall){
        var msg = lang.you_started_a_conference_call_to +" "+ confCall.to +". ";
        if(confCall.accept && confCall.accept.complete == true){
            msg += lang.the_call_was_completed
        }
        else if(confCall.accept.disposition != "") {
            msg += lang.the_call_was_not_completed +" ("+ confCall.accept.disposition +")"
        }
        callDetails.push({
            Message : msg,
            TimeStr : confCall.startTime
        });
    });

    callDetails.sort(function(a, b){
        var aMo = moment.utc(a.TimeStr.replace(" UTC", ""));
        var bMo = moment.utc(b.TimeStr.replace(" UTC", ""));
        if (aMo.isSameOrAfter(bMo, "second")) {
            return -1;
        } else return 1;
        return 0;
    });

    $.each(callDetails, function(item, detail){
        var Time = moment.utc(detail.TimeStr.replace(" UTC", "")).local().format(DisplayTimeFormat);
        var messageString = "<table class=timelineMessage cellspacing=0 cellpadding=0><tr>"
        messageString += "<td class=timelineMessageArea>"
        messageString += "<div class=timelineMessageDate><i class=\"fa fa-circle timelineMessageDot\"></i>"+ Time +"</div>"
        messageString += "<div class=timelineMessageText>"+ detail.Message +"</div>"
        messageString += "</td>"
        messageString += "</tr></table>";
        $("#line-"+ lineNum +"-CallDetails").prepend(messageString);
    });
}
var Buddy = function(type, identity, CallerIDName, ExtNo, MobileNumber, ContactNumber1, ContactNumber2, lastActivity, desc, Email, jid, dnd, subscribe, subscription, autoDelete, pinned){
    this.type = type;
    this.identity = identity;
    this.jid = jid;
    this.CallerIDName = (CallerIDName)? CallerIDName : "";
    this.Email = (Email)? Email : "" ;
    this.Desc = (desc)? desc : "" ;
    this.ExtNo = ExtNo;
    this.MobileNumber = MobileNumber;
    this.ContactNumber1 = ContactNumber1;
    this.ContactNumber2 = ContactNumber2;
    this.lastActivity = lastActivity;
    this.devState = "dotOffline";
    this.presence = "Unknown";
    this.missed = 0;
    this.IsSelected = false;
    this.imageObjectURL = "";
    this.presenceText = lang.default_status;
    this.EnableDuringDnd = dnd;
    this.EnableSubscribe = subscribe;
    this.SubscribeUser = (subscription)? subscription : ExtNo;
    this.AllowAutoDelete = (typeof autoDelete !== 'undefined')? autoDelete : AutoDeleteDefault;
    this.Pinned = (typeof pinned !== 'undefined')? pinned : false;
}
function InitUserBuddies(){
    var template = { TotalRows:0, DataCollection:[] }
    localDB.setItem(profileUserID + "-Buddies", JSON.stringify(template));
    return JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
}
function MakeBuddy(type, update, focus, subscribe, callerID, did, jid, AllowDuringDnd, subscribeUser, autoDelete, addToXmppRoster){
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json == null) json = InitUserBuddies();

    var dateNow = utcDateNow();
    var buddyObj = null;
    var id = uID();

    if(type == "extension") {
        json.DataCollection.push({
            Type: "extension",
            LastActivity: dateNow,
            ExtensionNumber: did,
            MobileNumber: "",
            ContactNumber1: "",
            ContactNumber2: "",
            uID: id,
            cID: null,
            gID: null,
            jid: null,
            DisplayName: callerID,
            Description: "",
            Email: "",
            MemberCount: 0,
            EnableDuringDnd: AllowDuringDnd,
            Subscribe: subscribe,
            SubscribeUser: subscribeUser,
            AutoDelete: autoDelete
        });
        buddyObj = new Buddy("extension", id, callerID, did, "", "", "", dateNow, "", "", null, AllowDuringDnd, subscribe, subscribeUser, autoDelete);
        AddBuddy(buddyObj, update, focus, subscribe, true);
    }
    if(type == "contact"){
        json.DataCollection.push({
            Type: "contact",
            LastActivity: dateNow,
            ExtensionNumber: "",
            MobileNumber: "",
            ContactNumber1: did,
            ContactNumber2: "",
            uID: null,
            cID: id,
            gID: null,
            jid: null,
            DisplayName: callerID,
            Description: "",
            Email: "",
            MemberCount: 0,
            EnableDuringDnd: AllowDuringDnd,
            Subscribe: false,
            SubscribeUser: null,
            AutoDelete: autoDelete
        });
        buddyObj = new Buddy("contact", id, callerID, "", "", did, "", dateNow, "", "", null, AllowDuringDnd, false, null, autoDelete);
        AddBuddy(buddyObj, update, focus, false, true);
    }
    if(type == "group") {
        json.DataCollection.push({
            Type: "group",
            LastActivity: dateNow,
            ExtensionNumber: did,
            MobileNumber: "",
            ContactNumber1: "",
            ContactNumber2: "",
            uID: null,
            cID: null,
            gID: id,
            jid: null,
            DisplayName: callerID,
            Description: "",
            Email: "",
            MemberCount: 0,
            EnableDuringDnd: false,
            Subscribe: false,
            SubscribeUser: null,
            AutoDelete: autoDelete
        });
        buddyObj = new Buddy("group", id, callerID, did, "", "", "", dateNow, "", "", null, false, false, null, autoDelete);
        AddBuddy(buddyObj, update, focus, false, true);
    }
    json.TotalRows = json.DataCollection.length;
    localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    return buddyObj;
}
function UpdateBuddyCallerID(buddyObj, callerID){
    buddyObj.CallerIDName = callerID;

    var buddy = buddyObj.identity;
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null){
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.DisplayName = callerID;
                return false;
            }
        });
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }

    UpdateBuddyList();
}
function AddBuddy(buddyObj, update, focus, subscribe, cleanup){
    Buddies.push(buddyObj);
    if(update == true) UpdateBuddyList();
    AddBuddyMessageStream(buddyObj);
    if(subscribe == true) SubscribeBuddy(buddyObj);
    if(focus == true && IsCallFirstContactMode() == false) SelectBuddy(buddyObj.identity);
    if(cleanup == true) CleanupBuddies()
}
function CleanupBuddies(){
    if(MaxBuddyAge > 1 || MaxBuddies > 1){
        Buddies.sort(function(a, b){
            var aMo = moment.utc(a.lastActivity.replace(" UTC", ""));
            var bMo = moment.utc(b.lastActivity.replace(" UTC", ""));
            if (aMo.isSameOrAfter(bMo, "second")) {
                return -1;
            } else return 1;
            return 0;
        });

        if(MaxBuddyAge > 1){
            var expiredDate = moment.utc().subtract(MaxBuddyAge, 'days');
            console.log("Running Buddy Cleanup for activity older than: ", expiredDate.format(DisplayDateFormat+" "+DisplayTimeFormat));
            for (var b = Buddies.length - 1; b >= 0; b--) {
                var lastActivity = moment.utc(Buddies[b].lastActivity.replace(" UTC", ""));
                if(lastActivity.isSameOrAfter(expiredDate, "second")){
                } else {
                    if(Buddies[b].AllowAutoDelete == true){
                        console.warn("This buddy is too old, and will be deleted: ", lastActivity.format(DisplayDateFormat+" "+DisplayTimeFormat));
                        DoRemoveBuddy(Buddies[b].identity);
                    }
                }
            }
        }
        if(MaxBuddies > 1 && MaxBuddies < Buddies.length){
            console.log("Running Buddy Cleanup for buddies more than: ", MaxBuddies);
            for (var b = Buddies.length - 1; b >= MaxBuddies; b--) {
                if(Buddies[b].AllowAutoDelete == true){
                    console.warn("This buddy is too Many, and will be deleted: ", Buddies[b].identity);
                    DoRemoveBuddy(Buddies[b].identity);
                }
            }
        }
    }
}
function PopulateBuddyList() {
    console.log("Clearing Buddies...");
    Buddies = new Array();
    console.log("Adding Buddies...");
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json == null) json = InitUserBuddies();

    console.log("Total Buddies: " + json.TotalRows);
    $.each(json.DataCollection, function (i, item) {
        item.AutoDelete = (item.AutoDelete == true)? true : false;
        item.Pinned = (item.Pinned == true)? true : false;
        if(item.Type == "extension"){
            var buddy = new Buddy("extension",
                                    item.uID,
                                    item.DisplayName,
                                    item.ExtensionNumber,
                                    item.MobileNumber,
                                    item.ContactNumber1,
                                    item.ContactNumber2,
                                    item.LastActivity,
                                    item.Description,
                                    item.Email,
                                    null,
                                    item.EnableDuringDnd,
                                    item.Subscribe,
                                    item.SubscribeUser,
                                    item.AutoDelete,
                                    item.Pinned);
            AddBuddy(buddy, false, false, false);
        }
        else if(item.Type == "xmpp"){
            var buddy = new Buddy("xmpp",
                                    item.uID,
                                    item.DisplayName,
                                    item.ExtensionNumber,
                                    "",
                                    "",
                                    "",
                                    item.LastActivity,
                                    "",
                                    "",
                                    item.jid,
                                    item.EnableDuringDnd,
                                    item.Subscribe,
                                    item.SubscribeUser,
                                    item.AutoDelete,
                                    item.Pinned);
            AddBuddy(buddy, false, false, false);
        }
        else if(item.Type == "contact"){
            var buddy = new Buddy("contact",
                                    item.cID,
                                    item.DisplayName,
                                    "",
                                    item.MobileNumber,
                                    item.ContactNumber1,
                                    item.ContactNumber2,
                                    item.LastActivity,
                                    item.Description,
                                    item.Email,
                                    null,
                                    item.EnableDuringDnd,
                                    item.Subscribe,
                                    item.SubscribeUser,
                                    item.AutoDelete,
                                    item.Pinned);
            AddBuddy(buddy, false, false, false);
        }
        else if(item.Type == "group"){
            var buddy = new Buddy("group",
                                    item.gID,
                                    item.DisplayName,
                                    item.ExtensionNumber,
                                    "",
                                    "",
                                    "",
                                    item.LastActivity,
                                    item.MemberCount + " member(s)",
                                    item.Email,
                                    null,
                                    item.EnableDuringDnd,
                                    item.Subscribe,
                                    item.SubscribeUser,
                                    item.AutoDelete,
                                    item.Pinned);
            AddBuddy(buddy, false, false, false);
        }
    });
    CleanupBuddies()
    console.log("Updating Buddy List...");
    UpdateBuddyList();
}
function UpdateBuddyList(){
    var filter = $("#searchArea").is(":visible") ? SanitizePhoneSearch($("#txtFindBuddy").val()) : "";
    var activeTab = GetActiveMainTab();
    var visibleEntryCount = 0;
    if($("#txtFindBuddy").val() != filter) $("#txtFindBuddy").val(filter);

    $("#myContacts").empty();
    SetMobilePaneEmptyState("#myContacts", false);
    var callCount = 0
    for(var l = 0; l < Lines.length; l++) {

        var classStr = (Lines[l].IsSelected)? "buddySelected" : "buddy";
        if(Lines[l].SipSession != null) classStr = (Lines[l].SipSession.isOnHold)? "buddyActiveCallHollding" : "buddyActiveCall";

        var html = "<div id=\"line-"+ Lines[l].LineNumber +"\" class="+ classStr +" onclick=\"SelectLine('"+ Lines[l].LineNumber +"')\">";
        if(Lines[l].IsSelected == false && Lines[l].SipSession && Lines[l].SipSession.data.started != true && Lines[l].SipSession.data.calldirection == "inbound"){
            html += "<span id=\"line-"+ Lines[l].LineNumber +"-ringing\" class=missedNotifyer style=\"padding-left: 5px; padding-right: 5px; width:unset\"><i class=\"fa fa-phone\"></i> "+ lang.state_ringing +"</span>";
        }
        var selfExtension = GetSelfExtensionLabel();
        html += "<div class=lineIcon>"+ (l + 1) +"</div>";
        html += "<div class=contactNameText><i class=\"fa fa-phone\"></i> "+ selfExtension +"</div>";
        html += "<div id=\"line-"+ Lines[l].LineNumber +"-datetime\" class=contactDate>&nbsp;</div>";
        html += "</div>";
        if(Lines[l].SipSession && Lines[l].SipSession.data.earlyReject != true){
            $("#myContacts").append(html);
            callCount ++;
            visibleEntryCount ++;
        }
    }
    if(DisableBuddies == true){
        if(callCount == 0 && DisableFreeDial != true){
            if(activeTab == "contacts"){
                $("#myContacts").append(BuildMobileEmptyState("fa-address-book", GetUiText("mobile_no_contacts", "No contacts", null)));
                SetMobilePaneEmptyState("#myContacts", true);
            } else {
                if(UiCustomDialButton == true){
                    if(typeof web_hook_dial_out !== 'undefined') {
                        web_hook_dial_out(null);
                    }
                } else {
                    ShowDial();
                }
            }
        }
        return;
    }
    if(callCount > 0){
        $("#myContacts").append("<hr class=hrline>");
    }
    if(Buddies.length == 0 && callCount == 0 && DisableFreeDial != true){
        if(activeTab == "contacts"){
            $("#myContacts").append(BuildMobileEmptyState("fa-address-book", GetUiText("mobile_no_contacts", "No contacts", null)));
            SetMobilePaneEmptyState("#myContacts", true);
        } else {
            if(UiCustomDialButton == true){
                if(typeof web_hook_dial_out !== 'undefined') {
                    web_hook_dial_out(null);
                }
            } else {
                ShowDial();
            }
        }
        return;
    }
    SortBuddies();

    var hiddenBuddies = 0;
    for(var b = 0; b < Buddies.length; b++) {
        var buddyObj = Buddies[b];

        if(activeTab == "contacts" && buddyObj.type != "contact"){
            continue;
        }

        if(filter && filter.length >= 1){
            var display = false;
            var extenVal = SanitizePhoneSearch(buddyObj.ExtNo);
            var c1Val = SanitizePhoneSearch(buddyObj.ContactNumber1);
            var mVal = SanitizePhoneSearch(buddyObj.MobileNumber);
            if(extenVal != "" && extenVal.indexOf(filter) > -1 ) display = true;
            if(c1Val != "" && c1Val.indexOf(filter) > -1 ) display = true;
            if(mVal != "" && mVal.indexOf(filter) > -1 ) display = true;
            if(!display) continue;
        }

        var today = moment.utc();
        var lastActivity = moment.utc(buddyObj.lastActivity.replace(" UTC", ""));
        var displayDateTime = "";
        if(lastActivity.isSame(today, 'day'))
        {
            displayDateTime = lastActivity.local().format(DisplayTimeFormat);
        }
        else {
            displayDateTime = lastActivity.local().format(DisplayDateFormat);
        }

        if(HideAutoDeleteBuddies){
            if(buddyObj.AllowAutoDelete) {
                hiddenBuddies++;
                continue;
            }
        }
        if(IsCallFirstContactMode() && buddyObj.AllowAutoDelete == true && (buddyObj.type == "extension" || buddyObj.type == "xmpp")){
            hiddenBuddies++;
            continue;
        }

        var classStr = (buddyObj.IsSelected)? "buddySelected" : "buddy";
        if(buddyObj.type == "extension") {
            var friendlyState = buddyObj.presence;
            if(friendlyState == "Unknown") friendlyState = lang.state_unknown;
            if(friendlyState == "Not online") friendlyState = lang.state_not_online;
            if(friendlyState == "Ready") friendlyState = lang.state_ready;
            if(friendlyState == "On the phone") friendlyState = lang.state_on_the_phone;
            if(friendlyState == "Proceeding") friendlyState = lang.state_on_the_phone;
            if(friendlyState == "Ringing") friendlyState = lang.state_ringing;
            if(friendlyState == "On hold") friendlyState = lang.state_on_hold;
            if(friendlyState == "Unavailable") friendlyState = lang.state_unavailable;
            if(buddyObj.EnableSubscribe != true) friendlyState = (buddyObj.Desc)? buddyObj.Desc : "";
            var autDeleteStatus = "";
            if(buddyObj.AllowAutoDelete == true) autDeleteStatus = "<i class=\"fa fa-clock-o\"></i> ";
            var html = "<div id=\"contact-"+ buddyObj.identity +"\" class="+ classStr +" onclick=\"OpenBuddyFromContacts('"+ buddyObj.identity +"')\">";
            html += "<span id=\"contact-"+ buddyObj.identity +"-missed\" class=missedNotifyer style=\""+ ((buddyObj.missed && buddyObj.missed > 0)? "" : "display:none") +"\">"+ buddyObj.missed +"</span>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-picture\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity, buddyObj.type) +"')\"></div>";
            html += (buddyObj.Pinned)? "<span class=pinnedBuddy><i class=\"fa fa-thumb-tack\"></i></span>" : "";
            html += "<div class=contactNameText>";
            html += "<span id=\"contact-"+ buddyObj.identity +"-devstate\" class=\""+ ((buddyObj.EnableSubscribe)? buddyObj.devState : "dotDefault") +"\"></span>";
            html += (BuddyShowExtenNum == true)? " "+ buddyObj.ExtNo + " - " : " ";
            html += buddyObj.CallerIDName
            html += "</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-datetime\" class=contactDate>"+ autDeleteStatus + ""+ displayDateTime +"</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-presence\" class=presenceText>"+ friendlyState +"</div>";
            html += "</div>";
            $("#myContacts").append(html);
            visibleEntryCount ++;
        } else if(buddyObj.type == "xmpp") {
            var friendlyState = buddyObj.presenceText;
            var autDeleteStatus = "";
            if(buddyObj.AllowAutoDelete == true) autDeleteStatus = "<i class=\"fa fa-clock-o\"></i> ";
            friendlyState = friendlyState.replace(/[<>"'\r\n&]/g, function(chr){
                let table = { '<': 'lt', '>': 'gt', '"': 'quot', '\'': 'apos', '&': 'amp', '\r': '#10', '\n': '#13' };
                return '&' + table[chr] + ';';
            });

            var html = "<div id=\"contact-"+ buddyObj.identity +"\" class="+ classStr +" onclick=\"OpenBuddyFromContacts('"+ buddyObj.identity +"')\">";
            html += "<span id=\"contact-"+ buddyObj.identity +"-missed\" class=missedNotifyer style=\""+ ((buddyObj.missed && buddyObj.missed > 0)? "" : "display:none") +"\">"+ buddyObj.missed +"</span>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-picture\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity, buddyObj.type) +"')\"></div>";
            html += (buddyObj.Pinned)? "<span class=pinnedBuddy><i class=\"fa fa-thumb-tack\"></i></span>" : "";
            html += "<div class=contactNameText>";
            html += "<span id=\"contact-"+ buddyObj.identity +"-devstate\" class=\""+ ((buddyObj.EnableSubscribe)? buddyObj.devState : "dotDefault") +"\"></span>";
            html += (BuddyShowExtenNum == true)? " "+ buddyObj.ExtNo + " - " : " ";
            html += buddyObj.CallerIDName;
            html += "</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-datetime\" class=contactDate>"+ autDeleteStatus + ""+ displayDateTime +"</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-presence\" class=presenceText><i class=\"fa fa-comments\"></i> "+ friendlyState +"</div>";
            html += "</div>";
            $("#myContacts").append(html);
            visibleEntryCount ++;
        } else if(buddyObj.type == "contact") {
            var dialNumber = GetBuddyDialNumber(buddyObj);
            var html = "<div id=\"contact-"+ buddyObj.identity +"\" class=\""+ classStr +" contactCompact enterpriseContactItem\" data-contact-identity=\""+ EscapeAttr(buddyObj.identity) +"\" data-dial-number=\""+ EscapeAttr(dialNumber) +"\">";
            html += "<div class=contactCompactMain>";
            html += "<div class=contactCompactName style=\"user-select:text\">"+ buddyObj.CallerIDName +"</div>";
            html += "<div class=contactCompactNumber style=\"user-select:text\">"+ dialNumber +"</div>";
            html += "</div>";
            html += "<div class=recentExpandChevron><i class=\"fa fa-chevron-down\"></i></div>";
            html += "<div class=contactCompactExpanded style=\"display:none\">";
            html += "<div class=recentExpandedActions>";
            html += "<button type=button class=\"roundButtons contactActionCall\" title=\""+ EscapeAttr(lang.audio_call || lang.call || "Call") +"\""+ (dialNumber == "" ? " disabled" : "") +"><i class=\"fa fa-phone\"></i></button>";
            html += "<button type=button class=\"roundButtons contactActionEdit\" title=\""+ EscapeAttr(lang.edit || "Edit") +"\"><i class=\"fa fa-pencil\"></i></button>";
            html += "<button type=button class=\"roundButtons contactActionDelete\" title=\""+ EscapeAttr(lang.delete_buddy || lang.delete || "Delete") +"\"><i class=\"fa fa-trash\"></i></button>";
            html += "</div>";
            html += "</div>";
            html += "</div>";
            $("#myContacts").append(html);
            visibleEntryCount ++;
        } else if(buddyObj.type == "group"){
            var autDeleteStatus = "";
            if(buddyObj.AllowAutoDelete == true) autDeleteStatus = "<i class=\"fa fa-clock-o\"></i> ";
            var html = "<div id=\"contact-"+ buddyObj.identity +"\" class="+ classStr +" onclick=\"OpenBuddyFromContacts('"+ buddyObj.identity +"')\">";
            html += "<span id=\"contact-"+ buddyObj.identity +"-missed\" class=missedNotifyer style=\""+ ((buddyObj.missed && buddyObj.missed > 0)? "" : "display:none") +"\">"+ buddyObj.missed +"</span>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-picture\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity, buddyObj.type) +"')\"></div>";
            html += (buddyObj.Pinned)? "<span class=pinnedBuddy><i class=\"fa fa-thumb-tack\"></i></span>" : "";
            html += "<div class=contactNameText><i class=\"fa fa-users\"></i> "+ buddyObj.CallerIDName +"</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-datetime\" class=contactDate>"+ autDeleteStatus + ""+ displayDateTime +"</div>";
            html += "<div class=presenceText>"+ buddyObj.Desc +"</div>";
            html += "</div>";
            $("#myContacts").append(html);
            visibleEntryCount ++;
        }
    }
    if(IsCallFirstContactMode() == false){
        for(var b = 0; b < Buddies.length; b++) {
            if(Buddies[b].IsSelected) {
                SelectBuddy(Buddies[b].identity, Buddies[b].type);
                break;
            }
        }
    }
    if(callCount == 0 && visibleEntryCount == 0){
        $("#myContacts").append(BuildMobileEmptyState("fa-address-book", GetUiText("mobile_no_contacts", "No contacts", null)));
        SetMobilePaneEmptyState("#myContacts", true);
    }
    BindContactExpandedActions();
    ApplyRegistrationStatusText();
}
function AddBuddyMessageStream(buddyObj) {
    var profileRow = "";
    profileRow += "<tr><td id=\"contact-"+ buddyObj.identity +"-ProfileCell\" class=\"streamSection highlightSection buddyProfileSection\" style=\"height: 50px; box-sizing: border-box;\">";
    profileRow += "<table cellpadding=0 cellspacing=0 border=0 style=\"width:100%; table-layout: fixed;\">"
    profileRow += "<tr>"
    profileRow += "<td style=\"width:38px; text-align: center;\">";
    profileRow += "<button id=\"contact-"+ buddyObj.identity +"-btn-back\" onclick=\"CloseBuddy('"+ buddyObj.identity +"')\" class=roundButtons style=\"margin-right:5px\" title=\""+ lang.back +"\"><i class=\"fa fa-chevron-left\"></i></button> ";
    profileRow += "</td>"
    profileRow += "<td style=\"width:100%\">";
    profileRow += "<div class=contact style=\"cursor: unset; padding:0px\">";
    if(buddyObj.type == "extension" || buddyObj.type == "xmpp") {
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-picture-main\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity) +"')\"></div>";
    }
    else if(buddyObj.type == "contact") {
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-picture-main\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity,"contact") +"')\"></div>";
    }
    else if(buddyObj.type == "group") {
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-picture-main\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity,"group") +"')\"></div>";
    }
    if(buddyObj.type == "extension" || buddyObj.type == "xmpp") {
        profileRow += "<div class=contactNameText style=\"margin-right: 0px;\">";
        profileRow += "<span id=\"contact-"+ buddyObj.identity +"-devstate-main\" class=\""+ buddyObj.devState +"\"></span>";
        profileRow += " <span id=\"contact-"+ buddyObj.identity +"-name\">"+ buddyObj.CallerIDName +"</span>";
        profileRow += "</div>";
    }
    else if(buddyObj.type == "contact") {
        profileRow += "<div class=contactNameText style=\"margin-right: 0px;\">"
        profileRow += "<i class=\"fa fa-address-card\"></i>";
        profileRow += " <span id=\"contact-"+ buddyObj.identity +"-name\">"+ buddyObj.CallerIDName +"</span>";
        profileRow += "</div>";
    }
    else if(buddyObj.type == "group") {
        profileRow += "<div class=contactNameText style=\"margin-right: 0px;\">"
        profileRow += "<i class=\"fa fa-users\"></i>";
        profileRow += " <span id=\"contact-"+ buddyObj.identity +"-name\">"+ buddyObj.CallerIDName +"</span>";
        profileRow += "</div>";
    }
    if(buddyObj.type == "extension") {
        var friendlyState = buddyObj.presence;
        if (friendlyState == "Unknown") friendlyState = lang.state_unknown;
        if (friendlyState == "Not online") friendlyState = lang.state_not_online;
        if (friendlyState == "Ready") friendlyState = lang.state_ready;
        if (friendlyState == "On the phone") friendlyState = lang.state_on_the_phone;
        if (friendlyState == "Ringing") friendlyState = lang.state_ringing;
        if (friendlyState == "On hold") friendlyState = lang.state_on_hold;
        if (friendlyState == "Unavailable") friendlyState = lang.state_unavailable;
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-presence-main\" class=presenceText>"+ friendlyState +"</div>";
    }
    else if(buddyObj.type == "xmpp"){
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-presence-main\" class=presenceText><i class=\"fa fa-comments\"></i> "+ buddyObj.presenceText +"</div>";
    }
    else{
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-presence-main\" class=presenceText>"+ buddyObj.Desc +"</div>";
    }
    profileRow += "</div>";
    profileRow += "</td>";
    var buttonsWidth = 80;
    if((buddyObj.type == "extension" || buddyObj.type == "xmpp") && EnableVideoCalling == true) {
        buttonsWidth = 120;
    }
    var fullButtonsWidth = 200;
    if((buddyObj.type == "extension" || buddyObj.type == "xmpp") && EnableVideoCalling == true) {
        fullButtonsWidth = 240;
    }
    profileRow += "<td id=\"contact-"+ buddyObj.identity +"-action-buttons\" style=\"width: "+ buttonsWidth +"px; text-align: right\">";
    profileRow += "<button id=\"contact-"+ buddyObj.identity +"-btn-audioCall\" onclick=\"AudioCallMenu('"+ buddyObj.identity +"', this)\" class=roundButtons title=\""+ lang.audio_call +"\"><i class=\"fa fa-phone\"></i></button>";
    if((buddyObj.type == "extension" || buddyObj.type == "xmpp") && EnableVideoCalling == true) {
        profileRow += " <button id=\"contact-"+ buddyObj.identity +"-btn-videoCall\" onclick=\"DialByLine('video', '"+ buddyObj.identity +"', '"+ buddyObj.ExtNo +"');\" class=roundButtons title=\""+ lang.video_call +"\"><i class=\"fa fa-video-camera\"></i></button>";
    }
    profileRow += "<span id=\"contact-"+ buddyObj.identity +"-extra-buttons\" style=\"display:none\">"
    profileRow += " <button id=\"contact-"+ buddyObj.identity +"-btn-edit\" onclick=\"EditBuddyWindow('"+ buddyObj.identity +"')\" class=roundButtons title=\""+ lang.edit +"\"><i class=\"fa fa-pencil\"></i></button>";
    profileRow += " <button id=\"contact-"+ buddyObj.identity +"-btn-search\" onclick=\"FindSomething('"+ buddyObj.identity +"')\" class=roundButtons title=\""+ lang.find_something +"\"><i class=\"fa fa-search\"></i></button>";
    profileRow += " <button id=\"contact-"+ buddyObj.identity +"-btn-pin\" onclick=\"TogglePinned('"+ buddyObj.identity +"')\" class=roundButtons title=\""+ lang.pin_to_top +"\"><i class=\"fa fa-thumb-tack\"></i></button>";
    profileRow += "</span>"
    profileRow += " <button id=\"contact-"+ buddyObj.identity +"-btn-toggle-extra\" onclick=\"ToggleExtraButtons('"+ buddyObj.identity +"', "+ buttonsWidth +", "+ fullButtonsWidth +")\" class=roundButtons><i class=\"fa fa-ellipsis-h\"></i></button>";
    profileRow += "</td>";

    profileRow += "</tr></table>";
    profileRow += "</div>";
    profileRow += "<div style=\"clear:both; height:0px\"></div>"
    profileRow += "<div id=\"contact-"+ buddyObj.identity +"-search\" style=\"margin-top:6px; display:none\">";
    profileRow += "<span class=searchClean style=\"width:100%\"><input type=text style=\"width: calc(100% - 40px);\" autocomplete=none oninput=SearchStream(this,'"+ buddyObj.identity +"') placeholder=\""+ lang.find_something_in_the_message_stream +"\"></span>";
    profileRow += "</div>";

    profileRow += "</td></tr>";
    var messagesRow = "";
    var textRow = "";

    var html = "<table id=\"stream-"+ buddyObj.identity +"\" class=stream cellspacing=0 cellpadding=0>";
    if(UiMessageLayout == "top"){
        html += messagesRow;
        html += profileRow;
    } else {
        html += profileRow;
        html += messagesRow;
    }
    html += textRow;
    html += "</table>";

    $("#rightContent").append(html);
    if(UiMessageLayout == "top"){
        $("#contact-"+ buddyObj.identity +"-MessagesCell").addClass("")
        $("#contact-"+ buddyObj.identity +"-ProfileCell").addClass("sectionBorderTop")
        $("#contact-"+ buddyObj.identity +"-InteractionCell").addClass("")
    } else {
        $("#contact-"+ buddyObj.identity +"-ProfileCell").addClass("sectionBorderBottom")
        $("#contact-"+ buddyObj.identity +"-MessagesCell").addClass("")
        $("#contact-"+ buddyObj.identity +"-InteractionCell").addClass("sectionBorderTop")
    }


}
function RemoveBuddyMessageStream(buddyObj, days, preserveStream){
    if(buddyObj == null) return;
    var stream = JSON.parse(localDB.getItem(buddyObj.identity + "-stream"));
    if(days && days > 0){
        if(stream && stream.DataCollection && stream.DataCollection.length >= 1){
            var trimmedStream = {
                TotalRows : 0,
                DataCollection : []
            }
            trimmedStream.DataCollection = stream.DataCollection.filter(function(item){
                var itemDate = moment.utc(item.ItemDate.replace(" UTC", ""));
                var expiredDate = moment().utc().subtract(days, 'days');
                if(itemDate.isSameOrAfter(expiredDate, "second")){
                    return true
                }
                else {
                    return false;
                }
            });
            trimmedStream.TotalRows = trimmedStream.DataCollection.length;
            localDB.setItem(buddyObj.identity + "-stream", JSON.stringify(trimmedStream));
            var deleteStream = {
                TotalRows : 0,
                DataCollection : []
            }
            deleteStream.DataCollection = stream.DataCollection.filter(function(item){
                var itemDate = moment.utc(item.ItemDate.replace(" UTC", ""));
                var expiredDate = moment().utc().subtract(days, 'days');
                if(itemDate.isSameOrAfter(expiredDate, "second")){
                    return false;
                }
                else {
                    return true
                }
            });
            deleteStream.TotalRows = deleteStream.DataCollection.length;
            stream = deleteStream;

            RefreshStream(buddyObj);
        }
    }
    else {
        CloseBuddy(buddyObj.identity);
        $("#stream-"+ buddyObj.identity).remove();

        if(!preserveStream){
            localDB.removeItem(buddyObj.identity + "-stream");
        }
        var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
        var x = 0;
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddyObj.identity || item.cID == buddyObj.identity || item.gID == buddyObj.identity){
                x = i;
                return false;
            }
        });
        json.DataCollection.splice(x,1);
        json.TotalRows = json.DataCollection.length;
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
        localDB.removeItem("img-"+ buddyObj.identity +"-extension");
        localDB.removeItem("img-"+ buddyObj.identity +"-contact");
        localDB.removeItem("img-"+ buddyObj.identity +"-group");
    }
    UpdateBuddyList();
    if(!preserveStream && stream && stream.DataCollection && stream.DataCollection.length >= 1){
        DeleteCallRecordings(buddyObj.identity, stream);
    }
    if(!preserveStream && stream && stream.DataCollection && stream.DataCollection.length >= 1){
        DeleteQosData(buddyObj.identity, stream);
    }
}
function DeleteCallRecordings(buddy, stream){
    if(CallRecordingsIndexDb != null){
        $.each(stream.DataCollection, function (i, item) {
            if (item.ItemType == "CDR" && item.Recordings && item.Recordings.length) {
                $.each(item.Recordings, function (i, recording) {
                    console.log("Deleting Call Recording: ", recording.uID);
                    var objectStore = CallRecordingsIndexDb.transaction(["Recordings"], "readwrite").objectStore("Recordings");
                    try{
                        var deleteRequest = objectStore.delete(recording.uID);
                        deleteRequest.onsuccess = function(event) {
                            console.log("Call Recording Deleted: ", recording.uID);
                        }
                    } catch(e){
                        console.log("Call Recording Delete failed: ", e);
                    }
                });
            }
        });
    }
    else {
        console.warn("CallRecordingsIndexDb is null.");
    }
}
function ToggleExtraButtons(lineNum, normal, expanded){
    var extraButtons = $("#contact-"+ lineNum +"-extra-buttons");
    if(extraButtons.is(":visible")){
        extraButtons.hide()
        $("#contact-"+ lineNum +"-action-buttons").css("width", normal+"px");
    } else {
        extraButtons.show()
        $("#contact-"+ lineNum +"-action-buttons").css("width", expanded+"px");
    }
}
function SortBuddies(){
    if(BuddySortBy == "type"){
        Buddies.sort(function(a, b){
            var aMo = moment.utc(a.lastActivity.replace(" UTC", ""));
            var bMo = moment.utc(b.lastActivity.replace(" UTC", ""));
            var aType = a.type;
            var bType = b.type;
            if(SortByTypeOrder == "c|e|x") {
                if(a.type == "contact") aType = "A";
                if(b.type == "contact") bType = "A";
                if(a.type == "extension") aType = "B";
                if(b.type == "extension") bType = "B";
                if(a.type == "xmpp") aType = "C";
                if(b.type == "xmpp") bType = "C";
            }
            if(SortByTypeOrder == "c|x|e") {
                if(a.type == "contact") aType = "A";
                if(b.type == "contact") bType = "A";
                if(a.type == "extension") aType = "C";
                if(b.type == "extension") bType = "C";
                if(a.type == "xmpp") aType = "B";
                if(b.type == "xmpp") bType = "B";
            }
            if(SortByTypeOrder == "x|e|c") {
                if(a.type == "contact") aType = "C";
                if(b.type == "contact") bType = "C";
                if(a.type == "extension") aType = "B";
                if(b.type == "extension") bType = "B";
                if(a.type == "xmpp") aType = "A";
                if(b.type == "xmpp") bType = "A";
            }
            if(SortByTypeOrder == "x|c|e") {
                if(a.type == "contact") aType = "B";
                if(b.type == "contact") bType = "B";
                if(a.type == "extension") aType = "C";
                if(b.type == "extension") bType = "C";
                if(a.type == "xmpp") aType = "A";
                if(b.type == "xmpp") bType = "A";
            }
            if(SortByTypeOrder == "e|x|c") {
                if(a.type == "contact") aType = "C";
                if(b.type == "contact") bType = "C";
                if(a.type == "extension") aType = "A";
                if(b.type == "extension") bType = "A";
                if(a.type == "xmpp") aType = "B";
                if(b.type == "xmpp") bType = "B";
            }
            if(SortByTypeOrder == "e|c|x") {
                if(a.type == "contact") aType = "B";
                if(b.type == "contact") bType = "A";
                if(a.type == "extension") aType = "A";
                if(b.type == "extension") bType = "A";
                if(a.type == "xmpp") aType = "C";
                if(b.type == "xmpp") bType = "C";
            }

            return (aType.localeCompare(bType) || (aMo.isSameOrAfter(bMo, "second")? -1 : 1));
        });
    }
    if(BuddySortBy == "extension"){
        Buddies.sort(function(a, b){
            var aSortBy = (a.type == "extension" || a.type == "xmpp")? a.ExtNo : a.ContactNumber1;
            var bSortBy = (b.type == "extension" || b.type == "xmpp")? b.ExtNo : a.ContactNumber1;
            var aMo = moment.utc(a.lastActivity.replace(" UTC", ""));
            var bMo = moment.utc(b.lastActivity.replace(" UTC", ""));
            return (aSortBy.localeCompare(bSortBy) || (aMo.isSameOrAfter(bMo, "second")? -1 : 1));
        });
    }
    if(BuddySortBy == "alphabetical"){
        Buddies.sort(function(a, b){
            var aMo = moment.utc(a.lastActivity.replace(" UTC", ""));
            var bMo = moment.utc(b.lastActivity.replace(" UTC", ""));
            return (a.CallerIDName.localeCompare(b.CallerIDName) || (aMo.isSameOrAfter(bMo, "second")? -1 : 1));
        });
    }
    if(BuddySortBy == "activity"){
        Buddies.sort(function(a, b){
            var aMo = moment.utc(a.lastActivity.replace(" UTC", ""));
            var bMo = moment.utc(b.lastActivity.replace(" UTC", ""));
            return (aMo.isSameOrAfter(bMo, "second")? -1 : 1);
        });
    }
    if(BuddyAutoDeleteAtEnd == true){
        Buddies.sort(function(a, b){
            return (a.AllowAutoDelete === b.AllowAutoDelete)? 0 : a.AllowAutoDelete? 1 : -1;
        });
    }
    Buddies.sort(function(a, b){
        return (a.Pinned === b.Pinned)? 0 : a.Pinned? -1 : 1;
    });

}


function SelectBuddy(buddy) {
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;

    var displayName = (BuddyShowExtenNum == true && (buddyObj.type == "extension" || buddyObj.type == "xmpp"))? " "+ buddyObj.ExtNo + " - " + buddyObj.CallerIDName : buddyObj.CallerIDName;
    $("#contact-" + buddyObj.identity + "-name").html(displayName);
    var presence = "";
    if(buddyObj.type == "extension"){
        presence += buddyObj.presence;
        if(presence == "Unknown") presence = lang.state_unknown;
        if(presence == "Not online") presence = lang.state_not_online;
        if(presence == "Ready") presence = lang.state_ready;
        if(presence == "On the phone") presence = lang.state_on_the_phone;
        if(presence == "Ringing") presence = lang.state_ringing;
        if(presence == "On hold") presence = lang.state_on_hold;
        if(presence == "Unavailable") presence = lang.state_unavailable;
        if(buddyObj.EnableSubscribe != true) presence = buddyObj.Desc;
    } else if(buddyObj.type == "xmpp"){
        presence += "<i class=\"fa fa-comments\"></i> ";
        presence += buddyObj.presenceText;
    } else if(buddyObj.type == "contact"){
        presence += buddyObj.Desc;
    } else if(buddyObj.type == "group"){
        presence += buddyObj.Desc;
    }
    $("#contact-" + buddyObj.identity + "-presence-main").html(presence);

    $("#contact-"+ buddyObj.identity +"-picture-main").css("background-image", $("#contact-"+ buddyObj.identity +"-picture-main").css("background-image"));

    for(var b = 0; b < Buddies.length; b++) {
        if(Buddies[b].IsSelected == true && Buddies[b].identity == buddy){
            return;
        }
    }

    console.log("Selecting Buddy: "+ buddyObj.CallerIDName);

    selectedBuddy = buddyObj;
    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });
    $("#stream-" + buddy).prop('class', 'streamSelected');
    for(var l = 0; l < Lines.length; l++) {
        var classStr = "buddy";
        if(Lines[l].SipSession != null) classStr = (Lines[l].SipSession.isOnHold)? "buddyActiveCallHollding" : "buddyActiveCall";
        $("#line-" + Lines[l].LineNumber).prop('class', classStr);
        Lines[l].IsSelected = false;
    }

    ClearMissedBadge(buddy);
    for(var b = 0; b < Buddies.length; b++) {
        var classStr = (Buddies[b].identity == buddy)? "buddySelected" : "buddy";
        $("#contact-" + Buddies[b].identity).prop('class', classStr);

        Buddies[b].IsSelected = (Buddies[b].identity == buddy);
    }
    UpdateUI();
    RefreshStream(buddyObj);

    try{
        $("#contact-" + buddy).get(0).scrollIntoViewIfNeeded();
    } catch(e){}
    localDB.setItem("SelectedBuddy", buddy);
}
function OpenBuddyFromContacts(buddy){
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;
    if(buddyObj.type == "group") return;

    var dialNumber = GetBuddyDialNumber(buddyObj);
    if(dialNumber != ""){
        DialByLine("audio", buddyObj.identity, dialNumber);
        return;
    }

    if(IsCallFirstContactMode() == false){
        SelectBuddy(buddyObj.identity);
    }
}
function CloseBuddy(buddy){
    $(".buddySelected").each(function () {
        $(this).prop('class', 'buddy');
    });
    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });

    console.log("Closing Buddy: "+ buddy);
    for(var b = 0; b < Buddies.length; b++){
        Buddies[b].IsSelected = false;
    }
    selectedBuddy = null;
    for(var l = 0; l < Lines.length; l++){
        Lines[l].IsSelected = false;
    }
    selectedLine = null;
    localDB.setItem("SelectedBuddy", null);
    UpdateUI();
}
function RemoveBuddy(buddy){

    CloseWindow();

    Confirm(lang.confirm_remove_buddy, lang.remove_buddy, function(){
        DoRemoveBuddy(buddy)
        UpdateBuddyList();
    });
}
function DoRemoveBuddy(buddy){
    for(var b = 0; b < Buddies.length; b++) {
        if(Buddies[b].identity == buddy) {
            RemoveBuddyMessageStream(Buddies[b], null, Buddies[b].type == "contact");
            UnsubscribeBuddy(Buddies[b]);
            Buddies.splice(b, 1);
            break;
        }
    }
}
function FindBuddyByDid(did){
    for(var b = 0; b < Buddies.length; b++){
        if(Buddies[b].ExtNo == did || Buddies[b].MobileNumber == did || Buddies[b].ContactNumber1 == did || Buddies[b].ContactNumber2 == did) {
            return Buddies[b];
        }
    }
    return null;
}
function FindBuddyByNumber(number){
    for(var b = 0; b < Buddies.length; b++){
        if(Buddies[b].MobileNumber == number || Buddies[b].ContactNumber1 == number || Buddies[b].ContactNumber2 == number) {
            return Buddies[b];
        }
    }
    return null;
}
function FindBuddyByIdentity(identity){
    for(var b = 0; b < Buddies.length; b++){
        if(Buddies[b].identity == identity) return Buddies[b];
    }
    return null;
}
function FindBuddyByObservedUser(SubscribeUser){
    for(var b = 0; b < Buddies.length; b++){
        if(Buddies[b].SubscribeUser == SubscribeUser) return Buddies[b];
    }
    return null;
}

function SearchStream(obj, buddy){
    var q = obj.value;

    var buddyObj = FindBuddyByIdentity(buddy);
    if(q == ""){
        console.log("Restore Stream");
        RefreshStream(buddyObj);
    }
    else{
        RefreshStream(buddyObj, q);
    }
}
function RefreshStream(buddyObj, filter) {
    return;
}
function RedrawStage(lineNum, videoChanged){
    var  stage = $("#line-" + lineNum + "-VideoCall");
    var container = $("#line-" + lineNum + "-stage-container");
    var previewContainer = $("#line-"+  lineNum +"-preview-container");
    var videoContainer = $("#line-" + lineNum + "-remote-videos");

    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null) return;
    var session = lineObj.SipSession;
    if(session == null) return;

    var isVideoPinned = false;
    var pinnedVideoID = "";
    previewContainer.find('video').each(function(i, video) {
        $(video).hide();
    });
    previewContainer.css("width",  "");
    var videoCount = 0;
    videoContainer.find('video').each(function(i, video) {
        var thisRemoteVideoStream = video.srcObject;
        var videoTrack = thisRemoteVideoStream.getVideoTracks()[0];
        var videoTrackSettings = videoTrack.getSettings();
        var srcVideoWidth = (videoTrackSettings.width)? videoTrackSettings.width : video.videoWidth;
        var srcVideoHeight = (videoTrackSettings.height)? videoTrackSettings.height : video.videoHeight;

        if(thisRemoteVideoStream.mid) {
            thisRemoteVideoStream.channel = "unknown";
            thisRemoteVideoStream.CallerIdName = "";
            thisRemoteVideoStream.CallerIdNumber = "";
            thisRemoteVideoStream.isAdminMuted = false;
            thisRemoteVideoStream.isAdministrator = false;
            if(session && session.data && session.data.videoChannelNames){
                session.data.videoChannelNames.forEach(function(videoChannelName){
                    if(thisRemoteVideoStream.mid == videoChannelName.mid){
                        thisRemoteVideoStream.channel = videoChannelName.channel;
                    }
                });
            }
            if(session && session.data && session.data.ConfbridgeChannels){
                session.data.ConfbridgeChannels.forEach(function(ConfbridgeChannel){
                    if(ConfbridgeChannel.id == thisRemoteVideoStream.channel){
                        thisRemoteVideoStream.CallerIdName = ConfbridgeChannel.caller.name;
                        thisRemoteVideoStream.CallerIdNumber = ConfbridgeChannel.caller.number;
                        thisRemoteVideoStream.isAdminMuted = ConfbridgeChannel.muted;
                        thisRemoteVideoStream.isAdministrator = ConfbridgeChannel.admin;
                    }
                });
            }
        }
        if(videoChanged){
            $("#line-" + lineNum + "-preview-container").find('video').each(function(i, video) {
                if(video.id.indexOf("copy-") == 0){
                    video.remove();
                }
            });
        }
        $(video).parent().off("click");
        $(video).parent().css("width", "1px");
        $(video).parent().css("height", "1px");
        $(video).hide();
        $(video).parent().hide();
        if(lineObj.pinnedVideo && lineObj.pinnedVideo == thisRemoteVideoStream.trackID && videoTrack.readyState == "live" && srcVideoWidth > 10 && srcVideoHeight >= 10){
            isVideoPinned = true;
            pinnedVideoID = lineObj.pinnedVideo;
        }
        if(videoTrack.readyState == "live" && srcVideoWidth > 10 && srcVideoHeight >= 10) {
            videoCount ++;
            console.log("Display Video - ", videoTrack.readyState, "MID:", thisRemoteVideoStream.mid, "channel:", thisRemoteVideoStream.channel, "src width:", srcVideoWidth, "src height", srcVideoHeight);
        }
        else{
            console.log("Hide Video - ", videoTrack.readyState ,"MID:", thisRemoteVideoStream.mid);
        }


    });
    if(videoCount == 0) {
        previewContainer.css("width",  previewWidth +"px");
        previewContainer.find('video').each(function(i, video) {
            $(video).show();
        });
        return;
    }
    if(isVideoPinned) videoCount = 1;

    if(!videoContainer.outerWidth() > 0) return;
    if(!videoContainer.outerHeight() > 0) return;
    var Margin = 3;
    var videoRatio = 0.750;
    if(videoAspectRatio == "" || videoAspectRatio == "1.33") videoRatio = 0.750;
    if(videoAspectRatio == "1.77") videoRatio = 0.5625;
    if(videoAspectRatio == "1") videoRatio = 1;
    var stageWidth = videoContainer.outerWidth() - (Margin * 2);
    var stageHeight = videoContainer.outerHeight() - (Margin * 2);
    var previewWidth = previewContainer.outerWidth();
    var maxWidth = 0;
    let i = 1;
    while (i < 5000) {
        let w = StageArea(i, videoCount, stageWidth, stageHeight, Margin, videoRatio);
        if (w === false) {
            maxWidth =  i - 1;
            break;
        }
        i++;
    }
    maxWidth = maxWidth - (Margin * 2);
    videoContainer.find('video').each(function(i, video) {
        var thisRemoteVideoStream = video.srcObject;
        var videoTrack = thisRemoteVideoStream.getVideoTracks()[0];
        var videoTrackSettings = videoTrack.getSettings();
        var srcVideoWidth = (videoTrackSettings.width)? videoTrackSettings.width : video.videoWidth;
        var srcVideoHeight = (videoTrackSettings.height)? videoTrackSettings.height : video.videoHeight;

        var videoWidth = maxWidth;
        var videoHeight = maxWidth * videoRatio;
        if(isVideoPinned){
            if(pinnedVideoID == video.srcObject.trackID){
                $(video).parent().css("width", videoWidth+"px");
                $(video).parent().css("height", videoHeight+"px");
                $(video).show();
                $(video).parent().show();
                var unPinButton = $("<button />", {
                    class: "videoOverlayButtons",
                });
                unPinButton.html("<i class=\"fa fa-th-large\"></i>");
                unPinButton.on("click", function(){
                    UnPinVideo(lineNum, video);
                });
                $(video).parent().find(".Actions").empty();
                $(video).parent().find(".Actions").append(unPinButton);
            } else {
                if(videoTrack.readyState == "live" && srcVideoWidth > 10 && srcVideoHeight >= 10) {
                    if(videoChanged){
                        var videoEl = $("<video />", {
                            id: "copy-"+ thisRemoteVideoStream.id,
                            muted: true,
                            autoplay: true,
                            playsinline: true,
                            controls: false
                        });
                        var videoObj = videoEl.get(0);
                        videoObj.srcObject = thisRemoteVideoStream;
                        $("#line-" + lineNum + "-preview-container").append(videoEl);
                    }
                }
            }
        }
        else {
            if(videoTrack.readyState == "live" && srcVideoWidth > 10 && srcVideoHeight >= 10) {
                $(video).parent().css("width", videoWidth+"px");
                $(video).parent().css("height", videoHeight+"px");
                $(video).show();
                $(video).parent().show();
                var pinButton = $("<button />", {
                    class: "videoOverlayButtons",
                });
                pinButton.html("<i class=\"fa fa-thumb-tack\"></i>");
                pinButton.on("click", function(){
                    PinVideo(lineNum, video, video.srcObject.trackID);
                });
                $(video).parent().find(".Actions").empty();
                if(videoCount > 1){
                    $(video).parent().find(".Actions").append(pinButton);
                }

            }
        }
        var adminMuteIndicator = "";
        var administratorIndicator = "";
        if(thisRemoteVideoStream.isAdminMuted == true){
            adminMuteIndicator = "<i class=\"fa fa-microphone-slash\" style=\"color:red\"></i>&nbsp;"
        }
        if(thisRemoteVideoStream.isAdministrator == true){
            administratorIndicator = "<i class=\"fa fa-user\" style=\"color:orange\"></i>&nbsp;"
        }
        if(thisRemoteVideoStream.CallerIdName == ""){
            thisRemoteVideoStream.CallerIdName = FindBuddyByIdentity(session.data.buddyId).CallerIDName;
        }
        $(video).parent().find(".callerID").html(administratorIndicator + adminMuteIndicator + thisRemoteVideoStream.CallerIdName);


    });
    previewContainer.css("width",  previewWidth +"px");
    previewContainer.find('video').each(function(i, video) {
        $(video).show();
    });

}
function StageArea(Increment, Count, Width, Height, Margin, videoRatio) {
    let i = w = 0;
    let h = Increment * videoRatio + (Margin * 2);
    while (i < (Count)) {
        if ((w + Increment) > Width) {
            w = 0;
            h = h + (Increment * videoRatio) + (Margin * 2);
        }
        w = w + Increment + (Margin * 2);
        i++;
    }
    if (h > Height) return false;
    else return Increment;
}
function PinVideo(lineNum, videoEl, trackID){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null) return;

    console.log("Setting Pinned Video:", trackID);
    lineObj.pinnedVideo = trackID;
    videoEl.srcObject.isPinned = true;
    RedrawStage(lineNum, true);
}
function UnPinVideo(lineNum, videoEl){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null) return;

    console.log("Removing Pinned Video");
    lineObj.pinnedVideo = "";
    videoEl.srcObject.isPinned = false;
    RedrawStage(lineNum, true);
}
function PopulateSettingsDeviceOptions(deviceInfos, selectMicScr, selectAudioScr, selectRingDevice, selectVideoScr){
    var counts = { audioinput: 0, audiooutput: 0, videoinput: 0 };
    if(selectMicScr && selectMicScr.length) selectMicScr.empty();
    if(selectAudioScr && selectAudioScr.length) selectAudioScr.empty();
    if(selectRingDevice && selectRingDevice.length) selectRingDevice.empty();
    if(selectVideoScr && selectVideoScr.length) selectVideoScr.empty();

    for (var i = 0; i < deviceInfos.length; ++i) {
        console.log("Found Device ("+ deviceInfos[i].kind +") Again: ", deviceInfos[i].label, deviceInfos[i].deviceId);

        var deviceInfo = deviceInfos[i];
        var devideId = deviceInfo.deviceId;
        var DisplayName = deviceInfo.label;
        if(DisplayName.indexOf("(") > 0) DisplayName = DisplayName.substring(0,DisplayName.indexOf("("));

        var option = $('<option/>');
        option.prop("value", devideId);

        if (deviceInfo.kind === "audioinput") {
            counts.audioinput++;
            option.text((DisplayName != "")? DisplayName : "Microphone");
            if(getAudioSrcID() == devideId) option.prop("selected", true);
            selectMicScr.append(option);
        }
        else if (deviceInfo.kind === "audiooutput") {
            counts.audiooutput++;
            option.text((DisplayName != "")? DisplayName : "Speaker");
            if(getAudioOutputID() == devideId) option.prop("selected", true);
            selectAudioScr.append(option);
            var ringOption = option.clone();
            if(getRingerOutputID() == devideId) ringOption.prop("selected", true);
            selectRingDevice.append(ringOption);
        }
        else if (deviceInfo.kind === "videoinput") {
            if(EnableVideoCalling == true && selectVideoScr && selectVideoScr.length){
                counts.videoinput++;
                if(getVideoSrcID() == devideId) option.prop("selected", true);
                option.text((DisplayName != "")? DisplayName : "Webcam");
                selectVideoScr.append(option);
            }
        }
    }
    if(EnableVideoCalling == true && selectVideoScr && selectVideoScr.length){
        if(selectVideoScr.children('option').length > 0){
            var defaultVideoOption = $('<option/>');
            defaultVideoOption.prop("value", "default");
            if(getVideoSrcID() == "default" || getVideoSrcID() == "" || getVideoSrcID() == "null") defaultVideoOption.prop("selected", true);
            defaultVideoOption.text("("+ lang.default_video_src +")");
            selectVideoScr.append(defaultVideoOption);
        }
    }
    return counts;
}
function ShowMyProfile(){
    var mode = arguments[0] || "extension";
    var isSettingsMode = (mode == "settings");
    window.SettingsOverlayActive = true;
    var returnTab = GetActiveMainTab();
    if(returnTab != "contacts" && returnTab != "recents" && returnTab != "dialpad") returnTab = "dialpad";

    var html = "<div class=configExtensionScreen>";
    html += "<div class=configExtensionHeader>";
    html += "<div class=configExtensionTitle><i class=\"fa fa-cogs\"></i> "+ (isSettingsMode ? (lang.settings_menu || "Settings") : lang.configure_extension) +"</div>";
    html += "</div>";
    html += "<div class=configExtensionForm>";

    var requiredMarker = " <span style=\"color:#dc2626; font-weight:700\">*</span>";
    var AccountHtml =  "<div id=Configure_Extension_Html style=\"display:"+ ((EnableAccountSettings == true && !isSettingsMode)? "block" : "none") +"\">";
    AccountHtml += "<div class=UiText>"+ lang.asterisk_server_address +":"+ requiredMarker +"</div>";
    AccountHtml += "<div><input id=Configure_Account_wssServer class=UiInputText type=text autocomplete=off autocorrect=off autocapitalize=off spellcheck=false placeholder='"+ lang.eg_asterisk_server_address +"' value='"+ getDbItem("wssServer", "") +"'></div>";
    AccountHtml += "<div class=UiText>"+ lang.websocket_port +":"+ requiredMarker +"</div>";
    AccountHtml += "<div><input id=Configure_Account_WebSocketPort class=UiInputText type=text autocomplete=off autocorrect=off autocapitalize=off spellcheck=false placeholder='"+ lang.eg_websocket_port +"' value='"+ getDbItem("WebSocketPort", "") +"'></div>";
    AccountHtml += "<div class=UiText>"+ lang.websocket_path +":</div>";
    AccountHtml += "<div><input id=Configure_Account_ServerPath class=UiInputText type=text autocomplete=off autocorrect=off autocapitalize=off spellcheck=false placeholder='"+ lang.eg_websocket_path +"' value='"+ getDbItem("ServerPath", "/ws") +"'></div>";
    AccountHtml += "<div class=UiText>"+ lang.full_name +" ("+ (lang.optional || "optional") +"):</div>";
    AccountHtml += "<div><input id=Configure_Account_profileName class=UiInputText type=text autocomplete=off autocorrect=off autocapitalize=off spellcheck=false placeholder='"+ lang.eg_full_name +"' value='"+ getDbItem("profileName", "") +"'></div>";
    AccountHtml += "<div class=UiText>"+ lang.sip_domain +":"+ requiredMarker +"</div>";
    AccountHtml += "<div><input id=Configure_Account_SipDomain class=UiInputText type=text autocomplete=off autocorrect=off autocapitalize=off spellcheck=false placeholder='"+ lang.eg_sip_domain +"' value='"+ getDbItem("SipDomain", "") +"'></div>";
    AccountHtml += "<div class=UiText>"+ lang.sip_username +":"+ requiredMarker +"</div>";
    AccountHtml += "<div><input id=Configure_Account_SipUsername class=UiInputText type=text autocomplete=off autocorrect=off autocapitalize=off spellcheck=false placeholder='"+ lang.eg_sip_username +"' value='"+ getDbItem("SipUsername", "") +"'></div>";
    AccountHtml += "<div class=UiText>"+ lang.sip_password +":"+ requiredMarker +"</div>";
    AccountHtml += "<div><input id=Configure_Account_SipPassword class=UiInputText type=password autocomplete=off autocorrect=off autocapitalize=off spellcheck=false placeholder='"+ lang.eg_sip_password +"' value='"+ getDbItem("SipPassword", "") +"'></div>";
    AccountHtml += "<div><input type=checkbox id=Configure_Account_Voicemail_Subscribe "+ ((VoiceMailSubscribe == true)? "checked" : "" ) +"><label for=Configure_Account_Voicemail_Subscribe> "+ lang.subscribe_voicemail +"<label></div>";
    AccountHtml += "<div id=Voicemail_Did_row style=\"display:"+ ((VoiceMailSubscribe == true)? "unset" : "none") +"\">";
    AccountHtml += "<div class=UiText style=\"margin-left:20px\">"+ lang.voicemail_did +":</div>";
    AccountHtml += "<div style=\"margin-left:20px\"><input id=Configure_Account_Voicemail_Did class=UiInputText type=text placeholder='"+ lang.eg_internal_subscribe_extension +"' value='"+ getDbItem("VoicemailDid", "") +"'></div>";
    AccountHtml += "</div>";

    AccountHtml += "</div>";
    if(EnableAccountSettings == true && !isSettingsMode) html += AccountHtml;
    if(isSettingsMode) html += "<div class=UiTextHeading onclick=\"ToggleHeading(this,'Audio_Video_Html')\"><i class=\"fa fa fa-video-camera UiTextHeadingIcon\" style=\"background-color:#208e3c\"></i> "+ lang.audio_video +"</div>"

    var AudioVideoHtml = "<div id=Audio_Video_Html style=\"display:"+ (isSettingsMode ? "block" : "none") +"\">";

    AudioVideoHtml += "<div class=UiText>"+ lang.speaker +":</div>";
    AudioVideoHtml += "<div style=\"text-align:center\"><select id=playbackSrc style=\"width:100%\"></select></div>";
    AudioVideoHtml += "<div class=Settings_VolumeOutput_Container><div id=Settings_SpeakerOutput class=Settings_VolumeOutput></div></div>";
    AudioVideoHtml += "<div><button class=roundButtons id=preview_output_play><i class=\"fa fa-play\"></i></button></div>";

    AudioVideoHtml += "<div id=RingDeviceSection>";
    AudioVideoHtml += "<div class=UiText>"+ lang.ring_device +":</div>";
    AudioVideoHtml += "<div style=\"text-align:center\"><select id=ringDevice style=\"width:100%\"></select></div>";
    AudioVideoHtml += "<div class=Settings_VolumeOutput_Container><div id=Settings_RingerOutput class=Settings_VolumeOutput></div></div>";
    AudioVideoHtml += "<div><button class=roundButtons id=preview_ringer_play><i class=\"fa fa-play\"></i></button></div>";
    AudioVideoHtml += "<div class=UiText>"+ (lang.ringtone || "Ringtone") +":</div>";
    AudioVideoHtml += "<div id=Settings_Media_Ringtone_Current class=UiText style=\"font-size:11px;opacity:.8\">(default)</div>";
    AudioVideoHtml += "<input id=Settings_Media_Ringtone type=hidden value=\"\">";
    AudioVideoHtml += "<div style=\"display:flex;gap:8px;align-items:center;margin-top:6px\">";
    AudioVideoHtml += "<input id=Settings_Media_Ringtone_File type=file accept=\"audio/*\" style=\"flex:1\">";
    AudioVideoHtml += "<button class=roundButtons id=Settings_Media_Ringtone_Clear title=\"Clear ringtone\"><i class=\"fa fa-trash\"></i></button>";
    AudioVideoHtml += "</div>";
    AudioVideoHtml += "</div>";

    AudioVideoHtml += "<div class=UiText>"+ lang.microphone +":</div>";
    AudioVideoHtml += "<div style=\"text-align:center\"><select id=microphoneSrc style=\"width:100%\"></select></div>";
    AudioVideoHtml += "<div class=Settings_VolumeOutput_Container><div id=Settings_MicrophoneOutput class=Settings_VolumeOutput></div></div>";
    AudioVideoHtml += "<div><input type=checkbox id=Settings_AutoGainControl><label for=Settings_AutoGainControl> "+ lang.auto_gain_control +"<label></div>";
    AudioVideoHtml += "<div><input type=checkbox id=Settings_EchoCancellation><label for=Settings_EchoCancellation> "+ lang.echo_cancellation +"<label></div>";
    AudioVideoHtml += "<div><input type=checkbox id=Settings_NoiseSuppression><label for=Settings_NoiseSuppression> "+ lang.noise_suppression +"<label></div>";

    if(EnableVideoCalling == true){
        AudioVideoHtml += "<div class=UiText>"+ lang.camera +":</div>";
        AudioVideoHtml += "<div style=\"text-align:center\"><select id=previewVideoSrc style=\"width:100%\"></select></div>";

        AudioVideoHtml += "<div class=UiText>"+ lang.frame_rate +":</div>"
        AudioVideoHtml += "<div class=pill-nav>";
        AudioVideoHtml += "<input name=Settings_FrameRate id=r40 type=radio value=\"2\"><label class=radio_pill for=r40>2</label>";
        AudioVideoHtml += "<input name=Settings_FrameRate id=r41 type=radio value=\"5\"><label class=radio_pill for=r41>5</label>";
        AudioVideoHtml += "<input name=Settings_FrameRate id=r42 type=radio value=\"10\"><label class=radio_pill for=r42>10</label>";
        AudioVideoHtml += "<input name=Settings_FrameRate id=r43 type=radio value=\"15\"><label class=radio_pill for=r43>15</label>";
        AudioVideoHtml += "<input name=Settings_FrameRate id=r44 type=radio value=\"20\"><label class=radio_pill for=r44>20</label>";
        AudioVideoHtml += "<input name=Settings_FrameRate id=r45 type=radio value=\"25\"><label class=radio_pill for=r45>25</label>";
        AudioVideoHtml += "<input name=Settings_FrameRate id=r46 type=radio value=\"30\"><label class=radio_pill for=r46>30</label>";
        AudioVideoHtml += "<input name=Settings_FrameRate id=r47 type=radio value=\"\"><label class=radio_pill for=r47><i class=\"fa fa-trash\"></i></label>";
        AudioVideoHtml += "</div>";

        AudioVideoHtml += "<div class=UiText>"+ lang.quality +":</div>";
        AudioVideoHtml += "<div class=pill-nav>";
        AudioVideoHtml += "<input name=Settings_Quality id=r30 type=radio value=\"160\"><label class=radio_pill for=r30><i class=\"fa fa-video-camera\" style=\"transform: scale(0.4)\"></i> HQVGA</label>";
        AudioVideoHtml += "<input name=Settings_Quality id=r31 type=radio value=\"240\"><label class=radio_pill for=r31><i class=\"fa fa-video-camera\" style=\"transform: scale(0.6)\"></i> QVGA</label>";
        AudioVideoHtml += "<input name=Settings_Quality id=r32 type=radio value=\"480\"><label class=radio_pill for=r32><i class=\"fa fa-video-camera\" style=\"transform: scale(0.8)\"></i> VGA</label>";
        AudioVideoHtml += "<input name=Settings_Quality id=r33 type=radio value=\"720\"><label class=radio_pill for=r33><i class=\"fa fa-video-camera\" style=\"transform: scale(1)\"></i> HD</label>";
        AudioVideoHtml += "<input name=Settings_Quality id=r34 type=radio value=\"\"><label class=radio_pill for=r34><i class=\"fa fa-trash\"></i></label>";
        AudioVideoHtml += "</div>";

        AudioVideoHtml += "<div class=UiText>"+ lang.image_orientation +":</div>";
        AudioVideoHtml += "<div class=pill-nav>";
        AudioVideoHtml += "<input name=Settings_Orientation id=r20 type=radio value=\"rotateY(0deg)\"><label class=radio_pill for=r20><i class=\"fa fa-address-card\" style=\"transform: rotateY(0deg)\"></i> "+ lang.image_orientation_normal +"</label>";
        AudioVideoHtml += "<input name=Settings_Orientation id=r21 type=radio value=\"rotateY(180deg)\"><label class=radio_pill for=r21><i class=\"fa fa-address-card\" style=\"transform: rotateY(180deg)\"></i> "+ lang.image_orientation_mirror +"</label>";
        AudioVideoHtml += "</div>";

        AudioVideoHtml += "<div class=UiText>"+ lang.aspect_ratio +":</div>";
        AudioVideoHtml += "<div class=pill-nav>";
        AudioVideoHtml += "<input name=Settings_AspectRatio id=r10 type=radio value=\"1\"><label class=radio_pill for=r10><i class=\"fa fa-square-o\" style=\"transform: scaleX(1); margin-left: 7px; margin-right: 7px\"></i> 1:1</label>";
        AudioVideoHtml += "<input name=Settings_AspectRatio id=r11 type=radio value=\"1.33\"><label class=radio_pill for=r11><i class=\"fa fa-square-o\" style=\"transform: scaleX(1.33); margin-left: 5px; margin-right: 5px;\"></i> 4:3</label>";
        AudioVideoHtml += "<input name=Settings_AspectRatio id=r12 type=radio value=\"1.77\"><label class=radio_pill for=r12><i class=\"fa fa-square-o\" style=\"transform: scaleX(1.77); margin-right: 3px;\"></i> 16:9</label>";
        AudioVideoHtml += "<input name=Settings_AspectRatio id=r13 type=radio value=\"\"><label class=radio_pill for=r13><i class=\"fa fa-trash\"></i></label>";
        AudioVideoHtml += "</div>";

        AudioVideoHtml += "<div class=UiText>"+ lang.preview +":</div>";
        AudioVideoHtml += "<div style=\"text-align:center; margin-top:10px\"><video id=local-video-preview class=previewVideo muted playsinline></video></div>";
    }

    AudioVideoHtml += "</div>";

    if(isSettingsMode) html += AudioVideoHtml;
    if(isSettingsMode && EnableNotificationSettings == true) {
        html += "<div class=UiTextHeading onclick=\"ToggleHeading(this,'Notifications_Html')\"><i class=\"fa fa-bell UiTextHeadingIcon\" style=\"background-color:#ab8e04\"></i> "+ lang.notifications +"</div>"
    }

    var NotificationsHtml = "<div id=Notifications_Html style=\"display:none\">";
    NotificationsHtml += "<div class=UiText>"+ lang.notifications +":</div>";
    NotificationsHtml += "<div><input type=checkbox id=Settings_Notifications><label for=Settings_Notifications> "+ lang.enable_onscreen_notifications +"<label></div>";
    NotificationsHtml += "</div>";

    if(isSettingsMode && EnableNotificationSettings == true) html += NotificationsHtml;

    html += "</div>";
    html += "</div>";
    html += "</div>";

    $("#tabBarRow").show();
    $("#actionArea").html(html);
    var buttons = [];
    buttons.push({
        text: lang.save,
        action: function(){

            if(EnableAccountSettings && !isSettingsMode){
                var requiredIds = [
                    "#Configure_Account_wssServer",
                    "#Configure_Account_WebSocketPort",
                    "#Configure_Account_SipDomain",
                    "#Configure_Account_SipUsername",
                    "#Configure_Account_SipPassword"
                ];
                for(var i = 0; i < requiredIds.length; i++){
                    var field = $(requiredIds[i]);
                    if(field.length > 0 && String(field.val() || "").trim() == ""){
                        Alert(lang.required_fields_message || "Please fill all required fields (*).", lang.error);
                        field.focus();
                        return;
                    }
                }
            }
            if(localDB.getItem("profileUserID") == null) localDB.setItem("profileUserID", uID());
            if(EnableAccountSettings && !isSettingsMode){
                var sipUsernameValue = String($("#Configure_Account_SipUsername").val() || "").trim();
                var profileNameValue = String($("#Configure_Account_profileName").val() || "").trim();
                localDB.setItem("wssServer", String($("#Configure_Account_wssServer").val() || "").trim());
                localDB.setItem("WebSocketPort", String($("#Configure_Account_WebSocketPort").val() || "").trim());
                localDB.setItem("ServerPath", String($("#Configure_Account_ServerPath").val() || "").trim());
                localDB.setItem("profileName", (profileNameValue != "") ? profileNameValue : sipUsernameValue);
                localDB.setItem("SipDomain", String($("#Configure_Account_SipDomain").val() || "").trim());
                localDB.setItem("SipUsername", sipUsernameValue);
                normalizedSipAuth = NormalizeSipPasswordAndType($("#Configure_Account_SipPassword").val(), null);
                localDB.setItem("SipPassword", normalizedSipAuth.password);
                localDB.setItem("SipPasswordType", normalizedSipAuth.type);
                localDB.setItem("VoiceMailSubscribe", ($("#Configure_Account_Voicemail_Subscribe").is(':checked'))? "1" : "0");
                localDB.setItem("VoicemailDid", $("#Configure_Account_Voicemail_Did").val());

            }
            if(isSettingsMode){
                localDB.setItem("AudioOutputId", $("#playbackSrc").val());
                localDB.setItem("AudioSrcId", $("#microphoneSrc").val());
                localDB.setItem("AutoGainControl", ($("#Settings_AutoGainControl").is(':checked'))? "1" : "0");
                localDB.setItem("EchoCancellation", ($("#Settings_EchoCancellation").is(':checked'))? "1" : "0");
                localDB.setItem("NoiseSuppression", ($("#Settings_NoiseSuppression").is(':checked'))? "1" : "0");
                localDB.setItem("RingOutputId", $("#ringDevice").val());
            }

            if(isSettingsMode && EnableVideoCalling == true){
                localDB.setItem("VideoSrcId", $("#previewVideoSrc").val());
                localDB.setItem("VideoHeight", $("input[name=Settings_Quality]:checked").val());
                localDB.setItem("FrameRate", $("input[name=Settings_FrameRate]:checked").val());
                localDB.setItem("AspectRatio", $("input[name=Settings_AspectRatio]:checked").val());
                localDB.setItem("VideoOrientation", $("input[name=Settings_Orientation]:checked").val());
            }
            if(isSettingsMode && EnableNotificationSettings){
                localDB.setItem("Notifications", ($("#Settings_Notifications").is(":checked"))? "1" : "0");
                localDB.setItem(mediaConfigStorageKeys.ringtone, sanitizeMediaConfigValue($("#Settings_Media_Ringtone").val()));
            }

            window.location.reload();

        }
    });
    buttons.push({
        text: lang.cancel,
        action: function(){
            ShowTab(returnTab);
        }
    });
    if(!isSettingsMode && EnableAccountSettings){
        buttons.push({
            text: (lang.clear_extension_config || "Clear Extension Config"),
            action: function(){
                Confirm((lang.confirm_clear_extension_config || "Clear all saved extension configuration?"), (lang.clear_extension_config || "Clear Extension Config"), function(){
                    var keysToRemove = [
                        "wssServer",
                        "WebSocketPort",
                        "ServerPath",
                        "profileName",
                        "SipDomain",
                        "SipUsername",
                        "SipPassword",
                        "SipPasswordType",
                        "VoiceMailSubscribe",
                        "VoicemailDid"
                    ];
                    for(var i = 0; i < keysToRemove.length; i++){
                        localDB.removeItem(keysToRemove[i]);
                    }
                    window.location.reload();
                });
            }
        });
    }
    if(isSettingsMode){
        buttons.push({
            text: (lang.reset || "Reset") + " " + (lang.settings_menu || "Settings"),
            action: function(){
                Confirm((lang.confirm_reset_settings || "Reset all settings to default values?"), (lang.settings_menu || "Settings"), function(){
                    var settingKeysToRemove = [
                        "AudioOutputId",
                        "AudioSrcId",
                        "AutoGainControl",
                        "EchoCancellation",
                        "NoiseSuppression",
                        "RingOutputId",
                        "VideoSrcId",
                        "VideoHeight",
                        "FrameRate",
                        "AspectRatio",
                        "VideoOrientation",
                        "Notifications",
                        "MediaConfig_Ringtone",
                        "EnableVideoCalling",
                        "EnableTextMessaging",
                        "EnableTransfer",
                        "EnableConference",
                        "RecordAllCalls",
                        "CallRecordingPolicy",
                        "AutoAnswerPolicy",
                        "DoNotDisturbPolicy",
                        "CallWaitingPolicy",
                        "KeyboardShortcuts",
                        "DisableBuddies",
                        "DisableFreeDial",
                        "IceStunServerJson",
                        "Language",
                        "Theme",
                        "UiThemeStyle"
                    ];
                    for(var i = 0; i < settingKeysToRemove.length; i++){
                        localDB.removeItem(settingKeysToRemove[i]);
                    }
                    window.location.reload();
                });
            }
        });
    }
    RenderConfigActionBar(buttons);
    $("#actionArea").show();
    window.setTimeout(function(){
        if(EnableAccountSettings){
            $("#Configure_Account_Voicemail_Subscribe").change(function(){
                if($("#Configure_Account_Voicemail_Subscribe").is(':checked')){
                    $("#Voicemail_Did_row").show();
                } else {
                    $("#Voicemail_Did_row").hide();
                }
            });
        }

        if(!isSettingsMode){
            return;
        }
        var playButton = $("#preview_output_play");
        playButton.click(function(){

            try{
                window.SettingsOutputAudio.pause();
            }
            catch(e){}
            window.SettingsOutputAudio = null;

            try{
                var tracks = window.SettingsOutputStream.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });
            }
            catch(e){}
            window.SettingsOutputStream = null;

            try{
                var soundMeter = window.SettingsOutputStreamMeter;
                soundMeter.stop();
            }
            catch(e){}
            window.SettingsOutputStreamMeter = null;
            var audioObj = new Audio(audioBlobs.Ringtone.blob);
            audioObj.preload = "auto";
            audioObj.onplay = function(){
                var outputStream = new MediaStream();
                if (typeof audioObj.captureStream !== 'undefined') {
                    outputStream = audioObj.captureStream();
                }
                else if (typeof audioObj.mozCaptureStream !== 'undefined') {
                    return;
                    outputStream = audioObj.mozCaptureStream();
                }
                else if (typeof audioObj.webkitCaptureStream !== 'undefined') {
                    outputStream = audioObj.webkitCaptureStream();
                }
                else {
                    console.warn("Cannot display Audio Levels")
                    return;
                }
                window.SettingsOutputStream = outputStream;
                window.SettingsOutputStreamMeter = MeterSettingsOutput(outputStream, "Settings_SpeakerOutput", "width", 50);
            }
            audioObj.onloadeddata = function(e) {
                if (typeof audioObj.sinkId !== 'undefined') {
                    audioObj.setSinkId(selectAudioScr.val()).then(function() {
                        console.log("Set sinkId to:", selectAudioScr.val());
                    }).catch(function(e){
                        console.warn("Failed not apply setSinkId.", e);
                    });
                }
                PlayMediaElementSafely(audioObj, "settings-speaker-preview");
                console.log("Playing sample audio file... ");
            }

            window.SettingsOutputAudio = audioObj;
        });

        var playRingButton = $("#preview_ringer_play");
        playRingButton.click(function(){

            try{
                window.SettingsRingerAudio.pause();
            }
            catch(e){}
            window.SettingsRingerAudio = null;

            try{
                var tracks = window.SettingsRingerStream.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });
            }
            catch(e){}
            window.SettingsRingerStream = null;

            try{
                var soundMeter = window.SettingsRingerStreamMeter;
                soundMeter.stop();
            }
            catch(e){}
            window.SettingsRingerStreamMeter = null;
            var audioObj = new Audio(audioBlobs.Ringtone.blob);
            audioObj.preload = "auto";
            audioObj.onplay = function(){
                var outputStream = new MediaStream();
                if (typeof audioObj.captureStream !== 'undefined') {
                    outputStream = audioObj.captureStream();
                }
                else if (typeof audioObj.mozCaptureStream !== 'undefined') {
                    return;
                    outputStream = audioObj.mozCaptureStream();
                }
                else if (typeof audioObj.webkitCaptureStream !== 'undefined') {
                    outputStream = audioObj.webkitCaptureStream();
                }
                else {
                    console.warn("Cannot display Audio Levels")
                    return;
                }
                window.SettingsRingerStream = outputStream;
                window.SettingsRingerStreamMeter = MeterSettingsOutput(outputStream, "Settings_RingerOutput", "width", 50);
            }
            audioObj.onloadeddata = function(e) {
                if (typeof audioObj.sinkId !== 'undefined') {
                    audioObj.setSinkId(selectRingDevice.val()).then(function() {
                        console.log("Set sinkId to:", selectRingDevice.val());
                    }).catch(function(e){
                        console.warn("Failed not apply setSinkId.", e);
                    });
                }
                PlayMediaElementSafely(audioObj, "settings-ringer-preview");
                console.log("Playing sample audio file... ");
            }

            window.SettingsRingerAudio = audioObj;
        });
        var selectAudioScr = $("#playbackSrc");
        selectAudioScr.change(function(){
            console.log("Call to change Speaker ("+ this.value +")");

            var audioObj = window.SettingsOutputAudio;
            if(audioObj != null) {
                if (typeof audioObj.sinkId !== 'undefined') {
                    audioObj.setSinkId(this.value).then(function() {
                        console.log("sinkId applied to audioObj:", this.value);
                    }).catch(function(e){
                        console.warn("Failed not apply setSinkId.", e);
                    });
                }
            }
        });
        var selectMicScr = $("#microphoneSrc");
        $("#Settings_AutoGainControl").prop("checked", AutoGainControl);
        $("#Settings_EchoCancellation").prop("checked", EchoCancellation);
        $("#Settings_NoiseSuppression").prop("checked", NoiseSuppression);
        selectMicScr.change(function(){
            console.log("Call to change Microphone ("+ this.value +")");
            try{
                var tracks = window.SettingsMicrophoneStream.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });
                window.SettingsMicrophoneStream = null;
            }
            catch(e){}

            try{
                soundMeter = window.SettingsMicrophoneSoundMeter;
                soundMeter.stop();
                window.SettingsMicrophoneSoundMeter = null;
            }
            catch(e){}
            var constraints = {
                audio: {
                    deviceId: { exact: this.value }
                },
                video: false
            }
            var localMicrophoneStream = new MediaStream();
            navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream){
                var audioTrack = mediaStream.getAudioTracks()[0];
                if(audioTrack != null){
                    localMicrophoneStream.addTrack(audioTrack);
                    window.SettingsMicrophoneStream = localMicrophoneStream;
                    window.SettingsMicrophoneSoundMeter = MeterSettingsOutput(localMicrophoneStream, "Settings_MicrophoneOutput", "width", 50);
                }
            }).catch(function(e){
                console.log("Failed to getUserMedia", e);
            });
        });
        var selectRingTone = $("#ringTone");
        var selectRingDevice = $("#ringDevice");

        if(EnableVideoCalling == true){
            var selectVideoScr = $("#previewVideoSrc");
            selectVideoScr.change(function(){
                console.log("Call to change WebCam ("+ this.value +")");

                var localVideo = $("#local-video-preview").get(0);
                localVideo.muted = true;
                localVideo.playsinline = true;
                localVideo.autoplay = true;

                var tracks = localVideo.srcObject.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });

                var constraints = {
                    audio: false,
                    video: {
                        deviceId: (this.value != "default")? { exact: this.value } : "default"
                    }
                }
                if($("input[name=Settings_FrameRate]:checked").val() != ""){
                    constraints.video.frameRate = $("input[name=Settings_FrameRate]:checked").val();
                }
                if($("input[name=Settings_Quality]:checked").val() != ""){
                    constraints.video.height = $("input[name=Settings_Quality]:checked").val();
                }
                if($("input[name=Settings_AspectRatio]:checked").val() != ""){
                    constraints.video.aspectRatio = $("input[name=Settings_AspectRatio]:checked").val();
                }
                console.log("Constraints:", constraints);
                var localStream = new MediaStream();
                if(navigator.mediaDevices){
                    navigator.mediaDevices.getUserMedia(constraints).then(function(newStream){
                        var videoTrack = newStream.getVideoTracks()[0];
                        localStream.addTrack(videoTrack);
                        localVideo.srcObject = localStream;
                        localVideo.onloadedmetadata = function(e) {
                            localVideo.play();
                        }
                    }).catch(function(e){
                        console.error(e);
                        Alert(lang.alert_error_user_media, lang.error);
                    });
                }
            });
            var OriteationSel = $("input[name=Settings_Orientation]");
            OriteationSel.each(function(){
                if(this.value == MirrorVideo) $(this).prop("checked", true);
            });
            $("#local-video-preview").css("transform", MirrorVideo);
            OriteationSel.change(function(){
                console.log("Call to change Orientation ("+ this.value +")");
                $("#local-video-preview").css("transform", this.value);
            });
            var frameRateSel = $("input[name=Settings_FrameRate]");
            frameRateSel.each(function(){
                if(this.value == maxFrameRate) $(this).prop("checked", true);
            });
            frameRateSel.change(function(){
                console.log("Call to change Frame Rate ("+ this.value +")");

                var localVideo = $("#local-video-preview").get(0);
                localVideo.muted = true;
                localVideo.playsinline = true;
                localVideo.autoplay = true;

                var tracks = localVideo.srcObject.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });

                var constraints = {
                    audio: false,
                    video: {
                        deviceId: (selectVideoScr.val() != "default")? { exact: selectVideoScr.val() } : "default" ,
                    }
                }
                if(this.value != ""){
                    constraints.video.frameRate = this.value;
                }
                if($("input[name=Settings_Quality]:checked").val() != ""){
                    constraints.video.height = $("input[name=Settings_Quality]:checked").val();
                }
                if($("input[name=Settings_AspectRatio]:checked").val() != ""){
                    constraints.video.aspectRatio = $("input[name=Settings_AspectRatio]:checked").val();
                }
                console.log("Constraints:", constraints);
                var localStream = new MediaStream();
                if(navigator.mediaDevices){
                    navigator.mediaDevices.getUserMedia(constraints).then(function(newStream){
                        var videoTrack = newStream.getVideoTracks()[0];
                        localStream.addTrack(videoTrack);
                        localVideo.srcObject = localStream;
                        localVideo.onloadedmetadata = function(e) {
                            localVideo.play();
                        }
                    }).catch(function(e){
                        console.error(e);
                        Alert(lang.alert_error_user_media, lang.error);
                    });
                }
            });
            var QualitySel = $("input[name=Settings_Quality]");
            QualitySel.each(function(){
                if(this.value == videoHeight) $(this).prop("checked", true);
            });
            QualitySel.change(function(){
                console.log("Call to change Video Height ("+ this.value +")");

                var localVideo = $("#local-video-preview").get(0);
                localVideo.muted = true;
                localVideo.playsinline = true;
                localVideo.autoplay = true;

                var tracks = localVideo.srcObject.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });

                var constraints = {
                    audio: false,
                    video: {
                        deviceId: (selectVideoScr.val() != "default")? { exact: selectVideoScr.val() } : "default" ,
                    }
                }
                if($("input[name=Settings_FrameRate]:checked").val() != ""){
                    constraints.video.frameRate = $("input[name=Settings_FrameRate]:checked").val();
                }
                if(this.value){
                    constraints.video.height = this.value;
                }
                if($("input[name=Settings_AspectRatio]:checked").val() != ""){
                    constraints.video.aspectRatio = $("input[name=Settings_AspectRatio]:checked").val();
                }
                console.log("Constraints:", constraints);
                var localStream = new MediaStream();
                if(navigator.mediaDevices){
                    navigator.mediaDevices.getUserMedia(constraints).then(function(newStream){
                        var videoTrack = newStream.getVideoTracks()[0];
                        localStream.addTrack(videoTrack);
                        localVideo.srcObject = localStream;
                        localVideo.onloadedmetadata = function(e) {
                            localVideo.play();
                        }
                    }).catch(function(e){
                        console.error(e);
                        Alert(lang.alert_error_user_media, lang.error);
                    });
                }
            });
            var AspectRatioSel = $("input[name=Settings_AspectRatio]");
            AspectRatioSel.each(function(){
                if(this.value == videoAspectRatio) $(this).prop("checked", true);
            });
            AspectRatioSel.change(function(){
                console.log("Call to change Aspect Ratio ("+ this.value +")");

                var localVideo = $("#local-video-preview").get(0);
                localVideo.muted = true;
                localVideo.playsinline = true;
                localVideo.autoplay = true;

                var tracks = localVideo.srcObject.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });

                var constraints = {
                    audio: false,
                    video: {
                        deviceId: (selectVideoScr.val() != "default")? { exact: selectVideoScr.val() } : "default"
                    }
                }
                if($("input[name=Settings_FrameRate]:checked").val() != ""){
                    constraints.video.frameRate = $("input[name=Settings_FrameRate]:checked").val();
                }
                if($("input[name=Settings_Quality]:checked").val() != ""){
                    constraints.video.height = $("input[name=Settings_Quality]:checked").val();
                }
                if(this.value != ""){
                    constraints.video.aspectRatio = this.value;
                }
                console.log("Constraints:", constraints);
                var localStream = new MediaStream();
                if(navigator.mediaDevices){
                    navigator.mediaDevices.getUserMedia(constraints).then(function(newStream){
                        var videoTrack = newStream.getVideoTracks()[0];
                        localStream.addTrack(videoTrack);
                        localVideo.srcObject = localStream;
                        localVideo.onloadedmetadata = function(e) {
                            localVideo.play();
                        }
                    }).catch(function(e){
                        console.error(e);
                        Alert(lang.alert_error_user_media, lang.error);
                    });
                }
            });
            var localVideo = $("#local-video-preview").get(0);
            localVideo.muted = true;
            localVideo.playsinline = true;
            localVideo.autoplay = true;
        }

        if(navigator.mediaDevices){
            navigator.mediaDevices.enumerateDevices().then(function(deviceInfos){
                var savedVideoDevice = getVideoSrcID();
                var videoDeviceFound = false;

                var savedAudioDevice = getAudioSrcID();
                var audioDeviceFound = false;

                var MicrophoneFound = false;
                var SpeakerFound = false;
                var VideoFound = false;

                for (var i = 0; i < deviceInfos.length; ++i) {
                    console.log("Found Device ("+ deviceInfos[i].kind +"): ", deviceInfos[i].label);
                    if (deviceInfos[i].kind === "audioinput") {
                        MicrophoneFound = true;
                        if(savedAudioDevice != "default" && deviceInfos[i].deviceId == savedAudioDevice) {
                            audioDeviceFound = true;
                        }
                    }
                    else if (deviceInfos[i].kind === "audiooutput") {
                        SpeakerFound = true;
                    }
                    else if (deviceInfos[i].kind === "videoinput") {
                        if(EnableVideoCalling == true){
                            VideoFound = true;
                            if(savedVideoDevice != "default" && deviceInfos[i].deviceId == savedVideoDevice) {
                                videoDeviceFound = true;
                            }
                        }
                    }
                }

                var contraints = {
                    audio: MicrophoneFound,
                    video: VideoFound
                }

                if(MicrophoneFound){
                    contraints.audio = { deviceId: "default" }
                    if(audioDeviceFound) contraints.audio.deviceId = { exact: savedAudioDevice }
                }

                if(EnableVideoCalling == true){
                    if(VideoFound){
                        contraints.video = { deviceId: "default" }
                        if(videoDeviceFound) contraints.video.deviceId = { exact: savedVideoDevice }
                    }
                    if($("input[name=Settings_FrameRate]:checked").val() != ""){
                        contraints.video.frameRate = $("input[name=Settings_FrameRate]:checked").val();
                    }
                    if($("input[name=Settings_Quality]:checked").val() != ""){
                        contraints.video.height = $("input[name=Settings_Quality]:checked").val();
                    }
                    if($("input[name=Settings_AspectRatio]:checked").val() != ""){
                        contraints.video.aspectRatio = $("input[name=Settings_AspectRatio]:checked").val();
                    }
                }
                console.log("Get User Media", contraints);
                navigator.mediaDevices.getUserMedia(contraints).then(function(mediaStream){
                    settingsMicrophoneStreamTrack = (mediaStream.getAudioTracks().length >= 1)? mediaStream.getAudioTracks()[0] : null ;
                    if(MicrophoneFound && settingsMicrophoneStreamTrack != null){
                        settingsMicrophoneStream = new MediaStream();
                        settingsMicrophoneStream.addTrack(settingsMicrophoneStreamTrack);
                        settingsMicrophoneSoundMeter = MeterSettingsOutput(settingsMicrophoneStream, "Settings_MicrophoneOutput", "width", 50);
                    }
                    else {
                        console.warn("No microphone devices found. Calling will not be possible.")
                    }
                    $("#Settings_SpeakerOutput").css("width", "0%");
                    $("#Settings_RingerOutput").css("width", "0%");
                    if(!SpeakerFound){
                        console.log("No speaker devices found, make sure one is plugged in.")
                        $("#playbackSrc").hide();
                        $("#RingDeviceSection").hide();
                    }

                    if(EnableVideoCalling == true){
                        settingsVideoStreamTrack = (mediaStream.getVideoTracks().length >= 1)? mediaStream.getVideoTracks()[0] : null;
                        if(VideoFound && settingsVideoStreamTrack != null){
                            settingsVideoStream = new MediaStream();
                            settingsVideoStream.addTrack(settingsVideoStreamTrack);
                            localVideo.srcObject = settingsVideoStream;
                            localVideo.onloadedmetadata = function(e) {
                                localVideo.play();
                            }
                        }
                        else {
                            console.warn("No video / webcam devices found. Video Calling will not be possible.")
                        }
                    }
                    return navigator.mediaDevices.enumerateDevices();
                }).then(function(deviceInfos){
                    PopulateSettingsDeviceOptions(deviceInfos, selectMicScr, selectAudioScr, selectRingDevice, (EnableVideoCalling == true)? selectVideoScr : null);
                }).catch(function(e){
                    console.error(e);
                    navigator.mediaDevices.enumerateDevices().then(function(fallbackDeviceInfos){
                        var counts = PopulateSettingsDeviceOptions(fallbackDeviceInfos, selectMicScr, selectAudioScr, selectRingDevice, (EnableVideoCalling == true)? selectVideoScr : null);
                        if(counts.audioinput == 0) console.warn("No microphone devices found or microphone permission is unavailable.");
                        if(counts.audiooutput == 0) {
                            console.warn("No speaker devices found, make sure one is plugged in.");
                            $("#playbackSrc").hide();
                            $("#RingDeviceSection").hide();
                        }
                    }).catch(function(fallbackError){
                        console.error("Error getting Media Devices", fallbackError);
                    });
                });
            }).catch(function(e){
                console.error("Error getting Media Devices", e);
            });
        }
        else {
            Alert(lang.alert_media_devices, lang.error);
        }
        if(EnableNotificationSettings){
            var NotificationsCheck = $("#Settings_Notifications");
            NotificationsCheck.prop("checked", NotificationsActive);
            NotificationsCheck.change(function(){
                if(this.checked){
                    if(Notification.permission != "granted"){
                        if(checkNotificationPromise()){
                            Notification.requestPermission().then(function(p){
                                console.log(p);
                                HandleNotifyPermission(p);
                            });
                        }
                        else {
                            Notification.requestPermission(function(p){
                                console.log(p);
                                HandleNotifyPermission(p)
                            });
                        }
                    }
                }
            });
        }
        var effectiveMediaConfig = getEffectiveMediaConfig();
        $("#Settings_Media_Ringtone").val(effectiveMediaConfig.ringtone);
        $("#Settings_Media_Ringtone_Current").text(effectiveMediaConfig.ringtone ? "custom file selected" : "(default)");
        var ringtoneFileInput = $("#Settings_Media_Ringtone_File");
        ringtoneFileInput.change(async function(){
            var inputEl = ringtoneFileInput.get(0);
            if(!inputEl || !inputEl.files || inputEl.files.length === 0) return;
            try{
                var dataUri = await convertRingtoneFileToDataUri(inputEl.files[0]);
                $("#Settings_Media_Ringtone").val(dataUri);
                $("#Settings_Media_Ringtone_Current").text(inputEl.files[0].name || "custom file selected");
            } catch(err){
                console.error(err);
                Alert(err && err.message ? err.message : "Cannot process ringtone file.", lang.error);
            } finally {
                ringtoneFileInput.val("");
            }
        });
        $("#Settings_Media_Ringtone_Clear").click(function(e){
            e.preventDefault();
            $("#Settings_Media_Ringtone").val("");
            $("#Settings_Media_Ringtone_Current").text("(default)");
            ringtoneFileInput.val("");
        });


    }, 0);
}
function RefreshRegistration(){
    Unregister();
    console.log("Unregister complete...");
    window.setTimeout(function(){
        console.log("Starting registration...");
        Register();
    }, 1000);
}
function ToggleHeading(obj, div){
    $("#"+ div).toggle();
}
function ToggleAutoAnswer(){
    if(AutoAnswerPolicy == "disabled"){
        AutoAnswerEnabled = false;
            console.warn("Policy AutoAnswer: Disabled");
            UpdateDialpadSettingButtons();
            return;
        }
    AutoAnswerEnabled = (AutoAnswerEnabled == true)? false : true;
    if(AutoAnswerPolicy == "enabled") AutoAnswerEnabled = true;
    localDB.setItem("AutoAnswerEnabled", (AutoAnswerEnabled == true)? "1" : "0");
    console.log("AutoAnswer:", AutoAnswerEnabled);
    UpdateDialpadSettingButtons();
}
function ToggleDoNoDisturb(){
    if(DoNotDisturbPolicy == "disabled"){
        DoNotDisturbEnabled = false;
        localDB.setItem("DoNotDisturbEnabled", "0");
        ApplyDoNotDisturbState();
        console.warn("Policy DoNotDisturb: Disabled");
        return;
    }
    if(DoNotDisturbPolicy == "enabled") {
        DoNotDisturbEnabled = true;
        localDB.setItem("DoNotDisturbEnabled", "1");
        ApplyDoNotDisturbState();
        console.warn("Policy DoNotDisturb: Enabled");
        return;
    }
    if(DoNotDisturbEnabled == true){

        DoNotDisturbEnabled = false
        localDB.setItem("DoNotDisturbEnabled", "0");
        ApplyDoNotDisturbState();
        if(typeof web_hook_disable_dnd !== 'undefined') {
            web_hook_disable_dnd();
        }
    } else {

        DoNotDisturbEnabled = true
        localDB.setItem("DoNotDisturbEnabled", "1");
        ApplyDoNotDisturbState();
        if(typeof web_hook_enable_dnd !== 'undefined') {
            web_hook_enable_dnd();
        }
    }
    console.log("DoNotDisturb", DoNotDisturbEnabled);
}
function ToggleCallWaiting(){
    if(CallWaitingPolicy == "disabled"){
        CallWaitingEnabled = false;
        console.warn("Policy CallWaiting: Disabled");
        return;
    }
    CallWaitingEnabled = (CallWaitingEnabled == true)? false : true;
    if(CallWaitingPolicy == "enabled") CallWaitingPolicy = true;
    localDB.setItem("CallWaitingEnabled", (CallWaitingEnabled == true)? "1" : "0");
    console.log("CallWaiting", CallWaitingEnabled);
}
function ToggleRecordAllCalls(){
    if(CallRecordingPolicy == "disabled"){
        RecordAllCalls = false;
        console.warn("Policy CallRecording: Disabled");
        return;
    }
    RecordAllCalls = (RecordAllCalls == true)? false : true;
    if(CallRecordingPolicy == "enabled") RecordAllCalls = true;
    localDB.setItem("RecordAllCalls", (RecordAllCalls == true)? "1" : "0");
    console.log("RecordAllCalls", RecordAllCalls);
}
function ChangeSettings(lineNum, obj){
    if(UiCustomMediaSettings){
        if(typeof web_hook_on_edit_media !== 'undefined') {
            web_hook_on_edit_media(lineNum, obj);
        }
        return;
    }
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) {
        console.warn("SIP Session is NULL.");
        return;
    }
    var session = lineObj.SipSession;
    if(!navigator.mediaDevices) {
        console.warn("navigator.mediaDevices not possible.");
        return;
    }

    var items = [];
    items.push({value: "", icon : null, text: lang.microphone, isHeader: true });
    for (var i = 0; i < AudioinputDevices.length; ++i) {
        var deviceInfo = AudioinputDevices[i];
        var devideId = deviceInfo.deviceId;
        var DisplayName = (deviceInfo.label)? deviceInfo.label : "Microphone";
        if(DisplayName.indexOf("(") > 0) DisplayName = DisplayName.substring(0,DisplayName.indexOf("("));
        var disabled = (session.data.AudioSourceDevice == devideId);

        items.push({value: "input-"+ devideId, icon : "fa fa-microphone", text: DisplayName, isDisabled : disabled });
    }
    if(HasSpeakerDevice){
        items.push({value: "", icon : null, text: "-" });
        items.push({value: "", icon : null, text: lang.speaker, isHeader: true });
        for (var i = 0; i < SpeakerDevices.length; ++i) {
            var deviceInfo = SpeakerDevices[i];
            var devideId = deviceInfo.deviceId;
            var DisplayName = (deviceInfo.label)? deviceInfo.label : "Speaker";
            if(DisplayName.indexOf("(") > 0) DisplayName = DisplayName.substring(0,DisplayName.indexOf("("));
            var disabled = (session.data.AudioOutputDevice == devideId);

            items.push({value: "output-"+ devideId, icon : "fa fa-volume-up", text: DisplayName, isDisabled : disabled });
        }
    }
    if(session.data.withvideo == true){
        items.push({value: "", icon : null, text: "-" });
        items.push({value: "", icon : null, text: lang.camera, isHeader: true });
        for (var i = 0; i < VideoinputDevices.length; ++i) {
            var deviceInfo = VideoinputDevices[i];
            var devideId = deviceInfo.deviceId;
            var DisplayName = (deviceInfo.label)? deviceInfo.label : "Webcam";
            if(DisplayName.indexOf("(") > 0) DisplayName = DisplayName.substring(0,DisplayName.indexOf("("));
            var disabled = (session.data.VideoSourceDevice == devideId);

            items.push({value: "video-"+ devideId, icon : "fa fa-video-camera", text: DisplayName, isDisabled : disabled });
        }
    }

    var menu = {
        selectEvent : function( event, ui ) {
            var id = ui.item.attr("value");
            if(id != null) {
                if(id.indexOf("input-") > -1){
                    var newid = id.replace("input-", "");

                    console.log("Call to change Microphone: ", newid);

                    HidePopup();
                    if(lineObj.LocalSoundMeter) lineObj.LocalSoundMeter.stop();
                    session.data.AudioSourceDevice = newid;

                    var constraints = {
                        audio: {
                            deviceId: (newid != "default")? { exact: newid } : "default"
                        },
                        video: false
                    }
                    navigator.mediaDevices.getUserMedia(constraints).then(function(newStream){
                        var newMediaTrack = newStream.getAudioTracks()[0];
                        var pc = session.sessionDescriptionHandler.peerConnection;
                        pc.getSenders().forEach(function (RTCRtpSender) {
                            if(RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                                console.log("Switching Audio Track : "+ RTCRtpSender.track.label + " to "+ newMediaTrack.label);
                                RTCRtpSender.track.stop();
                                RTCRtpSender.replaceTrack(newMediaTrack).then(function(){
                                    if(lineObj.LocalSoundMeter) lineObj.LocalSoundMeter.stop();
                                    lineObj.LocalSoundMeter = StartLocalAudioMediaMonitoring(lineNum, session);
                                }).catch(function(e){
                                    console.error("Error replacing track: ", e);
                                });
                            }
                        });
                    }).catch(function(e){
                        console.error("Error on getUserMedia");
                    });
                }
                if(id.indexOf("output-") > -1){
                    var newid = id.replace("output-", "");

                    console.log("Call to change Speaker: ", newid);

                    HidePopup();
                    session.data.AudioOutputDevice = newid;
                    var sinkId = newid;
                    console.log("Attempting to set Audio Output SinkID for line "+ lineNum +" [" + sinkId + "]");
                    var element = $("#line-"+ lineNum +"-remoteAudio").get(0);
                    if(element) {
                        if (typeof element.sinkId !== 'undefined') {
                            element.setSinkId(sinkId).then(function(){
                                console.log("sinkId applied: "+ sinkId);
                            }).catch(function(e){
                                console.warn("Error using setSinkId: ", e);
                            });
                        } else {
                            console.warn("setSinkId() is not possible using this browser.")
                        }
                    }
                }
                if(id.indexOf("video-") > -1){
                    var newid = id.replace("video-", "");

                    console.log("Call to change WebCam");

                    HidePopup();

                    switchVideoSource(lineNum, newid);
                }
            }
            else {
                HidePopup();
            }
        },
        createEvent : null,
        autoFocus : true,
        items : items
    }
    PopupMenu(obj, menu);
}
function PresentCamera(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", true);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", false);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", false);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", false);

    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").show();
    $("#line-"+ lineNum + "-remote-videos").show();
    RedrawStage(lineNum, true);

    switchVideoSource(lineNum, session.data.VideoSourceDevice);
}
function PresentScreen(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", false);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", false);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", true);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", false);

    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").show();
    $("#line-"+ lineNum + "-remote-videos").show();

    ShareScreen(lineNum);
}
function PresentScratchpad(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", false);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", true);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", false);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", false);

    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").show();
    $("#line-"+ lineNum + "-remote-videos").hide();

    SendCanvas(lineNum);
}
function PresentVideo(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    var html = "<div class=\"UiWindowField\"><input type=file  accept=\"video/*\" id=SelectVideoToSend></div>";
    OpenWindow(html, lang.select_video, 150, 360, false, false, null, null, lang.cancel, function(){
        CloseWindow();
    }, function(){
        $("#SelectVideoToSend").on('change', function(event){
            var input = event.target;
            if(input.files.length >= 1){
                CloseWindow();
                SendVideo(lineNum, URL.createObjectURL(input.files[0]));
            }
            else {
                console.warn("Please Select a file to present.");
            }
        });
    }, null);
}
function PresentBlank(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", false);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", false);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", false);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", true);

    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").hide();
    $("#line-"+ lineNum + "-remote-videos").show();

    DisableVideoStream(lineNum);
}
function RemoveScratchpad(lineNum){
    var scratchpad = GetCanvas("line-" + lineNum + "-scratchpad");
    if(scratchpad != null){
        window.clearInterval(scratchpad.redrawIntrtval);

        RemoveCanvas("line-" + lineNum + "-scratchpad");
        $("#line-"+ lineNum + "-scratchpad-container").empty();

        scratchpad = null;
    }
}
function getPicture(buddy, typestr, ignoreCache){
    var defaultImg = getDefaultProfileIconUrl();
    if(buddy == "profilePicture"){
        var dbImg = localDB.getItem("profilePicture");
        if(dbImg == null){
            return defaultImg;
        }
        else {
            return dbImg;
        }
    }

    typestr = (typestr)? typestr : "extension";
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null){
        return defaultImg
    }
    if(ignoreCache != true && buddyObj.imageObjectURL != ""){
        return buddyObj.imageObjectURL;
    }
    var dbImg = localDB.getItem("img-"+ buddy +"-"+ typestr);
    if(dbImg == null){
        buddyObj.imageObjectURL = defaultImg
        return buddyObj.imageObjectURL
    }
    else {
        buddyObj.imageObjectURL = URL.createObjectURL(base64toBlob(dbImg, 'image/webp'));
        return buddyObj.imageObjectURL;
    }
}
function GetCanvas(canvasId){
    for(var c = 0; c < CanvasCollection.length; c++){
        try {
            if(CanvasCollection[c].id == canvasId) return CanvasCollection[c];
        } catch(e) {
            console.warn("CanvasCollection.id not available");
        }
    }
    return null;
}
function RemoveCanvas(canvasId){
    for(var c = 0; c < CanvasCollection.length; c++){
        try{
            if(CanvasCollection[c].id == canvasId) {
                console.log("Found Old Canvas, Disposing...");

                CanvasCollection[c].clear()
                CanvasCollection[c].dispose();

                CanvasCollection[c].id = "--deleted--";

                console.log("CanvasCollection.splice("+ c +", 1)");
                CanvasCollection.splice(c, 1);
                break;
            }
        }
        catch(e){ }
    }
    console.log("There are "+ CanvasCollection.length +" canvas now.");
}
var ImageEditor_Select = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null) {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        return true;
    }
    return false;
}
var ImageEditor_FreedrawPen = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null) {
        canvas.freeDrawingBrush.color = canvas.PenColour;
        canvas.freeDrawingBrush.width = canvas.PenWidth;
        canvas.ToolSelected = "Draw";
        canvas.isDrawingMode = true;
        console.log(canvas)
        return true;
    }
    return false;
}
var ImageEditor_FreedrawPaint = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null) {
        canvas.freeDrawingBrush.color = canvas.PaintColour;
        canvas.freeDrawingBrush.width = canvas.PaintWidth;
        canvas.ToolSelected = "Paint";
        canvas.isDrawingMode = true;
        return true;
    }
    return false;
}
var ImageEditor_Pan = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "Pan";
        canvas.isDrawingMode = false;
        return true;
    }
    return false;
}
var ImageEditor_ResetZoom = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.setZoom(1);
        canvas.setViewportTransform([1,0,0,1,0,0]);
        return true;
    }
    return false;
}
var ImageEditor_ZoomIn = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var zoom = canvas.getZoom();
        zoom = zoom + 0.5;
        if (zoom > 10) zoom = 10;
        if (zoom < 0.1) zoom = 0.1;

        var point = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
        var center = fabric.util.transformPoint(point, canvas.viewportTransform);

        canvas.zoomToPoint(point, zoom);

        return true;
    }
    return false;
}
var ImageEditor_ZoomOut = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var zoom = canvas.getZoom();
        zoom = zoom - 0.5;
        if (zoom > 10) zoom = 10;
        if (zoom < 0.1) zoom = 0.1;

        var point = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
        var center = fabric.util.transformPoint(point, canvas.viewportTransform);

        canvas.zoomToPoint(point, zoom);

        return true;
    }
    return false;
}
var ImageEditor_AddCircle = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var circle = new fabric.Circle({
            radius: 20, fill: canvas.FillColour
        })
        canvas.add(circle);
        canvas.centerObject(circle);
        canvas.setActiveObject(circle);
        return true;
    }
    return false;
}
var ImageEditor_AddRectangle = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var rectangle = new fabric.Rect({
            width: 40, height: 40, fill: canvas.FillColour
        })
        canvas.add(rectangle);
        canvas.centerObject(rectangle);
        canvas.setActiveObject(rectangle);
        return true;
    }
    return false;
}
var ImageEditor_AddTriangle = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var triangle = new fabric.Triangle({
            width: 40, height: 40, fill: canvas.FillColour
        })
        canvas.add(triangle);
        canvas.centerObject(triangle);
        canvas.setActiveObject(triangle);
        return true;
    }
    return false;
}
var ImageEditor_AddEmoji = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var text = new fabric.Text(String.fromCodePoint(0x1F642), { fontSize : 24 });
        canvas.add(text);
        canvas.centerObject(text);
        canvas.setActiveObject(text);
        return true;
    }
    return false;
}
var ImageEditor_AddText = function (buddy, textString){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var text = new fabric.IText(textString, { fill: canvas.FillColour, fontFamily: 'arial', fontSize : 18 });
        canvas.add(text);
        canvas.centerObject(text);
        canvas.setActiveObject(text);
        return true;
    }
    return false;
}
var ImageEditor_Clear = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;

        var activeObjects = canvas.getActiveObjects();
        for (var i=0; i<activeObjects.length; i++){
            canvas.remove(activeObjects[i]);
        }
        canvas.discardActiveObject();

        return true;
    }
    return false;
}
var ImageEditor_ClearAll = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var savedBgImage = canvas.backgroundImage;

        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        canvas.clear();

        canvas.backgroundImage = savedBgImage;
        return true;
    }
    return false;
}
var ImageEditor_Cancel = function (buddy){
    console.log("Removing ImageEditor...");

    $("#contact-" + buddy + "-imagePastePreview").empty();
    RemoveCanvas("contact-" + buddy + "-imageCanvas");
    $("#contact-" + buddy + "-imagePastePreview").hide();
}
var ImageEditor_Send = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var imgData = canvas.toDataURL({ format: 'webp' });
        SendImageDataMessage(buddy, imgData);
        return true;
    }
    return false;
}
function FindSomething(buddy) {
    $("#contact-" + buddy + "-search").toggle();
    if($("#contact-" + buddy + "-search").is(":visible") == false){
        RefreshStream(FindBuddyByIdentity(buddy));
    }
    updateScroll(buddy);
}
function TogglePinned(buddy){
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;

    if(buddyObj.Pinned){
        console.log("Disable Pinned for", buddy);
        buddyObj.Pinned = false;
    }
    else {
        console.log("Enable Pinned for", buddy);
        buddyObj.Pinned = true;
    }
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null) {
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.Pinned = buddyObj.Pinned;
                return false;
            }
        });
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }
    UpdateBuddyList();
}
var allowDradAndDrop = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}
function preventDefault(e){
    e.preventDefault();
    e.stopPropagation();
}
function OpenWindow(html, title, height, width, hideCloseButton, allowResize, button1_Text, button1_onClick, button2_Text, button2_onClick, DoOnLoad, OnClose) {
    console.log("Open Window: " + title);
    if(windowObj != null){
        windowObj.dialog("close");
        windowObj = null;
    }
    windowObj = $('<div></div>').html(html).dialog({
        autoOpen: false,
        title: title,
        modal: true,
        width: width,
        height: height,
        resizable: allowResize,
        classes: { "ui-dialog-content": "cleanScroller"},
        close: function(event, ui) {
            $(this).dialog("destroy");
            windowObj = null;
        }
    });
    var buttons = [];
    if(button1_Text && button1_onClick){
        buttons.push({
            text: button1_Text,
            click: function(){
                console.log("Button 1 ("+ button1_Text +") Clicked");
                button1_onClick();
            }
        });
    }
    if(button2_Text && button2_onClick){
        buttons.push({
            text: button2_Text,
            click: function(){
                console.log("Button 2 ("+ button2_Text +") Clicked");
                button2_onClick();
            }
        });
    }
    if(buttons.length >= 1) windowObj.dialog( "option", "buttons", buttons);

    if(OnClose) windowObj.on("dialogbeforeclose", function(event, ui) {
        return OnClose(this);
    });
    if(DoOnLoad) windowObj.on("dialogopen", function(event, ui) {
        DoOnLoad();
    });
    windowObj.dialog("open");
    if(!title || String(title).trim() === ""){
        windowObj.parent().addClass("noTitleBar");
    }

    var cancelText = (typeof lang !== "undefined" && lang && lang.cancel) ? lang.cancel : "Cancel";
    var hasCancelButton = (button1_Text == cancelText || button2_Text == cancelText);
    if (hideCloseButton || hasCancelButton) windowObj.dialog({ dialogClass: 'no-close' });
    UpdateUI();
    if(skipNextWindowAutoCenter !== true){
        var windowWidth = $(window).outerWidth()
        var windowHeight = $(window).outerHeight();
        var offsetTextHeight = windowObj.parent().outerHeight();
        var offsetWidth = windowObj.parent().outerWidth();

        windowObj.parent().css('left', windowWidth/2 - offsetWidth/2 + 'px');
        windowObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
    } else {
        skipNextWindowAutoCenter = false;
    }

}
function CloseWindow(all) {
    console.log("Call to close any open window");

    if(windowObj != null){
        windowObj.dialog("close");
        windowObj = null;
    }
    if(all == true){
        if (confirmObj != null) {
            confirmObj.dialog("close");
            confirmObj = null;
        }
        if (promptObj != null) {
            promptObj.dialog("close");
            promptObj = null;
        }
        if (alertObj != null) {
            alertObj.dialog("close");
            alertObj = null;
        }
    }
}
function Alert(messageStr, TitleStr, onOk) {
    if (confirmObj != null) {
        confirmObj.dialog("close");
        confirmObj = null;
    }
    if (promptObj != null) {
        promptObj.dialog("close");
        promptObj = null;
    }
    if (alertObj != null) {
        console.error("Alert not null, while Alert called: " + TitleStr + ", saying:" + messageStr);
        return;
    }
    else {
        console.log("Alert called with Title: " + TitleStr + ", saying: " + messageStr);
    }

    var html = "<div class=NoSelect>";
    html += "<div class=UiText style=\"padding: 10px\" id=AllertMessageText>" + messageStr + "</div>";
    html += "</div>"

    alertObj = $('<div>').html(html).dialog({
        autoOpen: false,
        title: TitleStr,
        modal: true,
        width: 300,
        height: "auto",
        resizable: false,
        closeOnEscape : false,
        close: function(event, ui) {
            $(this).dialog("destroy");
            alertObj = null;
        }
    });

    var buttons = [];
    buttons.push({
        text: lang.ok,
        click: function(){
            console.log("Alert OK clicked");
            if (onOk) onOk();
            $(this).dialog("close");
            alertObj = null;
        }
    });
    alertObj.dialog( "option", "buttons", buttons);
    alertObj.dialog("open");

    alertObj.dialog({ dialogClass: 'no-close' });
     UpdateUI();

}
function Confirm(messageStr, TitleStr, onOk, onCancel) {
    if (alertObj != null) {
        alertObj.dialog("close");
        alertObj = null;
    }
    if (promptObj != null) {
        promptObj.dialog("close");
        promptObj = null;
    }
    if (confirmObj != null) {
        console.error("Confirm not null, while Confrim called with Title: " + TitleStr + ", saying: " + messageStr);
        return;
    }
    else {
        console.log("Confirm called with Title: " + TitleStr + ", saying: " + messageStr);
    }

    var html = "<div class=NoSelect>";
    html += "<div class=UiText style=\"padding: 10px\" id=ConfrimMessageText>" + messageStr + "</div>";
    html += "</div>";

    confirmObj = $('<div>').html(html).dialog({
        autoOpen: false,
        title: TitleStr,
        modal: true,
        width: 300,
        height: "auto",
        resizable: false,
        closeOnEscape : false,
        close: function(event, ui) {
            $(this).dialog("destroy");
            confirmObj = null;
        }
    });

    var buttons = [];
    buttons.push({
        text: lang.ok,
        click: function(){
            console.log("Confrim OK clicked");
            if (onOk) onOk();
            $(this).dialog("close");
            confirmObj = null;
        }
    });
    buttons.push({
        text: lang.cancel,
        click: function(){
            console.log("Confirm Cancel clicked");
            if (onCancel) onCancel();
            $(this).dialog("close");
            confirmObj = null;
        }
    });

    confirmObj.dialog( "option", "buttons", buttons);
    confirmObj.dialog("open");

    confirmObj.dialog({ dialogClass: 'no-close' });
    UpdateUI();
}
function Prompt(messageStr, TitleStr, FieldText, defaultValue, dataType, placeholderText, onOk, onCancel) {
    if (alertObj != null) {
        alertObj.dialog("close");
        alertObj = null;
    }
    if (confirmObj != null) {
        confirmObj.dialog("close");
        confirmObj = null;
    }
    if (promptObj != null) {
        console.error("Prompt not null, while Prompt called with Title: " + TitleStr + ", saying: " + messageStr);
        return;
    }
    else {
        console.log("Prompt called with Title: " + TitleStr + ", saying: " + messageStr);
    }

    var html = "<div class=NoSelect>";
    html += "<div class=UiText style=\"padding: 10px\" id=PromptMessageText>";
    html += messageStr;
    html += "<div style=\"margin-top:10px\">" + FieldText + " : </div>";
    html += "<div style=\"margin-top:5px\"><INPUT id=PromptValueField type=" + dataType + " value=\"" + defaultValue + "\" placeholder=\"" + placeholderText + "\" style=\"width:98%\"></div>"
    html += "</div>";
    html += "</div>";

    promptObj = $('<div>').html(html).dialog({
        autoOpen: false,
        title: TitleStr,
        modal: true,
        width: 300,
        height: "auto",
        resizable: false,
        closeOnEscape : false,
        close: function(event, ui) {
            $(this).dialog("destroy");
            promptObj = null;
        }
    });

    var buttons = [];
    buttons.push({
        text: lang.ok,
        click: function(){
            console.log("Prompt OK clicked, with value: " + $("#PromptValueField").val());
            if (onOk) onOk($("#PromptValueField").val());
            $(this).dialog("close");
            promptObj = null;
        }
    });
    buttons.push({
        text: lang.cancel,
        click: function(){
            console.log("Prompt Cancel clicked");
            if (onCancel) onCancel();
            $(this).dialog("close");
            promptObj = null;
        }
    });
    promptObj.dialog( "option", "buttons", buttons);
    promptObj.dialog("open");

    promptObj.dialog({ dialogClass: 'no-close' });
    UpdateUI();
}
function PopupMenu(obj, menu){
    console.log("Show Popup Menu");

    function bindPopupDismissHandlers(){
        $(document).off(".popupMenuGlobal");
        $(window).off(".popupMenuGlobal");

        $(document).on("mousedown.popupMenuGlobal touchstart.popupMenuGlobal", function(event){
            if(menuObj == null) return;
            var target = event.target;
            if($(target).closest(".popupMenuList").length > 0) return;
            if(popupAnchorEl && (target === popupAnchorEl || $.contains(popupAnchorEl, target))) return;
            HidePopup();
        });
        $(document).on("keydown.popupMenuGlobal", function(event){
            if(menuObj == null) return;
            if(event.key === "Escape" || event.keyCode === 27){
                event.preventDefault();
                HidePopup();
            }
        });
        $(window).on("resize.popupMenuGlobal scroll.popupMenuGlobal", function(){
            if(menuObj != null) HidePopup();
        });
    }
    if(menuObj != null){
        menuObj.menu("destroy");
        menuObj.empty();
        menuObj.remove();
        menuObj = null;
    }

    var anchorEl = $(obj).get(0);
    if(!anchorEl) return;
    popupAnchorEl = anchorEl;
    var anchorRect = anchorEl.getBoundingClientRect();

    menuObj = $("<ul></ul>");
    if(menu && menu.items){
        $.each(menu.items, function(i, item){
            var header = (item.isHeader == true)? " class=\"ui-widget-header\"" : "";
            var disabled = (item.isDisabled == true)? " class=\"ui-state-disabled\"" : "";
            if(item.icon != null){
                menuObj.append("<li value=\""+ item.value +"\" "+ header +" "+ disabled +"><div><span class=\""+ item.icon +" ui-icon\"></span>"+ item.text +"</div></li>");
            }
            else {
                menuObj.append("<li value=\""+ item.value +"\" "+ header +" "+ disabled +"><div>"+ item.text +"</div></li>");
            }
        });
    }
    menuObj.append("<li><div style=\"text-align:center; padding-right: 2em\">"+ lang.cancel +"</div></li>");
    menuObj.appendTo(document.body);
    menuObj.addClass("popupMenuList");
    menuObj.menu({});
    menuObj.on("menuselect.popupInternal", function(event, ui){
        var id = ui.item.attr("value");
        if(!id){
            HidePopup();
            return false;
        }
    });
    if(menu && menu.selectEvent){
        menuObj.on("menuselect", menu.selectEvent);
    }
    if(menu && menu.createEvent){
        menuObj.on("menucreate", menu.createEvent);
    }
    menuObj.on('blur',function(){
        HidePopup();
    });
    if(menu && menu.autoFocus == true) menuObj.focus();
    var containerRect = null;
    var leftPane = $("#leftContent").get(0);
    if(leftPane) containerRect = leftPane.getBoundingClientRect();
    if(!containerRect){
        var phonePane = $("#Phone").get(0);
        if(phonePane) containerRect = phonePane.getBoundingClientRect();
    }
    if(!containerRect){
        containerRect = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
    }

    menuObj.css({ position: "fixed", left: "0px", top: "0px", maxWidth: Math.max(180, Math.floor(containerRect.right - containerRect.left - 16)) + "px" });

    var menuWidth = menuObj.outerWidth();
    var menuHeight = menuObj.outerHeight();

    var paneMinLeft = Math.max(8, Math.floor(containerRect.left + 8));
    var paneMaxLeft = Math.min(Math.floor(window.innerWidth - menuWidth - 8), Math.floor(containerRect.right - menuWidth - 8));
    if(paneMaxLeft < paneMinLeft) paneMaxLeft = paneMinLeft;
    var left = Math.floor(anchorRect.right - menuWidth);
    if(left < paneMinLeft) left = paneMinLeft;
    if(left > paneMaxLeft) left = paneMaxLeft;

    var paneMinTop = Math.max(8, Math.floor(containerRect.top + 8));
    var paneMaxTop = Math.min(Math.floor(window.innerHeight - menuHeight - 8), Math.floor(containerRect.bottom - menuHeight - 8));
    if(paneMaxTop < paneMinTop) paneMaxTop = paneMinTop;

    var top = Math.floor(anchorRect.bottom + 4);
    if(top > paneMaxTop){
        top = Math.floor(anchorRect.top - menuHeight - 4);
    }
    if(top < paneMinTop) top = paneMinTop;
    if(top > paneMaxTop) top = paneMaxTop;

    menuObj.css({ left: left + "px", top: top + "px" });
    bindPopupDismissHandlers();

}

function HidePopup(timeout){
    function cleanupPopupState(){
        popupAnchorEl = null;
        $(document).off(".popupMenuGlobal");
        $(window).off(".popupMenuGlobal");
    }
    if(timeout){
        window.setTimeout(function(){
            if(menuObj != null){
                menuObj.menu("destroy");
                try{
                    menuObj.empty();
                }
                catch(e){}
                try{
                    menuObj.remove();
                }
                catch(e){}
                menuObj = null;
            }
            cleanupPopupState();
        }, timeout);
    } else {
        if(menuObj != null){
            menuObj.menu("destroy");
            try{
                menuObj.empty();
            }
            catch(e){}
            try{
                menuObj.remove();
            }
            catch(e){}
            menuObj = null;
        }
        cleanupPopupState();
    }
}
function DetectDevices(){
    navigator.mediaDevices.enumerateDevices().then(function(deviceInfos){
        HasVideoDevice = false;
        HasAudioDevice = false;
        HasSpeakerDevice = false;
        AudioinputDevices = [];
        VideoinputDevices = [];
        SpeakerDevices = [];
        for (var i = 0; i < deviceInfos.length; ++i) {
            if (deviceInfos[i].kind === "audioinput") {
                HasAudioDevice = true;
                AudioinputDevices.push(deviceInfos[i]);
            }
            else if (deviceInfos[i].kind === "audiooutput") {
                HasSpeakerDevice = true;
                SpeakerDevices.push(deviceInfos[i]);
            }
            else if (deviceInfos[i].kind === "videoinput") {
                if(EnableVideoCalling == true){
                    HasVideoDevice = true;
                    VideoinputDevices.push(deviceInfos[i]);
                }
            }
        }
    }).catch(function(e){
        console.error("Error enumerating devices", e);
    });
}
DetectDevices();
window.setInterval(function(){
    DetectDevices();
}, 10000);
window.setInterval(function(){
    for(var i = 0; i < Lines.length; i++){
        var lineObj = Lines[i];
        if(!lineObj || !lineObj.SipSession || !lineObj.SipSession.data) continue;
        if(lineObj.SipSession.data.teardownComplete === true) continue;
        if(lineObj.SipSession.state == SIP.SessionState.Terminated){
            console.warn("Watchdog cleanup terminated line:", lineObj.LineNumber);
            if(!lineObj.SipSession.data.reasonText) lineObj.SipSession.data.reasonText = "Session Terminated";
            if(!lineObj.SipSession.data.reasonCode) lineObj.SipSession.data.reasonCode = 16;
            if(!lineObj.SipSession.data.terminateby) lineObj.SipSession.data.terminateby = "them";
            teardownSession(lineObj);
        }
    }
}, 1000);






