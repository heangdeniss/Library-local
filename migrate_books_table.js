import pg from 'pg';

const { Client } = pg;

// Database connection (using same config as main app)
const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "Library", 
    password: "468456",
    port: 5432,
});

console.log('Starting books table migration...');

async function migrateBooks() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');
        
        // Check if columns already exist
        const checkColumns = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'books' 
            AND column_name IN ('total_copies', 'available_copies')
        `);
        
        const existingColumns = checkColumns.rows.map(row => row.column_name);
        
        // Add total_copies if it doesn't exist
        if (!existingColumns.includes('total_copies')) {
            await client.query('ALTER TABLE books ADD COLUMN total_copies INTEGER DEFAULT 1');
            console.log('✓ Added total_copies column');
        } else {
            console.log('total_copies column already exists');
        }
        
        // Add available_copies if it doesn't exist
        if (!existingColumns.includes('available_copies')) {
            await client.query('ALTER TABLE books ADD COLUMN available_copies INTEGER DEFAULT 1'); 
            console.log('✓ Added available_copies column');
        } else {
            console.log('available_copies column already exists');
        }
        
        // Update existing records to have default values
        const updateResult1 = await client.query('UPDATE books SET total_copies = 1 WHERE total_copies IS NULL');
        const updateResult2 = await client.query('UPDATE books SET available_copies = 1 WHERE available_copies IS NULL');
        console.log('✓ Updated existing records with default values');
        
        // Verify the migration
        const bookCount = await client.query('SELECT COUNT(*) as count FROM books');
        console.log(`\n✓ Migration completed! Found ${bookCount.rows[0].count} existing books.`);
        console.log('All existing books now have total_copies=1 and available_copies=1');
        
    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

migrateBooks();
