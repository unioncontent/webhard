"use strict";
$(window).resize(function(){
  window.areaChart.redraw();
});

$(document).ready(function() {
  //areaChart1();
  /*pieChart();
  $("i[data-value='chart1']").on("click",pieChart);
  $("i[data-value='chart2']").on("click",areaChart1);*/
});

/*pie chart*/
/*function pieChart(){
  $("#chart").empty();
  c3.generate({
    bindto: '#chart',//chart id
    data: {
        columns: [
            ['전체', "${movieCount+actorCount}"],
            ['영화', "${movieCount}"],
            ['배우', "${actorCount}"],
        ],
        type: 'donut',
        // onclick: function(d, i) { console.log("onclick", d, i); },
        // onmouseover: function(d, i) { console.log("onmouseover", d, i); },
        // onmouseout: function(d, i) { console.log("onmouseout", d, i); }
    },
    color: {
        pattern: ['#4C5667', '#1ABC9C','#FF9F55']
    },
    donut: {
        title: "PC 메인노출량"
    }
  });
}*/
/*Area chart
function areaChart1() {
  $("#morris-extra-area").empty();
  window.areaChart = Morris.Area({
      element: 'morris-extra-area',
      data: [
        {period: '2017-10-10',total: 0,matching: 0},
        {period: '2017-10-11',total: 1,matching: 2},
      
      ],
      lineColors: ['#4C5667', '#1ABC9C'],
      xkey: 'period',
      ykeys: ['total', 'matching'],
      labels: ['전체', '매칭'],
      pointSize: 0,
      lineWidth: 0,
      resize: true,
      fillOpacity: 0.8,
      behaveLikeLine: true,
      gridLineColor: '#5FBEAA',
      hideHover: 'auto'
    });
}*/
