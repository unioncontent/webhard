var className = $(location).attr('pathname').replace("/","").split("/")[0];
if(className == ""){
  className = "dashBoard";
}
else if(className == "keyword"){
  className = "contents";
}
$("ul.pcoded-item li."+className).addClass('active pcoded-trigger');
// 모달 열기
$('.btn-c-search').on('click',function(){
  $('#cSearch-Modal input').val('');
  $('#cSearch-Modal #list-card').hide();
  $('#cSearch-Modal #default-card').show();
  $('#cSearch-Modal').modal('show');
});
$('.btn-c2-search').on('click',function(){
  $('#reportrange-cm').daterangepicker(optionSet_cm1,cb_cm);
  $('#calculate-Modal #reportrange-cm span').html(moment(defaultSDate_cm).format('YYYY.MM.DD') + ' - ' + moment(new Date()).format('YYYY.MM.DD'));
  $('#calculate-Modal input[type=text]').val('');
  $('#calculate-Modal #f-page #selectSearchType-cm option:eq(0)').prop("selected", true);
  $('#calculate-Modal #f-page #calListTable tbody,#calculate-Modal #f-page #calListTable tfoot').empty();
  $('#calculate-Modal #d-page').hide();
  $('#calculate-Modal #a-page').hide();
  $('#calculate-Modal #f-page').show();
  searchFun_cm();
  $('#calculate-Modal').modal('show');
});
// $('#calculate-Modal #f-page .btn-view-cm').on('click',function(){
//   searchFun_cm();
// });
// 엑셀 뽑기
$('#cSearch-Modal .btn-excel-cm').on('click',function(){
  if($('#cSearch-Modal #listTable-cm td').length == 0){
    alert('데이터가 없습니다.');
    return false;
  }
  swal({
    title: "엑셀출력하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      var param = {
        searchType : $('#cSearch-Modal #selectSearchType-cm option:selected').val(),
        search : $('#cSearch-Modal #searchInput-cm').val(),
        excel:true
      };

      location.href = 'http://61.82.113.197:3000/cnts/cResultExcel'+encodeQueryString(param);
    }
  });
});
$('#calculate-Modal .btn-excel-cm1').on('click',function(){
  if($('#calculate-Modal #calListTable td').length == 0){
    alert('데이터가 없습니다.');
    return false;
  }
  swal({
    title: "엑셀출력하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      var param = settingParams_cm(1);
      param.excel = true;

      location.href = window.location.href+'calculate/excel'+encodeQueryString(param);
    }
  });
});

$('#calculate-Modal .btn-excel-cm2').on('click',function(){
  if($('#calculate-Modal #calDetailTable td').length == 0){
    alert('데이터가 없습니다.');
    return false;
  }
  swal({
    title: "엑셀출력하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      var param = settingParams_cm(1);
      param.excel = true;
      param.mode = true;
      param.id = $('#d-page .modal-header').data('id');

      location.href = window.location.href+'calculate/excel2'+encodeQueryString(param);
    }
  });
});
/* 저작권 검색 모달부분 */
function encodeQueryString(params) {
    const keys = Object.keys(params)
    return keys.length
        ? "?" + keys
            .map(key => encodeURIComponent(key)
                + "=" + encodeURIComponent(params[key]))
            .join("&")
        : ""
}

// 모달 검색
$('#cSearch-Modal #searchInput-cm').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#cSearch-Modal #searchBtn-cm').trigger('click');
  };
});
$('#cSearch-Modal #searchBtn-cm').on('click',function(){
  var param = {
    page : 1
  };
  var searchValue = $('#cSearch-Modal #searchInput-cm').val();
  if(searchValue != ''){
    param.searchType = $('#cSearch-Modal #selectSearchType-cm option:selected').val();
    param.search = searchValue;
    ajaxCntList(param);
  } else{
    $('#cSearch-Modal #list-card').hide();
    $('#cSearch-Modal .cm-num #cm-osp-num').text(0);
    $('#cSearch-Modal .cm-num #cm-num').text(0);
    $('#cSearch-Modal #listTable-cm tbody').empty();
    $('#cSearch-Modal #listTable-cm tfoot').empty();
    $('#cSearch-Modal #default-card').show();
  }
});

//페이지 이동
$(document).on('click','#calculate-Modal #d-page .cm-page-link',function(){
  var param = {
    page : Number($(this).data().value)
  };
  var searchValue = $('#cSearch-Modal #searchInput-cm').val();
  if(searchValue != ''){
    param.searchType = $('#cSearch-Modal #selectSearchType-cm option:selected').val();
    param.search = searchValue;
  }
  ajaxCntList(param);
});
function ajaxCntList(param){
  $('#cSearch-Modal .preloader3-cm').show();
  $('#cSearch-Modal #default-card').hide();
  $('#cSearch-Modal #list-card').show();
  $.ajax({
    url: '/cnts/getModalPage',
    type: 'post',
    data: param,
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log(data);
      if(data.status != true){
        errorMSG();
        return false;
      }
      $('#cSearch-Modal #cm-osp-num').text(data.result.osp);
      $('#cSearch-Modal #cm-num').text(data.result.listCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      $('#cSearch-Modal #listTable-cm tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        var html = '<tr><th>'+numIdx+'</th>\
        <td>'+item['cnt_osp']+'</td>\
        <td><a target="_blank" href="'+item['cnt_url']+'"><div class="title_nobr_cm">'+item['cnt_title']+'</div></a></td>\
        <td>'+item['date_str']+'</td></tr>';
        $('#cSearch-Modal #listTable-cm tbody').append(html);
      });
      var limit = 10;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#cSearch-Modal #listTable-cm tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr class="footable-paging"><td colspan="4"><ul class="pagination">';
        var pageSize = 5;
        var currentPage = data.result.page;
        var pRCnt = parseInt(currentPage / pageSize);
        if(currentPage % pageSize == 0){
          pRCnt = parseInt(currentPage / pageSize) - 1;
        }
        if(currentPage > 5) {
          html += '<li class="page-item"><a class="page-link cm-page-link" data-value="1" aria-label="Previous">\
          <i class="ti-angle-double-left f-12"></i>\
          <span aria-hidden="true"></span>\
          <span class="sr-only">Previous</span>\
        </a></li>\
        <li class="page-item"><a class="page-link cm-page-link" data-value=\"'+(pRCnt * pageSize)+'"\ aria-label="Previous">\
          <i class="ti-angle-left f-12"></i>\
          <span aria-hidden="true"></span>\
          <span class="sr-only">Previous</span>\
        </a></li>';
      }

      for(var index=pRCnt * pageSize + 1;index<(pRCnt + 1)*pageSize + 1;index++){
        var active = (currentPage == index) ? "active" : "";
        html += '<li class=\"'+active+' page-item">\
        <a class="page-link cm-page-link" data-value=\"'+index+'"\ >'+index+'</a></li>'

        if(index == pageCount) {
          break;
        }
      }
      if((pRCnt + 1) * pageSize < pageCount) {
        html += '<li class="page-item">\
        <a class="page-link cm-page-link" data-value=\"'+((pRCnt + 1)*pageSize+1)+'"\ aria-label="Next">\
          <i class="ti-angle-right f-12"></i>\
          <span aria-hidden="true"></span>\
          <span class="sr-only">Next</span>\
        </a></li>\
        <li class="page-item">\
          <a class="page-link cm-page-link" data-value=\"'+pageCount+'"\ aria-label="Next">\
            <i class="ti-angle-double-right f-12"></i>\
            <span aria-hidden="true"></span>\
            <span class="sr-only">Next</span>\
          </a></li>';
        }
        html += '</ul></td></tr>';
        $('#cSearch-Modal #listTable-cm tfoot').append(html);
      }
      $('#cSearch-Modal .preloader3-cm').fadeOut(500);
    }
  });
}

/* 설정모달 */
// 삭제
$(document).on('click','#calculate-Modal #a-page .btn-deletecm',function(){
  var param = {n_idx:$(this).data('idx')};
  swal({
    title: "삭제하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      $.ajax({
        url: '/calculate/delete',
        type: 'post',
        data : param,
        datatype : 'json',
        error:function(request,state,error){
          errorMsg();
        },
        success:function(data){
          alert('삭제되었습니다');
          reloadPage('a-page');
        }
      });
    }
  });
});
// 등록
$(document).on('click','#calculate-Modal #a-page #insertBtn-accOSP',function(){
  var check=false;
  var param = {
    ACC_Cnt_ID:$('#a-page #searchCntInput-cm-id').val(),
    ACC_Osp_ID:$('#a-page #selectOSP-cm option:selected').val(),
    ACC_Keyword:$('#a-page #searchCntInput-cm').val(),
    ACC_User_ID:$('#a-page #ACC_User_ID').val(),
    ACC_User_PW:$('#a-page #ACC_User_PW').val(),
    ACC_State:$("#a-page input:radio[name='ACC_State']:checked").val()
  };
  // 필수
  if(param.ACC_Cnt_ID == ""){
    alert("콘텐츠를 다시 선택해주세요.");
    return false;
  }
  if(param.ACC_Osp_ID == ""){
    alert("웹하드를 선택해주세요.");
    return false;
  }
  if(param.ACC_Keyword == ""){
    alert("콘텐츠를 다시 검색해주세요.");
    return false;
  }
  if(param.ACC_User_ID == ""){
    alert("아이디을 입력해주세요.");
    return false;
  }
  if(param.ACC_User_PW == ""){
    alert("비밀번호를 입력해주세요.");
    return false;
  }
  if(param.ACC_State == ""){
    alert("설정을 선택해주세요.");
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
        url: '/calculate/add/osp',
        type: 'post',
        data : param,
        datatype : 'json',
        error:function(request,state,error){
          errorMsg();
        },
        success:function(data){
          alert('등록되었습니다');
          reloadPage('a-page');
          $("#calculate-Modal #a-page #selectOSP-cm option:eq(0)").prop("selected", true);
          $("#calculate-Modal #a-page input[type=text]").val('');
          $("#calculate-Modal #a-page input[type=radio]").prop("checked", false);
        }
      });
    }
  });
});
//페이지 이동
$(document).on('click','#calculate-Modal #a-page .cm-page-link',function(){
  var param = {
    page :Number($(this).data().value)
  };
  $('#calculate-Modal #a-page #selectOSP-cm option:eq(0)').prop("selected", true);
  ajaxGetOSPPageList(param);
});
// 페이지 ajax
function ajaxGetOSPPageList(param){
  console.log('ajaxGetOSPPageList:',param);
  $('#ospListTable .preloader3').show();
  $.ajax({
    url: '/calculate/getOSPNextPage',
    type: 'post',
    data: param,
    error: function(request,status,error){
      console.log(request,status,error);
      // errorMSG();
    },
    success: function(data){
      console.log(data);
      if(data.status != true){
        errorMSG();
        return false;
      }

      if($('#calculate-Modal #a-page #selectOSP-cm option').length == 1){
        for(var i=0; i < data.result.ospList.length; i++) {
          $('#calculate-Modal #a-page #selectOSP-cm').append('<option value="'+data.result.ospList[i].osp_id+'">'+data.result.ospList[i].osp_sname+'</option>');
        };
      }

      $('#ospListTable tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        var html = '<tr>\
        <td>'+numIdx+'</td>\
        <td>'+((item.osp_sname == null)? ((item.ACC_OSP_ID == 'fileis')?'파일이즈':item.ACC_OSP_ID):item.osp_sname)+'</td>\
        <td><div class="cnt-title-cm">'+item.ACC_Keyword+'</div></td>\
        <td>'+item.total+'</td>\
        <td>'+((item.ACC_State == '0')?'<span class="text-red">중지</span>':'<span class="text-green">● 등록</span>')+'</td>\
        <td><button class="btn-deletecm btn btn-danger m-b-0" data-idx="'+item.ACC_No+'" type="button"><i class="far fa-trash-alt"></i></button></td></tr>';
        $('#ospListTable tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#ospListTable tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr class="footable-paging"><td colspan="12"><ul class="pagination">';
        var pageSize = 5;
        var currentPage = data.result.page;
        var pRCnt = parseInt(currentPage / pageSize);
        if(currentPage % pageSize == 0){
          pRCnt = parseInt(currentPage / pageSize) - 1;
        }
        if(currentPage > 5) {
          html += '<li class="page-item"><a class="page-link cm-page-link" data-value="1" aria-label="Previous">\
              <i class="ti-angle-double-left f-12"></i>\
              <span aria-hidden="true"></span>\
              <span class="sr-only">Previous</span>\
            </a></li>\
            <li class="page-item"><a class="page-link cm-page-link" data-value=\"'+(pRCnt * pageSize)+'"\ aria-label="Previous">\
              <i class="ti-angle-left f-12"></i>\
              <span aria-hidden="true"></span>\
              <span class="sr-only">Previous</span>\
            </a></li>';
        }

        for(var index=pRCnt * pageSize + 1;index<(pRCnt + 1)*pageSize + 1;index++){
          var active = (currentPage == index) ? "active" : "";
          html += '<li class=\"'+active+' page-item">\
            <a class="page-link cm-page-link" data-value=\"'+index+'"\ >'+index+'</a></li>'

          if(index == pageCount) {
            break;
          }
        }
        if((pRCnt + 1) * pageSize < pageCount) {
          html += '<li class="page-item">\
                <a class="page-link cm-page-link" data-value=\"'+((pRCnt + 1)*pageSize+1)+'"\ aria-label="Next">\
                  <i class="ti-angle-right f-12"></i>\
                  <span aria-hidden="true"></span>\
                  <span class="sr-only">Next</span>\
                </a></li>\
                <li class="page-item">\
                <a class="page-link cm-page-link" data-value=\"'+pageCount+'"\ aria-label="Next">\
                  <i class="ti-angle-double-right f-12"></i>\
                  <span aria-hidden="true"></span>\
                  <span class="sr-only">Next</span>\
                </a></li>';
        }
        html += '</ul></td></tr>';
        $('#listTable3 tfoot').append(html);
      }
      $('#ospListTable .preloader3').fadeOut(500);
    }
  });
}
/* 정산검증 모달부분 */
// 등록
$(document).on('click','#calculate-Modal #f-page #insertBtn-f',function(){
  var check=false;
  var param = {
    ACC_OSP_ID:$('#f-page #selectSearchType-cm option:selected').val(),
    ACC_Cnt_Num:$('#f-page #searchInput-cm').val(),
    ACC_User_ID:$('#f-page #searchIDInput-cm').val()
  };
  // 필수
  if(param.ACC_OSP_ID == ""){
    alert("OSP사를 다시 선택해주세요.");
    return false;
  }
  if(param.ACC_Cnt_Num == ""){
    alert("게시물번호를 작성해주세요.");
    return false;
  }
  if(param.ACC_Keyword == ""){
    alert("구매자ID를 작성해주세요.");
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
        url: '/calculate/add',
        type: 'post',
        data : param,
        datatype : 'json',
        error:function(request,state,error){
          errorMsg();
        },
        success:function(data){
          alert('등록되었습니다.');
          reloadPage('f-page');
          $('#calculate-Modal #f-page input[type=text]').val('');
          $('#calculate-Modal #f-page #selectSearchType-cm option:eq(0)').prop("selected", true);
        }
      });
    }
  });
});
$(document).on('click','#calculate-Modal #f-page .cnt-title-cm',function(){
  $('#calculate-Modal #f-page').hide();
  $('#calculate-Modal #d-page #calDetailTable tbody,#calculate-Modal #d-page #calDetailTable tfoot').empty();
  var param = settingParams_cm(1);
  param.mode = true;
  param.id = $(this).data('id');
  console.log($(this).data());
  $('#calculate-Modal #d-page .modal-title').text(($(this).data('osp') == 'null')?'파일이즈':$(this).data('osp'));
  $('#calculate-Modal #d-page .modal-title').data('id',param.id);
  $('#calculate-Modal #d-page #cm-table-chart td').eq(0).text($(this).data('buy'));
  $('#calculate-Modal #d-page #cm-table-chart td').eq(1).text($(this).data('bill'));
  $('#calculate-Modal #d-page #cm-table-chart td').eq(2).text($(this).data('num')+'%');
  $('#calculate-Modal #d-page #cm-date').text(param.sDate.replace(/-/gi,'.')+' ~ '+param.eDate.replace(/-/gi,'.'));
  ajaxGetCalculatePageList('#calDetailTable',param);
  $('#calculate-Modal #d-page').show();
});
$(document).on('click','#calculate-Modal .btn-setting-cm',function(){
  $('#calculate-Modal #f-page').hide();
  $("#calculate-Modal #a-page #selectOSP-cm option:eq(0)").prop("selected", true);
  $("#calculate-Modal #a-page input[type=text]").val('');
  $("#calculate-Modal #a-page input[type=radio]").prop("checked", false);
  $('#calculate-Modal #a-page').show();
  var param = {
    page : 1
  };
  ajaxGetOSPPageList(param);
});
$(document).on('hide.bs.modal','#contentsSearch', function () {
  $('body').addClass('modal-open');
});
// 뒤로가기
$(document).on('click','#calculate-Modal #d-page .btn-after',function(){
  $('#calculate-Modal #d-page').hide();
  $('#calculate-Modal #f-page').show();
});
$(document).on('click','#calculate-Modal #a-page .btn-after',function(){
  $('#calculate-Modal #a-page').hide();
  $('#calculate-Modal #f-page').show();
});

function searchFun_cm(){
  var param = settingParams_cm(1);
  ajaxGetCalculatePageList('#calListTable',param);
}

// 리스트 조건 param 세팅
function settingParams_cm(num){
  var param = {};
  if(Number.isInteger(num)){
    param.page = num;
  }
  //날짜검색
  var dateArr = $("#reportrange-cm span").text().split(' - ');
  if(dateArr.length > 1){
    var start = moment(new Date(dateArr[0]));
    var end = moment(new Date(dateArr[1]));
    param.sDate = start.format('YYYY-MM-DD');
    param.eDate = end.format('YYYY-MM-DD');
  }
  return param;
}
$(document).on('click','#cSearch-Modal .cm-page-link',function(){
  // var param = settingModalParams(Number($(this).data().value));
  // ajaxGetMPageList(param);
  var param = {
   page : Number($(this).data().value)
 };
 var searchValue = $('#cSearch-Modal #searchInput-cm').val();
 if(searchValue != ''){
   param.searchType = $('#cSearch-Modal #selectSearchType-cm option:selected').val();
   param.search = searchValue;
   ajaxCntList(param);
 }
});
// 페이지 ajax
function ajaxGetCalculatePageList(tag,param){
  console.log('ajaxGetCalculatePageList:',param);
  $(tag+' .preloader3').show();
  $.ajax({
    url: '/calculate/getNextPage',
    type: 'post',
    data: param,
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      console.log(data);
      if(data.status != true){
        errorMSG();
        return false;
      }
      if($('#calculate-Modal #f-page #selectSearchType-cm option').length < 2){
        for(var i=0; i < data.result.ospList.length; i++) {
          $('#calculate-Modal #f-page #selectSearchType-cm').append('<option value="'+data.result.ospList[i].osp_id+'">'+data.result.ospList[i].osp_sname+'</option>');
        }
      }

      $(tag+' tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        if('mode' in param){
          var html = '<tr>\
            <td>'+numIdx+'</td>\
            <td>'+((item.osp_sname == null)? ((item.ACC_OSP_ID == 'fileis')?'파일이즈':item.ACC_OSP_ID):item.osp_sname)+'</td>\
            <td>'+item.ACC_Cnt_Num+'</td>\
            <td><div class="cnt-title-cm">'+item.ACC_Cnt_Title+'</div></td>\
            <td>'+item.ACC_pay+'</td>\
            <td>'+item.ACC_Buy_Date_str+'</td>\
            <td>'+item.ACC_Admin_Date_str+'</td>\
            <td>'+((item.ACC_Admin_State == '0')?'<span class="text-red">없음</span>':'<span class="text-green">● 정상</span>')+'</td>\
          </tr>';
        }
        else{
          var perNum = Math.round(item.billCount / item.buyCount * 100);
          var html = '<tr>\
          <td>'+numIdx+'</td>\
          <td>'+((item.osp_sname == null)? ((item.ACC_OSP_ID == 'fileis')?'파일이즈':item.ACC_OSP_ID):item.osp_sname)+'</td>\
          <td><div class="cnt-title-cm" data-buy="'+item.buyCount+'" data-bill="'+item.billCount+'" data-num="'+perNum+'" data-osp="'+item.osp_sname+'" data-id="'+item.ACC_User_ID+'">'+item.ACC_Keyword+'</div></td>\
          <td>'+item.ACC_pay+'</td>\
          <td>'+item.buyCount+'/'+item.billCount+'</td>\
          <td>'+perNum+'%</td></tr>';
        }
        $(tag+' tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $(tag+' tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr class="footable-paging"><td colspan="12"><ul class="pagination">';
        var pageSize = 5;
        var currentPage = data.result.page;
        var pRCnt = parseInt(currentPage / pageSize);
        if(currentPage % pageSize == 0){
          pRCnt = parseInt(currentPage / pageSize) - 1;
        }
        if(currentPage > 5) {
          html += '<li class="page-item"><a class="page-link cm-page-link" data-value="1" aria-label="Previous">\
              <i class="ti-angle-double-left f-12"></i>\
              <span aria-hidden="true"></span>\
              <span class="sr-only">Previous</span>\
            </a></li>\
            <li class="page-item"><a class="page-link cm-page-link" data-value=\"'+(pRCnt * pageSize)+'"\ aria-label="Previous">\
              <i class="ti-angle-left f-12"></i>\
              <span aria-hidden="true"></span>\
              <span class="sr-only">Previous</span>\
            </a></li>';
        }

        for(var index=pRCnt * pageSize + 1;index<(pRCnt + 1)*pageSize + 1;index++){
          var active = (currentPage == index) ? "active" : "";
          html += '<li class=\"'+active+' page-item">\
            <a class="page-link cm-page-link" data-value=\"'+index+'"\ >'+index+'</a></li>'

          if(index == pageCount) {
            break;
          }
        }
        if((pRCnt + 1) * pageSize < pageCount) {
          html += '<li class="page-item">\
                <a class="page-link cm-page-link" data-value=\"'+((pRCnt + 1)*pageSize+1)+'"\ aria-label="Next">\
                  <i class="ti-angle-right f-12"></i>\
                  <span aria-hidden="true"></span>\
                  <span class="sr-only">Next</span>\
                </a></li>\
                <li class="page-item">\
                <a class="page-link cm-page-link" data-value=\"'+pageCount+'"\ aria-label="Next">\
                  <i class="ti-angle-double-right f-12"></i>\
                  <span aria-hidden="true"></span>\
                  <span class="sr-only">Next</span>\
                </a></li>';
        }
        html += '</ul></td></tr>';
        $('#listTable3 tfoot').append(html);
      }
      $(tag+' .preloader3').fadeOut(500);
    }
  });
}

//날짜 선택 시
$(document).on('click','#calculate-Modal .applyBtn',searchFun_cm);
//날짜 설정
var cb_cm = function(start, end, label) {
  console.log('FUNC: cb_cm',start.toISOString(), end.toISOString(), label);
  $('#calculate-Modal #reportrange-cm span').html(moment(new Date(start.toISOString())).format('YYYY.MM.DD') + ' - ' + moment(new Date(end.toISOString())).format('YYYY.MM.DD'));
  searchFun_cm();
}
var defaultSDate_cm = new Date();
defaultSDate_cm.setMonth(defaultSDate_cm.getMonth()-1);
var ranges = {
  '당일': [moment(), moment()],
  '전일': [moment().subtract(1, 'days'), moment()],
  '최근 7일': [moment().subtract(6, 'days'), moment()],
  '최근 30일': [moment().subtract(29, 'days'), moment()]
};
var optionSet_cm1 = {
  startDate: moment(defaultSDate_cm),
  endDate:  moment(),
  showDropdowns: true,
  showRangeInputsOnCustomRangeOnly: false,
  ranges: ranges,
  opens: 'left',
  buttonClasses: ['btn'],
  applyClass: 'btn-small btn-primary',
  cancelClass: 'btn-small',
  format: 'YYYY.MM.DD',
  separator: ' to ',
  locale: {
    applyLabel: '확인',
    cancelLabel: '취소',
    customRangeLabel: '직접선택',
    daysOfWeek: ['일', '월', '화', '수', '목', '금', '토'],
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    firstDay: 1
  }
};

/*  콘텐츠 검색 */
// 콘텐츠코드 검색시
$('#searchCnt-cm').on("click",function(){
  if($('#searchCntInput-cm').val() != ""){
    var param = {
      'search': $('#searchCntInput-cm').val().replace(/ /gi, "")
    };
    $('#search-input-cm').val($('#searchCntInput-cm').val());
    searchCntCM(param);
  }
  $('#contentsSearch').modal('show');
});
// 콘텐츠 검색 닫힐때
$('#contentsSearch').on('hidden.bs.modal', function () {
  if($('#webhard-Modal').css('display') == 'block'){
    setTimeout(function() {
      $('body').addClass('modal-open');
    }, 500);
  }
});
// 콘텐츠 선택시
$(document).on('click','.btn-selected-cm',function(){
  var td = $(this).parents('tr').find('td').eq(0).find('.name');
  var id = td.data('id');
  var name = td.data('name');
  $('#searchCntInput-cm').val(name);
  $('#searchCntInput-cm-id').val(id);
  $('#contentsSearch').modal('hide');
});
// 콘텐츠 검색 enter시
$('#searchCntInput-cm').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#searchCnt-cm').trigger('click');
  };
});
// 콘텐츠 모달 검색 enter시
$('#search-input-cm').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#search-btn-cm').trigger('click');
  };
});
// 콘텐츠 검색 버튼 클릭시
$('#search-btn-cm').on('click',function(){
  if($('#search-input-cm').val() == ""){
    console.log('검색어를 넣어주세요.');
    return false;
  }
  var param = {
    'search': $('#search-input-cm').val().replace(/ /gi, "")
  };
  searchCntCM(param);
});
// 컨텐츠 검색 ajax
function searchCntCM(param){
  $.ajax({
    url: '/calculate/add/search',
    type: 'post',
    data : param,
    datatype : 'json',
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      swal("ERROR!", '새로고침 후 다시 시도해주세요.', "error");
    },
    success:function(data){
      if(data.status != true){
        swal("ERROR!", '새로고침 후 다시 시도해주세요.', "error");
        return false;
      }
      if(data.count!=0){
        $("#contentsSearch #contents-list tbody tr").remove();
        data.list.forEach(function(item){
          var html = '<tr>\
          <td>\
          <div class="name" data-id = "'+item.cnt_id+'" data-name = "'+item.cnt_title+'">'+item.cnt_id+' / '+item.cnt_title+'</div>\
          </td>\
          <td><button type="button" class="btn btn-primary f-right btn-selected-cm">선택</button></td>\
          </tr>';
          $("#contentsSearch #contents-list tbody").append(html);
        });
      }
    }
  });
}
function reloadPage(tag){
  console.log('reloadPage');
  if(tag == 'f-page'){
    searchFun_cm();
  }else if(tag == 'a-page'){
    ajaxGetOSPPageList({page:1});
  }

}
