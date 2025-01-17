import React, { useState, useEffect } from "react";
import "./SplitPage.css";

interface SplitRecord {
  split_id: number;
  transaction_id: number;
  debtor_id: number;
  payer_id: number;
  amount: number;
}

const SplitPage: React.FC = () => {
  const [splits, setSplits] = useState<SplitRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSplits = async () => {
      try {
        const resp = await fetch("http://localhost:5005/api/split");
        if (!resp.ok) {
          throw new Error(`Server Error: ${resp.status}`);
        }
        const data = await resp.json();
        if (data.data) {
          const formattedSplits = data.data.map((split: any) => ({
            split_id: split.split_id,
            transaction_id: split.transaction_id,
            debtor_id: split.debtor_id,
            payer_id: split.payer_id,
            amount: split.amount,
          }));
          setSplits(formattedSplits);
        }
      } catch (err: any) {
        console.error("Error fetching splits:", err);
        setError(err.message);
      }
    };
    fetchSplits();
  }, []);

  if (error) {
    return <div className="split-error-message">無法取得分帳紀錄: {error}</div>;
  }

  if (!splits.length) {
    return <div className="split-empty-message">目前沒有任何分帳紀錄</div>;
  }

  return (
    <div className="split-page-container">
      <h2 className="split-page-title">所有分帳紀錄</h2>
      <div className="split-table-container">
        <table className="split-table">
          <thead>
            <tr>
              <th>split_id</th>
              <th>transaction_id</th>
              <th>debtor_id</th>
              <th>payer_id</th>
              <th>amount</th>
            </tr>
          </thead>
          <tbody>
            {splits.map((s) => (
              <tr key={s.split_id}>
                <td>{s.split_id}</td>
                <td>{s.transaction_id}</td>
                <td>{s.debtor_id}</td>
                <td>{s.payer_id}</td>
                <td>{s.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="back-to-home-button">返回首頁</button>
    </div>
  );
};

export default SplitPage;
