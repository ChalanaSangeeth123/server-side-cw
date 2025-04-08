const express = require('express');
const session = require('express-session');
const UserService = require('./Services/UserService');
const APIKey = require('./Services/ApiKeyService');
const countryRouter = require('./Routers/CountryRouter');
const apikeyMiddleware = require('./Middleware/APIAuth/APIAuthMiddleWare');
const checkSession = require('./Middleware/SessionAuth/SessionAuth');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

const PORT_NUMBER = process.env.PORT || 5000;

// API routes with key authentication
app.use('/api/countries', apikeyMiddleware, countryRouter);

// User registration
app.post('/registerUser', async (req, res) => {
    const userService = new UserService();
    const result = await userService.create(req);
    res.json(result);
});

// User login
app.post('/login', async (req, res) => {
    const userService = new UserService();
    const result = await userService.authenticate(req);
    res.json(result);
});

// Generate API key (requires session)
app.post('/getapikey', checkSession, async (req, res) => {
    const apikeyservice = new APIKey();
    const data = await apikeyservice.create(req);
    res.json(data);
});

// Serve HTML page (optional, can be used for vodcast demo)
app.get('/aboutus', (req, res) => {
    res.sendFile(__dirname + '/views/test.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/test.html');
});

app.listen(PORT_NUMBER, (err) => {
    if (err) {
        console.log('Port is not available');
    } else {
        console.log('Server has started and is listening on port:', PORT_NUMBER);
    }
});