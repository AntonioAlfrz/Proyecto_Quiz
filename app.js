var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(partials());
app.use(methodOverride('_method'));
app.use(session());

// Helpers dinámicos
app.use(function(req,res,next){
  // Si no existe, lo inicializa
  if(!req.session.redir){
    req.session.redir='/';
  }
  // Guardar path en session.redir para despues de login
  if(!req.path.match(/\/login|\/logout|\/user/)){
    req.session.redir = req.path;
  }
  // Hacer visible req.session en las vistas
  res.locals.session = req.session;
  next();
});

// Auto-logout
app.use(function(req,res,next){
  if(req.session.user){
    if(req.session.user.hora){
      if(new Date()-new Date(req.session.user.hora) > 120000){ // 2 minutos en ms
        delete req.session.user;
        next();
        return;
      }
    }
    req.session.user.hora = new Date();
  }
  next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      errors: []
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    errors: []
  });
});


module.exports = app;
