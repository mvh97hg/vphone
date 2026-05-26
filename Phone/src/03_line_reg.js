function GetBuddyDialNumber(buddyObj){
    if(!buddyObj) return "";
    if(buddyObj.ExtNo && buddyObj.ExtNo != "") return buddyObj.ExtNo;
    if(buddyObj.ContactNumber1 && buddyObj.ContactNumber1 != "") return buddyObj.ContactNumber1;
    if(buddyObj.MobileNumber && buddyObj.MobileNumber != "") return buddyObj.MobileNumber;
    return "";
}
function BuildCallDisplayInfo(lineObj){
    if(!lineObj) return { number: "", name: "", primary: "", secondary: "" };

    var session = lineObj.SipSession;
    var direction = (session && session.data && session.data.calldirection) ? session.data.calldirection : "";
    var remoteNumber = "";

    if(direction == "inbound") remoteNumber = (session && session.data) ? (session.data.src || "") : "";
    if(direction == "outbound") remoteNumber = (session && session.data) ? (session.data.dst || "") : "";
    if((!remoteNumber || remoteNumber == "") && session && session.remoteIdentity && session.remoteIdentity.uri){
        remoteNumber = session.remoteIdentity.uri.user || "";
    }
    if(!remoteNumber || remoteNumber == "") remoteNumber = lineObj.DisplayNumber || "";

    var matchedBuddy = FindBuddyByNumber(remoteNumber);
    if(matchedBuddy && matchedBuddy.type != "contact") matchedBuddy = null;

    var contactName = (matchedBuddy && matchedBuddy.CallerIDName) ? matchedBuddy.CallerIDName : "";
    var sipCallerIdName = "";
    if(session && session.remoteIdentity && session.remoteIdentity.displayName) {
        sipCallerIdName = session.remoteIdentity.displayName;
    }
    if(!sipCallerIdName || sipCallerIdName == "") {
        sipCallerIdName = lineObj.DisplayName || "";
    }

    return BuildCallerDisplay(remoteNumber, contactName, sipCallerIdName);
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

    var title = (display.primary && display.primary != "") ? display.primary : (display.number || lineObj.DisplayNumber || "");
    $("#line-" + lineObj.LineNumber + "-AnswerCall .callingDisplayName").text(title);
    $("#line-" + lineObj.LineNumber + "-progress .callingDisplayName").text(title);
    $("#line-" + lineObj.LineNumber + "-AudioCall .callingDisplayName").text(title);

    var subtitle = display.secondary || "";
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


// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.GetBuddyDialNumber = GetBuddyDialNumber; }
if (typeof window !== 'undefined') { window.GetBuddyDialNumber = GetBuddyDialNumber; }
if (typeof globalThis !== 'undefined') { globalThis.BuildCallDisplayInfo = BuildCallDisplayInfo; }
if (typeof window !== 'undefined') { window.BuildCallDisplayInfo = BuildCallDisplayInfo; }
if (typeof globalThis !== 'undefined') { globalThis.RefreshLineDisplay = RefreshLineDisplay; }
if (typeof window !== 'undefined') { window.RefreshLineDisplay = RefreshLineDisplay; }
if (typeof globalThis !== 'undefined') { globalThis.AttachSessionTerminationObserver = AttachSessionTerminationObserver; }
if (typeof window !== 'undefined') { window.AttachSessionTerminationObserver = AttachSessionTerminationObserver; }
if (typeof globalThis !== 'undefined') { globalThis.UpdateDialpadSettingButtons = UpdateDialpadSettingButtons; }
if (typeof window !== 'undefined') { window.UpdateDialpadSettingButtons = UpdateDialpadSettingButtons; }
if (typeof globalThis !== 'undefined') { globalThis.ApplyDoNotDisturbState = ApplyDoNotDisturbState; }
if (typeof window !== 'undefined') { window.ApplyDoNotDisturbState = ApplyDoNotDisturbState; }
if (typeof globalThis !== 'undefined') { globalThis.ToggleDialpadSetting = ToggleDialpadSetting; }
if (typeof window !== 'undefined') { window.ToggleDialpadSetting = ToggleDialpadSetting; }
if (typeof globalThis !== 'undefined') { globalThis.SyncMobileRegLink = SyncMobileRegLink; }
if (typeof window !== 'undefined') { window.SyncMobileRegLink = SyncMobileRegLink; }
if (typeof globalThis !== 'undefined') { globalThis.GetMobileRegistrationText = GetMobileRegistrationText; }
if (typeof window !== 'undefined') { window.GetMobileRegistrationText = GetMobileRegistrationText; }
if (typeof globalThis !== 'undefined') { globalThis.BuildMobileEmptyState = BuildMobileEmptyState; }
if (typeof window !== 'undefined') { window.BuildMobileEmptyState = BuildMobileEmptyState; }
if (typeof globalThis !== 'undefined') { globalThis.SetMobilePaneEmptyState = SetMobilePaneEmptyState; }
if (typeof window !== 'undefined') { window.SetMobilePaneEmptyState = SetMobilePaneEmptyState; }
