import express from "express"; 
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import mysql from "mysql2"; 

const app = express();
const port = 5000;

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '468456', 
  database: 'Library' 
});

// Test connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the MySQL database');
  }
});
// Promisified query method
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    console.log('Register Input:', { username, email, password, confirmPassword });

    if (password !== confirmPassword) {
        console.log('Passwords do not match');
        return res.status(400).send('Passwords do not match');
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password:', hashedPassword);

        const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
        connection.query(checkEmailQuery, [email], (err, emailResults) => {
            if (err) {
                console.log('Error checking email:', err);
                return res.status(500).send('Error checking email');
            }

            if (emailResults.length > 0) {
                console.log('Email already registered');
                return res.status(400).send('Email already registered');
            }

            const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            connection.query(insertQuery, [username, email, hashedPassword], (err, results) => {
                if (err) {
                    console.log('Error inserting user:', err);
                    return res.status(500).send('Error registering user');
                }

                console.log('User inserted with ID:', results.insertId);
                res.redirect('/login');
            });
        });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {

    const queryStr = 'SELECT * FROM users WHERE email = ?';
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
