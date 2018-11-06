$(document).ready(function(){
  startSetting();
  var cp = null;
  $('#key-toolbar').toolbar({
    content: '#toolbar-options1',
    position: 'right',
    style: 'primary',
    event: 'hover',
    hideOnClick: true
  });
  if(cp != null && cp != '0'){
    $('#key-toolbar').show();
  }
  else{
    $('#key-toolbar').hide();
  }
});
$(document).on('change','#selectMCP,#selectCP',function(){
  var param = settingParams(1);
  param.type = $(this).attr('id');
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
//콘텐츠 업데이트
$(document).on('click','.btn-update',function(event){
  var trEle = $(this).closest("tr");
  var tdEle = trEle.find('td');
  var idx = $(this).data('idx');
  swal({
    title: "콘텐츠 업데이트 하시겠습니까?",
    text: "\'"+tdEle.eq(3).text()+"\'"+"\n콘텐츠가 업데이트됩니다.",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then((value) =>{
    if(value != null){
      if(tdEle.find('#selectState').find('option:selected').val() == -1){
        swal("수정불가!", "키워드 설정에서 키워드를 등록해주세요.", "error");
      }
      else{
        $.ajax({
          url: '/cnts/update',
          type: 'post',
          data: {
            'k_state': tdEle.find('#selectState').find('option:selected').val(),
            'k_method': tdEle.find('#selectMethod').find('option:selected').val(),
            'K_apply': tdEle.find('#selectApply').find('option:selected').val(),
            'k_mailing': tdEle.find('#selectMail').find('option:selected').val(),
            'n_idx': idx
          },
          error:function(request,status,error){
            console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
            errorMSG();
          },
          success:function(data){
            if(!data){
              errorMSG();
            } else{
              alert('수정완료되었습니다.');
            }
          }
        });
      }
    }
  });
});
//콘텐츠 삭제
$(document).on('click','.btn-delete',function(){
  var trEle = $(this).closest("tr");
  var tdEle = trEle.find('td');
  var idx = $(this).data('idx');
  swal({
    title: "콘텐츠 삭제 하시겠습니까?",
    text: "\'"+tdEle.eq(3).text()+"\'"+"\n콘텐츠가 삭제됩니다.",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then((value) =>{
    if(value != null){
      $.ajax({
        url: '/cnts/delete',
        type: 'post',
        data: {
          'n_idx': idx
        },
        error:function(request,status,error){
          errorMSG();
        },
        success:function(data){
          if(data){
            reloadPage();
          }
          else{
            errorMSG();
          }
        }
      });
    }
  });
});
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
    url: '/cnts/getNextPage',
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
      // cpList
      if('cpList' in data.result){
        $('#selectCP').empty();
        $('#selectCP').append('<option value=\'\'>CP사선택</option>');
        data.result.cpList.forEach(function(ele) {
          var html = '<option value="'+ele.cp_id+'">'+ele.cp_cname+'</option>';
          $('#selectCP').append(html);
        });
      }

      $('#listTable tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-idx-(data.result.page-1)).toString();
        var html = '<tr><th>'+numIdx+'</th>\
          <td>'+item.cnt_id+'</td>\
          <td>'+item.mcp+'</td>\
          <td>'+((item.cp == null) ? '':item.cp)+'</td>\
          <td><div class="title_nobr">'+item.cnt_title+'</div></td>\
          <td><div class="title_nobr">'+((item.cnt_eng_title == null) ? '':item.cnt_eng_title)+'</div></td>\
          <td>'+((item.cnt_director == null) ? '':item.cnt_director)+'</td>\
          <td><select name="select" class="form-control" id="selectNat" style="min-width: 94px;">';
        var nat = item.cnt_nat;
        for(var j=0; j < data.result.country.length; j++) {
          var str = data.result.country[j].replace('\r','');
          if(nat == null || nat == '') {
            html += '<option value="-1">없음</option>';
          } else {
            html += '<option value="'+str+'" '+((str == nat )?'selected':'')+'>'+str+'</option>';
          }
        }
        html += '</select></td><td>\
            <select name="select" class="form-control" id="selectCate" style="min-width: 98px;">\
              <option value="0" '+((null == item.cnt_cate  || '' == item.cnt_cate)?'selected':'')+'>미분류</option>\
              <option value="1" '+(("1" == item.cnt_cate )?'selected':'')+'>영화</option>\
              <option value="2" '+(("2" == item.cnt_cate )?'selected':'')+'>드라마</option>\
              <option value="3" '+(("3" == item.cnt_cate )?'selected':'')+'>방송</option>\
              <option value="4" '+(("4" == item.cnt_cate )?'selected':'')+'>음악</option>\
              <option value="5" '+(("5" == item.cnt_cate )?'selected':'')+'>문서</option>\
              <option value="6" '+(("6" == item.cnt_cate )?'selected':'')+'>이미지</option>\
            </select>\
          </td>\
          <td>'+((item.cnt_cpid == null) ? '':item.cnt_cpid)+'</td>\
          <td>'+item.cnt_period+'</td>';
        html +='<td><select name="select" class="col form-control m-b-0 m-l-0 f-left select-left" id="selectState" style="min-width: 94px;">';
        if(item.k_state == null) {
          html +='<option value="-1">없음</option>';
        } else {
          html +='<option value="1" '+((item.k_state == '1') ? 'selected' : '')+'>관리중</option>';
          html +='<option value="0" '+((item.k_state == '0') ? 'selected' : '')+'>중지</option>';
        }
        html += '</select></td><td><select name="select" class="col form-control m-b-0 m-l-0 f-left select-left" id="selectMethod" style="min-width: 94px;">';
        if(item.k_state == null) {
          html +='<option value="-1">없음</option>';
        } else {
          html +='<option value="1" '+((item.k_method == '1') ? 'selected' : '')+'>자동</option>';
          html +='<option value="0" '+((item.k_method == '0') ? 'selected' : '')+'>수동</option>';
        }
        html += '</select></td><td><select name="select" class="col form-control m-b-0 m-l-0 f-left select-left" id="selectApply" style="min-width: 110px;">';
        if(item.k_state == null) {
          html += '<option value="-1">없음</option>';
        } else {
          html += '<option value="D" '+((item.k_apply == 'D') ? 'selected' : '')+'>삭제/차단</option>\
          <option value="T" '+((item.k_apply == 'T') ? 'selected' : '')+'>제휴</option>\
          <option value="C" '+((item.k_apply == 'C') ? 'selected' : '')+'>채증</option>\
          <option value="L" '+((item.k_apply == 'L') ? 'selected' : '')+'>보류</option>'
        }
        html += '</select></td>';
        html +='<td><select name="select" class="col form-control m-b-0 m-l-0 f-left select-left" id="selectMail"  style="min-width: 106px;">';
        if(item.k_mailing == null || item.k_mailing == '') {
          html += '<option value="-1">없음</option>'
        } else {
          html += '<option value="1" '+((item.k_mailing == '1') ? 'selected' : '')+'>발송</option>\
          <option value="0" '+((item.k_mailing == '0') ? 'selected' : '')+'>발송안함</option>'
        }
        html += '</select></td>\
          <td>'+item.cnt_price+'</td>\
          <td>'+((item.cnt_hash == null) ? '':item.cnt_hash)+'</td>\
          <td>'+((item.cnt_mureka == null) ? '':item.cnt_mureka)+'</td>\
          <td>'+((item.cnt_acom == null) ? '':item.cnt_acom)+'</td>\
          <td class="text-center">\
            <button type="button" data-idx = "'+item.n_idx+'" class="btn-update tabledit-edit-button btn btn-primary waves-effect waves-light text-center" style="inline-block;">\
              <span class="far fa-edit"></span>\
            </button>\
          </td>\
          <td class="text-center">\
            <button type="button" data-idx = "'+item.n_idx+'" class="btn-delete tabledit-delete-button btn btn-danger waves-effect waves-light alert-confirm1 text-center"  style="inline-block;">\
              <span class="far fa-trash-alt"></span>\
            </button>\
          </td>\
        </tr>';
        $('#listTable tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr><td colspan="21"><ul class="pagination float-right">';
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
  var mcp = $.urlParam("mcp");
  if(mcp){
    $('#selectMCP > option[value='+mcp+']').attr("selected",true);
  }
  var cp = $.urlParam("cp");
  if(cp){
    $('#selectCP > option[value='+cp+']').attr("selected",true);
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
  // MCP
  if($('#selectMCP option:selected').val() != undefined){
    var mcpValue = $('#selectMCP option:selected').val();
    if(mcpValue != ''){
      param.mcp = mcpValue;
      if(typeof history.pushState == 'function'){
        renewURL += '&mcp='+param.mcp;
        history.pushState(null, null,renewURL);
      }
    }
  } else if($('#user_class').val() == 'm'){
    param.mcp = $('#user_id').val();
    if(typeof history.pushState == 'function'){
      renewURL += '&mcp='+param.mcp;
      history.pushState(null, null,renewURL);
    }
  }
  // CP
  if($('#selectCP option:selected').val() != undefined){
    var cpValue = $('#selectCP option:selected').val();
    if(cpValue != ''){
      param.cp = cpValue;
      if(typeof history.pushState == 'function'){
        renewURL += '&cp='+param.cp;
        history.pushState(null, null,renewURL);
      }
    }
  } else if($('#user_class').val() == 'c'){
    param.cp = $('#user_id').val();
    if(typeof history.pushState == 'function'){
      renewURL += '&cp='+param.cp;
      history.pushState(null, null,renewURL);
    }
  }
  //검색
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
