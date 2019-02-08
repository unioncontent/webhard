$(function() {
  Highcharts.setOptions({
    lang: {
      thousandsSep: ','
    }
  });

  $('#chart1').highcharts(option);
});
var option = {
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
};

function serieesData(){
  var valueGraph = JSON.parse($('#graph').val());
  var dataArr = [];
  $.each(valueGraph,function(i,v){
    console.log(i,v);
    dataArr.push({
      "name": v.s_date,
      "y": Number(v.s_total_money)
    });
    if(i == (valueGraph.length-1)){
      dataArr[i]["color"]="red";
    }
  });
  console.log(dataArr);
  return dataArr;
}
