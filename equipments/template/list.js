"use strict";

$(document).ready(function(){
	$(".k-grid-content").css("overflow", "scroll").css("overflow-x", "auto").scroll(function() {
		var left = $(this).scrollLeft();
		var wrap = $(".k-grid-header-wrap");
		if (wrap.scrollLeft() != left) wrap.scrollLeft(left);
	});
	
	FnInitializeTemplateGrid();	
});

$(window).load(function(){
	FnGetTemplateList();
});

function FnInitializeTemplateGrid(){
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-template-view capitalize'>#=assetType#</a>" : "<a href='Javascript:void(0)' class='capitalize'>#=assetType#</a>";		
	var ArrColumns = [
						{
							field: "assetType",
							title: "Asset Type",
							template: ViewLink
						}
					];
		
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	FnDrawGridView('#gapp-template-list',[],ArrColumns,ObjGridConfig);
}

function FnGetTemplateList(){
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath+'/ajax' + VarListTemplateUrl + "?domain_name="+ VarCurrentTenantInfo.tenantDomain;
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResTemplateList);
}

function FnResTemplateList(response){	
	$("#GBL_loading").hide();
	var ArrResponse = response;
	if($.isArray(ArrResponse)){
		var VarResLength = ArrResponse.length;
		var ArrResponseData = [];
		if(VarResLength >0){
			ArrResponseData = ArrResponse;
		}
	} else {
		var ArrResponseData = [];
	}
	
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-template-view capitalize'>#=assetType#</a>" : "<a href='Javascript:void(0)' class='capitalize'>#=assetType#</a>";		
	var ArrColumns = [
						{
							field: "assetType",
							title: "Asset Type",
							template: ViewLink
						}
					];
		
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	
	var objDatasource = {};
	objDatasource['data']=ArrResponseData;
	objDatasource['sort']={field: "assetType", dir: "asc"}
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-template-list',objDatasource,ArrColumns,ObjGridConfig);
	
	$("#gapp-template-list").data("kendoGrid").tbody.on("click", ".grid-template-view", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-template-list").data('kendoGrid').dataItem(tr);
		data = data.assetType;
		$( "#entity_id").val(data);
		$("#gapp-template-view").submit();
	});
	
}

function FnCreateTemplate(){
	$('#gapp-template-create').submit();
}
	
	
