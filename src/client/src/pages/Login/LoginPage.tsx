import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>(''); // 错误消息
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState('/assets/hide.png');

  const navigate = useNavigate();

  // 验证输入
  const validateInputs = (): string => {
    if (!username) {
      return 'Please enter your username';
    }
    if (!password) {
      return 'Please enter your password';
    }
    return '';
  };

  // 切换密码显示/隐藏
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setCurrentImage((prevImage) =>
      prevImage === '/assets/hide.png' ? '/assets/witness.png' : '/assets/hide.png'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(''); // 清除错误消息

    // 从 localStorage 中获取用户列表
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

    // 验证用户是否存在
    const userExists = existingUsers.find(
      (user: { username: string; password: string }) =>
        user.username === username && user.password === password
    );

    if (userExists) {
      navigate('/homepage'); // 跳转到主页
    } else {
      setError('Invalid username or password'); // 显示错误消息
    }
  };

  return (
    <div className="container mt-5">
      {/* 返回按钮 */}
      <button
        type="button"
        className="btn btn-outline"
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
        }}
        onClick={() => navigate('/')} // 返回到欢迎页
      >
        <img
          src="/assets/back.png"
          alt="Back"
          style={{
            width: '24px',
            height: '24px',
          }}
        />
      </button>

      <h2 className="text-start text-success fw-bold mb-4">Login</h2>

      <form className="text-start" style={{ maxWidth: '400px' }} onSubmit={handleSubmit}>
        {/* 用户名输入框 */}
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* 密码输入框 */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="input-group">
            <input
              type={passwordVisible ? 'text' : 'password'} // 动态切换输入类型
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={togglePasswordVisibility} // 切换密码可见性
            >
              <img
                src={currentImage}
                alt="Toggle Visibility"
                style={{
                  width: '24px',
                  height: '24px',
                }}
              />
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="alert alert-danger" style={{ maxWidth: '400px' }}>
            {error}
          </div>
        )}

        {/* 登录按钮 */}
        <button type="submit" className="btn btn-success w-100">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

