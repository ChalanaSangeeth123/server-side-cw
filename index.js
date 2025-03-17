const express = require('express');
const session = require('express-session');
const UserService = require('./Services/UserService');
const APIKey = require('./Services/ApiKeyService');
const apikeyMiddleware = require('./Middleware/APIAuth/APIAuthMiddleWare');
const checkSession = require('./Middleware/SessionAuth/SessionAuth');
const countryRouter = require('./Routers/CountryRouter');

const app = express();
app.use(express.json());
app.use(session({
    secret: 'my_secret_',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const PORT_NUMBER = 5000;

app.use('/api', apikeyMiddleware);
app.use('/api', countryRouter); // Replace attractions routes with country routes

app.post('/registerUser', async (req, res) => {
    const userService = new UserService();
    const result = await userService.create(req);
    res.json(result);
});

app.post('/login', async (req, res) => {
    const userService = new UserService();
    const result = await userService.authenticate(req);
    res.json(result);
});

app.post('/getapikey', async (req, res) => {
    const apikeyService = new APIKey();
    const data = await apikeyService.create(req);
    res.json(data);
});

app.get('/contactus', checkSession, (req, res) => {
    res.send('<h1>Contact us</h1>');
});

app.get('/aboutus', (req, res) => {
    res.sendFile(__dirname + '/views/test.html');
});

app.listen(PORT_NUMBER, (err) => {
    if (err) {
        console.log('Port is not available');
    } else {
        console.log('Server has started and is Listening on port: ', PORT_NUMBER);
    }
});