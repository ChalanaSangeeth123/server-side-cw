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

        // Create blog_posts table
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
        `, (err) => {
            if (err) {
                console.error('Error creating blog_posts table:', err);
                return;
            }

            // Add additional columns to blog_posts table 
            const columnsToAdd = [
                { name: 'capital', type: 'TEXT' },
                { name: 'currency', type: 'TEXT' },
                { name: 'languages', type: 'TEXT' },
                { name: 'flag', type: 'TEXT' }
            ];

            pool.all(`PRAGMA table_info(blog_posts);`, (err, columns) => {
                if (err) {
                    console.error('Error fetching blog_posts schema:', err);
                    return;
                }

                columnsToAdd.forEach(col => {
                    const exists = columns.some(column => column.name === col.name);
                    if (!exists) {
                        pool.run(`ALTER TABLE blog_posts ADD COLUMN ${col.name} ${col.type}`, (err) => {
                            if (err) {
                                console.error(`Error adding column ${col.name}:`, err);
                            } else {
                                console.log(`Column ${col.name} added to blog_posts table.`);
                            }
                        });
                    }
                });
            });
        });

        // Create likes table
        pool.run(`
            CREATE TABLE IF NOT EXISTS likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                blog_post_id INTEGER NOT NULL,
                type TEXT CHECK(type IN ('like', 'dislike')) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id),
                UNIQUE(user_id, blog_post_id)
            )
        `);

        // Create follows table
        pool.run(`
            CREATE TABLE IF NOT EXISTS follows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                follower_id INTEGER NOT NULL,
                following_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (follower_id) REFERENCES users(id),
                FOREIGN KEY (following_id) REFERENCES users(id),
                UNIQUE(follower_id, following_id)
            )
        `);
    }
});

module.exports = pool;
