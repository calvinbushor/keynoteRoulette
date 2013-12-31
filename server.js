'use strict';

// Module dependencies.
var express = require('express'),
    path = require('path'),
    fs = require('fs');

var app = express();

// Connect to database
var db = require('./lib/db/mongo');

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath + '/' + file);
});

// Populate empty DB with dummy data
require('./lib/db/dummydata');
require('./lib/db/dummyImages');

// Controllers
var api   = require('./lib/controllers/api');
var forms = require('./lib/controllers/forms');

// Express Configuration
app.configure(function(){
	app.use(express.logger('dev'));
	app.use(express.bodyParser());	
  app.use(express.cookieParser());
  app.use(express.session({secret: "This is a secret"}));
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.static(path.join(__dirname, '.tmp')));
  app.use(express.static(path.join(__dirname, 'app')));
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.use(express.favicon(path.join(__dirname, 'public/favicon.ico')));
  app.use(express.static(path.join(__dirname, 'public')));
});

var frontEnd = function(req, res) {
  fs.readFile('app/index.html', 'utf8', function(err, text){
    res.end(text);
  });
};

var checkCanUpload = function(req, res, next) {
  if ( 'authenticated' !== req.session['superSecurePassword'] ) {
    res.redirect('/upload-auth');
  } else {
    next();
  }
}

var uploadAuth = function(req, res) {
  var body = req.body;

  if ( '8===D~~' === body['superSecurePassword'] ) {
    req.session['superSecurePassword'] = 'authenticated';
    res.redirect('/upload');
  } else {
    res.redirect('/upload-auth?error=AhAhAhSayTheMagicWord');
  }
}

// Routes
app.get('/', frontEnd);
app.get('/upload', checkCanUpload, frontEnd);
app.get('/upload-auth', frontEnd);
app.get('/presentation', frontEnd);
app.get('/presentation/:theme', frontEnd);
app.get('/presentation/:theme/:limit', frontEnd);
app.get('/api/images', api.get_images);

app.post('/forms/images', forms.post_images);
app.post('/api/images', api.post_images);

app.post('/upload-auth', uploadAuth);

// Start server
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});
