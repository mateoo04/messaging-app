import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useChats } from '../../context/chatsContext';

export default function ChatList({ startUserSearch }) {
  const { chats } = useChats();
  const { isAuthenticated, getUser } = useAuth();

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
          <Link className='nav-link active' to='/chats/group/global-chat'>
            Global chat
          </Link>
        </li>
        {chats.map((chat) => {
          const recipient = chat.members?.find(
            (member) => member.id != getUser().id
          );

          const sender = chat.messages?.at(0).sender;

          return (
            <li className='nav-item' key={chat.id + 'link'}>
              <Link
                className='nav-link active'
                to={`/chats/private/${recipient.id}`}
              >
                <p className='mb-0'>{recipient?.displayName}</p>
                <p className='text-secondary'>
                  {`${
                    sender?.id === getUser().id ? 'You' : sender?.displayName
                  }: ${chat.messages?.at(0).text}`}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
