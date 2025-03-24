import { io } from 'socket.io-client';

const URL =
  import.meta.env.NODE_ENV === 'production'
    ? undefined
    : 'http://localhost:4000';

const socket = io(URL, { withCredentials: true });

export default socket;
