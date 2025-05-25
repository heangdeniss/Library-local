import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the SQL file
const sqlFile = fs.readFileSync(path.join(__dirname, 'database_setup.sql'), 'utf8');

// Connect to database
const db = new sqlite3.Database('library.db');

// Execute the SQL
db.exec(sqlFile, (err) => {
    if (err) {
        console.error('Error setting up database:', err);
    } else {
        console.log('Database setup completed successfully!');
        console.log('Borrowing tables created and ready to use.');
    }
    db.close();
});
