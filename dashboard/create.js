"use strict";

$(document).ready(function(){

	$('#ues-dashboard-create').prop('disabled', true);
	FnCheckEmptyFrmFields('#ues-dashboard-title, #ues-dashboard-id', '#ues-dashboard-create');	
	// Form Validation
	$("#ues-dashboard-form").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>"
									});
									
	var overridden = false;

    var generateUrl = function (title) {
        return title.replace(/[^\w]/g, '-').toLowerCase();
    };
	
	var updateUrl = function () {
        if (overridden) {
            return;
        }
        var title = $('#ues-dashboard-title').val();
        $('#ues-dashboard-id').val(generateUrl(title));
    };
	
	$('#ues-dashboard-title').on('keyup', function () {
        updateUrl();
    }).on('change', function () {
        updateUrl();
    });
	
	$('#ues-dashboard-id').on('keyup', function () {
        overridden = overridden || true;
    });

});

function FnCreateDashboard(){
	$('#ues-dashboard-create, #gapp-dashboard-cancel').attr('disabled',true);
	var validator = $("#ues-dashboard-form").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	if (validator.validate()) {
		var VarDBId = $('#ues-dashboard-id').val();
		$.ajax({
			type: 'POST',
			cache: false,
			async: false,
			contentType: 'application/x-www-form-urlencoded',
			url: "../dashboardexist",
			data: "dbid="+VarDBId,
			dataType: "JSON",
			success: function(response){
				$('#ues-dashboard-create, #gapp-dashboard-cancel').attr('disabled',false);
				$("#GBL_loading").hide();
				if(response==null){
				
					var form = $('#ues-dashboard-form');
					var action = form.attr('action');
					form.attr('action', action + '/' + FnTrim($('#ues-dashboard-id').val()));
					$('#ues-dashboard-form').submit();
					
				} else {
					
					notificationMsg.show({
						message : 'Dashboard Already Exist.'
					}, 'error');
					return false;
				}
				
			},
			error: function(xhr, status, error){
					console.log('error');
			}
		});
			
	} else {
		$('#ues-dashboard-create, #gapp-dashboard-cancel').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function FnCancelDashboard(){
	if(GBLcancel > 0){
		$('#GBLModalcancel #hiddencancelFrm').val('gapp-dashboard-list');
		$('#GBLModalcancel').modal('show');
	} else {
		$('#gapp-dashboard-list').submit();
	}
}

function FnNavigateDashboardList(){
	$('#gapp-dashboard-list').submit();
}