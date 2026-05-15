<template>
  <div style="max-width:680px;margin:0 auto">

    <!-- Security notice -->
    <div class="card" style="margin-bottom:16px;border-left:4px solid var(--primary);padding:14px 18px;background:var(--bg2)">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="font-size:18px;margin-top:1px">🔒</span>
        <div style="font-size:13px;line-height:1.7;color:var(--t2)">
          <strong style="color:var(--t1)">API Key 安全说明：</strong>
          您的 API Key 仅保存在<strong>本地浏览器</strong>（localStorage），不会上传到任何服务器。
          所有 AI 请求直接从您的浏览器发送到 AI 提供商，MeetMind 无法读取或截获您的密钥。
        </div>
      </div>
    </div>

    <!-- Provider -->
    <div class="card" style="margin-bottom:14px">
      <div class="ch"><span class="ct">AI 提供商</span></div>
      <div class="cb" style="padding:16px 18px">
        <div class="provider-grid">
          <div v-for="(cfg, key) in PROVIDERS" :key="key"
               class="provider-card" :class="{selected: store.aiSettings.provider === key}"
               @click="selectProvider(key)">
            <div class="provider-name">{{ cfg.name }}</div>
            <div v-if="cfg.freeModel" class="provider-hint" style="color:var(--ok)">自定义 Endpoint</div>
            <div v-else class="provider-hint">{{ cfg.models.length }} 个模型</div>
          </div>
        </div>
      </div>
    </div>

    <!-- API Key -->
    <div class="card" style="margin-bottom:14px">
      <div class="ch">
        <span class="ct">API Key</span>
        <a :href="currentCfg.keyLink" target="_blank" rel="noopener noreferrer"
           style="font-size:12px;color:var(--primary);text-decoration:none">
          前往 {{ currentCfg.keyLinkText }} 获取 →
        </a>
      </div>
      <div class="cb" style="padding:16px 18px">
        <div style="position:relative">
          <input :type="showKey ? 'text' : 'password'"
                 v-model="store.aiSettings.apiKey"
                 :placeholder="currentCfg.keyPlaceholder"
                 class="inp"
                 style="width:100%;padding-right:44px;font-family:monospace"
                 @input="dirty=true" />
          <button class="btn btn-ghost"
                  style="position:absolute;right:6px;top:50%;transform:translateY(-50%);padding:3px 7px;font-size:11px"
                  @click="showKey = !showKey">
            {{ showKey ? '隐藏' : '显示' }}
          </button>
        </div>
        <div style="font-size:11px;color:var(--t3);margin-top:6px">
          密钥仅存储在本地浏览器，刷新页面后仍然有效
        </div>
      </div>
    </div>

    <!-- Model -->
    <div class="card" style="margin-bottom:14px">
      <div class="ch"><span class="ct">模型选择</span></div>
      <div class="cb" style="padding:16px 18px">
        <!-- Doubao: free-text endpoint -->
        <div v-if="currentCfg.freeModel">
          <input type="text"
                 v-model="store.aiSettings.model"
                 :placeholder="currentCfg.modelHint || '填写模型 ID'"
                 class="inp" style="width:100%"
                 @input="dirty=true" />
          <div v-if="currentCfg.modelHint" style="font-size:11px;color:var(--t3);margin-top:6px">
            {{ currentCfg.modelHint }}
          </div>
        </div>
        <!-- Others: radio list + custom -->
        <div v-else class="model-list">
          <label v-for="m in currentCfg.models" :key="m.id" class="model-item">
            <input type="radio"
                   :checked="!isCustomMode && store.aiSettings.model === m.id"
                   @change="onModelRadioChange(m.id)" />
            <span class="model-label">{{ m.label }}</span>
          </label>
          <label class="model-item">
            <input type="radio" :checked="isCustomMode" @change="onModelRadioChange('__custom__')" />
            <span class="model-label" style="color:var(--t2)">其他（自定义）</span>
          </label>
          <div v-if="isCustomMode" style="margin-top:8px;padding-left:22px">
            <input type="text"
                   v-model="store.aiSettings.model"
                   placeholder="输入模型 ID，例如：gpt-4-turbo、deepseek-v3、claude-opus-4-7 等"
                   class="inp" style="width:100%"
                   @input="dirty=true" />
            <div style="font-size:11px;color:var(--t3);margin-top:4px">
              请参考提供商文档填写正确的模型 ID
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced: custom base URL -->
    <details class="card" style="margin-bottom:14px">
      <summary style="padding:12px 18px;font-size:13px;font-weight:600;cursor:pointer;color:var(--t2)">
        高级设置（自定义 API 地址）
      </summary>
      <div style="padding:0 18px 16px">
        <input type="text"
               v-model="store.aiSettings.customBaseURL"
               placeholder="留空则使用默认地址，例如：https://your-proxy.example.com/v1"
               class="inp" style="width:100%;margin-top:8px"
               @input="dirty=true" />
        <div style="font-size:11px;color:var(--t3);margin-top:6px">
          适用于使用中转代理的情况（如 OpenAI 代理服务）
        </div>
      </div>
    </details>

    <!-- Test connection -->
    <div class="card" style="margin-bottom:14px">
      <div class="ch"><span class="ct">连接测试</span></div>
      <div class="cb" style="padding:14px 18px">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <button class="btn btn-out" :disabled="testing" @click="testConnection">
            <span v-if="testing">测试中…</span>
            <span v-else>发送测试请求</span>
          </button>
          <div v-if="testResult"
               :style="{color: testResult.ok ? 'var(--ok)' : 'var(--err)', fontSize:'13px'}">
            {{ testResult.ok ? '✅ ' : '❌ ' }}{{ testResult.msg }}
          </div>
        </div>
      </div>
    </div>

    <!-- Save -->
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-bottom:24px">
      <button class="btn btn-ghost" @click="clearKey">清除 API Key</button>
      <button class="btn btn-pri" :class="{pulse: dirty}" @click="saveSettings">保存设置</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store, toast, persistUserData } from '../store.js'
import { PROVIDERS, callAI } from '../ai.js'

const showKey    = ref(false)
const testing    = ref(false)
const testResult = ref(null)
const dirty      = ref(false)

const currentCfg = computed(() => PROVIDERS[store.aiSettings.provider] || PROVIDERS.deepseek)

const isCustomMode = ref(
  !currentCfg.value.freeModel &&
  !currentCfg.value.models.some(m => m.id === store.aiSettings.model)
)

function onModelRadioChange(val) {
  if (val === '__custom__') {
    isCustomMode.value = true
    store.aiSettings.model = ''
  } else {
    isCustomMode.value = false
    store.aiSettings.model = val
  }
  dirty.value = true
  testResult.value = null
}

function selectProvider(key) {
  store.aiSettings.provider = key
  const cfg = PROVIDERS[key]
  store.aiSettings.model = cfg.defaultModel || ''
  isCustomMode.value = false
  testResult.value = null
  dirty.value = true
}

async function testConnection() {
  if (!store.aiSettings.apiKey?.trim()) {
    testResult.value = { ok: false, msg: '请先填写 API Key' }
    return
  }
  testing.value = true
  testResult.value = null
  try {
    const reply = await callAI(
      '你是一个测试助手，请简短回复。',
      '请回复"连接成功"四个字。',
      store.aiSettings,
    )
    testResult.value = { ok: true, msg: `连接成功：${reply.slice(0, 40)}` }
  } catch (e) {
    testResult.value = { ok: false, msg: e.message }
  } finally {
    testing.value = false
  }
}

function saveSettings() {
  persistUserData()
  dirty.value = false
  toast('✅ AI 设置已保存')
}

function clearKey() {
  store.aiSettings.apiKey = ''
  testResult.value = null
  dirty.value = true
  persistUserData()
  toast('API Key 已清除')
}

</script>

<style scoped>
.provider-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.provider-card {
  border: 2px solid var(--bd);
  border-radius: var(--r8);
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.provider-card:hover  { border-color: var(--primary); background: var(--bg2); }
.provider-card.selected { border-color: var(--primary); background: #EFF6FF; }
.provider-name { font-size: 14px; font-weight: 600; color: var(--t1); }
.provider-hint { font-size: 11px; color: var(--t3); margin-top: 3px; }

.model-list { display: flex; flex-direction: column; gap: 8px; }
.model-item { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.model-item input[type="radio"] { accent-color: var(--primary); width: 14px; height: 14px; flex-shrink: 0; }
.model-label { font-size: 13px; color: var(--t1); }

details > summary { list-style: none; }
details > summary::-webkit-details-marker { display: none; }

@keyframes pulse-border { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,.4) } 50% { box-shadow: 0 0 0 4px rgba(37,99,235,.15) } }
.pulse { animation: pulse-border 1.5s ease-in-out infinite; }
</style>
