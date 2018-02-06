'use strict';
$(document).ready(function () {
  // 대표키워드 중복체크
  /*document.querySelector('.alert-prompt').onclick = function(){
    swal({
      title: "✓ 대표 키워드 중복체크",
      text: "키워드를 입력해주세요.",
      type: "input",
      showCancelButton: true,
      closeOnConfirm: false,
      inputValue:$("#keywordName").val(),
      inputPlaceholder: "대표 키워드 입력"
    }, function (inputValue) {
      if (inputValue === false){
        swal.showInputError("키워드를 다시 입력해 주세요.");
        return false;
      }
      if (inputValue == ""){
        swal.showInputError("키워드를 다시 입력해 주세요.");
        return false;
      }
      if (inputValue === "union") {
        swal.showInputError("키워드가 중복됩니다. 다시 입력해 주세요.");
        return false
      }
      $("#keywordName").val(inputValue);
      $("#keywordCheck").val("true");
      $("#keywordName").removeClass("form-control-danger");
      $("#keywordName").siblings().children("p").text("");
      swal("중복확인!", inputValue+"는 사용가능한 키워드입니다.", "success");
    });
  };*/

  // 키워드 등록 필수 입력 체크
/*  $(".submit").on("click",function(){
    var check=true;
    if($("#company option:selected").text() == "선택"){
      check = requiredMessage("company","회사명을 선택해주세요.");
    }
    if($("#keywordName").val() == ""){
      check = requiredMessage("keywordName","키워드를 입력해주세요.");
    }
    //키워드가 입력되어 있는데 중복체크 안했을 경우
    if($("#keywordName").val() != "" && $("#keywordCheck").val() == ""){
      check = requiredMessage("keywordName","키워드 중복확인 해주세요.");
    }
    if(check){
      swal("등록완료!", "등록이 성공적으로 되었습니다.", "success");
      $(".keywordResult").show();
    }
  });
  $("input, select").on("focus",function(){
    $(this).removeClass("form-control-danger");
    $(this).siblings().children("p").text("");
  });*/

  //등록이 완료되었을 때!
  // swal("등록완료!", "등록이 성공적으로 되었습니다.", "success");
  //등록이 되지 않았을 때!
  // swal("등록미완료..", "등록을 다시 해주세요.", "error");
});


function requiredMessage(target,msg){
  $("#"+target).siblings().children().text(msg);
  $("#"+target).addClass("form-control-danger");
  return false;
}
