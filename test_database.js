import pg from 'pg';

const { Client } = pg;

const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "Library", 
    password: "468456",
    port: 5432,
});

async function testDatabase() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');
        
        // Check users
        const users = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`Users in database: ${users.rows[0].count}`);
        
        // Check books
        const books = await client.query('SELECT COUNT(*) as count FROM books');
        console.log(`Books in database: ${books.rows[0].count}`);
        
        // Check borrowing records
        const borrowing = await client.query('SELECT COUNT(*) as count FROM borrowing_records');
        console.log(`Borrowing records: ${borrowing.rows[0].count}`);
        
        // Check if books table has new columns
        const checkColumns = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'books' 
            AND column_name IN ('total_copies', 'available_copies')
        `);
        console.log('Book columns with copies:', checkColumns.rows.map(r => r.column_name));
        
        // Sample user for testing
        await client.query(`
            INSERT INTO users (username, email, password) 
            VALUES ('testuser', 'test@example.com', 'password123')
            ON CONFLICT (email) DO NOTHING
        `);
        console.log('✓ Test user created/exists');
        
    } catch (err) {
        console.error('Database test error:', err.message);
    } finally {
        await client.end();
    }
}

testDatabase();
