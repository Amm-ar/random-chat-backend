// db/database.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open the database file
const db = new sqlite3.Database(path.join(__dirname, 'chat_app.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create table if not exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS connections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            location TEXT NOT NULL,
            connected_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

/**
 * Insert a connection record into database
 */
function logConnection(username, ip, location) {
    db.run(`
        INSERT INTO connections (username, ip_address, location)
        VALUES (?, ?, ?)
    `, [username, ip, location], function(err) {
        if (err) {
            console.error('Error inserting into database:', err.message);
        }
    });
}

module.exports = {
    logConnection
};
