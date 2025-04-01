import { memo, useState } from 'react';
import NewChatSearch from './NewChatSearch';
import ChatList from './ChatList';
import { useAuth } from '../../context/authContext';
import personSvg from '../../assets/icons/person-circle.svg';
import threeDotsSvg from '../../assets/icons/three-dots.svg';
import { useNavigate } from 'react-router-dom';
import { useChats } from '../../context/chatsContext';

const MainMenu = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authenticatedUser, logOut } = useAuth();
  const { chats, setChats } = useChats();
  const [isSearching, setIsSearching] = useState(false);

  return (
    <div className='d-flex flex-column pt-4 ps-3 pe-3 border-end'>
      <div className='d-flex justify-content-between align-items-center ms-3 mb-3 ml-3'>
        <div className='d-flex gap-2 align-items-center'>
          <img
            className='profile-photo'
            src={authenticatedUser.profilePhotoUrl || personSvg}
            alt=''
          />
          <p>{authenticatedUser.displayName}</p>
        </div>
        <div className='dropdown'>
          <button
            type='button'
            className='btn border-0 dropdown-toggle-split'
            data-bs-toggle='dropdown'
            aria-expanded='false'
          >
            <img className='options-icon' src={threeDotsSvg} alt='' />
            <span className='visually-hidden'>Toggle Dropdown</span>
          </button>{' '}
          <ul className='dropdown-menu dropdown-menu-light'>
            {isAuthenticated ? (
              <li>
                <button
                  className='dropdown-item'
                  onClick={() => {
                    logOut();
                    setChats([]);
                    navigate('/log-in');
                  }}
                >
                  Log out
                </button>
                <button
                  className='dropdown-item'
                  onClick={() => {
                    navigate('/edit-profile');
                  }}
                >
                  Edit profile
                </button>
              </li>
            ) : (
              <>
                <li>
                  <button
                    className='dropdown-item'
                    onClick={() => {
                      navigate('/log-in');
                    }}
                  >
                    Log in
                  </button>
                </li>
                <li>
                  <button
                    className='dropdown-item'
                    onClick={() => {
                      navigate('/sign-up');
                    }}
                  >
                    Sign up
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      {isSearching ? (
        <NewChatSearch stopUserSearch={() => setIsSearching(false)} />
      ) : (
        <ChatList startUserSearch={() => setIsSearching(true)} />
      )}
    </div>
  );
};

export default MainMenu;
