const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const owlImage = new Image();
owlImage.src = 'owl.png'; // Replace with the path to your owl image
const coinImage = new Image();
coinImage.src = 'coin.png'; // Replace with the path to your coin image

// Load sounds for collecting coins and crashing
const coinSound = new Audio('coin-sound.mp3'); // Replace with the path to your coin sound file
const crashSound = new Audio('crash-sound.mp3'); // Replace with the path to your crash sound file

const gravity = 0.1; 
const lift = -5; // Reduced lift intensity for smoother jumps
const pipeWidth = 60; 
const pipeGap = 250; // Further increased gap to make it easier
const minPipeHeight = 50; // Minimum height for pipes
const maxPipeHeight = canvas.height - pipeGap - minPipeHeight; // Maximum height for pipes

let owl = { x: 50, y: 200, width: 40, height: 40, velocity: 0 };
let pipes = [];
let coins = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let isGameOver = false;

// Owl drawing function
function drawOwl() {
    ctx.drawImage(owlImage, owl.x, owl.y, owl.width, owl.height);
}

// Coin drawing function
function drawCoin(coin) {
    ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);
}

// Pipe drawing function
function drawPipe(pipe) {
    ctx.fillStyle = "black"; 
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
}

// Create new coin
function createCoin(pipe) {
    let coin = {
        x: pipe.x + pipeWidth + Math.random() * (pipeGap - 20),
        y: pipe.top + pipeGap / 2 + Math.random() * 40 - 20, // Centered in the gap with some variance
        width: 20,
        height: 20
    };
    coins.push(coin);
}

// Create new pipe
function createPipe() {
    let top = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
    let bottom = canvas.height - top - pipeGap;
    let pipe = { x: canvas.width, top: top, bottom: bottom };
    pipes.push(pipe);
    createCoin(pipe); // Create a coin near the pipe gap
}

// Update owl's position
function updateOwl() {
    owl.velocity += gravity;
    owl.y += owl.velocity;

    if (owl.y + owl.height > canvas.height || owl.y < 0) {
        crashSound.play(); // Play crash sound when the owl crashes
        isGameOver = true;
    }
}

// Update pipes and check for collisions
function updatePipes() {
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= 3;
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }

        // Check for collisions with pipes
        if (
            (owl.x + owl.width > pipes[i].x && owl.x < pipes[i].x + pipeWidth) &&
            (owl.y < pipes[i].top || owl.y + owl.height > canvas.height - pipes[i].bottom)
        ) {
            crashSound.play(); // Play crash sound when the owl hits a pipe
            isGameOver = true;
        }
    }

    if (pipes.length === 0 || (pipes.length > 0 && pipes[pipes.length - 1].x < canvas.width - 200)) { 
        createPipe();
    }
}

// Update coins and check for collisions
function updateCoins() {
    for (let i = 0; i < coins.length; i++) {
        coins[i].x -= 3;
        if (coins[i].x + coins[i].width < 0) {
            coins.splice(i, 1);
        }
    }
}

// Check for collisions between the owl and coins
function checkCollision() {
    for (let i = 0; i < coins.length; i++) {
        if (
            owl.x < coins[i].x + coins[i].width &&
            owl.x + owl.width > coins[i].x &&
            owl.y < coins[i].y + coins[i].height &&
            owl.y + owl.height > coins[i].y
        ) {
            score += 10;
            coinSound.play(); // Play sound when coin is collected
            coins.splice(i, 1);
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
            }
        }
    }
}

// Draw the score and high score
function drawScore() {
    document.getElementById("score").innerText = score;
    document.getElementById("highScore").innerText = highScore;
}

// Display Game Over message
function displayGameOver() {
    ctx.fillStyle = "black";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "24px Arial";
    ctx.fillText("Press Space to Restart", canvas.width / 2, canvas.height / 2 + 20);
}

// Reset the game
function resetGame() {
    owl.y = 200;
    owl.velocity = 0;
    pipes = [];
    coins = [];
    score = 0;
    isGameOver = false;
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isGameOver) {
        updateOwl();
        updatePipes();
        updateCoins();
        checkCollision();
        drawOwl();
        for (let i = 0; i < pipes.length; i++) {
            drawPipe(pipes[i]);
        }
        for (let i = 0; i < coins.length; i++) {
            drawCoin(coins[i]);
        }
        drawScore();
        requestAnimationFrame(gameLoop);
    } else {
        displayGameOver(); // Display "GAME OVER!" when the game ends
    }
}

// Handle spacebar and arrow key events
document.addEventListener('keydown', function (event) {
    if ((event.code === 'Space' || event.code === 'ArrowUp')) {
        if (isGameOver) {
            resetGame();
            gameLoop();
        } else {
            owl.velocity = lift;
        }
    }
});

// Start the game loop
gameLoop();
