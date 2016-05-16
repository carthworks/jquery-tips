function FnMakeAjaxRequest(url, type, parameters, contenttype, datatype, FnManageList){
	$.ajax({
		type: type,
		cache: true,
		async: false,
		contentType: contenttype,
		url: url,
		data: parameters,
		dataType: datatype,
		success:FnManageList,
		error:FnErrcallback,
		complete:FnAjaxComplete
	});
}

function FnMakeAsyncAjaxRequest(url, type, parameters, contenttype, datatype, FnManageList){
	$.ajax({
		type: type,
		cache: true,
		async: true,
		contentType: contenttype,
		url: url,
		data: parameters,
		dataType: datatype,
		success:FnManageList,
		error:FnErrcallback,
		complete:FnAjaxComplete
	});
}

function MakePostRequest(url,parameters,datatype,FnManageList) {
	$.ajax({
		type: 'POST',
		cache: false,
		async: false,
		contentType: 'application/x-www-form-urlencoded',
		url: url,
		data: parameters,
		dataType: datatype,
		success:FnManageList,
		error:FnErrcallback
	});
}

function MakeGetRequest(url,parameters,datatype,FnManageList) {
	$.ajax({
		type: 'GET',
		cache: false,
		async: false,
		contentType: 'application/x-www-form-urlencoded',
		url: url,
		data: parameters,
		dataType: datatype,
		success:FnManageList,
		error:FnErrcallback
	});
}

function MakeAsynPostRequest(url,parameters,datatype,FnManageList) {
	$.ajax({
		type: 'POST',
		cache: false,
		async: true,
		contentType: 'application/x-www-form-urlencoded',
		url: url,
		data: parameters,
		dataType: datatype,
		beforeSend: function() {
			$('.container').show();
			$('.loadingBg').show();
		},
		success:FnManageList,
		error:FnErrcallback,
		complete: function() {
			$('.loadingBg').hide();
		}
	});
}

function FnAjaxComplete(jqXHR,textStatus){
	var VarResponse = $.parseJSON(jqXHR.responseText);
	if(VarResponse.errorCode != undefined && VarResponse.errorCode=="408"){
		$("#tokenexpiremodal").modal({show: 'true',backdrop:'static',keyboard: false}).find("#tokenexpiremodal-content").html('Your session has expired. Please <a href="'+GblAppRootPath+'logout">log in</a> again');
	}
}

function FnErrcallback() {
	
}

function FnLog(Arr){
	$.each(Arr,function(key,val){
		console.log(val);
	});
	Arr = [];
}

function FnFormatDate(VarDate,VarSeparator){
	var VarResDate = '';
	var currentTime = new Date(VarDate);
	var month = ('0' + (currentTime.getMonth() + 1)).slice(-2);
	var day = ('0' + currentTime.getDate()).slice(-2);
	var year = currentTime.getFullYear();
	VarResDate = year+VarSeparator+month+VarSeparator+day;
	return VarResDate
}

function FnFormatTime(VarDate,VarSeparator){
	//console.clear();
	console.log(VarDate);
	
	/*var VarResTime = '';
	console.clear();
	console.log(VarDate);
	
	var currentTime = new Date(VarDate);
	var hours = ('0' + currentTime.getHours()).slice(-2);
	var minutes = ('0' + currentTime.getMinutes()).slice(-2);
	var seconds = ('0' + currentTime.getSeconds()).slice(-2);
	VarResTime = hours+VarSeparator+minutes+VarSeparator+seconds;
	console.log(VarResTime);
	
	var myDate = new Date(VarDate);
	*/
	//VarResTime =myDate.toLocaleString();
	console.log(VarDate);
	console.log(timeConverter(VarDate));
	return timeConverter(VarDate);
}


function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}



function FnDrawGridView(VarContainer,ArrDatasource,ArrColumns,ObjGridConfig){

	var grid = $(VarContainer).data("kendoGrid");
	if(grid != undefined){
		grid.destroy();
	}
		
	$(VarContainer).kendoGrid({
						dataSource: ArrDatasource,
						columns: ArrColumns,
						allowCopy: ((ObjGridConfig.allowCopy != undefined) ? ObjGridConfig.allowCopy : false),
						columnMenu: ((ObjGridConfig.columnMenu != undefined) ? ObjGridConfig.columnMenu : false),
						filterable: ((ObjGridConfig.filterable != undefined) ? ObjGridConfig.filterable : false),
						groupable: ((ObjGridConfig.groupable != undefined) ? ObjGridConfig.groupable : false),
						sortable: ((ObjGridConfig.sortable != undefined) ? ObjGridConfig.sortable : false),
						editable: ((ObjGridConfig.editable != undefined) ? ObjGridConfig.editable : false),
						height: ((ObjGridConfig.height != undefined) ? ObjGridConfig.height : 0),
						noRecords: ((ObjGridConfig.noRecords != undefined) ? ObjGridConfig.noRecords : true),
						messages: ((ObjGridConfig.messages != undefined) ? { noRecords: ObjGridConfig.messages } : { noRecords: "<div class='Metronic-alerts alert alert-info fade in'> <i class='fa-lg fa fa-warning'></i> There is no data on current page </div>" }),
						mobile: ((ObjGridConfig.mobile != undefined) ? ObjGridConfig.mobile : false),
						pageable: ((ObjGridConfig.pageable != undefined) ? ObjGridConfig.pageable : false),
						reorderable: ((ObjGridConfig.reorderable != undefined) ? ObjGridConfig.reorderable : false),
						resizable: ((ObjGridConfig.resizable != undefined) ? ObjGridConfig.resizable : false),
						scrollable: ((ObjGridConfig.scrollable != undefined) ? ObjGridConfig.scrollable : true),
						selectable: ((ObjGridConfig.selectable != undefined) ? ObjGridConfig.selectable : false),
						
						
						
						
	});
	
	$(VarContainer+" .k-grid-content").mCustomScrollbar({
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
	
}

function FnAssetGridExpand(e){
      return '<span style="float:left;padding:3px 10px;display:inline-block;font-size:15px;">Point Details</span><a class="k-button" href="#" id="toolbar-add_user"  title="Expand" onclick="FnResAssetGridExpand()"><span class="glyphicon glyphicon-fullscreen"></span></a>';
 };
 
 
var VarIsTrue=true ;
 function FnResAssetGridExpand(){	
	 var grid = $("#genset-gridview").data("kendoGrid");
	 
	 if (VarIsTrue){	
		//console.log('1 '+VarIsTrue);	 
		grid.setOptions({
			  height: 530
		});
		$('#genset-gridview').css({'margin':'10px' });
		$('#gensetLiveData').css({'height':'556px' });
		$('#genset-grid-toggle').removeClass('col-md-4').addClass('col-md-12').css({'padding':'0','height':'auto'});
		$('#asset-alarms-toggle').removeClass('col-md-4').addClass('col-md-12');
		$('#gProperties, #asset-alarms-toggle').hide();
		$('#genset-grid-toggle').removeClass('col-md-12').addClass('col-md-6');
		$('#gapps-chart').removeClass('col-md-12').addClass('col-md-6').css({'padding':'0px 0px 0px 6px'});
		$('#xpand-view').removeClass('col-md-9').addClass('col-md-12').css({'padding':'0px 8px' });
		VarIsTrue=false; 
	 }
	 else{
		// console.log('2 '+VarIsTrue);
		 grid.setOptions({
			  height: 340
			});
			$('#gensetLiveData').css({'height':'310px' });
		$('#genset-grid-toggle').removeClass('col-md-12').addClass('col-md-6');
		$('#asset-alarms-toggle').removeClass('col-md-12').addClass('col-md-4');
		$('#genset-grid-toggle').css('height','360');
		$('#gProperties,  #asset-alarms-toggle').show();
		$('#genset-grid-toggle').removeClass('col-md-6').addClass('col-md-12');
		
		$('#gapps-chart').removeClass('col-md-6').addClass('col-md-12').css({'padding':'0px 6px 0px 0px'});
		$('#xpand-view').removeClass('col-md-12').addClass('col-md-9');
		VarIsTrue=true;		 
	 }
     
};

function FnExportGridExcel(VarContainerId,VarFileName){
	var ObjGridInstance = FnGetComponentInstance(VarContainerId);
	ObjGridInstance.setOptions({
					  excel: {
							fileName: VarFileName+".xlsx",
							filterable: true,
							allPages:true
						}
    });
	ObjGridInstance.saveAsExcel();
}

function FnGetComponentInstance(VarContainerId){
	var VarDateRole = $(VarContainerId).attr('data-role');
	if(VarDateRole == 'grid'){
		return $(VarContainerId).data("kendoGrid");
	} else if(VarDateRole == 'chart'){
		return $(VarContainerId).getKendoChart();
	} else if(VarDateRole == 'radialgauge'){
		return $(VarContainerId).getKendoRadialGauge();
	}
}


function FnGetExportTemplateInstance(){
	return $(".content-wrapper");
}

function FnParseResponse(ArrData){
	var ArrResponse = [];
	$.each(ArrData,function(key,obj){
		var timestamp = (obj.ts).split(' ');
		var timestamp1 = new Date(timestamp[0].toLocaleString());
		obj['date'] = timestamp1.getFullYear()+'-'+timestamp1.getMonth()+'-'+timestamp1.getDate();
		obj['time'] = timestamp1.getHours()+':'+timestamp1.getMinutes()+':'+timestamp1.getSeconds();
		ArrResponse.push(obj);
	});
	return ArrResponse;
}


function FnDateProcess(VarFlag, VarDays){
	var date = new Date();
	
	if(VarFlag == 'current'){
		var VarDate = date.getFullYear()+'-'+(date.getMonth() + 1 )+'-'+date.getDate();		
	
	} else if(VarFlag == 'prev'){
		var VarDate1 =  new Date(date.getTime() - VarDays*24*60*60*1000);
		var VarDate = VarDate1.getFullYear()+'-'+(VarDate1.getMonth() + 1)+'-'+VarDate1.getDate();
	} else if(VarFlag == 'next'){
		var VarDate1 =  new Date(date.getTime() + VarDays*24*60*60*1000);
		var VarDate = VarDate1.getFullYear()+'-'+(VarDate1.getMonth() + 1)+'-'+VarDate1.getDate();
	}
	
	return VarDate;
	
}

function FnAssetDateProcess(VarFlag, VarDays){
	var date = new Date();	
	if(VarFlag == 'current'){
	//	var VarDate = date.getFullYear()+'-'+(date.getMonth() + 1 )+'-'+date.getDate();		
		var VarDate = date.getFullYear()+'/'+(date.getMonth() + 1 )+'/'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
		//console.log(' VarDate : '+VarDate);// 2016/3/279:17:21
		
	} else if(VarFlag == 'prev'){
		var VarDate1 =  new Date(date.getTime() - VarDays*24*60*60*1000);
		var VarDate = VarDate1.getFullYear()+'/'+(VarDate1.getMonth() + 1)+'/'+VarDate1.getDate()+' '+VarDate1.getHours()+':'+VarDate1.getMinutes()+':'+VarDate1.getSeconds();
		
	} else if(VarFlag == 'next'){
		var VarDate1 =  new Date(date.getTime() + VarDays*24*60*60*1000);
		//console.log(' VarDate1 : '+VarDate1);
		
		var VarDate = VarDate1.getFullYear()+'/'+(VarDate1.getMonth() + 1)+'/'+VarDate1.getDate()+' '+VarDate1.getHours()+':'+VarDate1.getMinutes()+':'+VarDate1.getSeconds();
		
		//console.log(' VarDate2 : '+VarDate); //VarDate2 : 2016-3-28 9:28:41  02016/3/27 9:28:41
	}
	
	return VarDate;
	
}



function FnGetYearStartDate(VarYear){
	var date = new Date(VarYear, 0, 1);
	var VarDate = date.getFullYear()+'-'+(date.getMonth() + 1 )+'-'+date.getDate();
	return VarDate;
}

function FnGetLastDay(VarYear, VarMonth){
	var date = new Date(VarYear, VarMonth, 0);
	var VarDate = date.getFullYear()+'-'+(date.getMonth() + 1 )+'-'+date.getDate();
	return VarDate;
}

function FnHandleDateFormat(VarFullDate,VarFlag){
	var month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var dayNames= ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	var dayNames_short= ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
	
    var date = new Date(VarFullDate);
	if(VarFlag == 'MY'){
		var VarDate = month_names_short[date.getMonth()]+' '+date.getFullYear();
	} else if(VarFlag == 'DMDY'){
		var VarDate = dayNames_short[date.getDay()]+', '+month_names_short[date.getMonth()]+' '+date.getDate()+' '+date.getFullYear();
	} else if(VarFlag == 'MDY'){
		var VarDate = month_names_short[date.getMonth()]+' '+date.getDate()+' '+date.getFullYear();
	} else if(VarFlag == 'MYF'){
		var VarDate = month_names[date.getMonth()]+' '+date.getFullYear();
	}
	return VarDate;
}

function FnHandleTimeFormat(VarFullDate,VarFullTime,VarFlag){
	
	var date = new Date(VarFullDate+' '+VarFullTime);
	
	if(VarFlag == 'HM'){
	
		var VarTime = ("0" +date.getHours()).slice(-2)+':'+("0" +date.getMinutes()).slice(-2);
	}
		
	return VarTime;
}

function FnGetUniqueArray(Arr){
	var ArrResult = [];
	$.each(Arr, function(i, item){
		if ($.inArray(item,ArrResult) === -1){
			ArrResult.push(item);
		}
	});
	
	ArrResult = ArrResult.sort();
	return ArrResult;	
}

function FnGetDateDifference(VarStartDate,VarEndDate){

	//Get 1 day in milliseconds
	var one_day=1000*60*60*24;
	
	// Convert both dates to milliseconds
	var date1_ms = new Date(VarStartDate).getTime();
	var date2_ms = new Date(VarEndDate).getTime();
	
	// Calculate the difference in milliseconds
	var difference_ms = date2_ms - date1_ms;
	
	// Convert back to days and return
	return Math.round(difference_ms/one_day); 
}

function FnExport(VarFileTitle,VarType){
	$('.gadget-title').remove();
	if(VarType == 'PDF'){
		
		$('.chart-wrapper').prepend('<div class="gadget-title">'+VarFileTitle+'</div>');
		
		/*if($('.chart-wrapper #preecm').length > 0){
			if($('.chart-wrapper #preecm').hasClass("col-xs-12")){
				$('.chart-wrapper #preecm').removeClass('col-xs-12').addClass('col-md-12');
				$('.chart-wrapper #postecm').removeClass('col-xs-12').addClass('col-md-12');
			} else if($('.chart-wrapper #preecm').hasClass("col-xs-6")){
				$('.chart-wrapper #preecm').removeClass('col-xs-6').addClass('col-md-6');
				$('.chart-wrapper #postecm').removeClass('col-xs-6').addClass('col-md-6');
			}
		}*/
		
		kendo.drawing.drawDOM($(".content-wrapper"))
        .then(function(group) {
			
            return kendo.drawing.exportPDF(group, {
                paperSize: "auto",
				multiPage: true,
                margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" }
				
            });
        })
        .done(function(data) {
           
            kendo.saveAs({
                dataURI: data,
                fileName: VarFileTitle+".pdf",
				
            });
			
			$('.gadget-title').remove();
			
			/*if($('.chart-wrapper #preecm').length > 0){
				if($('.chart-wrapper #preecm').hasClass("col-md-12")){
					$('.chart-wrapper #preecm').removeClass('col-md-12').addClass('col-xs-12');
					$('.chart-wrapper #postecm').removeClass('col-md-12').addClass('col-xs-12');
				} else if($('.chart-wrapper #preecm').hasClass("col-md-6")){
					$('.chart-wrapper #preecm').removeClass('col-md-6').addClass('col-xs-6');
					$('.chart-wrapper #postecm').removeClass('col-md-6').addClass('col-xs-6');
				}
			}*/
			
        }); 
		
		
	} else if(VarType == 'IMG'){
	
		$('.chart-wrapper').prepend('<div class="gadget-title">'+VarFileTitle+'</div>');
		
		/*if($('.chart-wrapper #preecm').length > 0){
			if($('.chart-wrapper #preecm').hasClass("col-xs-12")){
				$('.chart-wrapper #preecm').removeClass('col-xs-12').addClass('col-md-12');
				$('.chart-wrapper #postecm').removeClass('col-xs-12').addClass('col-md-12');
			} else if($('.chart-wrapper #preecm').hasClass("col-xs-6")){
				$('.chart-wrapper #preecm').removeClass('col-xs-6').addClass('col-md-6');
				$('.chart-wrapper #postecm').removeClass('col-xs-6').addClass('col-md-6');
			}
		}*/
	
		kendo.drawing.drawDOM($(".content-wrapper"))
        .then(function(group) {
            // Render the result as a PNG image
            return kendo.drawing.exportImage(group);
        })
        .done(function(data) {
            // Save the image file
            kendo.saveAs({
                dataURI: data,
                fileName: VarFileTitle+".png"
            });
			
			$('.gadget-title').remove();
			
			/*if($('.chart-wrapper #preecm').length > 0){
				if($('.chart-wrapper #preecm').hasClass("col-md-12")){
					$('.chart-wrapper #preecm').removeClass('col-md-12').addClass('col-xs-12');
					$('.chart-wrapper #postecm').removeClass('col-md-12').addClass('col-xs-12');
				} else if($('.chart-wrapper #preecm').hasClass("col-md-6")){
					$('.chart-wrapper #preecm').removeClass('col-md-6').addClass('col-xs-6');
					$('.chart-wrapper #postecm').removeClass('col-md-6').addClass('col-xs-6');
				}
			}*/
			
        });
	
	}	
}

function FnInitOnLoadGadget(){
	//gadgets.window.adjustHeight();
	$('.container').hide();
	$('#'+gadgets.rpc.RPC_ID, window.parent.document).closest('.ues-component-box-gadget').siblings('div.ues-toolbar').show();
	window.parent.$('.facilityicon').parent('button').attr('disabled',false);
}

function FnManageGadgetIcons(VarChart,VarGrid){
	var VarChartView = prefs.getString("dataview");
	
	if(VarChartView!='grid'){
	
		$('#'+gadgets.rpc.RPC_ID, window.parent.document).closest('.ues-component-box-gadget').siblings('div.ues-toolbar').children('ul#exportgridpdf').hide();
		$('#'+gadgets.rpc.RPC_ID, window.parent.document).closest('.ues-component-box-gadget').siblings('div.ues-toolbar').children('ul#exportgridexcel').hide(); 
		$('#'+gadgets.rpc.RPC_ID, window.parent.document).closest('.ues-component-box-gadget').siblings('div.ues-toolbar').children('ul#exportchartpdf').show();
		$('#'+gadgets.rpc.RPC_ID, window.parent.document).closest('.ues-component-box-gadget').siblings('div.ues-toolbar').children('ul#exportchartimage').show();
		$(VarGrid).hide();
		$(VarChart).show();
		
	} else {
	
		$('#'+gadgets.rpc.RPC_ID, window.parent.document).closest('.ues-component-box-gadget').siblings('div.ues-toolbar').children('ul#exportchartpdf').hide();
		$('#'+gadgets.rpc.RPC_ID, window.parent.document).closest('.ues-component-box-gadget').siblings('div.ues-toolbar').children('ul#exportchartimage').hide();
		$('#'+gadgets.rpc.RPC_ID, window.parent.document).closest('.ues-component-box-gadget').siblings('div.ues-toolbar').children('ul#exportgridpdf').show();
		$('#'+gadgets.rpc.RPC_ID, window.parent.document).closest('.ues-component-box-gadget').siblings('div.ues-toolbar').children('ul#exportgridexcel').show(); 
		$(VarChart).hide();
		$(VarGrid).show();
		
	}	
}

function FnGenerateSeriesColors(VarLength){
	var ArrColors = [];
	var VarTmpCnt = VarLength;
	for(var i=0; i<VarTmpCnt; i++){
		var VarColor = getRandomColor();
		if($.inArray(VarColor,ArrColors) == -1){
			ArrColors.push(VarColor);
		} else {
			VarTmpCnt++;
		}
	}
	return ArrColors;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function FnGetSeriesColor(VarLength){
		
	/*var ArrColors = ["#95E71E","#008000","#00008B","#8b0000","#008b8b","#618A2B","#FFD501","#870698","#ff1493","#B8860B","#9e005d","#FF6F01","#0088cf","#BC8F8F","#333130","#09FDBC","#7405FC","#6c7a89","#d34141","#00b5dd","#f22613","#344e86","#2ecc71","#0000FF","#D2527F","#4B0082","#FF00FF","#D6D305","#05FDE7"];*/
	
	var ArrColors = 
	["#b5d568","#fcaf29","#d4d6bd","#7b2f0e","#e4c5e7","#979c64","#976b49","#08413c","#95E71E","#008000","#00008B","#8b0000","#008b8b","#618A2B","#FFD501","#870698","#ff1493","#B8860B","#9e005d","#FF6F01","#0088cf","#BC8F8F","#333130","#09FDBC","#6c7a89","#d34141","#00b5dd","#f22613","#344e86","#2ecc71","#D2527F","#4B0082",,"#D6D305","#05FDE7"];
	
	var ArrseriesColor = [];
	for(var i=0; i<VarLength; i++){
		ArrseriesColor.push(ArrColors[i]);
	}
	return ArrseriesColor;
}

function FnFindCatAxisLength(VarContainer,VarLength){
	var VarWidth = parseInt($(VarContainer).width());
	
	if(VarWidth<350){
		var VarCatAxisCount = (VarLength > 4) ? 4 : (VarLength - 1);
	} else if(VarWidth >= 351 && VarWidth <= 570){
		var VarCatAxisCount = (VarLength > 7) ? 7 : (VarLength - 1);
	} else if(VarWidth >= 571 && VarWidth <= 767){
		var VarCatAxisCount = (VarLength > 14) ? 14 : (VarLength - 1);
	} else if(VarWidth >= 768 && VarWidth <= 991){
		var VarCatAxisCount = (VarLength > 29) ? 29 : (VarLength - 1);
	} else if(VarWidth >= 992 && VarWidth <= 1199){
		var VarCatAxisCount = (VarLength > 23) ? 23 : (VarLength - 1);
	} else if(VarWidth >= 1200){
		var VarCatAxisCount = (VarLength > 49) ? 49 : (VarLength - 1);
	}
	
	return VarCatAxisCount;
}

function FnReSizeChart(VarChart,VarCatAxisLength){
	
	var chart = $(VarChart).data("kendoChart");
	chart.setOptions({ categoryAxis: {min: 0,max:VarCatAxisLength} });
}

function FnResizeGrid(VarGrid,VarHeight){
	var grid = $(VarGrid).data("kendoGrid");
    grid.setOptions({height: VarHeight });
	//$(".k-grid-content").css("overflow-y", "hidden").mCustomScrollbar();
	$(".k-grid-content").mCustomScrollbar("update");
}

function FnAllowFloatingNumbers(sender, evt) {
    var txt = sender.value;
    var dotcontainer = txt.split('.');
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (!(dotcontainer.length == 1 && charCode == 46) && charCode > 31 && (charCode < 48 || charCode > 57))
        return false;

    return true;
}

var ArrSpecialKeys = [ 8, 9, 46, 36, 35, 37, 39 ]; // Backspace, Tab, Delete, Home, End, left arrow, right arrow
function FnAllowAlphaNumericOnly(e) {
	var keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;
	return (keyCode == 43 || (keyCode >= 48 && keyCode <= 57)
			|| (keyCode >= 65 && keyCode <= 90)
			|| (keyCode >= 97 && keyCode <= 122) || (ArrSpecialKeys
			.indexOf(e.keyCode) != -1 && e.charCode != e.keyCode));
}

function FnAllowAlphabetsOnly(e){
	var keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;
	return ((keyCode >= 65 && keyCode <= 90)
			|| (keyCode >= 97 && keyCode <= 122) || (ArrSpecialKeys
			.indexOf(e.keyCode) != -1 && e.charCode != e.keyCode));
}

function FnAllowNumbersOnly(e) {
	var keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;
	return (keyCode == 43 || (keyCode >= 48 && keyCode <= 57) || (ArrSpecialKeys
			.indexOf(e.keyCode) != -1 && e.charCode != e.keyCode));
}

var ArrSpecialKeysNospaceBetween = [ 8, 9, 46, 36,  37, 39 ]; // Backspace, Tab, Delete, Home, End, left arrow, right arrow
function FnAllowAlphaNumericOnlyNospaceBetween(e) {	
	//console.log(e.charCode);
	var keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;	
	return (keyCode == 43 || (keyCode >= 48 && keyCode <= 57)
			|| (keyCode >= 65 && keyCode <= 90)
			|| (keyCode >= 97 && keyCode <= 122) || (ArrSpecialKeysNospaceBetween
			.indexOf(e.keyCode) != -1 && e.charCode != e.keyCode));
}

var ArrIllegalChars = [ 33, 64, 35, 36, 37, 94, 38,42,40,41  ]; // Backspace, Tab, Delete, Home, End, left arrow, right arrow
var ccount=0;
var KeyType="";

function FnAllowAlphaNumericOnlyWithNoSplCharFirst(e) {		

	var keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;	
	KeyType =String.fromCharCode(e.keyCode)
	ccount=ccount+1;
	if (ccount >1){	
		//console.log('not first char'+ccount);		
		}
		else{
			if (ArrIllegalChars.indexOf(e.keyCode) != -1){
				console.info('no allowinf spl chr as first char');				
			}
		}
	return (keyCode == 95 || keyCode == 45 || keyCode == 43 || (keyCode >= 48 && keyCode <= 57)
			|| (keyCode >= 65 && keyCode <= 90)
			|| (keyCode >= 97 && keyCode <= 122) || (ArrSpecialKeys.indexOf(e.keyCode) != -1 && e.charCode != e.keyCode));
}

function FnTrim(VarStr) {
	return $.trim(VarStr);
}

var notificationMsg;
function initNotifications() {
	notificationMsg = $("#notificationMsg").kendoNotification({
		position : {
			pinned : true,
			top : 60,
			right:30
		},
		allowHideAfter : 1000,
		//autoHideAfter: 0,
		width:300,
		stacking : "down",
		templates : [ {
			type : "error",
			template : $("#errorTemplate").html()
		}, {
			type : "success",
			template : $("#successTemplate").html()
		}, {
			type : "info",
			template : $("#infoTemplate").html()
		}]

	}).data("kendoNotification");

}

function FnShowNotificationMessage(ObjError){
	notificationMsg.hide();
	if(ObjError.errorCode != undefined){
		if(ObjError.errorCode == "500"){
			notificationMsg.show({
				message : ObjError['errorMessage']
			}, 'info');
		} else {
			notificationMsg.show({
				message : ObjError['errorMessage']
			}, 'error');
		}
	}
}

function FnRedirect(VarUrl,VarMSecs){
	setTimeout(function(){ window.location=VarUrl; }, VarMSecs);
}

function FnFormRedirect(VarFormId,VarMSecs){
	setTimeout(function(){ $('#'+VarFormId).submit(); }, VarMSecs);
}

function FnFindObjectFromArray(Array,keyName){

	var ObjRes = $.grep(Array,function(item){ 
		if(item.key == keyName){
			return item;
		}
	});
	
	return ObjRes;
}

function FnConvertMilliSecondsToDate(VarTime,VarDateFormat){
	var t = new Date(VarTime);
    var tf = function (i) { return (i < 10 ? '0' : '') + i };
            return VarDateFormat.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
                switch (a) {
                    case 'yyyy':
                        return tf(t.getFullYear());
                        break;
                    case 'MM':
                        return tf(t.getMonth() + 1);
                        break;
                    case 'mm':
                        return tf(t.getMinutes());
                        break;
                    case 'dd':
                        return tf(t.getDate());
                        break;
                    case 'HH':
                        return tf(t.getHours());
                        break;
                    case 'ss':
                        return tf(t.getSeconds());
                        break;
                }
            });
}

function animationHover(element, animation){	
	 element = $(element);
	 element.hover(
			function() {
			  element.addClass('animated ' + animation);
			},
			function(){			 
			  window.setTimeout( function(){
				element.removeClass('animated ' + animation);
			  }, 2000);
			}
		  );
}

function animationClick(element, animation){
	 element = $(element);
	 element.click(
			function() {
			  element.addClass('animated ' + animation);
			},
			function(){			 
			  window.setTimeout( function(){
				element.removeClass('animated ' + animation);
			  }, 2000);
			}
		  );
}

function FnBreadCrumbHome(){
	$("#breadcrumb-home").submit();
}

function FnNavigateTargetPage(VarTargetPage){
	if(VarTargetPage != ''){
		$('form#gapp-tenant-info').attr('action',VarTargetPage);
		$('form#gapp-tenant-info').submit();
	}
}

function toDateFormat(time, format) {
	var date = new Date(Number(time));
	return date.toUTCString();
}

/*function toDateFormatRemoveGMT(time, format) {
	var date = new Date(Number(time));
    var fdate= date.toUTCString();  
    var resDate =fdate.slice(0, -4);
	return resDate;  
}*/

// Fn to check whether a value is a number in  jquery
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// Fn to add a zero if input is single digig in  jquery
function FnAddZero(item){		
	return (item<10 ? "0"+item : item);	
}

function toDateFormatRemoveGMT(time, format) {	
  var date = new Date(Number(time));  
  
  var month = date.getUTCMonth() + 1; //months from 1-12
  var day = date.getUTCDate();
  var year = date.getUTCFullYear();

  var hours = date.getUTCHours();
  var minutes = date.getUTCMinutes();
  var seconds = date.getUTCSeconds();

  var newdate = year + "-" + FnAddZero(month) + "-" + FnAddZero(day) + "   " +  FnAddZero(hours) + ":" +  FnAddZero(minutes) + ":" +  FnAddZero(seconds); 

	return newdate;  
}

function FntoGMTAlone(time, format) {	
  var date = new Date(Number(time));  
  var month = date.getUTCMonth() + 1; //months from 1-12
  
  var hours = date.getUTCHours();
  var minutes = date.getUTCMinutes();
  var seconds = date.getUTCSeconds();
  
  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}  
  
  var newdate =  hours + ":" + minutes + ":" + seconds;
	return newdate;  
}

function FnGMTtime(time, format) {
  var date = new Date();  
  var month = date.getUTCMonth() + 1; //months from 1-12 
  var hours = date.getUTCHours();
  var minutes = date.getUTCMinutes();
  var seconds = date.getUTCSeconds();  
  var newdate = hours + ":" + minutes + ":" + seconds;
	return newdate;  
}

function FnGetCurrentTime(){
  var date = new Date();
        var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        var am_pm = date.getHours() >= 12 ? "PM" : "AM";
        hours = hours < 10 ? "0" + hours : hours;
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        time = hours + ":" + minutes + ":" + seconds;
		return time;
  
}


function FnToUTC(/*Date*/date) {
    return Date.UTC(
        date.getFullYear()
        , date.getMonth()
        , date.getDate()
        , date.getHours()
        , date.getMinutes()
        , date.getSeconds()
        , date.getMilliseconds()
    );
}




function toDateFormatChart(d, format) {
	
if(typeof d === 'number') d = new Date(d);
  if(!(d instanceof Date)) return d;
  function pad(n){return n<10 ? '0'+n : n}
  return pad(d.getDate())+'/'
        + pad(d.getMonth()+1)+'/'
        + d.getFullYear()+" ";
}
  
//to set decimal width
function precise_round(num, decimals) {
	var t=Math.pow(10, decimals);   
	return (Math.round((num * t) + (decimals>0?1:0)*(Math.sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);
}

function FnConvertLocalToUTC(VarDate){
//	console.log('0'+VarDate); //02016-3-28 9:28:41  need ed format 02016/3/27 9:28:41
	var VarTmpDate = new Date(VarDate);	
	//var VarTmpDate = new Date('2001/01/31 12:00:00 AM')
	//console.log('1'+VarTmpDate);
	var date = new Date(VarTmpDate.getFullYear(), VarTmpDate.getMonth(), VarTmpDate.getDate(), 0, 0, 0, 0).getTime();
	//console.log('2 '+date);
	
	var VarStamp = parseInt(date - (VarTmpDate.getTimezoneOffset() * 60000));
	//console.log('3 '+VarStamp);
	return VarStamp;
}

//For getting Timestamp with time in Asset history, Asset Monitoring-Ploat History, Alarm Monitoring
function FnConvertLocalToUTCTime(VarDate){
	var VarTmpDate = new Date(VarDate);	
	var date = new Date(VarTmpDate.getFullYear(), VarTmpDate.getMonth(), VarTmpDate.getDate(), 23, 59, 59, 0).getTime();
	var VarStamp = parseInt(date - (VarTmpDate.getTimezoneOffset() * 60000));
	
	return VarStamp;
}

function FnAllowIPNumbersOnly(inputText,inputId,errorId) {
	$('#'+errorId).html('');
	if(inputText !== ''){
		var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;  
		if(inputText.match(ipformat)){  
			return true;
		}  
		else  
		{  
			$('#'+inputId).val('');
			$('#'+errorId).html('<span class="help-block"><code>Invalid IP Address</code>');
			return true;
		}
	} 
return true;
}

function FnNotAllowNumeric(e){
	e = e || window.event;
	var charCode = (typeof e.which == "undefined") ? e.keyCode : e.which;
	var charStr = String.fromCharCode(charCode);
	if (/\d/.test(charStr)) {
		return false;
	}
}

function FnCheckEmptyFrmFields(strFrmFields, FrmButtonId){
	$(strFrmFields).bind('keyup change', function() {
		if(allFilled(strFrmFields)) {
			$(FrmButtonId).removeAttr('disabled');
		} else {
			$(FrmButtonId).prop('disabled', true);
		}
	});
}

function allFilled(strFrmFields) {
	var filled = true;
	$(strFrmFields).each(function() {
		if ($(this).val() == '' || $(this).val() == null || undefined == $(this).val()) {
			filled = false;
		}
	});
	return filled;
}
	

		

