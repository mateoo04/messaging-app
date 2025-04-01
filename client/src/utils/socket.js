import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL;

const socket = io(URL, { withCredentials: true });

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    socket.disconnect();
  });
}

export default socket;
