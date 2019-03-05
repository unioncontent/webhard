$(document).ready(function(){
  $('[data-toggle="popover"]').popover();
  Highcharts.setOptions({
    lang: {
      resetZoom:"전체보기"
    }
  });
  chart1Road();
});
// function chart1Road(){
//   var categoriesData = new Array();
//   var contentsList = JSON.parse($('#contentsArr').val());
//   var seriesData = [{
//     name: '제휴',
//     data: []
//   }, {
//     name: '비제휴',
//     data: []
//   }];
//   for(var i in contentsList){
//     categoriesData.push(contentsList[i].osp_sname);
//     seriesData[0].data.push(Number(contentsList[i].atotal.replace(/[,]/gi,'')));
//     seriesData[1].data.push(Number(contentsList[i].natotal.replace(/[,]/gi,'')));
//   };
//   var options = {
//     colors: ['#95CC81', '#C9463D'],
//     chart: {
//       renderTo: 'chart1',
//       type: 'column'
//     },
//     title: {
//       text: '웹하드별 모니터링현황',
//       align: 'left',
//       margin:20,
//       style: { "fontSize": "14px" }
//     },
//     navigation: {
//       buttonOptions: {
//         enabled: false
//       }
//    },
//     xAxis: {
//       categories: categoriesData
//     },
//     yAxis: {
//       min: 0,
//       title: {
//         text: null
//       }
//     },
//     legend: {
//       enabled: false
//     },
//     tooltip: {
//       pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
//       shared: true
//     },
//     plotOptions: {
//       column: {
//         stacking: 'percent'
//       }
//     },
//     series: seriesData
//   };
//   Highcharts.chart(options);
// }
function chart1Road(){
  var categoriesData = new Array();
  var dataList = JSON.parse($('#dayArr').val());
  var dataList2 = JSON.parse($('#dayArr_m').val());
  var seriesData = [{
    name: '제휴',
    data: []
  }, {
    name: '비제휴',
    data: []
  }];
  var start = new Date()
  start.setMonth(start.getMonth() - 1)
  var end = new Date(); //yyyy-mm-dd
  var j = 0;
  while(start <= end){
    var mm = ((start.getMonth()+1)>=10)?(start.getMonth()+1):'0'+(start.getMonth()+1);
    var dd = ((start.getDate())>=10)? (start.getDate()) : '0' + (start.getDate());
    var yyyy = start.getFullYear();
    var date = yyyy+"-"+mm+"-"+dd; //yyyy-mm-dd

    categoriesData.push(date);
    seriesData[0].data.push(0);
    seriesData[1].data.push(0);

    for(var i in dataList){
      if(dataList[i].cnt_date == date){
        seriesData[0].data[j] = Number(dataList[i].atotal);
        seriesData[1].data[j] = Number(dataList[i].natotal);
        break;
      }
    };
    for(var i in dataList2){
      if(dataList2[i].cnt_date == date){
        seriesData[0].data[j] += Number(dataList2[i].atotal);
        seriesData[1].data[j] += Number(dataList2[i].natotal);
        break;
      }
    };
    j += 1;

    start = new Date(start.setDate(start.getDate() + 1)); //date increase by 1
  }


  var options = {
    // colors: ['#95CC81', '#C9463D'],
    chart: {
      renderTo: 'chart1',
      // type: 'area'
    },
    title: {
      text: null,
    },
    navigation: {
      buttonOptions: {
        enabled: false
      }
   },
    xAxis: {
      categories: categoriesData,
      labels: {
          style: {
              fontSize: '10px'
          }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: null
      }
    },
    legend: {
        layout: 'vertical',
        backgroundColor: '#FFFFFF',
        align: 'left',
        verticalAlign: 'top',
        floating: true,
        x: 90,
        y: 45
    },
    tooltip: {
      pointFormat: '<span style="color:{series.color}">{series.name}</span>: {point.y}<br/>',
      shared: true,
      crosshairs: true
    },
    series: seriesData
  };
  Highcharts.chart(options);
}
$(document).on('change','#selectMCP,#selectCP',function(){
  var type = $(this).attr('id');
  if(type == 'selectMCP'){
    $('#selectCP').empty();
    $('#selectCP').append('<option value=\'\'>CP사선택</option>');
  }
  $('.preloader1').show();
  $.ajax({
    url: '/dashBoard/setting',
    type: 'post',
    data: {
      type:type,
      mid: ($('#selectMCP option:selected').val() == undefined) ? '':$('#selectMCP option:selected').val(),
      cid: $('#selectCP option:selected').val()
    },
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      $('.preloader1').fadeOut(500);
      errorMSG();
    },
    success:function(data){
      console.log(data);
      // 그래프
      $('#chart1').empty();
      $('#chart2').empty();
      $('#dayArr').val(JSON.stringify(data.dayResultlist));

      // osp현황
      $('#ospCount1').text(data.ospCount);
      $('#ospCount2').text(data.ospACount+' / '+data.ospNACount);
      // 전체,제휴,비제휴
      var nDate = new Date();
      var yDate = new Date();
      yDate.setDate(nDate.getDate() - 1);
      var nStr = (nDate.getFullYear()+'-'+((nDate.getMonth() < 10) ? '0'+(nDate.getMonth()+1) : (nDate.getMonth()+1)))+'-'+nDate.getDate();
      var yStr = (yDate.getFullYear()+'-'+((yDate.getMonth() < 10) ? '0'+(yDate.getMonth()+1) : (yDate.getMonth()+1)))+'-'+nDate.getDate();

      $('#cntsCount1').text(data.totalCount.total);
      $('#cntsCount2').html('<a class="mtag" href="http://otogreen.co.kr/monitoring/alliance?page=1&sDate='+yStr+'&eDate='+nStr+'">'+data.totalCount.atotal+'</a>');
      $('#cntsCount3').html('<a class="mtag" href="http://otogreen.co.kr/monitoring/nalliance?page=1&sDate='+yStr+'&eDate='+nStr+'">'+data.totalCount.natotal+'</a>');
      // 비제휴
      $('#cntsCount3-1').text(data.naTotalCount.atotal);
      $('#cntsCount3-2').text(data.naTotalCount.dtotal);
      $('#cntsCount3-3').text(data.naTotalCount.natotal);
      $('.preloader1').fadeOut(500);
      chart1Road();
    }
  });
});

// 게시물 제목(이용자) 눌렀을 시
// $(document).on('click','.view',function(){
//   $('#view-Modal p').text('');
//   $('#view-Modal #view_uploadFileList').empty();
//   var idx = $(this).data('idx');
//   var modalInputEle = {
//     writer: $('#view_writer'),
//     title: $('#view_title'),
//     content: $('#view_content'),
//     file: $('#view_file'),
//     regdate: $('#view_regdate')
//   };
//   $.ajax({
//     url: 'notice/getInfo',
//     type: 'post',
//     data: {idx:idx},
//     error: function(request,status,error){
//       errorMSG();
//     },
//     success: function(data){
//       console.log(data);
//       for (var key in modalInputEle) {
//         if(key == 'file'){
//           if(data.result[key] != '' && data.result[key] != null){
//             var arr = data.result[key].split(',');
//             $.each(arr, function( i, val ) {
//               var fileName = val.split('/')[2];
//               var html = '<li><a href="'+('http://61.82.113.197:8090/notice/download'+val)+'" class="file-name">'+fileName+'</a></li>';
//               $('#view_uploadFileList').append(html);
//             }0);
//           }
//         }
//         else if(key == 'content'){
//           modalInputEle[key].html(data.result[key].replace(/(?:\r\n|\r|\n)/g, '<br />'));
//         }
//         else{
//           modalInputEle[key].text(data.result[key]);
//         }
//       }
//       $('#view-Modal').modal('show');
//     }
//   });
// });
var modalInputEle = {
  osp_sname: $('#osp_sname'),
  osp_open: $('#osp_open'),
  osp_id: $('#osp_id'),
  osp_pw: $('#osp_pw'),
  osp_cname: $('#osp_cname'),
  osp_cnum: $('#osp_cnum'),
  osp_scnum: $('#osp_scnum'),
  osp_tstate: $('#osp_tstate'),
  osp_ceoname: $('#osp_ceoname'),
  osp_pname: $('#osp_pname'),
  osp_url: $('#osp_url'),
  osp_durl: $('#osp_durl'),
  osp_img: $('#osp_img'),
  osp_addrs: $('#osp_addrs'),
  osp_tel: $('#osp_tel'),
  osp_fax: $('#osp_fax'),
  osp_mnum: $('#osp_mnum'),
  osp_email: $('#osp_email'),
  osp_mobile: $('#osp_mobile'),
  osp_mobile_url: $('#osp_mobile_url'),
  osp_state: $('#osp_state'),
  osp_regdate: $('#osp_regdate')
};
// 사이트버튼 클릭시
$(document).on('click','.btn-site',function(){
    $('#detail-Modal p').text('');
    var idx = $(this).data('idx');
    $.ajax({
      url: '/setting/osp/getInfo',
      type: 'post',
      data: {idx:idx},
      error: function(request,status,error){
        errorMSG();
      },
      success: function(data){
        console.log(data);
        $.each($('#detail-Modal').find('p'),function(i,v){
          // console.log(i,v);
          if($(v).attr('id') in data.result){
            $(v).text(data.result[$(v).attr('id')]);
          }
        });
        $('#company-name').text(data.result['osp_cname']);
        chart();
        // for (var key in modalInputEle) {
        //   if(key == 'osp_state' || key == 'osp_tstate'){
        //     $('#'+key+' input[type=radio][value='+data.result[key]+']').prop('checked',true);
        //   }
        //   else if(key == 'osp_mobile'){
        //     if(data.resultf[key] == '2'){
        //       $('#'+key+' input[type=checkbox][value=1]').prop('checked',true);
        //       $('#'+key+' input[type=checkbox][value=0]').prop('checked',true);
        //     }
        //     else{
        //       if(data.result[key] != ''){
        //         $('#'+key+' input[type=checkbox][value='+data.result[key]+']').prop('checked',true);
        //       }
        //     }
        //   }
        //   else{
        //     modalInputEle[key].val(data.result[key]);
        //   }
        //   $('#o_'+key).val(data.result[key]);
        // }
        $('#detail-Modal').modal('show');
      }
    });
  });
  function chart(){
    var options = {
      colors: ['#1e75a3'],
      chart: {
        renderTo: 'chart1',
        type: 'area'
      },
      title: {
        text: 'Total Visits',
        align: 'left',
        margin:20,
        style: { "color": "#636367","fontSize": "22px" }
      },
      navigation: {
        buttonOptions: {
          enabled: false
        }
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%b\' %e'
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: null
        },
        labels: {
            formatter: function () {
                return this.value / 1000000 + 'm';
            }
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
          lineColor: '#ffffff',
          lineWidth: 1,
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
      series: [{
          name: 'ondisk.co.kr',
          data: [2000000,2200000,3000000,3200000,1000000],
          pointStart: Date.UTC(2019, 0, 1),
          pointInterval: 24 * 3600 * 1000 * 31
      }]
    };
    Highcharts.chart(options);
  }
