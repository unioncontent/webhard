var modalInputEle = {
  cnt_cp:$("#cnt_cp"),
  cnt_mcp:$("#cnt_mcp"),
  osp_sname:$("#osp_sname"),
  title:$("#title"),
  cnt_num:$("#cnt_num"),
  cnt_price:$("#cnt_price"),
  cnt_writer:$("#cnt_writer"),
  k_title:$("#k_title"),
  cnt_title:$("#cnt_title"),
  cnt_url:$("#cnt_url"),
  cnt_vol:$("#cnt_vol"),
  cnt_fname:$("#cnt_fname"),
  cnt_regdate:$("#cnt_regdate"),
  go_regdate:$("#go_regdate"),
  cnt_img_name:$("#cnt_img_name")
};
$(document).ready(function(){
  // contextMenu
  $.contextMenu({
    selector: '.context-menu-one',
    callback: function(key, options) {
      contextMenu(key,$(this).data());
    },
    items: {
      "cut": {name: "해당 이미지 다시 채증"},
      "all": {name: "전체 이미지 다시 채증"}
      }
    });
  // 이미지 확대
  lightbox.option({
    'resizeDuration': 200,
    'wrapAround': true
  });

  startSetting_m();

  var z_result = $.urlParam('z-result');
  if(z_result == 'false'){
    swal("ERROR!", "다운로드 할 이미지가 없습니다.", "error");
    settingModalParams(1);
  }
  else if(z_result == 'zipError'){
    swal("ERROR!", "다운로드에 실패했습니다.\n사이트 담당자에게 문의바랍니다.", "error");
    settingModalParams(1);
  }
});
/* 비제휴 게시물 상세보기 */
$('#list-Modal').on('hidden.bs.modal', function () {
  if($('#a-page').css('display') == 'block' || $('#webhard-Modal').css('display') == 'block'){
    setTimeout(function() {
      $('body').addClass('modal-open');
    }, 500);
  }
});
// 제목 클릭시
$(document).on('click','#list-Modal .info',function(){
  var idx = $(this).data('idx');
  var platform = $(this).data('platform');
  // modal 초기화
  $('#info-Modal p').text('');
  $('#info-Modal p').children().remove();
  $.ajax({
    url: '/monitoring/getInfo',
    type: 'post',
    data: {idx:idx,platform:platform},
    error: function(request,status,error){
      errorMSG();
    },
    success: function(data){
      for (var key in modalInputEle) {
        if(key == 'go_regdate'){ continue; }
        var tag = '<label class="label label-default">제휴</label>';
        if(key == 'cnt_num' && (data['cnt_chk_1'] == '1' || data['cnt_chk_2'] == '1' || data['cnt_chk_3'] == '1')){
          modalInputEle[key].append(tag+data[key]);
        }
        else if(key == 'title'){
          modalInputEle[key].append('<a href="'+data['cnt_url']+'" target="_blank">'+data[key]+'</a>');
        }
        else{
          modalInputEle[key].text(data[key]);
        }
      }
      var dateArr = '';
      $('#img-list').empty();
      if(data['cnt_chk_1'] == '0'){
        for (var i = 1; i < 4; i++) {
          var img_title = (data['cnt_img_'+i] == '' || data['cnt_img_'+i] == null)?'untitled.jpg':data['cnt_img_'+i].split('/');
          img_title = (img_title.length > 3) ? img_title : img_title[img_title.length-1];

          var imgHtml = '<div class="col-xs-4"><div class="articles context-menu-one" data-num="'+i+'" data-idx="'+data['cnt_num']+'" data-url="'+data['cnt_url']+'">';
          imgHtml += '<a title="'+img_title+'" data-lightbox="image-1" rel="group1" href="http://61.82.113.197:3000/monitoring_img'+((data['cnt_img_'+i] == '' || data['cnt_img_'+i] == null)?'/untitled.jpg':data['cnt_img_'+i])+'">';
          imgHtml += '<img class="img-fluid c-pointer lightbox-img" src="http://61.82.113.197:3000/monitoring_img'+((data['cnt_img_'+i] == '' || data['cnt_img_'+i] == null)?'/untitled.jpg':data['cnt_img_'+i])+'"></a>';
          var breakCheck = false;
          if(data['cnt_img_'+i] !='/untitled.jpg' && data['cnt_chk_'+i] !='2'){
            imgHtml += ((data['cnt_img_'+i] == '' || data['cnt_img_'+i] == null)?'':('<h6>'+i+'차: '+data['cnt_date_'+i]+'</h6>'))+'</div></div>';
          } else if(data['cnt_img_'+i] =='/untitled.jpg' || data['cnt_chk_'+i] =='2'){
            imgHtml += '<h6>게시물 삭제됨</h6></div></div>';
            breakCheck = true;
          }
          $('#img-list').append(imgHtml);
          if(breakCheck){
            break;
          }
        }
      }
      $('#list-Modal').modal('hide');
      $('#info-Modal').modal('show');
      setTimeout(function() {
        $('body').addClass('modal-open');
      }, 500);
    }
  });
});
// info-Modal Close
$(document).on('hide.bs.modal','#info-Modal', function () {
  $('#list-Modal').modal('show');
  setTimeout(function() {
    $('body').addClass('modal-open');
  }, 500);
});
// context-menu
function contextMenu(type,data){
  console.log('type : ', type);
  console.log('data : ', data);
  data['type'] = type;
  swal({
    title: ((type == "all") ? "전체 ":"해당")+" 이미지를 삭제하고 다시 채증할까요?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true,
  }).then(function(value) {
    console.log(value);
    if (value != null) {
      $.ajax({
        url: '/monitoring/imageCancel',
        type: 'post',
        data : data,
        datatype : 'json',
        error:function(request,status,error){
          console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
          swal("ERROR!", request.responseText, "error");
        },
        success:function(data){
          console.log(data);
          $('#info-Modal').modal('hide');
          alert('수정되었습니다.');
          reloadPage();
        }
      });
    }
    });
}

/* 비제휴 게시물 리스트 */
// 비제휴 클릭시
$(document).on('click','.natotal',function(){
  console.log($(this).data());
  if($(this).text() == '0'){
    alert('해당 콘텐츠로 검출된 비제휴 게시물이 없습니다.');
    return false;
  }

  $('#list-Modal #searchInput').val('');
  $('#list-Modal #listTable3 tbody,#list-Modal #listTable3 tfoot').empty();
  $("#list-Modal #selectOSP option:eq(0),#list-Modal #selectSearchType option:eq(0)").prop("selected", true);

  $('input[name=cnt_L_id]').val($(this).data('cid'));
  $('input[name=osp]').val($(this).data('osp'));
  $('input[name=platform]').val($(this).data('type'));

  var param = settingModalParams(1);
  ajaxGetMPageList(param);

  $('#list-Modal').modal('show');
});

// 엑셀 클릭시
$(document).on('click','#list-Modal .btn-excel',function(){
  if($('#list-Modal #listTable3 tbody td').length == 0){
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
      // var originURL = window.location.href;
      var param = settingModalParams('excel');
      console.log(param);
      // history.pushState(null, null,originURL);
      // location.href = window.location.pathname+'/excel'+encodeQueryString(param);
      location.href = 'http://61.82.113.197:3000/monitoring'+window.location.pathname+'/excel'+encodeQueryString(param);
      // console.log('http://61.82.113.197:3000/monitoring'+window.location.pathname+'/excel'+encodeQueryString(param));
      setTimeout(function() {
        $('body').addClass('modal-open');
      }, 500);
    }
  });
});

// 이미지 클릭시
$(document).on('click','#list-Modal .btn-image',function(){
  if($('#list-Modal i.fa-image').length == 0){
    alert('다운받을 이미지가 없습니다.');
    return false;
  }
  swal({
    title: "이미지 받으시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      var originURL = window.location.href;
      var param = settingModalParams('image');
      history.pushState(null, null,originURL);
      // location.href = window.location.pathname+'/image'+encodeQueryString(param);
      location.href = 'http://61.82.113.197:3000/monitoring/'+window.location.pathname+'/image'+encodeQueryString(param);
      setTimeout(function() {
        $('body').addClass('modal-open');
      }, 500);
    }
  });
});

function encodeQueryString(params) {
    const keys = Object.keys(params)
    return keys.length
        ? "?" + keys
            .map(key => encodeURIComponent(key)
                + "=" + encodeURIComponent(params[key]))
            .join("&")
        : ""
}
// osp,State선택시
$(document).on('change','#list-Modal #selectOSP',function(){
  var param = settingModalParams(1);
  ajaxGetMPageList(param);
});
$('#list-Modal input[type="checkbox"][name="search"]').on('click',function(){
  var param = settingModalParams(1);
  ajaxGetMPageList(param);
});
// 게시물삭제 버튼시
$(document).on('click','#list-Modal .btn-delete',function(){
  var idx = $(this).data('idx');
  var url = $(this).data('url');
  var pType = $('input[name=platform]').val();
  swal({
    title: "게시물 삭제 하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then((value) =>{
    if(value != null){
      $.ajax({
        url: '/monitoring/delete',
        type: 'post',
        data: {
          'idx': idx,
          'url': url,
          'pType':pType
        },
        error:function(request,status,error){
          errorMSG();
        },
        success:function(data){
          if(data){
            alert('삭제 되었습니다.');
            reloadPage();
          }
        }
      });
    }
  });
});
// 검색
$('#list-Modal #searchInput').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#searchBtn').trigger('click');
  };
});
$('#list-Modal #searchBtn').on('click',searchFun);

//페이지 이동
$(document).on('click','#listTable3 .page-link',function(){
  var param = settingModalParams(Number($(this).data().value));
  ajaxGetMPageList(param);
});
// 리스트 새로고침
function reloadPage(){
  console.log('reloadPage');
  var pageValue = ($.urlParam("page") == '' || $.urlParam("page") == null) ? 1 : parseInt($.urlParam("page"));
  var param = settingModalParams(pageValue);
  ajaxGetMPageList(param);
}
// 페이지 ajax
function ajaxGetMPageList(param){
  console.log('ajaxGetMPageList:',param);
  $('#list-Modal .preloader3').show();
  $.ajax({
    url: '/monitoring/statistics/getNextPage',
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
      if($('#selectOSP option').length == 1){
        for(var i=0; i < data.result.ospList.length; i++) {
          $('#selectOSP').append('<option value="'+data.result.ospList[i].osp_id+'">'+data.result.ospList[i].osp_sname+'</option>');
        }
      }
      $('#listTable3 tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        // <td><div class="reduction">'+item.k_title+'</div></td>\
        // <td><button type="button" class="btn btn-primary icon-btn waves-effect waves-light text-center"><i class="fas fa-download"></i></button></td>\

        var html = '<tr><th>'+numIdx+'</th>\
          <td>'+item.osp_sname+'</td>\
          <td>'+item.cnt_mcp+"/"+item.cnt_cp+'</td>\
          <td><div class="reduction">'+item.cnt_title+'</div></td>\
          <td class="info-td">';
        if(item['cnt_img_1'] != '' && item['cnt_img_1'] != null  && item['cnt_chk_1'] == '0' && item['cnt_img_1'] != '/untitled.jpg'){
          html += '<i class="fas fa-image text-muted"></i>';
        }
        html += '<div class="info" data-platform="'+param.platform+'" data-idx="'+item.n_idx+'">'+item.title+'</div></td>\
          <td>'+((item.cnt_price == null) ? '' :item.cnt_price)+'</td>\
          <td>'+((item.cnt_writer == null) ? '' :item.cnt_writer)+'</td>';
        html +='<td><div class="dateArr">';
        // if(item.go_regdate != null){
          // var arr = item.go_regdate.split(',');
          // for(var j=0; j < arr.length; j++){
          //   html +=(j+1)+' 차 : '+arr[j];
          //   if (j < (arr.length-1)){
          //     html += '<br />';
          //   }
          // }
        // }
        for(var j=1; j < 4; j++){
          if(item['cnt_img_'+j] != '' && item['cnt_img_'+j] != null && item['cnt_img_'+j] != undefined){
            if(item['cnt_img_'+j] !='/untitled.jpg' && item['cnt_chk_'+j] !='2'){
              html +=j+' 차 : '+item['cnt_date_'+j];
            } else {
              html +='게시물 삭제됨';
              break;
            }
            if (j < 3){
              html += '<br />';
            }
          }
          else if(j == 1){
            html +=j+' 차 : '+item['cnt_date_'+j];
            html += '<br />';
          }
        }
        html +='</div></td>\
          <td>채증</td>\
          <td><button type="button" data-idx="'+item.n_idx+'" data-url="'+item.cnt_url+'" class="btn-delete btn btn-danger icon-btn waves-effect waves-light text-center"><i class="far fa-trash-alt"></i></button></td>\
        </tr>';
        $('#listTable3 tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable3 tfoot').empty();
      if(pageCount > 1) {
        var html = '<tr class="footable-paging"><td colspan="12"><ul class="pagination">';
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
        $('#listTable3 tfoot').append(html);
      }
      $('#list-Modal .preloader3').fadeOut(500);
    }
  });
}
// 리스트 조건 세팅
function startSetting_m(){
  var osp = $.urlParam("osp");
  if(osp){
    $('#selectOSP > option[value='+osp+']').attr("selected",true);
  }
  var searchType = $.urlParam("searchType");
  if(searchType){
    $('#selectSearchType > option[value='+searchType+']').attr("selected",true);
  }
  var search = $.urlParam("search");
  if(search){
    $('#searchInput').val(search);
  }
  var delEle = $.urlParam("delEle");
  if(delEle){
    $("#searchBtn1").prop('checked',((delEle == 1) ? true : false));
  }
  var sDate = $.urlParam("sDate");
  var eDate = $.urlParam("eDate");
  console.log(sDate,eDate);
  $('#reportrange').daterangepicker(optionSet1,cb);
  if((sDate != '' && eDate != '') && (sDate != null && eDate != null)){
    $('#reportrange span').html(moment(new Date(sDate)).format('YYYY.MM.DD') + ' - ' + moment(new Date(eDate)).format('YYYY.MM.DD'));
  } else{
    $('#reportrange span').html(moment().subtract(2,'d').format('YYYY.MM.DD') + ' - ' + moment().format('YYYY.MM.DD'));
  }
}
// 리스트 조건 param 세팅
function settingModalParams(num){
  var param = {cnt_L_id:$('input[name=cnt_L_id]').val(),platform:$('input[name=platform]').val()};
  if(Number.isInteger(num)){
    param.page = num;
  }
  // MCP
  if($('#selectMCP option:selected').val() != undefined){
    var mcpValue = $('#selectMCP option:selected').val();
    if(mcpValue != ''){
      param.mcp = mcpValue;
    }
  } else if($('#user_class').val() == 'm'){
    param.mcp = $('#user_id').val();
  } else if($('#user_class').val() == 'c'){
    param.mcp = $('#user_mcp').val();
  }
  // CP
  if($('#selectCP option:selected').val() != undefined){
    var cpValue = $('#selectCP option:selected').val();
    if(cpValue != ''){
      param.cp = cpValue;
    }
  } else if($('#user_class').val() == 'c'){
    param.cp = $('#user_id').val();
  }
  // OSP
  if($("#selectOSP option:selected").val() != undefined){
    var ospValue = $('#selectOSP option:selected').val();
    if(ospValue != ''){
      param.osp = ospValue;
    } else if($('input[name=osp]').val() != ''
    && $('input[name=osp]').val() != null
    && $('input[name=osp]').val() != 'null'
    && $('input[name=osp]').val() != 'undefined'){
      param.osp = $('input[name=osp]').val();
    }
  }
  // 게시물삭제
  if($("#searchBtn1:checked").val() != undefined){
    var sValue = $('#searchBtn1:checked').val();
    if(sValue != ''){
      param.delEle = '1';
    }
  }
  //검색
  var searchValue = $('#searchInput').val();
  if(searchValue != ''){
    param.searchType = $('#selectSearchType option:selected').val();
    param.search = searchValue;
  }
  //날짜검색
  var dateArr = $("#reportrange span").text().split(' - ');
  if(dateArr.length > 1){
    var start = moment(new Date(dateArr[0]));
    var end = moment(new Date(dateArr[1]));
    param.sDate = start.format('YYYY-MM-DD');
    param.eDate = end.format('YYYY-MM-DD');
  }
  return param;
}
// 검색 이벤트
function searchFun(){
  var param = settingModalParams(1);
  ajaxGetMPageList(param);
}
