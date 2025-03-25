import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';
export default function ChatList({ startUserSearch }) {
  const [chats, setChats] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`/api/chats`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Error fetching chats');

        const json = await response.json();

        setChats((prev) => [...prev, ...json.chats]);
      } catch {
        toast.error('Error fetching chats');
      }
    };

    if (isAuthenticated) fetchChats();
  }, []);

  return (
    <>
      <h1 className='pb-3'>Chat</h1>
      {isAuthenticated && (
        <button className='btn border mb-2' onClick={startUserSearch}>
          <b>+</b> NEW CHAT
        </button>
      )}
      <ul className='nav flex-column'>
        <li className='nav-item'>
          <Link className='nav-link active' to='/chat/global-chat'>
            Global chat
          </Link>
        </li>
        {chats.map((chat, index) => {
          <li className='nav-item'>
            <Link className='nav-link active' to={`/chat/${chat.id}`}>
              chat
            </Link>
          </li>;
        })}
      </ul>
    </>
  );
}
