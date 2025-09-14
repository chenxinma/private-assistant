const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟 AG-UI 事件流
app.post('/agent', (req, res) => {
  // 设置 SSE 头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // 发送 RUN_STARTED 事件
  res.write(`data: ${JSON.stringify({
    type: "RUN_STARTED",
    threadId: req.body.threadId,
    runId: req.body.runId
  })}\n\n`);
  
  // 发送 TEXT_MESSAGE_START 事件
  const messageId = Date.now().toString();
  res.write(`data: ${JSON.stringify({
    type: "TEXT_MESSAGE_START",
    messageId: messageId,
    role: "assistant"
  })}\n\n`);
  
  // 模拟逐步发送文本内容
  const responses = [
    "您好！我是您的邮件助手。",
    "我理解您的请求，正在为您处理...",
    "根据您的问题，我已经查找了相关邮件信息。",
    "以下是您需要的邮件摘要：",
    "\n\n1. 来自市场部的会议邀请 - 今天下午3点\n2. 技术支持的服务器更新通知 - 明天凌晨2点\n3. 财务部的月度报告 - 已附上附件",
    "\n\n如果您需要了解更多详细信息，请告诉我！"
  ];
  
  let index = 0;
  const interval = setInterval(() => {
    if (index < responses.length) {
      res.write(`data: ${JSON.stringify({
        type: "TEXT_MESSAGE_CONTENT",
        messageId: messageId,
        delta: responses[index] + " "
      })}\n\n`);
      index++;
    } else {
      // 发送 TEXT_MESSAGE_END 事件
      res.write(`data: ${JSON.stringify({
        type: "TEXT_MESSAGE_END",
        messageId: messageId
      })}\n\n`);
      
      // 发送 RUN_FINISHED 事件
      res.write(`data: ${JSON.stringify({
        type: "RUN_FINISHED",
        threadId: req.body.threadId,
        runId: req.body.runId
      })}\n\n`);
      
      clearInterval(interval);
      res.end();
    }
  }, 500);
  
  // 处理客户端断开连接
  req.on('close', () => {
    clearInterval(interval);
  });
});

// 工具调用处理
app.post('/tool/:toolName', (req, res) => {
  const { toolName } = req.params;
  const { toolCallId } = req.body;
  
  console.log(`调用工具: ${toolName}`, req.body);
  
  // 模拟工具响应
  let result = "";
  switch (toolName) {
    case 'searchEmail':
      result = JSON.stringify({
        emails: [
          { id: 1, subject: "会议邀请", sender: "market@example.com", summary: "今天下午3点产品会议" },
          { id: 2, subject: "服务器更新", sender: "tech@example.com", summary: "明天凌晨2点服务器维护" }
        ]
      });
      break;
    case 'getTodaysEmailSummary':
      result = JSON.stringify({
        summary: "今日收到3封邮件：2封未读，1封已读",
        unreadCount: 2,
        importantCount: 1
      });
      break;
    case 'getUnreadEmails':
      result = JSON.stringify({
        emails: [
          { id: 1, subject: "会议邀请", sender: "market@example.com", summary: "今天下午3点产品会议" },
          { id: 2, subject: "服务器更新", sender: "tech@example.com", summary: "明天凌晨2点服务器维护" }
        ]
      });
      break;
    default:
      result = JSON.stringify({ message: `工具 ${toolName} 已执行` });
  }
  
  res.json({
    messageId: Date.now().toString(),
    toolCallId: toolCallId,
    content: result,
    role: "tool"
  });
});

app.listen(port, () => {
  console.log(`AG-UI 测试服务器运行在 http://localhost:${port}`);
});