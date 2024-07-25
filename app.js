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
const fs = require('fs')
const app = express();

/* ========== CONSTANTS ========== */
const PORT = config.port;
const TOKEN_RETENTION_TIME = 6e4; /* msec */

/* =========== GLOBAL VARIABLES ========== */
let isSignIn = 0;  // Use let or const to avoid global variable issues

/* ========== SETTINGS ========== */
app.use(express.static(path.join(__dirname, 'public')));
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

app.get('/', (req, res) => {
    res.render('pages/index');
});

// updated category and storename that user selected
const updateUserSelected = (userQuery, email) => {
    return new Promise((resolve, reject) => {
        db.query(userQuery, [email], (err, result) => {
            if (err) {
                return reject({ status: 500, message: err.message });
            }

            if (result.length === 0) {
                return reject({ status: 404, message: "User not found" });
            }

            // check attribute at login
            let categoryInDb = result[0].category;
            let storenameInDb = result[0].storename;
            let categoryZeroOneArr = ArrayUtils.hexToArray(categoryInDb, categories.length);
            let storenameZeroOneArr = ArrayUtils.hexToArray(storenameInDb, storeNames.length);
            let decryptedCategory = ArrayUtils.filterByIndex(categoryZeroOneArr, categories);
            let decryptedStorename = ArrayUtils.filterByIndex(storenameZeroOneArr, storeNames);

            resolve({ decryptedCategory, decryptedStorename });
        });
    });
}

app.get('/stationary', (req, res) => {
    if (req.session.user) {
        console.log("Sign-in is successed: ", isSignIn);
        setTimeout(() => { isSignIn = 0 }, TOKEN_RETENTION_TIME); // Token is expired

        const email = req.session.user.email; // obtain mail address from session
        let userQuery = `SELECT * FROM ${config.tableName} WHERE email = ?`;

        updateUserSelected(userQuery, email)
            .then(({ decryptedCategory, decryptedStorename }) => {
                res.render('pages/stationary', {
                    categories,
                    storeNames,
                    decryptedCategory,
                    decryptedStorename
                });
            })
            .catch((error) => {
                res.status(error.status).send(error.message);
            });
    } else {
        res.redirect('/');
    }
});

// posted from stationary
// category name and store name is posted from 
// postSelection() in storeName.js. Thus, we will e
// xecute to serch file pathes of images by using that.
app.post('/updateImage', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("<h1>401 Unauthorized</h1>");
    }

    const selectedStores = req.body.selectedStores;
    const selectedCategories = req.body.selectedCategories;
    const email = req.session.user.email; // obtain mail address from session


    // ここでサーバ内の条件に合う画像のパスを探査する。
    // 条件はPOSTされた「店舗名」かつ「カテゴリ」を満たす画像。
    console.log('a', __dirname + '/img/稲築');
    console.log('b', __dirname + `/img/${selectedStores[0]}`);
    try {
        console.log(fs.readdirSync(__dirname + '/img'))
        //console.log(fs.readdirSync(__dirname + `/img/${selectedStores[0]}`))
    } catch (err) {
        console.log(err)
    }
    // 選ばれた画像パスがいくつあるのかを集計

    // 6枚以下と6より大きい場合で場合わけが必要
    // 6枚以下　=> そのまま表示。並べる必要はあるが、ひとまず要件は満たされる。
    // 6より大きい => ６枚ずつ送信

    // 10秒ごとに次のセットの画像をレンダー


    // hexadecimal
    let preprocessSelectedStore = ArrayUtils.twoArraysToHex(selectedStores, storeNames);
    let preprocessSelectedCategory = ArrayUtils.twoArraysToHex(selectedCategories, categories);
    // for now, retain the data to DB every post
    let queryUserChecked = `UPDATE ${config.tableName} SET category = ?, storename = ? WHERE email = ?`;

    db.query(queryUserChecked, [preprocessSelectedCategory, preprocessSelectedStore, email], (err, result) => {
        if (err) {
            return res.status(500).send('Database update failed');
        }
        res.status(200).send('Selection updated');
    });

});

/* ===================================================================================== */

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



/* ========== LISTEN ========== */
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}.`);
});
