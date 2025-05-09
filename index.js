const express = require('express');
const session = require('express-session');
const cors = require('cors');
const UserService = require('./Services/UserService');
const BlogPostService = require('./Services/BlogPostService');
const APIKey = require('./Services/ApiKeyService');
const countryRouter = require('./Routers/CountryRouter');
const followRouter = require('./Routers/FollowRouter');
const likesRouter = require('./Routers/LikesRouter');
const apikeyMiddleware = require('./Middleware/APIAuth/APIAuthMiddleWare');
const checkSession = require('./Middleware/SessionAuth/SessionAuth');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Debug: Log the SESSION_SECRET to verify it's loaded
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

// Ensure SESSION_SECRET is defined
if (!process.env.SESSION_SECRET) {
    console.error('Error: SESSION_SECRET is not defined in .env file');
    process.exit(1);
}

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true
    })
);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/countries', apikeyMiddleware, countryRouter);
app.get('/api/countries/list', apikeyMiddleware, async (req, res) => {
    try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const countryList = response.data.map(country => ({ name: country.name.common }));
        res.json({ success: true, data: countryList });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch country list: ' + error.message });
    }
});

// Blog post routes
const blogPostService = new BlogPostService();
app.get('/api/posts', checkSession, async (req, res) => {
    const { country, username } = req.query;
    let result;
    if (country || username) {
        result = await blogPostService.getAll(); // Fetch all posts first, then filter client-side for now
        if (result.success) {
            let posts = result.data;
            if (country) {
                posts = posts.filter(post => post.country.toLowerCase().includes(country.toLowerCase()));
            }
            if (username) {
                posts = posts.filter(post => {
                    // Assuming username is fetched via a join in getAll, adjust if needed
                    return post.username?.toLowerCase().includes(username.toLowerCase());
                });
            }
            res.json({ success: true, data: posts });
        } else {
            res.status(500).json(result);
        }
    } else {
        result = await blogPostService.getAll();
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    }
});
app.post('/api/posts', checkSession, async (req, res) => {
    const result = await blogPostService.create(req);
    if (result.success) {
        res.status(201).json(result);
    } else {
        res.status(400).json(result);
    }
});
app.get('/api/posts/search', checkSession, async (req, res) => {
    const { q, type } = req.query;
    if (!q || !type) {
        return res.status(400).json({ success: false, error: 'Query and type are required' });
    }
    const result = await blogPostService.getAll(); // Placeholder, adjust if search is optimized
    if (result.success) {
        let posts = result.data;
        if (type === 'country' || type === 'username') {
            const searchResult = await blogPostService.blogPostDAO.search(q, type);
            if (searchResult.success) {
                posts = searchResult.data;
            } else {
                return res.status(500).json(searchResult);
            }
        }
        res.json({ success: true, data: posts });
    } else {
        res.status(500).json(result);
    }
});

app.use('/api', followRouter);
app.use('/api/likes', likesRouter);

// User routes
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

app.get('/check-session', checkSession, (req, res) => {
    res.json({ success: true, user: req.session.user });
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.post('/getapikey', checkSession, async (req, res) => {
    const apikeyservice = new APIKey();
    const data = await apikeyservice.create(req);
    res.json(data);
});

// Handle client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT_NUMBER = process.env.PORT || 5000;
app.listen(PORT_NUMBER, (err) => {
    if (err) {
        console.log('Port is not available');
    } else {
        console.log('Server has started and is listening on port:', PORT_NUMBER);
    }
});