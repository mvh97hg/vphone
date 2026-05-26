function InitUi(){
    if(typeof web_hook_on_before_init !== 'undefined') web_hook_on_before_init(phoneOptions);

    EnsureAudioUnlockListeners();

    ApplyThemeColor()

    var phone = $("#Phone");
    phone.empty();
    phone.attr("class", "pageContainer");
    var appMode = (phoneOptions && phoneOptions.AppMode) ? String(phoneOptions.AppMode).toLowerCase() : "auto";
    var isEmbedded = (appMode == "embed") || (appMode == "auto" && window.self !== window.top);
    if(isEmbedded){
        if(!phoneOptions || phoneOptions.HideSettingsButton === undefined) HideSettingsButton = true;
        if(!phoneOptions || phoneOptions.HideRecordAllCallsButton === undefined) HideRecordAllCallsButton = true;
        if((profileUserID == null || profileUserID == "" || profileUserID == "null" || profileUserID == "undefined") && HasInjectedSipConfig()){
            profileUserID = SipUsername;
            localDB.setItem("profileUserID", profileUserID);
        }
        if((profileName == null || profileName == "" || profileName == "null" || profileName == "undefined") && SipUsername){
            profileName = SipUsername;
        }
    }
    $("body").removeClass("phoneStandaloneApp phoneEmbeddedApp");
    phone.removeClass("phoneStandalone phoneEmbedded phoneFrame250");
    if(isEmbedded){
        $("body").addClass("phoneEmbeddedApp");
        phone.addClass("phoneEmbedded");
    } else {
        $("body").addClass("phoneStandaloneApp");
        phone.addClass("phoneStandalone");
    }
    phone.addClass("phoneFrame250");

    phone.css("max-width", UiMaxWidth + "px");
    if(NotificationsActive && "Notification" in window && Notification.permission === "default"){
        if(checkNotificationPromise()){
            Notification.requestPermission().then(function(p){ console.log("Notification permission:", p); });
        } else {
            Notification.requestPermission(function(p){ console.log("Notification permission:", p); });
        }
    }
    var leftSection = $("<div/>");
    leftSection.attr("id", "leftContent");
    leftSection.attr("style", "float:left; height: 100%; width:320px");

    var leftHTML = "<table id=leftContentTable class=leftContentTable style=\"height:100%; width:100%\" cellspacing=0 cellpadding=0>";
    leftHTML += "<tr><td class=streamSection style=\"height: 50px; box-sizing: border-box;\">";
    leftHTML += "<div class=profileContainer>";
    leftHTML += "<div class=contact id=UserProfile style=\"cursor: default; margin-bottom:5px;\">";
    leftHTML += "<span id=TxtVoiceMessages class=voiceMessageNotifyer>0</span>"
    leftHTML += "<div id=UserProfilePic class=buddyIcon></div>";
    leftHTML += "<span class=settingsMenu>";
    leftHTML += "<button class=roundButtons id=BtnFreeDial><i class=\"fa fa-phone\"></i></button>";
    if(false){
        leftHTML += "<button id=BtnCreateGroup><i class=\"fa fa-users\"></i><i class=\"fa fa-plus\" style=\"font-size:9px\"></i></button>";
    }
    if(HideSettingsButton == false){
        leftHTML += "<button class=roundButtons id=SettingsMenu><i class=\"fa fa-cogs\"></i></button>";
    }
    leftHTML += "</span>";
    leftHTML += "<div class=contactNameText style=\"margin-right: 0px;\">"
    leftHTML += "<span id=dereglink class=dotOnline style=\"display:none\"></span>";
    leftHTML += "<span id=reglink class=dotOffline></span>";
    leftHTML += " <span id=UserCallID></span>"
    leftHTML += "</div>";
    leftHTML += "<div class=presenceText><span id=regStatus>&nbsp;</span> <span id=dndStatus></span></div>";
    leftHTML += "</div>";

    leftHTML += "</div>";

    leftHTML += "</td></tr>";
    leftHTML += "<tr id=searchArea><td class=streamSection style=\"height: 35px; box-sizing: border-box; padding-top: 3px; padding-bottom: 0px;\">";
    leftHTML += "<span id=divFindBuddy class=searchClean><INPUT id=txtFindBuddy type=text autocomplete=none style=\"width: calc(100% - 78px);\"></span>";
    leftHTML += "<button class=roundButtons id=BtnFilter style=\"margin-left:5px\"><i class=\"fa fa-sliders\"></i></button>"

    leftHTML += "</td></tr>";
    leftHTML += "<tr id=contentAreaRow><td class=streamSection style=\"padding:0\">";
    leftHTML += "<div id=mobileTopBar class=mobileTopBar></div>";
    leftHTML += "<div id=contactsTabHeader class=contactsTabHeader>";
    leftHTML += "<span style=\"flex:1;\">"+ GetUiText("mobile_tab_contacts", "Contacts", "addressbook_contact") +"</span>";
    leftHTML += "</div>";
    leftHTML += "<div id=myContacts class=\"contactArea cleanScroller\"></div>";
    leftHTML += "<div id=actionArea style=\"display:none\" class=\"contactArea cleanScroller\"></div>";
    leftHTML += "</td></tr>";
    leftHTML += "<tr id=tabBarRow><td class=streamSection style=\"padding:0\">";
    leftHTML += "<div id=bottomTabBar class=mainTabBar>";
    leftHTML += `<button type=button id=tab-dialpad class=\"mainTab activeTab\" data-label=\"${lang.dialpad}\" onclick=\"ShowTab('dialpad')\"><i class=\"fa fa-th mainTabIcon\"></i></button>`;
    leftHTML += `<button type=button id=tab-recents class=\"mainTab\" data-label=\"${lang.recents}\" onclick=\"ShowTab('recents')\"><i class=\"fa fa-history mainTabIcon\"></i></button>`;
    leftHTML += `<button type=button id=tab-contacts class=\"mainTab\" data-label=\"${lang.contacts}\" onclick=\"ShowTab('contacts')\"><i class=\"fa fa-address-book mainTabIcon\"></i></button>`;
    leftHTML += "</div>";

    leftHTML += "</td></tr>";
    leftHTML += "</table>";

    leftSection.html(leftHTML);
    ApplyMobileLabels();
    var rightSection = $("<div/>");
    rightSection.attr("id", "rightContent");
    rightSection.attr("class", "rightContent");
    rightSection.attr("style", "margin-left: 320px; height: 100%");

    phone.append(leftSection);
    phone.append(rightSection);

    if(DisableFreeDial == true) {
        $("#BtnFreeDial").hide();
    }
    $("#BtnCreateGroup").hide();

    var profilePrepend = "";
    var profileVcard = getDbItem("profileVcard", null);
    if(profileVcard != null) {
        profileVcard = JSON.parse(profileVcard);
        var displayPrefix = getDbItem("ProfileDisplayPrefix", "");
        var displayPrefixSep = getDbItem("ProfileDisplayPrefixSeparator", "-");
        if(displayPrefix != ""){
            try{
                var vCardValue = profileVcard[displayPrefix];
                if(vCardValue && vCardValue != ""){
                    profilePrepend  =  vCardValue + " "+ displayPrefixSep +" "
                }
            }
            catch(e){}
        }
    }
    if(profileName) $("#UserCallID").html(profilePrepend +""+ profileName);
    $("#UserProfilePic").css("background-image", "url('"+ getPicture("profilePicture") +"')");

    $("#BtnFilter").attr("title", lang.filter_and_sort)
    $("#BtnFilter").on('click', function(event){
        if(UiCustomSortAndFilterButton == true){
            if(typeof web_hook_sort_and_filter !== 'undefined') {
                web_hook_sort_and_filter(event);
            }
        } else {
            ShowSortAnfFilter();
        }
    });

    $("#txtFindBuddy").attr("placeholder", lang.find_someone)
    $("#txtFindBuddy").on('keyup', function(event){
        var activeTab = GetActiveMainTab();
        var clean = SanitizePhoneSearch($("#txtFindBuddy").val());
        if($("#txtFindBuddy").val() != clean) $("#txtFindBuddy").val(clean);
        if(activeTab == "recents"){
            SetStoredTabSearch("recents", clean);
            ShowRecentsTab();
            $("#searchArea").show();
        }
        else {
            SetStoredTabSearch("contacts", clean);
            UpdateBuddyList();
        }
        $("#txtFindBuddy").focus();
    });

    $("#BtnFreeDial").attr("title", lang.call)
    $("#BtnFreeDial").on('click', function(event){
        if(DisableFreeDial == true) return;

        if(UiCustomDialButton == true){
            if(typeof web_hook_dial_out !== 'undefined') {
                web_hook_dial_out(event);
            }
        } else {
            ShowDial();
        }
    });

        $("#mobileTopBar").on('click', '.mobileTopBtn', function(event){
            var action = $(this).attr('data-action');
            var activeTab = GetActiveMainTab();
            if(action == "filter"){
                if(activeTab == "contacts") ShowSortAnfFilter();
            }
            if(action == "search"){
                if(activeTab == "recents"){
                    $("#searchArea").show();
                    $("#txtFindBuddy").val(GetStoredTabSearch("recents"));
                    ShowRecentsTab();
                }
                else {
                    if(activeTab != "contacts") ShowContacts();
                    $("#searchArea").show();
                    $("#txtFindBuddy").val(GetStoredTabSearch("contacts"));
                    UpdateBuddyList();
                }
                $("#txtFindBuddy").focus();
            }
            if(action == "settings"){
                ShowMyProfile();
            }
            if(action == "add-contact"){
                if(UiCustomAddBuddy == true){
                    if(typeof web_hook_on_add_buddy !== 'undefined') web_hook_on_add_buddy(event);
                } else {
                    AddSomeoneWindow();
                }
            }
            if(action == "clear-tab"){
                HandleMobileClearTab($(this).attr('data-tab') || activeTab);
            }
            if(action == "more"){
                ShowMyProfileMenu(this);
            }
            if(action == "reg"){
                if($("#dereglink").is(":visible")){
                    Unregister();
                } else {
                    Register();
                }
            }
        });

    $("#TxtVoiceMessages").on('click', function(event){
        if(VoicemailDid != ""){
            DialByLine("audio", null, VoicemailDid, lang.voice_mail);
        }
    });

    $("#BtnCreateGroup").attr("title", lang.create_group)
    $("#BtnCreateGroup").on('click', function(event){
        CreateGroupWindow();
    });

    if($("#SettingsMenu").length > 0){
        $("#SettingsMenu").attr("title", lang.configure_extension)
        $("#SettingsMenu").on('click', function(event){
            if(UiCustomConfigMenu == true){
                if(typeof web_hook_on_config_menu !== 'undefined') {
                    web_hook_on_config_menu(event);
                }
            } else {
                ShowMyProfile();
            }
        });
    }
    $("#reglink").on('click', Register);
    $("#dereglink").on('click', Unregister);
    $("#WebRtcFailed").on('click', function(){
        Confirm(lang.error_connecting_web_socket, lang.web_socket_error, function(){
            window.open("https://"+ wssServer +":"+ WebSocketPort +"/httpstatus");
        }, null);
    });
    $(".loading").remove();
    ShowTab('dialpad');

    UpdateUI();
    if(welcomeScreen && isEmbedded == false){
        if(localDB.getItem("WelcomeScreenAccept") != "yes"){
            OpenWindow(welcomeScreen, lang.welcome, 480, 600, true, false, lang.accept, function(){
                localDB.setItem("WelcomeScreenAccept", "yes");
                CloseWindow();
                ShowTab('dialpad');
            }, null, null, null, null);

            return;
        }
    }
    if(profileUserID == null || profileUserID == "" || profileUserID == "null" || profileUserID == "undefined"){
        profileUserID = uID();
        localDB.setItem("profileUserID", profileUserID);
    }

    PopulateBuddyList();
    localDB.setItem("SelectedBuddy", null);

    PreloadAudioFiles();
    if(typeof web_hook_on_init !== 'undefined') web_hook_on_init();

    if(HasInjectedSipConfig()){
        CreateUserAgent();
    } else {
        console.warn("SIP account is not configured; open Settings to configure extension details.");
    }
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.InitUi = InitUi; }
if (typeof window !== 'undefined') { window.InitUi = InitUi; }
