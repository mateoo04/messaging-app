import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useChats } from '../../context/chatsContext';
import {
  format,
  isBefore,
  isThisYear,
  isToday,
  isWithinInterval,
  isYesterday,
  subDays,
} from 'date-fns';
import personSvg from '../../assets/icons/person-circle.svg';
import globeSvg from '../../assets/icons/globe.svg';

export default function ChatList({ startUserSearch }) {
  const { chats } = useChats();
  const { isAuthenticated, authenticatedUser } = useAuth();

  const formatTime = (time) => {
    if (isToday(time)) return format(time, 'HH:mm');
    else if (isYesterday(time)) return 'Yesterday';
    else if (
      isWithinInterval(time, { start: subDays(new Date(), 7), end: new Date() })
    )
      return format(time, 'EEEE');
    else if (isThisYear(time)) return format(time, 'dd.MM.');
    else return format(time, 'dd.MM.yyyy.');
  };

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
      <ul className='sidebar-list'>
        <li className='nav-item'>
          <Link
            className='nav-link active fw-bold d-flex gap-2 align-items-center'
            to='/chats/group/global-chat'
          >
            <img className='profile-photo' src={globeSvg} alt='' />
            Global Chat
          </Link>
        </li>
        {chats.map((chat) => {
          const recipient = chat.members?.find(
            (member) => member.id != authenticatedUser.id
          );
          const lastMessage = chat.messages?.at(0);
          const sender = lastMessage?.sender;

          return (
            <li className='nav-item' key={chat.id + 'link'}>
              <Link
                className='nav-link active d-flex gap-2'
                to={`/chats/private/${recipient.id}`}
              >
                <img
                  className='profile-photo'
                  src={recipient.profilePhotoUrl || personSvg}
                  alt=''
                />
                <div className='col'>
                  <div className='d-flex justify-content-between'>
                    <p className='fw-bold'>{recipient?.displayName}</p>
                    <p className='text-secondary'>
                      {lastMessage?.time && formatTime(lastMessage.time)}
                    </p>
                  </div>
                  <p className='text-secondary last-message'>
                    {`${
                      sender?.id === authenticatedUser.id
                        ? 'You'
                        : sender?.displayName
                    }: ${lastMessage?.text ? lastMessage?.text : 'Image sent'}`}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
