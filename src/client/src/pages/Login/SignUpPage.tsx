import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>(""); /* 存取錯誤訊息 */
  const [currentImage, setCurrentImage] = useState("/assets/hide.png");
  const [showModal, setShowModal] = useState(false); // 控制彈窗顯示

  /* 驗證有效輸入 */
  const validateInputs = (): string => {
    if (!username) {
      return "Enter your username🤨";
    }
    if (!email) {
      return "Enter your email🤨"
    }
    if (!password) {
      return "Enter your password🤨";
    }
    if (password.length < 8) {
      return "Use 8 characters or more for your password💪";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      setShowModal(true);
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:5001/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        setError(data.error || "Something went wrong.");
        setShowModal(true);
      }
    } catch (error) {
      setError("An error occurred while registering. Please try again.");
      setShowModal(true);
    }
  };

  /* 獲取導航函數 */
  const navigate = useNavigate();

  /* 改變密碼顯示狀態 */
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  console.log(imageVisible); // 測試用

  /* 切換密碼顯示或隱藏 */
  const handleShowPassword = () => {
    setPasswordVisible(true);
    /* HERE 2 setImageVisible(true);*/
    setTimeout(() => {
      setPasswordVisible(false);
      setCurrentImage("/assets/hide.png");
    }, 1000); /* 設置為1sec後隱藏 */
    setCurrentImage((prevImage) =>
      prevImage === "/assets/hide.png"
        ? "/assets/witness.png"
        : "/assets/hide.png"
    );
  };

  return (
    <div className="container mt-5">
      <h2 className="title-text">
        Create an account
      </h2>
      <form
        className="text-start"
        style={{ maxWidth: "400px" }}
        onSubmit={handleSubmit}
      >
        <div className="input-container">
          <label htmlFor="username" className="subtitle-text">
            Username
          </label>
          <input
            type="text"
            className="input-field"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="subtitle-text">
            Email
          </label>
          <div className="input-group">
            {/* 輸入框 */}
            <input
              type="text"
              className="input-field"
              id="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* @ */}
            <span className="input-group-text"
            style={{
              width: "40px",
              height: "45px"
            }}
            >@</span>
            {/* 下拉式選單 */}
            <select
              className="form-select"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              <option value="gmail.com">gmail.com</option>
              <option value="yahoo.com">yahoo.com</option>
              <option value="outlook.com">outlook.com</option>
              <option value="icloud.com">icloud.com</option>
              <option value="custom.com">custom.com</option>
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="subtitle-text">
            Password
          </label>
          <div className="input-group">
            <input
              type={passwordVisible ? "text" : "password"} // 動態設置輸入框類型
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
                  width: "24px",
                  height: "24px",
                }}
              />
            </button>
          </div>
        </div>
        <button type="submit" className="login-button">
          GET STARTED
        </button>
        <button
          type="button"
          className="login-button"
          onClick={() => navigate("/Login")}
        >
          Login:
        </button>
        </form>

        {/* 顯示錯誤訊息 */}
        {showModal && ( 
          <div className="modal-overlay">
            <div className="modal-box">
              <p className="error-text">{error}</p>
            <button className="close-button" onClick={() => setShowModal(false)}>Close</button>
        </div>
      </div>
      )}
    </div>
  );
};

export default SignUpPage;
