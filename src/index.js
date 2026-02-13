/**
 * Created by Keith Morris on 2/9/16.
 */
import dotenv from 'dotenv';
import getConfigFromEnv from './utils/config-from-env';
import loadEnvironmentFile from './utils/load-environment-file';

export const parse = dotenv.parse.bind(dotenv);
export const config = (options) => {
    let defaultsData,
        environmentData,
        defaultOptions = {
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
        },
        processEnvOptions = getConfigFromEnv(process.env);

    options = Object.assign({}, defaultOptions, processEnvOptions, options);

    defaultsData = loadEnvironmentFile(options.defaults, options.encoding, options.silent);
    environmentData = loadEnvironmentFile(options.path, options.encoding, options.silent);

    let configData = Object.assign({}, defaultsData, environmentData);
    const config = options.includeProcessEnv
        ? Object.assign({}, configData, process.env)
        : configData;
    const configOnlyKeys = Object.keys(configData);
    const configKeys = Object.keys(config);

    if (options.errorOnMissing || options.errorOnExtra || options.errorOnRegex) {
        const schema = loadEnvironmentFile(options.schema, options.encoding, options.silent);
        const schemaKeys = Object.keys(schema);

        let missingKeys = schemaKeys.filter(function (key) {
            return configKeys.indexOf(key) < 0;
        });
        let extraKeys = configOnlyKeys.filter(function (key) {
            return schemaKeys.indexOf(key) < 0;
        });
        if (options.errorOnMissing && missingKeys.length) {
            throw new Error('MISSING CONFIG VALUES: ' + missingKeys.join(', '));
        }

        if (options.errorOnExtra && extraKeys.length) {
            throw new Error('EXTRA CONFIG VALUES: ' + extraKeys.join(', '));
        }

        if (options.errorOnRegex) {
            const regexMismatchKeys = schemaKeys.filter(function (key) {
                if (schema[key]) {
                    return !new RegExp(schema[key]).test(
                        typeof config[key] === 'string' ? config[key] : ''
                    );
                }
            });

            if (regexMismatchKeys.length) {
                throw new Error('REGEX MISMATCH: ' + regexMismatchKeys.join(', '));
            }
        }
    }

    // the returned configData object should include process.env that override
    if (options.includeProcessEnv && !options.overrideProcessEnv) {
        for (let i = 0; i < configKeys.length; i++) {
            if (typeof process.env[configKeys[i]] !== 'undefined')
                configData[configKeys[i]] = process.env[configKeys[i]];
        }
    }

    if (options.assignToProcessEnv) {
        if (options.overrideProcessEnv) {
            Object.assign(process.env, configData);
        } else {
            const tmp = Object.assign({}, configData, process.env);
            Object.assign(process.env, tmp);
        }
    }
    return configData;
};

export const load = config;

export default { parse, config, load };
