"use strict";

function FnNavigateTargetPage(VarTargetPage){
	if(VarTargetPage != ''){
		$('#gapp-tenant-info').attr('action',VarTargetPage);
		$('#gapp-tenant-info').submit();
	}
}