// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.0/firebase-auth.js";
import { getDatabase, ref, set, update, onDisconnect, onValue, onChildAdded, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.17.0/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCRqD6EkN71Pb5ZXBfPcNY43rNWOhpDr3E",
    authDomain: "gnawingonhumanbones.firebaseapp.com",
    projectId: "gnawingonhumanbones",
    storageBucket: "gnawingonhumanbones.appspot.com",
    messagingSenderId: "1086979129953",
    appId: "1:1086979129953:web:da2f3262b7f3f51beea020"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);

// get canvas & context
var c = document.getElementById("gamecanvas");
var ctx = c.getContext("2d");

var mouseX, mouseY;

window.addEventListener("mousemove", function(event) {
    mouseX = event.clientX - c.getBoundingClientRect().left;
    mouseY = event.clientY - c.getBoundingClientRect().top;
});

var mouseDown;

window.addEventListener("mousedown", function(event) {
    mouseDown = true;
});

window.addEventListener("mouseup", function(event) {
    mouseDown = false;
})

var theme = document.createElement('audio');
var cronch = document.getElementById('crunch');
var splat = document.getElementById('splat');
var succ = document.getElementById('succ');

var cosmetic = false;
var keySkin = '';

var keys = [];
var score = 0;
var scoreval = '';
var babydeathheight = 432;
var luigi = false;

const unlocked = [];
var allowKeyFall = false;

var imgCunt = 5;
var imgnum = 0;
var cosnum = null;

var image = document.getElementById("ad1");
    image.onclick = function(e) {
      window.location.href = "https://georgewashingtonsaratoga.github.io/sillysite/";
};

var image = document.getElementById("ad2");
image.onclick = function(e) {
  window.location.href = "www.pornhub.com";
};

var image = document.getElementById("ad3");
image.onclick = function(e) {
  window.location.href = "https://twitter.com/MinionRunHacks/status/1616460910910140419";
};

theme.setAttribute('src', 'theme.mp3');
theme.setAttribute('autoplay', 'autoplay');
theme.loop=true;
// cronch.setAttribute('src', 'crunch.mp3');

window.addEventListener("keydown", function(event) {
    keys[event.keyCode] = true;
}, false);
window.addEventListener("keyup", function(event) {
    keys[event.keyCode] = false;
}, false);

var spirtImg = document.getElementById("spirt");
var cosm = document.getElementById("cosm");
var loot = document.getElementById("loot");
var butt = document.getElementById("butt");
var pets = document.getElementById("pets");
var guns = document.getElementById("guns");
var skins = document.getElementById("skins");
var lock = document.getElementById("lock");

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

// init token at (-9001, -9001) with velocity vector (0, 0)
var token = new Player(new Vector(-9002, -9001), new Vector(0, 0));

// init acceleration vector as (2, 15)
var acceleration = new Vector(2, 15);

// init gravity
var gravity = 0.9;

// init onGround as true
var onGround = true;

// init maxVel as 5
var maxVel = 15;

// init friction
var friction = 0.9; // 0.4

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

function dropKey() {
    token.vel.zero();
    token.pos.x = Math.random() * 448;
    token.pos.y = -64;
    if(score >= 3450 && score <= 6900) {
        keySkin = "common"
        console.log("common")
    } else {
        if(score >= 6900 && score <= 10350) {
            keySkin = "uncommon"
            console.log("uncommon")
        } else {
            if(score >= 10350 && score <= 13800) {
                keySkin = "rare"
                console.log("rare")
            } else {
                if(score >= 13800) {
                    keySkin = "epic"
                    console.log("epic")
                } else {
                    keySkin = "NULL"
                    console.log("error: null-skin")
                }
            }
        }
    }
}

var tChild = 0;

var winned = false;

var deadBabieX = [];

function updater() {
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
    token.vel.y += (gravity /4);

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
    token.pos.add(token.vel);

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

    if (token.pos.y >= 448 && score >= 3450 && allowKeyFall == true) {
        dropKey();
        if (token.pos.y <= 448) {
            allowKeyFall = false
            console.log("NO KEY >:(");
        }
    }
    if (player.pos.y == 448) {
        onGround = true;
    }

    if (AABB(player.pos.x, player.pos.y, 64, 64, bone.pos.x, bone.pos.y, 64, 64)) {
        dropBone();
        cronch.play();
        score += 100;
        if (Math.floor((Math.random() * 10) + 1) == 10) {
            if (score >= 3450) {
                allowKeyFall = true;
                dropKey();
                console.log("DROPPING KEY");
            }
        }
        if (score >= 6900) {
            winned = true;
        }
    }

    if (AABB(player.pos.x, player.pos.y, 64, 64, token.pos.x, token.pos.y, 64, 64)) {
        score += 100;
        if (score >= 3450) {
            unlocked.push(keySkin);
            console.log("COLLECTED");
            allowKeyFall = false;
        }
        if (score >= 6900) {
            winned = true;
        }
    }

    if (AABB(player.pos.x, player.pos.y, 64, 64, child.pos.x, child.pos.y, 64, 64)) {
        dropChild();
        score -= 50;
    }

    friction = 0.9;
    for (var i = 0; i < deadBabieX.length; i++) {
        if (AABB(player.pos.x, player.pos.y, 64, 64, deadBabieX[i], babydeathheight, 64, 64)) {
            friction /= 9;
        }
    }
if(luigi) {
    for (var i = 0; i < deadBabieX.length; i++) {
        if (mouseX >= deadBabieX[i] && mouseX <= deadBabieX[i] + 64 && mouseY >= babydeathheight + 48 && mouseY <= babydeathheight + 64) {
            deadBabieX.splice(i, 1);
            succ.play();
        }
    }
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

    // draw token
    if(keySkin == "common") {
        ctx.drawImage(loot, 520, 10, 160, 160, token.pos.x, token.pos.y, 64, 64);
    } else {
        if(keySkin == "uncommon") {
            ctx.drawImage(loot, 520, 180, 160, 160, token.pos.x, token.pos.y, 64, 64);
        } else {
            if(keySkin == "rare") {
                ctx.drawImage(loot, 520, 350, 160, 160, token.pos.x, token.pos.y, 64, 64);
            } else {
                if(keySkin == "epic") {
                    ctx.drawImage(loot, 520, 520, 160, 160, token.pos.x, token.pos.y, 64, 64);
                }
            }
        }
    }
    

    // dead baby anim
    drawDeath();

    // draw dead babies
    for (var i = 0; i < deadBabieX.length; i++) {
        ctx.drawImage(spirtImg, 360, 700, 320, 320, deadBabieX[i], babydeathheight, 64, 64);
    }

    // draw player
    if (luigi) {
        ctx.drawImage(spirtImg, 20, 1720, 320, 320, player.pos.x, player.pos.y, 64, 64);
    } else { // cring
        ctx.drawImage(spirtImg, 700, 700, 320, 320, player.pos.x, player.pos.y, 64, 64);
    }
    
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
    updater();
    draw();
    // request aim frame
    if (!winned) {
        window.requestAnimationFrame(main);
    } else {
        luigi = true;
        window.requestAnimationFrame(win);
    }
}

function win() {
    // draw background
    ctx.drawImage(spirtImg, 700, 1040, 650, 650, 0, 0, 512, 512);

    if (keys[32]) {
        luigi = true;
        score = 0;
        scoreval = '';
        deadBabieX = [];
        babyDeathAnim = [0, 5];
        winned = false;
        tChild = 0;
        friction = 0.9;
        onGround = true;
        player = new Player(new Vector(64, 448), new Vector(0, 0));
        bone = new Player(new Vector(-9001, -9001), new Vector(0, 0));
        child = new Player(new Vector(-9002, -9001), new Vector(0, 0));
        token = new Player(new Vector(-9002, -9001), new Vector(0, 0));
        acceleration = new Vector(2, 15);
        window.requestAnimationFrame(titty);
        alert("You can now play as Luigi");
        document.body.style.cursor = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAD2UExURb0AAAAAABQAAGVlZdnZ2RoaGsttbcvLy70AAL0AAAAAAAAAAL0AAL0AAL0AAL0AAAAAAAAAAAAAAAAAAL0AAL0AAL0AAAAAAAAAAAAAAAAAAKkAABkAAAAAAAAAALoAAGgAAAAAAAAAAAAAANgAAL0AAMoAAMwAAAAAAP8AAL0AAL0AAL0AABoaGhoaGh0dHXR0dOjo6NnZ2b0BAb6+vr+/v8LCwtbW1tnZ2dnZ2b0AANnY2Nra2tvb29nZ2dnZ2dnZ2b0AAL0AANnZ2dnZ2dnZ2dnZ2dnZ2dnZ2b0AAL4AAKcAABYAAKYAAAAAANra2tnZ2f///1PVeSUAAABJdFJOUwAAAAAAAAAAHODgHAQZOeTkORkExub7/ebGG/vk4x/kNzfiHhviHRkdAh0fGx7i5jkZBAQd4f3mxhnhBDnk5jkcHhob++ThH+OiMhG4AAAAAWJLR0RRlGl8KgAAAAd0SU1FB+cCAg4qJTmtLxQAAAC1SURBVBjTVczZAoFAGEDhHyPCVKisWUr2fV8jskxC7/80TN3kXH4XBwAgzhL76SSSIRpACnM8BSGdyXqARUkm9svJ5QtFCnFOIoTYpbLwVioUWF7+AanW6nlVo0D82EZRVYKgN5NKAGRJbLWDwHO4owWB7UL4D/QehDRFbUcQAv/Qh+hgOBpPph5IHJ4xsfliuVpvEGy3uoiB2W32h49rHE9gmuY5BeiyNizXta438EP3h+v3BTe6JdaFCh7FAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTAyLTAyVDE0OjQyOjM3KzAwOjAwZEL5EgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wMi0wMlQxNDo0MjozNyswMDowMBUfQa4AAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjMtMDItMDJUMTQ6NDI6MzcrMDA6MDBCCmBxAAAAAElFTkSuQmCC), auto";
    } else {
        window.requestAnimationFrame(win);
    }
}

var allPlayersRef;

var playerID;
var playerRef;

var gamePlayers = {};
var gamePlayer;

var playerImgs = {};
var playerCos = {};
var jointime = false;

function multiInit() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // logged in
            playerID = user.uid;

            playerRef = ref(database, `players/${playerID}`);

            set(playerRef, {
                id: playerID,
                x: 20,
                y: 20,
                img: imgnum,
                cos: cosnum,
                jointime: jointime
            });

            onDisconnect(playerRef).remove();

            init2electricboogaloo();
        } else {
            // logged out?
        }
    });

    signInAnonymously(auth).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorCode, errorMessage);
    })

}

var ownerState = false;

function init2electricboogaloo() {
    allPlayersRef = ref(database, `players`);

    onValue(allPlayersRef, (snapshot) => {
        for (var key in (snapshot.val() || {})) {
            gamePlayers[key].pos.x = snapshot.val()[key].x;
            gamePlayers[key].pos.y = snapshot.val()[key].y;
            playerImgs[key] = snapshot.val()[key].img;
            playerCos[key] = snapshot.val()[key].cos;
        }
    });

    onChildAdded(allPlayersRef, (snapshot) => {
        var addedPlayer = snapshot.val();

        if (addedPlayer.id == playerID) {
            gamePlayer = new Player(new Vector(addedPlayer.x, addedPlayer.y), new Vector(0, 0));
            gamePlayers[addedPlayer.id] = gamePlayer;
            console.log("e");
            jointime = Date.now();

            update(playerRef, {
                jointime: jointime
            });
        } else {
            var p = new Player(new Vector(addedPlayer.x, addedPlayer.y), new Vector(0, 0));
            gamePlayers[addedPlayer.id] = p;
        }
    });

    onChildRemoved(allPlayersRef, (snapshot) => {
        delete(gamePlayers[snapshot.val().id]);
    });
    
    window.requestAnimationFrame(multi);
}

function multi() {
    theme.play();
    ferment();
    aerobic();
    //console.log(gamePlayers);
    if (!trans) {
        window.requestAnimationFrame(multi);
    }
}

function ferment() {
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
    token.vel.y += (gravity / 4);

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
    token.pos.add(token.vel);

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

    if (token.pos.y >= 448 && score >= 3450 && allowKeyFall == true) {
        dropKey();
        if (token.pos.y <= 448) {
            allowKeyFall = false
            console.log("NO KEY >:(");
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
        if (Math.floor((Math.random() * 10) + 1) == 10) {
            if (score >= 3450) {
                allowKeyFall = true;
                console.log("DROPPING KEY");
            }
        }
    }

    if (AABB(player.pos.x, player.pos.y, 64, 64, child.pos.x, child.pos.y, 64, 64)) {
        dropChild();
        score -= 50;
    }

    if (AABB(player.pos.x, player.pos.y, 64, 64, token.pos.x, token.pos.y, 64, 64)) {
        score += 100;
        if (score >= 3450) {
            unlocked.push(keySkin);
            console.log("COLLECTED");
            allowKeyFall = false;
        }
        if (score >= 6900) {
            winned = true;
        }
    }

    friction = 0.9;
    for (var i = 0; i < deadBabieX.length; i++) {
        if (AABB(player.pos.x, player.pos.y, 64, 64, deadBabieX[i], babydeathheight, 64, 64)) {
            friction /= 9;
        }
    }
if(luigi) {
    for (var i = 0; i < deadBabieX.length; i++) {
        if (mouseX >= deadBabieX[i] && mouseX <= deadBabieX[i] + 64 && mouseY >= babydeathheight + 48 && mouseY <= babydeathheight + 64) {
            deadBabieX.splice(i, 1);
            succ.play();
        }
    }
}

gamePlayer.pos.x = player.pos.x;
gamePlayer.pos.y = player.pos.y;
update(playerRef, {
        id: playerID,
        x: gamePlayer.pos.x,
        y: gamePlayer.pos.y,
        img: imgnum,
        cos: cosnum
    });

}

function aerobic() {
    
    timeimeimeimeiemeimiemiemiemikemekemieike++;

    trans = false; 

    if (trans == false) {   
   // draw background
    ctx.drawImage(spirtImg, 700, 20, 650, 650, 0, 0, 512, 512);

    // draw bone
    ctx.drawImage(spirtImg, 1040, 700, 319, 319, bone.pos.x, bone.pos.y, 64, 64);

    // draw child
    ctx.drawImage(spirtImg, 20, 700, 319, 319, child.pos.x, child.pos.y, 64, 64);

    // draw token
    if(keySkin == "common") {
        ctx.drawImage(loot, 520, 10, 160, 160, token.pos.x, token.pos.y, 64, 64);
    } else {
        if(keySkin == "uncommon") {
            ctx.drawImage(loot, 520, 180, 160, 160, token.pos.x, token.pos.y, 64, 64);
        } else {
            if(keySkin == "rare") {
                ctx.drawImage(loot, 520, 350, 160, 160, token.pos.x, token.pos.y, 64, 64);
            } else {
                if(keySkin == "epic") {
                    ctx.drawImage(loot, 520, 520, 160, 160, token.pos.x, token.pos.y, 64, 64);
                }
            }
        }
    }
    // dead baby anim
    drawDeath();

    // draw dead babies
    for (var i = 0; i < deadBabieX.length; i++) {
        ctx.drawImage(spirtImg, 360, 700, 320, 320, deadBabieX[i], babydeathheight, 64, 64);
    }

    for (var key in gamePlayers) {

        if (key == playerID) {
                if (playerImgs[key] == 4){
                    ctx.drawImage(spirtImg, 1040, 1720, 320, 320, player.pos.x, player.pos.y, 64, 64);
                } else {
                    if (playerImgs[key] == 3) {
                        ctx.drawImage(spirtImg, 700, 1720, 320, 320, player.pos.x, player.pos.y, 64, 64);
                    } else {
                        if (playerImgs[key] == 2) {
                            ctx.drawImage(spirtImg, 360, 1720, 320, 320, player.pos.x, player.pos.y, 64, 64);
                        } else {
                            if (playerImgs[key] == 1) {
                                ctx.drawImage(spirtImg, 20, 1720, 320, 320, player.pos.x, player.pos.y, 64, 64);
                            } else {
                                if (playerImgs[key] == 5) {
                                    ctx.drawImage(cosm, 0, 10, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                } else {
                                    if (playerImgs[key] == 6) {
                                        ctx.drawImage(cosm, 170, 10, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                    } else {
                                        if (playerImgs[key] == 7) {
                                            ctx.drawImage(cosm, 340, 10, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                        } else {
                                            if (playerImgs[key] == 8) {
                                                ctx.drawImage(cosm, 0, 180, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                            } else {
                                                if (playerImgs[key] == 9) {
                                                    ctx.drawImage(cosm, 170, 180, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                                } else {
                                                    if (playerImgs[key] == 10) {
                                                        ctx.drawImage(cosm, 340, 180, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                                    } else {
                                                        if (playerImgs[key] == 11) {
                                                            ctx.drawImage(cosm, 0, 350, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                                        } else {
                                                            if (playerImgs[key] == 12) {
                                                                ctx.drawImage(cosm, 170, 350, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                                            } else {
                                                                if (playerImgs[key] == 13) {
                                                                    ctx.drawImage(cosm, 340, 350, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                                                } else {
                                                                ctx.drawImage(spirtImg, 700, 700, 320, 320, player.pos.x, player.pos.y, 64, 64);
                                                                }
                                                            }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (playerCos[key] == 1){
                ctx.drawImage(cosm, 170, 520, 160, 160, player.pos.x, player.pos.y, 64, 64);
            } else {
                if (playerCos[key] == 2) {
                    ctx.drawImage(cosm, 340, 520, 160, 160, player.pos.x, player.pos.y, 64, 64);
                } else {
                    if (playerCos[key] == 3) {
                        ctx.drawImage(cosm, 0, 690, 160, 160, player.pos.x, player.pos.y, 64, 64);
                    } else {
                        if (playerCos[key] == 4) {
                            ctx.drawImage(cosm, 170, 690, 160, 160, player.pos.x, player.pos.y, 64, 64);
                        } else {
                            if (playerCos[key] == 5) {
                                ctx.drawImage(cosm, 340, 690, 160, 160, player.pos.x, player.pos.y, 64, 64);
                            } else {
                                if (playerCos[key] == 6) {
                                    ctx.drawImage(cosm, 0, 860, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                } else {
                                    if (playerCos[key] == 7) {
                                        ctx.drawImage(cosm, 170, 860, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                    } else { 
                                    if (playerCos[key] == 0) {
                                        ctx.drawImage(cosm, 0, 520, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                    } else {
                                    if (playerCos[key] == 8) {
                                            ctx.drawImage(cosm, 340, 860, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                        } else { 
                                            if (playerCos[key] == 9) {
                                                ctx.drawImage(cosm, 0, 1030, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                            } else {
                                                if (playerCos[key] == 10) {
                                                    ctx.drawImage(cosm, 170, 1030, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                                } else {
                                                    if (playerCos[key] == 11) {
                                                        ctx.drawImage(cosm, 340, 1030, 160, 160, player.pos.x, player.pos.y, 64, 64);
                                                    } else 
                                                    {
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }  
                    }
                }
            }
        }
}
        }
        if (key != playerID) {
                if (playerImgs[key] == 4){
                    ctx.drawImage(spirtImg, 1040, 1720, 320, 320, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                } else {
                    if (playerImgs[key] == 3) {
                        ctx.drawImage(spirtImg, 700, 1720, 320, 320, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                    } else {
                        if (playerImgs[key] == 2) {
                            ctx.drawImage(spirtImg, 360, 1720, 320, 320, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                        } else {
                            if (playerImgs[key] == 1) {
                                ctx.drawImage(spirtImg, 20, 1720, 320, 320, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                            } else {
                                if (playerImgs[key] == 5) {
                                    ctx.drawImage(cosm, 0, 10, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                } else {
                                    if (playerImgs[key] == 6) {
                                        ctx.drawImage(cosm, 170, 10, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                    } else {
                                        if (playerImgs[key] == 7) {
                                            ctx.drawImage(cosm, 340, 10, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                        } else {
                                            if (playerImgs[key] == 8) {
                                                ctx.drawImage(cosm, 0, 180, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                            } else {
                                                if (playerImgs[key] == 9) {
                                                    ctx.drawImage(cosm, 170, 180, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                                } else {
                                                    if (playerImgs[key] == 10) {
                                                        ctx.drawImage(cosm, 340, 180, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                                    } else {
                                                        if (playerImgs[key] == 11) {
                                                            ctx.drawImage(cosm, 0, 350, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                                        } else {
                                                            if (playerImgs[key] == 12) {
                                                                ctx.drawImage(cosm, 170, 350, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                                            } else {
                                                                if (playerImgs[key] == 13) {
                                                                    ctx.drawImage(cosm, 340, 350, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                                                } else {
                                                                    ctx.drawImage(spirtImg, 700, 700, 320, 320, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (playerCos[key] == 1){
                ctx.drawImage(cosm, 170, 520, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
            } else {
                if (playerCos[key] == 2) {
                    ctx.drawImage(cosm, 340, 520, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                } else {
                    if (playerCos[key] == 3) {
                        ctx.drawImage(cosm, 0, 690, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                    } else {
                        if (playerCos[key] == 4) {
                            ctx.drawImage(cosm, 170, 690, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                        } else {
                            if (playerCos[key] == 5) {
                                ctx.drawImage(cosm, 340, 690, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                            } else {
                                if (playerCos[key] == 6) {
                                    ctx.drawImage(cosm, 0, 860, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                } else {
                                    if (playerCos[key] == 7) {
                                        ctx.drawImage(cosm, 170, 860, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                    } else {
                                    if (playerCos[key] == 0) {
                                        ctx.drawImage(cosm, 0, 520, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                    } else {
                                    if (playerCos[key] == 8) {
                                            ctx.drawImage(cosm, 340, 860, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                        } else {
                                            if (playerCos[key] == 9) {
                                                ctx.drawImage(cosm, 0, 1020, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                            } else {
                                                if (playerCos[key] == 10) {
                                                    ctx.drawImage(cosm, 170, 1020, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                                } else {
                                                    if (playerCos[key] == 11) {
                                                        ctx.drawImage(cosm, 340, 1020, 160, 160, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
                                                    } else {
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } 
                        }
                    }
                }
            }
        }
    }
}
    
    // draw score
    drawScore();
}

if (AABB(mouseX, mouseY, 1, 1, 316, 4, 196, 72)) {
    if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
        timeimeimeimeiemeimiemiemiemikemekemieike = 0;
        ctx.drawImage(butt, 0, 720, 490, 180, 316, 4, 176, 72)
        trans = true;
        console.log("logging your MOM");
        window.requestAnimationFrame(titty);
    }
    ctx.drawImage(butt, 0, 720, 490, 180, 316, 0, 196, 80)
} else {
    ctx.drawImage(butt, 0, 720, 490, 180, 316, 4, 196, 72)
}
    
}

var timeimeimeimeiemeimiemiemiemikemekemieike = 0;

function imgch() {
    timeimeimeimeiemeimiemiemiemikemekemieike++;

    cosmetic = false;
    trans = false;
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 512, 512);


    if (AABB(mouseX, mouseY, 5, 5, 20, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(spirtImg, 700, 700, 320, 320, 25, 20, 10, 20);
            imgnum = 0;
        } else {
            ctx.drawImage(spirtImg, 700, 700, 320, 320, 15, 20, 30, 20);
        }
    } else {
        ctx.drawImage(spirtImg, 700, 700, 320, 320, 20, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 50, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(spirtImg, 20, 1720, 320, 320, 55, 20, 10, 20);
            imgnum = 1;
        } else {
            ctx.drawImage(spirtImg, 20, 1720, 320, 320, 45, 20, 30, 20);
        }
    } else {
        ctx.drawImage(spirtImg, 20, 1720, 320, 320, 50, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 80, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(spirtImg, 360, 1720, 320, 320, 85, 20, 10, 20);
            imgnum = 2;
        } else {
            ctx.drawImage(spirtImg, 360, 1720, 320, 320, 75, 20, 30, 20);
        }
    } else {
        ctx.drawImage(spirtImg, 360, 1720, 320, 320, 80, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 110, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(spirtImg, 700, 1720, 320, 320, 115, 20, 10, 20);
            imgnum = 3;
        } else {
            ctx.drawImage(spirtImg, 700, 1720, 320, 320, 105, 20, 30, 20);
        }
    } else {
        ctx.drawImage(spirtImg, 700, 1720, 320, 320, 110, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 140, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(spirtImg, 1040, 1720, 320, 320, 145, 20, 10, 20);
            imgnum = 4;
        } else {
            ctx.drawImage(spirtImg, 1040, 1720, 320, 320, 135, 20, 30, 20);
        }
    } else {
        ctx.drawImage(spirtImg, 1040, 1720, 320, 320, 140, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 170, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 0, 10, 160, 160, 175, 20, 10, 20);
            imgnum = 5;
        } else {
            ctx.drawImage(cosm, 0, 10, 160, 160, 165, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 0, 10, 160, 160, 170, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 200, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 170, 10, 160, 160, 205, 20, 10, 20);
            imgnum = 6;
        } else {
            ctx.drawImage(cosm, 170, 10, 160, 160, 195, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 170, 10, 160, 160, 200, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 230, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 340, 10, 160, 160, 235, 20, 10, 20);
            imgnum = 7;
        } else {
            ctx.drawImage(cosm, 340, 10, 160, 160, 225, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 340, 10, 160, 160, 230, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 260, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 0, 180, 160, 160, 265, 20, 10, 20);
            imgnum = 8;
        } else {
            ctx.drawImage(cosm, 0, 180, 160, 160, 255, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 0, 180, 160, 160, 260, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 290, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 170, 180, 160, 160, 295, 20, 10, 20);
            imgnum = 9;
        } else {
            ctx.drawImage(cosm, 170, 180, 160, 160, 285, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 170, 180, 160, 160, 290, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 320, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 340, 180, 160, 160, 325, 20, 10, 20);
            imgnum = 10;
        } else {
            ctx.drawImage(cosm, 340, 180, 160, 160, 315, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 340, 180, 160, 160, 320, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 350, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 0, 350, 160, 160, 355, 20, 10, 20);
            imgnum = 11;
        } else {
            ctx.drawImage(cosm, 0, 350, 160, 160, 345, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 0, 350, 160, 160, 350, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 380, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 170, 350, 160, 160, 385, 20, 10, 20);
            imgnum = 12;
        } else {
            ctx.drawImage(cosm, 170, 350, 160, 160, 375, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 170, 350, 160, 160, 380, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 410, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 340, 350, 160, 160, 415, 20, 10, 20);
            imgnum = 13;
        } else {
            ctx.drawImage(cosm, 340, 350, 160, 160, 405, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 340, 350, 160, 160, 410, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 1, 1, 276, 444, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(butt, 0, 720, 490, 180, 286, 444, 176, 72)
            cosmetic = true;
            window.requestAnimationFrame(imgSelec);
        }
        ctx.drawImage(butt, 0, 720, 490, 180, 276, 440, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 720, 490, 180, 276, 444, 196, 72)
    }

    if (!cosmetic) {
        window.requestAnimationFrame(imgch);
    } else {
        
    }

}

function imgcos() {
    timeimeimeimeiemeimiemiemiemikemekemieike++;

    cosmetic = false;
    trans = false;
    ctx.beginPath();
    ctx.fillStyle = "#248963";
    ctx.fillRect(0, 0, 512, 512);
    if (AABB(mouseX, mouseY, 5, 5, 20, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 0, 520, 160, 160, 25, 20, 10, 20);
            cosnum = 0;
        } else {
            ctx.drawImage(cosm, 0, 520, 160, 160, 15, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 0, 520, 160, 160, 20, 20, 20, 20);
    }
 
 
    if (AABB(mouseX, mouseY, 5, 5, 50, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 170, 520, 160, 160, 55, 20, 10, 20);
            cosnum = 1;
        } else {
            ctx.drawImage(cosm, 170, 520, 160, 160, 45, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 170, 520, 160, 160, 50, 20, 20, 20);
    }
 
 
    if (AABB(mouseX, mouseY, 5, 5, 80, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 340, 520, 160, 160, 85, 20, 10, 20);
            cosnum = 2;
        } else {
            ctx.drawImage(cosm, 340, 520, 160, 160, 75, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 340, 520, 160, 160, 80, 20, 20, 20);
    }
 
 
    if (AABB(mouseX, mouseY, 5, 5, 110, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 0, 690, 160, 160, 115, 20, 10, 20);
            cosnum = 3;
        } else {
            ctx.drawImage(cosm, 0, 690, 160, 160, 105, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 0, 690, 160, 160, 110, 20, 20, 20);
    }
 
 
    if (AABB(mouseX, mouseY, 5, 5, 140, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 170, 690, 160, 160, 145, 20, 10, 20);
            cosnum = 4;
        } else {
            ctx.drawImage(cosm, 170, 690, 160, 160, 135, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 170, 690, 160, 160, 140, 20, 20, 20);
    }
 
 
    if (AABB(mouseX, mouseY, 5, 5, 170, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 340, 690, 160, 160, 175, 20, 10, 20);
            cosnum = 5;
        } else {
            ctx.drawImage(cosm, 340, 690, 160, 160, 165, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 340, 690, 160, 160, 170, 20, 20, 20);
    }
 
 
    if (AABB(mouseX, mouseY, 5, 5, 200, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 0, 860, 160, 160, 205, 20, 10, 20);
            cosnum = 6;
        } else {
            ctx.drawImage(cosm, 0, 860, 160, 160, 195, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 0, 860, 160, 160, 200, 20, 20, 20);
    }
 
 
    if (AABB(mouseX, mouseY, 5, 5, 230, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 170, 860, 160, 160, 235, 20, 10, 20);
            cosnum = 7;
        } else {
            ctx.drawImage(cosm, 170, 860, 160, 160, 225, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 170, 860, 160, 160, 230, 20, 20, 20);
    }
 
 
    if (AABB(mouseX, mouseY, 5, 5, 260, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 340, 860, 160, 160, 265, 20, 10, 20);
            cosnum = 8;
        } else {
            ctx.drawImage(cosm, 340, 860, 160, 160, 255, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 340, 860, 160, 160, 260, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 290, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 0, 1030, 160, 160, 295, 20, 10, 20);
            cosnum = 9;
        } else {
            ctx.drawImage(cosm, 0, 1030, 160, 160, 285, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 0, 1030, 160, 160, 290, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 320, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 170, 1030, 160, 160, 325, 20, 10, 20);
            cosnum = 10;
        } else {
            ctx.drawImage(cosm, 170, 1030, 160, 160, 315, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 170, 1030, 160, 160, 320, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 5, 5, 350, 20, 20, 20)) {
        if (mouseDown) {
            ctx.drawImage(cosm, 340, 1030, 160, 160, 355, 20, 10, 20);
            cosnum = 11;
        } else {
            ctx.drawImage(cosm, 340, 1030, 160, 160, 345, 20, 30, 20);
        }
    } else {
        ctx.drawImage(cosm, 340, 1030, 160, 160, 350, 20, 20, 20);
    }

    if (AABB(mouseX, mouseY, 1, 1, 276, 444, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(butt, 0, 720, 490, 180, 286, 444, 176, 72)
            cosmetic = true;
            window.requestAnimationFrame(imgSelec);
        }
        ctx.drawImage(butt, 0, 720, 490, 180, 276, 440, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 720, 490, 180, 276, 444, 196, 72)
    }

    if (!cosmetic) {
        window.requestAnimationFrame(imgcos);
    } else {
        
    }

}

function imgSelec() {
    timeimeimeimeiemeimiemiemiemikemekemieike++;

    trans = false;
    ctx.beginPath();
    ctx.fillStyle = "#aedca6";
    ctx.fillRect(0, 0, 512, 512);

    if (AABB(mouseX, mouseY, 1, 1, 0, 0, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(butt, 0, 900, 490, 180, 0, 0, 176, 72)
            cosmetic = false;
            trans = true;
            window.requestAnimationFrame(imgcos);
        }
        ctx.drawImage(butt, 0, 900, 490, 180, 0, 4, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 900, 490, 180, 0, 0, 196, 72)
    }

    if (AABB(mouseX, mouseY, 1, 1, 200, 0, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(butt, 0, 1080, 490, 180, 200, 0, 176, 72)
            cosmetic = false;
            trans = true;
            window.requestAnimationFrame(imgch);
        }
        ctx.drawImage(butt, 0, 1080, 490, 180, 200, 4, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 1080, 490, 180, 200, 0, 196, 72)
    }

    if (AABB(mouseX, mouseY, 1, 1, 276, 444, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(butt, 0, 720, 490, 180, 286, 444, 176, 72)
            cosmetic = false;
            trans = true;
            window.requestAnimationFrame(titty);
        }
        ctx.drawImage(butt, 0, 720, 490, 180, 276, 440, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 720, 490, 180, 276, 444, 196, 72)
    }

    if (!trans) {
        window.requestAnimationFrame(imgSelec);
    }

    cosmetic = true;

}

function shop() {
    timeimeimeimeiemeimiemiemiemikemekemieike++;


    trans = false;
    ctx.beginPath();
    ctx.fillStyle = "#b6e3aa";
    ctx.fillRect(0, 0, 512, 512);

    if (AABB(mouseX, mouseY, 5, 5, 40, 40, 40, 40)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(loot, 10, 10, 160, 160, 35, 40, 30, 40);
            if (unlocked.includes("common")) {
                unlocked.splice("common", 1);
                console.log(unlocked);
            } else {
                alert("YOU DON'T HAVE THE KEY IDIOT")
                console.log(unlocked);
            }
        } else {
            ctx.drawImage(loot, 10, 10, 160, 160, 45, 40, 50, 40);
        }
    } else {
        ctx.drawImage(loot, 10, 10, 160, 160, 40, 40, 40, 40);
    }

    if (AABB(mouseX, mouseY, 5, 5, 90, 40, 40, 40)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(loot, 10, 180, 160, 160, 85, 40, 30, 40);
            if (unlocked.includes("uncommon")) {
                unlocked.splice("uncommon", 1);
                console.log(unlocked);
            } else {
                alert("YOU DON'T HAVE THE KEY IDIOT")
                console.log(unlocked);
            }
        } else {
            ctx.drawImage(loot, 10, 180, 160, 160, 95, 40, 50, 40);
        }
    } else {
        ctx.drawImage(loot, 10, 180, 160, 160, 90, 40, 40, 40);
    }

    if (AABB(mouseX, mouseY, 5, 5, 140, 40, 40, 40)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(loot, 10, 350, 160, 160, 135, 40, 30, 40);
            if (unlocked.includes("rare")) {
                unlocked.splice("rare", 1);
                console.log(unlocked);
            } else {
                alert("YOU DON'T HAVE THE KEY IDIOT")
                console.log(unlocked);
            }
        } else {
            ctx.drawImage(loot, 10, 350, 160, 160, 145, 40, 50, 40);
        }
    } else {
        ctx.drawImage(loot, 10, 350, 160, 160, 140, 40, 40, 40);
    }

    if (AABB(mouseX, mouseY, 5, 5, 190, 40, 40, 40)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(loot, 10, 520, 160, 160, 185, 40, 30, 40);
            if (unlocked.includes("epic")) {
                unlocked.splice("epic", 1);
                console.log(unlocked);
            } else {
                alert("YOU DON'T HAVE THE KEY IDIOT")
                console.log(unlocked);
            }
        } else {
            ctx.drawImage(loot, 10, 520, 160, 160, 195, 40, 50, 40);
        }
    } else {
        ctx.drawImage(loot, 10, 520, 160, 160, 190, 40, 40, 40);
    }
    
    if (AABB(mouseX, mouseY, 1, 1, 276, 444, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(butt, 0, 720, 490, 180, 286, 444, 176, 72)
            trans = true;
            window.requestAnimationFrame(titty);
        }
        ctx.drawImage(butt, 0, 720, 490, 180, 276, 440, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 720, 490, 180, 276, 444, 196, 72)
    }
    if (!trans) {
        window.requestAnimationFrame(shop);
    }

}

function multiPG() {
    timeimeimeimeiemeimiemiemiemikemekemieike++;

    trans = false;
    ctx.beginPath();
    ctx.fillStyle = "#aedca6";
    ctx.fillRect(0, 0, 512, 512);

    if (AABB(mouseX, mouseY, 1, 1, 0, 0, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(butt, 0, 1440, 490, 180, 0, 0, 176, 72)
            trans = true;
            window.requestAnimationFrame(multiInit);
        }
        ctx.drawImage(butt, 0, 1440, 490, 180, 0, 4, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 1440, 490, 180, 0, 0, 196, 72)
    }

    if (AABB(mouseX, mouseY, 1, 1, 200, 0, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(butt, 0, 1260, 490, 180, 200, 0, 176, 72)
            trans = true;
        }
        ctx.drawImage(butt, 0, 1260, 490, 180, 200, 4, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 1260, 490, 180, 200, 0, 196, 72)
    }

    if (AABB(mouseX, mouseY, 1, 1, 276, 444, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            ctx.drawImage(butt, 0, 720, 490, 180, 286, 444, 176, 72)
            trans = true;
            window.requestAnimationFrame(titty);
        }
        ctx.drawImage(butt, 0, 720, 490, 180, 276, 440, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 720, 490, 180, 276, 444, 196, 72)
    }

    if (!trans) {
        window.requestAnimationFrame(multiPG);
    }

}

var trans = false;
function titty() {
    timeimeimeimeiemeimiemiemiemikemekemieike++;
    // draw background
    ctx.drawImage(spirtImg, 20, 1040, 650, 650, 0, 0, 512, 512);
    trans = false;
    if (AABB(mouseX, mouseY, 1, 1, 30, 372, 216, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            winned = false;
            trans = true;
            window.requestAnimationFrame(main);
        }
        ctx.drawImage(butt, 0, 0, 490, 180, 30, 368, 216, 80)
    } else {
        ctx.drawImage(butt, 0, 0, 490, 180, 30, 372, 216, 72)
    }
    if (AABB(mouseX, mouseY, 1, 1, 40, 444, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            winned = false;
            trans = true;
            window.requestAnimationFrame(multiPG);
        }
        ctx.drawImage(butt, 0, 180, 490, 180, 40, 440, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 180, 490, 180, 40, 444, 196, 72)
    }
    if (AABB(mouseX, mouseY, 1, 1, 276, 444, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            winned = false;
            trans = true;
            window.requestAnimationFrame(imgSelec);
        }
        ctx.drawImage(butt, 0, 540, 490, 180, 276, 440, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 540, 490, 180, 276, 444, 196, 72)
    }
    if (AABB(mouseX, mouseY, 1, 1, 276, 372, 196, 72)) {
        if (mouseDown && timeimeimeimeiemeimiemiemiemikemekemieike > 40) {
            timeimeimeimeiemeimiemiemiemikemekemieike = 0;
            winned = false;
            trans = true;
            window.requestAnimationFrame(shop);
        }
        ctx.drawImage(butt, 0, 360, 490, 180, 276, 368, 196, 80)
    } else {
        ctx.drawImage(butt, 0, 360, 490, 180, 276, 372, 196, 72)
    }
    if (!trans) {
        window.requestAnimationFrame(titty);
    }
}

// request anim frame
window.requestAnimationFrame(titty);
