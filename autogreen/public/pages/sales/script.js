$(document).ready(function(){
  startSetting();
});

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

  searchFun();
});
// osp,cp선택시
$(document).on('change','#selectCP,#selectOSP',searchFun);
// 엑셀 클릭시
$(document).on('click','.btn-excel',function(){
  swal({
    title: "엑셀출력하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      var param = settingParams('excel');
      location.href = '/sales/excel'+encodeQueryString(param);
    }
  });
});
// 상세보기
$(document).on('click','.btn-detail',function(){
  $('#detail-Modal').modal('show');
  ajaxGetPageList_m(1,$(this).data('osp'));
});
$(document).on('click','.page-link',function(){
  ajaxGetPageList_m(Number($(this).data().value),$('#listTable_m').data('osp'));
});
// 상세보기 엑셀 클릭시
$(document).on('click','.btn-m-excel',function(){
  swal({
    title: "엑셀출력하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      var param = settingParams('excel');
      param['type'] = 'detail';
      param['osp'] = $('#listTable_m').data('osp');
      console.log(param);
      location.href = '/sales/excel'+encodeQueryString(param);
    }
  });
});
// 상세보기 리스트
function ajaxGetPageList_m(num,osp){
  var param = settingParams(num);
  param['offset']=10;
  param['osp']=osp;
  if (parseInt(num) > 0) {
    param['limit'] = (num - 1) * param['offset'];
  }
  console.log(param);
  $.ajax({
    url: '/sales/detail',
    type: 'post',
    data: param,
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log('ajaxGetPageList_m:',data);
      if(data.status != true){
        errorMSG();
        return false;
      }
      $('.btn-m-excel').data('param',JSON.stringify(param));
      $('#listTable_m').data('osp',param['osp']);
      $('#listTable_m tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-idx-param['limit']).toString();
        var html = '<tr><th>'+numIdx+'</th>\
          <td>'+item.s_settlement_date+'</td>\
          <td>'+item.s_osp+'</td>\
          <td>'+item.s_total_sales+'</td>\
          <td>'+item.s_total_money+'</td>\
          <td>'+item.s_settlement_money+'</td>\
        </tr>';
        $('#listTable_m tbody').append(html);
      });

      var limit = param['offset'];
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable_m tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr><td colspan="6"><ul class="pagination float-right">';
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
        $('#listTable_m tfoot').append(html);
      }
    }
  });
}
// 리스트 조건 세팅
function startSetting(){
  var sDate = $.urlParam("sDate");
  var eDate = $.urlParam("eDate");
  if((sDate != '' && eDate != '') && (sDate != null && eDate != null)){
    calMonthStart.setDate(new Date(sDate));
    calMonthEnd.setDate(new Date(eDate));
  } else {
    calMonthStart.setDate(new Date($('#sDate').val()));
    calMonthEnd.setDate(new Date($('#eDate').val()));
  }
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
  ajaxGetPageList(param);
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

// 리스트 조건적용 ajax
function ajaxGetPageList(param){
  // $('#chart1').highcharts(option);
  console.log('ajaxGetPageList:',param);
  $('.preloader3').show();
  $.ajax({
    url: '/sales/getNextPage',
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
      $('#chart1').highcharts(option);
      // $('#graph').val(data.result.graph);

      $('#totalTable td').text('');
      $('#totalTable #s_total_money').text(data.result.totalResult.s_total_money);
      $('#totalTable #s_settlement_money').text(data.result.totalResult.s_settlement_money);

      $('#listTable tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = idx+1;
        var html = '<tr><th>'+numIdx+'</th>\
          <td>'+((data.result.sDate == data.result.eDate) ? data.result.sDate:(data.result.sDate+' ~ '+data.result.eDate))+'</td>\
          <td>'+item.s_osp+'</td>\
          <td>'+item.s_total_money+'</td>\
          <td>'+item.s_settlement_money+'</td>\
          <td>'+item.s_total_sales+'</td>\
          <td class="text-center">\
            <button type="button" class="btn-detail tabledit-edit-button btn btn-primary waves-effect waves-light text-center" data-osp="'+item.s_osp+'">\
              <span class="far fa-edit"></span>\
            </button>\
          </td></tr>';
        $('#listTable tbody').append(html);
      });
      $('.preloader3').fadeOut(500);
    }
  });
}

function encodeQueryString(params) {
    const keys = Object.keys(params)
    return keys.length
        ? "?" + keys
            .map(key => encodeURIComponent(key)
                + "=" + encodeURIComponent(params[key]))
            .join("&")
        : ""
}
