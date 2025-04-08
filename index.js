const express = require('express');
const session = require('express-session');
const UserService = require('./Services/UserService');
const APIKey = require('./Services/ApiKeyService');
const countryRouter = require('./Routers/CountryRouter');
const apikeyMiddleware = require('./Middleware/APIAuth/APIAuthMiddleWare');
const checkSession = require('./Middleware/SessionAuth/SessionAuth');
const path = require('path'); // Required for serving static files
require('dotenv').config();

// Debug: Log the SESSION_SECRET to verify it's loaded
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

// Ensure SESSION_SECRET is defined
if (!process.env.SESSION_SECRET) {
    console.error('Error: SESSION_SECRET is not defined in .env file');
    process.exit(1);
}

const app = express();
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Serve static files from the React app (public/ folder)
app.use(express.static(path.join(__dirname, 'public')));

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

// Handle client-side routing by serving index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT_NUMBER, (err) => {
    if (err) {
        console.log('Port is not available');
    } else {
        console.log('Server has started and is listening on port:', PORT_NUMBER);
    }
});