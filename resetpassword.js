"use strict";

$(document).ready(function(){
	
	// Form Validation
	$("#gapp-resetpassword-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
											rules : {
												matches : function(input) {
													var matches = input.data('matches');
													if (matches) {
														var match = $(matches);
														if (input.is('[name=retypepassword]')) {
															return FnTrim(input.val()) == FnTrim(match.val());
														}
													}
													return true;
												}
										
											},
											messages : {
												matches : function(input) {
													return input.data("matchesMsg");
												}
											}
	});

});


function FnResetPassword(){	
	$('#gapp-password-save').attr('disabled',true);
	var validator = $("#gapp-resetpassword-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	if (validator.validate()) {
		var VarUrl = GblAppContextPath + '/ajaxtoken' + VarResetPasswordUrl;
		var VarParam = {};
		VarParam['userName'] = VarMyEntityName;		
		VarParam['password'] = FnTrim($('#pass').val());
		VarParam['domain'] = VarMyDomain;
		VarParam['resetPasswordIdentifierLink'] = VarIdentifier;		
		
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResResetPassword);
	} else {
		$('#gapp-password-save').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResResetPassword(response){	
		
	var ArrResponse = response;	
	$('#gapp-password-save').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){
		notificationMsg.show({
				message : 'Password changed successfully'
			}, 'success');
		FnRedirect(GblAppContextPath +"/login",2000);	
	} else {
	
		notificationMsg.show({
			message : ArrResponse['errorMessage']
		}, 'error');
		
	}
}