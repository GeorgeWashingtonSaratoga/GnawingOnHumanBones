// get canvas & context
var c = document.getElementById("gamecanvas");
var ctx = c.getContext("2d");

var keys = [];

window.addEventListener("keydown", this.keyPressed, false);
window.addEventListener("keyup", this.keyReleased, false);

function keyPressed(event) {
    keys[event.keyCode] = true;
}

function keyReleased(event) {
    keys[event.keyCode] = false;
}

// get player image
var playerImg = document.getElementById("player");

// get bone image
var boneImg = document.getElementById("bone");

// get background image
var bgImg = document.getElementById("bg");

// define vector class
class Vector {
    constructor(xComponent, yComponent) {
        this.x = xComponent;
        this.y = yComponent;
    }

    add(vector2) {
        this.x += vector2.x;
        this.y += vector2.y;
        return this;
    }

    clamp(minValue, maxValue) {
        if (this.x > maxValue) {
            this.x = maxValue;
        }
        if (this.y > maxValue) {
            this.y = maxValue;
        }
        if (this.x < minValue) {
            this.x = minValue;
        }
        if (this.y < minValue) {
            this.y = minValue;
        }
    }

    zero() {
        this.x = 0;
        this.y = 0;
    }
}

// define player class
class Player {
    constructor(positionVector, velocityVector) {
        this.pos = positionVector;
        this.vel = velocityVector;
    }
}

// init player at (64, 64) with velocity vector (0, 0)
var player = new Player(new Vector(64, 448), new Vector(0, 0));

// init bone at (-9001, -9001) with velocity vector (0, 0)
var bone = new Player(new Vector(-9001, -9001), new Vector(0, 0));

// init acceleration vector as (2, 15)
var acceleration = new Vector(2, 15);

// init gravity
var gravity = 0.9;

// init onGround as true
var onGround = true;

// init maxVel as 5
var maxVel = 15;

// init friction
var friction = 0.4;

// init error
var error = 0.1;

function dropBone() {
    bone.vel.zero();
    bone.pos.x = Math.random() * 488;
    bone.pos.y = 512;
}

function update() {
    // change velocity by acceleration if correct key pressed
    
    // left-right motion
    if (keys[39] || keys[68]) {
        player.vel.x += acceleration.x;
    }
    if (keys[37] || keys[65]) {
        player.vel.x -= acceleration.x;
    }

    // jump
    if ((keys[38] || keys[87]) && onGround) {
        player.vel.y = -acceleration.y;
        onGround = false;
    }

    // gravity
    player.vel.y += gravity;

    console.log(player.vel);

    // friction
    if (player.vel.x > 0) {
        player.vel.x -= friction;
    }
    if (player.vel.x < 0) {
        player.vel.x += friction;
    }

    if (Math.abs(player.vel.x) < friction + error) {
        player.vel.x = 0;
    }

    // clamp velocity
    player.vel.clamp(-maxVel, maxVel);

    // change position by velocity
    player.pos.add(player.vel);

    // clamp position
    player.pos.clamp(0, 448);

    if (player.pos.y == 448) {
        onGround = true;
    } 
}

function draw() {
    // draw background
    ctx.drawImage(bgImg, 0, 0, 660, 660, 0, 0, 512, 512);

    // draw image
    ctx.drawImage(playerImg, 0, 0, 320, 320, player.pos.x, player.pos.y, 64, 64);

    // draw bone
    ctx.drawImage(boneImg, 0, 0, 320, 320, bone.pos.x, bone.pos.y, 64, 64);
}

function main() { 
    update();
    draw();
    
    // request aim frame
    window.requestAnimationFrame(main);
}

// request anim frame
window.requestAnimationFrame(main);
