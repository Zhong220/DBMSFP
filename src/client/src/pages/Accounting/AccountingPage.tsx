import React, { useEffect, useState } from "react";
import "./styles.css"
 const AccountingPage: React.FC = () => {
   const [payer, setPayer] = useState("6"); // 預設登入用戶是 testuser（user_id: 6）
   const [amount, setAmount] = useState("");
   const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // 預設當天日期
   const [splitters, setSplitters] = useState<string[]>([]); // 債務人 ID
   const [description, setDescription] = useState("");
   const [category, setCategory] = useState("");
   const [note, setNote] = useState("");
   const [loading, setLoading] = useState(false);
   const [friends, setFriends] = useState<any[]>([]); // 儲存好友列表（完整數據）
   const [categories, setCategories] = useState<any[]>([]); // 儲存分類列表
   const [modalMessage, setModalMessage] = useState<string | null>(null); // 控制 Modal 消息

   // 模擬當前登入用戶
   const loggedInUser = { id: "43", name: "monkeyuser1" };

   // 獲取好友列表
   useEffect(() => {
     const fetchFriends = async () => {
       try {
         const response = await fetch(
           `http://127.0.0.1:5001/api/friendslist?user_id=${loggedInUser.id}`
         );
         if (!response.ok) {
			throw new Error("無法獲取好友列表😢");
         }

         const result = await response.json();

         // 調試用：打印原始數據
         console.log("原始好友數據:", result);

         // 將整個數據存入狀態
         setFriends(result);

         // 調試用：確認狀態是否更新
         console.log("存入的好友數據:", result);
       } catch (error) {
         console.error("Error fetching friends:", error);
		 setModalMessage("獲取好友列表失敗😢請稍後再試！");
      }
    };
     fetchFriends();
   }, []);

   // 獲取分類列表
   useEffect(() => {
     const fetchCategories = async () => {
       try {
         const response = await fetch("http://127.0.0.1:5001/api/transaction/categories");
         if (!response.ok) {
           throw new Error("無法獲取分類列表");
         }

         const result = await response.json();
         setCategories(result.data || []);
       } catch (error) {
         console.error("Error fetching categories:", error);
         alert("獲取分類列表失敗，請稍後再試！");
       }
     };
     fetchCategories();
   }, []);

   const handleSplitterChange = (userId: string) => {
     setSplitters((prev) =>
       prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };
  const handleSubmit = async () => {
    try {
      if (!description.trim()) {
        setModalMessage("請輸入交易名稱🧑‍🔧");
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        setModalMessage("請輸入有效金額💸");
        return;
      }
      if (!splitters.length) {
         setModalMessage("請選擇至少一個分帳者😟");
         return;
       }
       if (!category) {
         alert("請選擇分類！");
         return;
       }

       setLoading(true);

       const payload = {
         item: description,
         amount: parseFloat(amount),
         description: note,
         transaction_date: date,
         category_id: parseInt(category, 10),
         payer_id: parseInt(payer, 10),
         splitters: splitters.map((debtor_id) => parseInt(debtor_id, 10)),
       };

       console.log("Submitting payload:", payload); // 調試用
       const response = await fetch("http://127.0.0.1:5001/api/transaction/split", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "⛔提交失敗，請稍後再試！⛔");
      }
      const result = await response.json();
      console.log("API Response:", result); // 調試用
      if (!result || !result.data || !result.data.transaction_id) {
        alert("提交成功，但未返回交易ID！");
        return;
      }
      alert(`交易已提交成功！交易ID: ${result.data.transaction_id}`);
      // 重置表單
      setPayer(loggedInUser.id);
      setAmount("");
       setDate(new Date().toISOString().split("T")[0]);
       setSplitters([]);
       setDescription("");
       setCategory("");
       setNote("");
     } catch (error) {
       if (error instanceof Error) {
        alert(error.message);
      } else {
        setModalMessage("⚠️未知錯誤⚠️");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mt-5">
      <h2 className="title-text"
      >Add bill</h2>
      <div className="subtitle-text">
		<label className="subtitle-text">Description</label>
        <input
          type="text"
          className="form-control"
          style={{
            border: "1px solid rgb(189, 103, 235)",
            backgroundColor: "rgb(255, 255, 255)"
          }}
          placeholder="輸入交易名稱"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="subtitle-text">
        <label className="subtitle-text">Amount</label>
        <input
          type="number"
          className="form-control"
          style={{
            border: "1px solid rgb(189, 103, 235)",
            backgroundColor: "rgb(255, 255, 255)"
          }}
          placeholder="輸入金額"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
		</div>
      <div className="mb-3 d-flex align-items-center"
        style={{
          whiteSpace: "nowrap", // 防止文字換行
        }}
      >
        <label className="participant-text">Paid by</label>
        <select
          className="form-select"
          style={{
            marginTop: "8px",
            border: "1px solid rgb(189, 103, 235)",
            backgroundColor: "rgb(255, 255, 255)"
          }}
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
          disabled
        >
          <option value={loggedInUser.id}>{loggedInUser.name}</option>
        </select>
      </div>
      <div className="subtitle-text">
        <label className="subtitle-text">Date</label>
        <input
          type="date"
          className="form-control"
          style={{
            border: "1px solid rgb(189, 103, 235)",
            backgroundColor: "rgb(255, 255, 255)"
          }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="subtitle-text">
        <label className="subtitle-text">Category</label>
        <div className="button-group" style={{ marginTop: "10px" }}>
          {/* 按鈕選項 */}
          <button
            className={`btn ${category === "1" ? "active" : ""}`}
            onClick={() => setCategory("1")}
            style={{
              marginRight: "10px",
              fontSize: "14px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              padding: "5px 16px",
              backgroundColor: category === "1" ? "#ae60f3" : "#f8f9fa",
              color: category === "1" ? "#fff" : "#4c4c4c",
              cursor: "pointer",
            }}
          >
            🍗Food
          </button>
          <button
            className={`btn ${category === "2" ? "active" : ""}`}
            onClick={() => setCategory("2")}
            style={{
              marginRight: "10px",
              fontSize: "14px",
              padding: "5px 16px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              backgroundColor: category === "2" ? "#ae60f3" : "#f8f9fa",
              color: category === "2" ? "#fff" : "#4c4c4c",
              cursor: "pointer",
            }}
          >
            🎣Entertainment
          </button>
          <button
            className={`btn ${category === "3" ? "active" : ""}`}
            onClick={() => setCategory("3")}
            style={{
              marginRight: "10px",
              fontSize: "14px",
              padding: "5px 26px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              backgroundColor: category === "3" ? "#ae60f3" : "#f8f9fa",
              color: category === "3" ? "#fff" : "#4c4c4c",
              cursor: "pointer",
            }}
          >
            🚌Transportation
          </button>
        </div>
      </div>
      <div className="mb-3 d-flex align-items-center"
        style = {{
          whiteSpace: "nowrap", // 防止文字換行
        }}
      >
       </div>
       <div className="mb-3">
		  <label className="participant-text">for</label>
        {friends.length === 0 ? (
          <p className="noFriend-text">無好友可分帳</p>
        ) : (
           friends.map((friend, index) => (
             <div key={index} className="form-check">
               <input
                 className="form-check-input"
				 style={{
                  border: "1px solid rgb(189, 103, 235)",
                  backgroundColor: "rgb(255, 255, 255)"
                }}
                 type="checkbox"
                 id={`splitter-${friend.friend_id}`}
                 value={friend.friend_id}
                 checked={splitters.includes(friend.friend_id.toString())}
                 onChange={(e) => handleSplitterChange(e.target.value)}
               />
               <label
                 className="form-check-label"
                 htmlFor={`splitter-${friend.friend_id}`}
               >
                 {friend.nickname}
               </label>
             </div>
           ))
        )}
      </div>
	   <div className="subtitle-text">
        <label className="subtitle-text">Notes</label>
        <textarea
          className="form-control"
		  style={{
            border: "1px solid rgb(189, 103, 235)",
            backgroundColor: "rgb(255, 255, 255)"
          }}
          rows={3}
          placeholder="輸入備註"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>
      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={loading}
      >
	  {loading ? "提交中..." : "+"}
      </button>
      {/* 顯示 Modal */}
      {modalMessage && (
          <div className="modal-overlay">
            <div className="modal-box">
              <p className="error-text">{modalMessage}</p>
            <button className="close-button" onClick={() => setModalMessage(null)}>Close</button>
        </div> {/* 顯示錯誤訊息 */}
      </div>
      )}
    </div>
  );
};
export default AccountingPage;
