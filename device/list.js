"use strict";
$(document).ready(function () {	
	
	//Splitter initiation from kendo
	var splitterElement = $("#splitter").kendoSplitter({
			orientation: "horizontal",
			panes : [{
					collapsible : true,
					size : '20%'
				}
			]
	});
		
	FnGetClientList();
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
	$("#GBL_loading").show();
	$('#gapp-device-list').show();
		
	var grid = $("#gapp-device-list").data("kendoGrid");
	if (grid != null) {
		grid.destroy();
	}
		
	var ObjParam = FnGetTenantDeviceParams(ObjTenantInfo);
	$("#gapp-device-list").kendoGrid({
		height : 480,
		dataSource : {
			type : "json",
			transport : {
				read : {
					type : "POST",
					dataType : "json",
					contentType : "application/json",
					url : GblAppContextPath + "/ajax" + VarListDeviceUrl,
					data : ObjParam
				},
				parameterMap : function (options, operation) {
					if (!$.isEmptyObject(ObjParam)) {
						var data = JSON.stringify(options);

					} else {
						var data = options;
					}
					return data;
				}
			},
			schema : {
				data : function (response) {
					$("#GBL_loading").hide();
					var ArrResponse = response;
					var VarResLength = ArrResponse.length;

					if (VarResLength > 0) {
						var responseData = [];
						$(ArrResponse).each(function (index) {
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
							responseData.push(element);
						});
												
						return responseData;
					}

				},
				total : function (response) {
					return response.length;
				},
				model : {
					fields : {
						sourceId : {
							type : "string"
						}
					}
				}
			},
			pageSize : 10,
			page : 1,
			serverPaging : false,
			serverFiltering : false,
			serverSorting : false,
			sort : {
				field : "sourceId",
				dir : "asc"
			}
		},
		selectable : "row",
		resizable : true,
		sortable : {
			mode : "single",
			allowUnsort : true
		},
		filterable : {
			mode : "row",
			extra : false
		},
		detailInit : FnGetConfigurations,
		pageable : {
			refresh : true,
			pageSizes : true,
			previousNext : true
		},
		columnMenu : {
			filterable : false,
			sortable : false
		},
		noRecords : {
			template : "<div class='Metronic-alerts alert alert-info fade in'><button type='button' class='close' aria-hidden='true'> </button> <i class='fa-lg fa fa-warning'></i> No data available on current client </div>"
		},
		columns : [{
				field : "sourceId",
				title : "Source Id",
				width:160
			}, {
				field : "deviceName",
				title : "Device Name",
				width:160
			},
			{
				field : "tags",
				title : "Tags"
			}, {
				field : "make",
				title : "Make"
			}, {
				field : "deviceType",
				title : "Type"
			}, {
				field : "model",
				title : "Model"
			}, {
				field : "protocol",
				title : "Protocol"
			}, {
				field : "version",
				title : "Version"
			}, {
				field : "networkProtocol",
				title : "Network Protocol"
			}, {
				title : "Action",
				template : "#= FnGenerateAction(publish) #",
				filterable : false,
				sortable : false,
				width:70
			}
		]

	}).data("kendoGrid");

	$("#gapp-device-list").data("kendoGrid").tbody.on("click", ".grid-editdevice", function (e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-device-list").data('kendoGrid').dataItem(tr);
		$('#device_id').val(data.identifier);
		$('#gapp-device-view').submit();
	});

	$("#gapp-device-list").data("kendoGrid").tbody.on("click", ".grid-writeback", function (e) {
		var tr = $(this).closest("tr");
		var data = $("#gapp-device-list").data('kendoGrid').dataItem(tr);
		var VarDSName = '';
		if (data.publish == 'true') {
			VarDSName = data.datasourceName;
		}
		$('#gapp-device-writeback #ds_name').val(VarDSName);
		$('#gapp-device-writeback #source_id').val(data.sourceId);
		$("#gapp-device-writeback").submit();
	});

	$(window).resize(function () {
		$("#gapp-device-list").data("kendoGrid").resize();
	});
}

function FnGenerateAction(publish) {
	var VarActions = "<div class='diviceactions'>";
	if (ObjPageAccess['view'] == '1' && ObjPageAccess['edit'] == '1') {
		VarActions += "<a href='Javascript:void(0)' class='grid-editdevice'  data-toggle='tooltip' data-placement='bottom' title='View and Edit'><span class='smicon sm-editicon'></span></a>";
	}

	VarActions += "&nbsp&nbsp<a href='Javascript:void(0)' class='grid-writeback'><span class='smicon sm-nexticon' data-toggle='tooltip' data-placement='bottom' title='Controls'></span></a>";

	VarActions += "</div>";
	return VarActions;
}

function FnGetConfigurations(e) {
	var url = VarListDeviceConfUrl.replace("{source_id}", e.data.sourceId);
	$("<div/>").appendTo(e.detailCell).kendoGrid({
		resizable : true,
		dataSource : {
			type : "json",
			transport : {
				read : GblAppContextPath + "/ajax" + url
			},
			schema : {
				data : function (response) {
					var ObjResponse = JSON.parse(response);
					if (!$.isEmptyObject(ObjResponse)) {
						var responseData = ObjResponse.configPoints;
						return responseData;
					}

				},
				total : function (response) {
					var ObjResponse = JSON.parse(response);
					if (!$.isEmptyObject(ObjResponse)) {
						if (ObjResponse.configPoints != undefined) {
							var ArrConfPoints = ObjResponse.configPoints;
							return ArrConfPoints.length;
						} else {
							return 0;
						}
					} else {
						return 0;
					}

				},
				model : {
					fields : {
						pointId : {
							type : "string"
						},
						pointName : {
							type : "string"
						},
						type : {
							type : "json"
						},
						physicalQuantity : {
							type : "json"
						},
						unit : {
							type : "json"
						}
					}
				}
			},
			pageSize : 10,
			page : 1,
			serverPaging : false,
			serverFiltering : false,
			serverSorting : false,
			sort : {
				field : "pointName",
				dir : "asc"
			}
		},
		selectable : "row",
		sortable : {
			mode : "single",
			allowUnsort : true
		},
		pageable : {
			refresh : true,
			pageSizes : true,
			previousNext : true
		},
		columnMenu : false,
		columns : [{
				field : "pointId",
				title : "Point Id",
				filterable : false,
			}, {
				field : "pointName",
				title : "Point Name",
				filterable : false,
			}, {
				field : "type",
				title : "Data Type",
				filterable : false,
			}, {
				field : "physicalQuantity",
				title : "Physical Quantity",
				filterable : false,
			}, {
				field : "unit",
				title : "Unit Of Measurement",
				filterable : false,
			}
		]

	});
}

function FnNavigateClientPage(VarActionUrl){
	$("#gapp-client-navigation").attr('action',VarActionUrl);
	$("#gapp-client-navigation").submit();
}
