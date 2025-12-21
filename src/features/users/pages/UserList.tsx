
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Button, Card, SearchInput, PageHeader, LoadingState, EmptyState, MobileListCard, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, Alert } from '../../../shared/components/UIComponents';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { userService } from '../../../services/userService';
import { User } from '../../../types';
import { maskCPF } from '../../../utils/formatters';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { confirmMessages } from '../../../utils/confirmMessages';
import { actionMessages } from '../../../utils/actionMessages';
import { searchMessages } from '../../../utils/searchMessages';
import { emptyStateMessages } from '../../../utils/emptyStateMessages';

export const UserList: React.FC = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
    const [loadError, setLoadError] = useState('');
    const { showToast } = useToast();

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getUsers();
            setUsers(data);
            setFilteredUsers(data);
            setLoadError('');
        } catch (error: any) {
            const message = error.message || actionMessages.loadError('usuários');
            setLoadError(message);
            setUsers([]);
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = users.filter(user =>
            user.name?.toLowerCase().includes(term) ||
            user.cpf?.includes(term) ||
            user.email?.toLowerCase().includes(term)
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const handleDelete = async () => {
        if (!deleteUserId) return;

        const userToDelete = users.find(u => u.id === deleteUserId);
        if (currentUser?.email === userToDelete?.email) {
            showToast(actionMessages.deleteBlockedSelf('usuário'), 'error');
            setDeleteUserId(null);
            return;
        }

        try {
            await userService.deleteUser(deleteUserId);
            showToast(actionMessages.deleteSuccess('Usuário'), 'success');
            setDeleteUserId(null);
            await loadUsers();
        } catch (error: any) {
            showToast(error.message || actionMessages.deleteError('usuário'), 'error');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader
                title="Usuários"
                subtitle="Gerencie os usuários do sistema."
                action={(
                    <Link to="/settings/users/new">
                        <Button className="w-full sm:w-auto whitespace-nowrap">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo usuário
                        </Button>
                    </Link>
                )}
            />

            {loadError && (
                <Alert variant="error">{loadError}</Alert>
            )}

            <Card>
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
                    <div className="flex-1">
                        <SearchInput
                            id="search-users"
                            name="search-users"
                            label="Buscar"
                            placeholder={searchMessages.users.placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label={searchMessages.users.ariaLabel}
                        />
                    </div>
                </div>

                {loading ? (
                    <LoadingState label="Carregando usuários..." className="min-h-[220px]" />
                ) : filteredUsers.length === 0 ? (
                    <EmptyState
                        icon={<Users className="h-12 w-12" />}
                        title={emptyStateMessages.users.title}
                        description={emptyStateMessages.users.description(!!searchTerm)}
                    />
                ) : (
                    <>
                        <div className="space-y-3 sm:hidden">
                            {filteredUsers.map((user) => (
                                <MobileListCard
                                    key={user.id}
                                    onClick={() => navigate(`/settings/users/${user.id}`)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center">
                                            <span className="text-brand-700 font-semibold text-sm">{user.name?.charAt(0) || '?'}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
                                                <span className="text-xs text-neutral-500">{maskCPF(user.cpf)}</span>
                                            </div>
                                            <p className="mt-2 text-sm text-neutral-700 truncate">{user.email}</p>
                                            <p className="mt-1 text-xs text-neutral-500">{user.username}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (user.id === currentUser?.id) {
                                                    showToast(actionMessages.deleteBlockedAccount, 'error');
                                                } else {
                                                    setDeleteUserId(user.id!);
                                                }
                                            }}
                                            className="text-danger-600 hover:bg-danger-50 hover:border-danger-200"
                                            disabled={user.id === currentUser?.id}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Excluir
                                        </Button>
                                    </div>
                                </MobileListCard>
                            ))}
                        </div>

                        <div className="hidden sm:block overflow-x-auto">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>
                                        Nome / CPF
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        Email
                                    </TableHeaderCell>
                                    <TableHeaderCell className="text-right">
                                        Ações
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        onClick={() => navigate(`/settings/users/${user.id}`)}
                                        className="cursor-pointer"
                                        hover
                                    >
                                        <TableCell className="text-neutral-900">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center">
                                                    <span className="text-brand-700 font-medium">{user.name?.charAt(0) || '?'}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-neutral-900 max-w-[200px] truncate" title={user.name}>
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-neutral-500">{maskCPF(user.cpf)}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-900">
                                            <div className="text-sm text-neutral-900 max-w-[200px] truncate" title={user.email}>{user.email}</div>
                                            <div className="text-sm text-neutral-500">{user.username}</div>
                                        </TableCell>
                                        <TableCell className="text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (user.id === currentUser?.id) {
                                                            showToast(actionMessages.deleteBlockedAccount, 'error');
                                                        } else {
                                                            setDeleteUserId(user.id!);
                                                        }
                                                    }}
                                                    className="text-danger-600 hover:bg-danger-50 hover:border-danger-200"
                                                    disabled={user.id === currentUser?.id}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Excluir
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    </>
                )}
            </Card>

            <ConfirmDialog
                isOpen={deleteUserId !== null}
                onCancel={() => setDeleteUserId(null)}
                onConfirm={handleDelete}
                title="Excluir usuário"
                message={confirmMessages.deleteDefault('este usuário')}
                confirmText="Excluir"
                variant="danger"
            />
        </div>
    );
};
