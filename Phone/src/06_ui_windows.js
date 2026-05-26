function UpdateUI(){
    var windowWidth = $(window).outerWidth()
    var windowHeight = $(window).outerHeight();
    var shellWidth = $("#Phone").outerWidth() || windowWidth;
    var useNarrowLayout = shellWidth < 920 || $("#Phone").hasClass("phoneFrame250");

    if(shellWidth > UiMaxWidth){
        $("#leftContentTable").css("border-left-width", "1px");
        if(selectedBuddy == null && selectedLine == null) {
            $("#leftContentTable").css("border-right-width", "1px");
        } else {
            $("#rightContent").css("border-right-width", "1px");
        }
    }
    else {
        $("#leftContentTable").css("border-left-width", "0px");
        if(selectedBuddy == null && selectedLine == null) {
            $("#leftContentTable").css("border-right-width", "0px");
        }
        else {
            $("#leftContentTable").css("border-right-width", "1px");
        }
        $("#rightContent").css("border-right-width", "0px");
    }

    if(useNarrowLayout){

        if(selectedBuddy == null & selectedLine == null) {
            $("#rightContent").hide();

            $("#leftContent").css("width", "100%");
            $("#leftContent").show();
        }
        else {
            $("#rightContent").css("margin-left", "0px");
            $("#rightContent").show();

            $("#leftContent").hide();

            if(selectedBuddy != null) updateScroll(selectedBuddy.identity);
        }
    }
    else {
        if(selectedBuddy == null & selectedLine == null) {
            $("#leftContent").css("width", "100%");
            $("#rightContent").css("margin-left", "0px");
            $("#leftContent").show();
            $("#rightContent").hide();
        }
        else{
            $("#leftContent").css("width", "320px");
            $("#rightContent").css("margin-left", "320px");
            $("#leftContent").show();
            $("#rightContent").show();

            if(selectedBuddy != null) updateScroll(selectedBuddy.identity);
        }
    }
    for(var l=0; l<Lines.length; l++){
        updateLineScroll(Lines[l].LineNumber);
        RedrawStage(Lines[l].LineNumber, false);
    }

    if(windowObj != null){
        var offsetTextHeight = windowObj.parent().outerHeight();
        var width = windowObj.parent().outerWidth();
        if(windowWidth <= width || windowHeight <= offsetTextHeight) {
            windowObj.dialog("option", "height", windowHeight - 4);
            windowObj.dialog("option", "width", windowWidth - (1+1+2+2) - 4);
            windowObj.parent().css('top', '2px');
            windowObj.parent().css('left', '2px');
        }
        else {
        }
    }
    if(alertObj != null){
        var width = 300;
        var offsetTextHeight = alertObj.parent().outerHeight();
        if(windowWidth <= width || windowHeight <= offsetTextHeight) {
            if(windowWidth <= width){
                alertObj.dialog("option", "width", windowWidth - (1+1+2+2));
                alertObj.parent().css('left', '0px');
                alertObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
            }
            if(windowHeight <= offsetTextHeight){
                alertObj.dialog("option", "height", windowHeight);
                alertObj.parent().css('left', windowWidth/2 - width/2 + 'px');
                alertObj.parent().css('top', '0px');
            }
        }
        else {
            alertObj.parent().css('left', windowWidth/2 - width/2 + 'px');
            alertObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
        }
    }
    if(confirmObj != null){
        var width = 300;
        var offsetTextHeight = confirmObj.parent().outerHeight();
        if(windowWidth <= width || windowHeight <= offsetTextHeight) {
            if(windowWidth <= width){
                confirmObj.dialog("option", "width", windowWidth - (1+1+2+2));
                confirmObj.parent().css('left', '0px');
                confirmObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
            }
            if(windowHeight <= offsetTextHeight){
                confirmObj.dialog("option", "height", windowHeight);
                confirmObj.parent().css('left', windowWidth/2 - width/2 + 'px');
                confirmObj.parent().css('top', '0px');
            }
        }
        else {
            confirmObj.parent().css('left', windowWidth/2 - width/2 + 'px');
            confirmObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
        }
    }
    if(promptObj != null){
        var width = 300;
        var offsetTextHeight = promptObj.parent().outerHeight();
        if(windowWidth <= width || windowHeight <= offsetTextHeight) {
            if(windowWidth <= width){
                promptObj.dialog("option", "width", windowWidth - (1+1+2+2));
                promptObj.parent().css('left', '0px');
                promptObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
            }
            if(windowHeight <= offsetTextHeight){
                promptObj.dialog("option", "height", windowHeight);
                promptObj.parent().css('left', windowWidth/2 - width/2 + 'px');
                promptObj.parent().css('top', '0px');
            }
        }
        else {
            promptObj.parent().css('left', windowWidth/2 - width/2 + 'px');
            promptObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
        }
    }
    HidePopup();
}
function AddSomeoneWindow(numberStr, nameStr){
    CloseUpSettings();

    $("#myContacts").hide();
    $("#searchArea").hide();
    $("#contactsTabHeader").hide();
    $(".mainTab").removeClass("activeTab");
    $("#actionArea").empty();

    var html = "";

    html += "<div border=0 class=\"UiWindowField contactFormPanel\">";
    html += "<div class=UiText>"+ lang.full_name +":</div>";
    html += "<div class=contactFormInputRow><input id=AddSomeone_Name class=UiInputText type=text placeholder='"+ lang.eg_full_name +"'></div>";
    html += "<div class=UiText>"+ lang.contact_number_1 +":</div>";
    html += "<div class=contactFormInputRow><input id=AddSomeone_Num1 class=UiInputText type=tel placeholder='"+ lang.eg_contact_number_1 +"'></div>";
    html += "<div class=contactFormInputRow><input type=checkbox id=AddSomeone_Dnd><label for=AddSomeone_Dnd>"+ lang.allow_calls_on_dnd +"</label></div>";
    html += "</div>";
    html += "<div class=UiWindowButtonBar id=ButtonBar></div>";

    $("#actionArea").html(html);

    var buttons = [];
    buttons.push({
        text: lang.add,
        action: function(){
            var name = $.trim($("#AddSomeone_Name").val());
            var number = SanitizePhoneSearch($("#AddSomeone_Num1").val());
            $("#AddSomeone_Num1").val(number);
            if(name == "" || number == "") return;

            if(profileUserID == null || profileUserID == "" || profileUserID == "null" || profileUserID == "undefined"){
                profileUserID = uID();
                localDB.setItem("profileUserID", profileUserID);
            }

            var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
            if(json == null) json = InitUserBuddies();

            var id = uID();
            var dateNow = utcDateNow();
            var allowDnd = $("#AddSomeone_Dnd").is(':checked');

            json.DataCollection.push({
                Type: "contact",
                LastActivity: dateNow,
                ExtensionNumber: "",
                MobileNumber: "",
                ContactNumber1: number,
                ContactNumber2: "",
                uID: null,
                cID: id,
                gID: null,
                jid: null,
                DisplayName: name,
                Description: "",
                Email: "",
                MemberCount: 0,
                EnableDuringDnd: allowDnd,
                Subscribe: false,
                SubscribeUser: null,
                AutoDelete: false
            });

            var buddyObj = new Buddy("contact", id, name, "", "", number, "", dateNow, "", "", null, allowDnd, false, null, false);
            AddBuddy(buddyObj, false, false, false, true);

            json.TotalRows = json.DataCollection.length;
            localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
            UpdateBuddyList();
            ShowContacts();
        }
    });
    buttons.push({
        text: lang.cancel,
        action: function(){
            ShowContacts();
        }
    });
    $.each(buttons, function(i,obj){
        var button = $('<button>'+ obj.text +'</button>').click(obj.action);
        button.addClass(i === 0 ? "configPrimaryButton" : "configSecondaryButton");
        $("#ButtonBar").append(button);
    });

    $("#actionArea").show();

    window.setTimeout(function(){
        if(nameStr) $("#AddSomeone_Name").val(nameStr);
        if(numberStr) $("#AddSomeone_Num1").val(SanitizePhoneSearch(numberStr));
        $("#AddSomeone_Name").focus();
    }, 0);
}
function CreateGroupWindow(){
}
function checkNotificationPromise() {
    try {
        Notification.requestPermission().then();
    }
    catch(e) {
        return false;
    }
    return true;
}
function HandleNotifyPermission(p){
    if(p == "granted") {
    }
    else {
        Alert(lang.alert_notification_permission, lang.permission, function(){
            console.log("Attempting to uncheck the checkbox...");
            $("#Settings_Notifications").prop("checked", false);
        });
    }
}
function EditBuddyWindow(buddy){

    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null){
        Alert(lang.alert_not_found, lang.error);
        return;
    }
    var buddyJson = {};
    var itemId = -1;
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    $.each(json.DataCollection, function (i, item) {
        if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
            buddyJson = item;
            itemId = i;
            return false;
        }
    });

    if(buddyJson == {}){
        Alert(lang.alert_not_found, lang.error);
        return;
    }
    if(UiCustomEditBuddy == true){
        if(typeof web_hook_on_edit_buddy !== 'undefined') {
            web_hook_on_edit_buddy(buddyJson);
        }
        return;
    }

    if(buddyJson.Type == "contact"){
        var contactHtml = "<div border=0 class='UiWindowField contactFormPanel'>";
        contactHtml += "<div class=UiText>"+ lang.full_name +":</div>";
        contactHtml += "<div class=contactFormInputRow><input id=AddSomeone_Name class=UiInputText type=text placeholder='"+ lang.eg_full_name +"' value='"+ ((buddyJson.DisplayName && buddyJson.DisplayName != "null" && buddyJson.DisplayName != "undefined")? buddyJson.DisplayName : "") +"'></div>";
        contactHtml += "<div class=UiText>"+ lang.contact_number_1 +":</div>";
        contactHtml += "<div class=contactFormInputRow><input id=AddSomeone_Num1 class=UiInputText type=tel placeholder='"+ lang.eg_contact_number_1 +"' value='"+ ((buddyJson.ContactNumber1 && buddyJson.ContactNumber1 != "null" && buddyJson.ContactNumber1 != "undefined")? buddyJson.ContactNumber1 : "") +"'></div>";
        contactHtml += "<div class=contactFormInputRow><input type=checkbox id=AddSomeone_Dnd "+ ((buddyJson.EnableDuringDnd == true)? "checked" : "" ) +"><label for=AddSomeone_Dnd>"+ lang.allow_calls_on_dnd +"</label></div>";
        contactHtml += "</div>";

        OpenWindow(contactHtml, lang.edit, 480, 420, false, true, lang.save, function(){
            var name = $.trim($("#AddSomeone_Name").val());
            var number = SanitizePhoneSearch($("#AddSomeone_Num1").val());
            $("#AddSomeone_Num1").val(number);
            if(name == "" || number == "") return;

            buddyJson.LastActivity = utcDateNow();
            buddyObj.lastActivity = buddyJson.LastActivity;
            buddyJson.DisplayName = name;
            buddyObj.CallerIDName = name;
            buddyJson.ContactNumber1 = number;
            buddyObj.ContactNumber1 = number;
            buddyJson.MobileNumber = "";
            buddyObj.MobileNumber = "";
            buddyJson.ContactNumber2 = "";
            buddyObj.ContactNumber2 = "";
            buddyJson.Description = "";
            buddyObj.Desc = "";
            buddyJson.Email = "";
            buddyObj.Email = "";
            buddyJson.EnableDuringDnd = $("#AddSomeone_Dnd").is(':checked');
            buddyObj.EnableDuringDnd = buddyJson.EnableDuringDnd;

            localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
            UpdateBuddyList();
            CloseWindow();
        }, lang.cancel, function(){
            CloseWindow();
        }, null, null);
        return;
    }

    var cropper;

    var html = "<div border=0 class='UiWindowField'>";

    html += "<div id=ImageCanvas style=\"width:150px; height:150px\"></div>";
    html += "<div style=\"float:left; margin-left:200px;\"><input id=fileUploader type=file></div>";
    html += "<div style=\"margin-top: 50px\"></div>";

    html += "<div class=UiText>"+ lang.full_name +":</div>";
    html += "<div><input id=AddSomeone_Name class=UiInputText type=text placeholder='"+ lang.eg_full_name +"' value='"+ ((buddyJson.DisplayName && buddyJson.DisplayName != "null" && buddyJson.DisplayName != "undefined")? buddyJson.DisplayName : "") +"'></div>";
    html += "<div><input type=checkbox id=AddSomeone_Dnd "+ ((buddyJson.EnableDuringDnd == true)? "checked" : "" ) +"><label for=AddSomeone_Dnd>Allow calls while on Do Not Disturb</label></div>";

    html += "<div class=UiText>"+ lang.title_description +":</div>";
    html += "<div><input id=AddSomeone_Desc class=UiInputText type=text placeholder='"+ lang.eg_general_manager +"' value='"+ ((buddyJson.Description && buddyJson.Description != "null" && buddyJson.Description != "undefined")? buddyJson.Description : "") +"'></div>";

    if(buddyJson.Type == "extension" || buddyJson.Type == "xmpp"){
        html += "<div class=UiText>"+ lang.extension_number +": </div>";
        html += "<div><input id=AddSomeone_Exten class=UiInputText type=text value="+ buddyJson.ExtensionNumber +"></div>";
        html += "<div><input type=checkbox id=AddSomeone_Subscribe "+ ((buddyJson.Subscribe == true)? "checked" : "" ) +"><label for=AddSomeone_Subscribe>Subscribe to Device State Notifications</label></div>";
        html += "<div id=RowSubscribe style=\"display:"+ ((buddyJson.Subscribe == true)? "unset" : "none" ) +";\">";
        html += "<div class=UiText style=\"margin-left:30px\">"+ lang.internal_subscribe_extension +":</div>";
        html += "<div style=\"margin-left:30px\"><input id=AddSomeone_SubscribeUser class=UiInputText type=text placeholder='"+ lang.eg_internal_subscribe_extension +"' value='"+ ((buddyJson.SubscribeUser && buddyJson.SubscribeUser != "null" && buddyJson.SubscribeUser != "undefined")? buddyJson.SubscribeUser : "") +"'></div>";
        html += "</div>";
    }
    else {
        html += "<input type=checkbox id=AddSomeone_Subscribe style=\"display:none\">";
    }
    html += "<div class=UiText>"+ lang.mobile_number +":</div>";
    html += "<div><input id=AddSomeone_Mobile class=UiInputText type=text placeholder='"+ lang.eg_mobile_number +"' value='"+ ((buddyJson.MobileNumber && buddyJson.MobileNumber != "null" && buddyJson.MobileNumber != "undefined")? buddyJson.MobileNumber : "") +"'></div>";

    html += "<div class=UiText>"+ lang.email +":</div>";
    html += "<div><input id=AddSomeone_Email class=UiInputText type=text placeholder='"+ lang.eg_email +"' value='"+ ((buddyJson.Email && buddyJson.Email != "null" && buddyJson.Email != "undefined")? buddyJson.Email : "") +"'></div>";

    html += "<div class=UiText>"+ lang.contact_number_1 +":</div>";
    html += "<div><input id=AddSomeone_Num1 class=UiInputText type=text placeholder='"+ lang.eg_contact_number_1 +"' value='"+((buddyJson.ContactNumber1 && buddyJson.ContactNumber1 != "null" && buddyJson.ContactNumber1 != "undefined")? buddyJson.ContactNumber1 : "") +"'></div>";

    html += "<div class=UiText>"+ lang.contact_number_2 +":</div>";
    html += "<div><input id=AddSomeone_Num2 class=UiInputText type=text placeholder='"+ lang.eg_contact_number_2 +"' value='"+ ((buddyJson.ContactNumber2 && buddyJson.ContactNumber2 != "null" && buddyJson.ContactNumber2 != "undefined")? buddyJson.ContactNumber2 : "") +"'></div>";

    html += "<div class=UiText>Auto Delete:</div>";
    html += "<div><input type=checkbox id=AddSomeone_AutoDelete "+ ((buddyJson.AutoDelete == true)? "checked" : "" ) +"><label for=AddSomeone_AutoDelete>"+ lang.yes +"</label></div>";
    html += "<div class=UiText><button onclick=\"RemoveBuddy('"+ buddyObj.identity +"')\" class=\"UiDeleteButton\"><i class=\"fa fa-trash\"></i> "+ lang.delete_buddy +"</button></div>";

    html += "</div>"

    OpenWindow(html, lang.edit, 480, 640, false, true, lang.save, function(){

        if($("#AddSomeone_Name").val() == "") return;
        if($("#AddSomeone_Subscribe").is(':checked')){
            if($("#AddSomeone_Exten").val() != "" && $("#AddSomeone_SubscribeUser").val() == ""){
                $("#AddSomeone_SubscribeUser").val($("#AddSomeone_Exten").val());
            }
        }

        buddyJson.LastActivity = utcDateNow();
        buddyObj.lastActivity = buddyJson.LastActivity;

        buddyJson.DisplayName = $("#AddSomeone_Name").val();
        buddyObj.CallerIDName = buddyJson.DisplayName;

        buddyJson.Description = $("#AddSomeone_Desc").val();
        buddyObj.Desc = buddyJson.Description;

        buddyJson.MobileNumber = $("#AddSomeone_Mobile").val();
        buddyObj.MobileNumber = buddyJson.MobileNumber;

        buddyJson.Email = $("#AddSomeone_Email").val();
        buddyObj.Email = buddyJson.Email;

        buddyJson.ContactNumber1 = $("#AddSomeone_Num1").val();
        buddyObj.ContactNumber1 = buddyJson.ContactNumber1;

        buddyJson.ContactNumber2 = $("#AddSomeone_Num2").val();
        buddyObj.ContactNumber2 = buddyJson.ContactNumber2;

        buddyJson.EnableDuringDnd = $("#AddSomeone_Dnd").is(':checked');
        buddyObj.EnableDuringDnd = buddyJson.EnableDuringDnd;

        buddyJson.AutoDelete = $("#AddSomeone_AutoDelete").is(':checked');
        buddyObj.AllowAutoDelete = buddyJson.AutoDelete;

        if(buddyJson.Type == "extension" || buddyJson.Type == "xmpp"){
            UnsubscribeBuddy(buddyObj);

            buddyJson.ExtensionNumber = $("#AddSomeone_Exten").val();
            buddyObj.ExtNo = buddyJson.ExtensionNumber;

            buddyJson.Subscribe = $("#AddSomeone_Subscribe").is(':checked');
            buddyObj.EnableSubscribe = buddyJson.Subscribe;

            if(buddyJson.Subscribe == true){
                var SubscribeUser = $("#AddSomeone_SubscribeUser").val();
                buddyJson.SubscribeUser = SubscribeUser;
                buddyObj.SubscribeUser = SubscribeUser;
                SubscribeBuddy(buddyObj);
            }
        }
        UpdateBuddyList();
        var constraints = {
            type: 'base64',
            size: 'viewport',
            format: 'webp',
            quality: 0.5,
            circle: false
        }
        $("#ImageCanvas").croppie('result', constraints).then(function(base64) {
            if(buddyJson.Type == "extension"){
                console.log("Saving image for extension buddy:", buddyJson.uID)
                localDB.setItem("img-"+ buddyJson.uID +"-extension", base64);
                $("#contact-"+ buddyJson.uID +"-picture").css("background-image", 'url('+ getPicture(buddyJson.uID, 'extension', true) +')');
                $("#contact-"+ buddyJson.uID +"-picture-main").css("background-image", 'url('+ getPicture(buddyJson.uID, 'extension', true) +')');
            }
            else if(buddyJson.Type == "contact") {
                console.log("Saving image for contact buddy:", buddyJson.cID)
                localDB.setItem("img-"+ buddyJson.cID +"-contact", base64);
                $("#contact-"+ buddyJson.cID +"-picture").css("background-image", 'url('+ getPicture(buddyJson.cID, 'contact', true) +')');
                $("#contact-"+ buddyJson.cID +"-picture-main").css("background-image", 'url('+ getPicture(buddyJson.cID, 'contact', true) +')');
            }
            else if(buddyJson.Type == "group") {
                console.log("Saving image for group buddy:", buddyJson.gID)
                localDB.setItem("img-"+ buddyJson.gID +"-group", base64);
                $("#contact-"+ buddyJson.gID +"-picture").css("background-image", 'url('+ getPicture(buddyJson.gID, 'group', true) +')');
                $("#contact-"+ buddyJson.gID +"-picture-main").css("background-image", 'url('+ getPicture(buddyJson.gID, 'group', true) +')');
            }
            UpdateBuddyList();
        });
        json.DataCollection[itemId] = buddyJson;
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));

        CloseWindow();
    }, lang.cancel, function(){
        CloseWindow();
    }, function(){
        cropper = $("#ImageCanvas").croppie({
            viewport: { width: 150, height: 150, type: 'circle' }
        });
        if(buddyJson.Type == "extension"){
            $("#ImageCanvas").croppie('bind', { url: getPicture(buddyJson.uID, "extension") }).then();


        }
        if(buddyJson.Type == "xmpp"){
            $("#ImageCanvas").croppie('bind', { url: getPicture(buddyJson.uID, "xmpp") }).then();

            $("#fileUploader").hide();
            $("#AddSomeone_Name").attr("disabled", true);
            $("#AddSomeone_Desc").attr("disabled", true);
            $("#AddSomeone_Mobile").attr("disabled", true);
            $("#AddSomeone_Email").attr("disabled", true);
            $("#AddSomeone_Num1").attr("disabled", true);
            $("#AddSomeone_Num2").attr("disabled", true);
        }
        else if(buddyJson.Type == "contact") {
            $("#ImageCanvas").croppie('bind', { url: getPicture(buddyJson.cID, "contact") }).then();
        }
        else if(buddyJson.Type == "group") {
            $("#ImageCanvas").croppie('bind', { url: getPicture(buddyJson.gID, "group") }).then();
        }

        $("#AddSomeone_Subscribe").change(function(){
            if($("#AddSomeone_Subscribe").is(':checked')){
                if($("#AddSomeone_Exten").val() != "" && $("#AddSomeone_SubscribeUser").val() == ""){
                    $("#AddSomeone_SubscribeUser").val($("#AddSomeone_Exten").val());
                }
                $("#RowSubscribe").show();
            } else {
                $("#RowSubscribe").hide();
            }
        });
        $("#fileUploader").change(function () {
            var filesArray = $(this).prop('files');

            if (filesArray.length == 1) {
                var uploadId = Math.floor(Math.random() * 1000000000);
                var fileObj = filesArray[0];
                var fileName = fileObj.name;
                var fileSize = fileObj.size;

                if (fileSize <= 52428800) {
                    console.log("Adding (" + uploadId + "): " + fileName + " of size: " + fileSize + "bytes");

                    var reader = new FileReader();
                    reader.Name = fileName;
                    reader.UploadId = uploadId;
                    reader.Size = fileSize;
                    reader.onload = function (event) {
                        $("#ImageCanvas").croppie('bind', {
                            url: event.target.result
                        });
                    }
                    reader.readAsDataURL(fileObj);
                }
                else {
                    Alert(lang.alert_file_size, lang.error);
                }
            }
            else {
                Alert(lang.alert_single_file, lang.error);
            }
        });
    });
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.UpdateUI = UpdateUI; }
if (typeof window !== 'undefined') { window.UpdateUI = UpdateUI; }
if (typeof globalThis !== 'undefined') { globalThis.AddSomeoneWindow = AddSomeoneWindow; }
if (typeof window !== 'undefined') { window.AddSomeoneWindow = AddSomeoneWindow; }
if (typeof globalThis !== 'undefined') { globalThis.CreateGroupWindow = CreateGroupWindow; }
if (typeof window !== 'undefined') { window.CreateGroupWindow = CreateGroupWindow; }
if (typeof globalThis !== 'undefined') { globalThis.checkNotificationPromise = checkNotificationPromise; }
if (typeof window !== 'undefined') { window.checkNotificationPromise = checkNotificationPromise; }
if (typeof globalThis !== 'undefined') { globalThis.HandleNotifyPermission = HandleNotifyPermission; }
if (typeof window !== 'undefined') { window.HandleNotifyPermission = HandleNotifyPermission; }
if (typeof globalThis !== 'undefined') { globalThis.EditBuddyWindow = EditBuddyWindow; }
if (typeof window !== 'undefined') { window.EditBuddyWindow = EditBuddyWindow; }
