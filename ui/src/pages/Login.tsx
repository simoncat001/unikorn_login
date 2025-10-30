import React, { useState } from 'react';
import UserService from '../api/UserService';
import { useHistory } from 'react-router-dom';
import '../App.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单的表单验证
    if (!username || !password) {
      setErrorMessage('请输入用户名和密码');
      return;
    }

    // 添加组件挂载状态检查
    let localIsMounted = true;
    
    if (localIsMounted) {
      setIsLoading(true);
      setErrorMessage('');
    }

    try {
      // 使用新的登录方法
      const success = await UserService.login(username, password);
      
      if (success) {
        // 登录成功，导航到首页
        history.push('/');
        // 刷新页面以确保所有组件都能获取到新的认证状态
        window.location.reload();
        // 标记组件已卸载（因为要刷新页面）
        localIsMounted = false;
        return;
      } else if (localIsMounted) {
        setErrorMessage('用户名或密码错误');
      }
    } catch (error) {
      console.error('登录失败:', error);
      if (localIsMounted) {
        setErrorMessage('登录失败，请稍后重试');
      }
    } finally {
      // 确保只在组件未卸载时更新状态
      if (localIsMounted) {
        setIsLoading(false);
      }
    }
  };
  
  // 添加useEffect清理函数来防止内存泄漏
  React.useEffect(() => {
    let isMounted = true;
    
    // 检查登录状态
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await UserService.isLoggedIn();
        if (loggedIn && isMounted) {
          history.push('/');
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
      }
    };
    
    checkLoginStatus();
    
    // 清理函数
    return () => {
      isMounted = false;
    };
  }, [history]);



  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2 className="login-title">MGSDB登录</h2>
        {errorMessage && (
          <div className="login-error">{errorMessage}</div>
        )}
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              disabled={isLoading}
              className="login-input"
            />
          </div>
          <div className="login-form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              disabled={isLoading}
              className="login-input"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;