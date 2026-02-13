import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.js'],
            exclude: ['src/bin/cli.js'],
        },
    },
});
