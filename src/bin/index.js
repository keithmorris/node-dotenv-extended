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

export function loadAndExecute(args, dependencies = {}) {
    const {
        spawnCommandFn = spawnCommand,
        processOn = process.on.bind(process),
        processExit = process.exit,
    } = dependencies;

    const [dotEnvConfig, command, commandArgs] = parseCommand(args);
    if (command) {
        config(dotEnvConfig); // mutates process.env
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
