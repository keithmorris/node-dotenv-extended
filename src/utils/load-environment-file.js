import fs from 'fs';
import dotenv from 'dotenv';

export const loadEnvironmentFile = (path, encoding, silent, errorOnMissingFiles = false) => {
    try {
        const data = fs.readFileSync(path, encoding);
        return dotenv.parse(data);
    } catch (err) {
        if (errorOnMissingFiles && err && err.code === 'ENOENT') {
            throw new Error(`MISSING CONFIG FILE: ${path}`);
        }
        if (!silent) {
            console.error(err.message);
        }
        return {};
    }
};
export default loadEnvironmentFile;
