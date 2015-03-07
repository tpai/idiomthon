var express = require('express'),
	app = express(),
	http = require('http').createServer(app),
	io = require('socket.io')(http),
	port = (process.env.PORT || 5000);

http.listen(port);

console.log("server listening port "+port);

app.use(express.static(__dirname + '/views'));

var data = [];
var leaderboard = [], globalQuestion = [];

io.on('connection', function (socket) {

	socket.on("userJoin", function (user) {
		if(leaderboard.length == 0)leaderboard.push(user);
		else {
			for(var i=0;i<leaderboard.length;i++) {
				if(leaderboard[i].id == user.id)break;
				else if(i == leaderboard.length - 1)leaderboard.push(user);
			}
		}
		console.log(leaderboard);
	});

	setInterval(function () {
		if(data.length > 0 && globalQuestion.length < 9) {
			var str = data.pop();
			if(globalQuestion.indexOf(str) == -1) {
				globalQuestion.push(str);
			}
		}
		else if(data.length == 0) {
			data = shuffle(require('./custom/readfile').getAll());
			console.log(data);
		}
	}, 3000);

	setInterval(function () {
		socket.emit("questionUpdate", globalQuestion);
		socket.emit("leaderboardUpdate", leaderboard);
	}, 1000);

	socket.on("correct", function(data) {

		var username = data.user.name;

		// remove question
		var index = globalQuestion.indexOf(data.answer);
		globalQuestion.splice(index, 1);
		console.log(data.user.name+"'s answer is correct! ["+index+"]");

		// add score
		for(var i=0;i<leaderboard.length;i++) {
			if(leaderboard[i].id == data.user.id) {
				leaderboard[i].score += 2;
				console.log(username+"'s score: "+leaderboard[i].score);
				break;
			}
		}
	});

	socket.on("wrong", function (data) {
		console.log(data.user.name+"'s answer is wrong!");
		// minus score
		for(var i=0;i<leaderboard.length;i++) {
			if(leaderboard[i].id == data.user.id) {
				leaderboard[i].score -= 1;
				console.log(data.user.name+"'s score: "+leaderboard[i].score);
				break;
			}
		}
	});
});

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};