var VarGensetIdentifier;
var GblPointName;
var VarCurrentSourceId;		

$(document).ready(function () {
	$('#header_notification_bar').hide();
	// hide the genset active status
	$('#genset-inactive').hide();
	$('#genset-active').hide();
	$('#no-gensetmapview span').html();

});

$(window).bind("beforeunload", function() { 
	if(GblIsSubcribe == true){
		GblIsSubcribe = false;
		FnUnSubscribe();
	}
});


/***** left location map. right live grid and right down chart *****/
function FnInitialization() {
	
	FnGetEquipmentInfo(VarDashbardId);  // get equipments info - Async
	FnInitiateMap();  // generate the left location map
	FnInitGensetGrid();  //grid for live point 
	var ArrChartData = [];
	FnInitGensetChartHIstory(ArrChartData);	
	FnGetLatestPointInfoOfDevice(VarDashbardId); // get latest point value for initial grid :async: false,	
	FnGetAssetList();  // Location of the asset  map point finder
	
}

function FnGetAssetList(){
	var VarUrl = GblAppContextPath + '/ajax' + VarListAssetsUrl;
	VarUrl = VarUrl + "?domain_name="+VarCurrentTenantInfo.tenantDomain;
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResAssetList);
}

function FnResAssetList(response){	
	var ArrResponse = response;
	if(ArrResponse.errorCode =='500'){
		$('#no-gensetmapview span').html(ArrResponse.errorMessage);		
	} else if($.isArray(ArrResponse)){
		var VarResLength = ArrResponse.length;
		if(VarResLength > 0){
			var ArrAssetLocations = [];	
			
			$.each(ArrResponse,function(){
				if(this.assetIdentifier.value == VarDashbardId){			

					if (this.latitude != null  && this.longitude != null){
						ArrAssetLocations.push({'latitude':parseFloat(this.latitude),'longitude':parseFloat(this.longitude),'assetType':this.assetTemplate});				
						
					} else{
						$('#no-gensetmapview').show();	
						$('#no-gensetmapview span').html('No location data available  - ' +GblAssetName);								
					}
					
				}
			});
			
			if (ArrAssetLocations.length >0){	
			$('#no-gensetmapview').hide();			
				FnApplyAssetMarkers(ArrAssetLocations);
			} else {				
				
				$('#no-gensetmapview').show();	
				$('#no-gensetmapview span').html('No location data available  - ' +GblAssetName);
			}
			
		}
		
	}
}


function FnGetEquipmentInfo(VarDashbardId){	
	
	var VarUrl = GblAppContextPath + '/ajax' + VarGetAssetFindDataUrl;
		
		var data = {
		"domain" : {
			"domainName" : VarCurrentTenantInfo.tenantDomain
		},
		"globalEntity" : {
			"globalEntityType" : "MARKER"
		},
		"entityTemplate" : {
			"entityTemplateName" : "Asset"
		},
		"identifier" : {
			"key" : "identifier",
			"value" : VarDashbardId
		}
	};
	
	$("#GBL_loading").show();
	$('.genset-pic, .genset-name, .div#genset-info').hide();
	FnMakeAsyncAjaxRequest(VarUrl, 'POST',JSON.stringify(data), 'application/json; charset=utf-8', 'json', FnResGetEquipmentInfo);
}
	
var GblAssetName;
function FnResGetEquipmentInfo(response){	

$('.genset-pic, .genset-name, .div#genset-info').show();
	var ArrResponse = response;	
	if(!$.isEmptyObject(ArrResponse)){
		$('#genset-name-label').text(ArrResponse.assetType);
		$('#genset-name').text(ArrResponse.assetName);
		GblAssetName = ArrResponse.assetName;
		$('#genset-description').text(ArrResponse.description);
		FnDisplayAssetImage();
		
	}
	
	var VarAssetInfoText = '';
	if(ArrResponse.assetId != undefined && ArrResponse.assetId != ''){
		VarAssetInfoText += '<li><span class="genset-properties-name" ><span class="dashboardtextleft-length" title="Asset Id">Asset Id</span></span><span class="genset-properties-value" ><span class="dashboardtext-length" title="'+ArrResponse.assetId+'">&nbsp '+ArrResponse.assetId+' </span></span></li>';
	}
	
	if(ArrResponse.serialNumber != undefined && ArrResponse.serialNumber != ''){
		VarAssetInfoText += '<li><span class="genset-properties-name" ><span class="dashboardtextleft-length" title="Serial Number">Serial Number</span></span><span class="genset-properties-value" ><span class="dashboardtext-length" title="'+ArrResponse.serialNumber+'">&nbsp '+ArrResponse.serialNumber+' </span></span></li>';
	}
	
	
	if(!$.isEmptyObject(ArrResponse.assetTypeValues)){
		$.each(ArrResponse.assetTypeValues, function(key, val){		
			if (val.value !='' && val.value !=undefined && val.key !='identifier'){					
				VarAssetInfoText += '<li><span class="genset-properties-name" ><span class="dashboardtextleft-length" title="'+val.key+'">'+val.key+' </span></span><span class="genset-properties-value" ><span class="dashboardtext-length" title="'+val.value+'">&nbsp '+val.value+' </span></span></li>';
			}
		
		});
	}
	
	$('#equipmentInfo').html(VarAssetInfoText); 
}

function FnDisplayAssetImage(){
	var ObjImage = new Image;
	ObjImage.src= GblAppContextPath + VarAppImagePath + "/" + VarCurrentTenantInfo.tenantDomain + VarAppAssetImagePath + "/" + GblAssetName+".png";
	$('.genset-pic img').attr('class','img-responsive');
	ObjImage.onload=function(){$('#asset_dis_image').attr('src',ObjImage.src);}
	ObjImage.onerror=function(){ $('#asset_dis_image').attr('src',GblAppContextPath + VarAppImagePath + VarAppDefaultImagePath + VarAppAssetImagePath + "/" + "assets.jpg");}
}


var ArrDestinations = [];
function FnGetLatestPointInfoOfDevice(VarDashbardId) {
	var VarUrl = GblAppContextPath + '/ajax' + VarGetAssetLatestUrl;
			
	var data = {
		"domain" : {
			"domainName" : VarCurrentTenantInfo.tenantDomain
		},
		"globalEntity" : {
			"globalEntityType" : "MARKER"
		},
		"entityTemplate" : {
			"entityTemplateName" : "Asset"
		},
		"identifier" : {
			"key" : "identifier",
			"value" : VarDashbardId
		}
	};
	
	FnMakeAsyncAjaxRequest(VarUrl, 'POST',JSON.stringify(data), 'application/json; charset=utf-8', 'json', FnResPointsOfSelectedGenset);
}
	
function FnResPointsOfSelectedGenset(response) {
	var ArrResponse = response;
	$('#genset-grid-toggle #loading').hide();

		if($.isArray(ArrResponse)){			
			var ArrParams = [];
			var VarDSName = '';			
			$.each(ArrResponse, function(key, ObjLatestPoint){
				var element = {};
				$.each(ObjLatestPoint.dataprovider, function(k, ObjLatestPointDetails){ 					 
					if(ObjLatestPointDetails.key == 'dataSourceName'){ 
						VarDSName = ObjLatestPointDetails.value;
					}					
					if(ObjLatestPointDetails.key == 'pointId'){ 
						element['displayid'] = ObjLatestPointDetails.value;
					}					
					if(ObjLatestPointDetails.key == 'unit'){ 
						element['unit'] = ObjLatestPointDetails.value; 
					}
					if(ObjLatestPointDetails.key == 'displayName'){ 
						element['name'] = ObjLatestPointDetails.value; 
					}
					if(ObjLatestPointDetails.key == 'data'){ 
					element['value'] = ObjLatestPointDetails.value; 
					}
					if(ObjLatestPointDetails.key == 'deviceTime'){ 
						element['time'] = ObjLatestPointDetails.value; 
					}
					ArrParams.push(element);			
				});

			});
		
		
			var message = {"body":[{"datasourceName":VarDSName,"messageType":"MESSAGE","parameters":ArrParams}]};	
			$("#GBL_loading").hide();
			//calling websocket	
			var ds = new Array();
			ds[0] = VarDSName;				
			FnGetSubscriptionInfo(ds);		
			FnHandleMessage(message,0);
		
		}
			
}
	
function FnGetSubscriptionInfo(ArrDataSources){
	var VarUrl = GblAppContextPath + '/ajax' + VarLiveSubscribeUrl;
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
var GblIsSubcribe = false;
function FnSubscribe(Websocketurl,destination){
	GblIsSubcribe = true;
	console.log(Websocketurl);
	console.log(destination);
	console.log('subscribe');
	webORB.defaultMessagingURL = Websocketurl;
	myConsumer = new Consumer(destination, new Async(FnHandleMessage,
				FnHandleFault));
	myConsumer.subscribe();
	
}

function FnHandleMessage(message,VarFlag) {
	console.log('live data----------------');
	console.log(JSON.stringify(message));
		
	var grid = $("#genset-gridview").data("kendoGrid");
	
	if (message.body != undefined) {
		
		var	content = message.body[0];
		if(VarFlag == undefined){
			var data = $.parseJSON(content);
		} else {
			var data = content;
		}
		
		var VarDSName = data.datasourceName;
		var ArrParameters = data.parameters;
		
		// live alarmalarm : data bind	 alarm-list		
		if (data.messageType =="ALARM") {	
			var ArrAlarmStatusMessage = data.statusMessage;	
			var ArrAlarmStatus = data.status;
			var ArrAlarmReceivedTime = data.receivedTime;
			var ArrAlarmRTime = toDateFormat(data.time);
					// live alarmalarm : data bind	 alarm-list
			var AlarmInfo = "<li> <span class='smsg'><span> Message: &nbsp<i class='fa fa-bullhorn'></i> </span>" + ArrAlarmStatusMessage + "</span> <span class='astatus'> <span>Status : </span> " + ArrAlarmStatus + "</span><span class='rtime'> <span>Received time:</span>" + ArrAlarmReceivedTime + "</span><span class='time'><span>Time: </span>" + ArrAlarmRTime + "</span></li> ";
			$('ul#alarm-list li').prepend(AlarmInfo);
			return;
		}
 		
		// genset active or inactive 		  
			var VarEngineSpeed;
			// genset active or inactive  if (ArrParameters[i].name === 'Generator Status') {
			for (var i = 0; i < ArrParameters.length; i++) {
			
				if (ArrParameters[i].name == 'Engine Speed') {
					VarEngineSpeed = ArrParameters[i].value;
					console.log('VarEngineSpeed '+VarEngineSpeed);
					if (VarEngineSpeed>0)					
					{ 
						$('#genset-inactive').hide();
						$('#genset-active').show();
					}
					else
					{
						$('#genset-inactive').show();
						$('#genset-active').hide();
					}
				}
				
			}
	
		// live grid data update
		for (var i = 0; i < ArrParameters.length; i++) {			
			var VarAlarmName = ArrParameters[i].name;
			var VarId = VarDSName.replace(/ /g, '_') +"_"+ VarAlarmName.replace(/ /g, '_');
			var isGExist = false;
			for (var k = 0; k < grid.dataSource.data().length; k++) {
				var VarChkId = grid.dataSource.data()[k].rowid;
				
				
				if (VarId == VarChkId) {
					isGExist = true;
					var item = grid.dataSource.data()[k];
					item.set('value', ArrParameters[i].value);
					item.set('time', ArrParameters[i].time);
				}
			}
			
			
			if (!isGExist) {				
				grid.dataSource.add({
								time : '',
								value : '',
								unit : ArrParameters[i].unit,
								rowid : VarId,
								datatype : ArrParameters[i].dataType,
								name: ArrParameters[i].name,
								displayid: ArrParameters[i].displayid,
								
				});
				
			}
			
			grid.dataSource.sync();
			
		}
	
	}	

}
/****** end FnHandleMessage */

var Arrmarkers = [];
function FnApplyAssetMarkers(ArrRes) {
	if(ArrRes.length > 0){
		if (Arrmarkers.length > 0) {
			FnRemoveMarkers();
		}

		$.each(ArrRes,function(){
			var VarIcon = FnGetMarkerHtmlIcon(this.assetType);
			var marker = L.marker([this.latitude, this.longitude], {icon: VarIcon}).addTo(map);
			Arrmarkers.push(marker);
			FnDisplayAssetTypeImage(this.assetType);
		});
		var marker = Arrmarkers[0];
		var VarZoom = parseInt(map.getZoom());
		map.setView(marker.getLatLng(), VarZoom);	
	}
	
}

function FnDisplayAssetTypeImage(VarAssetTemplate){
	var ObjImage = new Image;
	ObjImage.src= GblAppContextPath + VarAppImagePath + "/" + VarCurrentTenantInfo.tenantDomain + VarAppAssetTypeImagePath + VarAppMarkerImagePath + "/" + VarAssetTemplate+".png";
	ObjImage.onload=function(){$('#assettype_dis_image').attr('src',ObjImage.src);}
	ObjImage.onerror=function(){ $('#assettype_dis_image').attr('src',GblAppContextPath + VarAppImagePath + VarAppDefaultImagePath + VarAppAssetTypeImagePath + VarAppMarkerImagePath + "/" + "noimage.png");}
}

function FnGetMarkerHtmlIcon(VarAssetTemplate){

	var VarAssetTypeImage = GblAppContextPath + VarAppImagePath + "/" + VarCurrentTenantInfo.tenantDomain + VarAppAssetTypeImagePath + VarAppMarkerImagePath + "/" + VarAssetTemplate+".png";
	var VarAssetTypeImageSrc = '<img name="assettype_dis_image" id="assettype_dis_image" src='+VarAssetTypeImage+' style="height:23px" />';

	var icon = L.divIcon({
		className: '',
		iconSize: [45, 45],
		iconAnchor:   [22, 45],
		popupAnchor:  [0, -37],
		html:'<div class="pin '+VarAssetTemplate+'">'+VarAssetTypeImageSrc+'</div>'
   });
   
   return icon;
   
}

function FnGetMarkerIcon(Latitude, Longitude){
	var LeafIcon = L.Icon.extend({
		options: {
			iconSize:     [46, 70],
			iconAnchor:   [23, 70], // Latitude, Longitude
			shadowAnchor: [4, 62],
			popupAnchor:  [0, -76]
		}
	});
	var VarIcon = new LeafIcon({iconUrl: GblAppContextPath+'/plugins/leaflet/marker/common.png'});
	return VarIcon;
}



function FnRemoveMarkers() {
	var VarMarkerLength = Arrmarkers.length;
	for (var i = 0; i < VarMarkerLength; i++) {
		map.removeLayer(Arrmarkers[i]);
	}
}

function FnHandleFault(fault) {
	console.log('fault');
}

function FnUnSubscribe() {
	GblIsSubcribe = false;
	myConsumer.unsubscribe();
	console.log("unsubscribed");
}

 
function FnCheckForUnitless(VarUnit){		
	if (VarUnit =='unitless') {VarUnit=' - '};
	return VarUnit;
}

function FnCheckTimeEmpty(VarTime){
	if (VarTime =='' || VarTime==null) {
		VarTime=' - ';			
	} else {
		VarTime =toDateFormatRemoveGMT(VarTime, 'F');			
	}
	return VarTime;
}

function FnCheckForValue(VarValue){
	if (VarValue == '' || VarValue== null) {
			VarValue=' - ';			
	}			
	return VarValue;	
}
 
function FnInitGensetGrid() {	
	$('#loading').show();
		
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
		
	var ArrColumns = [					
				{
					field : "displayid",
					title : "Point Id",
					sortable: false,
					width: 80
				},
				{
					field : "name",
					title : "Point name",
					sortable: true,
					filterable:true,
					width: 180
				}, 
				{
					field : "value" ,
					title : "Value",
					filterable:false,
					sortable: false,
					width: 60,
					template :"#: FnCheckForValue(value)#",
				},
				{
					field : "unit" ,
					title : "Unit",
					filterable:false,
					sortable: false,					
					template :"#: FnCheckForUnitless(unit)#",
					width: 80
				
				},{
					field : "time",
					title : "Time stamp (GMT)",
					template :"#: FnCheckTimeEmpty(time)#",		
					sortable: false,
					filterable:false,
					width: 170
				}
				
			];

	var gridViewHeight=354;
			
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row", extra: false },
		"sortable": { mode: "single",	"allowUnsort": true},
		"height" :gridViewHeight,
		"pageable" : { pageSize: 16,numeric: true, pageSizes: true, refresh: false },
		"selectable" : true,
		"resizable": true		
	};
	
	FnDrawGridView('#genset-gridview',deviceData,ArrColumns,ObjGridConfig);	
	
	/* sorting column injected*/	
	var kendoGrid = $("#genset-gridview").data('kendoGrid');
	var dsSort = [];
	dsSort.push({ field: "name", dir: "asc" });
	kendoGrid.dataSource.sort(dsSort);	
	
	/* grid change event */			
	kendoGrid.bind("change", FnGridChangeEvent);
	
	
	kendoGrid.setOptions({
          toolbar: [
					 {
						name: "Maximize",
						text: "Maximize",
						template:'#= FnAssetGridExpand()#'
						
					 }
				]
    });	

}

function FnGridChangeEvent(){
	var kendoGrid = $("#genset-gridview").data('kendoGrid');
	var row = kendoGrid.select();
	var data = kendoGrid.dataItem(row);		
	FnInitHistroyData(data);
}

var VarIsTrue = true ;
function FnResAssetGridExpand(){	
	 var grid = $("#genset-gridview").data("kendoGrid");
	 
	 if (VarIsTrue){	
		
		grid.setOptions({
			  height: 530
		});
		$('#genset-gridview').css({'margin':'10px' });
		$('#gensetLiveData').css({'height':'556px' });
		$('#genset-grid-toggle').removeClass('col-md-4').addClass('col-md-12').css({'padding':'0','height':'auto'});
		$('#asset-alarms-toggle').removeClass('col-md-4').addClass('col-md-12');
		$('#gProperties, #asset-alarms-toggle').hide();
		$('#genset-grid-toggle').removeClass('col-md-12').addClass('col-md-6');
		$('#gapps-chart').removeClass('col-md-12').addClass('col-md-6').css({'padding':'0px 0px 0px 6px'});
		$('#xpand-view').removeClass('col-md-9').addClass('col-md-12').css({'padding':'0px 8px' });
		VarIsTrue=false; 
	 }
	 else{
		
		 grid.setOptions({
			  height: 340
			});
			$('#gensetLiveData').css({'height':'310px' });
		$('#genset-grid-toggle').removeClass('col-md-12').addClass('col-md-6');
		$('#asset-alarms-toggle').removeClass('col-md-12').addClass('col-md-4');
		$('#genset-grid-toggle').css('height','360');
		$('#gProperties,  #asset-alarms-toggle').show();
		$('#genset-grid-toggle').removeClass('col-md-6').addClass('col-md-12');
		
		$('#gapps-chart').removeClass('col-md-6').addClass('col-md-12').css({'padding':'0px 6px 0px 0px'});
		$('#xpand-view').removeClass('col-md-12').addClass('col-md-9');
		VarIsTrue=true;		 
	 }
     
}

var GblPointName;
function FnInitHistroyData(ObjSelecetdPoint){	
		
	var sd= ObjSelecetdPoint.rowid;
	var ctags= ObjSelecetdPoint.rowid;		
		
	var ctagsOutput = ctags.substring(ctags.indexOf("_") + 1);		
	var CurrentSourceId = sd.split('_')[0];
		
			
	var ObjEquipment = {};		
	var ToDay = new Date();	
		
	var VarStartDate = FnConvertLocalToUTC(FnAssetDateProcess('current'));
	var VarEndDate = FnConvertLocalToUTC(FnAssetDateProcess('next',1));
	var ArrCustomTags=[];
		
	var VarParam = {};
	VarParam['sourceId'] = CurrentSourceId;		
	VarParam['startDate'] = VarStartDate;
	VarParam['endDate'] = VarEndDate;	
		
	GblPointName = ObjSelecetdPoint.name;	
	ArrCustomTags.push(ObjSelecetdPoint.name);			
	VarParam['customTags'] = ArrCustomTags;	
	var VarUrl = GblAppContextPath + '/ajax' + VarGetDeviceDataUrl;			
	FnMakeAjaxRequest(VarUrl,'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResInitHistroyData);
}

function FnResInitHistroyData(response){
	var ArrResponse = response;
	var ErrorMsgHistroyData =" Point cannot be plotted";
	if (!$.isEmptyObject(ArrResponse)) {
		if(ArrResponse.errorCode == undefined && ArrResponse.customTags != undefined && ArrResponse.sourceId != undefined){
				
			var ArrResponseData = [];
			$.each(ArrResponse.customTags, function (key, val) {
				$.each(val.values,function (key, val){
					var element = {};
					element["deviceTime"] = val.deviceTime;
					element["data"] = val.data;					
					ArrResponseData.push(element);
				});
			});
			
			if(ArrResponseData.length > 0){
				FnInitGensetChartHIstory(ArrResponseData);
			}
				
		} else {	
			
			if (ArrResponse.errorCode =="508"){
				ErrorMsgHistroyData= " Point name is invalid";
				var ErrStatus = 'error';
			}
			else if(ArrResponse.errorCode =="500"){
				ErrorMsgHistroyData =" Requested data is not available";
				var ErrStatus = 'info';
			} else{
				ErrorMsgHistroyData= ArrResponse.errorMessage;
				var ErrStatus = 'error';
			};
			notificationMsg.hide();
			notificationMsg.show({
					message : ErrorMsgHistroyData
			}, ErrStatus);
			var ArrResponseData = [];
			FnInitGensetChartHIstory(ArrResponseData);
		}
	}
}
	
function FnInitGensetChartHIstory(response) {		
	var ArrResponse = response;			
		
	// get current time down the history chart
	var dt = new Date();
	var currentTime = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
	
	var currentGMTtime = new Date().getTime();		
	var VarTime =FnGMTtime(currentGMTtime, 'F');
	$('.bright').html(FntoGMTAlone(FnToUTC(dt), 'F','localTime'));
			
	var TempTitle = '';		
	 if (GblPointName != undefined) {
		TempTitle = GblPointName + "   "; 
	 }
	 
	 var chartDate =toDateFormatChart(new Date());
		 
$("#genset-chart").kendoChart({
	title : {
		//text: TempTitle +" (Today)",
		text: TempTitle + '('+chartDate+')',
		align: "center",
		background: "transparent",
		color: "#FFFFFF",
		margin: {
			top: -12
		}
	},
	chartArea: {
		background: "transparent"
	},
	
	dataSource: {
		data: ArrResponse
	},
	legend : {
		visible: false
		
	},
	seriesDefaults : {			
		style : "smooth",
		type : "line",
		labels: {
					visible: false,
					background: "transparent"
				},
		area: {
			line: {
				style: "smooth"
			}
		}
	},
	valueAxis: {
				majorGridLines: {
					visible: true
				},
				visible: true
			},
	 series: [{
				field: "data",
				color: "#FF3E01",
				tooltip: {
					  visible: true
					}
			}],
	 dataBound: function(e) {
			var view = e.sender.dataSource.view();	 
			$(".overlay").toggle(view.length === 0);
				 
				 
			 },
	seriesColors:["#FF5733"],
	categoryAxis: {
				field: "deviceTime",
				majorGridLines: {
					visible: false
				},
				line: {
					visible: true
				},
				labels: {
				  visible: false
				},
				title: { 
				text: 'Time',
				visible: false
				}
			},
		tooltip: {
				visible: true,
				format: "{0}%",					
				template: "  #= toDateFormatRemoveGMT(category,':')# || #= value #"
			}

		});

}
	
	//Export chart to PDF
$("#btnExport").attr("disabled", false);	//Export to CSV
	
$("#btnExport").click(function() {
	console.log('pdf '+GblPointName);
	//GblPointName ="print-chart";
	var d = new Date();var month = d.getMonth()+1;
	var day = d.getDate();
	var output = d.getFullYear() + '/' +
		((''+month).length<2 ? '0' : '') + month + '/' +
		((''+day).length<2 ? '0' : '') + day;

	var PDFFileName= "equp-print-chart-"+output+".pdf";
		var chart = $("#genset-chart").getKendoChart();
		chart.exportPDF({ paperSize: "auto", margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" } }).done(function(data) {
			kendo.saveAs({
				dataURI: data,
				fileName: PDFFileName
			   
			});
		});
});


var map = null;
var streets;
var hybrid;

function FnInitiateMap() {
	streets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
			id : 'Street',
			minZoom: 1,
			maxZoom : 18,
			subdomains : ['mt0', 'mt1', 'mt2', 'mt3'],
			attribution : ""
		});

	hybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
			id : 'Satellite',
			minZoom: 1,
			maxZoom: 18,
			subdomains : ['mt0', 'mt1', 'mt2', 'mt3'],
			attribution : ""
		});

	map = L.map('gensetmapview', {
			zoom : 8,
		//	center : [25.138486, 55.230246],// Dubai
			center: [40.9743827,-97.6000859], // US LatLng 25.20, 55.27
			layers : [hybrid, streets],
			zoomControl : true,
			attributionControl : true
			
			
		});

	var baseMaps = {
		"Satellite" : hybrid,
		"Streets" : streets

	};

	L.control.layers(baseMaps).addTo(map);
}



$("#stickyMenu").animate({ right: "-18px" }, {queue: false});

$("#stickyMenu").hover(function(){
    $(this).stop().animate({ right: "10px" }, {queue: false});
}, function() {
    $(this).stop().animate({ right: "0px" }, {queue: false});
});

function FnNavigateClientPage(VarActionUrl){
	$("#gapp-client-navigation").attr('action',VarActionUrl);
	$("#gapp-client-navigation").submit();
}