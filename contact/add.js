"use strict";

$(document).ready(function(){

	// Form Validation
	$("#gapp-contact-form").kendoValidator({
		validateOnBlur : true,
		errorTemplate: "<span class='help-block'><code>#=message#</code></span>"
	});

});

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
	VarUrl = VarUrl.replace("{tenant_name}",VarCurrentTenantInfo.tenantName);
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
				console.log(ObjResponse.dataprovider);
				$.each(ObjResponse.dataprovider,function(){
					element[this.key] = this.value;
				});
				
				ObjTenantInfo['tenantName'] = element['tenantName'];
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
		if(VarEditContactId == ''){ // Create Contact
			var VarUrl = GblAppContextPath+'/ajax' + VarCreateContactUrl;
			var VarParam = {};
			
			VarParam["tenant"] = FnGetTenantInfo();
			VarParam["contacts"] = FnGetContactDetails();
			console.log(JSON.stringify(VarParam));
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveContact);
		}
		
	} else {
		$('#gapp-contact-save, #gapp-contact-cancel').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResSaveContact(response){	
	console.log(response);
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
	//$('#equipmentId, #facility, #timeZone').prop("disabled", true);
	$('#gapp-contact-edit').hide();
}