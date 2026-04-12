import React, { useState, useEffect } from 'react';

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
        setDisplayText((prev) => fullText.slice(0, i + 1));
        i++;
        if (i >= fullText.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20); // Fast but visible typing speed

      return () => clearInterval(interval);
    }
  }, [message.text, isUser]);
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm transition-all hover:shadow-md ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
        }`}
        style={{
          animation: 'chatBubbleEnter 0.3s ease-out forwards'
        }}
      >
        <p className="whitespace-pre-wrap">
          {displayText}
          {isTyping && <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 animate-pulse align-middle"></span>}
        </p>
        {!isTyping && (
          <span className={`text-[10px] mt-1 block opacity-70 ${isUser ? 'text-blue-100' : 'text-slate-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <style>{`
        @keyframes chatBubbleEnter {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ChatMessage;
