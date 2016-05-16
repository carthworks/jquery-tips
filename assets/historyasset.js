//$("#startDate, #endDate").kendoDatePicker({format: "dd/MM/yyyy"});
$(document).ready(function() {
	$('#asset-points').css('color', '#999');
	
	$( '#asset-points').prop( "disabled", true ); //Disable
	
	function startChange() {
		var startDate = start.value(),
		endDate = end.value();
		
		if (startDate) {
			startDate = new Date(startDate);
			startDate.setDate(startDate.getDate());
			end.min(startDate);
		} else if (endDate) {
			start.max(new Date(endDate));
		} else {
			endDate = new Date();
			start.max(endDate);
			end.min(endDate);
		}
	}
	function endChange() {
		var endDate = end.value(),
		startDate = start.value();
		
		if (endDate) {
			endDate = new Date(endDate);
			endDate.setDate(endDate.getDate());
			start.max(endDate);
		} else if (startDate) {
			end.min(new Date(startDate));
		} else {
			endDate = new Date();
			start.max(endDate);
			end.min(endDate);
		}
	}
	
	var start = $("#startDate").kendoDatePicker({
		change: startChange,
		format: "dd/MM/yyyy"
	}).data("kendoDatePicker");

	var end = $("#endDate").kendoDatePicker({
		change: endChange,
		format: "dd/MM/yyyy"
	}).data("kendoDatePicker");

	var VarDateToday = FnGetTodaysDate();// Todays date
    var VarDateAddDays = FnAddDaysToDate(1);
	var VarDateSubDays = FnSubtractDaysToDate(7);
	//start.max(end.value());
	
	$('#startDate').mask("00/00/0000", {placeholder: "DD/MM/YYYY"});
	$('#endDate').mask("00/00/0000", {placeholder: "DD/MM/YYYY"});
	//$("#startDate").val(VarDateSubDays);
	$("#startDate").val(VarDateToday);
	$("#endDate").val(VarDateToday);
	
	start.max(VarDateToday);
	end.min(start.value());
	end.max(VarDateToday);
	
	/*
	$("#startDate").prop('disabled', true);
	$("#endDate").prop('disabled', true);
	$("#startDate").val(VarDateSubDays);
	$("#endDate").val(VarDateToday);
	$('#startDate').mask("00/00/0000", {placeholder: "__/__/____"});
	$('#endDate').mask("00/00/0000", {placeholder: "__/__/____"});
	*/
});

	function FnGetAssetsList(){
		var VarUrl = GblAppContextPath+'/ajax' + VarListAssetsUrl;
		var VarMainParam = {
			"domain": {
				"domainName": VarCurrentTenantInfo.tenantDomain
			},	"entityTemplate": {
				"entityTemplateName": "Asset"
			}
		};
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResAssetList);
	}
	function FnResAssetList(response){
		var ObjResponse = response;
		var VarResLength = ObjResponse.length;
		var ArrData = [];
		ArrData.push({'id':VarCurrentTenantInfo.tenantId,'text':(VarCurrentTenantInfo.tenantName).toUpperCase()});
		if(VarResLength > 0){
			ArrData[0]['items'] = [];
			$.each(ObjResponse,function() {
				
				//alert(this.dataprovider[1].value);
				var element = {};
				/*$(this.dataprovider).each(function() {
					var key = this.key;
					//if(key == 'gensetSerialNumber'){
					if(key == 'assetName'){
						element['id'] = this.value;
						element['text'] = this.value;
					}				
				});*/
				element['id'] = this.tree.value;
				element['text'] = this.tree.value;
				element['entity'] = {};
				element['entity']['globalEntity'] = this.globalEntity;
				element['entity']['domain'] = this.domain;
				element['entity']['entityTemplate'] = {"entityTemplateName":this.entityTemplate.entityTemplateName};
				element['entity']['identifier'] = this.identifier;
				ArrData[0]['items'].push(element);
			});		
		}
		
		$("#treeview").kendoTreeView({
			select: onSelect,
			dataSource: ArrData
		});
		
		var treeview = $("#treeview");
		var kendoTreeView = treeview.data("kendoTreeView");
		treeview.on("click", ".k-top.k-bot span.k-in", function(e) {
			kendoTreeView.toggle($(e.target).closest(".k-item"));
		});	
		kendoTreeView.expand(".k-item");
	}
	
	// onSelect function call
    function onSelect(e)  {
		var tree = $("#treeview").getKendoTreeView();
		var dataItem = tree.dataItem(e.node);
				
		if(undefined != dataItem.entity || typeof dataItem.entity !== "undefined"){	
			$("#GBL_loading").show();
			
			FnDefaultInitialGridChart();
			
			/*if($("#asset-points option:selected").val()){
				$("#asset-points option:selected").val('');
			}*/
			if($('#startDate').val()){
				//$('#startDate').val('');
			}
			if($('#endDate').val()){
				//$('#endDate').val('');
			}
			/*
			var VarDateToday = FnGetTodaysDate();// Todays date
			var VarDateSubDays = FnSubtractDaysToDate(7);
			$("#startDate").val(VarDateSubDays);
			$("#endDate").val(VarDateToday);
			*/
			var VarDomainName = VarCurrentTenantInfo.tenantDomain;
			var VarIdentifier = dataItem.entity.identifier.value;
			//VarDomainName = "srsinfotech.pcs.alpine.com";
			//var VarIdentifier = "50a34e91-068c-4115-a7c9-a3bd3fedfd83";
			var VarUrl = GblAppContextPath+'/ajax' + VarAssetsPointsUrl;
			var VarMainParam = {
				"actor": {
					"globalEntity": {
						"globalEntityType": "MARKER"
					},
					"domain": {
						"domainName": VarDomainName
					},
					"entityTemplate": {
						"entityTemplateName": "Asset"
					},
					"identifier": {
						"key": "identifier",
						"value": VarIdentifier
					}
				},
				"searchTemplateName": "Point",
				"searchEntityType": "MARKER"
			};
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResArrPointList);	
		}
    }

	function FnResArrPointList(response){
		$("#GBL_loading").hide();
		var ArrResponse = response;
		var VarResLength = ArrResponse.length;
		
		if(VarResLength > 0){
			$('#asset-points').css('color', '#000');
			$( '#asset-points').prop( "disabled", false ); //Enable
			//
			$('#asset-points')
		    .find('option')
		    .remove();
			var select = document.getElementById("asset-points");
			
			$.each(response,function() {
				var option = document.createElement('option');
				//option.text =  option.value = "";
				// select.add(option, 0);	
				
				$(this.dataprovider).each(function() {
					var key = this.key;
					/*if(key == 'displayName'){ //change to 'displayName'
						 option.text = this.value;
					}*/
					//option.style="color: #000; background: #F1F1F1"; 
					
					if(key == 'dataSourceName'){
						option.value = this.value;
					}
					if(key == 'displayName'){ 
						if(undefined != this.value){
							option.text = this.value;
							select.add(option,null);	
						} 
					}
				});				
			});
				
			var my_options = $("#asset-points option");
			var selected = $("#asset-points").val(); 
			my_options.sort(function(a,b) {
				if (a.text > b.text && a.value!="") return 1;
				else if (a.text < b.text && a.value!="") return -1;
				else return 0
			})
			
			$('#asset-points').empty().append($('<option>', {
				value: '',
				text: 'Choose a point',
				selected:'selected'
			}));
			
			/*var option1 = document.createElement('option');
			option1.text = 'Choose a point';
			option1.value = "";
			select.add(option1,0);
			
			$("#asset-points").empty().append( my_options );
			$("#asset-points").val(selected);*/
			
			$("#asset-points").append(my_options);
			$("#asset-points").val(''); 
				
		}else{
			$('#asset-points')
			.find('option')
			.remove();
			
			$('#asset-points').empty().append($('<option>', {
				value: '',
				text: 'No Data',
				selected:'selected'
			}));
			$('#asset-points').css('color','#999');
			$('#asset-points').prop("disabled", true); 
			
			notificationMsg.show({
				message : 'No Data Found'
			}, 'error');
		}
	}
	
	function fnChangePoints(){
		$('#asset-points').find('option').css('background-color', 'transparent');
        $('#asset-points').find('option:selected').css('background-color', '#26a69a');
		$('#asset-points').find('option:hover').css('background-color', '#EFEEEE');
		$("#GBL_loading").show();
		FnDefaultInitialGridChart();
		setTimeout(function(){
			$("#GBL_loading").hide();
		}, 100);
		
		/*if($('#startDate').val()){
			$('#startDate').val('');
		}
		if($('#endDate').val()){
			$('#endDate').val('');
		}*/
	}

function FnAssetPointHistory(){
	FnDefaultInitialGridChart();
	
	var VarAssetPoint 	  = $("#asset-points option:selected").val();
	var VarAssetPointText = $("#asset-points option:selected").text();
	var VarDate1          = $('#startDate').val();
	var VarDate2          = $('#endDate').val();
	
	var VarDate1Check  	  = isValidDate(VarDate1);
	var VarDate2Check  	  = isValidDate(VarDate2);
	
	if((typeof VarAssetPoint == 'undefined') || VarAssetPoint =='' || VarAssetPoint =='undefined'){
		notificationMsg.show({
			message : 'Please choose a point'
		}, 'error');
	}else{	
		if(VarDate1=='' || VarDate2==''){
			notificationMsg.show({
				message : 'Please select dates'
			}, 'error');
			
		}else if(!VarDate1Check || !VarDate2Check){
			notificationMsg.show({
				message : 'Invalid Date'
			}, 'error');
			
			if(!VarDate1Check)  $('#startDate').val('');
			if(!VarDate2Check)  $('#endDate').val('');
		}
		else{
			
			$("#GBL_loading").show();
			
			VarDate1 = VarDate1.split("/");
			var VarDate1Format = VarDate1[1]+"/"+VarDate1[0]+"/"+VarDate1[2];
			//var VarDate1TimeStamp = new Date(VarDate1Format).getTime();
			var VarDate1TimeStamp = FnConvertLocalToUTC(VarDate1Format);
			
			VarDate2 = VarDate2.split("/");
			var VarDate2Format = VarDate2[1]+"/"+VarDate2[0]+"/"+VarDate2[2];
			//var VarDate2TimeStamp = new Date(VarDate2Format).getTime();
			//var VarDate2TimeStamp = FnConvertLocalToUTCTime(VarDate2Format);
			var VarDate2TimeStamp = FnConvertLocalToUTCTime(VarDate2Format);
			
			var VarUrl = GblAppContextPath+'/ajax' + VarAssetsHistoryUrl;
			var VarSourceId = VarAssetPoint;
			var VarcustomTags = VarAssetPointText;
			VarStartDate = VarDate1TimeStamp;
			VarEndDate  = VarDate2TimeStamp;	
			/*
			VarSourceId = "sayirdevice2001";
			VarStartDate = 1446336000000;
			VarEndDate = 1456496312074;
			VarcustomTags = "Angle";
			*/
			var VarMainParam = {
			  "sourceId": VarSourceId,
			  "startDate": VarStartDate,
			  "endDate": VarEndDate,
			  "customTags": [
				VarcustomTags
			  ]
			};
			
			FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResAssetPointHistory);
		}	
	}
}

function FnResAssetPointHistory(response){
	
	$("#btnExport").attr("disabled", false);
	var ArrResponseData = [];
	$.each(response,function(key,obj) {
		if(key == 'customTags'){
			$.each(obj,function(key,obj2){
				$.each(obj2,function(key,obj3){
					if(key == 'values'){
						$.each(obj3,function(key,obj4){
							var element = {};
							//console.log("deviceTime ="+obj4.deviceTime);
							//console.log("data ="+obj4.data);
							element["deviceTime"] = obj4.deviceTime;
							element["dataValue"] = obj4.data;
							ArrResponseData.push(element);
					   });
					}
				});
			});
		}		
	});	
	//console.log('Response Data');
	//console.log(ArrResponseData);
	
	$("#GBL_loading").hide();
	
	//Draw Grid
	var ArrColumns123 = [{field: "deviceTime",title: "Timestamp", template : "#: toDateFormat(deviceTime, 'F')#"},{field: "dataValue",title: "Data"}];
	var ObjGridConfig123 = {
		"scrollable" : false,
		/*"filterable" : { mode : "row" },*/
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: true },
		"selectable" : true
	 };
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-assetshistory-list',ArrResponseData,ArrColumns123,ObjGridConfig123);
	
	var sdate = $('#startDate').val();
	var ddate = $('#endDate').val();
	var ptext = $("#asset-points option:selected").text();
	
	//Draw Chart
	$("#gapp-assetshistory-chart").kendoChart({
		dataSource: ArrResponseData,
			 title: {
				position: "bottom",
				text: 'Date Range: ' + sdate +' to '+ ddate
			},
			seriesDefaults: {
				type: "line",
				area: {
					line: {
						style: "smooth"
					}
				}
			},
			series: [{
				field: "dataValue",
				color: "#1f897f"
			  }],
			valueAxis: {
				labels: {
					//format: "{0}%"
				},
				line: {
					visible: false
				},
				title: {
					text: ptext
				},
				axisCrossingValue: -10
			},
			categoryAxis: {
				field: "",
				visible: true,
				majorGridLines: {
					visible: false
				},
				title: {
					text: "Time",
					visible: true,
				},
				/*
				labels: {
					rotation: "auto"
				}*/
				labels: {
					rotation: -45,
					template: "#= toDateFormatChart(value, 'd')#"
					
				}
			},
			tooltip: {
				visible: true,
				format: "{0}%",
				template: "#= toDateFormat(dataItem.deviceTime, 'F') #: (#= value #)"
				
				 
			}
	});
			 
}

function ExportToCsvAsset(){
//Export to CSV
	$("#GBL_loading").show();
	
	var VarAssetName ="";
	var VarPointName ="";
	var VarCsvName ="";
	
	VarAssetName = $("span.k-in.k-state-selected").text();
	VarPointName = $("#asset-points option:selected").text();
	VarCsvName = VarAssetName+'.'+VarPointName;
	
	 var dataSource = $("#gapp-assetshistory-list").data("kendoGrid").dataSource;
	 var filteredDataSource = new kendo.data.DataSource({
		 data: dataSource.data(),
		 filter: dataSource.filter()
	 });

	 filteredDataSource.read();
	 var data = filteredDataSource.view();
		
	if(data.length >0){
		
		$("#GBL_loading").hide(); 
		var result = "\"Timestamp\",\"Value\"";
		var formatDate;
		//each column will need to be called using the field name in the data source
		for (var i = 0; i < data.length; i++) {
			result += "\n";
			formatDate = toDateFormat(data[i].deviceTime, 'F');
			formatDate = formatDate.replace (/,/g, "");
			result += "\"" + formatDate + "\",";
			result += "\"" + data[i].dataValue + "\",";
		} 
				 
		if (window.navigator.msSaveBlob) {
			//Internet Explorer
			window.navigator.msSaveBlob(new Blob([result]), VarCsvName+'.csv');
			
		}else{
		   //Google Chrome and Mozilla Firefox
		   var a = document.createElement('a');
		   result = encodeURIComponent(result);
		   a.href = 'data:application/csv;charset=UTF-8,' + result;
		   a.download = VarCsvName+'.csv';
		   document.body.appendChild(a);
		   a.click();
		   document.body.removeChild(a);
		}   
		/*else if (window.webkitURL != null) {
		   //Google Chrome and Mozilla Firefox
		   var a = document.createElement('a');
		   result = encodeURIComponent(result);
		   a.href = 'data:application/csv;charset=UTF-8,' + result;
		   a.download = VarCsvName+'.csv';
		   a.click();
	   }
	   else {
		   //Everything Else
		   window.open(result);
	   }*/
	   
		//e.preventDefault();
		return false;
		 
	} else{
		
		$("#GBL_loading").hide(); 
		notificationMsg.hide({
			message : 'No data to export!'
		}, 'error');
		notificationMsg.show({
			message : 'No data to export!'
		}, 'error');
		
		//e.preventDefault();
		return false;
	}		
}

/*-------------------------------------------------------*/

function FnDefaultInitialGridChart(){
	
	/*Draw Initial Default Grid*/
	var ArrResponseData = [];
	var ArrColumns123 = [{field: "deviceTime",title: "Timestamp", template : "#: toDateFormat(deviceTime, 'F')#"},{field: "dataValue",title: "Data"}];
	var ObjGridConfig123 = {
		"scrollable" : false,
		"sortable" : true,
		"height" : 0,
		"pageable" : { pageSize: 10,numeric: true,pageSizes: true,refresh: true },
		"selectable" : true
	};
	$(".k-grid-content").mCustomScrollbar('destroy');
	FnDrawGridView('#gapp-assetshistory-list',ArrResponseData,ArrColumns123,ObjGridConfig123);
	
	/*Draw Initial Default Chart*/
	$("#gapp-assetshistory-chart").kendoChart({
		title: {
			/*text: "No Data"*/
		},
		legend: {
			position: "bottom"
		},
		chartArea: {
			background: ""
		},
		seriesDefaults: {
			type: "line",
			style: "smooth"
		},
		series: [],
		valueAxis: {
			title: {
        text: "Value"
		},
			line: {
				visible: false
			},
			axisCrossingValue: -10
		},
		categoryAxis: {
		   title: {
        text: "Time"
		},
			majorGridLines: {
				visible: false
			},
			labels: {
				rotation: "auto"
			}
		}
	});
}

/*-------------------------------------------------------*/

function FnGetTodaysDate(){
	var today = new Date();
	//var today = new Date('Thu Mar 31 2016 09:05:20 GMT+0400 (Arabian Standard Time)');
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	
	if(dd<10) {
		dd='0'+dd
	} 
	if(mm<10) {
		mm='0'+mm
	} 
	today = dd+'/'+mm+'/'+yyyy;
	return today;
}

function FnAddDaysToDate(numberOfdaysToAdd){
	var someDate = new Date();
	//var someDate = new Date('Thu Mar 31 2016 09:05:20 GMT+0400 (Arabian Standard Time)');
	//var numberOfDaysToAdd = 1;
	someDate.setDate(someDate.getDate() + parseInt(numberOfdaysToAdd)); 
	
	//Formatting to dd/mm/yyyy :
	var dd = someDate.getDate();
	var mm = someDate.getMonth() + 1;
	var yyyy = someDate.getFullYear();
	
	if(dd<10) {
		dd='0'+dd
	} 
	if(mm<10) {
		mm='0'+mm
	} 
	var someFormattedDate = dd+'/'+mm+'/'+ yyyy;
	return someFormattedDate;
}

function FnSubtractDaysToDate(numberOfdaysToSubtract){
	var someDate = new Date();
	//var someDate = new Date('Thu Mar 31 2016 09:05:20 GMT+0400 (Arabian Standard Time)');
	//var numberOfdaysToSubtract = 1;
	someDate.setDate(someDate.getDate() - parseInt(numberOfdaysToSubtract)); 
	
	//Formatting to dd/mm/yyyy :
	var dd = someDate.getDate();
	var mm = someDate.getMonth() + 1;
	var yyyy = someDate.getFullYear();
	
	if(dd<10) {
		dd='0'+dd
	} 
	if(mm<10) {
		mm='0'+mm
	} 
	var someFormattedDate = dd+'/'+mm+'/'+ yyyy;
	return someFormattedDate;
}

 function isValidDate(text){
	//var text = '29/02/2011';
	var comp = text.split('/');
	var d = parseInt(comp[0], 10);
	var m = parseInt(comp[1], 10);
	var y = parseInt(comp[2], 10);
	var date = new Date(y,m-1,d);
	if (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d) {
		return true;
	} else {
		return false;
	}
 }  
 
/*-------------------------------------------------------*/
