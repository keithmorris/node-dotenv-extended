/**
 * Created by Keith Morris on 2/9/16.
 */
'use strict';
var chai = require('chai'),
    expect = chai.expect,
    mockery = require('mockery'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('dotenv-extended tests', function () {
    var dotenvex;

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

    it('Should log an error when silent is set to false and .env.defaults is missing', function () {
        dotenvex.load({silent: false});
        expect(console.error).to.have.been.calledOnce;
    });
});

describe('CLI supporting libraries tests', function () {
    var parseCommand = require('../lib/bin/parse-command').parseCommand;
    var cliArgs = [
        '--encoding=utf8',
        '--silent=true',
        '--path=test/.env.override',
        '--defaults=test/.env.defaults.example',
        '--schema=test/.env.schema.example',
        '--error-on-missing=false',
        '--error-on-extra=false',
        '--assignToProcessEnv=true',
        '--overrideProcessEnv=false',
        'testing.sh',
        '--jump',
        '--dive=true',
        'I was here'
    ];

    it('Should parse command line arguments correctly', function () {
        var parsed = parseCommand(cliArgs);
        expect(parsed[0]).to.eql({
            encoding: 'utf8',
            silent: true,
            path: 'test/.env.override',
            defaults: 'test/.env.defaults.example',
            schema: 'test/.env.schema.example',
            errorOnMissing: false,
            errorOnExtra: false,
            assignToProcessEnv: true,
            overrideProcessEnv: false
        });
        expect(parsed[1]).to.eql('testing.sh');
        expect(parsed[2]).to.eql(['--jump', '--dive=true', 'I was here'])
    });
});
