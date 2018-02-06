'use strict';
$(document).ready(function () {
  $(".js-example-basic-single").select2();
  $("button[type='submit']").on("click",function(){
    var check=true;
    // 기자 등록 필수 입력 체크
    if($("#newsName option:selected").text() == "선택" && !$("input:checkbox").prop("checked")){
      $("#newsName").siblings().children().eq(2).text("언론사명을 선택해주세요.");
      $(".select2-selection.select2-selection--single").css("border-color","#e74c3c");
      check = false;
    }
    if($("input:checkbox").prop("checked")){
      $(".select2-selection.select2-selection--single").css("border-color","rgba(0, 0, 0, 0.15)");
      $("#newsName").siblings().children().eq(2).text("");
      check=true;
    }
    if($("input:checkbox").prop("checked") && $("#newsNewName1").val() == ""){
      check = requiredMessage("newsNewName1","언론사명을 입력해주세요.");
    }
    if($("input:checkbox").prop("checked") && $("#newsNewName2").val() == ""){
      check = requiredMessage("newsNewName2","언론사명을 입력해주세요.");
    }
    if($("#serachNewsName").val() == ""){
      check = requiredMessage("serachNewsName","검색언론사명을 입력해주세요.");
    }
    if($("#pressName").val() == ""){
      check = requiredMessage("pressName","기자명을 입력해주세요.");
    }
    if($("#press-select option:selected").text() == "선택"){
      check = requiredMessage("press-select","기자분류를 선택해주세요.");
    }
    return check;
  });
  $("input, select").on("focus",function(){
    $(this).removeClass("form-control-danger");
    $(this).siblings().children("p").text("");
  });
  $(".select2").on("click",function(){
    $(".select2-selection.select2-selection--single").css("border-color","rgba(0, 0, 0, 0.15)");
    $("#newsName").siblings().children().eq(2).text("");
  });
});

function requiredMessage(target,msg){
  $("#"+target).siblings().children().text(msg);
  $("#"+target).addClass("form-control-danger");
  return false;
}
