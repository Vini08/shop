var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hadl = require('express-handlebars');
var indexRouter = require('./routes/index');
var mongoose = require('mongoose');
var session = require('express-session');
var app = express();
var passport = require('passport');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var userRouter = require('./routes/user');
var mongoStore = require('connect-mongo')(session);
// mongodb connection
mongoose.Promise = Promise;
mongoose.connect('mongodb://user:1234@ds247449.mlab.com:47449/shopping', {
    useMongoClient: true,
    promiseLibrary: global.Promise
});
var db = mongoose.connection;
// mongodb error
db.on('error', console.error.bind(console, 'connection error:'));
// mongodb connection open
db.once('open', () => {
    console.log(`Connected to Mongo at: ${new Date()}`);
    require('./config/passport',passport);
});

// view engine setup
app.engine('.hbs',hadl({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
    secret: '123',
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({mongooseConnection: mongoose.connection}),
    cookie: {maxAge: 180 * 60 * 1000}
   }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req,res,next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

app.use('/user', userRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
