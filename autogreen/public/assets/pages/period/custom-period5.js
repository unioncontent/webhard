'use strict';
$(document).ready(function() {
  /* 언론사 통계 순위 for문 */
 /* for (var i = 2; i < 41; i++) {
    var check=""; // 20위이상 안보이게 하는 클래스 변수(more 클래스)
    if(i > 20){
      check="more";
    }

    $("#news-ranking").append("<tr class='"+check+"'><th scope='row'>"+i+"</th><td class='news' onclick='showModal('#news-Modal')'>언론사</td><td>3,294</td><td>13</td><td>11.74%</td></tr>");
    $("#press-ranking").append("<tr class='"+check+"'><th scope='row'>"+i+"</th><td class='press' onclick='showModal('#press-Modal')'>기자</td><td>언론사</td><td>1</td><td>0</td><td>0%</td></tr>");
  }*/

  /*pieGraph1();
  pieGraph2();*/
  /*document.querySelector('.alert-confirm').onclick = function(){
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
  };*/
  $('[data-toggle="tooltip"]').tooltip();

  $("i[data-value='chart1']").on("click",pieGraph1);
  $("i[data-value='chart2']").on("click",pieGraph2);

  /* sort */
  $(".card").on("click",".sort",function(){
    if($(this).children("i").eq(0).hasClass("on")){
      $(this).children("i").eq(0).removeClass("on");
      $(this).children("i").eq(1).addClass("on");
    }
    else{
      $(this).children("i").eq(0).addClass("on");
      $(this).children("i").eq(1).removeClass("on");
    }
    return false;
  });

  /* 더보기 언론사 테이블 상세보기*/
  $("#more-Modal").on("click",".news",function(){
    if($(".detail").length > 0){
      $(".detail").remove();
    }
    else{
      $(this).parent().after("<tr class='detail'><td colspan='5'>\
          <div class='card'>\
            <div class='card-header'>\
              <h5 class='card-header-text'>언론사정보</h5>\
            </div>\
            <div class='card-block table-border-style'>\
              <!-- list satart -->\
              <div class='table-border-style'>\
                <div class='table-responsive'>\
                  <table class='table table-de table-styling table-bordered'>\
                    <tbody>\
                      <tr>\
                        <th scope='row' width='30%'>언론사명</th>\
                        <td style='text-align:left'>톱스타뉴스</td>\
                      </tr>\
                      <tr>\
                        <th scope='row'>URL</th>\
                        <td style='text-align:left'></td>\
                      </tr>\
                      <tr>\
                        <th scope='row'>연락처</th>\
                        <td style='text-align:left'>000-000-000</td>\
                      </tr>\
                      <tr>\
                        <th scope='row'>메모</th>\
                        <td style='text-align:left'></td>\
                      </tr>\
                    </tbody>\
                  </table>\
                </div>\
              </div>\
            </div>\
          </div>\
          <div class='card'>\
            <div class='card-header'>\
              <h5 class='card-header-text'>기사노출도</h5>\
            </div>\
            <div class='card-block table-border-style'>\
              <div class='table-border-style'>\
                <div class='table-responsive'>\
                  <table class='table table-styling table-bordered'>\
                    <thead>\
                      <tr>\
                        <th>전체기사</th>\
                        <th>NAVER</th>\
                        <th>DAUM</th>\
                      </tr>\
                    </thead>\
                    <tbody>\
                      <tr>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                      </tr>\
                    </tbody>\
                  </table>\
                </div>\
              </div>\
            </div>\
          </div>\
          <div class='card'>\
            <div class='card-header'>\
              <h5 class='card-header-text'>성향분석</h5>\
            </div>\
            <div class='card-block table-border-style'>\
              <div class='table-border-style'>\
                <div class='table-responsive'>\
                  <table class='table table-styling table-bordered'>\
                    <thead>\
                      <tr>\
                        <th colspan='4'>전체기사</th>\
                        <th colspan='4'>매칭기사</th>\
                      </tr>\
                      <tr>\
                        <th>전체기사수</th>\
                        <th>호흥</th>\
                        <th>비호흥(악성)</th>\
                        <th>관심</th>\
                        <th>전체기사수</th>\
                        <th>호흥</th>\
                        <th>비호흥(악성)</th>\
                        <th>관심</th>\
                      </tr>\
                    </thead>\
                    <tbody>\
                      <tr>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                      </tr>\
                    </tbody>\
                  </table>\
                </div>\
              </div>\
            </div>\
          </div>\
        </td>\
      </tr>");
    }
  });

  /* 더보기 기자 테이블 상세보기*/
  $("#more-Modal").on("click",".press",function(){
    if($(".detail").length > 0){
      $(".detail").remove();
    }
    else{
      $(this).parent().after("<tr class='detail'>\
        <td colspan='6'>\
          <div class='card'>\
            <div class='card-header'>\
              <h5 class='card-header-text'>기자정보</h5>\
            </div>\
            <div class='card-block table-border-style'>\
              <div class='table-border-style'>\
                <div class='table-responsive'>\
                  <table class='table table-de table-styling table-bordered'>\
                    <tbody>\
                      <tr>\
                        <th scope='row' width='30%'>이름</th>\
                        <td style='text-align:left'>김한준</td>\
                      </tr>\
                      <tr>\
                        <th scope='row'>언론사명</th>\
                        <td style='text-align:left'></td>\
                      </tr>\
                      <tr>\
                        <th scope='row'>이메일</th>\
                        <td style='text-align:left'></td>\
                      </tr>\
                      <tr>\
                        <th scope='row'>연락처</th>\
                        <td style='text-align:left'>000-000-000</td>\
                      </tr>\
                    </tbody>\
                  </table>\
                </div>\
              </div>\
            </div>\
          </div>\
          <div class='card'>\
            <div class='card-header'>\
              <h5 class='card-header-text'>기사노출도</h5>\
            </div>\
            <div class='card-block table-border-style'>\
              <!-- list satart -->\
              <div class='table-border-style'>\
                <div class='table-responsive'>\
                  <table class='table table-styling table-bordered'>\
                    <thead>\
                      <tr>\
                        <th>전체기사</th>\
                        <th>NAVER</th>\
                        <th>DAUM</th>\
                      </tr>\
                    </thead>\
                    <tbody>\
                      <tr>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                      </tr>v\
                    </tbody>\
                  </table>\
                </div>\
              </div>\
            </div>\
          </div>\
          <div class='card'>\
            <div class='card-header'>\
              <h5 class='card-header-text'>성향분석</h5>\
            </div>\
            <div class='card-block table-border-style'>\
              <div class='table-border-style'>\
                <div class='table-responsive'>\
                  <table class='table table-styling table-bordered'>\
                    <thead>\
                      <tr>\
                        <th colspan='4'>전체기사</th>\
                        <th colspan='4'>매칭기사</th>\
                      </tr>\
                      <tr>\
                        <th>전체기사수</th>\
                        <th>호흥</th>\
                        <th>비호흥(악성)</th>\
                        <th>관심</th>\
                        <th>전체기사수</th>\
                        <th>호흥</th>\
                        <th>비호흥(악성)</th>\
                        <th>관심</th>\
                      </tr>\
                    </thead>\
                    <tbody>\
                      <tr>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                        <td>0</td>\
                      </tr>\
                    </tbody>\
                  </table>\
                </div>\
              </div>\
            </div>\
          </div>\
        </td>\
      </tr>");
    }
  });

  /*더보기 sort*/
  $("#more-Modal").on("click",".sort",function(){
    if($(this).children("i").eq(0).hasClass("on")){
      $(this).children("i").eq(0).removeClass("on");
      $(this).children("i").eq(1).addClass("on");
    }
    else{
      $(this).children("i").eq(0).addClass("on");
      $(this).children("i").eq(1).removeClass("on");
    }
    return false;
  });

});

//modal
function showModal(element, event){
	
	console.log(event);
	
	var url = decodeURI(window.location.href.split("/media?")[1]);
	var part = "";
	
	if(element.indexOf("news") >= 0){
		part = 'media';
	}else if(element.indexOf("press") >= 0){
		part = 'press';
	}
	
	$.ajax({
		type : "POST",
	  	url : "getTextType",
 	  	dataType : "json",
 	  	data : {url : url, part : part, keyword : event},
  	  	success : function(list){
  	  		
  	  		console.log(list);
  	  		
  	  		if(part == 'media'){
  	  			$("#mediaName")[0].innerText = event;
  	  			$("#media1_1")[0].innerText = list[0].lik + list[0].dis;
  	  			$("#media1_2")[0].innerText = list[0].lik;
  	  			$("#media1_3")[0].innerText = list[0].dis;
  	  			
  	  			$("#media2_1")[0].innerText = list[1].lik + list[1].dis + list[1].cu;
  	  			$("#media2_2")[0].innerText = list[1].lik;
  	  			$("#media2_3")[0].innerText = list[1].dis;
  	  			$("#media2_4")[0].innerText = list[1].cu;

  	  			$("#media3_1")[0].innerText = list[2].lik + list[2].dis + list[2].cu;
  	  			$("#media3_2")[0].innerText = list[2].lik;
  	  			$("#media3_3")[0].innerText = list[2].dis;
  	  			$("#media3_4")[0].innerText = list[2].cu;
  	  			
  	  		
  	  		}else if(part == 'press'){
  	  			
  	  			$("#press1_1")[0].innerText = list[0].lik + list[0].dis;
	  			$("#press1_2")[0].innerText = list[0].lik;
	  			$("#press1_3")[0].innerText = list[0].dis;
	  			
	  			$("#press2_1")[0].innerText = list[1].lik + list[1].dis + list[1].cu;
	  			$("#press2_2")[0].innerText = list[1].lik;
	  			$("#press2_3")[0].innerText = list[1].dis;
	  			$("#press2_4")[0].innerText = list[1].cu;

	  			$("#press3_1")[0].innerText = list[2].lik + list[2].dis + list[2].cu;
	  			$("#press3_2")[0].innerText = list[2].lik;
	  			$("#press3_3")[0].innerText = list[2].dis;
	  			$("#press3_4")[0].innerText = list[2].cu;
	  			
	  			$("#pressName")[0].innerText = list[3].name1;
	  			$("#pressMediaName")[0].innerText = list[3].name2;
	  			if(list[3].email != undefined){
	  				$("#pressEmail")[0].innerText = list[3].email;
	  			}
  	  		}
  	  		
  	  		$(element).modal('show');
  	  	}
	});
	
}

function makeModalContent(list){
	
}

/*//graph
function pieGraph1(){
   그래프1 
  $("#donutchart").empty();
  nv.addGraph(function() {
    var chart = nv.models.pieChart()
        .x(function(d) {
            return d.label })
        .y(function(d) {
            return d.value })
        .showLabels(true) //Display pie labels
        .labelThreshold(.05) //Configure the minimum slice size for labels to show up
        .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
        .donut(true) //Turn on Donut mode. Makes pie chart look tasty!
        .donutRatio(0.35) //Configure how big you want the donut hole size to be.
    ;

    d3.select("#donutchart").append('svg')
        .datum(pieData1())
        .transition().duration(350)
        .call(chart);
    nv.utils.windowResize(chart.update);

    return chart;
  });
}
function pieGraph2(){
   그래프2 
  $("#donutchart2").empty();
  nv.addGraph(function() {
    var chart = nv.models.pieChart()
        .x(function(d) {
            return d.label })
        .y(function(d) {
            return d.value })
        .showLabels(true) //Display pie labels
        .labelThreshold(.05) //Configure the minimum slice size for labels to show up
        .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
        .donut(true) //Turn on Donut mode. Makes pie chart look tasty!
        .donutRatio(0.35) //Configure how big you want the donut hole size to be.
    ;

    d3.select("#donutchart2").append('svg')
        .datum(pieData2())
        .transition().duration(350)
        .call(chart);
    nv.utils.windowResize(chart.update);

    return chart;
  });
}

//data
function pieData1() {
	
	var text = '${mediaTypeCount}';
	console.log(text);
	
    return [{
        "label": "좋은기사",
        "value": text.lik,
        "color": "#2ecc71"
    },{
        "label": "나쁜기사",
        "value": text.dis,
        "color": "#e74c3c"
    },{
        "label": "관심기사",
        "value": text.cu,
        "color": "#FF9F55"
    },   {
        "label": "기타기사",
        "value": text.etc,
        "color": "#f1c40f"
    }];
}
function pieData2() {
  return [{
      "label": "좋은기사",
      "value": 10,
      "color": "#2ecc71"
  },{
      "label": "나쁜기사",
      "value": 50,
      "color": "#e74c3c"
  },{
      "label": "관심기사",
      "value": 10,
      "color": "#FF9F55"
  },   {
      "label": "기타기사",
      "value": 70,
      "color": "#f1c40f"
  }];
}*/

//more
function moreRanking(moreName,morehtml){
  // 1. 더보기를 할 부분 이름 가져와 타이틀 부분에 넣기(언론사,기자)
  $("#moreName").text(moreName);
  // 2. 더보기 할 부분의 순위 리스트 html을 변수에 대입
  var originHtml = $("#"+morehtml).html();
  // 3. 더보기 할 부분에 more이라는 클래스를 지워줌
  $("#"+morehtml+" tr").removeClass("more");
  // 4. more 클래스를 지운 html을 변수에 대입
  var changeHtml = $("#"+morehtml).html();
  // 5. more 클래스가 지워진 부분 다시 원래대로 복구
  $("#"+morehtml).html(originHtml);
  // 6. more클래스를 지운 html 모달 부분에 넣어줌
  $("#more-Modal .modal-body").html(changeHtml);
  $("#more-Modal").modal('show');
  $("#more-Modal i").removeClass("on");
  $("#more-Modal td").attr('onclick', '').unbind('click');
}
