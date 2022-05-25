const path = require('path')
const uuid = require('uuid')
const fetch = require('cross-fetch')

//IMPLEMENT RELATION WITH OUR 'FAKE DB'
const fs = require('fs');
const cryptoJS = require('crypto-js')
const dbPath = path.resolve(__dirname, '..', 'models', 'accounts.json')
const postsPath = path.resolve(__dirname, '..', 'models', 'posts.json')
//FUNCTION THAT CHECKS IF USERNAME ALREADY INSIDE DB, SO IT WONT BE OVERWRITED
async function alreadyExists(target) {
    return new Promise((res, rej) => {
        readDB().then((resolve) => {
            if (target in resolve) {
                res(true);
            } else {
                res(false);
            }
        })
    })
}
//FUNCTION TO ADD NEW ACCOUNTS TO DB
async function appendDB(name, value) {
    readDB().then((solve) => {
        solve[name] = value;
        fs.writeFile(dbPath, JSON.stringify(solve), {}, () => { })
    })
}
//FUNCTION TO READ DB, RETURN DB DATA
async function readDB() {
    return new Promise((resolve, reject) => {
        fs.readFile(dbPath, 'utf-8', (err, data) => {
            if (err) throw err;
            data = JSON.parse(data);
            resolve(data)
        });
    })
}
async function readPosts() {
    return new Promise((resolve, reject) => {
        fs.readFile(postsPath, 'utf-8', (err, data) => {
            if (err) throw err;
            data = JSON.parse(data);
            resolve(data)
        });
    })
}


//FUNCTIONS FOR ENCRYPT AND DECRYPT, FOR SAFENESS
function encrypt(key) {
    return cryptoJS.AES.encrypt('OK', key).toString()
}
function decrypt(hash, key) {
    return cryptoJS.AES.decrypt(hash, key).toString(cryptoJS.enc.Utf8)
    if (cryptoJS.AES.decrypt(hash, key).toString(cryptoJS.enc.Utf8) == 'OK') { return true };
    return false;
}
//FUNCTIONS FOR ENCRYPT AND DECRYPT, FOR SAFENESS

exports.loginpage = (req, res, next) => {
    //req.headers.cookies = 'session=massesion'
    res.render('login')
}
//|--------------------------------------------------------------------------|
//register implementation 
//THIS ONE CHECKS IF USERNAME, EMAIL, PASSWORD ARE OK
exports.validateInputs = (req, res, next) => {
    const form = req.body;
    alreadyExists(form.username).then((resp) => {
        if (form.password != form.passwordAgain || resp) {
            res.render('login');
        } else {
            next();
        }
    })
}
//AFTER CHECK INPUTS, THIS ONE SAVES THE ACCOUNTS TO DB
exports.saveAccount = (req, res) => {
    const passwordHash = encrypt(req.body.password);
    const username = req.body['username'];
    appendDB(username, passwordHash).then(() => {
        res.send('Conta registrada, já estamos te mandando de volta pra página inicial')
        new Promise((resolve, reject) => {
            setTimeout(() => { }, 3000)
        }).then(res.render('login'))
    })
}
//|--------------------------------------------------------------------------|
//LOGIN AUTH IMPLEMENTATION
//|--------------------------------------------------------------------------|
exports.authLogin = (req, res, next) => {
    data = req.body;
    readDB().then((resp, reject) => {
        if (data['username'] in resp) {
            if (decrypt(resp[data['username']], data['password']) === 'OK') {
                next();
            } else {
                res.send('badlogin')
            }
        } else {
            res.send('badlogin')
        }
    })
}


//|--------------------------------------------------------------------------|
//global feed implementation
exports.feed = (req, res) => {
    readPosts().then((resp) => {
        res.render('feed', { 'array': resp })
    })
}

//logged feed
exports.loggedFeed = (req, res) => {
    readPosts().then((resp) => {
        res.render('feed', { 'array': resp, 'username': req.body.username, 'token': req.body.uuid })

    })
}

//ADD A POST TO THE FIELD
exports.postFeed = (req, res) => {
    if (typeof req.file == 'undefined') {
        req.file = {filename:''}
    }
    let feedObj = {
        "user": req.body.username,
        "text": req.body.textContent,
        "img": `imgs/${req.file.filename}`
    }
    unshiftFeed(feedObj).then(
        ()=>{
            res.redirect('/feed')

        }
    )
}

async function unshiftFeed(object) {
    readPosts().then((solve) => {
        let solve_ = solve;
        solve_.unshift(object)

        fs.writeFile(postsPath, JSON.stringify(solve_), {}, () => { })
    })
}

// //TESTS
// exports.test = (req, res) => {
//     crypted = encrypt('test123')
//     let string = `
//     Username: aeiou123;\n
//     Password: test123;\n
//     hashedPassword: ${crypted}
//     decrypt: ${cryptoJS.AES.decrypt(crypted, 'test123').toString(cryptoJS.enc.Utf8)}
//     `
//     res.send(string)
// }

exports.test = (req, res) => {
    res.send('baixando em ' + path.resolve(__dirname, '..', '..', 'public', 'imgs', 'img.jpg'))

    download(`https://static.cloud-boxloja.com/lojas/wyfyg/produtos/cf02b27f-ab1b-4a50-ad17-4aa4e0368a94.jpg`,
        path.resolve(__dirname, '..', '..', 'public', 'imgs', 'img2'))
}
