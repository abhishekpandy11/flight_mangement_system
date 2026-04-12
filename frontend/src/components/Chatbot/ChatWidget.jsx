import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { sendMessage, resumeMessage } from '../../api/chatService';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm your SkyRoute assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [status, setStatus] = useState('success');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let data;
      if (status === 'waiting_for_human') {
        data = await resumeMessage(input, threadId);
      } else {
        data = await sendMessage(input, threadId);
      }
      
      const aiMsg = {
        text: data.response,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
      if (data.thread_id) setThreadId(data.thread_id);
      if (data.status) setStatus(data.status);
      
      // Signal Dashboard to refresh if a booking was made/cancelled
      if (data.refresh_bookings) {
        window.dispatchEvent(new CustomEvent('refresh-bookings'));
      }
    } catch (error) {
      const errorMsg = {
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const [loadingStatus, setLoadingStatus] = useState('SkyRoute Assistant is thinking');

  useEffect(() => {
    if (loading) {
      const statuses = ['Searching flights...', 'Analyzing available seats...', 'Checking best routes...', 'Almost there...', 'Finalizing response...'];
      let idx = 0;
      const interval = setInterval(() => {
        setLoadingStatus(statuses[idx % statuses.length]);
        idx++;
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setLoadingStatus('SkyRoute Assistant is thinking');
    }
  }, [loading]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all duration-300 ease-out">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">SkyRoute Assistant</h3>
              <p className="text-xs text-blue-100 flex items-center">
              {loading ? (
                <span className="flex items-center text-blue-100 animate-pulse font-medium">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                  Assistant is typing...
                </span>
              ) : status === 'waiting_for_human' ? (
                <>
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  Human Escalated
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Always active
                </>
              )}
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-500 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {loading && (
              <div className="flex justify-start mb-6 group">
                <div className="relative">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-5 py-4 shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter min-w-[140px]">
                        {loadingStatus}
                      </span>
                    </div>
                    {/* Dynamic line animation */}
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 animate-shimmer" style={{ width: '40%', background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)' }}></div>
                    </div>
                  </div>
                  {/* Subtle glow effect */}
                  <div className="absolute -inset-1 bg-blue-500/10 blur-xl -z-10 rounded-full"></div>
                </div>
                <style>{`
                  @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(300%); }
                  }
                  .animate-shimmer {
                    animation: shimmer 1.5s infinite linear;
                  }
                `}</style>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-slate-800 dark:bg-slate-700 rotate-90' : 'bg-blue-600'
        }`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
