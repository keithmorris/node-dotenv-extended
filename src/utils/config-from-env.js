import parsePrimitive from './parse-primitive';
import normalizeOptionKey from './normalize-option-key';

export const getConfigFromEnv = (env) => {
    let config = {};
    Object.keys(env).forEach((key) => {
        const curr = key.split('DOTENV_CONFIG_');
        if (curr.length === 2 && curr[0] === '' && curr[1].length) {
            config[normalizeOptionKey(curr[1])] = parsePrimitive(env[key]);
        }
    });
    return config;
};
export default getConfigFromEnv;
