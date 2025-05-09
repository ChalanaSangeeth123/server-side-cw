const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// Initialize SQLite database
const pool = new sqlite3.Database(process.env.DATABASE_PATH || './countries.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create users table
        pool.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                fn TEXT NOT NULL,
                sn TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Create api_keys table with usage tracking
        pool.run(`
            CREATE TABLE IF NOT EXISTS apikeys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner INTEGER NOT NULL,
                key TEXT UNIQUE NOT NULL,
                usage_count INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner) REFERENCES users(id)
            )
        `);
        // Create blog_posts table for storing blog posts
        pool.run(`
            CREATE TABLE IF NOT EXISTS blog_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                country TEXT NOT NULL,
                date_of_visit DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Create likes table for tracking likes/dislikes on blog posts
        pool.run(`
            CREATE TABLE IF NOT EXISTS likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                blog_post_id INTEGER NOT NULL,
                type TEXT CHECK(type IN ('like', 'dislike')) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id),
                UNIQUE(user_id, blog_post_id) -- Prevent multiple likes/dislikes from the same user on the same post
            )
        `);

        // Create follows table for the user following system
        pool.run(`
            CREATE TABLE IF NOT EXISTS follows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                follower_id INTEGER NOT NULL,
                following_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (follower_id) REFERENCES users(id),
                FOREIGN KEY (following_id) REFERENCES users(id),
                UNIQUE(follower_id, following_id) -- Prevent duplicate follows
            )
        `);
    }
});

module.exports = pool;