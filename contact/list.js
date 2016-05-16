"use strict";

$(document).ready(function(){
	$(".k-grid-content").css("overflow", "scroll").css("overflow-x", "auto").scroll(function() {
		var left = $(this).scrollLeft();
		var wrap = $(".k-grid-header-wrap");
		if (wrap.scrollLeft() != left) wrap.scrollLeft(left);
	});
	
	FnGetContactList();	
});

function FnGetContactList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListContactUrl;
	var VarParam = {};
	VarParam['tenantName'] = VarCurrentTenantInfo.tenantName;
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResContactList);	
}

function FnResContactList(response){
	var ArrResponse = response;
	
	var ArrColumns = [
						{
							field: "name",
							title: "Contact Name"
						},
						{
							field: "email",
							title: "Email"
						},
						{
							field: "contactNumber",
							title: "Contact Number"
						},
						{
							field: "contactType",
							title: "Contact Type"
						}
					];
		
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
			}, 'error');
		
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

}

function FnCreateContact(){
	$('#gapp-contact-create').submit();
}
