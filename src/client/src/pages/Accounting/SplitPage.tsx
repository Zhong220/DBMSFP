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
      </div>
    </div>
  );
};

export default SplitPage;

