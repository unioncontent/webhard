$(document).ready(function(){
  Highcharts.setOptions({
    lang: {
      resetZoom:"전체보기"
    }
  });
  chart1Road();
  chart2Road();
});
function chart1Road(){
  var categoriesData = new Array();
  var contentsList = JSON.parse($('#contentsArr').val());
  var seriesData = [{
    name: '제휴',
    data: []
  }, {
    name: '비제휴',
    data: []
  }];
  for(var i in contentsList){
    categoriesData.push(contentsList[i].osp_sname);
    seriesData[0].data.push(contentsList[i].atotal);
    seriesData[1].data.push(contentsList[i].natotal);
  };
  var options = {
    chart: {
      renderTo: 'chart1',
      type: 'column'
    },
    title: {
      text: '웹하드별 모니터링현황',
      align: 'left',
      margin:20,
      style: { "fontSize": "14px" }
    },
    navigation: {
      buttonOptions: {
        enabled: false
      }
   },
    xAxis: {
      categories: categoriesData
    },
    yAxis: {
      min: 0,
      title: {
        text: null
      }
    },
    legend: {
      enabled: false
    },
    tooltip: {
      pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
      shared: true
    },
    plotOptions: {
      column: {
        stacking: 'percent'
      }
    },
    series: seriesData
  };
  Highcharts.chart(options);
}
function chart2Road(){
  var aCountList = JSON.parse($('#aCountArr').val());
  // var atotal_p = ((Number(aCountList.atotal.replace(/,/gi,'')) / Number(aCountList.total.replace(/,/gi,''))) * 100);
  // var natotal_p = ((Number(aCountList.natotal.replace(/,/gi,'')) / Number(aCountList.total.replace(/,/gi,''))) * 100);
  var options = {
    chart: {
      renderTo: 'chart2',
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: null
    },
    navigation: {
      buttonOptions: {
        enabled: false
      }
   },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false
        },
        showInLegend: true
      }
    },
    series: [{
      name: '현황',
      colorByPoint: true,
      data: [{
        name: '제휴',
        y: Number(aCountList.atotal.replace(/,/gi,'')),
        sliced: true,
        selected: true
      }, {
        name: '비제휴',
        y: Number(aCountList.natotal.replace(/,/gi,''))
      }]
    }]
  };
  Highcharts.chart(options);
}

$(document).on('change','#selectMCP,#selectCP',function(){
  var type = $(this).attr('id');
  $.ajax({
    url: '/dashBoard/setting',
    type: 'post',
    data: {
      type:type,
      mid:($('#selectMCP option:selected').val() == undefined) ? '':$('#selectMCP option:selected').val(),
      cid:$('#selectCP option:selected').val()
    },
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      errorMSG();
    },
    success:function(data){
      // 그래프
      $('#chart1').empty();
      $('#chart2').empty();
      $('#contentsArr').val(JSON.stringify(data.ospTotalCountList));
      $('#aCountArr').val(JSON.stringify(data.ospTotalCount));
      chart1Road();
      chart2Road();
      // osp현황
      $('#ospCount1').text(data.ospCount);
      $('#ospCount2').text(data.ospACount+' / '+data.ospNACount);
      // 관리,제휴,비제휴
      $('#cntsCount1').text(data.contentsCount);
      $('#cntsCount2').text(data.aCount);
      $('#cntsCount3').text(data.naCount);
      // 리스트 표
      $('#totalCount1').text(data.total);
      $('#totalCount2').text(data.atotal);
      $('#totalCount3').text(data.natotal);
      $('#list tbody tr').not('.table-info').remove();
      data.ospTotalCountList.forEach(function(ele) {
        var html = '<tr><th>'+ele.osp_sname+'</th><th>'+ele.cnt_osp+'</th><th class="'+((ele.osp_tstate == '0')? 'text-danger': 'text-success')+'">'+((ele.osp_tstate == '0')? '비제휴': '제휴')+'</th><td>'+ele.total+'</td><td>'+ele.atotal+'</td><td>'+ele.natotal+'</td><td>0</td><td>0</td></tr>';
        $('#list tbody').append(html);
      });
      // cpList
      if('cpList' in data){
        $('#selectCP').empty();
        $('#selectCP').append('<option value=\'\'>CP사선택</option>');
        data.cpList.forEach(function(ele) {
          var html = '<option value="'+ele.cp_id+'">'+ele.cp_cname+'</option>';
          $('#selectCP').append(html);
        });
      }
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
              var fileName = val.split('/')[3];
              var filePath = val.replace('public/uploads/','http://localhost:8080/notice/download/');
              var html = '<li><a href="'+filePath+'" class="file-name">'+fileName+'</a></li>';
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
