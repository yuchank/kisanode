var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./app_server/routes/index');
var usersRouter = require('./app_server/routes/users');

var app = express();

// socket.io
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var util = require('util');

// node app.js
server.listen(2000);

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

var clients = [];

// connection event handler
io.sockets.on('connection', function(socket) {

  clients.push(socket.id);
  var clientConnectedMsg = `User connected ${util.inspect(socket.id)}, total: ${clients.length} `;
  console.log(clientConnectedMsg);
  
  socket.on('disconnect', function() {
    clients.pop(socket.id);
    var clientDisconnectedMsg = `User disconnected ${util.inspect(socket.id)}, total: ${clients.length}`;
    console.log(clientDisconnectedMsg);
  });

  // attack event
  socket.on('attack-app', function(data) {
    console.log('attack-app');
    io.sockets.emit('attack-app-cs', data);
  });

  socket.on('attack-obd', function(data) {
    console.log('attack-obd');
    io.sockets.emit('attack-obd-cs', data);
  });

  socket.on('attack-auto', function(data) {
    console.log('attack-auto');
    io.sockets.emit('attack-auto-cs', data);
  });
  
  socket.on('attack-usb', function (data) {
    console.log('attack-usb');
    io.sockets.emit('check-usb', "check-usb-usb");
  });
  
  socket.on('attack-rans', function (data) {
    console.log('attack-rans');
    io.sockets.emit('check-usb', "check-rans-usb");
  });

  socket.on('usb-status', function (data){
    if (data === 'usb-on') {
      console.log('usb in');
      io.sockets.emit('attack-usb-cs', "attack-usb-cs");
      io.sockets.emit('usb-status-cs', "on");
    } 
    else if (data === 'rans-on') {
      console.log('usb in');
      io.sockets.emit('attack-rans-cs', "attack-rans-cs");
      io.sockets.emit('usb-status-cs', "on");
    } 
    else if (data === 'off') {
      console.log('usb out');
      io.sockets.emit('usb-status-cs', "off");
    }
  })

  socket.on('reset', function (data) {
    console.log(`reset ${data}`);
    io.sockets.emit('reset', data);
  });

  socket.on('speed', function(data) {
    io.sockets.emit('speed-cs', data);
  });

  socket.on('auto-on', function (data) {
    console.log('auto-on');
    io.sockets.emit('auto-on', "auto-on");
  });
});

