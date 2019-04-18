// 수정 버튼 클릭시
$(document).on('click','#kwdInfoPage .btn-edit',function(){
  console.log('콘텐츠 수정');
  var trEle = $(this).parents('tr');
  var tdEle = trEle.find('td');
  var inputArr = trEle.find('input[type="hidden"]');
  var idx = $(this).data('kidx');
  // 내용 초기화
  $("#kwdInfoDetailPage #m_title").text(trEle.find('td').eq(0).text());
  $("#kwdInfoDetailPage #cntIdx_m").val(idx);
  $("#kwdInfoDetailPage input[name='k_state']").removeAttr('checked');
  $("#kwdInfoDetailPage input[name='k_method']").removeAttr('checked');
  $("#kwdInfoDetailPage input[name='k_apply']").removeAttr('checked');
  $("#kwdInfoDetailPage input[name ='oK_state']").val('');
  $("#kwdInfoDetailPage input[name ='oK_method']").val('');
  $("#kwdInfoDetailPage input[name ='oK_apply']").val('');
  if($(tdEle[2]).text() != '0' && $(tdEle[3]).text() != '0'){
    $("#kwdInfoDetailPage input[name='k_state']").filter("[value="+inputArr[0].value+"]").prop("checked",true);
    $("#kwdInfoDetailPage input[name='k_method']").filter("[value="+inputArr[1].value+"]").prop("checked",true);
    $("#kwdInfoDetailPage input[name='k_apply']").filter("[value="+inputArr[2].value+"]").prop("checked",true);
  }
  $('#kwdInfoPage').hide();
  $('#kwdInfoDetailPage').show();
  // ajax 키워드 로드
  reloadKeyList($("#kwdInfoDetailPage #cntIdx_m").val());
});

// 리스트 radio 변경시
$(document).on('change','#kwdInfoPage .listRadio',function(){
  var tdEle = $(this).parents('tr').find('td');
  if($(tdEle[2]).text() == '0' && $(tdEle[3]).text() == '0'){
    alert('키워드를 설정해주세요.');
    $(this)[0].checked = false;
    return false;
  }
  var param = {
    type : $(this).attr("name").replace(/[0-9]/g, ""),
    value : $(this).val(),
    idx : $(this).data('kidx')
  };
  KeywordStatusUpdateAjax(param,$(this));
});

// 삭제 버튼 클릭시
$(document).on("click",'#kwdInfoPage .btn-delete',function(){
  if($(this).data('kidx') == ''){
    alert('키워드가 없습니다.');
    return false;
  }
  var cpId = $(this).data('kidx');
  swal({
    title: "삭제 하시겠습니까?",
    text: "해당 CP사의 키워드가 모두 삭제됩니다.",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true,
  })
  .then((value) =>{
    if(value != null){
      $.ajax({
        url: '/kwd/info/delete',
        type: 'post',
        data: {idx: cpId,type: 'cpId'},
        error:function(request,status,error){
          errorMSG();
        },
        success:function(data){
          alert("삭제되었습니다.");
          reloadPage2();
        }
      });
    }
  });
});

// 모달 삭제 버튼 클릭시
$(document).on("click","#kwdInfoDetailPage .remove-keyword",function(){
  var idx = $(this).data('kidx');
  $.ajax({
    url: '/kwd/info/delete',
    type: 'post',
    data: {idx: idx,type: 'k_idx'},
    error:function(request,status,error){
      errorMSG();
    },
    success:function(data){
      reloadKeyList($("#kwdInfoDetailPage #cntIdx_m").val());
    }
  });
});

// 모달 radio 변경시
$(document).on('change','#kwdInfoDetailPage .k_state, #kwdInfoDetailPage .k_apply, #kwdInfoDetailPage .k_method',function(){
  if($("#kwdInfoDetailPage input[name ='oK_state']").val() == '' && $("#kwdInfoDetailPage input[name ='oK_method']").val() == '' && $("#kwdInfoDetailPage input[name ='oK_apply']").val() == ''){
    alert('먼저 키워드를 설정해주세요.');
    $(this)[0].checked = false;
    return false;
  }
  if($('#kwdInfoDetailPage #modal-cntList > tbody tr').length > 1){
    var param = {
      type : $(this).attr("name"),
      value : $(this).val(),
      idx : $("#cntIdx_m").val()
    };
    KeywordStatusUpdateAjax(param,$(this),"modal");
  }
  else{
    $(this).parents('.form-radio').children().last().val(this.value);
  }
});
function KeywordStatusUpdateAjax(param,target,type){
  $.ajax({
    url: '/kwd/info/update',
    type: 'post',
    data: param,
    error:function(request,status,error){
      errorMSG();
    },
    success:function(data){
      if(!data){
        return false;
      }
      alert('수정되었습니다.');
      if(type == "modal"){
        reloadKeyList(param.idx);
      }
      else{
        console.log(data);
        target.closest("td").find("input[type=hidden]").val(data.value);
      }
      reloadPage1();
    }
  });
}

// 모달 키워드 추가
$("#kwdInfoDetailPage #insertKeywordBtn").on("click",function(){
  var param = {
    'keyword': [$('#kwdInfoDetailPage #pSearch').val(),$('#kwdInfoDetailPage #dSearch').val()],
    'idx': $("#kwdInfoDetailPage #cntIdx_m").val()
  };
  if($("#kwdInfoDetailPage input[name ='oK_state']").val() == '' && $("#kwdInfoDetailPage input[name ='oK_method']").val() == '' && $("#kwdInfoDetailPage input[name ='oK_apply']").val() == ''){
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
        $('#kwdInfoDetailPage #pSearch').val("");
        $('#kwdInfoDetailPage #dSearch').val("");
        if($("#kwdInfoDetailPage input[name ='oK_state']").val() == '' && $("#kwdInfoDetailPage input[name ='oK_method']").val() == '' && $("#kwdInfoDetailPage input[name ='oK_apply']").val() == ''){
          $("#kwdInfoDetailPage input[name ='oK_state']").val(param.k_state);
          $("#kwdInfoDetailPage input[name ='oK_method']").val(param.k_method);
          $("#kwdInfoDetailPage input[name ='oK_apply']").val(param.k_apply);
          $("#kwdInfoDetailPage input:radio[name ='k_state']:input[value='"+param.k_state+"']").prop("checked", true);
          $("#kwdInfoDetailPage input:radio[name ='k_method']:input[value='"+param.k_method+"']").prop("checked", true);
          $("#kwdInfoDetailPage input:radio[name ='k_apply']:input[value='"+param.k_apply+"']").prop("checked", true);
        }
        reloadKeyList(param.idx);
      }
    }
  });
});

// 모달 키워드 리스트 재로드
function reloadKeyList(cntIdx){
  $("#kwdInfoDetailPage #cntIdx_m").val(cntIdx);
  $.ajax({
    url: '/kwd/info/getKwd',
    type: 'post',
    data : {idx: cntIdx},
    error:function(request,status,error){
      errorMSG();
    },
    success:function(data){
      console.log('reloadKeyList:',data);
      $("#kwdInfoDetailPage #modal-cntList tbody tr").not("#inputKey").remove()
      data.result.forEach(function(item, idx){
        if(idx == 0){
          $("#kwdInfoDetailPage input[name ='oK_state']").val(item.k_state);
          $("#kwdInfoDetailPage input[name ='oK_method']").val(item.k_method);
          $("#kwdInfoDetailPage input[name ='oK_apply']").val(item.k_apply);
          $("#kwdInfoDetailPage input:radio[name ='k_state']:input[value='"+item.k_state+"']").prop("checked", true);
          $("#kwdInfoDetailPage input:radio[name ='k_method']:input[value='"+item.k_method+"']").prop("checked", true);
          $("#kwdInfoDetailPage input:radio[name ='k_apply']:input[value='"+item.k_apply+"']").prop("checked", true);
        }
        var html = '<tr><th scope="row" class="centerTh">'+(idx+1)+'</th>';
        if(item.k_key != '0'){
          html += '<td><div class="keyword_nobr">'+item.k_title+'</div></td><td></td>';
        }
        else{
          html += '<td></td><td><div class="keyword_nobr">'+item.k_title+'</div></td>';
        }
        html += '<td><button class="remove-keyword btn btn-danger btn-sm" data-kidx="'+item.n_idx+'"><i class="fas fa-minus" style="margin-right:0"></i></button></td></tr>';
        $("#kwdInfoDetailPage #inputKey").after(html);
      });
    }
  });
}

// 검색
$('#kwdInfoPage #searchInput-kwd').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#kwdInfoPage #searchBtn-kwd').trigger('click');
  };
});
$('#kwdInfoPage #searchBtn-kwd').on('click',function(){
  var param = settingKwdInfoParams(1);
  ajaxGetKwdInfoPageList(param);
});

//페이지 이동
$(document).on('click','#listTable-info .page-link',function(){
  var param = settingKwdInfoParams(Number($(this).data().value));
  ajaxGetKwdInfoPageList(param);
});

// 페이지 ajax
function ajaxGetKwdInfoPageList(param){
  console.log('ajaxGetKwdInfoPageList:',param);
  $('#kwdInfoPage .preloader3').show();
  $.ajax({
    url: '/kwd/info/getNextPage',
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
      $('#listTable-info tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        var html = '<tr><th>'+numIdx+'</th>\
          <td><div class="title_nobr">'+item.cnt_title+'</div></td>\
          <td><div class="cnt_nobr">'+item.cnt_id+'</div></td>\
          <td>'+item.TCount+'</td>\
          <td>'+item.DCount+'</td>\
          <td>\
            <div class="form-radio">\
              <div class="radio radio-inline">\
                <label>\
                  <input type="radio" value="1" name="k_state'+idx+'" data-kidx="'+item.k_L_idx+'" class="listRadio" '+((item.k_state == '1') ? 'checked' : '')+'>\
                  <i class="helper"></i>정상\
                </label>\
              </div>\
              <div class="radio radio-inline">\
                <label>\
                  <input type="radio" value="0" name="k_state'+idx+'" data-kidx="'+item.k_L_idx+'" class="listRadio" '+((item.k_state == '0') ? 'checked' : '')+'>\
                  <i class="helper"></i>중지\
                </label>\
              </div>\
              <input name="oK_state'+idx+'" value="'+item.k_state+'" type="hidden" class="form-control">\
            </div>\
          </td>\
          <td>\
            <div class="form-radio">\
              <div class="radio radio-inline">\
                <label>\
                  <input type="radio" value="1" name="k_method'+idx+'" data-kidx="'+item.k_L_idx+'" class="listRadio" '+((item.k_method == '1') ? 'checked' : '')+'>\
                  <i class="helper"></i>자동\
                </label>\
              </div>\
              <div class="radio radio-inline">\
                <label>\
                  <input type="radio" value="0" name="k_method'+idx+'" data-kidx="'+item.k_L_idx+'" class="listRadio" '+((item.k_method == '0') ? 'checked' : '')+'>\
                  <i class="helper"></i>수동\
                </label>\
              </div>\
              <input name="oK_method'+idx+'" value="'+item.k_method+'" type="hidden" class="form-control">\
            </div>\
          </td>\
          <td>\
            <div class="form-radio">\
              <div class="radio radio-inline">\
                <label>\
                  <input type="radio" value="D" name="k_apply'+idx+'" data-kidx="'+item.k_L_idx+'" class="listRadio" '+((item.k_apply == 'D') ? 'checked' : '')+'>\
                  <i class="helper"></i>삭제/차단\
                </label>\
              </div>\
              <div class="radio radio-inline">\
                <label>\
                  <input type="radio" value="T" name="k_apply'+idx+'" data-kidx="'+item.k_L_idx+'" class="listRadio" '+((item.k_apply == 'T') ? 'checked' : '')+'>\
                  <i class="helper"></i>제휴\
                </label>\
              </div>\
              <div class="radio radio-inline">\
                <label>\
                  <input type="radio" value="C" name="k_apply'+idx+'" data-kidx="'+item.k_L_idx+'" class="listRadio" '+((item.k_apply == 'C') ? 'checked' : '')+'>\
                  <i class="helper"></i>채증\
                </label>\
              </div>\
              <div class="radio radio-inline">\
                <label>\
                  <input type="radio" value="L" name="k_apply'+idx+'" data-kidx="'+item.k_L_idx+'" class="listRadio" '+((item.k_apply == 'L') ? 'checked' : '')+'>\
                  <i class="helper"></i>보류\
                </label>\
              </div>\
              <input name="oK_apply'+idx+'" value="'+item.k_apply+'" type="hidden" class="form-control">\
            </div>\
          </td>\
          <td class="text-center">\
            <div class="btn-group btn-group-sm text-center" style="padding-right: 0; display: inline-block;">\
              <button type="button" class="btn-delete btn btn-sm btn-danger waves-effect waves-light alert-confirm1" style="margin-right: 5px;" data-kidx="'+item.k_L_idx+'">\
                <span class="far fa-trash-alt"></span>\
              </button>\
              <button type="button" class="btn-edit btn btn-sm btn-primary waves-effect waves-light" data-kidx="'+item.cnt_idx+'">\
                <span class="far fa-edit"></span>\
              </button>\
            </div>\
          </td>\
        </tr>';
        $('#listTable-info tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable-info tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr><td colspan="9"><ul class="pagination float-right">';
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
        $('#listTable-info tfoot').append(html);
      }
      $('#kwdInfoPage .preloader3').fadeOut(500);
    }
  });
}

// 리스트 조건 param 세팅
function settingKwdInfoParams(num){
  var param = {
    page : num,
    cp: $('#cp_id').val(),
    mcp: $('#mcp_id').val()
  };
  //검색
  var searchValue = $('#kwdInfoPage #searchInput-kwd').val();
  if(searchValue != ''){
    param.searchType = $('#kwdInfoPage #selectSearchType-kwd option:selected').val();
    param.search = searchValue;
  }
  return param;
}
