import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const URL =
  import.meta.env.NODE_ENV === 'production'
    ? undefined
    : 'http://localhost:4000';

const socket = io(URL);

function App() {
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
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Type a message...'
      />
      <button onClick={sendMessage}>Send</button>
    </>
  );
}

export default App;
