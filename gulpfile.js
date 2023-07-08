const { src, dest, watch, parallel, series } = require("gulp")
const scss = require("gulp-sass")(require("sass"));
const concat = require('gulp-concat')
const terser = require('gulp-terser');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

function styles() {
    return src('app/scss/style.scss')
    .pipe(concat("style.min.css"))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(autoprefixer({overrideBrowserslist:['last 5 version']}))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function scripts() {
    return src(['app/js/index.js'])
    .pipe(terser())
    .pipe(concat("index.min.js"))
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function images() {
    return src(['app/images/src/*.*', '!app/images/src/*.svg'])
    .pipe(newer('app/images/dist'))
    .pipe(avif({quality: 50}))

    .pipe(src(['app/images/src/*.*']))
    .pipe(newer('app/images/dist'))
    .pipe(webp())
    
    .pipe(src(['app/images/src/*.*']))
    .pipe(newer('app/images/dist'))
    .pipe(imagemin())

    .pipe(dest('app/images/dist'))
}

function watching() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
watch(['app/js/index.js'], scripts)
watch(['app/scss/style.scss'], styles)
watch(['app/images/src'], images)
watch(['app/*.html']).on('change', browserSync.reload);
}


function building() {
    return src([
        'app/js/*.min.js',
        'app/css/*.min.css',
        'app/*.html'

    ], {base: 'app'})
    .pipe(dest('dist'))
}

function cleanDist() {
    return src('dist', {read: false})
        .pipe(clean());
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.images = images;


exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, watching);