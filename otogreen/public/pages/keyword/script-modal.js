// 수정 시리즈 부분
$(document).on('change','#checkbox_s_e',function(){
  if($('#checkbox_s_e').is(':checked')){
    $('#series-info-e').css('display','flex');
  } else{
    $('#series-info-e').hide();
  }
});
// 뒤로가기
$(document).on('click','#kwdInfoPage .btn-after',function(){
  $('#kwdInfoPage').hide();
  $('#kwdPage').show();
});
$(document).on('click','#kwdInfoDetailPage .btn-after',function(){
  $('#kwdInfoDetailPage').hide();
  $('#kwdInfoPage').show();
});
// 수정 버튼 클릭시
$(document).on('click','#kwdPage .btn-edit',function(event){
  $('#kwdInfoPage tbody').empty();
  $('#kwdInfoPage tfoot').empty();
  $('#kwdInfoPage #searchInput-kwd').val('');
  $('#kwdInfoPage #selectSearchType-kwd option:selected').prop('selected',false)
  $('#cp_id').val($(this).data('cp'));
  $('#mcp_id').val($(this).data('mcp'));
  var param = settingKwdInfoParams(1);
  ajaxGetKwdInfoPageList(param);
  $('#kwdPage').hide();
  $('#kwdInfoPage').show();
});

// 삭제 버튼 클릭시
$(document).on("click",'#kwd-Modal .btn-delete',function(){
  swal({
    title: "삭제 하시겠습니까?",
    text: "해당 데이터의 키워드가 모두 삭제됩니다.",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true,
  })
  .then((value) =>{
    if(value != null){
      var cp = $(this).data("cp");
      var mcp = $(this).data("mcp");
      $.ajax({
        url: '/kwd/delete',
        type: 'post',
        data: {cp:cp,mcp:mcp},
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
// mcp선택시
$(document).on('change','#kwd-Modal #selectMCP',function(){
  $("#kwd-Modal #selectCP").empty();
  $("#kwd-Modal #selectCP").append('<option value="">CP사선택</option>');

  var mcpValue = $("#kwd-Modal #selectMCP option:selected").val();
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
        $("#kwd-Modal #selectCP").append(html);
      });
    }
  });

  param = settingKwdParams(1);
  ajaxGetKwdPageList(param);
});
// cp 선택시
$(document).on('change','#kwd-Modal #selectCP',function(){
  var param = settingKwdParams(1);
  ajaxGetKwdPageList(param);
});
//페이지 이동
$(document).on('click','#listTable-kwd .page-link',function(){
  var param = settingKwdParams(Number($(this).data().value));
  ajaxGetKwdPageList(param);
});
// 리스트 새로고침
function reloadPage2(){
  console.log('reloadPage2');
  var pageValue = ($.urlParam("page") == '' || $.urlParam("page") == null) ? 1 : parseInt($.urlParam("page"));
  var param = settingKwdParams(pageValue);
  ajaxGetKwdPageList(param);
}
// 페이지 ajax
function ajaxGetKwdPageList(param){
  console.log('ajaxGetKwdPageList:',param);
  $('#kwd-Modal .preloader3').show();
  $.ajax({
    url: '/kwd/getNextPage',
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
      $('#listTable-kwd tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        var html = '<tr><th>'+numIdx+'</th>\
          <td>'+item.cnt_mcp+'</td>\
          <td>'+item.cnt_cp+'</td>\
          <td>'+item.CCount+'</td>\
          <td>'+item.TCount+'</td>\
          <td>'+item.DCount+'</td>\
          <td class="text-center">\
            <div class="btn-group btn-group-sm text-center" style="padding-right: 0; display: inline-block;">\
              <button type="button" class="btn-delete btn btn-danger btn-sm waves-effect waves-light alert-confirm1" style="margin-right: 5px;" data-cp="'+item.cnt_cp+'" data-mcp="'+item.cnt_mcp+'">\
                <span class="far fa-trash-alt"></span>\
              </button>\
              <button type="button" class="btn-edit btn btn-primary btn-sm waves-effect waves-light"  data-cp="'+item.cnt_cp+'" data-mcp="'+item.cnt_mcp+'">\
                <span class="far fa-edit"></span>\
              </button>\
            </div>\
          </td>\
        </tr>';
        $('#listTable-kwd tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable-kwd tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr><td colspan="7"><ul class="pagination float-right">';
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
        $('#listTable-kwd tfoot').append(html);
      }
      $('#kwd-Modal .preloader3').fadeOut(500);
    }
  });
}
// 리스트 조건 param 세팅
function settingKwdParams(num){
  var param = {
    page : num
  };
  // MCP
  if($('#kwd-Modal #selectMCP option:selected').val() != undefined){
    var mcpValue = $('#kwd-Modal #selectMCP option:selected').val();
    if(mcpValue != ''){
      param.mcp = mcpValue;
    }
  } else if($('#user_class').val() == 'm'){
    param.mcp = $('#user_id').val();
  } else if($('#user_class').val() == 'c'){
    param.mcp = $('#user_mcp').val();
  }
  // CP
  if($('#kwd-Modal #selectCP option:selected').val() != undefined){
    var cpValue = $('#kwd-Modal #selectCP option:selected').val();
    if(cpValue != ''){
      param.cp = cpValue;
    }
  } else if($('#user_class').val() == 'c'){
    param.cp = $('#user_id').val();
  }
  return param;
}
