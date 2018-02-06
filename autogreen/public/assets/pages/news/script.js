/*'use strict';
$(document).ready(function () {
  document.querySelector('.alert-success-msg').onclick = function(){
		swal("Good job!", "선택처리 완료 되었습니다.", "success");
	};
  엑셀출력
  document.querySelector('.alert-confirm').onclick = function(){
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
          swal("Success!", "엑셀출력 되었습니다.", "success");
        });
  };
});
*/