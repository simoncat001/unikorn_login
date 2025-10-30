import BackendEndpoints from "./BackendEndpoints";
import ApiProvider from "./ApiProvider";
import AuthService from "./AuthService";
import { ERROR_PATH, NOT_FOUND_PATH } from "../common/Path";

export type UserAdd = {
  user_name: string;
  display_name: string;
  country: string;
  organization: string;
  user_number: string;
  user_type: string;
};

export type UserAddInfo = {
  status: number;
};

export type UserResponse = {
  status: number;
  data: UserAdd[];
};

export type UserListData = {
  user_name: string;
  display_name: string;
  country: string;
  organization: string;
  user_number: string;
  user_type: string;
};

const addUser: (data: string) => Promise<UserAddInfo> = async (data) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/user_add/", {
      user_json_data: data,
    });
    const UserAddInfoObject: UserAddInfo =
      (await response.json()) as UserAddInfo;
    return UserAddInfoObject;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getUserList: (start: number, size: number) => Promise<UserResponse> =
  async (start, size) => {
    try {
      let response = await ApiProvider.apiProviderPost("/api/admin/user_list", {
        start: start,
        size: size,
        status_filter: "",
      });
      const userList: UserResponse = (await response.json()) as UserResponse;
      return userList;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

// 登录方法
const login: (username: string, password: string) => Promise<boolean> = async (username, password) => {
  return AuthService.login(username, password);
};

const navigateToLogin = () => {
  // 清除现有令牌
  AuthService.clearTokens();
  
  // 直接导航到本地登录页面，使用后端JWT认证
  window.location.assign(`/login`);
};

const navigateToLogout = async () => {
  // 使用AuthService的注销方法，完全使用后端JWT认证的注销流程
  AuthService.logout();
};

const navigateToErrorPage = () => {
  const targetLinkURI = `${window.location.protocol}//${window.location.host}${ERROR_PATH}`;
  window.location.assign(targetLinkURI);
};

const navigateToNotFoundPage = () => {
  const targetLinkURI = `${window.location.protocol}//${window.location.host}${NOT_FOUND_PATH}`;
  window.location.assign(targetLinkURI);
};

const getUserCount: () => Promise<number> = async () => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/admin/user_count");
    const responseData = await response.json();
    const userCount: number = responseData["count"] as number;
    return userCount;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const deleteUser: (uuid: string) => Promise<number> = async (uuid) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/admin/delete_user/".concat(uuid)
    );
    const responseData = await response.json();
    return responseData["status"];
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const canDeleteUser: (uuid: string) => Promise<boolean> = async (uuid) => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/admin/can_delete_user/".concat(uuid)
    );
    const responseData = await response.json();
    return responseData;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getUserName: () => Promise<string> = async () => {
  try {
    let response = await ApiProvider.apiProviderGet("/api/userinfo/");
    const responseData = await response.json();
    return responseData["username"] as string;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getUserDisplayName: () => Promise<string> = async () => {
  try {
    let response = await ApiProvider.apiProviderGet("/api/userinfo/");
    const responseData = await response.json();
    return responseData["display_name"] as string;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const isLoggedIn: () => Promise<boolean> = async () => {
  // 首先检查本地是否有令牌
  if (AuthService.isLoggedIn()) {
    return true;
  }
  
  // 如果没有令牌，尝试调用API检查登录状态（兼容旧版行为）
  try {
    var fetchConfig: RequestInit = {};
    fetchConfig.method = "GET";
    fetchConfig.redirect = "manual";
    let response = await fetch("/api/userinfo/", fetchConfig);
    return response.ok;
  } catch (error) {
    return false;
  }
};

const exportUserAdd = {
  addUser,
  getUserList,
  getUserCount,
  getUserName,
  getUserDisplayName,
  deleteUser,
  canDeleteUser,
  isLoggedIn,
  navigateToLogin,
  navigateToErrorPage,
  navigateToNotFoundPage,
  navigateToLogout,
  login,
};

export default exportUserAdd;
