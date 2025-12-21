import React, { useState, useRef, useEffect } from 'react';
import { Client } from '../../../types';
import { X } from 'lucide-react';
import { HelperText, SearchInput } from '../../../shared/components/UIComponents';
import { uiMessages } from '../../../utils/uiMessages';
import { searchMessages } from '../../../utils/searchMessages';

interface ClientAutocompleteProps {
    clients: Client[];
    value: string;
    onChange: (clientId: string) => void;
    required?: boolean;
    disabled?: boolean;
}

export const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
    clients,
    value,
    onChange,
    required = false,
    disabled = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Find and set the selected client based on value prop
    useEffect(() => {
        if (value) {
            const client = clients.find(c => c.id === value);
            if (client) {
                setSelectedClient(client);
                setSearchTerm('');
            }
        } else {
            setSelectedClient(null);
            setSearchTerm('');
        }
    }, [value, clients]);

    // Filter clients when search term changes
    useEffect(() => {
        if (searchTerm.length >= 3) {
            // Split search term into words
            const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);

            // Filter and score clients
            const scoredClients = clients.map(client => {
                const nameLower = client.name.toLowerCase();
                const cpfDigits = client.cpf?.replace(/\D/g, '') || '';
                const cnpjDigits = client.cnpj?.replace(/\D/g, '') || '';
                const searchDigits = searchTerm.replace(/\D/g, '');

                let score = 0;

                // Check if name starts with search term (highest priority)
                if (nameLower.startsWith(searchTerm.toLowerCase())) {
                    score += 100;
                }

                // Count matching words in name
                searchWords.forEach(word => {
                    if (word.length >= 2 && nameLower.includes(word)) {
                        score += 10;
                    }
                });

                // Exact CPF/CNPJ match
                if (searchDigits.length >= 3) {
                    if (cpfDigits.includes(searchDigits)) score += 50;
                    if (cnpjDigits.includes(searchDigits)) score += 50;
                }

                return { client, score };
            })
                // Filter only clients with score > 0
                .filter(item => item.score > 0)
                // Sort by score (highest first)
                .sort((a, b) => b.score - a.score)
                // Extract clients
                .map(item => item.client);

            setFilteredClients(scoredClients);
            setIsOpen(true);
        } else {
            setFilteredClients([]);
            setIsOpen(false);
        }
    }, [searchTerm, clients]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectClient = (client: Client) => {
        setSelectedClient(client);
        setSearchTerm('');
        setIsOpen(false);
        onChange(client.id);
    };

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

    return (
        <div ref={wrapperRef} className="relative">
            {selectedClient ? (
                <span className="block text-sm font-medium text-neutral-700 mb-1">
                    {uiMessages.labels.client} {required && <span className="text-danger-500">*</span>}
                </span>
            ) : null}

            {selectedClient ? (
                <div className="flex items-center justify-between bg-info-50 border border-info-200 rounded-md px-3 py-2">
                    <div className="flex-1">
                        <p className="font-medium text-neutral-900">{selectedClient.name}</p>
                        <p className="text-sm text-neutral-600">
                            {selectedClient.personType === 'Jurídica'
                                ? selectedClient.cnpj || uiMessages.placeholders.notInformed
                                : selectedClient.cpf || uiMessages.placeholders.notInformed}
                        </p>
                    </div>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleClearSelection}
                            className="ml-2 p-1 hover:bg-info-100 rounded-full text-neutral-500 hover:text-neutral-700"
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
                        disabled={disabled}
                        placeholder={searchMessages.validation.minLength(3)}
                    />
                    {searchTerm.length > 0 && searchTerm.length < 3 && (
                        <HelperText className="mt-1 text-xs">
                            {searchMessages.validation.typeMore(3 - searchTerm.length)}
                        </HelperText>
                    )}
                </>
            )}

            {isOpen && filteredClients.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredClients.map(client => (
                        <button
                            key={client.id}
                            type="button"
                            onClick={() => handleSelectClient(client)}
                            className="w-full text-left px-4 py-4 hover:bg-info-50 border-b border-neutral-100 last:border-0 transition-colors"
                        >
                            <p className="font-medium text-neutral-900">{client.name}</p>
                            <p className="text-sm text-neutral-600">
                                {client.personType === 'Jurídica'
                                    ? `CNPJ: ${client.cnpj || uiMessages.placeholders.notInformed}`
                                    : `CPF: ${client.cpf || uiMessages.placeholders.notInformed}`}
                            </p>
                            {client.email && (
                                <p className="text-xs text-neutral-500 mt-1">{client.email}</p>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {isOpen && searchTerm.length >= 3 && filteredClients.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-300 rounded-md shadow-lg p-4 text-center text-neutral-500">
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
