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
    max: 10000000
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

$(function() {
  Highcharts.setOptions({
    lang: {
      thousandsSep: ','
    }
  });
  chartRoad(option);
});

function serieesData(){
  console.log('serieesData');
  var valueGraph = JSON.parse($('#graph').val());
  var dataArr = [];
  for (var i = 11; i >= 0; i--) {
    var date = new Date();
    date.setMonth(date.getMonth()-i);
    var month = Number(date.getMonth())+1;
    var dateStr = ((month < 10)?'0'+month:month)+'월';
    var check = true;

    $.each(valueGraph,function(i,v){
      // console.log({"name": v.s_date,"y": Number(v.s_total_money)});
      if(v.s_date == dateStr){
        check = false;
        dataArr.push({
          "name": v.s_date,
          "y": Number(v.s_total_money)
        });
      }
    });

    if(check){
      dataArr.push({
        "name": dateStr,
        "y": 0
      });
    }

    if(i == 0){
      dataArr[11]["color"]="red";
    }
  }

  $.each(valueGraph,function(i,v){
    // console.log(i,v);
    dataArr[i-12] = {
      "name": v.s_date,
      "y": Number(v.s_total_money)
    };
    if(i == (valueGraph.length-1)){
      dataArr[i]["color"]="red";
    }
  });

  // console.log(dataArr);
  return dataArr;
}

function chartRoad(o){
  // console.log('chartRoad');
  // console.log('chartRoad data:',option["series"]["data"]);
  $('#chart1').highcharts(o);
}
