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
