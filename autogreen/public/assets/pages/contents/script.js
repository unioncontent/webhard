// cp 선택 후
var url_string = window.location.href
var url = new URL(url_string);
var c = url.searchParams.get("cpId");
$(document).ready(function(){
  // cp 셀렉트 박스 옵션값 넣기
  $.ajax({
    url: '../contents/getCPList',
    type: 'post',
		datatype : 'json',
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
    },
    success:function(data){
      console.log(data);
      data.forEach(function(item){
        var html = '<option value="'+item.n_idx+'">'+item.U_name+'</option>'
        if(c == item.n_idx){
          html = '<option value="'+item.n_idx+'" selected>'+item.U_name+'</option>'
        }
        $('#selectCp').append(html);
      });
    }
  });
});
// cp 변경시
$('#selectCp').on('change',function(){
  var link = '../contents/?cpId='+$("#selectCp option:selected").val()
  var t = url.searchParams.get("searchType");
  var s = url.searchParams.get("search");
  if (t !== undefined && t != ''){
    if (s !== undefined && s != ''){
      link += '&searchType='+t+'&search='+s;
    }
  }
  console.log(link);
  location.href = link;
});
// 검색시
$('#searchBtn').on('click',function(){
  if($("#keywordInput").val() == ''){
    alert('검색어를 넣어주세요.');
    return false;
  }
  location.href = '../contents/?cpId='+$("#selectCp option:selected").val()+'&searchType='+$("#selectSearchType option:selected").val()+'&search='+$("#keywordInput").val();
})

$('#keywordInput').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#searchBtn').trigger('click');
  };
});

$(document).on('click','.btn-update',function(event){
  var tdEle = $(event.target).closest("tr").find('td');
  var input = $(event.target).closest("tr").find('input');
  $.ajax({
    url: '../contents/update',
    type: 'post',
    data: {
      'K_method': tdEle.eq(3).find('option:selected').val(),
      'K_key': tdEle.eq(4).find('option:selected').val(),
      'n_idx_k': input.eq(0).val()
    },
    error:function(request,status,error){
      alert("다시시도해주세요.");
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
    },
    success:function(data){
      if(data){
        window.location.reload();
      }
      else{
        alert("다시시도해주세요.");
      }
    }
  });
});

$(document).on('click','.btn-delete',function(){
  var input = $(this).closest("tr").find('input');
  $.ajax({
    url: '../contents/delete',
    type: 'post',
    data: {
      'n_idx_k': input.eq(0).val(),
      'n_idx_c': input.eq(1).val()
    },
    error:function(request,status,error){
      alert("다시시도해주세요.");
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
    },
    success:function(data){
      if(data){
        window.location.reload();
      }
      else{
        alert("다시시도해주세요.");
      }
    }
  });
});

$("#insertBtn").on("click",function(){
  var check=true;
  var param = {
    'U_id_c': $('input[name=CP_name]').val(),
    'CP_title': $("input[name=CP_title]").val(),
    'CP_title_eng': $("input[name=CP_title_eng]").val(),
    'OSP_id': $('input[name=OSP_id]').val(),
    'K_method': $("input:radio[name=K_method]:checked").val(),
    'K_apply': $("input:radio[name=K_apply]:checked").val(),
    'CP_hash': '',
    'CP_price': '0',
    'keyword': $("input[name=CP_title]").val()
  };
  if($("#CP_name").val() == ""){
    check = requiredMessage("CP_name","거래처명을 입력해주세요.");
  }
  if($("#CP_title").val() == ""){
    check = requiredMessage("CP_title","대표제목를 입력해주세요.");
  }
  if($("#OSP_id").val() == ""){
    check = requiredMessage("OSP_id","OSP관리ID를 입력해주세요.");
  }
  if($("input:radio[name=K_method]:checked").val() == ""){
    check = requiredMessage("method","관리방법을 선택해주세요.");
  }
  if($("input:radio[name=K_apply]:checked").val() == ""){
    check = requiredMessage("apply","관리현황을 선택해주세요.");
  }

  if(check){
    if($("#CP_hash").val() != ""){
      param.CP_hash = $("#CP_hash").val();
    }
    if($("#CP_price").val() != ""){
      param.CP_price = $("#CP_price").val();
    }
    if($("#keyword").val() != ""){
      param.keyword = $("#keyword").val();
    }
    console.log(param);
    $.ajax({
      url: './add',
      type: 'post',
      data : param,
      datatype : 'json',
      error:function(request,status,error){
        // alert('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
        alert(request.responseText);
      },
      success:function(data){
        alert(data);
        window.location.reload();
      }
    });
  }

  return check;
});

$("input, select").on("focus",function(){
  $(this).removeClass("form-control-danger");
  $(this).siblings().children("p").text("");
});

function requiredMessage(target,msg){
  $("#"+target).siblings().children().text(msg);
  $("#"+target).addClass("form-control-danger");
  return false;
}
