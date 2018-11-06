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
        url: "/setting/osp/idCheck",
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

            $('#osp_id').val(value);
            $("#idCheck").val("true");
            $('#osp_id').removeClass("form-control-danger");
            $('#osp_id').siblings().children("p").text("");
          }
        }
      });
    }
  });
});

// 등록버튼 클릭시
$(".btn-add").on("click",function(){
  var check=false;
  var param = {
    osp_sname:$('#osp_sname').val(),
    osp_open:$('#osp_open').val(),
    osp_id:$('#osp_id').val(),
    osp_pw:$('#osp_pw').val(),
    osp_cname:$('#osp_cname').val(),
    osp_cnum:$('#osp_cnum').val(),
    osp_tstate:$("input:radio[name='osp_tstate']:checked").val(),
    osp_ceoname:$('#osp_ceoname').val(),
    osp_url:$('#osp_url').val(),
    osp_email:$('#osp_email_id').val()+'@'+$('#osp_email_site').val()
  };
  // 필수
  if(param.osp_sname == ""){
    check = requiredMessage("osp_sname","서비스명을 입력해주세요.");
  }
  if(param.osp_open == ""){
    check = requiredMessage("osp_open","오픈일을 선택해주세요.");
  }
  if(param.osp_id == ""){
    check = requiredMessage("osp_id","아이디를 입력해주세요.");
  }
  if(param.osp_id != "" && $("#idCheck").val() == ""){
    check = requiredMessage("osp_id","아이디를 중복확인 해주세요.");
  }
  if(param.osp_pw == ""){
    check = requiredMessage("osp_pw","비밀번로를 입력해주세요.");
  }
  if(param.osp_cname == ""){
    check = requiredMessage("osp_cname","법인명을 입력해주세요.");
  }
  if(param.osp_cnum == ""){
    check = requiredMessage("osp_cnum","사업자번호를 입력해주세요.");
  }
  if(param.osp_tstate == ""){
    check = requiredMessage("osp_tstate","제휴현황을 선택해주세요.");
  }
  if(param.osp_ceoname == ""){
    check = requiredMessage("osp_ceoname","대표자명 입력해주세요.");
  }
  if(param.osp_url == ""){
    check = requiredMessage("osp_url","URL을 입력해주세요.");
  }
  if($('#osp_email_id').val() == "" && $('#osp_email_site').val() == ""){
    check = requiredMessage("osp_email","이메일을 입력해주세요.");
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
      insertOSP(param);
    }
  });
});

// 등록 ajax func
function insertOSP(param){
  // 추가
  if($("#osp_scnum").val() != ""){
    param.osp_scnum = $("#osp_scnum").val();
  }
  if($("#osp_pname").val() != ""){
    param.osp_pname = $("#osp_pname").val();
  }
  if($("#osp_durl").val() != ""){
    param.osp_durl = $("#osp_durl").val();
  }
  if($("#cnt_cpid").val() != ""){
    param.cnt_cpid = $("#cnt_cpid").val();
  }
  if($("#osp_img").val() != ""){
    param.osp_img = $("#osp_img").val();
  }
  if($("#osp_addrs").val() != ""){
    param.osp_addrs = $("#osp_addrs").val();
  }
  if($("#osp_tel").val() != ""){
    param.osp_tel = $("#osp_tel").val().replace(/[-]/gi,'');
  }
  if($("input[type='checkbox']:checked").length > 0){
    if($("input[type='checkbox']:checked").length == 2){
      param.osp_mobile = 2;
    }
    else{
      param.osp_mobile = $("input[type='checkbox']:checked").val();
    }
  }
  if($("input:radio[name='osp_state']:checked").val() != ""){
    param.osp_state = $("input:radio[name='osp_state']:checked").val();
  }

  $.ajax({
    url: '/setting/osp/add',
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
  if($(this).attr('id').indexOf('email') != -1){
    $("#osp_email").siblings().children("p").text("");
  }
});

function requiredMessage(target,msg){
  $("#"+target).siblings().children().text(msg);
  if(target != "osp_email"){
    $("#"+target).addClass("form-control-danger");
  }
  else{
    $("#"+target+"_id").addClass("form-control-danger");
    $("#"+target+"_site").addClass("form-control-danger");
  }
  return true;
}

// 오픈일
$('#osp_open').daterangepicker({
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
