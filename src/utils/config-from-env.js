import autoParse from 'auto-parse';
import camelCase from 'camelcase';

export const getConfigFromEnv = env => {
    let config = {};
    Object.keys(env).forEach((key) => {
        const curr = key.split('DOTENV_CONFIG_');
        if (curr.length === 2 && curr[0] === '' && curr[1].length) {
            config[camelCase(curr[1])] = autoParse(env[key]);
        }
    });
    return config;
};
export default getConfigFromEnv;

// process.env.DOTENV_CONFIG_ENCODING = 'utf8';
// process.env.DOTENV_CONFIG_SILENT = 'true';
// process.env.DOTENV_CONFIG_PATH = '.env';
// process.env.DOTENV_CONFIG_DEFAULTS = '.env.defaults';
// process.env.DOTENV_CONFIG_SCHEMA = '.env.schema';
// process.env.DOTENV_CONFIG_ERROR_ON_MISSING = 'false';
// process.env.DOTENV_CONFIG_ERROR_ON_EXTRA = 'false';
// process.env.DOTENV_CONFIG_ERROR_ON_REGEX = 'false';
// process.env.DOTENV_CONFIG_INCLUDED_PROCESS_ENV = 'false';
// process.env.DOTENV_CONFIG_ASSIGN_TO_PROCESS_ENV = 'true';
// process.env.DOTENV_CONFIG_OVERRIDE_PROCESS_ENV = 'false';


