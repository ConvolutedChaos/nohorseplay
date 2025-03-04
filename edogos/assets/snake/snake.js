const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
let snake = [{ x: 10 * box, y: 10 * box }];
let food = { x: Math.floor(Math.random() * 20) * box, y: Math.floor(Math.random() * 20) * box };
let direction = "RIGHT";
let score = 0;
let highScore = getHighScore();
let game = setInterval(draw, 100);
let gameOver = false;

document.addEventListener("keydown", changeDirection);
function changeDirection(event) {
    if (gameOver) return;
    const key = event.keyCode;
    if (key === 37 && direction !== "RIGHT") direction = "LEFT";
    else if (key === 38 && direction !== "DOWN") direction = "UP";
    else if (key === 39 && direction !== "LEFT") direction = "RIGHT";
    else if (key === 40 && direction !== "UP") direction = "DOWN";
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);
    
    ctx.fillStyle = "lime";
    snake.forEach((segment, index) => {
        ctx.fillRect(segment.x, segment.y, box, box);
    });
    
    let newHead = { x: snake[0].x, y: snake[0].y };
    if (direction === "LEFT") newHead.x -= box;
    else if (direction === "RIGHT") newHead.x += box;
    else if (direction === "UP") newHead.y -= box;
    else if (direction === "DOWN") newHead.y += box;
    
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        food = { x: Math.floor(Math.random() * 20) * box, y: Math.floor(Math.random() * 20) * box };
        if (score > highScore) {
            highScore = score;
            setHighScore(highScore);
        }
    } else {
        snake.pop();
    }
    
    if (newHead.x < 0 || newHead.y < 0 || newHead.x >= canvas.width || newHead.y >= canvas.height || collision(newHead, snake)) {
        gameOver = true;
        clearInterval(game);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
        setTimeout(() => {
            snake = [{ x: Math.floor(canvas.width / (2 * box)) * box, y: Math.floor(canvas.height / (2 * box)) * box }];
            direction = "RIGHT";
            score = 0;
            gameOver = false;
            game = setInterval(draw, 100);
        }, 2000);
        return;
    }
    
    snake.unshift(newHead);
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("High Score: " + highScore, 10, 40);
}

function collision(head, body) {
    return body.some(segment => head.x === segment.x && head.y === segment.y);
}

function getHighScore() {
    let cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        let [key, value] = cookies[i].split('=');
        if (key === "highScore") return parseInt(value);
    }
    return 0;
}

function setHighScore(score) {
    document.cookie = "highScore=" + score + "; path=/";
}
