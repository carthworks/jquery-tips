"use strict";

$(function() {

	$(window).on("resize", function() {
		kendo.resize($(".chart-wrapper"));
	});
	
	$(window).load(function() {
		FnInitGrid();
		FnDrawAlarmConsoleChart();
		FnGetPointsList();
		FnGetLatestAlarm();
	});
	
	$(window).bind("beforeunload", function() { 
		if(GblIsSubcribe == true){
			GblIsSubcribe = false;
			FnUnSubscribe();
		}
	});

});

function FnInitGrid(){
	var deviceData = new kendo.data.DataSource({
					data : [],
					pageSize : 10,
					page : 1,
					serverPaging : false,
					serverFiltering : false,
					serverSorting : false,
					sort : {
						field : "time",
						dir : "desc"
					}
				});
				
	
	var grid = $("#gapp-alarmconsole-list").kendoGrid({
					autoBind : true,
					dataSource : deviceData,
					rowTemplate: kendo.template($("#rowTemplate").html()),		
					pageable : {
						refresh : false,
						pageSizes : true,
						previousNext : true
					},
					height:300,
					columns : [
								{
									field : "alarmName",
									title : "Alarm Name"
								},
								{
									field : "alarmMsg",
									title : "Alarm Message"
								},
								{
									field : "assetInfo",
									title : "Asset Name"
								},
								{
									field : "starttime",
									title : "Alarm Generated Time"
								},
								{
									field : "time",
									title : "Alarm Updated Time"
								},
								{
									field : "value",
									title : "Current Value"
								}
							]
				});
}

var ArrDatasources = [];
function FnGetPointsList(){
	var VarUrl = GblAppContextPath + '/ajax' + VarListPointsUrl;
	var VarMainParam = {};
	VarMainParam["domain"] = {"domainName":VarCurrentTenantInfo.tenantDomain};
	VarMainParam["entityTemplate"] = {"entityTemplateName":"Point"};	
	FnMakeAjaxRequest(VarUrl, 'POST',JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResPointsList);
}

var GblAssetsInfo = {};
function FnResPointsList(response){
	var ArrResponse = response;
	if($.isArray(ArrResponse)){
	
		$.each(ArrResponse,function(){
			if(this.entityStatus.statusName == 'ALLOCATED'){
				var element = {};
				$.each(this.dataprovider,function(){					
					var key = this.key;
					var value = this.value;
					if((key == 'dataSourceName' || key == 'equipIdentifier' || key == 'equipName' || key == 'equipTemplate') && value != undefined){
						element[key] = value;
					}					
				});
				
				if(!$.isEmptyObject(element)){
					if($.inArray(element['dataSourceName'],ArrDatasources) == -1){
						ArrDatasources.push(element['dataSourceName']);
					}
					
					GblAssetsInfo[element['dataSourceName']] = {"name":element['equipName'],"id":element['equipIdentifier']};
				}
			}
		});
		
		if(ArrDatasources.length > 0){
			FnGetSubscriptionInfo(ArrDatasources);			
		} else {
			var ObjError = {"errorCode" : "500", "errorMessage" : "Datasource is not available"};
			FnShowNotificationMessage(ObjError);
		}
	
	} else {
	
		if(ArrResponse.errorCode != undefined){
			FnShowNotificationMessage(ArrResponse);
		}
		
	}
	
}

function FnGetLatestAlarm(){
	var VarUrl = GblAppContextPath + '/ajax' + VarLatestAlarmUrl;
	VarUrl = VarUrl.replace("{domain_name}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAjaxRequest(VarUrl, 'GET','', 'application/json', 'json', FnResLatestAlarm);
}

function FnResLatestAlarm(response){
	
	var ArrResponse = response;
	if($.isArray(ArrResponse)){
		$(ArrResponse).each(function(key,ObjEquipment){
			if(ObjEquipment.alarmMessages != undefined && (ObjEquipment.alarmMessages).length>0){
				$.each(ObjEquipment.alarmMessages,function(key1,ObjAlaram){
					var VarDSName = FnGetDatasourceName(ObjEquipment.equipName);
					var message = {"body":[{"datasourceName":VarDSName,"messageType":"ALARM","status":(ObjAlaram.status).toUpperCase(),"statusMessage":ObjAlaram.alarmMessage,"parameters":[{"name":ObjAlaram.displayName,"time":ObjAlaram.time,"value":ObjAlaram.data}]}]}
					
					FnHandleMessage(message,0);
				});
			}
		});
	}
}

function FnGetDatasourceName(VarEquipName){
	var VarDSName = '';
	$.each(GblAssetsInfo,function(dsname,objequip){
		if(objequip['name'] == VarEquipName){
			VarDSName = dsname;
		}
	});
	
	return VarDSName;
}

function FnGetSubscriptionInfo(ArrDataSources){
	var VarUrl = GblAppContextPath + '/ajax' + VarLiveSubscribeUrl;
	var VarParam = ArrDataSources;
	//var VarParam = ["Testdatasource12"]; //,"devTest"
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSubscriptionInfo);
}

var GblIsSubcribe = false;
function FnResSubscriptionInfo(response){
	var ObjResponse = response;
	if(ObjResponse.errorCode == undefined){
		if(ObjResponse.webSocketUrl != undefined && ObjResponse.destination != undefined){
			if(GblIsSubcribe == true){
				GblIsSubcribe = false;
				FnUnSubscribe();
			}
			var VarWebsocketUrl = ObjResponse.webSocketUrl;
			var VarDestination = ObjResponse.destination;
			FnSubscribe(VarWebsocketUrl,VarDestination);
		}
	} else {
		FnShowNotificationMessage(ObjResponse);
	}	
}

var myConsumer;
function FnSubscribe(Websocketurl,destination){
	GblIsSubcribe = true;
	console.log('subscribe');
	console.log(Websocketurl);
	console.log(destination);
	webORB.defaultMessagingURL = Websocketurl;
	myConsumer = new Consumer(destination, new Async(FnHandleMessage,
				FnHandleFault));
	
	myConsumer.subscribe();
		
}

var ObjAlarmChart = {};
function FnHandleMessage(message,VarFlag){
	console.log('live message');
	console.log(JSON.stringify(message));
	
	var grid = $("#gapp-alarmconsole-list").data("kendoGrid");
	var chart = $("#gapp-alarmconsole-chart").data("kendoChart");
	var	content = message.body[0];
	if(VarFlag == undefined){
		var data = $.parseJSON(content);
	} else {
		var data = content;
	}
		
	if(data.messageType!='ALARM'){ return; }
	
	var VarDSName = data.datasourceName;
	var VarAssetName = GblAssetsInfo[VarDSName]['name'];
		
	var VarAlarmStatus = '';
	if(data.status==='TRUE'){
		VarAlarmStatus = 'Alarm';
	} else if(data.status==='FALSE'){
		VarAlarmStatus = 'Normal';
	}
	
	var VarAlarmMsg = data.statusMessage;
	var ArrParameters = data.parameters;
	
	for (var i = 0; i < ArrParameters.length; i++) {
	
		var VarAlarmName = ArrParameters[i].name;
		var VarId = VarDSName.replace(/ /g, '_') +"_"+ VarAlarmName.replace(/ /g, '_');
		
		var isGExist = false;
		for (var k = 0; k < grid.dataSource.data().length; k++) {
			var VarChkId = grid.dataSource.data()[k].rowid;
			
			if (VarId === VarChkId) {
				isGExist = true;
				var item = grid.dataSource.data()[k];
				item.set('status', VarAlarmStatus);
				item.set('alarmMsg', VarAlarmMsg);
				item.set('time', ArrParameters[i].time);
				item.set('value', ArrParameters[i].value);
				
				if(data.status === 'FALSE'){
					setTimeout(FnClearAlarmConsole(grid.dataSource.data()[k].rowid), 120000);
				}
				
			}
		}
		
		if (!isGExist) {
			
			grid.dataSource.add({
							alarmName : VarAlarmName,
							status : VarAlarmStatus,
							alarmMsg : VarAlarmMsg,
							assetInfo : VarAssetName,
							datasourceName : VarDSName,
							time : ArrParameters[i].time,
							rowid : VarId,
							starttime : ArrParameters[i].time,
							value : ArrParameters[i].value
							
			});
			
			if(data.status === 'FALSE'){
				setTimeout(FnClearAlarmConsole(VarId), 120000);
			}
			
		}

		var isCExist = false;
		for (var l = 0; l < chart.dataSource.data().length; l++) {
			var VarChkEquipName = chart.dataSource.data()[l].assetName;
			if (VarAssetName === VarChkEquipName) {
				isCExist = true;
				var chartitem = chart.dataSource.data()[l];
				var chartcnt = parseInt(chart.dataSource.data()[l].alarmCount);
				
				if(ObjAlarmChart[VarAssetName] != undefined){
					if(data.status === 'TRUE'){
					
						if($.inArray(VarAlarmName,ObjAlarmChart[VarAssetName]) == -1){
							ObjAlarmChart[VarAssetName].push(VarAlarmName);
							chartitem.set('alarmCount', (chartcnt + 1));
						}
						
					} else if(data.status === 'FALSE'){
						
						if($.inArray(VarAlarmName,ObjAlarmChart[VarAssetName]) != -1){
							if(chartcnt>0){
								chartitem.set('alarmCount', (chartcnt - 1));
							} else {
								chartitem.set('alarmCount', 0);
							}
							
							ObjAlarmChart[VarAssetName].splice($.inArray(VarAlarmName, ObjAlarmChart[VarAssetName]),1);
														
						}
						
					}
				}
				
			}
		}
		
		if (!isCExist && data.status === 'TRUE') {
			if(ObjAlarmChart[VarAssetName] == undefined){
				ObjAlarmChart[VarAssetName] = [];
				ObjAlarmChart[VarAssetName].push(VarAlarmName);
			}
			chart.dataSource.add({"assetName":VarAssetName,"alarmName":VarAlarmName,"alarmCount":1,rowid : VarId});
		}
		
		grid.dataSource.sync();
		chart.dataSource.sync();
		
	}
	
}

function toDateFormat(time, format) {
	var date = new Date(Number(time));
	return date.toUTCString();
}

function FnClearAlarmConsole(VarId){
	var grid = $("#gapp-alarmconsole-list").data("kendoGrid");
	var dataItem = grid.dataItem($('#'+VarId));
	grid.dataSource.remove(dataItem);
}

function FnHandleFault(fault) {
	console.log('fault');
}

function FnUnSubscribe(){
	GblIsSubcribe = false;
	myConsumer.unsubscribe();
	console.log("unsubscribed");
}


function FnDrawAlarmConsoleChart(){
	var ArrAlarmConsoleCnt = [];
				
	$("#gapp-alarmconsole-chart").kendoChart({
                dataSource: {
                    data: ArrAlarmConsoleCnt
                },
                legend: {
                    visible: false
                },
                seriesDefaults: {
                    type: "column",
                    labels: {
                        visible: true,
                        background: "transparent"
                    }
                },
                series: [{
                    field: "alarmCount",
					color: "#FF3E01"
                }],
                valueAxis: {
                    majorGridLines: {
                        visible: false
                    },
                    visible: true,
					title: { text: "Alarm Count" },
					min: 0,
					majorUnit: 1
                },
                categoryAxis: {
                    field: "assetName",
                    majorGridLines: {
                        visible: false
                    },
                    line: {
                        visible: true
                    }
                }
            });
	
}