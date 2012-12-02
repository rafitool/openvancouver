var express = require('express'),
  http = require('http'),
  path = require('path');

var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;


// Defaults set for server values
var options = {
  port: 8124,
  host: "127.0.0.1"
};

var app = express();

app.configure(function() {
  //app.set('views', __dirname + '/views');
  //app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('mysecret'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});




var server = new Server('localhost', 27017, {
  auto_reconnect: true
});
var db = new Db('openvancouver_db', server, {
  safe: true
});



var createObjectId = function() {
    if(!mongo.BSONNative || !mongo.BSONNative.ObjectID) {
      return function(id) {
        return mongo.BSONPure.ObjectID.createFromHexString(id);
      };
    }
    return function(id) {
      return new mongo.BSONNative.ObjectID(id);
    };
  }();

db.ObjectId = createObjectId;

db.open(function(err, db) {
  if(!err) {
    app.listen(options.port, options.host);
    console.log("Express server listening on port %d in %s mode", options.port, app.settings.env);
  }
});


var genericRoute = require('./routes/generic.js');
genericRoute.start(app, 'marker', db, 'markers');