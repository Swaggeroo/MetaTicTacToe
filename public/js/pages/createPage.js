const form = document.getElementById('createForm');

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
                window.location.href = `./pages/join.html?code=${data.code}&create=true`;
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