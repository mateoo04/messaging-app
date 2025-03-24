import { useEffect, useState } from 'react';
import socket from '../utils/socket';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';

export default function GlobalChat() {
  const { isAuthenticated } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);

      return () => {
        socket.off('message');
      };
    });
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('message', input.trim());
      setInput('');
    }
  };

  return (
    <>
      <h1>Chat</h1>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      {!isAuthenticated ? (
        <p>
          <Link to='/log-in'>Log in</Link> or <Link to='/sign-up'>sign up</Link>{' '}
          to send a message
        </p>
      ) : (
        ''
      )}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Type a message...'
      />
      <button onClick={sendMessage} disabled={!isAuthenticated}>
        Send
      </button>
    </>
  );
}
