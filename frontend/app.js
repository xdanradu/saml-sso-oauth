let popupWindow;
let url = 'http://localhost:3007/saml/oauth';
let closeDetectionInterval;
let messagesToChildInterval;
let accessToken;

function login() {
  if (accessToken) {
    console.log(`Already logged in with token: ${accessToken}`);
    console.log('Sending auth test request to backend');
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        console.log(`Status: ${xhr.status} Response texT: ${xhr.responseText}`);
      }
    };
    xhr.send();
  } else {
    if (popupWindow != null && popupWindow.focus) {
      popupWindow.focus();
    } else {
      const features = `scrollbars=yes, width=308, height=268, top=200, left=200`;
      popupWindow = window.open(url, 'myWindow', features);
      if (popupWindow.focus) {
        popupWindow.focus();
      }
      closePopupListener();
      initiateMessagingWithChild();
    }
  }
}

function initiateMessagingWithChild() {
  messagesToChildInterval = window.setInterval(() => {
    try {
      if (popupWindow != null && !popupWindow.closed) {
        popupWindow.postMessage('Are you alive?', '*');
      }
    } catch (e) {}
  }, 2000);
}

function closePopupListener() {
  closeDetectionInterval = window.setInterval(() => {
    try {
      // console.log(popupWindow);
      if (popupWindow == null || popupWindow.closed) {
        close();
      }
    } catch (e) {}
  }, 2000);
}

function close() {
  console.log('Close the popup and the periodic intervals');
  window.clearInterval(closeDetectionInterval);
  window.clearInterval(messagesToChildInterval);
  if (popupWindow != null) {
    popupWindow.close();
    popupWindow = null;
  }
}

function handleMessageEvent(event) {
  if (event.data.token) {
    console.log(`Token received => Auth`);
    console.dir(event.data.token);
    accessToken = event.data.token;
    close();
  }
}

window.addEventListener('message', event => {
  handleMessageEvent(event);
});
