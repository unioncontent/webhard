$(document).ready(function(){
  var url = new URL(window.location.href);
  var msg = url.searchParams.get("msg");
  var upload = url.searchParams.get("upload");
  var excelNum = 0;
  if(upload || msg){
    history.pushState(null, null,location.href.split('?')[0]);
  }
  if(upload == 'true'){
    alert('일괄등록 성공했습니다.');
  }
  else if(upload == 'false'){
    console.log(msg);
    if(msg){
      excelNum = String(Number(msg.split('_')[0])+1);
      msg = msg.split('_')[1];
    }
    var errorMsg = '일괄등록 실패했습니다.\n';
    if(msg == 'ExcelHeaderError'){
      errorMsg += '엑셀 1열에 내용이 틀렸습니다.\n다시 확인해주세요.';
    }
    else if(msg == 'OSPIdError'){
      errorMsg += 'OSP ID가 맞는지 다시 확인해주세요.';
    }
    else if(msg == 'CPNameError'){
      errorMsg += 'CP사 이름이 등록이 되어있는지 확인해주세요.\n엑셀 '+excelNum+'번줄을 확인해주세요.';
    }
    else if(msg == 'NoFileError'){
      errorMsg += '해당 파일의 상태를 확인해주세요.';
    }
    else if(msg == 'ExcelSysError'){
      errorMsg += '시스템에 문제가 생겼습니다.\n나중에 다시 시도해주세요.';
    }
    else{
      errorMsg += '다시 시도해주세요.';
    }
    alert(errorMsg);
  }
});
$("#selectMCP").on("change",function(){
  // CP초기화
  $("#selectCP").empty();
  $("#selectCP").append('<option value="">선택</option>');

  var mcpValue = $("#selectMCP option:selected").val();
  if(mcpValue == ''){
    return false;
  }
  $.ajax({
    url: '/cnts/add/getCP',
    type: 'post',
    data : {mcp:mcpValue},
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
});
// 등록버튼 클릭시
$("#insertBtn").on("click",function(){
  swal({
    title: "등록하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      insertContents();
    }
  });
});
// 등록 ajax func
function insertContents(){
  var check=false;
  var param = {
    cnt_cp:$("#selectCP option:selected").val(),
    cnt_title:$("#cnt_title").val(),
    cnt_price:$("#cnt_price").val(),
    k_title:($("#k_title").val() != "") ? $("#k_title").val():$("#cnt_title").val(),
    k_state:$("input:radio[name='k_state']:checked").val(),
    k_method:$("input:radio[name='k_method']:checked").val(),
    k_apply:$("input:radio[name='k_apply']:checked").val(),
    k_mailing:$("input:radio[name='k_mailing']:checked").val()
  };
  if($('#user_class').val() == 'm'){
    param.cnt_mcp = $('#user_id').val();
  }
  else{
    param.cnt_mcp = $("#selectMCP option:selected").val();
  }
  // 필수
  if(param.cnt_mcp == ""){
    check = requiredMessage("selectMCP","관리사를 선택해주세요.");
  }
  if(param.cnt_cp == ""){
    check = requiredMessage("selectCP","저작권사를 선택해주세요.");
  }
  if(param.cnt_title == ""){
    check = requiredMessage("cnt_title","제목을 입력해주세요.");
  }
  if(param.cnt_price == ""){
    check = requiredMessage("cnt_price","판매금액을 입력해주세요.");
  }
  if(check){
    return false;
  }

  // 추가
  if($("#cnt_eng_title").val() != ""){
    param.cnt_eng_title = $("#cnt_eng_title").val();
  }
  if($("#cnt_director").val() != ""){
    param.cnt_director = $("#cnt_director").val();
  }
  if($("#cnt_nat option:selected").val() != ""){
    param.cnt_nat = $("#cnt_nat option:selected").val();
  }
  if($("#cnt_cate option:selected").val() != ""){
    param.cnt_cate = $("#cnt_cate option:selected").val();
  }
  if($("#cnt_cpid").val() != ""){
    param.cnt_cpid = $("#cnt_cpid").val();
  }
  if($("#cnt_period").val() != ""){
    param.cnt_period = $("#cnt_period").val();
  }
  if($("#cnt_hash").val() != ""){
    param.cnt_hash = $("#cnt_hash").val();
  }
  if($("#cnt_mureka").val() != ""){
    param.cnt_mureka = $("#cnt_mureka").val();
  }
  if($("#cnt_acom").val() != ""){
    param.cnt_acom = $("#cnt_acom").val();
  }

  $.ajax({
    url: '/cnts/add',
    type: 'post',
    data : param,
    datatype : 'json',
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      alert(request.responseText);
      location.reload();
    },
    success:function(data){
      alert('등록되었습니다.');
      location.reload();
    }
  });
}

$("input, select").on("focus",function(){
  $(this).removeClass("form-control-danger");
  $(this).siblings().children("p").text("");
});

function requiredMessage(target,msg){
  $("#"+target).siblings().children().text(msg);
  $("#"+target).addClass("form-control-danger");
  return true;
}

// 엑셀 대량 등록
$('#excelBtn').on('click',function(){
  $('#cnt-Modal').modal('show');
});

$('#insertBtn2').on('click',function(){
  swal({
    title: "대량등록하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      if($('input[type=file]').val()==""){
        alert('파일을 선택해주세요.');
        return false;
      }
      $("#uploadFrm").submit();
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
