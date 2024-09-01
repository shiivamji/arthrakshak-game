const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const owlImage = new Image();
owlImage.src = 'owl.png'; // Replace with the path to your owl image
const coinImage = new Image();
coinImage.src = 'coin.png'; // Replace with the path to your coin image

// Load sounds for collecting coins and crashing
const coinSound = new Audio('coin-sound.mp3'); // Replace with the path to your coin sound file
const crashSound = new Audio('crash-sound.mp3'); // Replace with the path to your crash sound file

let gravity = 0.1;
let lift = -5;
let pipeWidth = 200; // Width of the pipes
let pipeGap = 250; // Gap between pipes
let pipeSpeed = 3; // Initial speed of pipes
const minPipeHeight = 50;
const maxPipeHeight = canvas.height - pipeGap - minPipeHeight;

// Start the owl slightly above the center
let owl = { x: 50, y: 150, width: 50, height: 50, velocity: 0 };

let pipes = [];
let coins = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let isGameOver = false;

// Updated fraud messages including new ones
const fraudMessages = [
    "Unrealistic Returns",
    "Fake Promises",
    "Fake Portfolio",
    "Unregulated Investments",
    "Unregistered Advisors",
    "Ponzi Scheme",
    "Too Good to be True",
    "High Risk, No Disclosure",
    "Guaranteed Returns",
    "No Documentation Needed",
    "Unlicensed Products",
    "Avoid Unsolicited Offers"
];

let messageIndex = 0; // Index to track the current message

// Owl drawing function
function drawOwl() {
    ctx.drawImage(owlImage, owl.x, owl.y, owl.width, owl.height);
}

// Coin drawing function
function drawCoin(coin) {
    ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);
}

// Pipe drawing function with labels
function drawPipe(pipe) {
    ctx.fillStyle = "black";
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial"; // Bold and slightly larger font
    ctx.textAlign = "center";

    // Display unique message for each pipe
    ctx.fillText(pipe.message, pipe.x + pipeWidth / 2, pipe.top / 2 + 10); // Adjust position as needed
    ctx.fillText(pipe.message, pipe.x + pipeWidth / 2, canvas.height - pipe.bottom / 2 - 10); // Adjust position as needed
}

// Create new coin
function createCoin(pipe) {
    // Increased coin frequency
    const numCoins = Math.floor(Math.random() * 3) + 2; // Create between 2 and 4 coins
    for (let i = 0; i < numCoins; i++) {
        let coin = {
            x: pipe.x + pipeWidth + Math.random() * (pipeGap - 20),
            y: pipe.top + pipeGap / 2 + Math.random() * 40 - 20,
            width: 20,
            height: 20
        };
        coins.push(coin);
    }
}

// Create new pipe
function createPipe() {
    // More variation in pipe height
    let top = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
    let bottom = canvas.height - top - pipeGap;
    let pipe = { x: canvas.width, top: top, bottom: bottom, message: fraudMessages[messageIndex] };
    pipes.push(pipe);
    createCoin(pipe);

    // Update the message index for the next pipe
    messageIndex = (messageIndex + 1) % fraudMessages.length;
}

// Update owl's position
function updateOwl() {
    owl.velocity += gravity;
    owl.y += owl.velocity;

    if (owl.y + owl.height > canvas.height || owl.y < 0) {
        crashSound.play();
        isGameOver = true;
    }
}

// Update pipes and check for collisions
function updatePipes() {
    if (pipes.length === 0 || (pipes.length > 0 && pipes[pipes.length - 1].x < canvas.width - pipeWidth - pipeGap)) {
        createPipe();
    }

    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeSpeed;
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }

        if (
            (owl.x + owl.width > pipes[i].x && owl.x < pipes[i].x + pipeWidth) &&
            (owl.y < pipes[i].top || owl.y + owl.height > canvas.height - pipes[i].bottom)
        ) {
            crashSound.play();
            isGameOver = true;
        }
    }
}

// Update coins and check for collisions
function updateCoins() {
    for (let i = 0; i < coins.length; i++) {
        coins[i].x -= pipeSpeed;
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
            coinSound.play();
            coins.splice(i, 1);
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
            }

            // Every 100 points, increase speed and make the game harder
            if (score % 100 === 0) {
                pipeSpeed += 0.2; // Increase speed slightly
                pipeGap -= 6; // Decrease gap slightly
                if (pipeGap < 200) pipeGap = 200; // Ensure gap doesn't get too small
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
    owl.y = 150; // Reset owl's position to slightly above the center
    owl.velocity = 0;
    pipes = [];
    coins = [];
    score = 0;
    pipeSpeed = 3; // Reset speed
    pipeGap = 250; // Reset gap
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
            drawPipe(pipes[i]); // Draw each pipe with the appropriate message
        }
        for (let i = 0; i < coins.length; i++) {
            drawCoin(coins[i]);
        }
        drawScore();
        requestAnimationFrame(gameLoop);
    } else {
        displayGameOver();
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
