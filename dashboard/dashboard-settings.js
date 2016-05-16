$(function () {

    //var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';

    //var rolesApi = ues.utils.relativePrefix() + 'apis/roles';

    //var dashboard = ues.global.dashboard;

    //var permissions = dashboard.permissions;

    //var viewers = permissions.viewers;

    //var editors = permissions.editors;
	
    //var url = dashboardsApi + '/' + dashboard.id;

    var sharedRoleHbs = Handlebars.compile($("#ues-shared-role-hbs").html() || '');

    var viewer = function (el, role) {
        var permissions = dashboard.permissions;
        var viewers = permissions.viewers;
        viewers.push(role);
        saveDashboard();
        $('#ues-dashboard-settings').find('.ues-shared-view').append(sharedRoleHbs(role));
        el.typeahead('val', '');
    };

    var editor = function (el, role) {
        var permissions = dashboard.permissions;
        var editors = permissions.editors;
        editors.push(role);
        saveDashboard();
        $('#ues-dashboard-settings').find('.ues-shared-edit').append(sharedRoleHbs(role));
        el.typeahead('val', '');
    };

    var initExistingRoles = function () {
        var i;
        var role;

        var html = '';
        var length = viewers.length;
        for (i = 0; i < length; i++) {
            role = viewers[i];
            html += sharedRoleHbs(role);
        }

        var settings = $('#ues-dashboard-settings');
        settings.find('.ues-shared-view').append(html);

        html = '';
        length = editors.length;
        for (i = 0; i < length; i++) {
            role = editors[i];
            html += sharedRoleHbs(role);
        }
        settings.find('.ues-shared-edit').append(html);
    };

    var initUI = function () {
        var viewerRoles = new Bloodhound({
            name: 'roles',
            limit: 10,
            prefetch: {
                url: rolesApi,
                filter: function (roles) {
                    roles.push(ues.global.anonRole);
                    return $.map(roles, function (role) {
                        return {name: role};
                    });
                },
                ttl: 60
            },
            datumTokenizer: function (d) {
                return d.name.split(/[\s\/.]+/) || [];
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });
		
        viewerRoles.initialize();

        //TODO: improve typeahead to use single prefetch for both editors and viewers
        $('#ues-share-view').typeahead(null, {
            name: 'roles',
            displayKey: 'name',
            source: viewerRoles.ttAdapter()
        }).on('typeahead:selected', function (e, role, roles) {
            viewer($(this), role.name);
        }).on('typeahead:autocomplete', function (e, role) {
            viewer($(this), role.name);
        });

        var editorRoles = new Bloodhound({
            name: 'roles',
            limit: 10,
            prefetch: {
                url: rolesApi,
                filter: function (roles) {
                    return $.map(roles, function (role) {
                        return {name: role};
                    });
                },
                ttl: 60
            },
            datumTokenizer: function (d) {
                return d.name.split(/[\s\/.]+/) || [];
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });

        editorRoles.initialize();

        $('#ues-share-edit').typeahead(null, {
            name: 'roles',
            displayKey: 'name',
            source: editorRoles.ttAdapter()
        }).on('typeahead:selected', function (e, role, roles) {
            editor($(this), role.name);
        }).on('typeahead:autocomplete', function (e, role) {
            editor($(this), role.name);
        });

        $('#ues-dashboard-settings').find('.ues-shared-edit').on('click', '.remove-button', function () {
            var el = $(this).closest('.ues-shared-role');
            var role = el.data('role');
            editors.splice(editors.indexOf(role), 1);
            saveDashboard();
            el.remove();
        }).end().find('.ues-shared-view').on('click', '.remove-button', function () {
            var el = $(this).closest('.ues-shared-role');
            var role = el.data('role');
            viewers.splice(viewers.indexOf(role), 1);
            saveDashboard();
            el.remove();
        });

        /*$('#ues-dashboard-title').on('change', function () {
            dashboard.title = $(this).val();
            saveDashboard();
        });*/

        /*$('#ues-dashboard-description').on('change', function () {
            dashboard.description = $(this).val();
            saveDashboard();
        });*/
						
        var menu = $('.ues-context-menu');
        /*menu.find('.ues-tiles-menu-toggle').click(function () {
            menu.find('.ues-tiles-menu').slideToggle();
        });*/
    };

    //initUI();
    //initExistingRoles();
	
	// Form Validation
	$("#ues-dashboard-settings").kendoValidator({
											validateOnBlur : true,
											errorTemplate: "<span class='help-block'><code>#=message#</code></span>"
									});
	
});

function FnSaveSettings(){
	$('#ues-dashboard-create, #gapp-dashboard-cancel').attr('disabled',true);
	var validator = $("#ues-dashboard-settings").data("kendoValidator");
	validator.hideMessages();
	$("#GBL_loading").show();
	if (validator.validate()) {
		dashboard.title = $('#ues-dashboard-title').val();
		dashboard.description = $('#ues-dashboard-description').val();
		saveDashboard();
	} else {
		$('#ues-dashboard-create, #gapp-dashboard-cancel').attr('disabled',false);
		$("#GBL_loading").hide();
		var errors = validator.errors();
		console.log(errors);
		return false;
	}
}

function saveDashboard() {
	var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';

    var url = dashboardsApi + '/' + dashboard.id;
		
	$.ajax({
		url: url,
		method: 'PUT',
		data: JSON.stringify(dashboard),
		contentType: 'application/json'
	}).success(function (data) {
		console.log('dashboard saved successfully');
		
		notificationMsg.show({
			message : 'Dashboard settings saved successfully'
		}, 'success');
		
		FnFormRedirect('gapp-dashboard-list',GBLDelayTime);
		
	}).error(function () {
		console.log('error saving dashboard');
	});
}

function FnCancelSettings(){
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