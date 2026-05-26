function RedrawStage(lineNum, videoChanged){
    var  stage = $("#line-" + lineNum + "-VideoCall");
    var container = $("#line-" + lineNum + "-stage-container");
    var previewContainer = $("#line-"+  lineNum +"-preview-container");
    var videoContainer = $("#line-" + lineNum + "-remote-videos");

    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null) return;
    var session = lineObj.SipSession;
    if(session == null) return;

    var isVideoPinned = false;
    var pinnedVideoID = "";
    previewContainer.find('video').each(function(i, video) {
        $(video).hide();
    });
    previewContainer.css("width",  "");
    var videoCount = 0;
    videoContainer.find('video').each(function(i, video) {
        var thisRemoteVideoStream = video.srcObject;
        var videoTrack = thisRemoteVideoStream.getVideoTracks()[0];
        var videoTrackSettings = videoTrack.getSettings();
        var srcVideoWidth = (videoTrackSettings.width)? videoTrackSettings.width : video.videoWidth;
        var srcVideoHeight = (videoTrackSettings.height)? videoTrackSettings.height : video.videoHeight;

        if(thisRemoteVideoStream.mid) {
            thisRemoteVideoStream.channel = "unknown";
            thisRemoteVideoStream.CallerIdName = "";
            thisRemoteVideoStream.CallerIdNumber = "";
            thisRemoteVideoStream.isAdminMuted = false;
            thisRemoteVideoStream.isAdministrator = false;
            if(session && session.data && session.data.videoChannelNames){
                session.data.videoChannelNames.forEach(function(videoChannelName){
                    if(thisRemoteVideoStream.mid == videoChannelName.mid){
                        thisRemoteVideoStream.channel = videoChannelName.channel;
                    }
                });
            }
            if(session && session.data && session.data.ConfbridgeChannels){
                session.data.ConfbridgeChannels.forEach(function(ConfbridgeChannel){
                    if(ConfbridgeChannel.id == thisRemoteVideoStream.channel){
                        thisRemoteVideoStream.CallerIdName = ConfbridgeChannel.caller.name;
                        thisRemoteVideoStream.CallerIdNumber = ConfbridgeChannel.caller.number;
                        thisRemoteVideoStream.isAdminMuted = ConfbridgeChannel.muted;
                        thisRemoteVideoStream.isAdministrator = ConfbridgeChannel.admin;
                    }
                });
            }
        }
        if(videoChanged){
            $("#line-" + lineNum + "-preview-container").find('video').each(function(i, video) {
                if(video.id.indexOf("copy-") == 0){
                    video.remove();
                }
            });
        }
        $(video).parent().off("click");
        $(video).parent().css("width", "1px");
        $(video).parent().css("height", "1px");
        $(video).hide();
        $(video).parent().hide();
        if(lineObj.pinnedVideo && lineObj.pinnedVideo == thisRemoteVideoStream.trackID && videoTrack.readyState == "live" && srcVideoWidth > 10 && srcVideoHeight >= 10){
            isVideoPinned = true;
            pinnedVideoID = lineObj.pinnedVideo;
        }
        if(videoTrack.readyState == "live" && srcVideoWidth > 10 && srcVideoHeight >= 10) {
            videoCount ++;
            console.log("Display Video - ", videoTrack.readyState, "MID:", thisRemoteVideoStream.mid, "channel:", thisRemoteVideoStream.channel, "src width:", srcVideoWidth, "src height", srcVideoHeight);
        }
        else{
            console.log("Hide Video - ", videoTrack.readyState ,"MID:", thisRemoteVideoStream.mid);
        }


    });
    if(videoCount == 0) {
        previewContainer.css("width",  previewWidth +"px");
        previewContainer.find('video').each(function(i, video) {
            $(video).show();
        });
        return;
    }
    if(isVideoPinned) videoCount = 1;

    if(!videoContainer.outerWidth() > 0) return;
    if(!videoContainer.outerHeight() > 0) return;
    var Margin = 3;
    var videoRatio = 0.750;
    if(videoAspectRatio == "" || videoAspectRatio == "1.33") videoRatio = 0.750;
    if(videoAspectRatio == "1.77") videoRatio = 0.5625;
    if(videoAspectRatio == "1") videoRatio = 1;
    var stageWidth = videoContainer.outerWidth() - (Margin * 2);
    var stageHeight = videoContainer.outerHeight() - (Margin * 2);
    var previewWidth = previewContainer.outerWidth();
    var maxWidth = 0;
    let i = 1;
    while (i < 5000) {
        let w = StageArea(i, videoCount, stageWidth, stageHeight, Margin, videoRatio);
        if (w === false) {
            maxWidth =  i - 1;
            break;
        }
        i++;
    }
    maxWidth = maxWidth - (Margin * 2);
    videoContainer.find('video').each(function(i, video) {
        var thisRemoteVideoStream = video.srcObject;
        var videoTrack = thisRemoteVideoStream.getVideoTracks()[0];
        var videoTrackSettings = videoTrack.getSettings();
        var srcVideoWidth = (videoTrackSettings.width)? videoTrackSettings.width : video.videoWidth;
        var srcVideoHeight = (videoTrackSettings.height)? videoTrackSettings.height : video.videoHeight;

        var videoWidth = maxWidth;
        var videoHeight = maxWidth * videoRatio;
        if(isVideoPinned){
            if(pinnedVideoID == video.srcObject.trackID){
                $(video).parent().css("width", videoWidth+"px");
                $(video).parent().css("height", videoHeight+"px");
                $(video).show();
                $(video).parent().show();
                var unPinButton = $("<button />", {
                    class: "videoOverlayButtons",
                });
                unPinButton.html("<i class=\"fa fa-th-large\"></i>");
                unPinButton.on("click", function(){
                    UnPinVideo(lineNum, video);
                });
                $(video).parent().find(".Actions").empty();
                $(video).parent().find(".Actions").append(unPinButton);
            } else {
                if(videoTrack.readyState == "live" && srcVideoWidth > 10 && srcVideoHeight >= 10) {
                    if(videoChanged){
                        var videoEl = $("<video />", {
                            id: "copy-"+ thisRemoteVideoStream.id,
                            muted: true,
                            autoplay: true,
                            playsinline: true,
                            controls: false
                        });
                        var videoObj = videoEl.get(0);
                        videoObj.srcObject = thisRemoteVideoStream;
                        $("#line-" + lineNum + "-preview-container").append(videoEl);
                    }
                }
            }
        }
        else {
            if(videoTrack.readyState == "live" && srcVideoWidth > 10 && srcVideoHeight >= 10) {
                $(video).parent().css("width", videoWidth+"px");
                $(video).parent().css("height", videoHeight+"px");
                $(video).show();
                $(video).parent().show();
                var pinButton = $("<button />", {
                    class: "videoOverlayButtons",
                });
                pinButton.html("<i class=\"fa fa-thumb-tack\"></i>");
                pinButton.on("click", function(){
                    PinVideo(lineNum, video, video.srcObject.trackID);
                });
                $(video).parent().find(".Actions").empty();
                if(videoCount > 1){
                    $(video).parent().find(".Actions").append(pinButton);
                }

            }
        }
        var adminMuteIndicator = "";
        var administratorIndicator = "";
        if(thisRemoteVideoStream.isAdminMuted == true){
            adminMuteIndicator = "<i class=\"fa fa-microphone-slash\" style=\"color:red\"></i>&nbsp;"
        }
        if(thisRemoteVideoStream.isAdministrator == true){
            administratorIndicator = "<i class=\"fa fa-user\" style=\"color:orange\"></i>&nbsp;"
        }
        if(thisRemoteVideoStream.CallerIdName == ""){
            thisRemoteVideoStream.CallerIdName = FindBuddyByIdentity(session.data.buddyId).CallerIDName;
        }
        $(video).parent().find(".callerID").html(administratorIndicator + adminMuteIndicator + thisRemoteVideoStream.CallerIdName);


    });
    previewContainer.css("width",  previewWidth +"px");
    previewContainer.find('video').each(function(i, video) {
        $(video).show();
    });

}
function StageArea(Increment, Count, Width, Height, Margin, videoRatio) {
    let i = w = 0;
    let h = Increment * videoRatio + (Margin * 2);
    while (i < (Count)) {
        if ((w + Increment) > Width) {
            w = 0;
            h = h + (Increment * videoRatio) + (Margin * 2);
        }
        w = w + Increment + (Margin * 2);
        i++;
    }
    if (h > Height) return false;
    else return Increment;
}
function PinVideo(lineNum, videoEl, trackID){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null) return;

    console.log("Setting Pinned Video:", trackID);
    lineObj.pinnedVideo = trackID;
    videoEl.srcObject.isPinned = true;
    RedrawStage(lineNum, true);
}
function UnPinVideo(lineNum, videoEl){
    var lineObj = FindLineByNumber(lineNum);
    if(lineObj == null) return;

    console.log("Removing Pinned Video");
    lineObj.pinnedVideo = "";
    videoEl.srcObject.isPinned = false;
    RedrawStage(lineNum, true);
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.RedrawStage = RedrawStage; }
if (typeof window !== 'undefined') { window.RedrawStage = RedrawStage; }
if (typeof globalThis !== 'undefined') { globalThis.StageArea = StageArea; }
if (typeof window !== 'undefined') { window.StageArea = StageArea; }
if (typeof globalThis !== 'undefined') { globalThis.PinVideo = PinVideo; }
if (typeof window !== 'undefined') { window.PinVideo = PinVideo; }
if (typeof globalThis !== 'undefined') { globalThis.UnPinVideo = UnPinVideo; }
if (typeof window !== 'undefined') { window.UnPinVideo = UnPinVideo; }
