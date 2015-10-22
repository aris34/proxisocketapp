var express = require('express');
var router = express.Router();
var io = require('socket.io');

var app = express();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'chat' });

  // app.use('/socket.io/socket.io.js');
  //var socket = io.connect('http://localhost:3001');
  // io.emit('chat message', 'text');
  // socket.on('connect', function(data) {
  //       socket.emit('chat message', 'text');
  //   });
});















module.exports = router;