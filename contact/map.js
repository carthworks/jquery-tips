"use strict";

$(document).ready(function(){
	FnGetEquipmentList();
});

function FnGetEquipmentList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListEquipUrl;
	var VarParam = {};
	VarParam['domain'] = {"domainName" : VarCurrentTenantInfo.tenantDomain};
	VarParam['entityTemplate'] = {"entityTemplateName" : "Genset"};
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResEquipmentList);
}

function FnResEquipmentList(response){
	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	var VarEquipTxt = '';
	if(VarResLength > 0){
		$(ArrResponse).each(function(){
			var VarEquipName = '';
			$(this.dataprovider).each(function() {
				var key = this.key;
				var value = this.value;
				if(key == 'gensetSerialNumber'){
					VarEquipName = value;
				}
			});
			var VarEquipId = this.identifier.value;
			
			VarEquipTxt += '<option value="'+VarEquipId+'">'+VarEquipName+'</option>';	
			
		});
	}
	
	$('#event_inputlist').html(VarEquipTxt);
	
}

function FnImportEquipments(){

}

function FnImportCancel(){
	var ArrSelEquipments = [];
	$('#event_outputlist option').map(function() {
		ArrSelEquipments.push($(this).val());
	}).get();
	
	if(ArrSelEquipments.length > 0){
	
		var kendoWindow = $("<div />").kendoWindow({
				            title: "Confirm",
				            height:100,
				            width: 190,
				            resizable: false,
				            modal: true
				        });
						
		kendoWindow.data("kendoWindow").content($("#import-confirmation").html()).center().open(); 
		kendoWindow.find(".import-confirm,.import-cancel").click(function() {
			                if ($(this).hasClass("import-confirm")) {			                	
			                	FnBreadCrumbHome();	                	
			                } else {
								kendoWindow.data("kendoWindow").close();
							}
			            }).end();
	
	} else {
		FnBreadCrumbHome();
	}
}

/***** BEGIN: Assign button operations *******/
$('#btnRight').click(function(e) {
	$("#outputlistval").hide();
	var selectedOpts = $('#event_inputlist option:selected');
	if (selectedOpts.length == 0) {
		
		notificationMsg.show({
			message : 'Please select Equipments'
		}, 'error');
		e.preventDefault();
	}
	$('#gapp-import-save').attr('disabled',false);
	$('#event_outputlist').append($(selectedOpts).clone());
	$(selectedOpts).remove();
	e.preventDefault();
});


$('#btnLeft').click(function(e) {
	var selectedOpts = $('#event_outputlist option:selected');
	if (selectedOpts.length == 0) {
		
		notificationMsg.show({
			message : 'Please select Equipments'
		}, 'error');
		e.preventDefault();
	}
	$('#event_inputlist').append($(selectedOpts).clone());
	$(selectedOpts).remove();
	
	var ArrSelEquipments = [];
	$('#event_outputlist option').map(function() {
		ArrSelEquipments.push($(this).val());
	}).get();
	if(ArrSelEquipments.length > 0){
		$('#gapp-import-save').attr('disabled',false);
	} else {
		$('#gapp-import-save').attr('disabled',true);
	}
	
	e.preventDefault();
});

$('#btnLeftall').click(function(e) {
	var selectedOpts = $('#event_outputlist option');
	if (selectedOpts.length == 0) {
		e.preventDefault();
	}
	$('#event_inputlist').append($(selectedOpts).clone());
	$(selectedOpts).remove();
	$('#gapp-import-save').attr('disabled',true);
	e.preventDefault();
});

$('#btnRightall').click(function(e) {
	var selectedOpts = $('#event_inputlist option');
	if (selectedOpts.length == 0) {
		notificationMsg.show({
			message : 'Please select Equipments'
		}, 'error');
		e.preventDefault();
	}
	$('#event_outputlist').append($(selectedOpts).clone());
	$(selectedOpts).remove();
	
	$('#gapp-import-save').attr('disabled',false);
	
	e.preventDefault();
});

/***** END: Assign button operations *******/