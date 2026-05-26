function RemoveScratchpad(lineNum){
    var scratchpad = GetCanvas("line-" + lineNum + "-scratchpad");
    if(scratchpad != null){
        window.clearInterval(scratchpad.redrawIntrtval);

        RemoveCanvas("line-" + lineNum + "-scratchpad");
        $("#line-"+ lineNum + "-scratchpad-container").empty();

        scratchpad = null;
    }
}
function getPicture(buddy, typestr, ignoreCache){
    var defaultImg = getDefaultProfileIconUrl();
    if(buddy == "profilePicture"){
        var dbImg = localDB.getItem("profilePicture");
        if(dbImg == null){
            return defaultImg;
        }
        else {
            return dbImg;
        }
    }

    typestr = (typestr)? typestr : "extension";
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null){
        return defaultImg
    }
    if(ignoreCache != true && buddyObj.imageObjectURL != ""){
        return buddyObj.imageObjectURL;
    }
    var dbImg = localDB.getItem("img-"+ buddy +"-"+ typestr);
    if(dbImg == null){
        buddyObj.imageObjectURL = defaultImg
        return buddyObj.imageObjectURL
    }
    else {
        buddyObj.imageObjectURL = URL.createObjectURL(base64toBlob(dbImg, 'image/webp'));
        return buddyObj.imageObjectURL;
    }
}
function GetCanvas(canvasId){
    for(var c = 0; c < CanvasCollection.length; c++){
        try {
            if(CanvasCollection[c].id == canvasId) return CanvasCollection[c];
        } catch(e) {
            console.warn("CanvasCollection.id not available");
        }
    }
    return null;
}
function RemoveCanvas(canvasId){
    for(var c = 0; c < CanvasCollection.length; c++){
        try{
            if(CanvasCollection[c].id == canvasId) {
                console.log("Found Old Canvas, Disposing...");

                CanvasCollection[c].clear()
                CanvasCollection[c].dispose();

                CanvasCollection[c].id = "--deleted--";

                console.log("CanvasCollection.splice("+ c +", 1)");
                CanvasCollection.splice(c, 1);
                break;
            }
        }
        catch(e){ }
    }
    console.log("There are "+ CanvasCollection.length +" canvas now.");
}
var ImageEditor_Select = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null) {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        return true;
    }
    return false;
}
var ImageEditor_FreedrawPen = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null) {
        canvas.freeDrawingBrush.color = canvas.PenColour;
        canvas.freeDrawingBrush.width = canvas.PenWidth;
        canvas.ToolSelected = "Draw";
        canvas.isDrawingMode = true;
        console.log(canvas)
        return true;
    }
    return false;
}
var ImageEditor_FreedrawPaint = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null) {
        canvas.freeDrawingBrush.color = canvas.PaintColour;
        canvas.freeDrawingBrush.width = canvas.PaintWidth;
        canvas.ToolSelected = "Paint";
        canvas.isDrawingMode = true;
        return true;
    }
    return false;
}
var ImageEditor_Pan = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "Pan";
        canvas.isDrawingMode = false;
        return true;
    }
    return false;
}
var ImageEditor_ResetZoom = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.setZoom(1);
        canvas.setViewportTransform([1,0,0,1,0,0]);
        return true;
    }
    return false;
}
var ImageEditor_ZoomIn = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var zoom = canvas.getZoom();
        zoom = zoom + 0.5;
        if (zoom > 10) zoom = 10;
        if (zoom < 0.1) zoom = 0.1;

        var point = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
        var center = fabric.util.transformPoint(point, canvas.viewportTransform);

        canvas.zoomToPoint(point, zoom);

        return true;
    }
    return false;
}
var ImageEditor_ZoomOut = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var zoom = canvas.getZoom();
        zoom = zoom - 0.5;
        if (zoom > 10) zoom = 10;
        if (zoom < 0.1) zoom = 0.1;

        var point = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
        var center = fabric.util.transformPoint(point, canvas.viewportTransform);

        canvas.zoomToPoint(point, zoom);

        return true;
    }
    return false;
}
var ImageEditor_AddCircle = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var circle = new fabric.Circle({
            radius: 20, fill: canvas.FillColour
        })
        canvas.add(circle);
        canvas.centerObject(circle);
        canvas.setActiveObject(circle);
        return true;
    }
    return false;
}
var ImageEditor_AddRectangle = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var rectangle = new fabric.Rect({
            width: 40, height: 40, fill: canvas.FillColour
        })
        canvas.add(rectangle);
        canvas.centerObject(rectangle);
        canvas.setActiveObject(rectangle);
        return true;
    }
    return false;
}
var ImageEditor_AddTriangle = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var triangle = new fabric.Triangle({
            width: 40, height: 40, fill: canvas.FillColour
        })
        canvas.add(triangle);
        canvas.centerObject(triangle);
        canvas.setActiveObject(triangle);
        return true;
    }
    return false;
}
var ImageEditor_AddEmoji = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var text = new fabric.Text(String.fromCodePoint(0x1F642), { fontSize : 24 });
        canvas.add(text);
        canvas.centerObject(text);
        canvas.setActiveObject(text);
        return true;
    }
    return false;
}
var ImageEditor_AddText = function (buddy, textString){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        var text = new fabric.IText(textString, { fill: canvas.FillColour, fontFamily: 'arial', fontSize : 18 });
        canvas.add(text);
        canvas.centerObject(text);
        canvas.setActiveObject(text);
        return true;
    }
    return false;
}
var ImageEditor_Clear = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;

        var activeObjects = canvas.getActiveObjects();
        for (var i=0; i<activeObjects.length; i++){
            canvas.remove(activeObjects[i]);
        }
        canvas.discardActiveObject();

        return true;
    }
    return false;
}
var ImageEditor_ClearAll = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var savedBgImage = canvas.backgroundImage;

        canvas.ToolSelected = "none";
        canvas.isDrawingMode = false;
        canvas.clear();

        canvas.backgroundImage = savedBgImage;
        return true;
    }
    return false;
}
var ImageEditor_Cancel = function (buddy){
    console.log("Removing ImageEditor...");

    $("#contact-" + buddy + "-imagePastePreview").empty();
    RemoveCanvas("contact-" + buddy + "-imageCanvas");
    $("#contact-" + buddy + "-imagePastePreview").hide();
}
var ImageEditor_Send = function (buddy){
    var canvas = GetCanvas("contact-" + buddy + "-imageCanvas");
    if(canvas != null)
    {
        var imgData = canvas.toDataURL({ format: 'webp' });
        SendImageDataMessage(buddy, imgData);
        return true;
    }
    return false;
}
function FindSomething(buddy) {
    $("#contact-" + buddy + "-search").toggle();
    if($("#contact-" + buddy + "-search").is(":visible") == false){
        RefreshStream(FindBuddyByIdentity(buddy));
    }
    updateScroll(buddy);
}
function TogglePinned(buddy){
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;

    if(buddyObj.Pinned){
        console.log("Disable Pinned for", buddy);
        buddyObj.Pinned = false;
    }
    else {
        console.log("Enable Pinned for", buddy);
        buddyObj.Pinned = true;
    }
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null) {
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.Pinned = buddyObj.Pinned;
                return false;
            }
        });
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }
    UpdateBuddyList();
}
var allowDradAndDrop = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.RemoveScratchpad = RemoveScratchpad; }
if (typeof window !== 'undefined') { window.RemoveScratchpad = RemoveScratchpad; }
if (typeof globalThis !== 'undefined') { globalThis.getPicture = getPicture; }
if (typeof window !== 'undefined') { window.getPicture = getPicture; }
if (typeof globalThis !== 'undefined') { globalThis.GetCanvas = GetCanvas; }
if (typeof window !== 'undefined') { window.GetCanvas = GetCanvas; }
if (typeof globalThis !== 'undefined') { globalThis.RemoveCanvas = RemoveCanvas; }
if (typeof window !== 'undefined') { window.RemoveCanvas = RemoveCanvas; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_Select = ImageEditor_Select; }
if (typeof window !== 'undefined') { window.ImageEditor_Select = ImageEditor_Select; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_FreedrawPen = ImageEditor_FreedrawPen; }
if (typeof window !== 'undefined') { window.ImageEditor_FreedrawPen = ImageEditor_FreedrawPen; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_FreedrawPaint = ImageEditor_FreedrawPaint; }
if (typeof window !== 'undefined') { window.ImageEditor_FreedrawPaint = ImageEditor_FreedrawPaint; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_Pan = ImageEditor_Pan; }
if (typeof window !== 'undefined') { window.ImageEditor_Pan = ImageEditor_Pan; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_ResetZoom = ImageEditor_ResetZoom; }
if (typeof window !== 'undefined') { window.ImageEditor_ResetZoom = ImageEditor_ResetZoom; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_ZoomIn = ImageEditor_ZoomIn; }
if (typeof window !== 'undefined') { window.ImageEditor_ZoomIn = ImageEditor_ZoomIn; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_ZoomOut = ImageEditor_ZoomOut; }
if (typeof window !== 'undefined') { window.ImageEditor_ZoomOut = ImageEditor_ZoomOut; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_AddCircle = ImageEditor_AddCircle; }
if (typeof window !== 'undefined') { window.ImageEditor_AddCircle = ImageEditor_AddCircle; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_AddRectangle = ImageEditor_AddRectangle; }
if (typeof window !== 'undefined') { window.ImageEditor_AddRectangle = ImageEditor_AddRectangle; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_AddTriangle = ImageEditor_AddTriangle; }
if (typeof window !== 'undefined') { window.ImageEditor_AddTriangle = ImageEditor_AddTriangle; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_AddEmoji = ImageEditor_AddEmoji; }
if (typeof window !== 'undefined') { window.ImageEditor_AddEmoji = ImageEditor_AddEmoji; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_AddText = ImageEditor_AddText; }
if (typeof window !== 'undefined') { window.ImageEditor_AddText = ImageEditor_AddText; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_Clear = ImageEditor_Clear; }
if (typeof window !== 'undefined') { window.ImageEditor_Clear = ImageEditor_Clear; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_ClearAll = ImageEditor_ClearAll; }
if (typeof window !== 'undefined') { window.ImageEditor_ClearAll = ImageEditor_ClearAll; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_Cancel = ImageEditor_Cancel; }
if (typeof window !== 'undefined') { window.ImageEditor_Cancel = ImageEditor_Cancel; }
if (typeof globalThis !== 'undefined') { globalThis.ImageEditor_Send = ImageEditor_Send; }
if (typeof window !== 'undefined') { window.ImageEditor_Send = ImageEditor_Send; }
if (typeof globalThis !== 'undefined') { globalThis.FindSomething = FindSomething; }
if (typeof window !== 'undefined') { window.FindSomething = FindSomething; }
if (typeof globalThis !== 'undefined') { globalThis.TogglePinned = TogglePinned; }
if (typeof window !== 'undefined') { window.TogglePinned = TogglePinned; }
if (typeof globalThis !== 'undefined') { globalThis.allowDradAndDrop = allowDradAndDrop; }
if (typeof window !== 'undefined') { window.allowDradAndDrop = allowDradAndDrop; }
