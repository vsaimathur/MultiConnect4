const socket = io();

// DOM Objects 
const roomLink = document.getElementById("room-code");
var tdControlList = document.getElementById("control_row").childNodes;
var table = document.getElementById("game-table");
var tdList = document.getElementsByTagName("td");
var nameBoard = document.getElementById("name-board");
var player1Name = document.getElementById("player1-name");
var player2Name = document.getElementById("player2-name");
var gameStartedMsg = document.getElementById("game-started-msg");
var wonPlayerUserName = document.getElementById("won-player-user-name");
var copyBtn = document.getElementById("copy-btn");
var copyText = document.getElementById("copy-text");

//Front-End DOM Objects (Theme Toggle)
var toggleThemeButton = document.getElementById("toggle-theme-btn");
var navbar = document.getElementById("top-navbar");
var footer = document.getElementsByClassName("footer")[0];


var player1Script = false;
var player2Script = false;
var rowWin = 0;
var colWin = 0;
var TBDiagWin = 0;
var BTDiagWin = 0;
var playerTurn = 0;

//init
var i,j,k,l;
var userName = "";
var stateArr = new Array();

for(i=0;i<7;i++)
{
	stateArr[i] = new Array(7);
}
for(i=0;i<stateArr.length;i++)
{
	for(j=0;j<stateArr[0].length;j++)
	{
		stateArr[i][j] = 0;
	}
}

//functions
function getTDNumber(row,col)
{
	return (row*7 + col);
}

//cookie modifying methods...

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires;
}


function getCookie(cname)
{
	var cookieStringList = document.cookie;
	var cookieList = cookieStringList.split(";");
	for(let i = 0;i<cookieList.length;i++)
	{
		var cookieParts = cookieList[i].trim().split("=");
		var cnameCookie = cookieParts[0];
		if(cname === cnameCookie)
		{
			return cookieParts[1];
		}
	}
}

function setTheme(theme)
{

	if(theme === "Light")
	{
		//Navbar Theme
		navbar.removeAttribute("class");
		navbar.setAttribute("class","navbar navbar-expand-lg navbar-light bg-primary");
		
		//Navbar Theme button
		toggleThemeButton.innerHTML = "Dark";
		toggleThemeButton.removeAttribute("class");
		toggleThemeButton.setAttribute("class","btn btn-dark");

		//background Theme
		document.body.style.background = "rgb(255, 204, 102)";

		//footer Theme
		footer.removeAttribute("class");
		footer.setAttribute("class","footer bg-primary text-center text-white");
		
	}
	else
	{
		//Navbar Theme
		navbar.removeAttribute("class");
		navbar.setAttribute("class","navbar navbar-expand-lg navbar-dark bg-dark");

		//Navbar Theme button
		toggleThemeButton.innerHTML = "Light";
		toggleThemeButton.removeAttribute("class");
		toggleThemeButton.setAttribute("class","btn btn-light");

		//background Theme
		document.body.style.background = "black";

		//footer Theme
		footer.removeAttribute("class");
		footer.setAttribute("class","footer bg-dark text-center text-white")

	}
}

//copying room link to clipboard of client.
copyBtn.addEventListener("click", (event) => {
	event.preventDefault();
	copyText.select();
	copyText.setSelectionRange(0, 99999); /*For mobile devices*/
	document.execCommand("copy");
});

//Event Handlers

tdControlList.forEach((td) => {
	td.addEventListener("mouseover", (event) => {
		td.childNodes[0].style.visibility = "visible";
	});
});

tdControlList.forEach((td) => {
	td.addEventListener("mouseout", (event) => {
		td.childNodes[0].style.visibility = "hidden";
	});	
});

//Theme Toggle Button Listener
document.getElementById("toggle-theme-btn").addEventListener("click", (event) => {
	
	//checking text on button and changing text on button accordingly and also changing cookie accordingly.

	//checking the theme of page
	console.log(1);
	var themeCheck = getCookie("theme");
	
	//changing the theme of page
	setCookie("theme",themeCheck === "Dark" ? "Light" : "Dark",1)
	
	//setting theme of page according to change made.
	setTheme(getCookie("theme"));

});


//listeners

//receiving opponentName from server.

//here we're are listening on 2 channel initData1 and initData2, if this js is runned by creator(player1) initData1 is used,
// else if js is runned by joined user initData2(player2) is used. We are doing like this becoz, we are fixing creator as player1 and joiner as player2.

socket.on("initData1", (data) => {

	//notifying client script that this is player1 script for our convinience
	player1Script = true;
	player2Script = false;

	//changing the ballColor in all cells of td to blue as this channel is used only by player1.
	for(i=0;i<stateArr.length;i++)
	{
		for(j=0;j<stateArr[0].length;j++)
		{
			tdList[getTDNumber(i,j)].childNodes[0].setAttribute("class","circle1");
		}
	}

	player1Name.innerHTML = userName;
	player2Name.innerHTML = data.opponentName;

	//making game started message visible to player1!
	gameStartedMsg.innerHTML = "Game Started!";
	gameStartedMsg.style.color = "white";

	//retrieving and storing the turn value (i.e, whose turn it is now), here it will be 1 as at start player 1 will have 1st turn.
	playerTurn = data.playerTurn;

	//making background around their name white if it's that player's turn now.
	if(playerTurn == 1)
	{
		player1Name.style.backgroundColor = "white";
		player2Name.style.backgroundColor = "initial";
	}
	else if(playerTurn == 2)
	{
		player1Name.style.backgroundColor = "initial";
		player2Name.style.backgroundColor = "white";
	}

	//we know player1 has ballColor blue and player2 has ball color blue. If this channel is used to listen, it means this 
	// script is for creator hence we assume him as player1 and other player as player 2. 
	// player1Name.style.color = "blue"; 
	// player2Name.style.color = "red"; 
	//edit-2 :
	//as we already fixed colors for each player, directly styled it in html.

});

socket.on("initData2", (data) => {

	//notifying client script that this is player2 script for our convinience
	player1Script = false;
	player2Script = true;

	//changing the ballColor in all cells of td to red as this channel is used only by player2.
	for(i=0;i<stateArr.length;i++)
	{
		for(j=0;j<stateArr[0].length;j++)
		{
			tdList[getTDNumber(i,j)].childNodes[0].setAttribute("class","circle2");
		}
	}

	player1Name.innerHTML = data.opponentName;
	player2Name.innerHTML = userName;

	//making game started message visible to player2!
	gameStartedMsg.innerHTML = "Game Started!";
	gameStartedMsg.style.color = "white";

	//retrieving and storing the turn value (i.e, whose turn it is now), here it will be 1 as at start player 1 will have 1st turn.
	playerTurn = data.playerTurn;
	
	//making background around their name white if it's that player's turn now.
	if(playerTurn == 1)
	{
		player1Name.style.backgroundColor = "white";
		player2Name.style.backgroundColor = "initial";
	}
	else if(playerTurn == 2)
	{
		player1Name.style.backgroundColor = "initial";
		player2Name.style.backgroundColor = "white";
	}


	// player2Name.style.color = "red";
	// player1Name.style.color = "blue";
	//we know player1 has ballColor blue and player2 has ball color blue. If this channel is used to listen, it means this 
	// script is for joiner hence we assume him as player2 and other player as player 1. 
	//edit-2 :
	//as we already fixed colors for each player, directly styled it in html.

});


//receives the other player's data when he changes stateArr, and update to this client as well.
socket.on("gameStateChangedServer", (data) => {

	//updating the stateArr for this player also.
	stateArr = data.stateArr;
	
	//also displaying the actived balls by other player according to changes he last made. 
	// (as this channel is emitted & listened on for every change made by either of players).
	tdList[getTDNumber(data.rowLastChanged,data.colLastChanged)].childNodes[0].removeAttribute("class");
	if(player1Script)
	{
		tdList[getTDNumber(data.rowLastChanged,data.colLastChanged)].childNodes[0].setAttribute("class","circle2");
		tdList[getTDNumber(data.rowLastChanged,data.colLastChanged)].childNodes[0].style.visibility = "visible";
	}
	else
	{
		tdList[getTDNumber(data.rowLastChanged,data.colLastChanged)].childNodes[0].setAttribute("class","circle1");
		tdList[getTDNumber(data.rowLastChanged,data.colLastChanged)].childNodes[0].style.visibility = "visible";
	}

});

socket.on("updatedRoomTurn", (data) => {

	//changing the playerTurn variable according to data received from server
	playerTurn = data.playerTurn;

	//making background around their name white if it's that player's turn now.
	if(data.playerTurn == 1)
	{
		player1Name.style.backgroundColor = "white";
		player2Name.style.backgroundColor = "initial";
	}
	else if(data.playerTurn == 2)
	{
		player1Name.style.backgroundColor = "initial";
		player2Name.style.backgroundColor = "white";
	
	}

	// after their turn is updated we'll now again enable/add tdControlList click Event handler, so other player will be able to click the ball 
	tdControlList.forEach((td) => {
		td.addEventListener("click", controlButtonClicked);	
	});
});


//when game is finished (i.e, one of players won) we remove the eventListeners to stop the game and display the player name who won the game
socket.on("gameDecided", (data) => {
	
	//changed the stateArr to it's finalState
	stateArr = data.stateArr;

	//also displaying the activated balls by other player according to changes he last made that made him win the game. 
	tdList[getTDNumber(data.rowLastChanged,data.colLastChanged)].childNodes[0].removeAttribute("class");
	tdList[getTDNumber(data.rowLastChanged,data.colLastChanged)].childNodes[0].setAttribute("class","circle" + data.wonPlayerNumber.toString());
	tdList[getTDNumber(data.rowLastChanged,data.colLastChanged)].childNodes[0].style.visibility = "visible";

	//Changing the game-started-msg to game ended
	//Also retrieving the wonPlayerUserName and displaying it to both the clients. (as the gameDecided channel is emitted to both players) 
	gameStartedMsg.innerHTML = "Game Ended!";
	gameStartedMsg.style.color = "red";
	wonPlayerUserName.innerHTML = "Game Won By " + data.wonPlayerUserName;

	tdControlList.forEach((td) => {
		td.removeEventListener("click", controlButtonClicked);	
	});


	//OverWriting the Event Handlers Written Above just after initializations (retreiving cookie,etc)
	//int onmouserover event, we are making balls hidden(so player would understand he can't do anything after game is finished)	
	// this is just a **TEMPORARY SOLUTION
	tdControlList.forEach((td) => {
		td.addEventListener("mouseover", () => {
			td.childNodes[0].style.visibility = "hidden";
		});
	});
	//in onmouseout event, the balls are already hidden, so no need to overwrite that event

});

socket.on("playerDisconnected", (data) => {

	//showing the game stopped msg to other player and also saying other player disconnected.
	gameStartedMsg.innerHTML = "Game Stopped!";
	gameStartedMsg.style.color = "red";
	wonPlayerUserName.innerHTML = data.disconnectedPlayerName + " Disconnected!";

	//removing all listeners of DOM.
	tdControlList.forEach((td) => {
		td.removeEventListener("click", controlButtonClicked);	
	});

	//OverWriting the Event Handlers Written Above just after initializations (retreiving cookie,etc)
	//int onmouserover event, we are making balls hidden(so player would understand he can't do anything after game is finished)	
	// this is just a **TEMPORARY SOLUTION
	tdControlList.forEach((td) => {
		td.addEventListener("mouseover", () => {
			td.childNodes[0].style.visibility = "hidden";
		});
	});
	//in onmouseout event, the balls are already hidden, so no need to overwrite that event

});


//*** HANDLED THIS TYPE OF ERROR USING EXCEPTION HANDLING(TRY-CATCH) ON SEVER SIDE.
// socket.on("no-room-signal", (data) => {
// 	//showing the no room exists msg to all players.
// 	gameStartedMsg.innerHTML = "Game Cannot be started!";
// 	gameStartedMsg.style.color = "red";
// 	wonPlayerUserName.innerHTML = data.errorSignal;

// 	//removing all listeners of DOM.
// 	tdControlList.forEach((td) => {
// 		td.removeEventListener("click", controlButtonClicked);	
// 	});

// 	//OverWriting the Event Handlers Written Above just after initializations (retreiving cookie,etc)
// 	//int onmouserover event, we are making balls hidden(so player would understand he can't do anything after game is finished)	
// 	// this is just a **TEMPORARY SOLUTION
// 	tdControlList.forEach((td) => {
// 		td.addEventListener("mouseover", () => {
// 			td.childNodes[0].style.visibility = "hidden";
// 		});
// 	});
// 	//in onmouseout event, the balls are already hidden, so no need to overwrite that event
// });

//emitters

//on page loading completely, we prompt the user to enter his userName and emit the userName along with roomID extracted from cookies.
window.onload = ()  => {
	setTheme(getCookie("theme"));
	userName = prompt("Enter your username : ");
	socket.emit("initGame", {
		roomID : getCookie("roomID"),
		userName : userName
	});
}


//this is a callBack function which will be used when event(controlButtonClicked) described below this occurs
const controlButtonClicked = (event) => {

	//this only allow's stateChange if its that players turn and it's his script to make change
	if((player1Script && playerTurn === 1)|| (player2Script & playerTurn ===2))
	{
		col = parseInt(event.target.parentNode.id[1]);
		if(isNaN(col))	//exception handling for case when ball is shown but not clicked on it.
		{
			return 0;
		}

		//disabling click eventHandlers for tdControlList so that the player won't be able to push multiple balls (clicking more than 2 times)
		//this clickEventHandler will be enabled again or added again once other player receives gameStateChanged and turn is changed.
		//doing this disabling after check if player didnt click on ball but on outside area, becoz even if he hits outside area (player didnt push the ball), click will be disabled if I place this code above at top.
		//and players won't be able to continue the game as click is disabled. so to avoid such we placing code after checking whether he clicked on ball or not.
		tdControlList.forEach((td) => {
			td.removeEventListener("click", controlButtonClicked);	
		});


		for(i=stateArr.length-1;i>=0;i--)
		{
			//checking if clicked column is free or not and inserting ball in it if it's free
			if(stateArr[i][col] == 0)
			{
				tdList[getTDNumber(i,col)].childNodes[0].style.visibility = "visible";
				
				//changing state of cell according to which player clicked the ball	
				stateArr[i][col] = player1Script ? 1 : 2;
				break;
			}	
		}
		// console.log(stateArr);
		socket.emit("gameStateChangedClient",{
			stateArr : stateArr,
			rowLastChanged : i,
			colLastChanged : col
			// playerNumber : player1Script ? 1 : 0 //playerNumber need not be transmitted to server as we are emitting changes to player who didnt make the change from server. 
		});
	}
 }


//ball on click on a col, transmitting the table state to server ->refer to socket.emit in above callback function.
tdControlList.forEach((td) => {
	td.addEventListener("click", controlButtonClicked);	
});


// Problems:

// Problem 1 : 2 balls to make, 1 for each player (just did it wrong at start), check in listening of initData channel for 
// more infomation 

// Problem 2 :
	//we can't removeEventListener For onmouseover & onmouserout event (as we want anonymous function over there,  
	//without it, if we pass a reference callback function & define the callback function with event as argument it's not working correctly)
	//ref Link for Problem : https://medium.com/@DavideRama/removeeventlistener-and-anonymous-functions-ab9dbabd3e7b

//some problems and their solutions