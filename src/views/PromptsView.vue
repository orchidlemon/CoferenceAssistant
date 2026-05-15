<template>
  <div style="max-width:720px;margin:0 auto">

    <div style="font-size:13px;color:var(--t3);margin-bottom:16px;line-height:1.7;padding:12px 16px;background:var(--bg2);border-radius:var(--r8);border:1px solid var(--bd)">
      以下是发送给 AI 的「系统 Prompt」（角色设定部分）。可根据需要调整 AI 的语气、输出风格和侧重点。<br>
      <strong style="color:var(--t2)">会议标题、参与者、记录内容等数据由系统自动填入，无需在此添加。</strong>
      修改后点击保存即可生效；点击「还原默认」将回到系统内置 Prompt。
    </div>

    <div v-for="item in promptItems" :key="item.key" class="card" style="margin-bottom:14px">
      <div class="ch">
        <div>
          <span class="ct">{{ item.label }}</span>
          <span v-if="isModified(item.key)" class="badge b-ok" style="margin-left:8px;font-size:10px">已自定义</span>
        </div>
        <div style="display:flex;gap:7px">
          <button v-if="isModified(item.key)"
                  class="btn btn-ghost" style="font-size:11px;padding:3px 8px"
                  @click="restoreDefault(item.key)">还原默认</button>
          <button class="btn btn-pri" style="font-size:11px;padding:3px 10px"
                  :disabled="!isDirty(item.key)"
                  @click="save(item.key)">保存</button>
        </div>
      </div>
      <div class="cb" style="padding:14px 18px">
        <div style="font-size:11px;color:var(--t3);margin-bottom:8px">{{ item.desc }}</div>
        <textarea
          v-model="localTexts[item.key]"
          rows="5"
          style="width:100%;font-size:13px;line-height:1.7;padding:11px 13px;border:1px solid var(--bd);border-radius:var(--r8);resize:vertical;color:var(--t1);font-family:inherit;outline:none;box-sizing:border-box;background:var(--bg)"
          @focus="e => e.target.style.borderColor='var(--primary)'"
          @blur="e => e.target.style.borderColor='var(--bd)'"
        ></textarea>
      </div>
    </div>

    <div style="display:flex;justify-content:flex-end;gap:10px;margin-bottom:24px">
      <button class="btn btn-ghost" @click="restoreAll">全部还原默认</button>
      <button class="btn btn-pri" :class="{pulse: anyDirty}" @click="saveAll">全部保存</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store, toast, persistUserData } from '../store.js'
import { DEFAULT_SYSTEM_PROMPTS } from '../ai.js'

const promptItems = [
  {
    key:   'agenda',
    label: '会前准备 · 议程生成',
    desc:  '用于「会前准备」页面点击「AI 生成」时，告知 AI 以什么角色和风格生成会议议程。',
  },
  {
    key:   'summary',
    label: '会后纪要 · 摘要生成',
    desc:  '用于「会后纪要」页面点击「AI 生成会议纪要」时，告知 AI 如何提取摘要和 Action Items。',
  },
  {
    key:     'insights',
    label:   'AI 洞察 · 效能分析',
    desc:    '用于「今日概览」页面点击「刷新洞察」时，告知 AI 以什么角度分析会议效能数据。',
  },
]

// Local editable text — initialized to custom (if set) or default
const localTexts = ref(
  Object.fromEntries(
    promptItems.map(item => [
      item.key,
      store.aiSettings.customPrompts[item.key] || DEFAULT_SYSTEM_PROMPTS[item.key],
    ])
  )
)

// Whether this key has a user-saved custom prompt (different from default)
function isModified(key) {
  return !!store.aiSettings.customPrompts[key]
}

// Whether the local text differs from what's currently saved
function isDirty(key) {
  const saved = store.aiSettings.customPrompts[key] || DEFAULT_SYSTEM_PROMPTS[key]
  return localTexts.value[key] !== saved
}

const anyDirty = computed(() => promptItems.some(item => isDirty(item.key)))

function save(key) {
  const text = localTexts.value[key].trim()
  // If user typed the exact default, store as empty (= "use default")
  store.aiSettings.customPrompts[key] = text === DEFAULT_SYSTEM_PROMPTS[key] ? '' : text
  persistUserData()
  toast('✅ Prompt 已保存')
}

function saveAll() {
  promptItems.forEach(item => {
    const text = localTexts.value[item.key].trim()
    store.aiSettings.customPrompts[item.key] = text === DEFAULT_SYSTEM_PROMPTS[item.key] ? '' : text
  })
  persistUserData()
  toast('✅ 全部 Prompt 已保存')
}

function restoreDefault(key) {
  localTexts.value[key] = DEFAULT_SYSTEM_PROMPTS[key]
  store.aiSettings.customPrompts[key] = ''
  persistUserData()
  toast('已还原为系统默认 Prompt')
}

function restoreAll() {
  promptItems.forEach(item => {
    localTexts.value[item.key] = DEFAULT_SYSTEM_PROMPTS[item.key]
    store.aiSettings.customPrompts[item.key] = ''
  })
  persistUserData()
  toast('全部 Prompt 已还原为默认')
}
</script>

<style scoped>
@keyframes pulse-border {
  0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,.4) }
  50%      { box-shadow: 0 0 0 4px rgba(37,99,235,.15) }
}
.pulse { animation: pulse-border 1.5s ease-in-out infinite; }
</style>
