
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { Button, Card } from '../components/UIComponents';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { userService } from '../services/userService';
import { User } from '../types';
import { maskCPF } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export const UserList: React.FC = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
    const { showToast } = useToast();

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error: any) {
            showToast(error.message || 'Erro ao carregar usuários', 'error');
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
            showToast('Você não pode excluir seu próprio usuário', 'error');
            setDeleteUserId(null);
            return;
        }

        try {
            await userService.deleteUser(deleteUserId);
            showToast('Usuário excluído com sucesso', 'success');
            setDeleteUserId(null);
            await loadUsers();
        } catch (error: any) {
            showToast(error.message || 'Erro ao excluir usuário', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
                    <p className="mt-1 text-sm text-gray-500">Gerencie os usuários do sistema</p>
                </div>
                <Link to="/settings/users/new">
                    <Button className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Usuário
                    </Button>
                </Link>
            </div>

            <Card>
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="search-users"
                            name="search-users"
                            className="bg-white block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Buscar por nome, CPF ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Carregando usuários...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Ajuste sua busca para encontrar usuários.' : 'Aguarde cadastros de novos usuários.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nome / CPF
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        onClick={() => navigate(`/settings/users/${user.id}`)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <span className="text-indigo-700 font-medium">{user.name?.charAt(0) || '?'}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={user.name}>
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{maskCPF(user.cpf)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 max-w-[200px] truncate" title={user.email}>{user.email}</div>
                                            <div className="text-sm text-gray-500">{user.username}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (user.id === currentUser?.id) {
                                                            showToast('Você não pode excluir sua própria conta', 'error');
                                                        } else {
                                                            setDeleteUserId(user.id!);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:bg-red-50 hover:border-red-300"
                                                    disabled={user.id === currentUser?.id}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Excluir
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <ConfirmDialog
                isOpen={deleteUserId !== null}
                onClose={() => setDeleteUserId(null)}
                onConfirm={handleDelete}
                title="Excluir Usuário"
                message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                type="danger"
            />
        </div>
    );
};
