import React, { useState, useEffect } from 'react';
import './Chat.css';

function Chat() {
    const [isNameSet, setIsNameSet] = useState(false);
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Assuming you're using native WebSockets
        const socket = new WebSocket('ws://localhost:8086/chat-websocket');

        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setMessages(prevMessages => [...prevMessages, msg]);
        };

        return () => socket.close();
    }, []);

    const sendMessage = () => {
        if (message.trim() !== "") {
            const socket = new WebSocket('ws://localhost:8086/chat-websocket');
            const msgToSend = {
                content: message,
                from: username
            };
            socket.onopen = () => {
                socket.send(JSON.stringify(msgToSend));
            };
            setMessage('');
        }
    };

    return (
        <div className="chat-container">
            {!isNameSet ? (
                <div className="name-entry">
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your name"
                    />
                    <button onClick={() => setIsNameSet(true)}>Enter Chat</button>
                </div>
            ) : (
                <>
                    <div className="messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.from === username ? 'mine' : 'others'}`}>
                                <span>{msg.from}: {msg.content}</span>
                            </div>
                        ))}
                    </div>
                    <div className="input-section">
         <input 
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyPress={(e) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); 
            sendMessage();
        }
    }}
    placeholder="Type your message here..."
/>

                        <button onClick={sendMessage}>Send</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Chat;

