$(document).ready(function(){
  startSetting();
});
// 상세보기
$('.btn-detail').on('click',function(){
  $('#detail-Modal').modal('show');
});

// 리스트 조건 세팅
function startSetting(){
  var sDate = $.urlParam("sDate");
  var eDate = $.urlParam("eDate");
  console.log(sDate,eDate);

  if((sDate != '' && eDate != '') && (sDate != null && eDate != null)){
    calMonthStart.setDate(new Date(sDate));
    calMonthEnd.setDate(new Date(eDate));
  }

  // $('#reportrange').daterangepicker(optionSet1,cb);
  // if((sDate != '' && eDate != '') && (sDate != null && eDate != null)){
  //   $('#reportrange span').html(moment(new Date(sDate)).format('YYYY.MM') + ' - ' + moment(new Date(eDate)).format('YYYY.MM'));
  // } else{
  //   $('#reportrange span').html(moment().subtract(2,'d').format('YYYY.MM') + ' - ' + moment().format('YYYY.MM'));
  // }
}
/* 월달력 소스 시작 */
var DatePicker = tui.DatePicker;
var calMonthStart = new DatePicker('#datepicker-month-start', {
   date: new Date(),
   language: 'ko',
   type: 'month',
   input: {
       element: '#datepicker-input-start',
       format: 'yyyy-MM'
   }
});
var calMonthEnd = new DatePicker('#datepicker-month-end', {
   date: new Date(),
   language: 'ko',
   type: 'month',
   input: {
       element: '#datepicker-input-end',
       format: 'yyyy-MM'
   }
});

calMonthStart.on('change', function() {
  var sDate = calMonthStart.getDate();
  var eDate = calMonthEnd.getDate();
  if(sDate > eDate){
    return false;
  }
  searchFun();
});

calMonthEnd.on('change', function() {
  var sDate = calMonthStart.getDate();
  var eDate = calMonthEnd.getDate();
  if(sDate > eDate){
    alert('시작 날짜보다 작습니다. 다시 설정해주세요.');
    return false;
  }
  searchFun();
});
/* 월달력 소스 끝 */
// 검색 이벤트
function searchFun(){
  var param = settingParams(1);
  console.log(param);
  // ajaxGetPageList(param);
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
  // OSP
  var ospValue = $('#selectOSP option:selected').val();
  if(ospValue != ''){
    param.osp = ospValue;
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&osp='+param.osp;
      history.pushState(null, null,renewURL);
    }
  }

  //날짜검색
  var start = calMonthStart.getDate();
  var end = calMonthEnd.getDate();
  if(start <= end){
    param.sDate = moment(new Date(start)).format('YYYY-MM');
    param.eDate = moment(new Date(end)).format('YYYY-MM');
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&sDate='+param.sDate;
      renewURL += '&eDate='+param.eDate;
      history.pushState(null, null,renewURL);
    }
  }
  return param;
}
