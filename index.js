//intializations
const express = require("express");
const http = require("http");
const socket_io = require("socket.io");
const bodyParser = require("body-parser"); 
const {v4 : uuidv4} = require("uuid"); 			// same as import {v4 as uuidv4} from "uuid" (ES6).
const cookieParser = require("cookie-parser");
const path = require("path"); 
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socket_io(server);
const PORT = process.env.PORT || 5000;

var roomUserSockets = {}; // {roomNo : [socketID_p1,socketID_p2]}
var socketUsers = {}; 	//{socketID : userName}
var socketRooms = {};	//{socketID : roomID}
var roomUserCount = {}; // {roomNo : count}
var serverStateArr = [];
var roomTurn = {};	//{roomNo : turnNumber}turnNumber -> 1 for player 1's turn and turnNumber -> 2 for player 2's turn
var checkGameWin = 0;	// 0 means no player won the game yet, 1 => player 1 won the game, 2=> player 2 won the game

//middlewares
app.set("view engine","hbs");
app.use(express.static(path.join(__dirname,"public/")));
app.use(bodyParser.urlencoded({extended : 'false'}));
app.use(cookieParser());

//GAME LOGIC

//row check
function rowCheck()
{
	for(i=serverStateArr.length-1;i>=1;i--)
	{
		for(j=0;j<=serverStateArr[0].length-4;j++)
		{
			if(serverStateArr[i][j] === 1 && serverStateArr[i][j] === serverStateArr[i][j+1] && serverStateArr[i][j+1] === serverStateArr[i][j+2] && serverStateArr[i][j+2] === serverStateArr[i][j+3])
			{
				return 1;
			}
			if(serverStateArr[i][j] === 2 && serverStateArr[i][j] === serverStateArr[i][j+1] && serverStateArr[i][j+1] === serverStateArr[i][j+2] && serverStateArr[i][j+2] === serverStateArr[i][j+3])
			{
				return 2;
			}	
		}
	}
	return 0;
}

//col check
function colCheck()	
{
	for(i=0;i<serverStateArr.length;i++)
	{
		for(j=serverStateArr[0].length-4;j>=1;j--)
		{
			if(serverStateArr[j][i] === 1 && serverStateArr[j][i] === serverStateArr[j+1][i] && serverStateArr[j+1][i] === serverStateArr[j+2][i] && serverStateArr[j+2][i] === serverStateArr[j+3][i])
			{
				return 1;
			}
			if(serverStateArr[j][i] === 2 && serverStateArr[j][i] === serverStateArr[j+1][i] && serverStateArr[j+1][i] === serverStateArr[j+2][i] && serverStateArr[j+2][i] === serverStateArr[j+3][i])
			{
				return 2;
			}
		}
	}
	return 0;
}

//top to bottom diag check
function TBDiagCheck()
{
	for(k=-(serverStateArr.length-4);k<=serverStateArr.length-4;k++)
	{
		let testArr = new Array();
		for(i=0;i<serverStateArr.length;i++)
		{
			for(j=0;j<serverStateArr[0].length;j++)
			{
				if((i-j) == k)
				{
					testArr.push(serverStateArr[i][j]);
					// console.log(i,j);
				}
			}
		}
		// console.log(testArr);
		for(l=0;l<=testArr.length-4;l++)
		{
			if(testArr[l] === 1 && testArr[l] === testArr[l+1] && testArr[l+1] === testArr[l+2] && testArr[l+2] === testArr[l+3])
			{
				return 1;
			}
			if(testArr[l] === 2 && testArr[l] === testArr[l+1] && testArr[l+1] === testArr[l+2] && testArr[l+2] === testArr[l+3])
			{
				return 2;
			}
		}
	}
	return 0;
}

//bottom to top diagonal check
function BTDiagCheck()
{
	for(k=3;k<=9;k++)					//make it dynamic later didn't understand clearly here.
	{
		let testArr = new Array();
		for(i=0;i<serverStateArr.length;i++)
		{
			for(j=0;j<serverStateArr[0].length;j++)
			{
				if((i+j) == k)
				{
					testArr.push(serverStateArr[i][j]);
					// console.log(i,j);
				}
			}
		}
		for(l=0;l<=testArr.length-4;l++)
		{
			if(testArr[l] === 1 && testArr[l] === testArr[l+1] && testArr[l+1] === testArr[l+2] && testArr[l+2] == testArr[l+3])
			{
				return 1;
			}
			if(testArr[l] === 2 && testArr[l] === testArr[l+1] && testArr[l+1] === testArr[l+2] && testArr[l+2] == testArr[l+3])
			{
				return 2;
			}
		}
	}
	return 0;
}

// overall function for all logics used above
function gameLogic()
{
	rowWin = rowCheck();
	if(rowWin)
	{
		console.log("stop game! row",rowWin);
		return rowWin;
	} 
	colWin = colCheck();
	if(colWin)
	{
		console.log("stop game! col",colWin);
		return colWin;
	}
	TBDiagWin = TBDiagCheck();
	if(TBDiagWin)
	{
		console.log("stop game! tb",TBDiagWin);
		return TBDiagWin;
	}
	BTDiagWin = BTDiagCheck();
	if(BTDiagWin)
	{
		console.log("stop game! bt",TBDiagWin);
		return BTDiagWin;
	}
	return 0;
}	


//server listeners & emitters (socket.io)
io.on("connection",(socket) => {

	//recieving clients userName and roomID and joining the client to room and sending opponents names to both clients in room
	//also sending color of their balls to each client in room.
	socket.on("initGame", (data) => {

		//making a map of socketID to userName to show userName when disconnected and to display opponents userName to both players.
		socketUsers[socket.id] = data.userName;

		//making a map of socketID to roomID to access this map easily whenever gameState is changed.
		socketRooms[socket.id] = data.roomID;

		//join the socket to room (according to sockets room concept in documentation)
		socket.join(data.roomID);

		// adding user to room for our use to display userName disconnected msg when then user disconnects.
		try
		{
			// if(roomUserSockets[data.roomID] == [])	//exception handling for case where there is no room like that. example think of case when player 1 send link and get tired of waiting after sometime and leaves and then player 2 joins the room, here it's handled. 
			// {
			// 	//this also happens if one player is leaving the room while other player is entering the room.
			// 	// io.to(data.roomID).emit("no-room-signal", {
			// 	// 	errorSignal : "Sorry!, this room does'nt exist or no longer availabe"
			// 	// });

			// 	//**TEMPORARY FIX FOR ALL TEMPORARY PROBLEMS.
			// 	//thought again instead of sending no room signal to all player and make other problems arise, redirect to error page or just return 0 if any problem occurs.
			// 	return 0;
			// }
			console.log(roomUserSockets[data.roomID]);
			roomUserSockets[data.roomID].push(socket.id);
		}
		catch(err)
		{

			//if there is an error in connectring the socket or adding the socket to room. Deleting all created rooms, and all data related to that socket (so as to save space in arr) and handling the error to avoid taking wrong data!.
			delete roomUserSockets[data.roomID];
			delete roomUserCount[socketRooms[socket.id]];

			delete socketUsers[socket.id];
			delete socketRooms[socket.id];
			console.log("SocketRoomArr after Deletion via Error : " + roomUserSockets[data.roomID]);

			return 0;
		} 
		

		//after 2 users joining a room, sending their ball color and usernames to each other and also sending whose turn it is at start.
		if(roomUserSockets[data.roomID].length == 2)
		{
			//after 2 player joined the room, we assign the starting turn to player1(default) in the room
			roomTurn[data.roomID] = 1;

			//sending player 1, his ballColor, opponents name by emitting initData1 channel.
			io.to(roomUserSockets[data.roomID][0]).emit("initData1",{
				opponentName : socketUsers[roomUserSockets[data.roomID][1]],
				playerTurn : roomTurn[data.roomID]
			});

			//sending player 2, his ballColor, opponents name by emitting initData2 channel.
			io.to(roomUserSockets[data.roomID][1]).emit("initData2",{
				opponentName : socketUsers[roomUserSockets[data.roomID][0]],
				playerTurn : roomTurn[data.roomID]
			});
		}

		console.log('SocketUsersArr:');
		console.log(socketUsers);
		console.log('RoomUserSocketsArr:');
		console.log(roomUserSockets);
		console.log('SocketRooms:');
		console.log(socketRooms);
	});

	socket.on("gameStateChangedClient",(data) => {
		serverStateArr = data.stateArr;
		checkGameWin = gameLogic();	//returns the player number who won the game
		
		//if game is finished emitting that game is finished via gameDecided channel and stopping all DOM Listeners in client script.
		if(checkGameWin)
		{
			io.to(socketRooms[socket.id]).emit("gameDecided", {
				stateArr : serverStateArr,
				rowLastChanged : data.rowLastChanged,
				colLastChanged : data.colLastChanged,
				wonPlayerUserName : socketUsers[roomUserSockets[socketRooms[socket.id]][checkGameWin-1]],
				wonPlayerNumber : checkGameWin
			})
		}
		//else if game is not finished emitting change in serverStateArr via gameStateChangedServer Channel and
		//also emitting the update turn via updatedRoomTurn channel.
		else
		{
			
			//sending the changed game state to other player in the room.
			socket.to(socketRooms[socket.id]).emit("gameStateChangedServer", {
				stateArr : serverStateArr,
				rowLastChanged : data.rowLastChanged,
				colLastChanged : data.colLastChanged,
				playerNumber : data.playerNumber
			});

			//updating roomTurn value and emitting it to both players in the room
			roomTurn[socketRooms[socket.id]] = roomTurn[socketRooms[socket.id]] === 1 ? 2 : 1; 
			io.to(socketRooms[socket.id]).emit("updatedRoomTurn", {
				playerTurn : roomTurn[socketRooms[socket.id]]
			});

		}
	});

	socket.on("disconnect", () => {
		let currentDeleteRoomID = socketRooms[socket.id];
		let currentRoomDeleteUserCount = roomUserCount[currentDeleteRoomID];
		let currentRoomSocketArr = roomUserSockets[currentDeleteRoomID];

		//exception handling for case when room does'nt exist at all. (case where player goes offline and returns online to same page later and closing it later and many other similar cases)
		if(currentRoomSocketArr === undefined)
		{
			return 0;
		}

		let currentRoomSocketArrDeleteIndex = currentRoomSocketArr.indexOf(socket.id);

		//emitting playerDisconnected channel to let the other player know about it
		io.to(currentDeleteRoomID).emit("playerDisconnected",{
				disconnectedPlayerName : socketUsers[socket.id],
				disconnectedPlayerNumber : currentRoomSocketArrDeleteIndex+1,
			});

		//if only one player exits the room, we'll only remove him from the room but room will still be intact and roomCount is updated
		if(currentRoomDeleteUserCount === 2)
		{
			roomUserSockets[currentDeleteRoomID] = currentRoomSocketArr.slice(0,currentRoomSocketArrDeleteIndex) + currentRoomSocketArr.slice(currentRoomSocketArrDeleteIndex + 1);
			roomUserCount[socketRooms[socket.id]] = 1;
		}

		//if both player exits the room, we delete the room and also the roomCount key. 
		else if(currentRoomDeleteUserCount === 1)
		{
			delete roomUserSockets[currentDeleteRoomID];
			delete roomUserCount[socketRooms[socket.id]];
		}

		//if at all a player leaves the room, we delete that player from socketUsers array, and socketRooms array.
		delete socketUsers[socket.id];
		delete socketRooms[socket.id];
		console.log("SocketRoomArr after Deletion : " + roomUserSockets[currentDeleteRoomID]);
	});


});


//Route to create Room and Render Game Page to player 1 when TwoPlayer button is clicked.
app.get("/twoplayerinit", (req, res) => {
	//generating random room number for 2 players to play.
	curRoomId = uuidv4();				

	//registering room number in roomUserSockets.			
	roomUserSockets[curRoomId] = [];		

	//creating link for player 2 to join.
	curPlayerTwoRoomLink = process.env.SERVER_HOSTNAME + "/twoplayergame/" + curRoomId + "/2";	

	//maintaining the userCount on a room (1st player added to room so count is 1)	**MAY CHANGE
	roomUserCount[curRoomId] = 1; 

	// roomID cookie set for player1 (10min expire time for now).
	res.cookie("roomID",curRoomId, {httpOnly : false,expire : 600000 + Date.now()});

	//rending game page for player 1.
	res.render("twoplayergame", {		
		roomLink : curPlayerTwoRoomLink
	});
});


//Handling the link for 2nd player and other players when he/they open the link.
app.get('/twoplayergame/:roomid/:playernumber', (req, res) => {

	//retrieving the roomid of player1 from url
	let curRoomId = req.params.roomid;			

	//room link description for player 2 in his game page.
	let curRoomPlayerLink = "2 Players Already Joined";

	//maintaining the userCount on a room (2st player added to room so count is increased)	**MAY CHANGE
	roomUserCount[curRoomId] += 1;

	//if link is loaded more than 2 times it will check cookies if same client is reloading or some other user is entering
	//the link and will take action accordingly. 
	console.log(roomUserCount);
	if(roomUserCount[curRoomId] > 2)
	{
		//if the 2nd client is refreshing the page or rediecting to same page again, he'll be able to view the game page.
		if(req.cookies.roomID == curRoomId)	
		{
			//**TO-DO This feature of getting data even if refreshed or opened page again will be implemented later.
			res.send("<h1>Sorry!, we were'nt able to fetch the game data."); 
		}
		else
		{
			//As the room can have max limit of 2 players, we are restricting 3rd Client/Player to join the room with link.
			res.send("Sorry!, This room is already full");
		}
	}
	//2nd Player opening link for 1st time...
	else
	{
		//cookie is set with roomID for 2nd Player (expires in 10min for now)
		res.cookie("roomID",curRoomId, {httpOnly : false ,expire : 600000 + Date.now()}); 

		//rendering twoplayergame page for player 2 when he enters the given link.
		res.render("twoplayergame",{			
			roomLink : curRoomPlayerLink			
		});
	}

});


server.listen(PORT, () => {
	console.log(`server is running on port ${PORT}`);
});


// Problems

//problem - 1

// if 2 users join at same time or internet speed of 1 is slower than other, then redirecting will take time for one user and
// might get wrong username, to avoid this we'll use cookies to remember his username and retrieve it when he arrives at game page
	// sub-problem-1a
	// but it also contains other problems as after redirecting we need a request from client else we cant get cookie from client,as
	// we are using sockets and cant get req object. It was solved sending both username and roomNumber as cookies to client
	// and retrieving it when page loads i.e., on page load we will emit a event and listen on server script.


//**TO-DO -> Implement UserName feature using onload alertbox on client script and emitting the username on server script
//using sockets (DONE)

//problem - 2

//identifying who is player1 and who is player2?

//**TO-DO -> make a turn var and decide which player's turn to play and also change the stateArr in clientSide if only it's 
			// that players turn else do nothing (DONE)
//**TO-DO -> display : player's turn in place of Game Started Message (didnt do , instead highlited name according to their turn) (DONE)

//**TO-DO -> retrive the gameState from cookies if net gets diconnected (do this at last if possible).

//**TO-DO -> Error handling at place outside circle.(DONE)

//**TO-DO -> sameSite -> none not working, default is lax, strict mode also availabe, fix this issue and transmit game to LAN
			// Edit : found that in client script just wrote to connect to localhost , fixed to to automatically adjust and it worked. (DONE)

//**TO-DO -> write code for on disconnection (DONE)

//**TO-DO -> make it possible to refresh the page for client by giving him/her a seperate cookie id and later identifying if he's already present in game
			 // and maintain his game by sending gameState also as cookie (already mentioned above).

//**TO-DO -> disable the control ball box event listener once a ball is dropped to prevent dropping of multiple balls without that turn(network delay problem).

//***TEMPORARY PROBLEM ( However its highly unlikely that a player join when other player leaves ). 
//NO ROOM SIGNAL PROBLEM, if this is managed according to solution, then another problem of allowing the 
// join of multiple users in room is arising!, like it's not going to show room is already full 
// (as the room count remains to stay as 2 if 3rd socket is joining when 2nd socket leaves.)
//This can be managed by giving client a seperate cookie id and identifying each client (will implement later).
//**TEMPORARY FIX FOR ALL TEMPORARY PROBLEMS. (for above problem) (permanent fix is to identify each player by assign them each their cookie id).
//thought again instead of sending no room signal to all player and make other problems arise, redirect to error page or just return 0 if any problem occurs.
