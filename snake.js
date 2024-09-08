const displayContainerElem = document.getElementById("display-container");
const xMax = 20;
const yMax = 20;

let snakeBody = [];
let direction = "up";

let dx = 0;
let dy = 0;

let score = 0;
let maxScore = 0;

let isPlaying = false;
let isPaused = false;

let currentScreen = "splash";
let previousScreen = "splash";
let screenInitializers = {
    "splash":initializeSplash,
    "game-over":initializeGameOverScreen,
    "game-screen":initializeGameScreen,
    "settings-screen":initializeSettingsScreen,
}

// Display Initializers

function initializeSplash() {
    previousScreen = currentScreen;
    currentScreen = "splash";

    displayContainerElem.innerHTML = `
    <div id="splash" class="splash">
        <p>Snake</p>
    </div>
    `;
}

function initializeGameOverScreen() {
    previousScreen = currentScreen;
    currentScreen = "game-over";
    
    displayContainerElem.innerHTML = `
    <div id="game-over" class="game-over">
        <p>Game Over!</p>
    </div>
    `;
}

function initializeGameScreen() {
    previousScreen = currentScreen;
    currentScreen = "game-screen";

    displayContainerElem.innerHTML = `
    <div id="game-screen" class="game-screen">
    </div>`;
}

function initializeSettingsScreen() {
    currentScreen = "settings-screen";

    displayContainerElem.innerHTML = `
    <div class="settings">
        <h1>Settings</h1>
        <div class="settings-list">
            <div class="settings-row">
                <span>Background Color</span>
                <input id="background-color" type="color" value="#67a467">
            </div>
            <div class="settings-row">
                <span>Snake Color</span>
                <input id="snake-color" type="color" value="#075700">
            </div>
            <div class="settings-row">
                <span>Grid Row Count</span>
                <input type="number" value="20" min="10" max="50">
            </div>
            <div class="settings-row">
                <span>Grid Column Count</span>
                <input type="number" value="20" min="10" max="50">
            </div>
            <div class="settings-row">
                <button id="reset-max-score">Reset Max Score</button>
            </div>
            <div class="settings-row">
                <button id="reset-settings">Reset Settings</button>
            </div>
        </div>
    </div>
    `
}

function createPixel(x, y, className = "pixel") {
    const pixelElem = document.createElement("div");
    const displayElem = document.getElementById("game-screen");
    pixelElem.className = className;
    pixelElem.style.gridColumn = x;
    pixelElem.style.gridRow = y;
    displayElem.appendChild(pixelElem);
}

function updateSnake(headX, headY) {
    snakeBody.unshift([headX, headY]);
    snakeBody.pop();
}

function drawSnake() {
    snakeBody.forEach(([x, y]) => createPixel(x, y));
}

function placeFood() {
    let x, y;
    do {
        x = Math.floor(Math.random() * xMax) + 1;
        y = Math.floor(Math.random() * yMax) + 1;
    } while (snakeBody.some(([sx, sy]) => sx === x && sy === y));

    return [x, y];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function changeDirection(newDirection) {
    const oppositeDirections = {
        "up": "down",
        "down": "up",
        "left": "right",
        "right": "left"
    };

    if (direction !== oppositeDirections[newDirection]) {
        direction = newDirection;
    }
}

async function moveSnake() {
    const displayElem = document.getElementById("game-screen");

    let [x, y] = [10, 10];
    let length = 5;
    let food = placeFood();

    snakeBody = Array.from({ length }, (_, i) => [x, y + i]);

    while (isPlaying) {

        if (isPaused) {
            await sleep(500);
            continue;
        }

        switch (direction) {
            case "up": [dx, dy] = [0, -1]; break;
            case "down": [dx, dy] = [0, 1]; break;
            case "left": [dx, dy] = [-1, 0]; break;
            case "right": [dx, dy] = [1, 0]; break;
        }

        displayElem.innerHTML = "";

        x = (x + dx + xMax - 1) % xMax + 1;
        y = (y + dy + yMax - 1) % yMax + 1;

        // Game Over
        if (snakeBody.some(([sx, sy]) => sx === x && sy === y)) {
            reset()
            initializeGameOverScreen();
            await sleep(3100);
            reset();
            break;
        }

        if (x === food[0] && y === food[1]) {
            score++;
            updateScore();
            food = placeFood();
            snakeBody.push([...snakeBody[snakeBody.length - 1]]);
        }

        updateSnake(x, y);
        drawSnake();
        createPixel(food[0], food[1], "food");

        await sleep(100);
    }
}

function play() {
    if (!isPlaying) {
        isPlaying = true;
        initializeGameScreen();
        moveSnake();
    } else if (isPaused) {
        isPaused = false;
    }

    playButton.style.display = 'none';
    pauseButton.style.display = 'block';
    resetButton.style.display = 'none';

}

function pause() {
    if (isPlaying && !isPaused) {
        isPaused = true;
        playButton.style.display = 'block';
        pauseButton.style.display = 'none';
        resetButton.style.display = 'block';
    }
}

function reset() {
    isPlaying = false;
    isPaused = false;
    snakeBody = [];
    score = 0;

    const storedMaxScore = localStorage.getItem("max-score");
    maxScore = storedMaxScore ? Number(storedMaxScore) : 0;

    document.getElementById("max-score").textContent = maxScore;

    initializeSplash();

    playButton.style.display = 'block';
    pauseButton.style.display = 'none';
    resetButton.style.display = 'none';

    updateScore();
}

// Score Managers

function resetMaxScore() {
    // Not under usage
    localStorage.setItem("max-score", 0);
}


function updateScore() {
    document.getElementById("score").textContent = score;

    if (score > maxScore) {
        maxScore = score;
        document.getElementById("max-score").textContent = maxScore;
        localStorage.setItem("max-score", maxScore);
    }
}

function displaySettings() {
    if (currentScreen == "settings-screen"&& isPaused) {
        play();
    }

    if (isPlaying) {
        pause();
    }

    if (currentScreen == "settings-screen") {
        screenInitializers[previousScreen]();
    } else {
        initializeSettingsScreen()
    }
}

// Script Runs:
// ````````````

const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const settingsButton = document.getElementById("settings-button");

playButton.addEventListener("click", play);
pauseButton.addEventListener("click", pause);
resetButton.addEventListener("click", reset);
settingsButton.addEventListener("click", displaySettings);

// Key Bindings
window.onkeydown = function (key) {
    if (isPlaying && isPaused || !isPlaying)  {
        if (key.keyCode == 32) play(); // Space Bar
        if (key.keyCode == 82) reset(); // "R" key
        return;
    }

    if (isPlaying && !isPaused) {
        switch (key.keyCode) {
            case 38: changeDirection("up"); break; // Up arrow key
            case 40: changeDirection("down"); break; // Down arrow key
            case 37: changeDirection("left"); break; // Left arrow key
            case 39: changeDirection("right"); break; // Right arrow key
            case 32: pause(); break; // Space Bar
        }
    }
};

document.addEventListener("DOMContentLoaded", reset);
