var io = require("../app").io;
var User = require("../models/user");
var express = require("express");
var router = express.Router();

var connections = [];

io.on("connection", function(socket){
  console.log(socket.id);

  //Disconnect.
  socket.on("disconnect", function(data){
    if (socket.user){
      connections.forEach(function(item, index){
        if (item.id === socket.user.id){
          io.sockets.emit("offline", item.id);
          connections.splice(index, 1);

          User.findOne({
            _id: item.id
          }, function(err, user){
            if (user !== null){
              // user.status = "offline";

              // user.save();
            }
          })
        }
      })
    }
    
    console.log("data: ", connections)
    io.sockets.emit("get user", connections);
  })

  //Loged in.
  socket.on("loged in", function(id){
    User.findOne({
      _id: id
    }).then(function(user){
      socket.emit("get friend list", user.friendList);
    }, function(err){
      console.log(err)
    })
  });

  //New user
  socket.on("online", function(data){
    socket.user = data;

    if (connections.length === 0){
      connections.push(data);
    }else {
      connections.forEach(function(item, index){
        if (item.id === data.id){
          connections.splice(index, 1);
        }
      })
      connections.push(data);
    }
    io.sockets.emit("get user", connections);
  });

  //Chat between two people together.
  socket.on("send id", function(data){
    console.log(JSON.parse(data));
    var _data = JSON.parse(data);

    //Data included id, message and avatar.
    socket.emit(_data.to, _data.message)
  })

  //Test chat group.
  socket.on('chat message', function(msg){
    var to = JSON.parse(msg).to;
    io.sockets.emit(to, msg);
  });
});

//Go to home page.
router.get("/", function(req, res) {
  if (req.user) {

    res.render("home.html", {
      user: JSON.stringify({
        _id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        phone: req.user.phone,
        status: req.user.status,
        avatar: req.user.avatar
      })
    })
    io.to(req.user._id).emit(req.user._id, JSON.stringify({
      _id: req.user._id,
      email: req.user.email
    }))
  }else {
    res.render("home.html", { user: undefined })
  }
});

//Go to sign up page.
router.get("/signup", function(req, res){
  res.render("signup.html");
});

//Go to login page.
router.get("/login", function(req, res){
    if (!req.user){
      res.render("login.html");
    }else{
      res.redirect("/");
    }
});

//Go to profile page.
router.get("/profile", function(req, res){
	if (!req.user){
		  res.redirect("/");
    }else{
		  res.render("profile.html", { user: req.user });
    }
});

//Update profile.
router.post("/update-profile", function(req, res){
  var id = req.body.id;
  var status = req.body.status;
  var name = req.body.name;
  var phone = req.body.phone;

  console.log(status);

  User.findOne({
    _id: id
  }, function(err, user){
    if (user !== null){
      user.status = status;
      user.name = name;
      user.phone = phone;

      user.save(function(_err, result){
        res.send(result);
      })
    }else {
      res.send(err)
    }
  });
})

//Add friend.
router.post("/add", function(req, res, next){
  var myEmail = req.body.myEmail;
  var email = req.body.email;

  console.log(email + " | " + myEmail)

  if (myEmail === undefined || email === undefined){
    res.status(400).send("Bad Request")
  }else if (email === myEmail){
    res.status(302).send("Found");
  }else{
    //Find my email.
    User.findOne({
      email: myEmail
    }, function(err, user){
      if (!err) {
        // console.log(user.friendList)

        //Check the email you want to add.
        User.findOne({
          email: email
        }, function(_err, _user){
          if (_err) return next(_err);

          if (_user !== null) {  //Email found.
            var already = false;

            var data = {
              _id: _user._id,
              email: _user.email,
              name: _user.name,
              avatar: _user.avatar,
              status: "pendding"
            }

            //Function save email added to my email.
            function addData(data) {
              var already = false;

              User.findOne({
                _id: data._id
              }, function(err, reciever){
                if (err) return next(err);

                if (reciever !== null){
                  console.log("Test notification: ", reciever)

                  reciever.friendList.forEach(function(item){
                    if (item.email === user.email){
                      already = true;
                    }
                  });

                  if (already){
                    res.status(302).send("Found");
                  }else {
                    reciever.friendList.unshift({
                      _id: user._id,
                      email: user.email,
                      name: user.name,
                      avatar: user.avatar,
                      status: "pendding"
                    })

                    reciever.save();
                    io.emit("notification"+data._id, reciever.friendList);
                    res.send(user.email);
                  }
                }
              })
            }

            addData(data)

            // if (user.friendList.length === 0) {
            //   addData(data);
            // }else {
            //   //Check email already added?
            //   for (var i in user.friendList){
            //     if (user.friendList[i].email === data.email){
            //       already = true;
            //       break;
            //     }
            //   }

            //   if (already){
            //     res.status(302).send("Found");
            //   }else{
            //     addData(data);
            //   }
            // }
          }else {
            res.status(403).send("Not Found");
          }
        })
      }
    })


  }
})

router.post("/accept-or-cancel", function(req, res, next){
  var action = req.body.action;
  var your_id = req.body.your_id;
  var id = req.body.id;

  User.findOne({
    _id: your_id
  }, function(err, user){
    if (err) return next(err);

    if (user !== null) {
      user.friendList.forEach(function(item){
        if (item._id === id) {
          if (action === "accept"){
            
            console.log(user.name, user.friendList[0]);

            var u = {
              _id: user._id,
              avatar: user.avatar,
              name: user.name,
              email: user.email,
              status: user.status
            }

            User.findOne({
              _id: id
            }, function(_err, _user){
              if (_err) return next(_err);

              if (_user !== null) {
                item.status = _user.status;

                _user.friendList.push(u);

                io.emit(your_id+"-friends", user.friendList);
                io.emit(id+"-friends", _user.friendList);

                console.log(_user.name, _user.friendList[0])
              }
            })
          }
        }
      })
    }
  })

  // User.findOne({
  //   _id: id
  // }, function(err, user){
  //   if (err) return next(err);

  //   if (user !== null) {
  //     console.log(user.name + ": " + user.email);
  //   }
  // })  

  res.send(action);
})

//Get friend list.
router.get("/getFrendlist", function(req, res) {
  User.findOne({
    _id: req.param("id")
  }, function(err, user){
    if (!err){
      res.send(user.friendList)
    }
  })
})

//Update messages list.
router.post("/update-messages", function(req, res){
  var from = req.body.idFrom;
  var to = req.body.idTo;
  var objectMessage = JSON.parse(req.body.ojMessage);

  var data = [{
    [to]: []
  }, {
    [from]: [{
      msg: "hi"
    }]
  }]

  // data.filter(function(v) {
  //   return v.hasOwnProperty(from)
  // })[0][from]

  

  data.filter(function(v) {
    return v.hasOwnProperty(from)
  })[0][from].push({ "khoa": "hello" })

  res.send(data);

  // if (Array.isArray(objectMessage)) {
  //   User.findOne({
  //     _id: from
  //   }, function(err, user) {
      

  //     user.messages.push(data);
  //     res.send(user.messages);
  //   })
  // }else {
  //   res.send(false);
  // }
})

//Export router module.
module.exports = router