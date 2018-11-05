$(document).ready(function(){
  startSetting();
});
// 프린트
function onPrint() {
  const html = document.querySelector('html');
  const printContents = document.querySelector('#printEle .card-block').outerHTML;
  const printContents1 = document.querySelector('#printEle .col-md-6').outerHTML;
  const printContents2 = document.querySelector('#printEle .col-md-4').outerHTML;
  const printDiv = document.createElement('div');
  printDiv.className = 'print-div';

  html.appendChild(printDiv);
  printDiv.style.fontSize = '12px';
  printDiv.innerHTML += '<div class="col-md-12" style="margin-bottom:30px">'+printContents1+printContents2+'</div><div class="col-md-12">'+printContents+'</div>';
  printDiv.getElementsByClassName("col-md-6")[0].classList.remove("f-left");
  printDiv.getElementsByClassName("col-md-4")[0].classList.remove("f-right");

  printDiv.getElementsByClassName("col-md-6").minWidth = '400px';
  printDiv.getElementsByClassName("col-md-6").maxWidth = '400px';
  printDiv.getElementsByClassName("col-md-4").minWidth = '290px';
  printDiv.getElementsByClassName("col-md-4").maxWidth = '290px';
  document.body.style.display = 'none';
  window.print();
  document.body.style.display = 'block';
  printDiv.remove(printDiv.selectedIndex);
}
// 제휴사/비제휴사 선택시
$('#selectTState').on("change",searchFun);
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
  ajaxGetPageList(param);
});
// osp/콘텐츠 선택시
$('#selectOC').on("change",searchFun);
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
  var selectTState = $.urlParam("selectTState");
  if(selectTState){
    $('#selectTState > option[value='+selectTState+']').attr("selected",true);
  }
  var selectOC = $.urlParam("selectOC");
  if(selectOC){
    $('#selectOC > option[value='+selectOC+']').attr("selected",true);
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
$(document).on('click','.page-link',function(){
  var param = settingParams(Number($(this).data().value));
  ajaxGetPageList(param);
});
// 리스트 새로고침
function reloadPage(){
  console.log('reloadPage');
  var pageValue = ($.urlParam("page") == '' || $.urlParam("page") == null) ? 1 : parseInt($.urlParam("page"));
  var param = settingParams(pageValue);
  ajaxGetPageList(param);
}
// 페이지 ajax
function ajaxGetPageList(param){
  console.log('ajaxGetPageList:',param);
  $('.preloader3').show();
  $.ajax({
    url: '/statistics/getNextPage',
    type: 'post',
    data: param,
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log(data);
      if(data.status != true){
        errorMSG();
        return false;
      }
      $('#listTable tbody').empty();
      var oc = $('#selectOC option:selected').val();
      if(oc == '1'){
        $('#ocnt').text("콘텐츠");
        $('#mcp').show();
      }
      else{
        $('#ocnt').text("OSP");
        $('#mcp').hide();
      }

      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-idx-(data.result.page-1)).toString();
        var html = '<tr><td>'+numIdx+'</td><td>'+item.osp_sname+'</td><td></td><td>'+((item.osp_tstate == '1')?'제휴':'비제휴')+'</td><td>'+item.total+'</td><td>'+item.atotal+'</td><td>'+item.natotal+'</td><td>0</td><td>0</td><td>0</td></tr>';
        if(oc == '1'){
          html = '<tr><td>'+numIdx+'</td><td>'+item.osp_sname+'</td><td>'+((item.osp_tstate == '1')?'제휴':'비제휴')+'</td><td>'+item.cnt_mcp+' / '+item.cnt_cp+'</td><td>'+((item.osp_tstate == '1')?'제휴':'비제휴')+'</td><td>'+item.total+'</td><td>'+item.atotal+'</td><td>'+item.natotal+'</td><td>0</td><td>0</td><td>0</td></tr>';
        }

        $('#listTable tbody').append(html);
      });
      var limit = 10;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr><td colspan="12"><ul class="pagination float-right">';
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
        $('#listTable tfoot').append(html);
      }
      $('.preloader3').fadeOut(500);
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
  if(mcpValue != ''){
    param.mcp = mcpValue;
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&mcp='+param.mcp;
      history.pushState(null, null,renewURL);
    }
  }
  // CP
  var cpValue = $('#selectCP option:selected').val();
  if(cpValue != ''){
    param.cp = cpValue;
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&cp='+param.cp;
      history.pushState(null, null,renewURL);
    }
  }
  // 제휴/비제휴
  var tsValue = $('#selectTState option:selected').val();
  if(tsValue != ''){
    param.tstate = tsValue;
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&c='+param.tstate;
      history.pushState(null, null,renewURL);
    }
  }
  // osp/콘텐츠
  var ocValue = $('#selectOC option:selected').val();
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
function searchFun(){
  var param = settingParams(1);
  ajaxGetPageList(param);
}
//날짜 선택 시
$(document).on('click','.applyBtn',searchFun);
//날짜 설정
var cb = function(start, end, label) {
  console.log('FUNC: cb',start.toISOString(), end.toISOString(), label);
  $('#reportrange span').html(moment(new Date(start.toISOString())).format('YYYY.MM.DD') + ' - ' + moment(new Date(end.toISOString())).format('YYYY.MM.DD'));
  searchFun();
}
var defaultSDate = new Date();
defaultSDate.setMonth(defaultSDate.getMonth()-1);
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
