function onLocalStorageEvent(event){
    if(event.key == "InstanceId"){

        Unregister();
    }
}
function PrepareIndexDB(){
    const CallQosDataOpenRequest = window.indexedDB.open("CallQosData", 1);
    CallQosDataOpenRequest.onerror = function(event) {
        console.error("CallQosData DBOpenRequest Error:", event);
    }
    CallQosDataOpenRequest.onupgradeneeded = function(event) {
        console.warn("Upgrade Required for CallQosData IndexDB... probably because of first time use.");
        CallQosDataIndexDb = event.target.result;

        if(CallQosDataIndexDb.objectStoreNames.contains("CallQos") == false){
            var objectStore = CallQosDataIndexDb.createObjectStore("CallQos", { keyPath: "uID" });
            objectStore.createIndex("sessionid", "sessionid", { unique: false });
            objectStore.createIndex("buddy", "buddy", { unique: false });
            objectStore.createIndex("QosData", "QosData", { unique: false });
            console.log("IndexDB created ObjectStore CallQos");
        }
        else {
            console.warn("IndexDB requested upgrade, but object store was in place");
        }
    }
    CallQosDataOpenRequest.onsuccess = function(event) {
        CallQosDataIndexDb = event.target.result;

        CallQosDataIndexDb.onerror = function(event) {
            console.error("IndexDB Error:", event);
        }

        if(CallQosDataIndexDb.objectStoreNames.contains("CallQos") == false){
            console.warn("IndexDB is open but CallQos does not exist.");
            CallQosDataIndexDb.close();
            console.log("IndexDB is closed.");
            const DBDeleteRequest = window.indexedDB.deleteDatabase("CallQos");
            DBDeleteRequest.onerror = function(event) {
                console.error("Error deleting database CallQos");
            }
            DBDeleteRequest.onsuccess = function(event) {
                console.log("Database deleted successfully");
                window.setTimeout(function(){
                    PrepareIndexDB();
                },500);
            }
            return;
        }
        console.log("IndexDB connected to CallQosData");
    }
    const CallRecordingsOpenRequest = window.indexedDB.open("CallRecordings", 1);
    CallRecordingsOpenRequest.onerror = function(event) {
        console.error("CallRecordings DBOpenRequest Error:", event);
    }
    CallRecordingsOpenRequest.onupgradeneeded = function(event) {
        console.warn("Upgrade Required for CallRecordings IndexDB... probably because of first time use.");
        CallRecordingsIndexDb = event.target.result;

        if(CallRecordingsIndexDb.objectStoreNames.contains("Recordings") == false){
            var objectStore = CallRecordingsIndexDb.createObjectStore("Recordings", { keyPath: "uID" });
            objectStore.createIndex("sessionid", "sessionid", { unique: false });
            objectStore.createIndex("bytes", "bytes", { unique: false });
            objectStore.createIndex("type", "type", { unique: false });
            objectStore.createIndex("mediaBlob", "mediaBlob", { unique: false });
            console.log("IndexDB created ObjectStore Recordings");
        }
        else {
            console.warn("IndexDB requested upgrade, but object store was in place");
        }
    }
    CallRecordingsOpenRequest.onsuccess = function(event) {
        CallRecordingsIndexDb = event.target.result;

        CallRecordingsIndexDb.onerror = function(event) {
            console.error("IndexDB Error:", event);
        }
        if(CallRecordingsIndexDb.objectStoreNames.contains("Recordings") == false){
            console.warn("IndexDB is open but Recordings does not exist.");
            CallRecordingsIndexDb.close();
            console.log("IndexDB is closed.");
            const DBDeleteRequest = window.indexedDB.deleteDatabase("CallRecordings");
            DBDeleteRequest.onerror = function(event) {
                console.error("Error deleting database CallRecordings");
            }
            DBDeleteRequest.onsuccess = function(event) {
                console.log("Database deleted successfully");
                window.setTimeout(function(){
                    PrepareIndexDB();
                },500);
            }
            return;
        }
        console.log("IndexDB connected to CallRecordings");
    }
}

// Global exports shim for backwards compatibility
if (typeof globalThis !== 'undefined') { globalThis.onLocalStorageEvent = onLocalStorageEvent; }
if (typeof window !== 'undefined') { window.onLocalStorageEvent = onLocalStorageEvent; }
if (typeof globalThis !== 'undefined') { globalThis.PrepareIndexDB = PrepareIndexDB; }
if (typeof window !== 'undefined') { window.PrepareIndexDB = PrepareIndexDB; }
