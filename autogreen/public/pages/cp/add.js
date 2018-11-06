// 이미지 업로드
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
        $('.btn-upload').append(html);
        $('#file-delete').data('file',data);
        $('#cp_logo').val(data);
      },
      error: function (err) {
        console.log(err);
      }
  });
});
// 업로드 파일 삭제
$('#cp_logo_file').on('change',function(){
  var filePath = $('#file-delete').data('file');
  if(filePath != undefined){
    ajaxFileDel(filePath);
  }
  $('#cp_logo').val('');
  $('#file-delete').remove();
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

// 중복 체크
$(".alert-prompt").on("click",function(){
  swal({
    title: "✓ 아이디 중복 체크",
    content: "input",
    buttons: ["취소", "확인"],
    closeOnClickOutside: false,
    closeOnEsc: false
  })
  .then((value) => {
    console.log(value);
    if (value === "") {
      alert("ERROR!", "아이디를 다시 입력해주세요.");
      return false;
    }
    if (value != null) {
      $.ajax({
        type: "POST",
        url: "/setting/cp/idCheck",
        dataType: "text",
        data: {id : value},
        error: function(req,state,error){
          errorMsg();
        },
        success: function(data){
          console.log(data);
          if(data == 'fail'){
            swal("ERROR!", "아이디가 중복됩니다. 다시 입력해 주세요.", "error");
          }else if(data == 'success'){
            swal("중복확인!", value+"는 사용가능한 아이디입니다.", "success");

            $('#cp_id').val(value);
            $("#idCheck").val("true");
            $('#cp_id').removeClass("form-control-danger");
            $('#cp_id').siblings().children("p").text("");
          }
        }
      });
    }
  });
});

// 회사 분류 선택시
$('input[name=cp_class]').on('change',function(){
  $('#cp_mcp').empty();
  if($(this).val() == 'c'){
    $.ajax({
      url: '/setting/getMCPList',
      type: 'post',
      datatype : 'json',
      error:function(request,state,error){
        errorMsg();
      },
      success:function(data){
        if(!data.state){
          alert(data.msg);
          return false;
        }
        data.result.forEach(function(item,idx){
          $('#cp_mcp').append('<option value="'+item.cp_id+'">'+item.cp_cname+'</option>');
          $('#mcpSelect').show();
        });
      }
    });
  }
  else{
    $('#mcpSelect').hide();
  }
});

// 등록버튼 클릭시
$("#btn-add").on("click",function(){
  var check=false;
  var param = {
    cp_id:$('#cp_id').val(),
    cp_pw:$('#cp_pw').val(),
    cp_cname:$('#cp_cname').val(),
    cp_cnum:$('#cp_cnum').val(),
    cp_class:$("input:radio[name='cp_class']:checked").val()
  };
  // 필수
  if(param.cp_id == ""){
    check = requiredMessage("cp_id","아이디를 입력해주세요.");
  }
  if(param.cp_id != "" && $("#idCheck").val() == ""){
    check = requiredMessage("cp_id","아이디를 중복확인 해주세요.");
  }
  if(param.cp_pw == ""){
    check = requiredMessage("cp_pw","비밀번로를 입력해주세요.");
  }
  if(param.cp_cname == ""){
    check = requiredMessage("cp_cname","법인명을 입력해주세요.");
  }
  if(param.cp_cnum == ""){
    check = requiredMessage("cp_cnum","사업자번호를 입력해주세요.");
  }
  if(param.cp_class == ""){
    check = requiredMessage("cp_class","회사분류를 선택해주세요.");
  }
  if(param.cp_class == "c"){
    param.cp_mcp = $('#cp_mcp option:selected').val();
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
      insertcp(param);
    }
  });
});

// 등록 ajax func
function insertcp(param){
  // 추가
  if($("#cp_ceoname").val() != ""){
    param.cp_ceoname = $("#cp_ceoname").val();
  }
  if($("#cp_pname").val() != ""){
    param.cp_pname = $("#cp_pname").val();
  }
  if($("#cp_addrs").val() != ""){
    param.cp_addrs = $("#cp_addrs").val();
  }
  if($("#cp_tel").val() != ""){
    param.cp_tel = $("#cp_tel").val().replace(/[-]/gi,'');
  }
  if($("#cp_hp").val() != ""){
    param.cp_hp = $("#cp_hp").val().replace(/[-]/gi,'');
  }
  if($("#cp_email_id").val() != "" && $("#cp_email_site").val() != ""){
    param.cp_email = $("#cp_email_id").val()+'@'+$("#cp_email_site").val();
  }
  if($("#cp_logo").val() != ""){
    param.cp_logo = $("#cp_logo").val();
  }
  if($("input:radio[name='cp_state']:checked").val() != ""){
    param.cp_state = $("input:radio[name='cp_state']:checked").val();
  }
  $.ajax({
    url: '/setting/cp/add',
    type: 'post',
    data : param,
    datatype : 'json',
    error:function(request,state,error){
      errorMsg();
    },
    success:function(data){
      alert(data.msg);
      if(data.state){
        location.reload();
      }
    }
  });
}

$("input, select").on("focus",function(){
  $(this).removeClass("form-control-danger");
  $(this).siblings().children("p").text("");
  if($(this).attr('id')){
    if($(this).attr('id').indexOf('email') != -1){
      $("#cp_email").siblings().children("p").text("");
    }
  }
});

function requiredMessage(target,msg){
  $("#"+target).siblings().children().text(msg);
  if(target != "cp_email"){
    $("#"+target).addClass("form-control-danger");
  }
  else{
    $("#"+target+"_id").addClass("form-control-danger");
    $("#"+target+"_site").addClass("form-control-danger");
  }
  return true;
}
