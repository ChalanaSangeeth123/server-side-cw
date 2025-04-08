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
    }
});

module.exports = pool;