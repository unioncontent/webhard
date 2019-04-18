// 뒤로가기
$(document).on('click','#cntSeriesDetailPage .btn-after',function(){
  $('#cntSeriesDetailPage').hide();
  $('#cntPage').show();
});
// 시리즈 수정 버튼 클릭시
$(document).on('click','#cntPage .btn-series',function(event){
  var idx = $(this).data('cidx');

  $("#cntSeriesDetailPage #cntIdx_c").val(idx);
  var param = settingParams_series(1);
  ajaxGetPageList_series(param);

  $('#cntPage').hide();
  $('#cntSeriesDetailPage').show();
});
//페이지 이동
$(document).on('click','#modal-sList .page-link',function(){
  var param = settingParams_series(Number($(this).data().value));
  ajaxGetPageList_series(param);
});
// 리스트 새로고침
function reloadPage_series(){
  console.log('reloadPage_series');
  var pageValue = ($.urlParam("page") == '' || $.urlParam("page") == null) ? 1 : parseInt($.urlParam("page"));
  var param = settingParams_series(pageValue);
  ajaxGetPageList_series(param);
}

// 리스트 조건 param 세팅
function settingParams_series(num){
  var param = {
    page : num,
    cIdx : $("#cntSeriesDetailPage #cntIdx_c").val()
  };
  //검색
  // var searchValue = $('#contents-setting #searchInput').val();
  // if(searchValue != ''){
  //   param.searchType = $('#contents-setting #selectSearchType option:selected').val();
  //   param.search = searchValue;
  // }
  return param;
}

// 시리즈 키워드 리스트 재로드
function ajaxGetPageList_series(param){
  $.ajax({
    url: '/cnts/series/getList',
    type: 'post',
    data : param,
    error:function(request,status,error){
      errorMSG();
    },
    success:function(data){
      console.log('ajaxGetPageList_series:',data);
      $("#cntSeriesDetailPage #modal-sList tbody tr").not("#inputKey").remove();
      data.result.list.forEach(function(item, idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        var html = '<tr><th scope="row" class="centerTh">'+numIdx+'</th>';
        html += '<td>'+item.cnt_s_chk1+'</td>';
        html += '<td>'+item.cnt_s_chk2+'</td>';
        html += '<td>'+item.cnt_s_chk3+'</td>';
        html += '<td><button class="remove-series btn btn-danger btn-sm" data-idx="'+item.n_idx+'"><i class="fas fa-minus" style="margin-right:0"></i></button></td></tr>';
        $("#cntSeriesDetailPage #modal-sList").append(html);
      });
      var limit = 10;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $("#cntSeriesDetailPage #modal-sList tfoot").empty();
      if(pageCount > 1) {
        var html = '<tr><td colspan="5"><ul class="pagination float-right">';
        var pageSize = 5;
        var currentPage = data.result.page;
        var pRCnt = parseInt(currentPage / pageSize);
        if(currentPage % pageSize == 0){
          pRCnt = parseInt(currentPage / pageSize) - 1;
        }
        if(currentPage > 5) {
          html += '<li class="page-item"><a class="page-link" data-value="1" aria-label="Previous">\
              <i class="ti-angle-double-left f-12"></i>\
              <span aria-hidden="true"></span>\
              <span class="sr-only">Previous</span>\
            </a></li>\
            <li class="page-item"><a class="page-link" data-value=\"'+(pRCnt * pageSize)+'"\ aria-label="Previous">\
              <i class="ti-angle-left f-12"></i>\
              <span aria-hidden="true"></span>\
              <span class="sr-only">Previous</span>\
            </a></li>';
        }

        for(var index=pRCnt * pageSize + 1;index<(pRCnt + 1)*pageSize + 1;index++){
          var active = (currentPage == index) ? "active" : "";
          html += '<li class=\"'+active+' page-item">\
            <a class="page-link" data-value=\"'+index+'"\ >'+index+'</a></li>'

          if(index == pageCount) {
            break;
          }
        }
        if((pRCnt + 1) * pageSize < pageCount) {
          html += '<li class="page-item">\
                <a class="page-link" data-value=\"'+((pRCnt + 1)*pageSize+1)+'"\ aria-label="Next">\
                  <i class="ti-angle-right f-12"></i>\
                  <span aria-hidden="true"></span>\
                  <span class="sr-only">Next</span>\
                </a></li>\
                <li class="page-item">\
                <a class="page-link" data-value=\"'+pageCount+'"\ aria-label="Next">\
                  <i class="ti-angle-double-right f-12"></i>\
                  <span aria-hidden="true"></span>\
                  <span class="sr-only">Next</span>\
                </a></li>';
        }
        html += '</ul></td></tr>';
        $("#cntSeriesDetailPage #modal-sList tfoot").append(html);
      }
    }
  });
}

// 시리즈 키워드 추가
$("#cntSeriesDetailPage #insertKeywordBtn").on("click",function(){
  var param = {
    'cnt_L_idx': $("#cntSeriesDetailPage #cntIdx_c").val(),
    'cnt_s_chk1':$('#cntSeriesDetailPage #chk1').val(),
    'cnt_s_chk2':$('#cntSeriesDetailPage #chk2').val(),
    'cnt_s_chk3':$('#cntSeriesDetailPage #chk3').val(),
  };

  $.ajax({
    url: '/cnts/series/insert',
    type: 'post',
    data: param,
    error:function(request,status,error){
      errorMSG();
    },
    success:function(data){
      if(data){
        console.log(data);
        alert("추가되었습니다.");
        $('#cntSeriesDetailPage #chk1').val("");
        $('#cntSeriesDetailPage #chk2').val("");
        $('#cntSeriesDetailPage #chk3').val("");
        reloadPage_series(param.idx);
      }
    }
  });
});

// 시리즈 삭제 버튼 클릭시
$(document).on("click","#cntSeriesDetailPage .remove-series",function(){
  var idx = $(this).data('idx');
  $.ajax({
    url: '/cnts/series/delete',
    type: 'post',
    data: {idx: idx},
    error:function(request,status,error){
      errorMSG();
    },
    success:function(data){
      reloadPage_series($("#cntSeriesDetailPage #cntIdx_c").val());
    }
  });
});
