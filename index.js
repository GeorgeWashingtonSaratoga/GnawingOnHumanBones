// get canvas & context
var c = document.getElementById("gamecanvas");
var ctx = c.getContext("2d");

var theme = document.createElement('audio');
var cronch = document.getElementById('crunch');
var splat = document.getElementById('splat');

var keys = [];
var score = 0;
var scoreval = '';
var babydeathheight = 432;

var image = document.getElementById("ad1");
image.onclick = function(e) {
  window.location.href = "https://georgewashingtonsaratoga.github.io/sillysite/";
}

var image = document.getElementById("ad2");
image.onclick = function(e) {
  window.location.href = "www.pornhub.com";
}

theme.setAttribute('src', 'theme.mp3');
theme.setAttribute('autoplay', 'autoplay');
theme.loop=true;
// cronch.setAttribute('src', 'crunch.mp3');

window.addEventListener("keydown", this.keyPressed, false);
window.addEventListener("keyup", this.keyReleased, false);

function keyPressed(event) {
    keys[event.keyCode] = true;
}

function keyReleased(event) {
    keys[event.keyCode] = false;
}

var spirtImg = document.getElementById("spirt");

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

// init child at (-9001, -9001) with velocity vector (0, 0)
var child = new Player(new Vector(-9002, -9001), new Vector(0, 0));

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
    bone.pos.x = Math.random() * 448;
    bone.pos.y = -64;
}

function dropChild() {
    child.vel.zero();
    child.pos.x = Math.random() * 448;
    child.pos.y = -64;
}

var tChild = 0;

var winned = false;

var deadBabieX = [];

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
    bone.vel.y += (gravity / 2);
    child.vel.y += (gravity / 4);

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
    bone.pos.add(bone.vel);
    child.pos.add(child.vel);

    // clamp position
    player.pos.clamp(0, 448);

    if (bone.pos.y >= 448) {
        dropBone();
    } 
    
    if (child.pos.y >= 448) {
        if (tChild < 40) {
            if (tChild == 0) {
                splat.play();
            }
            tChild++;
            death(tChild);
            child.pos.y = 9001; // over 9000
        } else {
            tChild = 0;
            babyDeathAnim = [0, 5];
            deadBabieX.push(child.pos.x);
            dropChild();
        }
    }

    if (player.pos.y == 448) {
        onGround = true;
    }

    if (AABB(player.pos.x, player.pos.y, 64, 64, bone.pos.x, bone.pos.y, 64, 64)) {
        dropBone();
        cronch.play();
        score += 100;
        if (score >= 6900) {
            winned = true;
        }
    }

    if (AABB(player.pos.x, player.pos.y, 64, 64, child.pos.x, child.pos.y, 64, 64)) {
        dropChild();
        score -= 50;
    }
}

function AABB(x1, y1, w1, h1, x2, y2, w2, h2) {
    if ((x1 >= x2 && x1 <= x2 + w2 && y1 >= y2 && y1 <= y2 + h2) ||
        (x1 + w1 >= x2 && x1 + w1 <= x2 + w2 && y1 >= y2 && y1 <= y2 + h2) ||
        (x1 >= x2 && x1 <= x2 + w2 && y1 + h1 >= y2 && y1 + h1 <= y2 + h2) ||
        (x1 + w1 >= x2 && x1 + w1 <= x2 + w2 && y1 + h1 >= y2 && y1 + h1 <= y2 + h2)) {
            return true;
    } else {
        return false;
    }
}

var babyDeathAnim = [0, 5];

function death(t) {
    babyDeathAnim = [child.pos.x, Math.floor(t / 10)];
}

function drawDeath() {
    switch (babyDeathAnim[1]) {
        case 0: {
            ctx.drawImage(spirtImg, 20, 360, 320, 320, babyDeathAnim[0], babydeathheight, 64, 64);
            break;
        }
        case 1: {
            ctx.drawImage(spirtImg, 20, 20, 320, 320, babyDeathAnim[0], babydeathheight, 64, 64);
            break;
        }
        case 2: {
            ctx.drawImage(spirtImg, 360, 20, 320, 320, babyDeathAnim[0], babydeathheight, 64, 64);
            break;
        }
        case 3: {
            ctx.drawImage(spirtImg, 360, 360, 320, 320, babyDeathAnim[0], babydeathheight, 64, 64);
            break;
        }
        case 4: {
            ctx.drawImage(spirtImg, 360, 700, 320, 320, babyDeathAnim[0], babydeathheight, 64, 64);
            break;
        }
        case 5: {
            break;
        }
        default: {
            break;
        }
    }
}

function draw() {
    // draw background
    ctx.drawImage(spirtImg, 700, 20, 650, 650, 0, 0, 512, 512);

    // draw bone
    ctx.drawImage(spirtImg, 1040, 700, 319, 319, bone.pos.x, bone.pos.y, 64, 64);

    // draw child
    ctx.drawImage(spirtImg, 20, 700, 319, 319, child.pos.x, child.pos.y, 64, 64);

    // dead baby anim
    drawDeath();

    // draw dead babies
    for (var i = 0; i < deadBabieX.length; i++) {
        ctx.drawImage(spirtImg, 360, 700, 320, 320, deadBabieX[i], babydeathheight, 64, 64);
    }

    // draw player
    ctx.drawImage(spirtImg, 700, 700, 320, 320, player.pos.x, player.pos.y, 64, 64);
    
    // draw score
    drawScore();
}

function drawScore() {
    ctx.beginPath();
    ctx.font = "24px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${score}`, 8, 20);
}

function main() { 
    theme.play(); 
    update();
    draw();
    // request aim frame
    if (!winned) {
        window.requestAnimationFrame(main);
    } else {
        window.requestAnimationFrame(win);
    }
}

function win() {
    // draw background
    ctx.drawImage(spirtImg, 700, 1040, 650, 650, 0, 0, 512, 512);

    if (keys[32]) {
        document.location.reload();
        clearInterval(interval);
    }

    window.requestAnimationFrame(win);
}

function titty() {
    // draw background
    ctx.drawImage(spirtImg, 20, 1040, 650, 650, 0, 0, 512, 512);

    if (keys[32]) {
        window.requestAnimationFrame(main);
    } else {
        window.requestAnimationFrame(titty);
    }
}

// request anim frame
window.requestAnimationFrame(titty);

