const form = document.getElementById('createForm');

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
                window.location.href = `./pages/game.html?code=${code}&create=true`;
            }).catch(error => {
                console.error('Error:', error);
                showModal('Unknown Error:\n' + error);
            });
        }
    });
}

function onSubmit(event) {
    if (event.preventDefault) event.preventDefault();
    const rootUrl = `${window.location.protocol}//${window.location.host}`;

    //get rootUrl + /api/create
    fetch(`${rootUrl}/api/create`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(r =>  {
        if (!r.ok) {
            r.text().then(text => {
                showModal(new Error(`${r.status} - ${text}`));
            });
        }else{
            r.json().then(data => {
                sendGTAGEvent('create_game');
                joinGame(data.code);
            }).catch(error => {
                console.error('Error:', error);
                showModal('Unknown Error:\n' + error);
            });
        }
    }).catch(error => {
        console.error('Error:', error);
        showModal('Unknown Error:\n' + error);
    });
}

if (form.attachEvent) {
    form.attachEvent("submit", onSubmit);
} else {
    form.addEventListener("submit", onSubmit);
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("error") !== null) {
    showModal(sanitizeString(urlParams.get("error")));
}