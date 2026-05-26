function preventDefault(e){
    e.preventDefault();
    e.stopPropagation();
}
function OpenWindow(html, title, height, width, hideCloseButton, allowResize, button1_Text, button1_onClick, button2_Text, button2_onClick, DoOnLoad, OnClose) {
    console.log("Open Window: " + title);
    if(windowObj != null){
        windowObj.dialog("close");
        windowObj = null;
    }
    windowObj = $('<div></div>').html(html).dialog({
        autoOpen: false,
        title: title,
        modal: true,
        width: width,
        height: height,
        resizable: allowResize,
        classes: { "ui-dialog-content": "cleanScroller"},
        close: function(event, ui) {
            $(this).dialog("destroy");
            windowObj = null;
        }
    });
    var buttons = [];
    if(button1_Text && button1_onClick){
        buttons.push({
            text: button1_Text,
            click: function(){
                console.log("Button 1 ("+ button1_Text +") Clicked");
                button1_onClick();
            }
        });
    }
    if(button2_Text && button2_onClick){
        buttons.push({
            text: button2_Text,
            click: function(){
                console.log("Button 2 ("+ button2_Text +") Clicked");
                button2_onClick();
            }
        });
    }
    if(buttons.length >= 1) windowObj.dialog( "option", "buttons", buttons);

    if(OnClose) windowObj.on("dialogbeforeclose", function(event, ui) {
        return OnClose(this);
    });
    if(DoOnLoad) windowObj.on("dialogopen", function(event, ui) {
        DoOnLoad();
    });
    windowObj.dialog("open");
    if(!title || String(title).trim() === ""){
        windowObj.parent().addClass("noTitleBar");
    }

    var cancelText = (typeof lang !== "undefined" && lang && lang.cancel) ? lang.cancel : "Cancel";
    var hasCancelButton = (button1_Text == cancelText || button2_Text == cancelText);
    if (hideCloseButton || hasCancelButton) windowObj.dialog({ dialogClass: 'no-close' });
    UpdateUI();
    if(skipNextWindowAutoCenter !== true){
        var windowWidth = $(window).outerWidth()
        var windowHeight = $(window).outerHeight();
        var offsetTextHeight = windowObj.parent().outerHeight();
        var offsetWidth = windowObj.parent().outerWidth();

        windowObj.parent().css('left', windowWidth/2 - offsetWidth/2 + 'px');
        windowObj.parent().css('top', windowHeight/2 - offsetTextHeight/2 + 'px');
    } else {
        skipNextWindowAutoCenter = false;
    }

}
function CloseWindow(all) {
    console.log("Call to close any open window");

    if(windowObj != null){
        windowObj.dialog("close");
        windowObj = null;
    }
    if(all == true){
        if (confirmObj != null) {
            confirmObj.dialog("close");
            confirmObj = null;
        }
        if (promptObj != null) {
            promptObj.dialog("close");
            promptObj = null;
        }
        if (alertObj != null) {
            alertObj.dialog("close");
            alertObj = null;
        }
    }
}
function Alert(messageStr, TitleStr, onOk) {
    if (confirmObj != null) {
        confirmObj.dialog("close");
        confirmObj = null;
    }
    if (promptObj != null) {
        promptObj.dialog("close");
        promptObj = null;
    }
    if (alertObj != null) {
        console.error("Alert not null, while Alert called: " + TitleStr + ", saying:" + messageStr);
        return;
    }
    else {
        console.log("Alert called with Title: " + TitleStr + ", saying: " + messageStr);
    }

    var html = "<div class=NoSelect>";
    html += "<div class=UiText style=\"padding: 10px\" id=AllertMessageText>" + messageStr + "</div>";
    html += "</div>"

    alertObj = $('<div>').html(html).dialog({
        autoOpen: false,
        title: TitleStr,
        modal: true,
        width: 300,
        height: "auto",
        resizable: false,
        closeOnEscape : false,
        close: function(event, ui) {
            $(this).dialog("destroy");
            alertObj = null;
        }
    });

    var buttons = [];
    buttons.push({
        text: lang.ok,
        click: function(){
            console.log("Alert OK clicked");
            if (onOk) onOk();
            $(this).dialog("close");
            alertObj = null;
        }
    });
    alertObj.dialog( "option", "buttons", buttons);
    alertObj.dialog("open");

    alertObj.dialog({ dialogClass: 'no-close' });
     UpdateUI();

}
function Confirm(messageStr, TitleStr, onOk, onCancel) {
    if (alertObj != null) {
        alertObj.dialog("close");
        alertObj = null;
    }
    if (promptObj != null) {
        promptObj.dialog("close");
        promptObj = null;
    }
    if (confirmObj != null) {
        console.error("Confirm not null, while Confrim called with Title: " + TitleStr + ", saying: " + messageStr);
        return;
    }
    else {
        console.log("Confirm called with Title: " + TitleStr + ", saying: " + messageStr);
    }

    var html = "<div class=NoSelect>";
    html += "<div class=UiText style=\"padding: 10px\" id=ConfrimMessageText>" + messageStr + "</div>";
    html += "</div>";

    confirmObj = $('<div>').html(html).dialog({
        autoOpen: false,
        title: TitleStr,
        modal: true,
        width: 300,
        height: "auto",
        resizable: false,
        closeOnEscape : false,
        close: function(event, ui) {
            $(this).dialog("destroy");
            confirmObj = null;
        }
    });

    var buttons = [];
    buttons.push({
        text: lang.ok,
        click: function(){
            console.log("Confrim OK clicked");
            if (onOk) onOk();
            $(this).dialog("close");
            confirmObj = null;
        }
    });
    buttons.push({
        text: lang.cancel,
        click: function(){
            console.log("Confirm Cancel clicked");
            if (onCancel) onCancel();
            $(this).dialog("close");
            confirmObj = null;
        }
    });

    confirmObj.dialog( "option", "buttons", buttons);
    confirmObj.dialog("open");

    confirmObj.dialog({ dialogClass: 'no-close' });
    UpdateUI();
}
function Prompt(messageStr, TitleStr, FieldText, defaultValue, dataType, placeholderText, onOk, onCancel) {
    if (alertObj != null) {
        alertObj.dialog("close");
        alertObj = null;
    }
    if (confirmObj != null) {
        confirmObj.dialog("close");
        confirmObj = null;
    }
    if (promptObj != null) {
        console.error("Prompt not null, while Prompt called with Title: " + TitleStr + ", saying: " + messageStr);
        return;
    }
    else {
        console.log("Prompt called with Title: " + TitleStr + ", saying: " + messageStr);
    }

    var html = "<div class=NoSelect>";
    html += "<div class=UiText style=\"padding: 10px\" id=PromptMessageText>";
    html += messageStr;
    html += "<div style=\"margin-top:10px\">" + FieldText + " : </div>";
    html += "<div style=\"margin-top:5px\"><INPUT id=PromptValueField type=" + dataType + " value=\"" + defaultValue + "\" placeholder=\"" + placeholderText + "\" style=\"width:98%\"></div>"
    html += "</div>";
    html += "</div>";

    promptObj = $('<div>').html(html).dialog({
        autoOpen: false,
        title: TitleStr,
        modal: true,
        width: 300,
        height: "auto",
        resizable: false,
        closeOnEscape : false,
        close: function(event, ui) {
            $(this).dialog("destroy");
            promptObj = null;
        }
    });

    var buttons = [];
    buttons.push({
        text: lang.ok,
        click: function(){
            console.log("Prompt OK clicked, with value: " + $("#PromptValueField").val());
            if (onOk) onOk($("#PromptValueField").val());
            $(this).dialog("close");
            promptObj = null;
        }
    });
    buttons.push({
        text: lang.cancel,
        click: function(){
            console.log("Prompt Cancel clicked");
            if (onCancel) onCancel();
            $(this).dialog("close");
            promptObj = null;
        }
    });
    promptObj.dialog( "option", "buttons", buttons);
    promptObj.dialog("open");

    promptObj.dialog({ dialogClass: 'no-close' });
    UpdateUI();
}
function PopupMenu(obj, menu){
    console.log("Show Popup Menu");

    function bindPopupDismissHandlers(){
        $(document).off(".popupMenuGlobal");
        $(window).off(".popupMenuGlobal");

        $(document).on("mousedown.popupMenuGlobal touchstart.popupMenuGlobal", function(event){
            if(menuObj == null) return;
            var target = event.target;
            if($(target).closest(".popupMenuList").length > 0) return;
            if(popupAnchorEl && (target === popupAnchorEl || $.contains(popupAnchorEl, target))) return;
            HidePopup();
        });
        $(document).on("keydown.popupMenuGlobal", function(event){
            if(menuObj == null) return;
            if(event.key === "Escape" || event.keyCode === 27){
                event.preventDefault();
                HidePopup();
            }
        });
        $(window).on("resize.popupMenuGlobal scroll.popupMenuGlobal", function(){
            if(menuObj != null) HidePopup();
        });
    }
    if(menuObj != null){
        menuObj.menu("destroy");
        menuObj.empty();
        menuObj.remove();
        menuObj = null;
    }

    var anchorEl = $(obj).get(0);
    if(!anchorEl) return;
    popupAnchorEl = anchorEl;
    var anchorRect = anchorEl.getBoundingClientRect();

    menuObj = $("<ul></ul>");
    if(menu && menu.items){
        $.each(menu.items, function(i, item){
            var header = (item.isHeader == true)? " class=\"ui-widget-header\"" : "";
            var disabled = (item.isDisabled == true)? " class=\"ui-state-disabled\"" : "";
            if(item.icon != null){
                menuObj.append("<li value=\""+ item.value +"\" "+ header +" "+ disabled +"><div><span class=\""+ item.icon +" ui-icon\"></span>"+ item.text +"</div></li>");
            }
            else {
                menuObj.append("<li value=\""+ item.value +"\" "+ header +" "+ disabled +"><div>"+ item.text +"</div></li>");
            }
        });
    }
    menuObj.append("<li><div style=\"text-align:center; padding-right: 2em\">"+ lang.cancel +"</div></li>");
    menuObj.appendTo(document.body);
    menuObj.addClass("popupMenuList");
    menuObj.menu({});
    menuObj.on("menuselect.popupInternal", function(event, ui){
        var id = ui.item.attr("value");
        if(!id){
            HidePopup();
            return false;
        }
    });
    if(menu && menu.selectEvent){
        menuObj.on("menuselect", menu.selectEvent);
    }
    if(menu && menu.createEvent){
        menuObj.on("menucreate", menu.createEvent);
    }
    menuObj.on('blur',function(){
        HidePopup();
    });
    if(menu && menu.autoFocus == true) menuObj.focus();
    var containerRect = null;
    var leftPane = $("#leftContent").get(0);
    if(leftPane) containerRect = leftPane.getBoundingClientRect();
    if(!containerRect){
        var phonePane = $("#Phone").get(0);
        if(phonePane) containerRect = phonePane.getBoundingClientRect();
    }
    if(!containerRect){
        containerRect = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
    }

    menuObj.css({ position: "fixed", left: "0px", top: "0px", maxWidth: Math.max(180, Math.floor(containerRect.right - containerRect.left - 16)) + "px" });

    var menuWidth = menuObj.outerWidth();
    var menuHeight = menuObj.outerHeight();

    var paneMinLeft = Math.max(8, Math.floor(containerRect.left + 8));
    var paneMaxLeft = Math.min(Math.floor(window.innerWidth - menuWidth - 8), Math.floor(containerRect.right - menuWidth - 8));
    if(paneMaxLeft < paneMinLeft) paneMaxLeft = paneMinLeft;
    var left = Math.floor(anchorRect.right - menuWidth);
    if(left < paneMinLeft) left = paneMinLeft;
    if(left > paneMaxLeft) left = paneMaxLeft;

    var paneMinTop = Math.max(8, Math.floor(containerRect.top + 8));
    var paneMaxTop = Math.min(Math.floor(window.innerHeight - menuHeight - 8), Math.floor(containerRect.bottom - menuHeight - 8));
    if(paneMaxTop < paneMinTop) paneMaxTop = paneMinTop;

    var top = Math.floor(anchorRect.bottom + 4);
    if(top > paneMaxTop){
        top = Math.floor(anchorRect.top - menuHeight - 4);
    }
    if(top < paneMinTop) top = paneMinTop;
    if(top > paneMaxTop) top = paneMaxTop;

    menuObj.css({ left: left + "px", top: top + "px" });
    bindPopupDismissHandlers();

}

function HidePopup(timeout){
    function cleanupPopupState(){
        popupAnchorEl = null;
        $(document).off(".popupMenuGlobal");
        $(window).off(".popupMenuGlobal");
    }
    if(timeout){
        window.setTimeout(function(){
            if(menuObj != null){
                menuObj.menu("destroy");
                try{
                    menuObj.empty();
                }
                catch(e){}
                try{
                    menuObj.remove();
                }
                catch(e){}
                menuObj = null;
            }
            cleanupPopupState();
        }, timeout);
    } else {
        if(menuObj != null){
            menuObj.menu("destroy");
            try{
                menuObj.empty();
            }
            catch(e){}
            try{
                menuObj.remove();
            }
            catch(e){}
            menuObj = null;
        }
        cleanupPopupState();
    }
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.preventDefault = preventDefault; }
if (typeof window !== 'undefined') { window.preventDefault = preventDefault; }
if (typeof globalThis !== 'undefined') { globalThis.OpenWindow = OpenWindow; }
if (typeof window !== 'undefined') { window.OpenWindow = OpenWindow; }
if (typeof globalThis !== 'undefined') { globalThis.CloseWindow = CloseWindow; }
if (typeof window !== 'undefined') { window.CloseWindow = CloseWindow; }
if (typeof globalThis !== 'undefined') { globalThis.Alert = Alert; }
if (typeof window !== 'undefined') { window.Alert = Alert; }
if (typeof globalThis !== 'undefined') { globalThis.Confirm = Confirm; }
if (typeof window !== 'undefined') { window.Confirm = Confirm; }
if (typeof globalThis !== 'undefined') { globalThis.Prompt = Prompt; }
if (typeof window !== 'undefined') { window.Prompt = Prompt; }
if (typeof globalThis !== 'undefined') { globalThis.PopupMenu = PopupMenu; }
if (typeof window !== 'undefined') { window.PopupMenu = PopupMenu; }
if (typeof globalThis !== 'undefined') { globalThis.HidePopup = HidePopup; }
if (typeof window !== 'undefined') { window.HidePopup = HidePopup; }
