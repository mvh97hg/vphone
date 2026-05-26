function InitUserBuddies(){
    var template = { TotalRows:0, DataCollection:[] }
    localDB.setItem(profileUserID + "-Buddies", JSON.stringify(template));
    return JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
}
function MakeBuddy(type, update, focus, subscribe, callerID, did, jid, AllowDuringDnd, subscribeUser, autoDelete, addToXmppRoster){
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json == null) json = InitUserBuddies();

    var dateNow = utcDateNow();
    var buddyObj = null;
    var id = uID();

    if(type == "extension") {
        json.DataCollection.push({
            Type: "extension",
            LastActivity: dateNow,
            ExtensionNumber: did,
            MobileNumber: "",
            ContactNumber1: "",
            ContactNumber2: "",
            uID: id,
            cID: null,
            gID: null,
            jid: null,
            DisplayName: callerID,
            Description: "",
            Email: "",
            MemberCount: 0,
            EnableDuringDnd: AllowDuringDnd,
            Subscribe: subscribe,
            SubscribeUser: subscribeUser,
            AutoDelete: autoDelete
        });
        buddyObj = new Buddy("extension", id, callerID, did, "", "", "", dateNow, "", "", null, AllowDuringDnd, subscribe, subscribeUser, autoDelete);
        AddBuddy(buddyObj, update, focus, subscribe, true);
    }
    if(type == "contact"){
        json.DataCollection.push({
            Type: "contact",
            LastActivity: dateNow,
            ExtensionNumber: "",
            MobileNumber: "",
            ContactNumber1: did,
            ContactNumber2: "",
            uID: null,
            cID: id,
            gID: null,
            jid: null,
            DisplayName: callerID,
            Description: "",
            Email: "",
            MemberCount: 0,
            EnableDuringDnd: AllowDuringDnd,
            Subscribe: false,
            SubscribeUser: null,
            AutoDelete: autoDelete
        });
        buddyObj = new Buddy("contact", id, callerID, "", "", did, "", dateNow, "", "", null, AllowDuringDnd, false, null, autoDelete);
        AddBuddy(buddyObj, update, focus, false, true);
    }
    if(type == "group") {
        json.DataCollection.push({
            Type: "group",
            LastActivity: dateNow,
            ExtensionNumber: did,
            MobileNumber: "",
            ContactNumber1: "",
            ContactNumber2: "",
            uID: null,
            cID: null,
            gID: id,
            jid: null,
            DisplayName: callerID,
            Description: "",
            Email: "",
            MemberCount: 0,
            EnableDuringDnd: false,
            Subscribe: false,
            SubscribeUser: null,
            AutoDelete: autoDelete
        });
        buddyObj = new Buddy("group", id, callerID, did, "", "", "", dateNow, "", "", null, false, false, null, autoDelete);
        AddBuddy(buddyObj, update, focus, false, true);
    }
    json.TotalRows = json.DataCollection.length;
    localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    return buddyObj;
}
function UpdateBuddyCallerID(buddyObj, callerID){
    buddyObj.CallerIDName = callerID;

    var buddy = buddyObj.identity;
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null){
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.DisplayName = callerID;
                return false;
            }
        });
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }

    UpdateBuddyList();
}
function AddBuddy(buddyObj, update, focus, subscribe, cleanup){
    Buddies.push(buddyObj);
    if(update == true) UpdateBuddyList();
    AddBuddyMessageStream(buddyObj);
    if(subscribe == true) SubscribeBuddy(buddyObj);
    if(focus == true && IsCallFirstContactMode() == false) SelectBuddy(buddyObj.identity);
    if(cleanup == true) CleanupBuddies()
}
function CleanupBuddies(){
    if(MaxBuddyAge > 1 || MaxBuddies > 1){
        Buddies.sort(function(a, b){
            var aMo = moment.utc(a.lastActivity.replace(" UTC", ""));
            var bMo = moment.utc(b.lastActivity.replace(" UTC", ""));
            if (aMo.isSameOrAfter(bMo, "second")) {
                return -1;
            } else return 1;
            return 0;
        });

        if(MaxBuddyAge > 1){
            var expiredDate = moment.utc().subtract(MaxBuddyAge, 'days');
            console.log("Running Buddy Cleanup for activity older than: ", expiredDate.format(DisplayDateFormat+" "+DisplayTimeFormat));
            for (var b = Buddies.length - 1; b >= 0; b--) {
                var lastActivity = moment.utc(Buddies[b].lastActivity.replace(" UTC", ""));
                if(lastActivity.isSameOrAfter(expiredDate, "second")){
                } else {
                    if(Buddies[b].AllowAutoDelete == true){
                        console.warn("This buddy is too old, and will be deleted: ", lastActivity.format(DisplayDateFormat+" "+DisplayTimeFormat));
                        DoRemoveBuddy(Buddies[b].identity);
                    }
                }
            }
        }
        if(MaxBuddies > 1 && MaxBuddies < Buddies.length){
            console.log("Running Buddy Cleanup for buddies more than: ", MaxBuddies);
            for (var b = Buddies.length - 1; b >= MaxBuddies; b--) {
                if(Buddies[b].AllowAutoDelete == true){
                    console.warn("This buddy is too Many, and will be deleted: ", Buddies[b].identity);
                    DoRemoveBuddy(Buddies[b].identity);
                }
            }
        }
    }
}
function PopulateBuddyList() {
    console.log("Clearing Buddies...");
    Buddies = new Array();
    console.log("Adding Buddies...");
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json == null) json = InitUserBuddies();

    console.log("Total Buddies: " + json.TotalRows);
    $.each(json.DataCollection, function (i, item) {
        item.AutoDelete = (item.AutoDelete == true)? true : false;
        item.Pinned = (item.Pinned == true)? true : false;
        if(item.Type == "extension"){
            var buddy = new Buddy("extension",
                                    item.uID,
                                    item.DisplayName,
                                    item.ExtensionNumber,
                                    item.MobileNumber,
                                    item.ContactNumber1,
                                    item.ContactNumber2,
                                    item.LastActivity,
                                    item.Description,
                                    item.Email,
                                    null,
                                    item.EnableDuringDnd,
                                    item.Subscribe,
                                    item.SubscribeUser,
                                    item.AutoDelete,
                                    item.Pinned);
            AddBuddy(buddy, false, false, false);
        }
        else if(item.Type == "xmpp"){
            var buddy = new Buddy("xmpp",
                                    item.uID,
                                    item.DisplayName,
                                    item.ExtensionNumber,
                                    "",
                                    "",
                                    "",
                                    item.LastActivity,
                                    "",
                                    "",
                                    item.jid,
                                    item.EnableDuringDnd,
                                    item.Subscribe,
                                    item.SubscribeUser,
                                    item.AutoDelete,
                                    item.Pinned);
            AddBuddy(buddy, false, false, false);
        }
        else if(item.Type == "contact"){
            var buddy = new Buddy("contact",
                                    item.cID,
                                    item.DisplayName,
                                    "",
                                    item.MobileNumber,
                                    item.ContactNumber1,
                                    item.ContactNumber2,
                                    item.LastActivity,
                                    item.Description,
                                    item.Email,
                                    null,
                                    item.EnableDuringDnd,
                                    item.Subscribe,
                                    item.SubscribeUser,
                                    item.AutoDelete,
                                    item.Pinned);
            AddBuddy(buddy, false, false, false);
        }
        else if(item.Type == "group"){
            var buddy = new Buddy("group",
                                    item.gID,
                                    item.DisplayName,
                                    item.ExtensionNumber,
                                    "",
                                    "",
                                    "",
                                    item.LastActivity,
                                    item.MemberCount + " member(s)",
                                    item.Email,
                                    null,
                                    item.EnableDuringDnd,
                                    item.Subscribe,
                                    item.SubscribeUser,
                                    item.AutoDelete,
                                    item.Pinned);
            AddBuddy(buddy, false, false, false);
        }
    });
    CleanupBuddies()
    console.log("Updating Buddy List...");
    UpdateBuddyList();
}
function UpdateBuddyList(){
    var filter = $("#searchArea").is(":visible") ? SanitizePhoneSearch($("#txtFindBuddy").val()) : "";
    var activeTab = GetActiveMainTab();
    var visibleEntryCount = 0;
    if($("#txtFindBuddy").val() != filter) $("#txtFindBuddy").val(filter);

    $("#myContacts").empty();
    SetMobilePaneEmptyState("#myContacts", false);
    var callCount = 0
    for(var l = 0; l < Lines.length; l++) {

        var classStr = (Lines[l].IsSelected)? "buddySelected" : "buddy";
        if(Lines[l].SipSession != null) classStr = (Lines[l].SipSession.isOnHold)? "buddyActiveCallHollding" : "buddyActiveCall";

        var html = "<div id=\"line-"+ Lines[l].LineNumber +"\" class="+ classStr +" onclick=\"SelectLine('"+ Lines[l].LineNumber +"')\">";
        if(Lines[l].IsSelected == false && Lines[l].SipSession && Lines[l].SipSession.data.started != true && Lines[l].SipSession.data.calldirection == "inbound"){
            html += "<span id=\"line-"+ Lines[l].LineNumber +"-ringing\" class=missedNotifyer style=\"padding-left: 5px; padding-right: 5px; width:unset\"><i class=\"fa fa-phone\"></i> "+ lang.state_ringing +"</span>";
        }
        var selfExtension = GetSelfExtensionLabel();
        html += "<div class=lineIcon>"+ (l + 1) +"</div>";
        html += "<div class=contactNameText><i class=\"fa fa-phone\"></i> "+ selfExtension +"</div>";
        html += "<div id=\"line-"+ Lines[l].LineNumber +"-datetime\" class=contactDate>&nbsp;</div>";
        html += "</div>";
        if(Lines[l].SipSession && Lines[l].SipSession.data.earlyReject != true){
            $("#myContacts").append(html);
            callCount ++;
            visibleEntryCount ++;
        }
    }
    if(DisableBuddies == true){
        if(callCount == 0 && DisableFreeDial != true){
            if(activeTab == "contacts"){
                $("#myContacts").append(BuildMobileEmptyState("fa-address-book", GetUiText("mobile_no_contacts", "No contacts", null)));
                SetMobilePaneEmptyState("#myContacts", true);
            } else {
                if(UiCustomDialButton == true){
                    if(typeof web_hook_dial_out !== 'undefined') {
                        web_hook_dial_out(null);
                    }
                } else {
                    ShowDial();
                }
            }
        }
        return;
    }
    if(callCount > 0){
        $("#myContacts").append("<hr class=hrline>");
    }
    if(Buddies.length == 0 && callCount == 0 && DisableFreeDial != true){
        if(activeTab == "contacts"){
            $("#myContacts").append(BuildMobileEmptyState("fa-address-book", GetUiText("mobile_no_contacts", "No contacts", null)));
            SetMobilePaneEmptyState("#myContacts", true);
        } else {
            if(UiCustomDialButton == true){
                if(typeof web_hook_dial_out !== 'undefined') {
                    web_hook_dial_out(null);
                }
            } else {
                ShowDial();
            }
        }
        return;
    }
    SortBuddies();

    var hiddenBuddies = 0;
    for(var b = 0; b < Buddies.length; b++) {
        var buddyObj = Buddies[b];

        if(activeTab == "contacts" && buddyObj.type != "contact"){
            continue;
        }

        if(filter && filter.length >= 1){
            var display = false;
            var extenVal = SanitizePhoneSearch(buddyObj.ExtNo);
            var c1Val = SanitizePhoneSearch(buddyObj.ContactNumber1);
            var mVal = SanitizePhoneSearch(buddyObj.MobileNumber);
            if(extenVal != "" && extenVal.indexOf(filter) > -1 ) display = true;
            if(c1Val != "" && c1Val.indexOf(filter) > -1 ) display = true;
            if(mVal != "" && mVal.indexOf(filter) > -1 ) display = true;
            if(!display) continue;
        }

        var today = moment.utc();
        var lastActivity = moment.utc(buddyObj.lastActivity.replace(" UTC", ""));
        var displayDateTime = "";
        if(lastActivity.isSame(today, 'day'))
        {
            displayDateTime = lastActivity.local().format(DisplayTimeFormat);
        }
        else {
            displayDateTime = lastActivity.local().format(DisplayDateFormat);
        }

        if(HideAutoDeleteBuddies){
            if(buddyObj.AllowAutoDelete) {
                hiddenBuddies++;
                continue;
            }
        }
        if(IsCallFirstContactMode() && buddyObj.AllowAutoDelete == true && (buddyObj.type == "extension" || buddyObj.type == "xmpp")){
            hiddenBuddies++;
            continue;
        }

        var classStr = (buddyObj.IsSelected)? "buddySelected" : "buddy";
        if(buddyObj.type == "extension") {
            var friendlyState = buddyObj.presence;
            if(friendlyState == "Unknown") friendlyState = lang.state_unknown;
            if(friendlyState == "Not online") friendlyState = lang.state_not_online;
            if(friendlyState == "Ready") friendlyState = lang.state_ready;
            if(friendlyState == "On the phone") friendlyState = lang.state_on_the_phone;
            if(friendlyState == "Proceeding") friendlyState = lang.state_on_the_phone;
            if(friendlyState == "Ringing") friendlyState = lang.state_ringing;
            if(friendlyState == "On hold") friendlyState = lang.state_on_hold;
            if(friendlyState == "Unavailable") friendlyState = lang.state_unavailable;
            if(buddyObj.EnableSubscribe != true) friendlyState = (buddyObj.Desc)? buddyObj.Desc : "";
            var autDeleteStatus = "";
            if(buddyObj.AllowAutoDelete == true) autDeleteStatus = "<i class=\"fa fa-clock-o\"></i> ";
            var html = "<div id=\"contact-"+ buddyObj.identity +"\" class="+ classStr +" onclick=\"OpenBuddyFromContacts('"+ buddyObj.identity +"')\">";
            html += "<span id=\"contact-"+ buddyObj.identity +"-missed\" class=missedNotifyer style=\""+ ((buddyObj.missed && buddyObj.missed > 0)? "" : "display:none") +"\">"+ buddyObj.missed +"</span>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-picture\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity, buddyObj.type) +"')\"></div>";
            html += (buddyObj.Pinned)? "<span class=pinnedBuddy><i class=\"fa fa-thumb-tack\"></i></span>" : "";
            html += "<div class=contactNameText>";
            html += "<span id=\"contact-"+ buddyObj.identity +"-devstate\" class=\""+ ((buddyObj.EnableSubscribe)? buddyObj.devState : "dotDefault") +"\"></span>";
            html += (BuddyShowExtenNum == true)? " "+ buddyObj.ExtNo + " - " : " ";
            html += buddyObj.CallerIDName
            html += "</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-datetime\" class=contactDate>"+ autDeleteStatus + ""+ displayDateTime +"</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-presence\" class=presenceText>"+ friendlyState +"</div>";
            html += "</div>";
            $("#myContacts").append(html);
            visibleEntryCount ++;
        } else if(buddyObj.type == "xmpp") {
            var friendlyState = buddyObj.presenceText;
            var autDeleteStatus = "";
            if(buddyObj.AllowAutoDelete == true) autDeleteStatus = "<i class=\"fa fa-clock-o\"></i> ";
            friendlyState = friendlyState.replace(/[<>"'\r\n&]/g, function(chr){
                let table = { '<': 'lt', '>': 'gt', '"': 'quot', '\'': 'apos', '&': 'amp', '\r': '#10', '\n': '#13' };
                return '&' + table[chr] + ';';
            });

            var html = "<div id=\"contact-"+ buddyObj.identity +"\" class="+ classStr +" onclick=\"OpenBuddyFromContacts('"+ buddyObj.identity +"')\">";
            html += "<span id=\"contact-"+ buddyObj.identity +"-missed\" class=missedNotifyer style=\""+ ((buddyObj.missed && buddyObj.missed > 0)? "" : "display:none") +"\">"+ buddyObj.missed +"</span>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-picture\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity, buddyObj.type) +"')\"></div>";
            html += (buddyObj.Pinned)? "<span class=pinnedBuddy><i class=\"fa fa-thumb-tack\"></i></span>" : "";
            html += "<div class=contactNameText>";
            html += "<span id=\"contact-"+ buddyObj.identity +"-devstate\" class=\""+ ((buddyObj.EnableSubscribe)? buddyObj.devState : "dotDefault") +"\"></span>";
            html += (BuddyShowExtenNum == true)? " "+ buddyObj.ExtNo + " - " : " ";
            html += buddyObj.CallerIDName;
            html += "</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-datetime\" class=contactDate>"+ autDeleteStatus + ""+ displayDateTime +"</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-presence\" class=presenceText><i class=\"fa fa-comments\"></i> "+ friendlyState +"</div>";
            html += "</div>";
            $("#myContacts").append(html);
            visibleEntryCount ++;
        } else if(buddyObj.type == "contact") {
            var dialNumber = GetBuddyDialNumber(buddyObj);
            var html = "<div id=\"contact-"+ buddyObj.identity +"\" class=\""+ classStr +" contactCompact enterpriseContactItem\" data-contact-identity=\""+ EscapeAttr(buddyObj.identity) +"\" data-dial-number=\""+ EscapeAttr(dialNumber) +"\">";
            html += "<div class=contactCompactMain>";
            html += "<div class=contactCompactName style=\"user-select:text\">"+ buddyObj.CallerIDName +"</div>";
            html += "<div class=contactCompactNumber style=\"user-select:text\">"+ dialNumber +"</div>";
            html += "</div>";
            html += "<div class=recentExpandChevron><i class=\"fa fa-chevron-down\"></i></div>";
            html += "<div class=contactCompactExpanded style=\"display:none\">";
            html += "<div class=recentExpandedActions>";
            html += "<button type=button class=\"roundButtons contactActionCall\" title=\""+ EscapeAttr(lang.audio_call || lang.call || "Call") +"\""+ (dialNumber == "" ? " disabled" : "") +"><i class=\"fa fa-phone\"></i></button>";
            html += "<button type=button class=\"roundButtons contactActionEdit\" title=\""+ EscapeAttr(lang.edit || "Edit") +"\"><i class=\"fa fa-pencil\"></i></button>";
            html += "<button type=button class=\"roundButtons contactActionDelete\" title=\""+ EscapeAttr(lang.delete_buddy || lang.delete || "Delete") +"\"><i class=\"fa fa-trash\"></i></button>";
            html += "</div>";
            html += "</div>";
            html += "</div>";
            $("#myContacts").append(html);
            visibleEntryCount ++;
        } else if(buddyObj.type == "group"){
            var autDeleteStatus = "";
            if(buddyObj.AllowAutoDelete == true) autDeleteStatus = "<i class=\"fa fa-clock-o\"></i> ";
            var html = "<div id=\"contact-"+ buddyObj.identity +"\" class="+ classStr +" onclick=\"OpenBuddyFromContacts('"+ buddyObj.identity +"')\">";
            html += "<span id=\"contact-"+ buddyObj.identity +"-missed\" class=missedNotifyer style=\""+ ((buddyObj.missed && buddyObj.missed > 0)? "" : "display:none") +"\">"+ buddyObj.missed +"</span>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-picture\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity, buddyObj.type) +"')\"></div>";
            html += (buddyObj.Pinned)? "<span class=pinnedBuddy><i class=\"fa fa-thumb-tack\"></i></span>" : "";
            html += "<div class=contactNameText><i class=\"fa fa-users\"></i> "+ buddyObj.CallerIDName +"</div>";
            html += "<div id=\"contact-"+ buddyObj.identity +"-datetime\" class=contactDate>"+ autDeleteStatus + ""+ displayDateTime +"</div>";
            html += "<div class=presenceText>"+ buddyObj.Desc +"</div>";
            html += "</div>";
            $("#myContacts").append(html);
            visibleEntryCount ++;
        }
    }
    if(IsCallFirstContactMode() == false){
        for(var b = 0; b < Buddies.length; b++) {
            if(Buddies[b].IsSelected) {
                SelectBuddy(Buddies[b].identity, Buddies[b].type);
                break;
            }
        }
    }
    if(callCount == 0 && visibleEntryCount == 0){
        $("#myContacts").append(BuildMobileEmptyState("fa-address-book", GetUiText("mobile_no_contacts", "No contacts", null)));
        SetMobilePaneEmptyState("#myContacts", true);
    }
    BindContactExpandedActions();
    ApplyRegistrationStatusText();
}
function AddBuddyMessageStream(buddyObj) {
    var profileRow = "";
    profileRow += "<tr><td id=\"contact-"+ buddyObj.identity +"-ProfileCell\" class=\"streamSection highlightSection buddyProfileSection\" style=\"height: 50px; box-sizing: border-box;\">";
    profileRow += "<table cellpadding=0 cellspacing=0 border=0 style=\"width:100%; table-layout: fixed;\">"
    profileRow += "<tr>"
    profileRow += "<td style=\"width:38px; text-align: center;\">";
    profileRow += "<button id=\"contact-"+ buddyObj.identity +"-btn-back\" onclick=\"CloseBuddy('"+ buddyObj.identity +"')\" class=roundButtons style=\"margin-right:5px\" title=\""+ lang.back +"\"><i class=\"fa fa-chevron-left\"></i></button> ";
    profileRow += "</td>"
    profileRow += "<td style=\"width:100%\">";
    profileRow += "<div class=contact style=\"cursor: unset; padding:0px\">";
    if(buddyObj.type == "extension" || buddyObj.type == "xmpp") {
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-picture-main\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity) +"')\"></div>";
    }
    else if(buddyObj.type == "contact") {
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-picture-main\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity,"contact") +"')\"></div>";
    }
    else if(buddyObj.type == "group") {
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-picture-main\" class=buddyIcon style=\"background-image: url('"+ getPicture(buddyObj.identity,"group") +"')\"></div>";
    }
    if(buddyObj.type == "extension" || buddyObj.type == "xmpp") {
        profileRow += "<div class=contactNameText style=\"margin-right: 0px;\">";
        profileRow += "<span id=\"contact-"+ buddyObj.identity +"-devstate-main\" class=\""+ buddyObj.devState +"\"></span>";
        profileRow += " <span id=\"contact-"+ buddyObj.identity +"-name\">"+ buddyObj.CallerIDName +"</span>";
        profileRow += "</div>";
    }
    else if(buddyObj.type == "contact") {
        profileRow += "<div class=contactNameText style=\"margin-right: 0px;\">"
        profileRow += "<i class=\"fa fa-address-card\"></i>";
        profileRow += " <span id=\"contact-"+ buddyObj.identity +"-name\">"+ buddyObj.CallerIDName +"</span>";
        profileRow += "</div>";
    }
    else if(buddyObj.type == "group") {
        profileRow += "<div class=contactNameText style=\"margin-right: 0px;\">"
        profileRow += "<i class=\"fa fa-users\"></i>";
        profileRow += " <span id=\"contact-"+ buddyObj.identity +"-name\">"+ buddyObj.CallerIDName +"</span>";
        profileRow += "</div>";
    }
    if(buddyObj.type == "extension") {
        var friendlyState = buddyObj.presence;
        if (friendlyState == "Unknown") friendlyState = lang.state_unknown;
        if (friendlyState == "Not online") friendlyState = lang.state_not_online;
        if (friendlyState == "Ready") friendlyState = lang.state_ready;
        if (friendlyState == "On the phone") friendlyState = lang.state_on_the_phone;
        if (friendlyState == "Ringing") friendlyState = lang.state_ringing;
        if (friendlyState == "On hold") friendlyState = lang.state_on_hold;
        if (friendlyState == "Unavailable") friendlyState = lang.state_unavailable;
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-presence-main\" class=presenceText>"+ friendlyState +"</div>";
    }
    else if(buddyObj.type == "xmpp"){
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-presence-main\" class=presenceText><i class=\"fa fa-comments\"></i> "+ buddyObj.presenceText +"</div>";
    }
    else{
        profileRow += "<div id=\"contact-"+ buddyObj.identity +"-presence-main\" class=presenceText>"+ buddyObj.Desc +"</div>";
    }
    profileRow += "</div>";
    profileRow += "</td>";
    var buttonsWidth = 80;
    if((buddyObj.type == "extension" || buddyObj.type == "xmpp") && EnableVideoCalling == true) {
        buttonsWidth = 120;
    }
    var fullButtonsWidth = 200;
    if((buddyObj.type == "extension" || buddyObj.type == "xmpp") && EnableVideoCalling == true) {
        fullButtonsWidth = 240;
    }
    profileRow += "<td id=\"contact-"+ buddyObj.identity +"-action-buttons\" style=\"width: "+ buttonsWidth +"px; text-align: right\">";
    profileRow += "<button id=\"contact-"+ buddyObj.identity +"-btn-audioCall\" onclick=\"AudioCallMenu('"+ buddyObj.identity +"', this)\" class=roundButtons title=\""+ lang.audio_call +"\"><i class=\"fa fa-phone\"></i></button>";
    if((buddyObj.type == "extension" || buddyObj.type == "xmpp") && EnableVideoCalling == true) {
        profileRow += " <button id=\"contact-"+ buddyObj.identity +"-btn-videoCall\" onclick=\"DialByLine('video', '"+ buddyObj.identity +"', '"+ buddyObj.ExtNo +"');\" class=roundButtons title=\""+ lang.video_call +"\"><i class=\"fa fa-video-camera\"></i></button>";
    }
    profileRow += "<span id=\"contact-"+ buddyObj.identity +"-extra-buttons\" style=\"display:none\">"
    profileRow += " <button id=\"contact-"+ buddyObj.identity +"-btn-edit\" onclick=\"EditBuddyWindow('"+ buddyObj.identity +"')\" class=roundButtons title=\""+ lang.edit +"\"><i class=\"fa fa-pencil\"></i></button>";
    profileRow += " <button id=\"contact-"+ buddyObj.identity +"-btn-search\" onclick=\"FindSomething('"+ buddyObj.identity +"')\" class=roundButtons title=\""+ lang.find_something +"\"><i class=\"fa fa-search\"></i></button>";
    profileRow += " <button id=\"contact-"+ buddyObj.identity +"-btn-pin\" onclick=\"TogglePinned('"+ buddyObj.identity +"')\" class=roundButtons title=\""+ lang.pin_to_top +"\"><i class=\"fa fa-thumb-tack\"></i></button>";
    profileRow += "</span>"
    profileRow += " <button id=\"contact-"+ buddyObj.identity +"-btn-toggle-extra\" onclick=\"ToggleExtraButtons('"+ buddyObj.identity +"', "+ buttonsWidth +", "+ fullButtonsWidth +")\" class=roundButtons><i class=\"fa fa-ellipsis-h\"></i></button>";
    profileRow += "</td>";

    profileRow += "</tr></table>";
    profileRow += "</div>";
    profileRow += "<div style=\"clear:both; height:0px\"></div>"
    profileRow += "<div id=\"contact-"+ buddyObj.identity +"-search\" style=\"margin-top:6px; display:none\">";
    profileRow += "<span class=searchClean style=\"width:100%\"><input type=text style=\"width: calc(100% - 40px);\" autocomplete=none oninput=SearchStream(this,'"+ buddyObj.identity +"') placeholder=\""+ lang.find_something_in_the_message_stream +"\"></span>";
    profileRow += "</div>";

    profileRow += "</td></tr>";
    var messagesRow = "";
    var textRow = "";

    var html = "<table id=\"stream-"+ buddyObj.identity +"\" class=stream cellspacing=0 cellpadding=0>";
    if(UiMessageLayout == "top"){
        html += messagesRow;
        html += profileRow;
    } else {
        html += profileRow;
        html += messagesRow;
    }
    html += textRow;
    html += "</table>";

    $("#rightContent").append(html);
    if(UiMessageLayout == "top"){
        $("#contact-"+ buddyObj.identity +"-MessagesCell").addClass("")
        $("#contact-"+ buddyObj.identity +"-ProfileCell").addClass("sectionBorderTop")
        $("#contact-"+ buddyObj.identity +"-InteractionCell").addClass("")
    } else {
        $("#contact-"+ buddyObj.identity +"-ProfileCell").addClass("sectionBorderBottom")
        $("#contact-"+ buddyObj.identity +"-MessagesCell").addClass("")
        $("#contact-"+ buddyObj.identity +"-InteractionCell").addClass("sectionBorderTop")
    }


}
function RemoveBuddyMessageStream(buddyObj, days, preserveStream){
    if(buddyObj == null) return;
    var stream = JSON.parse(localDB.getItem(buddyObj.identity + "-stream"));
    if(days && days > 0){
        if(stream && stream.DataCollection && stream.DataCollection.length >= 1){
            var trimmedStream = {
                TotalRows : 0,
                DataCollection : []
            }
            trimmedStream.DataCollection = stream.DataCollection.filter(function(item){
                var itemDate = moment.utc(item.ItemDate.replace(" UTC", ""));
                var expiredDate = moment().utc().subtract(days, 'days');
                if(itemDate.isSameOrAfter(expiredDate, "second")){
                    return true
                }
                else {
                    return false;
                }
            });
            trimmedStream.TotalRows = trimmedStream.DataCollection.length;
            localDB.setItem(buddyObj.identity + "-stream", JSON.stringify(trimmedStream));
            var deleteStream = {
                TotalRows : 0,
                DataCollection : []
            }
            deleteStream.DataCollection = stream.DataCollection.filter(function(item){
                var itemDate = moment.utc(item.ItemDate.replace(" UTC", ""));
                var expiredDate = moment().utc().subtract(days, 'days');
                if(itemDate.isSameOrAfter(expiredDate, "second")){
                    return false;
                }
                else {
                    return true
                }
            });
            deleteStream.TotalRows = deleteStream.DataCollection.length;
            stream = deleteStream;

            RefreshStream(buddyObj);
        }
    }
    else {
        CloseBuddy(buddyObj.identity);
        $("#stream-"+ buddyObj.identity).remove();

        if(!preserveStream){
            localDB.removeItem(buddyObj.identity + "-stream");
        }
        var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
        var x = 0;
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddyObj.identity || item.cID == buddyObj.identity || item.gID == buddyObj.identity){
                x = i;
                return false;
            }
        });
        json.DataCollection.splice(x,1);
        json.TotalRows = json.DataCollection.length;
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
        localDB.removeItem("img-"+ buddyObj.identity +"-extension");
        localDB.removeItem("img-"+ buddyObj.identity +"-contact");
        localDB.removeItem("img-"+ buddyObj.identity +"-group");
    }
    UpdateBuddyList();
    if(!preserveStream && stream && stream.DataCollection && stream.DataCollection.length >= 1){
        DeleteCallRecordings(buddyObj.identity, stream);
    }
    if(!preserveStream && stream && stream.DataCollection && stream.DataCollection.length >= 1){
        DeleteQosData(buddyObj.identity, stream);
    }
}
function DeleteCallRecordings(buddy, stream){
    if(CallRecordingsIndexDb != null){
        $.each(stream.DataCollection, function (i, item) {
            if (item.ItemType == "CDR" && item.Recordings && item.Recordings.length) {
                $.each(item.Recordings, function (i, recording) {
                    console.log("Deleting Call Recording: ", recording.uID);
                    var objectStore = CallRecordingsIndexDb.transaction(["Recordings"], "readwrite").objectStore("Recordings");
                    try{
                        var deleteRequest = objectStore.delete(recording.uID);
                        deleteRequest.onsuccess = function(event) {
                            console.log("Call Recording Deleted: ", recording.uID);
                        }
                    } catch(e){
                        console.log("Call Recording Delete failed: ", e);
                    }
                });
            }
        });
    }
    else {
        console.warn("CallRecordingsIndexDb is null.");
    }
}
function ToggleExtraButtons(lineNum, normal, expanded){
    var extraButtons = $("#contact-"+ lineNum +"-extra-buttons");
    if(extraButtons.is(":visible")){
        extraButtons.hide()
        $("#contact-"+ lineNum +"-action-buttons").css("width", normal+"px");
    } else {
        extraButtons.show()
        $("#contact-"+ lineNum +"-action-buttons").css("width", expanded+"px");
    }
}
function SortBuddies(){
    if(BuddySortBy == "type"){
        Buddies.sort(function(a, b){
            var aMo = moment.utc(a.lastActivity.replace(" UTC", ""));
            var bMo = moment.utc(b.lastActivity.replace(" UTC", ""));
            var aType = a.type;
            var bType = b.type;
            if(SortByTypeOrder == "c|e|x") {
                if(a.type == "contact") aType = "A";
                if(b.type == "contact") bType = "A";
                if(a.type == "extension") aType = "B";
                if(b.type == "extension") bType = "B";
                if(a.type == "xmpp") aType = "C";
                if(b.type == "xmpp") bType = "C";
            }
            if(SortByTypeOrder == "c|x|e") {
                if(a.type == "contact") aType = "A";
                if(b.type == "contact") bType = "A";
                if(a.type == "extension") aType = "C";
                if(b.type == "extension") bType = "C";
                if(a.type == "xmpp") aType = "B";
                if(b.type == "xmpp") bType = "B";
            }
            if(SortByTypeOrder == "x|e|c") {
                if(a.type == "contact") aType = "C";
                if(b.type == "contact") bType = "C";
                if(a.type == "extension") aType = "B";
                if(b.type == "extension") bType = "B";
                if(a.type == "xmpp") aType = "A";
                if(b.type == "xmpp") bType = "A";
            }
            if(SortByTypeOrder == "x|c|e") {
                if(a.type == "contact") aType = "B";
                if(b.type == "contact") bType = "B";
                if(a.type == "extension") aType = "C";
                if(b.type == "extension") bType = "C";
                if(a.type == "xmpp") aType = "A";
                if(b.type == "xmpp") bType = "A";
            }
            if(SortByTypeOrder == "e|x|c") {
                if(a.type == "contact") aType = "C";
                if(b.type == "contact") bType = "C";
                if(a.type == "extension") aType = "A";
                if(b.type == "extension") bType = "A";
                if(a.type == "xmpp") aType = "B";
                if(b.type == "xmpp") bType = "B";
            }
            if(SortByTypeOrder == "e|c|x") {
                if(a.type == "contact") aType = "B";
                if(b.type == "contact") bType = "A";
                if(a.type == "extension") aType = "A";
                if(b.type == "extension") bType = "A";
                if(a.type == "xmpp") aType = "C";
                if(b.type == "xmpp") bType = "C";
            }

            return (aType.localeCompare(bType) || (aMo.isSameOrAfter(bMo, "second")? -1 : 1));
        });
    }
    if(BuddySortBy == "extension"){
        Buddies.sort(function(a, b){
            var aSortBy = (a.type == "extension" || a.type == "xmpp")? a.ExtNo : a.ContactNumber1;
            var bSortBy = (b.type == "extension" || b.type == "xmpp")? b.ExtNo : a.ContactNumber1;
            var aMo = moment.utc(a.lastActivity.replace(" UTC", ""));
            var bMo = moment.utc(b.lastActivity.replace(" UTC", ""));
            return (aSortBy.localeCompare(bSortBy) || (aMo.isSameOrAfter(bMo, "second")? -1 : 1));
        });
    }
    if(BuddySortBy == "alphabetical"){
        Buddies.sort(function(a, b){
            var aMo = moment.utc(a.lastActivity.replace(" UTC", ""));
            var bMo = moment.utc(b.lastActivity.replace(" UTC", ""));
            return (a.CallerIDName.localeCompare(b.CallerIDName) || (aMo.isSameOrAfter(bMo, "second")? -1 : 1));
        });
    }
    if(BuddySortBy == "activity"){
        Buddies.sort(function(a, b){
            var aMo = moment.utc(a.lastActivity.replace(" UTC", ""));
            var bMo = moment.utc(b.lastActivity.replace(" UTC", ""));
            return (aMo.isSameOrAfter(bMo, "second")? -1 : 1);
        });
    }
    if(BuddyAutoDeleteAtEnd == true){
        Buddies.sort(function(a, b){
            return (a.AllowAutoDelete === b.AllowAutoDelete)? 0 : a.AllowAutoDelete? 1 : -1;
        });
    }
    Buddies.sort(function(a, b){
        return (a.Pinned === b.Pinned)? 0 : a.Pinned? -1 : 1;
    });

}


function SelectBuddy(buddy) {
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;

    var displayName = (BuddyShowExtenNum == true && (buddyObj.type == "extension" || buddyObj.type == "xmpp"))? " "+ buddyObj.ExtNo + " - " + buddyObj.CallerIDName : buddyObj.CallerIDName;
    $("#contact-" + buddyObj.identity + "-name").html(displayName);
    var presence = "";
    if(buddyObj.type == "extension"){
        presence += buddyObj.presence;
        if(presence == "Unknown") presence = lang.state_unknown;
        if(presence == "Not online") presence = lang.state_not_online;
        if(presence == "Ready") presence = lang.state_ready;
        if(presence == "On the phone") presence = lang.state_on_the_phone;
        if(presence == "Ringing") presence = lang.state_ringing;
        if(presence == "On hold") presence = lang.state_on_hold;
        if(presence == "Unavailable") presence = lang.state_unavailable;
        if(buddyObj.EnableSubscribe != true) presence = buddyObj.Desc;
    } else if(buddyObj.type == "xmpp"){
        presence += "<i class=\"fa fa-comments\"></i> ";
        presence += buddyObj.presenceText;
    } else if(buddyObj.type == "contact"){
        presence += buddyObj.Desc;
    } else if(buddyObj.type == "group"){
        presence += buddyObj.Desc;
    }
    $("#contact-" + buddyObj.identity + "-presence-main").html(presence);

    $("#contact-"+ buddyObj.identity +"-picture-main").css("background-image", $("#contact-"+ buddyObj.identity +"-picture-main").css("background-image"));

    for(var b = 0; b < Buddies.length; b++) {
        if(Buddies[b].IsSelected == true && Buddies[b].identity == buddy){
            return;
        }
    }

    console.log("Selecting Buddy: "+ buddyObj.CallerIDName);

    selectedBuddy = buddyObj;
    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });
    $("#stream-" + buddy).prop('class', 'streamSelected');
    for(var l = 0; l < Lines.length; l++) {
        var classStr = "buddy";
        if(Lines[l].SipSession != null) classStr = (Lines[l].SipSession.isOnHold)? "buddyActiveCallHollding" : "buddyActiveCall";
        $("#line-" + Lines[l].LineNumber).prop('class', classStr);
        Lines[l].IsSelected = false;
    }

    ClearMissedBadge(buddy);
    for(var b = 0; b < Buddies.length; b++) {
        var classStr = (Buddies[b].identity == buddy)? "buddySelected" : "buddy";
        $("#contact-" + Buddies[b].identity).prop('class', classStr);

        Buddies[b].IsSelected = (Buddies[b].identity == buddy);
    }
    UpdateUI();
    RefreshStream(buddyObj);

    try{
        $("#contact-" + buddy).get(0).scrollIntoViewIfNeeded();
    } catch(e){}
    localDB.setItem("SelectedBuddy", buddy);
}
function OpenBuddyFromContacts(buddy){
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;
    if(buddyObj.type == "group") return;

    var dialNumber = GetBuddyDialNumber(buddyObj);
    if(dialNumber != ""){
        DialByLine("audio", buddyObj.identity, dialNumber);
        return;
    }

    if(IsCallFirstContactMode() == false){
        SelectBuddy(buddyObj.identity);
    }
}
function CloseBuddy(buddy){
    $(".buddySelected").each(function () {
        $(this).prop('class', 'buddy');
    });
    $(".streamSelected").each(function () {
        $(this).prop('class', 'stream');
    });

    console.log("Closing Buddy: "+ buddy);
    for(var b = 0; b < Buddies.length; b++){
        Buddies[b].IsSelected = false;
    }
    selectedBuddy = null;
    for(var l = 0; l < Lines.length; l++){
        Lines[l].IsSelected = false;
    }
    selectedLine = null;
    localDB.setItem("SelectedBuddy", null);
    UpdateUI();
}
function RemoveBuddy(buddy){

    CloseWindow();

    Confirm(lang.confirm_remove_buddy, lang.remove_buddy, function(){
        DoRemoveBuddy(buddy)
        UpdateBuddyList();
    });
}
function DoRemoveBuddy(buddy){
    for(var b = 0; b < Buddies.length; b++) {
        if(Buddies[b].identity == buddy) {
            RemoveBuddyMessageStream(Buddies[b], null, Buddies[b].type == "contact");
            UnsubscribeBuddy(Buddies[b]);
            Buddies.splice(b, 1);
            break;
        }
    }
}
function FindBuddyByDid(did){
    for(var b = 0; b < Buddies.length; b++){
        if(Buddies[b].ExtNo == did || Buddies[b].MobileNumber == did || Buddies[b].ContactNumber1 == did || Buddies[b].ContactNumber2 == did) {
            return Buddies[b];
        }
    }
    return null;
}
function FindBuddyByNumber(number){
    for(var b = 0; b < Buddies.length; b++){
        if(Buddies[b].MobileNumber == number || Buddies[b].ContactNumber1 == number || Buddies[b].ContactNumber2 == number) {
            return Buddies[b];
        }
    }
    return null;
}
function FindBuddyByIdentity(identity){
    for(var b = 0; b < Buddies.length; b++){
        if(Buddies[b].identity == identity) return Buddies[b];
    }
    return null;
}
function FindBuddyByObservedUser(SubscribeUser){
    for(var b = 0; b < Buddies.length; b++){
        if(Buddies[b].SubscribeUser == SubscribeUser) return Buddies[b];
    }
    return null;
}

function SearchStream(obj, buddy){
    var q = obj.value;

    var buddyObj = FindBuddyByIdentity(buddy);
    if(q == ""){
        console.log("Restore Stream");
        RefreshStream(buddyObj);
    }
    else{
        RefreshStream(buddyObj, q);
    }
}
function RefreshStream(buddyObj, filter) {
    return;
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.InitUserBuddies = InitUserBuddies; }
if (typeof window !== 'undefined') { window.InitUserBuddies = InitUserBuddies; }
if (typeof globalThis !== 'undefined') { globalThis.MakeBuddy = MakeBuddy; }
if (typeof window !== 'undefined') { window.MakeBuddy = MakeBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.UpdateBuddyCallerID = UpdateBuddyCallerID; }
if (typeof window !== 'undefined') { window.UpdateBuddyCallerID = UpdateBuddyCallerID; }
if (typeof globalThis !== 'undefined') { globalThis.AddBuddy = AddBuddy; }
if (typeof window !== 'undefined') { window.AddBuddy = AddBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.CleanupBuddies = CleanupBuddies; }
if (typeof window !== 'undefined') { window.CleanupBuddies = CleanupBuddies; }
if (typeof globalThis !== 'undefined') { globalThis.PopulateBuddyList = PopulateBuddyList; }
if (typeof window !== 'undefined') { window.PopulateBuddyList = PopulateBuddyList; }
if (typeof globalThis !== 'undefined') { globalThis.UpdateBuddyList = UpdateBuddyList; }
if (typeof window !== 'undefined') { window.UpdateBuddyList = UpdateBuddyList; }
if (typeof globalThis !== 'undefined') { globalThis.AddBuddyMessageStream = AddBuddyMessageStream; }
if (typeof window !== 'undefined') { window.AddBuddyMessageStream = AddBuddyMessageStream; }
if (typeof globalThis !== 'undefined') { globalThis.RemoveBuddyMessageStream = RemoveBuddyMessageStream; }
if (typeof window !== 'undefined') { window.RemoveBuddyMessageStream = RemoveBuddyMessageStream; }
if (typeof globalThis !== 'undefined') { globalThis.DeleteCallRecordings = DeleteCallRecordings; }
if (typeof window !== 'undefined') { window.DeleteCallRecordings = DeleteCallRecordings; }
if (typeof globalThis !== 'undefined') { globalThis.ToggleExtraButtons = ToggleExtraButtons; }
if (typeof window !== 'undefined') { window.ToggleExtraButtons = ToggleExtraButtons; }
if (typeof globalThis !== 'undefined') { globalThis.SortBuddies = SortBuddies; }
if (typeof window !== 'undefined') { window.SortBuddies = SortBuddies; }
if (typeof globalThis !== 'undefined') { globalThis.SelectBuddy = SelectBuddy; }
if (typeof window !== 'undefined') { window.SelectBuddy = SelectBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.OpenBuddyFromContacts = OpenBuddyFromContacts; }
if (typeof window !== 'undefined') { window.OpenBuddyFromContacts = OpenBuddyFromContacts; }
if (typeof globalThis !== 'undefined') { globalThis.CloseBuddy = CloseBuddy; }
if (typeof window !== 'undefined') { window.CloseBuddy = CloseBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.RemoveBuddy = RemoveBuddy; }
if (typeof window !== 'undefined') { window.RemoveBuddy = RemoveBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.DoRemoveBuddy = DoRemoveBuddy; }
if (typeof window !== 'undefined') { window.DoRemoveBuddy = DoRemoveBuddy; }
if (typeof globalThis !== 'undefined') { globalThis.FindBuddyByDid = FindBuddyByDid; }
if (typeof window !== 'undefined') { window.FindBuddyByDid = FindBuddyByDid; }
if (typeof globalThis !== 'undefined') { globalThis.FindBuddyByNumber = FindBuddyByNumber; }
if (typeof window !== 'undefined') { window.FindBuddyByNumber = FindBuddyByNumber; }
if (typeof globalThis !== 'undefined') { globalThis.FindBuddyByIdentity = FindBuddyByIdentity; }
if (typeof window !== 'undefined') { window.FindBuddyByIdentity = FindBuddyByIdentity; }
if (typeof globalThis !== 'undefined') { globalThis.FindBuddyByObservedUser = FindBuddyByObservedUser; }
if (typeof window !== 'undefined') { window.FindBuddyByObservedUser = FindBuddyByObservedUser; }
if (typeof globalThis !== 'undefined') { globalThis.SearchStream = SearchStream; }
if (typeof window !== 'undefined') { window.SearchStream = SearchStream; }
if (typeof globalThis !== 'undefined') { globalThis.RefreshStream = RefreshStream; }
if (typeof window !== 'undefined') { window.RefreshStream = RefreshStream; }
