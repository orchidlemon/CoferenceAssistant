<template>
  <div>
    <!-- Banner -->
    <div class="banner">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px">
        <div>
          <div style="display:flex;gap:7px;margin-bottom:8px">
            <span class="badge" :class="prepStatusBadgeClass">{{ prepStatusLabel }}</span>
            <span class="badge b-ai">✨ AI 已准备就绪</span>
          </div>
          <div class="banner-title">{{ currentMeeting?.title || '暂未选择会议' }}</div>
          <div class="banner-meta">
            <div class="mi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ meetingTimeStr }}
            </div>
            <div class="mi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              {{ currentMeeting?.participants?.length || 0 }} 人参与
            </div>
            <div class="mi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              {{ platformLabel(currentMeeting?.platform) }}
            </div>
          </div>
        </div>
        <button v-if="prepMeetingStatus !== 'ended'" class="btn btn-pri">▶ 加入会议</button>
        <button v-else class="btn btn-out" @click="store.currentView='summary'">查看纪要 →</button>
      </div>
    </div>

    <div class="prep-grid">
      <div>
        <!-- Agenda Card -->
        <div class="card" style="margin-bottom:16px">
          <div class="ch">
            <span class="ct">会议议程</span>
            <div style="display:flex;gap:7px;align-items:center">
              <button class="btn btn-ai" style="font-size:11px;padding:3px 9px"
                      :disabled="agendaAiLoading || !currentMeeting"
                      @click="generateAgenda">
                <span v-if="agendaAiLoading">生成中…</span>
                <span v-else>✨ AI 生成</span>
              </button>
              <button class="btn btn-ghost" style="font-size:11px;padding:3px 7px"
                      :style="editMode?{color:'var(--ok)'}:{}"
                      @click="toggleEdit">{{ editMode ? '✓ 完成' : '✏ 编辑' }}</button>
            </div>
          </div>
          <div class="cb">
            <div v-if="agendaAiGenerated" class="conf-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ai)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              AI 已根据会议信息和待处理 Actions 生成议程
            </div>
            <div v-else-if="agendaAiLoading"
                 style="padding:20px;text-align:center;font-size:13px;color:var(--ai)">
              ✨ AI 生成中，请稍候…
            </div>
            <div v-else-if="!store.agendaItems.length"
                 style="padding:24px;text-align:center;font-size:13px;color:var(--t3)">
              点击「AI 生成」自动创建会议议程，或手动添加议题
            </div>

            <div id="agendaList">
              <div v-for="(item, i) in store.agendaItems" :key="item.id"
                   class="agenda-item agenda-editable" :class="{['edit-mode']: editMode}">
                <div class="anum">{{ i + 1 }}</div>
                <div style="flex:1">
                  <div class="atitle"
                       :contenteditable="editMode"
                       spellcheck="false"
                       @blur="item.title = $event.target.textContent">{{ item.title }}</div>
                  <div class="adesc"
                       :contenteditable="editMode"
                       spellcheck="false"
                       style="font-size:12px;color:var(--t2);margin-top:2px"
                       @blur="item.desc = $event.target.textContent">{{ item.desc }}</div>
                </div>
                <div class="atime">{{ item.time }}</div>
                <button class="adel-btn" @click="delAgenda(i)" title="删除">×</button>
              </div>
            </div>

            <button v-if="editMode" class="add-agenda-btn" @click="addAgendaItem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              添加议题
            </button>
          </div>
        </div>

        <!-- File upload -->
        <div class="card" style="margin-bottom:16px">
          <div class="ch">
            <span class="ct">会议文件</span>
            <span style="font-size:11px;color:var(--t2)">上传后 AI 可引用内容生成议程</span>
          </div>
          <div class="cb">
            <div class="upload-zone" :class="{drag: isDragging}"
                 @click="fileInput.click()"
                 @dragover.prevent="isDragging=true"
                 @dragleave="isDragging=false"
                 @drop.prevent="handleDrop">
              <div class="upload-zone-icon">📎</div>
              <div class="upload-zone-text">点击上传或拖拽文件至此</div>
              <div class="upload-zone-hint">支持 PDF、Word、Excel、PPT，最大 50MB</div>
            </div>
            <input ref="fileInput" type="file" style="display:none" multiple
                   accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                   @change="handleFiles($event.target.files)">
            <div class="file-list">
              <div v-for="(f, i) in store.files" :key="f.id" class="file-item">
                <div class="file-icon" :style="{background:f.bg}">{{ f.icon }}</div>
                <div class="file-name">{{ f.name }}</div>
                <div class="file-size">{{ f.size }}</div>
                <button class="file-del" @click="removeFile(i)">×</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Carryover Actions -->
        <div class="card" style="margin-bottom:16px">
          <template v-if="carryoverActions.length === 0">
            <div class="ch"><span class="ct">遗留 Actions</span><span class="badge b-ok">✓ 全部已关闭</span></div>
            <div class="co-empty">🎉 上次会议的所有 Actions 均已完成</div>
          </template>
          <template v-else>
            <div class="ch">
              <span class="ct">遗留 Actions</span>
              <div style="display:flex;gap:6px;align-items:center">
                <span style="font-size:12px;color:var(--warn);font-weight:600">{{ carryoverActions.length }} 项未关闭</span>
                <span v-if="overdueCarryover > 0" class="badge b-err" style="font-size:10px">{{ overdueCarryover }} 已逾期</span>
              </div>
            </div>
            <div style="padding:8px 18px;font-size:11px;color:var(--t2);background:#FFFBEB;border-bottom:1px solid var(--bd)">
              ⚠️ 以下来自关联历史会议的 Action 尚未完成，建议会上跟进确认
            </div>
            <div class="cb" style="padding:4px 16px">
              <div v-for="a in carryoverActions" :key="a.id"
                   class="co-item" :class="{followed: a.followed}" :id="'co-'+a.id">
                <div class="chk" :class="{done:a.followed}" @click="a.tracked && followAction(a.id)" title="标记本次会议已跟进"
                     :style="!a.tracked ? {opacity:.35,cursor:'not-allowed'} : {}">
                  <svg v-if="a.followed" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="pdot" :class="a.priority==='h'?'ph':a.priority==='m'?'pm':'pl'" style="margin-top:4px"></div>
                <div style="flex:1;min-width:0">
                  <div class="ai-txt" :class="{done:a.followed}" :style="!a.tracked?{color:'var(--t3)'}:{}">{{ a.text }}</div>
                  <div class="co-meta">
                    <div v-if="a.assignee" class="av" :style="{width:'16px',height:'16px',fontSize:'8px',background:a.acolor}">{{ a.assignee[0] }}</div>
                    <span v-if="a.assignee" style="font-size:11px;color:var(--t2)">{{ a.assignee }}</span>
                    <span class="ai-src" style="font-size:11px">↗ {{ a.source }}</span>
                    <span v-if="a.dueLabel" class="tag" :class="a.dueClass" style="font-size:10px">{{ a.dueLabel }}</span>
                    <template v-if="a.tracked">
                      <button class="add-to-agenda-btn" :class="{added:a.addedToAgenda}"
                              @click="addCarryoverToAgenda(a)">
                        {{ a.addedToAgenda ? '✓ 已加入议程' : '+ 加入议程' }}
                      </button>
                    </template>
                    <template v-else>
                      <button class="btn btn-ghost" style="font-size:10px;padding:1px 7px;color:var(--primary);border-color:var(--primary)"
                              @click="trackCarryover(a.id)">+ 加入追踪</button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Historical context -->
        <div class="card">
          <div class="ch"><span class="ct">历史上下文</span><span class="badge b-ai">✨ AI 摘取</span></div>
          <div class="cb">
            <div v-if="!store.meetings.length || store.meetings.length < 2"
                 style="padding:20px;text-align:center;font-size:13px;color:var(--t3)">
              积累更多会议后，AI 将自动提取关联历史上下文
            </div>
            <template v-else>
              <div class="ctx-card">
                <div class="ctx-t">↗ 历史会议摘要将在 AI 分析后显示</div>
                <div class="ctx-b">AI 将从你过往会议中自动提取相关决策、遗留议题和背景信息。</div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div>
        <!-- Participants -->
        <div class="card" style="margin-bottom:14px">
          <div class="ch">
            <span class="ct">参与者</span>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:11px;color:var(--t2)">{{ meetingParticipants.length }} 人</span>
              <button class="btn btn-ghost" style="font-size:11px;padding:2px 7px"
                      @click="store.currentView='people'">人员管理 →</button>
            </div>
          </div>
          <div class="cb" style="padding:10px 14px">
            <div v-for="p in meetingParticipants" :key="p.name" class="pc">
              <div class="av" :style="{width:'34px',height:'34px',fontSize:'13px',background:p.color}">{{ p.name[0] }}</div>
              <div>
                <div class="pname">
                  {{ p.name }}
                  <span v-if="p.isHost" class="tag tg-b" style="font-size:10px">主持人</span>
                </div>
                <div class="prole">{{ p.role }}</div>
                <div v-if="p.responsibilities" style="font-size:11px;color:var(--t3);margin-top:1px">{{ p.responsibilities }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Checklist -->
        <div class="card">
          <div class="ch">
            <span class="ct">会前准备清单</span>
            <span style="font-size:11px;color:var(--t3)">{{ checklistDone }} / {{ store.checklist.length }} 完成</span>
          </div>
          <div class="cb" style="padding:8px 14px;display:flex;flex-direction:column;gap:2px">
            <div v-for="item in store.checklist" :key="item.id" class="ai-item" style="padding:9px 0">
              <div class="chk" :class="{done:item.done}" @click="toggleChecklist(item)">
                <svg v-if="item.done" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style="flex:1;font-size:13px;color:var(--t1)" :style="item.done?{opacity:.45}:{}">
                {{ item.text }}
                <div v-if="item.note" style="font-size:11px;color:var(--err);margin-top:2px">{{ item.note }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store, toast, LINKED_SOURCES, toggleActionTracked, persistUserData, getPendingActions } from '../store.js'
import { callAI, PROMPTS, parseJSON } from '../ai.js'

// ── Current meeting ───────────────────────────────────
const currentMeeting = computed(() =>
  store.meetings.find(m => m.id === store.currentMeetingId) || null
)

const PLATFORM_MAP = { zoom: 'Zoom', tencent: '腾讯会议', feishu: '飞书会议', other: '其他' }
function platformLabel(p) { return PLATFORM_MAP[p] || p || '未知' }

const meetingTimeStr = computed(() => {
  const m = currentMeeting.value
  if (!m?.scheduledAt) return ''
  const startMs  = new Date(m.scheduledAt).getTime()
  const endMs    = startMs + (m.duration || 60) * 60000
  const start    = m.scheduledAt.split('T')[1]?.slice(0, 5) || ''
  const end      = new Date(endMs).toTimeString().slice(0, 5)
  const dateStr  = m.scheduledAt.split('T')[0]
  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const label    = dateStr === today ? '今日' : dateStr === tomorrow ? '明日' : dateStr.slice(5).replace('-', '/')
  return `${label} ${start} – ${end}（${m.duration} 分钟）`
})

function getMeetingStatus(m) {
  if (!m?.scheduledAt) return 'upcoming'
  const now   = Date.now()
  const start = new Date(m.scheduledAt).getTime()
  const end   = start + (m.duration || 60) * 60000
  if (now >= start && now < end) return 'active'
  if (now < start)               return 'upcoming'
  return 'ended'
}

const prepMeetingStatus = computed(() => getMeetingStatus(currentMeeting.value))

const prepStatusLabel = computed(() => {
  const s = prepMeetingStatus.value
  if (s === 'active') return '进行中'
  if (s === 'ended')  return '已结束'
  // upcoming: compute time until start
  const m = currentMeeting.value
  if (!m?.scheduledAt) return '即将开始'
  const diff = new Date(m.scheduledAt).getTime() - Date.now()
  if (diff <= 0) return '即将开始'
  const h   = Math.floor(diff / 3600000)
  const min = Math.floor((diff % 3600000) / 60000)
  return h > 0 ? `即将开始 · ${h}h ${min}min 后` : `即将开始 · ${min} 分钟后`
})

const prepStatusBadgeClass = computed(() => {
  const s = prepMeetingStatus.value
  return s === 'active' ? 'b-ok' : s === 'ended' ? '' : 'b-pri'
})

const editMode  = computed({
  get: () => store.agendaEditMode,
  set: v => { store.agendaEditMode = v },
})
const isDragging      = ref(false)
const fileInput       = ref(null)
const agendaAiLoading = ref(false)
const agendaAiGenerated = ref(false)

async function generateAgenda() {
  if (!store.aiSettings.apiKey?.trim()) {
    toast('请先在「AI 设置」中配置 API Key')
    store.currentView = 'settings'
    return
  }
  if (agendaAiLoading.value || !currentMeeting.value) return
  agendaAiLoading.value = true
  try {
    const pending = getPendingActions()
    const { system, user } = PROMPTS.agenda(currentMeeting.value, pending, store.aiSettings.customPrompts?.agenda)
    const raw    = await callAI(system, user, store.aiSettings)
    const parsed = parseJSON(raw)
    if (Array.isArray(parsed.agenda)) {
      store.agendaItems = parsed.agenda.map((a, i) => ({ id: Date.now() + i, ...a }))
      agendaAiGenerated.value = true
      persistUserData()
      toast('✨ AI 议程已生成')
    }
  } catch (e) {
    toast('❌ 生成失败：' + e.message)
  } finally {
    agendaAiLoading.value = false
  }
}

function toggleEdit() {
  store.agendaEditMode = !store.agendaEditMode
  if (!store.agendaEditMode) toast('✅ 议程已保存')
}

function delAgenda(i) { store.agendaItems.splice(i, 1) }

let _agendaId = 100
function addAgendaItem() {
  store.agendaItems.push({ id: ++_agendaId, title: '新议题', desc: '说明（可选）', time: '10 min' })
}

// File handling
const FILE_ICONS = { pdf:'🔴', doc:'📘', docx:'📘', xls:'📗', xlsx:'📗', ppt:'🟠', pptx:'🟠', txt:'📄' }
const FILE_BG    = { pdf:'#FEE2E2', doc:'#DBEAFE', docx:'#DBEAFE', xls:'#D1FAE5', xlsx:'#D1FAE5', ppt:'#FEF3C7', pptx:'#FEF3C7' }
let _fileId = 100

function handleFiles(files) {
  Array.from(files).forEach(f => {
    const ext = f.name.split('.').pop().toLowerCase()
    store.files.push({
      id: ++_fileId,
      name: f.name,
      size: f.size < 1024 ? f.size + ' B' : f.size < 1024*1024 ? Math.round(f.size/1024) + ' KB' : (f.size/1048576).toFixed(1) + ' MB',
      icon: FILE_ICONS[ext] || '📎',
      bg:   FILE_BG[ext] || '#F3F4F6',
      blobUrl: URL.createObjectURL(f),
    })
    toast('📎 已上传：' + f.name)
  })
  persistUserData()
}

function handleDrop(e) {
  isDragging.value = false
  handleFiles(e.dataTransfer.files)
}

function removeFile(i) { store.files.splice(i, 1); persistUserData() }

// Carryover
const today = new Date().toISOString().split('T')[0]
const carryoverActions = computed(() =>
  store.actions.filter(a => !a.done && LINKED_SOURCES.includes(a.source))
)
const overdueCarryover = computed(() =>
  carryoverActions.value.filter(a => a.dueDate && a.dueDate < today).length
)

function followAction(id) {
  const a = store.actions.find(x => x.id === id)
  if (!a) return
  a.followed = !a.followed
  const remaining = carryoverActions.value.filter(x => x.tracked && !x.followed).length
  if (remaining === 0) { toast('🎉 所有遗留 Actions 均已跟进') }
}

function trackCarryover(id) {
  toggleActionTracked(id)
  toast('📌 已加入 Action 追踪器')
}

function addCarryoverToAgenda(a) {
  if (a.addedToAgenda) return
  a.addedToAgenda = true
  store.agendaEditMode = true
  let _id = 200 + a.id
  store.agendaItems.push({
    id: _id,
    title: `跟进：${a.text}`,
    desc: `遗留自 ${a.source}${a.assignee ? ' · 负责人：' + a.assignee : ''}`,
    time: '5 min',
  })
  toast(`📌 已将"${a.text.slice(0, 16)}…"加入议程`)
}

// Participants — driven by current meeting
const meetingParticipants = computed(() => {
  const names = currentMeeting.value?.participants || []
  const host  = names[0] || ''
  return names.map(name => {
    const c = store.contacts.find(x => x.name === name)
    return {
      name,
      role: c?.role || '',
      color: c?.color || '#6B7280',
      responsibilities: c?.responsibilities || '',
      isHost: name === host,
    }
  })
})

// Checklist
const checklistDone = computed(() => store.checklist.filter(c => c.done).length)
function toggleChecklist(item) {
  item.done = !item.done
  if (checklistDone.value === store.checklist.length) {
    toast('✅ 会前准备全部完成，祝开会顺利！')
  }
}
</script>
