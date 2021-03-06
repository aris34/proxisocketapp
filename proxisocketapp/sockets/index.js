module.exports = function (io) { 

	//var request = require('request');
	var client = require( 'socket.io-client' );
	// socket = client.connect('localhost', {
 	//    	port: 3000
	// });

	//var serverURL = 'http://social.cs.tut.fi:10001/profiles';
	//var serverURL = 'http://192.168.1.2:3000/profiles';

	// var request = require('request'),
 //    username = "admin",
 //    password = "cosmo",
 //    url = "http://192.168.1.2:3000/profiles",
 //    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

 	var request = require('request'),
    username = "admin",
    password = "cosmo",
    url = "http://social.cs.tut.fi:10001/profiles",
    //url = "http://192.168.1.2:3000/profiles",
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

	// Create a list of profiles to verify  of connected users
	function User(id, username, active) {
		this.id = id;
		this.username = username;
		this.active = active;
		this.connected = false;
		this.socketId = "";
		this.messages = [];
	}
	var users = {};

	// Get the list of profiles from the database
	//users = getUsers();
	getUsers();

	// Whenever a device connects to the socket
	io.on('connection', function(socket){

		// Re-load the list of profiles from the database
		//users = getUsers();
		getUsers();

		socket.on('connect message', function(msg){
			console.log('user connected: ' + JSON.stringify(msg));

			// Check if connecting user is on the list
			if(users[msg.id] != null) {
				if(users[msg.id].active == 'true') {
					// console.log('Setting user with id: ' + msg.id 
					// 	+ ' to connected - true, with socketId: ' + socket.id);
					users[msg.id].connected = true;
					users[msg.id].socketId = socket.id;

					// Check for unread messages
					var sender = "";
					for(var i in users[msg.id].messages) {
						console.log('Unread message: ' + users[msg.id].messages[i].text);
						
						if(sender != users[msg.id].messages[i].senderUsername) {

							sender = users[msg.id].messages[i].senderUsername;
							io.emit('chat message', users[msg.id].messages[i]);
							io.emit('new chat message', users[msg.id].messages[i]);
						}
					}
					users[msg.id].messages = [];

				}
				else {
					console.log('Setting user with id: ' + msg.id + ' to connected - false');
					users[msg.id].connected = false;
				}
			}
			else
				console.log('User is not in the database');

			// console.log('Users: ');
			// for(var i in users) {
			// 	if(users[i].connected == true)
			// 	console.log(users[i].username + ', active: ' + users[i].active 
			// 		+ ', connected: ' + users[i].connected);
			// }
			// console.log('\n');
		});

		socket.on('chat message', function(msg){
			//console.log('chat message: ' + msg.sender);
			console.log('message: ' + JSON.stringify(msg) );

			// If the recipient of the message is not connected,
			// add the message to their user structure
			if(users[msg.recipientId].connected == false) {
				console.log('Pushing message ' + msg.text);
				users[msg.recipientId].messages.push(msg);
			}

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
			if(users[msg.recipientId].connected == false) {
				console.log('Recipient is not connected...');
				//io.emit('userOffline', "offline");
			}
			else {
				io.emit('likeNotification', msg);
			}

		});

		socket.on('disconnect', function(){
			//console.log('on disconnect ' + socket.id);
			for(var i in users){
				if(users[i].socketId == socket.id) {
					console.log('Removing user ' + users[i].username 
						+ ' from the list of connected users...');
				 	users[i].connected = false;
					break;
				}
			}

			// Show the list of connected users in the console
			// console.log('Users after disconnect: ');
			// for(var i in users) {
			// 	console.log(users[i].username + ', active: ' + users[i].active 
			// 		+ ', connected: ' + users[i].connected);
			// }
			// console.log('\n');
		});

		socket.on('ping', function(msg) {
			console.log('Received ping from: ' + msg.id);
			io.emit('ping', msg);
		});
	});

	function getUsers() {
		//console.log('getUsers()');
		//var tempUsers = {};

		request({url: url, headers : {
            		"Authorization" : auth
        			}, json: true,}, function(err, res, json) {
		    if (err)
		        throw err;
		    else {
		    	for(var i in json) {
		    		// Create a new profile object for every profile on the server
		    		// and add it to the list of users, if it is active
		    		if(json[i].active == "true") {
			    		user = json[i];
			    		tempProfile = new User(user._id, user.username, user.active);

			    		// If the current profile is not in the list, add it
			    		if(users[tempProfile.id] == null) {
			    			console.log('Adding ' + tempProfile.username + ' - ' +
			    				tempProfile.id +' in the list')
			    			users[tempProfile.id] = tempProfile;
			    		}
			    		// If it's already in the list, update the active field
			    		else {
			    			users[tempProfile.id].active = tempProfile.active;
			    		}
		    		}
		    	}
			}
		});
		//return tempUsers;
	}


}