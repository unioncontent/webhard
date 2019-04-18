module.exports = {
  fileham : {
    url:'http://fileham.com/append/autoGreen/proc.php',
    deletePost: function(mode,idx){
      return {
        'mode': mode,
        'idx': idx
      };
    }
  },
  sharebox : {
    url:'http://dev.sharebox.co.kr/append/autoGreen/proc.php',
    deletePost: function(mode,idx){
      return {
        'mode': mode,
        'idx': idx
      };
    }
  },
  me2disk : {
    url:'http://me2disk.com/append/autoGreen/proc.php',
    deletePost: function(mode,idx){
      return {
        'mode': mode,
        'idx': idx
      };
    }
  }
}
