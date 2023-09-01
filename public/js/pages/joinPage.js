const form = document.getElementById('joinForm');

function joinGame(code) {
    //post rootUrl + /api/join/:code
    const rootUrl = `${window.location.protocol}//${window.location.host}`;
    fetch(`${rootUrl}/api/join/${code}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'playerName': document.getElementById('nameInput').value
        }
    }).then(r =>  {
        if (!r.ok) {
            r.text().then(text => {
                showModal(new Error(`${r.status} - ${text}`));
            });
        }else{
            r.json().then(data => {
                console.log(data);
                let games = getCookie("Games");
                console.log(games)
                if (games === null) {
                    games = [];
                }else {
                    games = JSON.parse(games);
                }
                console.log(games)
                games.push({ "gameCode": code, "playerCode": data[1].id });
                setCookie("Games", JSON.stringify(games), { "expires": 365 });
                sendGTAGEvent('join_game');
                window.location.href = `./game.html?code=${code}`;
            }).catch(error => {
                console.error('Error:', error);
                showModal('Unknown Error:\n' + error);
            });
        }
    });
}

function onSubmit(event) {
    if (event.preventDefault) event.preventDefault();

    joinGame(gameCode);
}

if (form.attachEvent) {
    form.attachEvent("submit", onSubmit);
} else {
    form.addEventListener("submit", onSubmit);
}

const urlParams = new URLSearchParams(window.location.search);
const gameCode = urlParams.get('code');

if (gameCode === null) {
    window.location.href = '../?error=Invalid+Game+Code!';
}

const games = getCookie("Games");
if (games !== null) {
    const gamesList = JSON.parse(games);
    for (let i = 0; i < gamesList.length; i++) {
        if (gamesList[i].gameCode === gameCode) {
            window.location.href = `./game.html?code=${gameCode}`;
        }
    }
}

