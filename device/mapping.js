"use strict";

$(document).ready(function(){

	var splitterElement = $("#splitter").kendoSplitter({
			panes : [{
					collapsible : true,
					size : '20%'
				},
				{
					collapsible : true,
					size : '30%'
				},
				{
					collapsible : false,
					size : '50%'
				}
			]
	});
	$('#clientmapname').text(VarMapTenantInfo.tenantName);
	$('#gapp-mappoint-save').attr('disabled',true);
	FnGetAssetList();
	FnGetDeviceList();
	FnInitiatePointGrid();
});

function FnGetAssetList(){	
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath+'/ajax' + VarListAssetsUrl + "?domain_name=" + VarMapTenantInfo.domain;
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResAssetList);
}

function FnResAssetList(response){
	$("#GBL_loading").hide();
	if($.isArray(response)){
		var VarResLength = response.length;
		var ArrData = [];
		ArrData.push({'id':VarMapTenantInfo.tenantId,'text':(VarMapTenantInfo.tenantName).toUpperCase()});
		if(VarResLength > 0){
			ArrData[0]['items'] = [];
			$.each(response,function(){
				ArrData[0]['items'].push({'id':this.assetIdentifier.value,'text':(this.assetName).toUpperCase(),'assetName':this.assetName,'assetType':this.assetType});
			});
		}
		
	} else {
		var ArrData = [];
		ArrData.push({'id':VarMapTenantInfo.tenantId,'text':(VarMapTenantInfo.tenantName).toUpperCase()});
		ArrData[0]['items'] = [];
		if(response.errorCode != undefined){
			FnShowNotificationMessage(response);
		}
	}
	
	$("#gapp-assets-list").kendoTreeView({			
		dataSource: ArrData,
		select: function(e){
			var tree = $("#gapp-assets-list").getKendoTreeView();
			var dataItem = tree.dataItem(e.node);
			if(dataItem.assetType != undefined && ArrSelPoints.length>0){
				$('#gapp-mappoint-save').prop('disabled',false);
			} else {
				$('#gapp-mappoint-save').prop('disabled',true);
			}
		}
	});
	
	$('#gapp-assets-list #'+VarMapTenantInfo.tenantId).attr('disabled',true);
	var treeview = $("#gapp-assets-list").data("kendoTreeView");
	treeview.expand(treeview.findByText((VarMapTenantInfo.tenantName).toUpperCase()));
	FnSelectRootNode();
	
	FnInitSearch("#gapp-assets-list", "#treeViewSearchInput");
}

function FnInitSearch(treeViewId, searchInputId) {

    var tv = $(treeViewId).data('kendoTreeView');

    $(searchInputId).on('keyup', function () {

        $(treeViewId + ' li.k-item').show();

        $('span.k-in > span.highlight').each(function () {
            $(this).parent().text($(this).parent().text());
        });

        // ignore if no search term
        if ($.trim($(this).val()) === '') {
            return;
        }

        var term = this.value.toUpperCase();
        var tlen = term.length;

        $(treeViewId + ' span.k-in').each(function (index) {
            var text = $(this).text();
            var html = '';
            var q = 0;
            var p;

            while ((p = text.toUpperCase().indexOf(term, q)) >= 0) {
                html += text.substring(q, p) + '<span class="highlight">' + text.substr(p, tlen) + '</span>';
                q = p + tlen;
            }

            if (q > 0) {
                html += text.substring(q);
                $(this).html(html);

                $(this).parentsUntil('.k-treeview').filter('.k-item').each(function (index, element) {
                    tv.expand($(this));
                    $(this).data('SearchTerm', term);
                });
            }
        });

        $(treeViewId + ' li.k-item:not(:has(".highlight"))').hide();
        //$(treeViewId + ' li.k-item').expand(".k-item");
		tv.expand(".k-item");
    });
}

function FnSelectRootNode(){
	var el = $('#gapp-assets-list');
	var tree = el.data('kendoTreeView');
	var firstNode = el.find('.k-first');
	tree.select(firstNode);
}

function FnGetDeviceList() {

	var ObjParam = {};
	ObjParam["domain"] = {"domainName":VarMapTenantInfo.parentDomain};
	ObjParam["entityTemplate"] = {"entityTemplateName":"DefaultTenant"};	
	ObjParam["globalEntity"] = {"globalEntityType":"TENANT"};
	ObjParam["identifier"] = { "key": "tenantId", "value": VarMapTenantInfo.tenantId};
	$("#GBL_loading").show();											
	var VarUrl = GblAppContextPath+'/ajax' + VarListDeviceUrl;
	
	$("#gapp-devices-list").kendoGrid({
								height: 480,
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
														} else {
															element[key] = (this.value != undefined) ? this.value : "";
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
										
										},
										model: {
											fields: {
												sourceId: {
													type: "string"
												}
											}
										}
									},
									change: function(e) {
									
									},
									pageSize: 10,
									page: 1,
									serverPaging: false,
									serverFiltering: false,
									serverSorting: false,
									sort: { field: "sourceId", dir: "asc" }
								},
								selectable: true,
								scrollable : true,
								resizable: true,
								mobile: true,
								sortable: {
									mode: "single",
									allowUnsort: true
								},
								filterable : {
									mode : "row"
								},
								pageable: {
									refresh: true,
									pageSizes: true,
									previousNext: true,
									messages: {
									  itemsPerPage: "per page"
									},
									buttonCount: 5,
									info: false
								},
								noRecords: {
									template: "<div style='text-align: center !important; padding: 12px 0 0 0; color: black;'>No data available on current page.</div>"
								},
								columns: [
									{
										title: "Assigned Devices",
										columns: [
											{
												field: "sourceId",
												title: "Source Id"
											},
											{
												field: "deviceName",
												title: "Device Name"
											}
										]
									}
								],
								change : function(e) {
									var entityGrid = $("#gapp-devices-list").data("kendoGrid");
									var rows = entityGrid.select();
									var selectedItem = entityGrid.dataItem(rows);
									if(selectedItem != null && selectedItem.identity != undefined && selectedItem.sourceId != undefined){
										ArrSelPoints = [];
										$('#gapp-mappoint-save').prop('disabled',true);
										var ObjParam = {};
										ObjParam['identity'] = selectedItem.identity;
										ObjParam['sourceId'] = selectedItem.sourceId;										
										FnGetDevicePointsList(ObjParam);
									}
								}
	
	});
	
	$(window).resize(function () {
		$("#gapp-devices-list").data("kendoGrid").resize();
	});
		
}

function FnInitiatePointGrid(){
	var grid = $("#gapp-points-list").data("kendoGrid");
	if(grid != null){
		grid.destroy();
	}
	
	$("#gapp-points-list").kendoGrid({
							height: 480,
							datasource : {
								data : []
							},
							noRecords: true, 
							messages: {    
								noRecords: "<div class='Metronic-alerts alert alert-info fade in'> <i class='fa-lg fa fa-warning'></i> There is no data on current page </div>"	  
							},
							columns: [
								{
									title: "Device Points",
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
								}
							]
							
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
							height: 480,
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
								sort: { field: "pointId", dir: "asc" }
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
									title: "Device Points",
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
								}
							]
	});
	
	//var kendoGrid = $("#gapp-points-list").data('kendoGrid');
	//var dsSort = [];
	//dsSort.push({ field: "pointId", dir: "asc" });
	//kendoGrid.dataSource.sort(dsSort);	
		
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
	
	var tree = $("#gapp-assets-list").getKendoTreeView();
	var selected = tree.select();
	var ObjSelAsset = tree.dataItem(selected);
	
	if(ArrSelPoints.length > 0 && ObjSelAsset.assetType != undefined){
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
	
	var tree = $("#gapp-assets-list").getKendoTreeView();
	var selected = tree.select();
	var ObjSelAsset = tree.dataItem(selected);
		
	if(ArrSelPoints.length > 0 && ObjSelAsset.assetType != undefined){
		$('#gapp-mappoint-save').prop('disabled',false);
	} else {
		$('#gapp-mappoint-save').prop('disabled',true);
	}
	
}

function FnGetSelectedAsset(VarKey){
	var tree = $("#gapp-assets-list").getKendoTreeView();
	var selected = tree.select();
	var ObjSelAsset = tree.dataItem(selected);
	if(VarKey != 'entity'){
		return ObjSelAsset[VarKey];
	} else {
		var ObjEquipmentEntity = {};
		ObjEquipmentEntity = {
			'identifier' : {"key": "identifier","value": ObjSelAsset.id},
			'domain' : {"domainName": VarMapTenantInfo.domain},
			'entityTemplate' : {"entityTemplateName": "Asset"},
			'globalEntity' : {"globalEntityType": "MARKER"}
		};
		return ObjEquipmentEntity;	
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
			obj['fieldValues'].push({"key":"equipName","value":FnGetSelectedAsset('assetName')});
			obj['fieldValues'].push({"key":"equipTemplate","value":"Asset"});
			obj['fieldValues'].push({"key":"equipIdentifier","value":FnGetSelectedAsset('id')});
			
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
		VarParam['equipment'] = FnGetSelectedAsset('entity');
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
		
		$('#gapp-mappoint-save').attr('disabled',true);
		ArrSelPoints = [];
		var entityGrid = $("#gapp-devices-list").data("kendoGrid");
		var rows = entityGrid.select();
		var selectedItem = entityGrid.dataItem(rows);
		var ObjParam = {};
		ObjParam['identity'] = selectedItem.identity;
		ObjParam['sourceId'] = selectedItem.sourceId;										
		FnGetDevicePointsList(ObjParam);
		
	} else {
		notificationMsg.show({
			message : ObjResponse['errorMessage']
		}, 'error');
	}
	
}

function FnCancelMapPoints(){
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-device-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-device-list').submit();
	}	
}

function FnNavigateDeviceList() {
	$('#gapp-device-list').submit();
}