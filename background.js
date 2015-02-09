
var EXTENSION_ID = "365056580234";
var browserId = "";
var post_url = "http://www.pushetta.com/browser/register";

var data_pack = {}

function registerCallback(registrationId) {
    if (chrome.runtime.lastError) {
        console.log("reg error " + chrome.runtime.lastError.message);
        return;
    }

    data_pack["registrationId"] = registrationId;
}

function show(message) {
    var payload = JSON.parse(message.data.data_dic);
    new Notification(payload["channel_name"], {
        icon: '48.png',
        body: message.data.alert_msg
    });
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};


// Startup

/*
 * Handler for push notifications
 */
chrome.gcm.onMessage.addListener(function(message) {
    show(message);
});


/*
 *  Operations for called by communications with webpage
 */
var Operations = {}

Operations.gettoken= function getRegistrationToken (argument) {
	return { 'device_id' : browserId, 'token' : data_pack.registrationId };
}



chrome.storage.sync.get('brid', function(items) {
    var brid = items.brid;
    if (brid) {
        idAcquired(brid);
    } else {
        brid = generateUUID();
        chrome.storage.sync.set({
            brid: brid
        }, function() {
            idAcquired(brid);
        });
    }

    function idAcquired(brid) {
        browserId = brid;
        console.log("id " + brid);

        chrome.runtime.onMessageExternal.addListener(
            function(request, sender, sendResponse) {
            	var resp = {};
            	if (request.op){
            		resp = Operations[request.op](request.channelName, request.username);
            	}
            	sendResponse(resp);
        });

        // Start of registration process
        var senderIds = [EXTENSION_ID];
        chrome.gcm.register(senderIds, registerCallback);

    }
});