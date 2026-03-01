import { uiBaseMessages } from './uiBaseMessages';
import { uiNavigationMessages } from './uiNavigationMessages';
import { uiPageMessages } from './uiPageMessages';
import { authMessages } from './authMessages';

const messageModules = [uiBaseMessages, uiNavigationMessages, uiPageMessages, authMessages];
const duplicateKeys = messageModules.reduce((duplicates, module) => {
    Object.keys(module).forEach((key) => {
        if (duplicates.seen.has(key)) {
            duplicates.keys.add(key);
        } else {
            duplicates.seen.add(key);
        }
    });
    return duplicates;
}, { keys: new Set<string>(), seen: new Set<string>() });

if (duplicateKeys.keys.size > 0 && import.meta.env?.MODE !== 'production') {
    console.warn('[uiMessages] Chaves duplicadas encontradas:', Array.from(duplicateKeys.keys).join(', '));
}

export const uiMessages = {
    ...uiBaseMessages,
    ...uiNavigationMessages,
    ...uiPageMessages,
    auth: authMessages
};
