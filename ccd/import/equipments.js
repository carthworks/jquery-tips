"use strict";

$(document).ready(function(){
	FnGetImportedEquipList();
	$('#gapp-importequip-save').prop('disabled', true);
});

function FnGetImportedEquipList(){
	var VarUrl = GblAppContextPath+'/ajaxccd' + VarImportedEquipUrl;
	var VarParam = {};
	VarParam['tenantName'] = VarCurrentTenantInfo.tenantName;
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResImportedEquipList);	
}

var GblArrImported = [];
function FnResImportedEquipList(response){
	var ArrResponse = response;
	if($.isArray(ArrResponse)){
		var VarResLength = ArrResponse.length;
		if(VarResLength > 0){
			$.each(ArrResponse,function(){
				GblArrImported.push(this.assetName);
			});
		}
	}	
	FnGetEquipmentList();
}

function FnGetEquipmentList(){
	var VarUrl =GblAppContextPath+'/ajaxccd' + VarListEquipUrl;
	VarUrl = VarUrl.replace("{tenant_name}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResEquipmentList);
}

function FnResEquipmentList(response){
	var ArrResponse = response;
	var ArrResponseData = [];
	if($.isArray(ArrResponse)){
		$.each(ArrResponse,function(){
			if($.inArray(this.assetName,GblArrImported) == -1){
				ArrResponseData.push(this);
			}
		});
	}	
		
	var ArrColumns = [
						{
							headerTemplate: '<input type="checkbox" name="checkAll" id="checkAll" onClick="checkAllBoxClick();">',
							template: "<input type='checkbox' id='#=rowIdentifier#' onClick='checkBoxClick();'>",
							filterable:false,
							sortable:false
						},
						{
							field: "assetName",
							title: "Asset Name"
						},
						{	field: "assetType",
							title: "Asset Type"
						},
						{	field: "assetId",
							title: "Asset Id"
						},
						{	field: "serialNumber",
							title: "Serial Number"
						}
					];
					
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 0,
		"pageable" : false,
		"selectable" : true,
		"messages" : "<div class='Metronic-alerts alert alert-info fade in'> <i class='fa-lg fa fa-warning'></i> No assets to be imported </div>"
	};
	
	var objDatasource = {};
	objDatasource['data']=ArrResponseData;
	objDatasource['sort']={field: "assetName", dir: "asc"}
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-importequip-list',objDatasource,ArrColumns,ObjGridConfig);
		
}

function checkAllBoxClick() {
	var grid = $('#gapp-importequip-list').data("kendoGrid");
	if ($("#checkAll").is(":checked")) {
		$('#gapp-importequip-save').removeAttr('disabled');
		//Select all rows on screen
		grid.tbody.children('tr').addClass('k-state-selected');
		$('#gapp-importequip-list').find('input[type=checkbox]').prop("checked", true);
		var row = $("input:checked", grid.tbody).closest("tr");
		
	} else {
		$('#gapp-importequip-save').prop('disabled', true);	
		grid.tbody.children('tr').removeClass('k-state-selected');
		$('#gapp-importequip-list').find('input[type=checkbox]').prop("checked", false);
		
	}	   
}

function checkBoxClick() {
	//$('#gapp-importequip-save').removeAttr('disabled');
	//GBLcancel = 1;
	$("#checkAll").prop("checked", false);
	var check = $('#gapp-importequip-list').find('input[type="checkbox"]:checked').length;
	var checkAll = $('#gapp-importequip-list').find('input[type="checkbox"]').length;
	
	//Check the header checkbox if all row checkboxes on screen are selected
	if (check == (checkAll - 1))
		$("#checkAll").prop("checked", true);
	
	//
	var VarChecked = false;
	$("input[type=checkbox]").each(function(index, element){
		if(element.checked){
			VarChecked = true;
		} 
	});
	if(VarChecked){
		$('#gapp-importequip-save').removeAttr('disabled');
	}else{
		$('#gapp-importequip-save').prop('disabled', true);
	}
}

function FnGetSelectedEquipments(){
	var ArrEquipments = [];
	
	var grid = $("#gapp-importequip-list").data("kendoGrid");
	var ds = grid.dataSource.view();
	for (var i = 0; i < ds.length; i++) {
		var row = grid.table.find("tr[data-uid='" + ds[i].uid + "']");
		var checkbox = $(row).find("input[type='checkbox']");
		if (checkbox.is(":checked")) {
			var VarAssetId = (ds[i].assetId != undefined) ? ds[i].assetId : '';
			var VarSerialNumber = (ds[i].serialNumber != undefined) ? ds[i].serialNumber : '';
			ArrEquipments.push({"assetName":ds[i].assetName,"assetType":ds[i].assetType,"assetId":VarAssetId,"serialNumber":VarSerialNumber});
		}
	}
	
	return ArrEquipments;
}

function FnGetTenantInfo(){
	var ObjTenantInfo = {};
	
	var VarUrl = GblAppContextPath+'/ajax' + VarViewClientUrl;
	VarUrl = VarUrl.replace("{tenant_id}",VarCurrentTenantInfo.tenantId);
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.parentDomain);
	
	$.ajax({
		type:'GET',
		cache: true,
		async: false,
		contentType: 'application/json; charset=utf-8',
		url: VarUrl,
		data: '',
		dataType: 'json',
		success: function(response) {
			var ObjResponse = response;
			if(ObjResponse.errorCode == undefined){
				var element = {};
				console.log(ObjResponse.fieldValues);
				$.each(ObjResponse.fieldValues,function(){
					element[this.key] = this.value;
				});
				
				ObjTenantInfo['tenantName'] = element['tenantName'];
				ObjTenantInfo['tenantId'] = element['tenantId'];
				ObjTenantInfo['contactFName'] = element['firstName'];
				ObjTenantInfo['contactLName'] = element['lastName'];
				
			} else {
				notificationMsg.show({
					message : ObjResponse['errorMessage']
				}, 'error');
			}
			
		},
		error : function(xhr, status, error) {
		
		}
	});
		
	return ObjTenantInfo;
}

function FnImportEquipments(){
	$('#gapp-importequip-cancel, #gapp-importequip-save').attr('disabled',true);
	var ArrEquipments = FnGetSelectedEquipments();
	if(ArrEquipments.length>0){
		$("#GBL_loading").show();
		var VarUrl = GblAppContextPath+'/ajaxccd' + VarAddEquipUrl;
		var VarParam = {};
		VarParam['equipments'] = ArrEquipments;
		VarParam["tenant"] = FnGetTenantInfo();
		console.log(JSON.stringify(VarParam));
		//return false;
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResImportEquipments);
		
	} else {
		
		$("#alertModal").modal('show').find(".modalMessage").text("Please select at least one asset.");
		$('#gapp-importequip-save, #gapp-importequip-cancel').attr('disabled',false);
		return false;
		
	}	
}

function FnResImportEquipments(response){
	console.log(response);
	var ObjResponse = response;
	$('#gapp-importequip-cancel, #gapp-importequip-save').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ObjResponse.status == 'SUCCESS'){	
				 
		notificationMsg.show({
			message : 'Assets Imported successfully'
		}, 'success');
		
		FnFormRedirect('gapp-equipimported-list',GBLDelayTime);
		
	} else {
	
		notificationMsg.show({
			message : ObjResponse['errorMessage']
		}, 'error');
		
	}
}

function FnImportCancel(){
		
	var VarChecked = false;
	$("input[type=checkbox]").each(function(index, element){
		if(element.checked){
			VarChecked = true;
		} 
	});
	if(VarChecked){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-equipimported-list');
		$('#GBLModalcancel').modal('show');
	}else{
		$('#gapp-equipimported-list').submit();
	}
	
}

function FnBreadCrumbAssetList(){
	$('#gapp-equipimported-list').submit();
}