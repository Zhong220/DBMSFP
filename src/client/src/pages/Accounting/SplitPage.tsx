<<<<<<< HEAD
import React, { useState } from "react";

const SplitPage: React.FC = () => {
  // 假資料
  const [transactions] = useState([
    {
      id: 1,
      payer: "Alice",
      totalAmount: 1000,
      splitters: [
        { name: "Bob", amount: 400 },
        { name: "Charlie", amount: 300 },
        { name: "Alice", amount: 300 },
      ],
      date: "2025-01-12",
      description: "Dinner",
      category: "飲食",
      note: "Team dinner at restaurant",
    },
    {
      id: 2,
      payer: "Bob",
      totalAmount: 600,
      splitters: [
        { name: "Alice", amount: 200 },
        { name: "Charlie", amount: 200 },
        { name: "Bob", amount: 200 },
      ],
      date: "2025-01-10",
      description: "Movie night",
      category: "娛樂",
      note: "Cinema tickets",
    },
  ]);

  // 計算借貸關係
  const calculateDebts = () => {
    const debts: Record<string, Record<string, number>> = {};

    transactions.forEach((transaction) => {
      const { payer, splitters } = transaction;

      splitters.forEach((splitter) => {
        if (splitter.name !== payer) {
          if (!debts[splitter.name]) debts[splitter.name] = {};
          if (!debts[splitter.name][payer]) debts[splitter.name][payer] = 0;

          debts[splitter.name][payer] += splitter.amount;
        }
      });
    });

    return debts;
  };

  const debts = calculateDebts();

  return (
    <div className="container mt-5">
      <h2 className="text-center text-success mb-4">分帳結果</h2>

      {/* 顯示交易列表 */}
      <div className="mb-4">
        <h4 className="text-primary">交易記錄</h4>
        {transactions.map((transaction) => (
          <div key={transaction.id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{transaction.description}</h5>
              <h6 className="card-subtitle mb-2 text-muted">
                日期: {transaction.date} | 分類: {transaction.category}
              </h6>
              <p className="card-text">
                <strong>付款人:</strong> {transaction.payer}
              </p>
              <p className="card-text">
                <strong>總金額:</strong> ${transaction.totalAmount}
              </p>
              <p className="card-text">
                <strong>分帳者:</strong>
                {transaction.splitters.map((splitter, index) => (
                  <div key={index}>
                    {splitter.name}: ${splitter.amount}
                  </div>
                ))}
              </p>
              <p className="card-text">
                <strong>備註:</strong> {transaction.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 顯示借貸關係 */}
      <div className="mb-4">
        <h4 className="text-primary">借貸關係</h4>
        {Object.entries(debts).map(([borrower, creditors]) => (
          <div key={borrower} className="mb-3">
            <strong>{borrower} 欠款:</strong>
            <ul className="list-group">
              {Object.entries(creditors).map(([creditor, amount]) => (
                <li key={creditor} className="list-group-item">
                  欠 {creditor}: ${amount.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        ))}
=======
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SplitDetails {
  payer: string;
  splitters: { name: string; amount: string }[];
  totalAmount: string;
  description: string;
  date: string;
}

const SplitPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const transactionDetails = location.state as SplitDetails;

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h2 className="text-warning">Detail</h2>
      </div>

      {/* Group Name & Transaction Info */}
      <div className="mb-3 text-center">
        <div className="mb-1">GroupName-ChannelName</div>
        <div className="d-flex justify-content-center align-items-center gap-3">
          <div>
            <strong>{transactionDetails.date}</strong>
          </div>
          <div>
            <strong>${transactionDetails.totalAmount}</strong> {transactionDetails.description}
          </div>
        </div>
      </div>

      {/* Split Results */}
      <div className="mb-4">
        <h5>Split Result</h5>
        <div className="border p-3 rounded">
          {transactionDetails.splitters.map((splitter, index) => (
            <div
              key={index}
              className="d-flex justify-content-between align-items-center mb-3"
            >
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-secondary text-white text-center" style={{ width: '40px', height: '40px', lineHeight: '40px' }}>
                  {transactionDetails.payer}
                </div>
                <span className="ms-2">${splitter.amount}</span>
              </div>
              <div className="arrow text-warning">→</div>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-secondary text-white text-center" style={{ width: '40px', height: '40px', lineHeight: '40px' }}>
                  {splitter.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Button */}
      <div className="text-center mb-4">
        <button className="btn btn-warning px-4" onClick={() => navigate('/')}>
          Confirm
        </button>
      </div>

      {/* Search Section */}
      <div className="border-top pt-3">
        <p>搜尋分帳結果</p>
        <ul>
          <li>用 Transaction 的資料欄位查詢</li>
          <li>依 User 名稱查詢</li>
        </ul>
>>>>>>> new_friend_list
      </div>
    </div>
  );
};

export default SplitPage;

