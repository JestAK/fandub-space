const mysql = require('mysql2/promise');
require('dotenv').config();

async function runTests() {
    console.log("--- Starting DB connection test ---");

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    console.log("Connected successfully!");

    console.log("--- INSERT ---");
    const [insertRes] = await connection.execute(
        'INSERT INTO Users (name, role, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())',
        ['Test User', 'translator']
    );
    const userId = insertRes.insertId;
    console.log(`User inserted with ID: ${userId}`);

    console.log("--- SELECT ---");
    const [rows] = await connection.execute('SELECT id, name, role FROM Users WHERE id = ?', [userId]);
    console.log("User data from DB:", rows);

    console.log("--- UPDATE ---");
    await connection.execute(
        'UPDATE Users SET name = ?, role = ?, updatedAt = NOW() WHERE id = ?',
        ['Updated Name', 'actor', userId]
    );

    const [updatedRows] = await connection.execute('SELECT id, name, role FROM Users WHERE id = ?', [userId]);
    console.log("Data after update:", updatedRows);

    console.log("--- DELETE ---");
    await connection.execute('DELETE FROM Users WHERE id = ?', [userId]);

    const [checkRows] = await connection.execute('SELECT id FROM Users WHERE id = ?', [userId]);
    if (checkRows.length === 0) {
        console.log("User deleted successfully!");
    } else {
        console.log("Error: User still exists.");
    }

    await connection.end();
    console.log("--- Test finished, connection closed ---");
}

runTests();