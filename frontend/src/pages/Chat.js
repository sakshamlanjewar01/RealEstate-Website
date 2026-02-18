import { useEffect, useState, useRef } from "react";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    const room = "support_room";
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${room}/`);

    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket Connected");
      setConnected(true);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, data.message]);
    };

    ws.onclose = () => {
      console.log("WebSocket Closed");
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      alert("Chat not connected yet.");
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        message: input,
      })
    );

    setInput("");
  };

  return (
    <div className="pt-28 px-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">
        Live Support Chat {connected ? "🟢" : "🔴"}
      </h1>

      <div className="bg-white h-96 overflow-y-auto p-4 rounded shadow mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2 bg-yellow-100 p-2 rounded">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
