app.controller("LoginCtrl", function($scope, $timeout, $http, $window, $httpParamSerializer){
	console.log(md5("hello"));

	// $scope.email = "huynhtran.dangkhoa@gmail.com";
	$scope.password = "1";

	$scope.submit = function(){
		// $timeout(function() {
		// 	// $("#password").val(md5($("#password").val()));


		// }, 0);
		$scope.email = $scope.email.toLowerCase();
		$scope.password = md5($scope.password);
		$("#submit").submit();
	}
});