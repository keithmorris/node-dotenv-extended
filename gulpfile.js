/**
 * Created by Keith Morris on 2/9/16.
 */

var
    babel = require('gulp-babel'),
    del = require('del'),
    eslint = require('gulp-eslint'),
    gulp = require('gulp'),
    istanbul = require('gulp-istanbul'),
    mocha = require('gulp-mocha'),
    runSequence = require('run-sequence')
    ;

var options = {
    buildDir: 'lib'
};

gulp.task('clean', [], function () {
    return del([
        options.buildDir,
        'coverage'
    ]);
});

gulp.task('watch', [], function () {
    gulp.watch(['src/**/*.js'], ['build']);
});

gulp.task('lint', [], function () {
    return gulp.src(['src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('mocha', [], function () {
    var old_cwd = process.cwd();
    process.chdir('test');
    return gulp.src(['**/*.spec.js'])
        .pipe(mocha())
        .on('end', function () {
            process.chdir(old_cwd);
        });
});

gulp.task('unittest', ['build'], function (callback) {
    gulp.src([
            'lib/**/*.js'
        ])
        .pipe(istanbul()) // Covering files
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function () {
            var old_cwd = process.cwd();
            process.chdir('test');
            gulp.src([
                    '**/*.spec.js'
                ])
                .pipe(mocha())
                .pipe(istanbul.writeReports({
                    dir: '../coverage',
                    reporters: ['text-summary', 'lcovonly']
                })) // Creating the reports after tests ran
                .pipe(istanbul.enforceThresholds({ thresholds: { global: 80 } })) // Enforce a coverage of at least 80%
                .on('end', function () {
                    process.chdir(old_cwd);
                    callback();
                });
        });
});

gulp.task('babel', [], function () {
    return gulp.src([
            'src/**/*.js'
        ])
        .pipe(babel())
        .pipe(gulp.dest(options.buildDir));
});

gulp.task('build', [], function (callback) {
    runSequence('clean', 'lint', 'babel', callback);
});
