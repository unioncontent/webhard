'use strict';
$(window).on('resize',function(){
  setTimeout(function(){
    //echart1();
    //echart2();
    cardResize();
    //window.lineChart.redraw();
  }, 500);
});

$(document).ready(function() {
  cardResize();
  //echart1();
  //echart2();
  //linechart();

  //$("i[data-value='chart1']").on("click",linechart);
  //$("i[data-value='chart2']").on("click",echart1);
  //$("i[data-value='chart3']").on("click",echart2);
});

/*gauge*/
function echart1(value, name){
  $("#gauge1").empty();
  var myChartGauge = echarts.init(document.getElementById('gauge1'));
  var optionGauge = {
    tooltip : {
      formatter: "{b} : {c}%"
    },
    toolbox: {
      show : false,
      feature : {
          mark : {show: false},
          restore : {show: false},
          saveAsImage : {show: true}
      }
    },
    series : [
      {
        name:'gauge1',
        type:'gauge',
        center: ['50%', '50%'],
        radius: ['0%', '100%'],
        axisLine: {
            show: true,
            lineStyle: {
                color: [
                    [0.05, '#8BD2FD'],
                    [0.1, '#50BAFB'],
                    [0.2, '#41B4FB'],
                    [0.3, '#23a8FA'],
                    [1, '#059CF9']
                ],
                width: 10
            }
        }  ,
        title: {
            show : false,
            offsetCenter: [0, '120%'],
            textStyle: {
                color: '#1ABC9C',
                fontSize : 15
            }
        }  ,
        detail: {
            show : true,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderColor: '#ccc',
            width: 100,
            height: 40,
            offsetCenter: [0, '40%'],
            formatter:'{value}%',
            textStyle: {
                color: 'auto',
                fontSize : 20
            }
        },

        data:[{value: value, name: name}]
      }
    ]
  };
  myChartGauge.setOption(optionGauge,true);
}
function echart2(value, name){
  $("#gauge2").empty();
  var myChartGauge = echarts.init(document.getElementById('gauge2'));
  var optionGauge = {
    tooltip : {
      formatter: "{b} : {c}%"
    },
    toolbox: {
      show : false,
      feature : {
          mark : {show: false},
          restore : {show: false},
          saveAsImage : {show: true}
      }
    },
    series : [
      {
        name:'gauge2',
        type:'gauge',
        center: ['50%', '50%'],
        radius: ['0%', '100%'],
        axisLine: {
            show: true,
            lineStyle: {
                color: [
                    [0.05, '#8BD2FD'],
                    [0.1, '#50BAFB'],
                    [0.2, '#41B4FB'],
                    [0.3, '#23a8FA'],
                    [1, '#059CF9']
                ],
                width: 10
            }
        } ,
        title: {
            show : false,
            offsetCenter: [0, '120%'],
            textStyle: {
                color: '#1ABC9C',
                fontSize : 15
            }
        }  ,
        detail: {
            show : true,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderColor: '#ccc',
            width: 100,
            height: 40,
            offsetCenter: [0, '40%'],
            formatter:'{value}%',
            textStyle: {
                color: 'auto',
                fontSize : 20
            }
        },

        data:[{value: value, name: name}]
      }
    ]
  };
  myChartGauge.setOption(optionGauge,true);
}
/*line
function linechart(){
  $("#line-chart1").empty();
  window.lineChart = Morris.Line({
      element: 'line-chart1',
      data: [
        {period: '2017-10-10',bolg: 0,cafe: 0,kin: 0},
        {period: '2017-10-11',bolg: 50,cafe: 15,kin: 5},
        {period: '2017-10-12',bolg: 20,cafe: 50,kin: 65},
        {period: '2017-10-13',bolg: 60,cafe: 12,kin: 7},
        {period: '2017-10-14',bolg: 30,cafe: 20,kin: 120},
        {period: '2017-10-15',bolg: 25,cafe: 80,kin: 40},
        {period: '2017-10-16',bolg: 10,cafe: 10,kin: 10}
      ],
      xkey: 'period',
      redraw: true,
      ykeys: ['bolg', 'cafe', 'kin'],
      hideHover: 'auto',
      labels: ['블로그', '카페', '지식인'],
      lineColors: ['#fb9678', '#7E81CB', '#01C0C8']
  });
}*/
/* card resize*/
function cardResize(){
  setTimeout(function(){
    if($(".tab-pane > .row").width() > 1200){
      var card = Math.ceil($(".tab-pane > .row").width()/5)-1;
      $(".main-card").css("min-width",card);
    }
  }, 400);

}
