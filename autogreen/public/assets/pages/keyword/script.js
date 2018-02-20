$('#search_cnt_name').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#btn-searchCnt').trigger('click');
  };
});

$("#contentsBtn").on("click",function(){
  $("#search_cnt_name").val($("#cnt_name").val());
  $("#keyword-Modal").modal('show');
});

$("#btn-searchCnt").on("click",function(){
  searchCnt($("#search_cnt_name").val());
});

$(document).on("click",".btn-cnt",function(event){
  var title = $(event.target).parents("tr").find(".contents").text().split(" : ")[1];
  var idx = $(event.target).parents("tr").find(".n_idx_c").val();
  $("#keyword-Modal tbody").empty();
  $("#keyword-Modal").modal('hide');
  $("#keyword-Modal tbody").empty();
  $("#search_cnt_name").val("");
  $("input[name=contentsID]").val(idx);
  $("#cnt_title").text(title);
  $("#cnt_name").val(title);
  openKeywordList(idx);
});

$("input[name=k_method]").on('change',function(){
  console.log(this.value);
  if(this.value == 0){
    $("input[name=k_apply]:input[value=P]").click();
    $("input[name=k_apply]").attr("disabled",true);
  }
  else if(this.value == 1){
    $("input[name=k_apply]").attr("disabled",false);
  }
});

$("#updateBtn").on('click',function(event){
  $.ajax({
    url: '../contents/update',
    type: 'post',
    data: {
      'K_method': $('input:radio[name=k_method]:checked').val(),
      'K_key': $('input:radio[name=k_key]:checked').val(),
      'K_apply': $('input:radio[name=k_apply]:checked').val(),
      'n_idx_c': $('input[name=contentsID]').val(),
      'type': 'all'
    },
    error:function(request,status,error){
      alert("다시시도해주세요.");
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
    },
    success:function(data){
      if(data){
        alert("수정완료되었습니다.");
      }
    }
  });
});

$("#insertKeywordBtn").on("click",function(){
  $.ajax({
    url: '../keyword/add',
    type: 'post',
    data: {
      'keyword': [$('#pSearch').val(),$('#dSearch').val()],
      'n_idx_c': $('input[name=contentsID]').val(),
      'K_key': $("input[name ='oK_key']").val(),
      'K_method': $("input[name ='oK_method']").val(),
      'K_apply': $("input[name ='oK_apply']").val(),
      'U_id_c': $("input[name ='cp_name']").val(),
    },
    error:function(request,status,error){
      alert("다시시도해주세요.");
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
    },
    success:function(data){
      if(data){
        alert("추가되었습니다.");
        $('#pSearch').val("");
        $('#dSearch').val("");
        openKeywordList(data.n_idx_c);
      }
    }
  });
});

$(document).on("click",".remove_keyword",function(){
  var idx = $(this).parents("tr").find(".n_idx_k").val();
  $.ajax({
    url: '../keyword/delete',
    type: 'post',
    data: {
      'n_idx': idx
    },
    error:function(request,status,error){
      alert("다시시도해주세요.");
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
    },
    success:function(data){
      if(data){
        openKeywordList($("input[name=contentsID]").val());
      }
      else{
        alert("다시시도해주세요.");
      }
    }
  });
});

function openKeywordList(idx){
  $.ajax({
    url: '../keyword/searchKeyInfo',
    type: 'post',
    data : {'n_idx_c': idx},
		datatype : 'json',
    error:function(request,status,error){
      // alert('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      alert(request.responseText);
    },
    success:function(data){
      $("tbody tr:not(#inputKey)").remove();
      data.forEach(function(item, idx){
        if(idx == 0){
          $("input[name ='oK_key']").val(item.K_key);
          $("input[name ='oK_method']").val(item.K_method);
          $("input[name ='oK_apply']").val(item.K_apply);
          $("input[name ='cp_name']").val(item.U_id_c);

          $("input:radio[name ='k_key']:input[value='"+item.K_key+"']").attr("checked", true);
          $("input:radio[name ='k_method']:input[value='"+item.K_method+"']").attr("checked", true);
          $("input:radio[name ='k_apply']:input[value='"+item.K_apply+"']").attr("checked", true);
        }
        var html = '<tr><th scope="row" class="centerTh">'+(idx+1)+'</th>';
        if(item.K_type != '0'){
          html += '<td><div class="keyword">'+item.K_keyword+'</div><input type="hidden" class="n_idx_k" value="'+item.n_idx+'"/></td><td></td>';
        }
        else{
          html += '<td></td><td><div class="keyword">'+item.K_keyword+'</div><input type="hidden" class="n_idx_k" value="'+item.n_idx+'"/></td>';
        }
        html += '<td><button class="remove_keyword btn btn-danger btn-sm"><i class="icofont icofont-garbage" style="margin-right:0"></i></button></td></tr>';
        $("#inputKey").after(html);
      });
      console.log("data : ",data);
      $("#keywordList").show();
    }
  });
}
function searchCnt(name){
  if($('#search_cnt_name').val() == ""){
    alert("검색어를 넣어주세요.");
    return false;
  }
  $.ajax({
    url: '../keyword/searchCnt',
    type: 'post',
    data : {
			'CP_title': $('#search_cnt_name').val()
		},
		datatype : 'json',
    error:function(request,status,error){
      // alert('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
      alert(request.responseText);
    },
    success:function(data){
      $("#keyword-Modal tbody").empty();
      console.log(data);
      data.forEach(function(item){
        var html = '<tr><td style="vertical-align: middle;"><div class="contents">'+item.CP_name+' : '+item.CP_title+'('+item.CP_cntID+')</div>\
        <input type="hidden" class="n_idx_c" value="'+item.n_idx_c+'"></td>\
        <td><button type="submit" class="btn-cnt btn btn-primary m-b-0">선택</button></td></tr>'
        $("#keyword-Modal tbody").append(html);
      });
    }
  });
}
