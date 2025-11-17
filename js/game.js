document.addEventListener("DOMContentLoaded", init);

let canvas, ctx;
let CANVAS_WIDTH, CANVAS_HEIGHT;

let leftPressed = false;
let rightPressed = false;

// tipke za upravljanje su strelice za lijevo i desno
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft")  leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
});

// y os za gore dolje, x os za desno lijevo
// (0,0) gornji lijevi kut

let bar = {
    x: 0, // položaj centra palice 
    y: 0, 
    width: 100,
    height: 15,
    speed: 6 // px po frameu
};

let ball = {
    x: 0, // položaj centra loptice
    y: 0,
    size: 10,
    speed: 5, // px po frameu
    vx: 0, // horizontalna brzina
    vy: 0, // vertikalna brzina

    resetOnBar() {
        this.x = bar.x;
        this.y = bar.y - bar.height / 2 - this.size / 2;
    },

    launch() {
        // slučajno lijevo gore ili desno gore pod kutem od 45 stupnjeva
        const angle = 45 * Math.PI / 180;
        const dir = Math.random() < 0.5 ? -1 : 1;

        this.vx = dir * this.speed * Math.sin(angle);
        this.vy = -this.speed * Math.cos(angle);
    }
};

let gameState = "START";
let highscore = 0;

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d"); // za crtanje na canvasu

    CANVAS_WIDTH = canvas.width;
    CANVAS_HEIGHT = canvas.height;

    // cigle
    initBricks();

    // bodovi
    let stored = localStorage.getItem("highscore");
    if (stored !== null) {
        highscore = parseInt(stored);
    }

    // stavi palicu na dno
    bar.x = CANVAS_WIDTH / 2;
    bar.y = CANVAS_HEIGHT - 40;

    ball.resetOnBar();
    document.addEventListener("keydown", spaceKey);

    // pokreni igru
    requestAnimationFrame(game);
}

function spaceKey(e) {
    if (e.key === " ") {
        if (gameState === "START") {
            ball.launch();
            gameState = "PLAYING";
        }
    }

    if (gameState === "WIN" || gameState === "GAMEOVER") {
            resetGame();
            gameState = "START";
    }
}

function drawStartScreen() {
    // crna pozadina
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // vidljivi rub bijele boje širine 5 piksela
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // tekst BREAKOUT
    ctx.font = "bold 36px Helvetica";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BREAKOUT", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    // tekst Press SPACE
    ctx.font = "italic bold 18px Helvetica";
    ctx.fillText("Press SPACE to begin", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

}

function game() {
    update();
    draw();
    // pokreni beskonačni game loop da se sve animira i stalno osvježava
    requestAnimationFrame(game);
}

function update() {
    updateBar();

    if (gameState === "START") {
        ball.resetOnBar();
    }

    if (gameState === "PLAYING") {
        ball.x += ball.vx; 
        ball.y += ball.vy; 

        wallHit();
        paddleHit();
        brickHit();
    }
}

function updateBar() {

    // da tipke lijevo i desno ne pokrenu igru nakon win ekrana
    if (gameState !== "PLAYING") return;

    let velocity = 0;

    // lijeva tipka pritisnuta, palica ide lijevo
    if (leftPressed)  velocity -= bar.speed;
    if (rightPressed) velocity += bar.speed;

    bar.x += velocity; 

    // da palica ne izađe iz lijevog ruba ekrana
    if (bar.x - bar.width / 2 < 0)
        bar.x = bar.width / 2;

    // da palica ne izađe iz desnog ruba ekrana
    if (bar.x + bar.width / 2 > CANVAS_WIDTH)
        bar.x = CANVAS_WIDTH - bar.width / 2;
}

function wallHit() {
    const half = ball.size / 2;

    // lijevi rub
    if (ball.x - half <= 0) {
        ball.x = half;
        ball.vx *= -1;
    }

    // desni rub
    if (ball.x + half >= CANVAS_WIDTH) {
        ball.x = CANVAS_WIDTH - half;
        ball.vx *= -1;
    }

    // gornji rub
    if (ball.y - half <= 0) {
        ball.y = half;
        ball.vy = Math.abs(ball.vy);
    }

    // kraj ako izađe iz donjeg ruba 
    if (ball.y - half > CANVAS_HEIGHT) {
        gameState = "GAMEOVER";
    }
}

function draw() {
    // pozadina
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // bijeli rub
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // cigle
    drawBricks();

    ctx.font = "bold 16px Helvetica";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";

    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 15);

    ctx.textAlign = "right";
    ctx.fillText("Best: " + highscore, CANVAS_WIDTH - 20, 15);

    // palica
    ctx.fillStyle = "white";
    drawBar();

    // loptica
    ctx.fillStyle = "white";
    drawBall();

    if (gameState === "START") {
        ctx.font = "bold 36px Helvetica";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.fillText("BREAKOUT", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        ctx.font = "italic bold 18px Helvetica";
        ctx.fillText("Press SPACE to begin", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }

    if (gameState === "GAMEOVER") {
        ctx.font = "bold 40px Helvetica";
        ctx.fillStyle = "yellow";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    if (gameState === "WIN") {
        ctx.font = "bold 40px Helvetica";
        ctx.fillStyle = "yellow";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("YOU WON!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

}

function paddleHit() {
    if (gameState !== "PLAYING") return;

    const half = ball.size / 2;

    // granice palice 
    const bottom = ball.y + half;
    const top = bar.y - bar.height / 2;
    const left = bar.x - bar.width / 2;
    const right = bar.x + bar.width / 2;

    // provjeri sudar loptice s palicom
    if (bottom >= top && ball.x >= left && ball.x <= right && ball.vy > 0) {
        // vertikalna refleksija
        ball.vy *= -1;

        // horizontalna refleksija
        if (ball.x < bar.x) {
            ball.vx = -Math.abs(ball.vx); // ide lijevo
        } else {  
            ball.vx = Math.abs(ball.vx); // desno
        }

        // da lopta ne uđe u palicu
        ball.y = top - half;

        return;
    }
}

function drawBall() {
    const half = ball.size / 2;
    const x = ball.x - half;
    const y = ball.y - half;

    // baza
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, ball.size, ball.size);

    // svijetli rub (gore + lijevo)
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + ball.size, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + ball.size);
    ctx.stroke();

    // tamni rub (dolje + desno)
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.moveTo(x, y + ball.size);
    ctx.lineTo(x + ball.size, y + ball.size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + ball.size, y);
    ctx.lineTo(x + ball.size, y + ball.size);
    ctx.stroke();
}


function drawBar() {
    const x = bar.x - bar.width / 2;
    const y = bar.y - bar.height / 2;

    // baza
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, bar.width, bar.height);

    // svijetli rub (gore + lijevo)
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + bar.width, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + bar.height);
    ctx.stroke();

    // tamni rub (dolje + desno)
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.moveTo(x, y + bar.height);
    ctx.lineTo(x + bar.width, y + bar.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + bar.width, y);
    ctx.lineTo(x + bar.width, y + bar.height);
    ctx.stroke();
}

function resetGame() {
    score = 0;
    initBricks();
    bar.x = CANVAS_WIDTH / 2;
    bar.y = CANVAS_HEIGHT - 40;
    ball.resetOnBar();
    ball.vx = 0;
    ball.vy = 0;
}
