


class NewNode {
    constructor(next, valueX, y) {
        this.next = next;
        this.x = valueX;
        this.y = y;
    }
}

let lastArrowKeyInput;
let rows = 22;
let cols = 22;
let matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
let coinX = parseInt(Math.random() * 20);
let coinY = parseInt(Math.random() * 20);
let snakeX = parseInt(Math.random() * 20);
let snakeY = parseInt(Math.random() * 20);
let scoreNumber = document.createElement("div")
let scoreText = document.querySelector(".score")
let previousX = snakeX;
let previousY = snakeY;
let nodeList = new NewNode(null, snakeX, snakeY);
let head = nodeList;
let childItems = document.createElement("div")
let snakeDiv = document.createElement("div")
let coinDiv = document.createElement("div")

const getBoard = document.querySelector(".grid-container")
const coinClass = "grid-item-coin"
const snakeClass = "grid-item-snake"



scoreNumber.textContent = 0
scoreText.appendChild(scoreNumber)
scoreNumber.className = "score-place-holder"
childItems.className = 'grid-item'
snakeDiv.className = snakeClass
coinDiv.className = coinClass

window.addEventListener("keydown", recordEvent)

for (let i = 0; i < 22; i++) {
    for (let j = 0; j < 22; j++) {
        childItems = document.createElement("div")
        childItems.className = 'grid-item'

        if (snakeX == i && snakeY == j) {
            childItems.appendChild(snakeDiv)
            matrix[i][j] = 1
        }
        if (coinX == i && coinY == j) {
            childItems.appendChild(coinDiv)
        }
        childItems.setAttribute("id", `${i},${j}`)
        getBoard.appendChild(childItems)
    }
}

function recordEvent(event) {
    if (event.code == "ArrowUp") {
        lastArrowKeyInput = event.code
    }
    if (event.code == "ArrowDown") {
        lastArrowKeyInput = event.code
    }
    if (event.code == "ArrowRight") {
        lastArrowKeyInput = event.code
    }
    if (event.code == "ArrowLeft") {
        lastArrowKeyInput = event.code
    }
}

function resetPointers() {
    document.querySelector(".grid-container").innerHTML = ""
    matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
    lastArrowKeyInput = ""
    coinX = parseInt(Math.random() * 20)
    coinY = parseInt(Math.random() * 20)
    snakeX = parseInt(Math.random() * 20)
    snakeY = parseInt(Math.random() * 20)
    previousX = snakeX
    previousY = snakeY
    let snakeDiv = document.createElement("div")
    let coinDiv = document.createElement("div")
    snakeDiv.className = snakeClass
    coinDiv.className = coinClass
    scoreNumber.textContent = 0
    for (let i = 0; i < 22; i++) {
        for (let j = 0; j < 22; j++) {
            childItems = document.createElement("div")
            childItems.className = 'grid-item'

            if (snakeX == i && snakeY == j) {
                childItems.appendChild(snakeDiv)
                matrix[i][j] = 1
            }
            if (coinX == i && coinY == j) {
                childItems.appendChild(coinDiv)
            }
            childItems.setAttribute("id", `${i},${j}`)
            getBoard.appendChild(childItems)
        }
    }

    let nodeList = new NewNode(null, snakeX, snakeY);
    head = nodeList
}

function checkOutOfBounds(x, y) {

    //Check if ran out of bounds
    if (x <= -1 || y <= -1 || x >= 22 || y >= 22) {
        resetPointers()
        return false
    }

    // Check if ran into the snake
    if (matrix[x][y] == 1) {
        resetPointers()
        return false
    }

    // return True if safe
    return true

}

function updateSnakeHeadPosition() {
    if (snakeX == coinX && snakeY == coinY) {
        let coinPosition = document.getElementById(`${coinX},${coinY}`)
        coinPosition.innerHTML = ""

        coinX = parseInt(Math.random() * 20)
        coinY = parseInt(Math.random() * 20)
        while (matrix[coinX][coinY] == 1) {
            coinX = parseInt(Math.random() * 22)
            coinY = parseInt(Math.random() * 22)
        }
        let nextCoinPosition = document.getElementById(`${coinX},${coinY}`)
        nextCoinPosition.appendChild(coinDiv)

        snakeDiv = document.createElement("div");
        snakeDiv.className = snakeClass

        document.getElementById(`${snakeX},${snakeY}`).appendChild(snakeDiv)
        matrix[snakeX][snakeY] = 1
        let nextNode = new NewNode(next = null, x = snakeX, y = snakeY)
        nodeList.next = nextNode
        nodeList = nodeList.next
        scoreNumber.textContent = parseInt(scoreNumber.textContent) + 1
        return
    }

    document.getElementById(`${head.x},${head.y}`).innerHTML = ""
    matrix[head.x][head.y] = 0
    head = head.next

    let next_node = new NewNode(next = null, x = snakeX, y = snakeY)
    nodeList.next = next_node

    //Check if null if linked list is only 1 node
    if (head == null) {
        head = nodeList.next
    }

    nodeList = nodeList.next
    snakeDiv = document.createElement("div");
    snakeDiv.className = snakeClass
    document.getElementById(`${nodeList.x},${nodeList.y}`).appendChild(snakeDiv)
    matrix[nodeList.x][nodeList.y] = 1

}


let gameIsActive = false;

const gameBoard = document.querySelector('.grid-container'); // Replace 'yourGameBoardId' with your game board's actual ID

gameBoard.addEventListener('click', function () {
    gameIsActive = true;

    // Optionally, remove focus from other elements
    if (document.activeElement !== document.body) document.activeElement.blur();
});

document.addEventListener('keydown', function (event) {
    if (gameIsActive && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        // Add your code to control the snake here
    }
}, false);

// Optional: Reset gameIsActive when clicking outside the game board
document.addEventListener('click', function (event) {
    if (!gameBoard.contains(event.target)) {
        gameIsActive = false;
    }
});


setInterval(() => {

    //Return if the user is not clicked into the game
    if (!gameIsActive){
        return
    }

    //Check if last keyInput is down, right, left or up
    switch (lastArrowKeyInput) {

        case "ArrowUp":
            snakeX -= 1
            if (checkOutOfBounds(snakeX, snakeY)) {
                updateSnakeHeadPosition()

            }
            break

        case "ArrowDown":
            snakeX += 1
            if (checkOutOfBounds(snakeX, snakeY)) {
                updateSnakeHeadPosition()
            }
            break

        case "ArrowRight":
            snakeY += 1
            if (checkOutOfBounds(snakeX, snakeY)) {
                updateSnakeHeadPosition()

            }
            break
        case "ArrowLeft":
            snakeY -= 1
            if (checkOutOfBounds(snakeX, snakeY)) {
                updateSnakeHeadPosition()

            }
    }

}, 100)

