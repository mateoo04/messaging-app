import { useEffect, useState } from 'react';
import socket from '../../utils/socket.js';
import { useLocation, useParams } from 'react-router-dom';
import Chat from './Chat.jsx';
import { toast } from 'react-toastify';
import { useChats } from '../../context/chatsContext.jsx';
import { useAuth } from '../../context/authContext.jsx';

export default function PrivateChat() {
  const { addSentMessage } = useChats();
  const { authenticatedUser } = useAuth();
  const { recipientId } = useParams();

  const [chatId, setChatId] = useState('');
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState({});

  useEffect(() => {
    const fetchExistingMessages = async () => {
      try {
        const response = await fetch(
          `/api/chats/private?memberId=${recipientId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (response.status == 404) {
          const recipientResponse = await fetch(`/api/users/${recipientId}`, {
            method: 'GET',
            credentials: 'include',
          });

          if (!recipientResponse.ok) throw new Error('Error fetching the user');

          const recipientJson = await recipientResponse.json();
          setRecipient(recipientJson);
          setMessages([]);

          return;
        }
        if (!response.ok) throw new Error('Error fetching messages');

        const json = await response.json();

        setChatId(() => json.id);
        setMessages(json.messages);
        setRecipient(
          json.members.find((member) => member.id !== authenticatedUser.id)
        );
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
  }, [chatId, recipientId, authenticatedUser]);

  const sendMessage = async (messageText) => {
    if (messageText.trim()) {
      try {
        const response = await fetch(
          `/api/chats/private/message/${recipientId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ text: messageText, socketId: socket.id }),
          }
        );

        if (!response.ok) throw new Error('Failed to send the message');

        const json = await response.json();
        addSentMessage(json);

        setMessages((prev) => [...prev, json]);
        if (!chatId) setChatId(json.chatId);
      } catch {
        toast.error('Failed to send the message');
      }
    }
  };

  return (
    <Chat
      messages={messages}
      sendMessage={sendMessage}
      chatName={recipient.displayName}
      chatDescription={'@' + recipient.username}
      chatPhotoUrl={recipient.profilePhotoUrl}
    ></Chat>
  );
}
