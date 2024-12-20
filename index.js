const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;


const db = new sqlite3.Database('database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            wallet_number TEXT UNIQUE,
            balance REAL DEFAULT 0
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_wallet TEXT,
            recipient_wallet TEXT,
            amount REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});


app.use(bodyParser.json());
app.use(express.static('public'));


app.post('/register', (req, res) => {
    const { username, password, wallet_number } = req.body;
    const balance = 100; 

    db.run(
        `INSERT INTO users (username, password, wallet_number, balance) VALUES (?, ?, ?, ?)`,
        [username, password, wallet_number, balance],
        (err) => {
            if (err) {
                res.status(400).send({ message: 'Error: Username or Wallet Number might be taken.' });
            } else {
                res.send({ message: 'Registration successful!' });
            }
        }
    );
});

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(
        `SELECT wallet_number, balance FROM users WHERE username = ? AND password = ?`,
        [username, password],
        (err, row) => {
            if (err || !row) {
                res.status(400).send({ message: 'Invalid username or password.' });
            } else {
                res.send(row);
            }
        }
    );
});


app.get('/user/:wallet', (req, res) => {
    const { wallet } = req.params;

    db.get(
        `SELECT wallet_number, balance FROM users WHERE wallet_number = ?`,
        [wallet],
        (err, row) => {
            if (err || !row) {
                res.status(404).send({ message: 'User not found.' });
            } else {
                res.send(row);
            }
        }
    );
});


app.post('/transfer', (req, res) => {
    const { sender_wallet, recipient_wallet, amount } = req.body;

    db.serialize(() => {
        db.get(`SELECT balance FROM users WHERE wallet_number = ?`, [sender_wallet], (err, sender) => {
            if (err || !sender || sender.balance < amount) {
                return res.status(400).send({ message: 'Insufficient funds or sender not found.' });
            }

            db.get(`SELECT balance FROM users WHERE wallet_number = ?`, [recipient_wallet], (err, recipient) => {
                if (err || !recipient) {
                    return res.status(400).send({ message: 'Recipient not found.' });
                }

                db.run(`UPDATE users SET balance = balance - ? WHERE wallet_number = ?`, [amount, sender_wallet]);
                db.run(`UPDATE users SET balance = balance + ? WHERE wallet_number = ?`, [amount, recipient_wallet]);

                db.run(
                    `INSERT INTO transactions (sender_wallet, recipient_wallet, amount) VALUES (?, ?, ?)`,
                    [sender_wallet, recipient_wallet, amount]
                );

                res.send({ message: 'Transfer successful!' });
            });
        });
    });
});


app.get('/history/:wallet', (req, res) => {
    const { wallet } = req.params;

    db.all(
        `SELECT * FROM transactions WHERE sender_wallet = ? OR recipient_wallet = ? ORDER BY timestamp DESC`,
        [wallet, wallet],
        (err, rows) => {
            if (err) {
                res.status(500).send({ message: 'Error fetching transaction history.' });
            } else {
                res.send(rows);
            }
        }
    );
});

app.listen(port, () => {
    console.log(`FPI Wallet app running at http://localhost:${port}`);
});
