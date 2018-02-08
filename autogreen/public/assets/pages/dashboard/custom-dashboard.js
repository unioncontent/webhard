"use strict";

$(window).resize(function(){
  window.areaChart.redraw();
});

$(document).ready(function() {
  areaChart();

});

/*Area chart*/
function areaChart() {
  $("#morris-extra-area").empty();
  window.areaChart = Morris.Area({
      element: 'morris-extra-area',
      data: [
        {period: '2017-10-10 00:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 01:00:00',T: 1,D: 2,P: 0},
        {period: '2017-10-10 02:00:00',T: 2,D: 0,P: 2},
        {period: '2017-10-10 03:00:00',T: 10,D: 10,P: 0},
        {period: '2017-10-10 04:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 05:00:00',T: 10,D: 0,P: 0},
        {period: '2017-10-10 06:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 07:00:00',T: 0,D: 20,P: 0},
        {period: '2017-10-10 08:00:00',T: 20,D: 0,P: 0},
        {period: '2017-10-10 09:00:00',T: 0,D: 4,P: 0},
        {period: '2017-10-10 10:00:00',T: 5,D: 0,P: 20},
        {period: '2017-10-10 11:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 12:00:00',T: 0,D: 10,P: 0},
        {period: '2017-10-10 13:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 14:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 15:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 16:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 17:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 18:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 19:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 20:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 21:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 22:00:00',T: 0,D: 0,P: 0},
        {period: '2017-10-10 23:00:00',T: 0,D: 0,P: 0}
      ],
      lineColors: ['#1abc9c', '#e74c3c', '#4099ff'],
      xkey: 'period',
      ykeys: ['T', 'D', 'P'],
      labels: ['제휴', '삭제', '보류'],
      pointSize: 0,
      lineWidth: 0,
      resize: true,
      fillOpacity: 0.8,
      behaveLikeLine: true,
      gridLineColor: '#5FBEAA',
      hideHover: 'auto'

    });
}
