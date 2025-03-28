import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useChats } from '../../context/chatsContext';
import { format } from 'date-fns';

export default function ChatList({ startUserSearch }) {
  const { chats } = useChats();
  const { isAuthenticated, getUser } = useAuth();

  return (
    <>
      <h1 className='pb-3'>Chat</h1>
      {isAuthenticated && (
        <button
          className='btn border mb-2 bg-primary text-white rounded-5'
          onClick={startUserSearch}
        >
          <b>+</b> NEW CHAT
        </button>
      )}
      <ul className='nav flex-column'>
        <li className='nav-item'>
          <Link
            className='nav-link active fw-bold'
            to='/chats/group/global-chat'
          >
            Global Chat
          </Link>
        </li>
        {chats.map((chat) => {
          const recipient = chat.members?.find(
            (member) => member.id != getUser().id
          );
          const lastMessage = chat.messages?.at(0);
          const sender = lastMessage.sender;

          return (
            <li className='nav-item' key={chat.id + 'link'}>
              <Link
                className='nav-link active'
                to={`/chats/private/${recipient.id}`}
              >
                <div className='d-flex justify-content-between'>
                  <p className='fw-bold'>{recipient?.displayName}</p>
                  <p className='text-secondary'>
                    {lastMessage?.time && format(lastMessage.time, 'HH:mm')}
                  </p>
                </div>
                <p className='text-secondary last-message'>
                  {`${
                    sender?.id === getUser().id ? 'You' : sender?.displayName
                  }: ${lastMessage?.text}`}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
