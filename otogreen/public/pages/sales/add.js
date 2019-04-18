// 엑셀 닫히면
$('#excel-Modal').on('hidden.bs.modal', function () {
  $('.complete li').remove();
  $('.target').data('excel','');
});
// 엑셀
$('#excelBtn').on('click',function(){
  $('#excel-Modal').modal('show');
});
// excel file업로드
$(".upload").upload({
  action:'/sales/excelAdd',
  maxConcurrent: 100,
  beforeSend: onBeforeSend
});
$('.cancel').on('click',function(){
  swal({
    title: "엑셀을 삭제하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      $('.complete li').remove();
      $('.target').data('excel','');
    }
  });
});
function onBeforeSend(formData, file) {
  // Cancel request
  if (file.name.indexOf(".xls") < 0 || file.name.indexOf(".xlsx") < 0) {
    return false;
  }

  // Modify and return form data
  console.log("file==>",file);
  var reader = new FileReader();
  reader.readAsArrayBuffer(file.file);
  reader.onload = function(e) {
    $('.complete li').remove();
    $('.target').data('excel','');
    var data= new Uint8Array(reader.result);
    var wb = XLSX.read(data,{type:'array'});
    var first_sheet_name = wb.SheetNames[0];
    var first_json = XLSX.utils.sheet_to_json(wb.Sheets[first_sheet_name]);
    var first_arr = first_json[0];
    if(first_json == undefined){
      alert('엑셀을 다시 확인해주세요.');
      return false;
    }
    if(!('MCP/CP' in first_arr) || !('OSP' in first_arr) || !('콘텐츠코드' in first_arr) || !('콘텐츠제목' in first_arr) || !('총판매건' in first_arr) ||
    !('총매출금액' in first_arr) || !('정산매출' in first_arr) || !('정산날짜' in first_arr) || !('요율' in first_arr) || !('MG' in first_arr)){
      alert('엑셀 1행이 잘못되었습니다. 다시 확인해주세요.');
      return false;
    }
    // console.log(JSON.stringify(XLSX.utils.sheet_to_json(wb.Sheets[first_sheet_name])))
    $('.target').data('excel',JSON.stringify(first_json));
    $('.complete').append('<li data-index="0"><span class="content"><span class="file">'+file.name+'</span></span><span class="bar" style="width: 100%;"></span></li>');
  }
  return formData;
}

$('#insertBtn_m').on('click',function(){
  swal({
    title: "엑셀 등록하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      if($('.target').data('excel') == ''){
        alert('엑셀을 등록해주세요.');
        return false;
      }
      excelInsert();
    }
  });
});
function excelInsert(){
  $.ajax({
    url: '/sales/excelAdd',
    type: 'post',
    data : {data:$('.target').data('excel')},
    datatype : 'json',
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      alert('다시 시도해주세요.');
      $('.target').data('excel','');
    },
    success:function(data){
      alert('매출등록이 완료되었습니다.');
      $('.complete li').remove();
      $('.target').data('excel','');
    }
  });
}

// MCP클릭시
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
  var check=false;
  var param = {
    s_mcp:$("#selectMCP option:selected").val(),
    s_cp:$("#selectCP option:selected").val(),
    s_osp:$("#selectOSP option:selected").val(),
    // s_cnt_num:$("#s_cnt_num").val(),
    // s_title:$("#s_title").val(),
    s_total_money:$("#s_total_money").val(),
    s_mg:$("#s_mg").val(),
    s_rate:$("#s_rate").val(),
    s_total_sales:$("#s_total_sales").val(),
    s_settlement_money:$("#s_settlement_money").val(),
    s_settlement_date:$("#selectYear option:selected").val()+'-'+$("#selectMonth option:selected").val()
  };
  // 필수
  if($('#user_class').val() == 'm'){
    param.s_mcp = $('#user_id').val();
  }
  else if($('#user_class').val() == 'c'){
    param.s_mcp = $('#user_mcp').val();
    param.s_cp = $('#user_id').val();
  }
  else{
    param.s_mcp = $("#add-Modal #selectMCP option:selected").val();
  }
  if(param.s_mcp == ""){
    check = requiredMessage("s_mcp","관리사(MCP)를 선택해주세요.");
  }
  if(param.s_cp == ""){
    check = requiredMessage("s_cp","저작권사(CP)를 선택해주세요.");
  }
  if(param.s_osp == ""){
    check = requiredMessage("s_osp","OSP를 선택해주세요.");
  }
  // if(param.s_cnt_num == ""){
  //   check = requiredMessage("s_cnt_num","콘텐츠를 선택해주세요.");
  // }
  // if(param.s_title == ""){
  //   check = requiredMessage("s_title","콘텐츠를 선택해주세요.");
  // }
  if(param.s_total_money == ""){
    check = requiredMessage("s_total_money","총매출금액을 입력해주세요.");
  }
  if(param.s_total_sales == ""){
    check = requiredMessage("s_total_sales","총판매건을 입력해주세요.");
  }
  if(param.s_mg == ""){
    check = requiredMessage("s_mg","MG를 입력해주세요.");
  }
  if(param.s_rate == ""){
    check = requiredMessage("s_rate","요율을 입력해주세요.");
  }
  if(param.s_settlement_money == ""){
    check = requiredMessage("s_settlement_money","정산매출을 입력해주세요.");
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
      $.ajax({
        url: '/sales/add',
        type: 'post',
        data : param,
        datatype : 'json',
        error:function(request,state,error){
          errorMsg();
        },
        success:function(data){
          alert('매출등록이 완료되었습니다.');
          location.reload();
        }
      });
    }
  });
});
function requiredMessage(target,msg){
  $("#"+target).siblings().children().text(msg);
  $("#"+target).addClass("form-control-danger");
  return true;
}


// // 콘텐츠코드 검색시
// $('#searchCnt').on("click",function(){
//   if($('#s_cnt_num').val() != ""){
//     var param = {
//       'search': $('#s_cnt_num').val().replace(/ /gi, "")
//     };
//     $('#search').val($('#s_cnt_num').val());
//     searchCnt(param);
//   }
//   $('#search-Modal').modal('show');
// });
// // 콘텐츠 선택시
// $(document).on('click','.btn-selected',function(){
//   var td = $(this).parents('tr').find('td').eq(0).find('.name');
//   var id = td.data('id');
//   var name = td.data('name');
//   $('#s_cnt_num').val(id);
//   $('#s_title').val(name);
//   $('#search-Modal').modal('hide');
// });
// // 콘텐츠 검색 enter시
// $('#s_cnt_num').on('keyup',function(event){
//   if(event.keyCode == 13){
//     $('#searchCnt').trigger('click');
//   };
// });
// // 콘텐츠 모달 검색 enter시
// $('#search').on('keyup',function(event){
//   if(event.keyCode == 13){
//     $('#btn-search').trigger('click');
//   };
// });
// // 콘텐츠 검색 버튼 클릭시
// $('#btn-search').on('click',function(){
//   if($('#search').val() == ""){
//     console.log('검색어를 넣어주세요.');
//     return false;
//   }
//   var param = {
//     'search': $('#search').val().replace(/ /gi, "")
//   };
//   searchCnt(param);
// });
// // 컨텐츠 검색 ajax
// function searchCnt(param){
//     $.ajax({
//       url: '/sales/add/search',
//       type: 'post',
//       data : param,
//       datatype : 'json',
//       error:function(request,status,error){
//         console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
//         swal("ERROR!", '새로고침 후 다시 시도해주세요.', "error");
//       },
//       success:function(data){
//         if(data.status != true){
//           swal("ERROR!", '새로고침 후 다시 시도해주세요.', "error");
//           return false;
//         }
//         if(data.count!=0){
//           $("#search-Modal tbody tr").remove();
//           data.list.forEach(function(item){
//             var html = '<tr>\
//             <td style="vertical-align: middle;">\
//             <div class="name" data-id = "'+item.cnt_id+'" data-name = "'+item.cnt_title+'">'+item.cnt_id+' / '+item.cnt_title+'</div>\
//             </td>\
//             <td><button type="submit" class="btn-selected btn btn-primary m-b-0">선택</button></td>\
//             </tr>';
//             $("#search-Modal tbody").append(html);
//           });
//         }
//       }
//     });
//   }
