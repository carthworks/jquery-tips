"use strict";

$('#BtnEditDevice').show();
$('#sourceId').attr('disabled','disabled')
//console.clear();
//console.log(JSON.stringify(ObjEditClaimId));


$(document).ready(function(){
	
	$('#deviceIp').mask('099.099.099.099');
	FnCheckEmptyFrmFields('#deviceName, #sourceId, #make, #deviceType, #model, #protocol, #version, #nwProtocol', '#btn-save');
	// Form Validation
	$("#gapp-adddevice-form").kendoValidator({		
		validateOnBlur : true,
		errorTemplate: "<span class='help-block'><code>#=message#</code></span>",
			
		});
		

	
	if(!$.isEmptyObject(ObjEditClaimId)){
		FnGetMakeList(FnMakeAjaxRequest);
		FnGetNetworkProtocolsList(FnMakeAjaxRequest);
		FnGetDeviceTagList(FnMakeAjaxRequest);
		FnGetDeviceDetails(ObjEditClaimId);			
		//FnClaimDeviceDetails(ObjEditClaimId.deviceId);
		//$('#publishContainer').removeClass("hidden");
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
		//ds.add({ name: newItem + " (Add New)"});
		ds.add({ "name": newItem });
		this.open();
	  }
	  
	}
    
}


function FnClaimDeviceDetails(sid){
	var VarClaimId =sid;
	// VarClaimId="19c151fe-44cc-4046-a9a4-890b9a2d45ce";
	//alert(VarClaimId);
	var VarUrl = GblAppContextPath+'/ajax' + VarViewDeviceUrl;
	VarUrl = VarUrl.replace("{identifier}",VarClaimId);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResClaimDeviceDetails);
}
function FnResClaimDeviceDetails(response){
	var ArrResponse = response;
	//console.log('------2');
	//console.log(ArrResponse);
	
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
		
		
		
		
		});		
		
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
		VarMakeTxt += '<option value="">Select make</option>';
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
	
	if(VarFlag == 1){		
		GblEditDeviceType = '';
		GblEditModel = '';
		GblEditProtocol = '';
		GblEditVersion = '';
		GblEditConfiguration = '';		
		
		$('#deviceType').html('<option value="">Select a device type</option>');
		$('#model').html('<option value="">Select a model </option>');
		$('#protocol').html('<option value="">Select a protocol </option>');
		$('#version').html('<option value="">Select a protocol version </option>');		
		$('#configuration').html('<option value="">Select a configuration template  </option>');
	
	}
	
	if(VarMake !=''){		
		var VarUrl = GblAppContextPath+'/ajax' + VarPopulateDeviceType;
		VarUrl = VarUrl.replace("{make_name}",VarMake);
		FnMakeAsyncAjaxRequest(VarUrl, 'GET','' , 'application/json; charset=utf-8', 'json', FnResDeviceTypeList);
		} else {
		var VartDeviceType = '<option>Select Device Type</option>';
		$('#deviceType').html(VartDeviceType);				
	}
}
	
function FnResDeviceTypeList(response){	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;	
	if(VarResLength > 0){
		
		var VarMakeTxt = '';
		VarMakeTxt += '<option value="">Select a device type</option>';
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
	var objGetModel ={"make":VarMake,"deviceType":VarDeviceType}
	if(VarFlag == 1){		
		GblEditModel = '';
		GblEditProtocol = '';
		GblEditVersion = '';
		GblEditConfiguration = '';						
		
		$('#model').html('<option value="">Select a model </option>');
		$('#protocol').html('<option value="">Select a protocol </option>');
		$('#version').html('<option value="">Select a protocol version </option>');		
		$('#configuration').html('<option value="">Select a configuration template  </option>');
}
		
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
		$('#configuration').html('<option value="">Select a configuration template  </option>');
	}

	// get previous payload obj			
	var objGetModel ={"make":VarMake,"deviceType":VarDeviceType,"model":VarDeviceModel};
		
	// get prepare url	
	var VarUrl = GblAppContextPath+'/ajax' + VarPopulateDeviceProtocolListUrl;		
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
				$('#configuration').html('<option value="">Select a configuration template  </option>');
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
			if(GblEditVersion != ''){
				$('#version').val(GblEditVersion);
				FnGetTemplate();
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
			$('#configuration').html('<option value="">Select a configuration template </option>');
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
				VarTemplateList += '<option value="">Select a configuration template </option>';				
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
	
$('input[name="status"]').on('switchChange.bootstrapSwitch', function(event, state) {
	var VarDeviceStatus= state;
});



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
	
$("#isPublish").on("click", function() {   
	var name = $(this).val();	
	$("#dsnameElement").show();
	$("#dsName").prop('disabled', false);

});


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
	
	console.log('FnGetFormFieldValues :*');
	console.log(ArrFieldValuesJSONObj);
	return ArrFieldValuesJSONObj;
	
}

function FnClaimDevice(){	
	$('#gapp-device-cancel, #btn-save').attr('disabled',false);	
	$('#BtnEditDevice').hide();
	var validator = $("#gapp-adddevice-form").data("kendoValidator");
	validator.hideMessages();
	//kendo.ui.progress($("#gapp-adddevice-form"), true);
	$("#GBL_loading").show();
	
	if (validator.validate()) {
		
		var VarClaimSourceId= $('#sourceId').val();
		//alert(VarClaimSourceId);
		//alert(VarClaimSourceIdPayload);
		var VarUrl = GblAppContextPath+ '/ajax' + VarClaimDeviceURL;
		VarUrl = VarUrl.replace("{sourceId}",VarClaimSourceId);
		console.log(VarUrl);
			
		var VarParam = {};
		
		var VarStatus = false;
			$("input[name='statusName']").each(function(){				
					if($(this).is(':checked') == true && $(this).val()=='ACTIVE'){
						VarStatus = true;
					}
			});			
						
		VarParam = FnGetFormFieldValues("gapp-adddevice-form","input[type=text],input[type=email], select");	
		VarParam["status"] =VarStatus;	
			
		var VarisPublish ='true';
		$("input[name='isPublish']").each(function() {					
			if($(this).is(':checked') == true) {	
				VarisPublish = 'true';						
			} else { VarisPublish = 'false';}
		});		
		VarParam["deviceName"] =$('#deviceName').val();
		VarParam["isPublish"] =VarisPublish;
		VarParam["version"] =$('#version').val();		
		VarParam["allocated"] ='true';
		VarParam["sourceId"] =VarClaimSourceId;
		//delete VarParam["sourceId"];
		console.log(VarParam);	

	} else{
			//$('#gapp-device-save, #gapp-device-cancel').attr('disabled',false);
			
			$('#gapp-device-cancel, #btn-save').attr('disabled',false);	
			//kendo.ui.progress($("#gapp-adddevice-form"), false);
			$("#GBL_loading").hide();
			var errors = validator.errors();
			console.log(errors);
			return false;
		
		
	}	
	//var VarParam = ClaimDevicePayload;
	console.log(JSON.stringify(VarParam));	
	//return false;
	
	FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResClaimDevice);	
	
}

function FnResClaimDevice(response){
	var ArrResponse = response;	
	//console.log(ArrResponse);
	//$('#gapp-device-cancel, #btn-save).attr('disabled',false);
	//kendo.ui.progress($("#gapp-adddevice-form"), false);
	$("#GBL_loading").hide();
	if(ArrResponse.status == 'SUCCESS'){
		notificationMsg.show({
			message : 'Device claimed successfully'
		}, 'success');
		
		FnFormRedirect('gapp-claim-list',GBLDelayTime);
	} else {
		notificationMsg.show({
					message : ArrResponse.errorMessage
				}, 	'error');
		
	}	
}

function FnSaveDevice(){	
	$('#gapp-d-save').text('Save');
	$('#BtnEditDevice').removeClass('gray').addClass('red');
	$('#gapp-device-save, #gapp-device-cancel').attr('disabled',true);
	var validator = $("#gapp-adddevice-form").data("kendoValidator");
	validator.hideMessages();
	//kendo.ui.progress($("#gapp-adddevice-form"), true);
	$("#GBL_loading").show();
	if (validator.validate()) { 
				
		if(VarEditDeviceId == ''){ 
			// Create Device
			var VarUrl = GblAppContextPath+'/ajax' + VarCreateDeviceUrl;			
			var VarParam = {};
			
			
			VarParam = FnGetFormFieldValues("gapp-adddevice-form","input[type=text],input[type=email],select");			
			var VarStatus = 'true';
			$("input[name='status']").each(function() {
				
				if($(this).is(':checked') == true) {	
					VarStatus = 'true';
				} else {
					VarStatus = 'false';
				}
			});
			VarParam["status"] =VarStatus;		
			
			
			var VarisPublish ='true';
			$("input[name='isPublish']").each(function() {					
				if($(this).is(':checked') == true) {	
					VarisPublish = 'true';						
				} else { VarisPublish = 'false';}
			});
			
			VarParam["isPublish"] =VarisPublish;
			VarParam["allocated"] ='true';		
				
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResSaveDevice);
		} else { 
		
			// Update Device - /galaxy-dm/1.0.0/devices/{sourceId}		
		
			var VarClientID = $('#gapp-adddevice-form #sourceId').val();
			var VarUrl = GblAppContextPath+'/ajax' + VarUpdateDeviceUrl;		
			VarUrl = VarUrl.replace("{sourceId}",VarClientID);
			
			var VarParam = {};	
			VarParam = FnGetFormFieldValues("gapp-adddevice-form","input[type=text],input[type=email],select,input[type=checkbox]");
		
			var VarisPublish ='true';
			$("input[name='isPublish']").each(function() {					
				if($(this).is(':checked') == true) {	
					//VarisPublish = $(this).val();
					VarisPublish = 'true';						
				} else { VarisPublish = 'false';}
			})
			
			var VarStatusBoolean ='true';
			$("input[name='status']").each(function() {					
				if($(this).is(':checked') == true) {	//VarisPublish = $(this).val();
					VarStatusBoolean = 'true';						
				} else { VarStatusBoolean = 'false';}
			})
			VarParam["identifier"] =VarEditClaimId;
			VarParam["status"] =VarStatusBoolean;
			VarParam["isPublish"] =VarisPublish;							
			delete VarParam["sourceId"];
			
			console.log(JSON.stringify(VarParam));				
			FnMakeAsyncAjaxRequest(VarUrl, 'PUT', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResUpdateDevice);
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
			message : '”Device updated successfully'
		}, 'success');
		
		FnFormRedirect('gapp-claim-list',GBLDelayTime);
		
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
			message : 'Device claimed successfully'
		}, 'success');
		
		
		FnFormRedirect('gapp-claim-list',GBLDelayTime);
		
	} else {
		notificationMsg.show({
			message : ArrResponse.errorMessage
		}, 'error');
	}
		
}



function FnCancelDevice(){		
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-claim-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-claim-list').submit();
	}
}

var GblEditDeviceType='';
var GblEditModel = '';
var GblEditProtocol = '';
var GblEditVersion = '';
var GblEditConfiguration = '';

function FnGetDeviceDetails(ObjEditClaimId){
	
	$('#BtnEditDevice').hide();	
	$("#gapp-adddevice-form :input").prop("disabled", false);
	$("#sourceId").prop("disabled", true);
	$('#gapp-device-save').attr('disabled',true);
	$("#gapp-device-cancel").prop("disabled", false);
	
	var tags = $("#tags").data("kendoMultiSelect");
	tags.enable(true);
	
	//$('input[name="status"]').bootstrapSwitch('readonly', true);
	//$('input[name="status"]').bootstrapSwitch('toggleDisabled', true, true);
	
	//console.log(ObjEditClaimId);
	$('#sourceId').val(ObjEditClaimId.sourceId);
	$('#gapp-adddevice-form #nwProtocol').val(ObjEditClaimId.networkProtocol);
	var VarTags = ObjEditClaimId.tags;
	
	if(VarTags.length > 0){
		var ArrTags = (VarTags).split(',');
		var multiselect = $("#tags").data("kendoMultiSelect");
		multiselect.value(ArrTags);
	}
	
	if(ObjEditClaimId.datasourceName != ''){
		$('#dsName').val(ObjEditClaimId.datasourceName);
		$('#isPublish').attr('checked',true);
	} else {
		$('#dsName').val('');
		$('#isPublish').attr('checked',false);
	}
	$("#isPublish").prop('checked', true);
	
	/****  DEVICE IP ****/
	//ObjEditClaimId.deviceIp="19.89.34.12"
	if(ObjEditClaimId.deviceIp != ''){		
		$('#deviceIp').val(ObjEditClaimId.deviceIp);		
	}
	/****  DEVICE PORT ****/
	//ObjEditClaimId.devicePort="198"
	if(ObjEditClaimId.devicePort != ''){		
		$('#devicePort').val(ObjEditClaimId.devicePort);		
	}
	/****  WEB  PORT ****/
	//ObjEditClaimId.wbPort="205";
	if(ObjEditClaimId.wbPort != ''){		
		$('#wbPort').val(ObjEditClaimId.wbPort);		
	}
	
	$('#latitude').val(ObjEditClaimId.latitude);
	$('#longitude').val(ObjEditClaimId.longitude);
	$('#deviceName').val(ObjEditClaimId.deviceName);

	
	if(ObjEditClaimId.make != undefined){
		$('#make').val(ObjEditClaimId.make);
		
		GblEditDeviceType = ObjEditClaimId.deviceType;
		GblEditModel = ObjEditClaimId.model;
		GblEditProtocol = ObjEditClaimId.protocol;
		GblEditVersion = ObjEditClaimId.version;
		FnGetDeviceTypeList();
		//FnGetProtocolVersionList();
	}
	
	
	
}



function FnEditDevice(){
	$("select#deviceType, select#model, select#protocol, select#tags, select#version, select#configuration, input#dsName").prop('disabled', false);
		
	$("#gapp-adddevice-form :input").prop("disabled", false);
	$("#gapp-device-save, #gapp-device-cancel").prop("disabled", true);
	/*
	$('#sourceId, #dsName,#isPublish').prop("disabled", true);			
	$('#dsnameElement, #dsName').show();
	
	$('#gapp-device-edit').hide();
	$('#editContainer').hide();
	$('select#tags').removeAttr('disabled');*/
	//alert('FnEditDevice');
	// this.preventDefault();
	
	/*
	$('#gapp-d-save').text('Save');
	$('#BtnEditDevice').removeClass('gray').addClass('red');
	$('#gapp-device-save, #gapp-device-cancel').attr('disabled',true);
	var validator = $("#gapp-adddevice-form").data("kendoValidator");
	*/
	
	
	
	 $('#BtnEditDevice').on("click", function (e) {	e.preventDefault();});
	
	$('#BtnEditDevice').removeClass('red').addClass('gray');
	$('#BtnEditDevice').hide();
	//$('#gapp-d-save').text('update');
	$("#gapp-adddevice-form :input").prop("disabled", false);
	$("#gapp-adddevice-save").prop("disabled", false);
	$('#sourceId').prop("disabled", true);
	$('#gapp-adddevice-edit').hide();

}

$("#isPublish").on("click", function() {
	if($(this).is(":checked")){
		var name = $(this).val();	
		$("#dsnameElement").show();
		$("#dsName").prop('disabled', false);
	} else {
		$("#dsnameElement").hide();
		$("#dsName").prop('disabled', false);
	}
});


function FnCancelClaim(){

	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-claim-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-claim-list').submit();
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


function FnNavigateClaimList(){
	$('#gapp-claim-list').submit();
}