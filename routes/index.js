var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
var Order =require('../models/order');

var d = new Date();
var curr_date = d.getDate();
var curr_month = d.getMonth() + 1;
var curr_year = d.getFullYear();

/* GET home page. */
router.get('/', function(req, res, next) {
    var successMsg = req.flash('success')[0];
Product.find(function (err,docs) {
    var productGroup = [];
    var groupSize = 3;
    for (var i=0;i<docs.length;i += groupSize){
        productGroup.push(docs.slice(i,i+groupSize));
    }
    res.render('shop/index', { title: 'Express Vinicio', products:  productGroup, successMsg: successMsg, noMessages: !successMsg});
    });
});

router.get('/add-to-cart/:id', function (req, res, next) {
   var productId = req.params.id;
   var cart = new Cart(req.session.cart ? req.session.cart: {});

   Product.findById(productId, function (err, product) {
      if(err){
          return res.redirect('/');
      }
      cart.add(product, productId);
      req.session.cart = cart;
      console.log(req.session.cart);
      res.redirect('/');
   });
});

router.get('/reduce/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart: {});
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart: {});
    cart.removeAll(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req,res,next) {
    if(!req.session.cart){
        return res.render('shop/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart',{products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', isloggIN, function (req, res, next) {
    if(!req.session.cart){
        return res.render('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout',isloggIN, function (req, res, next) {
    if(!req.session.cart){
        return res.render('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var stripe = require("stripe")(
        "sk_test_ARkuU864aFGcNjp7k9xzR1wa"
    );
    stripe.charges.create({
        amount: cart.totalPrice*100,
        currency: "usd",
        source: "tok_visa", // obtained with Stripe.js
        description: "Charge for ava.taylor@example.com"
    }, function(err, charge) {
        if(err){
            req.flash('error',err.message);
            return res.redirect('/checkout');
        }
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id,
            date: curr_date + "-" + curr_month + "-" + curr_year
        });
        order.save(function (err, result) {
            req.flash('success','Los Productos han sido Vendidos');
            req.session.cart=null;
            res.redirect('/');
        });
    });

});
module.exports = router;

function isloggIN(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}