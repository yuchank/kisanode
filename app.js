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
server.listen(8000);

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

  // // login event 
  // socket.on('login', function(data) {
  //   console.log(`Client logged-in:\n name: ${data.name} \n userid: ${data.userid}` );

  //   // socket에 client 정보를 저장
  //   socket.name = data.name;
  //   socket.userid = data.userid;

  //   // 접속된 모든 client에게 message를 전송
  //   io.sockets.emit('login', data.name);
  // });

  // // chat event
  // socket.on('chat', function (data) {
  //   console.log(`Message from ${socket.name}: ${data.msg}`);
  //   var msg = {
  //     from: {
  //       name: socket.name,
  //       userid: socket.userid      
  //     },
  //     msg: data.msg
  //   };

  //   // message를 전송한 client를 제외한 모든 client에게 message를 전송
  //   socket.broadcast.emit('chat', msg);

  //   // message를 전송한 client에게만 message를 전송
  //   // socket.emit('example message 1', { hello: 'world 1' });
  
  //   // 특정 client에게만 message를 전송. id는 socket 객체의 id 속성값이다. 
  //   // io.to(socket.id).emit('event_name', {});
  // });

  // // force client disconnect from server
  // socket.on('forceDisconnect', function() {
  //   socket.disconnect();
  // });

  socket.on('disconnect', function() {
    clients.pop(socket.id);
    var clientDisconnectedMsg = `User disconnected ${util.inspect(socket.id)}, total: ${clients.length}`;
    console.log(clientDisconnectedMsg);
  });
});

function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function sendAttack() {
  console.log('Attack sent to user');
  io.sockets.emit('attack', getRandomInRange(0, 360));
}

setInterval(sendAttack, 3000);
