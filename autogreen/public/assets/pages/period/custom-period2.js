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
        {period: '2017-10-10',naver: 0,daum: 0},
        {period: '2017-10-11',naver: 50,daum: 15},
        {period: '2017-10-12',naver: 20,daum: 50},
        {period: '2017-10-13',naver: 60,daum: 12},
        {period: '2017-10-14',naver: 30,daum: 20},
        {period: '2017-10-15',naver: 25,daum: 80},
        {period: '2017-10-16',naver: 10,daum: 10}
      ],
      xkey: 'period',
      redraw: true,
      ykeys: ['naver', 'daum'],
      hideHover: 'auto',
      labels: ['네이버', '다음'],
      lineColors: ['#2ecc71', '#4099FF']
  });
}*/
