"use strict";
$(document).ready(function () {	
	
	//Splitter initiation from kendo
	var splitterElement = $("#splitter").kendoSplitter({
			panes : [{
					collapsible : true,
					size : '20%'
				}
			]
	});
		
	FnGetClientList();
	FnDrawDeviceStatusChart();
	FnInitDeviceStatusGrid();
	FnGetDeviceList(VarCurrentTenantInfo);

});

function FnGetClientList(){

	var ObjClientDataSource = new kendo.data.HierarchicalDataSource({
		transport: {
			read: function(options) {
					
				if (options.data.hasOwnProperty('treeidentifier')) {																		
					var data = options.data;
					var tree = $("#gapp-clients-list").data("kendoTreeView");
					var node = tree.dataSource.get(data.treeidentifier);
					
					var VarUrl = GblAppContextPath + '/ajax' + VarHierarchyChildrenUrl;
					
					var VarParam = {};
					VarParam['actor'] = {
						"globalEntity": {"globalEntityType": "TENANT"},
						"domain": {"domainName": node.parentDomain},
						"entityTemplate": {"entityTemplateName": "DefaultTenant"},
						"identifier": {"key": "tenantId","value": node.treeidentifier}
					};
					VarParam['searchTemplateName'] = 'DefaultTenant';
					VarParam['searchEntityType'] = 'TENANT';
					VarParam['statusName'] = 'ACTIVE';
								
					$.ajax({
						url: VarUrl,
						contentType: 'application/json; charset=utf-8',
						dataType: 'json',
						data: JSON.stringify(VarParam),
						type: "POST",						
						success: function(response) {
							options.success(response);
						},
						error: function(xhr, status, error) {
							options.success({});
						}
						
					});
				} else {
					var reponse = [{
						"dataprovider" : [{"key":"domain","value":VarCurrentTenantInfo.tenantDomain},{"key": "tenantId","value": VarCurrentTenantInfo.tenantId},{"key": "tenantName","value": VarCurrentTenantInfo.tenantName}],
						"identifier": {"key": "tenantId", "value": VarCurrentTenantInfo.tenantId},
						"tree": {"key": "tenantName", "value": VarCurrentTenantInfo.tenantName},
						"domain": {"domainName": VarCurrentTenantInfo.parentDomain}
					}];
					
					options.success(reponse);
				}
			}
		},
		schema: {
			data: function(response) {	
				var ArrResponseData = [];
				var VarResLength = response.length;
				if (VarResLength > 0) {
					$.each(response,function() {
						var element = {};
						$(this.dataprovider).each(function () {
							if(this.key === 'domain'){
								element['tenantDomain'] = this.value;
							} else {
								element[this.key] = this.value;
							}
						});
						element["parentDomain"] = this.domain.domainName;
						element["treeidentifier"] = this.identifier.value;
						element["treevalue"] = this.tree.value;                                        
						ArrResponseData.push(element);
					});
				}
						
				return ArrResponseData;
			},
			model: {
				id: "treeidentifier",
				hasChildren: true
			}
		}
	});
	
	$("#gapp-clients-list").kendoTreeView({
		dataSource: ObjClientDataSource,
		dataTextField: "treevalue",
		template:"<span id='#= item.treeidentifier #' title='#= item.treevalue #'>#= item.treevalue #</span>",
		select: function(e) {
			GblObjDeviceInfo = {};			
			var chart = $("#profileCompleteness").data("kendoChart");
			chart.setDataSource([]);		
			$("#gapp-device-status").data("kendoGrid").dataSource.data([]);
			kendo.ui.progress($("#gapp-device-status"), true);			
			var tree = $("#gapp-clients-list").getKendoTreeView();
			var dataItem = tree.dataItem(e.node);		
			FnGetDeviceList(dataItem);
		}
	});
	
	var treeview = $("#gapp-clients-list").data("kendoTreeView");
	treeview.expand(treeview.findByText(VarCurrentTenantInfo.tenantName));
	FnSelectRootNode();
	FnInitSearch("#gapp-clients-list", "#treeViewSearchInput");
}

function FnSelectRootNode(){
	var el = $('#gapp-clients-list');
	var tree = el.data('kendoTreeView');
	var firstNode = el.find('.k-first');
	tree.select(firstNode);
}

function FnInitSearch(treeViewId, searchInputId) {

    var tv = $(treeViewId).data('kendoTreeView');

    $(searchInputId).on('keyup', function () {

        $(treeViewId + ' li.k-item').show();

        $('span.k-in > span.highlight').each(function () {
            $(this).parent().text($(this).parent().text());
        });

        // ignore if no search term
        if ($.trim($(this).val()) === '') {
            return;
        }

        var term = this.value.toUpperCase();
        var tlen = term.length;

        $(treeViewId + ' span.k-in').each(function (index) {
            var text = $(this).text();
            var html = '';
            var q = 0;
            var p;

            while ((p = text.toUpperCase().indexOf(term, q)) >= 0) {
                html += text.substring(q, p) + '<span class="highlight">' + text.substr(p, tlen) + '</span>';
                q = p + tlen;
            }

            if (q > 0) {
                html += text.substring(q);
                $(this).html(html);

                $(this).parentsUntil('.k-treeview').filter('.k-item').each(function (index, element) {
                    tv.expand($(this));
                    $(this).data('SearchTerm', term);
                });
            }
        });

        $(treeViewId + ' li.k-item:not(:has(".highlight"))').hide();
		tv.expand(".k-item");
    });
}

function FnGetTenantDeviceParams(ObjTenantInfo){
	var ObjParam = {};
		
	if(ObjTenantInfo.tenantDomain != VarAppRootDomain){
		ObjParam['domain'] = {"domainName" : ObjTenantInfo.parentDomain};
		ObjParam["entityTemplate"] = {"entityTemplateName" : "DefaultTenant"};
		ObjParam["globalEntity"] = {"globalEntityType" : "TENANT"};		
		ObjParam["identifier"] = {"key" : "tenantId","value" : ObjTenantInfo.tenantId};
	}
	
	return ObjParam;
}

function FnGetDeviceList(ObjTenantInfo) {
	kendo.ui.progress($("#gapp-device-status"), true);
	GblObjDeviceInfo = {};	
	var VarDeviceUrl = GblAppContextPath + "/ajax" + VarListDeviceUrl;
	var ObjParam = FnGetTenantDeviceParams(ObjTenantInfo);
	
	if (!$.isEmptyObject(ObjParam)) {
		FnMakeAsyncAjaxRequest(VarDeviceUrl, 'POST',JSON.stringify(ObjParam), 'application/json; charset=utf-8', 'json', FnResDeviceList);
	} else {
		FnMakeAsyncAjaxRequest(VarDeviceUrl, 'POST','', 'application/json; charset=utf-8', 'json', FnResDeviceList);
	}
		
}

var GblObjDeviceInfo = {};
function FnResDeviceList(response){
	if($.isArray(response)){
		var VarResLength = response.length;
		if (VarResLength > 0) {
			$(response).each(function (index) {
				var element = {};
				$(this.dataprovider).each(function () {
					var key = this.key;
					if (key === 'entityName') {
						element['sourceId'] = this.value;
					} else {
						element[key] = this.value;
					}
				});
				element["identifier"] = this.identifier.value;
				GblObjDeviceInfo[element['sourceId']] = element['deviceName'];
			});		
			FnDisplayDeviceStatus(GblObjDeviceInfo);
		} else {
			kendo.ui.progress($("#gapp-device-status"), false);
		}
	} else {
		kendo.ui.progress($("#gapp-device-status"), false);
	}
}

function FnInitDeviceStatusGrid(){
	var ArrResData = [];
	var ArrColumns = [{field : "deviceId",title : "Device Id"},{field : "deviceName",title : "Device Name"},{field : "online",title : "Online since",template :"#: FnCheckTimeEmpty(online)#"},{field : "offline",title : "Offline since",template :"#: FnCheckTimeEmpty(offline)#"},{field : "status",title : "Status",template : "#= FnGenerateStatusIcon(status) #", filterable : true, sortable : false, width:100}];
	var ObjGridConfig = {
		"scrollable" : true,
		"filterable" : { mode : "row" },
		"sortable" : true,
		"height": 430,
		"pageable" : { pageSize: 10,numeric: true, pageSizes: true,refresh: false },
		"selectable" : true
	};
	FnDrawGridView('#gapp-device-status',ArrResData,ArrColumns,ObjGridConfig);
	
	$(window).resize(function () {
		$("#gapp-device-status").data("kendoGrid").resize();
	});
	
}

function FnGenerateStatusIcon(VarStatusTxt){
	var VarResTxt = '';
	if(VarStatusTxt === 'ONLINE'){
		VarResTxt += '<img src="'+GblAppContextPath+'/extensions/themes/'+GblAppTheme+'/images/green_circle.png" />';
	} else {
		VarResTxt += '<img src="'+GblAppContextPath+'/extensions/themes/'+GblAppTheme+'/images/red_circle.png" />';
	}
	return VarResTxt;
}

function FnDisplayDeviceStatus(ArrData){
	var ArrSourceIds = Object.keys(ArrData);
	var VarUrl = GblAppContextPath+'/ajax' + VarDeviceStatusUrl;
	FnMakeAsyncAjaxRequest(VarUrl, 'POST', JSON.stringify(ArrSourceIds), 'application/json; charset=utf-8', 'json', FnResDeviceStatus);
}

function FnResDeviceStatus(response){
	var ArrResData = [];
	var VarOnStatus = 0;
	var VarOffStatus = 0;
	if(!$.isEmptyObject(response)){
		if(response.deviceStatus != undefined && (response.deviceStatus).length > 0){
			$.each(response.deviceStatus,function(){
				var element = {};
				element['deviceId'] = this.deviceId;
				element['deviceName'] = GblObjDeviceInfo[this.deviceId];
				element['status'] = this.status;
				element['online'] = (this.lastOnlineTime != undefined) ? this.lastOnlineTime : '';
				element['offline'] = (this.lastOfflineTime != undefined) ? this.lastOfflineTime : '';
				element['communicatedTime'] = ''
				if(this.status === 'ONLINE'){
					VarOnStatus++;
				} else {
					VarOffStatus++;
				}
				ArrResData.push(element);
			});
		}
	}
	
	$("#gapp-device-status").data("kendoGrid").dataSource.data(ArrResData);
	kendo.ui.progress($("#gapp-device-status"), false);
		
	var ArrDeviceStatusDS = [
								{"status": "ONLINE","value": VarOnStatus,"userColor": "#316904"},
								{"status": "OFFLINE","value": VarOffStatus,"userColor": "#F90A0A"}
							];
				
	var chart = $("#profileCompleteness").data("kendoChart");
	chart.setDataSource(ArrDeviceStatusDS);
}

function FnDrawDeviceStatusChart(){

	var chart = $("#profileCompleteness").data("kendoChart");
	if (chart != null) {
		chart.destroy();
	}
	
	$("#profileCompleteness").kendoChart({
		chartArea: {
			height: 50
		},
		dataSource: {
			data: []
		},
		legend: {
			visible: false
		},
		seriesDefaults: {
			type: "bar",
			labels: {
				visible: true,
				background: "transparent"
			},
			gap: 1,
			size: 10
		},
		series: [{
			field: "value",
			colorField: "userColor"
		}],
		valueAxis: {
			majorGridLines: {
				visible: false
			},
			visible: false
		},
		categoryAxis: {
			field: "status",
			majorGridLines: {
				visible: false
			},
			line: {
				visible: false
			}
		},
		seriesClick: function(e) {
			var VarFilterTxt = e.dataItem.status;
			var $filter = [];
			$filter.push({ field: "status", operator: "contains", value: VarFilterTxt });
			var grid = $("#gapp-device-status").data("kendoGrid");
			grid.dataSource.filter($filter);
		}
	});
	
	$(window).resize(function () {
		$("#profileCompleteness").data("kendoChart").resize();
	});
	
}

function FnCheckTimeEmpty(VarTime){
	if (VarTime =='' || VarTime==null) {
		VarTime=' - ';			
	} else {
		VarTime =toDateFormatRemoveGMT(VarTime, 'F');			
	}
	return VarTime;
}
