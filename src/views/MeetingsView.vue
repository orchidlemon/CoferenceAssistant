<template>
  <div>
    <div class="sec-hdr">
      <h2>全部会议</h2>
      <button class="btn btn-pri" style="font-size:12px" @click="store.showModal=true">+ 新建会议</button>
    </div>

    <!-- Stats strip -->
    <div style="display:flex;gap:10px;margin-bottom:16px">
      <div v-for="s in statsCards" :key="s.label"
           class="card" style="flex:1;padding:12px 16px;text-align:center;margin-bottom:0">
        <div style="font-size:22px;font-weight:700" :style="{color:s.color}">{{ s.value }}</div>
        <div style="font-size:11px;color:var(--t2);margin-top:2px">{{ s.label }}</div>
      </div>
    </div>

    <!-- View toggle + filter row -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <div style="display:flex;background:var(--bg2);border-radius:var(--r8);padding:3px;gap:1px;flex-shrink:0">
        <button :style="viewMode==='time'    ? activeTab : inactiveTab"
                style="font-size:12px;padding:5px 14px;cursor:pointer;font-weight:500;transition:all .15s"
                @click="viewMode='time'">🕐 按时间</button>
        <button :style="viewMode==='calendar'? activeTab : inactiveTab"
                style="font-size:12px;padding:5px 14px;cursor:pointer;font-weight:500;transition:all .15s"
                @click="switchCalendar">📅 日历</button>
        <button :style="viewMode==='project' ? activeTab : inactiveTab"
                style="font-size:12px;padding:5px 14px;cursor:pointer;font-weight:500;transition:all .15s"
                @click="viewMode='project'">📁 按项目</button>
      </div>

      <template v-if="viewMode==='time'">
        <button v-for="(chip, i) in filterChips" :key="i"
                class="chip-btn" :class="{active: chip.active}"
                :style="chip.active && chip.color ? {background:chip.color+'18',color:chip.color,borderColor:chip.color+'60'} : {}"
                @click="chip.onClick">{{ chip.label }}</button>
      </template>
      <button v-else-if="viewMode==='project'" class="btn btn-ghost" style="font-size:11px;margin-left:auto"
              @click="showProjMgr=!showProjMgr">⚙️ 项目管理</button>
    </div>

    <!-- Project Manager Panel -->
    <div v-if="showProjMgr && viewMode==='project'" class="card" style="margin-bottom:14px">
      <div class="ch">
        <span class="ct">项目管理</span>
        <button class="btn btn-ghost" style="font-size:11px;padding:3px 7px" @click="showProjMgr=false">关闭</button>
      </div>
      <div class="cb" style="padding:12px 16px">
        <div v-for="p in store.projects" :key="p.id"
             style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bd)">
          <span style="font-size:18px">{{ p.icon }}</span>
          <span style="flex:1;font-size:13px;font-weight:500;color:var(--t1)">{{ p.name }}</span>
          <div style="width:60px;height:4px;background:var(--bg2);border-radius:2px">
            <div style="height:100%;border-radius:2px;transition:width .3s"
                 :style="{width:projPct(p.id)+'%',background:p.color}"></div>
          </div>
          <span class="tag" :style="{background:p.color+'18',color:p.color}">{{ meetingsByProject(p.id).length }} 场</span>
        </div>
        <div v-if="!addingProj" style="margin-top:12px">
          <button class="btn btn-ghost" style="font-size:12px" @click="addingProj=true">+ 新建项目</button>
        </div>
        <div v-else style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid var(--bd)">
          <input v-model="newProjName" class="finput" style="flex:1;min-width:120px" placeholder="项目名称">
          <select v-model="newProjColor" class="finput fselect" style="width:90px">
            <option value="#2563EB">🔵 蓝色</option><option value="#059669">🟢 绿色</option>
            <option value="#7C3AED">🟣 紫色</option><option value="#DC2626">🔴 红色</option>
            <option value="#D97706">🟡 橙色</option><option value="#0891B2">🔷 青色</option>
          </select>
          <select v-model="newProjIcon" class="finput fselect" style="width:72px">
            <option>🚀</option><option>📈</option><option>⚙️</option>
            <option>🎯</option><option>📋</option><option>💡</option><option>🔧</option>
          </select>
          <button class="btn btn-pri" style="font-size:12px" @click="createProject">创建</button>
          <button class="btn btn-out" style="font-size:12px" @click="addingProj=false">取消</button>
        </div>
      </div>
    </div>

    <!-- ═══ CALENDAR VIEW ═══ -->
    <template v-if="viewMode==='calendar'">
      <div class="card" style="margin-bottom:14px">
        <div class="ch">
          <div style="display:flex;align-items:center;gap:6px">
            <button class="btn btn-ghost" style="font-size:16px;padding:2px 8px;line-height:1" @click="prevMonth">‹</button>
            <span style="font-size:14px;font-weight:600;min-width:84px;text-align:center">{{ calendarTitle }}</span>
            <button class="btn btn-ghost" style="font-size:16px;padding:2px 8px;line-height:1" @click="nextMonth">›</button>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="btn btn-ghost" style="font-size:11px;padding:3px 8px" @click="jumpToday">今日</button>
            <button v-if="calendarDate" class="btn btn-out" style="font-size:11px;padding:3px 8px" @click="calendarDate=null">显示全部</button>
          </div>
        </div>
        <div style="padding:4px 14px 12px">
          <div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center;margin-bottom:2px">
            <div v-for="d in ['日','一','二','三','四','五','六']" :key="d"
                 style="font-size:11px;color:var(--t3);font-weight:500;padding:4px 0">{{ d }}</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);row-gap:2px">
            <div v-for="(day, i) in calendarDays" :key="i"
                 style="display:flex;flex-direction:column;align-items:center;padding:2px 0">
              <div v-if="day"
                   @click="selectDate(day)"
                   class="cal-day"
                   :class="{
                     'cal-today': day === TODAY,
                     'cal-selected': day === calendarDate,
                     'cal-has-meeting': meetingDateSet.has(day)
                   }">
                {{ parseInt(day.slice(-2)) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar meeting list -->
      <div style="display:flex;align-items:center;gap:8px;margin:6px 0 10px">
        <span style="font-size:13px;font-weight:600;color:var(--t1)">
          {{ calendarDate ? calendarDate.slice(5).replace('-','/') + ' 的会议' : '全部会议' }}
        </span>
        <span style="font-size:11px;background:var(--bg2);color:var(--t3);border-radius:10px;padding:1px 7px">{{ calendarFiltered.length }} 场</span>
        <div style="flex:1;height:1px;background:var(--bd)"></div>
      </div>
      <div v-if="!calendarFiltered.length" class="card" style="padding:40px;text-align:center;color:var(--t3)">
        <div style="font-size:32px;margin-bottom:10px">📅</div>
        <div style="font-size:13px">{{ calendarDate ? '当日暂无会议' : '暂无会议记录' }}</div>
      </div>
      <div v-for="m in calendarFiltered" :key="m.id"
           class="mc" :class="{'ai-mc': getStatus(m)==='active'}">
        <div class="mc-time">
          <div class="mc-t" :style="getStatus(m)==='active'?{color:'var(--primary)'}:{}">{{ formatTime(m.scheduledAt) }}</div>
          <div class="mc-dur" :style="getStatus(m)==='active'?{color:'var(--primary)'}:{}">
            {{ getStatus(m)==='active' ? '进行中' : m.duration+'分' }}
          </div>
        </div>
        <div class="mc-info">
          <div class="mc-title">{{ m.title }}</div>
          <div class="mc-meta">
            <span>{{ platformLabel(m.platform) }}</span><span>·</span>
            <span>{{ formatDateShort(m.scheduledAt) }}</span><span>·</span>
            <span>{{ m.participants.length }} 人</span>
          </div>
          <div class="mc-badges">
            <span class="badge" :class="statusBadgeClass(getStatus(m))">{{ statusLabel(getStatus(m)) }}</span>
            <span v-if="getProject(m.projectId)" class="badge"
                  :style="{background:getProject(m.projectId).color+'18',color:getProject(m.projectId).color}">
              {{ getProject(m.projectId).icon }} {{ getProject(m.projectId).name }}
            </span>
          </div>
        </div>
        <div class="mc-act">
          <button class="btn btn-ghost" style="font-size:11px;padding:4px 8px" @click.stop="openEdit(m)">✏ 编辑</button>
          <button class="btn btn-pri" style="font-size:11px;padding:4px 10px" @click.stop="store.currentMeetingId=m.id; store.currentView='prep'">准备</button>
          <button v-if="getStatus(m)==='ended'" class="btn btn-out" style="font-size:11px;padding:4px 10px" @click.stop="store.currentMeetingId=m.id; store.currentView='summary'">纪要</button>
        </div>
      </div>
    </template>

    <!-- ═══ TIME VIEW ═══ -->
    <template v-else-if="viewMode==='time'">
      <div v-if="!filteredMeetings.length" class="card" style="padding:40px;text-align:center;color:var(--t3)">
        <div style="font-size:32px;margin-bottom:10px">📅</div>
        <div style="font-size:13px">暂无会议记录</div>
      </div>
      <template v-for="group in timeGrouped" :key="group.label">
        <div v-if="group.meetings.length" style="display:flex;align-items:center;gap:8px;margin:10px 0 8px">
          <span style="font-size:12px;font-weight:600;color:var(--t2);white-space:nowrap">{{ group.label }}</span>
          <span style="font-size:11px;background:var(--bg2);color:var(--t3);border-radius:10px;padding:1px 7px">{{ group.meetings.length }} 场</span>
          <div style="flex:1;height:1px;background:var(--bd)"></div>
        </div>
        <div v-for="m in group.meetings" :key="m.id"
             class="mc" :class="{'ai-mc': getStatus(m)==='active'}" @click="goMeeting(m)">
          <div class="mc-time">
            <div class="mc-t" :style="getStatus(m)==='active'?{color:'var(--primary)'}:{}">{{ formatTime(m.scheduledAt) }}</div>
            <div class="mc-dur" :style="getStatus(m)==='active'?{color:'var(--primary)'}:{}">
              {{ getStatus(m)==='active' ? '进行中' : m.duration+'分' }}
            </div>
          </div>
          <div class="mc-info">
            <div class="mc-title">{{ m.title }}</div>
            <div class="mc-meta">
              <span>{{ platformLabel(m.platform) }}</span><span>·</span>
              <div style="display:flex">
                <div v-for="name in m.participants.slice(0,4)" :key="name"
                     class="av" style="width:18px;height:18px;font-size:8px;margin-right:-3px;border:1.5px solid var(--card)"
                     :style="{background:memberColor(name)}">{{ name[0] }}</div>
                <span v-if="m.participants.length>4" style="margin-left:9px;font-size:11px">+{{ m.participants.length-4 }}</span>
              </div>
              <span>{{ m.participants.length }} 人</span>
            </div>
            <div class="mc-badges">
              <span class="badge" :class="statusBadgeClass(getStatus(m))">{{ statusLabel(getStatus(m)) }}</span>
              <span v-if="getProject(m.projectId)" class="badge"
                    :style="{background:getProject(m.projectId).color+'18',color:getProject(m.projectId).color}">
                {{ getProject(m.projectId).icon }} {{ getProject(m.projectId).name }}
              </span>
            </div>
          </div>
          <div class="mc-act">
            <button class="btn btn-ghost" style="font-size:11px;padding:4px 8px" @click.stop="openEdit(m)">✏ 编辑</button>
            <button class="btn btn-pri" style="font-size:11px;padding:4px 10px" @click.stop="store.currentMeetingId=m.id; store.currentView='prep'">准备</button>
            <button v-if="getStatus(m)==='ended'" class="btn btn-out" style="font-size:11px;padding:4px 10px" @click.stop="store.currentMeetingId=m.id; store.currentView='summary'">纪要</button>
          </div>
        </div>
      </template>
    </template>

    <!-- ═══ PROJECT VIEW ═══ -->
    <template v-else>
      <template v-for="p in store.projects" :key="p.id">
        <div v-if="meetingsByProject(p.id).length">
          <div style="display:flex;align-items:center;gap:8px;margin:10px 0 8px">
            <span style="font-size:16px">{{ p.icon }}</span>
            <span style="font-size:13px;font-weight:700" :style="{color:p.color}">{{ p.name }}</span>
            <span class="badge" :style="{background:p.color+'18',color:p.color}">{{ meetingsByProject(p.id).length }}</span>
            <div style="flex:1;height:2px;border-radius:1px" :style="{background:p.color+'25'}"></div>
          </div>
          <div v-for="m in meetingsByProject(p.id)" :key="m.id"
               class="mc" :class="{'ai-mc': getStatus(m)==='active'}" @click="goMeeting(m)">
            <div class="mc-time">
              <div class="mc-t" :style="getStatus(m)==='active'?{color:'var(--primary)'}:{}">{{ formatTime(m.scheduledAt) }}</div>
              <div class="mc-dur" :style="getStatus(m)==='active'?{color:'var(--primary)'}:{}">
                {{ getStatus(m)==='active' ? '进行中' : m.duration+'分' }}
              </div>
            </div>
            <div class="mc-info">
              <div class="mc-title">{{ m.title }}</div>
              <div class="mc-meta">
                <span>{{ platformLabel(m.platform) }}</span><span>·</span>
                <div style="display:flex">
                  <div v-for="name in m.participants.slice(0,4)" :key="name"
                       class="av" style="width:18px;height:18px;font-size:8px;margin-right:-3px;border:1.5px solid var(--card)"
                       :style="{background:memberColor(name)}">{{ name[0] }}</div>
                  <span v-if="m.participants.length>4" style="margin-left:9px;font-size:11px">+{{ m.participants.length-4 }}</span>
                </div>
                <span>{{ m.participants.length }} 人</span>
                <span>·</span><span>{{ formatDateShort(m.scheduledAt) }}</span>
              </div>
              <div class="mc-badges">
                <span class="badge" :class="statusBadgeClass(getStatus(m))">{{ statusLabel(getStatus(m)) }}</span>
              </div>
            </div>
            <div class="mc-act">
              <button class="btn btn-ghost" style="font-size:11px;padding:4px 8px" @click.stop="openEdit(m)">✏ 编辑</button>
              <button class="btn btn-pri" style="font-size:11px;padding:4px 10px" @click.stop="store.currentMeetingId=m.id; store.currentView='prep'">准备</button>
              <button v-if="getStatus(m)==='ended'" class="btn btn-out" style="font-size:11px;padding:4px 10px" @click.stop="store.currentMeetingId=m.id; store.currentView='summary'">纪要</button>
            </div>
          </div>
        </div>
      </template>
      <div v-if="unassignedMeetings.length">
        <div style="display:flex;align-items:center;gap:8px;margin:10px 0 8px">
          <span style="font-size:13px;font-weight:600;color:var(--t3)">未分配项目</span>
          <span style="font-size:11px;background:var(--bg2);color:var(--t3);border-radius:10px;padding:1px 7px">{{ unassignedMeetings.length }}</span>
          <div style="flex:1;height:1px;background:var(--bd)"></div>
        </div>
        <div v-for="m in unassignedMeetings" :key="m.id"
             class="mc" :class="{'ai-mc': getStatus(m)==='active'}" @click="goMeeting(m)">
          <div class="mc-time">
            <div class="mc-t">{{ formatTime(m.scheduledAt) }}</div>
            <div class="mc-dur">{{ getStatus(m)==='active' ? '进行中' : m.duration+'分' }}</div>
          </div>
          <div class="mc-info">
            <div class="mc-title">{{ m.title }}</div>
            <div class="mc-meta">
              <span>{{ platformLabel(m.platform) }}</span><span>·</span><span>{{ m.participants.length }} 人</span>
            </div>
            <div class="mc-badges">
              <span class="badge" :class="statusBadgeClass(getStatus(m))">{{ statusLabel(getStatus(m)) }}</span>
            </div>
          </div>
          <div class="mc-act">
            <button class="btn btn-ghost" style="font-size:11px;padding:4px 8px" @click.stop="openEdit(m)">✏ 编辑</button>
            <button class="btn btn-pri" style="font-size:11px;padding:4px 10px" @click.stop="store.currentMeetingId=m.id; store.currentView='prep'">准备</button>
            <button v-if="getStatus(m)==='ended'" class="btn btn-out" style="font-size:11px;padding:4px 10px" @click.stop="store.currentMeetingId=m.id; store.currentView='summary'">纪要</button>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ EDIT MEETING MODAL ═══ -->
    <div v-if="editingMeeting" class="overlay" @click.self="editingMeeting=null">
      <div class="modal">
        <div class="modal-hdr">
          <span class="modal-title">编辑会议</span>
          <button class="modal-close" @click="editingMeeting=null">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="flabel">会议标题</label>
            <input class="finput" type="text" v-model="editForm.title" placeholder="会议标题">
          </div>
          <div class="form-row-2">
            <div class="form-row">
              <label class="flabel">日期</label>
              <input class="finput" type="date" v-model="editForm.date">
            </div>
            <div class="form-row">
              <label class="flabel">时间</label>
              <input class="finput" type="time" v-model="editForm.time">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-row">
              <label class="flabel">时长（分钟）</label>
              <input class="finput" type="number" min="5" step="5" v-model.number="editForm.duration">
            </div>
            <div class="form-row">
              <label class="flabel">会议平台</label>
              <select class="finput fselect" v-model="editForm.platform">
                <option value="zoom">Zoom</option>
                <option value="tencent">腾讯会议</option>
                <option value="feishu">飞书会议</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <label class="flabel">所属项目</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button v-for="p in store.projects" :key="p.id"
                      style="font-size:12px;padding:4px 12px;border-radius:20px;cursor:pointer;transition:all .15s;font-weight:500"
                      :style="editForm.projectId===p.id
                        ? {background:p.color+'22',color:p.color,border:'1px solid '+p.color+'70'}
                        : {background:'var(--card)',color:'var(--t2)',border:'1px solid var(--bd)'}"
                      @click="editForm.projectId = editForm.projectId===p.id ? null : p.id">
                {{ p.icon }} {{ p.name }}
              </button>
            </div>
          </div>
          <div class="form-row">
            <label class="flabel">参与者</label>
            <input class="finput" v-model="editForm.participantsStr" placeholder="以逗号分隔，如：李明, 刘志远">
            <span class="fhint">修改后以逗号分隔姓名</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-out" @click="editingMeeting=null">取消</button>
          <button class="btn btn-pri" @click="saveEdit">保存修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { store, toast, addProject, updateMeeting } from '../store.js'

// ── View mode ────────────────────────────────────────
const viewMode      = ref('time')
const filterProject = ref(null)
const showProjMgr   = ref(false)

const activeTab   = { background: 'var(--primary)', color: '#fff', borderRadius: '6px', border: 'none' }
const inactiveTab = { background: 'transparent', color: 'var(--t2)', border: 'none', borderRadius: '6px' }

// ── Dynamic status ────────────────────────────────────
function getStatus(m) {
  if (!m.scheduledAt) return 'upcoming'
  const now   = Date.now()
  const start = new Date(m.scheduledAt).getTime()
  const end   = start + (m.duration || 60) * 60000
  if (now >= start && now < end) return 'active'
  if (now < start)               return 'upcoming'
  return 'ended'
}

// ── Helpers ──────────────────────────────────────────
const TODAY     = new Date().toISOString().split('T')[0]
const TOMORROW  = new Date(Date.now() + 86400000).toISOString().split('T')[0]
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0]

function dateOf(m)         { return m.scheduledAt ? m.scheduledAt.split('T')[0] : '' }
function formatTime(dt)    { return dt?.includes('T') ? dt.split('T')[1].slice(0,5) : '' }
function formatDateShort(dt){ return dt ? dt.split('T')[0].slice(5).replace('-','/') : '' }

const PLATFORM_MAP = { zoom:'Zoom', tencent:'腾讯会议', feishu:'飞书会议', other:'其他' }
function platformLabel(p) { return PLATFORM_MAP[p] || p || '未知' }

function statusLabel(s)      { return s==='active' ? '进行中' : s==='upcoming' ? '即将开始' : '已结束' }
function statusBadgeClass(s) { return s==='active' ? 'b-ok' : s==='upcoming' ? 'b-warn' : '' }
function memberColor(name)   { return store.contacts.find(c=>c.name===name)?.color || '#6B7280' }
function getProject(id)      { return id ? store.projects.find(p=>p.id===id) : null }

// ── Stats ────────────────────────────────────────────
const statsCards = computed(() => [
  { label: '全部会议', value: store.meetings.length,                                           color: 'var(--t1)'      },
  { label: '今日会议', value: store.meetings.filter(m => dateOf(m) === TODAY).length,          color: 'var(--primary)' },
  { label: '进行中',   value: store.meetings.filter(m => getStatus(m) === 'active').length,    color: 'var(--ok)'      },
  { label: '已结束',   value: store.meetings.filter(m => getStatus(m) === 'ended').length,     color: 'var(--t2)'      },
])

// ── Filtered meetings (time view) ─────────────────────
const filteredMeetings = computed(() => {
  let list = [...store.meetings].sort((a,b) => (b.scheduledAt||'') > (a.scheduledAt||'') ? 1 : -1)
  if (filterProject.value !== null) list = list.filter(m => m.projectId === filterProject.value)
  return list
})

// ── Time grouping ─────────────────────────────────────
function getDateGroup(m) {
  const d = dateOf(m)
  if (d === TODAY)     return '今天'
  if (d === TOMORROW)  return '明天'
  if (d === YESTERDAY) return '昨天'
  if (d > TODAY)       return '本周内'
  return '更早'
}

const GROUP_ORDER = ['今天', '进行中', '明天', '本周内', '昨天', '更早']

const timeGrouped = computed(() => {
  const map = {}
  for (const m of filteredMeetings.value) {
    const lbl = getStatus(m) === 'active' ? '进行中' : getDateGroup(m)
    if (!map[lbl]) map[lbl] = []
    map[lbl].push(m)
  }
  return GROUP_ORDER.filter(lbl => map[lbl]?.length).map(lbl => ({ label: lbl, meetings: map[lbl] }))
})

// ── Filter chips ──────────────────────────────────────
const filterChips = computed(() => [
  { label: '全部', active: filterProject.value === null, color: null, onClick: () => { filterProject.value = null } },
  ...store.projects.map(p => ({
    label: `${p.icon} ${p.name}`,
    active: filterProject.value === p.id,
    color: p.color,
    onClick: () => { filterProject.value = filterProject.value === p.id ? null : p.id },
  })),
])

// ── Project view ──────────────────────────────────────
function meetingsByProject(id) {
  return store.meetings.filter(m => m.projectId === id).sort((a,b) => (b.scheduledAt||'') > (a.scheduledAt||'') ? 1 : -1)
}

const unassignedMeetings = computed(() =>
  store.meetings.filter(m => !m.projectId).sort((a,b) => (b.scheduledAt||'') > (a.scheduledAt||'') ? 1 : -1)
)

function projPct(id) {
  return store.meetings.length ? Math.round(meetingsByProject(id).length / store.meetings.length * 100) : 0
}

// ── Project creation ──────────────────────────────────
const addingProj   = ref(false)
const newProjName  = ref('')
const newProjColor = ref('#2563EB')
const newProjIcon  = ref('🚀')

function createProject() {
  if (!newProjName.value.trim()) return
  addProject(newProjName.value.trim(), newProjColor.value, newProjIcon.value)
  toast(`✅ 项目已创建`)
  newProjName.value = ''; newProjColor.value = '#2563EB'; newProjIcon.value = '🚀'
  addingProj.value = false
}

// ── Calendar ──────────────────────────────────────────
const calendarDate = ref(null)       // null = show all, string = filter to date
const calendarYM   = ref(TODAY.slice(0,7)) // "YYYY-MM"

function switchCalendar() {
  viewMode.value = 'calendar'
  calendarYM.value = TODAY.slice(0,7)
  calendarDate.value = null
}

const calendarTitle = computed(() => {
  const [y, m] = calendarYM.value.split('-')
  return `${y}年 ${parseInt(m)}月`
})

function prevMonth() {
  const [y, m] = calendarYM.value.split('-').map(Number)
  const d = new Date(y, m-2, 1)
  calendarYM.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

function nextMonth() {
  const [y, m] = calendarYM.value.split('-').map(Number)
  const d = new Date(y, m, 1)
  calendarYM.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

function jumpToday() {
  calendarYM.value   = TODAY.slice(0,7)
  calendarDate.value = TODAY
}

function selectDate(day) {
  calendarDate.value = calendarDate.value === day ? null : day
}

const calendarDays = computed(() => {
  const [y, m] = calendarYM.value.split('-').map(Number)
  const firstDow  = new Date(y, m-1, 1).getDay()           // 0=Sun
  const daysInMon = new Date(y, m, 0).getDate()
  const leading   = firstDow                                 // empty slots before day 1
  const days = []
  for (let i = 0; i < leading; i++) days.push(null)
  for (let d = 1; d <= daysInMon; d++) {
    days.push(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`)
  }
  return days
})

const meetingDateSet = computed(() => new Set(store.meetings.map(m => dateOf(m))))

function dayStyle(day) {
  if (day === calendarDate.value) return { background: 'var(--primary)', color: '#fff', borderRadius: '50%' }
  if (day === TODAY) return { background: 'var(--ai-l)', color: 'var(--primary)', borderRadius: '50%', fontWeight: '700' }
  return { borderRadius: '50%' }
}

const calendarFiltered = computed(() => {
  let list = [...store.meetings].sort((a,b) => a.scheduledAt > b.scheduledAt ? 1 : -1)
  if (calendarDate.value) list = list.filter(m => dateOf(m) === calendarDate.value)
  return list
})

// ── Edit meeting ──────────────────────────────────────
const editingMeeting = ref(null)
const editForm = reactive({ title:'', date:'', time:'', duration:60, platform:'', projectId:null, participantsStr:'' })

function openEdit(m) {
  editingMeeting.value = m
  const [date, time] = (m.scheduledAt || 'T').split('T')
  editForm.title          = m.title
  editForm.date           = date || ''
  editForm.time           = time || ''
  editForm.duration       = m.duration
  editForm.platform       = m.platform
  editForm.projectId      = m.projectId || null
  editForm.participantsStr = m.participants.join(', ')
}

function saveEdit() {
  if (!editingMeeting.value) return
  const scheduledAt = editForm.date
    ? (editForm.time ? `${editForm.date}T${editForm.time}` : `${editForm.date}T00:00`)
    : editingMeeting.value.scheduledAt
  const participants = editForm.participantsStr
    .split(',').map(s => s.trim()).filter(Boolean)
  updateMeeting(editingMeeting.value.id, {
    title: editForm.title.trim() || editingMeeting.value.title,
    platform: editForm.platform,
    duration: editForm.duration,
    projectId: editForm.projectId,
    scheduledAt,
    participants: participants.length ? participants : editingMeeting.value.participants,
  })
  editingMeeting.value = null
  toast('✅ 会议信息已更新')
}

// ── Navigation ────────────────────────────────────────
function goMeeting(m) {
  store.currentMeetingId = m.id
  store.currentView = getStatus(m) === 'ended' ? 'summary' : 'prep'
}
</script>

<style scoped>
.chip-btn {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--bd);
  background: var(--card);
  color: var(--t2);
  cursor: pointer;
  transition: all .15s;
  font-weight: 500;
}
.chip-btn:hover  { border-color: var(--primary); color: var(--primary); }
.chip-btn.active { background: var(--ai-l); color: var(--primary); border-color: #BFDBFE; }

.cal-day {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 50%;
  transition: all .15s;
  color: var(--t1);
  position: relative;
}
.cal-day:hover           { background: var(--bg2); }
.cal-today               { background: var(--ai-l); color: var(--primary); font-weight: 700; }
.cal-selected            { background: var(--primary) !important; color: #fff !important; }
.cal-has-meeting::after  {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px; height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}
.cal-selected.cal-has-meeting::after { background: #fff; opacity: 0.8; }
</style>
