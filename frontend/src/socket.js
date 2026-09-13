import { io } from 'socket.io-client';
import { API_BASE } from './api.js';

// Single shared socket instance for real-time dashboard/alert updates
const socket = io(API_BASE, { autoConnect: true, transports: ['websocket', 'polling'] });

export default socket;
