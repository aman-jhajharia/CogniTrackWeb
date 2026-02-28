import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, MessageCircle } from 'lucide-react';
import { getExpenses } from '../services/expenseService';
import { loadWeekData } from '../services/firestore';
import { getWeekKey } from '../utils/date';
import '../styles/PersonalChatbot.css';

export default function PersonalChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'bot',
            text: "Hi there! I'm your CogniTrack Assistant. I can help you analyze your time and expenses. What's on your mind?",
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);

    // Auto-scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Fetch contextual user data
    const fetchUserContext = async () => {
        try {
            const expenses = await getExpenses();
            const currentWeekKey = getWeekKey(new Date());
            const weekData = await loadWeekData(currentWeekKey);

            return {
                expenseData: expenses.slice(0, 20), // Send last 20 expenses to limit token size
                timeData: weekData
            };
        } catch (error) {
            console.error("Error fetching user context for chatbot:", error);
            return null;
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const userMessageText = inputText.trim();
        const newUserMsg = {
            id: Date.now(),
            sender: 'user',
            text: userMessageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const contextData = await fetchUserContext();

            // Just send the textual history so the bot knows the conversation flow
            const previousMessages = messages.map(msg => ({
                sender: msg.sender,
                text: msg.text
            }));

            // In development, Vite proxys /api to http://localhost:5000
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessageText,
                    contextData,
                    previousMessages
                }),
            });

            const data = await response.json();

            const newBotMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: data.response || "Sorry, I couldn't process that.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newBotMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: "Sorry, I'm having trouble connecting to the server. Please ensure the backend is running.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
                <MessageCircle size={24} />
            </button>
        );
    }

    return (
        <div className="chatbot-window">
            <div className="chatbot-header">
                <div className="chatbot-title">
                    <Bot size={20} />
                    <span>CogniTrack AI</span>
                </div>
                <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                    <X size={20} />
                </button>
            </div>

            <div className="chatbot-messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`message-wrapper ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
                    >
                        <div className="message-avatar">
                            {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`message-bubble ${message.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                            <p>{message.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message-wrapper message-bot">
                        <div className="message-avatar"><Bot size={16} /></div>
                        <div className="message-bubble bubble-bot typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chatbot-input-area" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about your schedule or expenses..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={!inputText.trim() || isLoading} className="chatbot-send-btn">
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
