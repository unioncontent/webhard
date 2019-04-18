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
$(document).on('click','#listTable .page-link',function(){
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
// 정산 삭제 버튼 클릭시
$(document).on("click",'#detail-Modal .btn-delete',function(){
  var n_idx = $(this).data('idx');
  var osp = $(this).data('osp');
  swal({
    title: "삭제 하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true,
  })
  .then((value) =>{
    if(value != null){
      $.ajax({
        url: '/sales/delete',
        type: 'post',
        data: {n_idx: n_idx},
        error:function(request,status,error){
          errorMSG();
        },
        success:function(data){
          alert("삭제되었습니다.");
          reloadPage1();
          ajaxGetPageList_m(1,osp);
        }
      });
    }
  });
});
// 정산 수정 모달
$(document).on("click",'#detail-Modal .btn-edit',function(){
  // 초기화
  $('#edit-Modal input').val('');
  $('#edit-Modal select option:selected').prop('selected',false);

  $('#idx_em').val($(this).data('idx'));
  $('.btn-update-em').data('idx',$('#idx_em').val());
  $('#osp_em').val($(this).data('osp'));

  $.ajax({
    url: '/sales/edit/info',
    type: 'post',
    data: {n_idx: $('#idx_em').val()},
    error:function(request,status,error){
      errorMSG();
    },
    success:function(data){
      console.log(data);
      if(data.status == false){
        alert('불러오기에 실패했습니다.');
        return false;
      }
      $.each(data.result[0],function(i,v){
        console.log(i,v);
        if(i == 'n_idx'){
          return true;
        }
        $('#edit-Modal input#o_'+i).val(v);
        // mcp
        if(i == 's_mcp'){
          if($('#selectMCP_em') != undefined){
            $('#selectMCP_em option[value='+ v +']').prop('selected', true);
          }
        }
        // cp
        else if(i == 's_cp'){
          if($('#selectCP_em') != undefined){
            $('#selectCP_em option[value='+ v +']').prop('selected', true);
          }
        }
        // osp
        else if(i == 's_osp'){
          $('#selectOSP_em option[value='+ v +']').prop('selected', true);
        }
        // 정산일
        else if(i == 's_settlement_date'){
          var v_arr = v.split('-');
          var yyyy = v_arr[0];
          var mm = v_arr[1];
          $('#selectYear_em option[value='+ yyyy +']').prop('selected', true);
          $('#selectMonth_em option[value='+ mm +']').prop('selected', true);
        }
        // 총매출금액,총판매건,MG,요율,정산매출
        else{
          $('#'+i+'_em').val(v);
        }
      });
      // $('#detail-Modal').modal('hide');
      $('#edit-Modal').modal('show');
    }
  });
});
$('#edit-Modal').on('hidden.bs.modal', function () {
  if($('#detail-Modal').css('display') == 'block'){
    setTimeout(function() {
      $('body').addClass('modal-open');
    }, 500);
  }
});
// 정산 수정 버튼 클릭시
$(document).on("click",'#edit-Modal .btn-update-em',function(){
  var n_idx = $(this).data('idx');
  var osp = $('#osp_em').val();
  var param = settingParamsEdit();
  if(typeof param == 'boolean'){
    return false;
  }
  param.idx = n_idx;
  swal({
    title: "수정 하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true,
  })
  .then((value) =>{
    if(value != null){
      console.log('정산 수정 :',param);
      $.ajax({
        url: '/sales/edit',
        type: 'post',
        data: param,
        error:function(request,status,error){
          errorMSG();
        },
        success:function(data){
          console.log(data);
          if(data.status == false){
            alert('수정 실패했습니다.');
            return false;
          }
          alert("수정되었습니다.");
          reloadPage1();
          ajaxGetPageList_m(1,osp);
          $('#edit-Modal').modal('hide');
        }
      });
    }
  });
});
// 수정 파라미터 세팅
function settingParamsEdit(){
  var param = {
    s_mcp:($('#selectMCP_em option:selected').val() == undefined)?'':$('#selectMCP_em option:selected').val(),
    s_cp:$('#selectCP_em option:selected').val(),
    s_osp:$('#selectOSP_em option:selected').val(),
    s_total_money:$('#s_total_money_em').val(),
    s_total_sales:$('#s_total_sales_em').val(),
    s_settlement_money:$('#s_settlement_money_em').val(),
    s_settlement_date:$('#selectYear_em option:selected').val()+'-'+$('#selectMonth_em option:selected').val(),
    s_rate:$('#s_rate_em').val(),
    s_mg:$('#s_mg_em').val()
  };
  if($('#user_class').val() == 'm'){
    param.s_mcp = $('#user_id').val();
  }
  else if($('#user_class').val() == 'c'){
    param.s_mcp = $('#user_mcp').val();
    param.s_cp = $('#user_id').val();
  }
  else{
    param.s_mcp = $("#add-Modal #selectMCP option:selected").val();
  }
  if(param.s_mcp == ""){
    alert("관리사(MCP)를 선택해주세요.");
    param = false
  }
  if(param.s_cp == ""){
    alert("저작권사(CP)를 선택해주세요.");
    param = false
  }
  if(param.s_osp == ""){
    alert("OSP를 선택해주세요.");
    param = false
  }
  if(param.s_total_money == ""){
    alert("총매출금액을 입력해주세요.");
    param = false
  }
  if(param.s_total_sales == ""){
    alert("총판매건을 입력해주세요.");
    param = false
  }
  if(param.s_mg == ""){
    alert("MG를 입력해주세요.");
    param = false
  }
  if(param.s_rate == ""){
    alert("요율을 입력해주세요.");
    param = false
  }
  if(param.s_settlement_money == ""){
    alert("정산매출을 입력해주세요.");
    param = false
  }
  return param;
}
// 상세보기 리스트
function ajaxGetPageList_m(num,osp){
  $('#listTable_m tbody').empty();
  $('#listTable_m tfoot').empty();
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
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-idx-param['limit']).toString();
        var html = '<tr><th>'+numIdx+'</th>\
          <td>'+item.s_settlement_date+'</td>\
          <td>'+item.s_osp+'</td>\
          <td>'+item.s_total_sales+'</td>\
          <td>'+item.s_total_money+'</td>\
          <td>'+((item.s_mg == null)?'':item.s_mg)+'</td>\
          <td>'+((item.s_rate == null)?'':item.s_rate)+'</td>\
          <td>'+item.s_settlement_money+'</td>\
          <td class="text-center">\
            <div class="btn-group btn-group-sm text-center" style="padding-right: 0; display: inline-block;">\
              <button type="button" class="btn-delete btn btn-sm btn-danger waves-effect waves-light alert-confirm1" style="margin-right: 5px;" data-osp="'+item.s_osp+'" data-idx="'+item.n_idx+'">\
                <span class="far fa-trash-alt"></span>\
              </button>\
              <button type="button" class="btn-edit btn btn-sm btn-primary waves-effect waves-light" data-osp="'+item.s_osp+'" data-idx="'+item.n_idx+'">\
                <span class="far fa-edit"></span>\
              </button>\
            </div>\
          </td>\
        </tr>';
        $('#listTable_m tbody').append(html);
      });

      var limit = param['offset'];
      var pageCount = Math.ceil(data.result.listCount/limit);
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
  if(mcpValue != '' && mcpValue != undefined){
    param.mcp = mcpValue;
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&mcp='+param.mcp;
      history.pushState(null, null,renewURL);
    }
  } else if($('#user_class').val() == 'm'){
    param.mcp = $('#user_id').val();
    if(typeof history.pushState == 'function'){
      renewURL += '&mcp='+param.mcp;
      history.pushState(null, null,renewURL);
    }
  } else if($('#user_class').val() == 'c'){
    param.mcp = $('#user_mcp').val();
    if(typeof history.pushState == 'function'){
      renewURL += '&mcp='+param.mcp;
      history.pushState(null, null,renewURL);
    }
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
    if(typeof history.pushState == 'function'){
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
// 리스트 새로고침
function reloadPage1(){
  console.log('reloadPage1');
  var pageValue = ($.urlParam("page") == '' || $.urlParam("page") == null) ? 1 : parseInt($.urlParam("page"));
  var param = settingParams(pageValue);
  ajaxGetPageList(param);
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
      $('#graph').val(data.result.graph);
      option["series"][0]["data"] = serieesData();
      chartRoad(option);

      $('#totalTable td').text('');
      $('#totalTable #s_total_money').text(data.result.totalResult.s_total_money);
      $('#totalTable #s_total_sales').text(data.result.totalResult.s_total_sales);
      $('#totalTable #s_mg').text(data.result.totalResult.s_mg);
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
          <td>'+((item.s_mg == null)?'':item.s_mg)+'</td>\
          <td>'+((item.s_rate == null)?'':item.s_rate)+'</td>\
          <td class="text-center">\
            <button type="button" class="btn-detail tabledit-edit-button btn btn-default waves-effect waves-light text-center" data-osp="'+item.s_osp+'">\
              <i class="fas fa-info"></i>\
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
