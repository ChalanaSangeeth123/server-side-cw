const express = require('express');
const session = require('express-session');
const cors = require('cors');
const UserService = require('./Services/UserService');
const BlogPostService = require('./Services/BlogPostService');
const APIKey = require('./Services/ApiKeyService');
const countryRouter = require('./Routers/CountryRouter');
const followRouter = require('./Routers/FollowRouter');
const likesRouter = require('./Routers/LikesRouter');
console.log('LikesRouter loaded:', !!likesRouter); // Debug
const apikeyMiddleware = require('./Middleware/APIAuth/APIAuthMiddleWare');
const checkSession = require('./Middleware/SessionAuth/SessionAuth');
const path = require('path');
const axios = require('axios');
const pool = require('./Database/SQLCon');
require('dotenv').config();

console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

if (!process.env.SESSION_SECRET) {
    console.error('Error: SESSION_SECRET is not defined in .env file');
    process.exit(1);
}

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

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});

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
app.get('/api/posts', async (req, res) => {
    const { country, username, sort = 'newest' } = req.query;
    try {
        let query = `
            SELECT 
                bp.*, 
                u.fn, 
                u.sn,
                (SELECT COUNT(*) FROM likes l WHERE l.blog_post_id = bp.id AND l.type = 'like') AS likes,
                (SELECT COUNT(*) FROM likes l WHERE l.blog_post_id = bp.id AND l.type = 'dislike') AS dislikes
            FROM blog_posts bp
            JOIN users u ON bp.user_id = u.id
        `;
        let orderBy = '';
        if (sort === 'newest') {
            orderBy = 'ORDER BY bp.created_at DESC';
        } else if (sort === 'most-liked') {
            orderBy = 'ORDER BY likes DESC, bp.created_at DESC';
        } else {
            orderBy = 'ORDER BY bp.created_at DESC';
        }
        query += ` ${orderBy}`;

        const rows = await new Promise((resolve, reject) => {
            pool.all(query, (err, rows) => (err ? reject(err) : resolve(rows)));
        });

        let posts = rows;
        if (country || username) {
            if (country) {
                posts = posts.filter(post => post.country.toLowerCase().includes(country.toLowerCase()));
            }
            if (username) {
                posts = posts.filter(post => {
                    const fullName = `${post.fn} ${post.sn}`.toLowerCase();
                    return fullName.includes(username.toLowerCase());
                });
            }
        }

        res.json({ success: true, data: posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, error: 'Server error: ' + error.message });
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
app.put('/api/posts', checkSession, async (req, res) => {
    const result = await blogPostService.update(req);
    if (result.success) {
        res.json(result);
    } else {
        res.status(result.error === 'Post not found or not authorized' ? 403 : 400).json(result);
    }
});
app.delete('/api/posts', checkSession, async (req, res) => {
    const result = await blogPostService.delete(req);
    if (result.success) {
        res.json(result);
    } else {
        res.status(result.error === 'Post not found or not authorized' ? 403 : 400).json(result);
    }
});
app.get('/api/posts/search', checkSession, async (req, res) => {
    const { q, type } = req.query;
    if (!q || !type) {
        return res.status(400).json({ success: false, error: 'Query and type are required' });
    }
    const result = await blogPostService.getAll();
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

// Feed route
app.get('/api/feed', checkSession, async (req, res) => {
    const userId = req.session.user.id;
    try {
        const rows = await new Promise((resolve, reject) => {
            pool.all(
                'SELECT bp.*, u.fn, u.sn FROM blog_posts bp JOIN users u ON bp.user_id = u.id ' +
                'WHERE bp.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?) ' +
                'ORDER BY bp.created_at DESC',
                [userId],
                (err, rows) => (err ? reject(err) : resolve(rows))
            );
        });
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Follow routes
app.get('/api/followers', checkSession, async (req, res) => {
    const userId = req.session.user.id;
    try {
        const rows = await new Promise((resolve, reject) => {
            pool.all(
                'SELECT u.id, u.fn, u.sn FROM follows f JOIN users u ON f.follower_id = u.id WHERE f.following_id = ?',
                [userId],
                (err, rows) => (err ? reject(err) : resolve(rows))
            );
        });
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/following', checkSession, async (req, res) => {
    const userId = req.session.user.id;
    try {
        const rows = await new Promise((resolve, reject) => {
            pool.all(
                'SELECT u.id, u.fn, u.sn FROM follows f JOIN users u ON f.following_id = u.id WHERE f.follower_id = ?',
                [userId],
                (err, rows) => (err ? reject(err) : resolve(rows))
            );
        });
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/is-following/:userId', checkSession, async (req, res) => {
    const userId = req.session.user.id;
    const targetUserId = req.params.userId;
    try {
        const row = await new Promise((resolve, reject) => {
            pool.get(
                'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
                [userId, targetUserId],
                (err, row) => (err ? reject(err) : resolve(row))
            );
        });
        res.json({ success: true, isFollowing: !!row });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/follow', checkSession, async (req, res) => {
    const userId = req.session.user.id;
    const { followingId } = req.body;
    if (userId === followingId) {
        return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
    }
    try {
        await new Promise((resolve, reject) => {
            pool.run(
                'INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
                [userId, followingId],
                (err) => (err ? reject(err) : resolve())
            );
        });
        res.json({ success: true, message: 'Followed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/follow/:userId', checkSession, async (req, res) => {
    const userId = req.session.user.id;
    const followingId = req.params.userId;
    try {
        await new Promise((resolve, reject) => {
            pool.run(
                'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
                [userId, followingId],
                (err) => (err ? reject(err) : resolve())
            );
        });
        res.json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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

// Handle client-side routing with logging
app.get('*', (req, res) => {
    console.log('Catch-all route hit:', req.originalUrl);
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