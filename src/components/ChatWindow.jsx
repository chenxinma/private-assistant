import React, { useState, useRef, useEffect } from 'react';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: '您好！我是您的邮件助手。我可以帮助您回答关于邮件内容的问题，或总结指定日期的邮件。',
      hint: '您可以直接提问，或使用下方的快捷功能。',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px';
    }
  }, [inputValue]);

  // 滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      // 添加用户消息
      const userMessage = {
        id: messages.length + 1,
        sender: 'user',
        text: inputValue.trim(),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      
      // 模拟助手回复
      setTimeout(() => {
        const responses = [
          "我正在查找相关邮件信息，请稍候...",
          "根据您的邮件内容，我为您整理了以下信息...",
          "您提到的这个问题，在邮件中有详细说明...",
          "我已为您汇总了相关邮件的要点..."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const assistantMessage = {
          id: messages.length + 2,
          sender: 'assistant',
          text: randomResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }, 800);
    }
  };

  const handleSuggestionClick = (actionText) => {
    let messageText = '';
    
    switch(actionText) {
      case '今日邮件总结':
        messageText = '请总结我今天收到的邮件';
        break;
      case '搜索邮件':
        messageText = '帮我搜索相关邮件';
        break;
      case '未读邮件':
        messageText = '显示我的未读邮件';
        break;
      case '选择日期':
        const today = new Date().toLocaleDateString('zh-CN');
        messageText = `请总结${today}的邮件`;
        break;
      default:
        messageText = actionText;
    }
    
    // 添加用户消息
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // 模拟助手回复
    setTimeout(() => {
      const assistantMessage = {
        id: messages.length + 2,
        sender: 'assistant',
        text: `正在为您${actionText.toLowerCase()}...`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 600);
  };

  return (
    <>
      {/* 对话历史区域 */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide"
      >
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-start message-appear ${message.sender === 'user' ? 'justify-end' : ''}`}
          >
            {message.sender === 'assistant' ? (
              <div className="bg-dark-300 rounded-2xl px-4 py-3 max-w-[80%] shadow-md">
                <p>{message.text}</p>
                {message.hint && <p className="mt-2 text-sm text-gray-400">{message.hint}</p>}
              </div>
            ) : (
              <div className="bg-primary/20 rounded-2xl px-4 py-3 max-w-[80%] shadow-md border border-primary/30">
                <p>{message.text}</p>               
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 快捷功能建议气泡 */}
      <div className="px-4 py-3 bg-dark-300 border-t border-dark-100">
        <p className="text-xs text-gray-500 mb-2">快速功能：</p>
        <div className="flex flex-wrap gap-2">
          <button 
            type="button"
            className="suggestion-hover bg-dark-200 hover:bg-dark-100 text-sm px-3 py-1.5 rounded-full flex items-center"
            onClick={() => handleSuggestionClick('今日邮件总结')}
          >
            <i className="fa fa-calendar-o mr-1.5 text-primary"></i>
            <span>今日邮件总结</span>
          </button>
          <button 
            type="button"
            className="suggestion-hover bg-dark-200 hover:bg-dark-100 text-sm px-3 py-1.5 rounded-full flex items-center"
            onClick={() => handleSuggestionClick('搜索邮件')}
          >
            <i className="fa fa-search mr-1.5 text-primary"></i>
            <span>搜索邮件</span>
          </button>
          <button 
            type="button"
            className="suggestion-hover bg-dark-200 hover:bg-dark-100 text-sm px-3 py-1.5 rounded-full flex items-center"
            onClick={() => handleSuggestionClick('未读邮件')}
          >
            <i className="fa fa-flag-o mr-1.5 text-primary"></i>
            <span>未读邮件</span>
          </button>
          <button 
            type="button"
            className="suggestion-hover bg-dark-200 hover:bg-dark-100 text-sm px-3 py-1.5 rounded-full flex items-center"
            onClick={() => handleSuggestionClick('选择日期')}
          >
            <i className="fa fa-calendar mr-1.5 text-primary"></i>
            <span>选择日期</span>
          </button>
        </div>
      </div>
      
      {/* 输入区域 */}
      <div className="p-4 bg-dark-300 border-t border-dark-100">
        <form id="message-form" className="flex items-start space-x-2" onSubmit={handleSubmit}>
          <div className="flex-1 relative">
            <textarea 
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="请输入您的问题..." 
              className="w-full bg-dark-200 border border-dark-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all scrollbar-hide"
              rows="1"
            />
          </div>
          <button 
            type="submit"
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors shadow-lg mt-0.5"
          >
            <i className="fa fa-paper-plane-o text-white"></i>
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatWindow;