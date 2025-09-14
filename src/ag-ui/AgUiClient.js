import { HttpAgent } from '@ag-ui/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * AG-UI 客户端实现
 * 遵守 Agent User Interaction Protocol
 */
class AgUiClient {
  /**
   * 构造函数
   * @param {Object} config - 客户端配置
   * @param {string} config.apiUrl - AG-UI 服务器 API 地址
   * @param {Object} config.headers - 可选的 HTTP 头
   */
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || 'http://localhost:8000',
      headers: config.headers || {},
      ...config
    };
    
    // 初始化 AG-UI HttpAgent
    this.agent = new HttpAgent({
      url: this.config.apiUrl,
      headers: this.config.headers
    });
    
    // 消息历史
    this.messages = [];
    
    // 当前会话线程 ID
    this.threadId = uuidv4();
    
    // 工具列表
    this.tools = [];
    
    // 状态
    this.state = {};
  }

  /**
   * 添加消息到历史记录
   * @param {Object} message - 消息对象
   */
  addMessage(message) {
    this.messages.push(message);
  }

  /**
   * 添加工具
   * @param {Object} tool - 工具定义
   */
  addTool(tool) {
    this.tools.push(tool);
  }

  /**
   * 设置状态
   * @param {Object} state - 状态对象
   */
  setState(state) {
    this.state = { ...this.state, ...state };
  }

  /**
   * 运行代理
   * @param {Object} parameters - 运行参数
   * @param {Function} onEvent - 事件回调函数
   * @returns {Promise} 运行结果的 Promise
   */
  async runAgent(parameters = {}, onEvent = null) {
    // 准备运行参数
    const runParams = {
      tools: this.tools,
      context: parameters.context || [],
      forwardedProps: parameters.forwardedProps || {},
      ...parameters
    };

    // 创建订阅者来处理事件
    const subscriber = {};
    
    // 如果提供了事件回调，则设置事件处理器
    if (onEvent) {
      // 文本消息内容事件
      subscriber.onTextMessageContentEvent = ({ event, textMessageBuffer }) => {
        onEvent({
          type: 'TEXT_MESSAGE_CONTENT',
          messageId: event.messageId,
          content: event.delta,
          buffer: textMessageBuffer
        });
      };
      
      // 文本消息开始事件
      subscriber.onTextMessageStartEvent = ({ event }) => {
        onEvent({
          type: 'TEXT_MESSAGE_START',
          messageId: event.messageId,
          role: event.role
        });
      };
      
      // 文本消息结束事件
      subscriber.onTextMessageEndEvent = ({ event, textMessageBuffer }) => {
        onEvent({
          type: 'TEXT_MESSAGE_END',
          messageId: event.messageId,
          content: textMessageBuffer
        });
      };
      
      // 工具调用开始事件
      subscriber.onToolCallStartEvent = ({ event }) => {
        onEvent({
          type: 'TOOL_CALL_START',
          toolCallId: event.toolCallId,
          toolCallName: event.toolCallName,
          parentMessageId: event.parentMessageId
        });
      };
      
      // 工具调用参数事件
      subscriber.onToolCallArgsEvent = ({ event, toolCallBuffer, toolCallName, partialToolCallArgs }) => {
        onEvent({
          type: 'TOOL_CALL_ARGS',
          toolCallId: event.toolCallId,
          content: event.delta,
          buffer: toolCallBuffer,
          toolCallName,
          partialArgs: partialToolCallArgs
        });
      };
      
      // 工具调用结束事件
      subscriber.onToolCallEndEvent = ({ event, toolCallName, toolCallArgs }) => {
        onEvent({
          type: 'TOOL_CALL_END',
          toolCallId: event.toolCallId,
          toolCallName,
          args: toolCallArgs
        });
      };
      
      // 工具调用结果事件
      subscriber.onToolCallResultEvent = ({ event }) => {
        onEvent({
          type: 'TOOL_CALL_RESULT',
          messageId: event.messageId,
          toolCallId: event.toolCallId,
          content: event.content,
          role: event.role
        });
      };
      
      // 运行开始事件
      subscriber.onRunStartedEvent = ({ event }) => {
        onEvent({
          type: 'RUN_STARTED',
          threadId: event.threadId,
          runId: event.runId
        });
      };
      
      // 运行完成事件
      subscriber.onRunFinishedEvent = ({ event, result }) => {
        onEvent({
          type: 'RUN_FINISHED',
          threadId: event.threadId,
          runId: event.runId,
          result
        });
      };
      
      // 运行错误事件
      subscriber.onRunErrorEvent = ({ event }) => {
        onEvent({
          type: 'RUN_ERROR',
          message: event.message,
          code: event.code
        });
      };
      
      // 状态快照事件
      subscriber.onStateSnapshotEvent = ({ event }) => {
        onEvent({
          type: 'STATE_SNAPSHOT',
          snapshot: event.snapshot
        });
      };
      
      // 状态增量事件
      subscriber.onStateDeltaEvent = ({ event }) => {
        onEvent({
          type: 'STATE_DELTA',
          delta: event.delta
        });
      };
      
      // 消息快照事件
      subscriber.onMessagesSnapshotEvent = ({ event }) => {
        onEvent({
          type: 'MESSAGES_SNAPSHOT',
          messages: event.messages
        });
      };
    }

    try {
      // 运行代理
      const result = await this.agent.runAgent(runParams, subscriber);
      
      // 更新消息历史
      if (result.newMessages && result.newMessages.length > 0) {
        this.messages = [...this.messages, ...result.newMessages];
      }
      
      return result;
    } catch (error) {
      console.error('AG-UI Agent 运行出错:', error);
      throw error;
    }
  }

  /**
   * 发送消息
   * @param {string} content - 消息内容
   * @param {Function} onEvent - 事件回调函数
   * @returns {Promise} 运行结果的 Promise
   */
  async sendMessage(content, onEvent = null) {
    // 创建用户消息
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: content
    };
    
    // 添加到消息历史
    this.addMessage(userMessage);
    
    // 运行代理
    return await this.runAgent({ messages: this.messages }, onEvent);
  }

  /**
   * 清除会话历史
   */
  clearHistory() {
    this.messages = [];
    this.threadId = uuidv4();
    this.state = {};
  }

  /**
   * 获取当前会话历史
   * @returns {Array} 消息历史数组
   */
  getHistory() {
    return this.messages;
  }
}

export default AgUiClient;