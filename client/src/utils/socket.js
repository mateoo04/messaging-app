import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL;
const socket = io(URL, { withCredentials: true });

export default socket;
