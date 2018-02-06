'use strict';

$(document).ready(function() {
	
  $('#time').timepicker({
    timeFormat: 'HH:mm',
    interval: 60,
    defaultTime:'00:00',
    pick12HourFormat: false,
    pickDate: false,
    pickSeconds: false,
    dynamic: true,
    dropdown: true,
    scrollbar: true
  });
});

