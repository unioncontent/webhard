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
$(document).ready(function() {
  // contextMenu
  $.contextMenu({
    selector: '.context-menu-one',
    callback: function(key, options) {
      contextMenu(key, $(this).data());
    },
    items: {
      "cut": {
        name: "해당 이미지 다시 채증"
      },
      "all": {
        name: "전체 이미지 다시 채증"
      }
    }
  });
  // 이미지 확대
  lightbox.option({'resizeDuration': 200, 'wrapAround': true});

  startSetting();

  var z_result = $.urlParam('z-result');
  if (z_result == 'false') {
    swal("ERROR!", "다운로드 할 이미지가 없습니다.", "error");
    settingParams(1);
  } else if (z_result == 'zipError') {
    swal("ERROR!", "다운로드에 실패했습니다.\n사이트 담당자에게 문의바랍니다.", "error");
    settingParams(1);
  }
});
// 게시물정보 닫기
$(document).on('click','#resultDetail .card-header-right',function(){
  console.log("#resultDetail .card-header-right click()")
  if($('#resultDetail .fa-chevron-down').css('display') == "inline-block"){
    console.log("$('#resultDetail .fa-chevron-down').css('display') : ",$('#resultDetail .fa-chevron-down').css('display'));
    $('#resultDetail #cnt-info.table-border-style').fadeOut(50);
    $('#resultDetail .fa-chevron-down').css('display',"none");
    $('#resultDetail .fa-chevron-up').css('display',"inline-block");

    if($('#resultDetail #img-list').css('height') == "0px"){
      console.log('이미지 없고 닫혔을때717px');
      /* 이미지 없고 닫혔을때717px */
      $('#modal-cntList tbody').css('max-height','717px');
    } else{
      console.log('이미지 있고 닫혔을떄541px');
      /* 이미지 있고 닫혔을떄541px */
      $('#modal-cntList tbody').css('max-height','541px');
    }
  } else if($('#resultDetail .fa-chevron-up').css('display') == "inline-block"){
    $('#resultDetail #cnt-info.table-border-style').fadeIn(50);
    $('#resultDetail .fa-chevron-down').css('display',"inline-block");
    $('#resultDetail .fa-chevron-up').css('display',"none");

    if($('#resultDetail #img-list').css('height') == "0px"){
      console.log('이미지 없고 열렸을때318px');
      /* 이미지 없고 열렸을때318px */
      $('#modal-cntList tbody').css('max-height','318px');
    } else{
      console.log('이미지 있고 열렸을때119px');
      /* 이미지 있고 열렸을때119px */
      $('#modal-cntList tbody').css('max-height','119px');
    }
  }
});
// 상태 수정시
$(document).on('change','.table-select',function(){
  var param = {
    ptype: $('#selectType option:selected').val(),
    idx:$(this).data('idx'),
    type:$(this).data('type'),
    chk:($(this).find('option:selected').val() == '')?'null':$(this).find('option:selected').val()
  }
  swal({
    title: param.type+"차 분류를 수정하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true,
  }).then(function(value) {
    if (value != null) {
      console.log(param);
      $.ajax({
        url: '/monitoring_w/updateChk',
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
// context-menu
function contextMenu(type, data) {
  console.log('type : ', type);
  console.log('data : ', data);
  data['type'] = type;
  swal({
    title: (
      (type == "all")
      ? "전체 "
      : "해당") + " 이미지를 삭제하고 다시 채증할까요?",
    icon: "warning",
    buttons: [
      "취소", true
    ],
    dangerMode: true
  }).then(function(value) {
    console.log(value);
    if (value != null) {
      $.ajax({
        url: '/monitoring_w/imageCancel',
        type: 'post',
        data: data,
        datatype: 'json',
        error: function(request, status, error) {
          console.log('code:' + request.status + '\n' + 'message:' + request.responseText + '\n' + 'error:' + error);
          swal("ERROR!", request.responseText, "error");
        },
        success: function(data) {
          console.log(data);
          $('#resultDetail').modal('hide');
          alert('수정되었습니다.');
          reloadPage();
        }
      });
    }
  });
}
// 검토확인-리스트 전체 선택시
$('#checkboxAll-1').on('click',function(){
  var checkBool = null;
  if($(this).is(":checked")){
    checkBool = true;
  }else{
    checkBool = false;
  }
  $('.list-checkbox-1').prop('checked', checkBool);
});
$(document).on('click','.list-checkbox-1',function(){
  $('#checkboxAll-1').prop('checked', false);
});
// 검토확인 클릭시
$(document).on('click','.btn-check',function(){
  if($('input.list-checkbox-1[type=checkbox]:checked').length < 1){
    swal("ERROR!", '좌측 체크박스를 선택해주세요.', "error");
    return false;
  }
  swal({
    title: "검토 확인처리 하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true,
  }).then(function(value) {
    if (value != null) {
      var list = [];
      var pType = $('#selectType option:selected').val();
      $('input.list-checkbox-1[type=checkbox]:checked').each(function(idx,ele){
          var trEle = $(ele).parents('tr');
          list.push({
            pType:pType,
            idx:trEle.find('#idx').val(),
            url:trEle.find('#url').val()
          });
        });
        mChkList(list);
      }
    });
});
function mChkList(arr){
  $('input.list-checkbox-1[type=checkbox]:checked').prop('checked',false);
  $('#checkboxAll-1').prop('checked',false);
  alert('잠시만 기다려주세요.');
  $.ajax({
    url: '/monitoring_w/all/mchk',
    type: 'post',
    data: {'list' : JSON.stringify(arr)},
    error: function(request, status, error) {
      errorMSG();
    },
    success: function(data) {
      console.log(data);
      if (data) {
        alert('확인 처리되었습니다.');
        reloadPage();
      }
    }
  });
}
// 일괄처리-리스트 전체 선택시
$('#checkboxAll').on('click',function(){
  var checkBool = null;
  if($(this).is(":checked")){
    checkBool = true;
  }else{
    checkBool = false;
  }
  $('.list-checkbox').prop('checked', checkBool);
});
$(document).on('click','.list-checkbox',function(){
  $('#checkboxAll').prop('checked', false);
});
// 일괄처리 클릭시
$(document).on('click','.btn-delete',function(){
  if($('input.list-checkbox[type=checkbox]:checked').length < 1){
    swal("ERROR!", '우측 체크박스를 선택해주세요.', "error");
    return false;
  }
  swal({
    title: "일괄 삭제처리 하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true,
  }).then(function(value) {
    if (value != null) {
      var list = [];
      var pType = $('#selectType option:selected').val();
      $('input.list-checkbox[type=checkbox]:checked').each(function(idx,ele){
          var trEle = $(ele).parents('tr');
          list.push({
            pType:pType,
            idx:trEle.find('#idx').val(),
            url:trEle.find('#url').val()
          });
        });
        deleteList(list);
      }
    });
});
function deleteList(arr){
  $('input.list-checkbox[type=checkbox]:checked').prop('checked',false);
  $('#checkboxAll').prop('checked',false);
  alert('잠시만 기다려주세요.');
  $.ajax({
    url: '/monitoring_w/delete',
    type: 'post',
    data: {'list' : JSON.stringify(arr)},
    error: function(request, status, error) {
      errorMSG();
    },
    success: function(data) {
      console.log(data);
      if (data) {
        alert('삭제 되었습니다.');
        reloadPage();
      }
    }
  });
}
// 제목 클릭시
$(document).on('click', '.info-open', function() {
  // if ($(this).prev().length == 0) {
  //   alert('이미지가 없습니다.');
  //   return false;
  // }
  var pType = $('#selectType option:selected').val();
  var idx = $(this).data('idx');
  var cidx = $(this).data('cidx');
  // detail 초기화
  reloadKeyList(cidx);
  $("#cntIdx_m").val(cidx);
  $('#resultDetail p').text('');
  $('#resultDetail p').children().remove();
  $('#img-list').empty();
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
          resultInputEle[key].append(tag + '<a href="' + data['cnt_url'] + '" target="_blank">' + data[key] + '</a>');
        }
        else if (key == 'cnt_num') {
          resultInputEle[key].append('<a href="' + data['cnt_url'] + '" target="_blank">' + data[key] + '</a>');
        }
        else {
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
      $('#defaultDetail').hide();
      $('#resultDetail').show();

      if($('#resultDetail .fa-chevron-up').css('display') == "inline-block"){
          $('#resultDetail .card-header-right').click();
      } else {
        console.log($('#resultDetail #img-list').css('height'));
        if($('#resultDetail #img-list').css('height') == "0px"){
          console.log('이미지 없고 열렸을때318px');
          /* 이미지 없고 열렸을때318px */
          $('#modal-cntList tbody').css('max-height','318px');
        } else{
          console.log('이미지 있고 열렸을때119px');
          /* 이미지 있고 열렸을때119px */
          $('#modal-cntList tbody').css('max-height','119px');
        }
      }
    }
  });
});
// 좌측 아래부분 삭제 버튼 클릭시
$(document).on("click",".remove-keyword",function(){
  var idx = $(this).data('kidx');
  $.ajax({
    url: '/kwd/info/delete',
    type: 'post',
    data: {idx: idx,type: 'k_idx'},
    error:function(request,status,error){
      errorMSG();
    },
    success:function(data){
      reloadKeyList($("#cntIdx_m").val());
    }
  });
});
// 좌측 아래부분 키워드 추가
$("#insertKeywordBtn").on("click",function(){
  alert("잠시만 기다려주세요.");
  var param = {
    'keyword': [$('#pSearch').val(),$('#dSearch').val()],
    'idx': $("#cntIdx_m").val()
  };
  if($("input[name ='oK_state']").val() == '' && $("input[name ='oK_method']").val() == '' && $("input[name ='oK_apply']").val() == ''){
    param.k_key = '1';
    param.k_state = '0';
    param.k_apply = 'L';
    param.k_method = '0';
    param.k_mailing = '0';
  }
  $.ajax({
    url: '/kwd/info/insert',
    type: 'post',
    data: param,
    error:function(request,status,error){
      errorMSG();
    },
    success:function(data){
      if(data){
        console.log(data);
        alert("추가되었습니다.");
        $('#pSearch').val("");
        $('#dSearch').val("");
        if($("input[name ='oK_state']").val() == '' && $("input[name ='oK_method']").val() == '' && $("input[name ='oK_apply']").val() == ''){
          $("input[name ='oK_state']").val(param.k_state);
          $("input[name ='oK_method']").val(param.k_method);
          $("input[name ='oK_apply']").val(param.k_apply);
        }
        reloadKeyList(param.idx);
      }
    }
  });
});
// 좌측 아래부분 키워드 리스트 재로드
function reloadKeyList(cntIdx){
  $("#cntIdx_m").val(cntIdx);
  $.ajax({
    url: '/kwd/info/getKwd',
    type: 'post',
    data : {idx: cntIdx},
    error:function(request,status,error){
      errorMSG();
    },
    success:function(data){
      console.log('reloadKeyList:',data);
      $("#modal-cntList tbody tr").not("#inputKey").remove()
      data.result.forEach(function(item, idx){
        if(idx == 0){
          $("input[name ='oK_state']").val(item.k_state);
          $("input[name ='oK_method']").val(item.k_method);
          $("input[name ='oK_apply']").val(item.k_apply);
        }
        var html = '<tr><th scope="row" class="centerTh">'+(idx+1)+'</th>';
        if(item.k_key != '0'){
          html += '<td><div class="keyword_nobr">'+item.k_title+'</div></td><td></td>';
        }
        else{
          html += '<td></td><td><div class="keyword_nobr">'+item.k_title+'</div></td>';
        }
        html += '<td><button class="remove-keyword btn btn-danger btn-sm" data-kidx="'+item.n_idx+'"><i class="fas fa-minus" style="margin-right:0"></i></button></td></tr>';
        $("#inputKey").after(html);
      });
    }
  });
}
$(document).on('change','#selectOState',function(){
  $('#selectOSP option').remove();
  $('#selectOSP').append('<option value="">OSP사선택</option>');
  searchFun();
});
// cp,cnt,State선택시
$(document).on('change', '#selectCP,#selectState,#selectType,#selectOSP', searchFun);
// mcp선택시
$(document).on('change', '#selectMCP', function() {
  $("#selectCP").empty();
  $("#selectCP").append('<option value="">CP사선택</option>');

  var mcpValue = $("#selectMCP option:selected").val();
  var param = {};
  if (mcpValue != '') {
    param.mcp = mcpValue;
  }
  $.ajax({
    url: '/kwd/getCP',
    type: 'post',
    data: param,
    datatype: 'json',
    error: function(request, status, error) {
      console.log('code:' + request.status + '\n' + 'message:' + request.responseText + '\n' + 'error:' + error);
      alert('cp리스트 불러올 수 없습니다. 다시 시도해주세요.');
    },
    success: function(data) {
      if (data.status != true) {
        alert('cp리스트 불러올 수 없습니다. 다시 시도해주세요.');
        return false;
      }
      data.result.forEach(function(item, idx) {
        var html = '<option value="' + item.cp_id + '">' + item.cp_cname + '</option>';
        $("#selectCP").append(html);
      });
    }
  });

  param = settingParams(1);
  ajaxGetPageList(param);
});
// 검색
$('#searchInput').on('keyup', function(event) {
  if (event.keyCode == 13) {
    $('#searchBtn').trigger('click');
  };
});
$('#searchBtn').on('click', searchFun);
//페이지 이동
$(document).on('click', '#listTable .page-link', function() {
  var param = settingParams(Number($(this).data().value));
  ajaxGetPageList(param);
});
// 리스트 새로고침
function reloadPage() {
  console.log('reloadPage');
  var pageValue = ($.urlParam("page") == '' || $.urlParam("page") == null)
    ? 1
    : parseInt($.urlParam("page"));
  var param = settingParams(pageValue);
  ajaxGetPageList(param);
}
// 페이지 ajax
function ajaxGetPageList(param) {
  console.log('ajaxGetPageList:', param);
  $('.preloader3').show();
  $.ajax({
    url: '/monitoring_w/getNextPage',
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
      data.result.ospList.forEach(function(item, idx) {
        $('#selectOSP').append('<option value="'+item.osp_id+'" '+((data.result.osp == item.osp_id)?'selected':'')+'>'+item.osp_sname+'</option>');
      });
      $('#listTable tbody').empty();
      data.result.list.forEach(function(item, idx) {
        // <td>' + item.cnt_mcp + "/<br>" + item.cnt_cp + '</td>\
        var numIdx = Math.ceil(data.result.listCount - (data.result.offset + idx)).toString();
        var html = '<tr><td>\
          <div class="border-checkbox-section">\
            <div class="border-checkbox-group border-checkbox-group-default" style="max-height: 25px;">\
              <input type="hidden" id="idx" value="'+item.n_idx+'">\
              <input type="hidden" id="url" value="'+item.cnt_url+'">\
              <input class="border-checkbox list-checkbox-1" type="checkbox" id="checkbox'+idx+'-1">\
              <label class="border-checkbox-label" for="checkbox'+idx+'-1"></label>\
            </div>\
          </div>\
        </td>\
        <td>' + numIdx + '</td>\
        <td>' + item.osp_sname + '</td>\
        <td><div class="reduction">' + item.ctitle + '</div></td>\
        <td class="info-td">';
        if (item['cnt_img_1'] != '' && item['cnt_img_1'] != null && item['cnt_chk_1'] == '0' && item['cnt_img_1'] != '/untitled.jpg') {
          html += '<i class="fas fa-image text-muted"></i>';
        }
        html += '<div class="info-open" data-cidx="' + item.cidx + '" data-idx="' + item.n_idx + '">' + item.cnt_title + '</div></td>\
        <td>' + ((item.cnt_price == null)? '': item.cnt_price) + '</td>\
        <td><div class="writer">' + ((item.cnt_writer == null)? '': item.cnt_writer) + '</div></td>';
        html += '<td><div class="dateArr">';
        for (var j = 1; j < 4; j++) {
          if (item['cnt_img_' + j] != '' && item['cnt_img_' + j] != null && item['cnt_img_' + j] != undefined) {
            if (item['cnt_img_' + j] != '/untitled.jpg' && item['cnt_chk_' + j] != '2') {
              html += j + ' 차 : ' + item['cnt_date_' + j];
            } else {
              html += '게시물 삭제됨';
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
        html += '</div></td>\
        <td>\
          <div class="ss-group">\
            <span>1차 :</span>\
            <select name="select" data-type="1" data-origin="'+item['cnt_chk_1']+'" data-idx="' + item.n_idx + '" class="col-xs-1 form-control table-select">\
              <option value="" '+((item['cnt_chk_1'] == null)?'selected':'')+'>-</option>\
              <option value="1" '+((item['cnt_chk_1'] == '1')?'selected':'')+'>제휴</option>\
              <option value="0" '+((item['cnt_chk_1'] == '0')?'selected':'')+'>비제휴</option>\
              <option value="2" '+((item['cnt_chk_1'] == '2')?'selected':'')+'>삭제</option>\
            </select>\
          </div>\
          <div class="ss-group">\
            <span>2차 :</span>\
            <select name="select" data-type="2" data-origin="'+item['cnt_chk_2']+'" data-idx="' + item.n_idx + '" class="col-xs-1 form-control table-select">\
              <option value="" '+((item['cnt_chk_2'] == null)?'selected':'')+'>-</option>\
              <option value="1" '+((item['cnt_chk_2'] == '1')?'selected':'')+'>제휴</option>\
              <option value="0" '+((item['cnt_chk_2'] == '0')?'selected':'')+'>비제휴</option>\
              <option value="2" '+((item['cnt_chk_2'] == '2')?'selected':'')+'>삭제</option>\
            </select>\
          </div>\
          <div class="ss-group">\
            <span>3차 :</span>\
            <select name="select" data-type="3" data-origin="'+item['cnt_chk_3']+'" data-idx="' + item.n_idx + '" class="col-xs-1 form-control table-select">\
              <option value="" '+((item['cnt_chk_3'] == null)?'selected':'')+'>-</option>\
              <option value="1" '+((item['cnt_chk_3'] == '1')?'selected':'')+'>제휴</option>\
              <option value="0" '+((item['cnt_chk_3'] == '0')?'selected':'')+'>비제휴</option>\
              <option value="2" '+((item['cnt_chk_3'] == '2')?'selected':'')+'>삭제</option>\
            </select>\
          </div>\
        </td>\
        <td>\
          <div class="border-checkbox-section">\
            <div class="border-checkbox-group border-checkbox-group-default" style="max-height: 25px;">\
              <input type="hidden" id="idx" value="'+item.n_idx+'">\
              <input type="hidden" id="url" value="'+item.cnt_url+'">\
              <input class="border-checkbox list-checkbox" type="checkbox" id="checkbox'+idx+'">\
              <label class="border-checkbox-label" for="checkbox'+idx+'"></label>\
            </div>\
          </div>\
        </td>\
      </tr>';
        $('#listTable tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount / limit);
      $('#listTable tfoot .pagination').empty();
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
        $('#listTable tfoot .pagination').append(html);
      }
      $('.preloader3').fadeOut(500);
    }
  });
}
// 리스트 조건 세팅
function startSetting() {
  var mcp = $.urlParam("mcp");
  if (mcp) {
    $('#selectMCP > option[value=' + mcp + ']').attr("selected", true);
  }
  var cp = $.urlParam("cp");
  if (cp) {
    $('#selectCP > option[value=' + cp + ']').attr("selected", true);
  }
  var osp = $.urlParam("osp");
  if (osp) {
    $('#selectOSP > option[value=' + osp + ']').attr("selected", true);
  }
  var chk = $.urlParam("chk");
  if (chk) {
    $('#selectState > option[value=' + chk + ']').attr("selected", true);
  }
  var tstate = $.urlParam("tstate");
  if (tstate) {
    $('#selectOState > option[value=' + tstate + ']').attr("selected", true);
  }
  var type = $.urlParam("ptype");
  if (type) {
    $('#selectType > option[value=' + type + ']').attr("selected", true);
  }
  var searchType = $.urlParam("searchType");
  if (searchType) {
    $('#selectSearchType > option[value=' + searchType + ']').attr("selected", true);
  }
  var search = $.urlParam("search");
  if (search) {
    $('#searchInput').val(search);
  }
  var sDate = $.urlParam("sDate");
  var eDate = $.urlParam("eDate");
  console.log(sDate,eDate);
  $('#reportrange').daterangepicker(optionSet1,cb);
  if((sDate != '' && eDate != '') && (sDate != null && eDate != null)){
    $('#reportrange span').html(moment(new Date(sDate)).format('YYYY.MM.DD') + ' - ' + moment(new Date(eDate)).format('YYYY.MM.DD'));
  } else{
    $('#reportrange span').html(moment().subtract(1,'d').format('YYYY.MM.DD') + ' - ' + moment().format('YYYY.MM.DD'));
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
function searchFun() {
  var param = settingParams(1);
  ajaxGetPageList(param);
}
//날짜 선택 시
$(document).on('click','.applyBtn,.ranges ul li:not([data-range-key=직접선택])',searchFun);
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
  startDate: (sDateParams != '' && sDateParams != null) ? moment(new Date(sDateParams)) : moment().subtract(1,'d'),
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
