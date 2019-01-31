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
  $('#reportrange').daterangepicker(optionSet1,cb);
  if((sDate != '' && eDate != '') && (sDate != null && eDate != null)){
    $('#reportrange span').html(moment(new Date(sDate)).format('YYYY.MM.DD') + ' - ' + moment(new Date(eDate)).format('YYYY.MM.DD'));
  } else{
    $('#reportrange span').html(moment().subtract(2,'d').format('YYYY.MM.DD') + ' - ' + moment().format('YYYY.MM.DD'));
  }
}

//날짜 설정
var cb = function(start, end, label) {
  console.log('FUNC: cb',start.toISOString(), end.toISOString(), label);
  $('#reportrange span').html(moment(new Date(start.toISOString())).format('YYYY.MM.DD') + ' - ' + moment(new Date(end.toISOString())).format('YYYY.MM.DD'));
  searchFun();
}

// 검색 이벤트
function searchFun(){
  var param = settingParams(1);
  ajaxGetPageList(param);
}

var ranges = {
  '당일': [moment(), moment()],
  '전일': [moment().subtract(1, 'days'), moment()],
  '최근 7일': [moment().subtract(6, 'days'), moment()],
  '최근 30일': [moment().subtract(29, 'days'), moment()]
};
var sDateParams = $.urlParam("sDate");
var eDateParams = $.urlParam("eDate");
var optionSet1 = {
  startDate: (sDateParams != '' && sDateParams != null) ? moment(new Date(sDateParams)) : moment().subtract(2,'d'),
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
