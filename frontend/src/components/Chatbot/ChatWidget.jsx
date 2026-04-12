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

  // Dragging State
  const [position, setPosition] = useState({ x: window.innerWidth - 410, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const widgetWidth = isOpen ? 384 : 56;
        const widgetHeight = isOpen ? 580 : 56;
        return {
          x: Math.max(0, Math.min(prev.x, window.innerWidth - widgetWidth)),
          y: Math.max(0, Math.min(prev.y, window.innerHeight - widgetHeight))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const onMouseDown = (e) => {
    const handle = e.target.closest('.drag-handle');
    if (handle) {
      setIsDragging(true);
      hasMovedRef.current = false;
      startPosRef.current = { x: e.clientX, y: e.clientY };
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
      e.preventDefault();
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      
      const dx = Math.abs(e.clientX - startPosRef.current.x);
      const dy = Math.abs(e.clientY - startPosRef.current.y);
      if (dx > 5 || dy > 5) {
        hasMovedRef.current = true;
      }

      let newX = e.clientX - dragOffset.current.x;
      let newY = e.clientY - dragOffset.current.y;

      const widgetWidth = isOpen ? 384 : 56;
      const widgetHeight = isOpen ? 580 : 56;
      
      newX = Math.max(0, Math.min(newX, window.innerWidth - widgetWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - widgetHeight));

      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.userSelect = 'auto';
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, isOpen]);

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
    <div 
      className={`fixed z-50 flex flex-col items-end ${isDragging ? 'shadow-lg' : 'transition-all duration-300 ease-out'}`}
      style={{ 
        left: position.x, 
        top: position.y,
        transitionProperty: isDragging ? 'none' : 'left, top, transform, shadow',
        willChange: 'left, top',
        touchAction: 'none',
      }}
    >
      <div className="relative flex flex-col items-end">
        {/* Chat Window - Material Glassmorphism & Watermark AI Face */}
        {isOpen && (
          <div className="absolute bottom-[80px] right-0 w-80 sm:w-[400px] h-[550px] bg-white/20 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl flex flex-col border border-white/30 dark:border-white/10 overflow-hidden transform-gpu animate-in fade-in slide-in-from-bottom-10 duration-500">
            
            {/* Background Watermark Face */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05] overflow-hidden">
              <svg viewBox="0 0 24 24" className="w-64 h-64" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                <path d="M7 10h2v2H7zm8 0h2v2h-2zm-6 4h6v2H9z" />
              </svg>
            </div>

            {/* Premium Header - Reduced Glow */}
            <div 
              onMouseDown={onMouseDown}
              className="bg-white/10 backdrop-blur-md p-6 border-b border-white/10 text-slate-800 dark:text-white flex justify-between items-center cursor-grab active:cursor-grabbing drag-handle select-none touch-none"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor">
                      <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm-4 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm8 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-8 6h8v2H8v-2z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">SkyRoute Assistant</h3>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center uppercase tracking-widest font-bold">
                    {loading ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-current rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        Thinking...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 opacity-80">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Online
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsOpen(false); 
                }}
                className="p-2 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-xl transition-all"
                title="Close Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area - High Transparency */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 scrollbar-hide">
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {loading && (
                <div className="flex justify-start mb-6">
                  <div className="relative group">
                    <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-2xl rounded-tl-none px-5 py-4 shadow-sm border border-white/20 dark:border-white/5 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                        </div>
                        <span className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest">{loadingStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Integrated Glass */}
            <div className="p-6 bg-white/10 backdrop-blur-md border-t border-white/10 relative z-10">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder="Type your message..."
                  className="w-full bg-white/20 dark:bg-slate-800/40 border border-white/30 dark:border-white/10 backdrop-blur-md rounded-2xl px-5 py-3.5 text-sm transition-all focus:ring-2 focus:ring-blue-500/50 dark:text-white dark:placeholder-slate-400 outline-none pr-14"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute right-2 top-2 bg-blue-600/90 hover:bg-blue-600 text-white p-2.5 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center border border-white/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Floating Bubble - Sleeker Material Design */}
        <button
          onMouseDown={onMouseDown}
          onClick={(e) => { 
            if (!hasMovedRef.current) {
              setIsOpen(!isOpen);
            }
          }}
          className={`w-16 h-16 rounded-[1.75rem] shadow-xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-90 drag-handle cursor-grab active:cursor-grabbing touch-none group border border-white/20 ${
            isOpen ? 'bg-slate-900/90 rotate-90 scale-90' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
          }`}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-600"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};


export default ChatWidget;
