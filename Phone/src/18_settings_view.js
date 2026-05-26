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
        AudioVideoHtml += "<div class=\"pill-nav pill-nav-quality\">";
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

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.PopulateSettingsDeviceOptions = PopulateSettingsDeviceOptions; }
if (typeof window !== 'undefined') { window.PopulateSettingsDeviceOptions = PopulateSettingsDeviceOptions; }
if (typeof globalThis !== 'undefined') { globalThis.ShowMyProfile = ShowMyProfile; }
if (typeof window !== 'undefined') { window.ShowMyProfile = ShowMyProfile; }
if (typeof globalThis !== 'undefined') { globalThis.RefreshRegistration = RefreshRegistration; }
if (typeof window !== 'undefined') { window.RefreshRegistration = RefreshRegistration; }
if (typeof globalThis !== 'undefined') { globalThis.ToggleHeading = ToggleHeading; }
if (typeof window !== 'undefined') { window.ToggleHeading = ToggleHeading; }
if (typeof globalThis !== 'undefined') { globalThis.ToggleAutoAnswer = ToggleAutoAnswer; }
if (typeof window !== 'undefined') { window.ToggleAutoAnswer = ToggleAutoAnswer; }
if (typeof globalThis !== 'undefined') { globalThis.ToggleDoNoDisturb = ToggleDoNoDisturb; }
if (typeof window !== 'undefined') { window.ToggleDoNoDisturb = ToggleDoNoDisturb; }
if (typeof globalThis !== 'undefined') { globalThis.ToggleCallWaiting = ToggleCallWaiting; }
if (typeof window !== 'undefined') { window.ToggleCallWaiting = ToggleCallWaiting; }
if (typeof globalThis !== 'undefined') { globalThis.ToggleRecordAllCalls = ToggleRecordAllCalls; }
if (typeof window !== 'undefined') { window.ToggleRecordAllCalls = ToggleRecordAllCalls; }
if (typeof globalThis !== 'undefined') { globalThis.ChangeSettings = ChangeSettings; }
if (typeof window !== 'undefined') { window.ChangeSettings = ChangeSettings; }
