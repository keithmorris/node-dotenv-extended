import fs from 'fs';
import dotenv from 'dotenv';

export const loadEnvironmentFile = (path, encoding, silent) => {
    try {
        const data = fs.readFileSync(path, encoding);
        return dotenv.parse(data);
    } catch (err) {
        if (!silent) {
            console.error(err.message);
        }
        return {};
    }
};
export default loadEnvironmentFile;
