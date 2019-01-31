﻿/// <reference path="utils.js" />
/// <reference path="app.js" />

/**
 * Sidebar toolbar
 */
(function (app, window, $) {
    var $sidebar = $('.sidebar');
    var $toolbar = $('.sidebar-toolbar', $sidebar);
    var $connectionSelect = $('.select-connection', $sidebar);

    // Refresh database list
    $('.refresh-databases-btn', $toolbar).click(function () {
        if (app.state.currentConnection) {
            if (app.state.currentConnection.raw) {
                loading.show('Getting Databases...');
                os.emit('list-databases', app.state.currentConnection.raw);
            }
        } else {
            bsAlert('No connection selected');
        }
    });

    // Toggle all databases selection
    $('.toggle-all-db-btn', $toolbar).click(function () {
        var $this = $(this);
        var $i = $('i', $this);

        if ($i.hasClass('fa-check-square-o')) {
            app.emit('toggle-all-databases', true);
            $i.removeClass('fa-check-square-o').addClass('fa-square-o');
        } else {
            app.emit('toggle-all-databases', false);
            $i.removeClass('fa-square-o').addClass('fa-check-square-o');
        }
    });

    // Reset select all icon. Only "unselect all" when all dbs are selected.
    app.on('db-list-selection-changed', function (total, selected, visible) {
        if (total === selected) {
            $('.toggle-all-db-btn i', $toolbar).removeClass('fa-check-square-o').addClass('fa-square-o');
        } else {
            $('.toggle-all-db-btn i', $toolbar).removeClass('fa-square-o').addClass('fa-check-square-o');
        }
    });

    // Sort database list
    $('.sort-db-list-btn', $toolbar).click(function () {
        var $this = $(this);
        var $i = $('i', $this);

        if ($i.hasClass('fa-sort-alpha-asc')) {
            app.emit('sort-db-list', false);
            $i.removeClass('fa-sort-alpha-asc').addClass('fa-sort-alpha-desc');
        } else {
            app.emit('sort-db-list', true);
            $i.removeClass('fa-sort-alpha-desc').addClass('fa-sort-alpha-asc');
        }
    });

    // Reset to sort asc icon
    app.on('db-list-rendered', function (dbLst) {
        $('.sort-db-list-btn i', $toolbar).removeClass('fa-sort-alpha-desc').addClass('fa-sort-alpha-asc');
    });

    // Set the connection select to the specified value
    function setConnectionSelect(val) {
        $('option', $connectionSelect).prop('selected', false);

        if (val && val !== 'select') {
            $connectionSelect.val(val);
            $(`option[value="${val}"]`, $connectionSelect).prop('selected', true);
        } else {
            $connectionSelect.val('select');
            $('option[value="select"]', $connectionSelect).prop('selected', true);
        }
    }


    // Set the connection select to "select" and clear the db list
    function resetConnectionSelect() {
        app.setCurrentConnection(null);
        setConnectionSelect('select');
    }

    // Handle connection selection
    $connectionSelect.change(function () {
        var selectedConnId = $('option:selected', $connectionSelect).val();

        // Clear db list
        if (selectedConnId === 'select') return resetConnectionSelect();

        // Open connection dialog
        if (selectedConnId === 'new') {
            if (app.state.currentConnectionId) {
                // Go back to previously selected connection
                setConnectionSelect(app.state.currentConnectionId);
            } else {
                setConnectionSelect('select');
            }
            app.emit('open-connections-modal');
        } else {
            // List databases
            var conn = app.getConnection(selectedConnId);
            if (conn) {
                let previousConnection = app.state.currentConnection;
                app.setCurrentConnection(conn);
            } else {
                resetConnectionSelect();
            }
        }
    });


    function renderConnectionSelect() {
        $connectionSelect.html('<option value="select">Select Connection</option><option value="new">New...</option>');

        app.state.connections.forEach(function (c) {
            $('<option value="' + c.id + '">' + c.name + '</option>').appendTo($connectionSelect);
        });

        if (app.state.currentConnection) {
            setConnectionSelect(app.state.currentConnection.id);
        } else {
            resetConnectionSelect();
        }
    }

    app.on(['connection-added', 'connection-updated', 'connection-removed'], function (conn) {
        renderConnectionSelect();
    });

    app.on('connection-changed', function (current, previous) {
        setConnectionSelect((current || {}).id);
    });

    // Initialization
    if (app.state.connections.length) renderConnectionSelect();
}(app, window, window.jQuery));