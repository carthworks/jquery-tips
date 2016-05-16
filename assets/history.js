$("#startDate, #endDate").kendoDatePicker({format: "dd/MM/yyyy"});

function FnGetAssetsList(){
	var VarUrl = GblAppContextPath+'/ajax' + VarListAssetsUrl;
	var VarMainParam = {
		"domain": {
			"domainName": VarCurrentTenantInfo.tenantDomain
		},	"entityTemplate": {
			"entityTemplateName": "Genset"
		}
	};
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResAssetList);
}
	function FnResAssetList(response){
		var ObjResponse = response;
		var VarResLength = ObjResponse.length;
		var ArrData = [];
		
		var GblTenantInfotenantName = VarCurrentTenantInfo.tenantName;
		GblTenantInfotenantName = GblTenantInfotenantName.toUpperCase();
		ArrData.push({'id':GblTenantInfotenantName,'text':GblTenantInfotenantName});
		if(VarResLength > 0){
			ArrData[0]['items'] = [];
			$.each(ObjResponse,function() {
				var element = {};
				//alert(this.tree.key);
				//alert(this.tree.value)
				/*
				$(this.dataprovider).each(function() {
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
			dataSource: ArrData,
			dataTextField: "text"
		});
	}
	
	// onSelect function call
    function onSelect(e)  {
		FnDefaultInitialGridChart();
		if($("#asset-points option:selected").val()){
			$("#asset-points option:selected").val('');
		}
		if($('#startDate').val()){
			$('#startDate').val('');
		}
		if($('#endDate').val()){
			$('#endDate').val('');
		}
		
		
		
		
		
		var tree = $("#treeview").getKendoTreeView();
		var dataItem = tree.dataItem(e.node);
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
					"entityTemplateName": "Genset"
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

	function FnResArrPointList(response){
		var ArrResponse = response;
		var VarResLength = ArrResponse.length;
		//alert('Array Response Length: = '+ VarResLength);
		if(VarResLength > 0){
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
						/*
						if(key == 'displayName'){ //change to 'displayName'
							 option.text = this.value;
						}
						*/
						if(key == 'dataSourceName'){
							option.value = this.value;
						}
						if(key == 'displayName'){ 
							if(undefined != this.value){
								option.text = this.value;
								select.add(option, 0);	
							 } 
						}
					});
					
				});
				
				var my_options = $("#asset-points option");
				var selected = $("#asset-points").val(); 
				my_options.sort(function(a,b) {
					if (a.text > b.text) return 1;
					else if (a.text < b.text) return -1;
					else return 0
				})

				$("#asset-points").empty().append( my_options );
				$("#asset-points").val(selected); 
				
		}else{
			$('#asset-points')
			.find('option')
			.remove();
			
			notificationMsg.show({
			message : 'No Data Found'
		}, 'error');
		}
}

function FnAssetPointHistory(){
	var VarAssetPoint = $("#asset-points option:selected").val();
	var VarAssetPointText = $("#asset-points option:selected").text();
	var VarDate1 = $('#startDate').val();
	var VarDate2 = $('#endDate').val();
	
	if((typeof VarAssetPoint == 'undefined') || VarAssetPoint =='' || VarAssetPoint =='undefined'){
		notificationMsg.show({
			message : 'Please select a value'
		}, 'error');
	}else{	
		if(VarDate1=='' || VarDate2==''){
			notificationMsg.show({
			message : 'Please select date values'
			}, 'error');
			
		}else{
			
			VarDate1 = VarDate1.split("/");
			var VarDate1Format = VarDate1[1]+"/"+VarDate1[0]+"/"+VarDate1[2];
			//var VarDate1TimeStamp = new Date(VarDate1Format).getTime();
			var VarDate1TimeStamp = FnConvertLocalToUTC(VarDate1Format);

			VarDate2 = VarDate2.split("/");
			var VarDate2Format = VarDate2[1]+"/"+VarDate2[0]+"/"+VarDate2[2];
			//var VarDate2TimeStamp = new Date(VarDate2Format).getTime();
			var VarDate2TimeStamp = FnConvertLocalToUTC(VarDate2Format);


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
		/*	
		//Export to CSV
		$("#btnExport").click(function (e) {
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
				}
				
				else if (window.webkitURL != null) {

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
			   }
				//e.preventDefault();
				return false;
				 
			}else{
				notificationMsg.hide({
					message : 'No items to export!'
				}, 'error');
				notificationMsg.show({
					message : 'No items to export!'
				}, 'error');
				//e.preventDefault();
				return false;
			}
		 });
		 */
}


function ExportToCsvGenset(){
//Export to CSV

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
		}
		
		else if (window.webkitURL != null) {

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
	   }
		//e.preventDefault();
		return false;
		 
	}else{
		notificationMsg.hide({
			message : 'No items to export!'
		}, 'error');
		notificationMsg.show({
			message : 'No items to export!'
		}, 'error');
		//e.preventDefault();
		return false;
	}
		 
}


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
