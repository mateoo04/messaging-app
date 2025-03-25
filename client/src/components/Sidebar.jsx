import { useState } from 'react';
import ChatList from './ChatList';
import NewChatSearch from './NewChatSearch';

export default function Sidebar() {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <aside className='d-flex flex-column pt-4 pb-4 ps-3 pe-3'>
      {isSearching ? (
        <NewChatSearch stopUserSearch={() => setIsSearching(false)} />
      ) : (
        <ChatList startUserSearch={() => setIsSearching(true)} />
      )}
    </aside>
  );
}
