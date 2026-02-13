/**
 * Created by Keith Morris on 2/9/16.
 */
import dotenv from 'dotenv';
import getConfigFromEnv from './utils/config-from-env';
import loadEnvironmentFile from './utils/load-environment-file';

const normalizeLayeredFiles = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const loadLayeredFiles = (files, options) =>
    normalizeLayeredFiles(files).reduce((acc, filePath) => {
        const fileData = loadEnvironmentFile(
            filePath,
            options.encoding,
            options.silent,
            options.errorOnMissingFiles
        );
        return Object.assign(acc, fileData);
    }, {});

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
            schemaExtends: undefined,
            errorOnMissing: false,
            errorOnExtra: false,
            errorOnRegex: false,
            errorOnMissingFiles: false,
            returnSchemaOnly: false,
            includeProcessEnv: false,
            assignToProcessEnv: true,
            overrideProcessEnv: false,
        },
        processEnvOptions = getConfigFromEnv(process.env);

    options = Object.assign({}, defaultOptions, processEnvOptions, options);

    defaultsData = loadLayeredFiles(options.defaults, options);
    environmentData = loadLayeredFiles(options.path, options);

    let configData = Object.assign({}, defaultsData, environmentData);
    const config = options.includeProcessEnv
        ? Object.assign({}, configData, process.env)
        : configData;
    const configOnlyKeys = Object.keys(configData);
    const configKeys = Object.keys(config);

    let schemaKeys = null;

    if (
        options.errorOnMissing ||
        options.errorOnExtra ||
        options.errorOnRegex ||
        options.returnSchemaOnly
    ) {
        const baseSchema = loadEnvironmentFile(
            options.schema,
            options.encoding,
            options.silent,
            options.errorOnMissingFiles
        );
        const schema = normalizeLayeredFiles(options.schemaExtends).reduce(
            (acc, schemaPath) => {
                const schemaLayer = loadEnvironmentFile(
                    schemaPath,
                    options.encoding,
                    options.silent,
                    options.errorOnMissingFiles
                );
                return Object.assign(acc, schemaLayer);
            },
            Object.assign({}, baseSchema)
        );
        schemaKeys = Object.keys(schema);

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

    if (options.returnSchemaOnly && schemaKeys) {
        configData = schemaKeys.reduce((acc, key) => {
            if (typeof config[key] !== 'undefined') {
                acc[key] = config[key];
            }
            return acc;
        }, {});
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
