var N_SIZE = 3,
    EMPTY = "&nbsp;",
    boxes = [],
    turn = "X",
    score,
    moves;
var myTurn = "X"
var isOpponentsTurn = false;

// Constants
var agoraAppId = "a6af85f840ef43108491705e2315a857";
var isLoggedIn = false;
var username = null;
var channel;
var users;

var username = prompt("Enter your username", "raysandeep")
if (username == null) {
    alert("Enter Name!");
    // window.location.reload();
}
var channelName = prompt("Enter your room name", "room")
if (channelName == null) {
    alert("Enter Room Name!");
    // window.location.reload();
}


function startStuff() {
    startAgoraRTM(username, channelName);
    document.getElementById('turn').innerHTML = 'Waiting for player to join';
}

function init() {
    var board = document.createElement('table');
    board.setAttribute("border", 1);
    board.setAttribute("cellspacing", 0);

    var identifier = 1;
    for (var i = 0; i < N_SIZE; i++) {
        var row = document.createElement('tr');
        board.appendChild(row);
        for (var j = 0; j < N_SIZE; j++) {
            var cell = document.createElement('td');
            cell.setAttribute('height', 120);
            cell.setAttribute('width', 120);
            cell.setAttribute('align', 'center');
            cell.setAttribute('valign', 'center');
            cell.setAttribute('id', j.toString() + i.toString());
            cell.classList.add('col' + j, 'row' + i);
            if (i == j) {
                cell.classList.add('diagonal0');
            }
            if (j == N_SIZE - i - 1) {
                cell.classList.add('diagonal1');
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
    if (myTurn == 'X') {
        document.getElementById('turn').textContent = 'Your turn';
    } else {
        document.getElementById('turn').textContent = 'Opponent turn';
    }
}

/*
* New game
*/
function startNewGame() {
    score = {
        "X": 0,
        "O": 0
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
        var testClass = '.' + memberOf[i];
        var items = contains('#tictactoe ' + testClass, turn);
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







// $("#sendMsgBtn").prop("disabled", true);

// RtmClient
const client = AgoraRTM.createInstance(agoraAppId, { enableLogUpload: false });

function startAgoraRTM(accountName, channelName) {

    // Login
    client.login({ uid: accountName }).then(() => {
        console.log('AgoraRTM client login success. Username: ' + accountName);
        isLoggedIn = true;
        channel = client.createChannel(channelName);
        // document.getElementById("channelNameBox").innerHTML = channelName;
        channel.join().then(() => {
            // Receive Channel Message
            channel.on('ChannelMessage', ({ text }, senderId) => {
                movement_data = JSON.parse(text);
                console.log(movement_data)
                if (movement_data.message == "Movement") {
                    console.log("Opponent clicked on" + movement_data.data.location)
                    console.log(document.getElementById(movement_data.data.location))
                    setOpponent(document.getElementById(movement_data.data.location))
                } else if (movement_data.message == "Win") {
                    alert('Opponent Won!');
                    startNewGame()
                }

            });
            channel.getMembers().then((message) => {
                users = message
                console.log(users)
                if (users.length == 2) {
                    if (users[0] != username)
                        document.getElementById('turn').innerHTML = users[0] + " had joined the room"
                    else
                        document.getElementById('turn').innerHTML = users[1] + " had joined the room"

                    init()

                }
            })
            channel.on('MemberJoined', memberId => {
                myTurn = "O"
                isOpponentsTurn = true
                document.getElementById('turn').innerHTML = memberId + " had joined the room"
                init()
            })
            channel.on('MemberLeft', memberId => {
                alert("Opponent left")
                window.location.reload();
            });
        }).catch(error => {
            console.log('AgoraRTM client channel join failed: ', error);
        }).catch(err => {
            console.log('AgoraRTM client login failure: ', err);
        });
    });
}


/*
* Sets clicked square and also updates the turn.
*/
function set() {
    console.log(this.innerHTML, turn, myTurn, isOpponentsTurn,)
    if (this.innerHTML !== EMPTY) {
        return;
    } else if (myTurn == turn && isOpponentsTurn == true) {
        return;
    } else if (myTurn != turn) {
        return;
    }
    this.innerHTML = turn;
    var moves_loc = this.id;
    moves += 1;
    score[turn] += this.identifier;
    console.log(score)
    console.log(turn)
    if (win(this)) {
        channel.sendMessage({ text: JSON.stringify({ message: 'Win', data: turn + " won!" }) }).then(() => {
            console.log("Message sent!");
        }).catch(error => {
            console.log("Message wasn't sent due to an error: ", error);
        });
        alert('You Won!');
        startNewGame();
    } else if (moves === N_SIZE * N_SIZE) {
        alert("Draw");
        startNewGame();
    } else {
        turn = turn === "X" ? "O" : "X";
        document.getElementById('turn').textContent = 'Player ' + turn;
        channel.sendMessage({ text: JSON.stringify({ message: 'Movement', data: { moves: moves, location: moves_loc } }) }).then(() => {
            console.log("Message sent!");
        }).catch(error => {
            console.log("Message wasn't sent due to an error: ", error);
        });
        document.getElementById('turn').textContent = 'Opponent\'s turn';
    }
}


function setOpponent(object) {
    console.log(object.innerHTML, turn, myTurn, isOpponentsTurn,)
    if (object.innerHTML !== EMPTY) {
        return;
    } else if (myTurn == turn && isOpponentsTurn == true) {
        return;
    }
    object.innerHTML = turn;
    moves += 1;
    score[turn] += object.identifier;
    console.log(score)
    console.log(turn)
    if (win(object)) {
        alert('Opponent Won!');
        startNewGame();
    } else if (moves === N_SIZE * N_SIZE) {
        alert("Draw");
        startNewGame();
    } else {
        turn = turn === "X" ? "O" : "X";
        document.getElementById('turn').textContent = 'Your turn';
    }
    isOpponentsTurn = false;
}





// Logout
function leaveChannel() {
    channel.leave();
    client.logout();
    isLoggedIn = false;
    $("#joinChannelBtn").prop("disabled", false);
    $("#sendMsgBtn").prop("disabled", true);
    $("#joinChannelModal").modal('open');
    console.log("Channel left successfully and user has been logged out.");
}
