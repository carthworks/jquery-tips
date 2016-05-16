"use strict";

$(document).ready(function(){

	// Form Validation
	$("#gapp-adduser-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
											rules : {
												available:function(input){
													var validate = input.data('available');
													var VarExist = true;
													if (typeof validate !== 'undefined' && validate !== false) {
														var url = input.data('available-url');
														var VarParam = {"domain": {"domainName": VarLoggerUserDomain},"fieldValues": [{"key": "userName","value": FnTrim(input.val())}]};
														$.ajax({
															type:'POST',
															cache: true,
															async: false,
															contentType: 'application/json; charset=utf-8',
															url: GblAppContextPath + "/ajax" + url,
															data: JSON.stringify(VarParam),
															dataType: 'json',
															success: function(result) {
																//console.log(result);
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
	
	// Form Validation
	$("#gapp-changepassword-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
											rules : {
												matches : function(input) {
													var matches = input.data('matches');
													if (matches) {
														var match = $(matches);
														if (input.is('[name=confirmpassword]')) {
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
	
	$("#roleName").kendoMultiSelect({
										dataTextField : "name",
										dataValueField : "name",
										animation: false,
										placeholder: "Select Roles...",
										enable: true
									});
	
	$("#user-image").change(function(){
		readURL(this,$(this).attr('id'));			
        
    });
	
});

$(window).load(function(){
	FnGetRoleList();
	FnGetUserDetails(VarEditUserId);
});

function readURL(input,id) {
	var ArrAllowedImgTypes = ["image/jpeg","image/png","image/gif"];
	var VarImageType = input.files[0]['type'];
	if(ArrAllowedImgTypes.indexOf(VarImageType) != -1){
		if (input.files && input.files[0]) {
			var reader = new FileReader();			
			reader.onload = function (e) {
				$('#user-image-preview').attr('src', e.target.result);
				$('#user-image-preview').css('background-color','whitesmoke');
			}			
			reader.readAsDataURL(input.files[0]);
		}		
	} else {
		alert('Invalid File');		
	}
	
}

function FnGetRoleList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListRoleUrl;
	VarUrl = VarUrl.replace("{domain}",VarLoggerUserDomain);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResRoleList);
}

function FnResRoleList(response){
	var ArrResponse = response;
	var ArrResData = [];
	if(ArrResponse.errorCode == undefined){
		$.each(ArrResponse,function(key,obj){
			var ObjRole = {};
			ObjRole.name = obj.roleName;
			ArrResData.push(ObjRole);
		});
	}
	var roles = $("#roleName").data("kendoMultiSelect");
	roles.setDataSource(ArrResData);
}

function addslashes(str) {
	
  //str = str.replace(/\\/g, '\\\\');
  //str = str.replace(/\'/g, '\'');
  str = str.replace(/\'/g, "\\'");
  //str = str.replace(/\"/g, '\\"');
  //str = str.replace(/\0/g, '\\0');
  
  return str;

}

function stripslashes(str) {
    //str = str.replace(/\\'/g, '\'');
    str = str.replace(/\"/g, '"');
    //str = str.replace(/\\0/g, '\0');
    //str = str.replace(/\\\\/g, '\\');
    return str;
}

function FnGetFormFieldValues(VarFrmId,VarAllowCond){
	var ArrFieldValuesJSONObj = {};
	$('#'+VarFrmId).find(VarAllowCond).each(function(){
		
		var VarFieldName = $(this).attr('name');
		var VarFieldValue = FnTrim($(this).val());		
		
		if (!(typeof VarFieldValue === "undefined") && VarFieldValue!='' ) {
			if ($(this).is("[type='text']") || $(this).is("[type='email']") || $(this).is("[type='url']"))  {
				ArrFieldValuesJSONObj[VarFieldName] = VarFieldValue;
			} else if($(this).is("select")){
				if($(this).attr('multiple') == undefined){
					ArrFieldValuesJSONObj[VarFieldName] = FnTrim($(this).find('option:selected').text());
				} else {						
					var ArrVal = VarFieldValue.split(',');
					ArrFieldValuesJSONObj[VarFieldName] = addslashes(JSON.stringify(ArrVal));
				}
			} else if($(this).is("[type='checkbox']")){
				if($(this).is(':checked') == true){
					ArrFieldValuesJSONObj[VarFieldName] = VarFieldValue;
				}
			}		
			
		}
	});
	
	return ArrFieldValuesJSONObj;
}

function FnGetUserDetails(VarUserName){	
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath +'/ajax' + VarViewUserUrl;
	VarUrl = VarUrl.replace("{user_name}",VarUserName);
	VarUrl = VarUrl.replace("{domain}",VarLoggerUserDomain);
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResUserDetails);	
}

function FnResUserDetails(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;
	if(!$.isEmptyObject(ArrResponse)){
		$("#gapp-adduser-form :input").prop("disabled", true);
		$('#gapp-user-edit').attr('disabled',false);
		$('.upload-addicon').hide();
		$.each(ArrResponse['fieldValues'],function(key,obj){
			
			if($('#gapp-adduser-form #'+obj['key'])){
				if(obj['key'] == 'roleName'){
					var multiselect = $("#roleName").data("kendoMultiSelect");
					var ArrUR = JSON.parse(stripslashes(obj['value']));
					multiselect.value(ArrUR);
					multiselect.enable(false);
				} else {
					$('#gapp-adduser-form #'+obj['key']).val(obj['value']);
				}
			}
		});
		
		if(ArrResponse['entityStatus']['statusName'] == 'ACTIVE'){
			$('#gapp-adduser-form #statusName_active').attr('checked',true);
		} else {
			$('#gapp-adduser-form #statusName_inactive').attr('checked',true);
		}
	}	
}

function FnEditUser(){	
	$("#gapp-adduser-form :input").prop("disabled", false);
	$('#gapp-adduser-form #userName').prop("disabled", true);
	$('.upload-addicon').show();
	$("#gapp-user-save").prop("disabled", false);
	$('#gapp-user-edit').hide();
}

function FnSaveUser(){
	$('#gapp-user-save').attr('disabled',true);
	var validator = $("#gapp-adduser-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	if (validator.validate()) { 
	
		var VarUrl = GblAppContextPath+ '/ajax' + VarUpdateUserUrl;
		VarUrl = VarUrl.replace("{user_name}",VarEditUserId);
		VarUrl = VarUrl.replace("{domain}",VarLoggerUserDomain);
		var VarParam = {};
			
		var VarStatus = false;
		$("input[name='statusName']").each(function(){				
			if($(this).is(':checked') == true && $(this).val()=='ACTIVE'){
				VarStatus = true;
			}
		});
					
		VarParam = FnGetFormFieldValues("gapp-adduser-form","input[type=text],input[type=email],select");
		VarParam['active'] = VarStatus;
		delete VarParam['userName']; 
		
		FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResUpdateUser);
		
	} else {
		$('#gapp-user-save').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResUpdateUser(response){
	var ObjResponse = response;
	$('#gapp-user-save').attr('disabled',false);
	$("#GBL_loading").hide();
	if(!$.isEmptyObject(ObjResponse)){
		
		if(ObjResponse.errorCode == undefined){
		
			var ObjImageFile = $("#user-image").prop("files")[0];
			if(!$.isEmptyObject(ObjImageFile)){ // Upload User Image
				
				var options = {
							url:GblAppContextPath+"/upload/user",
							success:FnResImageUpload
				};
				$("#gapp-adduser-form :input").prop("disabled", false);
				$('#gapp-adduser-form').ajaxSubmit(options);
			}
	
			notificationMsg.show({
				message : 'User updated successfully'
			}, 'success');
			
			$("#gapp-adduser-form :input").prop("disabled", true);
			$('#gapp-user-edit').show().attr('disabled',false);
			$('.upload-addicon').hide();
					
		} else {
			notificationMsg.show({
				message : ObjResponse['errorMessage']
			}, 'error');
		}
		
	} else {
		notificationMsg.show({
			message : 'Error'
		}, 'error');
	}
}

function FnResImageUpload(response,status){
	$('#user-image').val('');
}

function FnChangePassword(){
	$('#gapp-password-save').attr('disabled',true);
	var validator = $("#gapp-changepassword-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	if (validator.validate()) {
		var VarUrl = GblAppContextPath + '/ajax' + VarChangePasswordUrl;
		var VarParam = {};
		VarParam = {
			'userName' : VarEditUserId + VarAppDomainSeparator + VarLoggerUserDomain,
			'password' : FnTrim($('#oldpassword').val()),
			'newPassword' : FnTrim($('#newpassword').val())
		};
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResChangePassword);
	} else {
		$('#gapp-password-save').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResChangePassword(response){
	$("#GBL_loading").hide();
	$('#gapp-password-save').attr('disabled',false);
	if(response.status == 'SUCCESS'){
		notificationMsg.show({
				message : 'Password changed successfully'
			}, 'success');
		$("#gapp-changepassword-form #oldpassword, #gapp-changepassword-form #newpassword, #gapp-changepassword-form #confirmpassword").val('');
	} else {
		notificationMsg.show({
			message : response['errorMessage']
		}, 'error');
	}
}



