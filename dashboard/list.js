"use strict";

function FnManageDashboard(VarFrmAction){
	$('#gapp-dashboard-manage').attr('action',VarFrmAction);
	$('#gapp-dashboard-manage').submit();
}

function FnNavigateDashboardViewer(VarUrl){
	$('#gapp-dashboard-viewer').attr('action',VarUrl);
	$('#gapp-dashboard-viewer').submit();
}
