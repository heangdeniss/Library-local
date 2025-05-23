import pg from "pg";
import { fileURLToPath } from 'url';
import path from 'path';

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Library",
  password: "468456",
  port: 5432,
});

db.connect();

async function fixPdfPaths() {
  try {
    // Get all books
    const books = await db.query('SELECT id, file_name, file_path FROM books');
    
    console.log(`Found ${books.rows.length} books to check and fix...`);
    
    // Fix each book's file path
    for (const book of books.rows) {
      // Extract just the file name from the path
      const fileName = book.file_name;
      const correctPath = 'uploads/' + fileName;
      
      console.log(`Book ID ${book.id}: Changing path from "${book.file_path}" to "${correctPath}"`);
      
      // Update the book record
      await db.query(
        'UPDATE books SET file_path = $1 WHERE id = $2',
        [correctPath, book.id]
      );
    }
    
    console.log('All book PDF paths have been fixed!');
  } catch (err) {
    console.error('Error fixing PDF paths:', err);
  } finally {
    db.end();
  }
}

fixPdfPaths();
