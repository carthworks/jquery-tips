"use strict";

$(document).ready(function(){
	FnGetRoleList();
		
});

function FnGetRoleList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListRoleUrl;
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResRoleList);
}

function FnResRoleList(response){
	var ArrResponse = response;
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-viewrole'>#=roleName#</a>" : "<a href='Javascript:void(0)'>#=roleName#</a>";
	var ArrColumns = [{field: "description",title: "Alarm Name",width: 130,template: ViewLink },{field: "description",title: "Asset Name",width: 130},{field: "description",title: "Point Name",width: 130}];
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	
	var objDatasource = {};
	objDatasource['data']=ArrResponse;
	objDatasource['sort']={field: "roleName", dir: "asc"}
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-roles-list',objDatasource,ArrColumns,ObjGridConfig);
	
	$("#gapp-roles-list").data("kendoGrid").tbody.on("click", ".grid-viewrole", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-roles-list").data('kendoGrid').dataItem(tr);
		data = data.roleName;
		//alert(data);
		$( "#role_id").val(data);
		$("#gapp-role-view").submit();
	});
}

function FnCreateRole(){
	$('#gapp-role-create').submit();
}