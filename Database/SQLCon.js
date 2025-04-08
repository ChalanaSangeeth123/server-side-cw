const Database = require('sqlite3');
const pool = new Database.Database('./attractions.db', (err) => {
    if (err) {
        console.error('❌ SQLite Connection Failed:', err);
        process.exit(1);
    }
    console.log('✅ SQLite Connected Successfully!');

    pool.serialize(() => {
        // Create users table
        pool.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                fn TEXT NOT NULL,
                sn TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error('Error creating users table:', err);
        });

        // Create apikeys table with user_id column
        pool.run(`
            CREATE TABLE IF NOT EXISTS apikeys (
                key TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_used DATETIME,
                usage_count INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `, (err) => {
            if (err) console.error('Error creating apikeys table:', err);
        });

        // Create countries table
        pool.run(`
            CREATE TABLE IF NOT EXISTS countries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                currency TEXT,
                capital TEXT,
                languages TEXT,
                flag TEXT
            )
        `, (err) => {
            if (err) console.error('Error creating countries table:', err);
        });
    });
});

module.exports = pool;