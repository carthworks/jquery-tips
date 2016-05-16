"use strict";

$(document).ready(function(){
	//Splitter initiation from kendo         
	var splitterElement = $("#splitter").kendoSplitter({
		panes : [ {
					collapsible : true,
					size : '20%'
				}
				]
	});
	$('#gapp-mappoint-save').prop('disabled',true);
	FnGetDeviceList();
	$('#pointmap_asset_name').text(VarEquipEntity.equipName);		
});

var isMainGrid = true;
function FnGetDeviceList() {

	var ObjParam = {};
	ObjParam["domain"] = {"domainName":VarCurrentTenantInfo.parentDomain};
	ObjParam["entityTemplate"] = {"entityTemplateName":"DefaultTenant"};	
	ObjParam["globalEntity"] = {"globalEntityType":"TENANT"};
	ObjParam["identifier"] = { "key": "tenantId", "value": VarCurrentTenantInfo.tenantId};
	$("#GBL_loading").show();											
	var VarUrl = GblAppContextPath+'/ajax' + VarListDeviceUrl;
	
	$("#gapp-devices-list").kendoGrid({
								toolbar : kendo.template($("#deviceSearchtemplate").html()),
								dataSource: {
									type: "json",
									transport: {
										read: {
											type : "POST",
											dataType : "json",
											contentType : "application/json",
											url : VarUrl,
											data : ObjParam
										},
										parameterMap : function(options, operation) {
											if(!$.isEmptyObject(ObjParam)){
												var data = JSON.stringify(options);
											} else {
												var data = options;
											}											
											return data;
										}
									},
									schema : {
										data : function(response) {
											$("#GBL_loading").hide();
											var ArrResponse = response;
											var VarResLength = ArrResponse.length;
											
											if (VarResLength >0) {
											
												var ArrResponseData = [];
												$(ArrResponse).each(function(){
													var element = {};
													element['identity'] = {};
													element['identity']['globalEntity'] = this.globalEntity;
													element['identity']['domain'] = this.domain;
													element['identity']['entityTemplate'] = {"entityTemplateName":this.entityTemplate.entityTemplateName};
													element['identity']['identifier'] = this.identifier;
													$(this.dataprovider).each(function() {
														var key = this.key;
														if(key === 'entityName'){
															element['sourceId'] = this.value;
														} else if(key === 'datasourceName'){
															element['datasourceName'] = (this.value != undefined) ? this.value : "";
														}
													});
													element["identifier"] = this.identifier.value;
													ArrResponseData.push(element);
												});
												
												return ArrResponseData;
											
											} else {
											
												if(ArrResponse.errorCode != undefined){
												
													FnShowNotificationMessage(ArrResponse);
													
												}
											}
										},
										
										total : function(response) {
											return response.length;
										
										}
									},
									change: function(e) {
									
									}
								},
								sortable : true,
								scrollable : true,
								mobile: true,
								columns : [									
						           {
						        	   field : "sourceId",
						        	   title : "Device",
						        	   width : 50,
									   sortable: true,
						        	   editable : false
						           },

								],
								selectable : true,
								change : function(e) {
									var entityGrid = $("#gapp-devices-list").data("kendoGrid");
									var rows = entityGrid.select();
									var selectedItem = entityGrid.dataItem(rows);
									if(selectedItem != null && selectedItem.identity != undefined && selectedItem.sourceId != undefined){
										ArrSelPoints = [];
										$('#gapp-mappoint-save').prop('disabled',true);
										isMainGrid = false;
										var ObjParam = {};
										ObjParam['identity'] = selectedItem.identity;
										ObjParam['sourceId'] = selectedItem.sourceId;										
										FnGetDevicePointsList(ObjParam);
									}
								}
	
	});
	
	/* sorting column injected*/	
	var kendoGrid = $("#gapp-devices-list").data('kendoGrid');
	var dsSort = [];
	dsSort.push({ field: "sourceId", dir: "asc" });
	kendoGrid.dataSource.sort(dsSort);
	
	
	$("#searchDeviceId").keyup(function() {
		var val = $("#searchDeviceId").val();
		$("#gapp-devices-list").data("kendoGrid").dataSource.filter({
			logic : "or",
			filters : [ {
				field : "sourceId",
				operator : "contains",
				value : val
			} ]
		});
	});
	
}

function FnGetDevicePointsList(ObjParam){
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath +'/ajax' + VarListDevicePointsUrl;
	
	var grid = $("#gapp-points-list").data("kendoGrid");
	if(grid != null){
		grid.destroy();
	}
	
	$("#gapp-points-list").kendoGrid({
							dataSource: {
								type: "json",
								transport: {
									read: {
										type : "POST",
										dataType : "json",
										contentType : "application/json",
										url : VarUrl,
										data : ObjParam
									},
									parameterMap : function(options, operation) {
										if(!$.isEmptyObject(ObjParam)){
											var data = JSON.stringify(options);
										} else {
											var data = options;
										}										
										return data;
									}

								},
								schema: {
									data: function(response) {
										$("#GBL_loading").hide();
										var ArrResponse = response;
										var VarResLength = ArrResponse.length;											
										if (VarResLength >0) {										
											var responseData = [];
											$(ArrResponse).each(function() {
												
												if(this.entityStatus != undefined){
													var VarPointStatus = this.entityStatus.statusName;
													
													if(VarPointStatus != 'ALLOCATED'){
														var element = {};
														element['fieldValues'] = [];
														$(this.dataprovider).each(function() {
															var key = this.key;
															element[key] = this.value;
															
															if(key=='pointId' || key=='pointName' || key=='physicalQuantity' || key=='unit' || key=='dataType' || key=='displayName'){
																var VarValue = (this.value != undefined) ? this.value : '';
																element['fieldValues'].push({"key":key,"value":VarValue});
															}
															
														});
														
														element["identifier"] = this.identifier.value;
														var VarRowId = element["displayName"].replace(/ /g, '_');
														VarRowId = VarRowId.replace(/'/g, '-');
														element["rowid"] = VarRowId;
														responseData.push(element);
													}
												} else {
													var element = {};
													element['fieldValues'] = [];
													$(this.dataprovider).each(function() {
														var key = this.key;
														element[key] = this.value;
														if(key=='pointId' || key=='pointName' || key=='physicalQuantity' || key=='unit' || key=='dataType' || key=='displayName'){
															element['fieldValues'].push({"key":key,"value":this.value});
														}
													});
													
													var VarRowId = element["displayName"].replace(/ /g, '_');
													VarRowId = VarRowId.replace(/'/g, '-');
													element["rowid"] = VarRowId;
													responseData.push(element);
												}												
												
											});
											
											return responseData;
										
										} else {
											var responseData = [];
											if(ArrResponse.errorCode != undefined){												
												FnShowNotificationMessage(ArrResponse);													
											}											
											return responseData;
										}
									},
									
									total: function(response) {
										var VarTotalCount = 0;										
										if (response.errorCode == undefined) {
											$(response).each(function() {
												if(this.entityStatus != undefined){
													var VarPointStatus = this.entityStatus.statusName;
												
													if(VarPointStatus != 'ALLOCATED'){
														VarTotalCount++;
													}
												} else {
													VarTotalCount++;
												}
											});
										}
										return VarTotalCount;
									},
								},
								pageSize: 10,
								page: 1,
								serverPaging: false,
								serverFiltering: false,
								serverSorting: false,
							},
							selectable: "row",
							resizable: true,
							noRecords: true, 
							 messages: {    
									noRecords: "<div class='Metronic-alerts alert alert-info fade in'> <i class='fa-lg fa fa-warning'></i> There is no data on current page </div>"						  
								},  
							sortable: {
								mode: "single",
								allowUnsort: true
							},
							filterable : {
								mode : "row",
								extra: false
							},
							pageable: {
								refresh: false,
								pageSizes: true,
								previousNext: true
							},
							columnMenu: {
								filterable: false,
								sortable:false
							},
							dataBound: onDataBound,
							columns: [
								{
									headerTemplate: '<input type="checkbox" name="checkAll" id="checkAll" onClick="checkAllBoxClick();">',
									template: "<input type='checkbox' id='#=rowid#' onClick='checkBoxClick(this);'>",
									width: 30
								},
								{
									field: "pointId",
									title: "Point id"
								},
								{
									field: "pointName",
									title: "Point Name"
								},
								{
									field: "dataType",
									title: "Data Type"
								},
								{
									field: "physicalQuantity",
									title: "Physical Quantity"
								},
								{
									field: "unit",
									title: "Unit of Measurement"
								}
							]
	});
	
		var kendoGrid = $("#gapp-points-list").data('kendoGrid');
		var dsSort = [];
		dsSort.push({ field: "pointId", dir: "asc" });
		kendoGrid.dataSource.sort(dsSort);

	
		
}

function onDataBound(e){
	var view = this.dataSource.view();
	var VarChkCnt = 0;
	for(var i = 0; i < view.length;i++){
		
		if($.inArray(view[i].rowid, ArrSelPoints) != -1){
			this.tbody.find("input[id='" + view[i].rowid + "']").prop("checked",true).closest("tr").addClass('k-state-selected');
			VarChkCnt++;
		}
	}
	
	var VarViewLength = view.length;
		
	if(VarViewLength>0 && VarViewLength == VarChkCnt){
		$("#checkAll").prop("checked", true);
	} else {
		$("#checkAll").prop("checked", false);
	}
	
}

var ArrSelPoints = [];
function checkAllBoxClick() {
	var grid = $('#gapp-points-list').data("kendoGrid");
	if ($("#checkAll").is(":checked")) {
		
		//Select all rows on screen
		grid.tbody.children('tr').addClass('k-state-selected');
		$('#gapp-points-list').find('input[type=checkbox]').prop("checked", true);
		var ArrDisplayedData = grid.dataSource.view().toJSON();
		$.each(ArrDisplayedData,function(){
			if($.inArray(this.rowid, ArrSelPoints) == -1){
				ArrSelPoints.push(this.rowid);
			}
		});
		
	} else {
					
		grid.tbody.children('tr').removeClass('k-state-selected');
		$('#gapp-points-list').find('input[type=checkbox]').prop("checked", false);
		var ArrDisplayedData = grid.dataSource.view().toJSON();
		$.each(ArrDisplayedData,function(){
			ArrSelPoints.splice($.inArray(this.rowid, ArrSelPoints),1);

		});
	}
	
	if(ArrSelPoints.length > 0){
		$('#gapp-mappoint-save').prop('disabled',false);
	} else {
		$('#gapp-mappoint-save').prop('disabled',true);
	}	
	
}

function checkBoxClick(VarThis) {
	$("#checkAll").prop("checked", false);
	var check = $('#gapp-points-list').find('input[type="checkbox"]:checked').length;
	var checkAll = $('#gapp-points-list').find('input[type="checkbox"]').length;
	var VarSelItem = $(VarThis).attr('id');
	if($(VarThis).is(':checked') == true){
		if($.inArray(VarSelItem, ArrSelPoints) == -1){
			$(VarThis).closest("tr").addClass('k-state-selected');		
			ArrSelPoints.push(VarSelItem);
		}
	} else {
		$(VarThis).closest("tr").removeClass('k-state-selected');
		ArrSelPoints.splice($.inArray(VarSelItem, ArrSelPoints),1);
	}
		
	//Check the header checkbox if all row checkboxes on screen are selected
	if (check == (checkAll - 1)){
		$("#checkAll").prop("checked", true);
	}
	
	if(ArrSelPoints.length > 0){
		$('#gapp-mappoint-save').prop('disabled',false);
	} else {
		$('#gapp-mappoint-save').prop('disabled',true);
	}
	
}

function FnGetSelectedDeviceInfo(){
	var ObjParam = {};
	var grid = $("#gapp-devices-list").data("kendoGrid");
	var selectedItem = grid.dataItem(grid.select());
	ObjParam['identifier'] = {"key": "identifier","value": selectedItem.identifier};
	ObjParam['domain'] = selectedItem.identity.domain;
	return ObjParam;
}

function FnGetPoints(){
	var ArrPointList = [];
	
	var grid = $("#gapp-devices-list").data("kendoGrid");
	var selectedItem = grid.dataItem(grid.select());
	var VarDataSourceName = selectedItem.datasourceName;
		
	var ArrData = $('#gapp-points-list').data("kendoGrid").dataSource.data();
	var VarDataCount = ArrData.length;
	
	if(VarDataCount > 0){
		$.each(ArrData,function(key,obj){
			var element = {};
			if(obj['identifier'] != undefined){
				element['identifier'] = {"key": "identifier","value": obj['identifier']};
			}
			obj['fieldValues'].push({"key":"dataSourceName","value":VarDataSourceName});
			obj['fieldValues'].push({"key":"equipName","value":VarEquipEntity.equipName});
			obj['fieldValues'].push({"key":"equipTemplate","value":"Asset"});
			obj['fieldValues'].push({"key":"equipIdentifier","value":VarEquipEntity.equipment.identifier.value});
			
			element['fieldValues'] = obj['fieldValues'];
			element['isSelected'] = ($.inArray(obj['rowid'],ArrSelPoints) != -1) ? true : false;
															
			ArrPointList.push(element);
		});
		
	}
	return ArrPointList;
}

function FnSaveMapPoints(){
	$('#gapp-mappoint-save, #gapp-mappoint-cancel').attr('disabled',true);
	if(ArrSelPoints.length > 0){
		$("#GBL_loading").show();
		var VarUrl = GblAppContextPath + '/ajax' + VarPointsMappingUrl;
		var VarParam = {};
		VarParam['equipment'] = VarEquipEntity.equipment;
		VarParam['device'] = FnGetSelectedDeviceInfo();
		VarParam['points'] = FnGetPoints();
		//console.log(JSON.stringify(VarParam));
		//return false;
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResMapPoints);
		
	} else {
		$("#alertModal").modal('show').find(".modalMessage").text("Please select at least one point.");
		$('#gapp-mappoint-save, #gapp-mappoint-cancel').attr('disabled',false);
		return false;
	}	
}

function FnResMapPoints(response){
	
	var ObjResponse = response;
	$('#gapp-mappoint-save, #gapp-mappoint-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ObjResponse.status == 'SUCCESS'){
		
		notificationMsg.show({
			message : 'Points mapped successfully'
		}, 'success');
		
		$("#gapp-equipment-view #entity_id").val(VarEquipEntity.equipment.identifier.value);
		$("#gapp-equipment-view").attr("action",VarEquipView);
		FnFormRedirect('gapp-equipment-view',GBLDelayTime);
	} else {
		notificationMsg.show({
			message : ObjResponse['errorMessage']
		}, 'error');
	}
	
}

function FnNavigateAssetList(){
	$('#gapp-asset-list').submit();
}

function FnCancelMapPoints(){
	$("#gapp-equipment-view").attr("action",VarEquipList);
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-equipment-view');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-equipment-view').submit();
	}
	
}

