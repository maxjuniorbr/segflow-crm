import { uiBaseMessages } from './uiBaseMessages';
import { uiNavigationMessages } from './uiNavigationMessages';
import { uiPageMessages } from './uiPageMessages';
import { authMessages } from './authMessages';

const messageModules: Array<Record<string, unknown>> = [
    uiBaseMessages,
    uiNavigationMessages,
    uiPageMessages,
    { auth: authMessages }
];

const getDuplicateKeys = (modules: Array<Record<string, unknown>>) => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const module of modules) {
        for (const key of Object.keys(module)) {
            if (seen.has(key)) {
                duplicates.add(key);
            } else {
                seen.add(key);
            }
        }
    }

    return Array.from(duplicates);
};

if (import.meta.env?.MODE !== 'production') {
    const duplicateKeys = getDuplicateKeys(messageModules);

    if (duplicateKeys.length > 0) {
        console.warn('[uiMessages] Chaves duplicadas encontradas:', duplicateKeys.join(', '));
    }
}

export const uiMessages = {
    ...uiBaseMessages,
    ...uiNavigationMessages,
    ...uiPageMessages,
    auth: authMessages
};
