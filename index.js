const express = require('express');
const session = require('express-session');
const UserService = require('./services/userservice'); // Fix case
const APIKey = require('./services/apikeyservice'); // Fix case
const apikeyMiddleware = require('./middleware/apiauth/apiauthmiddleware'); // Fix case
const checkSession = require('./middleware/sessionauth/sessionauth'); // Fix case
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

// CHANGE THIS LINE: You're currently mounting at '/api' but should be '/api/countries'
app.use('/api/countries', countryRouter);

// Rest of your routes...
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

app.post('/getapikey', checkSession, async (req, res) => {
    try {
        const apikeyService = new APIKey();
        req.body.owner = req.session.user.id; // Use logged-in user ID
        const data = await apikeyService.create(req);
        res.json(data);
    } catch (error) {
        console.error('Error generating API key:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get('/apikeys', checkSession, async (req, res) => {
    const apikeyService = new APIKey();
    const result = await apikeyService.getUserKeys(req.session.user.id);
    res.json(result);
});

app.post('/revokeapikey', checkSession, async (req, res) => {
    const apikeyService = new APIKey();
    const { key } = req.body;
    const result = await apikeyService.revokeKey(key);
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

app.get('/contactus', checkSession, (req, res) => {
    res.send('<h1>Contact us</h1>');
});

app.get('/aboutus', (req, res) => {
    res.sendFile(__dirname + '/text.html'); // Fixed path
});


app.listen(PORT_NUMBER, (err) => {
    if (err) {
        console.log('Port is not available');
    } else {
        console.log('Server has started and is Listening on port: ', PORT_NUMBER);
    }
});