let express = require('express');
let cors = require('cors');
const cookieParser = require("cookie-parser");
let app = express();
app.use(cors());
app.use(cookieParser());
const path = require('path');

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
    if(request.headers.authorization) {
        console.dir(request.headers.authorization);
        response.send(200);
    } else {
        response.redirect('http://localhost:3000/external-idp');
    }

});

app.post('/saml/sso', (request, response) => {
    console.log('POST: We already have the cookie token in this POST endpoint but we redirect to GET');
    console.log(request.cookies.token);
    response.redirect('http://localhost:3007/auth');
});

app.get('/auth', (request, response) => {
    console.log('GET: Now we can create a new session on the backend for the current user and return the REST api access token to the FE');
    console.log(request.cookies.token);
    // We dinamically inject the token into the login.html file (in the span) - hardcoded for the PoC
    response.sendfile(path.join(__dirname+'/views/login.html'));
});

app.listen(3007, function () {
    console.log('Server running @ localhost:3007');
});
