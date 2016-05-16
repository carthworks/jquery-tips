"use strict";

var line = {};
var clickCircle;
var ArrPolyMarkers = [];
var ArrPolyLines = [];
var GblEdit = 0;
$(document).ready(function(){
	FnInitiateMap();
	FnInitPolygonGrid();
	FnInitRoadmapGrid();
	
	map.on('click', function(e) {
		if(GblEdit==1){	return false; }
		var VarIcon = FnGetMarkerIcon('blue');
		if(GblGeoType === 'Circle'){
			
			if(ArrPolyMarkers.length == 0){
						
				var geomarker = L.marker(e.latlng,{icon: VarIcon, draggable: true}).addTo(map);
				ArrPolyMarkers.push(geomarker);
				geomarker.on("drag", FnDragEvent);
			} else if(ArrPolyMarkers.length !=0){
				if (clickCircle != undefined) {
					map.removeLayer(clickCircle);
				}
				var c = e.latlng;				
				var fc = ArrPolyMarkers[0].getLatLng();				
				var dis = fc.distanceTo(c);
				var ObjCircleOptions = FnGetStyleProperties();				
				clickCircle = L.circle(fc, dis, ObjCircleOptions).addTo(map);
				$('#latitude').val(fc.lat);
				$('#longitude').val(fc.lng);				
				$('#radius').val(dis/1000);
			}
		
		} else if(GblGeoType === 'Polygon') {
			var geomarker = L.marker(e.latlng,{icon: VarIcon, draggable: true}).addTo(map);
			ArrPolyMarkers.push(geomarker);
			line[geomarker._leaflet_id] = geomarker;
			geomarker.on("drag", FnDragEvent);
			geomarker.on("mouseover", FnMouseoverEvent);
			geomarker.on("mouseout", FnMouseoutEvent);
			FnManagePolygonGrid(geomarker);			
			FnCreatePolygon();
			
		} else if(GblGeoType === 'Route'){

			var geomarker = L.marker(e.latlng,{icon: VarIcon, draggable: true}).addTo(map);
			ArrPolyMarkers.push(geomarker);
			line[geomarker._leaflet_id] = geomarker;
			geomarker.on("drag", FnDragEvent);
			geomarker.on("mouseover", FnMouseoverEvent);
			geomarker.on("mouseout", FnMouseoutEvent);
			FnManageRoadMapGrid(geomarker);
			if(ArrPolyMarkers.length > 1){
				FnDrawRoadMap();
			}
		}
		
	});
	
	map.on('zoomend', function(e) {
		if(GblEdit==1){	return false; }
		var VarZoomVal = map.getZoom();
		$('#zoom').val(VarZoomVal);
	});
	
	// Form Validation
	$("#gapp-geofence-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
											rules : {
												available:function(input){
													var validate = input.data('available');
													var VarExist = true;
													if (typeof validate !== 'undefined' && validate !== false) {
														var url = input.data('available-url');
														var VarParam = {"domain": {"domainName": VarCurrentTenantInfo.tenantDomain},"fieldValues": [{"key": "geofenceName","value": FnTrim(input.val())}]};
														$.ajax({
															type:'POST',
															cache: true,
															async: false,
															contentType: 'application/json; charset=utf-8',
															url: GblAppContextPath+"/ajax" + url,
															data: JSON.stringify(VarParam),
															dataType: 'json',
															success: function(result) {
																var ObjExistStatus = result;																
																if(ObjExistStatus.status == 'SUCCESS'){ // Exist in db
																	VarExist = true;
																} else if(ObjExistStatus.status == 'FAILURE') { // Does not exist in db
																	VarExist = false;
																}
															},
															error : function(xhr, status, error) {
															
															}
														});
													}
													return VarExist;
												}
											},
											messages : {
												available: function(input) { 
													return input.data("available-msg");
												}
											}
	});
	
	$("#geofence_border_color").kendoColorPicker({
		value: "#3388ff",
		buttons: false,
	});
	
	$("#geofence_fill_color").kendoColorPicker({
		value: "#3388ff",
		buttons: false,
	});
	
	$("#geofence_border_color, #geofence_fill_color, #geofence_border_weight, #geofence_border_opacity, #geofence_fill_opacity, #geofence_road_width").change(function(){	
		FnChangeGeofenceStyle();
    });
	
	$('#zoom').change(function(){
		var VarZoomVal = parseInt($('#zoom').val());
		FnSetMapZoom(VarZoomVal);
	});
			
});

$(window).load(function(){
	if(VarEditGeofenceId != ''){
		FnGetGeofenceDetails(VarEditGeofenceId);
	}
});

function FnGetMarkerIcon(VarColor){

	var icon = new L.Icon({
		iconUrl: GblAppContextPath +'/plugins/leaflet/marker/'+VarColor+'_marker.png',
		shadowUrl: GblAppContextPath +'/plugins/leaflet/images/marker-shadow.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowSize: [41, 41]
	});
   
   return icon;
   
}

function FnSetMapZoom(VarZoom){
	map.setZoom(parseInt(VarZoom));
}

function FnGridChangeEvent(e){
	if(GblEdit==1){	return false; }
	var VarIcon = FnGetMarkerIcon('blue');
	$.each(ArrPolyMarkers,function(){
		this.setIcon(VarIcon);
	});
	
	var rows = this.select();
	if(rows.length > 0){
		var selectedItem = this.dataItem(rows);
		FnHighlightMarker(selectedItem);
	}
}

function FnHighlightMarker(ObjMarker){
	var VarMarkerId = ObjMarker.markerid;
	var VarMarker = line[VarMarkerId];
	var VarIcon = FnGetMarkerIcon('red');
	VarMarker.setIcon(VarIcon);
}

var GblGeoType = 'Polygon'; // Route , Polygon , Circle
function FnDefineGeofenceType(VarGeoType){
	GblGeoType = VarGeoType;
	FnClearGeofence();
}

function FnChangeGeofenceStyle(){
	var ObjStyleOptions = FnGetStyleProperties();
	if(GblGeoType === 'Polygon'){
		if(ArrPolyLines.length > 0){
			ArrPolyLines[0].setStyle(ObjStyleOptions);
		}
	} else if(GblGeoType === 'Circle'){
		if(clickCircle != undefined){
			clickCircle.setStyle(ObjStyleOptions);
		}
	} else if(GblGeoType === 'Route'){
		if(ArrPolyMarkers.length > 1){
			FnDrawRoadMap();
		}
	}
}

function FnGetStyleProperties(){
	var ObjProperties = {};
	
	var ObjBorder = $("#geofence_border_color").data("kendoColorPicker");
	var ObjFill = $("#geofence_fill_color").data("kendoColorPicker");

	var VarBorderColor = (ObjBorder != undefined && ObjBorder.value() != '') ? ObjBorder.value() : '#3388ff';
	var VarBorderWeight = ($('#geofence_border_weight').val() != '') ? $('#geofence_border_weight').val() : 3;
	var VarBorderOpacity = ($('#geofence_border_opacity').val() != '') ? $('#geofence_border_opacity').val() : 1;
	var VarFillColor = (ObjFill != undefined && ObjFill.value() != '') ? ObjFill.value() : '#3388ff';
	var VarFillOpacity = ($('#geofence_fill_opacity').val() != '') ? $('#geofence_fill_opacity').val() : 0.2;
	
	if(GblGeoType==='Polygon' || GblGeoType==='Circle'){
	
		ObjProperties = {
					stroke : true,
					color : VarBorderColor,
					weight : VarBorderWeight,
					opacity : VarBorderOpacity,
					fill : true,
					fillColor : VarFillColor,
					fillOpacity : VarFillOpacity,
					className : ''
		};
		
	} else {
	
		ObjProperties = {
					stroke : true,
					color : VarBorderColor,
					weight : VarBorderWeight,
					opacity : VarBorderOpacity,
					fill : false,
					fillColor : VarFillColor,
					fillOpacity : VarFillOpacity,
					className : '',
					lineCap : 'round',
					lineJoin : 'round'
		};
	
	}
	
	return ObjProperties;
}

function FnCreatePolygon(){

	if(ArrPolyLines.length > 0){
		map.removeLayer(ArrPolyLines[0]);
		ArrPolyLines = [];
	}
	
	var polygonPoints = [];
	var leafletid;
	for(leafletid in line){
		var ObjPolyMarker = line[leafletid];
		polygonPoints.push(ObjPolyMarker.getLatLng());
	}
	
	var ObjPolygonOptions = FnGetStyleProperties();			
	var polygon = new L.Polygon(polygonPoints,ObjPolygonOptions).addTo(map);
	ArrPolyLines.push(polygon);
	
}

function FnDragEvent(e){
	if(GblEdit==1){	return false; }
	var marker = e.target;
	var VarMarkerPos = $.inArray(marker, ArrPolyMarkers);
	ArrPolyMarkers.splice(VarMarkerPos,1);
	ArrPolyMarkers.splice(VarMarkerPos, 0, marker);
	
	if(GblGeoType === 'Polygon'){
		line[marker._leaflet_id] = marker;
		FnManagePolygonGrid(marker);
		FnCreatePolygon();
	} else if(GblGeoType === 'Route'){
		line[marker._leaflet_id] = marker;
		FnManageRoadMapGrid(marker);
		if(ArrPolyMarkers.length > 1){
			FnDrawRoadMap();
		}
	} else if(GblGeoType === 'Circle'){
		if (clickCircle != undefined) {
			map.removeLayer(clickCircle);
			
			var ObjCircleOptions = FnGetStyleProperties();
			var fc = ArrPolyMarkers[0].getLatLng();
			var dis = $('#radius').val() * 1000;
			clickCircle = L.circle(fc, dis, ObjCircleOptions).addTo(map);
			$('#latitude').val(fc.lat);
			$('#longitude').val(fc.lng);
		}
	}
}

function FnMouseoverEvent(e){
	if(GblEdit==1){	return false; }
	var marker = e.target;
	var VarMarkerId = marker._leaflet_id;
	var VarRowId = 'marker_'+VarMarkerId;
	$('#'+VarRowId).css('background-color', '#f44336');
}

function FnMouseoutEvent(e){
	if(GblEdit==1){	return false; }
	var marker = e.target;
	var VarMarkerId = marker._leaflet_id;
	var VarRowId = 'marker_'+VarMarkerId;
	$('#'+VarRowId).css('background-color', '');
}

var map = null;
var streets;
var hybrid;
function FnInitiateMap(){
	var VarZoomLevel = parseInt($('#zoom').val());
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
    
    map = L.map('geofencegmap', {
        zoom: VarZoomLevel,
        center: [25.20, 55.27],
        layers: [hybrid,streets],
        zoomControl: true,
        attributionControl: true
    });
	map.zoomControl.setPosition('bottomleft');

    var baseMaps = {
        "Satellite": hybrid,
        "Streets": streets
    };

    L.control.layers(baseMaps,null,{position: 'topleft'}).addTo(map);
	
}

function FnDrawRoadMap(){

	var VarMarkerLength = ArrPolyMarkers.length;
	var coords = [];
	for(var i=0; i<VarMarkerLength; i++){
		coords.push((ArrPolyMarkers[i]).getLatLng());
	}
	
	if(ArrPolyLines.length > 0){
		for(var j=0; j<ArrPolyLines.length; j++){
			map.removeLayer(ArrPolyLines[j]);
		}
		ArrPolyLines = [];
	}
	
	var ObjStyleOptions = FnGetStyleProperties();
	var VarOffset = parseInt($('#geofence_road_width').val() / 2);
	
	var originPolyline = L.polyline(coords,ObjStyleOptions).addTo(map);
	originPolyline.setStyle({color :'#000000'});
	ArrPolyLines.push(originPolyline);

	var leftPolyline = L.polyline(coords, ObjStyleOptions).addTo(map);
	leftPolyline.setStyle({dashArray :'5,10'});
	leftPolyline.setOffset(-VarOffset);
	ArrPolyLines.push(leftPolyline);

	var rightPolyline = L.polyline(coords, ObjStyleOptions).addTo(map);
	rightPolyline.setStyle({dashArray :'5,10'});
	rightPolyline.setOffset(VarOffset);
	ArrPolyLines.push(rightPolyline);
			  
}

function FnClearGeofence(){
	if(ArrPolyMarkers.length > 0){
		for(var i=0; i<ArrPolyMarkers.length; i++){
			map.removeLayer(ArrPolyMarkers[i]);
		}
		ArrPolyMarkers = [];
	}
	
	if(ArrPolyLines.length > 0){
		for(var j=0; j<ArrPolyLines.length; j++){
			map.removeLayer(ArrPolyLines[j]);
		}
		ArrPolyLines = [];
	}

	if (clickCircle != undefined) {
		map.removeLayer(clickCircle);
		clickCircle = null;
	}
	
	$("#draw-polygon-grid").data("kendoGrid").dataSource.data([]);
	$("#draw-roadmap-grid").data("kendoGrid").dataSource.data([]);
	$('#latitude, #longitude, #radius').val('');
		
	line = [];
}

function FnInitPolygonGrid(){		
					
	var grid = $("#draw-polygon-grid").kendoGrid({
					autoBind : true,
					dataSource : [],
					rowTemplate: kendo.template($("#rowTemplate").html()),		
					pageable : {
						pageSize:5,
						numeric: false,
						previousNext: true,
						messages: {
						  empty: "No Records"
						}
					},
					height : 220,
					noRecords: true,
					messages: {
						noRecords: "No Records"
					},
					columns : [
								{
									field : "latitude",
									title : "Latitude"
								},
								{
									field : "longitude",
									title : "Longitude"
								},
								{
									field : "markerid",
									title : "Action",
									width:60
								}
							],
					selectable: true
				});
				
		
	$("#draw-polygon-grid").data("kendoGrid").tbody.on("click", ".remove_marker", function(e) {
		if(GblEdit==1){	return false; }
		var tr = $(this).closest("tr");
		var data = $("#draw-polygon-grid").data('kendoGrid').dataItem(tr);
		FnRemovePolygonMarker(data);
	});
	
	var polygonlist = $("#draw-polygon-grid").data("kendoGrid");
	polygonlist.bind("change", FnGridChangeEvent);
}

function FnInitRoadmapGrid(){	
					
	var grid = $("#draw-roadmap-grid").kendoGrid({
					autoBind : true,
					dataSource : [],
					rowTemplate: kendo.template($("#rowTemplate").html()),		
					pageable : {
						pageSize:5,
						numeric: false,
						previousNext: true,
						messages: {
						  empty: "No Records"
						}
					},
					height : 220,
					noRecords: true,
					messages: {
						noRecords: "No Records"
					},
					columns : [
								{
									field : "latitude",
									title : "Latitude"
								},
								{
									field : "longitude",
									title : "Longitude"
								},
								{
									field : "markerid",
									title : "Action",
									width:60
								}
							],
					selectable: true
				});
				
	$("#draw-roadmap-grid .k-grid-content").mCustomScrollbar({
		setWidth: false,
		setHeight: false,
		setTop: 0,
		setLeft: 0,
		axis: "y",
		scrollbarPosition: "inside",
		autoExpandScrollbar: true,
		alwaysShowScrollbar: 0,
		live: "on",
		autoHideScrollbar:true,
		theme: "minimal-dark"
	});	
				
	$("#draw-roadmap-grid").data("kendoGrid").tbody.on("click", ".remove_marker", function(e) {
		if(GblEdit==1){	return false; }
		var tr = $(this).closest("tr");
		var data = $("#draw-roadmap-grid").data('kendoGrid').dataItem(tr);
		FnRemovePolygonMarker(data);
	});
	
	var roadmaplist = $("#draw-roadmap-grid").data("kendoGrid");
	roadmaplist.bind("change", FnGridChangeEvent);
				
}

function FnRemovePolygonMarker(ObjItem){
	var VarMarkerId = ObjItem.markerid
	var VarMarker = line[VarMarkerId];
	map.removeLayer(VarMarker);
	var VarMarkerPos = $.inArray(VarMarker, ArrPolyMarkers);
	ArrPolyMarkers.splice(VarMarkerPos,1);
	delete line[VarMarkerId];
	
	var VarRowId = ObjItem.rowid;
	
	if(GblGeoType === 'Polygon'){
		var grid = $("#draw-polygon-grid").data("kendoGrid");
		var dataItem = grid.dataItem($('#'+VarRowId));
		grid.dataSource.remove(dataItem);
		FnCreatePolygon();
	} else if(GblGeoType === 'Route'){
		var grid = $("#draw-roadmap-grid").data("kendoGrid");
		var dataItem = grid.dataItem($('#'+VarRowId));
		grid.dataSource.remove(dataItem);
		if(ArrPolyMarkers.length > 1){
			FnDrawRoadMap();
		}
	}
}

function FnManagePolygonGrid(ObjMarker){
	var VarLatitude = (ObjMarker.getLatLng()).lat;
	var VarLongitude = (ObjMarker.getLatLng()).lng;
	var VarMarkerId = ObjMarker._leaflet_id;
	var VarRowId = 'marker_'+ObjMarker._leaflet_id;
	var isGExist = false;
	var grid = $("#draw-polygon-grid").data("kendoGrid");
	var VarId = VarRowId;
	for (var k = 0; k < grid.dataSource.data().length; k++) {
		var VarChkId = grid.dataSource.data()[k].rowid;
		if (VarId == VarChkId) {
			isGExist = true;
			var item = grid.dataSource.data()[k];
			item.set('latitude', VarLatitude);
			item.set('longitude', VarLongitude);	
		}
	}
	
	if (!isGExist) {
		grid.dataSource.add({
							latitude : VarLatitude,
							longitude : VarLongitude,
							markerid : VarMarkerId,
							rowid : VarId
							
			});
	}
	
	grid.dataSource.sync();
	
}

function FnManageRoadMapGrid(ObjMarker){
	var VarLatitude = (ObjMarker.getLatLng()).lat;
	var VarLongitude = (ObjMarker.getLatLng()).lng;
	var VarMarkerId = ObjMarker._leaflet_id;
	var VarRowId = 'marker_'+ObjMarker._leaflet_id;
	var isGExist = false;
	var grid = $("#draw-roadmap-grid").data("kendoGrid");
	var VarId = VarRowId;
	for (var k = 0; k < grid.dataSource.data().length; k++) {
		var VarChkId = grid.dataSource.data()[k].rowid;
		if (VarId == VarChkId) {
			isGExist = true;
			var item = grid.dataSource.data()[k];
			item.set('latitude', VarLatitude);
			item.set('longitude', VarLongitude);	
		}
	}
	
	if (!isGExist) {
		grid.dataSource.add({
							latitude : VarLatitude,
							longitude : VarLongitude,
							markerid : VarMarkerId,
							rowid : VarId
							
			});
	}
	
	grid.dataSource.sync();
	
}

function FnGetPolygonFields(){
	var ArrFields = [];
	
	var grid = $("#draw-polygon-grid").data("kendoGrid");
	var ArrLatLng = [];
	for (var k = 0; k < grid.dataSource.data().length; k++) {
		var element = {};
		element['latitude'] = grid.dataSource.data()[k].latitude;
		element['longitude'] = grid.dataSource.data()[k].longitude;
		ArrLatLng.push(element);
	}	
	ArrFields.push({"key": "coordinates","value":addslashes(JSON.stringify(ArrLatLng))});
	var ObjStyleOptions = FnGetStyleProperties();		
	var ObjStyles = {"color":"borderColor","weight":"borderThickness","opacity":"borderAlpha","fillColor":"fillColor","fillOpacity":"fillAlpha","zoom":"zoom"};
	$.each(ObjStyles,function(stylekey,stylevalue){
		if(stylekey=='zoom'){
			ArrFields.push({"key": stylevalue,"value": $('#'+stylekey).val()});
		} else {
			ArrFields.push({"key": stylevalue,"value": ObjStyleOptions[stylekey]});
		}
	});
	
	return ArrFields;
}

function FnGetCircleFields(){
	var ArrFields = [];	
	
	var ObjStyleOptions = FnGetStyleProperties();		
	var ObjStyles = {"color":"borderColor","weight":"borderThickness","opacity":"borderAlpha","fillColor":"fillColor","fillOpacity":"fillAlpha","latitude":"latitude","longitude":"longitude","radius":"radius","zoom":"zoom"};
	$.each(ObjStyles,function(stylekey,stylevalue){
		if(stylekey=='latitude' || stylekey=='longitude' || stylekey=='radius' || stylekey=='zoom'){
			ArrFields.push({"key": stylevalue,"value": $('#'+stylekey).val()});
		} else {
			ArrFields.push({"key": stylevalue,"value": ObjStyleOptions[stylekey]});
		}
	});
	
	return ArrFields;
	
}

function FnGetRoadMapFields(){
	var ArrFields = [];
	
	var grid = $("#draw-roadmap-grid").data("kendoGrid");
	var ArrLatLng = [];
	for (var k = 0; k < grid.dataSource.data().length; k++) {
		var element = {};
		element['latitude'] = grid.dataSource.data()[k].latitude;
		element['longitude'] = grid.dataSource.data()[k].longitude;
		ArrLatLng.push(element);
	}	
	ArrFields.push({"key": "coordinates","value":addslashes(JSON.stringify(ArrLatLng))});
	var ObjStyleOptions = FnGetStyleProperties();		
	var ObjStyles = {"color":"borderColor","weight":"borderThickness","opacity":"borderAlpha","fillColor":"fillColor","fillOpacity":"fillAlpha","geofence_road_width":"width","zoom":"zoom"};
	$.each(ObjStyles,function(stylekey,stylevalue){
		if(stylekey=='geofence_road_width' || stylekey=='zoom'){
			ArrFields.push({"key": stylevalue,"value": $('#'+stylekey).val()});
		} else {
			ArrFields.push({"key": stylevalue,"value": ObjStyleOptions[stylekey]});
		}
	});
	
	return ArrFields;
}

function addslashes(str) {
	
  //str = str.replace(/\\/g, '\\\\');
  //str = str.replace(/\'/g, '\'');
  str = str.replace(/\'/g, "\\'");
  //str = str.replace(/\"/g, '\\"');
  //str = str.replace(/\0/g, '\\0');
  
  return str;

}

function stripslashes(str) {
    //str = str.replace(/\\'/g, '\'');
    str = str.replace(/\"/g, '"');
    //str = str.replace(/\\0/g, '\0');
    //str = str.replace(/\\\\/g, '\\');
    return str;
}

function FnSaveGeofence(){
	$('#gapp-geofence-save, #gapp-geofence-clear, #gapp-geofence-cancel').attr('disabled',true);
	var validator = $("#gapp-geofence-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	if (validator.validate()) {
		var ArrGeofenceFields = [];
		if(GblGeoType === 'Polygon') {
			if(ArrPolyMarkers.length <3){
				$("#alertModal").modal('show').find(".modalMessage").text("Please select at least three point.");
				$('#gapp-geofence-save, #gapp-geofence-clear, #gapp-geofence-cancel').attr('disabled',false);
				$("#GBL_loading").hide();
				return false;
			} else {
				ArrGeofenceFields = FnGetPolygonFields();
			}
		} else if(GblGeoType === 'Circle'){
			if(clickCircle == undefined){
				$("#alertModal").modal('show').find(".modalMessage").text("Please draw a circle.");
				$('#gapp-geofence-save, #gapp-geofence-clear, #gapp-geofence-cancel').attr('disabled',false);
				$("#GBL_loading").hide();
				return false;
			} else {
				ArrGeofenceFields = FnGetCircleFields();
			}
		} else if(GblGeoType === 'Route'){
			if(ArrPolyMarkers.length <2){
				$("#alertModal").modal('show').find(".modalMessage").text("Please select at least two point.");
				$('#gapp-geofence-save, #gapp-geofence-clear, #gapp-geofence-cancel').attr('disabled',false);
				$("#GBL_loading").hide();
				return false;
			} else {
				ArrGeofenceFields = FnGetRoadMapFields();
			}
		}
		
		if(VarEditGeofenceId == ''){
		
			var VarStatus = 'INACTIVE';
			$("input[name='statusName']").each(function(){				
				if($(this).is(':checked') == true && $(this).val()=='ACTIVE'){
					VarStatus = 'ACTIVE';
				}
			});
		
			var VarUrl = GblAppContextPath + '/ajax' + VarCreateGeofenceUrl;
		
			var VarParam = {};
			VarParam["domain"] = {"domainName" : VarCurrentTenantInfo.tenantDomain};
			VarParam['geofenceName'] = $('#geofenceName').val();
			VarParam['desc'] = "";
			VarParam['type'] = GblGeoType;
			VarParam['geofenceFields'] = ArrGeofenceFields;
			VarParam['geofenceStatus'] = {"statusName":VarStatus};
				
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveGeofence);
			
		} else {
		
			var VarStatus = 'INACTIVE';
			$("input[name='statusName']").each(function(){				
				if($(this).is(':checked') == true && $(this).val()=='ACTIVE'){
					VarStatus = 'ACTIVE';
				}
			});
		
			var VarUrl = GblAppContextPath + '/ajax' + VarUpdateGeofenceUrl;
			
			var VarParam = {};
			VarParam["domain"] = {"domainName" : VarCurrentTenantInfo.tenantDomain};
			VarParam['geofenceName'] = $('#geofenceName').val();
			VarParam['desc'] = "";
			VarParam['type'] = GblGeoType;
			VarParam['geofenceFields'] = ArrGeofenceFields;
			VarParam['geofenceStatus'] = {"statusName":VarStatus};
			VarParam['identifier'] = {"key": "identifier","value": VarEditGeofenceId};
			
			FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResUpdateGeofence);
		
		}
	
	} else {
		$('#gapp-geofence-save, #gapp-geofence-clear, #gapp-geofence-cancel').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResSaveGeofence(response){
	
	var ObjResponse = response;
	$('#gapp-geofence-save, #gapp-geofence-clear, #gapp-geofence-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ObjResponse.status == 'SUCCESS'){
		
		notificationMsg.show({
			message : 'Geofence created successfully'
		}, 'success');
		
		FnFormRedirect('gapp-geofence-list',GBLDelayTime);
		
	} else {
	
		if(ObjResponse.errorCode != undefined){
			FnShowNotificationMessage(ObjResponse);
		}
	
	}
}

function FnResUpdateGeofence(response){
	
	var ObjResponse = response;
	$('#gapp-geofence-save, #gapp-geofence-clear, #gapp-geofence-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ObjResponse.status == 'SUCCESS'){
		
		notificationMsg.show({
			message : 'Geofence updated successfully'
		}, 'success');
		
		FnFormRedirect('gapp-geofence-list',GBLDelayTime);
		
	} else {
	
		if(ObjResponse.errorCode != undefined){
			FnShowNotificationMessage(ObjResponse);
		}
	
	}
}

function FnCancelGeofence(){
		
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-geofence-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-geofence-list').submit();
	}
}

function FnGetGeofenceDetails(VarGeofenceId){
	$("#GBL_loading").show();
	$("#gapp-geofence-form :input").prop("disabled", true);
	$('#gapp-geofence-save, #gapp-geofence-clear').attr('disabled',true);
	$("#gapp-geofence-cancel").prop("disabled", false);
	$("#geofence_border_color").data("kendoColorPicker").enable(false);
	$("#geofence_fill_color").data("kendoColorPicker").enable(false);
	
	var VarUrl = GblAppContextPath+'/ajax' + VarViewGeofenceUrl;
	var VarParam = {};
	VarParam["domain"] = {"domainName" : VarCurrentTenantInfo.tenantDomain};
	VarParam["identifier"] = {"key": "identifier","value": VarGeofenceId};
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResGeofenceDetails);
}

var GblLatLng = [];
function FnResGeofenceDetails(response){
	$("#GBL_loading").hide();
	var ObjResponse = response;
	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.errorCode == undefined){
			var ObjStyles = {"borderColor":"geofence_border_color","borderThickness":"geofence_border_weight","borderAlpha":"geofence_border_opacity","fillColor":"geofence_fill_color","fillAlpha":"geofence_fill_opacity","latitude":"latitude","longitude":"longitude","radius":"radius","zoom":"zoom"};
			
			$('#geotypeHead li').removeClass('active').hide();
			var VarGeofenceType = ObjResponse['type'];
			GblGeoType = VarGeofenceType;
			$('#geotypeHead li a[href="#tab_'+VarGeofenceType+'"]').parent('li').show();
			$('#geotypeHead li a[href="#tab_'+VarGeofenceType+'"]').tab('show');
			
			$('#geofenceName').val(ObjResponse['geofenceName']);
			var ArrGeofenceFields = ObjResponse['geofenceFields'];
			var ArrCoords = [];
			var VarMapZoom = parseInt($('#zoom').val());
			$.each(ArrGeofenceFields,function(key,obj){
			
				if((VarGeofenceType==='Polygon' || VarGeofenceType==='Route') && obj['key']==='coordinates'){
					ArrCoords = JSON.parse(stripslashes(obj['value']));
				} else if(VarGeofenceType==='Circle' && (obj['key']=='latitude' || obj['key']=='longitude' || obj['key']=='radius')){
					ArrCoords[obj['key']] = obj['value'];
				}
				
				if($('#gapp-geofence-form #'+ObjStyles[obj['key']])){
					if(obj['key'] != 'borderColor' && obj['key'] != 'fillColor' && obj['key'] != 'zoom'){
						$('#gapp-geofence-form #'+ObjStyles[obj['key']]).val(obj['value']);
					} else if(obj['key'] == 'borderColor'){
						$("#geofence_border_color").data("kendoColorPicker").value(obj['value']);
					} else if(obj['key'] == 'fillColor'){
						$("#geofence_fill_color").data("kendoColorPicker").value(obj['value']);
					} else if(obj['key'] == 'zoom'){
						VarMapZoom = (obj['value'] != undefined) ? parseInt(obj['value']) : parseInt($('#zoom').val());
						$('#zoom').val(VarMapZoom);
					}
				}				
			
			});
			
			$('#zoom').val(VarMapZoom);
			if(ObjResponse['geofenceStatus']['statusName'] == 'ACTIVE'){
				$('#gapp-geofence-form #statusName_active').attr('checked',true);
			} else {
				$('#gapp-geofence-form #statusName_inactive').attr('checked',true);
			}
			GblEdit = 1;
			//FnSetMapZoom(VarMapZoom);			
			GblLatLng = ArrCoords;
			FnDrawGeofence(ArrCoords,VarMapZoom);
			
		} else {
			FnShowNotificationMessage(ObjResponse);
		}
	}
}

function FnDrawGeofence(ArrCoords,VarMapZoom){
	if(GblGeoType === 'Circle'){
	
		var VarLatitude = parseFloat($('#latitude').val());
		var VarLongitude = parseFloat($('#longitude').val());
		var VarRadious = parseFloat($('#radius').val());
		var fc = new L.LatLng(VarLatitude, VarLongitude);
		var ObjCircleOptions = FnGetStyleProperties();
		clickCircle = L.circle(fc, (VarRadious * 1000), ObjCircleOptions).addTo(map);		
		//map.fitBounds(clickCircle.getBounds());
		map.setView(new L.LatLng(VarLatitude, VarLongitude), VarMapZoom);
		
	} else if(GblGeoType === 'Polygon'){
		var grid = $("#draw-polygon-grid").data("kendoGrid");
		var polygonPoints = [];
		var i=0;
		$.each(ArrCoords,function(key,obj){
			polygonPoints.push(new L.LatLng(obj['latitude'], obj['longitude']));
			grid.dataSource.add({latitude : obj['latitude'],longitude : obj['longitude'],rowid : 'marker_'+i});
			i++;
		});
		
		var ObjPolygonOptions = FnGetStyleProperties();
		var polygon = new L.Polygon(polygonPoints,ObjPolygonOptions).addTo(map);
		ArrPolyLines.push(polygon);		
		//map.fitBounds(polygon.getBounds());
		map.setView(new L.LatLng(parseFloat(ArrCoords[0]['latitude']), parseFloat(ArrCoords[0]['longitude'])), VarMapZoom);
		
	} else if(GblGeoType === 'Route'){
		var grid = $("#draw-roadmap-grid").data("kendoGrid");
		var coords = [];
		var i=0;
		$.each(ArrCoords,function(key,obj){
			coords.push(new L.LatLng(obj['latitude'], obj['longitude']));
			grid.dataSource.add({latitude : obj['latitude'],longitude : obj['longitude'],rowid : 'marker_'+i});
			i++;
		});
		
		var ObjStyleOptions = FnGetStyleProperties();
		var VarOffset = parseInt($('#geofence_road_width').val() / 2);
		
		var originPolyline = L.polyline(coords,ObjStyleOptions).addTo(map);
		originPolyline.setStyle({color :'#000000'});
		ArrPolyLines.push(originPolyline);

		var leftPolyline = L.polyline(coords, ObjStyleOptions).addTo(map);
		leftPolyline.setStyle({dashArray :'5,10'});
		leftPolyline.setOffset(-VarOffset);
		ArrPolyLines.push(leftPolyline);

		var rightPolyline = L.polyline(coords, ObjStyleOptions).addTo(map);
		rightPolyline.setStyle({dashArray :'5,10'});
		rightPolyline.setOffset(VarOffset);
		ArrPolyLines.push(rightPolyline);

		map.setView(new L.LatLng(parseFloat(ArrCoords[0]['latitude']), parseFloat(ArrCoords[0]['longitude'])), VarMapZoom);
	}
	
	map.scrollWheelZoom.disable();
	map.dragging.disable();
	map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
		
}

function FnEditGeofence(){
	$("#gapp-geofence-form :input").prop("disabled", false);
	$('#gapp-geofence-save, #gapp-geofence-clear').attr('disabled',false);
	$("#geofence_border_color").data("kendoColorPicker").enable(true);
	$("#geofence_fill_color").data("kendoColorPicker").enable(true);
	$('.pageTitleTxt').text('Edit Geofence');
	$('#gapp-geofence-edit').hide();
	$('#geofenceName').prop("disabled", true);
	GblEdit = 0;
	FnClearGeofence();
	
	if(GblGeoType === 'Circle'){
		
		$('#latitude').val(GblLatLng['latitude']);
		$('#longitude').val(GblLatLng['longitude']);
		$('#radius').val(GblLatLng['radius']);
		var geomarker = L.marker([GblLatLng['latitude'],GblLatLng['longitude']],{draggable: true}).addTo(map);
		ArrPolyMarkers.push(geomarker);
		geomarker.on("drag", FnDragEvent);
		var fc = ArrPolyMarkers[0].getLatLng();
		var ObjCircleOptions = FnGetStyleProperties();
		clickCircle = L.circle(fc, (GblLatLng['radius'] * 1000), ObjCircleOptions).addTo(map);
	} else if(GblGeoType === 'Polygon'){
		$.each(GblLatLng,function(key,obj){
			var geomarker = L.marker([obj['latitude'],obj['longitude']],{draggable: true}).addTo(map);
			ArrPolyMarkers.push(geomarker);
			line[geomarker._leaflet_id] = geomarker;
			geomarker.on("drag", FnDragEvent);
			geomarker.on("mouseover", FnMouseoverEvent);
			geomarker.on("mouseout", FnMouseoutEvent);
			FnManagePolygonGrid(geomarker);	
		});
		FnCreatePolygon();
	} else if(GblGeoType === 'Route'){
		$.each(GblLatLng,function(key,obj){
			var geomarker = L.marker([obj['latitude'],obj['longitude']],{draggable: true}).addTo(map);
			ArrPolyMarkers.push(geomarker);
			line[geomarker._leaflet_id] = geomarker;
			geomarker.on("drag", FnDragEvent);
			geomarker.on("mouseover", FnMouseoverEvent);
			geomarker.on("mouseout", FnMouseoutEvent);
			FnManageRoadMapGrid(geomarker);
		});
		FnDrawRoadMap();
	}
	
	map.scrollWheelZoom.enable();
	map.dragging.enable();
	map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
	
}