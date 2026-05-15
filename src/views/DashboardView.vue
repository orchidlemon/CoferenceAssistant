<template>
  <div>
    <!-- Stats -->
    <div class="stats">
      <div class="sc">
        <div class="sl">今日会议</div>
        <div class="sv">{{ todayMeetings.length }}</div>
        <div class="ss">{{ todayStatsStr }}</div>
      </div>
      <div class="sc">
        <div class="sl">待处理 Actions</div>
        <div class="sv" style="color:var(--err)">{{ pendingActions.length }}</div>
        <div class="ss">{{ todayDueCount > 0 ? `其中 ${todayDueCount} 个今日到期 ⚡` : '暂无今日到期项' }}</div>
      </div>
      <div class="sc">
        <div class="sl">Action 完成率</div>
        <div class="sv" :style="{color: closeRate >= 60 ? 'var(--ok)' : closeRate > 0 ? 'var(--warn)' : 'var(--t2)'}">
          {{ closeRate }}%
        </div>
        <div class="ss">{{ totalTracked }} 个追踪中，{{ doneCount }} 已完成</div>
      </div>
      <div class="sc">
        <div class="sl">本周会议</div>
        <div class="sv">{{ thisWeekCount }}</div>
        <div class="ss">{{ overdueCount > 0 ? `${overdueCount} 个 Action 已逾期 ⚠️` : '暂无逾期事项' }}</div>
      </div>
    </div>

    <div class="dash-grid">
      <!-- LEFT: today's meetings from store -->
      <div>
        <div class="sec-hdr">
          <h2>今日会议</h2>
          <button class="btn btn-ghost" style="font-size:11px;padding:4px 10px"
                  @click="store.currentView='meetings'">全部会议 →</button>
        </div>

        <div v-if="!todayMeetings.length"
             class="card" style="padding:40px;text-align:center;color:var(--t3)">
          <div style="font-size:28px;margin-bottom:8px">📅</div>
          <div style="font-size:13px">今日暂无会议安排</div>
        </div>

        <template v-for="group in todayGrouped" :key="group.label">
          <div v-if="group.meetings.length" class="tg-wrap">
            <div class="tg-label">{{ group.label }}</div>
            <div v-for="(m, mi) in group.meetings" :key="m.id"
                 class="mc ai-mc"
                 :style="[
                   getStatus(m)==='active' ? {borderColor:'var(--primary)',boxShadow:'0 0 0 3px #DBEAFE'} : {},
                   getStatus(m)==='ended'  ? {opacity:.75} : {},
                   mi > 0 ? {marginTop:'4px'} : {},
                 ]"
                 @click="goMeeting(m)">
              <div class="mc-time">
                <div class="mc-t" :style="getStatus(m)==='active'?{color:'var(--primary)'}:{}">
                  {{ formatTime(m.scheduledAt) }}
                </div>
                <div class="mc-dur" :style="getStatus(m)==='active'?{color:'var(--primary)'}:{}">
                  {{ getStatus(m)==='active' ? '进行中' : m.duration+'分' }}
                </div>
              </div>
              <div class="mc-info">
                <div class="mc-title">{{ m.title }}</div>
                <div class="mc-meta">
                  <span>{{ platformLabel(m.platform) }}</span>
                  <span>·</span>
                  <div class="avs">
                    <div v-for="name in m.participants.slice(0,4)" :key="name"
                         class="av ava" :style="{background: memberColor(name)}">{{ name[0] }}</div>
                    <div v-if="m.participants.length > 4"
                         class="av ava" style="font-size:8px">+{{ m.participants.length - 4 }}</div>
                  </div>
                </div>
                <div class="mc-badges">
                  <span class="badge" :class="statusBadgeClass(getStatus(m))">{{ statusLabel(getStatus(m)) }}</span>
                  <span v-if="getStatus(m)==='active'" class="badge b-ai">✨ AI 实时摘要</span>
                  <span v-else-if="getStatus(m)==='ended'" class="badge b-ok">✓ 纪要已生成</span>
                  <span v-else class="badge b-gray">历史上下文已就绪</span>
                </div>
              </div>
              <div class="mc-act">
                <button v-if="getStatus(m)==='active'"
                        class="btn btn-pri" style="font-size:11px"
                        @click.stop>加入会议</button>
                <button v-else-if="getStatus(m)==='upcoming'"
                        class="btn btn-out" style="font-size:11px"
                        @click.stop="store.currentMeetingId=m.id; store.currentView='prep'">会前准备</button>
                <button v-else
                        class="btn btn-out" style="font-size:11px"
                        @click.stop="store.currentMeetingId=m.id; store.currentView='summary'">查看纪要</button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- RIGHT: actions + insights -->
      <div>
        <div class="card" style="margin-bottom:14px">
          <div class="ch">
            <span class="ct">待处理 Actions</span>
            <button class="btn btn-ghost" style="font-size:11px;padding:3px 7px" @click="store.currentView='actions'">全部 →</button>
          </div>
          <div class="cb" style="padding:10px 15px">
            <div v-if="!dashActions.length"
                 style="text-align:center;padding:16px;font-size:13px;color:var(--t3)">暂无待处理 Actions</div>
            <div v-for="(a, i) in dashActions" :key="a.id"
                 class="ai-item" :style="i===dashActions.length-1?'border-bottom:none':''">
              <div class="chk" :class="{done:a.done}" @click="toggleDone(a.id)">
                <svg v-if="a.done" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="pdot" :class="a.priority==='h'?'ph':a.priority==='m'?'pm':'pl'"></div>
              <div>
                <div class="ai-txt" :class="{done:a.done}" style="font-size:13px">{{ a.text }}</div>
                <div class="ai-meta">
                  <span class="ai-src">↗ {{ a.source }}</span>
                  <span v-if="a.done" class="tag tg-g">已完成</span>
                  <span v-else-if="a.dueLabel" class="tag" :class="a.dueClass">{{ a.dueLabel }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="ch">
            <span class="ct">AI 洞察</span>
            <div style="display:flex;gap:7px;align-items:center">
              <span class="badge b-ai">✨ 智能分析</span>
              <button class="btn btn-ghost" style="font-size:11px;padding:3px 7px"
                      :disabled="insightsLoading"
                      @click="refreshInsights">
                {{ insightsLoading ? '生成中…' : '刷新洞察' }}
              </button>
            </div>
          </div>
          <div class="cb" style="padding:10px 15px;font-size:13px;color:var(--t2);line-height:1.6">
            <div v-if="insightsLoading" style="text-align:center;padding:16px;color:var(--ai)">
              ✨ AI 分析中，请稍候…
            </div>
            <div v-else-if="aiInsights.length">
              <div v-for="(insight, i) in aiInsights" :key="i"
                   :style="i < aiInsights.length-1 ? {marginBottom:'12px',paddingBottom:'12px',borderBottom:'1px solid var(--bd)'} : {}">
                <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px">
                  <span style="font-size:16px">{{ insight.icon }}</span>
                  <strong style="font-size:13px;color:var(--t1)">{{ insight.title || '' }}</strong>
                </div>
                <div style="font-size:13px;color:var(--t2);line-height:1.6;padding-left:24px">
                  {{ insight.text }}
                </div>
                <div v-if="insight.suggestion"
                     style="font-size:12px;color:var(--primary);margin-top:5px;padding-left:24px;font-weight:500">
                  → {{ insight.suggestion }}
                </div>
              </div>
            </div>
            <div v-else style="text-align:center;padding:16px;color:var(--t3)">
              点击「刷新洞察」生成 AI 智能分析
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store, toast, toggleActionDone } from '../store.js'
import { callAI, PROMPTS, parseJSON } from '../ai.js'

const TODAY = new Date().toISOString().split('T')[0]

// ── Dynamic status (same logic as MeetingsView) ───────
function getStatus(m) {
  if (!m.scheduledAt) return 'upcoming'
  const now   = Date.now()
  const start = new Date(m.scheduledAt).getTime()
  const end   = start + (m.duration || 60) * 60000
  if (now >= start && now < end) return 'active'
  if (now < start)               return 'upcoming'
  return 'ended'
}

// ── Helpers ───────────────────────────────────────────
const PLATFORM_MAP = { zoom: 'Zoom', tencent: '腾讯会议', feishu: '飞书会议', other: '其他' }
function formatTime(dt)      { return dt?.includes('T') ? dt.split('T')[1].slice(0, 5) : '' }
function platformLabel(p)    { return PLATFORM_MAP[p] || p || '未知' }
function statusLabel(s)      { return s === 'active' ? '进行中' : s === 'upcoming' ? '即将开始' : '已结束' }
function statusBadgeClass(s) { return s === 'active' ? 'b-ok' : s === 'upcoming' ? 'b-warn' : '' }
function memberColor(name)   { return store.contacts.find(c => c.name === name)?.color || '#6B7280' }
function dateOf(m)           { return m.scheduledAt ? m.scheduledAt.split('T')[0] : '' }

// ── Today's meetings ─────────────────────────────────
const todayMeetings = computed(() =>
  store.meetings
    .filter(m => {
      if (dateOf(m) !== TODAY) return false
      return store.currentUser ? m.participants?.includes(store.currentUser.name) : true
    })
    .sort((a, b) => a.scheduledAt > b.scheduledAt ? 1 : -1)
)

const STATUS_ORDER = ['active', 'upcoming', 'ended']
const STATUS_LABEL = { active: '进行中', upcoming: '即将开始', ended: '已结束' }

const todayGrouped = computed(() => {
  const map = { active: [], upcoming: [], ended: [] }
  for (const m of todayMeetings.value) {
    map[getStatus(m)].push(m)
  }
  return STATUS_ORDER
    .filter(s => map[s].length)
    .map(s => ({ label: STATUS_LABEL[s], meetings: map[s] }))
})

const todayStatsStr = computed(() => {
  if (!todayMeetings.value.length) return '今日无安排'
  const ended   = todayMeetings.value.filter(m => getStatus(m) === 'ended').length
  const pending = todayMeetings.value.length - ended
  const parts = []
  if (ended)   parts.push(`${ended} 已结束`)
  if (pending) parts.push(`${pending} 待参加`)
  return parts.join(' · ')
})

// ── Stats ─────────────────────────────────────────────
const pendingActions = computed(() => store.actions.filter(a => a.tracked && !a.done))
const todayDueCount  = computed(() => pendingActions.value.filter(a => a.dueDate === TODAY).length)
const totalTracked   = computed(() => store.actions.filter(a => a.tracked).length)
const doneCount      = computed(() => store.actions.filter(a => a.tracked && a.done).length)
const overdueCount   = computed(() => pendingActions.value.filter(a => a.dueDate && a.dueDate < TODAY).length)
const closeRate      = computed(() =>
  totalTracked.value > 0 ? Math.round(doneCount.value / totalTracked.value * 100) : 0
)

const thisWeekCount  = computed(() => {
  const now  = new Date()
  const day  = now.getDay() || 7
  const mon  = new Date(now); mon.setDate(now.getDate() - day + 1); mon.setHours(0,0,0,0)
  const sun  = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999)
  return store.meetings.filter(m => {
    if (!m.scheduledAt) return false
    const t = new Date(m.scheduledAt).getTime()
    return t >= mon.getTime() && t <= sun.getTime()
  }).length
})

const dashActions = computed(() => [
  ...pendingActions.value.slice(0, 4),
  ...store.actions.filter(a => a.tracked && a.done).slice(0, 1),
])

function toggleDone(id) { toggleActionDone(id) }

const aiInsights      = ref([])
const insightsLoading = ref(false)

async function refreshInsights() {
  if (!store.aiSettings.apiKey?.trim()) {
    toast('请先在「AI 设置」中配置 API Key')
    store.currentView = 'settings'
    return
  }
  if (insightsLoading.value) return
  insightsLoading.value = true
  try {
    const { system, user } = PROMPTS.insights(store.meetings, store.actions, store.aiSettings.customPrompts?.insights)
    const raw    = await callAI(system, user, store.aiSettings)
    const parsed = parseJSON(raw)
    if (Array.isArray(parsed.insights)) aiInsights.value = parsed.insights
  } catch (e) {
    toast('❌ AI 洞察生成失败：' + e.message)
  } finally {
    insightsLoading.value = false
  }
}

function goMeeting(m) {
  store.currentMeetingId = m.id
  store.currentView = getStatus(m) === 'ended' ? 'summary' : 'prep'
}
</script>
