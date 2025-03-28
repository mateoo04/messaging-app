import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
      <button
        className='btn border mb-2 bg-primary text-white rounded-5'
        onClick={stopUserSearch}
      >
        RETURN TO CHATS
      </button>
      <input
        type='text'
        id='userSearch'
        name='userSearch'
        onChange={(e) => setSearch(e.target.value)}
        className='form-control mb-3'
      />
      <div>
        <ul>
          {users.map((user) => {
            return (
              <Link
                to={`/chats/private/${user.id}`}
                className='text-decoration-none'
              >
                <li>
                  <p className='mb-0 fw-bold'>{user.displayName}</p>
                  <p className='text-secondary'>{user.username}</p>
                </li>
              </Link>
            );
          })}
        </ul>
      </div>
    </>
  );
}
