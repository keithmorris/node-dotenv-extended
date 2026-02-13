/**
 * Created by Keith Morris on 2/9/16.
 */
import babel from 'gulp-babel';
import del from 'del';
import eslint from 'gulp-eslint';
import { src, dest, series, watch } from 'gulp';

const options = {
    buildDir: 'lib',
};

export const clean = () => del([options.buildDir, 'coverage', '.nyc_output']);

const watchFiles = () => {
    watch(['src/**/*.js'], series([build]));
};
export { watchFiles as watch };

export const lint = () =>
    src(['src/**/*.js']).pipe(eslint()).pipe(eslint.format()).pipe(eslint.failAfterError());

export const scripts = () => src(['src/**/*.js']).pipe(babel()).pipe(dest(options.buildDir));

export const build = series([clean, lint, scripts]);

export default build;
