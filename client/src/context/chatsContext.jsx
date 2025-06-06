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
    if (authenticatedUser.id) {
      socket.emit('join room', `events-${authenticatedUser.id}`);

      socket.on('newPrivateChat', (newChat) => {
        if (!chats.some((chat) => chat.id === newChat.id)) {
          newChat.members = newChat.members.map((member) => {
            if (member.id !== authenticatedUser.id)
              return { ...member, isOnline: true };
            return member;
          });

          setChats([newChat, ...chats]);
        }

        return () => {
          socket.off('newPrivateChat');
        };
      });
    } else if (chats.length) setChats([]);
  }, [chats, authenticatedUser]);

  useEffect(() => {
    let filteredMembers = [];

    if (isAuthenticated && chats.length > 0) {
      socket.emit(
        'join rooms',
        chats.map((chat) => chat.id)
      );

      filteredMembers = chats.reduce((accMembers, chat) => {
        const otherMembers = chat.members.filter(
          (member) => member.id !== authenticatedUser.id
        );
        return accMembers.concat(otherMembers);
      }, []);

      filteredMembers.forEach((filteredMember) => {
        if (filteredMember.id != null) {
          const room = `is-online-${filteredMember.id}`;
          socket.emit('join room', room);

          socket.on(`status-update-${filteredMember.id}`, (isOnline) => {
            setChats((prevCHats) =>
              prevCHats.map((chat) => {
                return {
                  ...chat,
                  members: chat.members.map((member) => {
                    if (member.id === filteredMember.id)
                      return { ...member, isOnline };
                    return member;
                  }),
                };
              })
            );
          });
        }
      });
    }

    if (isAuthenticated)
      socket.on('message', (message) => {
        let toBeMovedChatIndex;

        let newChatsArray = chats.map((chat, index) => {
          if (chat.id == message.chatId) {
            toBeMovedChatIndex = index;
            return { ...chat, messages: [message], isUnread: true };
          } else return chat;
        });

        let toBeMovedChat = newChatsArray.splice(toBeMovedChatIndex, 1)[0];
        newChatsArray.unshift(toBeMovedChat);

        setChats(newChatsArray);

        return () => {
          socket.off('message');
        };
      });

    return () => {
      filteredMembers.forEach((filteredMember) => {
        socket.off(`status-update-${filteredMember.id}`);
      });
    };
  }, [chats, authenticatedUser.id, isAuthenticated]);

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
