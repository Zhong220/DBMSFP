import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

interface Transaction {
  item: string;
  amount: number;
  description: string;
  transaction_date: string;
  category_id: number;
  payer_id: number;
  split_count: number;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const months = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Fetch transactions on load
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ transactions: Transaction[] }>(
          "http://localhost:5000/api/transaction/list"
        );
        setTransactions(response.data.transactions);
        setLoading(false);
      } catch (err) {
        setError("無法獲取交易記錄，請稍後重試");
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const totalExpense = transactions.reduce((sum, entry) => sum + entry.amount, 0);

  const goToPreviousMonth = () => {
    setCurrentMonthIndex((prevIndex) =>
      prevIndex === 0 ? months.length - 1 : prevIndex - 1
    );
  };

  const goToNextMonth = () => {
    setCurrentMonthIndex((prevIndex) =>
      prevIndex === months.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-container">
      <div className="header">
        <button onClick={goToPreviousMonth} className="arrow-button">
          &#8249;
        </button>
        <h2 className="month-title">{months[currentMonthIndex]}</h2>
        <button onClick={goToNextMonth} className="arrow-button">
          &#8250;
        </button>
      </div>

      <div className="pie-chart-container">
        <svg viewBox="0 0 32 32" className="pie-chart">
          <defs>
            <radialGradient id="gradient-circle" cx="50%" cy="50%" r="50%">
              <stop offset="50%" stopColor="#FFECF5" />
              <stop offset="100%" stopColor="#F1E1FF" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="16" fill="url(#gradient-circle)" />
        </svg>
        <div className="total-expense">${totalExpense}</div>
      </div>

      <div className="transaction-records">
        <div className="transaction-header">
          <div>帳務紀錄✨</div>
          <button
            className="search-button"
            onClick={() => setIsSearchModalOpen(true)}
          >
            🔍
          </button>
        </div>

        <div className="transaction-table-header">
          <div>名稱</div>
          <div>金額</div>
          <div>描述</div>
          <div>日期</div>
        </div>

        <div className="transaction-table-body">
          <table className="transaction-table">
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.item}</td>
                  <td
                    className={
                      transaction.amount < 0 ? "negative" : "positive"
                    }
                  >
                    {transaction.amount < 0
                      ? `-$${Math.abs(transaction.amount)}`
                      : `$${transaction.amount}`}
                  </td>
                  <td>{transaction.description}</td>
                  <td>{transaction.transaction_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isSearchModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>篩選交易記錄</h3>
            <input
              type="text"
              placeholder="輸入關鍵字"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={() => setIsSearchModalOpen(false)}>關閉</button>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button className="add-button" onClick={() => navigate("/add")}>
          ✒️
        </button>
        <button
          className="view-score-button"
          onClick={() => navigate("/score")}
        >
          信譽積分
        </button>
      </div>

      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        {isSidebarOpen && (
          <div className="sidebar-content">
            <ul>
              <li>
                <button onClick={() => navigate("/friendlist")}>
                  好友清單
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/accounting")}>
                  分帳紀錄
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/settings")}>個人檔案</button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? "<" : ">"}
      </button>
    </div>
  );
};

export default HomePage;
