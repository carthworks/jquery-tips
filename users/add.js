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
														var VarParam = {"domain": {"domainName": VarCurrentTenantInfo.tenantDomain},"fieldValues": [{"key": "userName","value": FnTrim(input.val())}]};
														$.ajax({
															type:'POST',
															cache: true,
															async: false,
															contentType: 'application/json; charset=utf-8',
															url: GblAppContextPath+"/ajax" + url,
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
	
	$("#roleName").kendoMultiSelect({
										dataTextField : "name",
										dataValueField : "name",
										animation: false,
										placeholder: "Select Roles...",
										enable: true
									});
	FnGetRoleList();
	
	if(VarEditUserId != ''){
		FnGetUserDetails(VarEditUserId);
	}
	
	$('#gapp-user-save').prop('disabled', true);
	FnCheckEmptyFrmFields('#userName, #lastName, #emailId, #roleName', '#gapp-user-save');	
	
	$("#user-image").change(function(){
		readURL(this,$(this).attr('id'));			
        
    });
	
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

function FnSaveUser(){
	$('#gapp-user-save, #gapp-user-cancel').attr('disabled',true);
	var validator = $("#gapp-adduser-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	if (validator.validate()) { 
	
		if(VarEditUserId == ''){ // Create User		
			var VarUrl = GblAppContextPath+'/ajax' + VarCreateUserUrl;
			var VarParam = {};
			var VarStatus = false;
			$("input[name='statusName']").each(function(){				
				if($(this).is(':checked') == true && $(this).val()=='ACTIVE'){
					VarStatus = true;
				}
			});
			
			VarParam = FnGetFormFieldValues("gapp-adduser-form","input[type=text],input[type=email],select");
			VarParam['emailLink']= VarAPPServerPath+'/resetpassword';
			VarParam['domain'] = VarCurrentTenantInfo.tenantDomain;	
			VarParam['active'] = VarStatus;
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveUser);
		
		} else { // Update User
		
			var VarUrl =GblAppContextPath+ '/ajax' + VarUpdateUserUrl;
			VarUrl = VarUrl.replace("{user_name}",VarEditUserId);
			VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
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
		
		}
		
	} else {
		$('#gapp-user-save, #gapp-user-cancel').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResSaveUser(response){
	
	var ObjResponse = response;
	$('#gapp-user-save, #gapp-user-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	
	if(!$.isEmptyObject(ObjResponse)){
		
		if(ObjResponse.errorCode == undefined){
		
			var ObjImageFile = $("#user-image").prop("files")[0];
			if(!$.isEmptyObject(ObjImageFile)){ // Upload User Image
				
				var options = {
							url:GblAppContextPath+"/upload/user",
							success:FnResImageUpload
				};
				
				$('#gapp-adduser-form').ajaxSubmit(options);
			}
	
			notificationMsg.show({
				message : 'User added successfully'
			}, 'success');
		
			FnFormRedirect('gapp-user-list',GBLDelayTime);
			
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

function FnResUpdateUser(response){
	var ObjResponse = response;
	$('#gapp-user-save, #gapp-user-cancel').attr('disabled',false);
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
		
			FnFormRedirect('gapp-user-list',GBLDelayTime);
			
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

function FnCancelUser(){
		
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-user-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-user-list').submit();
	}
	
}

function FnNavigateUserList(){
	$('#gapp-user-list').submit();
}

function FnGetRoleList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListRoleUrl;
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
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

function FnGetUserDetails(VarUserName){	
	var VarUrl = GblAppContextPath+'/ajax' + VarViewUserUrl;
	VarUrl = VarUrl.replace("{user_name}",VarUserName);
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResUserDetails);
	
}

function FnResUserDetails(response){
	var ArrResponse = response;
	if(!$.isEmptyObject(ArrResponse)){
		$("#gapp-adduser-form :input").prop("disabled", true);
		$('#gapp-user-save').attr('disabled',true);
		$("#gapp-user-cancel").prop("disabled", false);
	
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
	var roles = $("#roleName").data("kendoMultiSelect");
	roles.enable(true);
	$('#caption-display-subject').text('Edit User');
	$('#caption-display-breadcrumb').text('Edit User');
	$('#userName').prop("disabled", true);
	$("#gapp-user-save").prop("disabled", false);
	$('#gapp-user-edit').hide();
	
	
}