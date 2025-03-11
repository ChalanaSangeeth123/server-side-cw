const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL Connection Pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs',
});

// Get all students
app.get('/', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        connection.query('SELECT * FROM students', (err, rows) => {
            connection.release();
            if (!err) {
                res.send(rows);
            } else {
                console.error(err);
                res.status(500).send(err);
            }
        });
    });
});

// Get student by ID
app.get('/:id', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        connection.query('SELECT * FROM students WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release();
            if (!err) {
                res.send(rows);
            } else {
                console.error(err);
                res.status(500).send(err);
            }
        });
    });
});

// Delete student by ID
app.delete('/:id', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        connection.query('DELETE FROM students WHERE id = ?', [req.params.id], (err) => {
            connection.release();
            if (!err) {
                res.send(`Student with ID ${req.params.id} has been removed.`);
            } else {
                console.error(err);
                res.status(500).send(err);
            }
        });
    });
});

// Add a student
app.post('/', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        const params = req.body;

        connection.query('INSERT INTO students SET ?', params, (err) => {
            connection.release();
            if (!err) {
                res.send(`Student with the name: ${params.name} has been added.`);
            } else {
                console.error(err);
                res.status(500).send(err);
            }
        });
    });
});

// Update a student
app.put('/', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        const { id, name } = req.body;

        connection.query('UPDATE students SET name = ? WHERE id = ?', [name, id], (err) => {
            connection.release();
            if (!err) {
                res.send(`Student with ID ${id} has been updated to name: ${name}.`);
            } else {
                console.error(err);
                res.status(500).send(err);
            }
        });
    });
});

// Start server
app.listen(port, () => console.log(`Listening on port ${port}`));
