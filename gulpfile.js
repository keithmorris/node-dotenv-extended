/**
 * Created by Keith Morris on 2/9/16.
 */

var
    babel = require('gulp-babel'),
    del = require('del'),
    eslint = require('gulp-eslint'),
    gulp = require('gulp')
    ;

var options = {
    buildDir: 'lib'
};

gulp.task('clean', gulp.series(function () {
    return del([
        options.buildDir,
        'coverage'
    ]);
}));

gulp.task('watch', gulp.series(function () {
    gulp.watch(['src/**/*.js'], ['build']);
}));

gulp.task('lint', gulp.series(function () {
    return gulp.src(['src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}));

gulp.task('babel', gulp.series(function () {
    return gulp.src([
        'src/**/*.js'
    ])
        .pipe(babel())
        .pipe(gulp.dest(options.buildDir));
}));

gulp.task('build', gulp.series(['clean', 'lint', 'babel'], function (callback) {
    callback();
}));
