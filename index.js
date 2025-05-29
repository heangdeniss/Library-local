import express from "express"; 
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import pg from "pg";
import fs from "fs";
import session from "express-session";
import { fileURLToPath } from 'url';

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', './views');

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
app.use(express.json()); // For parsing JSON requests

// Session configuration
app.use(session({
    secret: 'library-management-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

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

// Authentication middleware for users
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.redirect('/login');
    }
};

// Authentication middleware for admin
const requireAdminAuth = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return next();
    } else {
        return res.redirect('/admin/login');
    }
};

app.post('/register', async (req, res) => {
    const { username, email, password, 'confirm-password': confirmPassword } = req.body;

    // Validate input
    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    if (password !== confirmPassword) {
        console.log('Passwords do not match');
        return res.status(400).json({ 
            success: false, 
            message: 'Passwords do not match' 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password:', hashedPassword);
        
        // Check if email already exists
        const emailResults = await query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (emailResults.length > 0) {
            console.log('Email already registered');
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Check if username already exists
        const usernameResults = await query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (usernameResults.length > 0) {
            console.log('Username already taken');
            return res.status(400).json({ 
                success: false, 
                message: 'Username already taken' 
            });
        }

        const results = await query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id', [username, email, hashedPassword]);
        console.log('User inserted with ID:', results[0].id);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Registration successful!' 
        });
        
    } catch (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Error registering user' 
        });
    }
});
app.post('/login', async (req, res) => {
    const { email, password, remember } = req.body;
    
    // Validate input
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email and password are required' 
        });
    }
    
    try {
        const queryStr = 'SELECT * FROM users WHERE email = $1';
        const results = await query(queryStr, [email]);

        if (results.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const isMatch = await bcrypt.compare(password, results[0].password);

        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Create user session
        req.session.userId = results[0].id;
        req.session.username = results[0].username;
        req.session.email = results[0].email;

        // Handle remember me functionality
        if (remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Login successful!',
            redirectUrl: '/index1'
        });
        
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Error logging in' 
        });
    }
});

// User logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});

// Show books by category
app.get('/analysis-statistic', requireAuth, async (req, res) => {
    try {
        const results = await query(`
            SELECT *, 
                   COALESCE(available_copies, total_copies, 1) as available_copies,
                   COALESCE(total_copies, 1) as total_copies
            FROM books 
            WHERE category = $1 
            ORDER BY upload_date DESC
        `, ['analysis-statistic']);
        res.render('analysis-statistic.ejs', { 
            books: results,
            categoryName: 'Analysis & Statistics',
            categoryDescription: 'Discover resources on statistical methods, data analysis techniques, and quantitative research.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('analysis-statistic.ejs', { 
            books: [],
            categoryName: 'Analysis & Statistics',
            categoryDescription: 'Discover resources on statistical methods, data analysis techniques, and quantitative research.'
        });
    }
});
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/index1", requireAuth, (req, res) => {
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

// Legal and informational pages
app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/privacy-policy", (req, res) => {
  res.render("privacy-policy.ejs");
});

app.get("/terms-of-service", (req, res) => {
  res.render("terms-of-service.ejs");
});

app.get("/book1", requireAuth, (req, res) => {
  res.render("book1.ejs")
})

app.post("/submit", async (req, res) => {
  const { name, email, text } = req.body;
  
  // Validate input
  if (!name || !email || !text) {
    return res.status(400).render("contact.ejs", { 
      error: "All fields are required",
      name: name || '',
      email: email || '',
      message: text || ''
    });
  }

  try {
    // Get client IP address
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    // Get user ID if logged in
    const userId = req.session && req.session.userId ? req.session.userId : null;
    
    // Insert contact message into database
    const result = await query(`
      INSERT INTO contact_messages (name, email, message, user_id, ip_address) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id
    `, [name, email, text, userId, clientIp]);
    
    console.log("Contact message saved with ID:", result[0].id);
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Message:", text);

    res.render("contact.ejs", { 
      name, 
      email, 
      message: text, 
      success: true 
    });
    
  } catch (err) {
    console.error('Error saving contact message:', err);
    res.render("contact.ejs", { 
      name, 
      email, 
      message: text, 
      error: "Failed to send message. Please try again."
    });
  }
});

app.get('/admin/dashboard', requireAdminAuth, async (req, res) => {
    try {
        // Get recent borrowing activity with usernames
        const recentBorrowings = await query(`
            SELECT br.*, u.username, u.email, b.title, b.author
            FROM borrowing_records br
            JOIN users u ON br.user_id = u.id
            JOIN books b ON br.book_id = b.id
            ORDER BY br.borrow_date DESC
            LIMIT 10
        `);

        // Get borrowing statistics
        const stats = {
            totalBorrowings: 0,
            activeBorrowings: 0,
            overdueBorrowings: 0,
            totalUsers: 0,
            totalBooks: 0
        };

        const totalBorrowingsResult = await query('SELECT COUNT(*) as count FROM borrowing_records');
        stats.totalBorrowings = parseInt(totalBorrowingsResult[0].count);

        const activeBorrowingsResult = await query('SELECT COUNT(*) as count FROM borrowing_records WHERE status = $1', ['borrowed']);
        stats.activeBorrowings = parseInt(activeBorrowingsResult[0].count);

        const overdueBorrowingsResult = await query('SELECT COUNT(*) as count FROM borrowing_records WHERE status = $1 AND due_date < NOW()', ['borrowed']);
        stats.overdueBorrowings = parseInt(overdueBorrowingsResult[0].count);

        const totalUsersResult = await query('SELECT COUNT(*) as count FROM users');
        stats.totalUsers = parseInt(totalUsersResult[0].count);

        const totalBooksResult = await query('SELECT COUNT(*) as count FROM books');
        stats.totalBooks = parseInt(totalBooksResult[0].count);

        res.render('admin-dashboard.ejs', { recentBorrowings, stats });
    } catch (err) {
        console.error('Error loading admin dashboard:', err);
        res.render('admin-dashboard.ejs', { recentBorrowings: [], stats: {} });
    }
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
        
        // Create admin session
        req.session.adminId = user[0].id;
        req.session.adminUsername = user[0].username;
        req.session.adminEmail = user[0].email;
        
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
app.get('/big-data', requireAuth, async (req, res) => {
    try {
        const results = await query(`
            SELECT *, 
                   COALESCE(available_copies, total_copies, 1) as available_copies,
                   COALESCE(total_copies, 1) as total_copies
            FROM books 
            WHERE category = $1 
            ORDER BY upload_date DESC
        `, ['big-data']);        res.render('big-data.ejs', { 
            books: results,
            categoryName: 'Big Data',
            categoryDescription: 'Explore books about processing and analyzing large-scale data sets, distributed computing, and data technologies.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('big-data.ejs', { 
            books: [],
            categoryName: 'Big Data',
            categoryDescription: 'Explore books about processing and analyzing large-scale data sets, distributed computing, and data technologies.'
        });
    }
});

app.get('/ml-ai', requireAuth, async (req, res) => {
    try {
        const results = await query(`
            SELECT *, 
                   COALESCE(available_copies, total_copies, 1) as available_copies,
                   COALESCE(total_copies, 1) as total_copies
            FROM books 
            WHERE category = $1 
            ORDER BY upload_date DESC
        `, ['ml-ai']);        res.render('ml-ai.ejs', { 
            books: results,
            categoryName: 'Machine Learning & AI',
            categoryDescription: 'Discover books on artificial intelligence, machine learning algorithms, and computational intelligence.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('ml-ai.ejs', { 
            books: [],
            categoryName: 'Machine Learning & AI',
            categoryDescription: 'Discover books on artificial intelligence, machine learning algorithms, and computational intelligence.'
        });
    }
});

app.get('/data-vis', requireAuth, async (req, res) => {
    try {
        const results = await query(`
            SELECT *, 
                   COALESCE(available_copies, total_copies, 1) as available_copies,
                   COALESCE(total_copies, 1) as total_copies
            FROM books 
            WHERE category = $1 
            ORDER BY upload_date DESC
        `, ['data-vis']);        res.render('data-vis.ejs', { 
            books: results,
            categoryName: 'Data Visualization',
            categoryDescription: 'Learn about effective techniques for visually presenting and communicating data insights through charts, graphs, and interactive displays.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('data-vis.ejs', { 
            books: [],
            categoryName: 'Data Visualization',
            categoryDescription: 'Learn about effective techniques for visually presenting and communicating data insights through charts, graphs, and interactive displays.'
        });
    }
});

app.get('/dl-nn', requireAuth, async (req, res) => {
    try {
        const results = await query(`
            SELECT *, 
                   COALESCE(available_copies, total_copies, 1) as available_copies,
                   COALESCE(total_copies, 1) as total_copies
            FROM books 
            WHERE category = $1 
            ORDER BY upload_date DESC
        `, ['dl-nn']);        res.render('dl-nn.ejs', { 
            books: results,
            categoryName: 'Deep Learning & Neural Networks',
            categoryDescription: 'Explore advanced topics in neural networks, deep learning architectures, and their applications in various domains.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('dl-nn.ejs', { 
            books: [],
            categoryName: 'Deep Learning & Neural Networks',
            categoryDescription: 'Explore advanced topics in neural networks, deep learning architectures, and their applications in various domains.'
        });
    }
});

app.get('/data-engineer-database', requireAuth, async (req, res) => {
    try {
        const results = await query(`
            SELECT *, 
                   COALESCE(available_copies, total_copies, 1) as available_copies,
                   COALESCE(total_copies, 1) as total_copies
            FROM books 
            WHERE category = $1 
            ORDER BY upload_date DESC
        `, ['data-engineer-database']);        res.render('data-engineer-database.ejs', { 
            books: results,
            categoryName: 'Data Engineering & Databases',
            categoryDescription: 'Learn about database systems, data pipelines, ETL processes, and modern data infrastructure development.'
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('data-engineer-database.ejs', { 
            books: [],
            categoryName: 'Data Engineering & Databases',
            categoryDescription: 'Learn about database systems, data pipelines, ETL processes, and modern data infrastructure development.'
        });
    }
});

// Individual PDF book view route
app.get('/view-pdf/:id', requireAuth, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.session.userId;
        console.log(`Fetching book with ID: ${bookId} for user: ${userId}`);
        
        const bookResults = await query('SELECT * FROM books WHERE id = $1', [bookId]);
        
        if (bookResults.length === 0) {
            console.log(`Book with ID ${bookId} not found`);
            return res.status(404).send('Book not found');
        }
        
        const book = bookResults[0];
        console.log(`Found book: ${book.title}, filepath: ${book.file_path}`);
        
        // Check if user has borrowed this book
        const borrowedResult = await query(`
            SELECT * FROM borrowing_records 
            WHERE user_id = $1 AND book_id = $2 AND status = 'borrowed'
        `, [userId, bookId]);
        
        const hasBorrowed = borrowedResult.length > 0;
        console.log(`User has borrowed this book: ${hasBorrowed}`);
          // Verify file exists
        const fullPath = path.join(__dirname, 'public', book.file_path.replace(/\\/g, path.sep).replace(/\//g, path.sep));
        
        if (!fs.existsSync(fullPath)) {
            console.error(`PDF file not found at ${fullPath}`);
            return res.status(404).send('PDF file not found');
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
        
        // Choose viewer based on borrowing status
        if (hasBorrowed) {
            // Full access - use the advanced PDF viewer
            res.render('pdf-viewer.ejs', { book, categoryName, categoryPath, isFullAccess: true });
        } else {
            // Preview only - use limited preview viewer
            res.render('pdf-preview.ejs', { book, categoryName, categoryPath, isFullAccess: false });
        }
    } catch (err) {
        console.error('Error fetching book:', err);
        res.status(500).send('Error fetching book');
    }
});

// Direct PDF serve route for debugging
app.get('/direct-pdf/:id', requireAuth, async (req, res) => {
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
app.get('/serve-pdf/:id', requireAuth, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.session.userId;
        console.log(`Serving PDF for book ID: ${bookId} to user: ${userId}`);
        
        const bookResults = await query('SELECT * FROM books WHERE id = $1', [bookId]);
        
        if (bookResults.length === 0) {
            console.log(`Book with ID ${bookId} not found for PDF serving`);
            return res.status(404).send('Book not found');
        }
        
        const book = bookResults[0];
        console.log(`Found book for PDF serving: ${book.title}, filepath: ${book.file_path}`);
        
        // Check if user has borrowed this book
        const borrowedResult = await query(`
            SELECT * FROM borrowing_records 
            WHERE user_id = $1 AND book_id = $2 AND status = 'borrowed'
        `, [userId, bookId]);
        
        const hasBorrowed = borrowedResult.length > 0;
        
        // If user hasn't borrowed the book, redirect to preview
        if (!hasBorrowed) {
            return res.redirect(`/preview-pdf/${bookId}`);
        }
          // Build the full path - handle both Windows and Unix paths
        const fullPath = path.join(__dirname, 'public', book.file_path.replace(/\\/g, path.sep).replace(/\//g, path.sep));
        console.log(`Attempting to serve PDF from: ${fullPath}`);
        
        if (!fs.existsSync(fullPath)) {
            console.error(`PDF file not found at ${fullPath}`);
            console.error(`Original file path from database: ${book.file_path}`);
            return res.status(404).send('PDF file not found. Please contact support.');
        }
        
        console.log(`PDF file exists, serving: ${fullPath}`);
        console.log(`Book details: Title: ${book.title}, ID: ${book.id}, Full access: yes`);
        
        // Send the file directly using Express's sendFile with better error handling
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(fullPath, (err) => {
            if (err) {
                console.error('Error sending full PDF file:', err);
                console.error(`Error details: ${err.message}`);
                res.status(500).send('Error serving PDF. Please try again later.');
            } else {
                console.log('Full PDF sent successfully');
            }
        });
        
    } catch (err) {
        console.error('Error serving PDF:', err);
        res.status(500).send('Error serving PDF');
    }
});

// Preview PDF route - limited access for non-borrowed books
app.get('/preview-pdf/:id', requireAuth, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.session.userId;
        console.log(`Serving PDF preview for book ID: ${bookId}`);
        
        const bookResults = await query('SELECT * FROM books WHERE id = $1', [bookId]);
        
        if (bookResults.length === 0) {
            return res.status(404).send('Book not found');
        }
        
        const book = bookResults[0];
        
        // Check if user has borrowed this book
        const borrowedResult = await query(`
            SELECT * FROM borrowing_records 
            WHERE user_id = $1 AND book_id = $2 AND status = 'borrowed'
        `, [userId, bookId]);
        
        const hasBorrowed = borrowedResult.length > 0;
        
        // If user has borrowed, redirect to full access
        if (hasBorrowed) {
            return res.redirect(`/serve-pdf/${bookId}`);
        }
          const fullPath = path.join(__dirname, 'public', book.file_path.replace(/\\/g, path.sep).replace(/\//g, path.sep));
          if (!fs.existsSync(fullPath)) {
            console.error(`PDF file not found at: ${fullPath}`);
            console.error(`Original file path from database: ${book.file_path}`);
            return res.status(404).send('PDF file not found. Please contact support.');
        }
        
        console.log(`Serving PDF preview from: ${fullPath}`);
        console.log(`Book details: Title: ${book.title}, ID: ${book.id}, Preview mode: enabled`);
        
        // For preview, we'll serve the file with a special header
        // The client-side JavaScript will handle limiting the pages
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('X-Preview-Mode', 'true');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(fullPath, (err) => {
            if (err) {
                console.error('Error sending PDF file:', err);
                console.error(`Error details: ${err.message}`);
                res.status(500).send('Error serving PDF preview. Please try again later.');
            } else {
                console.log('PDF preview sent successfully');
            }
        });
        
    } catch (err) {
        console.error('Error serving PDF preview:', err);
        res.status(500).send('Error serving PDF preview');
    }
});

// ===== BORROWING SYSTEM ROUTES =====

// Get borrowing dashboard for users
app.get('/borrowing/dashboard', requireAuth, async (req, res) => {
    const userId = req.session.userId;
    
    try {
        // Get current borrowed books
        const borrowedBooks = await query(`
            SELECT br.*, b.title, b.author, b.category, b.file_path
            FROM borrowing_records br
            JOIN books b ON br.book_id = b.id
            WHERE br.user_id = $1 AND br.status = 'borrowed'
            ORDER BY br.borrow_date DESC
        `, [userId]);

        // Get borrowing history
        const borrowingHistory = await query(`
            SELECT br.*, b.title, b.author, b.category
            FROM borrowing_records br
            JOIN books b ON br.book_id = b.id
            WHERE br.user_id = $1
            ORDER BY br.borrow_date DESC
            LIMIT 10
        `, [userId]);

        // Get borrowing settings
        const settings = await query('SELECT * FROM borrowing_settings');
        const settingsMap = {};
        settings.forEach(setting => {
            settingsMap[setting.setting_name] = setting.setting_value;
        });

        res.render('borrowing-dashboard.ejs', {
            borrowedBooks,
            borrowingHistory,
            settings: settingsMap,
            currentBorrowedCount: borrowedBooks.length
        });
    } catch (err) {
        console.error('Error fetching borrowing dashboard:', err);
        res.status(500).send('Error loading borrowing dashboard');
    }
});

// Borrow a book
app.post('/borrowing/borrow/:bookId', requireAuth, async (req, res) => {
    const bookId = req.params.bookId;
    const userId = req.session.userId;
    
    try {
        // Check if book exists and is available
        const bookResult = await query('SELECT * FROM books WHERE id = $1', [bookId]);
        if (bookResult.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const book = bookResult[0];
        if (book.available_copies <= 0) {
            return res.status(400).json({ error: 'Book is not available for borrowing' });
        }

        // Get borrowing settings
        const defaultDaysResult = await query('SELECT setting_value FROM borrowing_settings WHERE setting_name = $1', ['default_borrow_days']);
        const maxBooksResult = await query('SELECT setting_value FROM borrowing_settings WHERE setting_name = $1', ['max_books_per_user']);
        
        const defaultDays = parseInt(defaultDaysResult[0]?.setting_value || '14');
        const maxBooks = parseInt(maxBooksResult[0]?.setting_value || '5');

        // Check if user has reached borrowing limit
        const currentBorrowedResult = await query(
            'SELECT COUNT(*) as count FROM borrowing_records WHERE user_id = $1 AND status = $2',
            [userId, 'borrowed']
        );
        const currentBorrowedCount = parseInt(currentBorrowedResult[0].count);

        if (currentBorrowedCount >= maxBooks) {
            return res.status(400).json({ 
                error: `You have reached the maximum borrowing limit of ${maxBooks} books` 
            });
        }

        // Check if user already borrowed this book
        const existingBorrowResult = await query(
            'SELECT * FROM borrowing_records WHERE user_id = $1 AND book_id = $2 AND status = $3',
            [userId, bookId, 'borrowed']
        );

        if (existingBorrowResult.length > 0) {
            return res.status(400).json({ error: 'You have already borrowed this book' });
        }

        // Calculate due date
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + defaultDays);

        // Create borrowing record
        await query(`
            INSERT INTO borrowing_records (user_id, book_id, due_date, status)
            VALUES ($1, $2, $3, $4)
        `, [userId, bookId, dueDate, 'borrowed']);

        // Update available copies
        await query('UPDATE books SET available_copies = available_copies - 1 WHERE id = $1', [bookId]);

        res.json({ 
            success: true, 
            message: 'Book borrowed successfully!',
            dueDate: dueDate.toDateString()
        });

    } catch (err) {
        console.error('Error borrowing book:', err);
        res.status(500).json({ error: 'Error borrowing book' });
    }
});

// Return a book
app.post('/borrowing/return/:recordId', requireAuth, async (req, res) => {
    const recordId = req.params.recordId;
    const userId = req.session.userId;
    
    try {
        // Get borrowing record
        const recordResult = await query(`
            SELECT br.*, b.id as book_id
            FROM borrowing_records br
            JOIN books b ON br.book_id = b.id
            WHERE br.id = $1 AND br.user_id = $2 AND br.status = $3
        `, [recordId, userId, 'borrowed']);

        if (recordResult.length === 0) {
            return res.status(404).json({ error: 'Borrowing record not found or already returned' });
        }

        const record = recordResult[0];
        const returnDate = new Date();
        
        // Calculate fine if overdue
        let fineAmount = 0;
        if (returnDate > new Date(record.due_date)) {
            const finePerDayResult = await query('SELECT setting_value FROM borrowing_settings WHERE setting_name = $1', ['fine_per_day']);
            const finePerDay = parseFloat(finePerDayResult[0]?.setting_value || '0.50');
            
            const overdueDays = Math.ceil((returnDate - new Date(record.due_date)) / (1000 * 60 * 60 * 24));
            fineAmount = overdueDays * finePerDay;
        }

        // Update borrowing record
        await query(`
            UPDATE borrowing_records 
            SET return_date = $1, status = $2, fine_amount = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
        `, [returnDate, 'returned', fineAmount, recordId]);

        // Update available copies
        await query('UPDATE books SET available_copies = available_copies + 1 WHERE id = $1', [record.book_id]);

        res.json({ 
            success: true, 
            message: 'Book returned successfully!',
            fineAmount: fineAmount
        });

    } catch (err) {
        console.error('Error returning book:', err);
        res.status(500).json({ error: 'Error returning book' });
    }
});

// Get all books with borrowing status
app.get('/borrowing/books', requireAuth, async (req, res) => {
    try {
        const books = await query(`
            SELECT b.*, 
                   (b.total_copies - b.available_copies) as borrowed_copies,
                   CASE WHEN b.available_copies > 0 THEN true ELSE false END as is_available
            FROM books b
            ORDER BY b.title
        `);

        res.render('borrowing-books.ejs', { books });
    } catch (err) {
        console.error('Error fetching books for borrowing:', err);
        res.status(500).send('Error loading books');
    }
});

// Admin: View all borrowing records
app.get('/admin/borrowing/records', requireAdminAuth, async (req, res) => {
    try {
        const records = await query(`
            SELECT br.*, u.username, u.email, b.title, b.author
            FROM borrowing_records br
            JOIN users u ON br.user_id = u.id
            JOIN books b ON br.book_id = b.id
            ORDER BY br.borrow_date DESC
        `);

        res.render('admin-borrowing-records.ejs', { records });
    } catch (err) {
        console.error('Error fetching borrowing records:', err);
        res.status(500).send('Error loading borrowing records');
    }
});

// Admin: View borrowing settings page
app.get('/admin/borrowing/settings', requireAdminAuth, async (req, res) => {
    try {        // Fetch current settings from database
        const settingsResult = await query('SELECT setting_name as name, setting_value as value FROM borrowing_settings');
        const settings = {};
        
        // Convert array of settings to object for easier access
        settingsResult.forEach(setting => {
            settings[setting.name] = setting.value;
        });

        // Set default values if settings don't exist
        const defaultSettings = {
            default_borrow_days: settings.default_borrow_days || '14',
            max_books_per_user: settings.max_books_per_user || '5',
            fine_per_day: settings.fine_per_day || '0.50',
            renewal_limit: settings.renewal_limit || '2'
        };

        res.render('admin-borrowing-settings.ejs', { settings: defaultSettings });
    } catch (err) {
        console.error('Error fetching borrowing settings:', err);
        res.status(500).send('Error loading settings page');
    }
});

// Admin: Update borrowing settings
app.post('/admin/borrowing/settings', requireAdminAuth, async (req, res) => {
    const { default_borrow_days, max_books_per_user, fine_per_day, renewal_limit } = req.body;
    
    try {
        const settings = [
            { name: 'default_borrow_days', value: default_borrow_days },
            { name: 'max_books_per_user', value: max_books_per_user },
            { name: 'fine_per_day', value: fine_per_day },
            { name: 'renewal_limit', value: renewal_limit }
        ];

        for (const setting of settings) {
            await query(`
                UPDATE borrowing_settings 
                SET setting_value = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE setting_name = $2
            `, [setting.value, setting.name]);
        }

        res.json({ success: true, message: 'Settings updated successfully!' });
    } catch (err) {
        console.error('Error updating borrowing settings:', err);
        res.status(500).json({ error: 'Error updating settings' });
    }
});

// ===== END BORROWING SYSTEM ROUTES =====

// Admin route to view contact messages
app.get('/admin/contact-messages', requireAdminAuth, async (req, res) => {
    try {
        const messages = await query(`
            SELECT cm.*, u.username as user_name
            FROM contact_messages cm
            LEFT JOIN users u ON cm.user_id = u.id
            ORDER BY cm.created_at DESC
        `);
        
        // Get message statistics
        const stats = {
            totalMessages: 0,
            unreadMessages: 0,
            repliedMessages: 0,
            resolvedMessages: 0
        };

        const totalMessagesResult = await query('SELECT COUNT(*) as count FROM contact_messages');
        stats.totalMessages = parseInt(totalMessagesResult[0].count);

        const unreadMessagesResult = await query('SELECT COUNT(*) as count FROM contact_messages WHERE status = $1', ['unread']);
        stats.unreadMessages = parseInt(unreadMessagesResult[0].count);

        const repliedMessagesResult = await query('SELECT COUNT(*) as count FROM contact_messages WHERE status = $1', ['replied']);
        stats.repliedMessages = parseInt(repliedMessagesResult[0].count);

        const resolvedMessagesResult = await query('SELECT COUNT(*) as count FROM contact_messages WHERE status = $1', ['resolved']);
        stats.resolvedMessages = parseInt(resolvedMessagesResult[0].count);

        res.render('admin-contact-messages.ejs', { messages, stats });
    } catch (err) {
        console.error('Error fetching contact messages:', err);
        res.render('admin-contact-messages.ejs', { messages: [], stats: {} });
    }
});

// Update contact message status
app.post('/admin/contact-messages/:id/status', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    const adminId = req.session.adminId;
    
    try {
        // Get current message to check previous state
        const currentMessage = await query('SELECT * FROM contact_messages WHERE id = $1', [id]);
        
        if (!currentMessage || currentMessage.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        let newStatus = status;
        const hadPreviousNotes = currentMessage[0].admin_notes && currentMessage[0].admin_notes.trim() !== '';
        const hasNewNotes = admin_notes && admin_notes.trim() !== '';
        
        // Auto-update status based on admin actions
        if (hasNewNotes && !hadPreviousNotes) {
            // First time admin adds notes - change to 'read' if currently unread
            if (currentMessage[0].status === 'unread') {
                newStatus = 'read';
            }
        } else if (hasNewNotes && hadPreviousNotes && currentMessage[0].admin_notes !== admin_notes) {
            // Admin updated notes - could indicate a reply
            if (currentMessage[0].status === 'read') {
                newStatus = 'replied';
            }
        }
        
        // If admin explicitly selected a status, use that instead
        if (status && status !== currentMessage[0].status) {
            newStatus = status;
        }
        
        await query(`
            UPDATE contact_messages 
            SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP, replied_by = $3, replied_at = $4
            WHERE id = $5
        `, [newStatus, admin_notes, adminId, newStatus === 'replied' || newStatus === 'resolved' ? new Date() : null, id]);
        
        res.json({ 
            success: true, 
            newStatus: newStatus,
            message: `Message updated successfully. Status changed to: ${newStatus}` 
        });
    } catch (err) {
        console.error('Error updating contact message:', err);
        res.status(500).json({ error: 'Error updating message' });
    }
});

// Delete contact message
app.delete('/admin/contact-messages/:id', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    
    try {
        await query('DELETE FROM contact_messages WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting contact message:', err);
        res.status(500).json({ error: 'Error deleting message' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
