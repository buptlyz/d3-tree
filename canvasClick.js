(function() {
  var canvas = document.querySelector("canvas");
  var ctx = canvas.getContext('2d');
  var r = canvas.width / 2;

  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 1);
  ctx.fillStyle = '#2196f3'; //蓝色
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(r, r, r, Math.PI * 1, Math.PI * 2);
  ctx.fillStyle = '#f44336'; //红色
  ctx.fill();
  
  function isInPath (x, y){
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 1);
    return ctx.isPointInPath(x, y)
  }
  
  canvas.addEventListener('click', function(e){
    if(isInPath(e.offsetX, e.offsetY)) {
      console.log('hello')
    }
  })
})()
