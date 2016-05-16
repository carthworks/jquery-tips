"use strict";

$(document).ready(function(){
	$(".k-grid-content").css("overflow", "scroll").css("overflow-x", "auto").scroll(function() {
		var left = $(this).scrollLeft();
		var wrap = $(".k-grid-header-wrap");
		if (wrap.scrollLeft() != left) wrap.scrollLeft(left);
	});
	
	FnInitializeGrid();
});

$(window).load(function(){
	FnGetImportedEquipList();
});

function FnInitializeGrid(){
	var ArrColumns = [{field: "assetName",title: "Asset Name"}, {field: "assetType",title: "Asset Type"}, {field: "assetId",title: "Asset Id"}, {field: "serialNumber",title: "Serial Number"}];
		
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: true },
		"selectable" : true
	};
	FnDrawGridView('#gapp-equipimported-list',[],ArrColumns,ObjGridConfig);
}

function FnGetImportedEquipList(){
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath+'/ajaxccd' + VarListEquipUrl;
	var VarParam = {};
	VarParam['tenantName'] = VarCurrentTenantInfo.tenantName;
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResImportedEquipList);	
}

function FnResImportedEquipList(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;
	var ArrColumns = [{field: "assetName",title: "Asset Name"}, {field: "assetType",title: "Asset Type"}, {field: "assetId",title: "Asset Id"}, {field: "serialNumber",title: "Serial Number"}];
		
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: true },
		"selectable" : true
	};
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-equipimported-list',ArrResponse,ArrColumns,ObjGridConfig);
	
}

function FnImportAssets(){
	$('#gapp-import-assets').submit();
}
	
