var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server, { log: false }),
	fs = require('fs'),
	port = (process.env.PORT || 5000);

server.listen(port);

console.log("server listening port "+port);

app.use(express.static(__dirname + '/views'));
