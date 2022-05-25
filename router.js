const path = require('path');
const express = require('express');
const router = express.Router();
const Controller = require(path.resolve(__dirname, 'src', 'controllers','controller'));
const uuid = require('uuid')
const multer = require('multer')
const upload = multer({dest:'public/imgs'})
var sessionsAlive = {
    
}

router.get('/', Controller.loginpage)
router.post('/register', Controller.validateInputs, Controller.saveAccount)
router.get('/feed',  Controller.feed)
router.post('/login', Controller.authLogin, (req, res, next) => {
    var identifier = uuid.v4();
    sessionsAlive[identifier] = req.body.username;
    req.body.uuid = identifier
    next()
}
, Controller.loggedFeed)


router.post('/feed',
    upload.single('imgFile'),
    (req, res, next) => {
        console.log(req.body)
        if (req.body.token in sessionsAlive) {
            sessionsAlive[req.body.token] == req.body.username ? next() : res.send('token não correspondente');
        } else {
            res.send('token inválido')
        }
    }, 
    Controller.postFeed
)

router.post('/newpost', (req, res)=>{
    res.render('post-create', {'username':req.body.username, 'token': req.body.token})
})

router.get('/sessions', (req, res)=>{res.send(sessionsAlive)})
router.get('/test', Controller.test)
module.exports = router;
//    res.render('post-create', {'username':req.body.username, 'uuid':identifier}) #colinha