// generated on 2018-01-20 using generator-chrome-extension 0.7.0
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import {stream as wiredep} from 'wiredep';
import uglify from 'gulp-uglify-es';
import webpack from 'webpack-stream';

const $ = gulpLoadPlugins();

const PATH_SCRIPTS_ORIGIN = 'app/scripts.babel';
const PATH_SCRIPTS_TRANSPILED = 'app/scripts.module';
const PATH_SCRIPTS_PACKED = 'app/scripts';

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    `!${PATH_SCRIPTS_ORIGIN}`,
    `!${PATH_SCRIPTS_TRANSPILED}`,
    '!app/*.json',
    '!app/*.html',
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('lint', () => {
  return gulp.src(`${PATH_SCRIPTS_ORIGIN}/**/*.js`)
    .pipe($.eslint())
    .pipe($.eslint.format());
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('html',  () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.sourcemaps.init())
    .pipe($.if('*.js', uglify()))
    .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
    .pipe($.sourcemaps.write())
    .pipe($.if('*.html', $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      buildnumber: true,
      background: {
        target: 'scripts/background.js',
        exclude: [
          'scripts/chromereload.js'
        ]
      }
  }))
  .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
  .pipe($.if('*.js', $.sourcemaps.init()))
  .pipe($.if('*.js', uglify()))
  .pipe($.if('*.js', $.sourcemaps.write('.')))
  .pipe(gulp.dest('dist'));
});

gulp.task('babel', () => {
  return gulp.src(`${PATH_SCRIPTS_ORIGIN}/**/*.js`)
      .pipe($.babel({
        presets: ['es2015']
      }))
      .pipe(gulp.dest(PATH_SCRIPTS_TRANSPILED));
});

gulp.task('webpack', () => {
  const config = require('./webpack.config');
  return gulp.src(`${PATH_SCRIPTS_TRANSPILED}/**/*.js`)
    .pipe(webpack(config))
    .pipe(gulp.dest(PATH_SCRIPTS_PACKED));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('lint-babel-webpack', cb => {
  return runSequence('lint', 'babel', 'webpack', cb);
});

gulp.task('watch', ['lint-babel-webpack'], () => {
  $.livereload.listen();

  gulp.watch([
    'app/*.html',
    `${PATH_SCRIPTS_PACKED}/**/*.js`,
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json'
  ]).on('change', $.livereload.reload);

  gulp.watch(`${PATH_SCRIPTS_ORIGIN}/**/*.js`, ['lint-babel-webpack']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('size', () => {
  return gulp.src('dist/**/*')
    .pipe($.size({
      title: 'build',
      gzip: true
    }));
});

gulp.task('wiredep', () => {
  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('package', () => {
  const manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
      .pipe($.zip('direct_helper-' + manifest.version + '.zip'))
      .pipe(gulp.dest('package'));
});

gulp.task('build', cb => {
  runSequence(
    'lint-babel-webpack', 'chromeManifest',
    ['html', 'images', 'extras'],
    'size', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});
