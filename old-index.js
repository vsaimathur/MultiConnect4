//intializations
const express = require("express");
const http = require("http");
const socket_io = require("socket.io");
const bodyParser = require("body-parser"); 
const {v4 : uuidv4} = require("uuid"); // same as import {v4 as uuidv4} from "uuid" (ES6).

const app = express();
const server = http.createServer(app)
const io = socket_io(server);
const PORT = process.env.PORT || 3000;

var clientCount = 0;
var roomNo = 0;
var curClientName = "";
var roomSocketUsers = {} // {roomNo : [{socketid : "1", p1Name : "a"},{socketid : "2", p2Name : "b"}]}

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended : 'false'}))

//server listeners & emitters
io.on("connection",(socket) => {
})


app.get("")

app.post('/unameval', (req,res) => {
	console.log(req.body.username);
	clientCount++;
	roomLink = uuidv4();
	if(roomUsers[roomNo])
	{
		roomUsers[roomNo].push(req.body.username);
	}
	else
	{
		roomUser[roomNo] = [req.body.username];
	}
	//to solve the problem of 2 people hosting at same time and net lag.
	res.redirect("/two_player_game.html");
});

server.listen(PORT, () => {
	console.log(`server is running on port ${PORT}`);
});


// Problems

//problem - 1

// if 2 users join at same time or internet speed of 1 is slower than other, then redirecting will take time for one user and
// might get wrong username, to avoid this we'll use cookies to remember his username and retrieve it when he arrives at game page
// but it also contains other problems as after redirecting we need a request from client else we cant get cookie from client,as
// we are using sockets and cant get req object.