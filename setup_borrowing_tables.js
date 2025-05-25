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

console.log('Setting up borrowing system tables...');

async function setupBorrowingTables() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');
        
        // Create borrowing_records table
        await client.query(`
            CREATE TABLE IF NOT EXISTS borrowing_records (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                book_id INTEGER NOT NULL REFERENCES books(id),
                borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                due_date TIMESTAMP NOT NULL,
                return_date TIMESTAMP NULL,
                status VARCHAR(20) DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue')),
                fine_amount DECIMAL(10,2) DEFAULT 0.00,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Created borrowing_records table');
        
        // Create borrowing_settings table
        await client.query(`
            CREATE TABLE IF NOT EXISTS borrowing_settings (
                id SERIAL PRIMARY KEY,
                setting_name VARCHAR(100) UNIQUE NOT NULL,
                setting_value VARCHAR(255) NOT NULL,
                description TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Created borrowing_settings table');
        
        // Insert default borrowing settings
        await client.query(`
            INSERT INTO borrowing_settings (setting_name, setting_value, description) VALUES
            ('default_borrow_days', '14', 'Default number of days a book can be borrowed'),
            ('max_books_per_user', '5', 'Maximum number of books a user can borrow at once'),
            ('fine_per_day', '0.50', 'Fine amount per day for overdue books'),
            ('renewal_limit', '2', 'Maximum number of times a book can be renewed')
            ON CONFLICT (setting_name) DO NOTHING
        `);
        console.log('✓ Inserted default borrowing settings');
        
        // Create indexes for better performance
        await client.query('CREATE INDEX IF NOT EXISTS idx_borrowing_records_user_id ON borrowing_records(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_borrowing_records_book_id ON borrowing_records(book_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_borrowing_records_status ON borrowing_records(status)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_borrowing_records_due_date ON borrowing_records(due_date)');
        console.log('✓ Created database indexes');
        
        // Verify setup
        const borrowingRecordsCount = await client.query('SELECT COUNT(*) as count FROM borrowing_records');
        const settingsCount = await client.query('SELECT COUNT(*) as count FROM borrowing_settings');
        
        console.log(`\n✓ Borrowing system setup completed!`);
        console.log(`- Borrowing records: ${borrowingRecordsCount.rows[0].count}`);
        console.log(`- Settings configured: ${settingsCount.rows[0].count}`);
        console.log('\nThe library borrowing system is now ready to use!');
        
    } catch (err) {
        console.error('Setup error:', err.message);
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

setupBorrowingTables();
