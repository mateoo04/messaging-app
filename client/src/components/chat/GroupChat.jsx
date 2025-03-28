import { useEffect, useState } from 'react';
import socket from '../../utils/socket.js';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Chat from './Chat.jsx';

export default function GroupChat() {
  const { chatId } = useParams();

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchExistingMessages = async () => {
      try {
        const response = await fetch(`/api/chats/groups/${chatId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status == 404) return;
        if (!response.ok) throw new Error('Error fetching messages');

        const json = await response.json();

        setMessages(json.messages);
      } catch {
        toast.error('Error fetching messages');
      }
    };

    fetchExistingMessages();

    socket.emit('join room', chatId);

    socket.on('message', (message) => {
      if (message.chatId == chatId) setMessages((prev) => [...prev, message]);
      console.log('socket: message received');
      return () => {
        socket.off('message');
      };
    });
  }, [chatId]);

  const sendMessage = async (messageText) => {
    if (messageText.trim()) {
      try {
        const response = await fetch(`/api/chats/groups/message/${chatId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ text: messageText, socketId: socket.id }),
        });

        if (!response.ok) throw new Error('Failed to send the message');

        setMessages((prev) => [
          ...prev,
          { text: messageText, sender: { displayName: 'You' } },
        ]);
      } catch {
        toast.error('Failed to send the message');
      }
    }
  };

  return (
    <Chat
      messages={messages}
      sendMessage={sendMessage}
      chatName={'Global Chat'}
      chatDescription={'Members: Everyone'}
      isGroup={true}
    ></Chat>
  );
}
