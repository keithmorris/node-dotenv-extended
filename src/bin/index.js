#!/usr/bin/env node
/**
 * Created by Keith Morris on 4/26/17.
 *
 * This bin script is inspired by and borrows heavily from CrossEnv
 * https://github.com/kentcdodds/cross-env
 */

import { config } from '..';
import parseCommand from '../utils/parse-command';
import { spawn } from 'node:child_process';

export const spawnCommand = (command, commandArgs, options) => spawn(command, commandArgs, options);
export const writeStdout = (value) => process.stdout.write(value);
export const writeStderr = (value) => process.stderr.write(value);

const toDotenvString = (values) =>
    Object.keys(values)
        .map((key) => `${key}=${values[key]}`)
        .join('\n');

export function loadAndExecute(args, dependencies = {}) {
    const {
        spawnCommandFn = spawnCommand,
        processOn = process.on.bind(process),
        processExit = process.exit,
        writeStdoutFn = writeStdout,
        writeStderrFn = writeStderr,
    } = dependencies;

    const [dotEnvConfig, command, commandArgs] = parseCommand(args);
    const { print, ...configOptions } = dotEnvConfig;

    if (print && command) {
        writeStderrFn('dotenv-extended: --print mode cannot be combined with command execution.\n');
        processExit(1);
        return;
    }

    if (print) {
        const mergedConfig = config({
            ...configOptions,
            assignToProcessEnv: false,
            includeProcessEnv: false,
        });
        const format = typeof print === 'string' ? print.toLowerCase() : 'json';
        if (format === 'dotenv') {
            writeStdoutFn(`${toDotenvString(mergedConfig)}\n`);
            return mergedConfig;
        }

        writeStdoutFn(`${JSON.stringify(mergedConfig, null, 2)}\n`);
        return mergedConfig;
    }

    if (command) {
        config(configOptions); // mutates process.env
        const proc = spawnCommandFn(command, commandArgs, {
            stdio: 'inherit',
            shell: true,
            env: process.env,
        });

        processOn('SIGTERM', () => proc.kill('SIGTERM'));
        processOn('SIGINT', () => proc.kill('SIGINT'));
        processOn('SIGBREAK', () => proc.kill('SIGBREAK'));
        processOn('SIGHUP', () => proc.kill('SIGHUP'));
        proc.on('exit', processExit);

        return proc;
    }
}
