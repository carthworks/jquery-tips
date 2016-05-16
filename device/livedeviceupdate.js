"use strict";

$(window).bind("beforeunload", function() { 
	if(GblIsSubcribe == true){
		GblIsSubcribe = false;
		FnUnSubscribe();
	}
});


var webSocketUrl;
var webSocketConnect = function(){
	
		var ds = new Array();
		ds[0] = VarDSName;
		$.ajax({
			url : GblAppContextPath+"/ajax" + VarLiveSubscribeUrl,
			type : 'POST',
			dataType : 'json',
			contentType : "application/json",
			data : JSON.stringify(ds),
			success : function(response) {
				var ObjResponse = response;
				console.log(ObjResponse);
				if(ObjResponse.errorCode == undefined){
					var webSocketUrl = ObjResponse.webSocketUrl;
					var destination = ObjResponse.destination;
					subscribe(webSocketUrl,destination);
				}
			},
			error : function(xhr, status, error) {
				notificationMsg.show({
					message : "Data  not available for this datasource."
				}, 'error');
		
			}
		});
	
	
};

var myConsumer;
var GblIsSubcribe = false;
var subscribe = function(webSocketUrl, destination) {
	GblIsSubcribe = true;
	console.log('subscribe');
	webORB.defaultMessagingURL = webSocketUrl;
	myConsumer = new Consumer(destination, new Async(handleMessage,
			FnHandleFault));
	myConsumer.subscribe();
}

function FnHandleFault(fault) {
	console.log('fault');
}

function FnUnSubscribe(){
	GblIsSubcribe = false;
	myConsumer.unsubscribe();
	console.log("unsubscribed");
}
