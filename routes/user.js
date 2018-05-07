var express = require('express');
var router = express.Router();
var srf = require('csurf');
var passport = require('passport');
var srfProteccion = srf({cookie: true});
var Order =require('../models/order');
var Cart = require('../models/cart');
var Product = require('../models/product');

router.use(srfProteccion);

router.get('/profile', isloggIN, function (req,res,next){
    Order.find({user: req.user},function (err, orders) {
        if(err){
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function (order) {
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
        });
        res.render('user/profile', {orders: orders});
    });
});

router.get('/opciones-admin', isloggIN, function (req,res,next){
    var successMsg = 1;
    Product.find(function (err,docs) {
        var productGroup = [];
        var groupSize = 3;
        for (var i=0;i<docs.length;i += groupSize){
            productGroup.push(docs.slice(i,i+groupSize));
        }
        res.render('user/opciones-admin', { title: 'Administrador', products:  productGroup, levelAdmin: successMsg});
    });
});

router.get('/new', isloggIN, function (req,res,next){
    res.render('user/new');
});


router.get('/logout',isloggIN, function (req,res,next) {
    req.logout();
    res.redirect('/');
});

router.use('/',notloggIN, function (res,req,next) {
next();
});

//router get signup
router.get('/signup', function (req, res, next) {
    var message = req.flash('error');
    res.render('user/signup', {csrfToken: req.csrfToken(), message: message, hasErrors: message.length > 0});
});

router.post('/signup', passport.authenticate('local.signup',{
    failureRedirect: '/user/signup',
    failureFlash: true
}), function (req, res , next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    }
    else {
        res.redirect('/user/profile');
    }
});


router.get('/signin', function (req,res,next){
    var message = req.flash('error');
    res.render('user/signin', {csrfToken: req.csrfToken(), message: message, hasErrors: message.length > 0});
});

router.post('/signin', passport.authenticate('local.signin',{
    failureRedirect: '/user/signin',
    failureFlash: true
}), function (req, res , next) {
    if (req.user.level===1) {
        res.redirect( '/user/opciones-admin');
    }
    else {
        res.redirect('/user/profile');
    }
});


module.exports = router;

function isloggIN(req,ress,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}
function notloggIN(req,res,next){
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}