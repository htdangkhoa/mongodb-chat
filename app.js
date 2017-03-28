//Declare modules;
var config = require("./config");
var User = require("./models/user");
var mongoose = require("mongoose");
var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var cors = require('cors')
var	expressSession = require("express-session");
var passport = require("./passport/index").passport;
var path = require("path");

//Socket.io
var app	= express();
var server = require('http').createServer(app);
var io = require("socket.io")(server);
module.exports.io = io;

//Port.
var port = process.env.PORT || 5000;

server.listen(port, function() {
	console.log("Server is running on port " + port);
});

//Connect mongoDB.
mongoose.connect(config.develop);

//Setup cookie parser, body parser and express session.
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cors());
app.use(expressSession({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: false
}));

//Setup passport initialize function and passport session function.
app.use(passport.initialize());
app.use(passport.session());

//Set engine template.
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/'));

//Setup routes.
app.use("/", require("./routes/api"));
app.use("/", require("./routes/auth"));

