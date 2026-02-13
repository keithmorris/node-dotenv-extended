export const parsePrimitive = (value) => {
    if (value === null || typeof value === 'undefined') {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }

    if (typeof value !== 'string') {
        return value;
    }

    let normalized = value
        .trim()
        .replace(/(^"|"$)|(^'|'$)/g, '')
        .toLowerCase();

    if (normalized === '' || normalized === 'undefined') {
        return undefined;
    }

    if (normalized === 'null') {
        return null;
    }

    if (normalized === 'nan') {
        return NaN;
    }

    if (normalized === 'true' || normalized === '1') {
        return true;
    }

    if (normalized === 'false' || normalized === '0') {
        return false;
    }

    const numeric = Number(normalized);
    if (!Number.isNaN(numeric)) {
        return numeric;
    }

    return value;
};

export default parsePrimitive;
