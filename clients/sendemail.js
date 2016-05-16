"use strict";

$(document).ready(function(){

	// Form Validation
	$("#gapp-clientadmin-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>"
										});
	$('#gapp-clientadmin-save').prop('disabled', true);
	FnCheckEmptyFrmFields('#clientadminemail', '#gapp-clientadmin-save');
});

function FnCreateClientAdmin(){
	$('#gapp-clientadmin-save').attr('disabled',true);
	var validator = $("#gapp-clientadmin-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	if (validator.validate()) {
		
		var VarUrl = GblAppContextPath+'/ajax' + VarCreateClientAdminUrl;
		var VarParam = {};
		VarParam['email'] = FnTrim($('#clientadminemail').val());
		VarParam['createTenantAdminUrl'] = VarAPPServerPath +"/clientadmin";
		VarParam['tenantDomain'] = VarTenantDomain;		
		console.log(JSON.stringify(VarParam));
		//return false;
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResCreateClientAdmin);
	} else {
		$('#gapp-clientadmin-save').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResCreateClientAdmin(response){
	var ArrResponse = response;
	$('#gapp-clientadmin-save').attr('disabled',false);
	//kendo.ui.progress($("#gapp-clientadmin-form"), false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){
	
		notificationMsg.show({
			message : 'Email sent successfully'
		}, 'success');
		
		
		FnFormRedirect('gapp-client-list',GBLDelayTime);
		
	} else {
	
		notificationMsg.show({
			message : ArrResponse.errorMessage
		}, 'error');
		
	}
}

function FnNavigateClientList(){
	$('#gapp-client-list').submit();
}