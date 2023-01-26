// get canvas & context
var c = document.getElementById("gamecanvas");
var ctx = c.getContext("2d");

// get char image
var charImg = document.getElementById("character");

// define player class
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// init player
var player = Player(16, 16)

function main() { 
  // draw background
  ctx.beginPath();
  ctx.fillStyle="rgba(255,255,255)";
  ctx.fillRect(0,0,512,512);
  
  // draw image
  ctx.drawImage(charImg, 0, 0, 320, 320, player.x, player.y, 16, 16);
  
  // request aim frame
  window.requestAnimationFrame(main);
}

// request anim frame
window.requestAnimationFrame(main);
