const express = require('express');
const session = require('express-session');
const UserService = require('./Services/UserService');
const APIKey = require('./Services/ApiKeyService');
const countryRouter = require('./Routers/CountryRouter');
const authRoutes = require('./Routers/uthRoutes'); // New for CW2
const blogRoutes = require('./Routers/blogRoutes'); // New for CW2
const socialRoutes = require('./Routers/socialRoutes'); // New for CW2
const searchRoutes = require('./Routers/searchRoutes'); // New for CW2
const apikeyMiddleware = require('./Middleware/APIAuth/APIAuthMiddleWare');
const checkSession = require('./Middleware/SessionAuth/SessionAuth');
const path = require('path');
const cors = require('cors'); // Add CORS
require('dotenv').config();

// Debug: Log the SESSION_SECRET to verify it's loaded
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

// Ensure SESSION_SECRET is defined
if (!process.env.SESSION_SECRET) {
    console.error('Error: SESSION_SECRET is not defined in .env file');
    process.exit(1);
}

const app = express();

// Enable CORS for React frontend
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
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

// Apply session middleware (updated checkSession will handle public routes)
app.use(checkSession);

// API routes with key authentication (from CW1)
app.use('/api/countries', apikeyMiddleware, countryRouter);

// New CW2 routes
app.use('/api/auth', authRoutes);     // User authentication (refactor existing routes)
app.use('/api/blog', blogRoutes);     // Blog post management
app.use('/api/social', socialRoutes); // Likes, follows
app.use('/api/search', searchRoutes); // Search functionality

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Handle client-side routing by serving index.html for all non-API routes
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