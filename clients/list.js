"use strict";

$(document).ready(function(){
	FnInitializeClientsGrid();
		
});

$(window).load(function(){
	FnGetClientsList();
});

function FnInitializeClientsGrid(){
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-viewtenant' style='text-transform: capitalize;'>#=tenantName#</a>" : "<a href='Javascript:void(0)' style='text-transform: capitalize;'>#=tenantName#</a>";
	
	var ArrColumns = [{field: "tenantName",title: "Client Name",template: ViewLink },{field: "tenantId",title: "Client Id"},{field: "firstName",title: "First Name"},{field: "lastName",title: "Last Name"},{field: "contactEmail",title: "Email Id"},{field: "status",title: "Status"},{title: "Action",template: "<a class='grid-viewtenanthome' title='#=tenantName#'><i class='smicon sm-homeicon '></i></a>",width: 70}];
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	FnDrawGridView('#gapp-clients-list',[],ArrColumns,ObjGridConfig);
}

function FnGetClientsList(){
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath+'/ajax' + VarListClientsUrl;
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResClientsList);
}

function FnResClientsList(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	var ArrResponseData = [];
	if(VarResLength > 0){
		$(ArrResponse).each(function(){
			var element = {};
			element["parentDomain"] = this.domain.domainName;
			$(this.dataprovider).each(function() {
				var key = this.key;
				element[key] = this.value;
			});
			element["identifier"] = this.identifier.value;
			element["status"] = this.entityStatus.statusName;
			ArrResponseData.push(element);
		});
	}
	
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-viewtenant' style='text-transform: capitalize;'>#=tenantName#</a>" : "<a href='Javascript:void(0)' style='text-transform: capitalize;'>#=tenantName#</a>";
	
	var ArrColumns = [{field: "tenantName",title: "Client Name",template: ViewLink },{field: "tenantId",title: "Client Id"},{field: "firstName",title: "First Name"},{field: "lastName",title: "Last Name"},{field: "contactEmail",title: "Email Id"},{field: "status",title: "Status"},{title: "Action",template: "<a class='grid-viewtenanthome' title='#=tenantName#'><i class='smicon sm-homeicon '></i></a>",width: 70}];
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	
	var objDatasource = {};
	objDatasource['data']=ArrResponseData;
	objDatasource['sort']={field: "tenantName", dir: "asc"}
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-clients-list',objDatasource,ArrColumns,ObjGridConfig);
	var clientlist = $("#gapp-clients-list").data("kendoGrid");
	clientlist.bind("change", FnGridChangeEvent);
	
	$("#gapp-clients-list").data("kendoGrid").tbody.on("click", ".grid-viewtenant", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-clients-list").data('kendoGrid').dataItem(tr);
		data = data.identifier;
		$("#client_id").val(data);
		$("#gapp-client-view").submit();
	});
	
	$("#gapp-clients-list").data("kendoGrid").tbody.on("click", ".grid-viewtenanthome", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-clients-list").data('kendoGrid').dataItem(tr);
		var ObjTenantInfo = {};
		ObjTenantInfo['tenantId'] = data.tenantId;
		ObjTenantInfo['tenantDomain'] = data.domain;
		ObjTenantInfo['parentDomain'] = data.parentDomain;
		ObjTenantInfo['tenantName'] = data.tenantName;
		
		$.ajax({
			type: 'POST',
			cache: true,
			async: false,
			contentType: 'application/json; charset=utf-8',
			url: GblAppContextPath+'/childclient/verify/'+data.tenantId,
			data: JSON.stringify(ObjTenantInfo),
			dataType: 'json',
			success:function(response){
				var ObjResponse = response;
				if(ObjResponse.status == 'success'){
					notificationMsg.show({
						message : 'moving to '+(data.tenantName).toUpperCase()
					}, 'info');
					
					$("#gapp-tenant-info").val(JSON.stringify(ObjTenantInfo));
					FnFormRedirect('gapp-client-home',GBLDelayTime);
				} else if(ObjResponse.status == 'exist'){
					$("#gapp-tenant-info").val(JSON.stringify(ObjTenantInfo));
					$("#clientConfirmation").modal('show');
				}
				
			},
			error:function(xhr, status, error){
				console.log(xhr);
			}
		});
				
	});
	
}

function FnClientConfirmNo(){
	$("#gapp-tenant-info").val('');
	$("#clientConfirmation").modal('hide');
}

function FnClientConfirmYes(){
	var ObjTenantStr = $.parseJSON($("#gapp-tenant-info").val());
		
	$.ajax({
			type: 'POST',
			cache: true,
			async: false,
			contentType: 'application/json; charset=utf-8',
			url: GblAppContextPath+'/childclient/add/'+ObjTenantStr.tenantId,
			data: JSON.stringify(ObjTenantStr),
			dataType: 'json',
			success:function(response){
				var ObjResponse = response;
				if(ObjResponse.status == 'success'){
					notificationMsg.show({
						message : 'moving to '+(ObjTenantStr.tenantName).toUpperCase()
					}, 'info');
					
					FnFormRedirect('gapp-client-home',GBLDelayTime);
				}
				
			},
			error:function(xhr, status, error){
				console.log(xhr);
			}
		});
}

function FnGridChangeEvent(){
	var clientlist = $("#gapp-clients-list").data("kendoGrid");
	
	if(clientlist.select().length > 0){
		$('#gapp-createadmin-btn').attr('disabled',false);
	} else {
		$('#gapp-createadmin-btn').attr('disabled',true);
	}
}

function FnCreateClientAdmin(){
	var ObjIdentifier = FnGetSelectedIdentifier();
	if(ObjIdentifier == null || ObjIdentifier === "undefined" ){
		return;
	}
	var data = ObjIdentifier.domain;
	$("#gapp-client-sendemail #client_domain").val(data);
	$("#gapp-client-sendemail").submit();	
}

function FnGetSelectedIdentifier(){
	var clientlist = $("#gapp-clients-list").data("kendoGrid");
	var VarSelectedItem = clientlist.dataItem(clientlist.select());
	
	if(VarSelectedItem == null || VarSelectedItem === "undefined" ){
		$('#createAdminNotification').modal('show');
		return;
	}	
	return VarSelectedItem;
}

function FnCreateClient(){
	$('#gapp-client-create').submit();
}



