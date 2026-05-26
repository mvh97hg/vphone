function PresentCamera(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", true);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", false);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", false);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", false);

    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").show();
    $("#line-"+ lineNum + "-remote-videos").show();
    RedrawStage(lineNum, true);

    switchVideoSource(lineNum, session.data.VideoSourceDevice);
}
function PresentScreen(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", false);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", false);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", true);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", false);

    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").show();
    $("#line-"+ lineNum + "-remote-videos").show();

    ShareScreen(lineNum);
}
function PresentScratchpad(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", false);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", true);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", false);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", false);

    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").show();
    $("#line-"+ lineNum + "-remote-videos").hide();

    SendCanvas(lineNum);
}
function PresentVideo(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    var html = "<div class=\"UiWindowField\"><input type=file  accept=\"video/*\" id=SelectVideoToSend></div>";
    OpenWindow(html, lang.select_video, 150, 360, false, false, null, null, lang.cancel, function(){
        CloseWindow();
    }, function(){
        $("#SelectVideoToSend").on('change', function(event){
            var input = event.target;
            if(input.files.length >= 1){
                CloseWindow();
                SendVideo(lineNum, URL.createObjectURL(input.files[0]));
            }
            else {
                console.warn("Please Select a file to present.");
            }
        });
    }, null);
}
function PresentBlank(lineNum){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null || lineObj.SipSession == null){
        console.warn("Line or Session is Null.");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-"+ lineNum +"-src-camera").prop("disabled", false);
    $("#line-"+ lineNum +"-src-canvas").prop("disabled", false);
    $("#line-"+ lineNum +"-src-desktop").prop("disabled", false);
    $("#line-"+ lineNum +"-src-video").prop("disabled", false);
    $("#line-"+ lineNum +"-src-blank").prop("disabled", true);

    $("#line-"+ lineNum + "-scratchpad-container").hide();
    RemoveScratchpad(lineNum);
    $("#line-"+ lineNum +"-sharevideo").hide();
    $("#line-"+ lineNum +"-sharevideo").get(0).pause();
    $("#line-"+ lineNum +"-sharevideo").get(0).removeAttribute('src');
    $("#line-"+ lineNum +"-sharevideo").get(0).load();
    window.clearInterval(session.data.videoResampleInterval);

    $("#line-"+ lineNum + "-localVideo").hide();
    $("#line-"+ lineNum + "-remote-videos").show();

    DisableVideoStream(lineNum);
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.PresentCamera = PresentCamera; }
if (typeof window !== 'undefined') { window.PresentCamera = PresentCamera; }
if (typeof globalThis !== 'undefined') { globalThis.PresentScreen = PresentScreen; }
if (typeof window !== 'undefined') { window.PresentScreen = PresentScreen; }
if (typeof globalThis !== 'undefined') { globalThis.PresentScratchpad = PresentScratchpad; }
if (typeof window !== 'undefined') { window.PresentScratchpad = PresentScratchpad; }
if (typeof globalThis !== 'undefined') { globalThis.PresentVideo = PresentVideo; }
if (typeof window !== 'undefined') { window.PresentVideo = PresentVideo; }
if (typeof globalThis !== 'undefined') { globalThis.PresentBlank = PresentBlank; }
if (typeof window !== 'undefined') { window.PresentBlank = PresentBlank; }
