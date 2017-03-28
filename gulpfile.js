var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var special = require('gulp-special-html');
var livereload = require('gulp-livereload');
var opn = require("opn");

gulp.task('sass', function () {
  return gulp.src("./public/css/*scss")
			.pipe(sass.sync().on('error', sass.logError))
    		.pipe(gulp.dest('./public/css'));
});

gulp.task('html', function () {
  return gulp.src("./views/*html")
			.pipe(special())
    		.pipe(gulp.dest('./views'))
});

gulp.task("serve", function(done){
	gulp.watch('./public/css/*scss', ['sass']);
	gulp.watch('./views/*html', ['html']);
	livereload.listen();

	nodemon({
		script: "./app.js",
		ext: "js"
	}).once("start", function(){
		setTimeout(function() {
			opn("http://localhost:5000/");
		}, 1500);
	})
	.on("restart", function(){
		gulp.src("app.js")
			.pipe(livereload());
	})
})