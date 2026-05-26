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
    // stopSessionHoldMusic(session);
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

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.SubscribeAll = SubscribeAll; }
if (typeof window !== 'undefined') { window.SubscribeAll = SubscribeAll; }
if (typeof globalThis !== 'undefined') { globalThis.SelfSubscribe = SelfSubscribe; }
if (typeof window !== 'undefined') { window.SelfSubscribe = SelfSubscribe; }
if (typeof globalThis !== 'undefined') { globalThis.SubscribeVoicemail = SubscribeVoicemail; }
if (typeof window !== 'undefined') { window.SubscribeVoicemail = SubscribeVoicemail; }
if (typeof globalThis !== 'undefined') { globalThis.SubscribeBuddy = SubscribeBuddy; }
if (typeof window !== 'undefined') { window.SubscribeBuddy = SubscribeBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.UnsubscribeAll = UnsubscribeAll; }
if (typeof window !== 'undefined') { window.UnsubscribeAll = UnsubscribeAll; }
if (typeof globalThis !== 'undefined') { globalThis.UnsubscribeBlf = UnsubscribeBlf; }
if (typeof window !== 'undefined') { window.UnsubscribeBlf = UnsubscribeBlf; }
if (typeof globalThis !== 'undefined') { globalThis.UnsubscribeVoicemail = UnsubscribeVoicemail; }
if (typeof window !== 'undefined') { window.UnsubscribeVoicemail = UnsubscribeVoicemail; }
if (typeof globalThis !== 'undefined') { globalThis.SelfUnsubscribe = SelfUnsubscribe; }
if (typeof window !== 'undefined') { window.SelfUnsubscribe = SelfUnsubscribe; }
if (typeof globalThis !== 'undefined') { globalThis.UnsubscribeBuddy = UnsubscribeBuddy; }
if (typeof window !== 'undefined') { window.UnsubscribeBuddy = UnsubscribeBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.VoicemailNotify = VoicemailNotify; }
if (typeof window !== 'undefined') { window.VoicemailNotify = VoicemailNotify; }
if (typeof globalThis !== 'undefined') { globalThis.ReceiveNotify = ReceiveNotify; }
if (typeof window !== 'undefined') { window.ReceiveNotify = ReceiveNotify; }
