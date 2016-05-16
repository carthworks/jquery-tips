"use strict";

$(document).ready(function(){
	FnInitializeGrid();
});

$(window).load(function(){
	FnGetAllFaultList();
});

function FnInitializeGrid(){
	var ArrColumns = [{field: "fmi",title:"FMI",width: 75},
			  {field: "spn",title: "SPN",width: 75},
			  {field: "assetName",title: "Asset Name"},
			  {field: "oc",title: "Occurrence Count",width: 50},
			  {field: "ocCylcle",title: "Occurrence Cycle",width: 50},
			  {field: "eventTimestamp",title: "Fault Time",template : "#: toDateFormat(eventTimestamp, 'F')#"},
			  {field: "eventStatus",title: "Fault Status"},
			  {field: "eventSendStatus",title: "Email Status",width: 75},
			  {field: "respReceiveStatus",title: "Response Status"},
			  {title: "Action",template: "<a class='btn btn-link-list btn-xs' id='grid-viewfaultdetails' title='View more details'>CCD Response</a>",width: 50}];		 
			  
			  
		var ObjGridConfig = {
			"scrollable" : false,
			"filterable" : { mode : "row" },
			"sortable" : true,
			"height" : 0,
			"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: true },
			"selectable" : true
		};
	FnDrawGridView('#gapp-faults-list',[],ArrColumns,ObjGridConfig);
}

function FnGetAllFaultList(){
	$("#GBL_loading").show();	
	var VarUrl = GblAppContextPath+'/ajaxccd' + VarFindFaultsUrl;
	VarUrl = VarUrl.replace("{tenant_name}",VarCurrentTenantInfo.tenantName);
	FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResAllFaultList);
}

function FnResAllFaultList(response){
	$("#GBL_loading").hide();
	var ObjResponse = response;
	var VarResLength = ObjResponse.length;
	var ArrGridData = [];
	if(VarResLength > 0){
		$.each(ObjResponse, function(idx,obj) {
			var element = {};
				element['sourceId'] = obj.sourceId;
				element['assetName'] = obj.assetName;
				element['eventTimestamp'] = obj.eventTimestamp;
				
				var VarEventStatus='';
				if(obj.eventStatus =='NORMAL'){  
					VarEventStatus = 'Normalised';
				}else {
					VarEventStatus = 'Active';
				} element['eventStatus'] = VarEventStatus;
				
				var VarEventSendStatus='';
				if(obj.eventSendStatus =='SENT'){  
					VarEventSendStatus = 'Sent';
				}else if(obj.eventSendStatus =='NOT_SENT'){
					VarEventSendStatus = 'Pending';
				} element['eventSendStatus'] = VarEventSendStatus;
				
				var VarRespReceiveStatus='';
				if(obj.respReceiveStatus =='RECEIVED'){  
					VarRespReceiveStatus = 'Received';
				}else if(obj.respReceiveStatus =='NOT_RECEIVED'){
					VarRespReceiveStatus = 'Waiting for response';
				} element['respReceiveStatus'] = VarRespReceiveStatus;
				
				element['ocCylcle'] = obj.ocCylcle;
				element['identifier'] = obj.identifier;
				element['fmi'] = obj.fmi;
				element['spn'] = obj.spn;
				element['oc'] = obj.oc;
				element['identifier'] = obj.identifier;
			ArrGridData.push(element);	
			
		});
	}
		var ArrColumns = [{field: "fmi",title:"FMI",width: 75},
			  {field: "spn",title: "SPN",width: 75},
			  {field: "assetName",title: "Asset Name"},
			  {field: "oc",title: "Occurrence Count",width: 50},
			  {field: "ocCylcle",title: "Occurrence Cycle",width: 50},
			  {field: "eventTimestamp",title: "Fault Time",template : "#: toDateFormat(eventTimestamp, 'F')#"},
			  {field: "eventStatus",title: "Fault Status"},
			  {field: "eventSendStatus",title: "Email Status",width: 75},
			  {field: "respReceiveStatus",title: "Response Status"},
			  {title: "Action",template: "<a class='btn btn-link-list btn-xs' id='grid-viewfaultdetails' title='View more details'>CCD Response</a>",width: 50}];

			 
			  
			  
		var ObjGridConfig = {
			"scrollable" : false,
			"filterable" : { mode : "row" },
			"sortable" : true,
			"height" : 0,
			"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: true },
			"selectable" : true
		};
	
		var objDatasource = {};
		objDatasource['data']=ArrGridData;
		objDatasource['schema']=  { model: {
                            fields: {
                                ocCylcle: {
                                    type: "number"
                                },
                                oc: {
                                    type: "number"
                                }
                            }
                        }};
		$(".k-grid-content").mCustomScrollbar('destroy');
		
		FnDrawGridView('#gapp-faults-list',objDatasource,ArrColumns,ObjGridConfig);
		
		$("#gapp-faults-list").data("kendoGrid").tbody.on("click", "#grid-viewfaultdetails", function(e) {
			var tr = $(this).closest("tr");
			var data = $("#gapp-faults-list").data('kendoGrid').dataItem(tr);
			var VarAssetName = data.assetName;
			$("#modal-asset-id").html(VarAssetName);
			var VarIdentifier = data.identifier;
						
			var VarUrl = GblAppContextPath+'/ajaxccd' + VarFaultDetailsUrl;
			VarUrl = VarUrl.replace("{fault_event_id}",VarIdentifier);
			FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResAllFaultDetails);
		});
		
	
}
function FnResAllFaultDetails(response){
	//$("#GBL_loading").show();
	if(!response.errorCode){
		var VarFieldText='';
		var VarResLength = Object.keys(response).length;
		
		var i=0;
		$.each(response, function(key,val) { 
			i++;
			var VarKey = key;
			var VarValue = val;
			var find = '_';
			var re = new RegExp(find, 'g');
			VarKey = VarKey.replace(re, ' ');
			VarKey = VarKey.toUpperCase();
			
			if (VarValue == '' || VarValue == null || undefined == VarValue) {
				VarValue = '-';
			}
			
			if(i<=10){
				VarFieldText += '<div class="col-md-6 rowpadding rowbold">'+VarKey+ '</div> <div class="col-md-6 rowpadding"><span id="modal-vin">'+VarValue+'</span></div>'
		
			}else{
				VarFieldText += '<div class="collapse"><div class="col-md-6 rowpadding rowbold">'+VarKey+'</div><div class="col-md-6 rowpadding"><span id="modal-notification-id">'+VarValue+'</span></div></div>';
			}
											
		});
		VarFieldText += '<div><a class="btn btn-link btn-xs" id="btn-view-more" onclick="fnViewMoreDetails()" href="javascript:void(0);">View more »</a></div>';
		$('#id-fault-details').html(VarFieldText);
		$('#draggable').modal('show');
		/*
		$("#modal-vin").html(response.vin);
		$("#modal-fmi").html(response.fmi);
		$("#modal-response-ver").html(response.Response_Version);
		$("#modal-msg-type").html(response.Message_Type);
		$("#modal-notification-id").html(response.Notification_ID);
		
		//$("#GBL_loading").hide();	
		$('#draggable').modal('show');
		*/
	}
	else{
		/*
		notificationMsg.show({
			message : '<strong>Error Code:</strong>'+response.errorCode+' '+' <strong>Message:</strong> '+response.errorMessage
		}, 'error');
		*/
		var VarFieldText = '<div class="col-md-12 rowpadding rowbold"> Waiting for CCD Response </div>';
		$('#id-fault-details').html(VarFieldText);
		$('#draggable').modal('show');
	}
	
}

function fnViewMoreDetails(){
	
	   //e.preventDefault();
				//var $this = $(this);
				//var $collapse = $this.closest('.collapse-group').find('.collapse');
				if($('#btn-view-more').text()=='View more »'){
					$('#btn-view-more').text('View less »');
				}
				else{
					$('#btn-view-more').text('View more »');
				}
				$('.collapse').collapse('toggle');
}



