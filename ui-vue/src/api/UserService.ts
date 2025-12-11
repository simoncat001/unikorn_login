import AuthService from "./AuthService";

const login: (username: string, password: string) => Promise<boolean> = async (
    username,
    password
) => {
    try {
        await AuthService.login(username, password);
        return true;
    } catch (error) {
        console.error("登录失败", error);
        throw error;
    }
};

const logout: () => Promise<void> = async () => {
    await AuthService.logout();
};

const UserService = {
    login,
    logout,
};

export default UserService;
