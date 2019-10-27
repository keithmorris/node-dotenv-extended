/**
 * Created by Keith Morris on 2/9/16.
 */
const
    babel = require('gulp-babel'),
    del = require('del'),
    eslint = require('gulp-eslint'),
    gulp = require('gulp')
;

const options = {
    buildDir: 'lib'
};

const cleanTask = () => del([
    options.buildDir,
    'coverage',
    '.nyc_output'
]);

const watchTask = () => {
    gulp.watch(['src/**/*.js'], ['build']);
};

const lintTask = () => gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

const babelTask = () => gulp.src(['src/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest(options.buildDir));


gulp.task('clean', cleanTask);
gulp.task('watch', watchTask);
gulp.task('lint', lintTask);
gulp.task('babel', babelTask);

gulp.task('build', gulp.series(['clean', 'lint', 'babel'], callback => {
    callback();
}));
