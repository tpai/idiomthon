(function() {

	var id = new Date().getTime().toString();
	var username = prompt("Please enter your name:", "Guest"+id.substr(-5, 5));
	
	var domain = window.location.host;
	var socket = io.connect(domain, { "force new connection": true });
	var user = {
		id: "",
		name: "",
		score: 0
	};

	$("#name").text(username);
	user.id = id;
	user.name = username;
	socket.emit("userJoin", user);

	socket
		.on("connect", function () { console.log("connect!"); })
		.on("disconnect", function () { console.log("disconnect!"); });

	var answers;

	socket.on("questionUpdate", function(data) {
		answers = data;

		var pattern = [
			[0, 1, 9, 9], [9, 1, 2, 9], [9, 9, 2, 3], 
			[0, 9, 2, 9], [0, 9, 9, 3], [9, 1, 9, 3]
		]

		var questions = "";

		for(var h=0;h<data.length;h++) {
			var each = data[h].split("");
			var rand = Math.floor((Math.random() * 6));
			var str = "";
			for(var i=0;i<4;i++) {
				if(i == pattern[rand][i])str += "O";
				else str += each[i];
			}
			questions += "<div class='q'>"+str+"</div>";
		}

		$("#questions").html(questions);
	});

	socket.on("leaderboardUpdate", function (data) {
		data.sort(function(a,b) { return parseFloat(b.score) - parseFloat(a.score) } );
		var str = "";
		$.each(data, function (key, val) {
			if(key <= 10) {
				var no = "";
				if(key < 3) {
					no = "<img src='images/no"+(key+1)+".png' />";
				}
				else {
					no = (key+1)+".";
				}
				str += "<tr><td>"+no+"</td><td>"+val.name + "</td><td>" + val.score + "</td></tr>";
			}
		});
		$("#scoreTable").html(str);
	});

	$("#form").submit(function( event ) {
		var answer = $("#answer").prop("value")
		$("#answer").prop("value", "")
		if(answers.indexOf(answer) != -1) {
			socket.emit("correct", { user: user, answer: answer });
		}
		else {
			socket.emit("wrong", { user: user });	
		}
		event.preventDefault();
	});

	$("#answer").focus();

})()