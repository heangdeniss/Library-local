import pg from 'pg';

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Library",
  password: "468456",
  port: 5432,
});

async function createContactTable() {
  try {
    await db.connect();
    console.log('Connected to database');

    // Create contact messages table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contact_messages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          subject VARCHAR(500),
          message TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'resolved')),
          admin_notes TEXT,
          user_id INTEGER REFERENCES users(id),
          ip_address INET,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          replied_at TIMESTAMP NULL,
          replied_by INTEGER REFERENCES admin(id)
      );
    `;

    await db.query(createTableQuery);
    console.log('Contact messages table created successfully');

    // Create indexes
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);',
      'CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);'
    ];

    for (const indexQuery of createIndexes) {
      await db.query(indexQuery);
    }
    
    console.log('Indexes created successfully');

    await db.end();
    console.log('Database connection closed');
    
  } catch (err) {
    console.error('Error creating contact table:', err);
    process.exit(1);
  }
}

createContactTable();
