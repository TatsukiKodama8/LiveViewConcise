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

const PORT = config.port;
const TOKEN_RETENTION_TIME = 6e4;

let isSignIn = 0;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

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

const updateUserSelected = (userQuery, email) => {
    return new Promise((resolve, reject) => {
        db.query(userQuery, [email], (err, result) => {
            if (err) {
                return reject({ status: 500, message: err.message });
            }
            if (result.length === 0) {
                return reject({ status: 404, message: "User not found" });
            }
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
        setTimeout(() => { isSignIn = 0 }, TOKEN_RETENTION_TIME);

        const email = req.session.user.email;
        let userQuery = `SELECT * FROM ${config.tableName} WHERE email = ?`;

        let storeNameCategoryObject = {};
        updateUserSelected(userQuery, email)
            .then(({ decryptedCategory, decryptedStorename }) => {
                res.render('pages/stationary', {
                    categories,
                    storeNames,
                    decryptedCategory,
                    decryptedStorename,
                    storeNameCategoryObject
                });
            })
            .catch((error) => {
                res.status(error.status).send(error.message);
            });
    } else {
        res.redirect('/');
    }
});

app.post('/updateImage', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("<h1>401 Unauthorized</h1>");
    }

    const selectedStores = req.body.selectedStores;
    const selectedCategories = req.body.selectedCategories;
    const email = req.session.user.email;

    const objectStoreCategory = (numStore, numCategory) => {
        try {
            if (!storeNameCategoryObject[selectedStores[numStore]].hasOwnProperty(selectedCategories[numCategory])) {
                storeNameCategoryObject[selectedStores[numStore]][selectedCategories[numCategory]] = [];
            }

            let dirPath = path.join('public/img', selectedStores[numStore], selectedCategories[numCategory]);
            let files = fs.readdirSync(dirPath);

            files.forEach(file => {
                if (file !== ".DS_Store")
                    storeNameCategoryObject[selectedStores[numStore]][selectedCategories[numCategory]].push(path.join('/img', selectedStores[numStore], selectedCategories[numCategory], file));
            });

        } catch (err) {
            if (err.code === 'ENOENT') {
                storeNameCategoryObject[selectedStores[numStore]][selectedCategories[numCategory]].push(null);
            } else {
                throw err;
            }
        }
    }

    const updateUserCheckedForDB = () => {
        let preprocessSelectedStore = ArrayUtils.twoArraysToHex(selectedStores, storeNames);
        let preprocessSelectedCategory = ArrayUtils.twoArraysToHex(selectedCategories, categories);
        let queryUserChecked = `UPDATE ${config.tableName} SET category = ?, storename = ? WHERE email = ?`;

        db.query(queryUserChecked, [preprocessSelectedCategory, preprocessSelectedStore, email], (err, result) => {
            if (err) {
                return res.status(500).send('Database update failed');
            }
        });
    }

    updateUserCheckedForDB();

    let storeNameCategoryObject = {};

    const updateObjectStoreCategory = () => {
        for (let numStore = 0; numStore < selectedStores.length; numStore++) {
            storeNameCategoryObject[selectedStores[numStore]] = {};
            for (let numCategory = 0; numCategory < selectedCategories.length; numCategory++) {
                objectStoreCategory(numStore, numCategory);
            }
        }
    }
    updateObjectStoreCategory();

    res.send(JSON.stringify(storeNameCategoryObject));
});

app.get('/index', (req, res) => {
    res.render('pages/index');
});

app.use(express.static(path.join(__dirname, 'public')));

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
            isSignIn = 1;
            req.session.user = { email: mailAddress };
            console.log("Sign-in is successed: ", isSignIn);
            console.log("Authorized");
            res.redirect('/stationary');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}.`);
});
