	"use strict";
	
	//Definition & Response: Get Unclaimed Devices Count
	function FnGetUnclaimedDevicesCount(){
		var VarUrl = GblAppContextPath+'/ajax' + VarUnclaimedDeviceListUrl;
		//FnMakeAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResUnclaimedDevicesCount);
		FnMakeAsyncAjaxRequest(VarUrl, 'GET', '', 'application/json; charset=utf-8', 'json', FnResUnclaimedDevicesCount);
	}
	function FnResUnclaimedDevicesCount(response){
		if (response.length != null) {
			$('#unclaimedDevicesCount').html(response.length);
			/*$(".dc_home_tenantcnt").wrap( "<a href='tenant_home'></a>" );*/
		} else {
			$('#unclaimedDevicesCount').text(0);
		}	
	}
	
	//Definition & Response: Get Devices Count
	function FnGetDevicesCount(){
	    var VarUrl = GblAppContextPath+'/ajax' + VarDevicesCountUrl;
		VarUrl 	   = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
		var VarMainParam	=	{
				"entityTemplate": {
					"entityTemplateName": "Device"
				},
				"domain": {
					"domainName": VarCurrentTenantInfo.tenantDomain
				}
			};
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResDevicesCount);
	}
	function FnResDevicesCount(response){
		if (response.count != null) {
			$('#usersCount').html(response.count);
			/*$(".dc_home_tenantcnt").wrap( "<a href='tenant_home'></a>" );*/
		} else {
			$('#usersCount').text(0);
		}
	}
	
	//Definition & Response: Get Active Devices Count
	function FnGetActiveDevicesCount(){
	    var VarUrl = GblAppContextPath+'/ajax' + VarActiveDevicesCountUrl;
		VarUrl 	   = VarUrl.replace("{domain}",VarCurrentTenantInfo.tenantDomain);
		var VarMainParam	=	{
				"entityTemplate": {
					"entityTemplateName": "Device"
				},
				"domain": {
					"domainName": VarCurrentTenantInfo.tenantDomain
				},
				"statusName": "ACTIVE"
			};
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResActiveDevicesCount);
	}
	function FnResActiveDevicesCount(response){
		if (response.count != null) {
			$('#devicesCount').html(response.count);
			/*$(".dc_home_tenantcnt").wrap( "<a href='tenant_home'></a>" );*/
		} else {
			$('#devicesCount').text(0);
		}
	}
	
	//Definition & Response: Get Clients List
	function FnGetClientList(){
		var VarUrl = GblAppContextPath+'/ajax' + VarListingClientsUrl;
		//alert("4 = "+VarUrl);
		var VarMainParam = {
			"domain": {
				"domainName": VarCurrentTenantInfo.tenantDomain
			}
		};
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResClientList);	
	}
	function FnResClientList(response){
		var VarTenantLength = (response).length;
		if(VarTenantLength>0){
			var VarClientTxt = '';
			var ArrClientList = [];
			var ArrTenantList = [];
			$.each(response,function(key,obj){
				var ObjIdentifierInfo = obj.identifier;
				//var VarTenantName = FnGetTenantName(obj.dataprovider);
				var VarTenantInfo = FnGetTenantInfo(obj.dataprovider);		
				//console.log(VarTenantInfo.tenantId);
				//console.log(VarTenantInfo.tenantName);
				
				VarClientTxt += "<li><a href='Javascript:void(0)' onclick='FnGetClientInfo(\""+VarTenantInfo.tenantId+"\",\""+VarTenantInfo.tenantName+"\",this)'>"+ObjIdentifierInfo.value+"</a></li>";
				//ArrClientList.push({"name":ObjIdentifierInfo.value,"domain":VarTenantDomainName});
				//ArrTenantList.push({"name":ObjIdentifierInfo.value,"tenantName":VarTenantName});
				ArrTenantList.push({"name":ObjIdentifierInfo.value,"tenantId":VarTenantInfo.tenantId,"tenantName":VarTenantInfo.tenantName});
			});
			$('#clientlist').html(VarClientTxt);
			
			$(".clientlistblock").mCustomScrollbar({
				setWidth: false,
				setHeight: false,
				setTop: 0,
				setLeft: 0,
				axis: "y",
				scrollbarPosition: "inside",
				autoExpandScrollbar: true,
				alwaysShowScrollbar: 0,
				live: "on",
				autoHideScrollbar:true,
				theme: "minimal-dark"
			});
			/*var VarClientId = ArrClientList[0]['domain'];*/
			var VarTenantName = ArrTenantList[0]['tenantName'];
			var VarTenantId = ArrTenantList[0]['tenantId'];
			$('#clientlist li:first').addClass('active').addClass('right-arrow');
			$('#tenant_name').text(VarTenantName);
			//FnGetDeviceUsageList(ArrClientList);
			FnGetClientDeviceStatus(VarTenantId);
			
		} 	else {	
			$('#clientlist').html("No Tenant List");	
		}
	}
	
	function FnGetClientInfo(VarTenantId,VarTenantName,VarThis){
		$("#GBL_loading").appendTo('.clientlistToggle').show();
		$('#tenant_name').text(VarTenantName);
		$('#clientlist li').removeClass('active').removeClass('right-arrow');
		$(VarThis).parent('li').addClass('active').addClass('right-arrow');
		//$('#tenant_name').text($(VarThis).text());
		
		//FnGetClientDeviceStatus(VarTenantName);
		FnGetClientDeviceStatus(VarTenantId);
	}
	
	function FnGetClientDeviceStatus(VarTenantId){
		var VarUrl = GblAppContextPath+'/ajax' + VarTenantsDeviceListUrl;
		var VarMainParam = {
			"domain": {
				"domainName": VarCurrentTenantInfo.tenantDomain
			},
			"entityTemplate": {
				"entityTemplateName": "DefaultTenant"
			},
			"globalEntity": {
				"globalEntityType": "TENANT"
			},
			"identifier": {
				"key": "tenantId",
				"value":VarTenantId
			}
		};
		FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResClientDeviceStatus);
	}
	function FnResClientDeviceStatus(response){
		var VarTenantLength = (response).length;
		if(VarTenantLength>0 && (VarTenantLength !='undefined')){
			var VarTotalCnt = VarTenantLength;
			var VarActiveCnt = 0;
			var VarInactiveCnt = 0;
			var VarActivePercnt = 0;
			var VarDeviceStatus ='';
			
			var ArrResponse = [];
			var VarTcpNwkCnt = 0;
			var VarUdpNwkCnt = 0;
			var VarTotalNwkCnt = 0;
			
			var VarDeciceTypes = [];
			$.each(response,function(key,obj){
				VarDeviceStatus = obj.entityStatus.statusName;
				// Calculations for Active Inactive Count
				if(VarDeviceStatus == 'ACTIVE'){
					VarActiveCnt += 1;
				} else {
					VarInactiveCnt += 1;
				}
				//Calculations for Network Protocol Count/ Device count
				$.each(obj.dataprovider,function(key,obj2){
					if(obj2.key == 'networkProtocol'){
						//alert(obj2.value); 
						if(obj2.value == 'TCP'){
							VarTcpNwkCnt +=1;
						}
						if(obj2.value == 'UDP'){
							VarUdpNwkCnt +=1;
						}
						VarTotalNwkCnt +=1;
					}
					
					if(obj2.key == 'model'){
						VarDeciceTypes.push(obj2.value);
					}
				});	
			});
		
			VarActivePercnt = (parseInt(VarActiveCnt)/parseInt(VarTotalCnt))*100;
			VarActivePercnt = parseInt(VarActivePercnt);
			$('#fillgauge1').html('');
			setTimeout(function () {
				loadLiquidFillGauge("fillgauge1",VarActivePercnt);	
			}, 200);
			
			$('#devicetotalcnt').html(VarTotalCnt);
			$('#deviceactivecnt').html(VarActiveCnt);
			ArrResponse.push({"statusName": "TCP", "count":VarTcpNwkCnt},{"statusName": "UDP", "count":VarUdpNwkCnt});
			FnDrawClientNetworkProtocol(ArrResponse,VarTcpNwkCnt,VarUdpNwkCnt);
			FnDrawClientDevice(VarDeciceTypes);
	
			$("#GBL_loading").appendTo('.clientlistToggle').hide();
			
		}else{
			$('#fillgauge1').html('');				
			setTimeout(function () {
				loadLiquidFillGauge("fillgauge1",0);	
			}, 200);
			$('#devicetotalcnt').html(0);
			$('#deviceactivecnt').html(0);
			ArrResponse = [];
			VarTcpNwkCnt = 0;
			VarUdpNwkCnt = 0;
			FnDrawClientNetworkProtocol(ArrResponse,VarTcpNwkCnt,VarUdpNwkCnt);
			FnDrawClientDevice(VarDeciceTypes);
			$("#GBL_loading").appendTo('.clientlistToggle').hide();
		}
	}

function FnDrawClientNetworkProtocol(ArrRes,VarTcpNwkCnt,VarUdpNwkCnt){
	var chart = $("#clientdevicestatus").data("kendoChart");
		if(chart != null){
		chart.destroy();
	}

	var VarTotal = VarTcpNwkCnt + VarUdpNwkCnt;
	if(VarTotal != 0){
		var VarLegendVisible = true;
		var ArrSeriesColor = ["#2685f3","#fe1662"];

	} else {
		var VarLegendVisible = false;
		ArrRes = [{"statusName":"No Data","count":1}];
		var ArrSeriesColor = ["#CED2D6"];
	}

	$("#clientnetworkprotocol").kendoChart({
		chartArea: {
			background: "transparent",
		},
		title: {
            position: "bottom",
            text: "Network Protocol",
			//color:"#fff",
            margin: {
            	bottom : -13,
            	right: 75
            },
            align: "center"
        },
        legend: {
        	position: "right",
			labels: {
				//color:"#fff",
			},
        	visible: true,
            margin: {
        		top: -100
        	}
        },
        dataSource: {
            data: ArrRes
        },
        seriesDefaults: {
            type: "donut",
            startAngle: 90,
            holeSize: 80
        },
        seriesColors: ArrSeriesColor,
		series: [{
            field: "count",
            categoryField: "statusName"
        }],
        tooltip: {
            visible: VarLegendVisible,
            template: "#= category # : #= value #"
        }
    });
}
	
function FnDrawClientDevice(VarDeciceTypes){
	var VarCategory =[];
	var VarCategoryValues =[];

	if(VarDeciceTypes != null){
		var result = categoryCounts(VarDeciceTypes);
		VarCategory = result[0];
		VarCategoryValues = result[1];
//---------------------------------------------------------------------------//
		var chart = $("#clientBarChart").data("kendoChart");
		if(chart != null){
			chart.destroy();
		}
		$("#clientBarChart").kendoChart({
			chartArea: {
				background: "transparent"
			},
			title: {
				position: "bottom",
				text: "Device Models",
				/*color:"#fff",*/
				margin: {
					bottom : -13,
					right: 75
				},
				align: "center"
			},
			legend: {
				position: "bottom",
				labels: {
					/*color:"#fff",*/
				},
				visible: true
			},
			seriesDefaults: {
				type: "bar"
			},
			seriesColors: ["#e84c95","#74c778","#EFD620","#20EFA4"],
			series: [{
				//name: "Device Count",
				spacing: 0,
				data: VarCategoryValues
			}],
			categoryAxis: {
				categories: VarCategory,
				labels: {
					/*color:"#fff",*/
				},
				line: {
					visible: false
				},
				majorGridLines: {
					visible: false
				}
			},
			valueAxis: {
				/*
				min: 0,
				max: 10,
				*/
				labels: {
					format: "{0}%",
					visible: false,
					values:[50]
				},
				line: {
					visible: false
				},
				majorGridLines: {
					visible: false
				}
			},
			tooltip: {
				visible: true,
				format: "{0}",
				template: "#= value #"
			}
		});
		
	}else{
		//VarCategory = ['No Devices'];
		//VarCategoryValues = 0;
		$("#clientBarChart").html('<p align="center">No data found</p>');
	}
}
	
function FnGetTotalDeviceTypeStatus(){
	var VarUrl = GblAppContextPath+'/ajax' + VarTenantsDeviceListUrl;
	var VarMainParam = '';
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', VarMainParam, 'application/json; charset=utf-8', 'json', FnResTotalDeviceTypeStatus);
}
	function FnResTotalDeviceTypeStatus(response){
		var VarResLength = (response).length;
		var VarTotalDeciceTypes = [];
		$.each(response,function(key,obj){
			$.each(obj.dataprovider,function(key,obj2){
				if(obj2.key == 'model'){
					VarTotalDeciceTypes.push(obj2.value);
				}
			});	
		});
		var VarCategory =[];
		var VarCategoryValues =[];

		if(VarTotalDeciceTypes != null){
			var result = categoryCounts(VarTotalDeciceTypes);
			VarCategory = result[0];
			VarCategoryValues = result[1];

		}else{
			VarCategory = ['No Devices'];
			VarCategoryValues = 0;
		}
		FnDrawDeviceType(VarCategory, VarCategoryValues);
	}
	function FnDrawDeviceType(VarCategory, VarCategoryValues){
		var VarCategoryLength = VarCategory.length;
		var chart = $("#devicetypechart").data("kendoChart");
		if(chart != null){
			chart.destroy();
		}
		var Data =[];
		if(VarCategoryLength > 0){
			for (var i = 0; i < VarCategoryLength; i++) {
				Data.push({"category": VarCategory[i], "value":VarCategoryValues[i]});	
			}	
		}else{
			Data = [{category: "No devices",value:  0.000001}];
		}
		
		Data.sort(dynamicSort("value"));
		var ArrSeriesColor = []
		ArrSeriesColor =["#f1e0b2","#cc9856","#875f2b"];
		if(VarCategoryLength > 3){
			var VarColorLength = VarCategoryLength - 3;
			var ArrSeriesColorPush = FnGetSeriesColor(VarColorLength);
			ArrSeriesColor.push(ArrSeriesColorPush)
		}
		$("#devicetypechart").kendoChart({
			chartArea: {
				background: "transparent"
			},
			legend: {
			   position: "bottom",
				labels: {
				  /*color:"#fff",*/
				},
				visible: true
			},
			seriesDefaults: {
				labels: {
					visible: true,
					background: "transparent",
					color:"black",
					format: "N0"
				}
			},
			dynamicSlope: true,
			dynamicHeight: true,
			//seriesColors: ["#f1e0b2","#cc9856","#875f2b"],
			seriesColors: ArrSeriesColor,
			series: [{
				type: "funnel",
				data: Data
			}],		
			tooltip: {
				visible: true,
				color:"#000",
				template: "#= category #"
			}
		});
	}

function FnGetDeviceUsageList(){
	var VarUrl = GblAppContextPath+'/ajax/markers/1.0.0/markers/list/filter';
	var VarMainParam = {
		"domain": {
			"domainName": VarCurrentTenantInfo.tenantDomain
		},
		"entityTemplate": {
			"entityTemplateName": "Device"
		}
	};
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(VarMainParam), 'application/json; charset=utf-8', 'json', FnResDeviceUsageList);
}	
	function FnResDeviceUsageList(response){
		var VarTenantLength = (response).length;
		if(VarTenantLength>0 || (VarTenantLength != 'undefined')){
			var ArrResponse = [];
			var VarTcpNwkCnt = 0;
			var VarUdpNwkCnt = 0;
			var VarTotalNwkCnt = 0;
			$.each(response,function(key,obj){
				//Calculations for Network Protocol Count/ Device count
				$.each(obj.dataprovider,function(key,obj2){
					if(obj2.key == 'networkProtocol'){
						if(obj2.value == 'TCP'){
							VarTcpNwkCnt +=1;
						}
						if(obj2.value == 'UDP'){
							VarUdpNwkCnt +=1;
						}
						VarTotalNwkCnt +=1;
					}
				});	
			});
			ArrResponse.push({"statusName": "TCP", "count":VarTcpNwkCnt, "explode": true},{"statusName": "UDP", "count":VarUdpNwkCnt});
			FnDrawTotalClientNetworkProtocol(ArrResponse,VarTcpNwkCnt,VarUdpNwkCnt);
		}else{
			ArrResponse = [];
			VarTcpNwkCnt = 0;
			VarUdpNwkCnt = 0;
			FnDrawTotalClientNetworkProtocol(ArrResponse,VarTcpNwkCnt,VarUdpNwkCnt);
		}
	}	
	function FnDrawTotalClientNetworkProtocol(ArrRes,VarTcpNwkCnt,VarUdpNwkCnt){
		var chart = $("#clientdevicestatus").data("kendoChart");
			if(chart != null){
			chart.destroy();
		}
		var VarTotal = VarTcpNwkCnt + VarUdpNwkCnt;
		var VarVisible;
		if(VarTotal != 0){
			var VarLegendVisible = true;
			var ArrSeriesColor = ["#179ba3","#fe3e00"];
			VarVisible = true;
		} else {
			var VarLegendVisible = true;
			ArrRes = [{"statusName":"No data","count":1,"explode": false}];
			var ArrSeriesColor = ["#CED2D6"];
			VarVisible = false;
		}

		var chart = $("#deviceusagechart").data("kendoChart");
		if(chart != null){
			chart.destroy();	
		}
		var ArrSeriesColor = ["#179ba3","#fe3e00","#ffc001"];
		$("#deviceusagechart").kendoChart({
			dataSource: {
			  transport: {
				read: function(e) {
				  e.success(ArrRes);
				}
			  }
			},
			chartArea: {
				background: "transparent",
				//width: 320,
				height: 320
			},
			seriesColors: ArrSeriesColor,
			series: [{
			  type: "pie",
			  field: "count",
			  categoryField: "statusName",
			  explodeField: "explode",
			  labels: {
				visible: VarVisible,
				background: "transparent",
				template: "#= value#"
			  }
			}],
			seriesClick: function(e){
				$.each(e.sender.dataSource.view(), function() {
					// Clean up exploded state
					this.explode = false;
				});
				// Disable animations
				e.sender.options.transitions = false;
				// Explode the current slice
				e.dataItem.explode = true;
				e.sender.refresh();
			}
		});
	}

/*---------- Common Functions ----------*/
function FnGetTenantDomainName(ArrDataProvider){
	var VarTenantDomainName = '';
	$.each(ArrDataProvider,function(key,obj){
		if(obj.key == 'domain'){
			VarTenantDomainName = obj.value;
			return false;
		}
	});
	return VarTenantDomainName;
}
/*
function FnGetTenantName(ArrDataProvider){
	var VarTenantName = '';
	$.each(ArrDataProvider,function(key,obj){
		if(obj.key == 'tenantName'){
			VarTenantName = obj.value;
			return false;
		}
	});
	return VarTenantName;
}*/
function FnGetTenantInfo(ArrDataProvider){
	var VarTenantName = '';
	var VarTenantId = '';
	$.each(ArrDataProvider,function(key,obj){
		if(obj.key == 'tenantName'){
			VarTenantName = obj.value;	
		}
		if(obj.key == 'tenantId'){
			VarTenantId = obj.value;	
		}
	});
	return {tenantId:VarTenantId,tenantName:VarTenantName}
	
}

function categoryCounts(arr) {
	var a = [], b = [], prev;
	arr.sort();
	for ( var i = 0; i < arr.length; i++ ) {
		if ( arr[i] !== prev ) {
			a.push(arr[i]);
			b.push(1);
		} else {
			b[b.length-1]++;
		}
		prev = arr[i];
	}
	return [a, b];
}
function dynamicSort(property) {
	var sortOrder = 1;
	if(property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a,b) {
		var result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0;
		return result * sortOrder;
	}
}
function FnGetSeriesColor(VarLength){
	var ArrseriesColor = [];
	var push_color;
	for(var i=0; i<VarLength; i++){
		push_color = '#'+(Math.random().toString(16) + '000000').slice(2, 8);
		ArrseriesColor.push(push_color);
	}
	return ArrseriesColor;
}