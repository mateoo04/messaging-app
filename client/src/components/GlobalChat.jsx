import { useEffect, useState } from 'react';
import socket from '../utils/socket';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import { toast } from 'react-toastify';

export default function GlobalChat() {
  const { isAuthenticated } = useAuth();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    socket.emit('join room', 'global-chat');

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);

      return () => {
        socket.off('message');
      };
    });
  }, []);

  const sendMessage = async () => {
    if (messageText.trim()) {
      try {
        const response = await fetch('/api/chats/global-chat/new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: messageText }),
        });

        if (!response.ok) throw new Error('Failed to validate credentials');

        setMessages([
          ...messages,
          { text: messageText, sender: { displayName: 'You' } },
        ]);
        setMessageText('');
      } catch {
        toast.error('Failed to send the message');
      }
    }
  };

  return (
    <>
      <h1>Chat</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={`message-${index}`}>
            <p key={`author-${index}`}>{msg.sender.displayName}</p>
            <p key={`text-${index}`}>{msg.text}</p>
          </div>
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
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder='Type a message...'
      />
      <button onClick={sendMessage} disabled={!isAuthenticated}>
        Send
      </button>
    </>
  );
}
