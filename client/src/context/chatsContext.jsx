import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import socket from '../utils/socket';
import { useAuth } from './authContext';

const ChatsContext = createContext();

export function ChatsProvider({ children }) {
  const { isAuthenticated, authenticatedUser } = useAuth();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`/api/chats`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Error fetching chats');

        const json = await response.json();

        setChats((prev) => [...prev, ...json.chats]);
      } catch {
        toast.error('Error fetching chats');
      }
    };

    if (isAuthenticated && !chats.length) fetchChats();
  }, [isAuthenticated, chats.length]);

  useEffect(() => {
    socket.emit('join room', `events-${authenticatedUser.id}`);

    socket.on('newPrivateChat', (newChat) => {
      if (!chats.some((chat) => chat.id === newChat.id))
        setChats([newChat, ...chats]);

      console.log('new private chat: ' + newChat);

      return () => {
        socket.off('newPrivateChat');
      };
    });
  }, [chats, authenticatedUser]);

  useEffect(() => {
    if (chats.length > 0)
      socket.emit(
        'join rooms',
        chats.map((chat) => chat.id)
      );

    socket.on('message', (message) => {
      let toBeMovedChatIndex;

      let newChatsArray = chats.map((chat, index) => {
        if (chat.id == message.chatId) {
          toBeMovedChatIndex = index;
          return { ...chat, messages: [message] };
        } else return chat;
      });

      let toBeMovedChat = newChatsArray.splice(toBeMovedChatIndex, 1)[0];
      newChatsArray.unshift(toBeMovedChat);

      setChats(newChatsArray);

      return () => {
        socket.off('message');
      };
    });
  }, [chats]);

  const addSentMessage = (message) => {
    if (!chats.some((chat) => chat.id === message.chat.id)) {
      setChats([{ ...message.chat, messages: [message] }, ...chats]);
    } else {
      let toBeMovedChatIndex;

      let newChatsArray = chats.map((chat, index) => {
        if (chat.id === message.chatId) {
          toBeMovedChatIndex = index;
          return { ...chat, messages: [message] };
        }
        return chat;
      });

      let toBeMovedChat = newChatsArray.splice(toBeMovedChatIndex, 1)[0];
      newChatsArray.unshift(toBeMovedChat);

      setChats(newChatsArray);
    }
  };

  return (
    <ChatsContext.Provider value={{ chats, setChats, addSentMessage }}>
      {children}
    </ChatsContext.Provider>
  );
}

export function useChats() {
  return useContext(ChatsContext);
}
