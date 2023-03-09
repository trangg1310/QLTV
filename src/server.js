import express from 'express';
import configViewEngine from './config/viewEngine';
import initWebRoute from './route/web'
import session from 'express-session'
import passport from 'passport'
const initializePassport = require("./controller/passportConfig");
const flash = require('express-flash');
//import connection from './config/connectDB'
require('dotenv').config();

initializePassport(passport);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//setup view engine
configViewEngine(app);

//init web route
initWebRoute(app);
 
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})