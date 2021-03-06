let loginPopupWindow;
let AuthUrl = 'http://localhost:3007/saml/oauth';
let popupClosedInterval;
let sendMessageInterval;
let accessToken;

function login() {
  if (accessToken) {
    sendAuthRequest();
    displayMessage();
  } else if (loginPopupWindow != null && loginPopupWindow.focus) {
    loginPopupWindow.focus();
  } else {
    openLoginPopupWindow();
    listenOnPopupWindowClosed();
    sendPeriodicMessagesToPopupWindow();
  }
}

function displayMessage() {
  console.log(
      `Already logged in with token: ${accessToken.data}`
  );
  let message = document.getElementById('message');
  message.innerText = `Already logged in with token: ${accessToken.data}`;
  message.style.color = 'green';
  setTimeout(_ => {
    message.innerText = '';
  }, 1500);
}

function sendAuthRequest() {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', AuthUrl);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken.data);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      console.log(`Status: ${xhr.status} Response text: ${xhr.responseText}`);
    }
  };
  xhr.send();
}

function openLoginPopupWindow() {
  const features = `scrollbars=yes, width=308, height=268, top=200, left=200`;
  loginPopupWindow = window.open(AuthUrl, 'popupWindow', features);
  if (loginPopupWindow.focus) {
    loginPopupWindow.focus();
  }
}

function listenOnPopupWindowClosed() {
  popupClosedInterval = window.setInterval(() => {
    try {
      if (loginPopupWindow == null || loginPopupWindow.closed) {
        console.log(
          'close() called from popupClosedInterval => manually closing the popup'
        );
        close();
      }
    } catch (e) {}
  }, 2000);
}

function sendPeriodicMessagesToPopupWindow() {
  sendMessageInterval = window.setInterval(() => {
    try {
      if (loginPopupWindow != null && !loginPopupWindow.closed) {
        loginPopupWindow.postMessage('Are you alive?', '*');
      }
    } catch (e) {}
  }, 2000);
}

function close() {
  console.log('Clearing the popupClose and sendMessage intervals');
  window.clearInterval(popupClosedInterval);
  window.clearInterval(sendMessageInterval);
  if (loginPopupWindow != null) {
    loginPopupWindow.close();
    loginPopupWindow = null;
  }
}

window.addEventListener('message', event => {
  if (event.data.token) {
    accessToken = event.data.token;
    console.log(`Token received => Auth`);
    console.dir(event.data.token);
    console.log(
      'close() called after we receive the auth token from the child window => automatically closing the popup'
    );
    close();
  }
});
