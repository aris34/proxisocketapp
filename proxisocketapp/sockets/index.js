module.exports = function (io) { 

	var request = require('request');
	var client = require( 'socket.io-client' );
	// socket = client.connect('localhost', {
 	//    	port: 3000
	// });

	var serverURL = 'http://social.cs.tut.fi:10001/profiles';
	
	// Create a list of profiles to verify  of connected users
	function User(id, username, active) {
		this.id = id;
		this.username = username;
		this.active = active;
		this.connected = false;
		this.socketId = "";
	}
	var users = {};

	// Get the list of profiles from the database
	users = getUsers();

	// Whenever a device connects to the socket
	io.on('connection', function(socket){

		// Re-load the list of profiles from the database
		users = getUsers();
		console.log('After getUsers() ' + users.length;
		for(var i in users) {
			console.log('user: ' + JSON.stringify(users[i]));
		}

		socket.on('connect message', function(msg){
			console.log('user connected: ' + JSON.stringify(msg));

			// Check if connecting user is on the list
			if(users[msg.id] != null) {
				if(users[msg.id].active == 'true') {
					users[msg.id].connected = true;
					users[msg.id].socketId = socket.id;
				}
				else {
					users[msg.id].connected = false;
				}
			}
			else
				console.log('User is not in the database');

		});

		socket.on('chat message', function(msg){
			//console.log('chat message: ' + msg.sender);
			console.log('message: ' + JSON.stringify(msg) );
			io.emit('chat message', msg);	

			io.emit('new chat message', msg);
		});

		socket.on('face2face', function(msg){
			console.log('face2face type: ' + msg.type + ' - ' + Date.now());
			console.log('face2face recipient: ' + msg.recipient );

			// Check if the target user is in the list of connected users
			if(users[msg.recipient] == null){
				console.log('Recipient is not connected...(1)');
				io.emit('userOffline', "offline");
			}
			else {
				if(users[msg.recipient].connected == false) {
					console.log('Recipient is not connected...(2)');
					io.emit('userOffline', "offline");
				}
				else {
					console.log('Recipient is connected.');

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
				}
			}
		});

		socket.on('from server', function(msg){
			console.log('from server: ' + msg);
		});

		socket.on('likeNotification', function(msg){
			console.log('likeNotification from: ' + msg.senderId + " to: " 
				+ msg.recipientId);

			// Check if the target user is in the list of connected users
			if(users[msg.recipient] == null) {
				console.log('Recipient is not connected...');
				//io.emit('userOffline', "offline");
			}
			else {
				io.emit('chatNotification', msg);
			}

		});

		socket.on('disconnect', function(){
			console.log('on disconnect ' + socket.id);
			for(var i in users){
				if(users[i].socketId == socket.id) {
					console.log('Removing user ' + users[i].username 
						+ 'from the list of connected users...');
				 	users[i].connected = false;
					break;
				}
			}

			// Show the list of connected users in the console
			for(var i in users){
				console.log('user: ' + users[i].username + ' - ' + users[i].connected);
			}
		});
	});

	function getUsers() {
		var tempUsers = {};

		request({url: serverURL, json: true}, function(err, res, json) {
		    if (err)
		        throw err;
		    else {
		    	for(var i in json) {
		    		// Create a new profile object for every profile on the server
		    		// and add it to the list of users, if it is active
		    		if(json[i].active == "true") {
			    		user = json[i];
			    		tempProfile = new User(user._id, user.username, user.active);
			    		tempUsers[tempProfile.id] = tempProfile;
		    		}
		    	}
			}
		});
		return tempUsers;
	}


}