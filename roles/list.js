"use strict";

$(document).ready(function(){
	FnInitializeRoleGrid();
});

$(window).load(function(){
	FnGetRoleList();
});

function FnInitializeRoleGrid(){
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-viewrole'>#=roleName#</a>" : "<a href='Javascript:void(0)'>#=roleName#</a>";
	var ArrColumns = [{field: "roleName",title: "Role Name",width: 130,template: ViewLink },{field: "description",title: "Description",width: 130}];
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	FnDrawGridView('#gapp-roles-list',[],ArrColumns,ObjGridConfig);
}

function FnGetRoleList(){
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath+'/ajax' + VarListRoleUrl;
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResRoleList);
}

function FnResRoleList(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-viewrole'>#=roleName#</a>" : "<a href='Javascript:void(0)'>#=roleName#</a>";
	var ArrColumns = [{field: "roleName",title: "Role Name",width: 130,template: ViewLink },{field: "description",title: "Description",width: 130}];
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