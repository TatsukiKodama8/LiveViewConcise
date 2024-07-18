/* ========== EXTERNAL FILES ========== */
let config  = require('./config');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const mysql = require('mysql');
const categories = require('./categories');
const storeNames = require('./storeNames'); // 店舗名データをインポート
var app = express();

/* ========== CONSTANTS ========== */
const PORT = config.port;
const TABLE_NAME = 'users';
const TOKEN_RETENTION_TIME = 6e4; /* msec */

/* =========== GLOBAL VARIABLES ========== */
isSignIn = 0;      // => 1: sign-in is succsessed!


/* ========== SETTINGS ========== */
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json()); 
app.set('view engine', 'ejs');


// TODO: hard codingになっているので書き換える => DONE
const db = mysql.createConnection({
    host: config.host,
    user: config.user,    // select User, Plugin from mysql.user;　プラグインがユーザごとに異なるので注意
    password: config.password,
    database: config.database
});


db.connect((err) => {
    if (err) {
        console.log('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
})

app.get('/', function (req, res) { res.render('pages/index'); });
app.get('/stationary', (req, res) => { 
    console.log("Sign-in is successed: ", isSignIn);
    if (isSignIn == 1) {
        setTimeout(() => { isSignIn = 0 }, TOKEN_RETENTION_TIME); // Token is expired
        res.render('pages/stationary', { categories, storeNames });
    } else {
        res.redirect('/'); 
    }

    console.log(req.body);

});

app.get('/index', (req, res) => { 
    res.render('pages/index'); 
});

app.use(express.static(path.join(__dirname, 'public')));

// posted from sign-in form
app.post('/', async (req, res) => {
    let mailAddress = req.body.mailAddress;
    let password    = req.body.password;
    let overlapCheckQuery = `SELECT * FROM ${TABLE_NAME} WHERE email = ?`;
    db.query(overlapCheckQuery, [mailAddress], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length == 0)     // 
            return res.status(401).send("<h1>401 Unauthorized</h1>");
        console.log(result);
        let passwordInDb = result[0].password;
        if ( passwordInDb !== password) {
            res.send
            res.send("<h1>Password is wrong.</h1>");
            return;
        } else {
            isSignIn = 1;   // for sign-in
            console.log("Sign-in is successed: ", isSignIn);
            console.log("Authorized");
            res.redirect('/stationary');
            //res.render('pages/stationary');   
        }
    })
    
})

// posted from stationary
app.post('/updateImage', (req, res) => {
    const selectedStores = req.body.selectedStores;
    const selectedCategories = req.body.selectedCategories;
    console.log('Selected stores:', selectedStores);
    console.log('Selected categories:', selectedCategories);

    // insert data to database




    res.status(200).send('Selection updated');
});

/* ========== LISTEN ========== */
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}.`);
});






