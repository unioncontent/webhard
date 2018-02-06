"use strict";

$(window).resize(function(){
  cardResize();
  window.areaChart.redraw();
});

$(document).ready(function() {
  cardResize();
  //areaChart();
  //settingCalendar();

  /*$("#mcalendar").width("500px");
  $(".save_btn").on("click", function() {
      $(".md-form-control").removeClass("md-valid");
      var saveTask = $('.save_task_todo').val();
      if (saveTask == "") {
          alert("일정을 적어주세요.");
      } else {
          var add_todo = $("<div class='to-do-label'>\
            <div class='checkbox-fade fade-in-info'>\
              <label class='check-task'>\
                <input type='checkbox' checked disabled>\
                <span class='cr'><i class='cr-icon icofont icofont-ui-check txt-info'></i></span>\
                <span class='task-title-sp'>"+saveTask+"</span>\
                <div class='f-right hidden-phone'>\
                  <i class='icofont icofont-ui-delete delete_todo'></i>\
                </div>\
              </label>\
            </div>\
          </div>");
          $(add_todo).appendTo(".task-content").hide().fadeIn(300);
          $('.save_task_todo').val('');
          $("#flipFlop").modal('hide');
      }
  });*/
  
});

/*function settingCalendar(){
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();

  $("#date").text(year+"년 "+month+"월 "+date+"일 ");

  var data = [{
      date: year + '-' + month + '-' + (date - 1),
      value: '스케줄표시1\n스케줄1-2'
  }, {
      date: year + '-' + month + '-' + date,
      value: '스케줄표시2'
  }, {
      date: new Date(year, month - 1, date + 1),
      value: '스케줄표시3'
  }];

  // inline
  var $ca = $('#mcalendar').calendar({
      width: '300px',
      height: '280px',
      data: data,
      date: new Date(),
      onSelected: function (view, date, data) {//날짜 선택시 이벤트
          console.log('date:' + date);//날짜
          console.log('data:' + (data || '없음'));//일정

          if(data != null && typeof data != "undefined") {//일정 있을때
            var data = data.split("\n");
            //일정 건수 넣기
            $("#data").text(data.length);
            //스케줄 넣기 전 비우기
            $(".task-content").empty();
            $.each(data, function(key,value){
              $(".task-content").append("<div class='to-do-label'>\
                <div class='checkbox-fade fade-in-info'>\
                  <label class='check-task'>\
                    <input type='checkbox' checked disabled>\
                    <span class='cr'><i class='cr-icon icofont icofont-ui-check txt-info'></i></span>\
                    <span class='task-title-sp'>"+value+"</span>\
                    <div class='f-right hidden-phone'>\
                      <i class='icofont icofont-ui-delete delete_todo'></i>\
                    </div>\
                  </label>\
                </div>\
              </div>");
            });
          }
          else{//일정 없을때
            $("#data").text(0);
            $(".task-content").empty();
          }
          //선택된 날짜 대입
          var select = new Date(date);
          $("#date").text(select.getFullYear()+"년 "+(select.getMonth() + 1)+"월 "+select.getDate()+"일 ");
      },
      viewChange: function (view, y, m) {//날짜 변경될 때, ex) 10월에서 11월 / 2017년에서 2010년
          console.log(view, y, m);
      }
  });
}*/

function cardResize(){
  setTimeout(function(){
    if($(".page-body > .row").width() > 1200){
      var card = Math.ceil($(".page-body > .row").width()/5)-1;
      $(".main-card").css("max-width",card);
    }
    else{
      $('.main-card').removeAttr('style');
    }
  }, 400);

}

/*Area chart*/
/*function areaChart() {
  $("#morris-extra-area").empty();
  window.areaChart = Morris.Area({
      element: 'morris-extra-area',
      data: [
        {period: '2017-10-10 00:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 01:00:00',portal: 1,cumminty: 2,sns: 0},
        {period: '2017-10-10 02:00:00',portal: 2,cumminty: 0,sns: 2},
        {period: '2017-10-10 03:00:00',portal: 10,cumminty: 10,sns: 0},
        {period: '2017-10-10 04:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 05:00:00',portal: 10,cumminty: 0,sns: 0},
        {period: '2017-10-10 06:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 07:00:00',portal: 0,cumminty: 20,sns: 0},
        {period: '2017-10-10 08:00:00',portal: 20,cumminty: 0,sns: 0},
        {period: '2017-10-10 09:00:00',portal: 0,cumminty: 4,sns: 0},
        {period: '2017-10-10 10:00:00',portal: 5,cumminty: 0,sns: 20},
        {period: '2017-10-10 11:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 12:00:00',portal: 0,cumminty: 10,sns: 0},
        {period: '2017-10-10 13:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 14:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 15:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 16:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 17:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 18:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 19:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 20:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 21:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 22:00:00',portal: 0,cumminty: 0,sns: 0},
        {period: '2017-10-10 23:00:00',portal: 0,cumminty: 0,sns: 0}
      ],
      lineColors: ['#fb9678', '#7E81CB', '#01C0C8'],
      xkey: 'period',
      ykeys: ['portal', 'cumminty', 'sns'],
      labels: ['포털', '커뮤니티', 'SNS'],
      pointSize: 0,
      lineWidth: 0,
      resize: true,
      fillOpacity: 0.8,
      behaveLikeLine: true,
      gridLineColor: '#5FBEAA',
      hideHover: 'auto'

    });
}*/
