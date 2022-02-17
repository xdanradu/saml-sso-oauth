let popupWindow;
//let url = 'http://localhost:3000/external-idp';
let url = 'http://localhost:3007/saml/oauth';
let showScrollbars = true;
let onAbortCallback;
let onSuccessCallback;
let closeDetectionInterval;
let messagingInterval;

function login() {

    if(accessToken) {
        console.log('Already logged in');
        window.addEventListener('message', event => {
            handleMessageEvent(event);
        });

        let xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer "+accessToken);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                console.log(xhr.status);
                console.log(xhr.responseText);
            }};
        xhr.send();
    } else {
        if (popupWindow != null && popupWindow.focus) {
            popupWindow.focus();
        } else {
            const features = generateWindowFeaturesString();
            // console.log(features);
            popupWindow = window.open(
                url,
                'myWindow',
                features
            );
            if (popupWindow.focus) {
                popupWindow.focus();
            }
            registerClosingDetection();
            initiateMessagingWithChild();
        }
    }


}

function generateWindowFeaturesString() {
    const dualScreenLeft =
        window.screenLeft !== undefined
            ? window.screenLeft
            : window.screenX;
    const dualScreenTop =
        window.screenTop !== undefined
            ? window.screenTop
            : window.screenY;
    const width = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
            ? document.documentElement.clientWidth
            : screen.width;
    const height = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
            ? document.documentElement.clientHeight
            : screen.height;

    // Calculate popup settings
    const left = width / 2 - width / 2 + dualScreenLeft;
    const top = height / 2 - height / 2 + dualScreenTop;
    const scrollbars = showScrollbars ? 'yes' : 'no';

    // Generate popup features string
    return `scrollbars=${scrollbars}, width=${width/2}, height=${height}, top=${top}, left=${left}`;
}

function initiateMessagingWithChild() {
    messagingInterval = window.setInterval(() => {
        try {
            //console.log(popupWindow);
            if (popupWindow != null && !popupWindow.closed) {
                // console.log(popupWindow);
                console.log('Ask if child is active');
                popupWindow.postMessage('Are you alive?', '*');
            }

        } catch (e) {}
    }, 2000);
}

function registerClosingDetection() {
    console.log('should add listener on close');
    closeDetectionInterval = window.setInterval(() => {
        try {
            // console.log(popupWindow);
            if (popupWindow == null || popupWindow.closed) {
                close();
                console.log('close the popup');
            }
        } catch (e) {}
    }, 2000);
}

function close() {
    console.log('close all');
    window.clearInterval(closeDetectionInterval);
    window.clearInterval(messagingInterval);
    if (popupWindow != null) {
        popupWindow.close();
        popupWindow = null;
    }
}

let accessToken;
function handleMessageEvent(event) {
    // if(event.data.token) console.log(event.data.token);
    if (event.data.token) {
        console.log(`Token received => Spartacus auth`);
        console.dir(event.data.token);
        accessToken = event.data.token;
        close();
    }
}

window.addEventListener('message', event => {
    handleMessageEvent(event);
});






/*
function authorized() {
    if(accessToken) {
        window.addEventListener('message', event => {
            handleMessageEvent(event);
        });

        let xhr = new XMLHttpRequest();
        xhr.open("GET", 'http://localhost:3007/saml/oauth');

        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer "+accessToken);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                console.log(xhr.status);
                console.log(xhr.responseText);
            }};
        xhr.send();
    } else {
        window.addEventListener('message', event => {
            handleMessageEvent(event);
        });

        let xhr = new XMLHttpRequest();
        xhr.open("GET", 'http://localhost:3007/saml/oauth');

        xhr.setRequestHeader("Accept", "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                console.log(xhr.status);
                console.log(xhr.responseText);
            }};
        xhr.send();
    }



}
*/
