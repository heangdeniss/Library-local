import express from "express"; 
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import pg from "pg";
import fs from "fs";
import { fileURLToPath } from 'url';

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.static("public"));
// Simple route to directly access the PDF files in /uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Library",
  password: "468456",
  port: 5432,
})

db.connect();

// Promisified query method for PostgreSQL
const query = async (text, params) => {
  try {
    const result = await db.query(text, params);
    return result.rows;
  } catch (err) {
    throw err;
  }
};

app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        console.log('Passwords do not match');
        return res.status(400).send('Passwords do not match');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password:', hashedPassword);        // Use promisified query for consistency
        const emailResults = await query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (emailResults.length > 0) {
            console.log('Email already registered');
            return res.status(400).send('Email already registered');
        }

        const results = await query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id', [username, email, hashedPassword]);
        console.log('User inserted with ID:', results[0].id);
        res.redirect('/register');
        
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {

    const queryStr = 'SELECT * FROM users WHERE email = $1';
    const results = await query(queryStr, [email]);

    if (results.length === 0) {
      return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, results[0].password);

    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    res.redirect('/index1');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error logging in');
  }
});

// Show books by category
app.get('/analysis-statistic', async (req, res) => {
    try {
        const results = await query('SELECT * FROM books WHERE category = $1 ORDER BY upload_date DESC', ['analysis-statistic']);
        res.render('category-listing.ejs', { 
            books: results,
            categoryName: 'Analysis & Statistics',
            categoryDescription: 'Discover resources on statistical methods, data analysis techniques, and quantitative research.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('category-listing.ejs', { 
            books: [],
            categoryName: 'Analysis & Statistics',
            categoryDescription: 'Discover resources on statistical methods, data analysis techniques, and quantitative research.'
        });
    }
});
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/index1", (req, res) => {
  res.render("index1.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/books", (req, res) => {
  res.render("books.ejs");
});



app.get("/quote", (req, res) => {
  res.render("quote.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.get("/book1", (req, res) => {
  res.render("book1.ejs")
})

app.post("/submit", (req, res) => {
  const { name, email, text } = req.body;
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Message:", text);

  res.render("contact.ejs", { 
    name, 
    email, 
    message: text, 
    success: true 
  });
});

app.get('/admin/dashboard', (req, res) => {
    res.render('admin-dashboard.ejs');
});

app.post('/admin/register', async (req, res) => {
    const { username, email, password } = req.body;    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const results = await query('INSERT INTO admin (username, email, password) VALUES ($1, $2, $3) RETURNING id', [username, email, hashedPassword]);
        console.log('Admin registered with ID:', results[0].id);
        res.redirect('/admin/login');
        
    } catch (err) {
        console.error('Error registering admin:', err);
        return res.status(500).send('Error registering admin');
    }
});

app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }    try {
        const user = await query('SELECT * FROM admin WHERE email = $1', [email]);

        if (!user || user.length === 0) {
            console.log('User not found for email:', email);
            return res.status(400).send('User not found');
        }
        
        const isMatch = await bcrypt.compare(password, user[0].password);
        
        if (!isMatch) {
            console.log('Invalid credentials for email:', email);
            return res.status(400).send('Invalid credentials');
        }
        
        res.redirect('/admin/dashboard');
        
    } catch (err) {
        console.error('Error logging in:', err);
        return res.status(500).send('Error logging in');
    }
});

app.get('/admin/login', (req, res) => {
    res.render('admin-login.ejs');
});

app.get('/admin/register', (req, res) => {
    res.render('admin-register.ejs');
});

app.get('/admin', (req, res) => {
    res.redirect('/admin/login');
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/admin/login');
    });
});

// Redirect GET requests for upload-pdf to the dashboard
app.get('/admin/upload-pdf', (req, res) => {
    res.redirect('/admin/dashboard#upload-section');
});

// Upload PDF route
app.post('/admin/upload-pdf', upload.single('pdf'), async (req, res) => {
    const { title, author, category, description } = req.body;
    
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }    try {
        // Store only the relative path from the public folder using platform-agnostic path handling
        let filePath = req.file.path;
        if (filePath.startsWith('public\\') || filePath.startsWith('public/')) {
            filePath = filePath.substring(7); // Remove 'public/' or 'public\'
        }
        console.log('Original path:', req.file.path);
        console.log('Normalized path:', filePath);
          const fileName = req.file.filename;
        const fileSize = req.file.size;

        const results = await query(
            'INSERT INTO books (title, author, category, description, file_path, file_name, file_size) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [title, author, category, description, 'uploads/' + fileName, fileName, fileSize]
        );

        console.log('PDF uploaded with ID:', results[0].id);
        res.redirect('/admin/dashboard?success=upload');
        
    } catch (err) {
        console.error('Error uploading PDF:', err);
        res.status(500).send('Error uploading PDF');
    }
});

// Get books by category
app.get('/api/books/:category', async (req, res) => {
    const { category } = req.params;
    
    try {
        const results = await query('SELECT * FROM books WHERE category = $1 ORDER BY upload_date DESC', [category]);
        res.json(results);
    } catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).json({ error: 'Error fetching books' });
    }
});

// Get all books for admin
app.get('/api/admin/books', async (req, res) => {
    try {
        const results = await query('SELECT * FROM books ORDER BY upload_date DESC');
        res.json(results);
    } catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).json({ error: 'Error fetching books' });
    }
});

// Delete book route
app.delete('/api/admin/books/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await query('DELETE FROM books WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).json({ error: 'Error deleting book' });
    }
});

// Update category routes to fetch from database
app.get('/big-data', async (req, res) => {
    try {
        const results = await query('SELECT * FROM books WHERE category = $1 ORDER BY upload_date DESC', ['big-data']);
        res.render('category-listing.ejs', { 
            books: results,
            categoryName: 'Big Data',
            categoryDescription: 'Explore books about processing and analyzing large-scale data sets, distributed computing, and data technologies.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('category-listing.ejs', { 
            books: [],
            categoryName: 'Big Data',
            categoryDescription: 'Explore books about processing and analyzing large-scale data sets, distributed computing, and data technologies.'
        });
    }
});

app.get('/ml-ai', async (req, res) => {
    try {
        const results = await query('SELECT * FROM books WHERE category = $1 ORDER BY upload_date DESC', ['ml-ai']);
        res.render('category-listing.ejs', { 
            books: results,
            categoryName: 'Machine Learning & AI',
            categoryDescription: 'Discover books on artificial intelligence, machine learning algorithms, and computational intelligence.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('category-listing.ejs', { 
            books: [],
            categoryName: 'Machine Learning & AI',
            categoryDescription: 'Discover books on artificial intelligence, machine learning algorithms, and computational intelligence.'
        });
    }
});

app.get('/data-vis', async (req, res) => {
    try {
        const results = await query('SELECT * FROM books WHERE category = $1 ORDER BY upload_date DESC', ['data-vis']);
        res.render('category-listing.ejs', { 
            books: results,
            categoryName: 'Data Visualization',
            categoryDescription: 'Learn about effective techniques for visually presenting and communicating data insights through charts, graphs, and interactive displays.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('category-listing.ejs', { 
            books: [],
            categoryName: 'Data Visualization',
            categoryDescription: 'Learn about effective techniques for visually presenting and communicating data insights through charts, graphs, and interactive displays.'
        });
    }
});

app.get('/dl-nn', async (req, res) => {
    try {
        const results = await query('SELECT * FROM books WHERE category = $1 ORDER BY upload_date DESC', ['dl-nn']);
        res.render('category-listing.ejs', { 
            books: results,
            categoryName: 'Deep Learning & Neural Networks',
            categoryDescription: 'Explore advanced topics in neural networks, deep learning architectures, and their applications in various domains.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('category-listing.ejs', { 
            books: [],
            categoryName: 'Deep Learning & Neural Networks',
            categoryDescription: 'Explore advanced topics in neural networks, deep learning architectures, and their applications in various domains.'
        });
    }
});

app.get('/data-engineer-database', async (req, res) => {
    try {
        const results = await query('SELECT * FROM books WHERE category = $1 ORDER BY upload_date DESC', ['data-engineer-database']);
        res.render('category-listing.ejs', { 
            books: results,
            categoryName: 'Data Engineering & Databases',
            categoryDescription: 'Learn about database systems, data pipelines, ETL processes, and modern data infrastructure development.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('category-listing.ejs', { 
            books: [],
            categoryName: 'Data Engineering & Databases',
            categoryDescription: 'Learn about database systems, data pipelines, ETL processes, and modern data infrastructure development.'
        });    }
});

// Individual PDF book view route
app.get('/view-pdf/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        console.log(`Fetching book with ID: ${bookId}`);
        
        const bookResults = await query('SELECT * FROM books WHERE id = $1', [bookId]);
        
        if (bookResults.length === 0) {
            console.log(`Book with ID ${bookId} not found`);
            return res.status(404).send('Book not found');
        }
        
        const book = bookResults[0];
        console.log(`Found book: ${book.title}, filepath: ${book.file_path}`);
        
        // Verify file exists
        const fullPath = path.join(__dirname, 'public', book.file_path);
        if (!fs.existsSync(fullPath)) {
            console.error(`PDF file not found at ${fullPath}`);
        } else {
            console.log(`PDF file exists at ${fullPath}`);
        }
        
        let categoryName = '';
        let categoryPath = '';
          // Map category ID to readable name
        switch(book.category) {
            case 'analysis-statistic':
                categoryName = 'Analysis & Statistics';
                categoryPath = 'analysis-statistic';
                break;
            case 'big-data':
                categoryName = 'Big Data';
                categoryPath = 'big-data';
                break;
            case 'ml-ai':
                categoryName = 'Machine Learning & AI';
                categoryPath = 'ml-ai';
                break;
            case 'data-vis':
                categoryName = 'Data Visualization';
                categoryPath = 'data-vis';
                break;
            case 'dl-nn':
                categoryName = 'Deep Learning & Neural Networks';
                categoryPath = 'dl-nn';
                break;
            case 'data-engineer-database':
                categoryName = 'Data Engineering & Databases';
                categoryPath = 'data-engineer-database';
                break;
            default:
                categoryName = 'Unknown Category';
                categoryPath = 'book1';
        }
        
        res.render('pdf-viewer-new.ejs', { book, categoryName, categoryPath });
    } catch (err) {
        console.error('Error fetching book:', err);
        res.status(500).send('Error fetching book');
    }
});

// Direct PDF serve route for debugging
app.get('/direct-pdf/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const bookResults = await query('SELECT * FROM books WHERE id = $1', [bookId]);
        
        if (bookResults.length === 0) {
            return res.status(404).send('Book not found');
        }
        
        const book = bookResults[0];
        const fullPath = path.join(__dirname, 'public', book.file_path);
        
        if (!fs.existsSync(fullPath)) {
            return res.status(404).send(`PDF file not found at ${fullPath}`);
        }
        
        // Send the file directly
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${book.file_name}"`);
        
        // Create a readable stream and pipe it to the response
        const fileStream = fs.createReadStream(fullPath);
        fileStream.pipe(res);
        
    } catch (err) {
        console.error('Error serving PDF:', err);
        res.status(500).send('Error serving PDF');
    }
});

// Add a more robust PDF serving route
app.get('/serve-pdf/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        console.log(`Serving PDF for book ID: ${bookId}`);
        
        const bookResults = await query('SELECT * FROM books WHERE id = $1', [bookId]);
        
        if (bookResults.length === 0) {
            console.log(`Book with ID ${bookId} not found for PDF serving`);
            return res.status(404).send('Book not found');
        }
        
        const book = bookResults[0];
        console.log(`Found book for PDF serving: ${book.title}, filepath: ${book.file_path}`);
        
        // Build the full path - handle both Windows and Unix paths
        const fullPath = path.join(__dirname, 'public', book.file_path.replace(/\\/g, path.sep).replace(/\//g, path.sep));
        console.log(`Attempting to serve PDF from: ${fullPath}`);
        
        if (!fs.existsSync(fullPath)) {
            console.error(`PDF file not found at ${fullPath}`);
            return res.status(404).send(`PDF file not found. Path: ${fullPath}`);
        }
        
        console.log(`PDF file exists, serving: ${fullPath}`);
        
        // Send the file directly using Express's sendFile
        res.sendFile(fullPath);
        
    } catch (err) {
        console.error('Error serving PDF:', err);
        res.status(500).send('Error serving PDF');
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
