"use strict";

$(document).ready(function(){

	// Form Validation
	$("#gapp-contact-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>"
	});
	
	if(VarContactInfo != ''){
		var ObjContactInfo = $.parseJSON(VarContactInfo);
		$.each(ObjContactInfo,function(key,value){
			if($('#gapp-contact-form #'+key)){
				$('#gapp-contact-form #'+key).val(value);
			}
		});
		$("#gapp-contact-form :input").prop("disabled", true);
		$('#gapp-contact-save').attr('disabled',true);
		$("#gapp-contact-cancel").prop("disabled", false);
		FnGetContactMappedEquipments(ObjContactInfo.contactId);
	}
	
	$('#gapp-contact-save').prop('disabled', true);
	FnCheckEmptyFrmFields('#name, #email, #contactType, #contactNumber', '#gapp-contact-save');

});

function FnGetContactMappedEquipments(VarContactId){
	var VarUrl = GblAppContextPath+'/ajaxccd' + VarContactEquipUrl;
	VarUrl = VarUrl.replace("{contact_id}",VarContactId);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResContactMappedEquipments);
}

function FnResContactMappedEquipments(response){
	console.log(response);
	var ArrResponse = response;
	
	var ArrColumns = [
						{
							field: "assetName",
							title: "Asset Name"
						}
					
					];
					
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: true },
		"selectable" : true
	};
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-mappedequip-list',ArrResponse,ArrColumns,ObjGridConfig);
}

function FnGetContactDetails(){
	var ArrContactDetails = [];
	var ObjFieldMap = {};
	ObjFieldMap['name'] = FnTrim($('#name').val());
	ObjFieldMap['email'] = FnTrim($('#email').val());
	if(FnTrim($('#contactNumber').val()) != ''){
		ObjFieldMap['contactNumber'] = FnTrim($('#contactNumber').val());
	}
	ObjFieldMap['contactType'] = FnTrim($('#contactType').val());
	ArrContactDetails.push(ObjFieldMap);
	return ArrContactDetails;
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

function FnSaveContact(){
	$('#gapp-contact-save, #gapp-contact-cancel').attr('disabled',true);
	var validator = $("#gapp-contact-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	
	if (validator.validate()) {
		var VarUrl = GblAppContextPath+'/ajaxccd' + VarCreateContactUrl;
		var VarParam = {};		
		VarParam["tenant"] = FnGetTenantInfo();
		VarParam["contacts"] = FnGetContactDetails();
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveContact);
		
	} else {
		$('#gapp-contact-save, #gapp-contact-cancel').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResSaveContact(response){
	var ObjResponse = response;
	$('#gapp-contact-save, #gapp-contact-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ObjResponse.status == 'SUCCESS'){	
				 
		notificationMsg.show({
			message : 'Contact added successfully'
		}, 'success');
		
		FnFormRedirect('gapp-contact-list',GBLDelayTime);
		
	} else {
	
		notificationMsg.show({
			message : ObjResponse['errorMessage']
		}, 'error');
		
	}
		
}

function FnCancelContact(){
		
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-contact-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-contact-list').submit();
	}
}

function FnNavigateContactList(){
	$('#gapp-contact-list').submit();
}

function FnEditContact(){
	$("#gapp-contact-form :input").prop("disabled", false);
	$("#gapp-contact-save").prop("disabled", false);
	$('#gapp-contact-edit').hide();
}