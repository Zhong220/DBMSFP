import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./styles.css";

const LoginPage: React.FC = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');/* 存取錯誤訊息 */
  const [currentImage, setCurrentImage] = useState('/assets/hide.png');
  const [showModal, setShowModal] = useState(false); // 控制彈窗顯示


  /* 驗證有效輸入 */
  const validateInputs = (): string => {
    if (!username) {
      return 'Enter an username🤨';
    }
    if (!password) {
      return 'Enter a password🤨';
    }
    return '';
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      setShowModal(true);
      return;
    }

    const payload = {
      username,
      password
    };
    try {
      const response = await fetch("http://127.0.0.1:5001/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Login successful!");
        navigate("/homepage");  // 登入成功後跳轉到用戶資料頁面
      } else {
        setError(data.error || "Invalid username or password.");
        setShowModal(true);
      }
    } catch (error) {
      setError("An error occurred during login.");
      setShowModal(true);
    }
  };
  /* 獲取導航函數 */
  const navigate = useNavigate(); 

  /* 改變密碼圖示顯示狀態 */
  const [passwordVisible, setPasswordVisible]=useState(false);
  /*const [imageVisible, setImageVisible]=useState(false);（問題：UNUSED VARIABLE 2）*/

  /* 切換密碼顯示或隱藏 */
  const handleShowPassword = () => {
    setPasswordVisible(true);
    /*setImageVisible(true) HEREEE */ 
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
      <h2 className="title-text"
      >Login</h2>
      <form className="text-start" 
      style={{ 
        maxWidth: '400px' 
      }} 
      onSubmit={handleLogin}>
        <div className="input-container">
          <label htmlFor="username" className="subtitle-text">
            Username
          </label>
          <input type="text" 
            className="input-field" 
            id="username" 
            placeholder="Enter your username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="subtitle-text">Password</label>
          <div className="input-group">
            <input
              type={passwordVisible ? 'text' : 'password'} // 動態設置輸入框類型
              className="input-field"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
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
        <button 
          type="submit" 
          className="start-button">Login
        </button>
        </form>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <p className="error-text">{error}</p>
            <button className="close-button" onClick={() => setShowModal(false)}>Close</button>
        </div> {/* 顯示錯誤訊息 */}
      </div>
      )}
    </div>
  );
};

export default LoginPage;
