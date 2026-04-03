import "./App.css";
import { useEffect, useState } from "react";

const PORT = import.meta.env.VITE_PORT || 3000;
import { io, Socket } from "socket.io-client";

type EventType = {
  author: string;
  message: string;
  timestamp: Date;
};

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [name, setName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<EventType[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [room, setRoom] = useState<string>("general");
  const [users, setUsers] = useState<string[]>([]);
  const [allMessages, setAllMessages] = useState<EventType[]>([]);

  useEffect(() => {
    const socket = io(`http://localhost:${PORT}`, {
      transports: ["websocket"],
    });
    setSocket(socket);
    socket.on("event:list", (history: EventType[]) => {
      setMessages(history);
      setConnected(true);
    });
    socket.on("event:new", (event: EventType) => {
      setMessages((prevMessages) => [event, ...prevMessages]);
    });
  }, []);

  const handleJoin = () => {
    if (name && socket) {
      socket.emit("room:join", { username: name, room });
      setConnected(true);
      socket.on("user:list", (users: string[]) => {
        setUsers(users);
      });
    }
  };

  const handleLeave = () => {
    if (socket) {
      socket.emit("room:leave", { username: name, room });
      setConnected(false);
    }
  };

  const handleSend = () => {
    if (message.trim() && socket) {
      socket.emit("event:new", { author: name, message, room });
      setMessage("");
    }
  };

  const handleShowAllMessages = async () => {
    const res = await fetch(`http://localhost:${PORT}/events/${room}`);
    const data = await res.json();
    setAllMessages(data);
  };

  useEffect(() => {
    console.log(allMessages);
  }, [allMessages]);

  return (
    <div className="flex flex-col justify-center items-center mt-2 gap-2">
      <div className="text-2xl font-bold">
        WebSocket Chat ({room.toUpperCase()}){name && connected && ` - ${name}`}
      </div>

      {!connected ? (
        <>
          {" "}
          <input
            type="text"
            placeholder="name"
            className="input input-neutral"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <select
            className="select"
            onChange={(e) => setRoom(e.target.value)}
            value={room}
          >
            <option value="general">General</option>
            <option value="support">Support</option>
            <option value="misc">Misc</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={handleJoin}
            disabled={!name.trim() || !room}
          >
            Join
          </button>
        </>
      ) : (
        <>
          <textarea
            className="textarea resize-none"
            placeholder="Message"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          ></textarea>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={handleSend}>
              Send
            </button>
            <label htmlFor="modal" className="btn btn-secondary">
              Leave
            </label>
          </div>

          <div className="flex w-full flex-col">
            <div className="divider">Chat</div>
          </div>

          <div className="flex w-full">
            <div className="flex-col w-2/5 m-2">
              <div className="">Users online: </div>
              {users.map((user) =>
                user === name ? (
                  <>
                    <div className="badge badge-info badge-outline">{user}</div>
                    <br />
                  </>
                ) : (
                  <>
                    <div className="badge badge-neutral badge-outline">
                      {user}
                    </div>
                    <br />
                  </>
                ),
              )}
            </div>

            <div className="hero bg-base-200 min-h-1/3 max-h-[71vh] overflow-y-auto m-4">
              <div className="hero-content text-center">
                <div className="min-w-[600px] p-4">
                  {messages.map((event, i) =>
                    event.author === name ? (
                      <div
                        className="chat chat-end"
                        key={"" + i + event.author}
                      >
                        <div className="chat-header">
                          {event.author}
                          <time className="text-xs opacity-50">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </time>
                        </div>
                        <div className="chat-bubble chat-bubble-accent">
                          {event.message}
                        </div>
                      </div>
                    ) : (
                      <div className="chat chat-start">
                        <div className="chat-header">
                          {event.author}
                          <time className="text-xs opacity-50">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </time>
                        </div>
                        <div className="chat-bubble chat-bubble-warning">
                          {event.message}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <input type="checkbox" id="modal" className="modal-toggle" />
          <div className="modal" role="dialog">
            <div className="modal-box">
              <h3 className="text-lg font-bold">Warning!</h3>
              <p className="py-4">Are you sure you want to leave the chat?</p>
              <div className="modal-action">
                <label htmlFor="modal" className="btn">
                  Cancel
                </label>
                <label
                  htmlFor="modal"
                  className="btn btn-secondary"
                  onClick={handleLeave}
                >
                  Leave
                </label>
              </div>
            </div>
          </div>
          <button
            className="btn btn-ghost fixed top-4 right-4"
            onClick={() => window.open(window.location.href, "_blank")}
          >
            Open new tab
          </button>
          <label
            htmlFor="modal2"
            className="btn btn-ghost fixed top-14 right-4"
            onClick={handleShowAllMessages}
          >
            Show all messages in this chat room
          </label>
          <input type="checkbox" id="modal2" className="modal-toggle" />
          <div className="modal" role="dialog">
            <div className="modal-box">
              <h3 className="text-lg font-bold">
                Messages in {room.toUpperCase()} room
              </h3>
              <div className="overflow-y-auto max-h-[80vh]">
                {allMessages.length
                  ? allMessages.map((event, i) => (
                      <div key={"" + i + event.author}>
                        <div className="chat-header">
                          {event.author}
                          <time className="text-xs opacity-50">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </time>
                        </div>
                        <div className="font-bold">{event.message}</div>
                        <br />
                      </div>
                    ))
                  : "No messages yet."}
              </div>
            </div>
            <label className="modal-backdrop" htmlFor="modal2">
              Close
            </label>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
