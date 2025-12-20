export const buildAuthUser = (user) => ({
    id: user.id,
    name: user.name,
    cpf: user.cpf,
    email: user.email,
    username: user.username,
    isAuthenticated: true
});

export const buildAuthResponse = (user) => ({
    user: buildAuthUser(user)
});
