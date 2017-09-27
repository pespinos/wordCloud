var express = require('express');

var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);

// var screenNsp = io.of('/screen-game');
// var mobileNsp = io.of('/mobile-game');

var connections = [];
var ServerSocket = null;

var ip_server = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080 ;

//servir direcciones Web
app.get('/formulario', function(req, res){
  res.sendFile(__dirname+'formulario.html');
});
app.get('/wordCloud', function(req, res){
  res.sendFile(__dirname+'wordCloud.html');
});

//screen Socket
// screenNsp.on('connection',function(socket){
//   console.log('screen connected');
//   serverSocket = socket;
// });

server.listen(port, function(){
  console.log("Servidor en ejecución en el puerto "+ port);
});
