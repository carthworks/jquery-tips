"use strict";

$(document).ready(function(){

	var splitterElement = $("#splitter").kendoSplitter({
			panes : [{
					collapsible : false,
					size : '80%'
				},
				{
					collapsible : true,
					size : '20%'
				}
			]
	});
	$('#claim_device_btn').attr('disabled',true);
	FnGetDeviceList();
	
});

function FnGetDeviceList(){
	
	$("#gapp-device-list").kendoGrid({
								height: 480,
								dataSource: {
									type: "json",
									transport: {
										read: {
											type : "GET",
											dataType : "json",
											contentType : "application/json",
											url : GblAppContextPath + "/ajax" + VarListUnsubscribedUrl																		
										}
									},
									schema: {
										data: function(response) {
											var ArrResponse = response;
											var VarResLength = ArrResponse.length;
											if (VarResLength > 0) {
												var responseData = [];
												$(ArrResponse).each(function(key,obj) {
													var element = {};
													element["sourceId"] = obj['sourceId'];
													element["deviceId"] = obj['deviceId'];
													element["tags"] = obj['tags'];
													element["unitId"] = obj['unitId'];
													element["deviceIp"] = obj['ip'];
													element["devicePort"] = obj['connectedPort'];
													element["wbPort"] = obj['writeBackPort'];
													element["latitude"] = obj['latitude'];
													element["longitude"] = obj['longitude'];
													element["deviceName"] = obj['deviceName'];
													
													if(obj['isPublishing'] == true){
														element["datasourceName"] = obj['datasourceName'];
													} else {
														element["datasourceName"] = "";
													}
													
													if(obj['networkProtocol']){														
														element["networkProtocol"] =  obj['networkProtocol'].name;
													} 
													$.each(["make","deviceType","model","protocol","version"],function(key1,val1){				
														element[val1] = obj['version'][val1];														
													});
													
													
													responseData.push(element);
													
												});
												return responseData;
											} else {
												notificationMsg.show({
																message : ArrResponse.errorMessage
															}, 	'error');
											}
										},
										total: function(response) {
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
									pageSize: 10,
									page: 1,
									serverPaging: false,
									serverFiltering: false,
									serverSorting: false,
									sort: { field: "sourceId", dir: "asc" }
								},
								selectable: "row",
								resizable: true,
								sortable: {
									mode: "single",
									allowUnsort: true
								},
								filterable : {
									mode : "row",
									extra: false
								},
								pageable: {
									refresh: true,
									pageSizes: true,
									previousNext: true
								},
								noRecords: {
									template: "<div style='text-align: center !important; padding: 12px 0 0 0; color: black;'>No data available on current page.</div>"
								},
								columnMenu: {
									filterable: false,
									sortable:false
								},
								dataBound: onDataBound,
								columns: [
									{
										headerTemplate: '<input type="checkbox" name="checkAll" id="checkAll" onClick="checkAllBoxClick();">',
										template: "<input type='checkbox' id='#=sourceId#' onClick='checkBoxClick(this);'>",
										width: 30
									},
									{
										field: "sourceId",
										title: "Source Id"
									},
									{
										field: "deviceName",
										title: "Device Name"
									},
									{
										field: "make",
										title: "Make"
									},
									{
										field: "deviceType",
										title: "Type"
									},
									{
										field: "model",
										title: "Model"
									},
									{
										field: "protocol",
										title: "Protocol"
									},
									{
										field: "version",
										title: "Version"
									},
									{
										field: "networkProtocol",
										title: "Network Protocol"
									}
								]
	});
	
	$(window).resize(function () {
		$("#gapp-device-list").data("kendoGrid").resize();
		$('#deviceSection').css("width", "70%");
	});
}

function onDataBound(e){
	var view = this.dataSource.view();
	var VarChkCnt = 0;
	for(var i = 0; i < view.length;i++){
		
		if($.inArray(view[i].sourceId, ArrSelDevices) != -1){
			this.tbody.find("input[id='" + view[i].sourceId + "']").prop("checked",true).closest("tr").addClass('k-state-selected');
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

var ArrSelDevices = [];
function checkAllBoxClick() {
	var grid = $('#gapp-device-list').data("kendoGrid");
	if ($("#checkAll").is(":checked")) {
		
		//Select all rows on screen
		grid.tbody.children('tr').addClass('k-state-selected');
		$('#gapp-device-list').find('input[type=checkbox]').prop("checked", true);
		var ArrDisplayedData = grid.dataSource.view().toJSON();
		$.each(ArrDisplayedData,function(){
			if($.inArray(this.sourceId, ArrSelDevices) == -1){
				ArrSelDevices.push(this.sourceId);
			}
		});
		
	} else {
					
		grid.tbody.children('tr').removeClass('k-state-selected');
		$('#gapp-device-list').find('input[type=checkbox]').prop("checked", false);
		var ArrDisplayedData = grid.dataSource.view().toJSON();
		$.each(ArrDisplayedData,function(){
			ArrSelDevices.splice($.inArray(this.rowid, ArrSelDevices),1);

		});
	}
	
	if(ArrSelDevices.length > 0){
		$('#claim_device_btn').attr('disabled',false);
	} else {
		$('#claim_device_btn').attr('disabled',true);
	}	
	
}

function checkBoxClick(VarThis) {
	$("#checkAll").prop("checked", false);
	var check = $('#gapp-device-list').find('input[type="checkbox"]:checked').length;
	var checkAll = $('#gapp-device-list').find('input[type="checkbox"]').length;
	var VarSelItem = $(VarThis).attr('id');
	if($(VarThis).is(':checked') == true){
		if($.inArray(VarSelItem, ArrSelDevices) == -1){
			$(VarThis).closest("tr").addClass('k-state-selected');
			ArrSelDevices.push(VarSelItem);
		}
	} else {
		$(VarThis).closest("tr").removeClass('k-state-selected');
		ArrSelDevices.splice($.inArray(VarSelItem, ArrSelDevices),1);
	}
		
	//Check the header checkbox if all row checkboxes on screen are selected
	if (check == (checkAll - 1)){
		$("#checkAll").prop("checked", true);
	}
	
	if(ArrSelDevices.length > 0){
		$('#claim_device_btn').attr('disabled',false);
	} else {
		$('#claim_device_btn').attr('disabled',true);
	}
	
}