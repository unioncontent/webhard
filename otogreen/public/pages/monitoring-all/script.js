$(document).ready(function(){
  startSetting();
  var z_result = $.urlParam('z-result');
  if(z_result == 'false'){
    swal("ERROR!", "다운로드 할 이미지가 없습니다.", "error");
    settingParams(1);
  }
  else if(z_result == 'zipError'){
    swal("ERROR!", "다운로드에 실패했습니다.\n사이트 담당자에게 문의바랍니다.", "error");
    settingParams(1);
  }
});

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
      var originURL = window.location.href;
      var param = settingParams('excel');
      console.log(param);
      history.pushState(null, null,originURL);
      // location.href = window.location.pathname+'/excel'+encodeQueryString(param);
      location.href = 'http://61.82.113.197:3000/monitoring/all/excel'+encodeQueryString(param);
    }
  });
});

// 이미지 클릭시
$(document).on('click','.btn-image',function(){
  swal({
    title: "이미지 받으시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      var originURL = window.location.href;
      var param = settingParams('image');
      history.pushState(null, null,originURL);
      // location.href = window.location.pathname+'/image'+encodeQueryString(param);
      location.href = 'http://61.82.113.197:3000/monitoring/all/image'+encodeQueryString(param);
    }
  });
});

function encodeQueryString(params) {
    const keys = Object.keys(params)
    return keys.length
        ? "?" + keys
            .map(key => encodeURIComponent(key)
                + "=" + encodeURIComponent(params[key]))
            .join("&")
        : ""
}

var resultInputEle = {
  cnt_cp: $("#cnt_cp"),
  cnt_mcp: $("#cnt_mcp"),
  osp_sname: $("#osp_sname"),
  title: $("#title"),
  cnt_num: $("#cnt_num"),
  cnt_price: $("#cnt_price"),
  cnt_writer: $("#cnt_writer"),
  k_title: $("#k_title"),
  cnt_title: $("#cnt_title"),
  cnt_url: $("#cnt_url"),
  cnt_vol: $("#cnt_vol"),
  cnt_fname: $("#cnt_fname"),
  cnt_regdate: $("#cnt_regdate"),
  go_regdate: $("#go_regdate"),
  cnt_img_name: $("#cnt_img_name")
};

// 제목 클릭시
$(document).on('click', '.info-open', function() {
  var pType = $('#selectType option:selected').val();
  var idx = $(this).data('idx');
  var cidx = $(this).data('cidx');
  // detail 초기화
  $('#detail-Modal p').text('');
  $('#detail-Modal p').children().remove();
  $('#img-list').empty();
  $('#detail-Modal').modal('show');
  $.ajax({
    url: '/monitoring_w/getInfo',
    type: 'post',
    data: {
      idx: idx,
      pType:pType
    },
    error: function(request, status, error) {
      errorMSG();
    },
    success: function(data) {
      for (var key in resultInputEle) {
        if (key == 'go_regdate') {
          continue;
        }
        var tag = '<label class="label label-default">제휴</label>';
        if (key == 'cnt_num' && (data['cnt_chk_1'] == '1' || data['cnt_chk_2'] == '1' || data['cnt_chk_3'] == '1')) {
          resultInputEle[key].append(tag + data[key]);
        } else if (key == 'title') {
          resultInputEle[key].append('<a href="' + data['cnt_url'] + '" target="_blank">' + data[key] + '</a>');
        } else {
          resultInputEle[key].text(data[key]);
        }
      }
      var dateArr = '';
      if (data['cnt_chk_1'] == '0' || data['cnt_chk_2'] == '0' || data['cnt_chk_3'] == '0') {
        for (var i = 1; i < 4; i++) {
          // var dateStr = (dateArr[i-1] == undefined) ? '':dateArr[i-1];
          var img_title = (data['cnt_img_' + i] == '' || data['cnt_img_' + i] == null)
            ? 'untitled.jpg'
            : data['cnt_img_' + i].split('/');
          img_title = (img_title.length > 3)
            ? img_title
            : img_title[img_title.length - 1];

          var imgHtml = '<div class="col-img-item"><div class="articles context-menu-one" data-num="' + i + '" data-idx="' + data['cnt_num'] + '" data-url="' + data['cnt_url'] + '">';
          imgHtml += '<a title="' + img_title + '" data-lightbox="image-1" rel="group1" href="http://61.82.113.197:3000/monitoring_img' + (
            (data['cnt_img_' + i] == '' || data['cnt_img_' + i] == null)
            ? '/untitled.jpg'
            : data['cnt_img_' + i]) + '">';
          imgHtml += '<img class="img-fluid c-pointer lightbox-img" src="http://61.82.113.197:3000/monitoring_img' + (
            (data['cnt_img_' + i] == '' || data['cnt_img_' + i] == null)
            ? '/untitled.jpg'
            : data['cnt_img_' + i]) + '"></a>';
          var breakCheck = false;
          if (data['cnt_img_' + i] != '/untitled.jpg' && data['cnt_chk_' + i] != '2') {
            imgHtml += (
              (data['cnt_img_' + i] == '' || data['cnt_img_' + i] == null)
              ? ''
              : ('<h6>' + i + '차: ' + data['cnt_date_' + i] + '</h6>')) + '</div></div>';
          } else if (data['cnt_img_' + i] == '/untitled.jpg' || data['cnt_chk_' + i] == '2') {
            imgHtml += '<h6>게시물 삭제됨</h6></div></div>';
            breakCheck = true;
          }
          $('#img-list').append(imgHtml);
          if (breakCheck) {
            break;
          }
        }
      }
    }
  });
});

// 모달 닫기
$(document).on('click','.modal-close',function(){
  $('#info-Modal').modal('hide');
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

  param = settingParams(1);
  ajaxGetPageList(param);
});
$(document).on('change','#selectOState',function(){
  $('#selectOSP option').remove();
  $('#selectOSP').append('<option value="">OSP사선택</option>');
  searchFun()
});
// osp,State선택시
$(document).on('change', '#selectOState,#selectCP,#selectState,#selectType,#selectMChk,#selectOSP', searchFun);
//날짜 선택 시
$(document).on('click','.applyBtn,.ranges ul li:not([data-range-key=직접선택])',searchFun);
// $(document).on('click','.applyBtn',searchFun);
// 검색
$('#searchInput').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#searchBtn').trigger('click');
  };
});
$('#searchBtn').on('click',searchFun);

//페이지 이동
$(document).on('click','#listTable_a .page-link',function(){
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
// 검토상태 수정시
$(document).on('change','.table-select',function(){
  var param = {
    idx:$(this).data('idx'),
    pType:$('#selectType option:selected').val(),
    chk:$(this).find('option:selected').val()
  }
  swal({
    title:"검토상태를 수정하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true,
  }).then(function(value) {
    if (value != null) {
      console.log(param);
      $.ajax({
        url: '/monitoring_w/all/updatemChk',
        type: 'post',
        data: param,
        error: function(request, status, error) {
          errorMSG();
        },
        success: function(data) {
          if (data) {
            alert('수정 되었습니다.');
            reloadPage();
          }
        }
      });
    }
  });
});
// 페이지 ajax
function ajaxGetPageList(param) {
  console.log('ajaxGetPageList:', param);
  $('.preloader3').show();
  $.ajax({
    url: '/monitoring_w/all/getNextPage',
    type: 'post',
    data: param,
    error: function(request, status, error) {
      errorMSG();
    },
    success: function(data) {
      console.log(data);
      if (data.status != true) {
        errorMSG();
        return false;
      }
      $('#selectOSP option').remove();
      $('#selectOSP').append('<option value="">OSP사선택</option>');
      data.result.ospList.forEach(function(item, idx) {
        $('#selectOSP').append('<option value="'+item.osp_id+'" '+((data.result.osp == item.osp_id)?'selected':'')+'>'+item.osp_sname+'</option>');
      });
      $('#listTable_a tbody').empty();
      data.result.list.forEach(function(item, idx) {
        // <td>' + item.cnt_mcp + "/<br>" + item.cnt_cp + '</td>\
        var numIdx = Math.ceil(data.result.listCount - (data.result.offset + idx)).toString();
        var html = '<tr><th>' + numIdx + '</th>\
        <td>\
          <select name="select" data-idx="' + item.n_idx + '"class="col-xs-1 form-control table-select">\
            <option value="1" '+((item.cnt_f_mchk=='1')?'selected':'')+'>검토</option>\
            <option value="0" '+((item.cnt_f_mchk=='0'||item.cnt_f_mchk==''||item.cnt_f_mchk==null)?'selected':'')+'>미검토</option>\
          </select>\
        </td>\
        <td>' + item.osp_sname + '</td>\
        <td><div class="reduction">' + item.ctitle + '</div></td>\
        <td class="info-td"><div class="info-open" data-cidx="' + item.cidx + '" data-idx="' + item.n_idx + '">';
        if (item['cnt_img_1'] != '' && item['cnt_img_1'] != null && item['cnt_chk_1'] == '0' && item['cnt_img_1'] != '/untitled.jpg') {
          html += '<i class="fas fa-image text-muted"></i>';
        }
        html += item.cnt_title + '</div></td>\
        <td>' + ((item.cnt_price == null)? '': item.cnt_price) + '</td>\
        <td>' + ((item.cnt_writer == null)? '': item.cnt_writer) + '</td>';
        html += '<td><div class="dateArr chkArr">';
        for (var j = 1; j < 4; j++) {
            html += j + ' 차 : ' + ((item['cnt_chk_'+j] == '0')?'비제휴':(item['cnt_chk_'+j] == '1')?'제휴':(item['cnt_chk_'+j] == '2')?'삭제':'확인안됨');
            if (j < 3) {
              html += '<br />';
            }
        }
        html += '</div></td><td><div class="dateArr">';
        for (var j = 1; j < 4; j++) {
          if (item['cnt_img_' + j] != '' && item['cnt_img_' + j] != null && item['cnt_img_' + j] != undefined) {
            if (item['cnt_img_' + j] != '/untitled.jpg' && item['cnt_chk_' + j] != '2') {
              html += j + ' 차 : ' + item['cnt_date_' + j];
            } else {
              break;
            }
            if (j < 3) {
              html += '<br />';
            }
          } else if (j == 1) {
            html += j + ' 차 : ' + item['cnt_date_' + j];
            html += '<br />';
          }
        }
        html += '</div><td><div class="dateArr mailArr">';
        if(item['cnt_chk_1'] == '0'){
          for (var j = 1; j < 4; j++) {
            var mailMSG = errorMSG(item['cnt_mail_'+j]);
            var tooltipStr = ((mailMSG[0] == '실패')? 'data-toggle="tooltip" data-placement="top" title="'+mailMSG[1]+'"' : '');
            if (item['cnt_img_' + j] != '' && item['cnt_img_' + j] != null && item['cnt_img_' + j] != undefined) {
              if (item['cnt_img_' + j] != '/untitled.jpg' && item['cnt_chk_' + j] != '2') {
                html += '<span '+tooltipStr+'>'+j + ' 차 : ' + mailMSG[0]+'</span>';
              } else {
                break;
              }
              if (j < 3) {
                html += '<br />';
              }
            } else if (j == 1) {
              html += '<span '+tooltipStr+'>'+j + ' 차 : ' + mailMSG[0]+'</span>';
              html += '<br />';
            }
          }
        }
        html += '</div></td></tr>';
        $('#listTable_a tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount / limit);
      $('#listTable_a tfoot .pagination').empty();
      if (pageCount > 1) {
        var html = '';
        var pageSize = 5;
        var currentPage = data.result.page;
        var pRCnt = parseInt(currentPage / pageSize);
        if (currentPage % pageSize == 0) {
          pRCnt = parseInt(currentPage / pageSize) - 1;
        }
        if (currentPage > 5) {
          html += '<li class="page-item"><a class="page-link" data-value="1" aria-label="Previous">\
            <i class="ti-angle-double-left f-12"></i>\
            <span aria-hidden="true"></span>\
            <span class="sr-only">Previous</span>\
          </a></li>\
          <li class="page-item"><a class="page-link" data-value=\"' + (
          pRCnt * pageSize) + '"\ aria-label="Previous">\
            <i class="ti-angle-left f-12"></i>\
            <span aria-hidden="true"></span>\
            <span class="sr-only">Previous</span>\
          </a></li>';
        }

        for (var index = pRCnt * pageSize + 1; index < (pRCnt + 1) * pageSize + 1; index++) {
          var active = (currentPage == index)
            ? "active"
            : "";
          html += '<li class=\"' + active + ' page-item">\
          <a class="page-link" data-value=\"' + index + '"\ >' + index + '</a></li>'

          if (index == pageCount) {
            break;
          }
        }
        if ((pRCnt + 1) * pageSize < pageCount) {
          html += '<li class="page-item">\
              <a class="page-link" data-value=\"' + (
          (pRCnt + 1) * pageSize + 1) + '"\ aria-label="Next">\
                <i class="ti-angle-right f-12"></i>\
                <span aria-hidden="true"></span>\
                <span class="sr-only">Next</span>\
              </a></li>\
              <li class="page-item">\
              <a class="page-link" data-value=\"' + pageCount + '"\ aria-label="Next">\
                <i class="ti-angle-double-right f-12"></i>\
                <span aria-hidden="true"></span>\
                <span class="sr-only">Next</span>\
              </a></li>';
        }
        $('#listTable_a tfoot .pagination').append(html);
      }
      $('.preloader3').fadeOut(500);
    }
  });
}
function numberWithCommas(x) {
  console.log('numberWithCommas : ',x);
  return Number(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
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
  var osp = $.urlParam("osp");
  if(osp){
    $('#selectOSP > option[value='+osp+']').attr("selected",true);
  }
  var chk = $.urlParam("chk");
  if(chk){
    $('#selectState > option[value='+chk+']').attr("selected",true);
  }
  var tstate = $.urlParam("tstate");
  if(tstate){
    $('#selectOState > option[value='+tstate+']').attr("selected",true);
  }
  var type = $.urlParam("ptype");
  if (type) {
    $('#selectType > option[value=' + type + ']').attr("selected", true);
  }
  var mchk = $.urlParam("mchk");
  if (mchk) {
    $('#selectMChk > option[value=' + mchk + ']').attr("selected", true);
  }
  var searchType = $.urlParam("searchType");
  if(searchType){
    $('#selectSearchType > option[value='+searchType+']').attr("selected",true);
  }
  var search = $.urlParam("search");
  if(search){
    $('#searchInput').val(search);
  }
  var sDate = $.urlParam("sDate");
  var eDate = $.urlParam("eDate");
  console.log(sDate,eDate);
  $('#reportrange').daterangepicker(optionSet1,cb);
  if((sDate != '' && eDate != '') && (sDate != null && eDate != null)){
    $('#reportrange span').html(moment(new Date(sDate)).format('YYYY.MM.DD') + ' - ' + moment(new Date(eDate)).format('YYYY.MM.DD'));
  } else{
    $('#reportrange span').html(moment().format('YYYY.MM.DD') + ' - ' + moment().format('YYYY.MM.DD'));
  }
}
// 리스트 조건 param 세팅
function settingParams(num) {
  var renewURL = window.location.origin + window.location.pathname;
  var param = {};
  if (Number.isInteger(num)) {
    param.page = num;
    if (typeof history.pushState == 'function') {
      renewURL += '?page=' + param.page;
      history.pushState(null, null, renewURL);
    }
  }
  // MCP
  if ($('#selectMCP option:selected').val() != undefined) {
    var mcpValue = $('#selectMCP option:selected').val();
    if (mcpValue != '') {
      param.mcp = mcpValue;
      if (typeof history.pushState == 'function') {
        renewURL += '&mcp=' + param.mcp;
        history.pushState(null, null, renewURL);
      }
    }
  } else if ($('#user_class').val() == 'm') {
    param.mcp = $('#user_id').val();
    if (typeof history.pushState == 'function') {
      renewURL += '&mcp=' + param.mcp;
      history.pushState(null, null, renewURL);
    }
  }
  // CP
  if ($('#selectCP option:selected').val() != undefined) {
    var cpValue = $('#selectCP option:selected').val();
    if (cpValue != '') {
      param.cp = cpValue;
      if (typeof history.pushState == 'function') {
        renewURL += '&cp=' + param.cp;
        history.pushState(null, null, renewURL);
      }
    }
  } else if ($('#user_class').val() == 'c') {
    param.cp = $('#user_id').val();
    if (typeof history.pushState == 'function') {
      renewURL += '&cp=' + param.cp;
      history.pushState(null, null, renewURL);
    }
  }
  // OSP
  if ($("#selectOSP option:selected").val() != undefined) {
    var ospValue = $('#selectOSP option:selected').val();
    if (ospValue != '') {
      param.osp = ospValue;
      if (typeof history.pushState == 'function') {
        renewURL += '&osp=' + param.osp;
        history.pushState(null, null, renewURL);
      }
    }
  }
  // tstate
  if ($("#selectOState option:selected").val() != undefined) {
    var tstateValue = $('#selectOState option:selected').val();
    if (tstateValue != '2') {
      param.tstate = tstateValue;
      if (typeof history.pushState == 'function') {
        renewURL += '&tstate=' + param.tstate;
        history.pushState(null, null, renewURL);
      }
    }
  }
  // chk
  if ($("#selectState option:selected").val() != undefined) {
    var chkValue = $('#selectState option:selected').val();
    if (chkValue != '') {
      param.chk = chkValue;
      if (typeof history.pushState == 'function') {
        renewURL += '&chk=' + param.chk;
        history.pushState(null, null, renewURL);
      }
    }
  }
  // type
  if ($("#selectType option:selected").val() != undefined) {
    var typeValue = $('#selectType option:selected').val();
    if (typeValue != '') {
      param.ptype = typeValue;
      if (typeof history.pushState == 'function') {
        renewURL += '&ptype=' + param.ptype;
        history.pushState(null, null, renewURL);
      }
    }
  }
  // mchk
  if ($("#selectMChk option:selected").val() != undefined) {
    var mchkValue = $('#selectMChk option:selected').val();
    if (mchkValue != '') {
      param.mchk = mchkValue;
      if (typeof history.pushState == 'function') {
        renewURL += '&mchk=' + param.mchk;
        history.pushState(null, null, renewURL);
      }
    }
  }
  //검색
  var searchValue = $('#searchInput').val();
  if (searchValue != '') {
    param.searchType = $('#selectSearchType option:selected').val();
    param.search = searchValue;
    if (typeof history.pushState == 'function' && Number.isInteger(num)) {
      renewURL += '&search=' + encodeURI(param.search);
      renewURL += '&searchType=' + param.searchType;
      history.pushState(null, null, renewURL);
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
// 검색 이벤트
function searchFun(){
  var param = settingParams(1);
  ajaxGetPageList(param);
}
//날짜 설정
var cb = function(start, end, label) {
  console.log('FUNC: cb',start.toISOString(), end.toISOString(), label);
  $('#reportrange span').html(moment(new Date(start.toISOString())).format('YYYY.MM.DD') + ' - ' + moment(new Date(end.toISOString())).format('YYYY.MM.DD'));
  searchFun();
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
  startDate: (sDateParams != '' && sDateParams != null) ? moment(new Date(sDateParams)) : moment(),
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
function errorMSG(param){
  var returnValue = ['실패',''];
  if(param == '100'){
    returnValue[1] = 'POST validation 실패';
  }
  else if(param == '101'){
    returnValue[1] = '회원정보가 일치하지 않음';
  }
  else if(param == '102'){
    returnValue[1] = 'subject, message 정보가 없습니다.';
  }
  else if(param == '103'){
    returnValue[1] = 'sender 이메일이 유효하지 않습니다.';
  }
  else if(param == '104'){
    returnValue[1] = 'recipient 이메일이 유효하지 않습니다.';
  }
  else if(param == '105'){
    returnValue[1] = '본문에 포함하면 안되는 확장자가 있습니다.';
  }
  else if(param == '106'){
    returnValue[1] = 'body validation 실패';
  }
  else if(param == '107'){
    returnValue[1] = '받는 사람이 없습니다.';
  }
  else if(param == '108'){
    returnValue[1] = ' 예약정보가 유효하지 않습니다.';
  }
  else if(param == '109'){
    returnValue[1] = 'return_url이 유효하지 않습니다.';
  }
  else if(param == '110'){
    returnValue[1] = '첨부파일이 없습니다.';
  }
  else if(param == '111'){
    returnValue[1] = '첨부파일의 개수가 5개를 초과합니다.';
  }
  else if(param == '112'){
    returnValue[1] = '첨부파일의 Size가 10MB를 초과합니다.';
  }
  else if(param == '113'){
    returnValue[1] = '첨부파일이 다운로드 되지 않았습니다.';
  }
  else if(param == '200'){
    returnValue[1] = '동일 예약시간으로는 200건 이상 발송할 수 없습니다.';
  }
  else if(param == '201'){
    returnValue[1] = '분당 300건 이상 발송할 수 없습니다.';
  }
  else if(param == '205'){
    returnValue[1] = '잔액부족';
  }
  else if(param == '999'){
    returnValue[1] = 'Internal Error.';
  }
  else if(param == '-1'){
    returnValue[0] = '오류'
  }
  else if(param == '0'){
    returnValue[0] = '정상발송'
  }
  else{
    returnValue[0] = '발송안됨'
  }
  return returnValue;
}
