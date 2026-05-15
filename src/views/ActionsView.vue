<template>
  <div>
    <div class="sec-hdr">
      <h2>Action 追踪器</h2>
      <div style="font-size:12px;color:var(--t2)">本周关闭率 <strong style="color:var(--ok)">{{ closeRate }}%</strong></div>
    </div>

    <div class="filter-row">
      <div v-for="f in filters" :key="f.key"
           class="filter-chip" :class="{on: store.atFilter===f.key}"
           @click="store.atFilter=f.key">{{ f.label(counts) }}</div>
    </div>

    <div class="at-grid">
      <!-- List -->
      <div>
        <div class="card">
          <div class="ch">
            <span class="ct">所有 Actions</span>
            <span style="font-size:12px;color:var(--t2)">{{ counts.total }} 项</span>
          </div>
          <div class="cb" style="padding:8px 16px">
            <div v-if="!filteredActions.length" style="text-align:center;padding:20px;font-size:13px;color:var(--t3)">暂无匹配的 Action</div>
            <div v-for="(a, i) in filteredActions" :key="a.id"
                 class="ai-item" :style="i===filteredActions.length-1?'border-bottom:none':''">
              <div class="chk" :class="{done:a.done}" @click="toggleDone(a.id)">
                <svg v-if="a.done" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="pdot" :class="a.priority==='h'?'ph':a.priority==='m'?'pm':'pl'"></div>
              <div style="flex:1">
                <div class="ai-txt" :class="{done:a.done}">{{ a.text }}</div>
                <div class="action-fields">
                  <button class="assignee-btn" :class="{unset:!a.assignee}"
                          @click="openAssignee($event, a.id)">
                    <template v-if="a.assignee">
                      <div class="av" :style="{width:'18px',height:'18px',fontSize:'9px',background:a.acolor}">{{ a.assignee[0] }}</div>
                      <span>{{ a.assignee }}</span>
                    </template>
                    <template v-else>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span>指定负责人</span>
                    </template>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <button v-if="showDueFor !== a.id" class="due-btn" :class="{unset:!a.dueDate}"
                          @click="showDueFor = a.id">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span :style="{color:a.dueClass==='tg-r'?'var(--err)':a.dueClass==='tg-y'?'var(--warn)':'var(--t2)'}">
                      {{ a.dueLabel || '设置截止日期' }}
                    </span>
                  </button>
                  <input v-else type="date" class="due-input"
                         :value="a.dueDate"
                         @change="onSetDue(a, $event.target.value)"
                         @blur="showDueFor = null">
                  <span class="ai-src">↗ {{ a.source }}</span>
                  <span v-if="a.done" class="tag tg-g">已完成</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right panel -->
      <div>
        <div class="card" style="margin-bottom:14px">
          <div class="ch"><span class="ct">完成概况</span></div>
          <div class="cb" style="padding:12px 16px">
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
                <span>本周完成率</span>
                <span style="font-weight:600;color:var(--ok)">{{ closeRate }}%</span>
              </div>
              <div style="height:6px;background:#E5E7EB;border-radius:3px">
                <div :style="{width:closeRate+'%'}" style="height:100%;background:var(--ok);border-radius:3px;transition:width .4s"></div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
              <div style="background:var(--bg);padding:8px;border-radius:var(--r8);text-align:center">
                <div style="font-size:18px;font-weight:700;color:var(--err)">{{ counts.pending }}</div>
                <div style="color:var(--t2)">待处理</div>
              </div>
              <div style="background:var(--bg);padding:8px;border-radius:var(--r8);text-align:center">
                <div style="font-size:18px;font-weight:700;color:var(--ok)">{{ counts.done }}</div>
                <div style="color:var(--t2)">已完成</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="ch"><span class="ct">按负责人</span></div>
          <div class="cb" style="padding:10px 14px">
            <div v-if="!byPerson.length" style="font-size:12px;color:var(--t3);text-align:center;padding:8px">暂无待处理</div>
            <div v-for="p in byPerson" :key="p.name"
                 style="display:flex;align-items:center;gap:9px;margin-bottom:8px;font-size:12px">
              <div class="av" :style="{width:'28px',height:'28px',fontSize:'11px',background:p.color}">{{ p.name[0] }}</div>
              <span style="flex:1">{{ p.name }}</span>
              <span class="badge b-err">{{ p.count }} 待处理</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store, toggleActionDone, setActionDue, setActionAssignee } from '../store.js'

const today = new Date().toISOString().split('T')[0]

const counts = computed(() => ({
  total:   store.actions.filter(a => a.tracked).length,
  pending: store.actions.filter(a => a.tracked && !a.done).length,
  done:    store.actions.filter(a => a.tracked && a.done).length,
  today:   store.actions.filter(a => a.tracked && !a.done && a.dueDate === today).length,
}))

const closeRate = computed(() => {
  const t = counts.value.total
  return t > 0 ? Math.round(counts.value.done / t * 100) : 0
})

// total shown in header uses all (including those in summary but untracked)


const filters = [
  { key: 'all',     label: c => `全部 (${c.total})`     },
  { key: 'pending', label: c => `待完成 (${c.pending})`  },
  { key: 'done',    label: c => `已完成 (${c.done})`     },
  { key: 'today',   label: () => '今日到期'               },
  { key: 'mine',    label: () => '我的'                   },
]

const filteredActions = computed(() => {
  const fns = {
    all:     a => a.tracked,
    pending: a => a.tracked && !a.done,
    done:    a => a.tracked && a.done,
    today:   a => a.tracked && !a.done && a.dueDate === today,
    mine:    a => a.tracked && a.assignee === (store.currentUser?.name || ''),
  }
  return store.actions.filter(fns[store.atFilter] || (a => a.tracked))
})

const byPerson = computed(() => {
  const m = {}
  store.actions.filter(a => a.tracked && !a.done && a.assignee).forEach(a => {
    if (!m[a.assignee]) m[a.assignee] = { name: a.assignee, color: a.acolor, count: 0 }
    m[a.assignee].count++
  })
  return Object.values(m)
})

function toggleDone(id) { toggleActionDone(id) }

const showDueFor = ref(null)

function openAssignee(event, actionId) {
  const rect = event.currentTarget.getBoundingClientRect()
  store.assigneePop.actionId = actionId
  store.assigneePop.x = rect.left
  store.assigneePop.y = rect.bottom + 6
  store.assigneePop.show = true
}

function onSetDue(action, val) {
  showDueFor.value = null
  if (!val) return
  setActionDue(action.id, val)
}
</script>
