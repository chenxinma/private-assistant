import React from 'react';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <div className="bg-dark-400 text-gray-200 font-inter h-screen flex flex-col overflow-hidden">
      {/* 标题栏 */}
      <header className="bg-dark-300 px-4 py-3 flex items-center justify-between border-b border-dark-100 select-none">
        <div className="flex items-center space-x-3 draggable-header w-full">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <i className="fa fa-envelope-o text-white"></i>
          </div>
          <h1 className="text-white font-medium">邮件助手</h1>
        </div>
        
        {/* 窗口控制按钮 */}
        <div className="flex space-x-2">
          <button className="w-6 h-6 rounded-full hover:bg-dark-100 flex items-center justify-center transition-colors">
            <i className="fa fa-window-minimize text-gray-400 text-xs"></i>
          </button>
          <button className="w-6 h-6 rounded-full hover:bg-dark-100 flex items-center justify-center transition-colors">
            <i className="fa fa-window-maximize text-gray-400 text-xs"></i>
          </button>
          <button id="closeWindow"
            className="w-6 h-6 rounded-full hover:bg-red-600 flex items-center justify-center transition-colors"
            onClick={() => window.electronAPI?.closeWindow()}
          >
            <i className="fa fa-times text-gray-400 hover:text-white text-xs"></i>
          </button>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow />
      </main>
    </div>
  );
}

export default App;