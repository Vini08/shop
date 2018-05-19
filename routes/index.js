var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
var Order =require('../models/order');
var Item =require('../models/item');
var mongo = require('mongodb');
var fs =require('fs');
var Grid = require("gridfs-stream");
Grid.mongo = mongo;
var d = new Date();
var curr_date = d.getDate();
var curr_month = d.getMonth() + 1;
var curr_year = d.getFullYear();
var mongoose = require('mongoose');
var db = mongoose.connection;
// mongodb error
db.on('error', console.error.bind(console, 'connection error:'));
// mongodb connection open
db.once('open', () => {
});

/* GET home page. */
router.get('/', function(req, res, next) {
    var successMsg = req.flash('success')[0];
    Product.find(function (err,docs) {
    var productGroup = [];
    var groupSize = 3;
    for (var i=0;i<docs.length;i += groupSize){
        productGroup.push(docs.slice(i,i+groupSize));
    }
    res.render('shop/index', { title: 'Tienda Online', products:  productGroup, successMsg: successMsg, noMessages: !successMsg});
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

router.get('/delete/:id', function (req, res, next) {
    Product.remove({_id: req.params.id}, function(error){
        if(error){
            res.send('Error al intentar eliminar el producto.');
        }else{
            res.redirect('/user/opciones-admin');
        }
    });
});

router.get('/editar/:id', function (req, res, next) {
    Product.findById(req.params.id, function(error, doc){
        if(error){
            res.send('Error al intentar ver el producto');
        }else{
            res.render('user/editar', {put: true, action: '/update/' + req.params.id, product: doc    });
        }
    });
});

router.get('/categoryMujer', function (req, res) {
    var successMsg = req.flash('success')[0];
    var cate = "Categoría Mujer";
    return Product.find({category: "m"},function (err, docs) {
        var productGroup = [];
        var groupSize = 3;
        for (var i=0;i<docs.length;i += groupSize){
            productGroup.push(docs.slice(i,i+groupSize));
        }
        if (!err) {
            return  res.render('shop/index', { title: 'Tienda Online', products:  productGroup, successMsg: successMsg, noMessages: !successMsg, cater: cate});
        } else {
            return console.log(err);
        }
    });
});

router.get('/categoryHombre', function (req, res) {
    var successMsg = req.flash('success')[0];
    var cate = "Categoría Hombre";
    return Product.find({category: "h"},function (err, docs) {
        var productGroup = [];
        var groupSize = 3;
        for (var i=0;i<docs.length;i += groupSize){
            productGroup.push(docs.slice(i,i+groupSize));
        }
        if (!err) {
            return  res.render('shop/index', { title: 'Tienda Online', products:  productGroup, successMsg: successMsg, noMessages: !successMsg, cater: cate});
        } else {
            return console.log(err);
        }
    });
});

router.get('/categoryChild', function (req, res) {
    var successMsg = req.flash('success')[0];
    var cate = "Categoría Niños";
    return Product.find({category: "n"},function (err, docs) {
        var productGroup = [];
        var groupSize = 3;
        for (var i=0;i<docs.length;i += groupSize){
            productGroup.push(docs.slice(i,i+groupSize));
        }
        if (!err) {
            return  res.render('shop/index', { title: 'Tienda Online', products:  productGroup, successMsg: successMsg, noMessages: !successMsg, cater: cate});
        } else {
            return console.log(err);
        }
    });
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

router.post('/new',function (req, res, next) {
    var prod = new Product({
        imagePath: req.body.imagen,
        title: req.body.title,
        description: req.body.description,
        category: req.body.categor,
        price: req.body.price
    });
    prod.save(function(error, doc){
        if(error){
            res.send('Error al intentar guardar el producto.');
        }else{
            res.redirect('/user/opciones-admin');
        }
    });
});

router.post("/api/photo",function(req,res,next){
    var newItem = new Item();
    newItem.img.data = fs.readFileSync("/home/vinicio/Imágenes/"+req.body.photo);
    newItem.img.contentType ="image/png";
    newItem.save(function(error, doc){
        if(error){
            res.send('Error al intentar guardar el producto.');
        }else{
            res.redirect('/user/opciones-admin');
        }
    });
});


router.post('/update/:id',function (req, res, next) {
    Product.findById(req.params.id, function(error, doc){
        if(error){
            res.send('Error al intentar modificar el personaje.');
        }else{
            var prod = doc;
                prod.imagePath = req.body.imagen;
                prod.title = req.body.title;
                prod.description = req.body.description;
                prod.price = req.body.price;

            prod.save(function(error, doc){
                if(error){
                    res.send('Error al intentar guardar el producto.'+error);
                }else{
                    res.redirect('/user/opciones-admin');
                }
            });
        }
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