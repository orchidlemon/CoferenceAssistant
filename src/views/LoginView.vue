<template>
  <div class="login-bg">
    <div class="login-card">

      <!-- Brand -->
      <div class="brand">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="brand-name">MeetMind</span>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn" :class="{on: mode==='login'}"    @click="switchMode('login')">登录</button>
        <button class="tab-btn" :class="{on: mode==='register'}" @click="switchMode('register')">注册</button>
      </div>

      <!-- Fields -->
      <div class="fields">
        <div v-if="mode==='register'" class="field">
          <label class="flabel">姓名</label>
          <input class="finput" type="text" v-model="form.name"
                 placeholder="你的名字" autocomplete="name" @keydown.enter="submit">
        </div>
        <div class="field">
          <label class="flabel">邮箱</label>
          <input class="finput" type="email" v-model="form.email"
                 placeholder="your@email.com" autocomplete="email" @keydown.enter="submit">
        </div>
        <div class="field">
          <label class="flabel">密码</label>
          <input class="finput" type="password" v-model="form.password"
                 placeholder="••••••••" autocomplete="current-password" @keydown.enter="submit">
        </div>
        <div v-if="mode==='register'" class="field">
          <label class="flabel">确认密码</label>
          <input class="finput" type="password" v-model="form.confirm"
                 placeholder="再次输入密码" autocomplete="new-password" @keydown.enter="submit">
        </div>
      </div>

      <div v-if="err" class="err-msg">{{ err }}</div>

      <button class="btn btn-pri submit-btn" @click="submit">
        {{ mode === 'login' ? '登录' : '创建账号' }}
      </button>

      <div class="demo-hint">
        演示账号：<span class="demo-link" @click="fillDemo">demo@meetmind.ai &nbsp;/&nbsp; demo1234</span>
      </div>

      <p class="footer-text">MeetMind · 个人 AI 会议助手 · 2026</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { login, register } from '../store.js'

const mode = ref('login')
const err  = ref('')
const form = reactive({ name: '', email: '', password: '', confirm: '' })

function switchMode(m) {
  mode.value = m
  err.value  = ''
  form.name = form.password = form.confirm = ''
}

function fillDemo() {
  mode.value    = 'login'
  form.email    = 'demo@meetmind.ai'
  form.password = 'demo1234'
  err.value     = ''
}

function submit() {
  err.value = ''
  const email = form.email.trim()
  if (!email || !form.password) { err.value = '请填写邮箱和密码'; return }

  if (mode.value === 'register') {
    if (!form.name.trim())                 { err.value = '请填写姓名'; return }
    if (form.password.length < 6)          { err.value = '密码至少 6 位'; return }
    if (form.password !== form.confirm)    { err.value = '两次密码不一致'; return }
    const res = register(email, form.password, form.name.trim())
    if (!res.ok) { err.value = res.msg }
  } else {
    const res = login(email, form.password)
    if (!res.ok) { err.value = res.msg }
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 20px;
}
.login-card {
  width: 400px;
  max-width: 100%;
  background: var(--card);
  border: 1px solid var(--bd);
  border-radius: 16px;
  padding: 36px 32px 28px;
  box-shadow: var(--sh2);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 28px;
}
.brand-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563EB, #7C3AED);
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-name {
  font-size: 24px;
  font-weight: 800;
  color: var(--t1);
  letter-spacing: -0.5px;
}
.tabs {
  display: flex;
  background: var(--bg2);
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 24px;
  gap: 2px;
}
.tab-btn {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--t2);
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all .15s;
}
.tab-btn.on {
  background: var(--card);
  color: var(--t1);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}
.fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.err-msg {
  background: #FEE2E2;
  color: var(--err);
  border-radius: var(--r8);
  padding: 9px 12px;
  font-size: 13px;
  margin-bottom: 12px;
}
.submit-btn {
  width: 100%;
  justify-content: center;
  padding: 11px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}
.demo-hint {
  text-align: center;
  font-size: 12px;
  color: var(--t3);
  margin-bottom: 16px;
}
.demo-link {
  color: var(--primary);
  cursor: pointer;
  font-family: monospace;
  font-size: 11px;
}
.demo-link:hover { text-decoration: underline; }
.footer-text {
  text-align: center;
  font-size: 11px;
  color: var(--t3);
  margin: 0;
}
</style>
