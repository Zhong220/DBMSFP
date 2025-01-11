import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("gmail.com"); // 默认域名
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>(""); // 错误信息
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("/assets/hide.png");

  const navigate = useNavigate();

  // 验证输入
  const validateInputs = (): string => {
    if (!username) {
      return "Please enter a username";
    }
    if (!email) {
      return "Please enter an email";
    }
    if (!password) {
      return "Please enter a password";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(""); // 清除错误信息

    // 组合完整 Email 地址
    const fullEmail = `${email}@${domain}`;

    // 从 localStorage 获取用户列表
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const newUser = { username, email: fullEmail, password };
    const updatedUsers = [...existingUsers, newUser];

    // 保存用户到 localStorage
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    alert("Registration successful! You can now log in.");
    navigate("/login"); // 跳转到登录页面
  };

  // 切换密码可见性
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setCurrentImage((prevImage) =>
      prevImage === "/assets/hide.png" ? "/assets/witness.png" : "/assets/hide.png"
    );
  };

  return (
    <div className="container mt-5">
      <h2 className="text-start text-primary fw-bold mb-4">
        Create an account
      </h2>
      <form
        className="text-start"
        style={{ maxWidth: "400px" }}
        onSubmit={handleSubmit}
      >
        {/* 用户名 */}
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

        {/* Email 输入 */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="input-group-text">@</span>
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

        {/* 密码输入 */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="input-group">
            <input
              type={passwordVisible ? "text" : "password"} // 动态切换输入框类型
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={togglePasswordVisibility} // 切换密码显示状态
            >
              <img
                src={currentImage}
                alt="Toggle Visibility"
                style={{
                  width: "24px",
                  height: "24px",
                }}
              />
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="alert alert-danger" style={{ maxWidth: "400px" }}>
            {error}
          </div>
        )}

        {/* 提交按钮 */}
        <button type="submit" className="btn btn-primary w-100 mb-3">
          Get Started
        </button>

        {/* 跳转到登录页按钮 */}
        <button
          type="button"
          className="btn btn-light w-100"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default SignUpPage;

