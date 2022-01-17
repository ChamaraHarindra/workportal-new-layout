// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require("gulp");
// Importing all the Gulp-related packages we want to use
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const changed = require("gulp-changed");
const terser = require("gulp-terser");
const postcss = require("gulp-postcss");
const del = require("del");
const imagemin = require("gulp-imagemin");
const noop = require("gulp-noop");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const replace = require("gulp-replace");
const njk = require("gulp-nunjucks-render");
const beautify = require("gulp-beautify");
const browsersync = require("browser-sync").create();
const data = require("gulp-data");

// File paths
const files = {
  scssPath: "src/styles/**/*.scss",
  jsPath: "src/scripts/**/*.js",
  mediaPath: "src/media/**/*.+(gif|jpg|jpeg|png|svg|mp4)",
  viewsRootPath: "src/views",
  viewsPath: "src/views/pages/**/*.+(html|njk|nunjucks)",
  outputRootPath: {
    styles: "dist/styles",
    scripts: "dist/scripts",
    media: "dist/media/**/*.+(gif|jpg|jpeg|png|svg|mp4)",
  },
};

// Sass task: compiles the style.scss file into style.css
function scssTask() {
  return src(files.scssPath, { sourcemaps: true }) // set source and turn on sourcemaps
    .pipe(sass()) // compile SCSS to CSS
    .pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins
    .pipe(dest(files.outputRootPath.styles, { sourcemaps: "." })); // put final CSS in dist folder with sourcemap
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask() {
  return src(
    [
      files.jsPath,
      //,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
    ],
    { sourcemaps: true }
  )
    .pipe(concat("all.js"))
    .pipe(terser())
    .pipe(dest(files.outputRootPath.scripts, { sourcemaps: "." }));
}

// media

function media() {
  return (
    src(files.mediaPath)
      // Production: Do nothing.
      // Development: Pipe only changed files to the next process.
      .pipe(changed(files.outputRootPath.media))
      .pipe(imagemin())
      // Output.
      .pipe(dest("dist/media"))
  );
}

function mediaBuild() {
  return (
    src(files.mediaPath)
      // Production: Do nothing.
      // Development: Pipe only changed files to the next process.
      .pipe(changed(files.outputRootPath.media))
      .pipe(imagemin())
      // Output.
      .pipe(dest("dist/media"))
  );
}

// compile nunjucks files

function html() {
  return src(files.viewsPath)
    .pipe(
      njk({
        path: [files.viewsRootPath],
        data: {
          paths: {
            root: "/",
            scripts: "/scripts",
            styles: "/styles",
            media: "/media",
          },
        },
      })
    )
    .pipe(
      data(function () {
        return require(`./${files.viewsRootPath}/data.json`);
      })
    )
    .pipe(beautify.html({ indent_size: 4, preserve_newlines: false }))
    .pipe(dest("dist"));
}

// Cachebust
function cacheBustTask() {
  var cbString = new Date().getTime();
  return src([files.viewsPath])
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(dest("."));
}

// Browsersync to spin up a local server
function browserSyncServe(cb) {
  // initializes browsersync server
  browsersync.init({
    server: {
      baseDir: "dist",
    },
    notify: {
      styles: {
        top: "auto",
        bottom: "0",
      },
    },
  });
  cb();
}
function browserSyncReload(cb) {
  // reloads browsersync server
  browsersync.reload();
  cb();
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
  watch(
    [files.scssPath, files.jsPath, files.viewsRootPath, files.mediaPath],
    series(
      parallel(scssTask, jsTask, html),
      media,
      cacheBustTask,
      browserSyncReload
    )
  );
}

function clean() {
  return del(["dist"]);
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
  clean,
  parallel(scssTask, jsTask, html),
  cacheBustTask,
  browserSyncServe,
  watchTask
);

// Runs all of the above but also spins up a local Browsersync server
// Run by typing in "gulp bs" on the command line
exports.build = series(
  clean,
  parallel(scssTask, jsTask, html),
  mediaBuild,
  cacheBustTask
);
