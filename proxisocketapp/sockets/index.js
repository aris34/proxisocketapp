module.exports = function (io) { 
	//io stuff here... io.on('conection..... 


	io.on('connection', function(socket){
		console.log('a user connected');

		socket.on('chat message', function(msg){
			console.log('chat message: ' + msg);
		});	

		socket.on('disconnect', function(){
			console.log('user disconnected\n');
		});
	});

}