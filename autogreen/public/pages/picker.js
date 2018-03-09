// 선언한 TextBox에 DateTimePicker 위젯을 적용한다.
var d = new Date();
var month = d.getMonth();
var day = d.getDate();
var year = d.getFullYear();

$('#fromDate').daterangepicker({
  // singleDatePicker: true,
  showDropdowns: true,
  locale: {
    format: 'YYYY/MM/DD',
    "customRangeLabel": "Custom",
    "daysOfWeek": [
        "일", "월", "화", "수", "목", "금", "토"
    ],
    "monthNames": [
      "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
    ],
  }
});
//
// $('#fromTime').datetimepicker({
// 	locale : 'ko',
// 	format: 'HH:00',
// 	defaultDate : new Date(),
// 	icons : {
// 		time : "icofont icofont-clock-time",
// 		date : "icofont icofont-ui-calendar",
// 		up : "icofont icofont-rounded-up",
// 		down : "icofont icofont-rounded-down",
// 		next : "icofont icofont-rounded-right",
// 		previous : "icofont icofont-rounded-left"
// 	}
// });
