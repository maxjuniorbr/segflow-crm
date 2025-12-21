import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Key } from 'lucide-react';
import { Button, Input, Card, Alert, PageHeader, LoadingState } from '../../../shared/components/UIComponents';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { userService } from '../../../services/userService';
import { FormErrors, UserFormData } from '../../../types';
import { maskCPF } from '../../../utils/formatters';
import { isValidCPF, isValidEmail } from '../../../utils/validators';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { validationMessages } from '../../../utils/validationMessages';
import { actionMessages } from '../../../utils/actionMessages';

export const UserForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user: currentUser } = useAuth();
    const parsedId = id ? Number(id) : null;
    const isSelf = parsedId !== null && currentUser?.id === parsedId;

    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        cpf: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState<FormErrors<UserFormData>>({});
    const [formError, setFormError] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            if (!parsedId) {
                setLoadingData(false);
                return;
            }

            try {
                const user = await userService.getUserById(parsedId);
                if (user) {
                    setFormData({
                        name: user.name,
                        cpf: maskCPF(user.cpf),
                        email: user.email,
                    });
                }
            } catch (error: any) {
                const message = error.message || actionMessages.loadError('usuário');
                showToast(message, 'error');
                setFormError(message);
                navigate('/settings/users');
            } finally {
                setLoadingData(false);
            }
        };

        loadUser();
    }, [parsedId]);

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
            setErrors(prev => ({ ...prev, cpf: validationMessages.invalid('CPF') }));
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors<UserFormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = validationMessages.required('Nome');
        }

        if (!formData.cpf.trim()) {
            newErrors.cpf = validationMessages.required('CPF');
        } else if (!isValidCPF(formData.cpf)) {
            newErrors.cpf = validationMessages.invalid('CPF');
        }

        if (!formData.email.trim()) {
            newErrors.email = validationMessages.required('Email');
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = validationMessages.invalid('Email');
        }

        if (!id && !formData.password?.trim()) {
            newErrors.password = validationMessages.passwordRequiredNewUser;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFormError('');
        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            if (parsedId) {
                await userService.updateUser(parsedId, formData);
                showToast(actionMessages.updateSuccess('Usuário'), 'success');
            } else {
                await userService.createUser(formData);
                showToast(actionMessages.createSuccess('Usuário'), 'success');
            }
            navigate('/settings/users');
        } catch (error: any) {
            const message = error.message || actionMessages.saveError('usuário');
            setFormError(message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
        if (!parsedId || !isSelf) {
            showToast('Você só pode alterar sua própria senha', 'error');
            return;
        }
        try {
            await userService.changePassword(parsedId, currentPassword, newPassword);
            showToast(actionMessages.passwordChangeSuccess, 'success');
        } catch (error: any) {
            const errorMessage = error.message || 'Erro ao alterar senha';
            showToast(errorMessage, 'error');
            throw error;
        }
    };

    if (loadingData) {
        return <LoadingState label="Carregando usuário..." />;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-24 sm:pb-0">
            <PageHeader
                title={id ? 'Editar usuário' : 'Novo usuário'}
                subtitle={id ? 'Atualize os dados do usuário.' : 'Preencha os dados do usuário.'}
                leading={(
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors"
                        aria-label="Voltar"
                        title="Voltar"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
            />

            {formError && (
                <Alert variant="error">{formError}</Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <Card>
                    <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                id="name"
                                name="name"
                                label="Nome Completo"
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
                                label="CPF"
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
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            required
                            maxLength={254}
                        />

                        {!parsedId && (
                            <Input
                                id="password"
                                name="password"
                                label="Senha Inicial"
                                type="password"
                                value={formData.password || ''}
                                onChange={handleChange}
                                error={errors.password}
                                required
                            />
                        )}
                    </div>
                </Card>

                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-neutral-200 shadow-lg sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 flex justify-end space-x-4 z-50">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={loading}>
                        Salvar
                    </Button>
                </div>
            </form>

            {isSelf && (
                <Card>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-neutral-900">Segurança</h3>
                            <p className="mt-1 text-sm text-neutral-500">Gerencie a senha de acesso.</p>
                        </div>
                        <div className="flex justify-between items-center">
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

            {isSelf && (
                <ChangePasswordModal
                    isOpen={showPasswordModal}
                    onClose={() => setShowPasswordModal(false)}
                    onConfirm={handlePasswordChange}
                />
            )}
        </div>
    );
};
