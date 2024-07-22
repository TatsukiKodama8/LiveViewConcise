/* ========== EXTERNAL FILES ========== */
require('dotenv').config();
const config = require('./config');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const categories = require('./categories');
const storeNames = require('./storeNames');
const ArrayUtils = require('./arrayUtils');
const app = express();

/* ========== CONSTANTS ========== */
const PORT = config.port;
const TOKEN_RETENTION_TIME = 6e4; /* msec */

/* =========== GLOBAL VARIABLES ========== */
let isSignIn = 0;  // Use let or const to avoid global variable issues

/* ========== SETTINGS ========== */
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// MySQL
const db = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});
db.connect((err) => {
    if (err) {
        console.log('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});


// Stational Display
app.get('/', (req, res) => {
    res.render('pages/index');
});


app.get('/stationary', (req, res) => {
    if (req.session.user) {
        console.log("Sign-in is successed: ", isSignIn);
        setTimeout(() => { isSignIn = 0 }, TOKEN_RETENTION_TIME); // Token is expired
        
        const email = req.session.user.email; // obtain mail address from session
        let userQuery = `SELECT * FROM ${config.tableName} WHERE email = ?`;
        
        db.query(userQuery, [email], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (result.length === 0) {
                return res.status(404).send("User not found");
            }

            // check attribute at login
            let categoryInDb        = result[0].category;
            let storenameInDb       = result[0].storename;
            let categoryZeroOneArr  = ArrayUtils.hexToArray(categoryInDb, categories.length);
            let storenameZeroOneArr = ArrayUtils.hexToArray(storenameInDb, storeNames.length);
            let decryptedCategory   = ArrayUtils.filterByIndex(categoryZeroOneArr, categories);
            let decryptedStorename  = ArrayUtils.filterByIndex(storenameZeroOneArr, storeNames);
            console.log(decryptedCategory);
            console.log(decryptedStorename);
            
            res.render('pages/stationary', { 
                categories, 
                storeNames, 
                decryptedCategory, 
                decryptedStorename 
            });
        });
    } else {
        res.redirect('/');
    }
});


app.get('/index', (req, res) => {
    res.render('pages/index');
});

app.use(express.static(path.join(__dirname, 'public')));

// posted from sign-in form
app.post('/', async (req, res) => {
    let mailAddress = req.body.mailAddress;
    let password = req.body.password;
    let loginFormQuery = `SELECT * FROM ${config.tableName} WHERE email = ?`;
    db.query(loginFormQuery, [mailAddress], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length == 0)
            return res.status(401).send("<h1>401 Unauthorized</h1>");
        
        let passwordInDb = result[0].password;

        if (passwordInDb !== password) {
            res.send("<h1>Password is wrong.</h1>");
            return;
        } else {
            isSignIn = 1;   // for sign-in
            req.session.user = { email: mailAddress }; // retaion the user data to session 
            console.log("Sign-in is successed: ", isSignIn);
            console.log("Authorized");
            res.redirect('/stationary');
            
        }
    });
});

// posted from stationary
app.post('/updateImage', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("<h1>401 Unauthorized</h1>");
    }

    const selectedStores = req.body.selectedStores;
    const selectedCategories = req.body.selectedCategories;
    const email = req.session.user.email; // obtain mail address from session
    console.log('Selected stores:', selectedStores);
    console.log('Selected categories:', selectedCategories);

    let test1 = ArrayUtils.twoArraysToHex(selectedStores, storeNames);
    let test2 = ArrayUtils.twoArraysToHex(selectedCategories, categories);
    console.log("selectedStore", test1);
    console.log("selectedCategories", test2);

    // for now, retain the data to DB every post
    let queryUserChecked = `UPDATE ${config.tableName} SET category = ?, storename = ? WHERE email = ?`;

    db.query(queryUserChecked, [test2, test1, email], (err, result) => {
        if (err) {
            return res.status(500).send('Database update failed');
        }
        res.status(200).send('Selection updated');
    });
});

/* ========== LISTEN ========== */
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}.`);
});
