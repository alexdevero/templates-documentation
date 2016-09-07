'use strict';

var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    changed = require('gulp-changed'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    gulpCopy = require('gulp-copy'),
    html5Lint = require('gulp-html5-lint'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    gulpUtil = require('gulp-util'),
    pngquant = require('imagemin-pngquant'),
    vinylFtp = require('vinyl-ftp');

// Concatenate JavaScript files
/*gulp.task('concatJS', function() {
  return gulp.src('./src/js/main.js')
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest('./dist/js/'));
});*/

// Deploy files to FTP
gulp.task('deploy', function() {
  var credentials = require('./ftp-credentials.json'),
      destFolder = 'www/public',
      filesGlob = ['./dist/**/*.*'];

  var conn = vinylFtp.create({
    host: '40849.w49.wedos.net',
    user: credentials.username,
    password: credentials.password,
    parallel: 5,
    maxConnections: 10,
    secure: false,
    log: gulpUtil.log
  });

  // base set to './dist/' will copy content of dist folder
  // without the folder itself
  return gulp.src(filesGlob, {
    base: './dist/',
    buffer: false
  })
    .pipe(conn.newer(destFolder))
    .pipe(conn.dest(destFolder));
});

// Minify HTML files
gulp.task('html', function() {
  return gulp.src('src/*.html')
    .pipe(changed('dist'))
    //.pipe(html5Lint())
    .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
    .pipe(gulp.dest('dist'))
});

// Cooy CSS files
gulp.task('copyCSS', function() {
  return gulp.src('src/css/*')
    .pipe(changed('dist/css'))
    .pipe(gulp.dest('dist/css'));
});

// Copy font files
gulp.task('copyFonts', function() {
  return gulp.src('src/fonts/*')
    .pipe(changed('dist/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

// Copy JS plugins files
gulp.task('copyJSPlug', function() {
  return gulp.src(['src/js/plugins/*', '!src/js/plugins/*.rar'])
    .pipe(changed('dist/js/plugins/'))
    .pipe(gulp.dest('dist/js/plugins/'));
});

// Copy JS vendor files
gulp.task('copyJSVen', function() {
  return gulp.src(['src/js/vendor/*', '!src/js/vendor/*.rar'])
    .pipe(changed('dist/js/vendor/'))
    .pipe(gulp.dest('dist/js/vendor/'));
});

// Copy other files
gulp.task('copyOther', function() {
  return gulp.src([
    'src/humans.txt',
    'src/robots.txt'
  ])
    .pipe(changed('dist'))
    .pipe(gulp.dest('dist'));
});

// Automate copying
gulp.task('copyAll', ['copyCSS', 'copyFonts', 'copyJSPlug', 'copyJSVen', 'copyOther'], function() {});

// Clean up dist directory
gulp.task('clean', function() {
  return gulp.src('dist', {read : false})
    .pipe(clean());
});

// Compress images
gulp.task('images', function () {
  return gulp.src(['src/images/**/*', '!src/images/**/*.rar'])
    .pipe(changed('dist/images'))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('dist/images'));
});

// Sass to CSS
gulp.task('sass', function() {
  return gulp.src('src/scss/main.scss')
    //.pipe(changed('dist/css', {extension: '.css'}))
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', function(e) {
      console.log(e + '\r\n There\'s something wrong with the Sass file(s).')
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'));
});

// Minify JavaScript files
gulp.task('js', function() {
  return gulp.src('src/js/main.js')
    .pipe(changed('dist/js'))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify().on('error', function(e) {
      console.log(e + '\r\n There\'s something wrong with the JavaScript file(s).')
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/js'));
});

// Watch HTML, CSS and JavaScript files
gulp.task('watch', function() {
  gulp.watch('src/*.html', ['html']);
  gulp.watch('src/*.php', ['copyOther']);
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/css/**/*.css', ['copyCSS']);
  gulp.watch('src/js/main.js', ['js']);
});

// Automate tasks (cmd: gulp)
gulp.task('default', ['minHTML', 'copyAll', 'images', 'sass', 'minJS'], function() {});
