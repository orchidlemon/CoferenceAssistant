// ── AI service ──────────────────────────────────────────
// All calls are made directly from the browser to the AI provider.
// API keys are stored in the user's localStorage only — never sent to any server.

export const PROVIDERS = {
  deepseek: {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat',     label: 'DeepSeek V3（推荐）' },
      { id: 'deepseek-reasoner', label: 'DeepSeek R1（推理）' },
    ],
    defaultModel: 'deepseek-chat',
    format: 'openai',
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: 'https://platform.deepseek.com/api_keys',
    keyLinkText: 'DeepSeek 开放平台',
  },
  doubao: {
    name: '豆包',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    models: [],
    defaultModel: '',
    format: 'openai',
    freeModel: true,
    keyPlaceholder: 'your-volcengine-api-key',
    keyLink: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',
    keyLinkText: '火山引擎控制台',
    modelHint: '填写推理接入点 ID，格式：ep-xxxxxxxx-xxxxx（在火山引擎「在线推理」中创建）',
  },
  qianwen: {
    name: '通义千问',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen-plus',   label: 'Qwen Plus（推荐）' },
      { id: 'qwen-turbo',  label: 'Qwen Turbo' },
      { id: 'qwen-max',    label: 'Qwen Max' },
    ],
    defaultModel: 'qwen-plus',
    format: 'openai',
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: 'https://bailian.console.aliyun.com',
    keyLinkText: '阿里云百炼',
  },
  openai: {
    name: 'GPT',
    baseURL: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini（推荐）' },
      { id: 'gpt-4o',      label: 'GPT-4o' },
    ],
    defaultModel: 'gpt-4o-mini',
    format: 'openai',
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: 'https://platform.openai.com/api-keys',
    keyLinkText: 'OpenAI Platform',
  },
  gemini: {
    name: 'Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    models: [
      { id: 'gemini-2.0-flash',        label: 'Gemini 2.0 Flash（推荐）' },
      { id: 'gemini-1.5-flash',        label: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.5-pro',          label: 'Gemini 1.5 Pro' },
    ],
    defaultModel: 'gemini-2.0-flash',
    format: 'openai',
    keyPlaceholder: 'AIzaSyxxxxxxxxxxxxxxxx',
    keyLink: 'https://aistudio.google.com/apikey',
    keyLinkText: 'Google AI Studio',
  },
  claude: {
    name: 'Claude',
    baseURL: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-3-5-haiku-20241022',  label: 'Claude 3.5 Haiku（推荐）' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-opus-4-5',            label: 'Claude Opus 4' },
    ],
    defaultModel: 'claude-3-5-haiku-20241022',
    format: 'anthropic',
    keyPlaceholder: 'sk-ant-api03-xxxxxxxx',
    keyLink: 'https://console.anthropic.com/settings/keys',
    keyLinkText: 'Anthropic Console',
  },
}

// ── Unified call ────────────────────────────────────────
export async function callAI(systemPrompt, userContent, settings) {
  const { provider, model, apiKey, customBaseURL } = settings
  if (!apiKey?.trim()) throw new Error('请先在「AI 设置」中配置 API Key')
  const cfg     = PROVIDERS[provider]
  if (!cfg) throw new Error('未知的模型提供商')
  const baseURL = customBaseURL?.trim() || cfg.baseURL
  const mdl     = model?.trim() || cfg.defaultModel
  if (!mdl) throw new Error('请填写模型名称（例如豆包的 Endpoint ID）')

  return cfg.format === 'anthropic'
    ? callAnthropic(baseURL, apiKey.trim(), mdl, systemPrompt, userContent)
    : callOpenAICompat(baseURL, apiKey.trim(), mdl, systemPrompt, userContent)
}

async function callOpenAICompat(baseURL, apiKey, model, system, user) {
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages:    [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.3,
      max_tokens:  2048,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `请求失败（HTTP ${res.status}）`)
  }
  const data = await res.json()
  return data.choices[0].message.content
}

async function callAnthropic(baseURL, apiKey, model, system, user) {
  const res = await fetch(`${baseURL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type':                    'application/json',
      'x-api-key':                       apiKey,
      'anthropic-version':               '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model,
      system,
      messages:   [{ role: 'user', content: user }],
      max_tokens: 2048,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `请求失败（HTTP ${res.status}）`)
  }
  const data = await res.json()
  return data.content[0].text
}

// ── JSON parser ─────────────────────────────────────────
export function parseJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const raw   = match ? match[1] : text
  try {
    return JSON.parse(raw.trim())
  } catch {
    const m = raw.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
    throw new Error('AI 返回内容无法解析为 JSON，请重试')
  }
}

// ── Default system prompts (exported so users can view and override) ────────
export const DEFAULT_SYSTEM_PROMPTS = {
  agenda:
`你是一位经验丰富的会议管理专家，擅长为各类工作会议设计高效、结构清晰的议程。

【工作流程】
1. 判断会议类型：根据标题和参与者推断（决策型 / 信息同步型 / 复盘型 / 规划型）
2. 审查遗留 Actions：若有未关闭事项，安排「遗留事项跟进」作为第一个议题
3. 拆解核心议题：围绕会议目标列出 3～6 个具体可讨论的议题
4. 分配时间：根据总时长合理分配，保留开场 2 分钟和收尾 3 分钟用于 Next Steps
5. 议题排序原则：遗留跟进 → 核心决策议题（重要且紧急）→ 信息同步议题 → Next Steps 确认
6. 每个议题必须有明确的预期产出，避免"讨论 xxx"这类模糊表述

【字段说明】
- type: decision（需做决策）| sync（信息对齐）| review（复盘/评审）| brainstorm（头脑风暴）
- owner: 该议题的主导发言人，从参与者中选取，无法确定则省略此字段
- time: 格式为"X 分钟"，所有议题时间之和不超过总会议时长

必须严格以 JSON 格式输出，不要包含任何其他文字。

输出格式：
{
  "meeting_type": "会议类型（中文描述，如：季度规划会 / 技术评审会 / 周例会等）",
  "agenda": [
    {
      "title": "议题标题（简洁，不超过15字）",
      "desc": "本议题目标或需做出的决策——一句话，聚焦产出而非过程",
      "time": "X 分钟",
      "type": "decision|sync|review|brainstorm",
      "owner": "主导人姓名（可选）"
    }
  ]
}`,

  summary:
`你是一位专业会议纪要撰写专家，能从会议记录中精准提取关键信息并结构化输出。

【工作流程】
1. 通读全文，理清会议主线：本次会议解决了什么问题、做了哪些决策
2. 提取决策：只记录有明确共识的结论，不记录讨论过程；每条决策写清楚"决定做什么"和"为什么"
3. 识别 Action Items：必须是具体可执行的任务，有明确责任人（从参与者姓名中选取）
4. 撰写摘要：第一段概述会议背景与主要结论；中间段落展开关键决策和讨论脉络；最后一段说明后续方向
5. 优先级判断：h（高）= 影响他人工作或本周内截止；m（中）= 两周内完成；l（低）= 两周后或长期规划

【Action 识别标准】
✓ 合格示例："周五前完成 API 文档初稿并发给研发团队审阅"
✗ 不合格示例："提升代码质量"（太抽象）/ "持续关注用户反馈"（无明确截止）

【字段说明】
- due_hint: 从会议记录中提取的时间线索（如"本周五"、"下次会议前"、"月底前"），无则为空字符串

【关于匿名发言人标签】
若会议记录中出现 "A："、"B："、"Speaker 1："、"甲："等匿名标签，说明说话人真实身份尚未确认。请在摘要和 Actions 中保留这些原始标签（如"A 指出…"、assignee 填"A"），不要猜测或将其与参与者名单中的姓名关联。

必须严格以 JSON 格式输出，不要包含任何其他文字。用中文回复。

输出格式：
{
  "summary": "会议摘要全文（2～4 段，段落之间用 \\n\\n 分隔）",
  "decisions": [
    {
      "content": "决策内容（以"决定/确认/同意"等动词开头）",
      "context": "决策背景或原因（一句话，可选）"
    }
  ],
  "actions": [
    {
      "text": "具体待办事项（动词开头，包含可衡量的目标）",
      "assignee": "负责人姓名（从参与者中选取，无法确定则为空字符串）",
      "priority": "h|m|l",
      "due_hint": "时间提示或空字符串"
    }
  ]
}`,

  insights:
`你是一位专业的会议效能分析师，擅长从有限的数据中发现规律，给出有依据、可落地的改进建议。

【工作流程】
1. 分析会议频率和规模：近期会议是否过密？参与人数是否合理？
2. 评估 Action 执行情况：完成率、逾期率、待处理积压是否在健康范围内？
3. 识别模式：是否有重复出现的议题？是否有长期未推进的事项？
4. 生成 2～3 条洞察，每条必须有数据支撑、有明确结论、有具体建议
5. 优先输出最紧迫的问题（高逾期率 > 低完成率 > 会议效率问题）

【洞察质量标准】
- 必须有数字：直接引用输入数据中的具体数值
- 必须有结论：说清楚"这意味着什么"，而不只是复述数据
- 必须有建议：给出下一步的具体行动，避免"建议关注""需要重视"等无效表述
- icon 选择：📊 数据趋势 | ⚠️ 风险预警 | 🎯 目标对齐 | ✅ 表现良好 | 🔄 流程优化 | 💡 改进建议 | 🔥 紧急

必须严格以 JSON 格式输出，不要包含任何其他文字。用中文回复。

输出格式：
{
  "insights": [
    {
      "icon": "单个 emoji",
      "title": "洞察标题（不超过10字）",
      "text": "基于具体数据的分析结论（1～2句，含数字）",
      "suggestion": "具体可操作的改进建议（1句话，以动词开头）"
    }
  ]
}`,
}

// ── Prompt templates ────────────────────────────────────
export const PROMPTS = {

  agenda(meeting, pendingActions, customSystem = '') {
    const actionList = pendingActions.length
      ? pendingActions.map(a => `- ${a.text}${a.assignee ? `（负责人：${a.assignee}）` : ''}`).join('\n')
      : '无遗留事项'

    return {
      system: customSystem || DEFAULT_SYSTEM_PROMPTS.agenda,

      user: `请根据以下信息生成会议议程：

会议标题：${meeting.title}
参与者：${(meeting.participants || []).join('、') || '未指定'}
时长：${meeting.duration || 60} 分钟

遗留待处理 Actions：
${actionList}

要求：
- 生成 5～7 个议题
- 若有遗留 Actions，第一项必须是「遗留事项跟进」
- 最后一项必须是「Next Steps 确认」
- 所有议题时长之和不超过 ${meeting.duration || 60} 分钟
- desc 聚焦目标或需决策的问题，一句话即可

输出格式（严格 JSON，不要有其他内容）：
{
  "agenda": [
    { "title": "议题标题", "desc": "目标或需决策的问题", "time": "X min" }
  ]
}`,
    }
  },

  summary(meeting, notes, customSystem = '') {
    const hasLabels = /^[A-Z][:：]|^Speaker\s*[A-Z0-9]+[:：]|^[甲乙丙丁戊己庚辛][:：]/m.test(notes)
    return {
      system: customSystem || DEFAULT_SYSTEM_PROMPTS.summary,

      user: `请根据以下会议记录生成会议纪要：

会议标题：${meeting.title}
时间：${meeting.scheduledAt || '未知'}
参与者：${(meeting.participants || []).join('、') || '未知'}

会议记录：
${notes}
${hasLabels ? '\n⚠️ 提示：以上记录中含匿名发言人标签（A、B、C 等），请在摘要和 Actions 中原样保留这些标签，不要猜测对应的真实姓名。\n' : ''}
要求：
- summary：2～3 段，涵盖核心讨论、关键决策和结论；若含匿名标签，摘要最后注明"（注：A/B/C 等为匿名标签，请核实后在编辑中替换为真实姓名）"
- decisions：提取有明确共识的决策，无则留空数组
- actions 中每项必须具体可执行；assignee 从参与者姓名中选取，若只有匿名标签则填写标签本身
- priority：h = 高优先，m = 中，l = 低

输出格式（严格 JSON，不要有其他内容）：
{
  "summary": "会议摘要全文（2～3 段，段落间用 \\n\\n 分隔）",
  "decisions": [
    { "content": "决策内容（以决定/确认/同意等动词开头）", "context": "决策背景（可选）" }
  ],
  "actions": [
    { "text": "具体待办事项", "assignee": "负责人或匿名标签", "priority": "h|m|l", "due_hint": "" }
  ]
}`,
    }
  },

  insights(meetings, actions, customSystem = '') {
    const recentMeetings = meetings.slice(0, 6).map(m =>
      `- ${m.title}（${m.scheduledAt?.split('T')[0] || '未知日期'}，${m.participants?.length || 0} 人参与）`
    ).join('\n') || '暂无会议记录'

    const today    = new Date().toISOString().split('T')[0]
    const tracked  = actions.filter(a => a.tracked)
    const pending  = tracked.filter(a => !a.done)
    const overdue  = pending.filter(a => a.dueDate && a.dueDate < today)
    const doneRate = tracked.length > 0 ? Math.round(tracked.filter(a => a.done).length / tracked.length * 100) : 0

    return {
      system: customSystem || DEFAULT_SYSTEM_PROMPTS.insights,

      user: `请分析以下数据并生成洞察：

近期会议（最新 6 场）：
${recentMeetings}

Action 数据：
- 待处理：${pending.length} 项（其中已逾期 ${overdue.length} 项）
- Action 完成率：${doneRate}%
- 总追踪数：${tracked.length} 项

要求：生成 2～3 条洞察，每条必须包含具体数字，并给出可操作的建议。

输出格式（严格 JSON，不要有其他内容）：
{
  "insights": [
    { "icon": "📊", "text": "洞察内容（含数字和建议）" }
  ]
}`,
    }
  },
}
