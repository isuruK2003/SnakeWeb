const display_elem = document.getElementById("display");
const x_max = 20;
const y_max = 20;

let snake_body = [];
let direction = "up";

let dx = 0;
let dy = 0;

let score = 0;
let max_score = 0;

let isPlaying = false;
let isPause = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function make_pixel(x_pos, y_pos, className = "pixel") {
    let pixel_elem = document.createElement("div");
    pixel_elem.className = className;
    pixel_elem.style.gridColumn = x_pos;
    pixel_elem.style.gridRow = y_pos;
    display_elem.appendChild(pixel_elem);
}

function update_snake(head_x, head_y) {
    snake_body.unshift([head_x, head_y]);
    snake_body.pop();
}

function draw_snake() {
    snake_body.forEach(coordinate => {
        make_pixel(coordinate[0], coordinate[1]);
    });
}

function change_direction(new_direction) {
    const opposite_directions = {
        "up": "down",
        "down": "up",
        "left": "right",
        "right": "left"
    };

    if (direction === opposite_directions[new_direction]) {
        return;
    }

    direction = new_direction;
}

function place_food() {
    let x_pos, y_pos;
    do {
        x_pos = Math.floor(Math.random() * x_max) + 1;
        y_pos = Math.floor(Math.random() * y_max) + 1;
    } while (snake_body.some(segment => segment[0] === x_pos && segment[1] === y_pos));

    return [x_pos, y_pos];
}

function update_score() {
    document.getElementById("score").innerHTML = score;

    if (score > max_score) {
        max_score = score;
        document.getElementById("max-score").innerHTML = max_score;
        localStorage.setItem("max-score", max_score);
    }
}

function reset() {
    isPlaying = false;
    isPause = false;
    snake_body = [];
    score = 0;

    // Initialize max_score correctly
    let stored_max_score = localStorage.getItem("max-score");
    if (stored_max_score) {
        max_score = Number(stored_max_score);
    } else {
        max_score = 0;
    }

    document.getElementById("max-score").innerHTML = max_score;

    play_button.style.display = 'block';
    pause_button.style.display = 'none';
    reset_button.style.display = 'none';
    update_score();
}


async function move_snake() {
    let x = 10;
    let y = 10;
    let length = 5;
    let food = place_food();

    for (let i = 0; i < length; i++) {
        snake_body.push([x, y + i]);
    }

    while (isPlaying) {

        if (isPause) {
            await sleep(500);
            continue;
        }

        if (direction === "up") {
            dx = 0;
            dy = -1;
        } else if (direction === "down") {
            dx = 0;
            dy = 1;
        } else if (direction === "left") {
            dx = -1;
            dy = 0;
        } else if (direction === "right") {
            dx = 1;
            dy = 0;
        }

        display_elem.innerHTML = "";

        x = (x + dx + x_max - 1) % x_max + 1;
        y = (y + dy + y_max - 1) % y_max + 1;

        // Snake hitting itself
        if (snake_body.some(segment => segment[0] === x && segment[1] === y)) {
            reset();
            alert("Game Over");
            break;
        }

        // Snake eating the food
        if (x === food[0] && y === food[1]) {
            score += 1;
            update_score();
            food = place_food();
            snake_body.push(snake_body[snake_body.length - 1]); // Extend the snake
        }

        update_snake(x, y);
        draw_snake();
        make_pixel(food[0], food[1], "food");
        await sleep(100);
    }
}

window.onkeydown = function (key) {
    // up
    if (key.keyCode === 38) {
        change_direction("up");
    }
    // down
    else if (key.keyCode === 40) {
        change_direction("down");
    }
    // left
    else if (key.keyCode === 37) {
        change_direction("left");
    }
    // right
    else if (key.keyCode === 39) {
        change_direction("right");
    }
};

let play_button = document.getElementById("play");
let pause_button = document.getElementById("pause");
let reset_button = document.getElementById("reset");

play_button.addEventListener("click", () => {
    if (!isPlaying) {
        isPlaying = true;
        move_snake();
    } else if (isPause) {
        isPause = false;
    }
    play_button.style.display = 'none';
    pause_button.style.display = 'block';
    reset_button.style.display = 'none';
});

pause_button.addEventListener("click", () => {
    if (isPlaying && !isPause) {
        isPause = true;
    }
    play_button.style.display = 'block';
    pause_button.style.display = 'none';
    reset_button.style.display = 'block';
});

reset_button.addEventListener("click", () => {
    reset();
});

document.addEventListener("DOMContentLoaded", () => {
    reset();
});