if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
  }

const express = require('express')
const path = require('path')
const app = express()

const mongoose = require('mongoose')
const UserRoutes = require('./routes/UserRoutes')
const ListRoutes = require('./routes/ListRoutes')
const  ExpressError = require('./utils/expressError')
const wrapAsync = require('./utils/wrapAsync')
const engine = require('ejs-mate')
const axios = require('axios')
const session = require('express-session')
const flash = require('connect-flash')
const passport =  require ('passport');   
const LocalStrategy = require ('passport-local');  
const User = require('./models/User');

const MongoDBStore = require("connect-mongo")(session);

// const DBurl = 'mongodb://localhost:27017/Project'
const DBurl = `${process.env.mongoATLS}`

mongoose.connect( DBurl , {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


app.use(express.urlencoded({ extended: true }))
app.engine('ejs', engine)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

const store = new MongoDBStore({
    url: DBurl,
    secret: 'secretSession',
    touchAfter: 24 * 3600
})

store.on("error" , function(e){
    console.log('session store error' , e)
})

const sessionConfig = {
    store: store,
    secret: 'secretSession',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: null,
        maxAge: null
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use( new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//-----------------------------------------------------------------------------------------------

const makereq = async (term) => {
    try{
        const config = { params: { q: term } }
        const result = await axios('http://api.tvmaze.com/search/shows', config)
        return result.data;
    }catch(e){
        console.log("**********");
        console.log(e);
        console.log("**********");
        throw e;
    }
}
app.use('/', UserRoutes);
app.use('/lists', ListRoutes);
app.get('/', (req, res) => {
    res.render('base/home')
})
app.get('/about', (req,res)=>{
    res.render('base/about');
})
app.post('/BingeList', wrapAsync(async (req, res , next) => {
    const {search} =req.body;
    const datas = await makereq(search);
    res.render('base/query', { search ,datas })
}))

app.all("*" , (req ,res,next)=> {
    const msg = 'Page not Found!!!' 
    next(new ExpressError(msg,404))
})

app.use((err, req ,res ,next)=>{
    const { status = 500 } = err;
    if (!err.message) {
        err.message = '(GENERIC) Something went wrong';
    }
    res.status(status).render('error',{err})
})

const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`Listening on port ${port}`) })