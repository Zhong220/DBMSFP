import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 假資料，用於顯示開銷比例
  const data = [
    { name: 'Food', value: 400 },
    { name: 'Rent', value: 800 },
    { name: 'Entertainment', value: 300 },
    { name: 'Others', value: 200 },
  ];

  // 定義每個部分的顏色
  const COLORS = ['#FFBB28', '#FF8042', '#0088FE', '#00C49F'];

  // 計算圓形比例圖路徑
  const calculatePiePaths = () => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0); // 總開銷
    let startAngle = 0; // 起始角度

    return data.map((entry, index) => {
      const value = entry.value / total; // 每部分所占比例
      const endAngle = startAngle + value; // 計算結束角度

      // 計算起點和終點的座標（SVG 圓弧）
      const x1 = Math.cos(2 * Math.PI * startAngle) * 16 + 16;
      const y1 = Math.sin(2 * Math.PI * startAngle) * 16 + 16;
      const x2 = Math.cos(2 * Math.PI * endAngle) * 16 + 16;
      const y2 = Math.sin(2 * Math.PI * endAngle) * 16 + 16;
      const largeArc = value > 0.5 ? 1 : 0; // 判斷是否需要大弧

      // 定義 SVG 路徑指令
      const path = `M16 16 L${x1} ${y1} A16 16 0 ${largeArc} 1 ${x2} ${y2} Z`;
      startAngle = endAngle; // 更新起始角度

      // 返回對應的 <path>
      return (
        <path key={index} d={path} fill={COLORS[index % COLORS.length]} />
      );
    });
  };

  return (
    <div className="container mt-5 position-relative">
      {/* 頁面標題 */}
      <h2 className="text-center text-secondary mb-4">HomePage</h2>

      {/* 圓形圖表及資訊區域 */}
      <div className="text-center">
        <div style={{ width: '200px', height: '200px', position: 'relative', margin: '0 auto' }}>
          {/* 圓形圖表使用 SVG 描述比例圖 */}
          <svg viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            {calculatePiePaths()}
          </svg>
        </div>
        <div className="mt-3">
          <p>Expence</p>
          <h5>$5,000,000,000</h5>
        </div>
      </div>

      {/* 記錄區域 */}
      <div className="mt-4 p-3 bg-dark text-white rounded">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">Record</h5>
          <button className="btn btn-warning">Split</button>
        </div>
        <table className="table table-dark table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Details</th>
              <th>Done</th>
            </tr>
          </thead>
          <tbody>
            {/* 暫無記錄提示 */}
            <tr>
              <td colSpan={4} className="text-center text-muted">
                No Records Yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 新增按鈕 */}
      <div className="text-center mt-4">
        <button
          className="btn btn-secondary btn-lg rounded-circle"
          style={{ width: '60px', height: '60px' }}
          onClick={() => navigate('/add')}
        >
          +
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/score')}>
          個人積分
        </button>
      </div>

      {/* 側邊欄 */}
      <div
        className={`position-fixed top-0 end-0 bg-light shadow h-100 transition-all ${
          isSidebarOpen ? 'w-25' : 'w-0'
        }`}
        style={{ overflow: 'hidden' }}
      >
        {isSidebarOpen && (
          <div className="p-3">
            <button
              className="btn btn-secondary mb-3"
              onClick={() => setIsSidebarOpen(false)}
            >
              關閉
            </button>
            <ul className="list-unstyled">
              <li>
                <button className="btn btn-link" onClick={() => navigate('/friendlist')}>
                  好友清單
                </button>
              </li>
              <li>
                <button className="btn btn-link" onClick={() => navigate('/accounting')}>
                  分帳功能
                </button>
              </li>
              <li>
                <button className="btn btn-link" onClick={() => navigate('/settings')}>
                  設定
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* 側邊欄切換按鈕 */}
      <button
        className="btn btn-primary position-fixed top-50 end-0 translate-middle-y"
        style={{ zIndex: 1050 }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '<' : '>'}
      </button>
    </div>
  );
};

export default HomePage;
