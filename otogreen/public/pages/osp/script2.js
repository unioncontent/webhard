$(document).ready(function(){
  startSetting();
});
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
$('.btn-delete').on('click',function(){
  var idx = $(this).data('idx');
  swal({
    title: "삭제하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      $.ajax({
        url: '/setting/osp/delete',
        type: 'post',
        data: {idx:idx},
        error: function(request,status,error){
          errorMSG();
        },
        success: function(data){
          if(data.state){
            alert('삭제 완료했습니다.');
            reloadPage();
            $('#edit-Modal').modal('hide');
          }
          else{
            alert('삭제 실패했습니다.');
          }
        }
      });
    }
  });
});

$('.btn-update').on('click',function(){
  var idx = $(this).data('idx');
  var param = { idx : idx };
  swal({
    title: "수정하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      for (var key in modalInputEle) {
        if(key == 'osp_id' || key == 'osp_regdate'){
          continue;
        }
        if(key == 'osp_state' || key == 'osp_tstate'){
          param[key] = $('#'+key+' input[type=radio]:checked').val();
        }
        else if(key == 'osp_mobile'){
          if($('#osp_mobile input[type=checkbox]:checked').length == '2'){
            param[key] = '2';
          }
          else{
            param[key] = ($('#osp_mobile input[type=checkbox]:checked').val() == undefined) ? '':$('#osp_mobile input[type=checkbox]:checked').val();
          }
        }
        else{
          param[key] = modalInputEle[key].val();
          if(key == 'osp_tel'){
            param[key] = param[key].replace(/[-]/gi,'');
          }
          if(key == 'osp_fax'){
            param[key] = param[key].replace(/[-]/gi,'');
          }
        }
      }
      // 필수
      if(param.osp_sname == ""){
        alert("서비스명을 입력해주세요.");
        return false;
      }
      if(param.osp_open == ""){
        alert("오픈일을 선택해주세요.");
        return false;
      }
      if(param.osp_pw == ""){
        alert("비밀번로를 입력해주세요.");
        return false;
      }
      if(param.osp_cname == ""){
        alert("법인명을 입력해주세요.");
        return false;
      }
      if(param.osp_cnum == ""){
        alert("사업자번호를 입력해주세요.");
        return false;
      }
      if(param.osp_ceoname == ""){
        alert("대표자명 입력해주세요.");
        return false;
      }
      if(param.osp_url == ""){
        alert("URL을 입력해주세요.");
        return false;
      }

      $.ajax({
        url: '/setting/osp/update',
        type: 'post',
        data: param,
        error: function(request,status,error){
          errorMSG();
        },
        success: function(data){
          if(data.state){
            alert('수정 완료했습니다.');
            reloadPage();
            $('#edit-Modal').modal('hide');
          }
          else{
            alert('수정 실패했습니다.');
          }
        }
      });
    }
  });

});
// 날짜 클릭시
$(document).on('click','.edit',function(){
  var idx = $(this).data('idx');
  // modal 초기화
  $('.btn-update').data('idx',idx);
  $('.btn-delete').data('idx',idx);
  $('#edit-Modal input[type=text]').val('');
  $('#edit-Modal input[type=radio]').prop('checked',false);
  $('#edit-Modal input[type=checkbox]').prop('checked',false);

  $.ajax({
    url: '/setting/osp/getInfo',
    type: 'post',
    data: {idx:idx},
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log(data);
      for (var key in modalInputEle) {
        if(key == 'osp_state' || key == 'osp_tstate'){
          $('#'+key+' input[type=radio][value='+data.result[key]+']').prop('checked',true);
        }
        else if(key == 'osp_mobile'){
          if(data.result[key] == '2'){
            $('#'+key+' input[type=checkbox][value=1]').prop('checked',true);
            $('#'+key+' input[type=checkbox][value=0]').prop('checked',true);
          }
          else{
            if(data.result[key] != ''){
              $('#'+key+' input[type=checkbox][value='+data.result[key]+']').prop('checked',true);
            }
          }
        }
        else if(key == 'osp_open'){
          modalInputEle[key].val(data.result['osp_open_str']);
        }
        else if(key == 'osp_regdate'){
          modalInputEle[key].val(data.result['osp_regdate_str']);
        }
        else{
          modalInputEle[key].val(data.result[key]);
        }
        $('#o_'+key).val(data.result[((key == 'osp_open') ? 'osp_open_str' :key)]);
      }
      $('#edit-Modal').modal('show');
    }
  });
});

// 등록버튼 클릭시
$('.btn-add').on('click',function(){
  location.href = '/setting/osp/add';
});

// 제휴/비제휴 선택시
$('#selectTState').on('change',function(){
  var param = settingParams(1);
  ajaxGetPageList(param);
});

// 검색
$('#searchInput').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#searchBtn').trigger('click');
  };
});
$('#searchBtn').on('click',function(){
  var param = settingParams(1);
  ajaxGetPageList(param);
});

// 오픈일
$('#osp_open').daterangepicker({
  singleDatePicker: true,
  showDropdowns: true,
  locale: {
    format: 'YYYY-MM-DD',
    "customRangeLabel": "Custom",
    "daysOfWeek": [
        "일", "월", "화", "수", "목", "금", "토"
    ],
    "monthNames": [
      "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
    ],
  }
});

//페이지 이동
$(document).on('click','#listTable .page-link',function(){
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
    url: '/setting/osp/getNextPage',
    type: 'post',
    data: param,
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log(data);
      if(data.state != true){
        errorMSG();
        return false;
      }
      $('#listTable tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        var html = '<tr><th>'+numIdx+'</th>\
          <td><div class="edit"  data-idx="'+item.n_idx+'">'+item.osp_open+'</div></td>\
          <td><div class="sname" data-idx="'+item.n_idx+'">'+item.osp_sname+'</div></td>\
          <td>'+item.osp_id+'</td>\
          <td>'+((item.osp_tstate == '1') ? '제휴':'비제휴')+'</td>\
          <td>\
            <div class="form-radio">\
              <div class="border-checkbox-section">\
                <div class="border-checkbox-group border-checkbox-group-default">\
                  <input class="border-checkbox mail-checkbox" type="checkbox" id="osp_mobile_0_'+idx+'" value="0" '+((item.osp_mobile == '0' || item.osp_mobile == '2') ? 'checked':'')+' onclick="return false;">\
                  <label class="border-checkbox-label m-b-0" for="osp_mobile_0_'+idx+'">어플</label>\
                </div>\
                <div class="border-checkbox-group border-checkbox-group-default">\
                  <input class="border-checkbox mail-checkbox" type="checkbox" id="osp_mobile_1_'+idx+'" value="1" '+((item.osp_mobile == '1' || item.osp_mobile == '2') ? 'checked':'')+' onclick="return false;">\
                  <label class="border-checkbox-label m-b-0" for="osp_mobile_1_'+idx+'">웹</label>\
                </div>\
              </div>\
            </div>\
          </td>\
          <td>'+((item.osp_state == '1') ? '정상':'중지')+'</td>\
          <td>'+item.osp_regdate+'</td>\
        </tr>';
        $('#listTable tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr class="footable-paging"><td colspan="8"><ul class="pagination">';
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
// 리스트 조건 세팅
function startSetting(){
  var tstate = $.urlParam("tstate");
  if(tstate){
    $('#selectTState > option[value='+tstate+']').attr("selected",true);
  }
  var searchType = $.urlParam("searchType");
  if(searchType){
    $('#selectSearchType > option[value='+searchType+']').attr("selected",true);
  }
  var search = $.urlParam("search");
  if(search){
    $('#searchInput').val(search);
  }
}
// 리스트 조건 param 세팅
function settingParams(num){
  var renewURL = window.location.origin+window.location.pathname;
  var param = {
    page : num
  };
  if(typeof history.pushState == 'function'){
    renewURL += '?page='+param.page;
    history.pushState(null, null,renewURL);
  }
  // 제휴현황
  var tStateValue = $('#selectTState option:selected').val();
  if(tStateValue != ''){
    param.tstate = tStateValue;
    if(typeof history.pushState == 'function'){
      renewURL += '&tstate='+param.tstate;
      history.pushState(null, null,renewURL);
    }
  }
  // 검색
  var searchValue = $('#searchInput').val();
  if(searchValue != ''){
    param.searchType = $('#selectSearchType option:selected').val();
    param.search = searchValue;
    if(typeof history.pushState == 'function'){
      renewURL += '&search='+encodeURI(param.search);
      renewURL += '&searchType='+param.searchType;
      history.pushState(null, null,renewURL);
    }
  }
  return param;
}
