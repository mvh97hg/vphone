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


// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.ShowMyProfileMenu = ShowMyProfileMenu; }
if (typeof window !== 'undefined') { window.ShowMyProfileMenu = ShowMyProfileMenu; }
if (typeof globalThis !== 'undefined') { globalThis.IsSipRegistered = IsSipRegistered; }
if (typeof window !== 'undefined') { window.IsSipRegistered = IsSipRegistered; }
if (typeof globalThis !== 'undefined') { globalThis.CountOnlineExtensions = CountOnlineExtensions; }
if (typeof window !== 'undefined') { window.CountOnlineExtensions = CountOnlineExtensions; }
if (typeof globalThis !== 'undefined') { globalThis.GetRegisteredExtension = GetRegisteredExtension; }
if (typeof window !== 'undefined') { window.GetRegisteredExtension = GetRegisteredExtension; }
if (typeof globalThis !== 'undefined') { globalThis.GetSelfExtensionLabel = GetSelfExtensionLabel; }
if (typeof window !== 'undefined') { window.GetSelfExtensionLabel = GetSelfExtensionLabel; }
if (typeof globalThis !== 'undefined') { globalThis.ApplyRegistrationStatusText = ApplyRegistrationStatusText; }
if (typeof window !== 'undefined') { window.ApplyRegistrationStatusText = ApplyRegistrationStatusText; }
if (typeof globalThis !== 'undefined') { globalThis.EmitEmbedRegistrationStatus = EmitEmbedRegistrationStatus; }
if (typeof window !== 'undefined') { window.EmitEmbedRegistrationStatus = EmitEmbedRegistrationStatus; }
if (typeof globalThis !== 'undefined') { globalThis.EmitEmbedPhoneEvent = EmitEmbedPhoneEvent; }
if (typeof window !== 'undefined') { window.EmitEmbedPhoneEvent = EmitEmbedPhoneEvent; }
if (typeof globalThis !== 'undefined') { globalThis.SetStatusMessage = SetStatusMessage; }
if (typeof window !== 'undefined') { window.SetStatusMessage = SetStatusMessage; }
if (typeof globalThis !== 'undefined') { globalThis.ApplyThemeColor = ApplyThemeColor; }
if (typeof window !== 'undefined') { window.ApplyThemeColor = ApplyThemeColor; }
