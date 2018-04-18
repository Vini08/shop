var Product = require('../models/product');
var mongooses = require('mongoose');


mongooses.Promise = Promise;
mongooses.connect('mongodb://user:1234@ds247449.mlab.com:47449/shopping', {
    useMongoClient: true,
    promiseLibrary: global.Promise
});
var db = mongooses.connection;
// mongodb error
db.on('error', console.error.bind(console, 'connection error:'));
// mongodb connection open
db.once('open', () => {
    console.log(`Connected to Mongo at: ${new Date()}`)
});

var products = [
    new Product({
    imagePath: 'https://images.sportsdirect.com/images/products/51102303_l.jpg',
    title: 'Pants Nike Mujer Black',
    description: 'Size large',
    price: 122
    }),
    new Product({
        imagePath: 'https://http2.mlstatic.com/pants-nike-dry-academy-negro-rojo-original-D_NQ_NP_653187-MLM26593102283_012018-F.jpg',
        title: 'Pants Nike Hombre linea roja',
        description: 'Size Small',
        price: 82
    }),
    new Product({
        imagePath: 'https://images.sportsdirect.com/images/products/51102303_l.jpg',
        title: 'Pants Nike Hombre Black',
        description: 'Size Small',
        price: 242
    }),
    new Product({
        imagePath: 'http://hambonesports.org/wp-content/uploads/Nike-Lights-Out-pants.jpg',
        title: 'Pants Nike Hombre Gray',
        description: 'Size Small',
        price: 182
    }),
    new Product({
        imagePath: 'https://img.newchic.com/thumb/large/oaupload/newchic/images/EC/DD/7de56683-f696-4ef2-9864-99b98ccfef14.jpeg',
        title: 'Pants Roto Hombre Azul',
        description: 'Size Small',
        price: 222
    })
];

var done =0;
for (var i=0;i<products.length;i++){
    products[i].save(function (err,result){
    done++;
        if(done === products.length){
        exit();
        }
    });
}

function exit() {
    mongooses.disconnect();
}