// cp 선택 후
var url_string = window.location.href
var url = new URL(url_string);
var c = url.searchParams.get("cpId");
$(document).ready(function(){
  // cp 셀렉트 박스 옵션값 넣기
  $.ajax({
    url: '../filtering/getCPList',
    type: 'post',
    datatype : 'json',
    error:function(request,status,error){
      console.log('code:'+request.status+'\n'+'message:'+request.responseText+'\n'+'error:'+error);
    },
    success:function(data){
      console.log(data);
      data.forEach(function(item){
        var html = '<option value="'+item.U_name+'">'+item.U_name+'</option>'
        if(c == item.U_name){
          html = '<option value="'+item.U_name+'" selected>'+item.U_name+'</option>'
        }
        $('#selectCp').append(html);
      });
    }
  });
});
// cp 변경시
$('#selectCp').on('change',function(){
  var link = '../filtering/?cp_name='+$("#selectCp option:selected").val()
  var t = url.searchParams.get("searchType");
  var s = url.searchParams.get("search");
  if (t !== undefined && t != ''){
    if (s !== undefined && s != ''){
      link += '&searchType='+t+'&search='+s;
    }
  }
  location.href = link;
});
// 검색시
$('#searchBtn').on('click',function(){
  if($("#keywordInput").val() == ''){
    alert('검색어를 넣어주세요.');
    return false;
  }
  location.href = '../filtering/?cpId='+$("#selectCp option:selected").val()+'&searchType='+$("#selectSearchType option:selected").val()+'&search='+$("#keywordInput").val();
})
$('#keywordInput').on('keyup',function(event){
  if(event.keyCode == 13){
    $('#searchBtn').trigger('click');
  };
});
