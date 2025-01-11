import React from 'react';

interface Friend {
<<<<<<< HEAD
  username: string;
=======
  list_id: number;
  friend_id: number;
>>>>>>> new_friend_list
  nickname: string;
}

interface FriendListProps {
  friends: Friend[];
<<<<<<< HEAD
  onDelete: (username: string) => void;
=======
  onDelete: (friend_id: number) => void;
>>>>>>> new_friend_list
}

const FriendList: React.FC<FriendListProps> = ({ friends, onDelete }) => {
  return (
    <ul className="list-group">
      {friends.map((friend) => (
        <li
<<<<<<< HEAD
          key={friend.username}
=======
          key={friend.friend_id}
>>>>>>> new_friend_list
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <div style={{ flex: 1 }}>
            <strong className="d-block">{friend.nickname}</strong>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
<<<<<<< HEAD
              @{friend.username}
=======
              @{friend.friend_id}
>>>>>>> new_friend_list
            </span>
          </div>
          <button
            className="btn btn-danger btn-sm"
            style={{ marginLeft: '200px' }} // spacing between Uname and delete button
<<<<<<< HEAD
            onClick={() => onDelete(friend.username)}
=======
            onClick={() => onDelete(friend.list_id)}
>>>>>>> new_friend_list
          >
            刪除
          </button>
        </li>
      ))}
    </ul>
  );
};

export default FriendList;
