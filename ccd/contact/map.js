"use strict";

$(document).ready(function(){
	FnGetContactMappedEquipments(VarContactInfo.contactId);
	FnGetEquipmentList();
});

function FnGetContactMappedEquipments(VarContactId){
	var VarUrl = GblAppContextPath+'/ajaxccd' + VarContactEquipUrl;
	VarUrl = VarUrl.replace("{contact_id}",VarContactId);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResContactMappedEquipments);
}

var GblArrContactEquips = [];
function FnResContactMappedEquipments(response){
	console.log(response);
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	if(VarResLength > 0){
		$.each(ArrResponse,function(){
			GblArrContactEquips.push(this.assetName);
		});
	}
}

function FnGetEquipmentList(){
	var VarUrl = GblAppContextPath+'/ajaxccd' + VarListEquipUrl;
	var VarParam = {};
	VarParam['tenantName'] = VarCurrentTenantInfo.tenantName;
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResEquipmentList);
}

function FnResEquipmentList(response){
	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	var VarEquipTxt = '';
	if(VarResLength > 0){
		$(ArrResponse).each(function(){
			if($.inArray(this.assetName,GblArrContactEquips) == -1){
				VarEquipTxt += '<option value="'+this.rowIdentifier+'">'+this.assetName+'</option>';
			}
		});
	}
	
	$('#event_inputlist').html(VarEquipTxt);
	
}

function FnAttachEquipments(){
	$('#gapp-equipmap-save, #gapp-equipmap-cancel').attr('disabled',true);
	var ArrEquipIds = [];
	$('#event_outputlist option').map(function() {
		ArrEquipIds.push($(this).val());
	}).get();
	
	if(ArrEquipIds.length > 0){
		var VarUrl = GblAppContextPath+'/ajaxccd' + VarAttachEquipUrl;
		var VarParam = {};
		VarParam['contactId'] = VarContactInfo.contactId;
		VarParam['equipmentIds'] = ArrEquipIds;
		VarParam['tenantName'] = VarCurrentTenantInfo.tenantName;
		$("#GBL_loading").show();
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResAttachEquipments);
	} else {
		$("#alertModal").modal('show').find(".modalMessage").text("Please select atleast one asset.");
		$('#gapp-equipmap-save, #gapp-equipmap-cancel').attr('disabled',false);
		return false;
	}
}

function FnResAttachEquipments(response){

	var ObjResponse = response;
	$('#gapp-equipmap-save, #gapp-equipmap-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ObjResponse.status == 'SUCCESS'){
		
		notificationMsg.show({
			message : 'Assets mapped successfully'
		}, 'success');
		
		$("#gapp-contact-view #contact_info").val(JSON.stringify(VarContactInfo));
		$("#gapp-contact-view").attr("action",VarContactView);
		FnFormRedirect('gapp-contact-view',GBLDelayTime);
	} else {
		notificationMsg.show({
			message : ObjResponse['errorMessage']
		}, 'error');
	}

}

function FnCancelMapEquipments(){
	$("#gapp-contact-view").attr("action",VarContactList);
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-contact-view');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-contact-view').submit();
	}
	
}


/***** BEGIN: Assign button operations *******/
$('#btnRight').click(function(e) {
	$("#outputlistval").hide();
	var selectedOpts = $('#event_inputlist option:selected');
	if (selectedOpts.length == 0) {
		
		notificationMsg.show({
			message : 'Please select Assets'
		}, 'error');
		e.preventDefault();
	}
	$('#gapp-equipmap-save').attr('disabled',false);
	$('#event_outputlist').append($(selectedOpts).clone());
	$(selectedOpts).remove();
	e.preventDefault();
});


$('#btnLeft').click(function(e) {
	var selectedOpts = $('#event_outputlist option:selected');
	if (selectedOpts.length == 0) {
		
		notificationMsg.show({
			message : 'Please select Assets'
		}, 'error');
		e.preventDefault();
	}
	$('#event_inputlist').append($(selectedOpts).clone());
	$(selectedOpts).remove();
	
	var ArrSelEquipments = [];
	$('#event_outputlist option').map(function() {
		ArrSelEquipments.push($(this).val());
	}).get();
	if(ArrSelEquipments.length > 0){
		$('#gapp-equipmap-save').attr('disabled',false);
	} else {
		$('#gapp-equipmap-save').attr('disabled',true);
	}
	
	e.preventDefault();
});

$('#btnLeftall').click(function(e) {
	var selectedOpts = $('#event_outputlist option');
	if (selectedOpts.length == 0) {
		e.preventDefault();
	}
	$('#event_inputlist').append($(selectedOpts).clone());
	$(selectedOpts).remove();
	$('#gapp-equipmap-save').attr('disabled',true);
	e.preventDefault();
});

$('#btnRightall').click(function(e) {
	var selectedOpts = $('#event_inputlist option');
	if (selectedOpts.length == 0) {
		notificationMsg.show({
			message : 'Please select Assets'
		}, 'error');
		e.preventDefault();
	}
	$('#event_outputlist').append($(selectedOpts).clone());
	$(selectedOpts).remove();
	
	$('#gapp-equipmap-save').attr('disabled',false);
	
	e.preventDefault();
});

/***** END: Assign button operations *******/