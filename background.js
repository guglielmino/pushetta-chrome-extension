var EXTENSION_ID="365056580234"
var browserId = "";
var post_url = "http://www.pushetta.com/browser/register";

var data_pack = {}

function registerCallback(registrationId) {
    console.log("reg id" + registrationId);
    if (chrome.runtime.lastError) {
        // When the registration fails, handle the error and retry the
        // registration later.
        console.log("reg error" + chrome.runtime.lastError);
        return;
    }

    data_pack["registrationId"] = registrationId;
	send_data();
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
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
};



function send_data(){
	if( data_pack["channel_name"] && 
			data_pack["username"] &&
			data_pack["registrationId"]){
		 
			var xhr = new XMLHttpRequest();
		    xhr.open("POST", post_url, true);

		    xhr.onreadystatechange = function() {

		        if (xhr.readyState == 4) {
					//console.log(xhr.responseText)
		        }
		    }
		    data = { 
		    	'channel': data_pack["channel_name"], 
		    	'token': data_pack["registrationId"], 
		    	'name': data_pack["username"],
		    	'browser': 'chrome', 
		    	'device_id': browserId };

		    xhr.send(JSON.stringify(data));
	}
}


// Startup
chrome.storage.sync.get('brid', function(items) {
		var brid = items.brid;
		if (brid) {
				idAcquired(brid);
		} else {
				brid = generateUUID();
				chrome.storage.sync.set({brid: brid}, function() {
					idAcquired(brid);
				});
		}
		function idAcquired(brid) {
			browserId = brid;
			console.log("id " + brid);

			// Handler for GCM mesages (push notifications)
			chrome.gcm.onMessage.addListener(function(message) {
				show(message);
			});

			// Handler for message from webpage
			chrome.runtime.onMessageExternal.addListener(
			  	function(request, sender, sendResponse) {

			  		if (request.channelName && request.username){
			  			data_pack["channel_name"] = request.channelName;
			  			data_pack["username"] = request.username;
			  		
			  			send_data();
			  			sendResponse({success: true});
			  		}
			 });

			// Start of registration process
			var senderIds = [EXTENSION_ID];
			chrome.gcm.register(senderIds, registerCallback);

		}
});

