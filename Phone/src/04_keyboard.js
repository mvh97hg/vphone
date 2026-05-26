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
    setTimeout(function() {
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
    }, 0);
});
if(window.matchMedia){
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
        console.log(`Changed system Theme to: ${e.matches ? "dark" : "light"} mode`)
        ApplyThemeColor()
    });
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.GetKeyboardShortcutAction = GetKeyboardShortcutAction; }
if (typeof window !== 'undefined') { window.GetKeyboardShortcutAction = GetKeyboardShortcutAction; }
if (typeof globalThis !== 'undefined') { globalThis.IsEditableShortcutTarget = IsEditableShortcutTarget; }
if (typeof window !== 'undefined') { window.IsEditableShortcutTarget = IsEditableShortcutTarget; }
if (typeof globalThis !== 'undefined') { globalThis.GetShortcutLine = GetShortcutLine; }
if (typeof window !== 'undefined') { window.GetShortcutLine = GetShortcutLine; }
if (typeof globalThis !== 'undefined') { globalThis.HandleKeyboardShortcut = HandleKeyboardShortcut; }
if (typeof window !== 'undefined') { window.HandleKeyboardShortcut = HandleKeyboardShortcut; }
if (typeof globalThis !== 'undefined') { globalThis.HandleShortcutAction = HandleShortcutAction; }
if (typeof window !== 'undefined') { window.HandleShortcutAction = HandleShortcutAction; }
