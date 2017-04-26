#!/usr/bin/env node
/**
 * Created by Keith Morris on 4/26/17.
 *
 * This bin script is inspired by and borrows heavily from CrossEnv
 * https://github.com/kentcdodds/cross-env
 */

import  {config} from '..';
import {parseCommand} from './parse-command';
import {spawn} from 'cross-spawn';

function loadAndExecute(args) {
    const [dotEnvConfig, command, commandArgs] = parseCommand(args);
    if (command) {
        const proc = spawn(command, commandArgs, {
            stdio: 'inherit',
            shell: true,
            env: config(dotEnvConfig),
        });

        process.on('SIGTERM', () => proc.kill('SIGTERM'));
        process.on('SIGINT', () => proc.kill('SIGINT'));
        process.on('SIGBREAK', () => proc.kill('SIGBREAK'));
        process.on('SIGHUP', () => proc.kill('SIGHUP'));
        proc.on('exit', process.exit);

        return proc;
    }
}

loadAndExecute(process.argv.slice(2));
