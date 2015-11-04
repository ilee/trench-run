var path = require('path');
var express = require('express');
var app = express();

// Game worlds - create and store users here
// var world = require('./server/server_world.js');

// Static content
app.use(express.static(path.join(__dirname, '/client')));
// app.use(express.static('client'));

// Routes - don't really need, but if app grows good to have
require('./server/config/routes.js')(app);

// listen on 8000
app.listen(8000, function() {
	console.log("listening on port 8000");
})

// Socket stuff
// var io = require('socket.io').listen(server);

// io.sockets.on('connection', function (socket) {
// 	console.log("A user connected.");

// 	var id = socket.id;
// 	world.addPlayer(id);

// 	var player = world.playerForId(id);
// 	socket.emit('createPlayer', player);

// 	socket.broadcast.emit('addOtherPlayer', player);

// 	socket.on('requestOldPlayers', function() {
// 		for (var i = 0; i < world.players.length; i++){
//             if (world.players[i].playerId != id)
//                 socket.emit('addOtherPlayer', world.players[i]);
//         }
// 	});
// 	socket.on('updatePosition', function(data){
//         var newData = world.updatePlayerData(data);
//         socket.broadcast.emit('updatePosition', newData);
//     });
//     socket.on('disconnect', function(){
//         console.log('user disconnected');
//         io.emit('removeOtherPlayer', player);
//         world.removePlayer( player );
//     });
// });