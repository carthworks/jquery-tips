"use strict";

var editFlag=0;
$(document).ready(function(){
	if(VarDSName != ''){
		webSocketConnect();
	}
	
	$(document).on('click', '#writebackgrid' , function() {
		highlightQueuedRows();
	});

	// call write to device
	$("#writeToDevice").click(function(e){
	             	
	    e.preventDefault();
       	var payload =  writeToDevice();
			                   
                   if (payload.length!=0){             	
	             		   var kendoWindow = $("<div />").kendoWindow({
				            title: "Confirm",
				            height:100,
				            width: 190,
				            resizable: false,
				            modal: true
				        });
				        
				     kendoWindow.data("kendoWindow")
			        .content($("#write-confirmation").html())
			        .center().open();   
				    
				     kendoWindow
			        .find(".write-confirm,.write-cancel")
			            .click(function() {
			                if ($(this).hasClass("write-confirm")) {
			                   writeData(VarSourceId,payload);
			                   
			                }
			                
			                kendoWindow.data("kendoWindow").close();
			            })
			            .end()
				        
	             		
	             	} else {
						notificationMsg.show({
									message : 'No Modified Set points.'
								}, 'error');
								
	             	}
    
	});
	
	$(document).on('keyup', '.numericTextBox', function(event) {
		   var v = this.value;
		   if($.isNumeric(v) === false) {
				//chop off the last char entered
				this.value = this.value.slice(0,-1);
		   }
		   editFlag++;
			
	});

});

// function to take payload and src id and invoke api for writing
function writeData(srcId,payload){
 
 var targetUrl = VarG2021Commands;
 targetUrl = GblAppContextPath+"/ajax" + targetUrl.replace("{source_id}",srcId);
 
 var data;
	$.ajax({
		url : targetUrl,
		dataType : 'json',
		contentType: "application/json; charset=utf-8",
		type : "POST",
		data: JSON.stringify(payload),
		success : function(response) {
			var responseJson = response;
			returnInfoMessage(payload,responseJson);						
		},
		error : function(xhr, status, error) {
			
			
		}
	});
 
}

// function to return response if success or not
function returnInfoMessage(payload,response){
         	        	
	var failedStatus = "<div style='display: inline-block;  font-size: 14px;'><table><tr><th colspan=3>Failure on the following Set Points: </th></tr><tr><th style='width: 120px'>Parameter</th><th style='width: 120px'>Point ID</th><th style='width: 140px'>Remarks</th></tr>"; 
	var successStatus = "<div style='display: inline-block;  font-size: 14px;'><table><tr><th colspan=3>Successfully queued the Set Points: </th></tr><tr><th style='width: 120px'>Parameter</th><th style='width: 120px'>Point ID</th><th style='width: 140px'>Remarks</th></tr>";
			
	var failFlag=0;
	var successFlag=0;
				
	var failedParams = [];
				
	$.each(response.writeBackResponses,function(){
		var status = this.status;
		var command = this.command;
		var remarks = this.remarks;
		var pointId = this.pointId;
		var displayedData = $("#writebackgrid").data().kendoGrid.dataSource.view();
		var dataItem = $("#writebackgrid").data("kendoGrid").dataSource.get(pointId);
						
		
		if (status == "FAILURE"){
			failFlag++;
			//failedStatus = failedStatus + "Failed on <label>Parameter: </label>" + parameter + ". <label>Remarks: </label> " + remarks + " <label>Command: </label> " + command + " </div>";
			failedStatus = failedStatus + "<tr><td>"+dataItem.pointName+"</td><td>"+pointId+"</td><td>"+remarks+"</td></tr>";
			
		}else if (status == "QUEUED"){
		
			updateSuccessValues(this,pointId);
			
			successFlag++;												
			//successStatus = "Successfully queued set point for <label>Parameter: </label> " + parameter + ". <label>Command: </label> " + command + "<br /></div>" ;
			successStatus = successStatus + "<tr><td>"+dataItem.pointName+"</td><td>"+pointId+"</td><td>"+status+"</td></tr>";
		}
					
	});
         	
    failedStatus = failedStatus + "</table></div>"; 
	successStatus = successStatus + "</table></div>"; 
         	
	//failed parameters
	if (successFlag>0){
				   
		notificationMsg.show({
			message : successStatus
		}, 'success');
	}
         	
	//success parameters
	if (failFlag>0){
				   
		notificationMsg.show({
			message : failedStatus
		}, 'error');
	}
         	    
         	    
}

// function update datagrid
function updateSuccessValues(response,pointId){
	 var dataItem = $("#writebackgrid").data("kendoGrid").dataSource.get(pointId);
								 
	 //var type = this.type;
	 var requestedAt = kendo.toString(new Date(response.requestedAt), "G");	         	         
	 var paramVal = "";					 
	 if (typeof dataItem != "undefined"){	
		dataItem.set("value",response.value);
		dataItem.set("lastUpdated",requestedAt);
		dataItem.set("currentPriority",response.customSpecs.priority);
		dataItem.set("status",response.status);
		dataItem.set("requestId",response.requestId);
	 }
	
	highlightQueuedRows();
}

// function to load params for specific id
function loadParams(){
			
	var setPointTemplate = kendo.template($("#setPointTemplate").html()); 
    var setPriorityTemplate = kendo.template($("#priorityTemplate").html());
				
				
	var targetUrl = VarListDeviceConfUrl;
	targetUrl = GblAppContextPath+"/ajax" + targetUrl.replace("{source_id}",VarSourceId);
				
	$("#writebackgrid").kendoGrid({
						templateSettings: {
					    	paramName : "gridData"
					 	},
						//toolbar: kendo.template($("#writeBackSearchTemplate").html()),
						height: 500,
						resizable: true,
						dataSource: {
					        type: "json",
					        transport: {
					            read: {
					            url: targetUrl,
					           	complete: function(){
					           			// disable write button if no data in grid
					           			var grid = $("#writebackgrid").data("kendoGrid");
								    	if (grid.dataSource.data().length === 0) {
								    		 $("#writeToDevice").kendoButton({
										        enable: false
										    }).data("kendoButton");
								    		 $("#rebootButton").prop('disabled', true);
								    	} else {
								    		loadQueuedCommands();
						  					loadLatestData();
									    }                                   

					           		}
					            } 					           
					        },
				            error : function(xhr, status, error) {
							
								notificationMsg.show({
									message : 'No Configurations found'
								}, 'error');
								
								
							},     
							schema: {
									data: function(response) {
										var ObjResponse = JSON.parse(response);	
										
										if(ObjResponse.errorCode == undefined){
											var ArrConfigPoints = ObjResponse.configPoints;
											return ArrConfigPoints;
										} else {
											var errorMessage = ObjResponse.errorMessage;
											notificationMsg.show({
												message : errorMessage
											}, 'error');
										}										
									   
									},
									total: function(response) {
										var ObjResponse = JSON.parse(response);
										if(ObjResponse.errorCode == undefined){
											var ArrConfigPoints = ObjResponse.configPoints;
											return ArrConfigPoints.length;
										} else {
											return 0;
										}
									},
									model: {
										id : 'pointId'
									}
							},
							pageSize: 20,
							page: 1,
							serverPaging: false,
							serverFiltering: false,
							serverSorting: false
// 								        ,
// 								        sort: { field: "sourceId", dir: "asc" }
						},
							//selectable: "row",
							height: 480,
							sortable: {
								mode: "single",
								allowUnsort: true
							},
							filterable : {
								mode : "row",
								extra: false
							},
							pageable: {
								refresh: true,
								pageSizes: true,
								previousNext: true
							},
							columnMenu: false,
							columns: [
							{ field: "pointName", title: "Parameter", width: 50, editable: false, headerTemplate :"<strong style='color:black ;' >Parameter<strong>" },		                            
							{ field: "type", title: "Type", width: 40, editable: false, headerTemplate :"<strong style='color:black ;' >Type<strong>" },
							{ field: "requestId", title: "Type", width: 40, editable: false, headerTemplate :"<strong style='color:black ;' >Request Id<strong>" },
							{ field: "pointAccessType", title: "Point Access Type", width: 50, editable: false, headerTemplate :"<strong style='color:black ;' >Point Access Type<strong>"  },
							{
								title: "Last Updated",
								headerTemplate :"<strong style='color:black ;' >Last Updated<strong>",
								columns : [
									{ field: "currentVal", title: "Type", width: 60, editable: false, headerTemplate :"<strong style='color:black ;' >Current Value<strong>" },
									{ field: "deviceTime", title: "Type", width: 60, editable: false, headerTemplate :"<strong style='color:black ;' >Last Updated<strong>" }	
								]
							},
							
							{
								title: "Last Executed",
								headerTemplate :"<strong style='color:black ;' >Last Executed<strong>",
								columns: [
								{ field: "value", title: "Current Set Point", width: 50, editable: false, headerTemplate :"<strong style='color:black ;' >Current Set Point<strong>"  },
								{ field: "lastUpdated", title: "Requested Time", width: 60 , editable: false, headerTemplate :"<strong style='color:black ;' >Requested Time<strong>" },                          
								{ field: "currentPriority", title: "Current Priority", width: 50, editable: false , headerTemplate :"<strong style='color:black ;' >Current Priority<strong>" }
								]
							},
							
							{
								title: "New Set Point",
								headerTemplate :"<strong style='color:black ;' >New Set Point<strong>",
								columns: [		                            	                          
									{ 
									  field: "newSetPoint",
									  title: "New Set Point", width: 60,
									  template: setPointTemplate,
									  editor: setPointTemplate,
									  editable: true,
									  headerTemplate :"<strong style='color:black ;' >New Set Point<strong>"     
									},
									{ field: "newPriority",
									 title: "New Priority",
									 width: 60,
									 editable: true,
									 template: setPriorityTemplate,
									 editor: setPriorityTemplate,
									 headerTemplate :"<strong style='color:black ;' >New Priority<strong>"     
									  }
								]
							}
		                            
							]
						
					}).data("kendoGrid");
				
					                                      
                   
                   $("#searchIdWriteBack").keyup(function () {                   
	                var val = $("#searchIdWriteBack").val();
	                $("#writebackgrid").data("kendoGrid").dataSource.filter({
	                    logic: "or",
	                    filters: [
	                    	{
	                            field: "pointName",
	                            operator: "contains",
	                            value: val
	                        },
	                        {
	                            field: "pointName",
	                            operator: "contains",
	                            value: val
	                        },
	                        {
	                            field: "type",
	                            operator: "contains",
	                            value: val
	                        },
	                        {
	                            field: "value",
	                            operator: "contains",
	                            value:val
	                        },
	                        {
	                            field: "currentPriority",
	                            operator: "contains",
	                            value:val
	                        },
	                        {
	                            field: "lastUpdated",
	                            operator: "contains",
	                            value:val
	                        },
	                        {
	                            field: "pointAccessType",
	                            operator: "contains",
	                            value:val
	                        }
	                    ]
	                });
 
 					highlightQueuedRows();
            	});
            	
                    highlightQueuedRows();		
}            
loadParams();
			 
function highlightQueuedRows(){
	$("#writebackgrid input:disabled").closest('tr').css("background-color","#B2FFB2");
	$("#writebackgrid").find("td:contains('READONLY')").closest('tr').css("background-color","rgb(195, 195, 195)");		 
}
			 
var queuedCmds = []; 
// function to load queued commands for specific id
function loadQueuedCommands(){
	
	var targetUrl = VarQueuedCommandsUrl;
	targetUrl = GblAppContextPath+"/ajax" + targetUrl.replace("{source_id}",VarSourceId);
				
	var data;
	$.ajax({
		url : targetUrl,
		dataType : 'json',
		type : "GET",
		async: false,
		success : function(response) {
			
			if(response.errorCode == undefined){
				updateQueuedCommands(response);
			}
					
		},
		error : function(xhr, status, error) {
			//console.log("no configuration");						
			highlightQueuedRows();																					
		}
	});
	
	return data;
}

// function to update queued commands
 function updateQueuedCommands(data){

	 $.each(data,function(){
		var pointId = this.pointId;
		var dataItem = $("#writebackgrid").data("kendoGrid").dataSource.get(pointId);
		var value = this.value;
		var requestedAt = kendo.toString(new Date(this.requestedAt), "G");
		var status = this.status;
		var customSpecs = this.customSpecsJSON;
		var reqId = this.requestId;
		var priority = JSON.parse(customSpecs).priority;
		
		if (typeof dataItem != "undefined"){
			dataItem.set("value",value);
			dataItem.set("lastUpdated",requestedAt);
			dataItem.set("currentPriority",priority);
			dataItem.set("status",status);
			dataItem.set("requestId",reqId);
		}
		
	 });
	highlightQueuedRows();
 
 }

// function to get latest data of a datasourceId
function loadLatestData(){
	
	var targetUrl = VarLatestDeviceDataUrl;
	targetUrl = GblAppContextPath+"/ajax" + targetUrl.replace("{source_id}",VarSourceId);
				
	var data;
	$.ajax({
		url : targetUrl,
		dataType : 'json',
		type : "GET",
		success : function(response) {
			if(response.errorCode == undefined) {
				updateLatestData(response);
			}		
		},
		error : function(xhr, status, error) {
			//console.log("no configuration");						
			highlightQueuedRows();																					
		}
	});
	
	return data;
}

// function to update latest data in grid
 function updateLatestData(data){
	
	var gview = $("#writebackgrid").data("kendoGrid");		         	
	var gridData = gview.dataSource.data();
	 $.each(data.entity,function(){		         	
		// Find those records that have requestId
		// and return them in `res` array
		var pointName = this.customTag;				
		var res = $.grep(gridData, function (d) {
		
		return d.displayName == pointName;
		  
		});
		
		//console.log(JSON.stringify(res));
		if(res !=undefined){
			var dataItem =gview.dataSource.get(res[0].id);
			dataItem.set("currentVal",this.data);
			dataItem.set("deviceTime",kendo.toString(new Date(this.deviceTime), "G"));
		}	
	
	 });

	highlightQueuedRows();
 
}

// function write to device
function writeToDevice(){
             	
    //get elements from parameter until the last edited column
	var displayedData = $("#writebackgrid").data().kendoGrid.dataSource.view();
    var displayedDataAsJSON = JSON.stringify(displayedData);
             	
    //used to get the html element input type in each row
    var grid = $("#writebackgrid").data("kendoGrid");
    var count = grid.dataSource.total();
         
				var payload = [];
				
				// build payload	
				$.each(displayedData,function(){
				//console.log("//displayedData: " + JSON.stringify(displayedData));
				
					if (this.hasOwnProperty("pointAccessType")){
					
						if (this.pointAccessType=="WRITEABLE"){
												
							var parameter = this.displayName;
							var pointId = this.pointId;
							var type = this.type.toUpperCase();
							
							var paramVal = "";
							var priority = $('#writebackgrid').find('#priorityVal_'+pointId).val();
							
							if (type == 'BOOLEAN'){
								
								paramVal = $('input[name="booleanVal_'+pointId+'"]:checked').val();
														
								if (typeof paramVal =="undefined"){
									paramVal = "";
								}
							
							}else if (type == "LONG" ||type == "FLOAT" || type == "NUMBER" || type=="INTEGER"){
								paramVal = $('#writebackgrid').find('#numVal_'+pointId).val();
							
							}else if(type == "STRING"){
								paramVal = $('#writebackgrid').find('#stringVal_'+pointId).val();
							
							}
																				
							// if no value has been entered - exclude in the update
							if (paramVal != "" || priority != ""){										
								payload.push({
									"command" : "0x22",
									"pointId": pointId,
									"value": paramVal,
									"customSpecs" : {
										"priority": priority
									}					
								});					
							}
						
						}
						
					
					}
				
					
				}); // end of building payload
				
				return payload;
             }

function FnPromptReboot(){
	if (confirm('Device will get reboot. Do you wish to continue?')) {
		FnExecuteServerCommands('Reboot');
	} else {
		// Do nothing!
	}
}

function FnExecuteServerCommands(commandRequest){
				
	var VarUrl = VarG2021Commands;
	VarUrl = GblAppContextPath+"/ajax" + VarUrl.replace("{source_id}",VarSourceId);
						
	var payload = [{
		"command" : "0x20",    		
		"customSpecs" : {
			"commandCode": commandRequest
		}
	}];
			        
	$.ajax({
		url : VarUrl,
		dataType : 'json',
		contentType: "application/json; charset=utf-8",
		type : "POST",
		data: JSON.stringify(payload),
		success : function(response) {
						
			$.each(response.writeBackResponses, function (){
				var status = this.status;
				var remarks="";
				if (status == 'FAILURE'){
					remarks = this.remarks;
					var errorMessage =commandRequest+" Failed on Source Id " + response.sourceId + ". " + remarks + ".";
					
					notificationMsg.show({
						message : errorMessage
					}, 'error');
										
				} else {
					var errorMessage =commandRequest+" on Source Id"+response.sourceId+" is now successfully queued.";
					
					notificationMsg.show({
						message : errorMessage
					}, 'error');
					
				}
				
			});
									
		},
		error : function(xhr, status, error) {
			var errorMessage = commandRequest+" on Source Id"+response.sourceId+" is now successfully queued."
			notificationMsg.show({
				message : errorMessage
			}, 'error');
					
		}
	});
				
}

function FnNavigateDeviceList(){
	editFlag=0;
	
	$("#writebackgrid .strVal, .numericTextBox").each(function() {
    				
		if($(this).val()!=""){
			editFlag++;
		}
	});
	
	$("#writebackgrid .boolVal").each(function() {

		if($(this).is(':checked')){
			editFlag++;
		}
	});
	
	if (editFlag>0){
	
		var kendoWindow = $("<div />").kendoWindow({
				            title: "Confirm",
				            height:100,
				            width: 190,
				            resizable: false,
				            modal: true
				        });
						
		kendoWindow.data("kendoWindow").content($("#write-confirmation").html()).center().open(); 
		
		kendoWindow.find(".write-confirm,.write-cancel").click(function() {
			                if ($(this).hasClass("write-confirm")) {			                	
			                	$('#gapp-device-list').submit();		                	
			                } else {
								kendoWindow.data("kendoWindow").close();
							}
			            }).end();
	
	} else {
		$('#gapp-device-list').submit();
	}
	
}

// function to handle data change from websocket 
var handleMessage = function(message) {
	console.log('live data----------------');
	console.log(JSON.stringify(message));
	var VarTime = message.timestamp;
	var content = message.body[0];
	var data = $.parseJSON(content);
	updateGridStatusFromWS(data,VarTime);			
};


// function to update data row in grid from websocket response after success/fail
function updateGridStatusFromWS(data,VarTime){
	var requestedTime = kendo.toString(new Date(VarTime), "G");
	var status = data.status;
	var reqId = data.requestId;

	if (data.hasOwnProperty('remarks')){
		var remarks = data.remarks;
	}
				
	var grid =$("#writebackgrid").data("kendoGrid");
	var data = grid.dataSource.data();
	// Find those records that have requestId
	// and return them in `res` array
	var res = $.grep(data, function (d) {
		return d.requestId == reqId;
	});

	if(res !=undefined){
		var dataItem =grid.dataSource.get(res[0].id);
		
		dataItem.set("lastUpdated",requestedTime);
		dataItem.set("status",status);
		
		if (status.toUpperCase() == "SUCCESS"){
		
			notificationMsg.show({
				message : "Parameter <strong>" + dataItem.pointName + "</strong> has been updated successfully."
			}, 'success');
				   
		} else if (status.toUpperCase() == "FAILURE"){
		
			notificationMsg.show({
				message : "Failed to update parameter <strong>" + dataItem.pointName + "</strong>. " + remarks
			}, 'error');
		
		}
	}
	//console.log(test);
	highlightQueuedRows();
}