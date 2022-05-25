const express = require('express');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const routes = require(path.resolve(__dirname, 'router'))

app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.resolve(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'src', 'views'))
app.use(routes)

app.listen(3080, ()=> {
    console.log('Server rodando em: http://192.168.15.4:3080')
})