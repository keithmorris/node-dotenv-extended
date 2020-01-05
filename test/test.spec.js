/**
 * Created by Keith Morris on 2/9/16.
 */
'use strict';
const chai = require('chai'),
    expect = chai.expect,
    mockery = require('mockery'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('dotenv-extended tests', function () {
    let dotenvex;

    before(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        sinon.stub(console, 'error');
        dotenvex = require('../');
    });

    after(function () {
        mockery.disable();
    });

    beforeEach(function () {
        delete process.env.TEST_ONE;
        delete process.env.TEST_TWO;
        delete process.env.TEST_THREE;
    });

    it('Should load .env file into process.env and not override process.env properties by default', function () {
        process.env.TEST_ONE = 'original';
        dotenvex.load();
        expect(process.env.TEST_ONE).to.equal('original');
    });

    it('Should load .env file into process.env and override process.env properties with overrideProcessEnv set to true', function () {
        process.env.TEST_ONE = 'original';
        dotenvex.load({overrideProcessEnv: true});
        expect(process.env.TEST_ONE).to.equal('overridden');
    });

    it('Should throw an error when items from schema are missing and errorOnMissing is true', function () {
        var runTest = function () {
            dotenvex.load({
                schema: '.env.schema.example',
                defaults: '.env.defaults.example',
                path: '.env.missing',
                errorOnMissing: true
            });
        };
        expect(runTest).to.throw(Error);
    });

    it('Should throw an error when there are extra items that are not in schema and errorOnExtra is true', function () {
        var runTest = function () {
            dotenvex.load({
                schema: '.env.schema.example',
                defaults: '.env.defaults.example',
                path: '.env.extra',
                errorOnExtra: true
            });
        };
        expect(runTest).to.throw(Error);
    });

    it('Should process process.env variables before checking errors when includeProcessEnv is true', function () {
        process.env.TEST_TWO = 'two';
        process.env.TEST_THREE = 'three';
        dotenvex.load({ schema: '.env.schema.example', includeProcessEnv: true });
        expect(process.env.TEST_TWO).to.equal('two');
    });

    it('Should load schema, defaults and env into correct values in process.env and returned object', function () {
        var config = dotenvex.load({
            schema: '.env.schema.example',
            defaults: '.env.defaults.example',
            path: '.env.override',
            errorOnExtra: true,
            errorOnMissing: true
        });
        expect(config.TEST_ONE).to.equal('one overridden');
        expect(config.TEST_TWO).to.equal('two');
        expect(config.TEST_THREE).to.equal('three');
        expect(process.env.TEST_ONE).to.equal('one overridden');
        expect(process.env.TEST_TWO).to.equal('two');
        expect(process.env.TEST_THREE).to.equal('three');
    });

    it('Should not load .env files into process.env if assignToProcessEnv is false', function () {
        var config = dotenvex.load({
            schema: '.env.schema.example',
            defaults: '.env.defaults.example',
            path: '.env.override',
            errorOnExtra: true,
            errorOnMissing: true,
            assignToProcessEnv: false
        });
        expect(config.TEST_ONE).to.equal('one overridden');
        expect(config.TEST_TWO).to.equal('two');
        expect(config.TEST_THREE).to.equal('three');
        expect(process.env.TEST_ONE).to.equal(undefined);
        expect(process.env.TEST_TWO).to.equal(undefined);
        expect(process.env.TEST_THREE).to.equal(undefined);
    });

    it('Should pass regex validation when errorOnRegex is true and values match patterns', function () {
        var runTest = function () {
            dotenvex.load({
                schema: '.env.schema.regex',
                path: '.env.override',
                errorOnRegex: true
            });
        };
        expect(runTest).not.to.throw(Error);
    });

    it('Should throw a SyntaxError when a schema regex is invalid and errorOnRegex is true', function () {
        var runTest = function () {
            dotenvex.load({
                schema: '.env.schema.regex-invalid',
                errorOnRegex: true
            });
        };
        expect(runTest).to.throw(SyntaxError);
    });

    it('Should not throw a SyntaxError when a schema regex is invalid but errorOnRegex is false', function () {
        var runTest = function () {
            dotenvex.load({
                schema: '.env.schema.regex-invalid',
                errorOnRegex: false
            });
        };
        expect(runTest).not.to.throw(SyntaxError);
    });

    it('Should throw an error when an item does not match schema regex and errorOnRegex is true', function () {
        process.env.TEST_TWO = 'string with whitespace';
        process.env.TEST_THREE = '';
        var runTest = function () {
            dotenvex.load({
                schema: '.env.schema.regex',
                path: '.env.override',
                includeProcessEnv: true,
                errorOnRegex: true
            });
        };
        expect(runTest).to.throw('REGEX MISMATCH: TEST_TWO, TEST_THREE');
    });

    it('Should log an error when silent is set to false and .env.defaults is missing', function () {
        dotenvex.load({silent: false});
        expect(console.error).to.have.been.calledOnce;
    });
});

describe('Supporting libraries tests', () => {
    beforeEach(function () {
        delete process.env.DOTENV_CONFIG_ENCODING;
        delete process.env.DOTENV_CONFIG_SILENT;
        delete process.env.DOTENV_CONFIG_PATH;
        delete process.env.DOTENV_CONFIG_DEFAULTS;
        delete process.env.DOTENV_CONFIG_SCHEMA;
        delete process.env.DOTENV_CONFIG_ERROR_ON_MISSING;
        delete process.env.DOTENV_CONFIG_ERROR_ON_EXTRA;
        delete process.env.DOTENV_CONFIG_ERROR_ON_REGEX;
        delete process.env.DOTENV_CONFIG_INCLUDED_PROCESS_ENV;
        delete process.env.DOTENV_CONFIG_ASSIGN_TO_PROCESS_ENV;
        delete process.env.DOTENV_CONFIG_OVERRIDE_PROCESS_ENV;
    });

    const parseCommand = require('../lib/utils/parse-command').parseCommand;
    const getConfigFromEnv = require('../lib/utils/config-from-env').getConfigFromEnv;
    const cliArgs = [
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
        'I was here'
    ];

    it('parseCommand should parse command line arguments correctly', () => {
        const parsed = parseCommand(cliArgs);
        const expected = {
            encoding: 'utf8',
            silent: true,
            path: 'test/.env.override',
            defaults: 'test/.env.defaults.example',
            schema: 'test/.env.schema.example',
            errorOnMissing: false,
            errorOnExtra: false,
            errorOnRegex: false,
            assignToProcessEnv: true,
            overrideProcessEnv: false
        };
        expect(parsed[0]).to.eql(expected);
        expect(parsed[1]).to.eql('testing.sh');
        expect(parsed[2]).to.eql(['--jump', '--dive=true', 'I was here']);
    });

    it('getConfigFromEnv should parse command line arguments correctly', () => {
        const expected = {
            encoding: 'utf8',
            silent: true,
            path: '.env',
            defaults: '.env.defaults',
            schema: '.env.schema',
            errorOnMissing: false,
            errorOnExtra: false,
            errorOnRegex: false,
            includedProcessEnv: false,
            assignToProcessEnv: true,
            overrideProcessEnv: false
        };
        process.env.DOTENV_CONFIG_ENCODING = 'utf8';
        process.env.DOTENV_CONFIG_SILENT = 'true';
        process.env.DOTENV_CONFIG_PATH = '.env';
        process.env.DOTENV_CONFIG_DEFAULTS = '.env.defaults';
        process.env.DOTENV_CONFIG_SCHEMA = '.env.schema';
        process.env.DOTENV_CONFIG_ERROR_ON_MISSING = 'false';
        process.env.DOTENV_CONFIG_ERROR_ON_EXTRA = 'false';
        process.env.DOTENV_CONFIG_ERROR_ON_REGEX = 'false';
        process.env.DOTENV_CONFIG_INCLUDED_PROCESS_ENV = 'false';
        process.env.DOTENV_CONFIG_ASSIGN_TO_PROCESS_ENV = 'true';
        process.env.DOTENV_CONFIG_OVERRIDE_PROCESS_ENV = 'false';
        const parsed = getConfigFromEnv(process.env);
        expect(parsed).to.eql(expected);
    });
});
