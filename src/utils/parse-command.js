/**
 * Created by Keith Morris on 4/26/17.
 */
import parsePrimitive from './parse-primitive';
import normalizeOptionKey from './normalize-option-key';

const dotEnvFlagRegex = /^--(.+)=(.+)/;
const dotEnvBooleanFlagRegex = /^--(.+)$/;

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
            config[normalizeOptionKey(match[1])] = parsePrimitive(match[2]);
            continue;
        }

        const booleanFlagMatch = dotEnvBooleanFlagRegex.exec(args[i]);
        if (booleanFlagMatch && normalizeOptionKey(booleanFlagMatch[1]) === 'print') {
            config.print = true;
        } else {
            // No more env setters, the rest of the line must be the command and args
            command = args[i];
            commandArgs = args.slice(i + 1);
            break;
        }
    }
    return [config, command, commandArgs];
};
export default parseCommand;
