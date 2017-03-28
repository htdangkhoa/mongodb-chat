app.controller("HomeCtrl", function($scope, $timeout, $http, $window, $httpParamSerializer, $translate, $q){
	$("textarea").focus();

	$scope.sumNoti = 0;
	$scope.checkEmail = true;
	// $scope.checkChat = false;

	// if (sessionStorage.getItem("receiver") === null || sessionStorage.getItem("receiver") === )

	$scope.initLocale = function(){
		$scope.locales = localStorage.getItem("lang");
	}

	$scope.initStatus = function(status){
		$scope.status = status;
	}

	$scope.showFriendToChat = function(id, name, index){
		$scope.checkChat = false;
		$timeout(function() {
			$(".item").each(function() {
				if ($(this).attr("id") === id){
					$("#chatbox p").attr("id", id);
					$("#chatbox p").text(name);
					$(".item").removeClass("active");
					$($(".item")[index]).addClass("active");
					$scope.checkChat = true;
				}
			});
		}, 0);
	}

	// if (user !== null){
	// 	var timeout;
	// 	$(window).on('beforeunload', function (e){
	// 		console.log("unload: ", e)
	// 	    timeout = $timeout(function() {
	// 	    	// socket.emit("online", {
	// 		    // 	id: user._id,
	// 		    // 	status: user.status
	// 		    // });
	// 	    }, 0);
	// 	    return "You save some unsaved data, Do you want to leave?";
	// 	});

	// 	function noTimeout() {
	// 		// socket.emit("_disconnect", user._id)
	// 	    clearTimeout(timeout);
	// 	}
		    
	// 	$(window).unload = noTimeout;
	// }

	if (Notification.permission !== "granted") {
		Notification.requestPermission();
	}

	// $(window).blur(function() {
	// 	var notification = new Notification('', {
	// 		icon: 'http://i.imgur.com/Eesst9S.png',
	// 		body: "Sad affleck!",
	// 	});
	// });

	$(window).on("blur", function(){
		$timeout(function() {
			$(".list .item").each(function(i){
				if ($(this).children(".notify").css("display") !== "none"){
					$translate("THERE_IS_A_MESSAGES_FROM").then(function(data) {
						// new Notification('', {
						// 	icon: 'http://i.imgur.com/Eesst9S.png',
						// 	body: data + $scope.friends[i].name + "."
						// });
					})
				}
			})
		}, 0);
	})

	if (user) {
		$scope.user = user;

		$timeout(function() {
			socket.emit("loged in", $scope.user._id);
			socket.on("get friend list", function(list) {
				$timeout(function() {
					$scope.friends = list;
					$scope.friends.forEach(function(item, index){
						if (item.status === "pendding"){
							$scope.sumNoti += 1;
						}
					})

					if (JSON.parse(sessionStorage.getItem("checkChat"))){
						var friend = JSON.parse(sessionStorage.getItem("checkChat"));
						$scope.showFriendToChat(friend.id, friend.name, parseInt(friend.index));
					}else {
						$scope.checkChat = false;		
					}
				}, 0);
			})

			socket.emit("online", {
		    	id: $scope.user._id,
		    	status: $scope.user.status,
		    	email: $scope.user.email
		    });

		    socket.on("offline", function(data){
	    		$("#" + data + " div .status").remove();
	    		$("#" + data + " div").prepend('<div class="status _invisible" style="position: absolute; padding: 0px; margin-top: 7px;"></div>');
		    })

		    socket.on("get user", function(data){
				$timeout(function() {
					data.forEach(function(item, index){
						if ($(".list").find("#" + item.id).length > 0){
							$("#" + item.id + " div .status").remove();
							$("#" + item.id + " div").prepend('<div class="status _' + item.status + '" style="position: absolute; padding: 0px; margin-top: 7px;"></div>');
						}
					})
				}, 250);

				console.log(data);
			});

			socket.on(user._id, function(msg){
		    	$timeout(function() {
		    		$scope.messages.push(JSON.parse(msg))
		    	}, 0);
				console.log($scope.messages)
			});

			socket.on(user._id+"-friends", function(frd){
				$timeout(function() {
					$scope.friends = frd;

					$timeout(function() {
						$scope.friends.forEach(function(item, index){
							if ($(".list").find("#" + item._id).length > 0){
								$("#" + item._id + " div .status").remove();
								$("#" + item._id + " div").prepend('<div class="status _' + item.status + '" style="position: absolute; padding: 0px; margin-top: 7px;"></div>');
							}
						})
					}, 500);

					// socket.emit("online", {
				 //    	id: $scope.user._id,
				 //    	status: $scope.user.status,
				 //    	email: $scope.user.email
				 //    });
				}, 0);
			})

			socket.on("notification"+$scope.user._id, function(data){
				$timeout(function() {
					if (data){
						$scope.sumNoti += 1;
						$scope.friends = data;
					}
				}, 0);
			})
		}, 250);
	}



	$scope.messages = [];

	$scope.send = function(event, content){
		if (event.keyCode === 13 && !event.shiftKey && content !== "" && content !== undefined){
			var data = {
				to: $("#chatbox p").attr("id"),
				from: $scope.user._id,
				email: $scope.user.email,
				message: $("textarea").val(),
				img: $scope.user.avatar,
				time: new Date()
			}
			// socket.emit("chat message", JSON.stringify(data))
			socket.emit("chat message", JSON.stringify(data));
			$scope.messages.push(data);
			$timeout(function(){
				$("textarea").val("");
			}, 0)
		}

	}

	$scope.checkAddEmail = function(){
		if ($scope.af_email === "" || $scope.af_email === null || $scope.af_email === undefined || $scope.af_email === $scope.user.email){
			$scope.checkEmail = true;
		}else {
			$scope.checkEmail = false;
		}
	}

	$scope.addFriend = function(){
		$timeout(function() {
			$http({
			    method: 'POST',
			    url: 'http://127.0.0.1:5000/add',       
			    data: $httpParamSerializer({ 'email': $scope.af_email.toLowerCase(), "myEmail": $scope.user.email }),
			    headers: {
			        'Content-type': 'application/x-www-form-urlencoded'
			    }
			}).then(function successCallback(response) {
			    console.log(response.data)

			    $http({
			    	method: "GET",
			    	url: host + "/getFrendlist?id=" + $scope.user._id
			    }).then(function successCallback(list){
			    	$scope.friends = list.data;
			    }, function errorCallback(err){
			    	console.log(err)
			    })

			    $scope.error = "";
			    $scope.af_email = null;
			    $('#addFriendModal').modal('hide');
			}, function errorCallback(response) {
				if (response.status === 302) {
					$scope.checkEmail = true;
					$scope.error = "YOU HAVE ALREADY SENT A REQUEST TO THIS EMAIL"
				}else if (response.status === 403){
					$scope.checkEmail = true;
					$scope.error = "SORRY, WE COULD NOT FIND THIS EMAIL"
				}
			});
		}, 0);
	}

	$scope.saveSettings = function(){
		console.log($scope.status);
		socket.emit("online", {
	    	id: user._id,
	    	status: $scope.status,
	    	email: user.email
	    });

		$http({
		    method: 'POST',
		    url: 'http://127.0.0.1:5000/update-profile',       
		    data: $httpParamSerializer({ 
		    	id: $scope.user._id,
		    	status: $scope.status,
		    	name: $scope.user.name,
		    	phone: $scope.user.phone
		    }),
		    headers: {
		        'Content-type': 'application/x-www-form-urlencoded'
		    }
		}).then(function successCallback(response) {
		    console.log(response.data)

		    // $http({
		    // 	method: "GET",
		    // 	url: host + "/getFrendlist?id=" + $scope.user._id
		    // }).then(function successCallback(list){
		    // 	$scope.friends = list.data;
		    // }, function errorCallback(err){
		    // 	console.log(err)
		    // })


		    // $('#addFriendModal').modal('hide');
		}, function errorCallback(response) {
		    console.log(response)
		});
	}

	$scope.changeLang = function(key){
		localStorage.setItem("lang", key);
		$translate.refresh();
		$translate.use(key);
	}

	$scope.selectId = function(friend, index) {
		console.log(friend);

		sessionStorage.setItem("checkChat", JSON.stringify({
			check: true,
			id: friend._id,
			name: friend.name,
			index: index
		}))
		// $scope.checkChat = true;

		$scope.showFriendToChat(friend._id, friend.name, index);
	}

	$scope.AcceptOrCancel = function(action, object){
		// alert(state);
		console.log(object);

		$http({
			method: 'POST',
		    url: 'http://127.0.0.1:5000/accept-or-cancel',       
		    data: $httpParamSerializer({ action: action, your_id: $scope.user._id, id: object._id }),
		    headers: {
		        'Content-type': 'application/x-www-form-urlencoded'
		    }
		}).then(function successCallback(response) {
			console.log(response);
		}, function errorCallback(response) {
			console.log(response);
		});
	}

	$scope.logout = function(){
		$window.location.href = "/logout";
	}

	// $scope.open = function() {
	//   if (!Notification) {
	//     alert('Hello World!'); 
	//     return;
	//   }

	//   if (Notification.permission !== "granted")
	//     Notification.requestPermission();

	//   var notification = new Notification('', {
	//     icon: 'http://i.imgur.com/Eesst9S.png',
	//     body: "Sad affleck!",
	//   });

	//   notification.onclick = function () {
	//   	$window.open("http://google.com", "_blank")
	//     notification.close();    
	//   };
	// }

})
