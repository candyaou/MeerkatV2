var express = require('express')
var bodyParser = require('body-parser')
var model = require('./api/model')
var controller = require('./api/controller')
var port = process.env.PORT || 8080;

var app = express()
var router = express.Router()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// accesssed on http://localhost:8080/
router.get('/', function(req, res) {
    res.json({message: 'Welcome to Meerkat API!'});   
});

app.use('/', router);
app.use('/api/models', model);
app.use('/api/controllers', controller);

app.use('/web', express.static('website'))

app.listen(port);
console.log('Magic happens on port ' + port);