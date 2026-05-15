import { reactive } from 'vue'

// ── Toast ───────────────────────────────────────────────
export const toastState = reactive({ msg: '', show: false })
let _tid = null
export function toast(msg) {
  toastState.msg = msg
  toastState.show = true
  clearTimeout(_tid)
  _tid = setTimeout(() => { toastState.show = false }, 2500)
}

// ── Constants ───────────────────────────────────────────
export const MEMBERS = [
  { name: '李明',  color: '#2563EB' },
  { name: '刘志远', color: '#DC2626' },
  { name: '孙雨涵', color: '#7C3AED' },
  { name: '周晓燕', color: '#059669' },
  { name: '陈浩博', color: '#D97706' },
  { name: '张总',  color: '#0891B2' },
  { name: '王晶',  color: '#059669' },
]

export const LINKED_SOURCES = ['Q2 路线图评审', '增长策略周会', '架构评审', '上周 Sprint 规划']

let _actionIdSeq = 100
export function nextActionId() { return ++_actionIdSeq }

// ── Demo seed data ──────────────────────────────────────
const SEED_CONTACTS = [
  { id: 1, name: '刘志远', role: '前端负责人',   color: '#DC2626', responsibilities: '前端架构、代码审查', projectIds: [3] },
  { id: 2, name: '孙雨涵', role: '后端负责人',   color: '#7C3AED', responsibilities: '后端架构、API 设计', projectIds: [1, 3] },
  { id: 3, name: '周晓燕', role: 'iOS 开发',     color: '#059669', responsibilities: 'iOS 端开发与测试',   projectIds: [1] },
  { id: 4, name: '陈浩博', role: 'Android 开发', color: '#D97706', responsibilities: 'Android 端开发',     projectIds: [1] },
  { id: 5, name: '张总',   role: '产品总监',      color: '#0891B2', responsibilities: '产品战略、跨部门协调', projectIds: [1, 2, 3] },
  { id: 6, name: '王晶',   role: 'UX 设计师',    color: '#059669', responsibilities: 'UI/UX 设计、用研',   projectIds: [2, 3] },
  { id: 7, name: '赵明',   role: '数据分析师',    color: '#2563EB', responsibilities: '数据分析、A/B 测试', projectIds: [2] },
]

const SEED_PROJECTS = [
  { id: 1, name: 'Q2 产品规划', color: '#2563EB', icon: '🚀' },
  { id: 2, name: '增长团队',    color: '#059669', icon: '📈' },
  { id: 3, name: '技术架构',    color: '#7C3AED', icon: '⚙️' },
]

const SEED_MEETINGS = [
  { id: 1, title: 'Q2 产品路线图评审',         platform: 'zoom',    projectId: 1, scheduledAt: '2026-05-15T09:30', duration: 60,  participants: ['李明','张总','孙雨涵','刘志远','周晓燕','王晶'] },
  { id: 2, title: '用户增长策略周会',           platform: 'tencent', projectId: 2, scheduledAt: '2026-05-15T14:00', duration: 45,  participants: ['李明','王晶','赵明'] },
  { id: 3, title: 'Sprint 规划对齐·研发团队',   platform: 'feishu',  projectId: 1, scheduledAt: '2026-05-15T16:00', duration: 90,  participants: ['李明','孙雨涵','刘志远','周晓燕','陈浩博'] },
  { id: 4, title: '技术债规划评审',             platform: 'feishu',  projectId: 3, scheduledAt: '2026-05-16T10:00', duration: 60,  participants: ['孙雨涵','刘志远','陈浩博','李明'] },
  { id: 5, title: 'H2 增长目标对齐',           platform: 'zoom',    projectId: 2, scheduledAt: '2026-05-16T15:30', duration: 60,  participants: ['李明','王晶','赵明','张总'] },
  { id: 6, title: 'Q1 复盘总结',               platform: 'tencent', projectId: 1, scheduledAt: '2026-05-14T10:00', duration: 90,  participants: ['李明','张总','孙雨涵','刘志远','周晓燕','陈浩博','王晶'] },
  { id: 7, title: 'UX 设计评审',               platform: 'feishu',  projectId: 3, scheduledAt: '2026-05-13T14:00', duration: 60,  participants: ['王晶','李明','刘志远'] },
  { id: 8, title: '架构升级方案讨论',            platform: 'zoom',    projectId: 3, scheduledAt: '2026-05-10T10:00', duration: 120, participants: ['孙雨涵','刘志远','陈浩博','李明'] },
]

// tracked: true = 已加入我的 Action 追踪器（assignee 是自己则自动 true）
const SEED_ACTIONS = [
  { id: 1, text: '更新竞品分析报告，覆盖 Q2 新功能对比',             assignee: '李明',  acolor: '#2563EB', dueDate: '2026-05-15', dueLabel: '今日到期', dueClass: 'tg-r', done: false, source: 'Q2 路线图评审', priority: 'h', tracked: true,  followed: false, addedToAgenda: false },
  { id: 2, text: '确认新功能数据埋点方案并反馈研发',                   assignee: '李明',  acolor: '#2563EB', dueDate: '2026-05-15', dueLabel: '今日到期', dueClass: 'tg-r', done: false, source: 'Q2 路线图评审', priority: 'h', tracked: true,  followed: false, addedToAgenda: false },
  { id: 3, text: '与 iOS / Android 同步 Sprint 目标，解决排期冲突',  assignee: '孙雨涵', acolor: '#7C3AED', dueDate: '2026-05-16', dueLabel: '明日到期', dueClass: 'tg-y', done: false, source: 'Q2 路线图评审', priority: 'm', tracked: false, followed: false, addedToAgenda: false },
  { id: 4, text: '整理用户增长 A/B 测试方案文档',                    assignee: '李明',  acolor: '#2563EB', dueDate: '2026-05-17', dueLabel: '本周五',   dueClass: 'tg-y', done: false, source: '增长策略周会',  priority: 'm', tracked: true,  followed: false, addedToAgenda: false },
  { id: 5, text: '起草 H2 技术债规划文档初稿',                       assignee: '刘志远', acolor: '#DC2626', dueDate: '2026-05-18', dueLabel: '本周内',   dueClass: 'tg-n', done: false, source: '架构评审',     priority: 'l', tracked: false, followed: false, addedToAgenda: false },
  { id: 6, text: '整理上周用户访谈洞察文档',                           assignee: '',      acolor: '',        dueDate: '',          dueLabel: '',         dueClass: 'tg-g', done: true,  source: '用户研究同步',  priority: 'm', tracked: true,  followed: false, addedToAgenda: false },
  { id: 7, text: '确认 Q1 复盘会议时间',                              assignee: '',      acolor: '',        dueDate: '',          dueLabel: '',         dueClass: 'tg-g', done: true,  source: '团队周会',      priority: 'l', tracked: true,  followed: false, addedToAgenda: false },
]

const SEED_AGENDA = [
  { id: 1, title: '上周 Sprint 回顾',       desc: '梳理完成事项，识别 Carry-over 任务',     time: '5 min'  },
  { id: 2, title: 'Q2 核心功能优先级确认',   desc: '聚焦用户增长模块 3 个待排需求 · 需决策', time: '15 min' },
  { id: 3, title: '技术债评估与排期',        desc: '遗留议题：登录模块重构方案',              time: '10 min' },
  { id: 4, title: '下周 Sprint 目标确认',    desc: '产研双方对齐交付口径，明确验收标准',      time: '10 min' },
  { id: 5, title: '风险与 Blockers 识别',    desc: '快速过一遍各端 blocker，分配解决人',      time: '5 min'  },
]

const SEED_CHECKLIST = [
  { id: 1, text: '发送议程给所有参与者',               note: '',                       done: false },
  { id: 2, text: '确认「竞品分析报告」已准备完毕',      note: '⚠️ 此 Action 今日到期', done: false },
  { id: 3, text: '查阅关联文件：Sprint 规划模板.xlsx', note: '',                       done: false },
]

const SEED_FILES = [
  { id: 1, name: 'Sprint 规划模板.xlsx',     size: '42 KB',  icon: '📊', bg: '#EFF6FF', blobUrl: null },
  { id: 2, name: 'Q2 产品需求文档 v3.docx', size: '128 KB', icon: '📘', bg: '#DBEAFE', blobUrl: null },
]

// ── Store (empty until login) ───────────────────────────
export const store = reactive({
  currentView:      'dashboard',
  currentMeetingId: null,
  currentUser:      null,
  isLoggedIn:       false,
  atFilter:         'all',
  agendaEditMode:   false,

  meetings:         [],
  actions:          [],
  files:            [],
  agendaItems:      [],
  checklist:        [],
  projects:         [],
  contacts:         [],
  summaryActionIds: [],

  assigneePop: { show: false, x: 0, y: 0, actionId: null },
  showModal:   false,

  aiSettings: {
    provider: 'deepseek', model: 'deepseek-chat', apiKey: '', customBaseURL: '',
    customPrompts: { agenda: '', summary: '', insights: '' },
  },
})

// ── Per-user persistence ────────────────────────────────
function userDataKey(email) { return `mm_data_${email}` }

function loadUserData(email) {
  try {
    const raw = localStorage.getItem(userDataKey(email))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveUserData(email, data) {
  if (!email) return
  localStorage.setItem(userDataKey(email), JSON.stringify(data))
}

export function persistUserData() {
  if (!store.currentUser?.email) return
  saveUserData(store.currentUser.email, {
    meetings:         store.meetings,
    actions:          store.actions,
    files:            store.files.map(f => ({ ...f, blobUrl: null })),
    agendaItems:      store.agendaItems,
    checklist:        store.checklist,
    projects:         store.projects,
    contacts:         store.contacts,
    summaryActionIds: store.summaryActionIds,
    aiSettings:       { ...store.aiSettings },
  })
}

function applyUserData(data) {
  store.meetings         = data.meetings         ?? []
  store.actions          = data.actions          ?? []
  store.files            = (data.files           ?? []).map(f => ({ ...f, blobUrl: null }))
  store.agendaItems      = data.agendaItems      ?? []
  store.checklist        = data.checklist        ?? []
  store.projects         = data.projects         ?? []
  store.contacts         = data.contacts         ?? []
  store.summaryActionIds = data.summaryActionIds ?? []
  if (data.aiSettings) {
    Object.assign(store.aiSettings, data.aiSettings)
    if (!store.aiSettings.customPrompts) store.aiSettings.customPrompts = { agenda: '', summary: '', insights: '' }
  } else {
    Object.assign(store.aiSettings, { provider: 'deepseek', model: 'deepseek-chat', apiKey: '', customBaseURL: '', customPrompts: { agenda: '', summary: '', insights: '' } })
  }
}

function emptyData() {
  return { meetings:[], actions:[], files:[], agendaItems:[], checklist:[], projects:[], contacts:[], summaryActionIds:[] }
}

// ── Auth ────────────────────────────────────────────────
const AVATAR_COLORS = ['#2563EB','#DC2626','#7C3AED','#059669','#D97706','#0891B2','#DB2777','#EA580C']

function loadUsers() {
  try { return JSON.parse(localStorage.getItem('mm_users') || '[]') } catch { return [] }
}
function saveUsers(u) { localStorage.setItem('mm_users', JSON.stringify(u)) }

// Seed demo account once
;(function () {
  const users = loadUsers()
  if (!users.find(u => u.email === 'demo@meetmind.ai')) {
    users.push({ email: 'demo@meetmind.ai', password: 'demo1234', name: '李明', color: '#2563EB' })
    saveUsers(users)
  }
  if (!localStorage.getItem(userDataKey('demo@meetmind.ai'))) {
    saveUserData('demo@meetmind.ai', {
      meetings: SEED_MEETINGS, actions: SEED_ACTIONS, files: SEED_FILES,
      agendaItems: SEED_AGENDA, checklist: SEED_CHECKLIST,
      projects: SEED_PROJECTS, contacts: SEED_CONTACTS,
      summaryActionIds: [1, 2, 3, 4, 5],
    })
  }
})()

export function register(email, password, name) {
  const users  = loadUsers()
  const lEmail = email.toLowerCase()
  if (users.find(u => u.email === lEmail)) return { ok: false, msg: '该邮箱已注册' }
  const color  = AVATAR_COLORS[users.length % AVATAR_COLORS.length]
  users.push({ email: lEmail, password, name, color })
  saveUsers(users)
  saveUserData(lEmail, emptyData())
  store.currentUser      = { email: lEmail, name, color }
  store.isLoggedIn       = true
  store.currentView      = 'dashboard'
  store.currentMeetingId = null
  applyUserData(emptyData())
  return { ok: true }
}

export function login(email, password) {
  const users  = loadUsers()
  const lEmail = email.toLowerCase()
  const user   = users.find(u => u.email === lEmail && u.password === password)
  if (!user) return { ok: false, msg: '邮箱或密码错误' }
  const data = loadUserData(lEmail) ?? emptyData()
  store.currentUser      = { email: lEmail, name: user.name, color: user.color }
  store.isLoggedIn       = true
  store.currentView      = 'dashboard'
  store.currentMeetingId = data.meetings?.[0]?.id ?? null
  applyUserData(data)
  return { ok: true }
}

export function logout() {
  store.currentUser      = null
  store.isLoggedIn       = false
  store.currentView      = 'dashboard'
  store.currentMeetingId = null
  store.agendaEditMode   = false
  applyUserData(emptyData())
}

// ── Action helpers ──────────────────────────────────────
export function getPendingActions() {
  return store.actions.filter(a => a.tracked && !a.done)
}

export function dueInfo(dateStr) {
  if (!dateStr) return { label: '', cls: '' }
  const today = new Date().toISOString().split('T')[0]
  const tom   = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  if (dateStr === today) return { label: '今日到期', cls: 'tg-r' }
  if (dateStr === tom)   return { label: '明日到期', cls: 'tg-y' }
  if (dateStr < today)   return { label: '已逾期',   cls: 'tg-r' }
  return { label: dateStr.slice(5).replace('-', '/'), cls: 'tg-n' }
}

export function setActionDue(actionId, dateStr) {
  const a = store.actions.find(x => x.id === actionId)
  if (!a) return
  const info = dueInfo(dateStr)
  a.dueDate  = dateStr
  a.dueLabel = info.label
  a.dueClass = info.cls
  persistUserData()
}

export function setActionAssignee(actionId, name, color) {
  const a = store.actions.find(x => x.id === actionId)
  if (!a) return
  a.assignee = name
  a.acolor   = color
  if (name === store.currentUser?.name) a.tracked = true
  persistUserData()
}

export function toggleActionDone(actionId) {
  const a = store.actions.find(x => x.id === actionId)
  if (a) { a.done = !a.done; persistUserData() }
}

export function toggleActionTracked(actionId) {
  const a = store.actions.find(x => x.id === actionId)
  if (a) { a.tracked = !a.tracked; persistUserData() }
}

export function deleteAction(actionId) {
  const idx = store.actions.findIndex(a => a.id === actionId)
  if (idx !== -1) store.actions.splice(idx, 1)
  const sidx = store.summaryActionIds.indexOf(actionId)
  if (sidx !== -1) store.summaryActionIds.splice(sidx, 1)
  persistUserData()
}

// ── Other mutations ─────────────────────────────────────
export function deleteContact(id) {
  const idx = store.contacts.findIndex(c => c.id === id)
  if (idx !== -1) { store.contacts.splice(idx, 1); persistUserData() }
}

export function updateContact(id, data) {
  const c = store.contacts.find(c => c.id === id)
  if (c) { Object.assign(c, data); persistUserData() }
}

export function addContact(data) {
  const id = Date.now()
  store.contacts.push({ id, color: '#6B7280', responsibilities: '', projectIds: [], ...data })
  persistUserData()
  return id
}

export function addMeeting(data) {
  const id = Date.now()
  store.meetings.unshift({ id, ...data })
  persistUserData()
  return id
}

export function updateMeeting(id, data) {
  const m = store.meetings.find(x => x.id === id)
  if (m) { Object.assign(m, data); persistUserData() }
}

export function addProject(name, color = '#6B7280', icon = '📁') {
  const id = Date.now()
  store.projects.push({ id, name, color, icon })
  persistUserData()
  return id
}

export function addNewAction(text = '新 Action', addToSummary = false) {
  const id = nextActionId()
  store.actions.push({
    id, text,
    assignee: store.currentUser?.name || '',
    acolor:   store.currentUser?.color || '',
    dueDate: '', dueLabel: '', dueClass: 'tg-n',
    done: false,
    source: store.meetings.find(m => m.id === store.currentMeetingId)?.title || '手动添加',
    priority: 'l', tracked: true, followed: false, addedToAgenda: false,
  })
  if (addToSummary && !store.summaryActionIds.includes(id)) store.summaryActionIds.push(id)
  persistUserData()
  return id
}
