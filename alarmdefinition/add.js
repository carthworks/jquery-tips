"use strict";

$(document).ready(function(){

	$('#gapp-role-save').prop('disabled', true);
	FnCheckEmptyFrmFields('#roleName', '#gapp-role-save');	
	// Form Validation
	$("#gapp-addrole-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>"
	});
	
	$('.portlet > .portlet-title > .tools > .collapse, .portlet .portlet-title > .tools').removeClass("expand").addClass("collapse");
	
	$('body').on('click', '.portlet > .portlet-title > .tools > .collapse, .portlet .portlet-title > .tools > .expand', function(e) {
		e.preventDefault();
		//alert('click');
		var el = $(this).closest(".portlet").children(".portlet-body");
		if ($(this).hasClass("collapse")) {
			$(this).removeClass("collapse").addClass("expand");
			el.slideUp(200);
		} else {
			$(this).removeClass("expand").addClass("collapse");
			el.slideDown(200);
		}
	});
	
		FnGetAssetList();
});

function FnSaveRole(){
	$('#gapp-role-save, #gapp-role-cancel').attr('disabled',true);
	var validator = $("#gapp-addrole-form").data("kendoValidator");
	validator.hideMessages();
	//kendo.ui.progress($("#gapp-addrole-form"), true);
	$("#GBL_loading").show();
	if (validator.validate()) { 
		if(VarEditRoleId == ''){ // Create Role
		
			var VarUrl = GblAppContextPath + '/ajax' + VarCreateRoleUrl;
			var VarParam = {};
			VarParam['roleName'] = FnTrim($('#roleName').val());
			VarParam['Description'] = FnTrim($('#Description').val());
			VarParam['domainName'] = VarCurrentTenantInfo.tenantDomain;
			VarParam['resources'] = FnGetResourcePermissionsList();
					
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveRole);
		
		} else { // Update Role
		
			var VarUrl = GblAppContextPath + '/ajax' + VarUpdateRoleUrl;
			VarUrl = VarUrl.replace("{role_name}",VarEditRoleId);
			VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
			var VarParam = {};
			VarParam['Description'] = FnTrim($('#Description').val());
			VarParam['resources'] = FnGetResourcePermissionsList();
			//console.log(JSON.stringify(VarParam));
			//return false;
			FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResUpdateRole);
		
		}
		
	} else {
		$('#gapp-role-save, #gapp-role-cancel').attr('disabled',false);
		//kendo.ui.progress($("#gapp-addrole-form"), false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResSaveRole(response){
	
	var ArrResponse = response;
	$('#gapp-role-save, #gapp-role-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){
		
		notificationMsg.show({
			message : 'Roles created successfully'
		}, 'success');
		
		FnFormRedirect('gapp-role-list',GBLDelayTime);
	} else {
	
		notificationMsg.show({
			message : ArrResponse['errorMessage']
		}, 'error');
		
	}
	
}

function FnResUpdateRole(response){
	var ArrResponse = response;
	$('#gapp-role-save, #gapp-role-cancel').attr('disabled',false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){
		
		notificationMsg.show({
			message : 'Roles updated successfully'
		}, 'success');
		
		FnFormRedirect('gapp-role-list',GBLDelayTime);
	} else {
		
		notificationMsg.show({
			message : ArrResponse['errorMessage']
		}, 'error');
		
	}
}

function FnCancelRole(){
		
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-role-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-role-list').submit();
	}
}

function FnNavigateRoleList(){
	$('#gapp-role-list').submit();
}

function FnGetResourcesList(){
	var VarUrl = GblAppContextPath + '/ajax' + VarResourceUrl;
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResResourcesList);
}

var ObjResIdentifier = {};
function FnResResourcesList(response){
	var ArrResponse = response;
	var VarResourceTxt = '';
	if(ArrResponse.resources != undefined && $.isArray(ArrResponse.resources)){
		var ArrResources = ArrResponse.resources;
		var VarResLength = ArrResources.length;
		if(VarResLength > 0){
			var VarColCnt = Math.ceil(VarResLength/3);
			var i=0;
			//alert(i%VarColCnt);
			VarResourceTxt += "<div class='splitpermissionDIV'>";
			$.each(ArrResources,function(key,val){
				var VarResourceCustomTxt = val.replace(/_/g," ");
				VarResourceTxt += '<div class="permission-wrapper resorceCon" id="resorceCon_'+key+'"><div class="portlet box blue"><div class="portlet-title"><div class="caption"><i class="fa fa-gift"></i><span class="resourceTitle" id="resourceTitle_'+key+'" data-resname="'+val+'">'+VarResourceCustomTxt+'</span></div><div class="tools"><a href="Javascript:void(0)" class="expand" data-original-title="" title="" onclick="FnGetResourcePermissions(\''+val+'\')"></a></div></div><div class="portlet-body form resourcePermissions" id="resourcePermissions_'+key+'"></div></div></div></li>';			
								
				if(i!=0 && i%VarColCnt == 0){	
					VarResourceTxt += "</div>";
					VarResourceTxt += "<div class='splitpermissionDIV'>";
				} else if(i == VarResLength-1){
					VarResourceTxt += "</div>";
				}
				if(ObjResIdentifier[val] == undefined){
					ObjResIdentifier[val] = {};
					ObjResIdentifier[val]['resPer'] = [];
				}
				ObjResIdentifier[val]['resCon'] = 'resourcePermissions_'+key;
				ObjResIdentifier[val]['resFlag'] = 0;
				i++;		
				
			});		
			
		} else {
			if(ArrResponse.errorCode != undefined){
				FnShowNotificationMessage(ArrResponse);
			}
		}
	} else {
		if(ArrResponse.errorCode != undefined){
			FnShowNotificationMessage(ArrResponse);
		}
	}
	
	$('#permissionsContainer').html(VarResourceTxt);
}

function FnGetResourcePermissions(VarResourceName){
	
	if(ObjResIdentifier[VarResourceName] != undefined){
		if(ObjResIdentifier[VarResourceName]['resFlag'] == 0){
			var VarUrl = GblAppContextPath + '/ajax' + VarPermissionsUrl;
			VarUrl = VarUrl.replace("{resource_name}",VarResourceName);
			VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
			FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResResourcePermissions);
		} else {
			$('#permissionsContainer #'+ObjResIdentifier[VarResourceName]['resCon']).css('display','block');
		}
		
	} else {
	
		notificationMsg.show({
			message : 'Error'
		}, 'error');
	
	}
	
}

function FnResResourcePermissions(response){
	
	var ArrResponse = response;
	var VarResourceName = ArrResponse.resourceName;
	var VarPermissionsContainer = ObjResIdentifier[VarResourceName]['resCon'];
	ObjResIdentifier[VarResourceName]['resFlag'] = 1;
	var VarPermissionsTxt = '';
	VarPermissionsTxt += '<div class="md-checkbox-list checkbox-inner-padding">';
	$.each(ArrResponse.permissions,function(key,val){
		var VarChkBoxId = encodeURIComponent(VarResourceName)+'_'+val;
		var VarChecked = '';
		
		if($.inArray(val,ObjResIdentifier[VarResourceName]['resPer']) != -1){
			VarChecked = 'checked';
		}
		VarPermissionsTxt += '<div class="md-checkbox"><input type="checkbox" id="'+VarChkBoxId+'" class="md-check" data-pername="'+val+'" value="'+val+'" '+VarChecked+' /><label for="'+VarChkBoxId+'"><span class="inc"></span><span class="check"></span><span class="box"></span>'+val+'</label></div>';
		
	});
	VarPermissionsTxt += '</div>';
	$('#'+VarPermissionsContainer).html(VarPermissionsTxt);
}

function FnGetResourcePermissionsList(){
	var ArrResourceList = [];
	$('.resorceCon').each(function(){
		var VarResourceTitle = $(this).find('.resourceTitle').data('resname');
		
		var ObjPerThis = $(this).find('.resourcePermissions .md-checkbox input[type="checkbox"]:checked');
		var VarChkBoxLength = ObjPerThis.length;
		if(VarChkBoxLength > 0){
			var ObjResoures = {};
			ObjResoures['resourceName'] = VarResourceTitle;
			var ArrPermissions = [];
			$(ObjPerThis).each(function(){
				ArrPermissions.push($(this).val());
			});
			ObjResoures['permissions'] = ArrPermissions;
			
			ArrResourceList.push(ObjResoures);
		}
	});
	
	if(VarEditRoleId != ''){
		ArrResourceList = FnCheckExistResouces(ArrResourceList);
	}
	
	return ArrResourceList;
}

function FnCheckExistResouces(ArrResourceList){
	$.each(ObjResIdentifier,function(VarResourceName,ObjVal){
		var VarPerCnt = (ObjVal['resPer']).length;
		if(VarPerCnt > 0){
			if(ObjResIdentifier[VarResourceName]['resFlag'] == 0){
				ArrResourceList.push({"resourceName":VarResourceName,"permissions":ObjVal['resPer']});
			}
		}
		
	});
		
	return ArrResourceList;
}

function FnGetRoleDetails(VarRoleName){
	
	var VarUrl = GblAppContextPath+'/ajax' + VarViewRoleUrl;
	VarUrl = VarUrl.replace("{role_name}",VarRoleName);
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResRoleDetails);
}

function FnResRoleDetails(response){
	
	var ArrResponse = response;
	if(!$.isEmptyObject(ArrResponse)){
		$('#roleName').val(ArrResponse['roleName']);
		$('#Description').val(ArrResponse['description']);
		var ArrRoleResources = ArrResponse['resources'];
		if(ArrRoleResources.length > 0){
			var VarResourceTxt = '';
			$.each(ArrRoleResources,function(key,obj){
				var VarResourceCustomTxt = (obj['resourceName']).replace(/_/g," ");
								
				ObjResIdentifier[obj['resourceName']] = {};
				ObjResIdentifier[obj['resourceName']]['resPer'] = [];
				
				VarResourceTxt += '<div class="permission-wrapper col-md-3 resorceCon" id="resorceCon_'+key+'"><div class="portlet box blue"><div class="portlet-title"><div class="caption"><i class="fa fa-gift"></i><span class="resourceTitle" id="resourceTitle_'+key+'">'+VarResourceCustomTxt+'</span></div></div><div class="portlet-body form resourcePermissions" id="resourcePermissions_'+key+'"><div class="md-checkbox-list checkbox-inner-padding">';
				
				$.each(obj['permissions'],function(key1,val){
					
					VarResourceTxt += '<div class="md-checkbox"><input type="checkbox" class="md-check" checked /><label for="'+val+'"><span class="inc"></span><span class="check"></span><span class="box"></span>'+val+'</label></div>';
					
					ObjResIdentifier[obj['resourceName']]['resPer'].push(val);
					
				});
				
				VarResourceTxt += '</div></div></div></div>';
				
			});
			
			$('#permissionsContainer').html(VarResourceTxt);
		}
		
		$("#gapp-addrole-form :input").prop("disabled", true);
		$('#gapp-role-save').attr('disabled',true);
		$("#gapp-role-cancel").prop("disabled", false);
	}
	
}

function FnEditRole(){
	FnGetResourcesList();
	$('#caption-display-role-breadcrumb').text('Edit Role');
	$('#caption-display-role-subject').text('Edit Role');
	$("#gapp-addrole-form :input").prop("disabled", false);
	$("#gapp-role-save").prop("disabled", false);
	$('#roleName').prop("disabled", true);
	$('#gapp-role-edit').hide();
}





function FnGetAssetList(){
 $("#gapp-asset-list").kendoGrid({
                        dataSource: {
                            type: "odata",
                            transport: {
                                read: "//demos.telerik.com/kendo-ui/service/Northwind.svc/Orders"
                            },
                            schema: {
                                model: {
                                    fields: {
                                        OrderID: { type: "number" },
                                        Freight: { type: "number" },
                                        ShipName: { type: "string" },
                                        OrderDate: { type: "date" },
                                        ShipCity: { type: "string" }
                                    }
                                }
                            },
                            pageSize: 20,
                            serverPaging: true,
                            serverFiltering: true,
                            serverSorting: true
                        },
                        height: 450,
                        filterable: true,
                        sortable: true,
                        pageable: false,
                        columns: [{
                                field:"OrderID",
                                title: "Assets"
                            }
                        ]
                    });
	}
	
