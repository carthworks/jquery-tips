"use strict";

$(document).ready(function(){
	FnGetFacilityList();
		
});

function FnGetFacilityList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListFacilityUrl;
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	VarUrl = VarUrl.replace("{templatename}","AvocadoFacilityTemplate");	
	FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResFacilityList);
}

function FnResFacilityList(response){
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	var ArrResponseData = [];
	if(VarResLength > 0){
		$(ArrResponse).each(function(index){
			var element = {};
			$(this.dataprovider).each(function() {
				var key = this.key;
				element[key] = this.value;
			});
			element["identifier"] = this.identifier.value;
			element["status"] = this.entityStatus.statusName;
			ArrResponseData.push(element);
		});
	}
	
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-viewfacility'>#=facilityName#</a>" : "<a href='Javascript:void(0)'>#=facilityName#</a>";
	
	var ArrColumns = [{field: "facilityName",title: "Facility Name",template: ViewLink },{field: "country",title: "Country"},{field: "emirate",title: "Emirate"},{field: "city",title: "City"},{field: "zone",title: "Zone"},{field: "vertical",title: "Vertical"},{field: "buildingType",title: "Building Type"},{field: "buildingStructure",title: "Building Structure"},{field: "status",title: "Status"}];
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: true },
		"selectable" : true
	};
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-facility-list',ArrResponseData,ArrColumns,ObjGridConfig);
	
	$("#gapp-facility-list").data("kendoGrid").tbody.on("click", ".grid-viewfacility", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-facility-list").data('kendoGrid').dataItem(tr);
		data = data.facilityName;
		$( "#facility_id").val(data);
		$("#gapp-facility-view").submit();
	});
}

function FnCreateFacility(){
	$('#gapp-facility-create').submit();
}