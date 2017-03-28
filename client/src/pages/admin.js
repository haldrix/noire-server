require('../../assets/css/admin.css');
require('../app');
require('../commons/nav');

var userTable, roleTable;

$(document).ready(function() {

    grabDomElements();
    setupUserTableBehaviour();
    setupRoleTableBehaviour();

});

function grabDomElements() {
    userTable = $('.ui.user.table');
    roleTable = $('.ui.role.table');
}

function setupUserTableBehaviour() {

    // delegate table click events on the corresponding row
    userTable.on('click', 'tr', function(event) {

        // api can trigger XHR call..
        /*$(event.currentTarget).api({
            action: 'get user',
            on: 'now'
        });*/

        // .. but actually we want the browser to issue request for a new page
        var userId = $(event.currentTarget) .attr('data-id');
        window.location.href = $.fn.api.settings.api['view user'].replace(/{id}/, userId);
    });
}

function setupRoleTableBehaviour() {

    // delegate table click events on the corresponding row
    roleTable.on('click', 'tr', function(event) {

        var roleId = $(event.currentTarget) .attr('data-id');
        window.location.href = $.fn.api.settings.api['view role'].replace(/{id}/, roleId);
    });
}
