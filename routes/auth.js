var User = require("../models/user");
var passport = require("../passport/index").passport;
var uuid = require("node-uuid");
var express = require("express");
var router = express.Router();

//Signup method.
router.post("/signup", function(req, res, next){
	var user = new User({
		_id: uuid.v4(),
		email: req.body.email,
		password: req.body.password,
		name: req.body.name,
		phone: req.body.phone
	});
	
	user.save(function(err, result){
		if (err){
			console.log(err)
			if (err.code == 11000) {
				res.render("error.html", {
					code: 404,
					msg: "Email already exist."
				});
			}

			res.render("error.html", {
				code: 404,
				msg: err.errmsg
			});
			next();
		}else {
			console.log(result);
			res.redirect("/");
		}
	});
});

//Login method.
router.post("/login", passport.authenticate("local", { failureRedirect:'/login' }), function(req, res){
	// User.findOne({
	// 	_id: req.user._id
	// }, function(err, user){
	// 	if (user !== null){
	// 		user.status = "online"
	// 	}
	// })
	res.redirect("/");
	// res.status(200).send({url: "/"})
});

//Logout method.
router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

module.exports = router