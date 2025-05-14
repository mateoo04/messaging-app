import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import MainMenu from '../main-menu/MainMenu.jsx';
import sendIcon from '../../assets/icons/send.svg';
import {
  isToday,
  format,
  isYesterday,
  isWithinInterval,
  subDays,
  isThisYear,
} from 'date-fns';
import personSvg from '../../assets/icons/person-circle.svg';
import globeSvg from '../../assets/icons/globe.svg';
import imageSvg from '../../assets/icons/image.svg';
import arrowLeftSvg from '../../assets/icons/arrow-left.svg';
import { toast } from 'react-toastify';

export default function Chat({
  messages,
  sendMessage,
  chatName,
  chatDescription,
  isGroup,
  isOnline,
  chatPhotoUrl,
}) {
  const { isAuthenticated, authenticatedUser } = useAuth();

  const [messageText, setMessageText] = useState('');
  const [file, setFile] = useState(null);
  const [isAttachingFile, setIsAttachingFile] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!messagesEndRef.current) return;

    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [messages]);

  const formatDateTime = (time) => {
    if (isToday(time)) return format(time, 'HH:mm');
    else if (isYesterday(time)) return 'Yesterday ' + format(time, 'HH:mm');
    else if (
      isWithinInterval(time, { start: subDays(new Date(), 7), end: new Date() })
    )
      return format(time, 'EEEE HH:mm');
    else if (isThisYear(time)) return format(time, 'dd.M. HH:mm');
    else return format(time, 'dd.M.yyyy. HH:mm');
  };

  return (
    <div className='d-flex h-100'>
      <aside className='sidebar'>
        <MainMenu />
      </aside>
      <main className='col d-flex flex-column pt-1 ms-3 me-3'>
        <div className='d-flex gap-2 align-items-center '>
          <Link to='/menu' className='me-2 main-menu-button'>
            <img className='back-arrow' src={arrowLeftSvg} alt='' />
          </Link>
          <div className='position-relative'>
            <img
              className='profile-photo chat-profile-photo mt-0'
              src={isGroup ? globeSvg : chatPhotoUrl || personSvg}
              alt=''
            />
            {!isGroup && (
              <span
                className={`chat-status-indicator ${
                  isOnline ? 'online' : 'offline'
                }`}
              ></span>
            )}
          </div>
          <div className='pt-2'>
            <h2 className='mb-0 mt-0 fs-3'>{chatName}</h2>
            <p className='text-secondary mb-2'>{chatDescription}</p>
          </div>
        </div>
        <div className='messages col d-flex flex-column'>
          {messages.map((msg, index) => (
            <div
              key={`message-${index}`}
              className={
                (msg.sender.id === authenticatedUser.id
                  ? 'align-self-end user-message-container'
                  : 'align-self-start') + ' mw-85 d-flex align-bottom'
              }
            >
              <div
                className={
                  (msg.sender.id === authenticatedUser.id
                    ? 'users-message align-self-end'
                    : 'others-message align-self-start') +
                  ' pt-1 pb-1 ps-3 pe-3 mb-1 rounded-4'
                }
              >
                {isGroup && (
                  <p key={`author-${index}`} className='message-sender'>
                    {msg.sender?.id === authenticatedUser?.id
                      ? 'You'
                      : msg.sender.displayName}
                  </p>
                )}
                {msg.imageUrl && (
                  <div className='message-image-container d-flex align-items-center justify-content-center'>
                    <img
                      className='message-image rounded-3 mt-2 mb-2'
                      src={msg.imageUrl}
                      onClick={() => window.open(msg.imageUrl, '_blank')}
                    />
                  </div>
                )}
                <p key={`text-${index}`} className='message-text'>
                  {msg.text}
                </p>
              </div>
              <p className='p-1 align-self-bottom text-secondary time'>
                {msg.time && formatDateTime(msg.time)}
              </p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {!isAuthenticated ? (
          <p>
            <Link to='/log-in'>Log in</Link> or{' '}
            <Link to='/sign-up'>sign up</Link> to send a message
          </p>
        ) : (
          ''
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!isAuthenticated) toast.error('Log in to send a message');
            else {
              await sendMessage(messageText, isAttachingFile ? file : null);
              setMessageText('');
              setIsAttachingFile(false);
            }
          }}
          className='d-flex flex-column p-2 text-input-container'
        >
          <input
            id='file-input'
            type='file'
            name='file'
            className='form-control mb-3'
            onChange={(e) => setFile(e.target.files[0])}
            hidden={!isAttachingFile}
          />
          <div className='d-flex  align-items-center'>
            <textarea
              name='message-text'
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder='Type a message...'
              className='form-control border-0 bg-transparent'
            />
            <button
              type='button'
              onClick={() => setIsAttachingFile(!isAttachingFile)}
              className='align message-input-button attach-image-button'
            >
              <img src={imageSvg} alt='' />
            </button>
            <button type='submit' className='send-button align bg-primary'>
              <img src={sendIcon} className='send-icon' alt='' />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
