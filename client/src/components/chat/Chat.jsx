import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import Sidebar from '../sidebar/Sidebar.jsx';

export default function Chat({ messages, sendMessage }) {
  const { isAuthenticated, getUser } = useAuth();

  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [messages]);

  return (
    <div className='d-flex'>
      <Sidebar />
      <main className='col'>
        <div className='overflow-scroll messages'>
          {messages.map((msg, index) => (
            <div key={`message-${index}`}>
              <p key={`author-${index}`}>
                {msg.sender?.id === getUser()?.id
                  ? 'You'
                  : msg.sender.displayName}
              </p>
              <p key={`text-${index}`}>{msg.text}</p>
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
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder='Type a message...'
        />
        <button
          onClick={async () => {
            await sendMessage(messageText);
            setMessageText('');
          }}
          disabled={!isAuthenticated}
        >
          Send
        </button>
      </main>
    </div>
  );
}
