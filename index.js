var c = document.getElementById("gamecanvas");
var ctx = c.getContext("2d");

function main() { 
  ctx.beginPath();
  ctx.fillStyle="rgba(255,255,255)";
  ctx.fillRect(0,0,512,512);
  window.requestAnimationFrame(main);
}

window.requestAnimationFrame(main);
