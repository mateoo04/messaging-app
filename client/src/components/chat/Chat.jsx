import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import Sidebar from '../sidebar/Sidebar.jsx';
import sendIcon from '../../assets/icons/send.svg';
import { format } from 'date-fns';
import personSvg from '../../assets/icons/person-circle.svg';
import globeSvg from '../../assets/icons/globe.svg';

export default function Chat({
  messages,
  sendMessage,
  chatName,
  chatDescription,
  isGroup,
  chatPhotoUrl,
}) {
  const { isAuthenticated, authenticatedUser } = useAuth();

  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [messages]);

  return (
    <div className='d-flex h-100'>
      <Sidebar />
      <main className='col d-flex flex-column pt-4'>
        <div className='d-flex gap-2 align-items-start '>
          <img
            className='profile-photo chat-profile-photo mt-2'
            src={isGroup ? globeSvg : chatPhotoUrl || personSvg}
            alt=''
          />
          <div>
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
                  : 'align-self-start') + ' mw-80 d-flex align-bottom'
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
                <p key={`text-${index}`} className='message-text'>
                  {msg.text}
                </p>
              </div>
              <p className='p-1 align-self-bottom text-secondary time'>
                {msg.time && format(msg.time, 'HH:mm')}
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
        <div className='d-flex p-2 align-items-center text-input-container'>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder='Type a message...'
            className='form-control border-0 bg-transparent'
          />
          <button
            onClick={async () => {
              await sendMessage(messageText);
              setMessageText('');
            }}
            disabled={!isAuthenticated}
            className='send-button align bg-primary'
          >
            <img src={sendIcon} className='send-icon' alt='' />
          </button>
        </div>
      </main>
    </div>
  );
}
