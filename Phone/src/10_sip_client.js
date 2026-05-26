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

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.CreateUserAgent = CreateUserAgent; }
if (typeof window !== 'undefined') { window.CreateUserAgent = CreateUserAgent; }
if (typeof globalThis !== 'undefined') { globalThis.IsTransportReady = IsTransportReady; }
if (typeof window !== 'undefined') { window.IsTransportReady = IsTransportReady; }
if (typeof globalThis !== 'undefined') { globalThis.onTransportConnected = onTransportConnected; }
if (typeof window !== 'undefined') { window.onTransportConnected = onTransportConnected; }
if (typeof globalThis !== 'undefined') { globalThis.onTransportConnectError = onTransportConnectError; }
if (typeof window !== 'undefined') { window.onTransportConnectError = onTransportConnectError; }
if (typeof globalThis !== 'undefined') { globalThis.onTransportDisconnected = onTransportDisconnected; }
if (typeof window !== 'undefined') { window.onTransportDisconnected = onTransportDisconnected; }
if (typeof globalThis !== 'undefined') { globalThis.DisconnectTransport = DisconnectTransport; }
if (typeof window !== 'undefined') { window.DisconnectTransport = DisconnectTransport; }
if (typeof globalThis !== 'undefined') { globalThis.ReconnectTransport = ReconnectTransport; }
if (typeof window !== 'undefined') { window.ReconnectTransport = ReconnectTransport; }
if (typeof globalThis !== 'undefined') { globalThis.Register = Register; }
if (typeof window !== 'undefined') { window.Register = Register; }
if (typeof globalThis !== 'undefined') { globalThis.Unregister = Unregister; }
if (typeof window !== 'undefined') { window.Unregister = Unregister; }
if (typeof globalThis !== 'undefined') { globalThis.onRegistered = onRegistered; }
if (typeof window !== 'undefined') { window.onRegistered = onRegistered; }
if (typeof globalThis !== 'undefined') { globalThis.onRegisterFailed = onRegisterFailed; }
if (typeof window !== 'undefined') { window.onRegisterFailed = onRegisterFailed; }
if (typeof globalThis !== 'undefined') { globalThis.onUnregistered = onUnregistered; }
if (typeof window !== 'undefined') { window.onUnregistered = onUnregistered; }
