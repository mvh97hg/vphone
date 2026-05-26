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
function NormalizeCallerDisplayText(value){
    var text = String(value == null ? "" : value).trim();
    if(text == "" || text == "null" || text == "undefined") return "";
    return text;
}
function BuildCallerDisplay(number, contactName, callerIdName) {
    var normalizedNumber = NormalizeCallerDisplayText(number);
    var normalizedContactName = NormalizeCallerDisplayText(contactName);
    var normalizedCallerIdName = NormalizeCallerDisplayText(callerIdName);

    // Ignore invalid caller names
    var invalidNames = ["anonymous", "unknown", "null", "undefined"];

    if (invalidNames.includes(normalizedCallerIdName.toLowerCase())) {
        normalizedCallerIdName = "";
    }

    var resolvedName = "";

    // Priority 1: Contact name
    if (normalizedContactName !== "") {
        resolvedName = normalizedContactName;
    }
    // Priority 2: Caller ID name
    else if (
        normalizedCallerIdName !== "" &&
        normalizedCallerIdName !== normalizedNumber
    ) {
        resolvedName = normalizedCallerIdName;
    }

    return {
        number: normalizedNumber,
        name: resolvedName,
        primary: resolvedName || normalizedNumber,
        secondary:
            resolvedName &&
            normalizedNumber &&
            resolvedName !== normalizedNumber
                ? normalizedNumber
                : ""
    };
}
function GetRecentDisplayInfo(callbackNumber, ownerBuddy, contactBuddy, item, isOutbound){
    var contactName = (contactBuddy && contactBuddy.CallerIDName) ? contactBuddy.CallerIDName : "";
    var partyCallerId = isOutbound ? (item.Dst || item.DstDid || "") : (item.Src || item.SrcDid || "");
    var fallbackCallerId = (ownerBuddy && ownerBuddy.CallerIDName) ? ownerBuddy.CallerIDName : "";
    var callerIdName = NormalizeCallerDisplayText(partyCallerId) || NormalizeCallerDisplayText(fallbackCallerId);

    return BuildCallerDisplay(callbackNumber, contactName, callerIdName);
}
function GetRecentDisplayLabel(callbackNumber, ownerBuddy, contactBuddy, item, isOutbound){
    return GetRecentDisplayInfo(callbackNumber, ownerBuddy, contactBuddy, item, isOutbound).primary;
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

                var displayInfo = GetRecentDisplayInfo(callbackNumber, ownerBuddy, contactBuddy, item, isOutbound);

                allCdrs.push({
                    cdr: item,
                    ownerIdentity: ownerIdentity,
                    callbackNumber: callbackNumber,
                    displayName: displayInfo.primary,
                    displayNumber: displayInfo.secondary,
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

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.newLineNumber = newLineNumber; }
if (typeof window !== 'undefined') { window.newLineNumber = newLineNumber; }
if (typeof globalThis !== 'undefined') { globalThis.telNumericRegEx = telNumericRegEx; }
if (typeof window !== 'undefined') { window.telNumericRegEx = telNumericRegEx; }
if (typeof globalThis !== 'undefined') { globalThis.telAlphanumericRegEx = telAlphanumericRegEx; }
if (typeof window !== 'undefined') { window.telAlphanumericRegEx = telAlphanumericRegEx; }
if (typeof globalThis !== 'undefined') { globalThis.settingsMicrophoneStream = settingsMicrophoneStream; }
if (typeof window !== 'undefined') { window.settingsMicrophoneStream = settingsMicrophoneStream; }
if (typeof globalThis !== 'undefined') { globalThis.settingsMicrophoneStreamTrack = settingsMicrophoneStreamTrack; }
if (typeof window !== 'undefined') { window.settingsMicrophoneStreamTrack = settingsMicrophoneStreamTrack; }
if (typeof globalThis !== 'undefined') { globalThis.settingsMicrophoneSoundMeter = settingsMicrophoneSoundMeter; }
if (typeof window !== 'undefined') { window.settingsMicrophoneSoundMeter = settingsMicrophoneSoundMeter; }
if (typeof globalThis !== 'undefined') { globalThis.settingsVideoStream = settingsVideoStream; }
if (typeof window !== 'undefined') { window.settingsVideoStream = settingsVideoStream; }
if (typeof globalThis !== 'undefined') { globalThis.settingsVideoStreamTrack = settingsVideoStreamTrack; }
if (typeof window !== 'undefined') { window.settingsVideoStreamTrack = settingsVideoStreamTrack; }
if (typeof globalThis !== 'undefined') { globalThis.authModeFallbackTried = authModeFallbackTried; }
if (typeof window !== 'undefined') { window.authModeFallbackTried = authModeFallbackTried; }
if (typeof globalThis !== 'undefined') { globalThis.CallRecordingsIndexDb = CallRecordingsIndexDb; }
if (typeof window !== 'undefined') { window.CallRecordingsIndexDb = CallRecordingsIndexDb; }
if (typeof globalThis !== 'undefined') { globalThis.CallQosDataIndexDb = CallQosDataIndexDb; }
if (typeof window !== 'undefined') { window.CallQosDataIndexDb = CallQosDataIndexDb; }
if (typeof globalThis !== 'undefined') { globalThis.uID = uID; }
if (typeof window !== 'undefined') { window.uID = uID; }
if (typeof globalThis !== 'undefined') { globalThis.utcDateNow = utcDateNow; }
if (typeof window !== 'undefined') { window.utcDateNow = utcDateNow; }
if (typeof globalThis !== 'undefined') { globalThis.IsAutoplayBlockedError = IsAutoplayBlockedError; }
if (typeof window !== 'undefined') { window.IsAutoplayBlockedError = IsAutoplayBlockedError; }
if (typeof globalThis !== 'undefined') { globalThis.FlushQueuedAudioPlayback = FlushQueuedAudioPlayback; }
if (typeof window !== 'undefined') { window.FlushQueuedAudioPlayback = FlushQueuedAudioPlayback; }
if (typeof globalThis !== 'undefined') { globalThis.MarkAudioInteractionAndUnlock = MarkAudioInteractionAndUnlock; }
if (typeof window !== 'undefined') { window.MarkAudioInteractionAndUnlock = MarkAudioInteractionAndUnlock; }
if (typeof globalThis !== 'undefined') { globalThis.EnsureAudioUnlockListeners = EnsureAudioUnlockListeners; }
if (typeof window !== 'undefined') { window.EnsureAudioUnlockListeners = EnsureAudioUnlockListeners; }
if (typeof globalThis !== 'undefined') { globalThis.PlayMediaElementSafely = PlayMediaElementSafely; }
if (typeof window !== 'undefined') { window.PlayMediaElementSafely = PlayMediaElementSafely; }
if (typeof globalThis !== 'undefined') { globalThis.TryAuthModeFallbackOnRegisterFailure = TryAuthModeFallbackOnRegisterFailure; }
if (typeof window !== 'undefined') { window.TryAuthModeFallbackOnRegisterFailure = TryAuthModeFallbackOnRegisterFailure; }
if (typeof globalThis !== 'undefined') { globalThis.EnsureBuddyStorageKeys = EnsureBuddyStorageKeys; }
if (typeof window !== 'undefined') { window.EnsureBuddyStorageKeys = EnsureBuddyStorageKeys; }
if (typeof globalThis !== 'undefined') { globalThis.RemoveSeedSampleStorageData = RemoveSeedSampleStorageData; }
if (typeof window !== 'undefined') { window.RemoveSeedSampleStorageData = RemoveSeedSampleStorageData; }
if (typeof globalThis !== 'undefined') { globalThis.getAudioSrcID = getAudioSrcID; }
if (typeof window !== 'undefined') { window.getAudioSrcID = getAudioSrcID; }
if (typeof globalThis !== 'undefined') { globalThis.getAudioOutputID = getAudioOutputID; }
if (typeof window !== 'undefined') { window.getAudioOutputID = getAudioOutputID; }
if (typeof globalThis !== 'undefined') { globalThis.getVideoSrcID = getVideoSrcID; }
if (typeof window !== 'undefined') { window.getVideoSrcID = getVideoSrcID; }
if (typeof globalThis !== 'undefined') { globalThis.getRingerOutputID = getRingerOutputID; }
if (typeof window !== 'undefined') { window.getRingerOutputID = getRingerOutputID; }
if (typeof globalThis !== 'undefined') { globalThis.isAbsoluteIconPath = isAbsoluteIconPath; }
if (typeof window !== 'undefined') { window.isAbsoluteIconPath = isAbsoluteIconPath; }
if (typeof globalThis !== 'undefined') { globalThis.resolveIconUrl = resolveIconUrl; }
if (typeof window !== 'undefined') { window.resolveIconUrl = resolveIconUrl; }
if (typeof globalThis !== 'undefined') { globalThis.getAppIconUrl = getAppIconUrl; }
if (typeof window !== 'undefined') { window.getAppIconUrl = getAppIconUrl; }
if (typeof globalThis !== 'undefined') { globalThis.getNotificationIconUrl = getNotificationIconUrl; }
if (typeof window !== 'undefined') { window.getNotificationIconUrl = getNotificationIconUrl; }
if (typeof globalThis !== 'undefined') { globalThis.getDefaultProfileIconUrl = getDefaultProfileIconUrl; }
if (typeof window !== 'undefined') { window.getDefaultProfileIconUrl = getDefaultProfileIconUrl; }
if (typeof globalThis !== 'undefined') { globalThis.applyRuntimeDocumentIcons = applyRuntimeDocumentIcons; }
if (typeof window !== 'undefined') { window.applyRuntimeDocumentIcons = applyRuntimeDocumentIcons; }
if (typeof globalThis !== 'undefined') { globalThis.PadClockPart = PadClockPart; }
if (typeof window !== 'undefined') { window.PadClockPart = PadClockPart; }
if (typeof globalThis !== 'undefined') { globalThis.FormatDurationClock = FormatDurationClock; }
if (typeof window !== 'undefined') { window.FormatDurationClock = FormatDurationClock; }
if (typeof globalThis !== 'undefined') { globalThis.formatShortDuration = formatShortDuration; }
if (typeof window !== 'undefined') { window.formatShortDuration = formatShortDuration; }
if (typeof globalThis !== 'undefined') { globalThis.UserLocale = UserLocale; }
if (typeof window !== 'undefined') { window.UserLocale = UserLocale; }
if (typeof globalThis !== 'undefined') { globalThis.GetAlternateLanguage = GetAlternateLanguage; }
if (typeof window !== 'undefined') { window.GetAlternateLanguage = GetAlternateLanguage; }
if (typeof globalThis !== 'undefined') { globalThis.ResolveLanguageFromPacks = ResolveLanguageFromPacks; }
if (typeof window !== 'undefined') { window.ResolveLanguageFromPacks = ResolveLanguageFromPacks; }
if (typeof globalThis !== 'undefined') { globalThis.base64toBlob = base64toBlob; }
if (typeof window !== 'undefined') { window.base64toBlob = base64toBlob; }
if (typeof globalThis !== 'undefined') { globalThis.MakeDataArray = MakeDataArray; }
if (typeof window !== 'undefined') { window.MakeDataArray = MakeDataArray; }
if (typeof globalThis !== 'undefined') { globalThis.GetUiText = GetUiText; }
if (typeof window !== 'undefined') { window.GetUiText = GetUiText; }
if (typeof globalThis !== 'undefined') { globalThis.ApplyMobileLabels = ApplyMobileLabels; }
if (typeof window !== 'undefined') { window.ApplyMobileLabels = ApplyMobileLabels; }
if (typeof globalThis !== 'undefined') { globalThis.SanitizePhoneSearch = SanitizePhoneSearch; }
if (typeof window !== 'undefined') { window.SanitizePhoneSearch = SanitizePhoneSearch; }
if (typeof globalThis !== 'undefined') { globalThis.EscapeHtml = EscapeHtml; }
if (typeof window !== 'undefined') { window.EscapeHtml = EscapeHtml; }
if (typeof globalThis !== 'undefined') { globalThis.EscapeAttr = EscapeAttr; }
if (typeof window !== 'undefined') { window.EscapeAttr = EscapeAttr; }
if (typeof globalThis !== 'undefined') { globalThis.GetActiveMainTab = GetActiveMainTab; }
if (typeof window !== 'undefined') { window.GetActiveMainTab = GetActiveMainTab; }
if (typeof globalThis !== 'undefined') { globalThis.GetTabSearchStorageKey = GetTabSearchStorageKey; }
if (typeof window !== 'undefined') { window.GetTabSearchStorageKey = GetTabSearchStorageKey; }
if (typeof globalThis !== 'undefined') { globalThis.GetStoredTabSearch = GetStoredTabSearch; }
if (typeof window !== 'undefined') { window.GetStoredTabSearch = GetStoredTabSearch; }
if (typeof globalThis !== 'undefined') { globalThis.SetStoredTabSearch = SetStoredTabSearch; }
if (typeof window !== 'undefined') { window.SetStoredTabSearch = SetStoredTabSearch; }
if (typeof globalThis !== 'undefined') { globalThis.HasInjectedSipConfig = HasInjectedSipConfig; }
if (typeof window !== 'undefined') { window.HasInjectedSipConfig = HasInjectedSipConfig; }
if (typeof globalThis !== 'undefined') { globalThis.IsCallFirstContactMode = IsCallFirstContactMode; }
if (typeof window !== 'undefined') { window.IsCallFirstContactMode = IsCallFirstContactMode; }
if (typeof globalThis !== 'undefined') { globalThis.ResolveRecentCallbackNumber = ResolveRecentCallbackNumber; }
if (typeof window !== 'undefined') { window.ResolveRecentCallbackNumber = ResolveRecentCallbackNumber; }
if (typeof globalThis !== 'undefined') { globalThis.NormalizeCallerDisplayText = NormalizeCallerDisplayText; }
if (typeof window !== 'undefined') { window.NormalizeCallerDisplayText = NormalizeCallerDisplayText; }
if (typeof globalThis !== 'undefined') { globalThis.BuildCallerDisplay = BuildCallerDisplay; }
if (typeof window !== 'undefined') { window.BuildCallerDisplay = BuildCallerDisplay; }
if (typeof globalThis !== 'undefined') { globalThis.GetRecentDisplayInfo = GetRecentDisplayInfo; }
if (typeof window !== 'undefined') { window.GetRecentDisplayInfo = GetRecentDisplayInfo; }
if (typeof globalThis !== 'undefined') { globalThis.GetRecentDisplayLabel = GetRecentDisplayLabel; }
if (typeof window !== 'undefined') { window.GetRecentDisplayLabel = GetRecentDisplayLabel; }
if (typeof globalThis !== 'undefined') { globalThis.GetRecentDirection = GetRecentDirection; }
if (typeof window !== 'undefined') { window.GetRecentDirection = GetRecentDirection; }
if (typeof globalThis !== 'undefined') { globalThis.GetRecentDayKey = GetRecentDayKey; }
if (typeof window !== 'undefined') { window.GetRecentDayKey = GetRecentDayKey; }
if (typeof globalThis !== 'undefined') { globalThis.GetRecentDirectionIcon = GetRecentDirectionIcon; }
if (typeof window !== 'undefined') { window.GetRecentDirectionIcon = GetRecentDirectionIcon; }
if (typeof globalThis !== 'undefined') { globalThis.FormatRecentLogTime = FormatRecentLogTime; }
if (typeof window !== 'undefined') { window.FormatRecentLogTime = FormatRecentLogTime; }
if (typeof globalThis !== 'undefined') { globalThis.GetRecentDayLabel = GetRecentDayLabel; }
if (typeof window !== 'undefined') { window.GetRecentDayLabel = GetRecentDayLabel; }
if (typeof globalThis !== 'undefined') { globalThis.ParseUtcDisplayDate = ParseUtcDisplayDate; }
if (typeof window !== 'undefined') { window.ParseUtcDisplayDate = ParseUtcDisplayDate; }
if (typeof globalThis !== 'undefined') { globalThis.FormatFixedClockTime = FormatFixedClockTime; }
if (typeof window !== 'undefined') { window.FormatFixedClockTime = FormatFixedClockTime; }
if (typeof globalThis !== 'undefined') { globalThis.FormatFixedDate = FormatFixedDate; }
if (typeof window !== 'undefined') { window.FormatFixedDate = FormatFixedDate; }
if (typeof globalThis !== 'undefined') { globalThis.SearchRecentsByNumber = SearchRecentsByNumber; }
if (typeof window !== 'undefined') { window.SearchRecentsByNumber = SearchRecentsByNumber; }
if (typeof globalThis !== 'undefined') { globalThis.GetRecentCallStatus = GetRecentCallStatus; }
if (typeof window !== 'undefined') { window.GetRecentCallStatus = GetRecentCallStatus; }
