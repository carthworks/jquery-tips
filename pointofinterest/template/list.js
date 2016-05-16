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
							field: "poiType",
							title: "POI Type",
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
	//var VarUrl = GblAppContextPath+'/ajax' + VarListTemplateUrl;
	console.log(VarUrl);
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
	
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-template-view capitalize'>#=poiType#</a>" : "<a href='Javascript:void(0)' class='capitalize'>#=poiType#</a>";		
	var ArrColumns = [
						{
							field: "poiType",
							title: "POI Type",
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
	objDatasource['sort']={field: "poiType", dir: "asc"}
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-template-list',objDatasource,ArrColumns,ObjGridConfig);
	
	var userlist = $("#gapp-template-list").data("kendoGrid");
	userlist.bind("change", FnGridChangeEvent);
	userlist.bind("dataBound", FnDataBound);
	
	$("#gapp-template-list").data("kendoGrid").tbody.on("click", ".grid-template-view", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-template-list").data('kendoGrid').dataItem(tr);
		data = data.poiType;		
		$( "#entity_id").val(data);
		$("#gapp-template-view").submit();
	});
	
}

var ObjSelUser = {};
function FnGridChangeEvent(){
	var poilist = $("#gapp-template-list").data("kendoGrid");
	if(poilist.select().length > 0){
		$('#gapp-user-delete').attr('disabled',false);
		var VarSelectedItem = poilist.dataItem(poilist.select());
		ObjSelUser = VarSelectedItem;
		
		console.log(JSON.stringify(ObjSelUser));
	//	$('#gapp-user-delete').attr('disabled',true);	//remove this when delete service is ready	
		
	} else{
		$('#gapp-user-delete').attr('disabled',true);
		ObjSelUser = {};		
	}
}

function FnDataBound(e){
	var view = this.dataSource.view();
	var VarChkCnt = 0;
	for(var i = 0; i < view.length; i++){
		if(ObjSelUser.uid != undefined && ObjSelUser.uid === view[i].uid){
			this.tbody.find("tr[data-uid='" + view[i].uid + "']").closest("tr").addClass('k-state-selected');
			VarChkCnt++;
		}
	}
	
	if(VarChkCnt>0){
		$('#gapp-user-delete').attr('disabled',false);
	} else {
		$('#gapp-user-delete').attr('disabled',true);
	}
	
}


function FnCreateTemplate(){
	$('#gapp-template-create').submit();
}
	
function FnDeleteUser(){
	console.log(ObjSelUser);
	var ArrPoiDeleteDetails =[];
	var element = {};
	element["domainName"] = VarCurrentTenantInfo.tenantDomain;
	element["entityTemplateName"] = 'Poi';
	element["globalEntityType"] = 'MARKER';
	element["key"] = 'identifier';
	ArrPoiDeleteDetails.push(element);
	console.log(JSON.stringify(ArrPoiDeleteDetails));
	if(!$.isEmptyObject(ObjSelUser)){		
		var kendoWindow = $("<div />").kendoWindow({
						title: "Confirm",
						height:100,
						width: 120,
						resizable: false,
						modal: true
		});
		kendoWindow.data("kendoWindow").content($("#delete-confirmation").html()).center().open();
		$('.delete-message').text('Are you sure want to delete '+ObjSelUser.userName+' ?');
		
		kendoWindow.find(".delete-confirm,.delete-cancel").click(function() {
								if ($(this).hasClass("delete-confirm")) {
									$("#GBL_loading").show();
									var VarDeleteUserId = ObjSelUser.userName;
									var VarUrl = GblAppContextPath + '/ajax' + VarDeleteUsersUrl;
									
									//VarUrl = VarUrl.replace("{user_name}",VarDeleteUserId);
									//VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
									//console.log(VarUrl);
									//return false;
									FnMakeAjaxRequest(VarUrl, 'POST', '', 'application/json; charset=utf-8', 'json', FnResDeleteUser);
									
								} else {
									kendoWindow.data("kendoWindow").close();
								}
							}).end();
		
	} else {		
		$("#alertModal").modal('show').find(".modalMessage").text("Please select at least one poi type.");
		return false;
		
	}
	
}

function FnResDeleteUser(response){
	var ObjResponse = response;
	$("#GBL_loading").hide();
	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.errorCode == undefined){
			notificationMsg.show({
				message : 'POI Type deleted successfully'
			}, 'success');
			
			setTimeout(function(){ location.reload(); }, GBLDelayTime);
			
		} else {
			notificationMsg.show({
				message : ObjResponse['errorMessage']
			}, 'error');
		}
	} else {
		
		notificationMsg.show({
			message : 'Error'
		}, 'error');
		
	}
}
	
