$(document).ready(function(){
  startSetting();
  var cp = null;
});
// 신규등록 시리즈 부분
$(document).on('change','#checkbox_s',function(){
  if($('#checkbox_s').is(':checked')){
    $('#series-info').css('display','flex');
  } else{
    $('#series-info').hide();
  }
});
// 신규등록 클릭
$(document).on('click','.btn-add',function(){
  $('#add-Modal input').val();
  $('#add-Modal').modal('show');
});
// 키워드 설정
$(document).on('click','.btn-keywords',function(){
  var param = settingKwdParams(1);
  ajaxGetKwdPageList(param);
  $('#kwdPage').show();
  $('#kwdInfoPage').hide();
  $('#kwdInfoDetailPage').hide();
  $('#kwd-Modal').modal('show');
});
// 제목 클릭시
$(document).on('click','.cnt',function(){
  // 콘텐츠 수정 모달 초기화
  $('#cnt-Modal input[type="text"]').val('');
  var idx = $(this).data('idx');
  $.ajax({
    url: '/cnts/info',
    type: 'post',
    data: {
      'n_idx': idx
    },
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      errorMSG();
    },
    success:function(data){
      console.log(data);
      $('.btn-update-m').data('idx',data.result.n_idx);
      $('.btn-delete-m').data('idx',data.result.n_idx);
      // 저작권사(CP)
      data.result.cpList.forEach(function(ele) {
        var html = '<option value="'+ele.cp_id+'"'+(ele.cp_id == data.result.cnt_cp ? 'selected' : '')+'>'+ele.cp_cname+'</option>';
        $('#cnt-Modal #cnt_cp').append(html);
      });
      // 콘텐츠ID(CID)
      $('#cnt-Modal #cnt_id').val(data.result.cnt_id);
      // 제목
      $('#cnt-Modal #cnt_title').val(data.result.cnt_title);
      // 시리즈
      if(data.result.cnt_series_chk == '1'){
        $('#checkbox_s_e').prop('checked',true);
        $('.btn-series').show();
        $('.btn-series').data('cidx',data.result.n_idx);
      } else{
        $('#checkbox_s_e').prop('checked',false);
        $('.btn-series').hide();
      }
      // 영문제목
      $('#cnt-Modal #cnt_eng_title').val(data.result.cnt_eng_title);
      // 감독
      $('#cnt-Modal #cnt_director').val(data.result.cnt_director);
      // 나라
      var nat = data.result.cnt_nat;
      if(nat == null || nat == '') {
        $('#cnt-Modal #cnt_nat').append('<option value="-1">없음</option>');
      }
      data.result.country.forEach(function(c) {
        var str = c.replace('\r','');
        if(str == '' || str==' '){
          return false;
        }
        var html = '<option value="'+str+'" '+((str == nat )?'selected':'')+'>'+str+'</option>';
        $('#cnt-Modal #cnt_nat').append(html);
      });
      // 카테고리
      // $('#cnt_cate').val(data.result.cnt_cate);
      $.each($('#cnt-Modal #cnt_cate option'),function(idx,ele) {
        if(ele.value == data.result.cnt_cate){
          $(ele).prop('selected',true);
        }
      });
      // CPID
      $('#cnt-Modal #cnt_cpid').val(data.result.cnt_cpid);
      // 저작권만료기간
      $('#cnt-Modal #cnt_period').data('daterangepicker').setStartDate(data.result.cnt_period);
      $('#cnt-Modal #cnt_period').data('daterangepicker').setEndDate(data.result.cnt_period);
      // 금액
      $('#cnt-Modal #cnt_price').val(data.result.cnt_price.replace(/[,]/gi,'') || 0);
      // 관리상태
      $('#cnt-Modal input:radio[name=k_state][value='+data.result.k_state+']').prop('checked', true);
      console.log(data.result.k_state);
      // 관리현황
      $('#cnt-Modal input:radio[name=k_method][value='+data.result.k_method+']').attr('checked', 'checked');
      // 관리방법
      $('#cnt-Modal input:radio[name=k_apply][value='+data.result.k_apply+']').attr('checked', 'checked');
      // HASH값
      $('#cnt-Modal #cnt_hash').val(data.result.cnt_hash);
      // 뮤레카 HASH값
      $('#cnt-Modal #cnt_mureka').val(data.result.cnt_mureka);
      // 아컴스튜디오 HASH값
      $('#cnt-Modal #cnt_acom').val(data.result.cnt_acom);
      // 메일발송
      $('#cnt-Modal input:radio[name=k_mailing][value='+data.result.k_mailing+']').attr('checked', 'checked');
      $('#cntPage').show();
      $('#cntSeriesDetailPage').hide();
      $('#cnt-Modal').modal('show');
    }
  });
});
//모달에서 콘텐츠 업데이트시
$(document).on('click','.btn-update-m',function(event){
  var idx = $(this).data('idx');
  swal({
    title: "콘텐츠 정보를 수정하시겠습니까?",
    text: "작성된 정보로 콘텐츠 정보가 수정됩니다.",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then((value) =>{
    if(value != null){
      var param = {
        'cnt_id' : $('#cnt-Modal #cnt_id').val(),
        'cnt_cp' : $('#cnt-Modal #cnt_cp option:selected').val(),
        'cnt_title' : $('#cnt-Modal #cnt_title').val(),
        'cnt_series_chk' : ($('#cnt-Modal #checkbox_s_e').is(':checked') == false ? '0':'1'),
        'cnt_eng_title' : $('#cnt-Modal #cnt_eng_title').val(),
        'cnt_director' : $('#cnt-Modal #cnt_director').val(),
        'cnt_nat' : $('#cnt-Modal #cnt_nat option:selected').val(),
        'cnt_cate' : $('#cnt-Modal #cnt_cate').val(),
        'cnt_cpid' : $('#cnt-Modal #cnt_cpid').val(),
        'cnt_period' : $('#cnt-Modal #cnt_period').val(),
        'cnt_price' : ($('#cnt-Modal #cnt_price').val() == '')?'0':$('#cnt-Modal #cnt_price').val(),
        'cnt_hash' : $('#cnt-Modal #cnt_hash').val(),
        'cnt_mureka' : $('#cnt-Modal #cnt_mureka').val(),
        'cnt_acom' : $('#cnt-Modal #cnt_acom').val(),
        'n_idx': idx
      };
      if($('#user_class').val() == 'c'){
        param.cnt_cp = $('#user_id').val();
      }
      if(param.cnt_title == ''){
        alert('제목을 작성해주세요.');
        return false;
      }
      if(param.cnt_period == ''){
        alert('저작권만료기간을 설정해주세요.');
        return false;
      }
      $.ajax({
        url: '/cnts/updateCnt',
        type: 'post',
        data: param,
        error:function(request,status,error){
          console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
          errorMSG();
        },
        success:function(data){
          if(!data){
            errorMSG();
          } else{
            $('#cnt-Modal').modal('hide');
            param = {
              'k_state': $('#cnt-Modal input:radio[name=k_state]:checked').val(),
              'k_method': $('#cnt-Modal input:radio[name=k_method]:checked').val(),
              'k_apply': $('#cnt-Modal input:radio[name=k_apply]:checked').val(),
              'k_mailing': $('#cnt-Modal input:radio[name=k_mailing]:checked').val(),
              'n_idx': idx
            };
            updateCnt(param);
          }
        }
      });
    }
  });
});
// 저작권만료기간
$('#cnt_period').daterangepicker({
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
//모달에서 콘텐츠 삭제시
$(document).on('click','.btn-delete-m',function(){
  var idx = $(this).data('idx');
  swal({
    title: "콘텐츠 삭제 하시겠습니까?",
    text: "해당 콘텐츠가 삭제됩니다.",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then((value) =>{
    if(value != null){
      $('#cnt-Modal').modal('hide');
      deleteCnt(idx);
    }
  });
});
// MCP,CP선택시
$(document).on('change','#contents-setting #selectMCP,#contents-setting #selectCP',function(){
  if($(this).attr('id') == 'selectMCP'){
    $('#contents-setting #selectCP').empty();
    $('#contents-setting #selectCP').append('<option value=\'\'>CP사선택</option>');
  }
  var param = settingParams(1);
  param.type = $(this).attr('id');
  ajaxGetPageList(param);
});
// 검색
$('#contents-setting #searchInput').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#contents-setting #searchBtn').trigger('click');
  };
});
$('#contents-setting #searchBtn').on('click',function(){
  var param = settingParams(1);
  ajaxGetPageList(param);
});
// 콘텐츠 관리 fun
function updateCnt(param){
  $.ajax({
    url: '/cnts/update',
    type: 'post',
    data: param,
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      errorMSG();
    },
    success:function(data){
      if(!data){
        errorMSG();
      } else{
        alert('수정완료되었습니다.');
        reloadPage1();
      }
    }
  });
}
function deleteCnt(idx){
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
        reloadPage1();
      }
      else{
        errorMSG();
      }
    }
  });
}
//페이지 이동
$(document).on('click','#listTable .page-link',function(){
  var param = settingParams(Number($(this).data().value));
  ajaxGetPageList(param);
});
// 리스트 새로고침
function reloadPage1(){
  console.log('reloadPage1');
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
        data.result.cpList.forEach(function(ele) {
          var html = '<option value="'+ele.cp_id+'">'+ele.cp_cname+'</option>';
          $('#contents-setting #selectCP').append(html);
        });
      }
      $('#card-table .span-total').text(0);
      var j = 0;
      $.each(data.result.statistics,function(v,i){
        $('#card-table .span-total').eq(j).text(data.result.statistics[v]);
        j+=1;
      });

      $('#listTable tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        var html = '<tr><th>'+numIdx+'</th>\
          <td><div class="cntid">'+item.cnt_id+'</div></td>\
          <td>'+item.mcp+'</td>\
          <td><div class="title_nobr cnt" data-idx = "'+item.n_idx+'">'+item.cnt_title+'</div></td>\
          <td>'+((item.k_state == null) ? '없음' : (item.k_state == '1') ? '<span class="text-green">● 관리중</span>' : '<span class="text-orange">관리중지</span>')+'</td>\
          <td>'+((item.k_state == null) ? '없음' : (item.k_method == '1') ? '<span class="text-green">● 자동</span>' : '<span class="text-orange">수동</span>')+'</td>\
          <td>'+((item.k_state == null) ? '없음' : '');
       if(item.k_apply == 'D') {
          html +='<span class="text-red">삭제/차단</span>';
        } else if(item.k_apply == 'T') {
          html +='<span class="text-green">● 제휴</span>';
        } else if(item.k_apply == 'C') {
          html +='<span class="text-orange">채증</span>';
        } else if(item.k_apply == 'L') {
          html +='<span class="text-gray">보류</span>';
        }
        html += '</td>';
        html +='<td>'+((item.k_mailing == null || item.k_mailing == '') ? '없음' : (item.k_mailing == '1') ? '<span class="text-green">● 발송</span>' : '<span class="text-orange">발송안함</span>')+'</td>';
        html += '<td>'+item.cnt_regdate+'</td></tr>';
        $('#listTable tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr class="footable-paging"><td colspan="9"><ul class="pagination">';
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
    $('#contents-setting #selectMCP > option[value='+mcp+']').attr("selected",true);
  }
  var cp = $.urlParam("cp");
  if(cp){
    $('#contents-setting #selectCP > option[value='+cp+']').attr("selected",true);
  }
  var searchType = $.urlParam("searchType");
  if(searchType){
    $('#contents-setting #selectSearchType > option[value='+searchType+']').attr("selected",true);
  }
  var search = $.urlParam("search");
  if(search){
    $('#contents-setting #searchInput').val(search);
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
  if($('#contents-setting #selectMCP option:selected').val() != undefined){
    var mcpValue = $('#contents-setting #selectMCP option:selected').val();
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
  } else if($('#user_class').val() == 'c'){
    param.mcp = $('#user_mcp').val();
    if(typeof history.pushState == 'function'){
      renewURL += '&mcp='+param.mcp;
      history.pushState(null, null,renewURL);
    }
  }
  // CP
  if($('#contents-setting #selectCP option:selected').val() != undefined){
    var cpValue = $('#contents-setting #selectCP option:selected').val();
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
  var searchValue = $('#contents-setting #searchInput').val();
  if(searchValue != ''){
    param.searchType = $('#contents-setting #selectSearchType option:selected').val();
    param.search = searchValue;
    if(typeof history.pushState == 'function'){
      renewURL += '&search='+encodeURI(param.search);
      renewURL += '&searchType='+param.searchType;
      history.pushState(null, null,renewURL);
    }
  }
  return param;
}
