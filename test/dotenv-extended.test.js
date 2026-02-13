import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import dotenvex from '../src/index';
import getConfigFromEnv from '../src/utils/config-from-env';
import parseCommand from '../src/utils/parse-command';

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
    delete process.env.DOTENV_CONFIG_INCLUDE_PROCESS_ENV;
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
});
