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
      const features = generateWindowFeaturesString();
      popupWindow = window.open(url, 'myWindow', features);
      if (popupWindow.focus) {
        popupWindow.focus();
      }
      closePopupListener();
      initiateMessagingWithChild();
    }
  }
}

function generateWindowFeaturesString() {
  const dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY;
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
  const scrollbars = 'yes';

  // Generate popup features string
  return `scrollbars=${scrollbars}, width=${width /
    2}, height=${height}, top=${top}, left=${left}`;
}

function initiateMessagingWithChild() {
  messagesToChildInterval = window.setInterval(() => {
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

function closePopupListener() {
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
