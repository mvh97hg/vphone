function InitialiseStream(buddy){
    var template = { TotalRows:0, DataCollection:[] }
    localDB.setItem(buddy + "-stream", JSON.stringify(template));
    return JSON.parse(localDB.getItem(buddy + "-stream"));
}
function EnforceRecentRecordLimit(stream){
    if(stream == null || stream.DataCollection == null) return false;
    if(!MaxRecentRecords || MaxRecentRecords <= 0) return false;

    var cdrCount = 0;
    for(var i = 0; i < stream.DataCollection.length; i++){
        if(stream.DataCollection[i] && stream.DataCollection[i].ItemType == "CDR") cdrCount++;
    }
    if(cdrCount <= MaxRecentRecords) return false;

    var toRemove = cdrCount - MaxRecentRecords;
    var trimmed = [];

    for(var j = 0; j < stream.DataCollection.length; j++){
        var item = stream.DataCollection[j];
        if(item && item.ItemType == "CDR" && toRemove > 0){
            toRemove--;
            continue;
        }
        trimmed.push(item);
    }

    stream.DataCollection = trimmed;
    stream.TotalRows = stream.DataCollection.length;
    return true;
}
function AddCallMessage(buddy, session) {

    var currentStream = JSON.parse(localDB.getItem(buddy + "-stream"));
    if(currentStream == null) currentStream = InitialiseStream(buddy);

    var CallEnd = moment.utc();
    var callDuration = 0;
    var totalDuration = 0;
    var ringTime = 0;

    var CallStart = moment.utc(session.data.callstart.replace(" UTC", ""));
    var CallAnswer = null;
    if(session.data.startTime){
        CallAnswer = moment.utc(session.data.startTime);

        callDuration = moment.duration(CallEnd.diff(CallAnswer));
        ringTime = moment.duration(CallAnswer.diff(CallStart));
    }
    else {
        ringTime = moment.duration(CallEnd.diff(CallStart));
    }
    totalDuration = moment.duration(CallEnd.diff(CallStart));

    var srcId = "";
    var srcCallerID = "";
    var dstId = ""
    var dstCallerID = "";
    var srcDid = "";
    var dstDid = "";
    if(session.data.calldirection == "inbound") {
        srcId = buddy;
        dstId = profileUserID;
        srcCallerID = session.remoteIdentity.displayName;
        dstCallerID = profileName;
        srcDid = session.data.src || "";
        dstDid = SipUsername || profileUserID || "";
    } else if(session.data.calldirection == "outbound") {
        srcId = profileUserID;
        dstId = buddy;
        srcCallerID = profileName;
        dstCallerID = session.data.dst;
        srcDid = SipUsername || profileUserID || "";
        dstDid = session.data.dst || "";
    }

    var callDirection = session.data.calldirection;
    var withVideo = session.data.withvideo;
    var sessionId = session.id;
    var hangupBy = session.data.terminateby;

    var newMessageJson = {
        CdrId: uID(),
        ItemType: "CDR",
        ItemDate: CallStart.format("YYYY-MM-DD HH:mm:ss UTC"),
        CallAnswer: (CallAnswer)? CallAnswer.format("YYYY-MM-DD HH:mm:ss UTC") : null,
        CallEnd: CallEnd.format("YYYY-MM-DD HH:mm:ss UTC"),
        SrcUserId: srcId,
        Src: srcCallerID,
        SrcDid: srcDid,
        DstUserId: dstId,
        Dst: dstCallerID,
        DstDid: dstDid,
        RingTime: (ringTime != 0)? ringTime.asSeconds() : 0,
        Billsec: (callDuration != 0)? callDuration.asSeconds() : 0,
        TotalDuration: (totalDuration != 0)? totalDuration.asSeconds() : 0,
        ReasonCode: session.data.reasonCode,
        ReasonText: session.data.reasonText,
        WithVideo: withVideo,
        SessionId: sessionId,
        CallDirection: callDirection,
        Terminate: hangupBy,
        MessageData: null,
        Tags: [],
        Transfers: (session.data.transfer)? session.data.transfer : [],
        Mutes: (session.data.mute)? session.data.mute : [],
        Holds: (session.data.hold)? session.data.hold : [],
        Recordings: (session.data.recordings)? session.data.recordings : [],
        ConfCalls: (session.data.confcalls)? session.data.confcalls : [],
        ConfbridgeEvents: (session.data.ConfbridgeEvents)? session.data.ConfbridgeEvents : [],
        QOS: []
    }

    console.log("New CDR", newMessageJson);

    currentStream.DataCollection.push(newMessageJson);
    EnforceRecentRecordLimit(currentStream);
    currentStream.TotalRows = currentStream.DataCollection.length;
    localDB.setItem(buddy + "-stream", JSON.stringify(currentStream));

    UpdateBuddyActivity(buddy);
    if(MaxDataStoreDays && MaxDataStoreDays > 0){
        console.log("Cleaning up data: ", MaxDataStoreDays);
        RemoveBuddyMessageStream(FindBuddyByIdentity(buddy), MaxDataStoreDays);
    }

}
function SendImageDataMessage(buddy, ImgDataUrl) {
    return;
}
function updateLineScroll(lineNum) {
    RefreshLineActivity(lineNum);

    var element = $("#line-"+ lineNum +"-CallDetails").get(0);
    if(element) element.scrollTop = element.scrollHeight;
}
function updateScroll(buddy) {
    return;
}
function IncreaseMissedBadge(buddy) {
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;
    buddyObj.missed += 1;
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null) {
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.missed = item.missed +1;
                return false;
            }
        });
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }
    $("#contact-" + buddy + "-missed").text(buddyObj.missed);
    $("#contact-" + buddy + "-missed").show();
    if(typeof web_hook_on_missed_notify !== 'undefined') web_hook_on_missed_notify(buddyObj.missed);

    console.log("Set Missed badge for "+ buddyObj.CallerIDName +" to: "+ buddyObj.missed);
}
function UpdateBuddyActivity(buddy, lastAct){
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;
    if(lastAct){
        buddyObj.lastActivity = lastAct;
    }
    else {
        var timeStamp = utcDateNow();
        buddyObj.lastActivity = timeStamp;
    }
    console.log("Last Activity for "+  buddyObj.CallerIDName +" is now: "+ buddyObj.lastActivity);
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null) {
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.LastActivity = timeStamp;
                return false;
            }
        });
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }
    UpdateBuddyList();
}
function ClearMissedBadge(buddy) {
    var buddyObj = FindBuddyByIdentity(buddy);
    if(buddyObj == null) return;

    buddyObj.missed = 0;
    var json = JSON.parse(localDB.getItem(profileUserID + "-Buddies"));
    if(json != null) {
        $.each(json.DataCollection, function (i, item) {
            if(item.uID == buddy || item.cID == buddy || item.gID == buddy){
                item.missed = 0;
                return false;
            }
        });
        localDB.setItem(profileUserID + "-Buddies", JSON.stringify(json));
    }

    $("#contact-" + buddy + "-missed").text(buddyObj.missed);
    $("#contact-" + buddy + "-missed").hide(400);

    if(typeof web_hook_on_missed_notify !== 'undefined') web_hook_on_missed_notify(buddyObj.missed);
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.InitialiseStream = InitialiseStream; }
if (typeof window !== 'undefined') { window.InitialiseStream = InitialiseStream; }
if (typeof globalThis !== 'undefined') { globalThis.EnforceRecentRecordLimit = EnforceRecentRecordLimit; }
if (typeof window !== 'undefined') { window.EnforceRecentRecordLimit = EnforceRecentRecordLimit; }
if (typeof globalThis !== 'undefined') { globalThis.AddCallMessage = AddCallMessage; }
if (typeof window !== 'undefined') { window.AddCallMessage = AddCallMessage; }
if (typeof globalThis !== 'undefined') { globalThis.SendImageDataMessage = SendImageDataMessage; }
if (typeof window !== 'undefined') { window.SendImageDataMessage = SendImageDataMessage; }
if (typeof globalThis !== 'undefined') { globalThis.updateLineScroll = updateLineScroll; }
if (typeof window !== 'undefined') { window.updateLineScroll = updateLineScroll; }
if (typeof globalThis !== 'undefined') { globalThis.updateScroll = updateScroll; }
if (typeof window !== 'undefined') { window.updateScroll = updateScroll; }
if (typeof globalThis !== 'undefined') { globalThis.IncreaseMissedBadge = IncreaseMissedBadge; }
if (typeof window !== 'undefined') { window.IncreaseMissedBadge = IncreaseMissedBadge; }
if (typeof globalThis !== 'undefined') { globalThis.UpdateBuddyActivity = UpdateBuddyActivity; }
if (typeof window !== 'undefined') { window.UpdateBuddyActivity = UpdateBuddyActivity; }
if (typeof globalThis !== 'undefined') { globalThis.ClearMissedBadge = ClearMissedBadge; }
if (typeof window !== 'undefined') { window.ClearMissedBadge = ClearMissedBadge; }
