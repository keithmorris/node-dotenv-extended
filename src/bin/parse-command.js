/**
 * Created by Keith Morris on 4/26/17.
 */
import autoParse from 'auto-parse';
import camelcase from 'camelcase';

const dotEnvFlagRegex = /^--(.+)=(.+)/;

/**
 * First parses config variables for dotenv-extended then selects the next item as the command and everything after that
 * are considered arguments for the command
 *
 * @param args
 * @returns {[Object,String,Array]}
 */
export const parseCommand = (args) => {
    const config = {};
    let command = null;
    let commandArgs = [];
    for (let i = 0; i < args.length; i++) {
        const match = dotEnvFlagRegex.exec(args[i]);
        if (match) {
            config[camelcase(match[1])] = autoParse(match[2]);
        } else {
            // No more env setters, the rest of the line must be the command and args
            command = args[i];
            commandArgs = args.slice(i + 1);
            break;
        }
    }
    return [config, command, commandArgs];
};
