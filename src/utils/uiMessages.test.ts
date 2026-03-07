import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('uiMessages duplicate key warning', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllEnvs();
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
        vi.doUnmock('./authMessages');
        vi.doUnmock('./uiNavigationMessages');
        vi.resetModules();
        vi.unstubAllEnvs();
    });

    it('ignores duplicate keys inside authMessages because auth is nested', async () => {
        vi.doMock('./authMessages', () => ({
            authMessages: {
                pages: 'Duplicado',
                loginTitle: 'Acesso ao SegFlow'
            }
        }));

        await import('./uiMessages');

        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('warns when modules share the same top-level key', async () => {
        vi.doMock('./uiNavigationMessages', async () => {
            const actual = await vi.importActual<typeof import('./uiNavigationMessages')>('./uiNavigationMessages');

            return {
                ...actual,
                uiNavigationMessages: {
                    ...actual.uiNavigationMessages,
                    pages: 'Duplicado'
                }
            };
        });

        await import('./uiMessages');

        expect(warnSpy).toHaveBeenCalledWith(
            '[uiMessages] Chaves duplicadas encontradas:',
            'pages'
        );
    });
});
