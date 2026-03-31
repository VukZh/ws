import './App.css'
import { useEffect, useState } from "react";

const PORT = import.meta.env.VITE_PORT || 3000;
import { io, Socket } from "socket.io-client";

type EventType = {
  author: string,
  message: string,
  timestamp: Date,
}

function App() {

  const [socket, setSocket] = useState<Socket|null>(null);
  const [name, setName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<EventType[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [room, setRoom] = useState<string>("");

  useEffect(() => {
    const socket = io(`http://localhost:${PORT}`, {
      transports: ['websocket']
    });
    setSocket(socket);
    socket.on('event:list', () => {
      setConnected(true);
    });
    socket.on('event:new', (event: EventType) => {
      setMessages((prevMessages) => [...prevMessages, event]);
    });
  }, []);

  const handleJoin = () => {
    if (name && socket) {
      socket.emit('room:join', {username: name, room});
      setConnected(true);
    }
  };

  const handleSend = () => {
    if (message.trim() && socket) {
      socket.emit('event:new', {author: name, message, room});
      setMessage("");
    }
  };

  useEffect(() => {
    console.log('messages', messages);
  }, [messages]);

  return (
    <div className="flex flex-col justify-center items-center mt-2 gap-2">
      <div className="text-2xl font-bold">WebSocket Chat</div>
      <input type="text" placeholder="name" className="input input-neutral" onChange={(e) => setName(e.target.value)}
             value={name}/>
      <select defaultValue="1st" className="select" onChange={(e) => setRoom(e.target.value)}>
        <option>1st</option>
        <option>2nd</option>
        <option>some</option>
      </select>
      <button className="btn btn-primary" onClick={handleJoin}>Join</button>
      <textarea className="textarea" placeholder="Message" onChange={(e) => setMessage(e.target.value)}
                value={message}></textarea>
      <button className="btn btn-primary" onClick={handleSend}>Send</button>
      <div className="flex w-full flex-col">
        <div className="divider">Chat</div>
      </div>

      <div className="hero bg-base-200 min-h-1/3">
        <div className="hero-content text-center">
          <div className="min-w-[600px] p-4">
            <div className="chat chat-start">
              <div className="chat-header">
                Obi-Wan Kenobi
                <time className="text-xs opacity-50">2 hour ago</time>
              </div>
              <div className="chat-bubble chat-bubble-accent">
                It's over Anakin,
                <br/>
                I have the high ground.
              </div>
            </div>
            <div className="chat chat-end">
              <div className="chat-header">
                Obi-Wan Kenobi
                <time className="text-xs opacity-50">2 hours ago</time>
              </div>
              <div className="chat-bubble chat-bubble-info">You underestimate my power!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
