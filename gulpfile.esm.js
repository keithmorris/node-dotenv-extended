/**
 * Created by Keith Morris on 2/9/16.
 */
import babel from 'gulp-babel';
import del from 'del';
import eslint from 'gulp-eslint';
import gulp from 'gulp';

const options = {
    buildDir: 'lib'
};

export const clean = () => del([
    options.buildDir,
    'coverage',
    '.nyc_output'
]);

export const watch = () => {
    gulp.watch(['src/**/*.js'], gulp.series([build]));
};

export const lint = () => gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

export const scripts = () => gulp.src(['src/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest(options.buildDir));

export const build = gulp.series([clean, lint, scripts]);

export default build;
