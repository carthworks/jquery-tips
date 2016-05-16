"use strict";
var VarDeviceStatus;
$(document).ready(function(){	

$('#deviceIp').mask('099.099.099.099');
$('#gapp-device-save').prop('disabled', true);
FnCheckEmptyFrmFields('#deviceName, #sourceId, #make, #deviceType, #model, #protocol, #version, #nwProtocol', '#gapp-device-save');	
	
	// Form Validation
	$("#gapp-adddevice-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
											rules : {
												available:function(input){
													var validate = input.data('available');
													var VarExist = true;	
													if (typeof validate !== 'undefined' && validate !== false) {
														var url = input.data('available-url');							
													
													
													var VarParam = {"domain":{"domainName":VarLUDomainName},"fieldValues":[{"key":"entityName","value": FnTrim(input.val())}]};
													
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
																if(ObjExistStatus.status == 'SUCCESS'){ // Exist in db
																	VarExist = true;
																} else if(ObjExistStatus.status == 'FAILURE') { // Does not exist in db
																VarExist = false;}
			
																
															},
															error : function(xhr, status, error) {
															
															}
														});
													}
													return VarExist;
												},
												
												isexist:function(input){
													var validate = input.data('isexist');
													var VarExist = true;
													var VarUrl;
													
													if (typeof validate !== 'undefined' && validate !== false) {
														var url = input.data('isexist-url');	
														var VarCurrentDSName=$('#dsName').val();														
														VarUrl = url.replace("{datasource}",VarCurrentDSName);											
														
														
														$.ajax({
															type:'GET',
															cache: true,
															async: false,
															contentType: 'application/json; charset=utf-8',
															url: GblAppContextPath+"/ajax" + VarUrl,															
														//	data: JSON.stringify(VarParam),
															dataType: 'json',
															success: function(result) {															
																												
																var ObjExistStatus = result;																
																if(ObjExistStatus.status == 'SUCCESS'){ // Exist in db
																	VarExist = false;
																} else if(ObjExistStatus.status == 'FAILURE') { // Does not exist in db
																VarExist = true;											
																
																
																}
			
																
															},
															error : function(xhr, status, error) {
																console.log(VarUrl +' ' + error);
															
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
	
	$("#dsnameElement").hide();
	
		
	if(VarEditDeviceId == ''){
		
		FnGetMakeList(FnMakeAsyncAjaxRequest);
		FnGetNetworkProtocolsList(FnMakeAsyncAjaxRequest);
		FnGetDeviceTagList(FnMakeAsyncAjaxRequest);	
		$('#BtnEditDevice').hide();
		
	} else {			
			
		FnGetMakeList(FnMakeAjaxRequest);
		FnGetNetworkProtocolsList(FnMakeAjaxRequest);
		FnGetDeviceTagList(FnMakeAjaxRequest);
		FnGetDeviceDetails(VarEditDeviceId);
		$('#publishContainer').removeClass("hidden");
		$('#BtnEditDevice').show();
			
	}

});

var newItem = "";
function FnTagDataBound() {
	if((newItem || this._prev) && newItem !== this._prev) {
		var ds = this.dataSource;
		var datas = ds.data();
		newItem = $.trim(this._prev);
		if(datas.length > 0){
			var lastItem = datas[datas.length - 1];	
						
		  if (/\(Add New\)$/i.test(lastItem.name)) {
			  ds.remove(lastItem);
		  }
		}
	  
	  var newEntryFound = FnCheckExistTags(datas,newItem);
  
	  if(newItem.length > 0 && newEntryFound) {
		  ds.add({ "name": newItem });
		//  ds.add({ name: newItem + " (Add New)"});
		this.open();
	  }
	  
	}
    
}

function FnCheckExistTags(datas,newtxt){
	  var Exist = true;	  
	  $.grep(datas, function(obj,key) { 
		  if(obj.name == newtxt){
			  Exist = false;
		  }
	  });	  
	  return Exist;	  
  }
  
function FnTagSelect(e) {
	var dataItem = this.dataSource.view()[e.item.index()],
		datas = this.dataSource.data(),
		lastData = datas[datas.length - 1];

	if (parseInt(dataItem.value) > 0) {
	  this.dataSource.remove(lastData);            
	} else {    	
		dataItem.name = dataItem.name.replace(" (Add New)", "");
	}

}

/*---------------Get make list -------------------*/
var VarGetViewMake;
  
function FnGetMakeList(FnMakeAjaxCall){		
	var VarUrl = GblAppContextPath+'/ajax' + VarPopulateMakeListUrl;	
	FnMakeAjaxCall(VarUrl, 'GET','' , 'application/json; charset=utf-8', 'json', FnResMakeList);	
}
	
function FnResMakeList(response){	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;	
	if(VarResLength > 0){
		var VarMakeTxt = '';
		VarMakeTxt += '<option value="">Select make of the device</option>';
		$.each(ArrResponse,function(key,val){
			VarMakeTxt += '<option value="'+val.name+'"> <span style="padding-left:5px !important;">&nbsp&nbsp&nbsp</span>'+val.name+'</option>';
		});			
		$('#make').html(VarMakeTxt);
	}
}
/*---------------End Get make list -------------------*/
 
/*---------------Get ProtocolsList -------------------*/ 
var  VarGetViewProtocolsList;
  
function FnGetNetworkProtocolsList(FnMakeAjaxCall) {		

	var VarUrl = GblAppContextPath+'/ajax' + VarPopulateProtocolListUrl;	
	FnMakeAjaxCall(VarUrl, 'GET','' , 'application/json; charset=utf-8', 'json', FnResNetworkProtocolsList);		
}	
	
function FnResNetworkProtocolsList(response){	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;	
	if(VarResLength > 0){
		var VarProtocolTxt = '';
		VarProtocolTxt += '<option value="">Select network protocol</option>';
		$.each(ArrResponse,function(key,val){
			VarProtocolTxt += '<option value="'+val.name+'"> <span style="padding-left:5px !important;">&nbsp&nbsp&nbsp</span>'+val.name+'</option>';
		});			
		$('#nwProtocol').html(VarProtocolTxt);
		if(typeof VarGetViewProtocolsListId === 'undefined'){					
			$('#nwProtocol').val();
		};
	}
}	
/*---------------EndGet ProtocolsList -------------------*/

/*---------------Get DeviceTagList -------------------*/	
		
function FnGetDeviceTagList(FnMakeAjaxCall){			
	var VarUrl = GblAppContextPath+'/ajax' + VarPopulateDevicetagsUrl;	
	FnMakeAjaxCall(VarUrl, 'GET','' , 'application/json; charset=utf-8', 'json', FnResDeviceTagList);
}	
	
function FnResDeviceTagList(response){			
	var ArrResponse = response;
	if($.isArray(ArrResponse)){
		var VarResLength = ArrResponse.length;
		var MultiSelect = $("#tags");
		if(VarResLength >0){
			MultiSelect.kendoMultiSelect({
				dataTextField : "name",
				dataValueField : "name",
				animation : false,
				dataBound: FnTagDataBound,
				select: FnTagSelect
			});
			$("#tags").data("kendoMultiSelect").dataSource.data(ArrResponse);

		}	
	} else {
		
		ArrResponse = [];
		var MultiSelect = $("#tags");
		MultiSelect.kendoMultiSelect({
			dataTextField : "name",
			dataValueField : "name",
			animation : false,
			dataBound: FnTagDataBound,
			select: FnTagSelect
		});
		$("#tags").data("kendoMultiSelect").dataSource.data(ArrResponse);
	}
				
}	
/*---------------EndGet DeviceTagList -------------------*/
	
	
/*---------------Get FnGetDeviceTypeList -------------------*/
	
function FnGetDeviceTypeList(VarFlag){			
	var VarMake = $('#make').val();	
	//console.log('#make '+VarFlag);
	
	if(VarFlag == 1){		
		GblEditDeviceType = '';
		GblEditModel = '';
		GblEditProtocol = '';
		GblEditVersion = '';
		GblEditConfiguration = '';		
		
		$('#deviceType').html('<option value="">Select the device type</option>');
		$('#model').html('<option value="">Select the model </option>');
		$('#protocol').html('<option value="">Select a protocol </option>');
		$('#version').html('<option value="">Select a protocol version </option>');		
		$('#configuration').html('<option value="">Select a configuration </option>');
	
	}	
	
	if(VarMake !=''){		
		var VarUrl = GblAppContextPath+'/ajax' + VarPopulateDeviceType;
		VarUrl = VarUrl.replace("{make_name}",VarMake);
		FnMakeAsyncAjaxRequest(VarUrl, 'GET','' , 'application/json; charset=utf-8', 'json', FnResDeviceTypeList);
		} 
			else
			{
				var VartDeviceType = '<option>Please select device Type</option>';
				$('#deviceType').html(VartDeviceType);
				
									
			}
}
	
function FnResDeviceTypeList(response){	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;	
	if(VarResLength > 0){
		
		var VarMakeTxt = '';
		VarMakeTxt += '<option value="">Select the device type</option>';
		$.each(ArrResponse,function(key,val){
			VarMakeTxt += '<option value="'+val.name+'">'+val.name+'</option>';
		});			
		$('#deviceType').html(VarMakeTxt);
		
		if(GblEditDeviceType != ''){
			$('#deviceType').val(GblEditDeviceType);
			if(GblEditModel != ''){
				FnGetModelList();
			}
		};
	}
}	
/*---------------End FnGetDeviceTypeList -------------------*/	


/*---------------End FnGetModelList -------------------*/		
function FnGetModelList(VarFlag) {	
	var VarMake = $('#make').val();	
	var VarDeviceType = $('#deviceType').val();
	
		if(VarFlag == 1){		
			GblEditModel = '';
			GblEditProtocol = '';
			GblEditVersion = '';
			GblEditConfiguration = '';						
			
			$('#model').html('<option value="">Select a model </option>');
			$('#protocol').html('<option value="">Select a protocol </option>');
			$('#version').html('<option value="">Select a protocol version </option>');		
			$('#configuration').html('<option value="">Select a configuration </option>');
		}
	
	var objGetModel ={"make":VarMake,"deviceType":VarDeviceType};
		
	// get prepare url	
	var VarUrl = GblAppContextPath+'/ajax' + VarPopulateModelListUrl;		
	//console.log( 'FnGetModelList: '+ VarUrl);
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(objGetModel), 'application/json; charset=utf-8', 'json', FnResModelList);		
}
	
function FnResModelList(response){			
	var ArrResponse = response;			
	var VarResLength = ArrResponse.length;		
	if(VarResLength > 0){
		if(!$.isEmptyObject(ArrResponse)){
			var VarModelList = '';
			VarModelList += '<option value="">Select a model </option>';
				
			$.each(ArrResponse,function(key,obj){						
				VarModelList += '<option value="'+obj.name+'">'+obj.name+'</option>';
				
			});
			$('#model').html(VarModelList);				
			if(GblEditModel != ''){
				$('#model').val(GblEditModel);
				if(GblEditProtocol != ''){
					FnGetProtocolList();
				}
				
			}
		}
	}
}
/*---------------End FnGetModelList -------------------*/	
	
/*---------------End FnGetProtocolList -------------------*/		
function FnGetProtocolList(VarFlag) {		

	var VarDeviceModel = $('#model').val();	
		
	// get previous values
	var VarMake = $('#make').val();	
	var VarDeviceType = $('#deviceType').val();
	var VarDeviceModel = $('#model').val();
	
	if(VarFlag == 1){	
	
		GblEditProtocol = '';
		GblEditVersion = '';
		GblEditConfiguration = '';
		
		$('#protocol').html('<option value="">Select a protocol </option>');
		$('#version').html('<option value="">Select a protocol version </option>');		
		$('#configuration').html('<option value="">Select a configuration </option>');
	}
	

	// get previous payload obj			
	var objGetModel ={"make":VarMake,"deviceType":VarDeviceType,"model":VarDeviceModel};
		
	// get prepare url	
	var VarUrl = GblAppContextPath +'/ajax' + VarPopulateDeviceProtocolListUrl;		
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(objGetModel), 'application/json; charset=utf-8', 'json', FnResProtocolList);		
}
			
function FnResProtocolList(response){			
	var ArrResponse = response;			
	var VarResLength = ArrResponse.length;		
	if(VarResLength > 0){
		if(!$.isEmptyObject(ArrResponse)){
			var VarProtocolList = '';
			VarProtocolList += '<option value="">Select a protocol </option>';						
			$.each(ArrResponse,function(key,obj){				
				VarProtocolList += '<option value="'+obj.name+'">'+obj.name+'</option>';						
			});
			$('#protocol').html(VarProtocolList);
		
			if(GblEditProtocol != ''){
				$('#protocol').val(GblEditProtocol);
				if(GblEditVersion != ''){
					FnGetProtocolVersionList();
				}
			
			}
		
		}
	}
}
/*---------------End FnGetProtocolList -------------------*/


/*---------------End FnGetProtocolVersionList -------------------*/		
function FnGetProtocolVersionList(VarFlag) {	
	
	// get previous values
	var VarMake = $('#make').val();	
	var VarDeviceType = $('#deviceType').val();
	var VarDeviceModel = $('#model').val();
	var VarProtocol = $('#protocol').val();
	
		if(VarFlag == 1){			
			GblEditVersion = '';
			GblEditConfiguration = '';		
		
			$('#version').html('<option value="">Select a protocol version </option>');		
			$('#configuration').html('<option value="">Select a configuration </option>');
	}

	// get previous payload obj			
	var objGetModel ={"make":VarMake,"deviceType":VarDeviceType,"model":VarDeviceModel,"protocol":VarProtocol};
			
	// get prepare url	
	var VarUrl = GblAppContextPath+'/ajax' + VarPopulateVersionsListUrl;		
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(objGetModel), 'application/json; charset=utf-8', 'json', FnResProtocolVersionList);		
}


function FnResProtocolVersionList(response){			
	var ArrResponse = response;			
	var VarResLength = ArrResponse.length;		
	if(VarResLength > 0){
		if(!$.isEmptyObject(ArrResponse)){
			var VarProtocolVersionList = '';
			VarProtocolVersionList += '<option value="">Select a protocol version </option>';						
			$.each(ArrResponse,function(key,obj){
				VarProtocolVersionList += '<option value="'+obj.name+'">'+obj.name+'</option>';
			
			});
			$('#version').html(VarProtocolVersionList);
			if(GblEditConfiguration != ''){
				$('#version').val(GblEditVersion);
				if(GblEditConfiguration != ''){
					FnGetTemplate();
				}
		
			}
		}
	}
}
/*---------------End FnGetProtocolVersionList -------------------*/

/*---------------End FnGetTemplate -------------------*/		
function FnGetTemplate(VarFlag) {	
	
				
	// get previous values
	var VarMake = $('#make').val();	
	var VarDeviceType = $('#deviceType').val();
	var VarDeviceModel = $('#model').val();
	var VarProtocol = $('#protocol').val();
	var VarProtocolVersion = $('#version').val();
	
	if(VarFlag == 1){	
			
			GblEditConfiguration = '';	
			$('#configuration').html('<option value="">Select a configuration </option>');
	}

	// get previous payload obj			
	var objGetModel ={"make":VarMake,"deviceType":VarDeviceType,"model":VarDeviceModel,"protocol":VarProtocol,'version':VarProtocolVersion};
			
	// get prepare url	
	var VarUrl = GblAppContextPath+'/ajax' + VarPopulateConfigTemplatesListUrl;		
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(objGetModel), 'application/json; charset=utf-8', 'json', FnResTemplate);		
}
		
function FnResTemplate(response){			
	var ArrResponse = response;	
	var VarResLength = ArrResponse.length;
			
	if(VarResLength > 0){
		if(!$.isEmptyObject(ArrResponse)){
				var VarTemplateList = '';		
				VarTemplateList += '<option value="">Select configuration template </option>';				
				$.each(ArrResponse,function(key,obj){					
					VarTemplateList += '<option value="'+obj.name+'">'+obj.name+'</option>';
				});		
			$('#configuration').html(VarTemplateList);		
			if(GblEditConfiguration != ''){
				$('#configuration').val(GblEditConfiguration);							
			
			}
		}
		
	}
			
}
/*---------------End FnGetTemplate -------------------*/

	
function FnGetconfigurationTemplate(){
	$("select#configuration").prop('disabled', false);
	var VarConfiguration = $('#configuration').val();
			
}	
	

function handlePublish(){		
		var isPublishedStatus = $("#isPublish").is(':checked');		
		if($("#isPublish").is(':checked'))	{			
			console.log('checked 1: '+isPublishedStatus);		
			$("#dsnameElement").show();
			$("#dsName").prop('disabled', false);
		}
		else {
			console.log('checked 2: '+isPublishedStatus);		
			$("#dsnameElement").hide();
			$("#dsName").prop('disabled', true);
			
		}
		
}

	
function FnGetFormFieldValues(VarFrmId,VarAllowCond){
	var ArrFieldValuesJSONObj = {};
	$('#'+VarFrmId).find(VarAllowCond).each(function(){
		var ObjFieldMap = {};
		var VarFieldName = $(this).attr('name');
		var VarFieldValue = FnTrim($(this).val());
		
		if (!(typeof VarFieldValue === "undefined") && VarFieldValue!='' ) {
			if ($(this).is("[type='text']") || $(this).is("[type='email']") || $(this).is("[type='url']"))  {
				if($(this).is("[type='text']") && $(this).hasClass('date-picker')){
					ObjFieldMap["key"] = VarFieldName;
					VarFieldValue = VarFieldValue.split("/");
					VarFieldValue = new Date(VarFieldValue[1]+'/'+VarFieldValue[0]+'/'+VarFieldValue[2]).getTime();
					ObjFieldMap["value"] = VarFieldValue;
				} else {
					ObjFieldMap[VarFieldName] = VarFieldValue;
					
				}
			} else if($(this).is("select")){
				if($(this).attr('multiple') == undefined){
					
					ObjFieldMap[VarFieldName] = FnTrim($(this).find('option:selected').text());
				} else {
					ObjFieldMap[VarFieldName] = VarFieldValue;
					
					var ArrVal = VarFieldValue.split(',');
						
					
				}
			} else if($(this).is("[type='checkbox']")){
				if($(this).is(':checked') == true){
					ObjFieldMap[VarFieldName] = VarFieldValue;
				}
				
			}
			
			ArrFieldValuesJSONObj[VarFieldName] = VarFieldValue;
		}
	});
	
	return ArrFieldValuesJSONObj;
}



function FnSaveDevice(){	
	$('#gapp-d-save').text('Save');	
	$('#gapp-device-save, #gapp-device-cancel').attr('disabled',true);
	var validator = $("#gapp-adddevice-form").data("kendoValidator");
	validator.hideMessages();
	//kendo.ui.progress($("#gapp-adddevice-form"), true);
	$("#GBL_loading").show();
	
	if (validator.validate()) {  		
				
		if(VarEditDeviceId == ''){ // Create device
			// Create Device
			var VarUrl = GblAppContextPath+'/ajax' + VarCreateDeviceUrl;			
			var VarParam = {};	
			var VarStatus = false;
			$("input[name='statusName']").each(function(){				
					if($(this).is(':checked') == true && $(this).val()=='ACTIVE'){
						VarStatus = true;
					}
			});							
			
			VarParam = FnGetFormFieldValues("gapp-adddevice-form","input[type=text],input[type=email], select");		
			VarParam["status"]=VarStatus;
			
			var VarisPublish ='true';
				$("input[name='isPublish']").each(function() {					
					if($(this).is(':checked') == true) {	
						VarisPublish = 'true';						
					} else { VarisPublish = 'false';}
				});
			
			
			VarParam["isPublish"] =VarisPublish;
			VarParam["allocated"] ='true';
			//console.log(VarParam);		
					
			console.log(JSON.stringify(VarParam));		
			
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveDevice);
			
		} else { 
		
			// Update Device 
		
			var VarClientID = $('#gapp-adddevice-form #sourceId').val();
			var VarUrl =GblAppContextPath+ '/ajax' + VarUpdateDeviceUrl;		
			VarUrl = VarUrl.replace("{sourceId}",VarClientID);
			
			var VarParam = {};				
			var VarStatus = false;
			$("input[name='statusName']").each(function(){				
				if($(this).is(':checked') == true && $(this).val()=='ACTIVE'){
					VarStatus = true;
				}
			});
			
			console.log(' updates '+VarStatus);
			VarParam = FnGetFormFieldValues("gapp-adddevice-form","input[type=text],input[type=email],select,input[type=checkbox]");
		
			var VarisPublish ='true';
			$("input[name='isPublish']").each(function() {					
				if($(this).is(':checked') == true) {	
					//VarisPublish = $(this).val();
					VarisPublish = 'true';						
				} else { VarisPublish = 'false';}
			})
		
			var StrStatus	=VarStatus.toString();
			VarParam["identifier"] =VarEditDeviceId;
			VarParam["status"] =StrStatus;			
			VarParam["isPublish"] =VarisPublish;					
			VarParam["allocated"] ="false";					
			//delete VarParam["sourceId"];
			//delete VarParam["dsName"];	

			console.log(JSON.stringify(VarParam)); 	
							
			FnMakeAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResUpdateDevice);
		}
		
	} else {
		$('#gapp-device-save, #gapp-device-cancel').attr('disabled',false);
			//kendo.ui.progress($("#gapp-adddevice-form"), false);
			$("#GBL_loading").hide();
			var errors = validator.errors();
			console.log(errors);
			return false;
	}
}

function FnResUpdateDevice(response){
	var ArrResponse = response;
	$('#gapp-device-save, #gapp-device-cancel').attr('disabled',false);
	//kendo.ui.progress($("#gapp-adddevice-form"), false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){
		notificationMsg.show({
			message : 'Device updated successfully'
		}, 'success');
		
		FnFormRedirect('gapp-device-list',GBLDelayTime);
		
	} else {
		notificationMsg.show({
					message : ArrResponse.errorMessage
				}, 	'error');
	}
	
}

function FnResSaveDevice(response){
	var ArrResponse = response;
	$('#gapp-device-save, #gapp-device-cancel').attr('disabled',false);
	//kendo.ui.progress($("#gapp-adddevice-form"), false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){
		notificationMsg.show({
			message : 'Device added successfully'
		}, 'success');
		
		FnFormRedirect('gapp-device-list',GBLDelayTime);
	} else {
		notificationMsg.show({
			message : 'Error'
		}, 'error');
	}
		
}


function FnCancelDevice(){			
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-device-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-device-list').submit();
	}
	
}

var GblEditDeviceType='';
var GblEditModel = '';
var GblEditProtocol = '';
var GblEditVersion = '';
var GblEditConfiguration = '';
function FnGetDeviceDetails(VarDeviceId){
	
	$("#gapp-adddevice-form :input").prop("disabled", true);
	$('#gapp-device-save').attr('disabled',true);
	$("#gapp-device-cancel").prop("disabled", false);
	$('#select#tags').prop('disabled', 'disabled');
	
	$('input[name="status"]').bootstrapSwitch('readonly', true);
	//$('input[name="status"]').bootstrapSwitch('setReadOnly', true);
	var tags = $("#tags").data("kendoMultiSelect");
	console.log(tags);
	tags.enable(false);
	// multiselect.kendoMultiSelect({ enable: false});
	
	var VarUrl = GblAppContextPath+'/ajax' + VarViewDeviceUrl;
	VarUrl = VarUrl.replace("{identifier}",VarDeviceId);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResDeviceDetails);
}


function FnResDeviceDetails(response){	
	var ArrResponse = response;
	console.log(ArrResponse.entityStatus.statusName);	
	console.log(ArrResponse);
	var incomingStatus=ArrResponse.entityStatus.statusName;	
	
		if(ArrResponse['entityStatus']['statusName'] == 'ACTIVE'){
			$('#gapp-adddevice-form #statusName_active').attr('checked',true);
		} else {
			$('#gapp-adddevice-form #statusName_inactive').attr('checked',true);
		}
	
		
	if(!$.isEmptyObject(ArrResponse)){
	
		$.each(ArrResponse['fieldValues'],function(key,obj){				
			
			//set device name
			if( obj['key'] === 'deviceName'){				
				$('#gapp-adddevice-form #deviceName').val(obj['value']);
			}
			//set location: Lat and long
			if( obj['key'] === 'longitude'){				
				$('#gapp-adddevice-form #longitude').val(obj['value']);
			}
			//set location: Lat and long
			if( obj['key'] === 'latitude'){				
				$('#gapp-adddevice-form #latitude').val(obj['value']);
			}
			//set sourceid
			if( obj['key'] === 'entityName'){				
				$('#gapp-adddevice-form #sourceId').val(obj['value']);
			}
			//set datasourceName
			if( obj['key'] === 'datasourceName'){				
				$('#gapp-adddevice-form #dsName').val(obj['value']);
			}
			
			//set writebackPort
			if( obj['key'] === 'writebackPort'){				
				$('#gapp-adddevice-form #wbPort').val(obj['value']);
			}
			
			//set status
			if( obj['key'] === 'status'){
				if (obj['value'] === "true" ){
					$('#gapp-adddevice-form #status').prop('checked', true);
					console.log('status');
				} else{
					$('#gapp-adddevice-form #status').prop('checked', false);
				}
			
			}
			
			//set publish
			if( obj['key'] === 'publish'){				
				//$('#gapp-adddevice-form #isPublish').val(obj['value']);
				
				if (obj['value'] === "true" ){
					$('#gapp-adddevice-form #isPublish').prop('checked', true);
					$("#dsName").prop('disabled', true);
					$("#dsnameElement").show();				
				
				}
				else{
					$('#gapp-adddevice-form #isPublish').prop('checked', false);
				}
			}
			//set deviceType, model, protocol, version, configuration
			
			if($('#gapp-adddevice-form #'+obj['key']) && obj['key']!='deviceType' && obj['key']!='model' && obj['key']!='protocol' && obj['key']!='version' && obj['key']!='configuration'){ 
			
				if(obj['key']=='networkProtocol' || obj['key']=='deviceIp' || obj['key']=='devicePort' || obj['key']=='devicePort'){
					if(obj['key']=='networkProtocol'){
						$('#gapp-adddevice-form #nwProtocol').val(obj['value']);
					} else {
						$('#gapp-adddevice-form #'+obj['key']).val(obj['value']);
					}										
				} else if(obj['key']=='make'){
					$('#gapp-adddevice-form #'+obj['key']).val(obj['value']);
					
					var ObjDeviceType = FnFindObjectFromArray(ArrResponse['fieldValues'],'deviceType');
					GblEditDeviceType = ObjDeviceType[0]['value'];
					
					var ObjModel = FnFindObjectFromArray(ArrResponse['fieldValues'],'model');
					GblEditModel = ObjModel[0]['value'];
					
										
					var ObjProtocol = FnFindObjectFromArray(ArrResponse['fieldValues'],'protocol');
					GblEditProtocol = ObjProtocol[0]['value'];
					
					
					var ObjVersion = FnFindObjectFromArray(ArrResponse['fieldValues'],'version');
					GblEditVersion = ObjVersion[0]['value'];
					
					
					var ObjConfiguration = FnFindObjectFromArray(ArrResponse['fieldValues'],'configuration');
					GblEditConfiguration = ObjConfiguration[0]['value'];
					
					FnGetDeviceTypeList();
					
				} else if(obj['key']=='tags'){
					
					if(obj['value'] != undefined){
						console.log(obj['value']);
						var ArrTags = (obj['value']).split(',');
						var multiselect = $("#tags").data("kendoMultiSelect");
						multiselect.value(ArrTags);
					}
				}			
			}
			
			if(obj['key']=='tags'){					
					if(obj['value'] != undefined){
						//console.log(obj['value']);
						console.log(key+' /'+obj['value']);
						key,obj
						var ArrTags = (obj['value']).split(',');
						var multiselect = $("#tags").data("kendoMultiSelect");
						multiselect.value(ArrTags);
					}
				}	
			
			
		});// end of each loop		
		
	}	
}


$('#deviceLocModel').click(function(){
	$('#draggable').modal('show');
	setTimeout(
		  function() {					  
						$(".gllpLatlonPicker").each(function() {
							$(document).gMapsLatLonPicker().init( $(this) );
						});				  
					
					}, 1000);

});

function FnEditDevice(){	
	$('#BtnEditDevice').hide();
	$('.caption-edit-label').text('Edit Device');
	$('input[name="status"]').bootstrapSwitch('toggleDisabled', false, false);
	
	$('#gapp-device-save').attr('disabled',false);
	$("#gapp-adddevice-form :input").prop("disabled", false);
	$("#gapp-adddevice-save").prop("disabled", false);
	$('#sourceId').prop("disabled", true);
	$('#dsName').prop("disabled", true);
	$('#gapp-adddevice-edit').hide();
	var tags = $("#tags").data("kendoMultiSelect");
	tags.enable(true);
}


function FnNavigateDeviceList(){
	$('#gapp-device-list').submit();
}
