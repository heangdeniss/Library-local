import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 5000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true}));

// display home page which is called index
app.get("/", (req, res) => {
    res.render("index.ejs");
  });

// display login form
app.get("/login", (req, res) => {
    res.render("login.ejs");
});
// display register form
app.get("/register", (req, res) => {
    res.render("register.ejs");
});


// display book places 
app.get("/books", (req, res) => {
    res.render("books.ejs");
});

// display subscibe page
app.get("/sub",(req, res) => {
    res.render("sub.ejs");
})
// display quote page
app.get("/quote", (req, res) => {
    res.render("quote.ejs");
})

// contact part
app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});
app.post("/submit", (req, res) => {
    const { name, email, text } = req.body;
    //precess data 
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Message:", text);

    // send a thanks you message
    res.render("contact.ejs", { 
        name, 
        email, 
        message: text, 
        success: true 
    });
});




app.listen(port, () => {
    console.log(`chill the sever is running on port ${port}`);
});