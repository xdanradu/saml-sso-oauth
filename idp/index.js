let express = require('express');
let cors = require('cors');
let app = express();
app.use(cors());
let bodyParser = require('body-parser');
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

app.get('/', (request, response) => {
    console.log(`Request received from: ${request.headers.host} `);
    response.json('IDP');
});

app.get('/external-idp', (request, response) => {
    response.sendfile('login.html');
});

app.post('/external-idp-login', (request, response) => {
    console.dir(request.body);
    if(request.body.email === 'admin' && request.body.password === 'admin') {
        // at this point the user is logged into aok + so we set an access token on the HTML response
        response.cookie('token', '12345', { maxAge: 900000, httpOnly: true });
        response.sendfile('saml.html');
    } else {
        response.send(401);
    }
});

app.listen(3000, function () {
    console.log('Server running @ localhost:3000');
});
