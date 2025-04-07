const express = require('express');
const session = require('express-session');
const UserService = require('./serverside/Services/UserService');
const APIKeyService = require('./serverside/Services/ApiKeyService');
const apikeyMiddleware = require('./serverside/Middleware/APIAuth/APIAuthMiddleWare');
const checkSession = require('./serverside/Middleware/SessionAuth/SessionAuth');
const countryRouter = require('./serverside/Routes/CountryRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_32_chars_long',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static('public')); // Serve front-end files

const PORT_NUMBER = 5000;

app.use('/api', apikeyMiddleware);
app.use('/api', countryRouter);

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

app.post('/api/getapikey', checkSession, async (req, res) => {
    const apikeyService = new APIKeyService();
    const data = await apikeyService.create(req);
    res.json(data);
});

app.get('/api/keys', checkSession, async (req, res) => {
    const apikeyService = new APIKeyService();
    const result = await apikeyService.getUserKeys(req.session.user.id);
    res.json(result);
});

app.delete('/api/keys/:key', checkSession, async (req, res) => {
    const apikeyService = new APIKeyService();
    const result = await apikeyService.revokeKey(req.params.key, req.session.user.id);
    res.json(result);
});

app.get('/users', checkSession, async (req, res) => {
    const userService = new UserService();
    const result = await userService.getAllUsers();
    res.json(result);
});

app.get('/users/:id', checkSession, async (req, res) => {
    const userService = new UserService();
    const result = await userService.getUserById(req.params.id);
    res.json(result);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT_NUMBER, (err) => {
    if (err) {
        console.log('Port is not available');
    } else {
        console.log('Server has started and is Listening on port: ', PORT_NUMBER);
    }
});