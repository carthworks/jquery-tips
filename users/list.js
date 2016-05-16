"use strict";

$(document).ready(function(){
	FnInitializeUsersGrid();
});

$(window).load(function(){
	FnGetUsersList();
});

function FnInitializeUsersGrid(){
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-viewuser'>#=userName#</a>" : "<a href='Javascript:void(0)'>#=userName#</a>";
	var ArrColumns = [{field: "userName",title: "User Name",width: 130,template: ViewLink },{field: "firstName",title: "First Name",width: 130},{field: "lastName",title: "Last Name",width: 130},{field: "emailId",title: "Email Id",width: 130},{field: "roleName",title: "Role Name",width: 130},{field: "contactNumber",title: "Mobile Number",width: 130}];
	var ObjGridConfig = {
		"scrollable" : false,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: false },
		"selectable" : true
	};
	FnDrawGridView('#gapp-users-list',[],ArrColumns,ObjGridConfig);
}

function FnGetUsersList(){
	$("#GBL_loading").show();
	var VarUrl = GblAppContextPath+'/ajax' + VarListUsersUrl;
	VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResUsersList);
}

function FnResUsersList(response){
	$("#GBL_loading").hide();
	var ArrResponse = response;
	var VarResLength = ArrResponse.length;
	var ArrResponseData = [];
	if(VarResLength > 0){
		$(ArrResponse).each(function(index){
			var element = {};
			$(this.dataprovider).each(function() {
				var key = this.key;
				if(key == 'roleName'){
					element[key] = this.value.replace(/[&\/\\\[\]#+()$~%'":*?<>{}]/g, '');
				}else{
					element[key] = this.value;
				}
				
			});
			element["identifier"] = this.identifier.value;
			element["status"] = this.entityStatus.statusName;
			ArrResponseData.push(element);
		});
	}
	
	var ViewLink = (ObjPageAccess['view']=='1') ? "<a class='grid-viewuser'>#=userName#</a>" : "<a href='Javascript:void(0)'>#=userName#</a>";
	
	var ArrColumns = [{field: "userName",title: "User Name",width: 130,template: ViewLink },{field: "firstName",title: "First Name",width: 130},{field: "lastName",title: "Last Name",width: 130},{field: "emailId",title: "Email Id",width: 130},{field: "roleName",title: "Role Name",width: 130},{field: "contactNumber",title: "Mobile Number",width: 130}];

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
	objDatasource['sort']={field: "userName", dir: "asc"}
	
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-users-list',objDatasource,ArrColumns,ObjGridConfig);
	
	var userlist = $("#gapp-users-list").data("kendoGrid");
	userlist.bind("change", FnGridChangeEvent);
	userlist.bind("dataBound", FnDataBound);
	
	$("#gapp-users-list").data("kendoGrid").tbody.on("click", ".grid-viewuser", function(e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-users-list").data('kendoGrid').dataItem(tr);
		data = data.identifier;
		$( "#user_id").val(data);
		$("#gapp-user-view").submit();
	});
}

var ObjSelUser = {};
function FnGridChangeEvent(){
	var userlist = $("#gapp-users-list").data("kendoGrid");
	if(userlist.select().length > 0){
		$('#gapp-user-delete').attr('disabled',false);
		var VarSelectedItem = userlist.dataItem(userlist.select());
		ObjSelUser = VarSelectedItem;
	} else {
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

function FnCreateUser(){
	$('#gapp-user-create').submit();
}

function FnDeleteUser(){
	
	if(!$.isEmptyObject(ObjSelUser)){
		var kendoWindow = $("<div />").kendoWindow({
								title: "Confirm",
								height:100,
								width: 190,
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
									VarUrl = VarUrl.replace("{user_name}",VarDeleteUserId);
									VarUrl = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
									FnMakeAjaxRequest(VarUrl, 'DELETE', '', 'application/json; charset=utf-8', 'json', FnResDeleteUser);
									
								} else {
									kendoWindow.data("kendoWindow").close();
								}
							}).end();
	} else {
		$("#alertModal").modal('show').find(".modalMessage").text("Please select at least one user.");
		return false;
	}
						
}

function FnResDeleteUser(response){
	var ObjResponse = response;
	$("#GBL_loading").hide();
	if(!$.isEmptyObject(ObjResponse)){
		if(ObjResponse.errorCode == undefined){
			notificationMsg.show({
				message : 'User deleted successfully'
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