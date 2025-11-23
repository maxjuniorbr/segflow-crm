import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Key } from 'lucide-react';
import { Button, Input, Card } from '../components/UIComponents';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { userService } from '../services/userService';
import { User } from '../types';
import { maskCPF } from '../utils/formatters';
import { isValidCPF } from '../utils/validators';
import { useToast } from '../contexts/ToastContext';

export const UserForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            if (!id) {
                setLoadingData(false);
                return;
            }

            try {
                const user = await userService.getUserById(Number(id));
                if (user) {
                    setFormData({
                        name: user.name,
                        cpf: maskCPF(user.cpf),
                        email: user.email,
                    });
                }
            } catch (error: any) {
                showToast(error.message || 'Erro ao carregar usuário', 'error');
                navigate('/settings/users');
            } finally {
                setLoadingData(false);
            }
        };

        loadUser();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'cpf') {
            setFormData(prev => ({ ...prev, [name]: maskCPF(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleCpfBlur = () => {
        if (formData.cpf && !isValidCPF(formData.cpf)) {
            setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.cpf.trim()) {
            newErrors.cpf = 'CPF é obrigatório';
        } else if (!isValidCPF(formData.cpf)) {
            newErrors.cpf = 'CPF inválido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!id && !formData.password?.trim()) {
            newErrors.password = 'Senha é obrigatória para novos usuários';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            if (id) {
                await userService.updateUser(Number(id), formData);
                showToast('Usuário atualizado com sucesso', 'success');
            } else {
                await userService.createUser(formData);
                showToast('Usuário criado com sucesso', 'success');
            }
            navigate('/settings/users');
        } catch (error: any) {
            showToast(error.message || 'Erro ao salvar usuário', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
        try {
            await userService.changePassword(Number(id), currentPassword, newPassword);
            showToast('Senha alterada com sucesso', 'success');
        } catch (error: any) {
            const errorMessage = error.message || 'Erro ao alterar senha';
            showToast(errorMessage, 'error');
            throw error;
        }
    };

    if (loadingData) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{id ? 'Editar Usuário' : 'Novo Usuário'}</h1>
                    <p className="mt-1 text-sm text-gray-500">{id ? 'Atualize os dados do usuário' : 'Cadastre um novo usuário'}</p>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="text-slate-500">Carregando...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center">
                    <button onClick={() => navigate('/settings/users')} className="mr-4 p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{id ? 'Editar Usuário' : 'Novo Usuário'}</h1>
                        <p className="mt-1 text-sm text-gray-500">{id ? 'Atualize os dados do usuário' : 'Cadastre um novo usuário'}</p>
                    </div>
                </div>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            id="name"
                            name="name"
                            label="Nome Completo *"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            required
                            maxLength={200}
                        />

                        <Input
                            id="cpf"
                            name="cpf"
                            label="CPF *"
                            type="text"
                            value={formData.cpf}
                            onChange={handleChange}
                            onBlur={handleCpfBlur}
                            error={errors.cpf}
                            required
                            maxLength={14}
                        />
                    </div>

                    <Input
                        id="email"
                        name="email"
                        label="Email *"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                        maxLength={254}
                    />

                    {!id && (
                        <Input
                            id="password"
                            name="password"
                            label="Senha Inicial *"
                            type="password"
                            value={formData.password || ''}
                            onChange={handleChange}
                            error={errors.password}
                            required
                        />
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button type="submit" isLoading={loading}>
                            Salvar Alterações
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/settings/users')}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </Card>

            {id && (
                <Card>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Segurança</h3>
                            <p className="mt-1 text-sm text-gray-500">Gerencie a senha de acesso</p>
                        </div>
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                <Key className="w-4 h-4 mr-2" />
                                Alterar Senha
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onConfirm={handlePasswordChange}
            />
        </div>
    );
};
