$(document).ready(function(){
  $('[data-toggle="popover"]').popover();
  Highcharts.setOptions({
    lang: {
      resetZoom:"전체보기"
    }
  });
  chart1Road();
});
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function chart1Road(){
  var categoriesData = new Array();
  var dataList = JSON.parse($('#dayArr').val());
  var dataList2 = JSON.parse($('#dayArr_m').val());
  var seriesData = [{
    name: '제휴',
    data: [],
    color: '#9dc6e5',
    marker: {
        symbol: 'circle',
        fillColor: '#36a2f5',
        width: 8,
        height: 8
    },
    lineColor: '#36a2f5',
    lineWidth: 1
  }, {
    name: '비제휴',
    data: [],
    color: '#fbb7ce',
    marker: {
      symbol: 'circle',
      fillColor: '#ff518a',
      width: 8,
      height: 8
    },
    lineColor: '#ff518a',
    lineWidth: 1
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
    // colors: ['#36a2f5', '#ff518a'],
    chart: {
      renderTo: 'chart1',
      type: 'areaspline'
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
    legend: {
        layout: 'vertical',
        backgroundColor: '#FFFFFF',
        align: 'left',
        verticalAlign: 'top',
        floating: true,
        x: 80,
        y: 10
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
  var param = {
    type:type,
    mid: ($('#selectMCP option:selected').val() == undefined) ? '':$('#selectMCP option:selected').val(),
    cid: $('#selectCP option:selected').val()
  };
  $('.preloader1').show();
  $.ajax({
    url: '/dashBoard/setting',
    type: 'post',
    data: param,
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      $('.preloader1').fadeOut(500);
      errorMSG();
    },
    success:function(data){
      console.log('/dashBoard/setting : ',data);
      // 저작권사(CP)
      if('cpList' in data){
        data.cpList.forEach(function(ele) {
          var html = '<option value="'+ele.cp_id+'"'+(ele.cp_id == param.cid ? 'selected' : '')+'>'+ele.cp_cname+'</option>';
          $('#selectCP').append(html);
        });
      }
      // 그래프
      $('#chart1').empty();
      $('#chart2').empty();
      $('#dayArr').val(JSON.stringify(data.dayResultlist));
      $('#dayArr_m').val(JSON.stringify(data.dayResultlist_m));

      // osp현황
      $('#ospCount1').text(data.ospCount);
      $('#ospCount2').text(data.ospACount+' / '+data.ospNACount);
      // 전체,제휴,비제휴
      var nDate = new Date();
      var yDate = new Date();
      yDate.setDate(nDate.getDate() - 1);
      var nStr = (nDate.getFullYear()+'-'+((nDate.getMonth() < 10) ? '0'+(nDate.getMonth()+1) : (nDate.getMonth()+1)))+'-'+nDate.getDate();
      var yStr = (yDate.getFullYear()+'-'+((yDate.getMonth() < 10) ? '0'+(yDate.getMonth()+1) : (yDate.getMonth()+1)))+'-'+nDate.getDate();

      $('#cntsCount1').text(numberWithCommas(data.totalCount.total));
      $('#cntsCount2').text(numberWithCommas(data.totalCount.atotal));
      $('#cntsCount3').text(numberWithCommas(data.totalCount.natotal));
      // 비제휴
      $('#cntsCount3-1').text(numberWithCommas(data.naTotalCount.atotal));
      $('#cntsCount3-2').text(numberWithCommas(data.naTotalCount.dtotal));
      $('#cntsCount3-3').text(numberWithCommas(data.naTotalCount.natotal));
      $('.preloader1').fadeOut(500);
      chart1Road();
    }
  });
});


// 게시물 제목(이용자) 눌렀을 시
$(document).on('click','.view',function(){
  $('#view-Modal p').text('');
  $('#view-Modal #view_uploadFileList').empty();
  var idx = $(this).data('idx');
  var modalInputEle = {
    writer: $('#view_writer'),
    title: $('#view_title'),
    content: $('#view_content'),
    file: $('#view_file'),
    regdate: $('#view_regdate')
  };
  $.ajax({
    url: 'notice/getInfo',
    type: 'post',
    data: {idx:idx},
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log(data);
      for (var key in modalInputEle) {
        if(key == 'file'){
          if(data.result[key] != '' && data.result[key] != null){
            var arr = data.result[key].split(',');
            $.each(arr, function( i, val ) {
              var fileName = val.split('/')[2];
              var filePath = val.replace('public/uploads/','http://autogreen.co.kr/notice/download/');
              var html = '<li><a href="'+('http://61.82.113.197:8090/notice/download'+val)+'" class="file-name">'+fileName+'</a></li>';
              // var html = '<li><a href="'+filePath+'" class="file-name">'+fileName+'</a></li>';
              $('#view_uploadFileList').append(html);
            });
          }
        }
        else if(key == 'content'){
          modalInputEle[key].html(data.result[key].replace(/(?:\r\n|\r|\n)/g, '<br />'));
        }
        else{
          modalInputEle[key].text(data.result[key]);
        }
      }
      $('#view-Modal').modal('show');
    }
  });
});
