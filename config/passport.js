var passport = require('passport');
var User = require('../models/user');
var LocalStr = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
done(null,user.id);
});

passport.deserializeUser(function (id, done) {
   User.findById(id, function (err, user) {
      done(err, user);
   });
});

passport.use('local.signup', new LocalStr({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true

}, function (req, email,password, done) {
    var errors = req.validationErrors();
    if (errors){
        var message = [];
        errors.forEach(function (error) {
            message.push(error.msg);
        });
        return done(null, false, req.flash('error', message));
    }
    User.findOne({'email': email}, function (err, user) {
        if(err) {
            return done(err);
        }
        if(user){
            return done(null,false,{message: 'Este usuario ya ha sido creado'});
        }
        var newUser = User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.level = 0;
        newUser.save(function (err,result) {
           if(err){
               return done(err);
           }
           return done(null, newUser);
        });
    });
}));


passport.use('local.signin', new LocalStr({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    var errors = req.validationErrors();
    if (errors){
        var message = [];
        errors.forEach(function (error) {
            message.push(error.msg);
        });
        return done(null, false, req.flash('error', message));
    }
    User.findOne({'email': email}, function (err, user) {
        if(err) {
            return done(err);
        }
        if(!user){
            return done(null,false,{message: 'Usuario no encontrado'});
        }
        if(!user.validPassword(password)){
            return done(null,false,{message: 'Password incorrecta'});
        }
        return done(null, user);
    });
}));


passport.use('local.new', new LocalStr({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    var errors = req.validationErrors();
    if (errors){
        var message = [];
        errors.forEach(function (error) {
            message.push(error.msg);
        });
        return done(null, false, req.flash('error', message));
    }
    User.findOne({'email': email}, function (err, user) {
        if(err) {
            return done(err);
        }
        if(!user){
            return done(null,false,{message: 'Usuario no encontrado'});
        }
        if(!user.validPassword(password)){
            return done(null,false,{message: 'Password incorrecta'});
        }
        return done(null, user);
    });

}));
