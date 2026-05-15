<template>
  <!-- Not logged in: show login page -->
  <LoginView v-if="!store.isLoggedIn" />

  <!-- Logged in: show main app -->
  <template v-else>
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo-name">MeetMind</span>
      </div>
      <nav class="nav">
        <div class="ni" :class="{on: store.currentView==='dashboard'}" @click="nav('dashboard')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          今日概览
        </div>
        <div class="ni" :class="{on: store.currentView==='meetings'}" @click="nav('meetings')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          全部会议
          <span v-if="todayCount > 0" class="nbadge">{{ todayCount }}</span>
        </div>
        <div class="ni" :class="{on: store.currentView==='actions'}" @click="nav('actions')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Action 追踪
          <span v-if="pendingCount > 0" class="nbadge">{{ pendingCount }}</span>
        </div>
        <div class="ni" :class="{on: store.currentView==='people'}" @click="nav('people')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          人员管理
        </div>
        <div class="ndiv"></div>
        <div class="ni" :class="{on: store.currentView==='prep'}" @click="nav('prep')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          会前准备
          <span class="ai-tag">✨AI</span>
        </div>
        <div class="ni" :class="{on: store.currentView==='summary'}" @click="nav('summary')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          会后纪要
          <span class="ai-tag">✨AI</span>
        </div>
        <div class="ndiv"></div>
        <div class="ni" :class="{on: store.currentView==='settings'}" @click="nav('settings')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          AI 设置
        </div>
        <div class="ni" :class="{on: store.currentView==='prompts'}" @click="nav('prompts')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Prompt 模板
        </div>
        <div class="ndiv"></div>
        <div class="ni" :class="{on: store.currentView==='support'}"
             @click="nav('support')"
             style="color:#D97706;font-weight:600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          支持作者
        </div>
      </nav>
      <div class="user-row">
        <div class="av" :style="{background: store.currentUser?.color || '#2563EB'}">
          {{ store.currentUser?.name?.[0] || '?' }}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            {{ store.currentUser?.name }}
          </div>
          <div style="font-size:11px;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ store.currentUser?.email }}</div>
        </div>
        <button class="btn btn-ghost" style="font-size:11px;padding:3px 7px;flex-shrink:0"
                @click="doLogout">退出</button>
      </div>
    </aside>

    <main class="main">
      <div class="topbar">
        <span class="topbar-title">{{ viewTitle }}</span>
        <div style="display:flex;gap:7px">
          <button class="btn btn-out" @click="store.showModal = true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            新建会议
          </button>
          <button class="btn btn-pri" @click="toast('AI 议程已批量生成 ✨')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            AI 一键准备
          </button>
        </div>
      </div>

      <div class="content">
        <DashboardView v-show="store.currentView==='dashboard'" class="view" />
        <MeetingsView  v-show="store.currentView==='meetings'"  class="view" />
        <ActionsView   v-show="store.currentView==='actions'"   class="view" />
        <PeopleView    v-show="store.currentView==='people'"    class="view" />
        <PrepView      v-show="store.currentView==='prep'"      class="view" />
        <SummaryView   v-show="store.currentView==='summary'"   class="view" />
        <SettingsView  v-show="store.currentView==='settings'"  class="view" />
        <PromptsView   v-show="store.currentView==='prompts'"   class="view" />
        <SupportView   v-show="store.currentView==='support'"   class="view" />
      </div>
    </main>

    <!-- Assignee popup (global, positioned absolutely) -->
    <div v-if="store.assigneePop.show"
         style="position:fixed;background:var(--card);border:1px solid var(--bd);border-radius:var(--r12);box-shadow:var(--sh2);z-index:300;min-width:200px;padding:6px"
         :style="{top: store.assigneePop.y+'px', left: store.assigneePop.x+'px'}">
      <div style="font-size:11px;color:var(--t3);padding:4px 8px 6px">指定负责人</div>
      <div v-for="m in MEMBERS" :key="m.name" class="assignee-pop-item" @click="pickAssignee(m)">
        <div class="av" :style="{width:'26px',height:'26px',fontSize:'11px',background:m.color}">{{ m.name[0] }}</div>
        <span>{{ m.name }}</span>
        <svg v-if="currentAction?.assignee === m.name" width="12" height="12" viewBox="0 0 24 24"
             fill="none" stroke="var(--ok)" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
    </div>

    <!-- New Meeting Modal -->
    <NewMeetingModal v-if="store.showModal" @close="store.showModal=false" />

    <!-- Toast -->
    <div id="toast-el" :class="{show: toastState.show}">{{ toastState.msg }}</div>
  </template>
</template>

<script setup>
import { computed, onUnmounted } from 'vue'
import { store, toast, toastState, MEMBERS, setActionAssignee, logout } from './store.js'
import LoginView    from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import MeetingsView  from './views/MeetingsView.vue'
import ActionsView   from './views/ActionsView.vue'
import PeopleView    from './views/PeopleView.vue'
import PrepView      from './views/PrepView.vue'
import SummaryView   from './views/SummaryView.vue'
import NewMeetingModal from './components/NewMeetingModal.vue'
import SettingsView    from './views/SettingsView.vue'
import PromptsView     from './views/PromptsView.vue'
import SupportView     from './views/SupportView.vue'

const viewTitles = {
  dashboard: '今日概览', meetings: '全部会议', actions: 'Action 追踪器',
  people: '人员管理', prep: '会前准备', summary: '会后纪要', settings: 'AI 设置', prompts: 'Prompt 模板',
  support: '支持作者',
}
const viewTitle  = computed(() => viewTitles[store.currentView] || '')

// Sidebar badges — filtered to current user where relevant
const TODAY = new Date().toISOString().split('T')[0]
const todayCount = computed(() =>
  store.meetings.filter(m => {
    if (m.scheduledAt?.split('T')[0] !== TODAY) return false
    return store.currentUser ? m.participants?.includes(store.currentUser.name) : true
  }).length
)
const pendingCount = computed(() => store.actions.filter(a => a.tracked && !a.done).length)

function nav(v) { store.currentView = v }

function doLogout() { logout() }

const currentAction = computed(() =>
  store.actions.find(a => a.id === store.assigneePop.actionId) ?? null
)

function pickAssignee(m) {
  setActionAssignee(store.assigneePop.actionId, m.name, m.color)
  store.assigneePop.show = false
  toast('✅ 已指定负责人：' + m.name)
}

// Close assignee popup on outside click
function onDocClick(e) {
  if (!e.target.closest('.assignee-btn')) {
    store.assigneePop.show = false
  }
}
document.addEventListener('click', onDocClick)
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
