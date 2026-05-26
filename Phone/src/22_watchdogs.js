var _detectDevicesPermissionRequested = false;

function _applyDeviceList(deviceInfos) {
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
}

function DetectDevices(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    navigator.mediaDevices.enumerateDevices().then(function(deviceInfos){
        _applyDeviceList(deviceInfos);

        // If all audioinput devices have empty labels, permission hasn't been granted yet.
        // Request permission once via getUserMedia so the browser prompts the user.
        var allLabelsEmpty = AudioinputDevices.length > 0 &&
            AudioinputDevices.every(function(d){ return !d.label; });

        if ((allLabelsEmpty || AudioinputDevices.length === 0) && !_detectDevicesPermissionRequested) {
            _detectDevicesPermissionRequested = true;
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                .then(function(stream){
                    // Stop all tracks immediately - we only needed to trigger the permission prompt.
                    stream.getTracks().forEach(function(t){ t.stop(); });
                    // Re-enumerate now that permission is granted.
                    return navigator.mediaDevices.enumerateDevices();
                })
                .then(function(newDeviceInfos){
                    _applyDeviceList(newDeviceInfos);
                    console.log("Microphone permission granted. HasAudioDevice:", HasAudioDevice,
                        "Devices:", AudioinputDevices.length);
                })
                .catch(function(e){
                    console.warn("Microphone permission request failed or denied:", e.name, e.message);
                    _detectDevicesPermissionRequested = false; // allow retry later
                });
        }
    }).catch(function(e){
        console.error("Error enumerating devices", e);
    });
}

DetectDevices();
window.setInterval(function(){
    DetectDevices();
}, 10000);

// Re-detect immediately whenever a media device is plugged/unplugged or permission changes.
if(navigator.mediaDevices && navigator.mediaDevices.addEventListener){
    navigator.mediaDevices.addEventListener("devicechange", function(){
        _detectDevicesPermissionRequested = false; // allow re-request if needed
        DetectDevices();
    });
}
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








// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.DetectDevices = DetectDevices; }
if (typeof window !== 'undefined') { window.DetectDevices = DetectDevices; }


// ============================================================================
//                        GLOBAL EVENT LISTENERS (Run Last)
// ============================================================================

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
