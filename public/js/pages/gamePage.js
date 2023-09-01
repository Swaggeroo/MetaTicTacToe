const title = document.getElementById('title');

title.innerHTML = "Loading...";

const rootUrl = `${window.location.protocol}//${window.location.host}`;
const gameCode = getGameCode();
const playerCode = getPlayerCode();

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




