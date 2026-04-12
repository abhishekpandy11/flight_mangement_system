import React, { useState, useEffect } from 'react';

const BotIcon = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0 animate-in zoom-in duration-500">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
      <path d="M12 6v6l4 2" />
    </svg>
  </div>
);

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const [displayText, setDisplayText] = useState(isUser ? message.text : '');
  const [isTyping, setIsTyping] = useState(!isUser);

  useEffect(() => {
    if (!isUser) {
      let i = 0;
      const fullText = message.text;
      setDisplayText('');
      setIsTyping(true);
      
      const interval = setInterval(() => {
        setDisplayText(fullText.slice(0, i + 1));
        i++;
        if (i >= fullText.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 15);

      return () => clearInterval(interval);
    }
  }, [message.text, isUser]);
  
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      {!isUser && <BotIcon />}
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm shadow-md transition-all hover:shadow-xl ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-700'
          }`}
          style={{
            animation: 'chatBubbleEnter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}
        >
          <div className="whitespace-pre-wrap leading-relaxed">
            {displayText}
            {isTyping && (
              <span className="inline-flex gap-1 ml-1 items-baseline">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-duration:0.6s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s] [animation-duration:0.6s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s] [animation-duration:0.6s]"></span>
              </span>
            )}
          </div>
        </div>
        
        {!isTyping && (
          <span className={`text-[10px] mt-1.5 font-medium tracking-wide uppercase opacity-0 group-hover:opacity-60 transition-opacity duration-300 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <style>{`
        @keyframes chatBubbleEnter {
          from { opacity: 0; transform: translateY(12px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ChatMessage;
