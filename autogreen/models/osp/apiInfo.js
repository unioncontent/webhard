module.exports = {
  fileham : {
    url:'http://fileham.com/append/autoGreen/proc.php',
    deletePost: function(mode,idx){
      return {
        'mode': mode,
        'idx': idx
      };
    }
  } 
}
