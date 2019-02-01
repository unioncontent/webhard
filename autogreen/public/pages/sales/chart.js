$(function() {
  Highcharts.setOptions({
    lang: {
      thousandsSep: ','
    }
  });

  $('#chart1').highcharts({
    chart: {
      type: 'column'
    },
    title: {
      text: null
    },
    xAxis: {
      type: 'category'
    },
    yAxis: {
      title: {
        enabled: false
      },
      visible: false,
      max: 20000000
    },
    navigation: {
      buttonOptions: {
        enabled: false
      }
   },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '₩{point.y:,.0f}'
        }
      }
    },
    lang: {
      thousandsSep: ','
    },
    tooltip: {
      pointFormat: '<b>₩{point.y:,.0f}</b>'
    },
    "series": [
      {
        "colorByPoint": false,
        "data": serieesData()
      }
    ]
  });
});

function serieesData(){
  return [
    {
      "name": "2월",
      "y": 0
    }, {
      "name": "3월",
      "y": 0
    }, {
      "name": "4월",
      "y": 0
    }, {
      "name": "5월",
      "y": 0
    }, {
      "name": "6월",
      "y": 0
    }, {
      "name": "7월",
      "y": 0
    }, {
      "name": "8월",
      "y": 0
    }, {
      "name": "9월",
      "y": 0
    }, {
      "name": "10월",
      "y": 0
    }, {
      "name": "11월",
      "y": 0
    }, {
      "name": "12월",
      "y": 0
    }, {
      "name": "1월",
      "y": 9000000,
      "color":"red"
    }
  ];
}
