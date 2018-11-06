var modalInputEle = {
  cp_id: $('#cp_id'),
  cp_pw: $('#cp_pw'),
  cp_cname: $('#cp_cname'),
  cp_cnum: $('#cp_cnum'),
  cp_ceoname: $('#cp_ceoname'),
  cp_pname: $('#cp_pname'),
  cp_addrs: $('#cp_addrs'),
  cp_tel: $('#cp_tel'),
  cp_hp: $('#cp_hp'),
  cp_email: $('#cp_email'),
  cp_logo:$('#cp_logo'),
  cp_class: $('#cp_class'),
  cp_mcp: $('#cp_mcp'),
  cp_state: $('#cp_state'),
  cp_regdate: $('#cp_regdate')
};
$(document).ready(function(){
  startSetting();
});
// 이미지 변경시
$('#imgChange').on('click', function(){
  $('#uploadEles').show();
  $('#fileInfoEles').hide();
  $('#cancelUpload').show();
});
$('#cancelUpload').on('click', function () {
  $('#uploadEles').hide();
  $('#fileInfoEles').show();
});
$('#imgUpload').on('click', function () {
  var form = $('#fileForm')[0];
  var formData = new FormData(form);

  $.ajax({
      type: 'post',
      url: '/setting/file_upload',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        console.log(data);
        var html = '<span id="file-delete"><i class="fas fa-times"></i>삭제</span>';
        $('.btn-check').append(html);
        $('#file-delete').data('file',data);
        $('#cp_logo').val(data);
      },
      error: function (err) {
          console.log(err);
      }
  });
});

$(document).on('click','#file-delete',function(){
  var filePath = $('#file-delete').data('file');
  swal({
    title: "회사로고를 삭제하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      ajaxFileDel(filePath);
    }
  });
});
function ajaxFileDel(filePath){
  console.log(filePath);
  if(filePath.indexOf('public/') == -1){
    filePath = 'public/'+filePath;
  }
  $.ajax({
    type: 'post',
    url: '/setting/file_delete',
    data: {path:filePath},
    success: function (data) {
      console.log(data);
      $('#file-delete').remove();
      $('#cp_logo').val('');
      $('#cp_logo_file').val('');
    },
    error: function (err) {
        console.log(err);
    }
  });
}

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
        url: '/setting/cp/delete',
        type: 'post',
        data: {
          idx:idx,
          class:$('#o_cp_class').val(),
          id:$('#cp_id').val(),
          mcp:$('#o_cp_mcp').val()
        },
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
        if(key == 'cp_id' || key == 'cp_regdate'){
          continue;
        }
        if(key == 'cp_state' || key == 'cp_class'){
          param[key] = $('#'+key+' input[type=radio]:checked').val();
        }
        else{
          param[key] = modalInputEle[key].val();
          if(key == 'cp_tel' || key == 'cp_hp'){
            param[key] = param[key].replace(/[-]/gi,'');
          }
        }
      }
      // 필수
      if(param.cp_pw == ""){
        alert("비밀번로를 입력해주세요.");
        return false;
      }
      if(param.cp_cname == ""){
        alert("법인명을 입력해주세요.");
        return false;
      }
      if(param.cp_cnum == ""){
        alert("사업자번호를 입력해주세요.");
        return false;
      }
      if(param.cp_class == ""){
        alert("회사분류 선택해주세요.");
        return false;
      }
      if(param.cp_class == "c" && param.cp_mcp == ""){
        alert("MCP를 선택해주세요.");
        return false;
      }

      $.ajax({
        url: '/setting/cp/update',
        type: 'post',
        data: param,
        error: function(request,status,error){
          errorMSG();
        },
        success: function(data){
          if(data.state){
            alert('수정 완료했습니다.');
            if($('#cp_logo').val() != ''){
              ajaxFileDel('public/'+$('#cp_logo_txt').val());
            }
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

$(document).on('click','.edit',function(){
  var idx = $(this).data('idx');
  // modal 초기화
  $('.btn-update').data('idx',idx);
  $('.btn-delete').data('idx',idx);
  $('#edit-Modal input[type=text]').val('');
  $('#edit-Modal input[type=checkbox]').prop('checked',false);

  $.ajax({
    url: '/setting/cp/getInfo',
    type: 'post',
    data: {idx:idx},
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      $('#cp_mcp').empty();
      for (var key in modalInputEle) {
        if(key == 'cp_state' || key == 'cp_class'){
          $('#'+key+' input[type=radio][value='+data.result[key]+']').prop('checked',true);
          if( key == 'cp_class' && data.result[key] == 'c'){
            var mcpVal = data.result['cp_mcp'];
            $.ajax({
              url: '/setting/getMCPList',
              type: 'post',
              datatype : 'json',
              error:function(request,state,error){
                errorMsg();
              },
              success:function(data){
                console.log(data);
                if(!data.state){
                  alert(data.msg);
                  return false;
                }
                data.result.forEach(function(item,idx){
                  console.log(item);
                  $('#cp_mcp').append('<option value="'+item.cp_id+'" '+((item.cp_id==mcpVal)?'selected':'')+'>'+item.cp_cname+'</option>');
                  $('#mcpSelect').show();
                });
              }
            });
          }
          else if( key == 'cp_class' && data.result[key] == 'm'){
            $('#mcpSelect').hide();
          }
        }
        else{
          modalInputEle[key].val(data.result[key]);
          if(key == 'cp_logo'){
            if(data.result[key] != '' && data.result[key] != null){
              $('#cp_logo_txt').val(data.result[key]);
              $('#fileInfoEles').show();
              $('#uploadEles').hide();
              $('#cancelUpload').show();
            }
            else{
              $('#uploadEles').show();
              $('#fileInfoEles').hide();
              $('#cancelUpload').hide();
            }
          }
        }
        $('#o_'+key).val(data.result[key]);
      }
      $('#edit-Modal').modal('show');
    }
  });
});
$('.btn-add').on('click',function(){
  location.href = '/setting/cp/add';
});

// MCP/CP 선택시
$('#selectClass').on('change',function(){
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
    url: '/setting/cp/getNextPage',
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
        var numIdx = Math.ceil(data.result.listCount-idx-(data.result.page-1)).toString();
        var html = '<tr><th>'+numIdx+'</th>\
          <td><div class="edit" data-idx="'+item.n_idx+'">'+item.cp_cname+'</div></td>\
          <td>'+item.cp_id+'</td>\
          <td>'+((item.cp_class == 'm')?'MCP':'CP')+'</td>\
          <td>'+((item.cp_class == 'm')? 'MCP':item.cp_mcp)+'</td>\
          <td>'+((item.cp_state == "0") ? 'OFF' : 'ON')+'</td>\
          <td>'+item.cp_regdate+'</td>\
        </tr>';
        $('#listTable tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable tfoot').empty();
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
        $('#listTable tfoot').append(html);
      }
      $('.preloader3').fadeOut(500);
    }
  });
}
// 리스트 조건 세팅
function startSetting(){
  var cpclass = $.urlParam("class");
  if(cpclass){
    $('#selectClass > option[value='+cpclass+']').attr("selected",true);
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
  var classValue = $('#selectClass option:selected').val();
  if(classValue != ''){
    param.class = classValue;
    if(typeof history.pushState == 'function'){
      renewURL += '&class='+param.class;
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
