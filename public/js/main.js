//---Modal---
const modal = document.getElementById("myModal");
const closeModal = document.getElementsByClassName("close")[0];
const modalText = document.getElementById('modalText');

const API_URL = "http://localhost:3000/api/"; //TODO: Change to https://moneyshifting.swaggeroo.de:3000/api/ when live

function sendGTAGEvent(eventName) {
	try {
		function gtag() {dataLayer.push(arguments);}

		gtag('event', eventName);

		console.log('Sent GTAG Event: ' + eventName);
	} catch (e) {}
}

function sanitizeString(str){
	str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
	return str.trim();
}

function showModal(text) {
	modal.style.display = "block";
	modalText.innerHTML = text;
}

// When the user clicks on <span> (x), close the modal
closeModal.onclick = function() {
	modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target === modal) {
		modal.style.display = "none";
	}
}

// Function to read a cookie by name
function getCookie(name) {
	const cookies = document.cookie.split(';');
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith(name + '=')) {
			return cookie.substring(name.length + 1);
		}
	}
	return null; // Return null if the cookie is not found
}

// Function to set a cookie with a specified name, value, and optional options
function setCookie(name, value, options = {}) {
	let cookieString = `${name}=${value}`;

	// Optional: Set cookie expiration (in days)
	if (options.expires) {
		const expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + options.expires);
		cookieString += `; expires=${expirationDate.toUTCString()}`;
	}

	// Optional: Set cookie path
	if (options.path) {
		cookieString += `; path=${options.path}`;
	}

	// Optional: Set cookie domain
	if (options.domain) {
		cookieString += `; domain=${options.domain}`;
	}

	// Optional: Set secure flag (for HTTPS)
	if (options.secure) {
		cookieString += `; secure`;
	}

	// Set the cookie
	document.cookie = cookieString;
}
