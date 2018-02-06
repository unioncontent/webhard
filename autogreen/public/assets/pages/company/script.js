'use strict';
$(document).ready(function () {
  // 아이디 중복 체크
  document.querySelector('.alert-prompt').onclick = function(){
		swal({
			title: "✓ 아이디 중복 체크",
			text: "아이디를 입력해주세요.",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: false,
			inputPlaceholder: "아이디 입력"
		}, function (inputValue) {
			/*if (inputValue === false){
        swal.showInputError("아이디를 다시 입력해 주세요.");
        return false;
      }
      if (inputValue == ""){
        swal.showInputError("아이디를 다시 입력해 주세요.");
        return false;
      }
			if (inputValue === "fail") {
				swal.showInputError("아이디가 중복됩니다. 다시 입력해 주세요.");
				return false
			}*/
			
			var $user_ID = $("#id").val();
			
			$.ajax({
				type: "POST",
				url: "idCheck",
				dataType: "text",
				data: {user_ID : inputValue},
				success: function(data){
						console.log(data);
						
						if(data == 'fail'){
							swal.showInputError("아이디가 중복됩니다. 다시 입력해 주세요.");
						
						}else if(data == 'success'){
							swal("중복확인!", inputValue+"는 사용가능한 아이디입니다.", "success");
							
							$("#id").val(inputValue);
						    $("#idCheck").val("true");
						    $("#id").removeClass("form-control-danger");
						    $("#id").siblings().children("p").text("");
						}
						
						//swal("중복확인!", inputValue+"는 사용가능한 아이디입니다.", "success");
				}
						  
			}); // end ajax... 
      /*$("#id").val(inputValue);
      $("#idCheck").val("true");
      $("#id").removeClass("form-control-danger");
      $("#id").siblings().children("p").text("");
			swal("중복확인!", inputValue+"는 사용가능한 아이디입니다.", "success");*/
		});
	};

  // 거래처 등록 필수 입력 체크
  $("button[type='submit']").on("click",function(){
    var check=true;
    //비밀번호가 입력되었는데 아이디가 없는 경우
    if($("#pw").val() != "" && $("#id").val() == ""){
      check = requiredMessage("id","아이디를 입력해주세요.");
    }
    //아이디가 입력되어 있는데 중복체크 안했을 경우
    if($("#id").val() != "" && $("#idCheck").val() == ""){
      check = requiredMessage("id","아이디 중복확인 해주세요.");
    }
    //아이디가 입력되어 있는데 비밀번호가 없을 경우
    if($("#id").val() != "" && $("#pw").val() == ""){
      check = requiredMessage("pw","비밀번호를 입력해주세요.");
    }
    //아이디가 없을 때 비밀번호 경고문 제거
    if($("#id").val() == ""){
      $("#pw").removeClass("form-control-danger");
      $("#pw").siblings().children("p").text("");
    }
    //비밀번호가 없을 때 아이디 경고문 제거
    if($("#pw").val() == ""){
      $("#id").removeClass("form-control-danger");
      $("#id").siblings().children("p").text("");
    }
    if($("#company").val() == ""){
      check = requiredMessage("company","회사명을 입력해주세요.");
    }
    if($("#boss").val() == ""){
      check = requiredMessage("boss","대표자명을 입력해주세요.");
    }
    if($("#address").val() == ""){
      check = requiredMessage("address","주소를 입력해주세요.");
    }
    if($("#phone").val() == ""){
      check = requiredMessage("phone","연락처를 입력해주세요.");
    }
    return check;
  });
  $("input, select").on("focus",function(){
    $(this).removeClass("form-control-danger");
    $(this).siblings().children("p").text("");
  });

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
