import React from 'react';
import ChatWindow from './components/ChatWindow';
import { apiService } from './services/api'

function App() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [message, setMessage] = React.useState('');

  // 添加定时刷新的useEffect
  React.useEffect(() => {
    // 定时刷新的时间间隔（毫秒），这里设置为5分钟刷新一次
    const refreshInterval = 5 * 60 * 1000; 

    // 设置定时器
    const timer = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    // 组件卸载时清除定时器
    return () => {
      clearInterval(timer);
    };
  }, [refreshing]); // 依赖项数组中包含refreshing状态

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage('开始刷新邮件...');

    try {
      await apiService.refreshEmails(2,
        (data) => {
          if (data.count> 0) {
            setMessage('收到邮件:' + data.title);
            setTimeout(() => setMessage(''), 3000);
          }
        },
        () => {
          setMessage('邮件刷新完成');
          setRefreshing(false);
          // 设置定时器，3秒后自动隐藏消息
          setTimeout(() => setMessage(''), 1000);
        },
        (error) => {
          setMessage('刷新邮件失败: ' + error.message);
          setRefreshing(false);
          // 设置定时器，5秒后自动隐藏消息
          setTimeout(() => setMessage(''), 5000);
        }
      )
    } catch (error) {
      setMessage('刷新邮件失败: ' + error.message);
      setRefreshing(false);
      // 设置定时器，5秒后自动隐藏消息
      setTimeout(() => setMessage(''), 5000);
    }
  };
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
          <span className="text-gray-400 text-xs">
            {refreshing ? '刷新中...' : ''}
          </span>
          <button className="w-6 h-6 rounded-full hover:bg-dark-100 flex items-center justify-center transition-colors"
            onClick={handleRefresh}
            >
            <i className="fa fa-download text-gray-400 text-xs"></i>
          </button>
          <button id="closeWindow"
            className="w-6 h-6 rounded-full hover:bg-red-600 flex items-center justify-center transition-colors"
            onClick={() => window.electronAPI?.closeWindow()}
          >
            <i className="fa fa-times text-gray-400 hover:text-white text-xs"></i>
          </button>
        </div>
      </header>

      {/* 邮件刷新消息提示 */}
      {message && (
        <div className="absolute top-[20px] left-1/2 transform -translate-x-1/2 w-[300px] hs-soft-color-secondary-label text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ease-out animate-fade-in-up z-50">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <i className="fa fa-info-circle text-white/80"></i>
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-white">{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button 
                type="button" 
                className="bg-transparent rounded-md inline-flex text-white/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-hs-soft-color-secondary-label focus:ring-white"
                onClick={() => setMessage('')}
              >
                <span className="sr-only">关闭</span>
                <i className="fa fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow />
      </main>
    </div>
  );
}

export default App;