import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>(''); // 错误消息
  const [currentImage, setCurrentImage] = useState('/assets/hide.png');

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
      setError('Invalid username or password');
    }
=======
/* import witnessIcon from '../../assets/hide.png'; */

const LoginPage: React.FC = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');/* 存取錯誤訊息 */
  const [currentImage, setCurrentImage] = useState('/assets/hide.png');

  // 模擬用戶數據 （問題：UNUSED VARIABLE 1）
  /*const mockUsers = [
    { username: 'testuser', password: 'testpassword' },
    { username: 'admin', password: 'adminpassword' },
  ]; */

  /* 驗證有效輸入 */
  const validateInputs = (): string => {
    if (!username) {
      return 'Enter an username';
    }
    if (!password) {
      return 'Enter a password';
    }
    /*if (password.length < 8) {
      return 'Use 8 characters or more for your password';
    }*/
    return '';
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError); /* 設置錯誤訊息 */
      return;
    }
    setError(''); /* 清除錯誤訊息 */

    // 從 localStorage 中讀取用戶列表
  const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

  // 驗證用戶是否存在
  const userExists = existingUsers.find(
    (user: { username: string; password: string }) =>
      user.username === username && user.password === password
  );

  if (userExists) {
    navigate('/homepage'); // 跳轉到 HomePage
  } else {
    setError('Invalid username or password'); // 顯示錯誤訊息
  }

    /*console.log('登入資訊:', { username, password });

    if (username === 'test' && password === 'password') {
      navigate('/homepage'); // 跳轉到 HomePage
    } else {
      setError('Invalid username or password');
    }*/
>>>>>>> new_friend_list

  };

  

  /* 獲取導航函數 */
  const navigate = useNavigate(); 

  /* 改變密碼圖示顯示狀態 */
  const [passwordVisible, setPasswordVisible]=useState(false);
<<<<<<< HEAD
  const [imageVisible, setImageVisible]=useState(false);
  console.log(imageVisible);
=======
  /*const [imageVisible, setImageVisible]=useState(false);（問題：UNUSED VARIABLE 2）*/
>>>>>>> new_friend_list

  /* 切換密碼顯示或隱藏 */
  const handleShowPassword = () => {
    setPasswordVisible(true);
<<<<<<< HEAD
    setImageVisible(true)
=======
    /*setImageVisible(true) HEREEE */ 
>>>>>>> new_friend_list
    setTimeout(() => {
      setPasswordVisible(false);
      setCurrentImage('/assets/hide.png');
    },1000);/* 設置為1sec後隱藏 */
    setCurrentImage((prevImage) =>
      prevImage === '/assets/hide.png' ? '/assets/witness.png' : '/assets/hide.png'
    );
  };
  /* const handleShowPassword = () => {
    setPasswordVisible(!passwordVisible); // 每次點擊切換顯示狀態
  }; */

  return (
<<<<<<< HEAD
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
=======
    /* 定義一個容器<div> */
    <div className="container mt-5">
      <button
          type="button"
          className="btn btn-outline"
          style={{ 
            position: 'absolute',  // 固定定位
            top: '10px',        // 頂部距離
            left: '10px',       // 左側距離
            zIndex: 1000 
          }}
          onClick={() => navigate('/')} // 跳回welcomePage
        >
          <img 
                src="/assets/back.png"
                style={{ 
                  width: '24px', 
                  height: '24px' 
                }} 
              />
      </button>
      <h2 className="text-start text-success fw-bold mb-4"
      >Login</h2>
      <form className="text-start" style={{ maxWidth: '400px' }} onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input type="text" 
            className="form-control" 
            id="username" 
            placeholder="Enter your username" 
>>>>>>> new_friend_list
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
<<<<<<< HEAD

        {/* 密码输入框 */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="input-group">
            <input
              type={passwordVisible ? 'text' : 'password'} // 动态切换输入类型
=======
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="input-group">
            <input
              type={passwordVisible ? 'text' : 'password'} // 動態設置輸入框類型
>>>>>>> new_friend_list
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
<<<<<<< HEAD
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
=======
              className="btn btn-outline-secondary" 
              onClick={handleShowPassword} // 點擊切換顯示狀態
            >
              <img 
                src={currentImage}
                style={{ 
                  width: '24px', 
                  height: '24px' 
                }} 
              />
              {/* {passwordVisible ? '隱藏' : '顯示'} */}
            </button>
          </div>
        </div>
        {error && <div 
          className="btn alert alert-danger"
          style={{
            width: '400px',
          }}
        >
        {error}
        </div>} {/* 顯示錯誤訊息 */}
        <button 
          type="submit" 
          className="btn btn-success w-100">Login
>>>>>>> new_friend_list
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
<<<<<<< HEAD

=======
>>>>>>> new_friend_list
