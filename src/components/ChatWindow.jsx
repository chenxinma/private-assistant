import React, { useState, useRef, useEffect } from 'react';
import AgUiClient from '../ag-ui/AgUiClient';
import { 
  searchEmailTool, 
  getTodaysEmailSummaryTool, 
  getUnreadEmailsTool 
} from '../ag-ui/tools';

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
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const agUiClientRef = useRef(null);

  // 初始化 AG-UI 客户端
  useEffect(() => {
    // 创建 AG-UI 客户端实例
    agUiClientRef.current = new AgUiClient({
      apiUrl: 'http://localhost:8000' // 这里应该配置实际的后端 API 地址
    });
    
    // 添加邮件相关的工具
    agUiClientRef.current.addTool(searchEmailTool);
    agUiClientRef.current.addTool(getTodaysEmailSummaryTool);
    agUiClientRef.current.addTool(getUnreadEmailsTool);
  }, []);

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

  // 处理 AG-UI 事件
  const handleAgUiEvent = (event) => {
    console.log('AG-UI Event:', event);
    
    switch (event.type) {
      case 'TEXT_MESSAGE_START':
        // 开始新的助手消息
        setMessages(prev => [...prev, {
          id: event.messageId,
          sender: 'assistant',
          text: '',
          timestamp: new Date()
        }]);
        break;
        
      case 'TEXT_MESSAGE_CONTENT':
        // 更新助手消息内容
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.id === event.messageId) {
            return [...prev.slice(0, -1), {
              ...lastMessage,
              text: lastMessage.text + event.content
            }];
          }
          return prev;
        });
        break;
        
      case 'RUN_STARTED':
        setIsAgentRunning(true);
        break;
        
      case 'RUN_FINISHED':
      case 'RUN_ERROR':
        setIsAgentRunning(false);
        break;
        
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (inputValue.trim() && !isAgentRunning) {
      // 添加用户消息
      const userMessage = {
        id: Date.now(),
        sender: 'user',
        text: inputValue.trim(),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      
      try {
        // 使用 AG-UI 客户端发送消息
        await agUiClientRef.current.sendMessage(userMessage.text, handleAgUiEvent);
      } catch (error) {
        console.error('发送消息失败:', error);
        // 添加错误消息
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'assistant',
          text: '抱歉，处理您的请求时出现了错误。请稍后重试。',
          timestamp: new Date()
        }]);
        setIsAgentRunning(false);
      }
    }
  };

  const handleSuggestionClick = async (actionText) => {
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
    
    if (!isAgentRunning) {
      // 添加用户消息
      const userMessage = {
        id: Date.now(),
        sender: 'user',
        text: messageText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      try {
        // 使用 AG-UI 客户端发送消息
        await agUiClientRef.current.sendMessage(userMessage.text, handleAgUiEvent);
      } catch (error) {
        console.error('发送消息失败:', error);
        // 添加错误消息
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'assistant',
          text: '抱歉，处理您的请求时出现了错误。请稍后重试。',
          timestamp: new Date()
        }]);
        setIsAgentRunning(false);
      }
    }
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
            disabled={isAgentRunning}
          >
            <i className="fa fa-calendar-o mr-1.5 text-primary"></i>
            <span>今日邮件总结</span>
          </button>
          <button 
            type="button"
            className="suggestion-hover bg-dark-200 hover:bg-dark-100 text-sm px-3 py-1.5 rounded-full flex items-center"
            onClick={() => handleSuggestionClick('搜索邮件')}
            disabled={isAgentRunning}
          >
            <i className="fa fa-search mr-1.5 text-primary"></i>
            <span>搜索邮件</span>
          </button>
          <button 
            type="button"
            className="suggestion-hover bg-dark-200 hover:bg-dark-100 text-sm px-3 py-1.5 rounded-full flex items-center"
            onClick={() => handleSuggestionClick('未读邮件')}
            disabled={isAgentRunning}
          >
            <i className="fa fa-flag-o mr-1.5 text-primary"></i>
            <span>未读邮件</span>
          </button>
          <button 
            type="button"
            className="suggestion-hover bg-dark-200 hover:bg-dark-100 text-sm px-3 py-1.5 rounded-full flex items-center"
            onClick={() => handleSuggestionClick('选择日期')}
            disabled={isAgentRunning}
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
              disabled={isAgentRunning}
            />
          </div>
          <button 
            type="submit"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg mt-0.5 ${
              isAgentRunning 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/90'
            }`}
            disabled={isAgentRunning}
          >
            {isAgentRunning ? (
              <i className="fa fa-spinner fa-spin text-white"></i>
            ) : (
              <i className="fa fa-paper-plane-o text-white"></i>
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatWindow;