import pg from 'pg';

const { Client } = pg;

const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "Library", 
    password: "468456",
    port: 5432,
});

async function checkBooks() {
    try {
        await client.connect();
        
        // Check available books
        const books = await client.query(`
            SELECT id, title, author, category, total_copies, available_copies 
            FROM books 
            ORDER BY id 
            LIMIT 10
        `);
        
        console.log('Available books:');
        books.rows.forEach(book => {
            console.log(`ID: ${book.id}, Title: "${book.title}", Available: ${book.available_copies}/${book.total_copies}`);
        });
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkBooks();
