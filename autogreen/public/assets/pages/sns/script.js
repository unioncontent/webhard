'use strict';
$(window).on('resize',function(){
  setTimeout(function(){
    window.lineChart.redraw();
  }, 500);
});

/*$(document).ready(function() {
  linechart();
  $(".icofont-refresh").on("click",linechart);

  //일괄처리 확인메시지
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
});*/

/*line*/
function linechart(){
  $("#line-chart1").empty();
  window.lineChart = Morris.Line({
      element: 'line-chart1',
      data: [
        {period: '2017-10-10',l1: 0,l2: 0,l3: 0},
        {period: '2017-10-11',l1: 50,l2: 15,l3: 5},
        {period: '2017-10-12',l1: 20,l2: 50,l3: 65},
        {period: '2017-10-13',l1: 60,l2: 12,l3: 7},
        {period: '2017-10-14',l1: 30,l2: 20,l3: 120},
        {period: '2017-10-15',l1: 25,l2: 80,l3: 40},
        {period: '2017-10-16',l1: 10,l2: 10,l3: 10}
      ],
      xkey: 'period',
      redraw: true,
      ykeys: ['l1', 'l2', 'l3'],
      hideHover: 'auto',
      labels: ['좋아요', '공유', '댓글'],
      lineColors: ['#fb9678', '#7E81CB', '#01C0C8']
  });
}
