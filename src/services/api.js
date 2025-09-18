const BASE_URL = 'http://localhost:9000/api'

// API接口定义
export const apiService = {
  // 刷新邮件（流式响应）
  refreshEmails: async (days, onMessage, onComplete, onError) => {
    try {
      const response = await fetch(BASE_URL + '/emails/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            if (onComplete) onComplete();
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          // 处理每个数据块
          const lines = chunk.split('\n');
          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data != '[DONE]') {
                try {
                  const jsonData = JSON.parse(data);
                  if (onMessage) onMessage(jsonData);
                } catch (error) {
                  console.error('解析流式数据失败:', error);
                  if (onError) onError(error);
                }
              }
            }
          });

          read();
        }).catch(error => {
          console.error('读取流式数据失败:', error);
          if (onError) onError(error);
        });
      }

      read();
      return response;
    } catch (error) {
      console.error('请求失败:', error);
      if (onError) onError(error);
      throw error;
    }
  },
}