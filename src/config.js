import { config } from './index';

const reduceArguments = (prev, curr) => {
    const matches = curr.match(/^dotenv_config_(.+)=(.+)/);
    return hasMatches(matches) ? expandKeyValFromMatches(matches, prev) : prev;
};

const expandKeyValFromMatches = ([, key, value], prev) => ({
    ...prev,
    [key]: value,
});

const hasMatches = (matches) => matches && matches.length >= 3;

const options = process.argv.reduce(reduceArguments, {});

config(options);
