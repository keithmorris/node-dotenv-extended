const normalizedWithSeparators = (key) =>
    key.toLowerCase().replace(/[_-\s]+([a-z0-9])/g, (_, next) => next.toUpperCase());

export const normalizeOptionKey = (key) => {
    const trimmed = key.trim();
    if (!trimmed) {
        return '';
    }

    if (/[_-\s]/.test(trimmed)) {
        return normalizedWithSeparators(trimmed);
    }

    if (trimmed === trimmed.toUpperCase()) {
        return trimmed.toLowerCase();
    }

    return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
};

export default normalizeOptionKey;
