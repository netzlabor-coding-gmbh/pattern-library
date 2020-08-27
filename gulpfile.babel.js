import gulp from "gulp";
import sass from "gulp-sass";
import browserSync from "browser-sync";
import concat from "gulp-concat";
import uglify from "gulp-uglify-es";
import cleancss from "gulp-clean-css";
import rename from "gulp-rename";
import autoprefixer from "gulp-autoprefixer";
import bourbon from "node-bourbon";
import notify from "gulp-notify";
import sourcemaps from "gulp-sourcemaps";
import plumber from "gulp-plumber";
import pump from "pump";
import webpackStream from "webpack-stream";
import pug from "gulp-pug";

const compileStyle = () => {
  return gulp
    .src("src/sass/**/*.s*")
    .pipe(sourcemaps.init())
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "SCSS",
            message: err.message,
          };
        }),
      })
    )
    .pipe(
      sass({
        includePaths: bourbon.includePaths,
      })
    )
    .pipe(
      rename({
        basename: "styles",
        suffix: ".min",
        prefix: "",
      })
    )
    .pipe(autoprefixer(["last 15 versions"]))
    .pipe(cleancss())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("src/css"))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );
};

const compileScriptWebpack = (cb) => {
  pump(
    [
      gulp.src(["src/js/main.js"]),
      webpackStream({
        mode: "development",
        devtool: "inline-source-map",
        output: {
          filename: "app.js",
        },
        module: {
          rules: [
            {
              test: /\.(js)$/,
              //exclude: /(node_modules)/,
              exclude: /(node_modules\/(?!(dom7|ssr-window|swiper)\/).*)/,
              loader: "babel-loader",
              query: {
                presets: ["@babel/env"],
              },
            },
          ],
        },
      }),
      concat("scripts.min.js"),
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "Webpack",
            message: err.message,
          };
        }),
      }),
      gulp.dest("src/js"),
      browserSync.reload({
        stream: true,
      }),
    ],
    cb
  );
};

const compileScriptWebpackProd = (cb) => {
  pump(
    [
      gulp.src(["src/js/main.js"]),
      webpackStream({
        mode: "production",
        // devtool: 'source-map',
        output: {
          filename: "app.js",
        },
        module: {
          rules: [
            {
              test: /\.(js)$/,
              exclude: /(node_modules\/(?!(dom7|ssr-window|swiper)\/).*)/,
              loader: "babel-loader",
              query: {
                presets: ["@babel/env"],
              },
            },
          ],
        },
      }),
      concat("scripts.min.js"),
      plumber(),
      uglify(),
      gulp.dest("src/js"),
      browserSync.reload({
        stream: true,
      }),
    ],
    cb
  );
};

const compileMarkup = (done) => {
  browserSync.reload();
  done();
};

const compilePug = (done) => {
  gulp
    .src(["src/pug/**/!(_)*.pug"])
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "PUG",
            message: err.message,
          };
        }),
      })
    )
    .pipe(
      pug({
        pretty: "\t",
      })
    )
    .pipe(gulp.dest("src/html"))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );
  done();
};

const buildTask = (done) => {
  gulp.src(["src/html/*.html"]).pipe(gulp.dest("../../../Public/html"));
  gulp.src(["src/*.html"]).pipe(gulp.dest("../../../Public"));
  gulp.src(["src/css/*.css"]).pipe(gulp.dest("../../../Public/css"));
  gulp.src(["src/css/*.map"]).pipe(gulp.dest("../../../Public/css"));
  gulp.src(["src/fonts/**/*"]).pipe(gulp.dest("../../../Public/fonts"));
  gulp.src(["src/js/scripts.min.js"]).pipe(gulp.dest("../../../Public/js"));
  gulp.src(["src/images/**/*"]).pipe(gulp.dest("../../../Public/images"));
  done();
};

const watchStyle = () => {
  gulp.watch("src/sass/**/*.s*", compileStyle);
};

const watchScript = () => {
  gulp.watch(["src/js/main.js", "src/js/components/*.js", "src/js/utils/*.js"], compileScriptWebpack);
};

const watchMarkup = () => {
  gulp.watch("src/html/*.*", compileMarkup);
};

const watchPug = () => {
  gulp.watch("src/pug/**/*.pug", compilePug);
};

const compile = gulp.parallel(compilePug, compileStyle, compileScriptWebpack, compileMarkup);

const compileProd = gulp.parallel(compilePug, compileStyle, compileScriptWebpackProd);

const startServer = () => {
  browserSync({
    server: {
      baseDir: "./src",
    },
    notify: false,
    tunnel: false,
  });
};

const build = gulp.series(compileProd, buildTask);

const serve = gulp.series(compile, startServer);

const watch = gulp.parallel(watchPug, watchStyle, watchScript, watchMarkup);

const defaultTasks = gulp.parallel(serve, watch);

exports.build = build;

exports.default = defaultTasks;
