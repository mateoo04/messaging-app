import { useEffect, useRef, useState } from 'react';
import socket from '../utils/socket.js';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar.jsx';

export default function Chat() {
  const { isAuthenticated, getUser } = useAuth();
  const { recipient } = useParams();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit('join room', recipient);

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
      console.log('socket: message received');
      return () => {
        socket.off('message');
      };
    });

    const fetchExistingMessages = async () => {
      try {
        const response = await fetch(`/api/chats/${recipient}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response) return;

        if (!response.ok) throw new Error('Error fetching messages');

        const json = await response.json();

        setMessages((prev) => [...prev, ...json.messages]);
      } catch {
        toast.error('Error fetching messages');
      }
    };

    fetchExistingMessages();
  }, [recipient]);

  const sendMessage = async () => {
    if (messageText.trim()) {
      try {
        const response = await fetch(`/api/chats/${recipient}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: messageText, socketId: socket.id }),
        });

        if (!response.ok) throw new Error('Failed to validate credentials');

        setMessages((prev) => [
          ...prev,
          { text: messageText, sender: { displayName: 'You' } },
        ]);
        setMessageText('');
      } catch {
        toast.error('Failed to send the message');
      }
    }
  };

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
        <button onClick={sendMessage} disabled={!isAuthenticated}>
          Send
        </button>
      </main>
    </div>
  );
}
