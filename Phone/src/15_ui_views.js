function CloseNumpadInline(){
    if(!dtmfInlinePanelState) return;
    var actionArea = $("#actionArea");
    actionArea.html(dtmfInlinePanelState.html || "");
    if(dtmfInlinePanelState.className){
        actionArea.attr("class", dtmfInlinePanelState.className);
    }
    dtmfInlinePanelState = null;
}
function BuildDialInputRowHtml(inputId, inputClass, inputAttrs, onInput, onKeyDown, deleteButtonId, deleteButtonClass, deleteButtonTitle, deleteOnClick, deleteButtonContent){
    var html = "";
    html += "<div class=dialInputRow>";
    html += "<input id=\"" + inputId + "\" class=\"" + inputClass + "\" " + (inputAttrs || "") + " oninput=\"" + (onInput || "") + "\" onkeydown=\"" + (onKeyDown || "") + "\" style=\"width:170px; height:32px\">";
    html += "<button id=\"" + deleteButtonId + "\" class=\"" + deleteButtonClass + "\" title=\"" + (deleteButtonTitle || "") + "\" onclick=\"" + deleteOnClick + "\">" + deleteButtonContent + "</button>";
    html += "</div>";
    return html;
}
function BuildDialPadGridHtml(onDigitExprTemplate, cellSpacing){
    var html = "";
    var expr = onDigitExprTemplate || "KeyPress('%DIGIT%')";
    var spacing = cellSpacing || 8;
    function clickExpr(digit){
        return String(expr).replace("%DIGIT%", digit);
    }
    html += "<table class=\"dialPadGrid\" cellspacing=" + spacing + " cellpadding=0>";
    html += "<tr><td><button class=dialButtons onclick=\"" + clickExpr("1") + "\"><div>1</div><span>&nbsp;</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("2") + "\"><div>2</div><span>ABC</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("3") + "\"><div>3</div><span>DEF</span></button></td></tr>";
    html += "<tr><td><button class=dialButtons onclick=\"" + clickExpr("4") + "\"><div>4</div><span>GHI</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("5") + "\"><div>5</div><span>JKL</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("6") + "\"><div>6</div><span>MNO</span></button></td></tr>";
    html += "<tr><td><button class=dialButtons onclick=\"" + clickExpr("7") + "\"><div>7</div><span>PQRS</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("8") + "\"><div>8</div><span>TUV</span></button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("9") + "\"><div>9</div><span>WXYZ</span></button></td></tr>";
    html += "<tr><td><button class=dialButtons onclick=\"" + clickExpr("*") + "\">*</button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("0") + "\">0</button></td>";
    html += "<td><button class=dialButtons onclick=\"" + clickExpr("#") + "\">#</button></td></tr>";
    html += "</table>";
    return html;
}
function ShowNumpad(lineNum){
    console.log("Show Numpad");
    HidePopup();

    RestoreCallControls(lineNum)
    var html = ""
    html += "<div class=\"dialScreenMobile dtmfDialpadPopup\">";
    html += BuildDialInputRowHtml(
        "line-" + lineNum + "-dtmf-input",
        "dialTextInput dtmfInput",
        "type=tel inputmode=tel autocomplete=off",
        "",
        "HandleNumpadKeydown('" + lineNum + "', event)",
        "line-" + lineNum + "-dtmf-delete",
        "roundButtons dtmfClearButton",
        lang.clear,
        "KeyPressNumpad('" + lineNum + "', 'del')",
        "<i class=\"fa fa-arrow-left\"></i>"
    );
    html += BuildDialPadGridHtml("KeyPressNumpad('" + lineNum + "', '%DIGIT%')", 8);
    html += "</div>";
    OpenWindow(html, "", 392, 250, true, false, lang.cancel, function(){
        CloseWindow();
    }, null, null, function(){
        if(windowObj && windowObj.parent){
            windowObj.parent().addClass("dtmfDialpadDialog");
        }
        $("#line-" + lineNum + "-dtmf-input").focus();
    }, function(){
        return true;
    });
}
function ShowPresentMenu(obj, lineNum){
    var items = [];
    items.push({value: "src-camera", icon : "fa fa-video-camera", text: lang.camera, isHeader: false });
    items.push({value: "src-canvas", icon : "fa fa-pencil-square", text: lang.scratchpad, isHeader: false });
    items.push({value: "src-desktop", icon : "fa fa-desktop", text: lang.screen, isHeader: false });
    items.push({value: "src-video", icon : "fa fa-file-video-o", text: lang.video, isHeader: false });
    items.push({value: "src-blank", icon : "fa fa-ban", text: lang.blank, isHeader: false });

    var menu = {
        selectEvent : function( event, ui ) {
            var id = ui.item.attr("value");
            if(id != null) {
                if(id == "src-camera") PresentCamera(lineNum);
                if(id == "src-canvas") PresentScratchpad(lineNum);
                if(id == "src-desktop") PresentScreen(lineNum);
                if(id == "src-video") PresentVideo(lineNum);
                if(id == "src-blank") PresentBlank(lineNum);
                HidePopup();
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

function RestoreCallControls(lineNum){
    $("#line-"+ lineNum +"-btn-more").show();
}
function ExpandVideoArea(lineNum){
    $("#line-" + lineNum + "-call-fullscreen").prop("class","streamSection highlightSection FullScreenVideo");

    $("#line-" + lineNum + "-btn-restore").show();
    $("#line-" + lineNum + "-btn-expand").hide();

    $("#line-" + lineNum + "-VideoCall").css("background-color", "#000000");

    RedrawStage(lineNum, false);
    if(typeof web_hook_on_expand_video_area !== 'undefined') {
        web_hook_on_expand_video_area(lineNum);
    }
}
function RestoreVideoArea(lineNum){
    $("#line-" + lineNum + "-call-fullscreen").prop("class","streamSection highlightSection");

    $("#line-" + lineNum + "-btn-restore").hide();
    $("#line-" + lineNum + "-btn-expand").show();

    $("#line-" + lineNum + "-VideoCall").css("background-color", "");

    RedrawStage(lineNum, false);
    if(typeof web_hook_on_restore_video_area !== 'undefined') {
        web_hook_on_restore_video_area(lineNum);
    }
}
var Line = function(lineNumber, displayName, displayNumber, buddyObj){
    this.LineNumber = lineNumber;
    this.DisplayName = displayName;
    this.DisplayNumber = displayNumber;
    this.IsSelected = false;
    this.BuddyObj = buddyObj;
    this.SipSession = null;
    this.LocalSoundMeter = null;
    this.RemoteSoundMeter = null;
}
function ShowDial(){
    $(".mainTab").removeClass("activeTab");
    $("#tab-dialpad").addClass("activeTab");
    RenderMobileTopBar("dialpad");
    $("#contactsTabHeader").hide();

    CloseUpSettings();

    $("#myContacts").hide();
    $("#searchArea").hide();
    $("#leftContent").addClass("dialpadMode");
    $("#actionArea").addClass("dialpadMode");
    $("#myContacts").removeClass("dialpadMode");
    $("#actionArea").empty();

    var html = "";
    html += "<div class=dialScreenMobile>";
    html += BuildDialInputRowHtml(
        "dialText",
        "dialTextInput",
        "",
        "handleDialInput(this, event)",
        "dialOnkeydown(event, this)",
        "dialDeleteKey",
        "roundButtons",
        "",
        "KeyPress('del')",
        "⌫"
    );
    html += BuildDialPadGridHtml("KeyPress('%DIGIT%')", 8);
    html += "<div class=dialActionsRow>";
    html += "<button class=\"dialButtons dialButtonsDial\" id=dialAudio title=\""+ lang.audio_call  +"\" onclick=\"DialByLine('audio')\"><i class=\"fa fa-phone\"></i></button>";
    if(EnableVideoCalling == true){
        html += "<button class=\"dialButtons dialButtonsDial\" id=dialVideo style=\"margin-left:12px\" title=\""+ lang.video_call +"\" onclick=\"DialByLine('video')\"><i class=\"fa fa-video-camera\"></i></button>";
    }
    html += "</div>";
    html += "<div id=dialpad-setting-toggles class=dialpadSettingToggles>";
    html += "<button id=dialpad-toggle-auto class=\"roundButtons dialpadToggleBtn "+ (AutoAnswerEnabled? "toggleOn" : "toggleOff") +"\" title=\""+ lang.auto_answer +"\" onclick=\"ToggleDialpadSetting('auto')\"><i class=\"fa fa-phone\"></i></button>";
    html += "<button id=dialpad-toggle-dnd class=\"roundButtons dialpadToggleBtn "+ (DoNotDisturbEnabled? "toggleOn" : "toggleOff") +"\" title=\""+ lang.do_no_disturb +"\" onclick=\"ToggleDialpadSetting('dnd')\"><i class=\"fa fa-ban\"></i></button>";
    html += "<button id=dialpad-toggle-cw class=\"roundButtons dialpadToggleBtn "+ (CallWaitingEnabled? "toggleOn" : "toggleOff") +"\" title=\""+ lang.call_waiting +"\" onclick=\"ToggleDialpadSetting('cw')\"><i class=\"fa fa-volume-control-phone\"></i></button>";
    if(HideRecordAllCallsButton == false){
        html += "<button id=dialpad-toggle-rec class=\"roundButtons dialpadToggleBtn "+ (RecordAllCalls? "toggleOn" : "toggleOff") +"\" title=\""+ lang.record_all_calls +"\" onclick=\"ToggleDialpadSetting('rec')\"><i class=\"fa fa-dot-circle-o\"></i></button>";
    }
    html += "</div>";
    html += "</div>";
    $("#actionArea").html(html);
    SyncDialDeleteKey();
    $("#actionArea").show();
    $("#dialText").focus();
    UpdateDialpadSettingButtons();
}
function SyncDialDeleteKey(){
    var dialText = $("#dialText");
    var value = dialText.val() || "";
    var hasDigits = value.length > 0;
    $("#dialDeleteKey").toggleClass("hasDigits", hasDigits);
    var fontSize = (value.length > 18) ? "14px" : ((value.length > 14) ? "15px" : "17px");
    dialText.css("font-size", fontSize);
}
function handleDialInput(obj, event){
    if(EnableAlphanumericDial){
        $("#dialText").val($("#dialText").val().replace(/[^\da-zA-Z\*\#\+]/g, "").substring(0,MaxDidLength));
    }
    else {
        $("#dialText").val($("#dialText").val().replace(/[^\d\*\#\+]/g, "").substring(0,MaxDidLength));
    }
    $("#dialVideo").prop('disabled', ($("#dialText").val().length >= DidLength));
    SyncDialDeleteKey();
}
function dialOnkeydown(event, obj, buddy) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13'){
        event.preventDefault();

        if(event.ctrlKey && EnableVideoCalling == true){
            DialByLine('video');
        }
        else {
            DialByLine('audio');
        }

        return false;
    }
}
function KeyPress(num){
    var currVal = $("#dialText").val();
    var textElObj = $("#dialText").get(0);
    var ss = textElObj.selectionStart;
    var se = textElObj.selectionEnd;
    var ln = currVal.length;

    var newValue = "";
    if(ss == se){
        if(num == "del"){
            newValue = currVal.substring(0, ss-1) + currVal.substring(se, ln);
        } else {
            newValue = currVal.substring(0, ss) + num + currVal.substring(se, ln);
        }
        $("#dialText").val(newValue.substring(0,MaxDidLength));
        $("#dialText").focus();
        if(num == "del"){
            textElObj.setSelectionRange(ss-1, ss-1);
        }else {
            textElObj.setSelectionRange(ss+1, ss+1);
        }
    } else {
        if(num == "del"){
            newValue = currVal.substring(0, ss) + currVal.substring(se, ln);
        } else {
            newValue = currVal.substring(0, ss) + num + currVal.substring(se, ln);
        }
        $("#dialText").val(newValue.substring(0,MaxDidLength));
        $("#dialText").focus();
        if(num == "del"){
            textElObj.setSelectionRange(ss, ss);
        }else {
            textElObj.setSelectionRange(ss+1, ss+1);
        }
    }

    $("#dialVideo").prop('disabled', ($("#dialText").val().length >= DidLength));
    SyncDialDeleteKey();
}
function CloseUpSettings(){
    try{
        settingsVideoStreamTrack.stop();
        console.log("settingsVideoStreamTrack... stopped");
    }
    catch(e){}
    try{
        var localVideo = $("#local-video-preview").get(0);
        localVideo.srcObject = null;
    }
    catch{}
    settingsVideoStream = null;
    try{
        settingsMicrophoneStreamTrack.stop();
        console.log("settingsMicrophoneStreamTrack... stopped");
    }
    catch(e){}
    settingsMicrophoneStream = null;
    try{
        settingsMicrophoneSoundMeter.stop();
    }
    catch(e){}
    settingsMicrophoneSoundMeter = null;
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
}
function ShowContacts(){
    $(".mainTab").removeClass("activeTab");
    $("#tab-contacts").addClass("activeTab");
    RenderMobileTopBar("contacts");

    CloseUpSettings();

    $("#leftContent").removeClass("dialpadMode");
    $("#actionArea").removeClass("dialpadMode");
    $("#myContacts").removeClass("dialpadMode");

    $("#actionArea").hide();
    $("#actionArea").empty();

    $("#contactsTabHeader").hide();
    $("#myContacts").show();
    $("#searchArea").hide();
    $("#txtFindBuddy").val(GetStoredTabSearch("contacts"));
}
function RenderMobileTopBar(tabName){
    var html = "";
    var regLinkHtml = "<button type=button class=mobileTopBtn mobileRegLink data-action=reg title=\"Registration\"><span class=mobileRegStatus><span id=mobileRegDot class=dotOffline></span><span id=mobileRegText>Offline</span></span></button>";
    if(tabName == "dialpad"){
        html += "<div class=mobileTopBarInner>";
        html += "<div class=mobileTopBarTitle>"+ regLinkHtml +"</div>";
        html += "<div class=mobileTopBarActions>";
        if(HideSettingsButton == false) html += "<button type=button class=mobileTopBtn data-action=more><i class=\"fa fa-ellipsis-v\"></i></button>";
        html += "</div></div>";
    }
    else if(tabName == "recents"){
        html += "<div class=mobileTopBarInner>";
        html += "<div class=mobileTopBarTitle>"+ regLinkHtml +"</div>";
        html += "<div class=mobileTopBarActions>";
        html += "<button type=button class=mobileTopBtn data-action=clear-tab data-tab=recents title=\""+ EscapeAttr(lang.delete || "Delete") +"\"><i class=\"fa fa-trash\"></i></button>";
        if(HideSettingsButton == false) html += "<button type=button class=mobileTopBtn data-action=more><i class=\"fa fa-ellipsis-v\"></i></button>";
        html += "</div></div>";
    }
    else {
        html += "<div class=mobileTopBarInner>";
        html += "<div class=mobileTopBarTitle>"+ regLinkHtml +"</div>";
        html += "<div class=mobileTopBarActions>";
        html += "<button type=button class=mobileTopBtn data-action=add-contact title=\""+ lang.add_someone +"\"><i class=\"fa fa-plus\"></i></button>";
        html += "<button type=button class=mobileTopBtn data-action=clear-tab data-tab=contacts title=\""+ EscapeAttr(lang.delete || "Delete") +"\"><i class=\"fa fa-trash\"></i></button>";
        if(HideSettingsButton == false) html += "<button type=button class=mobileTopBtn data-action=more><i class=\"fa fa-ellipsis-v\"></i></button>";
        html += "</div></div>";
    }
    $("#mobileTopBar").html(html);
    SyncMobileRegLink();
}
function HandleMobileClearTab(tabName){
    if(tabName == "recents"){
        var recentMessage = (lang && lang.confirm_delete_recent) ? lang.confirm_delete_recent : "Delete all recent call history?";
        var recentTitle = (lang && lang.delete_recent) ? lang.delete_recent : ((lang && lang.delete) ? lang.delete : "Delete");
        Confirm(recentMessage, recentTitle, function(){ ClearAllRecentHistory(); });
    }
    if(tabName == "contacts"){
        var contactMessage = (lang && lang.confirm_delete_contacts) ? lang.confirm_delete_contacts : "Delete all contacts?";
        var contactTitle = (lang && lang.delete_buddy) ? lang.delete_buddy : ((lang && lang.delete) ? lang.delete : "Delete");
        Confirm(contactMessage, contactTitle, function(){ ClearAllContacts(); });
    }
}
function ShowTab(tabName){
    window.SettingsOverlayActive = false;
    RenderMainTabBar(tabName);
    $("#tabBarRow").show();
    if(tabName == "dialpad"){
        ShowDial();
    } else if(tabName == "recents"){
        ShowRecentsTab();
    } else if(tabName == "contacts"){
        ShowContacts();
    }
    localDB.setItem("ActiveTab", tabName);
}
function RenderMainTabBar(activeTab){
    var safeActiveTab = activeTab || GetActiveMainTab() || "dialpad";
    var html = "";
    html += `<button type=button id=tab-dialpad class=\"mainTab ${safeActiveTab == "dialpad" ? "activeTab" : ""}\" data-label=\"${lang.dialpad}\" onclick=\"ShowTab('dialpad')\"><i class=\"fa fa-th mainTabIcon\"></i></button>`;
    html += `<button type=button id=tab-recents class=\"mainTab ${safeActiveTab == "recents" ? "activeTab" : ""}\" data-label=\"${lang.recents}\" onclick=\"ShowTab('recents')\"><i class=\"fa fa-history mainTabIcon\"></i></button>`;
    html += `<button type=button id=tab-contacts class=\"mainTab ${safeActiveTab == "contacts" ? "activeTab" : ""}\" data-label=\"${lang.contacts}\" onclick=\"ShowTab('contacts')\"><i class=\"fa fa-address-book mainTabIcon\"></i></button>`;
    $("#bottomTabBar").removeClass("configActionBar").html(html);
    ApplyMobileLabels();
}
function RenderConfigActionBar(buttons){
    var bottomBar = $("#bottomTabBar");
    bottomBar.addClass("configActionBar").empty();
    $.each(buttons, function(i, obj){
        var button = $('<button type="button">'+ obj.text +'</button>').click(obj.action);
        button.toggleClass("configPrimaryButton", i === 0);
        button.toggleClass("configSecondaryButton", i !== 0);
        bottomBar.append(button);
    });
}
function ToggleRecentExpanded(row){
    var rowObj = $(row);
    if(rowObj.hasClass("expanded")){
        rowObj.removeClass("expanded");
        rowObj.find(".recentCallExpanded").hide();
        return;
    }

    $(".enterpriseRecentItem.expanded").not(rowObj).removeClass("expanded").find(".recentCallExpanded").hide();
    rowObj.addClass("expanded");
    rowObj.find(".recentCallExpanded").show();
}
function ToggleContactExpanded(row){
    var rowObj = $(row);
    if(rowObj.hasClass("expanded")){
        rowObj.removeClass("expanded");
        rowObj.find(".contactCompactExpanded").hide();
        return;
    }

    $(".enterpriseContactItem.expanded").not(rowObj).removeClass("expanded").find(".contactCompactExpanded").hide();
    rowObj.addClass("expanded");
    rowObj.find(".contactCompactExpanded").show();
}
function GetRecentActionNumber(rowObj){
    var number = rowObj.attr("data-callback-number") || "";
    if(number == "") {
        var ownerBuddyForCall = FindBuddyByIdentity(rowObj.attr("data-owner-identity"));
        number = GetBuddyDialNumber(ownerBuddyForCall);
    }
    return number;
}
function BindContactExpandedActions(){
    $("#myContacts").off("click.contactsCompact", ".enterpriseContactItem");
    $("#myContacts").on("click.contactsCompact", ".enterpriseContactItem", function(){
        ToggleContactExpanded(this);
    });

    $("#myContacts").off("click.contactActionCall", ".contactActionCall");
    $("#myContacts").on("click.contactActionCall", ".contactActionCall", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseContactItem");
        var number = rowObj.attr("data-dial-number") || "";
        if(number != "") DialByLine('audio', rowObj.attr("data-contact-identity"), number);
    });

    $("#myContacts").off("click.contactActionEdit", ".contactActionEdit");
    $("#myContacts").on("click.contactActionEdit", ".contactActionEdit", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseContactItem");
        EditBuddyWindow(rowObj.attr("data-contact-identity"));
    });

    $("#myContacts").off("click.contactActionDelete", ".contactActionDelete");
    $("#myContacts").on("click.contactActionDelete", ".contactActionDelete", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseContactItem");
        RemoveBuddy(rowObj.attr("data-contact-identity"));
    });
}
function GetRecentHistoryEntries(callbackNumber, ownerIdentity){
    var targetNumber = SanitizePhoneSearch(callbackNumber || "");
    var entries = [];
    for(var b = 0; b < Buddies.length; b++){
        var ownerBuddy = Buddies[b];
        if(ownerIdentity && ownerIdentity != "" && ownerBuddy.identity != ownerIdentity && targetNumber == "") continue;
        var stream = JSON.parse(localDB.getItem(ownerBuddy.identity + "-stream"));
        if(stream == null || stream.DataCollection == null) continue;
        $.each(stream.DataCollection, function(i, item){
            if(item == null || item.ItemType != "CDR") return;
            var itemNumber = ResolveRecentCallbackNumber(item, ownerBuddy);
            if(targetNumber != "" && itemNumber != targetNumber) return;
            if(targetNumber == "" && ownerIdentity && ownerBuddy.identity != ownerIdentity) return;
            var historyDisplay = GetRecentDisplayInfo(itemNumber, ownerBuddy, FindBuddyByNumber(itemNumber), item, GetRecentDirection(item) == "outbound");
            entries.push({
                cdr: item,
                ownerIdentity: ownerBuddy.identity,
                callbackNumber: itemNumber,
                displayName: historyDisplay.primary,
                displayNumber: historyDisplay.secondary
            });
        });
    }
    entries.sort(function(a, b){
        var aMo = moment.utc(a.cdr.ItemDate.replace(" UTC", ""));
        var bMo = moment.utc(b.cdr.ItemDate.replace(" UTC", ""));
        return aMo.isSameOrAfter(bMo, "second") ? -1 : 1;
    });
    return entries;
}
function BuildRecentHistoryList(callbackNumber, ownerIdentity){
    var entries = GetRecentHistoryEntries(callbackNumber, ownerIdentity);
    var html = "<div class=recentHistoryList>";
    if(entries.length == 0){
        html += "<div class=recentHistoryEmpty>"+ EscapeHtml(GetUiText("mobile_no_recents", "No recent calls", null)) +"</div>";
    } else {
        $.each(entries, function(i, entry){
            var item = entry.cdr;
            var recentStatus = GetRecentCallStatus(item);
            var dateTime = moment.utc(item.ItemDate.replace(" UTC", "")).local().format(DisplayDateFormat + " " + DisplayTimeFormat);
            html += "<div class=recentHistoryItem>";
            html += "<span class=\"recentHistoryDirection "+ recentStatus.iconClass +"\"><i class=\"fa "+ GetRecentDirectionIcon(recentStatus.iconClass) +"\"></i></span>";
            html += "<span class=recentHistoryMain>"+ EscapeHtml(entry.displayName || entry.callbackNumber || "") +"</span>";
            if(entry.displayNumber && entry.displayNumber != "") {
                html += "<span class=recentHistoryMeta>"+ EscapeHtml(entry.displayNumber) +"</span>";
            }
            html += "<span class=recentHistoryMeta>"+ EscapeHtml(dateTime) +"</span>";
            html += "</div>";
        });
    }
    html += "</div>";
    return html;
}
function ShowRecentHistoryList(rowObj){
    var historyBox = rowObj.find(".recentHistoryList");
    if(historyBox.length > 0){
        historyBox.toggle();
        return;
    }
    rowObj.find(".recentCallExpanded").append(BuildRecentHistoryList(rowObj.attr("data-callback-number"), rowObj.attr("data-owner-identity")));
}
function BindRecentExpandedActions(){
    $("#actionArea").off("click.recents", ".enterpriseRecentItem");
    $("#actionArea").on("click.recents", ".enterpriseRecentItem", function(){
        ToggleRecentExpanded(this);
    });

    $("#actionArea").off("click.recentsCall", ".recentActionCall");
    $("#actionArea").on("click.recentsCall", ".recentActionCall", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseRecentItem");
        var number = GetRecentActionNumber(rowObj);
        if(number != "") DialByLine('audio', '', number);
    });

    $("#actionArea").off("click.recentsAdd", ".recentActionAdd");
    $("#actionArea").on("click.recentsAdd", ".recentActionAdd", function(event){
        event.stopPropagation();
        if($(this).prop("disabled")) return;
        var rowObj = $(this).closest(".enterpriseRecentItem");
        AddContactFromHistory(rowObj.attr("data-owner-identity"), rowObj.attr("data-callback-number"));
    });

    $("#actionArea").off("click.recentsHistory", ".recentActionHistory");
    $("#actionArea").on("click.recentsHistory", ".recentActionHistory", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseRecentItem");
        ShowRecentHistoryList(rowObj);
    });

    $("#actionArea").off("click.recentsDelete", ".recentActionDelete");
    $("#actionArea").on("click.recentsDelete", ".recentActionDelete", function(event){
        event.stopPropagation();
        var rowObj = $(this).closest(".enterpriseRecentItem");
        var recentIds = rowObj.attr("data-recent-ids") || "";
        var message = (lang && lang.confirm_delete_recent) ? lang.confirm_delete_recent : "Delete this recent call history?";
        var title = (lang && lang.delete_recent) ? lang.delete_recent : ((lang && lang.delete) ? lang.delete : "Delete");
        Confirm(message, title, function(){
            DeleteRecentGroupFromHistory(recentIds);
        });
    });
}
function ShowRecentsTab(){
    var wasSearching = $("#searchArea").is(":visible");

    $(".mainTab").removeClass("activeTab");
    $("#tab-recents").addClass("activeTab");
    RenderMobileTopBar("recents");

    CloseUpSettings();
    $("#leftContent").removeClass("dialpadMode");
    $("#actionArea").removeClass("dialpadMode");
    $("#myContacts").removeClass("dialpadMode");
    $("#myContacts").hide();
    $("#searchArea").hide();
    $("#contactsTabHeader").hide();
    $("#actionArea").empty();

    if(wasSearching){
        $("#txtFindBuddy").val(GetStoredTabSearch("recents"));
    }

    var searchFilter = wasSearching ? GetStoredTabSearch("recents") : "";
    var allCdrs = SearchRecentsByNumber(searchFilter);

    var html = "";
    if(allCdrs.length == 0){
        html += BuildMobileEmptyState("fa-history", GetUiText("mobile_no_recents", "No recent calls", null));
    } else {
        var lastRecentDayKey = "";
        $.each(allCdrs, function(i, entry){
            var item = entry.cdr;
            var recentStatus = GetRecentCallStatus(item);
            var displayName = entry.displayName || "";
            var displayNumber = entry.displayNumber || "";
            var callbackNumber = entry.callbackNumber || "";
            var recentDayKey = GetRecentDayKey(item);
            if(recentDayKey != lastRecentDayKey){
                html += "<div class=recentDayDivider>"+ EscapeHtml(GetRecentDayLabel(item)) +"</div>";
                lastRecentDayKey = recentDayKey;
            }
            var DateTime = FormatRecentLogTime(item);
            var recentNumber = displayNumber || callbackNumber || displayName;
            var compactStatusText = recentStatus.statusText;
            if(compactStatusText.length > 12) compactStatusText = compactStatusText.replace(/^Cuộc gọi\s+/i, "").replace(/^Call\s+/i, "");
            var showExpandedNumber = (recentNumber != "" && displayName != recentNumber);
            var addDisabled = entry.canAddContact ? "" : " disabled";
            var addTitle = entry.canAddContact ? ((lang && lang.add_contact) ? lang.add_contact : "Add Contact") : displayName;
            var recentIds = encodeURIComponent(JSON.stringify(entry.recentIds || [{ identity: entry.ownerIdentity, cdrId: item.CdrId }]));
            html += "<div class=\"recentCallItem enterpriseRecentItem\" data-owner-identity=\""+ EscapeAttr(entry.ownerIdentity) +"\" data-cdr-id=\""+ EscapeAttr(item.CdrId) +"\" data-callback-number=\""+ EscapeAttr(callbackNumber) +"\" data-recent-ids=\""+ EscapeAttr(recentIds) +"\">";
            html += "<div class=recentCallSummary>";
            html += "<div class=\"recentCallAvatar recentDirectionAvatar "+ recentStatus.iconClass +"\"><i class=\"fa "+ GetRecentDirectionIcon(recentStatus.iconClass) +"\"></i></div>";
            html += "<div class=\"recentCallInfo contactCompactMain\">";
            html += "<div class=\"recentCallName contactCompactName\" style=\"user-select:text\">"+ EscapeHtml(displayName);
            html += "</div>";
            html += "<div class=recentCallSubMeta><span>"+ EscapeHtml(DateTime) +"</span><span class=\"recentStatusPill "+ recentStatus.iconClass +"\" title=\""+ EscapeAttr(recentStatus.statusText) +"\">"+ EscapeHtml(compactStatusText) +"</span></div>";
            html += "</div>";
            html += "<div class=recentExpandChevron><i class=\"fa fa-chevron-down\"></i></div>";
            html += "</div>";
            html += "<div class=recentCallExpanded style=\"display:none\">";
            if(showExpandedNumber) html += "<div class=recentExpandedNumber style=\"user-select:text\"><i class=\"fa fa-phone\"></i> "+ EscapeHtml(recentNumber) +"</div>";
            html += "<div class=recentExpandedActions>";
            html += "<button type=button class=\"roundButtons recentActionCall\" title=\""+ EscapeAttr(lang.call || "Call") +"\"><i class=\"fa fa-phone\"></i></button>";
            html += "<button type=button class=\"roundButtons recentActionAdd\" title=\""+ EscapeAttr(addTitle) +"\""+ addDisabled +"><i class=\"fa fa-user-plus\"></i></button>";
            html += "<button type=button class=\"roundButtons recentActionDelete\" title=\""+ EscapeAttr(lang.delete || "Delete") +"\"><i class=\"fa fa-trash\"></i></button>";
            html += "</div>";
            html += "</div>";
            html += "</div>";
        });
    }
    $("#actionArea").html(html);
    BindRecentExpandedActions();
    SetMobilePaneEmptyState("#actionArea", allCdrs.length == 0);
    $("#actionArea").show();
}
function AddContactFromHistory(identity, callbackNumber){
    var number = SanitizePhoneSearch(callbackNumber || "");
    var callerName = number;

    if(number == ""){
        var buddyObj = FindBuddyByIdentity(identity);
        if(buddyObj == null) return;
        if(buddyObj.ExtNo && buddyObj.ExtNo != "") number = buddyObj.ExtNo;
        else if(buddyObj.ContactNumber1 && buddyObj.ContactNumber1 != "") number = buddyObj.ContactNumber1;
        else if(buddyObj.MobileNumber && buddyObj.MobileNumber != "") number = buddyObj.MobileNumber;
        callerName = buddyObj.CallerIDName || number;
    }

    AddSomeoneWindow(number, callerName);
}
function DeleteRecentGroupFromHistory(recentIds){
    if(!recentIds) return;
    var ids = recentIds;
    if(typeof ids == "string"){
        try{
            ids = JSON.parse(decodeURIComponent(ids));
        }
        catch(e){
            ids = [];
        }
    }
    if(!ids || ids.length == null || ids.length == 0) return;

    var idsByIdentity = {};
    $.each(ids, function(i, item){
        if(!item || !item.identity || !item.cdrId) return;
        if(idsByIdentity[item.identity] == null) idsByIdentity[item.identity] = {};
        idsByIdentity[item.identity][item.cdrId] = true;
    });

    for(var identity in idsByIdentity){
        if(!Object.prototype.hasOwnProperty.call(idsByIdentity, identity)) continue;
        var stream = JSON.parse(localDB.getItem(identity + "-stream"));
        if(stream == null || stream.DataCollection == null) continue;

        var before = stream.DataCollection.length;
        stream.DataCollection = $.grep(stream.DataCollection, function(item){
            if(item.ItemType != "CDR") return true;
            return idsByIdentity[identity][item.CdrId] != true;
        });
        stream.TotalRows = stream.DataCollection.length;
        if(stream.TotalRows != before){
            localDB.setItem(identity + "-stream", JSON.stringify(stream));
        }
    }
    ShowRecentsTab();
}
function ClearAllRecentHistory(){
    for(var k = 0; k < localDB.length; k++){
        var storageKey = localDB.key(k);
        if(!storageKey) continue;
        if(storageKey.length <= 7) continue;
        if(storageKey.substring(storageKey.length - 7) != "-stream") continue;

        var stream = JSON.parse(localDB.getItem(storageKey));
        if(stream == null || stream.DataCollection == null) continue;
        var before = stream.DataCollection.length;
        stream.DataCollection = $.grep(stream.DataCollection, function(item){
            return item.ItemType != "CDR";
        });
        stream.TotalRows = stream.DataCollection.length;
        if(stream.TotalRows != before){
            localDB.setItem(storageKey, JSON.stringify(stream));
        }
    }
    ShowRecentsTab();
}
function ClearAllContacts(){
    var identities = [];
    for(var b = 0; b < Buddies.length; b++){
        var buddyObj = Buddies[b];
        if(buddyObj.type != "contact") continue;
        identities.push(buddyObj.identity);
    }
    $.each(identities, function(i, identity){
        DoRemoveBuddy(identity);
    });
    ShowContacts();
    UpdateBuddyList();
}
function ShowSortAnfFilter(){
    ShowDial();

    $("#contactsTabHeader").hide();
    $("#myContacts").hide();
    $("#searchArea").hide();
$("#actionArea").empty();

var html = "<div style=\"text-align:right\"><button class=roundButtons onclick=\"ShowContacts()\"><i class=\"fa fa-close\"></i></button></div>"
html += "<table cellspacing=10 cellpadding=0 style=\"margin-left:auto; margin-right: auto\">";
html += "<tr><td><div><input disabled type=radio name=sort_by id=sort_by_type><label for=sort_by_type>"+ lang.sort_type +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_cex><label for=sort_by_type_cex>"+ lang.sort_type_cex +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_cxe><label for=sort_by_type_cxe>"+ lang.sort_type_cxe +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_xec><label for=sort_by_type_xec>"+ lang.sort_type_xec +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_xce><label for=sort_by_type_xce>"+ lang.sort_type_xce +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_exc><label for=sort_by_type_exc>"+ lang.sort_type_exc +"</label></div>";
html += "<div style=\"margin-left:20px\"><input type=radio name=sort_by_type id=sort_by_type_ecx><label for=sort_by_type_ecx>"+ lang.sort_type_ecx +"</label></div>";
html += "</td></tr>";
html += "<tr><td><div><input type=radio name=sort_by id=sort_by_exten><label for=sort_by_exten>"+ lang.sort_exten +"</label></div></td></tr>";
html += "<tr><td><div><input type=radio name=sort_by id=sort_by_alpha><label for=sort_by_alpha>"+ lang.sort_alpha +"</label></div></td></tr>";
html += "<tr><td><div><input type=radio name=sort_by id=sort_by_activity><label for=sort_by_activity>"+ lang.sort_activity +"</label></div></td></tr>";
html += "<tr><td><div><input type=checkbox id=sort_auto_delete_at_end><label for=sort_auto_delete_at_end>"+ lang.sort_auto_delete_at_end +"</label></div></td></tr>";
html += "<tr><td><div><input type=checkbox id=sort_auto_delete_hide><label for=sort_auto_delete_hide>"+ lang.sort_auto_delete_hide +"</label></div></td></tr>";
html += "<tr><td><div><input type=checkbox id=sort_show_exten_num><label for=sort_show_exten_num>"+ lang.sort_show_exten_num +"</label></div></td></tr>";

html += "</table>";
html += "</div>";
$("#actionArea").html(html);

$("#sort_by_type").prop("checked", BuddySortBy=="type");
$("#sort_by_type_cex").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="c|e|x"));
$("#sort_by_type_cxe").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="c|x|e"));
$("#sort_by_type_xec").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="x|e|c"));
$("#sort_by_type_xce").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="x|c|e"));
$("#sort_by_type_exc").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="e|x|c"));
$("#sort_by_type_ecx").prop("checked", (BuddySortBy=="type" && SortByTypeOrder=="e|c|x"));
$("#sort_by_exten").prop("checked", BuddySortBy=="extension");
$("#sort_by_alpha").prop("checked", BuddySortBy=="alphabetical");
$("#sort_by_activity").prop("checked", BuddySortBy=="activity");

$("#sort_auto_delete_at_end").prop("checked", BuddyAutoDeleteAtEnd==true);
$("#sort_auto_delete_hide").prop("checked", HideAutoDeleteBuddies==true);
$("#sort_show_exten_num").prop("checked", BuddyShowExtenNum==true);

$("#sort_by_type_cex").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "c|e|x"
    localDB.setItem("SortByTypeOrder", "c|e|x");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});
$("#sort_by_type_cxe").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "c|x|e"
    localDB.setItem("SortByTypeOrder", "c|x|e");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});
$("#sort_by_type_xec").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "x|e|c"
    localDB.setItem("SortByTypeOrder", "x|e|c");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});
$("#sort_by_type_xce").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "x|e|c"
    localDB.setItem("SortByTypeOrder", "x|c|e");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});
$("#sort_by_type_exc").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "e|x|c"
    localDB.setItem("SortByTypeOrder", "e|x|c");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});
$("#sort_by_type_ecx").change(function(){
    BuddySortBy = "type";
    localDB.setItem("BuddySortBy", "type");
    SortByTypeOrder = "e|c|x"
    localDB.setItem("SortByTypeOrder", "e|c|x");
    $("#sort_by_type").prop("checked", true);

    UpdateBuddyList();
});


$("#sort_by_exten").change(function(){
    BuddySortBy = "extension";
    localDB.setItem("BuddySortBy", "extension");
    $("#sort_by_type_cex").prop("checked", false);
    $("#sort_by_type_cxe").prop("checked", false);
    $("#sort_by_type_xec").prop("checked", false);
    $("#sort_by_type_xce").prop("checked", false);
    $("#sort_by_type_exc").prop("checked", false);
    $("#sort_by_type_ecx").prop("checked", false);

    UpdateBuddyList();
});
$("#sort_by_alpha").change(function(){
    BuddySortBy = "alphabetical";
    localDB.setItem("BuddySortBy", "alphabetical");
    $("#sort_by_type_cex").prop("checked", false);
    $("#sort_by_type_cxe").prop("checked", false);
    $("#sort_by_type_xec").prop("checked", false);
    $("#sort_by_type_xce").prop("checked", false);
    $("#sort_by_type_exc").prop("checked", false);
    $("#sort_by_type_ecx").prop("checked", false);
    UpdateBuddyList();
});
$("#sort_by_activity").change(function(){
    BuddySortBy = "activity";
    localDB.setItem("BuddySortBy", "activity");
    $("#sort_by_type_cex").prop("checked", false);
    $("#sort_by_type_cxe").prop("checked", false);
    $("#sort_by_type_xec").prop("checked", false);
    $("#sort_by_type_xce").prop("checked", false);
    $("#sort_by_type_exc").prop("checked", false);
    $("#sort_by_type_ecx").prop("checked", false);

    UpdateBuddyList();
});

$("#sort_auto_delete_at_end").change(function(){
    BuddyAutoDeleteAtEnd = this.checked;
    localDB.setItem("BuddyAutoDeleteAtEnd", (this.checked)? "1" : "0");

    if(this.checked){
        $("#sort_auto_delete_hide").prop("checked", false);
        HideAutoDeleteBuddies = false;
        localDB.setItem("HideAutoDeleteBuddies", "0");
    }

    UpdateBuddyList();
});
$("#sort_auto_delete_hide").change(function(){
    HideAutoDeleteBuddies = this.checked;
    localDB.setItem("HideAutoDeleteBuddies", (this.checked)? "1" : "0");

    if(this.checked){
        $("#sort_auto_delete_at_end").prop("checked", false);
        BuddyAutoDeleteAtEnd = false;
        localDB.setItem("BuddyAutoDeleteAtEnd", "0");
    }

    UpdateBuddyList();
});
$("#sort_show_exten_num").change(function(){
    BuddyShowExtenNum = this.checked;
    localDB.setItem("BuddyShowExtenNum", (this.checked)? "1" : "0");

    UpdateBuddyList();
});

$("#actionArea").show();
}
function DialByLine(type, buddy, numToDial, CallerID, extraHeaders){
    if(userAgent == null || userAgent.isRegistered() == false){
        ShowMyProfile();
        return;
    }

    var numDial = (numToDial)? numToDial : $("#dialText").val();
    if(EnableAlphanumericDial){
        numDial = numDial.replace(telAlphanumericRegEx, "").substring(0,MaxDidLength);
    }
    else {
        numDial = numDial.replace(telNumericRegEx, "").substring(0,MaxDidLength);
    }
    if(numDial.length == 0) {
        console.warn("Enter number to dial");
        return;
    }
    var returnTab = GetActiveMainTab();
    if(returnTab != "contacts" && returnTab != "recents" && returnTab != "dialpad") returnTab = "dialpad";
    window.ReturnToDialpadAfterCall = true;
    window.ReturnAfterCallTab = returnTab;
    localDB.setItem("ActiveTab", returnTab);
    var buddyObj = (buddy)? FindBuddyByIdentity(buddy) : FindBuddyByDid(numDial);
    if(buddyObj == null) {
        var tempId = "tmp-" + uID();
        var tempName = (CallerID)? CallerID : numDial;
        buddyObj = new Buddy("contact", tempId, tempName, "", "", numDial, "", utcDateNow(), "", "", null, false, false, null, true, false);
    }
    newLineNumber = newLineNumber + 1;
    var lineObj = new Line(newLineNumber, buddyObj.CallerIDName, numDial, buddyObj);
    lineObj.ReturnToTab = returnTab;
    Lines.push(lineObj);
    AddLineHtml(lineObj, "outbound");
    RefreshLineDisplay(lineObj);
    SelectLine(newLineNumber);
    UpdateBuddyList();
    if(type == "audio"){
        AudioCall(lineObj, numDial, extraHeaders);
    }
    else {
        VideoCall(lineObj, numDial, extraHeaders);
    }

    try{
        $("#line-" + newLineNumber).get(0).scrollIntoViewIfNeeded();
    } catch(e){}
}
function SelectLine(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null) return;

    for(var l = 0; l < Lines.length; l++) {
        if(Lines[l].IsSelected == true && Lines[l].LineNumber == lineObj.LineNumber){
            return;
        }
    }

    console.log("Selecting Line : "+ lineObj.LineNumber);
    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });
    $("#line-ui-" + lineObj.LineNumber).prop('class', 'streamSelected');
    SwitchLines(lineObj.LineNumber);
    for(var l = 0; l < Lines.length; l++) {
        var classStr = (Lines[l].LineNumber == lineObj.LineNumber)? "buddySelected" : "buddy";
        if(Lines[l].SipSession != null) classStr = (Lines[l].SipSession.isOnHold)? "buddyActiveCallHollding" : "buddyActiveCall";

        $("#line-" + Lines[l].LineNumber).prop('class', classStr);
        Lines[l].IsSelected = (Lines[l].LineNumber == lineObj.LineNumber);
    }
    for(var b = 0; b < Buddies.length; b++) {
        $("#contact-" + Buddies[b].identity).prop("class", "buddy");
        Buddies[b].IsSelected = false;
    }
    UpdateUI();
}
function FindLineByNumber(lineNum) {
    for(var l = 0; l < Lines.length; l++) {
        if(Lines[l].LineNumber == lineNum) return Lines[l];
    }
    return null;
}
function AddLineHtml(lineObj, direction){
    var callPicture = getPicture((lineObj.BuddyObj && lineObj.BuddyObj.identity) ? lineObj.BuddyObj.identity : null);
    var html = "<table id=\"line-ui-"+ lineObj.LineNumber +"\" class=stream cellspacing=0 cellpadding=0>";
    html += "<tr><td class=\"streamSection highlightSection\" style=\"height: 85px;\">";
    html += "<div class=contact style=\"cursor: unset; float: left;\">";
    html += "<div class=contactNameText><i class=\"fa fa-phone\"></i> "+ GetSelfExtensionLabel() +"</div>";
    html += "</div>";
    html += "<div style=\"float:right; line-height: 46px;\">";
    html += "<div  id=\"line-"+ lineObj.LineNumber +"-monitoring\" style=\"margin-right:10px\">";
    html += "<span style=\"vertical-align: middle\"><i class=\"fa fa-microphone\"></i></span> ";
    html += "<span class=meterContainer title=\""+ lang.microphone_levels +"\">";
    html += "<span id=\"line-"+ lineObj.LineNumber +"-Mic\" class=meterLevel style=\"height:0%\"></span>";
    html += "</span> ";
    html += "<span style=\"vertical-align: middle\"><i class=\"fa fa-volume-up\"></i></span> ";
    html += "<span class=meterContainer title=\""+ lang.speaker_levels +"\">";
    html += "<span id=\"line-"+ lineObj.LineNumber +"-Speaker\" class=meterLevel style=\"height:0%\"></span>";
    html += "</span> ";
    html += "</div>";

    html += "</div>";
    html += "<div style=\"clear:both; height:0px\"></div>"
    html += "<div id=\"line-"+ lineObj.LineNumber +"-timer\" class=CallTimer></div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-msg\" class=callStatus style=\"display:none\">...</div>";
    html += "<div style=\"display:none;\">";
    html += "<audio id=\"line-"+ lineObj.LineNumber +"-remoteAudio\"></audio>";
    html += "</div>";

    html += "</td></tr>";
    html += "<tr><td id=\"line-"+ lineObj.LineNumber +"-call-fullscreen\" class=\"streamSection highlightSection\">"
    html += "<div id=\"line-"+ lineObj.LineNumber +"-AnswerCall\" style=\"display:none\">";
    html += "<div class=\"CallPictureUnderlay\" style=\"background-image: url('"+ callPicture +"')\"></div>";
    html += "<div class=\"CallColorUnderlay\"></div>";
    html += "<div class=\"CallUi\">";
    html += "<div class=callingDisplayName>"+ lineObj.DisplayName +"</div>";
    html += "<div class=callingDisplayNumber>"+ lineObj.DisplayNumber +"</div>";
    html += "<div class=\"answerCall incomingCallActions\">";
    html += "<button onclick=\"AnswerAudioCall('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons incomingCallDialButton incomingCallAnswerButton\" title=\""+ lang.answer_call +"\"><i class=\"fa fa-phone\"></i></button> ";
    if(EnableVideoCalling == true) {
        html += " <button id=\"line-"+ lineObj.LineNumber +"-answer-video\" onclick=\"AnswerVideoCall('"+ lineObj.LineNumber +"')\" class=answerButton><i class=\"fa fa-video-camera\"></i> "+ lang.answer_call_with_video +"</button> ";
    }
    html += " <button onclick=\"RejectCall('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons incomingCallDialButton incomingCallRejectButton\" title=\""+ lang.reject_call +"\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i></button> ";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-answer-crm-space\">"
    html += "</div>";
    html += "</div>";

    html += "</div>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-progress\" style=\"display:none\">";
    html += "<div class=\"CallPictureUnderlay\" style=\"background-image: url('"+ callPicture +"')\"></div>";
    html += "<div class=\"CallColorUnderlay\"></div>";
    html += "<div class=\"CallUi\">";
    html += "<div class=callingDisplayName>"+ lineObj.DisplayName +"</div>";
    html += "<div class=callingDisplayNumber>"+ lineObj.DisplayNumber +"</div>";
    html += "<div class=progressCall>"
    html += "<button onclick=\"cancelSession('"+ lineObj.LineNumber +"')\" class=rejectButton><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i> "+ lang.cancel +"</button>"
    html += " <button id=\"line-"+ lineObj.LineNumber +"-early-dtmf\" onclick=\"ShowNumpad('"+ lineObj.LineNumber +"')\" style=\"display:none\"><i class=\"fa fa-keyboard-o\"></i> "+ lang.send_dtmf +"</button>"
    html += "</div>";
    html += "</div>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-ActiveCall\" class=cleanScroller style=\"display:none; position: absolute; top: 0px; left: 0px; height: 100%; width: 100%;\">";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-AudioOrVideoCall\" style=\"height:100%\">";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-AudioCall\" style=\"height:100%; display:none\">";
    html += "<div class=\"CallPictureUnderlay\" style=\"background-image: url('"+ callPicture +"')\"></div>";
    html += "<div class=\"CallColorUnderlay\"></div>";
    var audioCallUiClass = (EnableVideoCalling == true) ? "CallUi" : "CallUi CallUiAudioOnly";
    html += "<div class=\""+ audioCallUiClass +"\">";
    html += "<div class=callingDisplayName>"+ lineObj.DisplayName +"</div>";
    html += "<div class=callingDisplayNumber>"+ lineObj.DisplayNumber +"</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-Transfer\" class=\"transferPopupPanel\" style=\"display:none\">";
    html += "<div class=transferPopupCard>";
    html += "<div class=transferPopupTitle><i class=\"fa fa-reply\" style=\"transform: rotateY(180deg)\"></i><span>"+ lang.transfer_call +"</span></div>";
    html += "<span class=\"searchClean transferSearch\"><input id=\"line-"+ lineObj.LineNumber +"-txt-FindTransferBuddy\" oninput=\"QuickFindBuddy(this,'"+ lineObj.LineNumber +"')\" onkeydown=\"transferOnkeydown(event, this, '"+ lineObj.LineNumber +"')\" type=text autocomplete=none autocomplete=none placeholder=\""+ lang.search_or_enter_number +"\"></span>";
    html += "<div class=transferButtonRow>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-blind-transfer\" class=\"transferActionButton\" onclick=\"BlindTransfer('"+ lineObj.LineNumber +"')\"><i class=\"fa fa-reply\" style=\"transform: rotateY(180deg)\"></i><span>"+ lang.blind_transfer +"</span></button>"
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-attended-transfer\" class=\"transferActionButton\" onclick=\"AttendedTransfer('"+ lineObj.LineNumber +"')\"><i class=\"fa fa-reply-all\" style=\"transform: rotateY(180deg)\"></i><span>"+ lang.attended_transfer +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-complete-attended-transfer\" class=\"transferActionButton\" style=\"display:none\"><i class=\"fa fa-reply-all\" style=\"transform: rotateY(180deg)\"></i><span>"+ lang.complete_transfer +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-cancel-attended-transfer\" class=\"transferActionButton transferCancelButton\" style=\"display:none\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i><span>"+ lang.cancel_transfer +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-terminate-attended-transfer\" class=\"transferActionButton transferCancelButton\" style=\"display:none\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i><span>"+ lang.end_transfer_call +"</span></button>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-transfer-status\" class=callStatus style=\"margin-top:10px; display:none\">...</div>";
    html += "</div>";
    html += "<audio id=\"line-"+ lineObj.LineNumber +"-transfer-remoteAudio\" style=\"display:none\"></audio>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-Conference\" class=\"transferPopupPanel conferencePopupPanel\" style=\"display:none\">";
    html += "<div class=\"transferPopupCard conferencePopupCard\">";
    html += "<div class=transferPopupTitle><i class=\"fa fa-users\"></i><span>"+ lang.conference_call +"</span></div>";
    html += "<span class=\"searchClean transferSearch\"><input id=\"line-"+ lineObj.LineNumber +"-txt-FindConferenceBuddy\" oninput=\"QuickFindBuddy(this,'"+ lineObj.LineNumber +"')\" onkeydown=\"conferenceOnkeydown(event, this, '"+ lineObj.LineNumber +"')\" type=text autocomplete=none placeholder=\""+ lang.search_or_enter_number +"\"></span>";
    html += "<div class=transferButtonRow>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-conference-dial\" class=\"transferActionButton\" onclick=\"ConferenceDial('"+ lineObj.LineNumber +"')\"><i class=\"fa fa-phone\"></i><span>"+ lang.call +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-cancel-conference-dial\" class=\"transferActionButton transferCancelButton\" style=\"display:none\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i><span>"+ lang.cancel_call +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-join-conference-call\" class=\"transferActionButton\" style=\"display:none\"><i class=\"fa fa-users\"></i><span>"+ lang.join_conference_call +"</span></button>";
    html += " <button id=\"line-"+ lineObj.LineNumber +"-btn-terminate-conference-call\" class=\"transferActionButton transferCancelButton\" style=\"display:none\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i><span>"+ lang.end_conference_call +"</span></button>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-conference-status\" class=callStatus style=\"margin-top:10px; display:none\">...</div>";
    html += "</div>";
    html += "<audio id=\"line-"+ lineObj.LineNumber +"-conference-remoteAudio\" style=\"display:none\"></audio>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-active-audio-call-crm-space\">"
    html += "</div>";

    html += "</div>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-VideoCall\" style=\"height:100%; display:none\">";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-preview-container\" class=\"PreviewContainer cleanScroller\">";
    html += "<video id=\"line-"+ lineObj.LineNumber +"-localVideo\" muted playsinline></video>";
    html += "</div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-stage-container\" class=StageContainer>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-remote-videos\" class=VideosContainer></div>";
    html += "<div id=\"line-"+ lineObj.LineNumber +"-scratchpad-container\" class=ScratchpadContainer style=\"display:none\"></div>";
    html += "<video id=\"line-"+ lineObj.LineNumber +"-sharevideo\" controls muted playsinline style=\"display:none; object-fit: contain; width: 100%;\"></video>";
    html += "</div>";
    html += "</div>";
    html += "</div>";
    html += "<div class=CallControlContainer>";
    html += "<div class=CallControl>";
    html += "<div class=CallControlRowPrimary>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Mute\" onclick=\"MuteSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.mute +"\"><i class=\"fa fa-microphone-slash\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Unmute\" onclick=\"UnmuteSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.unmute +"\" style=\"color: red; display:none\"><i class=\"fa fa-microphone\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Hold\" onclick=\"holdSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\"  title=\""+ lang.hold_call +"\"><i class=\"fa fa-pause-circle\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Unhold\" onclick=\"unholdSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.resume_call +"\" style=\"color: red; display:none\"><i class=\"fa fa-play-circle\"></i></button>";
    if(EnableTransfer){
        html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Transfer\" onclick=\"StartTransferSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.transfer_call +"\"><i class=\"fa fa-reply\" style=\"transform: rotateY(180deg)\"></i></button>";
        html += "<button id=\"line-"+ lineObj.LineNumber+"-btn-CancelTransfer\" onclick=\"CancelTransferSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.cancel_transfer +"\" style=\"color: red; display:none\"><i class=\"fa fa-reply\" style=\"transform: rotateY(180deg)\"></i></button>";
    }
    html += "</div>";
    html += "<div class=CallControlRowSecondary id=\"line-"+ lineObj.LineNumber +"-btn-more\" style=\"display:block\">";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-ShowNumpad\" onclick=\"ShowNumpad('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.send_dtmf +"\"><i class=\"fa fa-keyboard-o\"></i></button>";
    if(EnableConference){
        html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-Conference\" onclick=\"StartConferenceCall('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.conference_call +"\"><i class=\"fa fa-users\"></i></button>";
        html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-CancelConference\" onclick=\"CancelConference('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.cancel_conference +"\" style=\"color: red; display:none\"><i class=\"fa fa-users\"></i></button>";
    }
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-settings\" onclick=\"ChangeSettings('"+ lineObj.LineNumber +"', this)\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.device_settings +"\"><i class=\"fa fa-volume-up\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-present-src\" onclick=\"ShowPresentMenu(this, '"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" title=\""+ lang.camera +"\"><i class=\"fa fa-video-camera\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-expand\" onclick=\"ExpandVideoArea('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\"><i class=\"fa fa-expand\"></i></button>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-restore\" onclick=\"RestoreVideoArea('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons\" style=\"display:none\"><i class=\"fa fa-compress\"></i></button>";

    html += "</div>";
    html += "<div class=CallControlRowHangup>";
    html += "<button id=\"line-"+ lineObj.LineNumber +"-btn-End\" onclick=\"endSession('"+ lineObj.LineNumber +"')\" class=\"roundButtons dialButtons inCallButtons hangupButton\" title=\""+ lang.end_call +"\"><i class=\"fa fa-phone\" style=\"transform: rotate(135deg);\"></i></button>";
    html += "</div>";
    html += "</div>";
    html += "</div>";

    html += "</div>";


    html += "</td></tr>";
    html += "</table>";

    $("#rightContent").append(html);

    $("#line-"+ lineObj.LineNumber +"-AudioOrVideoCall").on("click", function(){
        RestoreCallControls(lineObj.LineNumber);
    });
    $("#line-"+ lineObj.LineNumber +"-AudioCall").on("click", function(event){
        var target = $(event.target);
        var transferSel = "#line-" + lineObj.LineNumber + "-Transfer";
        var conferenceSel = "#line-" + lineObj.LineNumber + "-Conference";
        var transferVisible = $(transferSel).is(":visible");
        var conferenceVisible = $(conferenceSel).is(":visible");
        if(!transferVisible && !conferenceVisible) return;

        var ignore = transferSel + ", " + conferenceSel + ", .popupMenuList, .ui-menu";
        if(target.closest(ignore).length > 0) return;

        if(transferVisible) CancelTransferSession(lineObj.LineNumber);
        if(conferenceVisible) CancelConference(lineObj.LineNumber);
        HidePopup();
    });
}
function RemoveLine(lineObj){
    if(lineObj == null) return;

    var earlyReject = (lineObj.SipSession && lineObj.SipSession.data) ? lineObj.SipSession.data.earlyReject : false;
    for(var l = 0; l < Lines.length; l++) {
        if(Lines[l].LineNumber == lineObj.LineNumber) {
            Lines.splice(l,1);
            break;
        }
    }

    if(earlyReject != true){
        CloseLine(lineObj.LineNumber);
        $("#line-ui-"+ lineObj.LineNumber).remove();
    }

    UpdateBuddyList();

    if(earlyReject != true){
        localDB.setItem("SelectedBuddy", null);
        UpdateUI();
    }
}
function CloseLine(lineNum){
    $(".buddySelected").each(function () {
        $(this).prop('class', 'buddy');
    });
    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });

    console.log("Closing Line: "+ lineNum);
    for(var l = 0; l < Lines.length; l++){
        Lines[l].IsSelected = false;
    }
    selectedLine = null;
    for(var b = 0; b < Buddies.length; b++){
        Buddies[b].IsSelected = false;
    }
    selectedBuddy = null;
    UpdateUI();
}
function SwitchLines(lineNum){
    $.each(userAgent.sessions, function (i, session) {
        if(session.state == SIP.SessionState.Established){
            if(session.isOnHold == false && session.data.line != lineNum) {
                holdSession(session.data.line);
            }
        }
        session.data.IsCurrentCall = false;
    });

    var lineObj = FindLineByNumber(lineNum);
    if(lineObj != null && lineObj.SipSession != null) {
        var session = lineObj.SipSession;
        if(session.state == SIP.SessionState.Established){
            if(session.isOnHold == true) {
                unholdSession(lineNum)
            }
        }
        session.data.IsCurrentCall = true;
    }
    selectedLine = lineNum;
}
function RefreshLineActivity(lineNum){
    return;
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null) {
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-CallDetails").empty();

    var callDetails = [];

    var ringTime = 0;
    var CallStart = moment.utc(session.data.callstart.replace(" UTC", ""));
    var CallAnswer = null;
    if(session.data.startTime){
        CallAnswer = moment.utc(session.data.startTime);
        ringTime = moment.duration(CallAnswer.diff(CallStart));
    }
    CallStart = CallStart.format("YYYY-MM-DD HH:mm:ss UTC")
    CallAnswer = (CallAnswer)? CallAnswer.format("YYYY-MM-DD HH:mm:ss UTC") : null,
    ringTime = (ringTime != 0)? ringTime.asSeconds() : 0

    var srcCallerID = "";
    var dstCallerID = "";
    if(session.data.calldirection == "inbound") {
        srcCallerID = "<"+ session.remoteIdentity.uri.user +"> "+ session.remoteIdentity.displayName;
    }
    else if(session.data.calldirection == "outbound") {
        dstCallerID = session.data.dst;
    }

    var withVideo = (session.data.withvideo)? "("+ lang.with_video +")" : "";
    var startCallMessage = (session.data.calldirection == "inbound")? lang.you_received_a_call_from + " " + srcCallerID  +" "+ withVideo : lang.you_made_a_call_to + " " + dstCallerID +" "+ withVideo;
    callDetails.push({
        Message: startCallMessage,
        TimeStr : CallStart
    });
    if(CallAnswer){
        var answerCallMessage = (session.data.calldirection == "inbound")? lang.you_answered_after + " " + ringTime + " " + lang.seconds_plural : lang.they_answered_after + " " + ringTime + " " + lang.seconds_plural;
        callDetails.push({
            Message: answerCallMessage,
            TimeStr : CallAnswer
        });
    }

    var Transfers = (session.data.transfer)? session.data.transfer : [];
    $.each(Transfers, function(item, transfer){
        var msg = (transfer.type == "Blind")? lang.you_started_a_blind_transfer_to +" "+ transfer.to +". " : lang.you_started_an_attended_transfer_to + " "+ transfer.to +". ";
        if(transfer.accept && transfer.accept.complete == true){
            msg += lang.the_call_was_completed
        }
        else if(transfer.accept.disposition != "") {
            msg += lang.the_call_was_not_completed +" ("+ transfer.accept.disposition +")"
        }
        callDetails.push({
            Message : msg,
            TimeStr : transfer.transferTime
        });
    });
    var Mutes = (session.data.mute)? session.data.mute : []
    $.each(Mutes, function(item, mute){
        callDetails.push({
            Message : (mute.event == "mute")? lang.you_put_the_call_on_mute : lang.you_took_the_call_off_mute,
            TimeStr : mute.eventTime
        });
    });
    var Holds = (session.data.hold)? session.data.hold : []
    $.each(Holds, function(item, hold){
        callDetails.push({
            Message : (hold.event == "hold")? lang.you_put_the_call_on_hold : lang.you_took_the_call_off_hold,
            TimeStr : hold.eventTime
        });
    });
    var ConfbridgeEvents = (session.data.ConfbridgeEvents)? session.data.ConfbridgeEvents : []
    $.each(ConfbridgeEvents, function(item, event){
        callDetails.push({
            Message : event.event,
            TimeStr : event.eventTime
        });
    });
    var Recordings = (session.data.recordings)? session.data.recordings : []
    $.each(Recordings, function(item, recording){
        var msg = lang.call_is_being_recorded;
        if(recording.startTime != recording.stopTime){
            msg += "("+ lang.now_stopped +")"
        }
        callDetails.push({
            Message : msg,
            TimeStr : recording.startTime
        });
    });
    var ConfCalls = (session.data.confcalls)? session.data.confcalls : []
    $.each(ConfCalls, function(item, confCall){
        var msg = lang.you_started_a_conference_call_to +" "+ confCall.to +". ";
        if(confCall.accept && confCall.accept.complete == true){
            msg += lang.the_call_was_completed
        }
        else if(confCall.accept.disposition != "") {
            msg += lang.the_call_was_not_completed +" ("+ confCall.accept.disposition +")"
        }
        callDetails.push({
            Message : msg,
            TimeStr : confCall.startTime
        });
    });

    callDetails.sort(function(a, b){
        var aMo = moment.utc(a.TimeStr.replace(" UTC", ""));
        var bMo = moment.utc(b.TimeStr.replace(" UTC", ""));
        if (aMo.isSameOrAfter(bMo, "second")) {
            return -1;
        } else return 1;
        return 0;
    });

    $.each(callDetails, function(item, detail){
        var Time = moment.utc(detail.TimeStr.replace(" UTC", "")).local().format(DisplayTimeFormat);
        var messageString = "<table class=timelineMessage cellspacing=0 cellpadding=0><tr>"
        messageString += "<td class=timelineMessageArea>"
        messageString += "<div class=timelineMessageDate><i class=\"fa fa-circle timelineMessageDot\"></i>"+ Time +"</div>"
        messageString += "<div class=timelineMessageText>"+ detail.Message +"</div>"
        messageString += "</td>"
        messageString += "</tr></table>";
        $("#line-"+ lineNum +"-CallDetails").prepend(messageString);
    });
}
var Buddy = function(type, identity, CallerIDName, ExtNo, MobileNumber, ContactNumber1, ContactNumber2, lastActivity, desc, Email, jid, dnd, subscribe, subscription, autoDelete, pinned){
    this.type = type;
    this.identity = identity;
    this.jid = jid;
    this.CallerIDName = (CallerIDName)? CallerIDName : "";
    this.Email = (Email)? Email : "" ;
    this.Desc = (desc)? desc : "" ;
    this.ExtNo = ExtNo;
    this.MobileNumber = MobileNumber;
    this.ContactNumber1 = ContactNumber1;
    this.ContactNumber2 = ContactNumber2;
    this.lastActivity = lastActivity;
    this.devState = "dotOffline";
    this.presence = "Unknown";
    this.missed = 0;
    this.IsSelected = false;
    this.imageObjectURL = "";
    this.presenceText = lang.default_status;
    this.EnableDuringDnd = dnd;
    this.EnableSubscribe = subscribe;
    this.SubscribeUser = (subscription)? subscription : ExtNo;
    this.AllowAutoDelete = (typeof autoDelete !== 'undefined')? autoDelete : AutoDeleteDefault;
    this.Pinned = (typeof pinned !== 'undefined')? pinned : false;
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.CloseNumpadInline = CloseNumpadInline; }
if (typeof window !== 'undefined') { window.CloseNumpadInline = CloseNumpadInline; }
if (typeof globalThis !== 'undefined') { globalThis.BuildDialInputRowHtml = BuildDialInputRowHtml; }
if (typeof window !== 'undefined') { window.BuildDialInputRowHtml = BuildDialInputRowHtml; }
if (typeof globalThis !== 'undefined') { globalThis.BuildDialPadGridHtml = BuildDialPadGridHtml; }
if (typeof window !== 'undefined') { window.BuildDialPadGridHtml = BuildDialPadGridHtml; }
if (typeof globalThis !== 'undefined') { globalThis.ShowNumpad = ShowNumpad; }
if (typeof window !== 'undefined') { window.ShowNumpad = ShowNumpad; }
if (typeof globalThis !== 'undefined') { globalThis.ShowPresentMenu = ShowPresentMenu; }
if (typeof window !== 'undefined') { window.ShowPresentMenu = ShowPresentMenu; }
if (typeof globalThis !== 'undefined') { globalThis.RestoreCallControls = RestoreCallControls; }
if (typeof window !== 'undefined') { window.RestoreCallControls = RestoreCallControls; }
if (typeof globalThis !== 'undefined') { globalThis.ExpandVideoArea = ExpandVideoArea; }
if (typeof window !== 'undefined') { window.ExpandVideoArea = ExpandVideoArea; }
if (typeof globalThis !== 'undefined') { globalThis.RestoreVideoArea = RestoreVideoArea; }
if (typeof window !== 'undefined') { window.RestoreVideoArea = RestoreVideoArea; }
if (typeof globalThis !== 'undefined') { globalThis.Line = Line; }
if (typeof window !== 'undefined') { window.Line = Line; }
if (typeof globalThis !== 'undefined') { globalThis.ShowDial = ShowDial; }
if (typeof window !== 'undefined') { window.ShowDial = ShowDial; }
if (typeof globalThis !== 'undefined') { globalThis.SyncDialDeleteKey = SyncDialDeleteKey; }
if (typeof window !== 'undefined') { window.SyncDialDeleteKey = SyncDialDeleteKey; }
if (typeof globalThis !== 'undefined') { globalThis.handleDialInput = handleDialInput; }
if (typeof window !== 'undefined') { window.handleDialInput = handleDialInput; }
if (typeof globalThis !== 'undefined') { globalThis.dialOnkeydown = dialOnkeydown; }
if (typeof window !== 'undefined') { window.dialOnkeydown = dialOnkeydown; }
if (typeof globalThis !== 'undefined') { globalThis.KeyPress = KeyPress; }
if (typeof window !== 'undefined') { window.KeyPress = KeyPress; }
if (typeof globalThis !== 'undefined') { globalThis.CloseUpSettings = CloseUpSettings; }
if (typeof window !== 'undefined') { window.CloseUpSettings = CloseUpSettings; }
if (typeof globalThis !== 'undefined') { globalThis.ShowContacts = ShowContacts; }
if (typeof window !== 'undefined') { window.ShowContacts = ShowContacts; }
if (typeof globalThis !== 'undefined') { globalThis.RenderMobileTopBar = RenderMobileTopBar; }
if (typeof window !== 'undefined') { window.RenderMobileTopBar = RenderMobileTopBar; }
if (typeof globalThis !== 'undefined') { globalThis.HandleMobileClearTab = HandleMobileClearTab; }
if (typeof window !== 'undefined') { window.HandleMobileClearTab = HandleMobileClearTab; }
if (typeof globalThis !== 'undefined') { globalThis.ShowTab = ShowTab; }
if (typeof window !== 'undefined') { window.ShowTab = ShowTab; }
if (typeof globalThis !== 'undefined') { globalThis.RenderMainTabBar = RenderMainTabBar; }
if (typeof window !== 'undefined') { window.RenderMainTabBar = RenderMainTabBar; }
if (typeof globalThis !== 'undefined') { globalThis.RenderConfigActionBar = RenderConfigActionBar; }
if (typeof window !== 'undefined') { window.RenderConfigActionBar = RenderConfigActionBar; }
if (typeof globalThis !== 'undefined') { globalThis.ToggleRecentExpanded = ToggleRecentExpanded; }
if (typeof window !== 'undefined') { window.ToggleRecentExpanded = ToggleRecentExpanded; }
if (typeof globalThis !== 'undefined') { globalThis.ToggleContactExpanded = ToggleContactExpanded; }
if (typeof window !== 'undefined') { window.ToggleContactExpanded = ToggleContactExpanded; }
if (typeof globalThis !== 'undefined') { globalThis.GetRecentActionNumber = GetRecentActionNumber; }
if (typeof window !== 'undefined') { window.GetRecentActionNumber = GetRecentActionNumber; }
if (typeof globalThis !== 'undefined') { globalThis.BindContactExpandedActions = BindContactExpandedActions; }
if (typeof window !== 'undefined') { window.BindContactExpandedActions = BindContactExpandedActions; }
if (typeof globalThis !== 'undefined') { globalThis.GetRecentHistoryEntries = GetRecentHistoryEntries; }
if (typeof window !== 'undefined') { window.GetRecentHistoryEntries = GetRecentHistoryEntries; }
if (typeof globalThis !== 'undefined') { globalThis.BuildRecentHistoryList = BuildRecentHistoryList; }
if (typeof window !== 'undefined') { window.BuildRecentHistoryList = BuildRecentHistoryList; }
if (typeof globalThis !== 'undefined') { globalThis.ShowRecentHistoryList = ShowRecentHistoryList; }
if (typeof window !== 'undefined') { window.ShowRecentHistoryList = ShowRecentHistoryList; }
if (typeof globalThis !== 'undefined') { globalThis.BindRecentExpandedActions = BindRecentExpandedActions; }
if (typeof window !== 'undefined') { window.BindRecentExpandedActions = BindRecentExpandedActions; }
if (typeof globalThis !== 'undefined') { globalThis.ShowRecentsTab = ShowRecentsTab; }
if (typeof window !== 'undefined') { window.ShowRecentsTab = ShowRecentsTab; }
if (typeof globalThis !== 'undefined') { globalThis.AddContactFromHistory = AddContactFromHistory; }
if (typeof window !== 'undefined') { window.AddContactFromHistory = AddContactFromHistory; }
if (typeof globalThis !== 'undefined') { globalThis.DeleteRecentGroupFromHistory = DeleteRecentGroupFromHistory; }
if (typeof window !== 'undefined') { window.DeleteRecentGroupFromHistory = DeleteRecentGroupFromHistory; }
if (typeof globalThis !== 'undefined') { globalThis.ClearAllRecentHistory = ClearAllRecentHistory; }
if (typeof window !== 'undefined') { window.ClearAllRecentHistory = ClearAllRecentHistory; }
if (typeof globalThis !== 'undefined') { globalThis.ClearAllContacts = ClearAllContacts; }
if (typeof window !== 'undefined') { window.ClearAllContacts = ClearAllContacts; }
if (typeof globalThis !== 'undefined') { globalThis.ShowSortAnfFilter = ShowSortAnfFilter; }
if (typeof window !== 'undefined') { window.ShowSortAnfFilter = ShowSortAnfFilter; }
if (typeof globalThis !== 'undefined') { globalThis.html = html; }
if (typeof window !== 'undefined') { window.html = html; }
if (typeof globalThis !== 'undefined') { globalThis.DialByLine = DialByLine; }
if (typeof window !== 'undefined') { window.DialByLine = DialByLine; }
if (typeof globalThis !== 'undefined') { globalThis.SelectLine = SelectLine; }
if (typeof window !== 'undefined') { window.SelectLine = SelectLine; }
if (typeof globalThis !== 'undefined') { globalThis.FindLineByNumber = FindLineByNumber; }
if (typeof window !== 'undefined') { window.FindLineByNumber = FindLineByNumber; }
if (typeof globalThis !== 'undefined') { globalThis.AddLineHtml = AddLineHtml; }
if (typeof window !== 'undefined') { window.AddLineHtml = AddLineHtml; }
if (typeof globalThis !== 'undefined') { globalThis.RemoveLine = RemoveLine; }
if (typeof window !== 'undefined') { window.RemoveLine = RemoveLine; }
if (typeof globalThis !== 'undefined') { globalThis.CloseLine = CloseLine; }
if (typeof window !== 'undefined') { window.CloseLine = CloseLine; }
if (typeof globalThis !== 'undefined') { globalThis.SwitchLines = SwitchLines; }
if (typeof window !== 'undefined') { window.SwitchLines = SwitchLines; }
if (typeof globalThis !== 'undefined') { globalThis.RefreshLineActivity = RefreshLineActivity; }
if (typeof window !== 'undefined') { window.RefreshLineActivity = RefreshLineActivity; }
if (typeof globalThis !== 'undefined') { globalThis.Buddy = Buddy; }
if (typeof window !== 'undefined') { window.Buddy = Buddy; }
