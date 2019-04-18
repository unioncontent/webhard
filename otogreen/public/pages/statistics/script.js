$(document).ready(function(){
  startSetting();
});
// 전체보기
$(document).on('click','#bntALL',function(){
  var param = settingParams('all');
  delete param.oc;
  location.href = "./monitoring_w/all"+encodeQueryString(param);
});
// 엑셀 클릭시
$(document).on('click','#resultList .btn-excel',function(){
  swal({
    title: "엑셀출력하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      var param = settingParams('excel');
      var ocStr = 'osp';
      if('oc' in param){
        if(param.oc == '1'){
          ocStr = 'cnts';
        }
      }
      location.href = 'http://61.82.113.197:3000/monitoring/'+ocStr+'/mExcel'+encodeQueryString(param);
    }
  });
});
// num모달열기
$(document).on('click','#totalTable tbody td',function(){
  var sParam = {
    id:$(this).prop('id'),
    type:$(this).prop('id').substr($(this).prop('id').length-2,1),
    title:$(this).siblings('th').text().replace('└','').replace(/ /gi,'')
  };
  settingNumModal(sParam);
  var param = settingNParams(1);
  ajaxGetNumPageList(param);
  var type_str = (param.type=='p')?'- PC':(param.type=='m')?'- 모바일':'';
  $('#num-Modal .modal-title').text(param.title+type_str+' 상세보기');
  $('#num-Modal').modal('show');
});
$(document).on('click','#listTable span.listNum',function(){
  var dataDic = $(this).data();
  settingNumModal(dataDic);
  var param = settingNParams(1);
  ajaxGetNumPageList(param);
  $('#num-Modal .modal-title').text('상세보기');
  $('#num-Modal').modal('show');
});
function settingNumModal(param){
  $('#num-Modal #id_nm').val((param.id !== 'undefined')?param.id:'');
  $('#num-Modal #type_nm').val(param.type);
  $('#num-Modal #title_nm').val(param.title);
  $('#num-Modal #cid_nm').val((param.cid !== 'undefined')?param.cid:'');
  $('#num-Modal #osp_nm').val((param.osp !== 'undefined')?param.osp:'');
  $('#num-Modal tbody').empty();
  $('#num-Modal tfoot').empty();
  $('#num-Modal #searchInput-nm').val('');
  $('#num-Modal #selectSearchType-nm option:selected').prop('selected',false);
}
// num모달 검색
$('#num-Modal #searchInput-nm').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#searchBtn-nm').trigger('click');
  };
});
$('#num-Modal #searchBtn-nm').on('click',function(){
  var param = settingNParams(1);
  ajaxGetNumPageList(param);
});
// num모달 페이지 이동
$(document).on('click','#resultList-nm .page-link',function(){
  var param = settingNParams(Number($(this).data().value));
  ajaxGetNumPageList(param);
});
// 모달열기
$(document).on('click','.openModal',function(){
  var param = settingWParams(1);
  param.osp = $(this).data('osp');
  param.oc = '1';
  $("#webhard-Modal #totalTable td").text(0);
  $("#webhard-Modal .chart--lg").empty();
  $("#webhard-Modal .chart--lg").html('<div class="charts__chart chart_point1 f-left chart--p0"></div><div class="charts__chart chart_point2 f-left chart--p0"></div><div class="charts__chart chart_point3 f-left chart--p0"></div><div class="charts__chart chart_point4 f-left chart--p0"></div>');
  ajaxGetPageList_statistics('#webhard-Modal ',"#webhard-Modal ",param);
  $('#webhard-Modal .cntNum span').text(0);
  $('#webhard-Modal #listTable2 tbody,#webhard-Modal #listTable2 tfoot').empty();
  $('#webhard-Modal .modal-title').text($(this).text());
  $('#webhard-Modal .modal-title').data('osp',$(this).data('osp'));
  $('#webhard-Modal .btn-excel').data('osp',param.osp);
  ajaxGetPageList('#listTable2',param);
  $('#webhard-Modal').modal('show');
});
$('#webhard-Modal .btn-excel').on('click',function(){
  if($('#webhard-Modal #listTable2 tbody td').length == 0){
    alert('데이터가 없습니다.');
    return false;
  }
  var param = settingParams('excel');
  param.osp = $(this).data('osp');
  param.oc = '1';
  swal({
    title: "엑셀출력하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      location.href = 'http://61.82.113.197:3000/monitoring/cnts/mExcel'+encodeQueryString(param);
    }
  });
});
//모달 페이지 이동
$(document).on('click','#listTable2 .page-link',function(){
  var param = settingWParams(Number($(this).data().value));
  param.osp = $('#webhard-Modal .modal-title').data('osp');
  param.oc = '1';
  ajaxGetPageList('#listTable2',param);
});
// 웹하드사별,콘텐츠별
$(document).on('click','#bntOSP,#bntCNT',function(){
  if(this.id == 'bntCNT'){
    $('#bntOSP').removeClass('btn-select');
    $('input[name=oc]').val('1');
  } else {
    $('#bntCNT').removeClass('btn-select');
    $('input[name=oc]').val('0');
  }
  $(this).addClass('btn-select');
  var param = settingParams(1);
  ajaxGetPageList('#listTable',param);
});
// 프린트
function onPrint() {
  const html = document.querySelector('html');
  const printContents1 = document.querySelector('#page-chart1').outerHTML;
  const printContents2 = document.querySelector('#page-chart2').outerHTML;
  const printContents3 = document.querySelector('#table-card').outerHTML;
  const printDiv = document.createElement('div');
  printDiv.className = 'print-div';

  html.appendChild(printDiv);
  printDiv.style.fontSize = '12px';
  printDiv.innerHTML += '<div class="col-xs-12" style="margin-bottom:30px"><div class="row">'+printContents1+printContents2+'</div></div><div class="col-xs-12">'+printContents3+'</div>';
  $('.print-div #page-chart1 > div > div > div:nth-child(1) > div.charts > div > div.charts__chart.chart_point1.f-left').css('background-color', "#9dc6e5");
  $('.print-div #page-chart1 > div > div > div:nth-child(1) > div.charts > div > div.charts__chart.chart_point2.f-left').css('background-color', "#cb9de5");
  $('.print-div #page-chart1 > div > div > div:nth-child(1) > div.charts > div > div.charts__chart.chart_point3.f-left').css('background-color', "#bebebe");
  $('.print-div #page-chart1 > div > div > div:nth-child(1) > div.charts > div > div.charts__chart.chart_point4.f-left').css('background-color', "#fbb7ce");
  $('.print-div #page-chart1 > div > div > div:nth-child(1) > div.charts > div > div.charts__chart.chart_point1.f-left').css('margin', "0px");
  $('.print-div #page-chart1 > div > div > div:nth-child(1) > div.charts > div > div.charts__chart.chart_point2.f-left').css('margin', "0px");
  $('.print-div #page-chart1 > div > div > div:nth-child(1) > div.charts > div > div.charts__chart.chart_point3.f-left').css('margin', "0px");
  $('.print-div #page-chart1 > div > div > div:nth-child(1) > div.charts > div > div.charts__chart.chart_point4.f-left').css('margin', "0px");

  $('.print-div #page-chart1 > div > div > div.div-chart.m-t-30 > div.charts > div > div.charts__chart.chart_point1.f-left').css('background-color', "#9dc6e5");
  $('.print-div #page-chart1 > div > div > div.div-chart.m-t-30 > div.charts > div > div.charts__chart.chart_point2.f-left').css('background-color', "#cb9de5");
  $('.print-div #page-chart1 > div > div > div.div-chart.m-t-30 > div.charts > div > div.charts__chart.chart_point3.f-left').css('background-color', "#bebebe");
  $('.print-div #page-chart1 > div > div > div.div-chart.m-t-30 > div.charts > div > div.charts__chart.chart_point4.f-left').css('background-color', "#fbb7ce");
  $('.print-div #page-chart1 > div > div > div.div-chart.m-t-30 > div.charts > div > div.charts__chart.chart_point1.f-left').css('margin', "0px");
  $('.print-div #page-chart1 > div > div > div.div-chart.m-t-30 > div.charts > div > div.charts__chart.chart_point2.f-left').css('margin', "0px");
  $('.print-div #page-chart1 > div > div > div.div-chart.m-t-30 > div.charts > div > div.charts__chart.chart_point3.f-left').css('margin', "0px");
  $('.print-div #page-chart1 > div > div > div.div-chart.m-t-30 > div.charts > div > div.charts__chart.chart_point4.f-left').css('margin', "0px");
  $('.print-div #listTable > tfoot').remove();

  document.body.style.display = 'none';
  window.print();
  document.body.style.display = 'block';
  printDiv.remove(printDiv.selectedIndex);
}
// cp선택시
$(document).on('change','#selectCP',searchFun);
// mcp선택시
$(document).on('change','#selectMCP',function(){
  $("#selectCP").empty();
  $("#selectCP").append('<option value="">CP사선택</option>');

  var mcpValue = $("#selectMCP option:selected").val();
  var param = {};
  if(mcpValue != ''){
    param.mcp = mcpValue;
  }
  $.ajax({
    url: '/kwd/getCP',
    type: 'post',
    data : param,
    datatype : 'json',
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      alert('cp리스트 불러올 수 없습니다. 다시 시도해주세요.');
    },
    success:function(data){
      if(data.status != true){
        alert('cp리스트 불러올 수 없습니다. 다시 시도해주세요.');
        return false;
      }
      data.result.forEach(function(item,idx){
        var html = '<option value="'+item.cp_id+'">'+item.cp_cname+'</option>';
        $("#selectCP").append(html);
      });
    }
  });

  param = settingParams(1);
  ajaxGetPageList('#listTable',param);
  ajaxGetPageList_statistics('#page-chart1 ',"#page-chart2 ",param);
});
// 리스트 조건 세팅
function startSetting(){
  var mcp = $.urlParam("mcp");
  if(mcp){
    $('#selectMCP > option[value='+mcp+']').attr("selected",true);
  }
  var cp = $.urlParam("cp");
  if(cp){
    $('#selectCP > option[value='+cp+']').attr("selected",true);
  }
  var oc = $.urlParam("oc");
  if(oc){
    $('input[name=oc]').val(oc);
    if($('input[name=oc]').val() == '0'){
      $('#bntCNT').removeClass('btn-select');
      $('#bntOSP').addClass('btn-select');
    } else if($('input[name=oc]').val() == '1'){
      $('#bntOSP').removeClass('btn-select');
      $('#bntCNT').addClass('btn-select');
    }
  }
  var sDate = $.urlParam("sDate");
  var eDate = $.urlParam("eDate");
  console.log(sDate,eDate);
  $('#reportrange').daterangepicker(optionSet1,cb);
  if((sDate != '' && eDate != '') && (sDate != null && eDate != null)){
    $('#reportrange span').html(moment(new Date(sDate)).format('YYYY.MM.DD') + ' - ' + moment(new Date(eDate)).format('YYYY.MM.DD'));
  }
  else{
    $('#reportrange span').html(moment(defaultSDate).format('YYYY.MM.DD') + ' - ' + moment(new Date()).format('YYYY.MM.DD'));
  }
}
//페이지 이동
$(document).on('click','#listTable .page-link',function(){
  var param = settingParams(Number($(this).data().value));
  ajaxGetPageList('#listTable',param);
});
// 리스트 새로고침
function reloadPage(){
  console.log('reloadPage');
  var pageValue = ($.urlParam("page") == '' || $.urlParam("page") == null) ? 1 : parseInt($.urlParam("page"));
  var param = settingParams(pageValue);
  ajaxGetPageList('#listTable',param);
}
// 페이지 ajax
function ajaxGetPageList(tag,param){
  console.log('ajaxGetPageList:',param);
  var ptag = '#resultList';
  if(tag == '#listTable2'){
    ptag = '#webhard-Modal';
  }
  $(ptag+' .preloader3').show();
  $.ajax({
    url: '/statistics/getNextPage',
    type: 'post',
    data: param,
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log(tag+':',data);
      $('#mcp').remove();
      if(data.status != true){
        errorMSG();
        return false;
      }
      $(tag+' tbody').empty();
      if(tag == '#listTable'){
        if(data.result.oc == '1'){
          $('#ocnt').text("콘텐츠");
        }
        else{
          $('#ocnt').text("OSP");
        }
      }
      if(tag == '#listTable2'){
        $('#webhard-Modal .cntNum span').text(numberWithCommas(data.result.listCount));
      }
      var sDate = $.urlParam("sDate");
      var eDate = $.urlParam("eDate");
      data.result.list.forEach(function(item,idx){
        var naNum = (( (Number(item.natotal.replace(/,/gi,''))+Number(item.m_natotal.replace(/,/gi,''))) / (Number(item.total.replace(/,/gi,''))+Number(item.m_total.replace(/,/gi,''))) ) * (Number(item.natotal.replace(/,/gi,''))+Number(item.m_natotal.replace(/,/gi,'')))).toFixed(1);
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        var html = '<tr><td>'+numIdx+'</td><td><div class="title_div '+((data.result.oc == '0') ? '' : 'title_div_c')+'"><span class='+((data.result.oc == '0') ? ('"openModal" data-osp="'+((item.cnt_osp == null)?item.osp_id:item.cnt_osp)+'"') : '"cnt"')+'>';
        if(data.result.oc == '0'){
          html += item.osp_sname;
        } else {
          html += item.cnt_title;
        }
        html += '</span>';
        if(data.result.oc == '0'){
          if(item.osp_tstate == '1'){
            html += '<div class="circle circle-tstate"><span>제휴</span></div>';
          } else {
            html += '<div class="circle circle-tstate circle-tstate-an"><span>비제휴</span></div>';
          }
        }
        html += '</div></td><td><div class="title_div">';
        if(naNum < 1){
          html += '<span class="text-green">● 양호 ('+naNum+')</span>';
        } else if(naNum >= 1 && naNum < 30){
          html += '<span class="text-blue">● 주의 ('+naNum+')</span>';
        } else if(naNum >=30){
          html += '<span class="text-red">● 경고 ('+naNum+')</span>';
        } else {
          html += '<span class="text-center"><i class="fas fa-minus" style="color: gray;"></i></span>';
        }
        html += '</div></td><td><span class="listNum" '+((data.result.oc == '0') ? 'data-osp="'+item.cnt_osp+'"': 'data-cid="'+item.cnt_id+'"')+' data-type="" data-title="전체검출건">'+numberWithCommas(Number(item.total.replace(/,/gi,''))+Number(item.m_total.replace(/,/gi,'')))+'</span></td>';

        html += '<td style="padding: 0;"><div class="total-result"><div class="total-div total-pc"><div class="circle circle-platform"><span>PC</span></div><span class="listNum" '+((data.result.oc == '0') ? 'data-osp="'+item.cnt_osp+'"': 'data-cid="'+item.cnt_id+'"')+' data-type="p" data-title="전체검출건">'+item.total+'</span></div>\
        <div class="total-div total-mobile"><div class="circle circle-platform"><span>Mobile</span></div><span class="listNum" '+((data.result.oc == '0') ? 'data-osp="'+item.cnt_osp+'"': 'data-cid="'+item.cnt_id+'"')+' data-type="m" data-title="전체검출건">'+item.m_total+'</span></div></div></td>\
        <td style="padding: 0;border-right: 1px solid orange;"><div class="total-result"><div class="total-div total-pc"><span class="listNum" data-osp="'+item.cnt_osp+'" data-type="p" data-title="전체제휴건">'+item.atotal+'</span></div><div class="total-div total-mobile"><span class="listNum" '+((data.result.oc == '0') ? 'data-osp="'+item.cnt_osp+'"': 'data-cid="'+item.cnt_id+'"')+' data-type="m" data-title="전체제휴건">'+item.m_atotal+'</span></div></div></td>\
        <td style="padding: 0;"><div class="total-result"><div class="total-div total-pc">\
        <span '+((data.result.oc == '0') ? ' class="listNum" data-osp="'+item.cnt_osp+'" data-type="p" data-title="전체비제휴건"' : 'class="natotal" data-type="pc" data-cid="'+item.cnt_id+'" data-osp="'+param.osp+'"')+'>'+item.natotal+'</span></div><div class="total-div total-mobile"><span '+((data.result.oc == '0') ? ' class="listNum" data-osp="'+item.cnt_osp+'" data-type="m" data-title="전체비제휴건"' : 'class="natotal" data-type="mobile"  data-cid="'+item.cnt_id+'" data-osp="'+param.osp+'"')+'>'+item.m_natotal+'</span></div></div></td>\
        <td style="padding: 0;"><div class="total-result"><div class="total-div total-pc"><span class="listNum" '+((data.result.oc == '0') ? 'data-osp="'+item.cnt_osp+'"': 'data-cid="'+item.cnt_id+'"')+' data-type="p" data-title="제휴전환건">'+item.d_atotal+'</span></div><div class="total-div total-mobile"><span class="listNum" '+((data.result.oc == '0') ? 'data-osp="'+item.cnt_osp+'"': 'data-cid="'+item.cnt_id+'"')+' data-type="m" data-title="제휴전환건">'+item.m_d_atotal+'</span></div></div></td>\
        <td style="padding: 0;"><div class="total-result"><div class="total-div total-pc"><span class="listNum" '+((data.result.oc == '0') ? 'data-osp="'+item.cnt_osp+'"': 'data-cid="'+item.cnt_id+'"')+' data-type="p" data-title="삭제건">'+item.d_dtotal+'</span></div><div class="total-div total-mobile"><span class="listNum" '+((data.result.oc == '0') ? 'data-osp="'+item.cnt_osp+'"': 'data-cid="'+item.cnt_id+'"')+' data-type="m" data-title="삭제건">'+item.m_d_dtotal+'</span></div></div></td>\
        <td style="padding: 0;"><div class="total-result"><div class="total-div total-pc"><span class="listNum" '+((data.result.oc == '0') ? 'data-osp="'+item.cnt_osp+'"': 'data-cid="'+item.cnt_id+'"')+' data-type="p" data-title="비제휴잔류">'+item.d_natotal+'</span></div><div class="total-div total-mobile"><span class="listNum" '+((data.result.oc == '0') ? 'data-osp="'+item.cnt_osp+'"': 'data-cid="'+item.cnt_id+'"')+' data-type="m" data-title="비제휴잔류">'+item.m_d_natotal+'</span></div></div></td></tr>';

        $(tag+' tbody').append(html);
      });
      console.log(data.result.oc == '1');
      $(tag+' tfoot').empty();
      if(data.result.oc == '1'){
        var limit = 20;
        var pageCount = Math.ceil(data.result.listCount/limit);
        if(pageCount > 1) {
          var html = '<tr class="footable-paging"><td colspan="10"><ul class="pagination">';
          var pageSize = 5;
          var currentPage = data.result.page;
          var pRCnt = parseInt(currentPage / pageSize);
          if(currentPage % pageSize == 0){
            pRCnt = parseInt(currentPage / pageSize) - 1;
          }
          if(currentPage > 5) {
            html += '<li class="page-item"><a class="page-link" data-value="1" aria-label="Previous">\
            <i class="ti-angle-double-left f-12"></i>\
            <span aria-hidden="true"></span>\
            <span class="sr-only">Previous</span>\
          </a></li>\
          <li class="page-item"><a class="page-link" data-value=\"'+(pRCnt * pageSize)+'"\ aria-label="Previous">\
            <i class="ti-angle-left f-12"></i>\
            <span aria-hidden="true"></span>\
            <span class="sr-only">Previous</span>\
          </a></li>';
        }
        for(var index=pRCnt * pageSize + 1;index<(pRCnt + 1)*pageSize + 1;index++){
          var active = (currentPage == index) ? "active" : "";
          html += '<li class=\"'+active+' page-item">\
          <a class="page-link" data-value=\"'+index+'"\ >'+index+'</a></li>'

          if(index == pageCount) {
            break;
          }
        }
        if((pRCnt + 1) * pageSize < pageCount) {
          html += '<li class="page-item">\
          <a class="page-link" data-value=\"'+((pRCnt + 1)*pageSize+1)+'"\ aria-label="Next">\
            <i class="ti-angle-right f-12"></i>\
            <span aria-hidden="true"></span>\
            <span class="sr-only">Next</span>\
          </a></li>\
          <li class="page-item">\
            <a class="page-link" data-value=\"'+pageCount+'"\ aria-label="Next">\
              <i class="ti-angle-double-right f-12"></i>\
              <span aria-hidden="true"></span>\
              <span class="sr-only">Next</span>\
            </a></li>';
          }
          html += '</ul></td></tr>';
          $(tag+' tfoot').append(html);
        }
      }
      $(ptag+' .preloader3').fadeOut(500);
    }
  });
}
function ajaxGetNumPageList(param){
  console.log('ajaxGetNumPageList:',param);
  var ptag = '#resultList-nm';
  $(ptag+' .preloader3').show();
  $.ajax({
    url: '/statistics/all/getNextPage',
    type: 'post',
    data: param,
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log(ptag+':',data);
      if(data.status != true){
        errorMSG();
        return false;
      }
      $(ptag+' tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        var html = '<tr>\
          <th>'+numIdx+'</th>\
          <td>'+item['plat']+'</td>\
          <td>'+item['cnt_osp']+'</td>\
          <td>'+item['cnt_mcp']+'/'+item['cnt_cp']+'</td>\
          <td><div class="reduction">'+item['ctitle']+'</div></td>\
          <td><div class="info"><a href="' + item['cnt_url'] + '" target="_blank">'+item['cnt_title']+'</a></div></td>\
          <td>'+item['cnt_price']+'</td>\
          <td>'+item['cnt_writer']+'</td>';
        html += '<td><div class="chkArr">';
        for (var j = 1; j < 4; j++) {
            html += j + ' 차 : ' + ((item['cnt_chk_'+j] == '0')?'비제휴':(item['cnt_chk_'+j] == '1')?'제휴':(item['cnt_chk_'+j] == '2')?'삭제':'확인안됨');
            if (j < 3) {
              html += '<br />';
            }
        }
        html += '</div></td>';
        html+='<td>'+item['cnt_date']+'</td></tr>';
        $(ptag+' tbody').append(html);
      });
      $(ptag+' tfoot').empty();
      var limit = 10;
      var pageCount = Math.ceil(data.result.listCount/limit);
      if(pageCount > 1) {
        var html = '<tr class="footable-paging"><td colspan="10"><ul class="pagination">';
        var pageSize = 5;
        var currentPage = data.result.page;
        var pRCnt = parseInt(currentPage / pageSize);
        if(currentPage % pageSize == 0){
          pRCnt = parseInt(currentPage / pageSize) - 1;
        }
        if(currentPage > 5) {
          html += '<li class="page-item"><a class="page-link" data-value="1" aria-label="Previous">\
          <i class="ti-angle-double-left f-12"></i>\
          <span aria-hidden="true"></span>\
          <span class="sr-only">Previous</span>\
        </a></li>\
        <li class="page-item"><a class="page-link" data-value=\"'+(pRCnt * pageSize)+'"\ aria-label="Previous">\
          <i class="ti-angle-left f-12"></i>\
          <span aria-hidden="true"></span>\
          <span class="sr-only">Previous</span>\
        </a></li>';
      }
      for(var index=pRCnt * pageSize + 1;index<(pRCnt + 1)*pageSize + 1;index++){
        var active = (currentPage == index) ? "active" : "";
        html += '<li class=\"'+active+' page-item">\
        <a class="page-link" data-value=\"'+index+'"\ >'+index+'</a></li>'

        if(index == pageCount) {
          break;
        }
      }
      if((pRCnt + 1) * pageSize < pageCount) {
        html += '<li class="page-item">\
        <a class="page-link" data-value=\"'+((pRCnt + 1)*pageSize+1)+'"\ aria-label="Next">\
          <i class="ti-angle-right f-12"></i>\
          <span aria-hidden="true"></span>\
          <span class="sr-only">Next</span>\
        </a></li>\
        <li class="page-item">\
          <a class="page-link" data-value=\"'+pageCount+'"\ aria-label="Next">\
            <i class="ti-angle-double-right f-12"></i>\
            <span aria-hidden="true"></span>\
            <span class="sr-only">Next</span>\
          </a></li>';
        }
        html += '</ul></td></tr>';
        $(ptag+' tfoot').append(html);
      }
      $(ptag+' .preloader3').fadeOut(500);
    }
  });
}
// 리스트 조건 param 세팅
function settingParams(num){
  var renewURL = window.location.origin+window.location.pathname;
  var param = {};
  if(Number.isInteger(num)){
    param.page = num;
    if(typeof history.pushState == 'function'){
      renewURL += '?page='+param.page;
      history.pushState(null, null,renewURL);
    }
  }
  // MCP
  var mcpValue = $('#selectMCP option:selected').val();
  if(mcpValue != '' && mcpValue != undefined){
    param.mcp = mcpValue;
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&mcp='+param.mcp;
      history.pushState(null, null,renewURL);
    }
  } else if($('#user_class').val() == 'm'){
    param.mcp = $('#user_id').val();
  } else if($('#user_class').val() == 'c'){
    param.mcp = $('#user_mcp').val();
  }
  // CP
  var cpValue = $('#selectCP option:selected').val();
  if(cpValue != '' && cpValue != undefined){
    param.cp = cpValue;
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&cp='+param.cp;
      history.pushState(null, null,renewURL);
    }
  } else if($('#user_class').val() == 'c'){
    param.cp = $('#user_id').val();
  }
  // oc
  var ocValue = $('input[name=oc]').val();
  if(ocValue != ''){
    param.oc = ocValue;
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&oc='+param.oc;
      history.pushState(null, null,renewURL);
    }
  }

  //날짜검색
  var dateArr = $("#reportrange span").text().split(' - ');
  if(dateArr.length > 1){
    var start = moment(new Date(dateArr[0]));
    var end = moment(new Date(dateArr[1]));
    param.sDate = start.format('YYYY-MM-DD');
    param.eDate = end.format('YYYY-MM-DD');
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&sDate='+param.sDate;
      renewURL += '&eDate='+param.eDate;
      history.pushState(null, null,renewURL);
    }
  }
  return param;
}
function settingWParams(num){
  var param = {};
  if(Number.isInteger(num)){
    param.page = num;
  }
  // MCP
  var mcpValue = $('#selectMCP option:selected').val();
  if(mcpValue != '' && mcpValue != undefined){
    param.mcp = mcpValue;
  } else if($('#user_class').val() == 'm'){
    param.mcp = $('#user_id').val();
  }
  // CP
  var cpValue = $('#selectCP option:selected').val();
  if(cpValue != '' && cpValue != undefined){
    param.cp = cpValue;
  } else if($('#user_class').val() == 'c'){
    param.cp = $('#user_id').val();
  }
  // oc
  var ocValue = $('input[name=oc]').val();
  if(ocValue != ''){
    param.oc = ocValue;
  }

  //날짜검색
  var dateArr = $("#reportrange span").text().split(' - ');
  if(dateArr.length > 1){
    var start = moment(new Date(dateArr[0]));
    var end = moment(new Date(dateArr[1]));
    param.sDate = start.format('YYYY-MM-DD');
    param.eDate = end.format('YYYY-MM-DD');
  }
  return param;
}
function settingNParams(num){
  var param = {
    id : $('#num-Modal #id_nm').val(),
    type : $('#num-Modal #type_nm').val(),
    title : $('#num-Modal #title_nm').val()
  };
  if(Number.isInteger(num)){
    param.page = num;
  }
  // cid
  var cidValue = $('#num-Modal #cid_nm').val();
  if(cidValue != ''){
    param.cid = cidValue;
  }
  // osp
  var ospValue = $('#num-Modal #osp_nm').val();
  if(ospValue != ''){
    param.osp = ospValue;
  }
  // MCP
  var mcpValue = $('#selectMCP option:selected').val();
  if(mcpValue != '' && mcpValue != undefined){
    param.mcp = mcpValue;
  } else if($('#user_class').val() == 'm'){
    param.mcp = $('#user_id').val();
  }
  // CP
  var cpValue = $('#selectCP option:selected').val();
  if(cpValue != '' && cpValue != undefined){
    param.cp = cpValue;
  } else if($('#user_class').val() == 'c'){
    param.cp = $('#user_id').val();
  }

  //날짜검색
  var dateArr = $("#reportrange span").text().split(' - ');
  if(dateArr.length > 1){
    var start = moment(new Date(dateArr[0]));
    var end = moment(new Date(dateArr[1]));
    param.sDate = start.format('YYYY-MM-DD 00:00:00');
    param.eDate = end.format('YYYY-MM-DD 23:59:59');
  }

  // 검색
  var searchValue = $('#num-Modal #searchInput-nm').val().replace(/ /gi,'');
  if(searchValue != ''){
    param.searchType = $('#num-Modal #selectSearchType-nm option:selected').val();
    param.search = searchValue;
  }

  return param;
}
function searchFun(){
  var param = settingParams(1);
  $('.charts__chart.chart--p100.chart--lg').empty();
  $('.charts__chart.chart--p100.chart--lg').append('<div class="charts__chart chart--p0 chart_point1 f-left"></div>\
  <div class="charts__chart chart--p0 chart_point2 f-left"></div>\
  <div class="charts__chart chart--p0 chart_point3 f-left"></div>\
  <div class="charts__chart chart--p0 chart_point4 f-left"></div>');

  ajaxGetPageList_statistics('#page-chart1 ',"#page-chart2 ",param);
  ajaxGetPageList('#listTable',param);
}
//날짜 선택 시
$(document).on('click','.applyBtn,.ranges ul li:not([data-range-key=직접선택])',searchFun);
//날짜 설정
var cb = function(start, end, label) {
  console.log('FUNC: cb',start.toISOString(), end.toISOString(), label);
  $('#reportrange span').html(moment(new Date(start.toISOString())).format('YYYY.MM.DD') + ' - ' + moment(new Date(end.toISOString())).format('YYYY.MM.DD'));
  searchFun();
}
var defaultSDate = new Date();
defaultSDate.setDate(defaultSDate.getDate());
var ranges = {
  '당일': [moment(), moment()],
  '전일': [moment().subtract(1, 'days'), moment()],
  '최근 7일': [moment().subtract(6, 'days'), moment()],
  '최근 30일': [moment().subtract(29, 'days'), moment()]
};
var sDateParams = $.urlParam("sDate");
var eDateParams = $.urlParam("eDate");
var optionSet1 = {
  startDate: (sDateParams != '' && sDateParams != null) ? moment(new Date(sDateParams)) : moment(defaultSDate),
  endDate:  (eDateParams != '' && eDateParams != null) ? moment(new Date(eDateParams)) : moment(),
  showDropdowns: true,
  showRangeInputsOnCustomRangeOnly: false,
  ranges: ranges,
  opens: 'left',
  buttonClasses: ['btn'],
  applyClass: 'btn-small btn-primary',
  cancelClass: 'btn-small',
  format: 'YYYY.MM.DD',
  separator: ' to ',
  locale: {
    applyLabel: '확인',
    cancelLabel: '취소',
    customRangeLabel: '직접선택',
    daysOfWeek: ['일', '월', '화', '수', '목', '금', '토'],
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    firstDay: 1
  }
};
