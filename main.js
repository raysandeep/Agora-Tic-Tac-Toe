var N_SIZE = 3,
	EMPTY = "&nbsp;",
	boxes = [],
	turn = "X",
	score,
	moves;

var APP_ID = "84da7584079e4a71aa5886c1f00b063f";
var isLoggedIn = false;
var username = null;
var channel = null;
var users = [];
var isOpponentTurn = false;
var myTurn = "X";

username = prompt("Please enter your username?", "raysandeep");
if (username == null) {
	alert("Please enter Name!");
}

channel = prompt("Please enter your room name?", "testroom");
if (channel == null) {
	alert("Please enter Roomname!");
}

function initiateEverything() {
	startAgoraRTM(username, channel);
	// init();
	document.getElementById("turn").innerHTML = "Waiting for players to join!";
}

const client = AgoraRTM.createInstance(APP_ID);

function startAgoraRTM(accountName, channelName) {
	client
		.login({ uid: accountName })
		.then(() => {
			console.log("Logged In");
			isLoggedIn = true;
			channel = client.createChannel(channelName);
			channel
				.join()
				.then(() => {
					console.log("Joined Channel");

					channel.on("ChannelMessage", ({ text }, senderId) => {
						data = JSON.parse(text);
						console.log(data);
						if (data.message == "Movement") {
							console.log("Opponent clicked on ", data.data);
							opponentSet(document.getElementById(data.data));
						} else if (data.message == "Win") {
							alert("Opponent won!");
						}
					});

					channel.getMembers().then((members) => {
						users = members;
						console.log(users);
						if (users.length == 2) {
							if (users[0] != username)
								document.getElementById("turn").innerHTML =
									users[0] + " had joined the room!";
							else
								document.getElementById("turn").innerHTML =
									users[1] + " had joined the room!";
							init();
							document.getElementById("turn").innerHTML =
								"Your Turn!";
						}
						myTurn = "X";
					});

					channel.on("MemberJoined", (memberId) => {
						console.log(memberId);
						document.getElementById("turn").innerHTML =
							memberId + " had joined the room!";
						init();
						myTurn = "O";
						document.getElementById("turn").innerHTML =
							"Opponent's Turn!";
					});

					channel.on("MemberLeft", (memberId) => {
						alert("Opponent Left");
						window.location.reload();
					});
				})
				.catch((error) => {
					console.log("Agora Join Channel Failed!", error);
				});
		})
		.catch((error) => {
			console.log("Agora Login Failed!", error);
		});
}

function init() {
	var board = document.createElement("table");
	board.setAttribute("border", 1);
	board.setAttribute("cellspacing", 0);

	var identifier = 1;
	for (var i = 0; i < N_SIZE; i++) {
		var row = document.createElement("tr");
		board.appendChild(row);
		for (var j = 0; j < N_SIZE; j++) {
			var cell = document.createElement("td");
			cell.setAttribute("height", 120);
			cell.setAttribute("width", 120);
			cell.setAttribute("align", "center");
			cell.setAttribute("valign", "center");
			cell.setAttribute("id", i.toString() + j.toString());
			cell.classList.add("col" + j, "row" + i);
			if (i == j) {
				cell.classList.add("diagonal0");
			}
			if (j == N_SIZE - i - 1) {
				cell.classList.add("diagonal1");
			}
			cell.identifier = identifier;
			cell.addEventListener("click", set);
			row.appendChild(cell);
			boxes.push(cell);
			identifier += identifier;
		}
	}

	document.getElementById("tictactoe").appendChild(board);
	startNewGame();
}

/*
 * New game
 */
function startNewGame() {
	score = {
		X: 0,
		O: 0,
	};
	moves = 0;
	turn = "X";
	boxes.forEach(function (square) {
		square.innerHTML = EMPTY;
	});
}

/*
 * Check if a win or not
 */
function win(clicked) {
	// Get all cell classes
	var memberOf = clicked.className.split(/\s+/);
	for (var i = 0; i < memberOf.length; i++) {
		var testClass = "." + memberOf[i];
		var items = contains("#tictactoe " + testClass, turn);
		// winning condition: turn == N_SIZE
		if (items.length == N_SIZE) {
			return true;
		}
	}
	return false;
}

function contains(selector, text) {
	var elements = document.querySelectorAll(selector);
	return [].filter.call(elements, function (element) {
		return RegExp(text).test(element.textContent);
	});
}

/*
 * Sets clicked square and also updates the turn.
 */
function set() {
	if (this.innerHTML !== EMPTY) {
		return;
	} else if (myTurn == turn && isOpponentTurn == true) {
		return;
	} else if (myTurn != turn) {
		return;
	}
	this.innerHTML = turn;
	moves += 1;
	mov_loc = this.id;
	score[turn] += this.identifier;
	if (win(this)) {
		startNewGame();
		channel
			.sendMessage({
				text: JSON.stringify({ message: "Win", data: turn + " won!" }),
			})
			.then(() => {
				console.log("Message sent!");
			})
			.catch((error) => {
				console.log(error);
			});
		alert("You Won!");
	} else if (moves === N_SIZE * N_SIZE) {
		alert("Draw");
		startNewGame();
	} else {
		turn = turn === "X" ? "O" : "X";
		document.getElementById("turn").textContent = "Opponent's turn";
		channel
			.sendMessage({
				text: JSON.stringify({ message: "Movement", data: mov_loc }),
			})
			.then(() => {
				console.log("Message sent!");
			})
			.catch((error) => {
				console.log(error);
			});
	}
}

function opponentSet(object) {
	if (object.innerHTML !== EMPTY) {
		return;
	} else if (myTurn == turn && isOpponentTurn == true) {
		return;
	}
	object.innerHTML = turn;
	moves += 1;
	mov_loc = object.id;
	score[turn] += object.identifier;
	if (win(object)) {
		alert("Opponent Won!");
		startNewGame();
	} else if (moves === N_SIZE * N_SIZE) {
		alert("Draw");
		startNewGame();
	} else {
		turn = turn === "X" ? "O" : "X";
		document.getElementById("turn").textContent = "Your turn";
	}
	isOpponentTurn = false;
}
