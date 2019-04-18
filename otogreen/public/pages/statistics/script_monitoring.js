$(document).ready(function(){
  var param = settingParams(1);
  ajaxGetPageList_statistics('#page-chart1 ',"#page-chart2 ",param);
});
function ajaxGetPageList_statistics(tag1,tag2,param){
  console.log('ajaxGetPageList_statistics param :',tag1,tag2,param);
  param['gtype'] = '1';
  var pType = (param.tsValue == '0')?'nalliance':'alliance';
  $.ajax({
    url: '/monitoring/'+pType+'/getNextPage',
    type: 'post',
    data: param,
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log('ajaxGetPageList_statistics data :',data);
      if(data.status != true){
        errorMSG();
        return false;
      }
      setChartTable(tag1,data.result);
      setTotalTable(tag2,data.result);
      return false;
    }
  });
}
function percentChk(arr){
  console.log('percentChk:',arr);
  var totalChk = 0;
  for(var i=0;i<arr.length;i++){
    if(arr[i] == 0){
      continue;
    }
    totalChk += arr[i];
  }
  if(totalChk != 0){
    if(totalChk > 100){
      arr[3] -= (totalChk-100);
    }
    if(totalChk < 100){
      arr[0] +=Math.abs(totalChk-100);
    }
  }
  return arr;
}
function setChartTable(ptag,param){
  console.log(ptag,param);
  var chartData = percentChk([percentChart(param.statistics[0].atotal,param.statistics[0].total),
  percentChart(param.statistics[1].atotal,param.statistics[0].total),
  percentChart(param.statistics[1].dtotal,param.statistics[0].total),
  percentChart(param.statistics[1].natotal,param.statistics[0].total)]);

  $(ptag+' .charts__chart').eq(1).prop('className','charts__chart chart_point1 f-left ').addClass('chart--p'+chartData[0]);
  $(ptag+' .charts__chart').eq(2).prop('className','charts__chart chart_point2 f-left ').addClass('chart--p'+chartData[1]);
  $(ptag+' .charts__chart').eq(3).prop('className','charts__chart chart_point3 f-left ').addClass('chart--p'+chartData[2]);
  $(ptag+' .charts__chart').eq(4).prop('className','charts__chart chart_point4 f-left ').addClass('chart--p'+chartData[3]);

  $(ptag+' .percent-r').eq(3).text(chartData[0]);
  $(ptag+' .percent-r').eq(2).text(chartData[1]);
  $(ptag+' .percent-r').eq(1).text(chartData[2]);
  $(ptag+' .percent-r').eq(0).text(chartData[3]);

  chartData = percentChk([percentChart(param.statistics[2].atotal,param.statistics[2].total),
  percentChart(param.statistics[3].atotal,param.statistics[2].total),
  percentChart(param.statistics[3].dtotal,param.statistics[2].total),
  percentChart(param.statistics[3].natotal,param.statistics[2].total)]);

  // 모바일모니터링
  $(ptag+' .charts__chart').eq(6).prop('className','charts__chart chart_point1 f-left ').addClass('chart--p'+chartData[0]);
  $(ptag+' .charts__chart').eq(7).prop('className','charts__chart chart_point2 f-left ').addClass('chart--p'+chartData[1]);
  $(ptag+' .charts__chart').eq(8).prop('className','charts__chart chart_point3 f-left ').addClass('chart--p'+chartData[2]);
  $(ptag+' .charts__chart').eq(9).prop('className','charts__chart chart_point4 f-left ').addClass('chart--p'+chartData[3]);

  $(ptag+' .percent-r').eq(7).text(chartData[0]);
  $(ptag+' .percent-r').eq(6).text(chartData[1]);
  $(ptag+' .percent-r').eq(5).text(chartData[2]);
  $(ptag+' .percent-r').eq(4).text(chartData[3]);
}
function setTotalTable(ptag,param){
  console.log(ptag,param);
  $(ptag+" #totalTable #totalTable-td1").text(numberWithCommas(Number(param.statistics[0].total)+Number(param.statistics[2].total)));
  $(ptag+" #totalTable #totalTable-p1").text(numberWithCommas(param.statistics[0].total));
  $(ptag+" #totalTable #totalTable-m1").text(numberWithCommas(param.statistics[2].total));
  $(ptag+" #totalTable #totalTable-td2").text(numberWithCommas(Number(param.statistics[0].atotal)+Number(param.statistics[2].atotal)));
  $(ptag+" #totalTable #totalTable-p2").text(numberWithCommas(param.statistics[0].atotal));
  $(ptag+" #totalTable #totalTable-m2").text(numberWithCommas(param.statistics[2].atotal));

  $(ptag+" #totalTable #totalTable-td3").text(numberWithCommas(Number(param.statistics[0].natotal)+Number(param.statistics[2].natotal)));
  $(ptag+" #totalTable #totalTable-p3").text(numberWithCommas(param.statistics[0].natotal));
  $(ptag+" #totalTable #totalTable-m3").text(numberWithCommas(param.statistics[2].natotal));

  $(ptag+" #totalTable #totalTable-td4").text(numberWithCommas(Number(param.statistics[1].atotal)+Number(param.statistics[3].atotal)));
  $(ptag+" #totalTable #totalTable-p4").text(numberWithCommas(param.statistics[1].atotal));
  $(ptag+" #totalTable #totalTable-m4").text(numberWithCommas(param.statistics[3].atotal));

  $(ptag+" #totalTable #totalTable-td5").text(numberWithCommas(Number(param.statistics[1].dtotal)+Number(param.statistics[3].dtotal)));
  $(ptag+" #totalTable #totalTable-p5").text(numberWithCommas(param.statistics[1].dtotal));
  $(ptag+" #totalTable #totalTable-m5").text(numberWithCommas(param.statistics[3].dtotal));

  $(ptag+" #totalTable #totalTable-td6").text(numberWithCommas(Number(param.statistics[1].natotal)+Number(param.statistics[3].natotal)));
  $(ptag+" #totalTable #totalTable-p6").text(numberWithCommas(param.statistics[1].natotal));
  $(ptag+" #totalTable #totalTable-m6").text(numberWithCommas(param.statistics[3].natotal));
}
function numberWithCommas(x) {
  return Number(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function percentChart(f,t){
  if(f=='0' && t=='0'){
      return 0;
  }
  else{
    return Math.round(Number(f) / Number(t) * 100);
  }
}
