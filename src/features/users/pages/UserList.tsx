
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Button, Card, SearchInput, PageHeader, LoadingState, EmptyState, MobileListCard, Table, TableHead, TableBody, TableRow, TableRowButton, TableHeaderCell, TableCell, Alert } from '../../../shared/components/UIComponents';
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
import { uiMessages } from '../../../utils/uiMessages';

export const UserList: React.FC = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
    const [loadError, setLoadError] = useState('');
    const { showToast } = useToast();

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await userService.getUsers();
                if (!cancelled) {
                    setUsers(data);
                    setLoadError('');
                }
            } catch (error) {
                if (!cancelled) {
                    setLoadError(error instanceof Error ? error.message : actionMessages.loadError('usuários'));
                    setUsers([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchUsers();
        return () => { cancelled = true; };
    }, [refreshKey]);

    const filteredUsers = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return users.filter(user =>
            user.name?.toLowerCase().includes(term) ||
            user.cpf?.includes(term) ||
            user.email?.toLowerCase().includes(term)
        );
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
            setRefreshKey(k => k + 1);
        } catch (error) {
            showToast(error instanceof Error ? error.message : actionMessages.deleteError('usuário'), 'error');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader
                title={uiMessages.pages.users.title}
                subtitle={uiMessages.pages.users.subtitle}
                action={(
                    <Button className="w-full sm:w-auto whitespace-nowrap" onClick={() => navigate('/settings/users/new')}>
                        <Plus className="w-4 h-4 mr-2" />
                        {uiMessages.pages.users.actions.new}
                    </Button>
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
                            label={uiMessages.common.search}
                            placeholder={searchMessages.users.placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label={searchMessages.users.ariaLabel}
                        />
                    </div>
                </div>

                {loading ? (
                    <LoadingState label={actionMessages.loading('usuários')} className="min-h-[220px]" />
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
                                    aria-label={user.name}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 h-10 w-10 bg-brand-100 dark:bg-brand-900/40 rounded-full flex items-center justify-center">
                                            <span className="text-brand-700 dark:text-brand-300 font-semibold text-sm">{user.name?.charAt(0) || '?'}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                                                <span className="text-xs text-muted">{maskCPF(user.cpf)}</span>
                                            </div>
                                            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 truncate">{user.email}</p>
                                            <p className="mt-1 text-xs text-muted">{user.username}</p>
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
                                            className="text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 hover:border-danger-200 dark:hover:border-danger-700"
                                            disabled={user.id === currentUser?.id}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            {uiMessages.common.delete}
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
                                        {uiMessages.tableHeaders.users.nameCpf}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {uiMessages.labels.email}
                                    </TableHeaderCell>
                                    <TableHeaderCell className="text-right">
                                        {uiMessages.common.actions}
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRowButton
                                        key={user.id}
                                        onClick={() => navigate(`/settings/users/${user.id}`)}
                                        aria-label={user.name}
                                    >
                                        <TableCell className="text-foreground">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-brand-100 dark:bg-brand-900/40 rounded-full flex items-center justify-center">
                                                    <span className="text-brand-700 dark:text-brand-300 font-medium">{user.name?.charAt(0) || '?'}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-foreground max-w-[200px] truncate" title={user.name}>
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-muted">{maskCPF(user.cpf)}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            <div className="text-sm text-foreground max-w-[200px] truncate" title={user.email}>{user.email}</div>
                                            <div className="text-sm text-muted">{user.username}</div>
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
                                                    className="text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 hover:border-danger-200 dark:hover:border-danger-700"
                                                    disabled={user.id === currentUser?.id}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    {uiMessages.common.delete}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRowButton>
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
                title={uiMessages.confirmTitles.deleteUser}
                message={confirmMessages.deleteDefault('este usuário')}
                confirmText={uiMessages.common.delete}
                variant="danger"
            />
        </div>
    );
};
