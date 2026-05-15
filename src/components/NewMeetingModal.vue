<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-hdr">
        <span class="modal-title">新建会议</span>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">

        <div class="form-row">
          <label class="flabel">会议标题 *</label>
          <input class="finput" type="text" placeholder="例：Q2 产品路线图评审" v-model="form.title">
        </div>

        <div class="form-row-2">
          <div class="form-row">
            <label class="flabel">日期 *</label>
            <input class="finput" type="date" v-model="form.date">
          </div>
          <div class="form-row">
            <label class="flabel">时间 *</label>
            <input class="finput" type="time" v-model="form.time">
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-row">
            <label class="flabel">时长</label>
            <select class="finput fselect" v-model="form.duration">
              <option>30 分钟</option>
              <option>45 分钟</option>
              <option>60 分钟</option>
              <option>90 分钟</option>
              <option>120 分钟</option>
            </select>
          </div>
          <div class="form-row">
            <label class="flabel">会议平台</label>
            <select class="finput fselect" v-model="form.platform">
              <option value="">请选择</option>
              <option value="zoom">Zoom</option>
              <option value="tencent">腾讯会议</option>
              <option value="feishu">飞书会议</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <label class="flabel">会议链接</label>
          <input class="finput" type="text" placeholder="粘贴会议链接或输入会议号"
                 v-model="form.link" @input="detectPlatform">
          <div v-if="linkHint"
               style="background:var(--ok-l);color:var(--ok);border-radius:var(--r4);padding:5px 9px;font-size:11px;margin-top:3px;display:flex;align-items:center;gap:5px">
            {{ linkHint }}
          </div>
          <span class="fhint">支持 Zoom / 腾讯会议 / 飞书链接，粘贴后自动识别平台</span>
        </div>

        <!-- 所属项目 -->
        <div class="form-row">
          <label class="flabel">所属项目</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px">
            <button v-for="p in store.projects" :key="p.id"
                    style="font-size:12px;padding:4px 12px;border-radius:20px;cursor:pointer;transition:all .15s;font-weight:500"
                    :style="form.projectId===p.id
                      ? {background:p.color+'22',color:p.color,border:'1px solid '+p.color+'70'}
                      : {background:'var(--card)',color:'var(--t2)',border:'1px solid var(--bd)'}"
                    @click="form.projectId = form.projectId===p.id ? null : p.id">
              {{ p.icon }} {{ p.name }}
            </button>
            <button v-if="!showNewProj"
                    style="font-size:12px;padding:4px 12px;border-radius:20px;cursor:pointer;background:var(--bg2);color:var(--t2);border:1px dashed var(--bd)"
                    @click="showNewProj=true">+ 新建项目</button>
          </div>
          <!-- Inline new project form -->
          <div v-if="showNewProj"
               style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:8px 10px;background:var(--bg2);border-radius:var(--r8)">
            <input v-model="newProjName" class="finput" style="flex:1;min-width:100px;font-size:12px" placeholder="项目名称">
            <select v-model="newProjColor" class="finput fselect" style="width:90px;font-size:12px">
              <option value="#2563EB">🔵 蓝色</option>
              <option value="#059669">🟢 绿色</option>
              <option value="#7C3AED">🟣 紫色</option>
              <option value="#DC2626">🔴 红色</option>
              <option value="#D97706">🟡 橙色</option>
            </select>
            <select v-model="newProjIcon" class="finput fselect" style="width:68px;font-size:12px">
              <option>🚀</option><option>📈</option><option>⚙️</option>
              <option>🎯</option><option>📋</option><option>💡</option>
            </select>
            <button class="btn btn-pri" style="font-size:12px" @click="createProject">创建</button>
            <button class="btn btn-out" style="font-size:12px" @click="showNewProj=false">取消</button>
          </div>
        </div>

        <!-- 参与者标签输入 -->
        <div class="form-row">
          <label class="flabel">参与者</label>
          <div ref="tagWrapRef" class="tag-input-wrap" @click="tagInputRef?.focus()">
            <div v-for="p in tagParticipants" :key="p.name" class="ptag"
                 :style="{background: p.color+'22', color: p.color}">
              {{ p.name }}
              <button class="ptag-del" :style="{color:p.color}" @click.stop="removeTag(p.name)">×</button>
            </div>
            <input ref="tagInputRef"
                   class="tag-text-input"
                   v-model="tagQuery"
                   placeholder="输入姓名搜索…"
                   @input="onTagInput"
                   @focus="onTagInput"
                   @keydown="tagKeydown">
          </div>
          <span class="fhint">从通讯录选择，或直接输入新成员姓名后按 Enter 添加</span>
        </div>

        <!-- 关联历史会议 -->
        <div class="form-row">
          <label class="flabel">
            关联历史会议
            <span style="font-weight:400;color:var(--t3)">（AI 将从选中会议提取上下文生成议程）</span>
          </label>
          <div>
            <div v-for="h in histOptions" :key="h.id"
                 class="hist-option" :class="{selected: h.selected}"
                 @click="h.selected = !h.selected">
              <input type="checkbox" :checked="h.selected" @click.stop="h.selected = !h.selected">
              <div>
                <div class="hist-option-title">{{ h.title }}</div>
                <div class="hist-option-meta" v-html="h.meta"></div>
              </div>
            </div>
          </div>
          <span class="fhint">AI 自动推荐：同参与者 + 标题关键词匹配的历史会议，也可手动勾选</span>
        </div>

        <div class="form-row">
          <label class="flabel">备注</label>
          <textarea class="finput" rows="2" placeholder="会议背景、注意事项…"
                    v-model="form.note" style="resize:vertical"></textarea>
        </div>

        <div style="background:var(--ai-l);border:1px solid #DDD6FE;border-radius:var(--r8);padding:10px 13px;font-size:12px;color:var(--ai);display:flex;gap:7px;align-items:flex-start">
          <span>✨</span>
          <span>AI 将基于你勾选的历史会议提取上下文，生成可编辑的会前议程草稿</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-out" @click="$emit('close')">取消</button>
        <button class="btn btn-pri" @click="submit">创建会议</button>
      </div>
    </div>
  </div>

  <!-- ✅ Teleport 到 body，彻底避免被 modal overflow 裁剪 -->
  <Teleport to="body">
    <div v-if="contactDropShow"
         class="contact-dropdown show"
         style="position:fixed;z-index:600"
         :style="{top: dropPos.top+'px', left: dropPos.left+'px', width: dropPos.width+'px'}">
      <div v-for="c in filteredContacts" :key="c.name"
           class="contact-opt" @mousedown.prevent="addTag(c)">
        <div class="av" :style="{width:'26px',height:'26px',fontSize:'11px',background:c.color}">{{ c.name[0] }}</div>
        <div>
          <div style="font-size:13px;font-weight:500">{{ c.name }}</div>
          <div style="font-size:11px;color:var(--t2)">{{ c.role }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { store, toast, addMeeting, addProject } from '../store.js'

const emit = defineEmits(['close'])

// ── Form ─────────────────────────────────────────────
const form = reactive({
  title: '',
  date: new Date().toISOString().split('T')[0],
  time: '',
  duration: '60 分钟',
  platform: '',
  link: '',
  note: '',
  projectId: null,
})

// ── Platform detection ───────────────────────────────
const linkHint = ref('')
const platformMap = [
  { pattern: /zoom\.us/i,                name: 'Zoom',    val: 'zoom',    icon: '🎥' },
  { pattern: /meeting\.tencent|wemeet/i, name: '腾讯会议', val: 'tencent', icon: '💬' },
  { pattern: /feishu\.cn|lark\.suite/i,  name: '飞书会议', val: 'feishu',  icon: '🪶' },
]
function detectPlatform() {
  const match = platformMap.find(p => p.pattern.test(form.link))
  if (match && form.link.length > 8) {
    linkHint.value = `${match.icon} 已识别为 ${match.name}，平台已自动填写`
    form.platform  = match.val
  } else {
    linkHint.value = ''
  }
}

// ── Participant tag input ────────────────────────────
const tagWrapRef      = ref(null)
const tagInputRef     = ref(null)
const tagQuery        = ref('')
const contactDropShow = ref(false)
const tagParticipants = ref(
  store.currentUser ? [{ name: store.currentUser.name, color: store.currentUser.color }] : []
)
const dropPos         = reactive({ top: 0, left: 0, width: 220 })

const filteredContacts = computed(() =>
  store.contacts.filter(c =>
    (c.name.includes(tagQuery.value) || c.role.includes(tagQuery.value)) &&
    !tagParticipants.value.find(p => p.name === c.name)
  )
)

function updateDropPos() {
  if (!tagWrapRef.value) return
  const r = tagWrapRef.value.getBoundingClientRect()
  dropPos.top   = r.bottom + 4
  dropPos.left  = r.left
  dropPos.width = Math.max(r.width, 220)
}

function onTagInput() {
  updateDropPos()
  contactDropShow.value = filteredContacts.value.length > 0 && tagQuery.value.length >= 0
}

function addTag(c) {
  tagParticipants.value.push({ name: c.name, color: c.color })
  tagQuery.value        = ''
  contactDropShow.value = false
  tagInputRef.value?.focus()
}

function removeTag(name) {
  tagParticipants.value = tagParticipants.value.filter(p => p.name !== name)
}

function tagKeydown(e) {
  if (e.key === 'Enter' && tagQuery.value.trim()) {
    tagParticipants.value.push({ name: tagQuery.value.trim(), color: '#6B7280' })
    tagQuery.value        = ''
    contactDropShow.value = false
    e.preventDefault()
  }
  if (e.key === 'Escape') contactDropShow.value = false
  if (e.key === 'ArrowDown') updateDropPos()
}

// Close dropdown when clicking outside
function onDocClick(e) {
  if (!e.target.closest('.tag-input-wrap') && !e.target.closest('.contact-dropdown')) {
    contactDropShow.value = false
  }
}
document.addEventListener('click', onDocClick)
onUnmounted(() => document.removeEventListener('click', onDocClick))

// ── Project inline creation ──────────────────────────
const showNewProj  = ref(false)
const newProjName  = ref('')
const newProjColor = ref('#2563EB')
const newProjIcon  = ref('🚀')

function createProject() {
  if (!newProjName.value.trim()) return
  const id = addProject(newProjName.value.trim(), newProjColor.value, newProjIcon.value)
  form.projectId  = id
  newProjName.value  = ''
  newProjColor.value = '#2563EB'
  newProjIcon.value  = '🚀'
  showNewProj.value  = false
}

// ── History options ──────────────────────────────────
const PLATFORM_NAMES = { zoom: 'Zoom', tencent: '腾讯会议', feishu: '飞书会议', other: '其他' }

const histOptions = reactive(
  (() => {
    const now = new Date()
    const currentUserName = store.currentUser?.name
    return store.meetings
      .filter(m =>
        new Date(m.scheduledAt) < now &&
        (!currentUserName || (m.participants ?? []).includes(currentUserName))
      )
      .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
      .map(m => {
        const dateStr = m.scheduledAt?.slice(0, 10) || ''
        const count = (m.participants ?? []).length
        const platLabel = PLATFORM_NAMES[m.platform] || m.platform || ''
        return { id: m.id, title: m.title, meta: `${dateStr} · ${count}人参与 · ${platLabel}`, selected: false }
      })
  })()
)

// ── Submit ───────────────────────────────────────────
function submit() {
  if (!form.title.trim()) { tagInputRef.value?.focus(); return }
  const duration = parseInt(form.duration) || 60
  addMeeting({
    title: form.title.trim(),
    platform: form.platform || 'other',
    status: 'upcoming',
    projectId: form.projectId,
    scheduledAt: form.date && form.time ? `${form.date}T${form.time}` : form.date ? `${form.date}T00:00` : '',
    duration,
    participants: tagParticipants.value.map(p => p.name),
    note: form.note,
  })
  emit('close')
  toast(`✅ 会议「${form.title}」已创建，AI 正在生成议程…`)
  setTimeout(() => { store.currentView = 'prep' }, 800)
}
</script>
