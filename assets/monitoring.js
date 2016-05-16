"use strict";
var GblIsSubcribe = false;

var GblStartEnd = {};
function startChange() {
	var startDate = GblStartEnd.start.value(),
		endDate = GblStartEnd.end.value();

	if (startDate) {
		startDate = new Date(startDate);
		startDate.setDate(startDate.getDate());
		GblStartEnd.end.min(startDate);
	} else if (endDate) {
		GblStartEnd.start.max(new Date(endDate));
	} else {
		endDate = new Date();
		GblStartEnd.start.max(endDate);
		GblStartEnd.end.min(endDate);
	}
}
function endChange() {
	var endDate = GblStartEnd.end.value(),
	startDate = GblStartEnd.start.value();
	
	if (endDate) {
		endDate = new Date(endDate);
		endDate.setDate(endDate.getDate());
		GblStartEnd.start.max(endDate);
	} else if (startDate) {
		GblStartEnd.end.min(new Date(startDate));
	} else {
		endDate = new Date();
		GblStartEnd.start.max(endDate);
		GblStartEnd.end.min(endDate);
	}
}
$(document).ready(function(){
	FnInitiateMap();	
	
	GblStartEnd.start = $("#startDate").kendoDatePicker({
		change: startChange,
		format: "dd/MM/yyyy"
	}).data("kendoDatePicker");
	GblStartEnd.end = $("#endDate").kendoDatePicker({
		change: endChange,
		format: "dd/MM/yyyy"
	}).data("kendoDatePicker");
	
	var VarDateToday   = FnGetTodaysDate();
	var VarDateAddDays = FnAddDaysToDate(1);
	var VarDateSubDays = FnSubtractDaysToDate(7);
	GblStartEnd.start.max(VarDateToday);
	GblStartEnd.end.min(GblStartEnd.start.value());
	GblStartEnd.end.max(VarDateToday);
	$('#startDate').mask("00/00/0000", {placeholder: "DD/MM/YYYY"});
	$('#endDate').mask("00/00/0000", {placeholder: "DD/MM/YYYY"});
	$("#startDate").val(VarDateToday);
	$("#endDate").val(VarDateToday);
});

$(window).load(function() {
	FnGetAssetList();
});

$(window).bind("beforeunload", function() { 
	if(GblIsSubcribe == true){
		GblIsSubcribe = false;
		FnUnSubscribe();
	}
});

var map = null;
var streets;
var hybrid;
function FnInitiateMap(){
	streets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
		id: 'Street',
		minZoom: 1,
		maxZoom: 18,
		subdomains:['mt0','mt1','mt2','mt3'],
		attribution: ""});

	hybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
		id: 'Satellite',
		minZoom: 1,
		maxZoom: 18,
		subdomains:['mt0','mt1','mt2','mt3'],
		attribution: ""});
	
	map = L.map('assetsmonitoringmap', {
		zoom: 5,
		center: [40.9743827,-97.6000859], // Dubai LatLng 25.20, 55.27
		layers: [hybrid,streets],
		zoomControl: true,
		attributionControl: true
	});
	map.zoomControl.setPosition('bottomright');

	var baseMaps = {
		"Satellite": hybrid,
		"Streets": streets
	};

	L.control.layers(baseMaps).addTo(map);
}
 
function FnGetAssetList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListAssetsUrl;
	VarUrl = VarUrl + "?domain_name="+ VarCurrentTenantInfo.tenantDomain + "&mode=Asset";
	$("#GBL_loading").show();
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResAssetList);
}

var GblAssetsList = {};
var GblAssetsInfo = {};
var GblImageList = {};
function FnResAssetList(response){	
	var ArrResponse = response;
	$("#GBL_loading").hide();
	if($.isArray(ArrResponse)){
		
		var VarResLength = ArrResponse.length;
		var ArrData = [];
		ArrData.push({'id':VarCurrentTenantInfo.tenantId,'text':(VarCurrentTenantInfo.tenantName).toUpperCase()});
		var ArrAssetLocations = [];
		var ArrDestinations = [];
		if(VarResLength > 0){
			ArrData[0]['items'] = [];
			$.each(ArrResponse,function(){
				var VarDSName = (this.datasourceName != undefined) ? this.datasourceName : '';
				ArrData[0]['items'].push({'id':this.assetIdentifier.value,'text':(this.assetName).toUpperCase(),'datasourceName':VarDSName,'assetName':this.assetName,'template':this.templateName,'templateType':this.assetTemplate});
				if(this.latitude != undefined && this.longitude != undefined){
					ArrAssetLocations.push({'latitude':parseFloat(this.latitude),'longitude':parseFloat(this.longitude),'datasourceName':VarDSName,'assetName':this.assetName,'template':this.templateName,'templateType':this.assetTemplate});
				}
				
				if(GblAssetsList[this.assetTemplate] == undefined){
					GblAssetsList[this.assetTemplate] = [];
					GblAssetsList[this.assetTemplate].push(this.assetName);
				} else {
					GblAssetsList[this.assetTemplate].push(this.assetName);
				}
								
				if(VarDSName != ''){
					if($.inArray(VarDSName,ArrDestinations) == -1){
						ArrDestinations.push(VarDSName);
					}
					GblAssetsInfo[VarDSName] = {"name":this.assetName,"id":this.assetIdentifier.value,'template':this.templateName,'templateType':this.assetTemplate};
				}				
				
			});
			
			GblImageList = FnGetImageList();
			
		}
		
		$("#treeview").kendoTreeView({
			select: function(e){
				clearPlotHistoryDetails();
				
				var tree = $("#treeview").getKendoTreeView();
				var dataItem = tree.dataItem(e.node);		
				if(dataItem.template != undefined){
					var ObjAssetParam = {};
					ObjAssetParam['datasourceName'] = dataItem.datasourceName;
					ObjAssetParam['template'] = dataItem.template;
					ObjAssetParam['assetName'] = dataItem.assetName;

					FnHighlightMarker(ObjAssetParam);
				}
				
			},
			dataSource: ArrData,
		});
		
		$('#treeview #'+VarCurrentTenantInfo.tenantId).attr('disabled',true);
		var treeview = $("#treeview");
		var kendoTreeView = treeview.data("kendoTreeView")
		
		treeview.on("click", ".k-top.k-bot span.k-in", function(e) {
			kendoTreeView.toggle($(e.target).closest(".k-item"));
		});	
		kendoTreeView.expand(".k-item");
		
		FnApplyAssetMarkers(ArrAssetLocations);
		FnAddSearchAssetTypes();
		
		if(ArrDestinations.length > 0){
			FnGetSubscriptionInfo(ArrDestinations);
		}
		
	} else {
		if(ArrResponse.errorCode != undefined){
			FnShowNotificationMessage(ArrResponse);
		}
	}
		
}

function FnGetImageList(){
	var ObjImages = {};
	$.ajax({
		type: 'GET',
		cache: true,
		async: false,
		contentType: 'application/json; charset=utf-8',
		url: GblAppContextPath+'/getimage/all/'+VarCurrentTenantInfo.tenantId,
		dataType: 'json',
		success:function(response){
			var ObjResponse = response;
			ObjImages = ObjResponse;		
		},
		error:function(xhr, status, error){
			console.log(xhr);
		}
	});
	
	return ObjImages;
}

function FnGetSubscriptionInfo(ArrDataSources){
	var VarUrl = GblAppContextPath+'/ajax' + VarLiveSubscribeUrl;
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(ArrDataSources), 'application/json; charset=utf-8', 'json', FnResSubscriptionInfo);
}

function FnResSubscriptionInfo(response){
	var ObjResponse = response;
	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.webSocketUrl != undefined && ObjResponse.destination != undefined){
			var VarWebsocketUrl = ObjResponse.webSocketUrl;
			var VarDestination = ObjResponse.destination;
			FnSubscribe(VarWebsocketUrl,VarDestination);
		}
	}
}

var myConsumer;
function FnSubscribe(Websocketurl,destination){
	console.log(Websocketurl);
	console.log(destination);
	console.log('subscribe');
	GblIsSubcribe = true;
	webORB.defaultMessagingURL = Websocketurl;
	myConsumer = new Consumer(destination, new Async(FnHandleMessage,
				FnHandleFault));
	myConsumer.subscribe();
	
}

function FnHandleMessage(message){
	console.log('live data----------------');
	console.log(JSON.stringify(message));
	
	if(message.body != undefined){
		var VarContent = message.body[0];
		var ObjData = $.parseJSON(VarContent);
		if(ObjData.messageType!='MESSAGE'){ return; }
		if(!$.isEmptyObject(ObjData)){
			
			var VarDataSourceName = ObjData.datasourceName;
			var ArrParameters = ObjData.parameters;
			var VarTimestamp = ObjData.receivedTime;
			var element = {};
			for(var i=0; i<ArrParameters.length; i++){
				if(ArrParameters[i].name == 'Latitude'){
					element['latitude'] = ArrParameters[i].value;
				} else if(ArrParameters[i].name == 'Longitude'){
					element['longitude'] = ArrParameters[i].value;
				}
			}
			
			if(!$.isEmptyObject(element)){
				var ArrAssetLocations = [];
				element['datasourceName'] = VarDataSourceName;
				element['assetName'] = GblAssetsInfo[VarDataSourceName]['name'];
				element['template'] = GblAssetsInfo[VarDataSourceName]['template'];
				element['templateType'] = GblAssetsInfo[VarDataSourceName]['templateType'];
				element['time'] = VarTimestamp;
				ArrAssetLocations.push(element);
				FnApplyAssetMarkers(ArrAssetLocations);
			}
						
		}
	}
}

function FnHandleFault(fault) {
	console.log('fault');
}

function FnUnSubscribe(){
	GblIsSubcribe = false;
	myConsumer.unsubscribe();
	console.log("unsubscribed");
}

function FnHighlightMarker(ObjAssetParam){	
	var marker = Arrmarkers[ObjAssetParam['assetName']];
	if(marker != undefined){	
		marker.openPopup();
		var VarZoom = parseInt(map.getZoom());
		map.setView(marker.getLatLng(),5);
		marker.bounce({duration: 1000, height: 100});
		
	} else {
	
		if(ObjAssetParam.datasourceName != undefined && ObjAssetParam.datasourceName != ''){
			var VarParam = [];
			VarParam.push(ObjAssetParam.datasourceName);
			$.ajax({
					type:'POST',
					cache: true,
					async: false,
					contentType: 'application/json; charset=utf-8',
					url: GblAppContextPath+"/ajax" + VarSearchDeviceUrl,
					data: JSON.stringify(VarParam),
					dataType: 'json',
					success: function(result) {
						var ArrRes = result;
						if($.isArray(ArrRes) && ArrRes.length > 0){
							var ArrAssetLocations = [];
							$.each(ArrRes,function(){
								var element = {};
								$.each(this.dataprovider,function(key,obj){
									if((obj['key'] == 'latitude' || obj['key'] == 'longitude') && obj['value'] != undefined && obj['value'] != ''){
										element[obj['key']] = parseFloat(obj['value']);
									}
								});
								
								if(!$.isEmptyObject(element)){
									element['datasourceName'] = ObjAssetParam.datasourceName;
									element['assetName'] = GblAssetsInfo[ObjAssetParam.datasourceName]['name'];
									element['template'] = GblAssetsInfo[ObjAssetParam.datasourceName]['template'];
									element['templateType'] = GblAssetsInfo[ObjAssetParam.datasourceName]['templateType'];
									ArrAssetLocations.push(element);
								}
							});
							
							if(ArrAssetLocations.length > 0){
								FnApplyAssetMarkersSelect(ArrAssetLocations);
							} else {
								var ObjError = {"errorCode" : "500", "errorMessage" : "No location mapped to the asset."};
								FnShowNotificationMessage(ObjError);
							}
							
						}
					},
					error : function(xhr, status, error) {
						console.log('Error');
					}
				});
			
		} else {		
			var ObjError = {"errorCode" : "500", "errorMessage" : "No location mapped to the asset."};
			FnShowNotificationMessage(ObjError);
		}
	}
}

var Arrmarkers = {};
var GblAssetsMarkers = {};
function FnApplyAssetMarkers(ArrRes){
	if(ArrRes.length > 0){	
		if(!$.isEmptyObject(Arrmarkers) && GblIsSubcribe==true){
			FnRemoveMarkers(ArrRes);
		}
								
		$.each(ArrRes,function(){
			//var VarIcon = FnGetMarkerImageIcon(this.latitude, this.longitude);
			var VarIcon = FnGetMarkerHtmlIcon(this.templateType);
			var marker = L.marker([this.latitude, this.longitude], {icon: VarIcon}).bindPopup(FnConstructMapContent(this)).addTo(map);
			
			var VarMarkerAssetName = this.assetName;
			marker.on('click', function() {
				$('ul.k-group li span.k-in').each(function () {				
					if($(this).attr("class") == 'k-in k-state-selected'){
						$(this).removeClass('k-state-selected');
					}
					if(VarMarkerAssetName.toUpperCase() == $(this).html()){
						$(this).addClass('k-state-selected');
					}
				});
			});
			
			Arrmarkers[this.assetName] = marker;	
			var VarGrpMarkerName = FnGetGrpMarkerName(this.assetName);
			if(GblAssetsMarkers[VarGrpMarkerName] == undefined){
				GblAssetsMarkers[VarGrpMarkerName] = [];
				GblAssetsMarkers[VarGrpMarkerName].push(marker);
			} else {
				GblAssetsMarkers[VarGrpMarkerName].push(marker);
			}
						
		});
		
		FnCreateLayerGroup();
		FnConstructCountDetails();
	}
	
}

function FnApplyAssetMarkersSelect(ArrRes){
	if(ArrRes.length > 0){	
		if(!$.isEmptyObject(Arrmarkers) && GblIsSubcribe==true){
			FnRemoveMarkers(ArrRes);
		}
								
		$.each(ArrRes,function(){
			//var VarIcon = FnGetMarkerImageIcon(this.latitude, this.longitude);
			var VarIcon = FnGetMarkerHtmlIcon(this.templateType);
			var marker = L.marker([this.latitude, this.longitude], {icon: VarIcon}).bindPopup(FnConstructMapContent(this)).addTo(map);
		
			var VarMarkerAssetName = this.assetName;
				marker.on('click', function() {
				$('ul.k-group li span.k-in').each(function () {
					if($(this).attr("class") == 'k-in k-state-selected'){
						$(this).removeClass('k-state-selected');
					}
					if(VarMarkerAssetName.toUpperCase() == $(this).html()){
						$(this).addClass('k-state-selected');
					}
				});
			});
			
			Arrmarkers[this.assetName] = marker;	
			
			marker.openPopup();
			map.setView(marker.getLatLng(),5);
			marker.bounce({duration: 1000, height: 100});
					
			var VarGrpMarkerName = FnGetGrpMarkerName(this.assetName);
			if(GblAssetsMarkers[VarGrpMarkerName] == undefined){
				GblAssetsMarkers[VarGrpMarkerName] = [];
				GblAssetsMarkers[VarGrpMarkerName].push(marker);
			} else {
				GblAssetsMarkers[VarGrpMarkerName].push(marker);
			}
						
		});
	
		FnCreateLayerGroup();
		FnConstructCountDetails();
	}
}

function FnGetMarkerHtmlIcon(VarAssetTemplate){

	var VarAssetTypeImageSrc = '';
	if($.inArray(VarAssetTemplate+".png",GblImageList['assetType']) != -1){
		var VarAssetTypeImage = GblAppContextPath + VarAppImagePath + "/" + VarCurrentTenantInfo.tenantDomain + VarAppAssetTypeImagePath + VarAppMarkerImagePath + "/" + VarAssetTemplate+".png";
		VarAssetTypeImageSrc = '<img src='+VarAssetTypeImage+' style="height:23px" />';
	} else {
		var VarAssetTypeImage = GblAppContextPath + VarAppImagePath + VarAppDefaultImagePath + VarAppAssetTypeImagePath + VarAppMarkerImagePath + "/" + "noimage.png";
		VarAssetTypeImageSrc = '<img src='+VarAssetTypeImage+' style="height:23px" />';
	}

	var icon = L.divIcon({
		className: '',
		iconSize: [45, 45],
		iconAnchor:   [22, 45],
		popupAnchor:  [0, -37],
		html:'<div class="pin '+VarAssetTemplate+'">'+VarAssetTypeImageSrc+'</div>'
   });
   
   return icon;
   
}

function FnGetMarkerImageIcon(Latitude, Longitude){

	var LeafIcon = L.Icon.extend({
		options: {
			iconSize:     [46, 70],
			iconAnchor:   [23, 70], // Latitude, Longitude
			shadowAnchor: [4, 62],
			popupAnchor:  [0, -62]
		}
	});
	
	var VarIcon = new LeafIcon({iconUrl: GblAppContextPath+'/plugins/leaflet/marker/common.png'});

	return VarIcon;
}

var GblArrAssetLayers = {};
function FnCreateLayerGroup(){
	$.each(GblAssetsMarkers,function(name,Arr){
		var VarLayerName = L.layerGroup(Arr);
		GblArrAssetLayers[name] = VarLayerName;
	});
	
}

function FnConstructCountDetails(){
	var VarMarkerCount = (Object.keys(Arrmarkers)).length;
	$('#asset-toggle').text(VarMarkerCount);
	var VarCountDetailsTxt = '';
	$('#assettype_details_count').html('');
	$.each(GblAssetsMarkers,function(templatename,ArrMarkers){
		var VarAssetTypeImageSrc = '';
		if($.inArray(templatename+".png",GblImageList['assetType']) != -1){
			var VarAssetTypeImage = GblAppContextPath + VarAppImagePath + "/" + VarCurrentTenantInfo.tenantDomain + VarAppAssetTypeImagePath + VarAppMarkerImagePath + "/" + templatename+".png";
			VarAssetTypeImageSrc = '<img src='+VarAssetTypeImage+' style="height:21px" />';
		} else {
			var VarAssetTypeImage = GblAppContextPath + VarAppImagePath + VarAppDefaultImagePath + VarAppAssetTypeImagePath + VarAppMarkerImagePath + "/" + "noimage.png";
			VarAssetTypeImageSrc = '<img src='+VarAssetTypeImage+' style="height:23px" />';
		}
		
		var VarAssetCount = ArrMarkers.length;
	
		VarCountDetailsTxt += '<a href="#"><div class="pincount">'+VarAssetTypeImageSrc+'</div><section style="float:right;text-align: left;margin: 6px 0px 10px 10px;"><div style="font-size: 15px;">'+templatename+'</div><div style="color: #37DCBF;font-size: 15px;">'+VarAssetCount+'</div></section></a>';
	});
	
	$('#assettype_details_count').html(VarCountDetailsTxt);
}

function FnAddSearchAssetTypes(){
	var ArrAssetTypes = Object.keys(GblAssetsList);
	var multiselect = $("#assetTypeSearch").data("kendoMultiSelect");
	if(multiselect != undefined){
		multiselect.destroy();
	}
	
	$("#assetTypeSearch").kendoMultiSelect({
										  dataSource: {
											data: ArrAssetTypes
										  }
	});
	
	$("#assetTypeSearch").data("kendoMultiSelect").bind("change", FnSearchAssetTypeMarkers);

}

function FnSearchAssetTypeMarkers(){
	var multiselect = $("#assetTypeSearch").data("kendoMultiSelect");
	var ArrSelValue = multiselect.value();
	$('.pin').removeClass('highlight');
	$.each(ArrSelValue,function(key,val){
		$('.pin.'+val).addClass('highlight');
	});
	
}

function FnGetGrpMarkerName(VarAssetName){
	var VarGrpMarkerName = '';
	$.each(GblAssetsList,function(templatename,ArrAssets){
		if($.inArray(VarAssetName,ArrAssets) != -1){
			VarGrpMarkerName = templatename;
		}
	});
	
	return VarGrpMarkerName;
}

function FnConstructMapContent(ObjResponse){
	var VarAssetIdentifier = GblAssetsInfo[ObjResponse.datasourceName]['id'];
	
	if(GblAssetsInfo[ObjResponse.datasourceName]['template'] == 'Asset'){
		var Action = GblAppContextPath+'/equipments/asset/dashboard';
	} else {
		var Action = GblAppContextPath+'/equipments/genset/dashboard';
	}
	
	var VarAssetImageSrc = '';
	if($.inArray(ObjResponse.assetName+".png",GblImageList['asset']) != -1){
		var VarAssetImage = GblAppContextPath + VarAppImagePath + "/" + VarCurrentTenantInfo.tenantDomain + VarAppAssetImagePath + "/" + ObjResponse.assetName+".png";
		VarAssetImageSrc = '<img src='+VarAssetImage+' width="89" height="100" />';
	} else {
		VarAssetImageSrc = '';
	}
	
	var VarTxt = "";
	VarTxt += "<div class='monitoring-popup'>";
	VarTxt += "<figure>"+VarAssetImageSrc+"</figure>";
	VarTxt += "<section>";
	VarTxt += "<strong class='popup-header' title="+ObjResponse.assetName+">"+ObjResponse.assetName+"</strong>";
	VarTxt += "<aside class='brand-success'>Active</aside>";
	VarTxt += "<aside class='brand-default'><strong>Latitude: </strong> "+ObjResponse.latitude+"</aside>";
	VarTxt += "<aside class='brand-default' style='margin-bottom:10px;'><strong>Longitude: </strong> "+ObjResponse.longitude+"</aside>";
	if(ObjResponse.time != undefined && ObjResponse.time != ''){
		VarTxt += "<aside class='brand-default' style='margin-bottom:10px;'><strong>Timestamp: </strong> "+ObjResponse.time+"</aside>";
	}
	VarTxt += "<button class='btn btn-xs green' onclick='FnAssetDetailsPage(\""+VarAssetIdentifier+"\",\""+Action+"\")'> Asset details <i class='fa fa-edit'></i></button>";
	VarTxt += "<span class='map-history-btn'><button  class='btn btn-xs yellow map-history'  onclick='FnPopUpPlotAssetHistory(\""+VarAssetIdentifier+"\",\""+ObjResponse.assetName+"\",\""+ObjResponse.datasourceName+"\")'>Plot History&nbsp;&nbsp;<i class='fa fa-edit' aria-hidden='true'></i>&nbsp;</button></span>";
	VarTxt += "</section>";
	VarTxt += "</div>";		
	return VarTxt;
}

function FnPopUpPlotAssetHistory(VarIdentifier, VarAssetName, VarDataSourceName){
	//clearPlotHistoryDetails();
	$('#myModal').modal('show');  
	$('#VarIdentifier').val('');
	$('#VarAssetName').val('');
	$('#VarDataSourceName').val('');
	$('#asset-name-history').text('');
	$('#VarIdentifier').val(VarIdentifier);
	$('#VarAssetName').val(VarAssetName);
	$('#VarDataSourceName').val(VarDataSourceName);
	$('#asset-name-history').text('PLOT HISTORY - '+VarAssetName.toUpperCase());
	
	$('#startDate').val('');
	$('#endDate').val('');
	GblStartEnd.start.destroy();
	GblStartEnd.end.destroy();
	GblStartEnd.start = $("#startDate").kendoDatePicker({
		change: startChange,
		format: "dd/MM/yyyy"
	}).data("kendoDatePicker");

	GblStartEnd.end = $("#endDate").kendoDatePicker({
		change: endChange,
		format: "dd/MM/yyyy"
	}).data("kendoDatePicker");
	
	var VarDateToday = FnGetTodaysDate();
	$("#startDate").val(VarDateToday);
	$("#endDate").val(VarDateToday);
	
	GblStartEnd.start.max(VarDateToday);
	GblStartEnd.end.min(GblStartEnd.start.value());
	GblStartEnd.end.max(VarDateToday);
}
function FnPlotAssetHistory(){
	var VarDate1          = $('#startDate').val();
	var VarDate2          = $('#endDate').val();
	var VarIdentifier     = $('#VarIdentifier').val();
	var VarAssetName      = $('#VarAssetName').val();
	var VarDataSourceName = $('#VarDataSourceName').val();
	var VarDate1Check  	  = isValidDate(VarDate1);
	var VarDate2Check  	  = isValidDate(VarDate2);
	
	if(VarDate1=='' || VarDate2==''){
		notificationMsg.show({
			message : 'Please select dates'
		}, 'error');
			
	}else if(!VarDate1Check || !VarDate2Check){
		notificationMsg.show({
			message : 'Invalid Date'
		}, 'error');
		
		if(!VarDate1Check)  $('#startDate').val('');
		if(!VarDate2Check)  $('#endDate').val('');
	}
	else if(VarDataSourceName !=='' && VarDataSourceName!==null && VarDataSourceName!== undefined){			
		
		VarDate1 = VarDate1.split("/");
		var VarDate1Format = VarDate1[1]+"/"+VarDate1[0]+"/"+VarDate1[2];
		//var VarDate1TimeStamp = new Date(VarDate1Format).getTime();
		var VarDate1TimeStamp = FnConvertLocalToUTC(VarDate1Format);
		
		VarDate2 = VarDate2.split("/");
		var VarDate2Format = VarDate2[1]+"/"+VarDate2[0]+"/"+VarDate2[2];
		//var VarDate2TimeStamp = new Date(VarDate2Format).getTime();
		var VarDate2TimeStamp = FnConvertLocalToUTCTime(VarDate2Format);
		
		var date1 = new Date(VarDate1Format);
		var date2 = new Date(VarDate2Format);
		var timeDiff = Math.abs(date2.getTime() - date1.getTime());
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
		
		if(date1.getTime() > date2.getTime()){
			$('#startDate').val('');
			
			notificationMsg.show({
				message : 'Invalid Date'
			}, 'error');
		
		}
		else if(diffDays>7){
			notificationMsg.show({
				message : 'Only maximum 7 days can be selected'
			}, 'error');
			
		} else{
			$("#GBL_loading").show();
			var VarUrl = GblAppContextPath+'/ajax' + VarAssetsHistoryUrl;
			var VarMainParam = {
				"sourceId": VarDataSourceName,
				"startDate": VarDate1TimeStamp,
				"endDate": VarDate2TimeStamp,
				"customTags": ["Latitude","Longitude"]
			};
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResPlotAssetHistory);
		}
		
	}else{
		notificationMsg.show({
			message : 'Invalid Data Source'
		}, 'error');
	}	
}


	var ArrHistoryMarkersLayer = {};
	var ArrPolylineLayer= {};
	function FnResPlotAssetHistory(response){
		if(undefined !== response.customTags && response.customTags.length > 0){
			$('#assetsmonitoringmapsearch').hide();
			$("#GBL_loading").hide();
			$("#myModal").modal('toggle');
			var ArrResponseData = [];
			$.each(response,function(key,obj) {
				if(key == 'customTags'){
					$.each(obj,function(key,obj2){
						var checkLatLong;
						$.each(obj2,function(key,obj3){
							if(key == 'customTag' && obj3 == 'Latitude'){ // check if Latitude
								checkLatLong = true;
							}else if(key == 'customTag' && obj3 == 'Longitude'){ // check if Longitude
								checkLatLong = false;
							}

							if(key == 'values'){
								var i = 0;
								$.each(obj3,function(key,obj4){
									if(checkLatLong == true){ //Latitude Values									
										ArrResponseData[i] = [];
										ArrResponseData[i]['deviceTime'] = obj4.deviceTime;
										ArrResponseData[i]['Latitude'] = obj4.data;
									}
									else if(checkLatLong == false){ //Longitude Values
										if(ArrResponseData[i]['deviceTime'] === obj4.deviceTime){
											ArrResponseData[i]['Longitude'] = obj4.data;
										}else{
											ArrResponseData[i]['Longitude'] = '';
										}
									}
									i++;
								});
							}
						});
					});
				}		
			});	
			
			var LeafIcon = L.Icon.extend({
				options: {
					iconSize:     [12, 12]
					
				}
			});
			var LeafIconStart = L.Icon.extend({
				options: {
					iconSize:     [18, 18]
					
				}
			});
			var LeafIconEnd = L.Icon.extend({
				options: {
					iconSize:     [18, 18]
					
				}
			});
			
			var LeafIconPlay = L.Icon.extend({
				options: {
					iconSize:     [32, 32]
					
				}
			});
			
			var VarStartIcon   = new LeafIconStart({iconUrl: GblAppContextPath+'/plugins/leaflet/marker/map-green-dot.png'});
			var VarEndIcon     = new LeafIconEnd({iconUrl: GblAppContextPath+'/plugins/leaflet/marker/map-red-dot.png'});
			var VarDefaultIcon = new LeafIcon({iconUrl: GblAppContextPath+'/plugins/leaflet/marker/marker-history-default-blue.png'});
			
			var VarPlayIcon    = new LeafIconPlay({iconUrl: GblAppContextPath+'/plugins/leaflet/marker/marker-history-start.png'});
			var VarCnt=0;
			var VarResponseLength = ArrResponseData.length;

			var historyMarkers = new L.layerGroup();
			
			var movingMarkers = new L.layerGroup();
			var polylinePoints = [];
			var movingMarkerPoints = [];
			$.each(ArrResponseData,function(key,obj) {
				
				VarCnt++;
				var VarTimeStamp = toDateFormat(obj.deviceTime, 'F');
				var VarAssetName = $("span.k-in.k-state-selected").text();
				//var VarAssetName = '';
				
				if(obj.Latitude != '' && obj.Longitude !== ''){
					if(VarCnt == 1){
						var marker = new L.marker([obj.Latitude, obj.Longitude], {icon: VarStartIcon}).bindPopup('Start point: '+VarAssetName +' - '+VarTimeStamp+'').openPopup();
						
					}else if(VarCnt==VarResponseLength){
						var marker = new L.marker([obj.Latitude, obj.Longitude], {icon: VarEndIcon}).bindPopup('End point: '+VarAssetName +' - '+VarTimeStamp+'').openPopup();
					}
					else{
						var marker = new L.marker([obj.Latitude, obj.Longitude], {icon: VarDefaultIcon}).bindPopup(''+VarTimeStamp+'').openPopup();
					}
								
					marker.on('mouseover', function (e) {
						this.openPopup();
						  						
					});

					marker.on('mouseout', function (e) {
						
					});
					marker.on('click', function (e) {
						this.openPopup();
						
					});
					marker.addTo(historyMarkers);
					
					
				    ArrHistoryMarkersLayer[obj.deviceTime] = marker;
					polylinePoints.push(new L.LatLng(obj.Latitude, obj.Longitude));
					
					movingMarkerPoints.push([obj.Latitude, obj.Longitude]);
				}
			});
			

			map.addLayer(historyMarkers);  // history layer 1
			
			var polylineOptions = {
				color: '#009FD8',
				weight: 5,
				opacity: 1,
				lineJoin: 'round',
				clickable: false
			};
			
			var polylineOptions2 = {
				color: '#f44336',
				weight: 5,
				opacity: 1,
				lineJoin: 'round',
				clickable: false
			};
			
			var polyline = new L.Polyline(polylinePoints, polylineOptions);
		
			var movingPoliline = new L.Polyline(polylinePoints,polylineOptions2);
			map.addLayer(polyline);    		// history layer 2
						
			ArrPolylineLayer['polyline']=polyline;
			ArrPolylineLayer['movingPoliline']=movingPoliline;
			// zoom the map to the polyline
			map.fitBounds(polyline.getBounds());
			
			
			var VarMovingMarker = L.Marker.movingMarker(
			movingMarkerPoints,
			99999, {autostart: false}).addTo(movingMarkers);
			
			ArrHistoryMarkersLayer['moving_marker'] = VarMovingMarker;
			map.addLayer(movingMarkers);    // history layer 3

			VarMovingMarker.once('click', function () {
				//VarMovingMarker.start();
				VarMovingMarker.closePopup();
				VarMovingMarker.unbindPopup();
				VarMovingMarker.on('click', function() {
					if (VarMovingMarker.isRunning()) {
						VarMovingMarker.pause();
					} else {
						VarMovingMarker.start();
					}
					
					//map.removeLayer(historyMarkers);
					map.removeLayer(polyline);
					
					map.addLayer(movingPoliline);
					movingPoliline.snakeIn();
					map.removeLayer(movingMarkers);
				});
				
			});
			
		}else{
			$("#GBL_loading").hide();		
			notificationMsg.show({
				message : 'No data available'
			}, 'error');	
		}
		
	}

function FnRemoveMarkers(ArrRes){
	//alert(ArrRes.length)
	for(var i=0; i<ArrRes.length; i++){
		var marker = Arrmarkers[ArrRes[i]['assetName']];
		if(marker != undefined){
			map.removeLayer(marker);
			var VarGrpMarkerName = FnGetGrpMarkerName(ArrRes[i]['assetName']);
			var ArrTmp = GblAssetsMarkers[VarGrpMarkerName];
			ArrTmp.splice($.inArray(marker,ArrTmp),1);
			GblAssetsMarkers[VarGrpMarkerName] = ArrTmp;
		}
	} 
}

function FnAssetDetailsPage(VarIdentifier,VarAction){
	$('#dashboard_equip_id').val(VarIdentifier);
	$('#gapp-genset-dashboard').attr('action',VarAction);
	$('#gapp-genset-dashboard').submit();
}

/*-------------------------------------------------------*/
function FnGetTodaysDate(){
	var today = new Date();
	//var today = new Date('Thu Mar 31 2016 09:05:20 GMT+0400 (Arabian Standard Time)');
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	
	if(dd<10) {
		dd='0'+dd
	} 
	if(mm<10) {
		mm='0'+mm
	} 
	today = dd+'/'+mm+'/'+yyyy;
	return today;
}

function FnAddDaysToDate(numberOfdaysToAdd){
	var someDate = new Date();
	//var someDate = new Date('Thu Mar 31 2016 09:05:20 GMT+0400 (Arabian Standard Time)');
	//var numberOfDaysToAdd = 1;
	someDate.setDate(someDate.getDate() + parseInt(numberOfdaysToAdd)); 
	
	//Formatting to dd/mm/yyyy :
	var dd = someDate.getDate();
	var mm = someDate.getMonth() + 1;
	var yyyy = someDate.getFullYear();
	
	if(dd<10) {
		dd='0'+dd
	} 
	if(mm<10) {
		mm='0'+mm
	} 
	var someFormattedDate = dd+'/'+mm+'/'+ yyyy;
	return someFormattedDate;
}

function FnSubtractDaysToDate(numberOfdaysToSubtract){
	var someDate = new Date();
	//var someDate = new Date('Thu Mar 31 2016 09:05:20 GMT+0400 (Arabian Standard Time)');
	//var numberOfdaysToSubtract = 1;
	someDate.setDate(someDate.getDate() - parseInt(numberOfdaysToSubtract)); 
	
	//Formatting to dd/mm/yyyy :
	var dd = someDate.getDate();
	var mm = someDate.getMonth() + 1;
	var yyyy = someDate.getFullYear();
	
	if(dd<10) {
		dd='0'+dd
	} 
	if(mm<10) {
		mm='0'+mm
	} 
	var someFormattedDate = dd+'/'+mm+'/'+ yyyy;
	return someFormattedDate;
}

function isValidDate(text){
	//var text = '29/02/2011';
	var comp = text.split('/');
	var d = parseInt(comp[0], 10);
	var m = parseInt(comp[1], 10);
	var y = parseInt(comp[2], 10);
	var date = new Date(y,m-1,d);
	if (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d) {
		return true;
	} else {
		return false;
	}
 }  
 
/*-------------------------------------------------------*/

function clearPlotHistoryDetails() {
	if((Object.keys(ArrHistoryMarkersLayer)).length > 0){
		$.each(ArrHistoryMarkersLayer,function(key7,obj7){
			map.removeLayer(obj7);
		});
		ArrHistoryMarkersLayer = {};
	}
	if((Object.keys(ArrPolylineLayer)).length > 0){
		$.each(ArrPolylineLayer,function(key7,obj7){
			map.removeLayer(obj7);
		});
		ArrPolylineLayer ={};
	}
	//historyMarkers//polyline//movingMarkers
	if($('#assetsmonitoringmapsearch').hide()){
		$('#assetsmonitoringmapsearch').show();
	}
}
