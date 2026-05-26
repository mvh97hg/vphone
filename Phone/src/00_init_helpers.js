/**
 * VPhone Init Helpers & Base Globals
 * Pure utility functions and core configurations required at the very start of initialization.
 */

// 1. Core Config & LocalDB Definitions (Environment Safe)
const appversion = "0.1.1";
const instanceID = String(Date.now());
const localDB = (typeof window !== 'undefined' && window.localStorage) 
    ? window.localStorage 
    : (typeof globalThis !== 'undefined' && globalThis.localDB ? globalThis.localDB : null);

// 2. Helper Functions Definitions
function normalizeBooleanFlag(value, defaultValue){
    if(value === undefined || value === null || value === "") return !!defaultValue;
    if(typeof value === "boolean") return value;
    if(typeof value === "number") return value !== 0;
    var normalized = String(value).toLowerCase().trim();
    if(normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") return false;
    if(normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") return true;
    return !!defaultValue;
}

function getDbItem(itemIndex, defaultValue){
    if(localDB.getItem(itemIndex) != null) return localDB.getItem(itemIndex);
    return defaultValue;
}

function IsMd5Hex32(value){
    return /^[a-f0-9]{32}$/i.test(String(value || "").trim());
}

function NormalizeSipPasswordAndType(rawPassword, rawType){
    var password = String(rawPassword || "").trim();
    var type = String(rawType || "").toLowerCase().trim();
    var prefixedMd5Match = password.match(/^(?:md5|ha1)\s*[:=]\s*([a-f0-9]{32})$/i);
    if(prefixedMd5Match){
        password = prefixedMd5Match[1];
    }

    var isMd5Hex = IsMd5Hex32(password);

    if(type === "ha1" && isMd5Hex){
        return { password: password.toLowerCase(), type: "ha1" };
    }
    if(type === "plain"){
        return { password: password, type: "plain" };
    }
    if(type === "ha1" && !isMd5Hex){
        return { password: password, type: "plain" };
    }
    if(isMd5Hex){
        return { password: password.toLowerCase(), type: "ha1" };
    }
    return { password: password, type: "plain" };
}

function NormalizeKeyboardShortcuts(value){
    var defaults = {
        answer: "F2",
        hangup: "Escape",
        hold: "F4",
        mute: "F6",
        transfer: "F8",
        dialpad: "F9"
    };
    var configured = {};
    if(value && typeof value === "string"){
        try {
            configured = JSON.parse(value);
        } catch(e){
            configured = {};
        }
    }
    else if(value && typeof value === "object"){
        configured = value;
    }
    for(var key in defaults){
        if(!Object.prototype.hasOwnProperty.call(defaults, key)) continue;
        if(!configured[key]) configured[key] = defaults[key];
        configured[key] = String(configured[key]).trim();
    }
    return configured;
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.appversion = appversion; }
if (typeof window !== 'undefined') { window.appversion = appversion; }
if (typeof globalThis !== 'undefined') { globalThis.instanceID = instanceID; }
if (typeof window !== 'undefined') { window.instanceID = instanceID; }
if (typeof globalThis !== 'undefined') { globalThis.localDB = localDB; }
if (typeof window !== 'undefined') { window.localDB = localDB; }
if (typeof globalThis !== 'undefined') { globalThis.normalizeBooleanFlag = normalizeBooleanFlag; }
if (typeof window !== 'undefined') { window.normalizeBooleanFlag = normalizeBooleanFlag; }
if (typeof globalThis !== 'undefined') { globalThis.getDbItem = getDbItem; }
if (typeof window !== 'undefined') { window.getDbItem = getDbItem; }
if (typeof globalThis !== 'undefined') { globalThis.IsMd5Hex32 = IsMd5Hex32; }
if (typeof window !== 'undefined') { window.IsMd5Hex32 = IsMd5Hex32; }
if (typeof globalThis !== 'undefined') { globalThis.NormalizeSipPasswordAndType = NormalizeSipPasswordAndType; }
if (typeof window !== 'undefined') { window.NormalizeSipPasswordAndType = NormalizeSipPasswordAndType; }
if (typeof globalThis !== 'undefined') { globalThis.NormalizeKeyboardShortcuts = NormalizeKeyboardShortcuts; }
if (typeof window !== 'undefined') { window.NormalizeKeyboardShortcuts = NormalizeKeyboardShortcuts; }
