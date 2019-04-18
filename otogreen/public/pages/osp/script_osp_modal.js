
// 사이트버튼 클릭시
$(document).on('click','.btn-site',function(){
  $('#detail-Modal #card-div .col-xs-4 p').text('');
  $('#detail-Modal .site-info span').text('');
  $('#detail-Modal [data-toggle="popover"]').popover();
  var idx = $(this).data('idx');
  var now = new Date();
  $('#detail-Modal .modal-header .modal-title-date').text(nowMonthStr()+' '+now.getFullYear()+' Overview')
  $.ajax({
    url: '/setting/osp/getInfo',
    type: 'post',
    data: {idx:idx},
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log(data);
      $.each($('#detail-Modal .site-info').find('span'),function(i,v){
        // console.log(i,v);
        if($(v).attr('id') in data.result){
          $(v).text(data.result[$(v).attr('id')]);
        }
      });
      $('#result1').text((data.result.osp_v_str == null)?'0':data.result.osp_v_str);
      $('#result_p1').text((data.result.osp_v_cNum =='0') ? '':data.result.osp_v_cNum+' %');
      $('#result2').text(data.result.osp_g_rank);
      $('#result3').text(data.result.osp_k_rank);
      $('#company-name').text(data.result['osp_cname']);
      var now = new Date();
      var graphDataDic = {
        name: data.result.osp_sname,
        data: [0,0,0,0,0,0],
        pointStart: Date.UTC(now.getFullYear(), now.getMonth()),
        pointInterval: 24 * 3600 * 1000 * 31
      };
      if(data.result.graph.length > 0){
        var sixMonth = sixMonthArr();
        for(var i in sixMonth){
          $.each(data.result.graph,function(j,v){
            if(v.osp_regdate == sixMonth[i]){
              graphDataDic.data[i] = v.osp_v_total;
            }
            // graphDataDic.data.push(v.osp_v_total);
            // if(i == 0){
            //   var dateArr = v.osp_regdate.split('-');
            //   graphDataDic.pointStart = Date.UTC(dateArr[0], dateArr[1]);
            // }
          });
        }
      }
      chart(graphDataDic);
      $('#detail-Modal').modal('show');
    }
  });
});
function sixMonthArr() {
  var date = new Date();
  var arr = [];

  for(var i =1; i<7; i++){
    date.setMonth(date.getMonth() - 1);
    monthIndex = date.getMonth();
    monthIndex +=1;
    year = date.getFullYear();
    arr.unshift(year+'-'+((monthIndex > 9)? monthIndex : '0'+monthIndex))
  }

  return arr;
}
function chart(data){
  var options = {
    colors: ['#1e75a3'],
    chart: {
      renderTo: 'chart-m-1',
      type: 'area'
    },
    title: {
      text: '',
    },
    navigation: {
      buttonOptions: {
        enabled: false
      }
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        day: '%d ,%e'
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: null
      },
      labels: {
          enabled: false
      }
    },
    legend: {
      enabled: false
    },
    tooltip: {
      pointFormat: '<span style="color:{point.color}"></span> {series.name}: <b>{point.y}</b><br/>',
      shared: true
    },
    plotOptions: {
      area: {
        marker: {
          lineWidth: 1,
          lineColor: '#ffffff',
          symbol: 'circle',
          states: {
            hover: {
                enabled: true
            }
          }
        }
      }
    },
    series: [data],
  };
  Highcharts.chart(options);
}

// us month return
function nowMonthStr() {
  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";

  var d = new Date();
  var n = month[d.getMonth()];
  return n;
}
