let express = require('express');
let cors = require('cors');
const cookieParser = require('cookie-parser');
let morgan = require('morgan');
const path = require('path');

let app = express();
app.use(cors());
app.use(cookieParser());
app.use(morgan(':method :url :response-time ms'));

// Using this state to emulate session only as a proof of concept, tokens should go into a map ip-user-token
let authSessionToken;

let bodyParser = require('body-parser');
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.get('/', (request, response) => {
  console.log(`Backend API ${request.headers.host} `);
  response.json('API');
});

app.get('/saml/oauth', (request, response) => {
  console.log('saml/oauth');
  // if we don't have an authorization header then we redirect to IDP
  if (request.headers.authorization && request.headers.authorization === `Bearer ${authSessionToken}`) {
    console.dir(request.headers.authorization);
    response.send(200);
  } else {
    response.redirect('http://localhost:3000/external-idp');
  }
});

app.post('/saml/sso', (request, response) => {
  console.log(
    `Validate IDP samlRequest (${request.cookies.token}) and then redirect to GET oauth`
  );
  authSessionToken = request.cookies.token
  response.redirect('http://localhost:3007/oauth');
});

app.get('/oauth', (request, response) => {
  console.log(
    `Create a new BE session for current user and return the access token (${request.cookies.token}) to the FE in a HTML file`
  );
  // Dinamically inject the token into the login.html file (in the span) - hardcoded 123454321 for the PoC
  response.sendfile(path.join(__dirname + '/login.html'));
});

app.listen(3007, function() {
  console.log('Server running @ localhost:3007');
});
