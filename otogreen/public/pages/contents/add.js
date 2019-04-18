$(document).ready(function(){
  var url = new URL(window.location.href);
  var msg = url.searchParams.get("msg");
  var upload = url.searchParams.get("upload");
  var excelNum = 0;
  if(upload || msg){
    history.pushState(null, null,location.href.split('?')[0]);
  }
  if(upload == 'true'){
    if(msg){
      alert('일괄등록 처리중이오니 기다려주시기 바랍니다.');
    }
    else{
      alert('일괄등록 성공했습니다.');
    }
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

$("#add-Modal #selectMCP").on("change",function(){
  // CP초기화
  $("#add-Modal #selectCP").empty();
  $("#add-Modal #selectCP").append('<option value="">선택</option>');

  var mcpValue = $("#add-Modal #selectMCP option:selected").val();
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
        $("#add-Modal #selectCP").append(html);
      });
    }
  });
});
// 등록버튼 클릭시
$("#add-Modal #insertBtn").on("click",function(){
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
    cnt_cp:$("#add-Modal #selectCP option:selected").val(),
    cnt_title:$("#add-Modal #cnt_title").val(),
    cnt_price:$("#add-Modal #cnt_price").val(),
    cnt_series_chk:(($("#add-Modal #checkbox_s").is(':checked') == false)?'0':'1'),
    k_title:($("#add-Modal #k_title").val() != "") ? $("#add-Modal #k_title").val():$("#add-Modal #cnt_title").val(),
    k_state:$("#add-Modal input:radio[name='k_state']:checked").val(),
    k_method:$("#add-Modal input:radio[name='k_method']:checked").val(),
    k_apply:$("#add-Modal input:radio[name='k_apply']:checked").val(),
    k_mailing:$("#add-Modal input:radio[name='k_mailing']:checked").val()
  };
  if(param.cnt_series_chk == '1'){
    if($("#add-Modal #cnt_s_chk1").val() != '' && $("#add-Modal #cnt_s_chk1").val() != '0'){
      param.cnt_s_chk1 = $("#add-Modal #cnt_s_chk1").val();
    } else{
      check = requiredMessage("cnt_s_chk1","키워드1을 다시 작성해주세요.");
    }
    if($("#add-Modal #cnt_s_chk2").val() != '' && $("#add-Modal #cnt_s_chk2").val() != '0'){
      param.cnt_s_chk2 = $("#add-Modal #cnt_s_chk1").val();
    } else{
      check = requiredMessage("cnt_s_chk2","키워드2을 다시 작성해주세요.");
    }
    if($("#add-Modal #cnt_s_chk3").val() != ''){
      param.cnt_s_chk3 = $("#add-Modal #cnt_s_chk3").val();
    } else{
      check = requiredMessage("cnt_s_chk3","키워드3을 다시 작성해주세요.");
    }
  }
  if($('#user_class').val() == 'm'){
    param.cnt_mcp = $('#user_id').val();
  }
  else if($('#user_class').val() == 'c'){
    param.cnt_mcp = $('#user_mcp').val();
    param.cnt_cp = $('#user_id').val();
  }
  else{
    param.cnt_mcp = $("#add-Modal #selectMCP option:selected").val();
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
  if($("#add-Modal #cnt_eng_title").val() != ""){
    param.cnt_eng_title = $("#add-Modal #cnt_eng_title").val();
  }
  if($("#add-Modal #cnt_director").val() != ""){
    param.cnt_director = $("#add-Modal #cnt_director").val();
  }
  if($("#add-Modal #cnt_nat option:selected").val() != ""){
    param.cnt_nat = $("#add-Modal #cnt_nat option:selected").val();
  }
  if($("#add-Modal #cnt_cate option:selected").val() != ""){
    param.cnt_cate = $("#add-Modal #cnt_cate option:selected").val();
  }
  if($("#add-Modal #cnt_cpid").val() != ""){
    param.cnt_cpid = $("#add-Modal #cnt_cpid").val();
  }
  if($("#add-Modal #cnt_period").val() != ""){
    param.cnt_period = $("#add-Modal #cnt_period").val();
  }
  if($("#add-Modal #cnt_hash").val() != ""){
    param.cnt_hash = $("#add-Modal #cnt_hash").val();
  }
  if($("#add-Modal #cnt_mureka").val() != ""){
    param.cnt_mureka = $("#add-Modal #cnt_mureka").val();
  }
  if($("#add-Modal #cnt_acom").val() != ""){
    param.cnt_acom = $("#add-Modal #cnt_acom").val();
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

$("#add-Modal input, #add-Modal select").on("focus",function(){
  $(this).removeClass("form-control-danger");
  $(this).siblings().children("p").text("");
});

function requiredMessage(target,msg){
  $("#add-Modal #"+target).siblings().children().text(msg);
  $("#add-Modal #"+target).addClass("form-control-danger");
  return true;
}

$('#add-Modal #insertBtn2').on('click',function(){
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
      $("#add-Modal #uploadFrm").submit();
    }
  });
});

// 저작권만료기간
$('#add-Modal #cnt_period').daterangepicker({
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
