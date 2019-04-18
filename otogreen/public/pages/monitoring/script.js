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

  startSetting();

  var z_result = $.urlParam('z-result');
  if(z_result == 'false'){
    swal("ERROR!", "다운로드 할 이미지가 없습니다.", "error");
    settingParams(1);
  }
  else if(z_result == 'zipError'){
    swal("ERROR!", "다운로드에 실패했습니다.\n사이트 담당자에게 문의바랍니다.", "error");
    settingParams(1);
  }

  var param = settingParams(1);
  ajaxGetPageList_statistics(param);
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
// 엑셀 클릭시
$(document).on('click','.btn-excel',function(){
  swal({
    title: "엑셀출력하시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      var originURL = window.location.href;
      var param = settingParams('excel');
      console.log(param);
      history.pushState(null, null,originURL);
      // location.href = window.location.pathname+'/excel'+encodeQueryString(param);
      location.href = 'http://61.82.113.197:3000'+window.location.pathname+'/excel'+encodeQueryString(param);
    }
  });
});

// 이미지 클릭시
$(document).on('click','.btn-image',function(){
  swal({
    title: "이미지 받으시겠습니까?",
    icon: "warning",
    buttons: ["취소", true],
    dangerMode: true
  })
  .then(function(value) {
    if (value != null) {
      var originURL = window.location.href;
      var param = settingParams('image');
      history.pushState(null, null,originURL);
      // location.href = window.location.pathname+'/image'+encodeQueryString(param);
      location.href = 'http://61.82.113.197:3000'+window.location.pathname+'/image'+encodeQueryString(param);
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

// 제목 클릭시
$(document).on('click','.info',function(){
  var idx = $(this).data('idx');
  // modal 초기화
  $('#info-Modal p').text('');
  $('#info-Modal p').children().remove();
  $('#cnt_num .label-main').remove();
  $.ajax({
    url: '/monitoring/getInfo',
    type: 'post',
    data: {idx:idx},
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
      // if(data['go_regdate'] != null){
      //   dateArr = data['go_regdate'].split(',');
      // }
      // var imgArr = '';
      // if(data['cnt_img_name'] != null){
      //   imgArr = data['cnt_img_name'].split(',');
      // }

      $('#img-list').empty();
      if(data['cnt_chk_1'] == '0'){
        for (var i = 1; i < 4; i++) {
          // var dateStr = (dateArr[i-1] == undefined) ? '':dateArr[i-1];
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
      // $.each(dateArr, function( idx, date ) {
      //   var path_f = '/monitoring_img';
      //   if(imgArr[idx].indexOf('untitled') == -1){
      //     path_f += data['path'];
      //   }
      //   var imgHtml = '<div class="col-md-4"><div class="articles">\
      //   <img src="'+path_f+'/'+imgArr[idx]+'" class="img-fluid c-pointer" alt="">\
      //   <h6>'+date+'</h6></div></div>';
      //   $('#img-list').append(imgHtml);
      // });
      $('#info-Modal').modal('show');
    }
  });
});

// 모달 닫기
$(document).on('click','.modal-close',function(){
  $('#info-Modal').modal('hide');
});

// cp선택시
$(document).on('change','#selectCP',function(){
  var param = settingParams(1);
  ajaxGetPageList(param);
});
// mcp선택시
$(document).on('change','#selectMCP',function(){
  $("#selectCP").empty();
  $("#selectCP").append('<option value="">CP사선택</option>');

  var mcpValue = $("#selectMCP option:selected").val();
  var param = {};
  if(mcpValue != ''){
    param.mcp = mcpValue;
  }
  $.ajax({
    url: '/kwd/getCP',
    type: 'post',
    data : param,
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

  param = settingParams(1);
  ajaxGetPageList(param);
});
// osp,State선택시
$(document).on('change','#selectOSP,#selectState',function(){
  var param = settingParams(1);
  ajaxGetPageList(param);
});
// 게시물삭제 버튼시
$('input[type="checkbox"][name="search"]').on('click',function(){
  var param = settingParams(1);
  ajaxGetPageList(param);
});
//게시물 삭제
$(document).on('click','.btn-delete',function(){
  var idx = $(this).data('idx');
  var url = $(this).data('url');
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
          'url': url
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
//날짜 선택 시
$(document).on('click','.applyBtn,.ranges ul li:not([data-range-key=직접선택])',searchFun);
// $(document).on('click','.applyBtn',searchFun);
// 검색
$('#searchInput').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#searchBtn').trigger('click');
  };
});
$('#searchBtn').on('click',searchFun);

//페이지 이동
$(document).on('click','#listTable .page-link',function(){
  var param = settingParams(Number($(this).data().value));
  ajaxGetPageList(param);
});
// 리스트 새로고침
function reloadPage(){
  console.log('reloadPage');
  var pageValue = ($.urlParam("page") == '' || $.urlParam("page") == null) ? 1 : parseInt($.urlParam("page"));
  var param = settingParams(pageValue);
  ajaxGetPageList(param);
}
// 페이지 ajax
function ajaxGetPageList(param){
  console.log('ajaxGetPageList:',param);
  var sParam = param;
  var pType = $('#pType').val();
  $('.preloader3').show();
  $.ajax({
    url: '/monitoring/'+pType+'/getNextPage',
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
      $('#listTable tbody').empty();
      data.result.list.forEach(function(item,idx){
        var numIdx = Math.ceil(data.result.listCount-(data.result.offset+idx)).toString();
        var html = '<tr><th>'+numIdx+'</th>\
          <td>'+item.osp_sname+'</td>\
          <td>'+item.cnt_mcp+"/"+item.cnt_cp+'</td>\
          <td><div class="reduction">'+item.cnt_title+'</div></td>\
          <td><div class="reduction">'+item.k_title+'</div></td>\
          <td class="info-td">';
        if(item['cnt_img_1'] != '' && item['cnt_img_1'] != null  && item['cnt_chk_1'] == '0' && item['cnt_img_1'] != '/untitled.jpg'){
          html += '<i class="fas fa-image text-muted"></i>';
        }
        html += '<div class="info" data-idx="'+item.n_idx+'">'+item.title+'</div></td>\
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
        html +='</div></td><td><button type="button" class="btn btn-primary icon-btn waves-effect waves-light text-center"><i class="fas fa-download"></i></button></td>\
          <td>채증</td>\
          <td><button type="button" data-idx="'+item.n_idx+'" data-url="'+item.url+'" class="btn-delete btn btn-danger icon-btn waves-effect waves-light text-center"><i class="far fa-trash-alt"></i></button></td>\
        </tr>';
        $('#listTable tbody').append(html);
      });
      var limit = 20;
      var pageCount = Math.ceil(data.result.listCount/limit);
      $('#listTable tfoot').empty();
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
        $('#listTable tfoot').append(html);
      }
      $('.preloader3').fadeOut(500);
    }
  });
  sParam['gtype'] = '1';
  $.ajax({
    url: '/monitoring/'+pType+'/getNextPage',
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
      setTotalTable(data.result);
      return false;
    }
  });
}
function ajaxGetPageList_statistics(param){
  param['gtype'] = '1';
  var pType = $('#pType').val();
  $.ajax({
    url: '/monitoring/'+pType+'/getNextPage',
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
      setTotalTable(data.result);
      // PC모니터링
      $('.charts__chart').eq(1).removeClass('chart--p0').addClass('chart--p'+percentChart(data.result.statistics[0].atotal,data.result.statistics[0].total));
      $('.charts__chart').eq(2).removeClass('chart--p0').addClass('chart--p'+percentChart(data.result.statistics[1].atotal,data.result.statistics[0].total));
      $('.charts__chart').eq(3).removeClass('chart--p0').addClass('chart--p'+percentChart(data.result.statistics[1].dtotal,data.result.statistics[0].total));
      $('.charts__chart').eq(4).removeClass('chart--p0').addClass('chart--p'+percentChart(data.result.statistics[1].natotal,data.result.statistics[0].total));

      $('.percent-r').eq(3).text(percentChart(data.result.statistics[0].atotal,data.result.statistics[0].total));
      $('.percent-r').eq(2).text(percentChart(data.result.statistics[1].atotal,data.result.statistics[0].total));
      $('.percent-r').eq(1).text(percentChart(data.result.statistics[1].dtotal,data.result.statistics[0].total));
      $('.percent-r').eq(0).text(percentChart(data.result.statistics[1].natotal,data.result.statistics[0].total));

      // 모바일모니터링
      $('.charts__chart').eq(6).removeClass('chart--p0').addClass('chart--p'+percentChart(data.result.statistics[2].atotal,data.result.statistics[2].total));
      $('.charts__chart').eq(7).removeClass('chart--p0').addClass('chart--p'+percentChart(data.result.statistics[3].atotal,data.result.statistics[2].total));
      $('.charts__chart').eq(8).removeClass('chart--p0').addClass('chart--p'+percentChart(data.result.statistics[3].dtotal,data.result.statistics[2].total));
      $('.charts__chart').eq(9).removeClass('chart--p0').addClass('chart--p'+percentChart(data.result.statistics[3].natotal,data.result.statistics[2].total));

      $('.percent-r').eq(7).text(percentChart(data.result.statistics[2].atotal,data.result.statistics[2].total));
      $('.percent-r').eq(6).text(percentChart(data.result.statistics[3].atotal,data.result.statistics[2].total));
      $('.percent-r').eq(5).text(percentChart(data.result.statistics[3].dtotal,data.result.statistics[2].total));
      $('.percent-r').eq(4).text(percentChart(data.result.statistics[3].natotal,data.result.statistics[2].total));
      return false;
    }
  });
}
function percentChart(f,t){
  console.log(f,t);
  return Math.ceil(Number(f) / Number(t) * 100);
}
function setTotalTable(param){
  $("#totalTable #totalTable-td1").text(numberWithCommas(Number(param.statistics[0].total)+Number(param.statistics[2].total)));
  $("#totalTable #totalTable-p1").text(numberWithCommas(param.statistics[0].total));
  $("#totalTable #totalTable-m1").text(numberWithCommas(param.statistics[2].total));

  console.log(param.statistics[0].atotal);
  console.log(param.statistics[2].atotal);
  $("#totalTable #totalTable-td2").text(numberWithCommas(Number(param.statistics[0].atotal)+Number(param.statistics[2].atotal)));
  $("#totalTable #totalTable-p2").text(numberWithCommas(param.statistics[0].atotal));
  $("#totalTable #totalTable-m2").text(numberWithCommas(param.statistics[2].atotal));

  $("#totalTable #totalTable-td3").text(numberWithCommas(Number(param.statistics[0].natotal)+Number(param.statistics[2].natotal)));
  $("#totalTable #totalTable-p3").text(numberWithCommas(param.statistics[0].natotal));
  $("#totalTable #totalTable-m3").text(numberWithCommas(param.statistics[2].natotal));

  $("#totalTable #totalTable-td4").text(numberWithCommas(Number(param.statistics[1].atotal)+Number(param.statistics[3].atotal)));
  $("#totalTable #totalTable-p4").text(numberWithCommas(param.statistics[1].atotal));
  $("#totalTable #totalTable-m4").text(numberWithCommas(param.statistics[3].atotal));

  $("#totalTable #totalTable-td5").text(numberWithCommas(Number(param.statistics[1].dtotal)+Number(param.statistics[3].dtotal)));
  $("#totalTable #totalTable-p5").text(numberWithCommas(param.statistics[1].dtotal));
  $("#totalTable #totalTable-m5").text(numberWithCommas(param.statistics[3].dtotal));

  $("#totalTable #totalTable-td6").text(numberWithCommas(Number(param.statistics[1].natotal)+Number(param.statistics[3].natotal)));
  $("#totalTable #totalTable-p6").text(numberWithCommas(param.statistics[1].natotal));
  $("#totalTable #totalTable-m6").text(numberWithCommas(param.statistics[3].natotal));
}
function numberWithCommas(x) {
  console.log('numberWithCommas : ',x);
  return Number(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
// 리스트 조건 세팅
function startSetting(){
  var mcp = $.urlParam("mcp");
  if(mcp){
    $('#selectMCP > option[value='+mcp+']').attr("selected",true);
  }
  var cp = $.urlParam("cp");
  if(cp){
    $('#selectCP > option[value='+cp+']').attr("selected",true);
  }
  var osp = $.urlParam("osp");
  if(osp){
    $('#selectOSP > option[value='+osp+']').attr("selected",true);
  }
  var state = $.urlParam("state");
  if(state){
    $('#selectState > option[value='+state+']').attr("selected",true);
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
function settingParams(num){
  var renewURL = window.location.origin+window.location.pathname;
  var param = {};
  if(Number.isInteger(num)){
    param.page = num;
    if(typeof history.pushState == 'function'){
      renewURL += '?page='+param.page;
      history.pushState(null, null,renewURL);
    }
  }
  else{
    if(typeof history.pushState == 'function'){
      renewURL += '?t='+num;
      history.pushState(null, null,renewURL);
    }
  }
  // MCP
  if($('#selectMCP option:selected').val() != undefined){
    var mcpValue = $('#selectMCP option:selected').val();
    if(mcpValue != ''){
      param.mcp = mcpValue;
      if(typeof history.pushState == 'function'){
        renewURL += '&mcp='+param.mcp;
        history.pushState(null, null,renewURL);
      }
    }
  } else if($('#user_class').val() == 'm'){
    param.mcp = $('#user_id').val();
    if(typeof history.pushState == 'function'){
      renewURL += '&mcp='+param.mcp;
      history.pushState(null, null,renewURL);
    }
  }
  // CP
  if($('#selectCP option:selected').val() != undefined){
    var cpValue = $('#selectCP option:selected').val();
    if(cpValue != ''){
      param.cp = cpValue;
      if(typeof history.pushState == 'function'){
        renewURL += '&cp='+param.cp;
        history.pushState(null, null,renewURL);
      }
    }
  } else if($('#user_class').val() == 'c'){
    param.cp = $('#user_id').val();
    if(typeof history.pushState == 'function'){
      renewURL += '&cp='+param.cp;
      history.pushState(null, null,renewURL);
    }
  }
  // OSP
  if($("#selectOSP option:selected").val() != undefined){
    var ospValue = $('#selectOSP option:selected').val();
    if(ospValue != ''){
      param.osp = ospValue;
      if(typeof history.pushState == 'function'){
        renewURL += '&osp='+param.osp;
        history.pushState(null, null,renewURL);
      }
    }
  }
  // 게시물삭제
  if($("#searchBtn1:checked").val() != undefined){
    var sValue = $('#searchBtn1:checked').val();
    if(sValue != ''){
      param.delEle = '1';
      if(typeof history.pushState == 'function'){
        renewURL += '&delEle='+param.delEle;
        history.pushState(null, null,renewURL);
      }
    }
  }
  // State
  if($("#selectState option:selected").val() != undefined){
    var stateValue = $('#selectState option:selected').val();
    if(stateValue != ''){
      param.state = stateValue;
      if(typeof history.pushState == 'function'){
        renewURL += '&state='+param.state;
        history.pushState(null, null,renewURL);
      }
    }
  }
  //검색
  var searchValue = $('#searchInput').val();
  if(searchValue != ''){
    param.searchType = $('#selectSearchType option:selected').val();
    param.search = searchValue;
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&search='+encodeURI(param.search);
      renewURL += '&searchType='+param.searchType;
      history.pushState(null, null,renewURL);
    }
  }
  //날짜검색
  var dateArr = $("#reportrange span").text().split(' - ');
  if(dateArr.length > 1){
    var start = moment(new Date(dateArr[0]));
    var end = moment(new Date(dateArr[1]));
    param.sDate = start.format('YYYY-MM-DD');
    param.eDate = end.format('YYYY-MM-DD');
    if(typeof history.pushState == 'function' && Number.isInteger(num)){
      renewURL += '&sDate='+param.sDate;
      renewURL += '&eDate='+param.eDate;
      history.pushState(null, null,renewURL);
    }
  }
  return param;
}
// 검색 이벤트
function searchFun(){
  var param = settingParams(1);
  ajaxGetPageList(param);
}
//날짜 설정
var cb = function(start, end, label) {
  console.log('FUNC: cb',start.toISOString(), end.toISOString(), label);
  $('#reportrange span').html(moment(new Date(start.toISOString())).format('YYYY.MM.DD') + ' - ' + moment(new Date(end.toISOString())).format('YYYY.MM.DD'));
  searchFun();
}
var ranges = {
  '당일': [moment(), moment()],
  '전일': [moment().subtract(1, 'days'), moment()],
  '최근 7일': [moment().subtract(6, 'days'), moment()],
  '최근 30일': [moment().subtract(29, 'days'), moment()]
};
var sDateParams = $.urlParam("sDate");
var eDateParams = $.urlParam("eDate");
var optionSet1 = {
  startDate: (sDateParams != '' && sDateParams != null) ? moment(new Date(sDateParams)) : moment().subtract(2,'d'),
  endDate:  (eDateParams != '' && eDateParams != null) ? moment(new Date(eDateParams)) : moment(),
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
