import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Key, Save } from 'lucide-react';
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
import { uiMessages } from '../../../utils/uiMessages';

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
        let cancelled = false;
        const loadUser = async () => {
            if (!parsedId) {
                if (!cancelled) setLoadingData(false);
                return;
            }

            try {
                const user = await userService.getUserById(parsedId);
                if (!cancelled && user) {
                    setFormData({
                        name: user.name,
                        cpf: maskCPF(user.cpf),
                        email: user.email,
                    });
                }
            } catch (error) {
                if (!cancelled) {
                    const message = error instanceof Error ? error.message : actionMessages.loadError('usuário');
                    showToast(message, 'error');
                    setFormError(message);
                    navigate('/settings/users');
                }
            } finally {
                if (!cancelled) setLoadingData(false);
            }
        };

        loadUser();
        return () => { cancelled = true; };
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
            setErrors(prev => ({ ...prev, cpf: validationMessages.invalid(uiMessages.labels.cpf) }));
        }
    };

    const handleEmailBlur = () => {
        if (formData.email && !isValidEmail(formData.email)) {
            setErrors(prev => ({ ...prev, email: validationMessages.invalid(uiMessages.labels.email) }));
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors<UserFormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = validationMessages.required(uiMessages.labels.fullName);
        }

        if (!formData.cpf.trim()) {
            newErrors.cpf = validationMessages.required(uiMessages.labels.cpf);
        } else if (!isValidCPF(formData.cpf)) {
            newErrors.cpf = validationMessages.invalid(uiMessages.labels.cpf);
        }

        if (!formData.email.trim()) {
            newErrors.email = validationMessages.required(uiMessages.labels.email);
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = validationMessages.invalid(uiMessages.labels.email);
        }

        if (!id) {
            if (!formData.password?.trim()) {
                newErrors.password = validationMessages.passwordRequiredNewUser;
            } else if (formData.password.length < 10 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                newErrors.password = validationMessages.passwordMinLengthStrong(10);
            }
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
        } catch (error) {
            const message = error instanceof Error ? error.message : actionMessages.saveError('usuário');
            setFormError(message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
        if (!parsedId || !isSelf) {
            showToast(actionMessages.passwordChangeSelfOnly, 'error');
            return;
        }
        try {
            await userService.changePassword(parsedId, currentPassword, newPassword);
            showToast(actionMessages.passwordChangeSuccess, 'success');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : actionMessages.passwordChangeError;
            showToast(errorMessage, 'error');
            throw error;
        }
    };

    if (loadingData) {
        return <LoadingState label={actionMessages.loading('usuário')} />;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-24 sm:pb-0">
            <PageHeader
                title={id ? uiMessages.pages.users.form.editTitle : uiMessages.pages.users.form.newTitle}
                subtitle={id ? uiMessages.pages.users.form.editSubtitle : uiMessages.pages.users.form.newSubtitle}
                leading={(
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full text-muted transition-colors"
                        aria-label={uiMessages.common.back}
                        title={uiMessages.common.back}
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
                                label={uiMessages.labels.fullName}
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
                                label={uiMessages.labels.cpf}
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
                            label={uiMessages.labels.email}
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleEmailBlur}
                            error={errors.email}
                            required
                            maxLength={254}
                        />

                        {!parsedId && (
                            <Input
                                id="password"
                                name="password"
                                label={uiMessages.pages.users.form.initialPasswordLabel}
                                type="password"
                                value={formData.password || ''}
                                onChange={handleChange}
                                error={errors.password}
                                required
                            />
                        )}
                    </div>
                </Card>

                <div className="fixed bottom-0 left-0 right-0 bg-card p-4 border-t border-border shadow-lg sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 flex justify-end space-x-4 z-50">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        {uiMessages.common.cancel}
                    </Button>
                    <Button type="submit" isLoading={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {uiMessages.common.save}
                    </Button>
                </div>
            </form>

            {isSelf && (
                <Card>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">{uiMessages.pages.users.form.securityTitle}</h3>
                            <p className="mt-1 text-sm text-muted">{uiMessages.pages.users.form.passwordHelp}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                <Key className="w-4 h-4 mr-2" />
                                {uiMessages.pages.users.form.changePasswordAction}
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
