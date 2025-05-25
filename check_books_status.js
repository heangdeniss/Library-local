import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Library',
    password: '468456',
    port: 5432,
});

async function checkBooks() {
    const client = await pool.connect();
    try {
        const books = await client.query('SELECT id, title, total_copies, available_copies FROM books ORDER BY id LIMIT 10');
        console.log('Book availability status:');
        console.log('========================');
        books.rows.forEach(book => {
            console.log(`ID: ${book.id} | ${book.title.substring(0, 40).padEnd(40)} | Total: ${book.total_copies} | Available: ${book.available_copies}`);
        });
        console.log(`\nTotal books checked: ${books.rows.length}`);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        pool.end();
    }
}

checkBooks();
