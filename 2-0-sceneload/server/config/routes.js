module.exports = function(app) {
	console.log("Don't need routes.js right now, but just in case app gets more complex.");
	app.get('/', function(req, res) {
		console.log("User connected!");
	});
}
