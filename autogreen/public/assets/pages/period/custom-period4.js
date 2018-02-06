/*'use strict';
$(window).on('resize',function(){
  setTimeout(function(){
    window.lineChart.redraw();
  }, 500);
});

$(document).ready(function() {
  linechart();
  $(".icofont-refresh").on("click",linechart);
  document.querySelector('.alert-confirm').onclick = function(){
    swal({
          title: "엑셀출력 하시겠습니까?",
          text: "현재 리스트가 엑셀출력 됩니다.",
          type: "warning",
          showCancelButton: true,
          confirmButtonClass: "btn-danger",
          confirmButtonText: "YES",
          closeOnConfirm: false
        },
        function(){//엑셀 출력하겠다고 할 시 진행 함수
          swal("Success!", "엑셀출력 되었습니다.", "success");
        });
  };
});

line
function linechart(){
  $("#line-chart1").empty();
  window.lineChart = Morris.Line({
      element: 'line-chart1',
      data: [
        {period: '2017-10-10',Facebook: 0,Twitter: 0,Instagram: 0},
        {period: '2017-10-11',Facebook: 50,Twitter: 15,Instagram: 5},
        {period: '2017-10-12',Facebook: 20,Twitter: 50,Instagram: 65},
        {period: '2017-10-13',Facebook: 60,Twitter: 12,Instagram: 7},
        {period: '2017-10-14',Facebook: 30,Twitter: 20,Instagram: 120},
        {period: '2017-10-15',Facebook: 25,Twitter: 80,Instagram: 40},
        {period: '2017-10-16',Facebook: 10,Twitter: 10,Instagram: 10}
      ],
      xkey: 'period',
      redraw: true,
      ykeys: ['Facebook', 'Twitter', 'Instagram'],
      hideHover: 'auto',
      labels: ['페이스북', '트위터', '인스타그램'],
      lineColors: ['#3B5998', '#4099FF', '#8632fb']
  });
}
*/