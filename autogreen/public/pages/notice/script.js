var str = ($('#uclass').val() != 'a')? 'view_':'';
var modalInputEle = {
  writer: $('#'+str+'writer'),
  title: $('#'+str+'title'),
  content: $('#'+str+'content'),
  file: $('#'+str+'file'),
  type: $('#'+str+'type'),
  regdate: $('#'+str+'regdate')
};
$(document).ready(function(){
  startSetting();
});
// 파일 업로드
$('#file_input').on('change',function(){
  var form = $('#fileForm')[0];
  var formData = new FormData(form);

  $.ajax({
      type: 'post',
      url: '/notice/file_upload',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        console.log(data);
        var html = '<li><span class="f-left file-name">'+data.fileName+'</span><i class="fas fa-times f-right text-danger file-del" data-path="'+data.filePath+'"></i></li>';
        $('#uploadFileList').append(html);
      },
      error: function (err) {
        console.log(err);
        alert('파일 업로드에 실패했습니다.');
      }
  });
});
// 파일 삭제
$(document).on('click','.file-del',function(){
  var filePath = $(this).data('path');
  var fileEle= $(this).parents('li');
  ajaxFileDel(filePath,fileEle);
});
function ajaxFileDel(filePath,tag){
  $.ajax({
    type: 'post',
    url: '/notice/file_delete',
    data: {path:filePath},
    success: function (data) {
      console.log(data);
      $(tag).remove();
    },
    error: function (err) {
        console.log(err);
        alert('파일 삭제에 실패했습니다.');
    }
  });
}
// 게시물 삭제
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
        url: 'notice/delete',
        type: 'post',
        data: {idx:idx},
        error: function(request,status,error){
          errorMSG();
        },
        success: function(data){
          if(data.state){
            alert('삭제 완료했습니다.');
            $.each( $('#uploadFileList li') , function( key, value ) {
              ajaxFileDel($(value).find('.file-del').data('path'),$(value));
            });

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
// 게시물 수정
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
        if(key == 'regdate' || key == 'file'){
          continue;
        }
        if(key == 'type'){
          param[key] = $('#'+key+' input[type=radio]:checked').val();
        }
        else{
          param[key] = modalInputEle[key].val();
        }
      }
      // 필수
      if(param.writer == ""){
        alert("글쓴이을 입력해주세요.");
        return false;
      }
      if(param.title == ""){
        alert("제목을 입력해주세요.");
        return false;
      }
      if(param.content == ""){
        alert("내용을 입력해주세요.");
        return false;
      }

      if($('#uploadFileList li').length > 0){
        var arr = [];
        $.each( $('#uploadFileList li') , function( key, value ) {
          arr.push($(value).find('.file-del').data('path'));
        });
        $("#file").val(arr.join(','));
      }
      param['file'] = $("#file").val();

      $.ajax({
        url: 'notice/update',
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
// 게시물 제목(이용자) 눌렀을 시
$(document).on('click','.view',function(){
  $('#view-Modal p').text('');
  $('#view-Modal #view_uploadFileList').empty();
  var idx = $(this).data('idx');
  $.ajax({
    url: 'notice/getInfo',
    type: 'post',
    data: {idx:idx},
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log(data);
      for (var key in modalInputEle) {
        if(key == 'file'){
          if(data.result[key] != '' && data.result[key] != null){
            var arr = data.result[key].split(',');
            $.each(arr, function( i, val ) {
              var fileName = val.split('/')[3];
              var filePath = val.replace('public/uploads/','http://localhost:8080/notice/download/');
              var html = '<li><a href="'+filePath+'" class="file-name">'+fileName+'</a></li>';
              $('#view_uploadFileList').append(html);
            });
          }
        }
        else if(key == 'content'){
          modalInputEle[key].html(data.result[key].replace(/(?:\r\n|\r|\n)/g, '<br />'));
        }
        else{
          modalInputEle[key].text(data.result[key]);
        }
      }
      $('#view-Modal').modal('show');
    }
  });
});
// 게시물 제목(관리자) 눌렀을 시
$(document).on('click','.edit',function(){
  var idx = $(this).data('idx');
  $('.modal-title').text('공지 수정');
  $('#btn-add').hide();
  $('#btn-update').show();
  $('#regdate_tr').show();
  settingModalEles(idx);

  $.ajax({
    url: 'notice/getInfo',
    type: 'post',
    data: {idx:idx},
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log(data);
      for (var key in modalInputEle) {
        if(key == 'type'){
          $('#'+key+' input[type=radio][value='+data.result[key]+']').prop('checked',true);
        }
        else if(key == 'file'){
          if(data.result[key] != '' && data.result[key] != null){
            var arr = data.result[key].split(',');
            $.each(arr, function( i, val ) {
              var fileName = val.split('/')[3];
              var html = '<li><span class="f-left file-name">'+fileName+'</span><i class="fas fa-times f-right text-danger file-del" data-path="'+val+'"></i></li>';
              $('#uploadFileList').append(html);
            });
          }
        }
        else{
          modalInputEle[key].val(data.result[key]);
        }
        $('#o_'+key).val(data.result[key]);
      }
      $('#edit-Modal').modal('show');
    }
  });
});
// 게시물 등록
$('.btn-add').on('click',function(){
  var idx = $(this).data('idx');
  settingModalEles(idx);
  $('.modal-title').text('공지 등록');
  $('#btn-update').hide();
  $('#regdate_tr').hide();
  $('#btn-add').show();
  $('#edit-Modal').modal('show');
});

function settingModalEles(idx){
  // modal 초기화
  if(idx != ""){
    $('.btn-update').data('idx',idx);
    $('.btn-delete').data('idx',idx);
  }
  $('#edit-Modal input,#edit-Modal textarea').removeClass("form-control-danger");
  $('#edit-Modal span p').text("");
  $('#edit-Modal input[type=text]').val('');
  $('#edit-Modal textarea').val('');
  $('#uploadFileList').empty();
  $('#edit-Modal input[type=radio]').prop('checked',false);
}

// 등록버튼 클릭시
$("#btn-add").on("click",function(){
  var check=false;
  var param = {
    writer:$('#writer').val(),
    title:$('#title').val(),
    content:$('#content').val(),
    type:$("input:radio[name='type']:checked").val()
  };
  // 필수
  if(param.writer == ""){
    check = requiredMessage("writer","글쓴이를 입력해주세요.");
  }
  if(param.title == ""){
    check = requiredMessage("title","제목을 입력해주세요.");
  }
  if(param.content == ""){
    check = requiredMessage("content","내용을 입력해주세요.");
  }
  if(param.type == "" || param.type == undefined){
    check = requiredMessage("type","분류를 선택해주세요.");
  }

  if(check){
    return false;
  }
  swal({
    title: "등록하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      insertNotice(param);
    }
  });
});

// 등록 ajax func
function insertNotice(param){
  // 추가
  if($('#uploadFileList li').length > 0){
    var arr = [];
    $.each( $('#uploadFileList li') , function( key, value ) {
      arr.push($(value).find('.file-del').data('path'));
    });
    param.file = arr.join(',');
  }
  $.ajax({
    url: '/notice/add',
    type: 'post',
    data : param,
    datatype : 'json',
    error:function(request,state,error){
      errorMsg();
    },
    success:function(data){
      alert(data.msg);
      if(data.state){
        reloadPage();
        $('#edit-Modal').modal('hide');
      }
    }
  });
}

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
    url: 'notice/getNextPage',
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
        var html = '<tr><th>'+numIdx+'</th><td><div class="'+((str == 'view_') ? 'view':'edit')+'" data-idx="'+item.n_idx+'">'+item.title+'</div></td>\
          <td>'+item.writer+'</td>\
          <td>'+item.regdate+'</td></tr>';
        $('#listTable tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr><td colspan="4"><ul class="pagination float-right">';
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
function requiredMessage(target,msg){
  $("#"+target).siblings().children().text(msg);
  $("#"+target).addClass("form-control-danger");
  return true;
}
