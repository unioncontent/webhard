/*'use strict';
$(document).ready(function () {
  // 키워드 추가 필수 입력 체크
  $("#puls").on("click",function(){
    var check=true;
    if($("#pSearch").val() == ""){
      check = requiredMessage("pSearch","검색어를 입력해주세요.");
    }
    if($("#dSearch").val() == ""){
      check = requiredMessage("dSearch","제외검색어를 입력해주세요.");
    }
  });
  $("input").on("focus",function(){
    $(this).removeClass("form-control-danger");
    $(this).siblings().children("p").text("");
  });

  //등록이 완료되었을 때!
  // swal("등록완료!", "등록이 성공적으로 되었습니다.", "success");
  //등록이 되지 않았을 때!
  // swal("등록미완료..", "등록을 다시 해주세요.", "error");
});*/


/*function requiredMessage(target,msg){
  $("#"+target).siblings().children().text(msg);
  $("#"+target).addClass("form-control-danger");
  return false;
}*/
