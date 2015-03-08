(function() {

	var id, username;

	if(
		localStorage.idiomthonUserId == null &&
		localStorage.idiomthonUserName == null
	) {
		id = new Date().getTime().toString();
		username = prompt("Please enter your name:", "Guest"+id.substr(-5, 5));
		localStorage.idiomthonUserId = id;
		localStorage.idiomthonUserName = username;
	}
	else {
		id = localStorage.idiomthonUserId;
		username = localStorage.idiomthonUserName;
	}
	
	var domain = window.location.host;
	var socket = io.connect(domain, { "force new connection": true });
	var user = {
		id: "",
		name: "",
		score: 0
	};

	socket
		.on("connect", function () {
			$("#name").text(username);
			user.id = id;
			user.name = username;
			socket.emit("userJoin", user);
			console.log("connect!");
		})
		.on("disconnect", function () { console.log("disconnect!"); });

	var answers;
	var pattern1 = [
		[0, 9, 9, 9], [9, 1, 9, 9], [9, 9, 2, 9], [9, 9, 9, 3]
	];
	var pattern2 = [
		[0, 1, 9, 9], [9, 1, 2, 9], [9, 9, 2, 3], 
		[0, 9, 2, 9], [0, 9, 9, 3], [9, 1, 9, 3]
	];
	var pattern3 = [
		[0, 1, 2, 9], [0, 1, 9, 3], [0, 9, 2, 3], [9, 1, 2, 3]
	];

	socket.on("questionUpdate", function(data) {

		answers = data;
		
		var questions = "";

		for(var h=0;h<data.length;h++) {
			var each = data[h].split("");
			switch(each[4]) {
				case "^": pattern = pattern1; break;
				case "?": pattern = pattern2; break;
				case "!": pattern = pattern3; break;
			}
			var rand = Math.floor((Math.random() * pattern.length));
			var str = "";
			for(var i=0;i<4;i++) {
				if(i == pattern[rand][i])str += "O";
				else str += each[i];
			}
			switch(each[4]) {
				case "^":
					questions += "<div id='que"+h+"' class='q1'>"+str+"</div>";
					break;
				case "?":
					questions += "<div id='que"+h+"' class='q2'>"+str+"</div>";
					break;
				case "!":
					questions += "<div id='que"+h+"' class='q3'>"+str+"</div>";
					break;
			}
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
		
		var ansIndex = -1
		if(answers.indexOf(answer+"^") != -1) {
			ansIndex = answers.indexOf(answer+"^");
			answer += "^";
		}
		else if(answers.indexOf(answer+"?") != -1) {
			ansIndex = answers.indexOf(answer+"?");
			answer += "?";
		}
		else if(answers.indexOf(answer+"!") != -1) {
			ansIndex = answers.indexOf(answer+"!");
			answer += "!";
		}
		
		if(ansIndex != -1) {
			var score;
			var className = $("#que"+ansIndex).prop("class");
			
			if(className == "q1")score = 2;
			else if(className == "q2")score = 4;
			else if(className == "q3")score = 6;
			$("#addScoreShow").css("color", "green");
			socket.emit("correct", { user: user, answer: answer, score: score });
		}
		else {
			score = -1;
			$("#addScoreShow").css("color", "red");
			socket.emit("wrong", { user: user });	
		}
		$("#addScoreShow").text((score>0)?"+"+score:score);
		$("#addScoreShow").bPopup(
			{
				position: [125, 200], 
				autoClose: 500, 
				modalColor: "none"
			}
		);
		event.preventDefault();
	});

	$("#answer").focus();

})()