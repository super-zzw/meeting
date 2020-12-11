const pump = require('pump');
const gulp = require('gulp');
const Path = require('path');
const gulpRename = require('gulp-rename');
const gulpSass = require('gulp-sass');
const gulpReplace = require('gulp-replace');
const gulpESLint = require('gulp-eslint');
const gulpAlias = require('gulp-wechat-weapp-src-alisa');
const imagemin = require('gulp-imagemin');
const del = require('del');

const paths = {
  js: ['src/**/*.js'],
  wxml: ['src/**/*.wxml'],
  style: ['src/**/*.scss'],
  json: ['src/**/*.json'],
  images: ['src/**/*.png', 'src/**/*.gif'],
  others: [
    'src/**/*.*',
    '!src/**/*.{js,wxml,json,scss,png}'
  ]
};

const tasks = {
  buildJS: 'build-js',
  buildWXML: 'build-wxml',
  buildScss: 'build-scss',
  buildJSON: 'build-json',
  buildImages: 'build-images',
  copyOthers: 'copy-others'
};

// 引用路径别名配置
const aliasConfig = {
  '@common': joinPath('common'),
  '@components': joinPath('components'),
  '@images': joinPath('images'),
  '@lib': joinPath('lib')
};

gulp.task(tasks.buildImages, (cb) => {
  pump([
    gulp.src(paths.images),
    imagemin({
      progressive: true
    }),
    gulp.dest('dist')
  ], cb);
});

gulp.task(tasks.buildJS, (cb) => {
  pump([
    gulp.src(paths.js),
    gulpAlias(aliasConfig),
    gulpESLint(),
    gulpESLint.format(),
    gulpESLint.failAfterError(),
    gulp.dest('dist')
  ], cb);
});

gulp.task(tasks.buildWXML, (cb) => {
  pump([
    gulp.src(paths.wxml),
    gulpAlias(aliasConfig),
    gulpRename({
      extname: '.wxml'
    }),
    gulp.dest('dist')
  ], cb);
});

gulp.task(tasks.buildScss, (cb) => {
  pump([
    gulp.src(paths.style),
    gulpAlias(aliasConfig),
    gulpSass({
      errLogToConsole: true,
      outputStyle: 'expanded'
    }).on('error', gulpSass.logError),
    gulpRename({ extname: '.wxss' }),
    gulpReplace('.scss', '.wxss'),
    gulp.dest('dist')
  ], cb);
});

gulp.task(tasks.buildJSON, (cb) => {
  pump([
    gulp.src(paths.json),
    gulpAlias(aliasConfig),
    gulp.dest('dist')
  ], cb);
});

gulp.task(tasks.copyOthers, (cb) => {
  pump([
    gulp.src(paths.others),
    gulpAlias(aliasConfig),
    gulp.dest('dist')
  ], cb);
});

gulp.task('clean', () => del(['dist/*']));

gulp.task(
  'build',
  gulp.series(
    'clean',
    gulp.parallel(
      tasks.buildJS,
      tasks.buildWXML,
      tasks.buildScss,
      tasks.buildJSON,
      tasks.buildImages,
      tasks.copyOthers
    )
  )
);

function joinPath(dirname) {
  return Path.join(process.cwd(), 'src', dirname);
}

exports.watch = () => {
  const options = {
    ignoreInitial: false
  };
  gulp.watch(paths.js, options, gulp.series(tasks.buildJS));
  gulp.watch(paths.wxml, options, gulp.series(tasks.buildWXML));
  gulp.watch(paths.style, options, gulp.series(tasks.buildScss));
  gulp.watch(paths.json, options, gulp.series(tasks.buildJSON));
  gulp.watch(paths.images, options, gulp.series(tasks.buildImages));
  gulp.watch(paths.others, options, gulp.series(tasks.copyOthers));
};
