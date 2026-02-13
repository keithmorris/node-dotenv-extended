import { afterEach, describe, expect, it, vi } from 'vitest';

const originalArgv = process.argv.slice();

afterEach(() => {
    process.argv = originalArgv.slice();
    vi.restoreAllMocks();
    vi.resetModules();
    vi.unmock('../src/index');
    vi.unmock('../src/bin/index');
});

describe('entrypoint modules', () => {
    it('src/config.js parses dotenv_config_* args and calls config()', async () => {
        const configMock = vi.fn();
        vi.doMock('../src/index', () => ({
            config: configMock,
        }));

        process.argv = [
            'node',
            'script.js',
            'dotenv_config_path=./env/.env',
            'dotenv_config_defaults=./env/.env.defaults',
            'not_dotenv_arg=value',
        ];

        await import('../src/config.js');

        expect(configMock).toHaveBeenCalledTimes(1);
        expect(configMock).toHaveBeenCalledWith({
            path: './env/.env',
            defaults: './env/.env.defaults',
        });
    });

    it('src/bin/cli.js calls loadAndExecute with argv slice', async () => {
        const loadAndExecuteMock = vi.fn();
        vi.doMock('../src/bin/index', () => ({
            loadAndExecute: loadAndExecuteMock,
        }));

        process.argv = ['node', 'cli.js', '--path=.env', 'echo', 'hello'];

        await import('../src/bin/cli.js');

        expect(loadAndExecuteMock).toHaveBeenCalledTimes(1);
        expect(loadAndExecuteMock).toHaveBeenCalledWith(['--path=.env', 'echo', 'hello']);
    });
});
