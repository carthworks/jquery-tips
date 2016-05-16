var uesdashboardview = false;
var GblFacilityName = '';
var GblDashboardId = '';

$(document).ready(function(){
	$('#header_date, #time').hide();
	$('.dashboard-usersettings').hide();
	var toolbarHbs = Handlebars.compile($("#ues-gadget-toolbar-hbs").html());
			
	var FnDashboardInitialization = function(){
		GblDashboardId = ues.global.dashboard.id;
		//GblFacilityName = FnGetFacilityList();
		
		/*if(defaultFacility != null && defaultFacility!='null' && defaultFacility != ''){
			defaultFacility = jQuery.parseJSON(defaultFacility);
			
			if(defaultFacility[GblDashboardId] != undefined){
				GblFacilityName = defaultFacility[GblDashboardId];
			}			
		}*/
		
		$('#facility_head').text(GblFacilityName);
		$('#facility-icon-head').text(GblFacilityName);
		ues.dashboards.render($('#wrapper'), ues.global.dashboard, ues.global.page, dashboardcallback);
	};
		
	var FnGetPageGadgetconfiguration = function(uesgadgetid){
		var uespageid = (ues.global.page ? ues.global.page : ues.global.dashboard.pages[0]['id']);
		var uespages =  ues.global.dashboard.pages;
		
		var uesgadgetcontent = {};
		for(var i=0; i<uespages.length; i++){  //alert(ues.global.dashboard.pages[i].id);
			if(uespageid == ues.global.dashboard.pages[i].id){ //alert(ues.global.dashboard.pages[i].id);
				var uespagecontent = ues.global.dashboard.pages[i].content;
				//console.log(uespagecontent);
				$.each(uespagecontent,function(key,Arr){
					for(var j=0; j<Arr.length; j++){
						if(Arr[j]['id']!=undefined && Arr[j]['id'] == uesgadgetid){
							uesgadgetcontent = Arr[j]['content'];
							return false;
						}
					}
										
					/*if(Arr.length>0 && Arr[0]['id']!=undefined && Arr[0]['id'] == uesgadgetid){ 
						
						uesgadgetcontent = Arr[0]['content'];
						return false;
					}*/
				});
				$('.dbpagetitle').text(" - "+ues.global.dashboard.pages[i].title);
				break;
			}
		}
		
		return uesgadgetcontent;
	};
	
	var dashboardcallback = function(){
		
		$('.ues-component-box div.ues-component').each(function () {
            var uesgadgetid = $(this).attr('id');			
			var uespagegadgetconf = FnGetPageGadgetconfiguration(uesgadgetid);
			$('#'+uesgadgetid).prepend($(toolbarHbs(uespagegadgetconf)));		
			$('.facilityicon').parent('button').attr('disabled',true);
        });
		$('.dashboard-usersettings').show();
		
	};
	
	FnDashboardInitialization();
	
	$('.icon-filter').webuiPopover({
		width:300,
		height:'auto',
		padding:false,
		multi:false,
		closeable:false,	
		cache:true,
		animation:'pop',
		trigger:'click',
		dismissible: false,
		content:function(data){
			var id = $(this).parents('.ues-component').attr('id');
			var VarContent = FnGetGatgetFilterOptions(id);
			return VarContent;
		}
	});
	
	$('.icon-visual').webuiPopover({
		width:'180px',
		height:'210px',
		padding:false,
		multi:false,
		closeable:true,	
		cache:false,
		animation:'pop',
		trigger:'click',
		dismissible: false,
		content:function(data){
			var id = $(this).parents('.ues-component').attr('id');
			var dbcolumnid = $(this).parents('.ues-component-box').attr('id');
			var VarContent = FnGetGatgetDataVisualOptions(id,dbcolumnid);
			return VarContent;
		}
	});

	FnSetCurrentDay();
	
	setInterval( function() {

        // Create a newDate() object and extract the seconds of the current time on the visitor's
        var seconds = new Date().getSeconds();

        // Add a leading zero to seconds value
        $("#sec").html(( seconds < 10 ? "0":"" ) + seconds);
		if($('#time').is(':visible') == false ){
			$('#time').show();
		}
		
    },1000);
	
	setInterval( function() {

        // Create a newDate() object and extract the minutes of the current time on the visitor's
        var minutes = new Date().getMinutes();

        // Add a leading zero to the minutes value
        $("#min").html(( minutes < 10 ? "0":"" ) + minutes);
		if($('#time').is(':visible') == false ){
			$('#time').show();
		}
    },1000);

    setInterval( function() {

        // Create a newDate() object and extract the hours of the current time on the visitor's
        var hours = new Date().getHours();

        // Add a leading zero to the hours value
        $("#hours").html(( hours < 10 ? "0" : "" ) + hours);
		if($('#time').is(':visible') == false ){
			$('#time').show();
		}
    }, 1000);
	
            
    $('body').on('click', '.template-skins > a', function(e){
		e.preventDefault();
		var skin = $(this).attr('data-skin');
		FnSaveDashboard(skin);
		$('body').attr('class', skin);
		$('#changeSkin').modal('hide');
		$('#userlogoutsec').hide();
    });
	
	$(document).on('change','select#ees',function(){
	
		var VarFilterConId = $(this).parents('.webui-popover').attr('id');
		$('#'+VarFilterConId+' #frequency').html('');		
		if($(this).val() == 'true'){
			$('#'+VarFilterConId+' #frequency').html('<option value="1mo">Monthly</option>');
		} else {
			$('#'+VarFilterConId+' #frequency').html('<option value="1day">Daily</option><option value="1mo" selected>Monthly</option>');
		}	
		
	});
	
	/*$(document).on('change','#frequency',function(){
		
		var VarFilterConId = $(this).parents('.webui-popover').attr('id');
		$('#'+VarFilterConId+' .input_date').datepicker( "destroy" );
		
		if($(this).val()=='1mo'){
			$('#'+VarFilterConId+ ' #startDate, #'+VarFilterConId+ ' #endDate').addClass('month');
			$('#gadgetfilteroptions #startDate,#gadgetfilteroptions #endDate').addClass('month');
		} else {
			$('#'+VarFilterConId+ ' #startDate, #'+VarFilterConId+ ' #endDate').removeClass('month');
			$('#gadgetfilteroptions #startDate,#gadgetfilteroptions #endDate').removeClass('month');
		}
		$('#'+VarFilterConId+ ' #startDate, #'+VarFilterConId+ ' #endDate').val('');
		
	});*/
				
});

function FnSaveDashboard(VarSkin){

	var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';
	var url = dashboardsApi + '/' + ues.global.dashboard.id;
	var dashboard = ues.global.dashboard;
	dashboard.skin = VarSkin;
	
	$.ajax({
		url: url,
		method: 'PUT',
		data: JSON.stringify(dashboard),
		contentType: 'application/json'
	}).success(function (data) {
		//console.log('dashboard saved successfully');
	}).error(function () {
		console.log('error saving dashboard');
	});
	
}

var GblGadgetHeight = 0;
var GblPanelHeight = 0;
function FnMaxMinGadget(VarThis){

	var id = $(VarThis).parents('.ues-component').attr('id');
	
	$('.webui-popover').removeClass('in').hide();
			
	if($(VarThis).parents('.ues-component-box').hasClass('ues-gadget-maximize')){
		$('.ues-component-box, .ues-component').show();
		
		if(GblPanelHeight != 0){
			$('#'+id).children('.ues-component-box-gadget').css('height',GblPanelHeight);
		}
		GblPanelHeight = 0;
		//document.getElementById('sandbox-gadget-'+id).height = GblGadgetHeight+'px';
		document.getElementById('sandbox-gadget-'+id).height = GblGadgetHeight;
		GblGadgetHeight = 0;
		$(VarThis).parents('.ues-component-box').toggleClass('ues-gadget-maximize');
		$(VarThis).attr('data-original-title','Maximize');
		$(VarThis).children('span').removeAttr('class').addClass('glyphicon glyphicon-fullscreen');
	} else {
		$('.ues-component-box, .ues-component').hide();
		
		GblPanelHeight = $('#'+id).children('.ues-component-box-gadget').css('height');
		GblPanelHeight = (GblPanelHeight != '0px') ? GblPanelHeight : 0;
		$('#'+id).children('.ues-component-box-gadget').css('height','');
						
		GblGadgetHeight = document.getElementById('sandbox-gadget-'+id).getAttribute('height');
		var VarWinHeight = ($('#ues-dasboard-container').height() - 260);
		
		//document.getElementById('sandbox-gadget-'+id).height = VarWinHeight+'px';
		document.getElementById('sandbox-gadget-'+id).height = VarWinHeight;
				
		$(VarThis).parents('.ues-component-box').toggleClass('ues-gadget-maximize').show();
		$(VarThis).parents('.ues-component').show();
		$('#facilityModal .ues-component').show();
		$(VarThis).attr('data-original-title','Minimize');
		$(VarThis).children('span').removeAttr('class').addClass('glyphicon glyphicon-resize-small');
	}
	
}

function FnGetUserPreferenceOptions(id,dbcolumnid){
	var ObjViewClass = {"column":"fa-bar-chart","bar":"fa-bar-chart","line":"fa-line-chart","area":"fa-area-chart","grid":"fa-table"};
	
	var VarContent = '';
	var uespageid = (ues.global.page ? ues.global.page : ues.global.dashboard.pages[0]['id']);
	var uespages =  ues.global.dashboard.pages;
	for(var i=0; i<uespages.length; i++){
		if(uespageid == ues.global.dashboard.pages[i].id){
			var dbcolumn = ues.global.dashboard.pages[i]['content'][dbcolumnid];
			if(dbcolumn.length > 0){
				for(var j=0; j<dbcolumn.length; j++){
					if(id == dbcolumn[j].id){
						var dataviewoptions = dbcolumn[j]['content']['options']['dataview'];
						VarContent += '<ul class="options first-level">';
						$.each(dataviewoptions['options'],function(key,obj){
							VarContent += '<li><i class="fa '+ObjViewClass[obj['value']]+'"></i><a class="process" onclick="FnApplyGadgetDataView(this,\''+obj['value']+'\')">'+obj['displayValue']+'</a></li>';
						});
						VarContent += '</ul>';
					}
				}
			}
		}
	}
	
	return VarContent;
	
}

function FnGetGatgetDataVisualOptions(id,dbcolumnid){
	$('#gadgetdataviewoptions .dataview-content').html('');
	var con = FnGetUserPreferenceOptions(id,dbcolumnid);
	$('#gadgetdataviewoptions .dataview-content').html(con);
	$('#gadgetdataviewoptions #gadget-dataview-id').val(id);
	return $('#gadgetdataviewoptions').html();
}

function FnApplyGadgetDataView(VarThis,VarDataView){
	var webuipopid = $(VarThis).closest('.webui-popover').attr('id');
	var id = $('#'+webuipopid+' #gadget-dataview-id').val();
	var iframe = document.getElementById('sandbox-gadget-'+id);
	var iframeContent = (iframe.contentWindow || iframe.contentDocument);
	$('#'+webuipopid).removeClass('in').hide();
	iframeContent.FnApplyDataView(VarDataView);
}

function FnGetGatgetFilterOptions(id){
	$('#gadgetfilteroptions .filter-content').html('');
	var con = $('#sandbox-gadget-'+id).contents().find(".filter-content").html();
	$('#gadgetfilteroptions .filter-content').html(con);
	//$('#gadgetfilteroptions form[name="gadget-filter"]').attr('id','gadget-filter-'+id);
	$('#gadgetfilteroptions #gadget-filter-id').val(id);
	var VarFilterContent = $('#gadgetfilteroptions').html();
	//$('#gadgetfilteroptions .filter-content').html('');
	return VarFilterContent;
}

function FnSetFilterOptions(id){
		
	var iframe = document.getElementById('sandbox-gadget-'+id);
	var iframeContent = (iframe.contentWindow || iframe.contentDocument);
	var ObjParamGadget = iframeContent.GblParams;
	var VarElementId;
	$('#gadgetfilteroptions .filter-content').find('input, select, label').each(function(){
		VarElementId = $(this).attr('id');
		$('#'+VarElementId).text('asdsadasd');
		$('#frequency').val('1mo');
		//alert(VarElementId);
		if($('#gadgetfilteroptions #'+VarElementId).is("input:text")){
			//alert(ObjParamGadget[VarElementId]);
			$('#gadgetfilteroptions #'+VarElementId).val(ObjParamGadget[VarElementId]);
		} else if($('#'+VarElementId).is("select")){
			$('#'+VarElementId).val(ObjParamGadget[VarElementId]);
		}
	});
	
	
	/*var VarElementId;
	
	$('.filter-content').find("input, select").each(function(){
	
		VarElementId = $(this).attr('id');
		if($('#'+VarElementId).is("input:text")){
			alert($('#'+VarElementId).val());
			$('#'+VarElementId).val(GblParams[VarElementId]);
			alert($('#'+VarElementId).val());
		} else if($('#'+VarElementId).is("select")){
			
		}
		
	});*/
}

function FnManageFilter(VarThis){
	$('#myModalfilter .modal-body').html('');
	var id = $(VarThis).parents('.ues-component').attr('id');
	var title = $('#'+id+' .panel-title').text();
	var con = $('#sandbox-gadget-'+id).contents().find(".filter-content").html();
	$('#myModalfilter .modal-body').html(con);
	$('#gadget-filter-id').val(id);
		
	
	var	settings = {
					placement:'auto',
					width:'auto',
					height:'auto',
					title:title,
					multi:false,
					arrow:true,
					closeable:true,
					padding:false,
					animation:'pop',
					cache:false,
					type:'html',
					content:function(data){
						return $('#myModalfilter').html();
					}};
	$(VarThis).webuiPopover(settings);
}


function FnApplyGadgetFilter(VarThis){
	var webuipopid = $(VarThis).closest('.webui-popover').attr('id');
	var id = $('#'+webuipopid+' #gadget-filter-id').val();
	var iframe = document.getElementById('sandbox-gadget-'+id);
	var iframeContent = (iframe.contentWindow || iframe.contentDocument);
	var ArrFilters = [];
	var VarElementName = '';
	var VarElementValue = '';
	var ErrDate = 0;
	$('#'+webuipopid+' .filter-content select, #'+webuipopid+' .filter-content input').each(function(){
		VarElementName = $(this).attr('name');
		VarElementValue = $(this).val();
		ArrFilters.push({"key":VarElementName,"value":VarElementValue});
		
		if(VarElementName=='startDate' || VarElementName=='endDate'){
			ErrDate++;
		}
		
	});
	
	if(ErrDate == 2){
		ErrDate = 0;
		
		if($('#'+webuipopid+' #startDate').val()!='' && $('#'+webuipopid+' #endDate').val()==''){
			$('#'+webuipopid+' #endDate').addClass('filter-error');
		} else if($('#'+webuipopid+' #startDate').val()=='' && $('#'+webuipopid+' #endDate').val()!=''){
			$('#'+webuipopid+' #startDate').addClass('filter-error');
		} else if($('#'+webuipopid+' #frequency').length>0 && ($('#'+webuipopid+' #startDate').val()=='' && $('#'+webuipopid+' #endDate').val()=='' && $('#'+webuipopid+' #frequency').val()=='1mo')){
			$('#'+webuipopid+' #startDate').addClass('filter-error');
			$('#'+webuipopid+' #endDate').addClass('filter-error');
		} else {
			var VarStartDate = new Date($('#'+webuipopid+' #startDate').val()).getTime();
			var VarEndDate = new Date($('#'+webuipopid+' #endDate').val()).getTime();
			
			if(VarStartDate>VarEndDate){
				$('#'+webuipopid+' #endDate').addClass('filter-error');
			} else {
				$('#'+webuipopid+' #startDate').removeClass('filter-error');
				$('#'+webuipopid+' #endDate').removeClass('filter-error');
				$('#'+webuipopid).removeClass('in').hide();
				iframeContent.FnApplyFilter(ArrFilters);
			}
		}
		
	} else {
		$('#'+webuipopid).removeClass('in').hide();
		iframeContent.FnApplyFilter(ArrFilters);
	}
		
}

function FnGadgetResetFilters(VarThis){
	var id = $(VarThis).parents('.ues-component').attr('id');
	var iframe = document.getElementById('sandbox-gadget-'+id);
	var iframeContent = (iframe.contentWindow || iframe.contentDocument);
	iframeContent.FnResetFilters();
	
	var VarFilterConId = $(VarThis).parents('.ues-toolbar').find('.icon-filter').attr('data-target');
	if(VarFilterConId != undefined){
		$('#'+VarFilterConId+' .filter-content input').each(function(){
			$(this).val('');
			$(this).removeClass('filter-error');
		});
		$('#'+VarFilterConId).removeClass('in').hide();
	}
		
}

function FnGadgetExport(VarThis,VarType){
	var id = $(VarThis).parents('.ues-component').attr('id');
	var iframe = document.getElementById('sandbox-gadget-'+id);
	var iframeContent = (iframe.contentWindow || iframe.contentDocument);
	var VarFileTitle = $('#'+id+' .panel-title').text();
	iframeContent.FnExport(VarFileTitle,VarType);	
	
	var VarFilterConId = $(VarThis).parents('.ues-toolbar').find('.icon-filter').attr('data-target');
	if(VarFilterConId != undefined){
		$('#'+VarFilterConId).removeClass('in').hide();
	}
}

function FnChartExportImage(VarThis){
	var id = $(VarThis).parents('.ues-component').attr('id');
	var iframe = document.getElementById('sandbox-gadget-'+id);
	var iframeContent = (iframe.contentWindow || iframe.contentDocument);
	var VarChart = iframeContent.FnGetKendoChartInstance();
	
	var VarFileTitle = $('#'+id+' .panel-title').text();
		
	VarChart.exportImage().done(function(data) {
		kendo.saveAs({
			dataURI: data,
			fileName: VarFileTitle+".png"
		});
		
	});
}

function FnGridExportExcel(VarThis){
	var id = $(VarThis).parents('.ues-component').attr('id');
	var iframe = document.getElementById('sandbox-gadget-'+id);
	var iframeContent = (iframe.contentWindow || iframe.contentDocument);
	
	var VarGrid = iframeContent.FnGetKendoGridInstance();
	var VarFileTitle = $('#'+id+' .panel-title').text();
	VarGrid.setOptions({
          excel: {
                fileName: VarFileTitle+".xlsx",
                filterable: true,
				allPages:true
            }
    });
	VarGrid.saveAsExcel();
}

function FnGridExportPDF(VarThis){
	var id = $(VarThis).parents('.ues-component').attr('id');
	var iframe = document.getElementById('sandbox-gadget-'+id);
	var iframeContent = (iframe.contentWindow || iframe.contentDocument);
	
	var VarGrid = iframeContent.FnGetKendoGridInstance();
	
	VarGrid.saveAsPDF();
}

function FnSetCurrentDay(){
        
	var weekday=new Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
    var objDate = new Date();
	locale = "en-us";
    month = objDate.toLocaleString(locale, { month: "long" });
    time = objDate.toLocaleString(locale, { time: "short" });
	var VarCurDate = weekday[objDate.getDay()]+' '+objDate.getDate()+' '+month+' '+objDate.getFullYear();
    $('#header_date').html(VarCurDate).show();
}

function FnGetFacilityList(){
	var VarSiteName = '';	
	$.ajax({
		type: 'POST',
		cache: false,
		async: false,
		contentType: 'application/x-www-form-urlencoded',
		url: GblAppContextPath +'/skysparkfunctions/as-data.jag',
		data: { action: 'site-list' },
		dataType: 'json',
		success:function(response){
			
			if(response.length > 0){
				if(response[0]['error'] == undefined){
					var FacilityLength = response.length;
					var ArrResponse = response;
					VarSiteName = ArrResponse[0]['siteName'];
					if(FacilityLength>1){
						$('#facility-icon-head').parent('button').attr('data-target','#facilityModal').css('cursor','pointer');
					} else {
						$('#facility-icon-head').parent('button').removeAttr('data-target').css('cursor','default');
					}
					$('#facilityModalContainer').show();
				} else {
					if(response[0]['error']=='no site'){
						
						$('#facility-icon-head').parent('button').css('display','none');
						$('#dbnotification-content').html("<div class='alert alert-danger text-center'>You doesn't have Facility access.Please contact your Organization Admin.<a href='"+GblAppContextPath +"/logout"+ues.global.dashboard.id+"'>Logout</a></div>");
						$('#dbnotification').modal({
							show: 'true',
							backdrop:'static',
							keyboard: false
						});
						
					} else if(response[0]['error']=='Session Expire'){
						$('#facility-icon-head').parent('button').css('display','none');
						$('#dbnotification-content').html("<div class='alert alert-danger text-center'>Session Expire.<a href='"+GblAppContextPath +"/logout"+ues.global.dashboard.id+"'>Logout</a></div>");
						$('#dbnotification').modal({
							show: 'true',
							backdrop:'static',
							keyboard: false
						});
					}
					$('#facilityModalContainer').hide();
				}
			} else {
				$('#facility-icon-head').parent('button').css('display','none');
				$('#dbnotification-content').html("<div class='alert alert-danger text-center'>Server Error.<a href='"+GblAppContextPath+"/logout"+ues.global.dashboard.id+"'>Logout</a></div>");
				$('#dbnotification').modal({
					show: 'true',
					backdrop:'static',
					keyboard: false
				});
				$('#facilityModalContainer').hide();
			}
		},
		error:function(xhr,status,error){
			console.log('Error');
		}
	});
	
	return VarSiteName;
}

function FnGetLastDay(VarYear, VarMonth){
	var date = new Date(VarYear, VarMonth, 0);
	var VarDate = date.getFullYear()+'-'+(date.getMonth() + 1 )+'-'+date.getDate();
	return VarDate;
}