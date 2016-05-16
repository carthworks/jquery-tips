"use strict";

$(document).ready(function(){
	$(".k-grid-content").css("overflow", "scroll").css("overflow-x", "auto").scroll(function() {
		var left = $(this).scrollLeft();
		var wrap = $(".k-grid-header-wrap");
		if (wrap.scrollLeft() != left) wrap.scrollLeft(left);
	});
	
	FnGetImportedEquipList();	
});

function FnGetImportedEquipList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListEquipUrl;
	var VarParam = {};
	VarParam['domain'] = {"domainName" : VarCurrentTenantInfo.tenantDomain};
	VarParam['entityTemplate'] = {"entityTemplateName" : "Genset"};
	FnMakeAjaxRequest(VarUrl, 'POST', JSON.stringify(VarParam), 'application/json; charset=utf-8', 'json', FnResImportedEquipList);	
}

function FnResImportedEquipList(response){
	
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	var ArrResponseData = [];
	if(VarResLength > 0){
		$(ArrResponse).each(function(){
			var element = {};
			element["domainName"] = this.domain.domainName;
			element["globalEntityType"] = this.globalEntity.globalEntityType;
			element["entityTemplateName"] = this.entityTemplate.entityTemplateName;
			$(this.dataprovider).each(function() {
				var key = this.key;
				var value = ((this.value != undefined)? this.value : "");
				element[key] = value;
			});
			element["identifier"] = this.identifier.value;
			element["status"] = this.entityStatus.statusName;
			ArrResponseData.push(element);
		});
	}
		
	var ArrColumns = [
						{
							field: "gensetSerialNumber",
							title: "Genset serial number"
						}
					
					];
		
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 490,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: true },
		"selectable" : true
	};
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-imported-list',ArrResponseData,ArrColumns,ObjGridConfig);
	
}
	
