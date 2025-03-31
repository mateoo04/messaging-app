import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import personSvg from '../../assets/icons/person-circle.svg';
import { useAuth } from '../../context/authContext';

export default function NewChatSearch({ stopUserSearch }) {
  const { authenticatedUser } = useAuth();
  const [search, setSearch] = useState('');
  const [users, setAuthenticatedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/users?search=${search}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Error fetching users');

        const json = await response.json();

        setAuthenticatedUsers(json.users);
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
      <ul className='main-menu-list'>
        {users.map((user) => {
          return (
            <Link
              to={`/chats/private/${user.id}`}
              className='text-decoration-none'
              key={user.id + '-link'}
            >
              <li className='d-flex gap-2'>
                <img
                  className='profile-photo'
                  src={user.profilePhotoUrl || personSvg}
                  alt=''
                />
                <div>
                  <p className='mb-0 fw-bold'>{user.displayName}</p>
                  <p className='text-secondary'>@{user.username}</p>
                </div>
              </li>
            </Link>
          );
        })}
      </ul>
    </>
  );
}
