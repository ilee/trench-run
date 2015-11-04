var path = require('path');
var express = require('express');
var app = express();

// Game worlds - create and store users here
var world = require('./server/server_world.js');

// Static content
app.use(express.static(path.join(__dirname, "./static")));

// Routes - don't really need, but if app grows good to have
require('./server/config/routes.js')(app);

// listen on 6789
var server = app.listen(6789, function() {
	console.log("listening on port 6789");
})

// Socket stuff
var io = require('socket.io').listen(server);
var log_position_factor = 0;

io.sockets.on('connection', function (socket) {

	var id = socket.id;
	world.addPlayer(id);

	var player = world.playerForId(id);
	socket.emit('createPlayer', player);

    console.log("A user connected.");
    console.log('the number of connected players: ' + world.players.length);

	socket.broadcast.emit('addOtherPlayer', player);

	socket.on('requestOldPlayers', function() {
		for (var i = 0; i < world.players.length; i++){
            if (world.players[i].playerId != id)
                socket.emit('addOtherPlayer', world.players[i]);
        }
	});
	socket.on('updatePosition', function(data){
        var newData = world.updatePlayerData(data);
        socket.broadcast.emit('updatePosition', newData);

        // So console.log doesn't look ridiculous
        if(log_position_factor % 5 == 0) {
            console.log("Player id " + id + " stats:");
            console.log("Location x: " + data.x + ", y: " + data.y + ", z: " + data.z);
            console.log("Rotation is x: " + data.r_x + ", y: " + data.r_y + ", z: " + data.r_z);
        }
        log_position_factor++;

    });
    socket.on('disconnect', function(){
        io.emit('removeOtherPlayer', player);
        world.removePlayer( player );
        console.log('user disconnected');
        console.log('the number of connected players: ' + world.players.length);
    });
});