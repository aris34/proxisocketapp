module.exports = function (io) { 

	var request = require('request');
	var users = {};

	io.on('connection', function(socket){
		console.log('a user connected ' + socket.id);

		// When a client is connected, add the client to the users list,
		// if(users[msg] == null) {
		// 	console.log("Is null");
		// 	users[msg] = socket.id;
		// }
		// else {
		// 	console.log("Is not null");
		// 	io.to(socket.id).emit('chat message', 'You are already connected');
		// }

		socket.on('chat message', function(msg){
			//console.log('chat message: ' + msg.sender);
			console.log('message: ' + msg );
			io.emit('chat message', msg);		

			// if(msg === 'add user') {

			//     request({url: 'http://localhost:3000/profiles', json: true}, function(err, res, json) {
			//         if (err) {
			//             throw err;
			//         }
			//         console.log(json);
			//     });
			// }

			// for (var i in users) {
			// 	console.log("user " + msg +": " + users[i]);
			// }
			//console.log(users);
			// if(users.size > 0)
		});

		socket.on('face2face', function(msg){
			console.log('face2face type: ' + msg.type );

			if(msg.type == 'f2fInit') {
				console.log('Emitting message: ' + msg.type );
				io.emit('face2face', msg);
			}
			else if(msg.type == 'f2fStart') {
				console.log('Emitting message: ' + msg.type );
				io.emit('face2face', msg);
			}
			else if(msg.type == 'f2fEnd') {
				console.log('Emitting message: ' + msg.type );
				io.emit('face2face', msg);
			}

			
		});

		socket.on('from server', function(msg){
			console.log('from server: ' + msg);
		});

		socket.on('disconnect', function(){
			console.log('user disconnected' + socket.id);
			for(var i in users){
				if(users[i] == socket.id) {
					delete users[i];
					break;
				}
			}
		});
	});
}