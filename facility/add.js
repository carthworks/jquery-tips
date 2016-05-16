"use strict";

$(document).ready(function(){

	// Form Validation
	$("#gapp-addfacility-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
											rules : {
												available:function(input){
													var validate = input.data('available');
													var VarExist = true;
													if (typeof validate !== 'undefined' && validate !== false) {
														var url = input.data('available-url');
														var VarParam = {"domain": {"domainName": VarCurrentTenantInfo.tenantDomain},"fieldValues": [{"key": "facilityName","value": FnTrim(input.val())}]};
														$.ajax({
															type:'POST',
															cache: true,
															async: false,
															contentType: 'application/json; charset=utf-8',
															url: GblAppContextPath+"/ajax" + url,
															data: JSON.stringify(VarParam),
															dataType: 'json',
															success: function(result) {
																var ObjExistStatus = result;
																
																if(ObjExistStatus.status == 'SUCCESS'){ // Does not exist in db 
																	VarExist = true;
																} else if(ObjExistStatus.status == 'FAILURE') { // Exist in db
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
	
	// create DatePicker from input HTML element
    $("#preEcmEndDate, #startDate, #rfsDate").kendoDatePicker({format: "dd/MM/yyyy"});
	
	if(VarEditFacilityId==''){
		FnGetFacilityVerticals(FnMakeAsyncAjaxRequest);
		FnGetFacilityBuildingTypes(FnMakeAsyncAjaxRequest);
		FnPopulateCountryList(FnMakeAsyncAjaxRequest);
		FnGetZoneList(FnMakeAsyncAjaxRequest);
	} else {
		FnGetFacilityVerticals(FnMakeAjaxRequest);
		FnGetFacilityBuildingTypes(FnMakeAjaxRequest);
		FnPopulateCountryList(FnMakeAjaxRequest);
		FnGetZoneList(FnMakeAjaxRequest);
		FnGetFacilityDetails(VarEditFacilityId);
	}
	
});

function FnGetFormFieldValues(VarFrmId,VarAllowCond){
	var ArrFieldValuesJSONObj = [];
	$('#'+VarFrmId).find(VarAllowCond).each(function(){
		var ObjFieldMap = {};
		var VarFieldName = $(this).attr('name');
		var VarFieldValue = FnTrim($(this).val());
		if (!(typeof VarFieldValue === "undefined") && VarFieldValue!='') {
			if ($(this).is("[type='text']") || $(this).is("[type='email']") || $(this).is("[type='url']")) {
				if($(this).is("[type='text']") && $(this).hasClass('date-picker')){
					ObjFieldMap["key"] = VarFieldName;
					VarFieldValue = VarFieldValue.split("/");
					VarFieldValue = new Date(VarFieldValue[1]+'/'+VarFieldValue[0]+'/'+VarFieldValue[2]).getTime();
					ObjFieldMap["value"] = VarFieldValue.toString();
				} else {
					ObjFieldMap["key"] = VarFieldName;
					ObjFieldMap["value"] = VarFieldValue;
				}
			} else if($(this).is("select")){
				if($(this).attr('multiple') == undefined){
					ObjFieldMap["key"] = VarFieldName;
					ObjFieldMap["value"] = FnTrim($(this).find('option:selected').text());
				} else {
					ObjFieldMap["key"] = VarFieldName;
					var ArrVal = VarFieldValue.split(',');
					ObjFieldMap["value"] = ArrVal;
				}
			}
			
			ArrFieldValuesJSONObj.push(ObjFieldMap);
		}
	});
	
	return ArrFieldValuesJSONObj;
}

function FnSaveFacility(){
	$('#gapp-facility-save, #gapp-facility-cancel').attr('disabled',true);
	var validator = $("#gapp-addfacility-form").data("kendoValidator");
	validator.hideMessages();
	//kendo.ui.progress($("#gapp-addfacility-form"), true);
	$("#GBL_loading").show();
	if (validator.validate()) { 
		if(VarEditFacilityId == ''){ // Create Facility
			var VarUrl = GblAppContextPath+'/ajax' + VarCreateFacilityUrl;
			var VarParam = {};
			VarParam['domain'] = {"domainName":VarCurrentTenantInfo.tenantDomain};
			VarParam['entityStatus'] = {"statusName" : "ACTIVE"};
			VarParam['entityTemplate'] = {"entityTemplateName" : "AvocadoFacilityTemplate"};
			VarParam['fieldValues'] = FnGetFormFieldValues("gapp-addfacility-form","input[type=text],select");
			VarParam['fieldValues'].push({"key":"clientName","value":VarCurrentTenantInfo.tenantName});
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveFacility);
		} else { // Update Facility
			var VarUrl = GblAppContextPath+'/ajax' + VarUpdateFacilityUrl;
			VarUrl = VarUrl.replace("{facility_name}",VarEditFacilityId);
			VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);			
			var VarParam = {};
			VarParam['domain'] = {"domainName":VarCurrentTenantInfo.tenantDomain};
			VarParam['entityStatus'] = {"statusName" : "ACTIVE"};
			VarParam['entityTemplate'] = {"entityTemplateName" : "AvocadoFacilityTemplate"};
			VarParam['fieldValues'] = FnGetFormFieldValues("gapp-addfacility-form","input[type=text],select");
			VarParam['fieldValues'].push({"key":"clientName","value":VarCurrentTenantInfo.tenantName});
			
			FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResUpdateFacility);
		}
		
	} else {
		$('#gapp-facility-save, #gapp-facility-cancel').attr('disabled',false);
		//kendo.ui.progress($("#gapp-addfacility-form"), false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnResSaveFacility(response){
	
	var ObjResponse = response;
	$('#gapp-facility-save, #gapp-facility-cancel').attr('disabled',false);
	//kendo.ui.progress($("#gapp-addfacility-form"), false);
	$("#GBL_loading").hide();
	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.errorCode == undefined){
			FnAttachChildrenEntity(ObjResponse);
			FnAttachParentChildEntity(ObjResponse);
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

function FnResUpdateFacility(response){
	
	var ArrResponse = response;
	$('#gapp-facility-save, #gapp-facility-cancel').attr('disabled',false);
	//kendo.ui.progress($("#gapp-addfacility-form"), false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){
				
		notificationMsg.show({
			message : 'updated successfully'
		}, 'success');
		
	
		FnFormRedirect('gapp-facility-list',GBLDelayTime);
		
	} else {
		notificationMsg.show({
			message : ArrResponse['errorMessage']
		}, 'error');
	}
}

function FnCreateTenantEntity(){

	var ObjTenantEntity = {};
	ObjTenantEntity['domain'] = {"domainName" : VarCurrentTenantInfo.parentDomain};
	ObjTenantEntity['entityTemplate'] = {"entityTemplateName" : "DefaultTenant"};
	ObjTenantEntity['globalEntity'] = {"globalEntityType" : "TENANT"};
	ObjTenantEntity['identifier'] = {"key": "tenantName","value": VarCurrentTenantInfo.tenantName};
	
	return ObjTenantEntity;
}

function FnAttachChildrenEntity(ObjFacilityEntity){
	var VarUrl = GblAppContextPath+'/ajax' + VarAttachChildrenUrl;
	var VarParam = {};
	VarParam['actor'] = FnCreateTenantEntity();
	VarParam['subjects'] = [ObjFacilityEntity];
	
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResAttachChildrenEntity);
}

function FnResAttachChildrenEntity(response){
	var ObjResponse = response;
	if(ObjResponse.status == 'SUCCESS'){
	
	} else {
		notificationMsg.show({
			message : ObjResponse['errorMessage']
		}, 'error');
	}
}

function FnAttachParentChildEntity(ObjFacilityEntity){
	var VarUrl = GblAppContextPath+'/ajax' + VarAttachParentUrl;
	var VarParam = {};
	VarParam['actor'] = ObjFacilityEntity;
	VarParam['subjects'] = FnConstructSubjectsEntity();
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResAttachParentChildEntity);
}

function FnResAttachParentChildEntity(response){
	var ObjResponse = response;
	if(ObjResponse.status == 'SUCCESS'){
		notificationMsg.show({
			message : 'Facility created successfully'
		}, 'success');
		
	
		FnFormRedirect('gapp-facility-list',GBLDelayTime);
	} else {
		notificationMsg.show({
			message : ObjResponse['errorMessage']
		}, 'error');
	}
}


function FnConstructSubjectsEntity(){
	var ArrSubjects = [];
	if($('#city').val() != ''){
		var ObjCityEntity = JSON.parse($('#city').val());
		ArrSubjects.push(ObjCityEntity);
	} else {
		var ObjEmirateEntity = JSON.parse($('#emirate').val());
		ArrSubjects.push(ObjEmirateEntity);
	}
	
	if($('#vertical').val() != ''){
		var ObjVerticalEntity = JSON.parse($('#vertical').val());
		ArrSubjects.push(ObjVerticalEntity);
	}
	
	if($('#buildingType').val() != ''){
		var ObjBldTypeEntity = JSON.parse($('#buildingType').val());
		ArrSubjects.push(ObjBldTypeEntity);
	}
	
	return ArrSubjects;
}

function FnCancelFacility(){

	/*var VarFrmObj = document.getElementById('gapp-addfacility-form');
	VarFrmObj.reset();
	var validator = $("#gapp-addfacility-form").data("kendoValidator");
	validator.hideMessages();*/
	
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-facility-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-facility-list').submit();
	}
	
}

function FnNavigateFacilityList(){
	$('#gapp-facility-list').submit();
}

function FnGetFacilityVerticals(FnMakeAjaxCall){
	var VarUrl = GblAppContextPath+'/ajax' + VarFilterListUrl;	
	var VarParam = {};
	VarParam['domain'] = {"domainName" : VarAppRootDomain};
	VarParam['entityTemplate'] = {"entityTemplateName" : "Vertical"};
	FnMakeAjaxCall(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResFacilityVerticals);
}

function FnResFacilityVerticals(response){
	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	
	if(VarResLength > 0){
		var ArrResponseData = [];
		$(ArrResponse).each(function(index){
			var element = {};
			element['entity'] = {};
			element['entity']['domain'] = this.domain;
			element['entity']['entityTemplate'] = {"entityTemplateName":this.entityTemplate.entityTemplateName};
			element['entity']['globalEntity'] = this.globalEntity;
			element['entity']['identifier'] = this.identifier;
			
			$(this.dataprovider).each(function() {
				var key = this.key;
				if(key == 'verticalName'){
					element['text'] = this.value;
				}
			});
			
			ArrResponseData.push(element);
		});
			
		var VarVerticalTxt = '';
		VarVerticalTxt += "<option value=''>Select Vertical</option>";		
		
		$.each(ArrResponseData,function(key,obj){
			var VarOptionValue = JSON.stringify(obj['entity']);
			var VarOptionText = obj['text'];
			VarVerticalTxt += "<option value='"+VarOptionValue+"'>"+VarOptionText+"</option>";
		});
		
		$('#vertical').html(VarVerticalTxt);
	}
	
}

function FnGetFacilityBuildingTypes(FnMakeAjaxCall){
	var VarUrl = GblAppContextPath+'/ajax' + VarFilterListUrl;	
	var VarParam = {};
	VarParam['domain'] = {"domainName" : VarAppRootDomain};
	VarParam['entityTemplate'] = {"entityTemplateName" : "BuildingType"};
	FnMakeAjaxCall(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResFacilityBuildingTypes);
}

function FnResFacilityBuildingTypes(response){
	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	
	if(VarResLength > 0){
		var ArrResponseData = [];
		$(ArrResponse).each(function(index){
			var element = {};
			element['entity'] = {};
			element['entity']['domain'] = this.domain;
			element['entity']['entityTemplate'] = {"entityTemplateName":this.entityTemplate.entityTemplateName};
			element['entity']['globalEntity'] = this.globalEntity;
			element['entity']['identifier'] = this.identifier;
			$(this.dataprovider).each(function() {
				var key = this.key;
				if(key == 'typeName'){
					element['text'] = this.value;
				}
			});
			
			ArrResponseData.push(element);
		});
			
		var VarBldgTypesTxt = '';
		VarBldgTypesTxt += "<option value=''>Select Building Type</option>";		
		
		$.each(ArrResponseData,function(key,obj){
			var VarOptionValue = JSON.stringify(obj['entity']);
			var VarOptionText = obj['text'];
			VarBldgTypesTxt += "<option value='"+VarOptionValue+"'>"+VarOptionText+"</option>";
		});
		
		$('#buildingType').html(VarBldgTypesTxt);
	}
	
}

function FnPopulateCountryList(FnMakeAjaxCall){
	var VarUrl = GblAppContextPath+'/ajax' + VarFilterListUrl;	
	var VarParam = {};
	VarParam['domain'] = {"domainName" : VarAppRootDomain};
	VarParam['entityTemplate'] = {"entityTemplateName" : "Country"};
	FnMakeAjaxCall(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResPopulateCountryList);
}

function FnResPopulateCountryList(response){
	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	
	if(VarResLength > 0){
		var ArrResponseData = [];
		$(ArrResponse).each(function(index){
			var element = {};
			$(this.dataprovider).each(function() {
				var key = this.key;
				if(key == 'countryName'){
					element["key"] = this.value;
				}
			});
			element["value"] = this.identifier.value;
			ArrResponseData.push(element);
		});
			
		var VarCountryTxt = '';
		VarCountryTxt += '<option value="">Select Country</option>';		
		
		$.each(ArrResponseData,function(key,obj){
			VarCountryTxt += '<option value="'+obj['value']+'">'+obj['key']+'</option>';
		});
		
		$('#country').html(VarCountryTxt);
	}
}


function FnGetEmirateList(VarFlag){
	var VarCountry = $('#country').val();
	if(VarFlag == 1){
		GblEditEmirate = '';
		GblEditCity = '';
	}
	var VarEmirateTxt = '<option>Select City</option>';
	$('#city').html(VarEmirateTxt);
	
	if(VarCountry !=''){
		var VarUrl = GblAppContextPath+'/ajax' + VarHierarchyListUrl;
		var VarParam = {};
		VarParam['parentIdentity'] = {};
		VarParam['parentIdentity']['domain'] = {"domainName":VarAppRootDomain};
		VarParam['parentIdentity']['globalEntity'] = {"globalEntityType":"MARKER"};
		VarParam['parentIdentity']['entityTemplate'] = {"entityTemplateName":"Country"};
		VarParam['parentIdentity']['identifier'] =  {"key": "identifier","value":VarCountry};
		VarParam['searchTemplateName'] = "Emirate";
		VarParam['searchEntityType'] = "MARKER";
		VarParam['statusName'] = "ACTIVE";		
		FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResEmirateList);
		
	} else {
		var VarEmirateTxt = '<option>Select Emirate</option>';
		$('#emirate').html(VarEmirateTxt);		
	}
}

function FnResEmirateList(response){
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	
	if(VarResLength > 0){
		var ArrResponseData = [];
		$(ArrResponse).each(function(){
			var element = {};
			element['entity'] = {};
			element['entity']['domain'] = this.domain;
			element['entity']['entityTemplate'] = {"entityTemplateName":this.entityTemplate.entityTemplateName};
			element['entity']['globalEntity'] = this.globalEntity;
			element['entity']['identifier'] = this.identifier;
			$(this.dataprovider).each(function() {
				var key = this.key;
				if(key == 'emirateName'){
					element['text'] = this.value;
				}
			});						
			ArrResponseData.push(element);			
		});
					
		var VarCountryTxt = "";
		VarCountryTxt += "<option value=''>Select Emirate</option>";		
		
		$.each(ArrResponseData,function(key,obj){
			var VarOptionValue = JSON.stringify(obj['entity']);
			var VarOptionText = obj['text'];
			VarCountryTxt += "<option value='"+VarOptionValue+"'>"+VarOptionText+"</option>";
		});
		
		$('#emirate').html(VarCountryTxt);
		
		if(GblEditEmirate!=''){
			$("#emirate option:contains('"+GblEditEmirate+"')").attr('selected', true);
			if(GblEditCity != ''){
				FnGetCityList();
			}
		}		
		
	}
	
}

function FnGetCityList(){
	var VarEmirate = $('#emirate').val();
	if(VarEmirate !=''){
		var ObjEmirate = JSON.parse(VarEmirate);
		var VarEmirateValue = ObjEmirate['identifier']['value'];
		
		var VarUrl = GblAppContextPath+'/ajax' + VarHierarchyListUrl;
		var VarParam = {};
		VarParam['parentIdentity'] = {};
		VarParam['parentIdentity']['domain'] = {"domainName":VarAppRootDomain};
		VarParam['parentIdentity']['globalEntity'] = {"globalEntityType":"MARKER"};
		VarParam['parentIdentity']['entityTemplate'] = {"entityTemplateName":"Emirate"};
		VarParam['parentIdentity']['identifier'] =  {"key": "identifier","value":VarEmirateValue};
		VarParam['searchTemplateName'] = "City";
		VarParam['searchEntityType'] = "MARKER";
		VarParam['statusName'] = "ACTIVE";
		FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResCityList);
		
	} else {
		var VarCityTxt = '<option>Select City</option>';
		$('#city').html(VarCityTxt);
	}
}

function FnResCityList(response){
	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	
	if(VarResLength > 0){
		var ArrResponseData = [];
		$(ArrResponse).each(function(index){
			var element = {};
			element['entity'] = {};
			element['entity']['domain'] = this.domain;
			element['entity']['entityTemplate'] = {"entityTemplateName":this.entityTemplate.entityTemplateName};
			element['entity']['globalEntity'] = this.globalEntity;
			element['entity']['identifier'] = this.identifier;
			$(this.dataprovider).each(function() {
				var key = this.key;
				if(key == 'cityName'){
					element['text'] = this.value;
				}
			});
			
			ArrResponseData.push(element);
		});
			
		var VarCityTxt = '';
		VarCityTxt += "<option value=''>Select City</option>";		
		
		$.each(ArrResponseData,function(key,obj){
			var VarOptionValue = JSON.stringify(obj['entity']);
			var VarOptionText = obj['text'];
			VarCityTxt += "<option value='"+VarOptionValue+"'>"+VarOptionText+"</option>";
		});
		
		$('#city').html(VarCityTxt);
		
		if(GblEditCity != ''){
			$("#city option:contains('"+GblEditCity+"')").attr('selected', true);
		}
	}
	
}

function FnGetZoneList(FnMakeAjaxCall){
	var VarUrl = GblAppContextPath +'/ajax' + VarFilterListUrl;	
	var VarParam = {};
	VarParam['domain'] = {"domainName" : VarAppRootDomain};
	VarParam['entityTemplate'] = {"entityTemplateName" : "Zone"};
	FnMakeAjaxCall(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResZoneList);	
}

function FnResZoneList(response){
	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	
	if(VarResLength > 0){
		var ArrResponseData = [];
		$(ArrResponse).each(function(index){
			var element = {};
			$(this.dataprovider).each(function() {
				var key = this.key;
				if(key == 'zoneName'){
					element["key"] = this.value;
				}
			});
			element["value"] = this.identifier.value;
			ArrResponseData.push(element);
		});
			
		var VarCountryTxt = '';
		VarCountryTxt += '<option value="">Select Zone</option>';		
		
		$.each(ArrResponseData,function(key,obj){
			VarCountryTxt += '<option value="'+obj['value']+'">'+obj['key']+'</option>';
		});
		
		$('#zone').html(VarCountryTxt);
	}	
}

var GblEditEmirate='';
var GblEditCity='';
function FnGetFacilityDetails(VarFacilityId){
	$("#gapp-addfacility-form :input").prop("disabled", true);
	$('#gapp-facility-save').attr('disabled',true);
	$("#gapp-facility-cancel").prop("disabled", false);
	var VarUrl = GblAppContextPath+'/ajax' + VarViewFacilityUrl;
	VarUrl = VarUrl.replace("{facility_name}",VarFacilityId);
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	VarUrl = VarUrl.replace("{templatename}","AvocadoFacilityTemplate");
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResFacilityDetails);
}

function FnResFacilityDetails(response){
	
	var ArrResponse = response;
	if(!$.isEmptyObject(ArrResponse)){
		$.each(ArrResponse['dataprovider'],function(key,obj){
			if($('#gapp-addfacility-form #'+obj['key']) && obj['key']!='emirate' && obj['key']!='city'){
				if(obj['key'] != 'country' && obj['key'] != 'vertical' && obj['key'] != 'buildingType' && obj['key']!='preEcmEndDate' && obj['key']!='rfsDate' && obj['key']!='startDate' && obj['key']!='zone'){
					$('#gapp-addfacility-form #'+obj['key']).val(obj['value']);
				} else if(obj['key'] == 'country'){
					$("#country option:contains('"+obj['value']+"')").attr('selected', true);
					var ObjEmirate = FnFindObjectFromArray(ArrResponse['dataprovider'],'emirate');
					GblEditEmirate = ObjEmirate[0]['value'];
					var ObjCity = FnFindObjectFromArray(ArrResponse['dataprovider'],'city');
					GblEditCity = ObjCity[0]['value'];
					FnGetEmirateList(0);
				} else if(obj['key'] == 'vertical' || obj['key'] == 'buildingType' || obj['key'] == 'zone'){
					$("#"+obj['key']+" option:contains('"+obj['value']+"')").attr('selected', true);
				} else if(obj['key']=='preEcmEndDate' || obj['key']=='rfsDate' || obj['key']=='startDate'){
					var VarDateStr = '';
					if(obj['value']!=undefined){
						VarDateStr = FnConvertMilliSecondsToDate(parseInt(obj['value']),'MM/dd/yyyy');
					}
					$('#gapp-addfacility-form #'+obj['key']).val(VarDateStr);
				}
			}
		});
	}
}

function FnEditFacility(){
	$("#gapp-addfacility-form :input").prop("disabled", false);
	$("#gapp-facility-save").prop("disabled", false);
	$('#facilityName, #buildingType, #vertical, #buildingType, #timeZone, #city, #country, #emirate').prop("disabled", true);
	$('#gapp-facility-edit').hide();
}