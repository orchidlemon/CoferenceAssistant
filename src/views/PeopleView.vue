<template>
  <div>
    <div class="sec-hdr">
      <h2>人员管理</h2>
      <button class="btn btn-pri" style="font-size:12px" @click="openAddForm">+ 添加成员</button>
    </div>

    <!-- Stats strip -->
    <div style="display:flex;gap:10px;margin-bottom:16px">
      <div v-for="s in statsCards" :key="s.label"
           class="card" style="flex:1;padding:12px 16px;text-align:center;margin-bottom:0">
        <div style="font-size:22px;font-weight:700" :style="{color:s.color}">{{ s.value }}</div>
        <div style="font-size:11px;color:var(--t2);margin-top:2px">{{ s.label }}</div>
      </div>
    </div>

    <!-- View toggle + Search -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
      <div style="display:flex;background:var(--bg2);border-radius:var(--r8);padding:3px;gap:1px;flex-shrink:0">
        <button :style="viewMode==='member'? ON_STYLE : OFF_STYLE"
                style="font-size:12px;padding:5px 14px;cursor:pointer;font-weight:500;transition:all .15s;border-radius:6px;border:none"
                @click="viewMode='member'">👤 按人员</button>
        <button :style="viewMode==='project'? ON_STYLE : OFF_STYLE"
                style="font-size:12px;padding:5px 14px;cursor:pointer;font-weight:500;transition:all .15s;border-radius:6px;border:none"
                @click="viewMode='project'">📁 按项目</button>
      </div>
      <input v-model="searchQ" class="finput" style="flex:1;max-width:260px;font-size:12px" placeholder="搜索姓名、职位、负责内容…">
    </div>

    <!-- Project filter chips (member view) -->
    <div v-if="viewMode==='member'" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
      <button class="chip-btn" :class="{active: filterProject===null}" @click="filterProject=null">全部</button>
      <button v-for="p in store.projects" :key="p.id"
              class="chip-btn" :class="{active: filterProject===p.id}"
              :style="filterProject===p.id ? {background:p.color+'18',color:p.color,borderColor:p.color+'60'} : {}"
              @click="filterProject = filterProject===p.id ? null : p.id">
        {{ p.icon }} {{ p.name }}
      </button>
    </div>

    <div class="pg-grid">

      <!-- ── LEFT: main list ─────────────────────────── -->
      <div>

        <!-- MEMBER VIEW -->
        <template v-if="viewMode==='member'">
          <div v-if="!filteredContacts.length"
               class="card" style="padding:40px;text-align:center;color:var(--t3)">
            <div style="font-size:28px;margin-bottom:8px">👤</div>
            <div style="font-size:13px">未找到匹配成员</div>
          </div>
          <div v-for="c in filteredContacts" :key="c.id" class="card" style="margin-bottom:8px">
            <div class="cb" style="padding:12px 16px">
              <div style="display:flex;align-items:flex-start;gap:12px">
                <div class="av" :style="{width:'42px',height:'42px',fontSize:'17px',flexShrink:0,background:c.color}">
                  {{ c.name[0] }}
                </div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">
                    <span style="font-size:14px;font-weight:700;color:var(--t1)">{{ c.name }}</span>
                    <span style="font-size:11px;color:var(--t2);background:var(--bg2);padding:2px 8px;border-radius:10px">{{ c.role }}</span>
                  </div>
                  <div v-if="c.responsibilities"
                       style="font-size:12px;color:var(--t3);margin-bottom:6px">
                    📋 {{ c.responsibilities }}
                  </div>
                  <div v-if="c.projectIds?.length" style="display:flex;gap:4px;flex-wrap:wrap">
                    <template v-for="pid in c.projectIds" :key="pid">
                      <span v-if="getProject(pid)" class="badge"
                            :style="{background:getProject(pid).color+'18',color:getProject(pid).color}">
                        {{ getProject(pid).icon }} {{ getProject(pid).name }}
                      </span>
                    </template>
                  </div>
                  <div v-else style="font-size:11px;color:var(--t3)">未分配项目</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
                  <div style="display:flex;gap:12px">
                    <div style="text-align:center">
                      <div style="font-size:16px;font-weight:700;color:var(--primary)">{{ meetingCount(c.name) }}</div>
                      <div style="font-size:10px;color:var(--t3)">会议</div>
                    </div>
                    <div style="text-align:center">
                      <div style="font-size:16px;font-weight:700"
                           :style="{color:pendingActionCount(c.name)>0?'var(--err)':'var(--ok)'}">
                        {{ pendingActionCount(c.name) }}
                      </div>
                      <div style="font-size:10px;color:var(--t3)">Actions</div>
                    </div>
                  </div>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-ghost" style="font-size:10px;padding:2px 9px" @click="openEditForm(c)">编辑</button>
                    <button class="btn btn-ghost" style="font-size:10px;padding:2px 9px;color:var(--err)" @click="doDelete(c)">删除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- PROJECT VIEW -->
        <template v-else>
          <div v-for="p in store.projects" :key="p.id" style="margin-bottom:18px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="font-size:18px">{{ p.icon }}</span>
              <span style="font-size:14px;font-weight:700" :style="{color:p.color}">{{ p.name }}</span>
              <span class="badge" :style="{background:p.color+'18',color:p.color}">{{ projectMembers(p.id).length }} 人</span>
              <div style="flex:1;height:2px;border-radius:1px" :style="{background:p.color+'25'}"></div>
            </div>
            <div class="card">
              <div class="cb" style="padding:4px 14px">
                <div v-for="c in projectMembers(p.id)" :key="c.id" class="co-item">
                  <div class="av" :style="{width:'30px',height:'30px',fontSize:'12px',flexShrink:0,background:c.color}">{{ c.name[0] }}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:13px;font-weight:600;color:var(--t1)">{{ c.name }}</div>
                    <div style="font-size:11px;color:var(--t2);margin-top:1px">
                      {{ c.role }}{{ c.responsibilities ? ' · ' + c.responsibilities : '' }}
                    </div>
                  </div>
                  <button class="btn btn-ghost" style="font-size:10px;padding:2px 9px;color:var(--err);flex-shrink:0"
                          @click="removeFromProject(p.id, c.id)">移除</button>
                </div>
                <div v-if="!projectMembers(p.id).length"
                     style="font-size:12px;color:var(--t3);padding:10px 2px">暂无成员</div>
                <div v-if="availableForProject(p.id).length"
                     style="padding:8px 0;border-top:1px solid var(--bd);display:flex;gap:6px;align-items:center">
                  <select v-model="addToMap[p.id]" class="finput fselect" style="flex:1;font-size:11px">
                    <option value="">选择成员加入该项目…</option>
                    <option v-for="c in availableForProject(p.id)" :key="c.id" :value="c.id">
                      {{ c.name }} · {{ c.role }}
                    </option>
                  </select>
                  <button class="btn btn-pri" style="font-size:11px;flex-shrink:0" @click="doAddToProject(p.id)">添加</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Unassigned -->
          <div v-if="unassignedMembers.length" style="margin-bottom:18px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="font-size:13px;font-weight:600;color:var(--t3)">未分配项目</span>
              <span style="font-size:11px;background:var(--bg2);color:var(--t3);border-radius:10px;padding:1px 7px">{{ unassignedMembers.length }} 人</span>
              <div style="flex:1;height:1px;background:var(--bd)"></div>
            </div>
            <div class="card">
              <div class="cb" style="padding:4px 14px">
                <div v-for="c in unassignedMembers" :key="c.id" class="co-item">
                  <div class="av" :style="{width:'30px',height:'30px',fontSize:'12px',background:c.color}">{{ c.name[0] }}</div>
                  <div style="flex:1">
                    <div style="font-size:13px;font-weight:600">{{ c.name }}</div>
                    <div style="font-size:11px;color:var(--t2)">{{ c.role }}</div>
                  </div>
                  <button class="btn btn-ghost" style="font-size:10px;padding:2px 9px"
                          @click="openEditForm(c)">分配项目</button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ── RIGHT: sidebar ─────────────────────────── -->
      <div>

        <!-- Action 负载 -->
        <div class="card" style="margin-bottom:14px">
          <div class="ch">
            <span class="ct">Action 负载</span>
            <span style="font-size:11px;color:var(--t2)">待处理分布</span>
          </div>
          <div class="cb" style="padding:10px 14px">
            <div v-if="!workload.length" style="font-size:12px;color:var(--t3);text-align:center;padding:8px">
              🎉 暂无待处理 Action
            </div>
            <div v-for="w in workload" :key="w.name"
                 style="display:flex;align-items:center;gap:7px;margin-bottom:9px">
              <div class="av" :style="{width:'24px',height:'24px',fontSize:'10px',flexShrink:0,background:w.color}">{{ w.name[0] }}</div>
              <span style="width:44px;font-size:12px;font-weight:500;flex-shrink:0">{{ w.name }}</span>
              <div style="flex:1;height:5px;background:var(--bg2);border-radius:3px">
                <div :style="{width:w.pct+'%',background:w.color}"
                     style="height:100%;border-radius:3px;transition:width .4s"></div>
              </div>
              <span class="badge b-err" style="font-size:10px;flex-shrink:0">{{ w.count }}</span>
            </div>
          </div>
        </div>

        <!-- 协作矩阵 -->
        <div class="card" style="margin-bottom:14px">
          <div class="ch">
            <span class="ct">协作矩阵</span>
            <span style="font-size:11px;color:var(--t2)">{{ matrixRows.length }} 人 × {{ matrixCols.length }} 项目</span>
          </div>
          <!-- Matrix filters -->
          <div style="padding:6px 14px;border-bottom:1px solid var(--bd);display:flex;gap:6px;flex-wrap:wrap;align-items:center">
            <input v-model="matrixSearch" class="finput"
                   style="width:130px;font-size:11px;padding:5px 9px" placeholder="筛选成员…">
            <button v-for="p in store.projects" :key="p.id"
                    style="font-size:11px;padding:3px 10px;border-radius:20px;cursor:pointer;transition:all .15s;white-space:nowrap"
                    :style="matrixFilterProjs.includes(p.id)
                      ? {background:p.color+'22',color:p.color,border:'1px solid '+p.color+'70'}
                      : {background:'var(--card)',color:'var(--t2)',border:'1px solid var(--bd)'}"
                    @click="toggleMatrixProj(p.id)">
              {{ p.icon }} {{ p.name.length > 5 ? p.name.slice(0,5)+'…' : p.name }}
            </button>
            <button v-if="matrixSearch || matrixFilterProjs.length"
                    class="btn btn-ghost" style="font-size:11px;padding:3px 8px"
                    @click="matrixSearch=''; matrixFilterProjs.splice(0)">重置</button>
          </div>
          <!-- Scrollable matrix with sticky headers -->
          <div class="mat-scroll">
            <div v-if="!matrixRows.length || !matrixCols.length"
                 style="padding:20px;text-align:center;font-size:12px;color:var(--t3)">
              {{ !matrixRows.length ? '无匹配成员' : '无匹配项目' }}
            </div>
            <table v-else class="mat-table">
              <thead>
                <tr>
                  <th class="mat-corner">成员</th>
                  <th v-for="p in matrixCols" :key="p.id" class="mat-proj-th">
                    <span :style="{color:p.color}">{{ p.icon }}</span><br>
                    <span style="color:var(--t3);font-size:10px">{{ p.name.length>4 ? p.name.slice(0,4)+'…' : p.name }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in matrixRows" :key="c.id">
                  <td class="mat-name-td">{{ c.name }}</td>
                  <td v-for="p in matrixCols" :key="p.id" class="mat-cell">
                    <span v-if="c.projectIds?.includes(p.id)" :style="{color:p.color,fontSize:'14px'}">●</span>
                    <span v-else style="color:var(--bd);font-size:14px">○</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add / Edit form -->
        <div v-if="showForm" class="card">
          <div class="ch">
            <span class="ct">{{ editTarget ? '编辑成员' : '添加成员' }}</span>
            <button class="btn btn-ghost" style="font-size:11px;padding:3px 7px" @click="closeForm">关闭</button>
          </div>
          <div class="cb" style="padding:12px 16px;display:flex;flex-direction:column;gap:9px">
            <input v-model="form.name" class="finput" placeholder="姓名 *" style="font-size:12px">
            <input v-model="form.role" class="finput" placeholder="职位" style="font-size:12px">
            <input v-model="form.responsibilities" class="finput" placeholder="负责内容" style="font-size:12px">
            <div>
              <div style="font-size:11px;color:var(--t2);margin-bottom:6px">所属项目（可多选）</div>
              <div style="display:flex;gap:5px;flex-wrap:wrap">
                <button v-for="p in store.projects" :key="p.id"
                        style="font-size:11px;padding:3px 10px;border-radius:20px;cursor:pointer;transition:all .15s"
                        :style="form.projectIds.includes(p.id)
                          ? {background:p.color+'22',color:p.color,border:'1px solid '+p.color+'70'}
                          : {background:'var(--card)',color:'var(--t2)',border:'1px solid var(--bd)'}"
                        @click="toggleProjectInForm(p.id)">
                  {{ p.icon }} {{ p.name }}
                </button>
              </div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--t2);margin-bottom:6px">头像颜色</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button v-for="clr in COLOR_OPTIONS" :key="clr"
                        style="width:22px;height:22px;border-radius:50%;cursor:pointer;transition:all .15s;border:2px solid transparent"
                        :style="{background:clr,borderColor:form.color===clr?'#1E40AF':'transparent'}"
                        @click="form.color=clr"></button>
              </div>
            </div>
            <button class="btn btn-pri" style="font-size:12px;justify-content:center" @click="saveForm">
              {{ editTarget ? '保存修改' : '添加成员' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { store, toast, addContact, deleteContact, updateContact } from '../store.js'

const ON_STYLE  = { background: 'var(--primary)', color: '#fff'       }
const OFF_STYLE = { background: 'transparent',    color: 'var(--t2)'  }
const COLOR_OPTIONS = ['#2563EB','#DC2626','#7C3AED','#059669','#D97706','#0891B2','#6B7280']

// ── View state ────────────────────────────────────────
const viewMode      = ref('member')
const searchQ       = ref('')
const filterProject = ref(null)

// ── Matrix filters ────────────────────────────────────
const matrixSearch      = ref('')
const matrixFilterProjs = reactive([])

const matrixRows = computed(() => {
  const q = matrixSearch.value.trim().toLowerCase()
  return q ? store.contacts.filter(c => c.name.toLowerCase().includes(q)) : store.contacts
})

const matrixCols = computed(() =>
  matrixFilterProjs.length
    ? store.projects.filter(p => matrixFilterProjs.includes(p.id))
    : store.projects
)

function toggleMatrixProj(id) {
  const idx = matrixFilterProjs.indexOf(id)
  if (idx === -1) matrixFilterProjs.push(id)
  else matrixFilterProjs.splice(idx, 1)
}

// ── Stats ─────────────────────────────────────────────
const statsCards = computed(() => [
  { label: '成员总数',      value: store.contacts.length,                                                 color: 'var(--t1)'      },
  { label: '项目数',        value: store.projects.length,                                                 color: 'var(--primary)' },
  { label: '累计参会人次',   value: store.meetings.reduce((s, m) => s + (m.participants?.length || 0), 0), color: 'var(--ok)'      },
  { label: '待处理 Actions', value: store.actions.filter(a => !a.done && a.assignee).length,              color: 'var(--err)'     },
])

// ── Helpers ───────────────────────────────────────────
function getProject(id) { return store.projects.find(p => p.id === id) }

function meetingCount(name) {
  return store.meetings.filter(m => m.participants?.includes(name)).length
}
function pendingActionCount(name) {
  return store.actions.filter(a => !a.done && a.assignee === name).length
}

// ── Filtered contacts ─────────────────────────────────
const filteredContacts = computed(() => {
  let list = store.contacts
  const q = searchQ.value.toLowerCase()
  if (q) list = list.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.role.toLowerCase().includes(q) ||
    (c.responsibilities || '').toLowerCase().includes(q)
  )
  if (filterProject.value !== null) {
    list = list.filter(c => c.projectIds?.includes(filterProject.value))
  }
  return list
})

// ── Project view helpers ──────────────────────────────
function projectMembers(pid) {
  return store.contacts.filter(c => c.projectIds?.includes(pid))
}
function availableForProject(pid) {
  return store.contacts.filter(c => !c.projectIds?.includes(pid))
}
const unassignedMembers = computed(() =>
  store.contacts.filter(c => !c.projectIds?.length)
)

const addToMap = reactive({})

function doAddToProject(projectId) {
  const contactId = parseInt(addToMap[projectId])
  if (!contactId) return
  const c = store.contacts.find(x => x.id === contactId)
  if (c && !c.projectIds.includes(projectId)) {
    c.projectIds.push(projectId)
    toast(`✅ ${c.name} 已加入 ${getProject(projectId)?.name || '项目'}`)
  }
  addToMap[projectId] = ''
}

function removeFromProject(projectId, contactId) {
  const c = store.contacts.find(x => x.id === contactId)
  if (c) {
    c.projectIds = c.projectIds.filter(id => id !== projectId)
    toast(`${c.name} 已从项目移除`)
  }
}

// ── Workload ──────────────────────────────────────────
const workload = computed(() => {
  const pending = store.actions.filter(a => !a.done && a.assignee)
  const max = Math.max(...store.contacts.map(c =>
    pending.filter(a => a.assignee === c.name).length
  ), 1)
  return store.contacts
    .map(c => {
      const count = pending.filter(a => a.assignee === c.name).length
      return { name: c.name, color: c.color, count, pct: Math.round(count / max * 100) }
    })
    .filter(w => w.count > 0)
    .sort((a, b) => b.count - a.count)
})

// ── Delete ────────────────────────────────────────────
function doDelete(c) {
  deleteContact(c.id)
  toast(`已删除成员 ${c.name}`)
  if (editTarget.value === c.id) closeForm()
}

// ── Add / Edit form ───────────────────────────────────
const showForm   = ref(false)
const editTarget = ref(null)
const form = reactive({
  name: '', role: '', responsibilities: '', projectIds: [], color: '#2563EB',
})

function openAddForm() {
  editTarget.value = null
  Object.assign(form, { name: '', role: '', responsibilities: '', projectIds: [], color: '#2563EB' })
  showForm.value = true
}

function openEditForm(c) {
  editTarget.value = c.id
  Object.assign(form, {
    name: c.name, role: c.role,
    responsibilities: c.responsibilities || '',
    projectIds: [...(c.projectIds || [])],
    color: c.color,
  })
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editTarget.value = null
}

function toggleProjectInForm(pid) {
  const idx = form.projectIds.indexOf(pid)
  if (idx === -1) form.projectIds.push(pid)
  else form.projectIds.splice(idx, 1)
}

function saveForm() {
  if (!form.name.trim()) return
  const data = { name: form.name.trim(), role: form.role.trim(), responsibilities: form.responsibilities.trim(), projectIds: [...form.projectIds], color: form.color }
  if (editTarget.value) {
    updateContact(editTarget.value, data)
    toast(`✅ 成员「${form.name}」信息已更新`)
  } else {
    addContact(data)
    toast(`✅ 成员「${form.name}」已添加`)
  }
  closeForm()
}
</script>

<style scoped>
.pg-grid {
  display: grid;
  grid-template-columns: 1fr 290px;
  gap: 16px;
  align-items: start;
}
.chip-btn {
  font-size: 12px; padding: 4px 12px; border-radius: 20px;
  border: 1px solid var(--bd); background: var(--card); color: var(--t2);
  cursor: pointer; transition: all .15s; font-weight: 500;
}
.chip-btn:hover  { border-color: var(--primary); color: var(--primary); }
.chip-btn.active { background: var(--ai-l); color: var(--primary); border-color: #BFDBFE; }

/* Collaboration matrix */
.mat-scroll {
  overflow: auto;
  max-height: 300px;
}
.mat-table {
  border-collapse: collapse;
  font-size: 11px;
  width: 100%;
}
.mat-corner {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 3;
  background: var(--card);
  text-align: left;
  padding: 6px 10px;
  color: var(--t3);
  font-weight: 500;
  border-bottom: 1px solid var(--bd);
  min-width: 52px;
  white-space: nowrap;
}
.mat-proj-th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--card);
  padding: 6px 10px;
  text-align: center;
  white-space: nowrap;
  font-weight: 500;
  border-bottom: 1px solid var(--bd);
  min-width: 52px;
}
.mat-name-td {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--card);
  padding: 5px 10px;
  font-weight: 600;
  color: var(--t1);
  white-space: nowrap;
  border-right: 1px solid var(--bd);
}
.mat-cell {
  text-align: center;
  padding: 5px 10px;
}
tr:nth-child(even) .mat-name-td,
tr:nth-child(even) .mat-cell { background: var(--bg2); }
tr:nth-child(even) .mat-name-td { background: var(--bg2); }
</style>
