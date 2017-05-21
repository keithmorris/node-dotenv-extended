/// <reference types="dotenv" />

export interface IEnvironmentMap {
    [name: string]: string;
}

export interface IDotenvExtendedOptions {
    encoding?: string;
    silent?: boolean;
    path?: string;
    defaults?: string;
    schema?: string;
    errorOnMissing?: boolean;
    errorOnExtra?: boolean;
    assignToProcessEnv?: boolean;
    overrideProcessEnv?: boolean;
}

export { parse } from 'dotenv';

export function load(options?: IDotenvExtendedOptions): IEnvironmentMap;
