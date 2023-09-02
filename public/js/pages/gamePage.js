const title = document.getElementById('title');
const rootgrid = document.getElementsByClassName('root-grid-container')[0];

title.innerHTML = "Loading...";

const rootUrl = `${window.location.protocol}//${window.location.host}`;
const gameCode = getGameCode();
const playerCode = getPlayerCode();
const playerNumber = getPlayerNumber();

let gameData = null;
let yourTurn = false;
let showedModal = false;

let cells = document.getElementsByClassName('grid-item');
let bigCells = document.getElementsByClassName('child-grid-container');

function getGameCode(){
    const urlParams = new URLSearchParams(window.location.search);
    const gameCode = urlParams.get('code');
    if (gameCode === null) {
        window.location.href = '../?error=Invalid+Game+Code!';
    }
    return gameCode;
}

function getPlayerCode(){
    const games = getCookie("Games");
    if (games === null) {
        window.location.href = '../?error=Game+config+not+found!';
    }

    const game = JSON.parse(games).find(g => g.gameCode === gameCode);
    if (game === undefined) {
        window.location.href = '../?error=Game+config+not+found!';
    }

    return game.playerCode;
}

function getPlayerNumber() {
    const games = getCookie("Games");
    if (games === null) {
        window.location.href = '../?error=Game+config+not+found!';
    }

    const game = JSON.parse(games).find(g => g.gameCode === gameCode);
    if (game === undefined) {
        window.location.href = '../?error=Game+config+not+found!';
    }

    return game.playerNumber;
}

function fetchGameData(once = false){
    fetch(`${rootUrl}/api/state`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'gameCode': gameCode,
            'playerCode': playerCode
        }
    }).then(r => r.json()).then(data => {
        gameData = data;
        console.log(gameData);
        if (!gameData.started){
            title.innerHTML = `Waiting for other player...`;
            if (!showedModal){
                showModal("You can share this link with your friend to play together: <br><br><p style='color: #2bd8ff'>" + rootUrl + "/pages/join.html?code=" + gameCode+"   <button onclick='copyUrl()'>Copy</button></p>");
                showedModal = true;
            }
        }else{
            if (gameData.won !== 0){
                yourTurn = false;
                if (gameData.won === playerNumber){
                    title.innerHTML = `You won!`;
                }else if (gameData.won === 3){
                    title.innerHTML = `Draw!`;
                }else{
                    title.innerHTML = `You lost!`;
                }
            }
            else if (gameData.playerTurn === playerNumber){
                title.innerHTML = `Your turn!`;
                yourTurn = true;
            }else{
                title.innerHTML = `Waiting for other player...`;
                yourTurn = false;
            }
        }

        refreshBoard();

        if (gameData.won === 0 && !once){
            if (yourTurn){
                setTimeout(fetchGameData, 7000);
            }else{
                setTimeout(fetchGameData, 1500);
            }
        }

    })
}

function  refreshBoard() {
    for (let i = 0; i < bigCells.length; i++) {
        let cell = bigCells[i];
        let bigCell = cell.getAttribute('data-big-field');
        if (gameData.bigBoard[bigCell] !== 0){
            if (gameData.bigBoard[bigCell] === 1) {
                cell.innerHTML = "<div class=\"finalText textX\"><p>&times</p></div>";
            }
            else if (gameData.bigBoard[bigCell] === 2) {
                cell.innerHTML = "<div class=\"finalText text0\"><p>&bigcirc;</p></div>";
            }else{
                cell.innerHTML = "<div class=\"finalText textDraw\"><p>DRAW</p></div>";
            }
        }
    }

    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        let smallCell = cell.getAttribute('data-small-field');
        let bigCell = cell.parentElement.getAttribute('data-big-field');
        let value = gameData.board[bigCell][smallCell];
        switch (value) {
            case 0:
                cell.children[0].innerHTML = "";
                break;
            case 1:
                cell.children[0].innerHTML = "<p class='smallX'>&times;</p>";
                break;
            case 2:
                cell.children[0].innerHTML = "<p class='small0'>&bigcirc;</p>";
                break;
        }

        if (gameData.nextBoard === -1 || gameData.nextBoard === parseInt(bigCell)) {
            cell.classList.add("currentSector");
        }else {
            cell.classList.remove("currentSector");
        }
    }
}

function move(elem){
    if (!yourTurn) return;
    let bigCell = elem.parentElement.getAttribute('data-big-field');
    let smallCell = elem.getAttribute('data-small-field');
    fetch(`${rootUrl}/api/move/`+bigCell+'/'+smallCell, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'gameCode': gameCode,
            'playerCode': playerCode
        }
    }).then(r => {
        if (!r.ok) {
            r.text().then(text => {
                showModal(new Error(`${r.status} - ${text}`));
            });
        }else{
            sendGTAGEvent('move');
            fetchGameData(true);
        }
    });
}

function copyUrl() {
    let url = rootUrl + "/pages/join.html?code=" + gameCode;
    navigator.clipboard.writeText(url);
}

let rootInner = "";
for(let bigCellIndex = 0; bigCellIndex < 9; bigCellIndex++){
    let gridColumn = parseInt(((bigCellIndex % 3)+1)*1.7);
    let gridRow = parseInt((parseInt(bigCellIndex / 3)+1)*1.7);

    rootInner += '<div class="grid-container child-grid-container" data-big-field="'+bigCellIndex+'" style="grid-column: '+gridColumn+'; grid-row: '+gridRow+'">'
    for(let smallCellIndex = 0; smallCellIndex < 9; smallCellIndex++){
        let gridColumnSmall = parseInt(((smallCellIndex % 3)+1)*1.7);
        let gridRowSmall = parseInt((parseInt(smallCellIndex / 3)+1)*1.7);
        rootInner += '<div class="grid-item" data-small-field="'+smallCellIndex+'" onclick="move(this)" style="grid-column: '+gridColumnSmall+'; grid-row: '+gridRowSmall+'"><div></div></div>'
    }
    rootInner += '</div>'
}

rootgrid.innerHTML = rootInner;

fetchGameData();




