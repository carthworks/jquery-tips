"use strict";

$(document).ready(function(){
	$(".k-grid-content").css("overflow", "scroll").css("overflow-x", "auto").scroll(function() {
		var left = $(this).scrollLeft();
		var wrap = $(".k-grid-header-wrap");
		if (wrap.scrollLeft() != left) wrap.scrollLeft(left);
	});
	
	FnInitializeContactsGrid();
});

$(window).load(function(){
	FnGetContactList();
});

function FnInitializeContactsGrid(){
	var ViewLink = "<a class='grid-viewcontact' style='text-transform: capitalize;'>#=name#</a>";	
	var ArrColumns = [{field: "name",title: "Contact Name",template: ViewLink},{field: "email",title: "Email Id"},{field: "contactNumber",title: "Contact Number"},{					field: "contactType",title: "Contact Type"},{title: "Action",template: "<a class='grid-contact-mapequips btn btn-sm btn-raised default'>Map Asset</a>"}];
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: true },
		"selectable" : true
	};
	FnDrawGridView('#gapp-contact-list',[],ArrColumns,ObjGridConfig);
}

function FnGetContactList(){
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath+'/ajaxccd' + VarListContactUrl;
	var VarParam = {};
	VarParam['tenantName'] = VarCurrentTenantInfo.tenantName;
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResContactList);	
}

function FnResContactList(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;	
	var ViewLink = "<a class='grid-viewcontact' style='text-transform: capitalize;'>#=name#</a>" ;	
	var ArrColumns = [{field: "name",title: "Contact Name",template: ViewLink},{field: "email",title: "Email Id"},{field: "contactNumber",title: "Contact Number"},{					field: "contactType",title: "Contact Type"},{title: "Action",template: "<a class='grid-contact-mapequips btn btn-sm btn-raised default'>Map Asset</a>"}];
		
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: true },
		"selectable" : true
	};
	
	if(ArrResponse.errorCode == undefined){
		var ArrResponseData = ArrResponse;
	} else {
		
		if(ArrResponse.errorCode == '508'){
		
			notificationMsg.show({
				message : 'Request data is not available'
			}, 'info');
		
			var ArrResponseData = [];
			
		} else {
		
			notificationMsg.show({
				message : ArrResponse.errorMessage
			}, 'error');
		
			var ArrResponseData = [];
		}
		
	}
					
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-contact-list',ArrResponseData,ArrColumns,ObjGridConfig);
	
	$("#gapp-contact-list").data("kendoGrid").tbody.on("click", ".grid-viewcontact", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-contact-list").data('kendoGrid').dataItem(tr);
		var ObjContactInfo = {};
		ObjContactInfo['name'] = data.name;
		ObjContactInfo['email'] = data.email;
		ObjContactInfo['contactType'] = data.contactType;
		ObjContactInfo['contactNumber'] = data.contactNumber;
		ObjContactInfo['contactId'] = data.rowIdentifier;
		$("#gapp-contact-view #contact_info").val(JSON.stringify(ObjContactInfo));
		$("#gapp-contact-view").submit();
	});
	
	$("#gapp-contact-list").data("kendoGrid").tbody.on("click", ".grid-contact-mapequips", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-contact-list").data('kendoGrid').dataItem(tr);
		var ObjContactInfo = {};
		ObjContactInfo['name'] = data.name;
		ObjContactInfo['email'] = data.email;
		ObjContactInfo['contactType'] = data.contactType;
		ObjContactInfo['contactNumber'] = data.contactNumber;
		ObjContactInfo['contactId'] = data.rowIdentifier;
		$("#gapp-contact-map #contact_info").val(JSON.stringify(ObjContactInfo));
		$("#gapp-contact-map").submit();
	});

}

function FnCreateContact(){
	$('#gapp-contact-create').submit();
}
