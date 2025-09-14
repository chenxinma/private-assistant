/**
 * AG-UI 工具定义
 */

// 确认操作工具
export const confirmActionTool = {
  name: "confirmAction",
  description: "请求用户确认特定操作",
  parameters: {
    type: "object",
    properties: {
      action: {
        type: "string",
        description: "需要用户确认的操作"
      },
      importance: {
        type: "string",
        enum: ["low", "medium", "high", "critical"],
        description: "操作的重要程度"
      },
      details: {
        type: "string",
        description: "操作的详细信息"
      }
    },
    required: ["action"]
  }
};

// 获取用户数据工具
export const fetchUserDataTool = {
  name: "fetchUserData",
  description: "获取特定用户的数据",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "用户ID"
      },
      fields: {
        type: "array",
        items: {
          type: "string"
        },
        description: "要获取的字段"
      }
    },
    required: ["userId"]
  }
};

// 导航工具
export const navigateToTool = {
  name: "navigateTo",
  description: "导航到不同的页面或视图",
  parameters: {
    type: "object",
    properties: {
      destination: {
        type: "string",
        description: "目标页面或视图"
      },
      params: {
        type: "object",
        description: "导航参数（可选）"
      }
    },
    required: ["destination"]
  }
};

// 生成图像工具
export const generateImageTool = {
  name: "generateImage",
  description: "根据描述生成图像",
  parameters: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "图像描述"
      },
      style: {
        type: "string",
        description: "图像风格"
      },
      dimensions: {
        type: "object",
        properties: {
          width: { type: "number" },
          height: { type: "number" }
        },
        description: "图像尺寸"
      }
    },
    required: ["prompt"]
  }
};

// 搜索邮件工具
export const searchEmailTool = {
  name: "searchEmail",
  description: "搜索邮件",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "搜索查询"
      },
      dateRange: {
        type: "object",
        properties: {
          start: { type: "string", format: "date" },
          end: { type: "string", format: "date" }
        },
        description: "日期范围"
      },
      sender: {
        type: "string",
        description: "发件人"
      },
      unreadOnly: {
        type: "boolean",
        description: "仅搜索未读邮件"
      }
    },
    required: ["query"]
  }
};

// 获取今日邮件总结工具
export const getTodaysEmailSummaryTool = {
  name: "getTodaysEmailSummary",
  description: "获取今日邮件总结",
  parameters: {
    type: "object",
    properties: {
      date: {
        type: "string",
        format: "date",
        description: "日期（默认为今天）"
      }
    }
  }
};

// 获取未读邮件工具
export const getUnreadEmailsTool = {
  name: "getUnreadEmails",
  description: "获取未读邮件列表",
  parameters: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "返回邮件数量限制"
      }
    }
  }
};