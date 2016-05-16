"use strict";

$(document).ready(function(){

	// Form Validation
	$("#gapp-clientadmin-form").kendoValidator({
													validateOnBlur : true,
													errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
													rules : {
													available:function(input){
														var validate = input.data('available');
														var VarExist = true;
														if (typeof validate !== 'undefined' && validate !== false) {
															var url = input.data('available-url');
															var VarParam = {"domain": {"domainName": VarMyDomain},"fieldValues": [{"key": "userName","value": FnTrim(input.val())}]};
															$.ajax({
																type:'POST',
																cache: true,
																async: false,
																contentType: 'application/json; charset=utf-8',
																url: GblAppContextPath + "/ajaxtoken" + url,
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
	
});

function FnGetFormFieldValues(VarFrmId,VarAllowCond){
	var ArrFieldValuesJSONObj = [];
	$('#'+VarFrmId).find(VarAllowCond).each(function(){
		var ObjFieldMap = {};
		var VarFieldName = $(this).attr('name');
		var VarFieldValue = FnTrim($(this).val());
		if (!(typeof VarFieldValue === "undefined") && VarFieldValue!='') {
			if ($(this).is("[type='text']") || $(this).is("[type='email']") || $(this).is("[type='url']")) {
				ObjFieldMap["key"] = VarFieldName;
	            ObjFieldMap["value"] = VarFieldValue;
			}
			
			ArrFieldValuesJSONObj.push(ObjFieldMap);
		}
	});
	
	return ArrFieldValuesJSONObj;
}

function FnSaveClientAdmin(){
	$('#gapp-clientadmin-save').attr('disabled',true);
	var validator = $("#gapp-clientadmin-form").data("kendoValidator");
	validator.hideMessages();
	//kendo.ui.progress($("#gapp-clientadmin-form"), true);
	$("#GBL_loading").show();
	if (validator.validate()) { //alert('success');
		var VarUrl = GblAppContextPath +'/ajaxtoken' + VarCreateClientAdminUrl;
		var VarParam = {};
		VarParam['entityStatus'] = {"statusName" : "ACTIVE"};
		VarParam['fieldValues'] = FnGetFormFieldValues("gapp-clientadmin-form","input[type=text],input[type=email]");
		VarParam['tenantAdminLinkIdentifier'] = VarIdentifier;
		VarParam['setPasswordUrl'] = VarAPPServerPath + "/resetpassword";
		VarParam['domain'] = { "domainName": VarMyDomain };
		//console.log(VarParam);
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveClientAdmin);
	} else {
		$('#gapp-clientadmin-save').attr('disabled',false);
		//kendo.ui.progress($("#gapp-clientadmin-form"), false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResSaveClientAdmin(response){
	var ArrResponse = response;
	$('#gapp-clientadmin-save').attr('disabled',false);
	//kendo.ui.progress($("#gapp-clientadmin-form"), false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){
	
		notificationMsg.show({
			message : 'Successfully Added'
		}, 'success');
		
		FnRedirect(GblAppContextPath,2000);
		
	} else {
	
		notificationMsg.show({
			message : ArrResponse['errorMessage']
		}, 'error');
		
	}
}