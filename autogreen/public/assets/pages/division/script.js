'use strict';
$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
  //엑셀출력 확인메시지
	/*$(document).on("click",".alert-excel",function(){
    swal({
          title: "엑셀출력 하시겠습니까?",
          text: "현재 리스트가 엑셀출력 됩니다.",
          type: "warning",
          showCancelButton: true,
          confirmButtonClass: "btn-danger",
          confirmButtonText: "YES",
          closeOnConfirm: false
        },
        function(){//엑셀 출력하겠다고 할 시 진행 함수
        	
        	$.ajax({
				  type: "GET",
				  url: "../classification/excel",
				  data: {success : "success"},
				  dataType : "text"
				}); 
        	
          swal("Success!", "엑셀출력 되었습니다.", "success");
        });
	});*/
  //일괄처리 확인메시지
	/*$(document).on("click",".alert-confirm",function(){
		swal({
					title: "일괄처리 하시겠습니까?",
					text: "선택한 분류들로 일괄처리 됩니다.",
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-danger",
					confirmButtonText: "YES",
					closeOnConfirm: false
				},
				function(){
					swal("Success!", "일괄처리가 완료되었습니다.", "success");
				});
	});*/
  //삭제처리 확인메시지
	/*$(document).on("click",".alert-confirm1",function(){
		swal({
					title: "삭제처리 하시겠습니까?",
					text: "바로 삭제처리 됩니다.",
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-danger",
					confirmButtonText: "YES",
					closeOnConfirm: false
				},
				function(){
					swal("Delete!", "삭제처리가 완료되었습니다.", "success");
				});
  });*/
  //즉시처리 확인메시지
	/*$(document).on("click",".alert-confirm2",function(){
		swal({
					title: "즉시처리 하시겠습니까?",
					text: "선택된 분류로 즉시처리 됩니다.",
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-danger",
					confirmButtonText: "YES",
					closeOnConfirm: false
				},
				function(){
					var tr = event.target.parentNode.parentNode;
					  console.log(tr);
					  
					  var idx = tr.children[0].value;
					  var table = tr.children[2].innerText;
					  var arr = tr.children[8].children[0].children;
					
					  console.log(idx);
					  console.log(table);
					  console.log(arr); 
					  
					  for(var i = 0; i < arr.length; i++){
						console.log(arr[i]);
						if(arr[i].type == "radio"){
							if(arr[i].checked){
								var textType = arr[i+1].innerText;
								
								$.ajax({
									  type: "POST",
									  url: "insert",
									  data: {idx : idx, table : table, textType : textType},
									  dataType: "text",
									  success: function(data){
										  console.log(data);
									  }
									  
									});
								
								break;
							}
						}
						
					  }
					  
					swal("Success!", "즉시처리가 완료되었습니다.", "success");
				});
  });*/
  //이미지 보기 클릭시 모달
  /*$(".image").on("click",function(event){
	  console.log(event.target);
    $('#image-Modal').modal('show');
  });
  //이미지업로드 클릭시
  $(document).on("click",".alert-upload",function(){
    $("#image-Modal").modal("hide");

    //이미지처리메시지 - 성공시
    swal("Success!", "이미지업로드가 되었습니다.", "success");
    //이미지처리메시지 - 실패시
    // swal("error!", "이미지업로드가 실패했습니다.", "error");
  });
  //이미지삭제 클릭시
  $(document).on("click",".alert-delete",function(){
    $("#image-Modal").modal("hide");

    //이미지처리메시지 - 성공시
    swal("Success!", "이미지삭제가 되었습니다.", "success");
    //이미지처리메시지 - 실패시
    // swal("Delete!", "이미지삭제가 실패했습니다.", "error");
  });*/
});
