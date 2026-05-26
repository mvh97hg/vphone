function _cleanupFailedCall(lineObj) {
    if(!lineObj) return;
    console.log("Cleaning up failed/stuck call on line:", lineObj.LineNumber);
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
}
if (typeof globalThis !== 'undefined') { globalThis._cleanupFailedCall = _cleanupFailedCall; }
if (typeof window !== 'undefined') { window._cleanupFailedCall = _cleanupFailedCall; }

function VideoCall(lineObj, dialledNumber, extraHeaders) {
    if(userAgent == null) return;
    if(!userAgent.isRegistered()) return;
    if(lineObj == null) return;

    if(HasAudioDevice == false){
        Alert(lang.alert_no_microphone);
        _cleanupFailedCall(lineObj);
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
    try {
        lineObj.SipSession = new SIP.Inviter(userAgent, targetURI, spdOptions);
    } catch(e) {
        console.error("Failed to create SIP.Inviter (video):", e);
        Alert(lang.alert_no_microphone || "Call initialization failed");
        _cleanupFailedCall(lineObj);
        return;
    }
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
        // No microphone detected yet — try requesting permission first.
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                .then(function(stream){
                    stream.getTracks().forEach(function(t){ t.stop(); });
                    return navigator.mediaDevices.enumerateDevices();
                })
                .then(function(deviceInfos){
                    _applyDeviceList(deviceInfos);
                    if(HasAudioDevice){
                        // Permission granted — retry the call.
                        AudioCall(lineObj, dialledNumber, extraHeaders);
                    } else {
                        Alert(lang.alert_no_microphone);
                        _cleanupFailedCall(lineObj);
                    }
                })
                .catch(function(e){
                    console.warn("Microphone permission denied:", e.name);
                    Alert(lang.alert_no_microphone);
                    _cleanupFailedCall(lineObj);
                });
        } else {
            Alert(lang.alert_no_microphone);
            _cleanupFailedCall(lineObj);
        }
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
    try {
        lineObj.SipSession = new SIP.Inviter(userAgent, targetURI, spdOptions);
    } catch(e) {
        console.error("Failed to create SIP.Inviter (audio):", e);
        Alert(lang.alert_no_microphone || "Call initialization failed");
        _cleanupFailedCall(lineObj);
        return;
    }
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
        if(!lineObj.SipSession.data.reasonText) lineObj.SipSession.data.reasonText = "Media Error";
        if(!lineObj.SipSession.data.reasonCode) lineObj.SipSession.data.reasonCode = 500;
        if(!lineObj.SipSession.data.terminateby) lineObj.SipSession.data.terminateby = "local";
        teardownSession(lineObj);
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
    if(lineObj == null) return;
    if(lineObj.SipSession == null) {
        _cleanupFailedCall(lineObj);
        return;
    }

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
    if(lineObj == null) return;
    if(lineObj.SipSession == null) {
        _cleanupFailedCall(lineObj);
        return;
    }

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

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.VideoCall = VideoCall; }
if (typeof window !== 'undefined') { window.VideoCall = VideoCall; }
if (typeof globalThis !== 'undefined') { globalThis.AudioCallMenu = AudioCallMenu; }
if (typeof window !== 'undefined') { window.AudioCallMenu = AudioCallMenu; }
if (typeof globalThis !== 'undefined') { globalThis.AudioCall = AudioCall; }
if (typeof window !== 'undefined') { window.AudioCall = AudioCall; }
if (typeof globalThis !== 'undefined') { globalThis.countSessions = countSessions; }
if (typeof window !== 'undefined') { window.countSessions = countSessions; }
if (typeof globalThis !== 'undefined') { globalThis.StopRecording = StopRecording; }
if (typeof window !== 'undefined') { window.StopRecording = StopRecording; }
if (typeof globalThis !== 'undefined') { globalThis.MixAudioStreams = MixAudioStreams; }
if (typeof window !== 'undefined') { window.MixAudioStreams = MixAudioStreams; }
if (typeof globalThis !== 'undefined') { globalThis.QuickFindBuddy = QuickFindBuddy; }
if (typeof window !== 'undefined') { window.QuickFindBuddy = QuickFindBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.StartTransferSession = StartTransferSession; }
if (typeof window !== 'undefined') { window.StartTransferSession = StartTransferSession; }
if (typeof globalThis !== 'undefined') { globalThis.CancelTransferSession = CancelTransferSession; }
if (typeof window !== 'undefined') { window.CancelTransferSession = CancelTransferSession; }
if (typeof globalThis !== 'undefined') { globalThis.transferOnkeydown = transferOnkeydown; }
if (typeof window !== 'undefined') { window.transferOnkeydown = transferOnkeydown; }
if (typeof globalThis !== 'undefined') { globalThis.BlindTransfer = BlindTransfer; }
if (typeof window !== 'undefined') { window.BlindTransfer = BlindTransfer; }
if (typeof globalThis !== 'undefined') { globalThis.AttendedTransfer = AttendedTransfer; }
if (typeof window !== 'undefined') { window.AttendedTransfer = AttendedTransfer; }
if (typeof globalThis !== 'undefined') { globalThis.StartConferenceCall = StartConferenceCall; }
if (typeof window !== 'undefined') { window.StartConferenceCall = StartConferenceCall; }
if (typeof globalThis !== 'undefined') { globalThis.CancelConference = CancelConference; }
if (typeof window !== 'undefined') { window.CancelConference = CancelConference; }
if (typeof globalThis !== 'undefined') { globalThis.conferenceOnkeydown = conferenceOnkeydown; }
if (typeof window !== 'undefined') { window.conferenceOnkeydown = conferenceOnkeydown; }
if (typeof globalThis !== 'undefined') { globalThis.ConferenceDial = ConferenceDial; }
if (typeof window !== 'undefined') { window.ConferenceDial = ConferenceDial; }
if (typeof globalThis !== 'undefined') { globalThis.cancelSession = cancelSession; }
if (typeof window !== 'undefined') { window.cancelSession = cancelSession; }
if (typeof globalThis !== 'undefined') { globalThis.IsSessionActiveForUiAction = IsSessionActiveForUiAction; }
if (typeof window !== 'undefined') { window.IsSessionActiveForUiAction = IsSessionActiveForUiAction; }
if (typeof globalThis !== 'undefined') { globalThis.GuardLineAction = GuardLineAction; }
if (typeof window !== 'undefined') { window.GuardLineAction = GuardLineAction; }
if (typeof globalThis !== 'undefined') { globalThis.ApplyLocalHoldState = ApplyLocalHoldState; }
if (typeof window !== 'undefined') { window.ApplyLocalHoldState = ApplyLocalHoldState; }
if (typeof globalThis !== 'undefined') { globalThis.holdSession = holdSession; }
if (typeof window !== 'undefined') { window.holdSession = holdSession; }
if (typeof globalThis !== 'undefined') { globalThis.unholdSession = unholdSession; }
if (typeof window !== 'undefined') { window.unholdSession = unholdSession; }
if (typeof globalThis !== 'undefined') { globalThis.MuteSession = MuteSession; }
if (typeof window !== 'undefined') { window.MuteSession = MuteSession; }
if (typeof globalThis !== 'undefined') { globalThis.UnmuteSession = UnmuteSession; }
if (typeof window !== 'undefined') { window.UnmuteSession = UnmuteSession; }
if (typeof globalThis !== 'undefined') { globalThis.endSession = endSession; }
if (typeof window !== 'undefined') { window.endSession = endSession; }
if (typeof globalThis !== 'undefined') { globalThis.sendDTMF = sendDTMF; }
if (typeof window !== 'undefined') { window.sendDTMF = sendDTMF; }
if (typeof globalThis !== 'undefined') { globalThis.switchVideoSource = switchVideoSource; }
if (typeof window !== 'undefined') { window.switchVideoSource = switchVideoSource; }
if (typeof globalThis !== 'undefined') { globalThis.SendCanvas = SendCanvas; }
if (typeof window !== 'undefined') { window.SendCanvas = SendCanvas; }
if (typeof globalThis !== 'undefined') { globalThis.SendVideo = SendVideo; }
if (typeof window !== 'undefined') { window.SendVideo = SendVideo; }
if (typeof globalThis !== 'undefined') { globalThis.ShareScreen = ShareScreen; }
if (typeof window !== 'undefined') { window.ShareScreen = ShareScreen; }
if (typeof globalThis !== 'undefined') { globalThis.DisableVideoStream = DisableVideoStream; }
if (typeof window !== 'undefined') { window.DisableVideoStream = DisableVideoStream; }
if (typeof globalThis !== 'undefined') { globalThis.AppendNumpadDtmf = AppendNumpadDtmf; }
if (typeof window !== 'undefined') { window.AppendNumpadDtmf = AppendNumpadDtmf; }
if (typeof globalThis !== 'undefined') { globalThis.ClearNumpadDtmf = ClearNumpadDtmf; }
if (typeof window !== 'undefined') { window.ClearNumpadDtmf = ClearNumpadDtmf; }
if (typeof globalThis !== 'undefined') { globalThis.SendImmediateNumpadDtmf = SendImmediateNumpadDtmf; }
if (typeof window !== 'undefined') { window.SendImmediateNumpadDtmf = SendImmediateNumpadDtmf; }
if (typeof globalThis !== 'undefined') { globalThis.HandleNumpadKeydown = HandleNumpadKeydown; }
if (typeof window !== 'undefined') { window.HandleNumpadKeydown = HandleNumpadKeydown; }
if (typeof globalThis !== 'undefined') { globalThis.KeyPressNumpad = KeyPressNumpad; }
if (typeof window !== 'undefined') { window.KeyPressNumpad = KeyPressNumpad; }
if (typeof globalThis !== 'undefined') { globalThis.SendNumpadDtmf = SendNumpadDtmf; }
if (typeof window !== 'undefined') { window.SendNumpadDtmf = SendNumpadDtmf; }
