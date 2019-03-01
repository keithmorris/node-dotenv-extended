/// <reference types="dotenv" />

/**
 * The result of a call to load() or parse()
 */
export interface IEnvironmentMap {
    [name: string]: string;
}

/**
 * DotenvExtended options for load().
 */
export interface IDotenvExtendedOptions {
    /**
     * Sets the encoding of the .env files.
     *
     * @default 'utf-8'
     */
    encoding?: string;

    /**
     * Sets whether a log message is shown when missing the .env or .env.defaults files.
     *
     * @default true
     */
    silent?: boolean;

    /**
     * Path to the main .env file that contains your variables.
     *
     * @default '.env'
     */
    path?: string;

    /**
     * The path to the file that default values are loaded from.
     *
     * @default '.env.defaults'
     */
    defaults?: string;

    /**
     * The path to the file that contains the schema of what values should be available
     * from combining .env and .env.defaults.
     *
     * @default '.env.schema'
     */
    schema?: string;

    /**
     * Causes the library to throw a MISSING CONFIG VALUES error listing all of the variables
     * missing the combined .env and .env.defaults files.
     *
     * @default false
     */
    errorOnMissing?: boolean;

    /**
     * Causes the library to throw a EXTRA CONFIG VALUES error listing all of the extra variables
     * from the combined .env and .env.defaults files.
     *
     * @default false
     */
    errorOnExtra?: boolean;

    /**
     * Causes the library to throw a REGEX MISMATCH error listing all of the invalid variables from the combined .env
     * and .env.defaults files. Also a SyntaxError is thrown in case .env.schema contains a syntactically invalid regex.
     *
     * @default false
     */
    errorOnRegex?: boolean;

    /**
     * Causes the library add process.env variables to error checking. The variables in process.env overrides the 
     * variables in .env and .env.defaults while checking
     *
     * @default false
     */
    includeProcessEnv?: boolean;

    /**
     * Sets whether the loaded values are assigned to the process.env object.
     * If this is set, you must capture the return value of the call to .load() or you will not be
     * able to use your variables.
     *
     * @default true
     */
    assignToProcessEnv?: boolean;

    /**
     * By defaut, dotenv-entended will not overwrite any varibles that are already set in the process.env object.
     * If you would like to enable overwriting any already existing values, set this value to true.
     *
     * @default false
     */
    overrideProcessEnv?: boolean;
}

export { parse } from 'dotenv';

/**
 * Loads the dotenv files, .env, .env.defaults and .env.schema.
 *
 * @param options
 */
export function load(options?: IDotenvExtendedOptions): IEnvironmentMap;
