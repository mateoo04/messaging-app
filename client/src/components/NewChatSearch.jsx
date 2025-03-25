import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function NewChatSearch({ stopUserSearch }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/users?search=${search}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Error fetching users');

        const json = await response.json();

        setUsers(json.users);
      } catch {
        toast.error('Error fetching users');
      }
    };

    fetchUsers();
  }, [search]);

  return (
    <>
      <h1 className='pb-3'>New Chat</h1>
      <button className='btn border mb-2' onClick={stopUserSearch}>
        RETURN TO CHATS
      </button>
      <input
        type='text'
        id='userSearch'
        name='userSearch'
        onChange={(e) => setSearch(e.target.value)}
      />
      <div>
        <ul>
          {users.map((user) => {
            return (
              <li>
                <p className='mb-0'>{user.displayName}</p>
                <p className='text-secondary'>{user.username}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
