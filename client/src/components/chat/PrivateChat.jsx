import { useEffect, useState } from 'react';
import socket from '../../utils/socket.js';
import { useParams } from 'react-router-dom';
import Chat from './Chat.jsx';
import { toast } from 'react-toastify';
import { useChats } from '../../context/chatsContext.jsx';
import { useAuth } from '../../context/authContext.jsx';
import supabase from '../../utils/supabase.js';
import { validateFile } from '../../utils/fileValidation.js';

export default function PrivateChat() {
  const { addSentMessage, chats, setChats } = useChats();
  const { authenticatedUser } = useAuth();
  const { recipientId } = useParams();

  const [chatId, setChatId] = useState('');
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState({});

  useEffect(() => {
    if (!messages.length) return;

    if (messages?.at(messages.length - 1)?.sender.id !== authenticatedUser.id) {
      socket.emit('mark chat read', chatId);
    }
  }, [authenticatedUser.id, chatId, messages]);

  useEffect(() => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) return { ...chat, isUnread: false };
        return chat;
      })
    );
  }, [chatId, setChats]);

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
      } catch (err) {
        console.error(err);
        toast.error('Error fetching messages');
      }
    };

    fetchExistingMessages();
  }, [recipientId, authenticatedUser]);

  useEffect(() => {
    const setSockets = () => {
      socket.emit('join room', chatId);

      socket.on('message', (message) => {
        if (message.chatId == chatId) {
          setMessages((prev) => [...prev, message]);
        }
      });
    };

    setSockets();

    return () => {
      socket.off('message');
    };
  }, [chatId]);

  useEffect(() => {
    const newestStatus = chats
      .flatMap((chat) => chat.members)
      .find((member) => member.id === recipient.id)?.isOnline;

    if (newestStatus !== recipient.isOnline) {
      setRecipient((prev) => ({ ...prev, isOnline: newestStatus }));
    }
  }, [chats, recipient.id, recipient.isOnline]);

  const sendMessage = async (messageText, file) => {
    if (messageText.trim() || file) {
      try {
        let photoUrl;

        if (file && validateFile(file)) {
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

        const response = await fetch(
          `/api/chats/private/message/${recipientId}`,
          {
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
      isOnline={recipient.isOnline}
      chatName={recipient.displayName}
      chatDescription={'@' + recipient.username}
      chatPhotoUrl={recipient.profilePhotoUrl}
    ></Chat>
  );
}
