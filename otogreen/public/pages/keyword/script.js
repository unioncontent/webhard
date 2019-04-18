$(document).ready(function(){
  startSetting();
});
// 수정 버튼 클릭시
$(document).on('click','.btn-edit',function(){
  location.href = '/kwd/info?page=1&cp='+$(this).data('cp')+'&mcp='+$(this).data('mcp');
});

// 삭제 버튼 클릭시
$(document).on("click",'.btn-delete',function(){
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
          reloadPage();
        }
      });
    }
  });
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
// cp 선택시
$(document).on('change','#selectCP',function(){
  var param = settingParams(1);
  ajaxGetPageList(param);
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
      $('#listTable tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        var html = '<tr><th>'+numIdx+'</th>\
          <td>'+item.cnt_mcp+'</td>\
          <td>'+item.cnt_cp+'</td>\
          <td>'+item.CCount+'</td>\
          <td>'+item.TCount+'</td>\
          <td>'+item.DCount+'</td>\
          <td class="text-center">\
            <div class="btn-group btn-group-md text-center" style="padding-right: 0; display: inline-block;">\
              <button type="button" class="btn-delete btn btn-danger waves-effect waves-light alert-confirm1" style="margin-right: 5px;" data-cp="'+item.cnt_cp+'" data-mcp="'+item.cnt_mcp+'">\
                <span class="far fa-trash-alt"></span>\
              </button>\
              <button type="button" class="btn-edit btn btn-primary waves-effect waves-light"  data-cp="'+item.cnt_cp+'" data-mcp="'+item.cnt_mcp+'">\
                <span class="far fa-edit"></span>\
              </button>\
            </div>\
          </td>\
        </tr>';
        $('#listTable tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr class="footable-paging"><td colspan="7"><ul class="pagination">';
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
  return param;
}
