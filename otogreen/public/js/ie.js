$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURIComponent(results[1]) || 0;
    }
}

$.urlPostParam = function(sendData){
  // 윈도우인지 다른 브라우저인지 확인
  var ua = window.navigator.userAgent;
  var postData;
  // 윈도우라면 ?
  if (ua.indexOf('MSIE') > 0 || ua.indexOf('Trident') > 0) {
      postData = encodeURI(sendData);
  } else {
      postData = sendData;
  }
  return postData;
}
