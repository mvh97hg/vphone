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
            var incomingDisplay = BuildCallDisplayInfo(lineObj);
            var incomingCallerText = incomingDisplay.primary || did;
            if(incomingDisplay.secondary && incomingDisplay.secondary != "") {
                incomingCallerText += " <" + incomingDisplay.secondary + ">";
            }
            var noticeOptions = {
                body: lang.incoming_call_from +" " + incomingCallerText,
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
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                .then(function(stream){
                    stream.getTracks().forEach(function(t){ t.stop(); });
                    return navigator.mediaDevices.enumerateDevices();
                })
                .then(function(deviceInfos){
                    _applyDeviceList(deviceInfos);
                    if(HasAudioDevice){
                        AnswerAudioCall(lineNumber);
                    } else {
                        Alert(lang.alert_no_microphone);
                        $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_failed);
                        $("#line-" + lineObj.LineNumber + "-AnswerCall").hide();
                    }
                })
                .catch(function(){ Alert(lang.alert_no_microphone); });
        } else {
            Alert(lang.alert_no_microphone);
            $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_failed);
            $("#line-" + lineObj.LineNumber + "-AnswerCall").hide();
        }
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
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                .then(function(stream){
                    stream.getTracks().forEach(function(t){ t.stop(); });
                    return navigator.mediaDevices.enumerateDevices();
                })
                .then(function(deviceInfos){
                    _applyDeviceList(deviceInfos);
                    if(HasAudioDevice){
                        AnswerVideoCall(lineNumber);
                    } else {
                        Alert(lang.alert_no_microphone);
                        $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_failed);
                        $("#line-" + lineObj.LineNumber + "-AnswerCall").hide();
                    }
                })
                .catch(function(){ Alert(lang.alert_no_microphone); });
        } else {
            Alert(lang.alert_no_microphone);
            $("#line-" + lineObj.LineNumber + "-msg").html(lang.call_failed);
            $("#line-" + lineObj.LineNumber + "-AnswerCall").hide();
        }
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

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.ReceiveCall = ReceiveCall; }
if (typeof window !== 'undefined') { window.ReceiveCall = ReceiveCall; }
if (typeof globalThis !== 'undefined') { globalThis.AnswerAudioCall = AnswerAudioCall; }
if (typeof window !== 'undefined') { window.AnswerAudioCall = AnswerAudioCall; }
if (typeof globalThis !== 'undefined') { globalThis.AnswerVideoCall = AnswerVideoCall; }
if (typeof window !== 'undefined') { window.AnswerVideoCall = AnswerVideoCall; }
if (typeof globalThis !== 'undefined') { globalThis.RejectCall = RejectCall; }
if (typeof window !== 'undefined') { window.RejectCall = RejectCall; }
if (typeof globalThis !== 'undefined') { globalThis.onInviteCancel = onInviteCancel; }
if (typeof window !== 'undefined') { window.onInviteCancel = onInviteCancel; }
if (typeof globalThis !== 'undefined') { globalThis.onInviteAccepted = onInviteAccepted; }
if (typeof window !== 'undefined') { window.onInviteAccepted = onInviteAccepted; }
if (typeof globalThis !== 'undefined') { globalThis.onInviteTrying = onInviteTrying; }
if (typeof window !== 'undefined') { window.onInviteTrying = onInviteTrying; }
if (typeof globalThis !== 'undefined') { globalThis.onInviteProgress = onInviteProgress; }
if (typeof window !== 'undefined') { window.onInviteProgress = onInviteProgress; }
if (typeof globalThis !== 'undefined') { globalThis.onInviteRejected = onInviteRejected; }
if (typeof window !== 'undefined') { window.onInviteRejected = onInviteRejected; }
if (typeof globalThis !== 'undefined') { globalThis.onInviteRedirected = onInviteRedirected; }
if (typeof window !== 'undefined') { window.onInviteRedirected = onInviteRedirected; }
if (typeof globalThis !== 'undefined') { globalThis.onSessionReceivedBye = onSessionReceivedBye; }
if (typeof window !== 'undefined') { window.onSessionReceivedBye = onSessionReceivedBye; }
if (typeof globalThis !== 'undefined') { globalThis.onSessionReinvited = onSessionReinvited; }
if (typeof window !== 'undefined') { window.onSessionReinvited = onSessionReinvited; }
if (typeof globalThis !== 'undefined') { globalThis.onSessionReceivedMessage = onSessionReceivedMessage; }
if (typeof window !== 'undefined') { window.onSessionReceivedMessage = onSessionReceivedMessage; }
if (typeof globalThis !== 'undefined') { globalThis.onSessionDescriptionHandlerCreated = onSessionDescriptionHandlerCreated; }
if (typeof window !== 'undefined') { window.onSessionDescriptionHandlerCreated = onSessionDescriptionHandlerCreated; }
if (typeof globalThis !== 'undefined') { globalThis.onTrackAddedEvent = onTrackAddedEvent; }
if (typeof window !== 'undefined') { window.onTrackAddedEvent = onTrackAddedEvent; }
if (typeof globalThis !== 'undefined') { globalThis.teardownSession = teardownSession; }
if (typeof window !== 'undefined') { window.teardownSession = teardownSession; }
if (typeof globalThis !== 'undefined') { globalThis.StartRemoteAudioMediaMonitoring = StartRemoteAudioMediaMonitoring; }
if (typeof window !== 'undefined') { window.StartRemoteAudioMediaMonitoring = StartRemoteAudioMediaMonitoring; }
if (typeof globalThis !== 'undefined') { globalThis.StartLocalAudioMediaMonitoring = StartLocalAudioMediaMonitoring; }
if (typeof window !== 'undefined') { window.StartLocalAudioMediaMonitoring = StartLocalAudioMediaMonitoring; }
if (typeof globalThis !== 'undefined') { globalThis.SoundMeter = SoundMeter; }
if (typeof window !== 'undefined') { window.SoundMeter = SoundMeter; }
if (typeof globalThis !== 'undefined') { globalThis.MeterSettingsOutput = MeterSettingsOutput; }
if (typeof window !== 'undefined') { window.MeterSettingsOutput = MeterSettingsOutput; }
if (typeof globalThis !== 'undefined') { globalThis.SaveQosData = SaveQosData; }
if (typeof window !== 'undefined') { window.SaveQosData = SaveQosData; }
if (typeof globalThis !== 'undefined') { globalThis.DeleteQosData = DeleteQosData; }
if (typeof window !== 'undefined') { window.DeleteQosData = DeleteQosData; }
