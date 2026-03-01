import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Client } from '../../../types';
import { X } from 'lucide-react';
import { HelperText, SearchInput } from '../../../shared/components/UIComponents';
import { storageService } from '../../../services/storage';
import { uiMessages } from '../../../utils/uiMessages';
import { searchMessages } from '../../../utils/searchMessages';

interface ClientAutocompleteProps {
    value: string;
    onChange: (clientId: string) => void;
    required?: boolean;
    disabled?: boolean;
}

export const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
    value,
    onChange,
    required = false,
    disabled = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLDivElement>(null);
    const listboxId = 'client-autocomplete-listbox';

    useEffect(() => {
        if (!value) {
            setSelectedClient(null);
            setSearchTerm('');
            return;
        }

        if (selectedClient?.id === value) {
            return;
        }

        let cancelled = false;
        const loadClient = async () => {
            try {
                const client = await storageService.getClientById(value);
                if (!cancelled && client) {
                    setSelectedClient(client);
                    setSearchTerm('');
                }
            } catch {
                if (!cancelled) setSelectedClient(null);
            }
        };

        loadClient();
        return () => { cancelled = true; };
    }, [value, selectedClient?.id]);

    useEffect(() => {
        if (searchTerm.length < 3 || disabled) {
            setFilteredClients([]);
            setIsOpen(false);
            setIsLoading(false);
            return;
        }

        let isActive = true;
        setIsLoading(true);
        const timeout = setTimeout(async () => {
            try {
                const response = await storageService.getClients({ search: searchTerm, limit: 20, offset: 0 });
                if (!isActive) return;
                setFilteredClients(response.items);
                setIsOpen(true);
            } catch {
                if (!isActive) return;
                setFilteredClients([]);
                setIsOpen(true);
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }, 300);

        return () => {
            isActive = false;
            clearTimeout(timeout);
        };
    }, [searchTerm, disabled]);

    useEffect(() => {
        setActiveIndex(-1);
    }, [filteredClients]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectClient = useCallback((client: Client) => {
        setSelectedClient(client);
        setSearchTerm('');
        setIsOpen(false);
        setActiveIndex(-1);
        onChange(client.id);
    }, [onChange]);

    const handleClearSelection = () => {
        setSelectedClient(null);
        setSearchTerm('');
        onChange('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (selectedClient) {
            setSelectedClient(null);
            onChange('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || filteredClients.length === 0) {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => Math.min(prev + 1, filteredClients.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < filteredClients.length) {
                    handleSelectClient(filteredClients[activeIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setActiveIndex(-1);
                break;
        }
    };

    useEffect(() => {
        if (activeIndex >= 0 && listboxRef.current) {
            const activeEl = listboxRef.current.children[activeIndex] as HTMLElement;
            activeEl?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    const activeDescendant = activeIndex >= 0 ? `client-option-${filteredClients[activeIndex]?.id}` : undefined;

    return (
        <div ref={wrapperRef} className="relative">
            {selectedClient ? (
                <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {uiMessages.labels.client} {required && <span className="text-danger-500">*</span>}
                </span>
            ) : null}

            {selectedClient ? (
                <div className="flex items-center justify-between bg-info-50 dark:bg-info-950/30 border border-info-200 dark:border-info-700 rounded-md px-3 py-2">
                    <div className="flex-1">
                        <p className="font-medium text-foreground">{selectedClient.name}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {selectedClient.personType === 'Jurídica'
                                ? selectedClient.cnpj || uiMessages.placeholders.notInformed
                                : selectedClient.cpf || uiMessages.placeholders.notInformed}
                        </p>
                    </div>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleClearSelection}
                            className="ml-2 p-1 hover:bg-info-100 dark:hover:bg-info-800/30 rounded-full text-muted hover:text-foreground"
                            aria-label={uiMessages.common.close}
                            title={uiMessages.common.close}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <SearchInput
                        id="client-search"
                        name="client-search"
                        label={uiMessages.labels.client}
                        required={required}
                        autoComplete="off"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        placeholder={searchMessages.validation.minLength(3)}
                        role="combobox"
                        aria-expanded={isOpen && filteredClients.length > 0}
                        aria-controls={listboxId}
                        aria-activedescendant={activeDescendant}
                        aria-autocomplete="list"
                    />
                    {searchTerm.length > 0 && searchTerm.length < 3 && (
                        <HelperText className="mt-1 text-xs">
                            {searchMessages.validation.typeMore(3 - searchTerm.length)}
                        </HelperText>
                    )}
                </>
            )}

            {isOpen && filteredClients.length > 0 && (
                <div
                    ref={listboxRef}
                    id={listboxId}
                    role="listbox"
                    className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto"
                >
                    {filteredClients.map((client, index) => (
                        <button
                            key={client.id}
                            id={`client-option-${client.id}`}
                            type="button"
                            role="option"
                            aria-selected={index === activeIndex}
                            onClick={() => handleSelectClient(client)}
                            className={`w-full text-left px-4 py-4 border-b border-border/50 last:border-0 transition-colors ${
                                index === activeIndex
                                    ? 'bg-info-100 dark:bg-info-900/30'
                                    : 'hover:bg-info-50 dark:hover:bg-info-950/20'
                            }`}
                        >
                            <p className="font-medium text-foreground">{client.name}</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {client.personType === 'Jurídica'
                                    ? `${uiMessages.labels.cnpj}: ${client.cnpj || uiMessages.placeholders.notInformed}`
                                    : `${uiMessages.labels.cpf}: ${client.cpf || uiMessages.placeholders.notInformed}`}
                            </p>
                            {client.email && (
                                <p className="text-xs text-muted mt-1">{client.email}</p>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {isLoading && (
                <div aria-live="polite">
                    <HelperText className="mt-1 text-xs">
                        {uiMessages.common.loading}
                    </HelperText>
                </div>
            )}

            {isOpen && !isLoading && searchTerm.length >= 3 && filteredClients.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg p-4 text-center text-muted">
                    {searchMessages.noResults(uiMessages.labels.client.toLowerCase())}
                </div>
            )}

            <input
                type="hidden"
                name="clientId"
                value={value}
                required={required}
            />
        </div>
    );
};
