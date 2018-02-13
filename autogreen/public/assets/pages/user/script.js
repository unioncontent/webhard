'use strict';
$(document).ready(function () {
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
        swal("ERROR!", "아이디를 다시 입력해주세요.", "error");
        return false;
      }

			$.ajax({
				type: "POST",
				url: "./idCheck",
				dataType: "text",
				data: {id : value},
        error: function(req,status,error){
          swal("ERROR!", req.status+"\n"+error, "error");
        },
				success: function(data){
					console.log(data);

					if(data == 'fail'){
            swal("ERROR!", "아이디가 중복됩니다. 다시 입력해 주세요.", "error");
					}else if(data == 'success'){
						swal("중복확인!", value+"는 사용가능한 아이디입니다.", "success");

						$('#id').val(value);
				    $("#idCheck").val("true");
				    $('#id').removeClass("form-control-danger");
				    $('#id').siblings().children("p").text("");
					}
				}
		  });
	  });
	});

  // 거래처 등록 필수 입력 체크
  $("button[type='submit']").on("click",function(){
    var check=true;
    if($('#userName').val() == ""){
      check = requiredMessage("userName","거래처명을 입력해주세요.");
    }
    if($("#id").val() == ""){
      check = requiredMessage("id","아이디를 입력해주세요.");
    }
    if($("#id").val() != "" && $("#idCheck").val() == ""){
      check = requiredMessage("id","아이디를 중복확인 해주세요.");
    }
    if($("#pw").val() == ""){
      check = requiredMessage("pw","비밀번호를 입력해주세요.");
    }
    if($("input:radio[name=uClass]:checked").val() == undefined){
      check = requiredMessage("class","분류를 선택해주세요.");
    }
    if($("input:radio[name=status]:checked").val() == undefined){
      check = requiredMessage("status","상태를 선택해주세요.");
    }
    if(check){
      var now = new Date();
      var date = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
      $.ajax({
        url: './add',
        type: 'post',
        data : {
          'id': $('input[name=id]').val(),
          'pwd': $('input[name=pw]').val(),
          'calss': $("input:radio[name=uClass]:checked").val(),
  				'userName': $('input[name=userName]').val(),
          'status': $("input:radio[name=status]:checked").val(),
          'date': date
  			},
  			datatype : 'json',
        error:function(request,status,error){
          // alert('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
          alert(request.responseText);
        },
        success:function(data){
          alert(data);
          //input 초기화
          $('input').val('');
        }
      });
    }

    return check;
  });

  $("input, select").on("focus",function(){
    $(this).removeClass("form-control-danger");
    $(this).siblings().children("p").text("");
  });
});

function requiredMessage(target,msg){
  $("#"+target).siblings().children().text(msg);
  $("#"+target).addClass("form-control-danger");
  return false;
}
