$(document).ready(function(){
  startSetting();
});
$(document).on('change','#selectCP,#selectMail,#selectOSP',function(){
  var param = settingParams(1);
  param.type = $(this).attr('id');
  ajaxGetPageList(param);
});
//메일발송상태 업데이트
$(document).on('click','.btn-update',function(event){
  var trEle = $(this).closest("tr");
  var tdEle = trEle.find('td');
  var idx = $(this).data('idx');
  $.ajax({
    url: '/setting/mailing/update',
    type: 'post',
    data: {
      'm_mail': tdEle.find('#selectMailing').find('option:selected').val(),
      'idx': idx
    },
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      errorMSG();
    },
    success:function(data){
      if(!data){
        errorMSG();
      } else{
        alert('수정되었습니다.');
      }
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
    url: '/setting/mailing/getNextPage',
    type: 'post',
    data: param,
    error: function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
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
        var numIdx = Math.ceil(data.result.listCount-idx-(data.result.page-1)).toString();
        var html = '<tr><th>'+numIdx+'</th>\
          <td>'+item.osp_sname+'</td>\
          <td>'+item.cp_cname+'</td>\
          <td>\
            <select name="select" class="form-control" id="selectMailing" style="min-width: 98px;">\
              <option value="1" '+((item.m_mail == '1') ? 'selected':'')+'>발송</option>\
              <option value="0" '+((item.m_mail == '0') ? 'selected':'')+'>미발송</option>\
            </select>\
          </td><td class="text-center"><button type="button" data-idx = "'+item.n_idx+'" class="btn-update tabledit-edit-button btn btn-primary waves-effect waves-light text-center"><span class="far fa-edit"></span></button></td></tr>';
        $('#listTable tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr><td colspan="5"><ul class="pagination float-right">';
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
  var cp = $.urlParam("cp");
  if(cp){
    $('#selectCP > option[value='+cp+']').attr("selected",true);
  }
  var osp = $.urlParam("osp");
  if(osp){
    $('#selectOSP > option[value='+osp+']').attr("selected",true);
  }
  var state = $.urlParam("state");
  if(state){
    $('#selectMail > option[value='+state+']').attr("selected",true);
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
  // state
  var stateValue = $('#selectMail option:selected').val();
  if(stateValue != ''){
    param.state = stateValue;
    if(typeof history.pushState == 'function'){
      renewURL += '&state='+param.state;
      history.pushState(null, null,renewURL);
    }
  }
  // osp_pw
  var ospValue = $('#selectOSP option:selected').val();
  if(ospValue != ''){
    param.osp = ospValue;
    if(typeof history.pushState == 'function'){
      renewURL += '&osp='+param.osp;
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
