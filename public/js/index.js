var host = "http://127.0.0.1:5000"

// if (localStorage.getItem("lang") !== "en" && localStorage.getItem("lang") !== "vi"){
//   localStorage.setItem("lang", "en")
// }

function reSize() {
	var w = $(".friendslist").css("width");
	if (w === "80px"){
		$(".chatlist").css("width", "calc(100% - 80px)");
	}else if (w === "320px") {
		$(".chatlist").css("width", "calc(100% - 320px)");
	}else {
		$(".chatlist").css("width", "calc(100% - "+w+")");
	}
}

$(document).ready(function(){
	setTimeout(function() {
    reSize();
  }, 150);
})

$(window).resize(function(){
	reSize();
})


// socket.on("get user", function(data){
// // $scope.online = data;
//   // $timeout(function() {
//   //  $scope.friends.push({
//   //    name: "test",
//   //    email: data.id
//   //  })
//   // }, 200);
//   data.forEach(function(item, index){
//     try {
//       $("#" + item.id + " div ._invisible").remove();
//       $("#" + item.id + " div").prepend('<div class="status _online" style="position: absolute; padding: 0px; margin-top: 7px;"></div>');
//       console.log($("#"+item.id))
//     }catch(e){

//     }
    
//     // console.log()
//   })
  
//   console.log(data);
// })

var app = angular.module("myApp", ["pascalprecht.translate"])
.directive('schrollBottom', function () {
  return {
    scope: {
      schrollBottom: "="
    },
    link: function (scope, element) {
      scope.$watchCollection('schrollBottom', function (newValue) {
        if (newValue)
        {
          $(element).scrollTop($(element)[0].scrollHeight);
        }
      });
    }
  }
})
.config(function ($translateProvider) {
  $translateProvider.useStaticFilesLoader({
    prefix: 'locales/locale-',
    suffix: '.json'
  });
  // $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
  if (localStorage.getItem("lang") === "vi") {
    $translateProvider.preferredLanguage("vi");
  }else {
    $translateProvider.preferredLanguage("en");
    localStorage.setItem("lang", "en");
  }
  
  $translateProvider.forceAsyncReload(true);
})

var socket = io("http://localhost:5000/");
// console.log(user)
socket.emit("login", JSON.stringify(user));