import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import dotenvex from '../src/index';
import * as cli from '../src/bin/index';
import getConfigFromEnv from '../src/utils/config-from-env';
import normalizeOptionKey from '../src/utils/normalize-option-key';
import parseCommand from '../src/utils/parse-command';
import parsePrimitive from '../src/utils/parse-primitive';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixture = (name) => path.join(__dirname, name);

const resetEnvKeys = () => {
    delete process.env.TEST_ONE;
    delete process.env.TEST_TWO;
    delete process.env.TEST_THREE;

    delete process.env.DOTENV_CONFIG_ENCODING;
    delete process.env.DOTENV_CONFIG_SILENT;
    delete process.env.DOTENV_CONFIG_PATH;
    delete process.env.DOTENV_CONFIG_DEFAULTS;
    delete process.env.DOTENV_CONFIG_SCHEMA;
    delete process.env.DOTENV_CONFIG_ERROR_ON_MISSING;
    delete process.env.DOTENV_CONFIG_ERROR_ON_EXTRA;
    delete process.env.DOTENV_CONFIG_ERROR_ON_REGEX;
    delete process.env.DOTENV_CONFIG_ERROR_ON_MISSING_FILES;
    delete process.env.DOTENV_CONFIG_INCLUDE_PROCESS_ENV;
    delete process.env.DOTENV_CONFIG_SCHEMA_EXTENDS;
    delete process.env.DOTENV_CONFIG_RETURN_SCHEMA_ONLY;
    delete process.env.DOTENV_CONFIG_INCLUDED_PROCESS_ENV;
    delete process.env.DOTENV_CONFIG_ASSIGN_TO_PROCESS_ENV;
    delete process.env.DOTENV_CONFIG_OVERRIDE_PROCESS_ENV;
};

describe('dotenv-extended public API', () => {
    beforeEach(() => {
        resetEnvKeys();
    });

    it('does not override existing process.env values by default', () => {
        process.env.TEST_ONE = 'original';

        dotenvex.load({
            path: fixture('.env'),
            defaults: fixture('.env.defaults.example'),
        });

        expect(process.env.TEST_ONE).toBe('original');
    });

    it('overrides process.env values when overrideProcessEnv is true', () => {
        process.env.TEST_ONE = 'original';

        dotenvex.load({
            path: fixture('.env'),
            defaults: fixture('.env.defaults.example'),
            overrideProcessEnv: true,
        });

        expect(process.env.TEST_ONE).toBe('overridden');
    });

    it('loads options from DOTENV_CONFIG_* environment variables', () => {
        process.env.TEST_ONE = 'original';
        process.env.DOTENV_CONFIG_PATH = fixture('.env.override');
        process.env.DOTENV_CONFIG_SCHEMA = fixture('.env.schema.example');
        process.env.DOTENV_CONFIG_OVERRIDE_PROCESS_ENV = 'true';

        dotenvex.load();
        expect(process.env.TEST_ONE).toBe('one overridden');
    });

    it('throws when schema keys are missing and errorOnMissing is true', () => {
        const runTest = () =>
            dotenvex.load({
                schema: fixture('.env.schema.example'),
                defaults: fixture('.env.defaults.example'),
                path: fixture('.env.missing'),
                errorOnMissing: true,
            });

        expect(runTest).toThrow(Error);
    });

    it('throws when extra keys are present and errorOnExtra is true', () => {
        const runTest = () =>
            dotenvex.load({
                schema: fixture('.env.schema.example'),
                defaults: fixture('.env.defaults.example'),
                path: fixture('.env.extra'),
                errorOnExtra: true,
            });

        expect(runTest).toThrow(Error);
    });

    it('includes process.env for schema checks when includeProcessEnv is true', () => {
        process.env.TEST_TWO = 'two';
        process.env.TEST_THREE = 'three';

        dotenvex.load({
            schema: fixture('.env.schema.example'),
            includeProcessEnv: true,
            assignToProcessEnv: false,
        });

        expect(process.env.TEST_TWO).toBe('two');
    });

    it('loads schema/defaults/env in expected precedence order', () => {
        const config = dotenvex.load({
            schema: fixture('.env.schema.example'),
            defaults: fixture('.env.defaults.example'),
            path: fixture('.env.override'),
            errorOnExtra: true,
            errorOnMissing: true,
        });

        expect(config).toMatchObject({
            TEST_ONE: 'one overridden',
            TEST_TWO: 'two',
            TEST_THREE: 'three',
        });
        expect(process.env.TEST_ONE).toBe('one overridden');
        expect(process.env.TEST_TWO).toBe('two');
        expect(process.env.TEST_THREE).toBe('three');
    });

    it('does not mutate process.env when assignToProcessEnv is false', () => {
        const config = dotenvex.load({
            schema: fixture('.env.schema.example'),
            defaults: fixture('.env.defaults.example'),
            path: fixture('.env.override'),
            errorOnExtra: true,
            errorOnMissing: true,
            assignToProcessEnv: false,
        });

        expect(config).toMatchObject({
            TEST_ONE: 'one overridden',
            TEST_TWO: 'two',
            TEST_THREE: 'three',
        });
        expect(process.env.TEST_ONE).toBeUndefined();
        expect(process.env.TEST_TWO).toBeUndefined();
        expect(process.env.TEST_THREE).toBeUndefined();
    });

    it('passes regex validation when values match schema patterns', () => {
        const runTest = () =>
            dotenvex.load({
                schema: fixture('.env.schema.regex'),
                path: fixture('.env.override'),
                errorOnRegex: true,
            });

        expect(runTest).not.toThrow();
    });

    it('throws SyntaxError for invalid schema regex when errorOnRegex is true', () => {
        const runTest = () =>
            dotenvex.load({
                schema: fixture('.env.schema.regex-invalid'),
                errorOnRegex: true,
            });

        expect(runTest).toThrow(SyntaxError);
    });

    it('does not throw SyntaxError for invalid schema regex when errorOnRegex is false', () => {
        const runTest = () =>
            dotenvex.load({
                schema: fixture('.env.schema.regex-invalid'),
                errorOnRegex: false,
            });

        expect(runTest).not.toThrow(SyntaxError);
    });

    it('throws regex mismatch when values fail schema patterns', () => {
        process.env.TEST_TWO = 'string with whitespace';
        process.env.TEST_THREE = '';

        const runTest = () =>
            dotenvex.load({
                schema: fixture('.env.schema.regex'),
                path: fixture('.env.override'),
                includeProcessEnv: true,
                errorOnRegex: true,
            });

        expect(runTest).toThrow('REGEX MISMATCH: TEST_TWO, TEST_THREE');
    });

    it('treats missing values as empty string for regex-required checks', () => {
        const runTest = () =>
            dotenvex.load({
                schema: fixture('.env.schema.regex-optional'),
                errorOnRegex: true,
            });

        expect(runTest).toThrow(/TEST_MISSING_REQUIRED/);
    });

    it('logs missing file errors when silent is false', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

        dotenvex.load({
            path: fixture('.env'),
            defaults: fixture('.env.this-file-does-not-exist'),
            silent: false,
        });

        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });

    it('throws when a configured file is missing and errorOnMissingFiles is true', () => {
        const runTest = () =>
            dotenvex.load({
                path: fixture('.env.this-file-does-not-exist'),
                errorOnMissingFiles: true,
            });

        expect(runTest).toThrow('MISSING CONFIG FILE:');
    });

    it('supports DOTENV_CONFIG_ERROR_ON_MISSING_FILES from environment', () => {
        process.env.DOTENV_CONFIG_PATH = fixture('.env.this-file-does-not-exist');
        process.env.DOTENV_CONFIG_ERROR_ON_MISSING_FILES = 'true';

        const runTest = () => dotenvex.load();
        expect(runTest).toThrow('MISSING CONFIG FILE:');
    });

    it('returns only schema keys when returnSchemaOnly is true', () => {
        const config = dotenvex.load({
            schema: fixture('.env.schema.example'),
            defaults: fixture('.env.defaults.example'),
            path: fixture('.env.override'),
            includeProcessEnv: true,
            returnSchemaOnly: true,
            assignToProcessEnv: false,
        });

        expect(config).toEqual({
            TEST_ONE: 'one overridden',
            TEST_TWO: 'two',
            TEST_THREE: 'three',
        });
        expect(config.PATH).toBeUndefined();
        expect(config.TERM).toBeUndefined();
    });

    it('supports DOTENV_CONFIG_RETURN_SCHEMA_ONLY from environment', () => {
        process.env.DOTENV_CONFIG_SCHEMA = fixture('.env.schema.example');
        process.env.DOTENV_CONFIG_DEFAULTS = fixture('.env.defaults.example');
        process.env.DOTENV_CONFIG_PATH = fixture('.env.override');
        process.env.DOTENV_CONFIG_INCLUDE_PROCESS_ENV = 'true';
        process.env.DOTENV_CONFIG_RETURN_SCHEMA_ONLY = 'true';

        const config = dotenvex.load({ assignToProcessEnv: false });
        expect(config).toEqual({
            TEST_ONE: 'one overridden',
            TEST_TWO: 'two',
            TEST_THREE: 'three',
        });
    });

    it('supports schemaExtends as a single path', () => {
        const runTest = () =>
            dotenvex.load({
                schema: fixture('.env.schema.example'),
                schemaExtends: fixture('.env.schema.extend-four'),
                path: fixture('.env.extra'),
                errorOnExtra: true,
                assignToProcessEnv: false,
            });

        expect(runTest).not.toThrow();
        expect(runTest()).toMatchObject({
            TEST_ONE: 'one',
            TEST_TWO: 'two',
            TEST_THREE: 'three',
            TEST_FOUR: 'four',
        });
    });

    it('supports schemaExtends as layered array with last wins', () => {
        const runTest = () =>
            dotenvex.load({
                schema: fixture('.env.schema.regex'),
                schemaExtends: [
                    fixture('.env.schema.extend-regex-strict'),
                    fixture('.env.schema.extend-regex-pass'),
                ],
                path: fixture('.env.override'),
                errorOnRegex: true,
                assignToProcessEnv: false,
            });

        expect(runTest).not.toThrow();
    });

    it('supports DOTENV_CONFIG_SCHEMA_EXTENDS from environment', () => {
        process.env.DOTENV_CONFIG_SCHEMA = fixture('.env.schema.example');
        process.env.DOTENV_CONFIG_SCHEMA_EXTENDS = fixture('.env.schema.extend-four');
        process.env.DOTENV_CONFIG_PATH = fixture('.env.extra');
        process.env.DOTENV_CONFIG_ERROR_ON_EXTRA = 'true';

        const runTest = () => dotenvex.load({ assignToProcessEnv: false });
        expect(runTest).not.toThrow();
        expect(runTest()).toMatchObject({
            TEST_ONE: 'one',
            TEST_TWO: 'two',
            TEST_THREE: 'three',
            TEST_FOUR: 'four',
        });
    });

    it('ignores unsupported schemaExtends value types', () => {
        const runTest = () =>
            dotenvex.load({
                schema: fixture('.env.schema.example'),
                schemaExtends: 123,
                path: fixture('.env.override'),
                errorOnRegex: true,
                assignToProcessEnv: false,
            });

        expect(runTest).not.toThrow();
        expect(runTest()).toEqual({
            TEST_ONE: 'one overridden',
            TEST_TWO: 'two',
            TEST_THREE: 'three',
        });
    });
});

describe('supporting parser utilities', () => {
    beforeEach(() => {
        resetEnvKeys();
    });

    it('parseCommand parses dotenv options and command args', () => {
        const parsed = parseCommand([
            '--encoding=utf8',
            '--silent=true',
            '--path=test/.env.override',
            '--defaults=test/.env.defaults.example',
            '--schema=test/.env.schema.example',
            '--error-on-missing=false',
            '--error-on-extra=false',
            '--error-on-regex=false',
            '--assignToProcessEnv=true',
            '--overrideProcessEnv=false',
            'testing.sh',
            '--jump',
            '--dive=true',
            'I was here',
        ]);

        expect(parsed[0]).toEqual({
            encoding: 'utf8',
            silent: true,
            path: 'test/.env.override',
            defaults: 'test/.env.defaults.example',
            schema: 'test/.env.schema.example',
            errorOnMissing: false,
            errorOnExtra: false,
            errorOnRegex: false,
            assignToProcessEnv: true,
            overrideProcessEnv: false,
        });
        expect(parsed[1]).toBe('testing.sh');
        expect(parsed[2]).toEqual(['--jump', '--dive=true', 'I was here']);
    });

    it('parseCommand supports standalone --print flag', () => {
        const parsed = parseCommand(['--print']);
        expect(parsed[0]).toEqual({ print: true });
        expect(parsed[1]).toBeNull();
        expect(parsed[2]).toEqual([]);
    });

    it('parseCommand supports --print=<format> option', () => {
        const parsed = parseCommand(['--print=dotenv']);
        expect(parsed[0]).toEqual({ print: 'dotenv' });
        expect(parsed[1]).toBeNull();
        expect(parsed[2]).toEqual([]);
    });

    it('getConfigFromEnv parses environment option values', () => {
        process.env.DOTENV_CONFIG_ENCODING = 'utf8';
        process.env.DOTENV_CONFIG_SILENT = 'true';
        process.env.DOTENV_CONFIG_PATH = '.env';
        process.env.DOTENV_CONFIG_DEFAULTS = '.env.defaults';
        process.env.DOTENV_CONFIG_SCHEMA = '.env.schema';
        process.env.DOTENV_CONFIG_ERROR_ON_MISSING = 'false';
        process.env.DOTENV_CONFIG_ERROR_ON_EXTRA = 'false';
        process.env.DOTENV_CONFIG_ERROR_ON_REGEX = 'false';
        process.env.DOTENV_CONFIG_INCLUDE_PROCESS_ENV = 'false';
        process.env.DOTENV_CONFIG_ASSIGN_TO_PROCESS_ENV = 'true';
        process.env.DOTENV_CONFIG_OVERRIDE_PROCESS_ENV = 'false';

        const parsed = getConfigFromEnv(process.env);

        expect(parsed).toEqual({
            encoding: 'utf8',
            silent: true,
            path: '.env',
            defaults: '.env.defaults',
            schema: '.env.schema',
            errorOnMissing: false,
            errorOnExtra: false,
            errorOnRegex: false,
            includeProcessEnv: false,
            assignToProcessEnv: true,
            overrideProcessEnv: false,
        });
    });

    it('parse export is available and parses dotenv content', () => {
        const parsed = dotenvex.parse('A=1\nB=test\n');
        expect(parsed).toEqual({ A: '1', B: 'test' });
    });

    it('parsePrimitive handles supported scalar conversions', () => {
        expect(parsePrimitive(undefined)).toBeUndefined();
        expect(parsePrimitive(null)).toBeNull();
        expect(parsePrimitive(7)).toBe(7);
        expect(parsePrimitive(true)).toBe(true);
        expect(parsePrimitive('')).toBeUndefined();
        expect(parsePrimitive('undefined')).toBeUndefined();
        expect(parsePrimitive("'null'")).toBeNull();
        expect(parsePrimitive('NaN')).toSatisfy(Number.isNaN);
        expect(parsePrimitive('TRUE')).toBe(true);
        expect(parsePrimitive('0')).toBe(false);
        expect(parsePrimitive('12.5')).toBe(12.5);
        expect(parsePrimitive('some-string')).toBe('some-string');
        const obj = { x: 1 };
        expect(parsePrimitive(obj)).toBe(obj);
    });

    it('normalizeOptionKey handles snake, kebab, uppercase, camel, and empty inputs', () => {
        expect(normalizeOptionKey('ERROR_ON_REGEX')).toBe('errorOnRegex');
        expect(normalizeOptionKey('error-on-regex')).toBe('errorOnRegex');
        expect(normalizeOptionKey('INCLUDE_PROCESS_ENV')).toBe('includeProcessEnv');
        expect(normalizeOptionKey('ASSIGNTOPROCESSENV')).toBe('assigntoprocessenv');
        expect(normalizeOptionKey('assignToProcessEnv')).toBe('assignToProcessEnv');
        expect(normalizeOptionKey('')).toBe('');
    });
});

describe('CLI execution behavior', () => {
    beforeEach(() => {
        resetEnvKeys();
        vi.restoreAllMocks();
    });

    it('spawns command with inherited stdio and process env', () => {
        const kill = vi.fn();
        const on = vi.fn();
        const spawnCommandFn = vi.fn().mockReturnValue({ kill, on });
        const signalHandlers = {};
        const processOn = vi.fn((signal, handler) => {
            signalHandlers[signal] = handler;
        });
        const processExit = vi.fn();

        process.env.DOTENV_CONFIG_PATH = fixture('.env.override');
        const proc = cli.loadAndExecute(['echo', 'hello'], {
            spawnCommandFn,
            processOn,
            processExit,
        });

        expect(proc).toBeTruthy();
        expect(spawnCommandFn).toHaveBeenCalledWith('echo', ['hello'], {
            stdio: 'inherit',
            shell: true,
            env: process.env,
        });
        expect(process.env.TEST_ONE).toBe('one overridden');
        expect(processOn).toHaveBeenCalledTimes(4);
        expect(on).toHaveBeenCalledWith('exit', processExit);

        signalHandlers.SIGTERM();
        signalHandlers.SIGINT();
        signalHandlers.SIGBREAK();
        signalHandlers.SIGHUP();
        expect(kill).toHaveBeenCalledWith('SIGTERM');
        expect(kill).toHaveBeenCalledWith('SIGINT');
        expect(kill).toHaveBeenCalledWith('SIGBREAK');
        expect(kill).toHaveBeenCalledWith('SIGHUP');
    });

    it('returns undefined when no command is provided', () => {
        const spawnCommandFn = vi.fn();
        const result = cli.loadAndExecute(['--path=test/.env'], { spawnCommandFn });
        expect(result).toBeUndefined();
        expect(spawnCommandFn).not.toHaveBeenCalled();
    });

    it('prints merged config as JSON when --print is set', () => {
        const spawnCommandFn = vi.fn();
        const processExit = vi.fn();
        const writeStdoutFn = vi.fn();
        const result = cli.loadAndExecute(
            [
                '--print',
                `--path=${fixture('.env.override')}`,
                `--defaults=${fixture('.env.defaults.example')}`,
            ],
            { spawnCommandFn, processExit, writeStdoutFn }
        );

        expect(spawnCommandFn).not.toHaveBeenCalled();
        expect(processExit).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            TEST_ONE: 'one overridden',
            TEST_TWO: 'two',
            TEST_THREE: 'three',
        });
        expect(writeStdoutFn).toHaveBeenCalledTimes(1);
        expect(writeStdoutFn.mock.calls[0][0]).toContain('"TEST_ONE": "one overridden"');
    });

    it('prints merged config in dotenv format when --print=dotenv is set', () => {
        const writeStdoutFn = vi.fn();
        const result = cli.loadAndExecute(
            [
                '--print=dotenv',
                `--path=${fixture('.env.override')}`,
                `--defaults=${fixture('.env.defaults.example')}`,
            ],
            { writeStdoutFn }
        );

        expect(result).toMatchObject({
            TEST_ONE: 'one overridden',
            TEST_TWO: 'two',
            TEST_THREE: 'three',
        });
        expect(writeStdoutFn).toHaveBeenCalledTimes(1);
        const output = writeStdoutFn.mock.calls[0][0];
        expect(output).toContain('TEST_ONE=one overridden');
        expect(output).toContain('TEST_TWO=two');
        expect(output).toContain('TEST_THREE=three');
    });

    it('errors when --print is combined with command execution', () => {
        const writeStderrFn = vi.fn();
        const processExit = vi.fn();
        const spawnCommandFn = vi.fn();
        const result = cli.loadAndExecute(['--print', 'echo', 'hello'], {
            writeStderrFn,
            processExit,
            spawnCommandFn,
        });

        expect(result).toBeUndefined();
        expect(spawnCommandFn).not.toHaveBeenCalled();
        expect(processExit).toHaveBeenCalledWith(1);
        expect(writeStderrFn).toHaveBeenCalledTimes(1);
    });

    it('spawnCommand launches a child process', async () => {
        const proc = cli.spawnCommand(process.execPath, ['-e', 'process.exit(0)'], {
            stdio: 'ignore',
            shell: false,
            env: process.env,
        });

        await new Promise((resolve, reject) => {
            proc.on('exit', (code) => {
                if (code === 0) {
                    resolve();
                    return;
                }
                reject(new Error(`Unexpected exit code: ${code}`));
            });
            proc.on('error', reject);
        });
    });

    it('writeStdout and writeStderr pass through to process streams', () => {
        const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
        const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

        cli.writeStdout('stdout\n');
        cli.writeStderr('stderr\n');

        expect(stdoutSpy).toHaveBeenCalledWith('stdout\n');
        expect(stderrSpy).toHaveBeenCalledWith('stderr\n');
    });
});
