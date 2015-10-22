module.exports = function (io) { 

	var request = require('request');

	io.on('connection', function(socket){
		console.log('a user connected');

		socket.on('chat message', function(msg){
			console.log('chat message: ' + msg.username);
			//io.emit('chat message', msg);

			// if(msg === 'add user') {

			//     request({url: 'http://localhost:3000/profiles', json: true}, function(err, res, json) {
			//         if (err) {
			//             throw err;
			//         }
			//         console.log(json);
			//     });
			// }

		});

		socket.on('from server', function(msg){
			console.log('from server: ' + msg);
		});

		socket.on('disconnect', function(){
			console.log('user disconnected\n');
		});
	});

}