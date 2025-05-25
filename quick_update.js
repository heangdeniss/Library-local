import pg from 'pg';

const { Client } = pg;

const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "Library", 
    password: "468456",
    port: 5432,
});

async function updateBooks() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');
        
        // Check current state
        const currentState = await client.query('SELECT id, title, total_copies, available_copies FROM books ORDER BY id LIMIT 3');
        console.log('\nCurrent state (first 3 books):');
        currentState.rows.forEach(book => {
            console.log(`ID: ${book.id}, Title: ${book.title.substring(0, 40)}, Total: ${book.total_copies}, Available: ${book.available_copies}`);
        });
        
        // Update all books
        console.log('\nUpdating all books to have 3 total and 3 available copies...');
        const updateResult = await client.query('UPDATE books SET total_copies = 3, available_copies = 3');
        console.log(`Successfully updated ${updateResult.rowCount} books`);
        
        // Check final state
        const finalState = await client.query('SELECT id, title, total_copies, available_copies FROM books ORDER BY id LIMIT 3');
        console.log('\nFinal state (first 3 books):');
        finalState.rows.forEach(book => {
            console.log(`ID: ${book.id}, Title: ${book.title.substring(0, 40)}, Total: ${book.total_copies}, Available: ${book.available_copies}`);
        });
        
    } catch (error) {
        console.error('Database error:', error);
    } finally {
        await client.end();
        console.log('\nDatabase connection closed');
    }
}

updateBooks();
