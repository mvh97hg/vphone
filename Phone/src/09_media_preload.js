function ResolveEmbeddedMediaUrl(fileName, fallbackUrl){
    if(embeddedMediaMap && embeddedMediaMap[fileName]){
        return embeddedMediaMap[fileName];
    }
    return fallbackUrl;
}
function warmAudioCache(item){
    if(!item || !item.url) return;
    if(String(item.url).indexOf("data:") === 0) return;
    try{
        if(item.preloadAudio) return;
        var warmAudio = new Audio(item.url);
        warmAudio.preload = "auto";
        warmAudio.load();
        item.preloadAudio = warmAudio;
    } catch(e){
    }
}

function sanitizeMediaConfigValue(value){
    if(value === undefined || value === null) return "";
    return String(value).trim();
}
function getFirstDefinedMediaConfigValue(config, keys){
    for(var i = 0; i < keys.length; i++){
        if(config[keys[i]] !== undefined){
            return sanitizeMediaConfigValue(config[keys[i]]);
        }
    }
    return "";
}
function normalizeMediaConfig(config){
    var normalized = {
        ringtone: "",
        ringtoneByLanguage: {},
        holdMusic: "",
        busy: "",
        callWaiting: "",
        congestion: "",
        earlyMedia: ""
    };
    if(!config || typeof config !== "object") return normalized;
    normalized.ringtone = getFirstDefinedMediaConfigValue(config, ["ringtone", "Ringtone"]);
    normalized.holdMusic = getFirstDefinedMediaConfigValue(config, ["holdMusic", "HoldMusic"]);
    normalized.busy = getFirstDefinedMediaConfigValue(config, ["busy", "Busy"]);
    normalized.callWaiting = getFirstDefinedMediaConfigValue(config, ["callWaiting", "CallWaiting"]);
    normalized.congestion = getFirstDefinedMediaConfigValue(config, ["congestion", "Congestion"]);
    normalized.earlyMedia = getFirstDefinedMediaConfigValue(config, ["earlyMedia", "EarlyMedia", "ringbackTone", "RingbackTone"]);
    if(config.ringtoneByLanguage && typeof config.ringtoneByLanguage === "object") normalized.ringtoneByLanguage = config.ringtoneByLanguage;
    if(config.RingtoneByLanguage && typeof config.RingtoneByLanguage === "object") normalized.ringtoneByLanguage = config.RingtoneByLanguage;
    return normalized;
}
function getStoredMediaConfig(){
    return {
        ringtone: sanitizeMediaConfigValue(getDbItem(mediaConfigStorageKeys.ringtone, ""))
    };
}
function getEffectiveMediaConfig(){
    var stored = getStoredMediaConfig();
    var locale = (String(Language || "auto") === "auto")
        ? String((navigator.language || navigator.userLanguage || "en")).toLowerCase()
        : String(Language || "en").toLowerCase();
    var shortLocale = locale.split("-")[0];
    var map = (runtimeMediaConfig.ringtoneByLanguage && typeof runtimeMediaConfig.ringtoneByLanguage === "object")
        ? runtimeMediaConfig.ringtoneByLanguage
        : {};
    var mappedRingtone = sanitizeMediaConfigValue(map[locale] || map[shortLocale] || "");
    return {
        ringtone: stored.ringtone || mappedRingtone || runtimeMediaConfig.ringtone || defaultMediaConfig.ringtone,
        holdMusic: runtimeMediaConfig.holdMusic || defaultMediaConfig.holdMusic,
        busy: runtimeMediaConfig.busy || defaultMediaConfig.busy,
        callWaiting: runtimeMediaConfig.callWaiting || defaultMediaConfig.callWaiting,
        congestion: runtimeMediaConfig.congestion || defaultMediaConfig.congestion,
        earlyMedia: runtimeMediaConfig.earlyMedia || defaultMediaConfig.earlyMedia
    };
}
function resolveMediaAssetUrl(configValue, fallbackFileName, fallbackUrl){
    var value = sanitizeMediaConfigValue(configValue);
    if(value === "") return ResolveEmbeddedMediaUrl(fallbackFileName, fallbackUrl);
    if(value.indexOf("data:") === 0) return value;
    if(value.indexOf("http://") === 0 || value.indexOf("https://") === 0 || value.indexOf("file://") === 0) return value;
    if(value.indexOf("/") > -1 || value.indexOf("\\") > -1){
        return value;
    }
    return ResolveEmbeddedMediaUrl(value, hostingPrefix + "media/" + value);
}
function arrayBufferToBase64(arrayBuffer){
    var bytes = new Uint8Array(arrayBuffer);
    var binary = "";
    for(var i = 0; i < bytes.byteLength; i++){
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
function audioBufferToWavDataUri(audioBuffer){
    var numberOfChannels = audioBuffer.numberOfChannels;
    var sampleRate = audioBuffer.sampleRate;
    var format = 1;
    var bitDepth = 16;
    var samples = audioBuffer.length;
    var blockAlign = numberOfChannels * bitDepth / 8;
    var byteRate = sampleRate * blockAlign;
    var dataSize = samples * blockAlign;
    var buffer = new ArrayBuffer(44 + dataSize);
    var view = new DataView(buffer);
    var offset = 0;
    function writeString(str){
        for(var i = 0; i < str.length; i++) view.setUint8(offset++, str.charCodeAt(i));
    }
    function writeUint16(value){
        view.setUint16(offset, value, true);
        offset += 2;
    }
    function writeUint32(value){
        view.setUint32(offset, value, true);
        offset += 4;
    }
    writeString("RIFF");
    writeUint32(36 + dataSize);
    writeString("WAVE");
    writeString("fmt ");
    writeUint32(16);
    writeUint16(format);
    writeUint16(numberOfChannels);
    writeUint32(sampleRate);
    writeUint32(byteRate);
    writeUint16(blockAlign);
    writeUint16(bitDepth);
    writeString("data");
    writeUint32(dataSize);

    var channels = [];
    for(var c = 0; c < numberOfChannels; c++){
        channels.push(audioBuffer.getChannelData(c));
    }
    var sampleIndex = 0;
    while(sampleIndex < samples){
        for(var channel = 0; channel < numberOfChannels; channel++){
            var sample = Math.max(-1, Math.min(1, channels[channel][sampleIndex]));
            var intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
            view.setInt16(offset, intSample, true);
            offset += 2;
        }
        sampleIndex++;
    }
    return "data:audio/wav;base64," + arrayBufferToBase64(buffer);
}
async function convertRingtoneFileToDataUri(file){
    if(!file) throw new Error("No file selected");
    if(file.size > mediaUploadLimits.maxBytes){
        throw new Error("Ringtone file is too large. Max size is 2MB.");
    }
    var lowerName = String(file.name || "").toLowerCase();
    var mime = String(file.type || "").toLowerCase();
    var isMp3 = mime.indexOf("mpeg") > -1 || lowerName.endsWith(".mp3");
    if(isMp3){
        return await new Promise(function(resolve, reject){
            var reader = new FileReader();
            reader.onload = function(){ resolve(String(reader.result || "")); };
            reader.onerror = function(){ reject(new Error("Cannot read ringtone file.")); };
            reader.readAsDataURL(file);
        });
    }
    var audioData = await new Promise(function(resolve, reject){
        var reader = new FileReader();
        reader.onload = function(){ resolve(reader.result); };
        reader.onerror = function(){ reject(new Error("Cannot read ringtone file.")); };
        reader.readAsArrayBuffer(file);
    });
    var context = new (window.AudioContext || window.webkitAudioContext)();
    try{
        var decoded = await context.decodeAudioData(audioData.slice(0));
        return audioBufferToWavDataUri(decoded);
    } finally {
        if(context && typeof context.close === "function"){
            context.close();
        }
    }
}
function setRuntimeMediaConfigFromOptions(options){
    var mediaFromObject = normalizeMediaConfig((options && (options.MediaConfig || options.mediaConfig)) ? (options.MediaConfig || options.mediaConfig) : {});
    if(options && options.Ringtone !== undefined) mediaFromObject.ringtone = sanitizeMediaConfigValue(options.Ringtone);
    if(options && options.RingtoneUrl !== undefined) mediaFromObject.ringtone = sanitizeMediaConfigValue(options.RingtoneUrl);
    if(options && options.RingtoneByLanguage && typeof options.RingtoneByLanguage === "object") mediaFromObject.ringtoneByLanguage = options.RingtoneByLanguage;
    runtimeMediaConfig = mediaFromObject;
}

function PreloadAudioFiles(){
    var mediaConfig = getEffectiveMediaConfig();
    audioBlobs.Ringtone = { file : "Ringtone.mp3", url : resolveMediaAssetUrl(mediaConfig.ringtone, "Ringtone.mp3", hostingPrefix +"media/Ringtone.mp3") }
    audioBlobs.HoldMusic = { file : "HoldMusic.mp3", url : mediaConfig.holdMusic ? resolveMediaAssetUrl(mediaConfig.holdMusic, "HoldMusic.mp3", "") : "" }
    audioBlobs.Busy = { file : "Busy.mp3", url : resolveMediaAssetUrl(mediaConfig.busy, "Busy.mp3", hostingPrefix +"media/Busy.mp3") }
    audioBlobs.CallWaiting = { file : "CallWaiting.mp3", url : resolveMediaAssetUrl(mediaConfig.callWaiting, "CallWaiting.mp3", hostingPrefix +"media/CallWaiting.mp3") }
    audioBlobs.Congestion = { file : "Congestion.mp3", url : resolveMediaAssetUrl(mediaConfig.congestion, "Congestion.mp3", hostingPrefix +"media/Congestion.mp3") }
    audioBlobs.EarlyMedia = { file : "EarlyMedia.mp3", url : resolveMediaAssetUrl(mediaConfig.earlyMedia, "EarlyMedia.mp3", hostingPrefix +"media/EarlyMedia.mp3") }

    $.each(audioBlobs, function (i, item) {
        if(item && item.url){
            item.blob = item.url;
        }
    });
    warmAudioCache(audioBlobs.Ringtone);
    warmAudioCache(audioBlobs.HoldMusic);
    warmAudioCache(audioBlobs.Busy);
    warmAudioCache(audioBlobs.CallWaiting);
    warmAudioCache(audioBlobs.Congestion);
    warmAudioCache(audioBlobs.EarlyMedia);

    var loadedAudioItems = [];
    $.each(audioBlobs, function (i, item) {
        if(!item || !item.url) return;
        if(loadedAudioItems.indexOf(item) > -1) return;
        loadedAudioItems.push(item);
        if(item.url.indexOf("data:") === 0){
            item.blob = item.url;
            return;
        }
        var oReq = new XMLHttpRequest();
        oReq.open("GET", item.url, true);
        oReq.responseType = "blob";
        oReq.onload = function(oEvent) {
            var reader = new FileReader();
            reader.readAsDataURL(oReq.response);
            reader.onload = function() {
                item.blob = reader.result;
            }
        }
        oReq.send();
    });
}
function stopSessionHoldMusic(session){
    if(!session || !session.data || !session.data.holdMusicAudio) return;
    try {
        session.data.holdMusicAudio.pause();
        session.data.holdMusicAudio.removeAttribute("src");
        session.data.holdMusicAudio.load();
    } catch(e){}
    session.data.holdMusicAudio = null;
}
function playSessionHoldMusic(session){
    if(!session || !session.data || !audioBlobs.HoldMusic || !audioBlobs.HoldMusic.blob) return;
    stopSessionHoldMusic(session);
    try {
        var holdAudio = new Audio(audioBlobs.HoldMusic.blob);
        holdAudio.preload = "auto";
        holdAudio.loop = true;
        session.data.holdMusicAudio = holdAudio;
        PlayMediaElementSafely(holdAudio, "hold-music");
    } catch(e){
        console.warn("Unable to play hold music", e);
    }
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.ResolveEmbeddedMediaUrl = ResolveEmbeddedMediaUrl; }
if (typeof window !== 'undefined') { window.ResolveEmbeddedMediaUrl = ResolveEmbeddedMediaUrl; }
if (typeof globalThis !== 'undefined') { globalThis.warmAudioCache = warmAudioCache; }
if (typeof window !== 'undefined') { window.warmAudioCache = warmAudioCache; }
if (typeof globalThis !== 'undefined') { globalThis.sanitizeMediaConfigValue = sanitizeMediaConfigValue; }
if (typeof window !== 'undefined') { window.sanitizeMediaConfigValue = sanitizeMediaConfigValue; }
if (typeof globalThis !== 'undefined') { globalThis.getFirstDefinedMediaConfigValue = getFirstDefinedMediaConfigValue; }
if (typeof window !== 'undefined') { window.getFirstDefinedMediaConfigValue = getFirstDefinedMediaConfigValue; }
if (typeof globalThis !== 'undefined') { globalThis.normalizeMediaConfig = normalizeMediaConfig; }
if (typeof window !== 'undefined') { window.normalizeMediaConfig = normalizeMediaConfig; }
if (typeof globalThis !== 'undefined') { globalThis.getStoredMediaConfig = getStoredMediaConfig; }
if (typeof window !== 'undefined') { window.getStoredMediaConfig = getStoredMediaConfig; }
if (typeof globalThis !== 'undefined') { globalThis.getEffectiveMediaConfig = getEffectiveMediaConfig; }
if (typeof window !== 'undefined') { window.getEffectiveMediaConfig = getEffectiveMediaConfig; }
if (typeof globalThis !== 'undefined') { globalThis.resolveMediaAssetUrl = resolveMediaAssetUrl; }
if (typeof window !== 'undefined') { window.resolveMediaAssetUrl = resolveMediaAssetUrl; }
if (typeof globalThis !== 'undefined') { globalThis.arrayBufferToBase64 = arrayBufferToBase64; }
if (typeof window !== 'undefined') { window.arrayBufferToBase64 = arrayBufferToBase64; }
if (typeof globalThis !== 'undefined') { globalThis.audioBufferToWavDataUri = audioBufferToWavDataUri; }
if (typeof window !== 'undefined') { window.audioBufferToWavDataUri = audioBufferToWavDataUri; }
if (typeof globalThis !== 'undefined') { globalThis.setRuntimeMediaConfigFromOptions = setRuntimeMediaConfigFromOptions; }
if (typeof window !== 'undefined') { window.setRuntimeMediaConfigFromOptions = setRuntimeMediaConfigFromOptions; }
if (typeof globalThis !== 'undefined') { globalThis.PreloadAudioFiles = PreloadAudioFiles; }
if (typeof window !== 'undefined') { window.PreloadAudioFiles = PreloadAudioFiles; }
if (typeof globalThis !== 'undefined') { globalThis.stopSessionHoldMusic = stopSessionHoldMusic; }
if (typeof window !== 'undefined') { window.stopSessionHoldMusic = stopSessionHoldMusic; }
if (typeof globalThis !== 'undefined') { globalThis.playSessionHoldMusic = playSessionHoldMusic; }
if (typeof window !== 'undefined') { window.playSessionHoldMusic = playSessionHoldMusic; }
