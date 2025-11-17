const ROWS = 5;
const COLS = 10;

const BRICKCOLORS = [
    "rgb(153,51,0)",
    "rgb(255,0,0)",
    "rgb(255,153,204)",
    "rgb(0,255,0)",
    "rgb(255,255,153)"
];

let bricks = [];

function initBricks() {
    // razmaci cigli i gornjeg i lijevog ruba
    const top = 60;
    const left = 30;
    const h = 10; // vodoravni razmak između cigli
    const v = 10; // okomiti

    // izračun širine i visine cigli
    const brickWidth = (CANVAS_WIDTH - left * 2 - (COLS - 1) * h) / COLS;
    const brickHeight = 20;

    bricks = [];

    for (let r = 0; r < ROWS; r++) { // za svaki red
        bricks[r] = [];
        for (let c = 0; c < COLS; c++) { // za svaki stupac
            const x = left + c * (brickWidth + h);
            const y = top + r * (brickHeight + v);

            // spremi svaku ciglu
            bricks[r][c] = {
                x,
                y,
                width: brickWidth,
                height: brickHeight,
                color: BRICKCOLORS[r],
                destroyed: false // cigla postoji
            };
        }
    }
}

function drawBricks() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const b = bricks[r][c];
            if (b.destroyed) continue; // ako je cigla pogođena ne crtaj ju

            // baza pravokutnik cigle
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, b.width, b.height);

            // 3D efekt gornja svijetla linija
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(b.x + b.width, b.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(b.x, b.y + b.height);
            ctx.stroke();

            // 3D donja desna tamna linija
            ctx.strokeStyle = "rgba(0,0,0,0.4)";
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.height);
            ctx.lineTo(b.x + b.width, b.y + b.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(b.x + b.width, b.y);
            ctx.lineTo(b.x + b.width, b.y + b.height);
            ctx.stroke();
        }
    }
}

let faster = false;
let score = 0;
function brickHit() {

    const half = ball.size / 2;

    // granice loptice
    const ballLeft = ball.x - half;
    const ballRight = ball.x + half;
    const ballTop = ball.y - half;
    const ballBottom = ball.y + half;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {

            const b = bricks[r][c];
            if (b.destroyed) continue;

            // granice cigle
            const brickLeft = b.x;
            const brickRight = b.x + b.width;
            const brickTop = b.y;
            const brickBottom = b.y + b.height;

            // ako se loptica i cigla preklapaju sudar je
            if (ballRight > brickLeft && ballLeft < brickRight && ballBottom > brickTop && ballTop < brickBottom) {
                // izračunaj preklapanja 
                const overlapLeft = ballRight - brickLeft;
                const overlapRight = brickRight - ballLeft;
                const overlapTop = ballBottom - brickTop;
                const overlapBottom = brickBottom - ballTop;

                // najplići sudar da se vidi gdje će se odbit loptica
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                // kutni sudar za ubrzanje
                const diff = Math.abs(overlapLeft - overlapTop);
                if (diff < 5) {
                    // console.log("test");
                    ball.vx *= 1.1;
                    ball.vy *= 1.1;
                }

                if (minOverlap === overlapLeft) {
                    ball.vx = -Math.abs(ball.vx); // invert horizontalne brzine desno
                } 
                else if (minOverlap === overlapRight) { // odbij lijevo
                    ball.vx = Math.abs(ball.vx);
                }
                else if (minOverlap === overlapTop) { // odbij prema gore
                    ball.vy = -Math.abs(ball.vy);
                }
                else if (minOverlap === overlapBottom) { // prema dolje
                    ball.vy = Math.abs(ball.vy);
                }

                b.destroyed = true;
                score++;

                if (score > highscore) {
                    highscore = score;
                    localStorage.setItem("highscore", highscore);
                }

                if (score === ROWS * COLS) {
                    gameState = "WIN";
                    return
                }

                return; // da se izbjegne dvostruki sudar u istom frameu
            }
        }
    }
}