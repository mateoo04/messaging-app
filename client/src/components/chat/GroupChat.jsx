import { useEffect, useState } from 'react';
import socket from '../../utils/socket.js';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Chat from './Chat.jsx';
import supabase from '../../utils/supabase.js';
import { useAuth } from '../../context/authContext.jsx';

export default function GroupChat() {
  const { authenticatedUser } = useAuth();
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

  const sendMessage = async (messageText, file) => {
    if (messageText.trim() || file) {
      try {
        let photoUrl;

        if (file) {
          const filePath = `chat-photos/${authenticatedUser.id}-${Date.now()}`;

          const { data, error } = await supabase.storage
            .from('messaging-app')
            .upload(filePath, file, {
              upsert: true,
            });

          if (error) {
            throw new Error(error);
          }

          const { data: profilePhotoUrlData } = supabase.storage
            .from('messaging-app')
            .getPublicUrl(data.path);

          photoUrl = profilePhotoUrlData.publicUrl;
        }

        const response = await fetch(`/api/chats/groups/message/${chatId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            text: messageText,
            socketId: socket.id,
            imageUrl: photoUrl,
          }),
        });

        if (!response.ok) throw new Error('Failed to send the message');

        const json = await response.json();

        setMessages((prev) => [...prev, json]);
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
